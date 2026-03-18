import mongoose, { Schema, Document } from "mongoose";

export interface IStreak extends Document {
  userId: mongoose.Types.ObjectId;
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: Date;
  studyDates: Date[];
  badges: string[];
}

const StreakSchema = new Schema<IStreak>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastStudyDate: { type: Date },
    studyDates: [{ type: Date }],
    badges: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.models.Streak || mongoose.model<IStreak>("Streak", StreakSchema);
