import {Router} from "express";
import { checkRole } from "../middlewares/auth.middleware";
import { createEvent } from "../controllers/event.contoller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

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
router.post("/", authenticate, checkRole("ORGANIZER"), createEvent);

export default router;