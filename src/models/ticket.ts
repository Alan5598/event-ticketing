import mongoose, { Document, Schema } from "mongoose";

export type TicketStatus = "valid" | "used" | "cancelled";

export interface ITicket extends Document {
    eventId: mongoose.Types.ObjectId;
    ticketTypeId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    qrToken: string;
    status: TicketStatus;
    checkedInAt?: Date;
    checkedInBy?: mongoose.Types.ObjectId;
    createdAt: Date;
}

const ticketSchema = new Schema<ITicket>(
    {
        eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
        ticketTypeId: { type: Schema.Types.ObjectId, required: true },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        qrToken: { type: String, required: true, unique: true },
        status: { type: String, enum: ["valid", "used", "cancelled"], default: "valid" },
        checkedInAt: { type: Date },
        checkedInBy: { type: Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: { createdAt: true, updatedAt: false } },
);

ticketSchema.index({ eventId: 1, userId: 1 }, { unique: true });

const Ticket = mongoose.model<ITicket>("Ticket", ticketSchema);
export default Ticket;