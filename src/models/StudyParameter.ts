import mongoose, { Schema, Document } from "mongoose";

export interface IStudyParameter extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  studyHours: number;
  sleepHours: number;
  attendancePercentage: number;
  internalMarks: number;
  practiceTestScores: number; // Avg or out of 100
  tasksCompleted: number;
  aiInteractions: number;
  documentCount: number;
}

const StudyParameterSchema = new Schema<IStudyParameter>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, default: Date.now },
    studyHours: { type: Number, required: true, min: 0, max: 24 },
    sleepHours: { type: Number, required: true, min: 0, max: 24 },
    attendancePercentage: { type: Number, required: true, min: 0, max: 100 },
    internalMarks: { type: Number, required: true, min: 0, max: 100 },
    practiceTestScores: { type: Number, required: true, min: 0, max: 100 },
    tasksCompleted: { type: Number, default: 0 },
    aiInteractions: { type: Number, default: 0 },
    documentCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.StudyParameter || mongoose.model<IStudyParameter>("StudyParameter", StudyParameterSchema);
