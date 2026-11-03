import { Router } from "express";
import {
  register,
  login,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
  getMe,
} from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

// Registration endpoints
router.post("/register", register);
router.post("/signup", register);

// OTP Verification endpoints
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);

// Password recovery endpoints
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Login endpoint
router.post("/login", login);

// Authenticated session check
router.get("/me", authenticate, getMe);

export default router;
