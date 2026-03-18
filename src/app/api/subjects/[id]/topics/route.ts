import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongoose";
import Subject from "@/models/Subject";

// Add Topic to Subject
export async function POST(req: Request, { params }: any) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { name } = await req.json();
    if (!name?.trim()) return NextResponse.json({ message: "Topic name required" }, { status: 400 });

    const { id } = await Promise.resolve(params);
    await connectToDatabase();
    
    // @ts-ignore
    const subject = await Subject.findOne({ _id: id, userId: session.user.id });
    if (!subject) return NextResponse.json({ message: "Subject not found" }, { status: 404 });

    subject.topics.push({ name, isCompleted: false, progress: 0 });
    await subject.save();

    return NextResponse.json({ subject }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
