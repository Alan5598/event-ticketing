import { Router } from "express";
import {
  applyForOrganizer,
  getMyApplication,
  getAllApplications,
  reviewApplication,
} from "../controllers/organizer.controller";
import { authenticate, checkRole } from "../middlewares/auth.middleware";

const router = Router();

/**
 * @openapi
 * /api/organizers/apply:
 *   post:
 *     tags: [Organizers]
 *     summary: Apply to become an event organizer
 *     description: Requires an authenticated account. An application is submitted for admin review.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [organizationName, phoneNumber, organizationType, location, description]
 *             properties:
 *               organizationName:
 *                 type: string
 *                 example: Kigali Events
 *               phoneNumber:
 *                 type: string
 *                 example: "+250700000000"
 *               organizationType:
 *                 type: string
 *                 example: Company
 *               location:
 *                 type: string
 *                 example: Kigali, Rwanda
 *               websiteOrSocialMedia:
 *                 type: string
 *                 example: https://example.com
 *               description:
 *                 type: string
 *                 example: We organize community events.
 *     responses:
 *       201:
 *         description: Application submitted and awaiting review
 *       400:
 *         description: Required application information is missing or the account cannot apply
 *       401:
 *         description: Missing or invalid token
 *       404:
 *         description: User not found
 */
router.post("/apply", authenticate, applyForOrganizer);

/**
 * @openapi
 * /api/organizers/my-application:
 *   get:
 *     tags: [Organizers]
 *     summary: Get my organizer application and role
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current role and organizer application status
 *       401:
 *         description: Missing or invalid token
 *       404:
 *         description: User not found
 */
router.get("/my-application", authenticate, getMyApplication);

/**
 * @openapi
 * /api/organizers/admin/applications:
 *   get:
 *     tags: [Organizers]
 *     summary: List organizer applications
 *     description: Admin only. Optionally filter by application status.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [NONE, PENDING, APPROVED, REJECTED]
 *     responses:
 *       200:
 *         description: Matching organizer applications
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Admin role required
 */
router.get("/admin/applications", authenticate, checkRole("ADMIN"), getAllApplications);

/**
 * @openapi
 * /api/organizers/admin/applications/{userId}/review:
 *   patch:
 *     tags: [Organizers]
 *     summary: Approve or reject an organizer application
 *     description: Admin only. A rejection requires a reason.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [action]
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [APPROVE, REJECT]
 *               rejectionReason:
 *                 type: string
 *                 description: Required when action is REJECT
 *     responses:
 *       200:
 *         description: Application reviewed
 *       400:
 *         description: Invalid action, missing rejection reason, or no application exists
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Admin role required
 *       404:
 *         description: Applicant not found
 */
router.patch("/admin/applications/:userId/review", authenticate, checkRole("ADMIN"), reviewApplication);

export default router;
