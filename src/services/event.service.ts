import Event, { IEvent } from "../models/Event";


type NewEventData = {
    title: string;
    description: string;
    category: string;
    startTime: Date;
    endTime?: Date;
    venue: string;
    capacity: number;
};

export async function createEvent(organizerId: string, data: NewEventData) {
    return Event.create({
        ...data,
        organizerId,
        status: "draft",
        ticketTypes: [{ name: "General", price: 0 }],
    });
}

export function findEventById(id: string) {
    return Event.findById(id);
}

export function listEventsByOrganizer(organizerId: string) {
    return Event.find({ organizerId }).sort({ startTime: -1 });
}

export async function cancelEvent(event: IEvent, reason: string) {
    event.status = "cancelled";
    event.cancelledAt = new Date();
    event.cancelReason = reason;
    await event.save();
    return event;
}

export async function listPublicEvents(page: number, limit: number, category?: string) {
    const filter: Record<string, any> = {
        status: { $in: ["published", "cancelled"] },
        startTime: { $gt: new Date() },
    };
    if (category) filter.category = category;

    const [events, total] = await Promise.all([
        Event.find(filter)
            .sort({ startTime: 1 })
            .skip((page - 1) * limit)
            .limit(limit),
        Event.countDocuments(filter),
    ]);

    return { events, total };
}

export function findPublicEventById(id: string) {
    return Event.findOne({ _id: id, status: { $in: ["published", "cancelled"] } });
}

export function toPublicEvent(e: IEvent) {
    const ticketsLeft = Math.max(0, e.capacity - e.ticketsIssued);
    const prices = e.ticketTypes.map((t) => t.price);

    return {
        id: String(e._id),
        title: e.title,
        description: e.description,
        category: e.category,
        startTime: e.startTime,
        endTime: e.endTime,
        venue: e.venue,
        coverImageUrl: e.coverImageUrl,
        status: e.status,
        cancelledAt: e.cancelledAt,
        cancelReason: e.cancelReason,
        price: prices.length > 0 ? Math.min(...prices) : 0,
        ticketsLeft,
        soldOut: ticketsLeft === 0,
        canRegister: e.status === "published" && e.startTime > new Date() && ticketsLeft > 0,
    };
}

export function toPublicEventDetail(e: IEvent) {
    return {
        ...toPublicEvent(e),
        details: e.details,
        ticketTypes: e.ticketTypes.map((t) => ({
            id: String(t.id),
            name: t.name,
            price: t.price,
        })),
        faqs: e.faqs.map((f) => ({ question: f.question, answer: f.answer })),
    };
}