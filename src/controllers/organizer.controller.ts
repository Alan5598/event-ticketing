import { Request, Response } from "express";
import User from "../models/User";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

// POST /api/organizers/apply
// Attendee submits an application to become an organizer
export const applyForOrganizer = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const {
      organizationName,
      phoneNumber,
      phone,
      organizationType,
      location,
      websiteOrSocialMedia,
      website,
      description,
    } = req.body;

    const orgName = (organizationName || "").trim();
    const phoneNum = (phoneNumber || phone || "").trim();
    const orgType = (organizationType || "").trim();
    const loc = (location || "").trim();
    const webOrSocial = (websiteOrSocialMedia || website || "").trim();
    const desc = (description || "").trim();

    // Required fields validation
    if (!orgName) {
      res.status(400).json({
        success: false,
        message: "Organization or host name is required",
      });
      return;
    }

    if (!phoneNum) {
      res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
      return;
    }

    if (!orgType) {
      res.status(400).json({
        success: false,
        message: "Organization type is required (e.g. school, individual, company, NGO)",
      });
      return;
    }

    if (!loc) {
      res.status(400).json({
        success: false,
        message: "Location is required",
      });
      return;
    }

    if (!desc) {
      res.status(400).json({
        success: false,
        message: "Description of who or what you are is required",
      });
      return;
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    // Check if user is already an organizer
    if (user.role === "ORGANIZER") {
      res.status(400).json({
        success: false,
        message: "You are already an approved organizer",
      });
      return;
    }

    // Check if user already has a pending application
    if (user.organizerApplication?.status === "PENDING") {
      res.status(400).json({
        success: false,
        message: "You already have a pending organizer application under review",
        application: user.organizerApplication,
      });
      return;
    }

    // Set application details
    user.organizerApplication = {
      status: "PENDING",
      organizationName: orgName,
      phoneNumber: phoneNum,
      organizationType: orgType,
      location: loc,
      websiteOrSocialMedia: webOrSocial,
      description: desc,
      rejectionReason: undefined,
      appliedAt: new Date(),
      reviewedAt: undefined,
    };

    await user.save();

    res.status(201).json({
      success: true,
      message: "Organizer application submitted successfully. It is now pending admin review.",
      application: user.organizerApplication,
    });
  } catch (error: any) {
    console.error("Apply for organizer error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while submitting organizer application",
      error: error.message,
    });
  }
};

// GET /api/organizers/my-application
// Attendee views the status of their own organizer application
export const getMyApplication = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    res.status(200).json({
      success: true,
      role: user.role,
      application: user.organizerApplication || { status: "NONE" },
    });
  } catch (error: any) {
    console.error("Get my application error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching application status",
      error: error.message,
    });
  }
};

// GET /api/organizers/admin/applications
// Admin views all organizer applications (optional query ?status=PENDING)
export const getAllApplications = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const statusQuery = req.query.status as string | undefined;

    let filter: Record<string, any> = {
      "organizerApplication.status": { $ne: "NONE" },
    };

    if (statusQuery) {
      filter = {
        "organizerApplication.status": statusQuery.toUpperCase(),
      };
    }

    const users = await User.find(filter)
      .select("name email role organizerApplication createdAt")
      .sort({ "organizerApplication.appliedAt": -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      applications: users.map((u) => ({
        userId: u._id,
        name: u.name,
        email: u.email,
        currentRole: u.role,
        application: u.organizerApplication,
      })),
    });
  } catch (error: any) {
    console.error("Get all applications error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching organizer applications",
      error: error.message,
    });
  }
};

// PATCH /api/organizers/admin/applications/:userId/review
// Admin approves or rejects an organizer application
export const reviewApplication = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;
    const action = (req.body.action || req.body.status || "").toString().trim().toUpperCase();
    const rejectionReason = (
      req.body.rejectionReason ||
      req.body.whyNote ||
      req.body.reason ||
      ""
    ).trim();

    if (!action || !["APPROVE", "APPROVED", "REJECT", "REJECTED"].includes(action)) {
      res.status(400).json({
        success: false,
        message: "Invalid action. Must be 'APPROVE' or 'REJECT'",
      });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: "Applicant not found" });
      return;
    }

    if (!user.organizerApplication || user.organizerApplication.status === "NONE") {
      res.status(400).json({
        success: false,
        message: "This user has not submitted an organizer application",
      });
      return;
    }

    const isApprove = action === "APPROVE" || action === "APPROVED";

    if (isApprove) {
      user.role = "ORGANIZER";
      user.organizerApplication.status = "APPROVED";
      user.organizerApplication.rejectionReason = undefined;
      user.organizerApplication.reviewedAt = new Date();

      await user.save();

      res.status(200).json({
        success: true,
        message: "Organizer application approved successfully! User role has been upgraded to ORGANIZER.",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          application: user.organizerApplication,
        },
      });
      return;
    }

    // Rejection case
    if (!rejectionReason) {
      res.status(400).json({
        success: false,
        message: "A rejection reason (WHY NOTE) is required when rejecting an application",
      });
      return;
    }

    user.organizerApplication.status = "REJECTED";
    user.organizerApplication.rejectionReason = rejectionReason;
    user.organizerApplication.reviewedAt = new Date();

    await user.save();

    res.status(200).json({
      success: true,
      message: "Organizer application rejected with reason provided.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        application: user.organizerApplication,
      },
    });
  } catch (error: any) {
    console.error("Review application error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while reviewing organizer application",
      error: error.message,
    });
  }
};

