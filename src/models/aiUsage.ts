import mongoose, { Document, Schema } from "mongoose";

export interface IAiUsage extends Document {
    visitorKey: string;
    feature: "event_qa" | "event_finder";
    scope: string;
    usageDate: string;
    count: number;
    expireAt: Date;
}

const aiUsageSchema = new Schema<IAiUsage>({
    visitorKey: { type: String, required: true },
    feature: { type: String, enum: ["event_qa", "event_finder"], required: true },
    scope: { type: String, required: true },
    usageDate: { type: String, required: true },
    count: { type: Number, default: 0 },
    expireAt: { type: Date, required: true },
});

aiUsageSchema.index({ visitorKey: 1, feature: 1, scope: 1, usageDate: 1 }, { unique: true });
aiUsageSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

const AiUsage = mongoose.model<IAiUsage>("AiUsage", aiUsageSchema);
export default AiUsage;