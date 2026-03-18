import mongoose, { Schema, Document } from "mongoose";

export interface IPrediction extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  predictedScore: number;
  confidence: string; // High, Medium, Low
  weakTopics: string[];
  recommendations: string[];
}

const PredictionSchema = new Schema<IPrediction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, default: Date.now },
    predictedScore: { type: Number, required: true },
    confidence: { type: String, required: true },
    weakTopics: [{ type: String }],
    recommendations: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.models.Prediction || mongoose.model<IPrediction>("Prediction", PredictionSchema);
