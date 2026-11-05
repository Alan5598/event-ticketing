import { Router } from "express";
import { authenticate, checkRole } from "../middlewares/auth.middleware";
import {
    createEvent,
    getMyEvents,
    updateEvent,
    publishEvent,
    cancelEvent,
    listEvents,
    getPublicEvent,
} from "../controllers/event.contoller";

const router = Router();
const organizerOnly = [authenticate, checkRole("ORGANIZER")];

/**
 * @openapi
 * /api/events:
 *   get:
 *     tags: [Events]
 *     summary: List upcoming events (public)
 *     description: Returns upcoming published and cancelled events. Drafts are never shown.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 12
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [tech, music, kids, sports, business, culture, arts, food, education, other]
 *     responses:
 *       200:
 *         description: Page of upcoming events
 *       400:
 *         description: Invalid query parameters
 */
router.get("/", listEvents);

/**
 * @openapi
 * /api/events:
 *   post:
 *     tags: [Events]
 *     summary: Create a draft event
 *     description: Requires a valid JWT belonging to an organizer.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, category, startTime, venue, capacity]
 *             additionalProperties: false
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 5000
 *               category:
 *                 type: string
 *                 enum: [tech, music, kids, sports, business, culture, arts, food, education, other]
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *               venue:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 200
 *               capacity:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 100000
 *     responses:
 *       201:
 *         description: Draft event created
 *       400:
 *         description: Invalid event data or event time
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: User is not an organizer
 */
router.post("/", ...organizerOnly, createEvent);

/**
 * @openapi
 * /api/events/mine:
 *   get:
 *     tags: [Events]
 *     summary: List my events (all statuses)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Events created by the logged-in organizer
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: User is not an organizer
 */
router.get("/mine", ...organizerOnly, getMyEvents);

/**
 * @openapi
 * /api/events/{id}:
 *   get:
 *     tags: [Events]
 *     summary: Get one event (public)
 *     description: Works for published and cancelled events, including after the event date. Drafts return 404.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event details
 *       404:
 *         description: Event not found
 */
router.get("/:id", getPublicEvent);

/**
 * @openapi
 * /api/events/{id}:
 *   patch:
 *     tags: [Events]
 *     summary: Edit an event
 *     description: Owner only. Send only the fields to change. Cancelled events can't be edited.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: false
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [tech, music, kids, sports, business, culture, arts, food, education, other]
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *               venue:
 *                 type: string
 *               capacity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Event updated
 *       400:
 *         description: Invalid data, cancelled event, or capacity below tickets issued
 *       403:
 *         description: Not the owner of this event
 *       404:
 *         description: Event not found
 */
router.patch("/:id", ...organizerOnly, updateEvent);

/**
 * @openapi
 * /api/events/{id}/publish:
 *   post:
 *     tags: [Events]
 *     summary: Publish a draft event
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event published
 *       400:
 *         description: Event is not a draft, or its start time has passed
 *       403:
 *         description: Not the owner of this event
 *       404:
 *         description: Event not found
 */
router.post("/:id/publish", ...organizerOnly, publishEvent);

/**
 * @openapi
 * /api/events/{id}/cancel:
 *   post:
 *     tags: [Events]
 *     summary: Cancel a published event
 *     description: The event stays visible to visitors, marked as cancelled, until its start date passes.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reason]
 *             additionalProperties: false
 *             properties:
 *               reason:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 300
 *     responses:
 *       200:
 *         description: Event cancelled
 *       400:
 *         description: Event is not published, or reason is missing
 *       403:
 *         description: Not the owner of this event
 *       404:
 *         description: Event not found
 */
router.post("/:id/cancel", ...organizerOnly, cancelEvent);

export default router;