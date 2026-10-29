import mongoose, { Document, Schema } from "mongoose";

export const ROLES = ["ATTENDEE", "ORGANIZER", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];
export type UserStatus = "ACTIVE" | "BANNED";

export interface IUser extends Document {
    name: string;
    email: string;
    passwordHash: string;
    roles: Role[];
    status: UserStatus;
    organizerProfile?: {
        organizationName: string;
        phone?: string;
        bio?: string;
        becameOrganizerAt: Date;
    };
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        passwordHash: { type: String, required: true, select: false },
        roles: {
            type: [{ type: String, enum: ROLES }],
            default: ["ATTENDEE"],
            validate: [(v: string[]) => v.length > 0, "User must have at least one role"],
        },
        status: { type: String, enum: ["ACTIVE", "BANNED"], default: "ACTIVE" },
        organizerProfile: {
            organizationName: { type: String, trim: true },
            phone: { type: String, trim: true },
            bio: { type: String, trim: true },
            becameOrganizerAt: { type: Date },
        },
    },
    { timestamps: true },
);

const User = mongoose.model<IUser>("User", userSchema);
export default User;