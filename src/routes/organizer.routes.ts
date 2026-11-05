import { Router } from "express";
import {
  applyForOrganizer,
  getMyApplication,
  getAllApplications,
  reviewApplication,
} from "../controllers/organizer.controller";
import { authenticate, checkRole } from "../middlewares/auth.middleware";

const router = Router();

// Attendee routes (requires logged in user)
router.post("/apply", authenticate, applyForOrganizer);
router.get("/my-application", authenticate, getMyApplication);

// Admin review routes (requires ADMIN role)
router.get("/admin/applications", authenticate, checkRole("ADMIN"), getAllApplications);
router.patch("/admin/applications/:userId/review", authenticate, checkRole("ADMIN"), reviewApplication);

export default router;

