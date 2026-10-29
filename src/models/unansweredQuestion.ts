import mongoose, { Document, Schema } from "mongoose";

export interface IUnansweredQuestion extends Document {
    eventId: mongoose.Types.ObjectId;
    questionText: string;
    status: "pending" | "answered";
    faqId?: mongoose.Types.ObjectId | null;
    answeredAt?: Date;
    createdAt: Date;
}

const unansweredQuestionSchema = new Schema<IUnansweredQuestion>(
    {
        eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
        questionText: { type: String, required: true, trim: true, maxlength: 500 },
        status: { type: String, enum: ["pending", "answered"], default: "pending" },
        faqId: { type: Schema.Types.ObjectId, default: null },
        answeredAt: { type: Date },
    },
    { timestamps: { createdAt: true, updatedAt: false } },
);

unansweredQuestionSchema.index({ eventId: 1, status: 1 });

const UnansweredQuestion = mongoose.model<IUnansweredQuestion>(
    "UnansweredQuestion",
    unansweredQuestionSchema,
);
export default UnansweredQuestion;