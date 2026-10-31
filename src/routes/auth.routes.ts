import { Router } from "express";
import { register, login, getMe } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

// Registration endpoints (accepts either /register or /signup)
router.post("/register", register);
router.post("/signup", register);

// Login endpoint
router.post("/login", login);

// Authenticated session check
router.get("/me", authenticate, getMe);

export default router;

