import mongoose, { Document, Schema } from "mongoose";

export type UserRole = "ATTENDEE" | "ORGANIZER" | "ADMIN";
export type ApplicationStatus = "NONE" | "PENDING" | "APPROVED" | "REJECTED";

export interface IOrganizerApplication {
  status: ApplicationStatus;
  organizationName?: string;
  phoneNumber?: string;
  organizationType?: string;
  location?: string;
  websiteOrSocialMedia?: string;
  description?: string;
  rejectionReason?: string;
  appliedAt?: Date;
  reviewedAt?: Date;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isVerified: boolean;
  otp?: {
    code?: string;
    expiresAt?: Date;
  };
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  organizerApplication?: IOrganizerApplication;
  createdAt: Date;
  updatedAt: Date;
}

const organizerApplicationSchema = new Schema<IOrganizerApplication>(
  {
    status: {
      type: String,
      enum: ["NONE", "PENDING", "APPROVED", "REJECTED"],
      default: "NONE",
    },
    organizationName: { type: String, trim: true },
    phoneNumber: { type: String, trim: true },
    organizationType: { type: String, trim: true },
    location: { type: String, trim: true },
    websiteOrSocialMedia: { type: String, trim: true },
    description: { type: String, trim: true },
    rejectionReason: { type: String, trim: true },
    appliedAt: { type: Date },
    reviewedAt: { type: Date },
  },
  { _id: false }
);

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
      select: false,
    },
    role: {
      type: String,
      enum: ["ATTENDEE", "ORGANIZER", "ADMIN"],
      default: "ATTENDEE",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      code: { type: String },
      expiresAt: { type: Date },
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
    organizerApplication: {
      type: organizerApplicationSchema,
      default: () => ({ status: "NONE" }),
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model<IUser>("User", userSchema);
export default User;
