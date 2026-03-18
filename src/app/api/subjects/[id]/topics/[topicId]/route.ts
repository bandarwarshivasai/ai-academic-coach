import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongoose";
import Subject from "@/models/Subject";

// Update Topic inside Subject
export async function PUT(req: Request, { params }: { params: Promise<{ id: string, topicId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { isCompleted, progress, notes, youtubeLinks, studyLinks, documentId } = await req.json();

    await connectToDatabase();
    
    const { id, topicId } = await params;
    // @ts-ignore
    const subject = await Subject.findOne({ _id: id, userId: session.user.id });
    if (!subject) return NextResponse.json({ message: "Subject not found" }, { status: 404 });

    const topic = subject.topics.id(topicId);
    if (!topic) return NextResponse.json({ message: "Topic not found" }, { status: 404 });

    if (isCompleted !== undefined) topic.isCompleted = isCompleted;
    if (progress !== undefined) topic.progress = progress;
    if (notes !== undefined) topic.notes = notes;
    if (youtubeLinks !== undefined) topic.youtubeLinks = youtubeLinks;
    if (studyLinks !== undefined) topic.studyLinks = studyLinks;
    if (documentId !== undefined) topic.documentId = documentId;

    await subject.save();

    if (isCompleted) {
       const { updateAcademicMetrics } = await import("@/lib/metrics");
       // @ts-ignore
       await updateAcademicMetrics(session.user.id, "tasksCompleted", 1);
    }

    return NextResponse.json({ subject }, { status: 200 });
  } catch (error) {
    console.error("[Topic Update Error]:", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}

// Delete Topic
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string, topicId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    
    const { id, topicId } = await params;
    const subject = await Subject.findOneAndUpdate(
      // @ts-ignore
      { _id: id, userId: session.user.id },
      { $pull: { topics: { _id: topicId } } },
      { new: true }
    );

    if (!subject) return NextResponse.json({ message: "Subject not found" }, { status: 404 });

    return NextResponse.json({ subject }, { status: 200 });
  } catch (error) {
    console.error("[Topic Delete Error]:", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
