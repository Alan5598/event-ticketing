import mongoose, { Document, Schema } from "mongoose";

export type EventStatus = "draft" | "published" | "cancelled";

export interface ITicketType {
    _id?: mongoose.Types.ObjectId;
    name: string;
    price: number;
    quantity?: number | null;
}

export interface IFaq {
    _id?: mongoose.Types.ObjectId;
    question: string;
    answer: string;
    source: "organizer" | "visitor_question";
    createdAt: Date;
}

export interface IEvent extends Document {
    organizerId: mongoose.Types.ObjectId;
    title: string;
    description: string;
    category: string;
    startTime: Date;
    endTime?: Date;
    venue: string;
    coverImageUrl?: string;
    capacity: number;
    ticketsIssued: number;
    status: EventStatus;
    cancelledAt?: Date;
    cancelReason?: string;
    details: {
        schedule?: string;
        directionsParking?: string;
        whatToBring?: string;
        ageLimits?: string;
    };
    ticketTypes: ITicketType[];
    faqs: IFaq[];
    createdAt: Date;
    updatedAt: Date;
}

const ticketTypeSchema = new Schema<ITicketType>({
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0, default: 0 },
    quantity: { type: Number, min: 1, default: null },
});

const faqSchema = new Schema<IFaq>({
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
    source: { type: String, enum: ["organizer", "visitor_question"], default: "organizer" },
    createdAt: { type: Date, default: Date.now },
});

const eventSchema = new Schema<IEvent>(
    {
        organizerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },
        category: { type: String, required: true, trim: true, lowercase: true },
        startTime: { type: Date, required: true },
        endTime: { type: Date },
        venue: { type: String, required: true, trim: true },
        coverImageUrl: { type: String },
        capacity: { type: Number, required: true, min: 1 },
        ticketsIssued: { type: Number, default: 0, min: 0 },
        status: { type: String, enum: ["draft", "published", "cancelled"], default: "draft" },
        cancelledAt: { type: Date },
        cancelReason: { type: String, trim: true },
        details: {
            schedule: { type: String, default: "" },
            directionsParking: { type: String, default: "" },
            whatToBring: { type: String, default: "" },
            ageLimits: { type: String, default: "" },
        },
        ticketTypes: { type: [ticketTypeSchema], default: [] },
        faqs: { type: [faqSchema], default: [] },
    },
    { timestamps: true },
);

eventSchema.index({ status: 1, startTime: 1 });

const Event = mongoose.model<IEvent>("Event", eventSchema);
export default Event;