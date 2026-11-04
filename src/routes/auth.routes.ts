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

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Register an attendee account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Alex Morgan
 *               email:
 *                 type: string
 *                 format: email
 *                 example: alex@example.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: secret123
 *     responses:
 *       201:
 *         description: Account created and an email verification code sent
 *       400:
 *         description: Invalid input or an account with this email already exists
 *       500:
 *         description: Registration failed
 */
router.post("/register", register);

/**
 * @openapi
 * /api/auth/signup:
 *   post:
 *     tags: [Authentication]
 *     summary: Alias for attendee registration
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       201:
 *         description: Account created and an email verification code sent
 *       400:
 *         description: Invalid input or an account with this email already exists
 */
router.post("/signup", register);

/**
 * @openapi
 * /api/auth/verify-otp:
 *   post:
 *     tags: [Authentication]
 *     summary: Verify an account using its emailed OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               otp:
 *                 type: string
 *                 description: Six-digit code sent to the email address
 *     responses:
 *       200:
 *         description: Account verified or already verified
 *       400:
 *         description: Missing or invalid OTP
 *       404:
 *         description: User not found
 */
router.post("/verify-otp", verifyOtp);

/**
 * @openapi
 * /api/auth/resend-otp:
 *   post:
 *     tags: [Authentication]
 *     summary: Send a new account verification OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: A new OTP was sent
 *       400:
 *         description: Email is missing or account is already verified
 *       404:
 *         description: User not found
 */
router.post("/resend-otp", resendOtp);

/**
 * @openapi
 * /api/auth/forgot-password:
 *   post:
 *     tags: [Authentication]
 *     summary: Request a password reset email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Password reset link sent
 *       400:
 *         description: Email is missing
 *       404:
 *         description: Account not found
 */
router.post("/forgot-password", forgotPassword);

/**
 * @openapi
 * /api/auth/reset-password:
 *   post:
 *     tags: [Authentication]
 *     summary: Reset a password using its emailed token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, newPassword]
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Missing, invalid, or expired token, or password is too short
 */
router.post("/reset-password", resetPassword);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Sign in with an email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Signed in; response includes a JWT and user profile
 *       401:
 *         description: Invalid email or password
 */
router.post("/login", login);

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     tags: [Authentication]
 *     summary: Get the current authenticated user's profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *       401:
 *         description: Missing or invalid token
 *       404:
 *         description: User not found
 */
router.get("/me", authenticate, getMe);

export default router;
