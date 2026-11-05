import { Request, Response } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import {
    createEvent as createEventRecord,
    findEventById,
    listEventsByOrganizer,
    cancelEvent as cancelEventRecord,
    listPublicEvents,
    findPublicEventById,
    toPublicEvent,
    toPublicEventDetail,
} from "../services/event.service";


const CATEGORIES = [
    "tech", "music", "kids", "sports", "business",
    "culture", "arts", "food", "education","culture", "other",
] as const;

const eventFields = {
    title: z.string().trim().min(3).max(100),
    description: z.string().trim().min(10).max(5000),
    category: z.enum(CATEGORIES),
    startTime: z.coerce.date(),
    endTime: z.coerce.date().optional(),
    venue: z.string().trim().min(2).max(200),
    capacity: z.number().int().min(1).max(100000),
};

const createEventSchema = z.object(eventFields).strict();
const updateEventSchema = z.object(eventFields).partial().strict();
const cancelEventSchema = z.object({ reason: z.string().trim().min(3).max(300) }).strict();

const listQuerySchema = z
    .object({
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(50).default(12),
        category: z.enum(CATEGORIES).optional(),
    })
    .strict();


function sendError(res: Response, status: number, code: string, message: string) {
    return res.status(status).json({ error: { code, message } });
}

function sendValidationError(res: Response, error: z.ZodError) {
    const issue = error.issues[0];
    const field = issue?.path.join(".") || "body";
    return sendError(res, 400, "validationError", `${field}: ${issue?.message}`);
}
async function getOwnedEvent(req: AuthenticatedRequest, res: Response) {
    const id = String(req.params.id);

    if (!mongoose.isValidObjectId(id)) {
        sendError(res, 404, "eventNotFound", "Event not found");
        return null;
    }

    const event = await findEventById(id);
    if (!event) {
        sendError(res, 404, "eventNotFound", "Event not found");
        return null;
    }

    if (String(event.organizerId) !== String(req.user!.id)) {
        sendError(res, 403, "notEventOwner", "You can only manage your own events");
        return null;
    }

    return event;
}

export async function createEvent(req: AuthenticatedRequest, res: Response) {
    const result = createEventSchema.safeParse(req.body);
    if (!result.success) return sendValidationError(res, result.error);

    const data = result.data;

    if (data.startTime <= new Date()) {
        return sendError(res, 400, "validationError", "startTime: must be in the future");
    }
    if (data.endTime && data.endTime <= data.startTime) {
        return sendError(res, 400, "validationError", "endTime: must be after startTime");
    }

    const event = await createEventRecord(String(req.user!.id), data);
    res.status(201).json({ event });
}

export async function getMyEvents(req: AuthenticatedRequest, res: Response) {
    const events = await listEventsByOrganizer(String(req.user!.id));

    res.json({
        events: events.map((e) => ({
            ...e.toObject(),
            ticketsLeft: e.capacity - e.ticketsIssued,
        })),
    });
}

export async function updateEvent(req: AuthenticatedRequest, res: Response) {
    const event = await getOwnedEvent(req, res);
    if (!event) return;

    if (event.status === "cancelled") {
        return sendError(res, 400, "EVENT_CANCELLED", "A cancelled event can't be edited");
    }

    const result = updateEventSchema.safeParse(req.body);
    if (!result.success) return sendValidationError(res, result.error);

    const data = result.data;

    if (Object.keys(data).length === 0) {
        return sendError(res, 400, "validationError", "body: send at least one field to change");
    }
    if (data.startTime && data.startTime <= new Date()) {
        return sendError(res, 400, "validationError", "startTime: must be in the future");
    }

    const newStart = data.startTime ?? event.startTime;
    const newEnd = data.endTime ?? event.endTime;
    if (newEnd && newEnd <= newStart) {
        return sendError(res, 400, "validationError", "endTime: must be after startTime");
    }

    if (data.capacity !== undefined && data.capacity < event.ticketsIssued) {
        return sendError(res, 400, "validationError", `capacity: ${event.ticketsIssued} tickets are already issued`);
    }

    Object.assign(event, data);
    await event.save();

    res.json({ event });
}

export async function publishEvent(req: AuthenticatedRequest, res: Response) {
    const event = await getOwnedEvent(req, res);
    if (!event) return;

    if (event.status !== "draft") {
        return sendError(res, 400, "INVALID_STATUS", "Only draft events can be published");
    }
    if (event.startTime <= new Date()) {
        return sendError(res, 400, "EVENT_IN_PAST", "Change the start time to a future date before publishing");
    }

    event.status = "published";
    await event.save();

    res.json({ event });
}

export async function cancelEvent(req: AuthenticatedRequest, res: Response) {
    const event = await getOwnedEvent(req, res);
    if (!event) return;

    const result = cancelEventSchema.safeParse(req.body);
    if (!result.success) return sendValidationError(res, result.error);

    if (event.status !== "published") {
        return sendError(res, 400, "INVALID_STATUS", "Only published events can be cancelled");
    }

    const cancelled = await cancelEventRecord(event, result.data.reason);
    res.json({ event: cancelled });
}


export async function listEvents(req: Request, res: Response) {
    const result = listQuerySchema.safeParse(req.query);
    if (!result.success) return sendValidationError(res, result.error);

    const { page, limit, category } = result.data;
    const { events, total } = await listPublicEvents(page, limit, category);

    res.json({
        events: events.map(toPublicEvent),
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
    });
}

export async function getPublicEvent(req: Request, res: Response) {
    const id = String(req.params.id);

    if (!mongoose.isValidObjectId(id)) {
        return sendError(res, 404, "EVENT_NOT_FOUND", "Event not found");
    }

    const event = await findPublicEventById(id);
    if (!event) {
        return sendError(res, 404, "EVENT_NOT_FOUND", "Event not found");
    }

    res.json({ event: toPublicEventDetail(event) });
}