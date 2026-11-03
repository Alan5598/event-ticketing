import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { sendOtpEmail, sendPasswordResetEmail } from "../services/email.service";

const getJwtSecret = (): string => {
  return process.env.JWT_SECRET || "eventq_super_secret_jwt_key_2026";
};

// Generates a 6-digit numeric OTP code
const generateOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// POST /api/auth/register (or /signup)
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const name = (req.body.names || req.body.name || "").trim();
    const email = (req.body.email || "").trim().toLowerCase();
    const password = req.body.password || "";

    // Validation
    if (!name) {
      res.status(400).json({ success: false, message: "Full name is required" });
      return;
    }

    if (!email) {
      res.status(400).json({ success: false, message: "Email is required" });
      return;
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ success: false, message: "Please provide a valid email address" });
      return;
    }

    if (!password || password.length < 6) {
      res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
      return;
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: "An account with this email already exists",
      });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate 6-digit OTP (expires in 10 minutes)
    const otpCode = generateOtp();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    // Create user (default role is ATTENDEE, isVerified is false until OTP is verified)
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "ATTENDEE",
      isVerified: false,
      otp: {
        code: otpCode,
        expiresAt: otpExpires,
      },
    });

    // Send OTP email via EmailJS
    await sendOtpEmail(email, name, otpCode);

    // Generate JWT token for immediate session authentication
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, role: newUser.role },
      getJwtSecret(),
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      message: "Account created successfully. An OTP verification code has been sent to your email.",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isVerified: newUser.isVerified,
      },
    });
  } catch (error: any) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
      error: error.message,
    });
  }
};

// POST /api/auth/verify-otp
export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const email = (req.body.email || "").trim().toLowerCase();
    const otp = (req.body.otp || req.body.passcode || req.body.code || "").toString().trim();

    if (!email || !otp) {
      res.status(400).json({
        success: false,
        message: "Email and OTP code are required",
      });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User with this email not found",
      });
      return;
    }

    if (user.isVerified) {
      res.status(200).json({
        success: true,
        message: "Account is already verified",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: true,
        },
      });
      return;
    }

    if (!user.otp || !user.otp.code || !user.otp.expiresAt) {
      res.status(400).json({
        success: false,
        message: "No pending OTP found. Please request a new one.",
      });
      return;
    }

    if (new Date() > new Date(user.otp.expiresAt)) {
      res.status(400).json({
        success: false,
        message: "OTP code has expired. Please request a new one.",
      });
      return;
    }

    if (user.otp.code !== otp) {
      res.status(400).json({
        success: false,
        message: "Invalid OTP code. Please check and try again.",
      });
      return;
    }

    // OTP is valid - mark user verified and clear OTP
    user.isVerified = true;
    user.otp = undefined;
    await user.save();

    // Generate fresh JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      getJwtSecret(),
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      message: "Email verified successfully!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: true,
      },
    });
  } catch (error: any) {
    console.error("Verify OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during OTP verification",
      error: error.message,
    });
  }
};

// POST /api/auth/resend-otp
export const resendOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const email = (req.body.email || "").trim().toLowerCase();

    if (!email) {
      res.status(400).json({
        success: false,
        message: "Email is required",
      });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User with this email not found",
      });
      return;
    }

    if (user.isVerified) {
      res.status(400).json({
        success: false,
        message: "Account is already verified. No OTP needed.",
      });
      return;
    }

    // Generate new OTP
    const otpCode = generateOtp();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = {
      code: otpCode,
      expiresAt: otpExpires,
    };
    await user.save();

    await sendOtpEmail(email, user.name, otpCode);

    res.status(200).json({
      success: true,
      message: "A new OTP verification code has been sent to your email",
    });
  } catch (error: any) {
    console.error("Resend OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during resending OTP",
      error: error.message,
    });
  }
};

// POST /api/auth/forgot-password
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const email = (req.body.email || "").trim().toLowerCase();

    if (!email) {
      res.status(400).json({
        success: false,
        message: "Email is required",
      });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({
        success: false,
        message: "No account found with this email address",
      });
      return;
    }

    // Generate secure random reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Token expires in 1 hour
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    // Construct reset password link
    const frontendBaseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const resetLink = `${frontendBaseUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

    await sendPasswordResetEmail(user.email, user.name, resetLink);

    res.status(200).json({
      success: true,
      message: "Password reset link has been sent to your email address",
      resetLink: process.env.NODE_ENV === "production" ? undefined : resetLink,
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during forgot password request",
      error: error.message,
    });
  }
};

// POST /api/auth/reset-password
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = (req.body.token || "").toString().trim();
    const newPassword = req.body.newPassword || req.body.password || "";

    if (!token) {
      res.status(400).json({
        success: false,
        message: "Reset token is required",
      });
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
      return;
    }

    // Hash incoming token to match stored sha256 hash
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      res.status(400).json({
        success: false,
        message: "Password reset token is invalid or has expired",
      });
      return;
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password has been successfully reset! You can now log in with your new password.",
    });
  } catch (error: any) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during password reset",
      error: error.message,
    });
  }
};

// POST /api/auth/login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const email = (req.body.email || "").trim().toLowerCase();
    const password = req.body.password || "";

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
      return;
    }

    const adminEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || "";

    // 1. Check if login matches hardcoded Admin credentials from .env
    if (adminEmail && adminPassword && email === adminEmail) {
      if (password !== adminPassword) {
        res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
        return;
      }

      // Upsert/sync admin in DB for valid database references
      let adminUser = await User.findOne({ email: adminEmail });
      if (!adminUser) {
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        adminUser = await User.create({
          name: "System Admin",
          email: adminEmail,
          password: hashedPassword,
          role: "ADMIN",
          isVerified: true,
        });
      } else if (adminUser.role !== "ADMIN") {
        adminUser.role = "ADMIN";
        await adminUser.save();
      }

      const token = jwt.sign(
        { id: adminUser._id, email: adminUser.email, role: "ADMIN" },
        getJwtSecret(),
        { expiresIn: "7d" }
      );

      res.status(200).json({
        success: true,
        message: "Admin logged in successfully",
        token,
        user: {
          id: adminUser._id,
          name: adminUser.name,
          email: adminUser.email,
          role: "ADMIN",
          isVerified: true,
        },
      });
      return;
    }

    // 2. Regular user authentication
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      getJwtSecret(),
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
      error: error.message,
    });
  }
};

// GET /api/auth/me (Returns current session user)
export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error: any) {
    console.error("GetMe error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching user session",
    });
  }
};
