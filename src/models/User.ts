import mongoose, { Document, Schema } from "mongoose";

export type UserRole = "ATTENDEE" | "ORGANIZER" | "ADMIN";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  organizerApplication?: {
    status: "NONE" | "PENDING" | "APPROVED" | "REJECTED";
    organizationName?: string;
    phone?: string;
    appliedAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

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
    organizerApplication: {
      status: {
        type: String,
        enum: ["NONE", "PENDING", "APPROVED", "REJECTED"],
        default: "NONE",
      },
      organizationName: { type: String, trim: true },
      phone: { type: String, trim: true },
      appliedAt: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model<IUser>("User", userSchema);
export default User;

