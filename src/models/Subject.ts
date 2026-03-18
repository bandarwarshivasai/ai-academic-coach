import mongoose, { Schema, Document } from "mongoose";

export interface ILink {
  title: string;
  url: string;
}

export interface ITopic {
  _id?: any; // Changed from string to any for mongoose compatibility
  name: string;
  isCompleted: boolean;
  progress: number; // 0-100
  notes?: string;
  youtubeLinks?: ILink[];
  studyLinks?: ILink[];
  documentId?: string; // Reference to Document model
}

export interface ISubject extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  topics: any[]; // Changed to any to handle internal subdocs better
  createdAt: Date;
  updatedAt: Date;
}

const LinkSchema = new Schema<ILink>({
  title: { type: String, required: true },
  url: { type: String, required: true },
});

const TopicSchema = new Schema<ITopic>({
  name: { type: String, required: true },
  isCompleted: { type: Boolean, default: false },
  progress: { type: Number, default: 0 },
  notes: { type: String },
  youtubeLinks: [LinkSchema],
  studyLinks: [LinkSchema],
  documentId: { type: String },
});

const SubjectSchema = new Schema<ISubject>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    topics: [TopicSchema],
  },
  { timestamps: true }
);

export default mongoose.models.Subject || mongoose.model<ISubject>("Subject", SubjectSchema);
