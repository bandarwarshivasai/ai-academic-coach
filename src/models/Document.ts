import mongoose, { Schema, Document } from "mongoose";

export interface IDocumentDB extends Document {
  userId: mongoose.Types.ObjectId;
  filename: string;
  summary: string;
  content: string;
  pineconeNamespace: string;
  createdAt: Date;
}

const DocumentSchema = new Schema<IDocumentDB>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    filename: { type: String, required: true },
    summary: { type: String },
    content: { type: String },
    pineconeNamespace: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export default mongoose.models.Document || mongoose.model<IDocumentDB>("Document", DocumentSchema);
