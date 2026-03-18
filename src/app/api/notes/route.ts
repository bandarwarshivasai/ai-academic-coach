import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongoose";
import Note from "@/models/Note";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  await connectToDatabase();
  // @ts-ignore
  const notes = await Note.find({ userId: session.user.id }).sort({ updatedAt: -1 });
  return NextResponse.json({ notes });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const { title, content, subject } = await req.json();
  if (!title?.trim()) return NextResponse.json({ message: "Title required" }, { status: 400 });
  await connectToDatabase();
  // @ts-ignore
  const note = await Note.create({ userId: session.user.id, title, content, subject });
  return NextResponse.json({ note }, { status: 201 });
}
