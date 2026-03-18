import mongoose, { Schema, Document } from "mongoose";

export interface IStudyPlan extends Document {
  userId: mongoose.Types.ObjectId;
  type: "daily" | "weekly";
  plan: any[];
  createdAt: Date;
}

const StudyPlanSchema = new Schema<IStudyPlan>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["daily", "weekly"], required: true },
    plan: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// We only keep the latest plan per type for now
export default mongoose.models.StudyPlan || mongoose.model<IStudyPlan>("StudyPlan", StudyPlanSchema);
