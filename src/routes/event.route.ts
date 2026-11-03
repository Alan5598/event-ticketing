import {Router} from "express";
// import { checkRole } from "../middlewares/checkRole";
import { createEvent } from "../controllers/event.contoller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();
router.post("/",authenticate,checkRole(["ORGANIZER"]), createEvent);

export default router;