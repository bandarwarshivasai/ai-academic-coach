import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  image?: string;
  classLevel?: string;
  targetExam?: string;
  academicGoals?: string;
  preferences?: {
    difficulty: "Beginner" | "Intermediate" | "Advanced";
    learningPace: "Slow" | "Moderate" | "Fast";
    topicDepth: "Conceptual" | "Detailed" | "Comprehensive";
    aiStyle: "Supportive" | "Challenging" | "Brief";
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, select: false }, // Avoid returning password by default
    image: { type: String },
    classLevel: { type: String },
    targetExam: { type: String },
    academicGoals: { type: String },
    preferences: {
      difficulty: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], default: "Intermediate" },
      learningPace: { type: String, enum: ["Slow", "Moderate", "Fast"], default: "Moderate" },
      topicDepth: { type: String, enum: ["Conceptual", "Detailed", "Comprehensive"], default: "Detailed" },
      aiStyle: { type: String, enum: ["Supportive", "Challenging", "Brief"], default: "Supportive" },
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
