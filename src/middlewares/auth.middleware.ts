import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserRole } from "../models/User";

export interface TokenPayload {
  id: string;
  email: string;
  role: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    res.status(401).json({
      success: false,
      message: "Authentication token is required",
    });
    return;
  }

  const secret = process.env.JWT_SECRET || "eventq_super_secret_jwt_key_2026";

  try {
    const decoded = jwt.verify(token, secret) as TokenPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired session token",
    });
  }
};

export const checkRole = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: You do not have permission to access this resource. Required role: ${allowedRoles.join(" or ")}`,
      });
      return;
    }

    next();
  };
};
