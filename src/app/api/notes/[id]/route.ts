import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongoose";
import Note from "@/models/Note";

export async function PUT(req: Request, { params }: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const { title, content, subject } = await req.json();
  const { id } = await params;
  await connectToDatabase();
  // @ts-ignore
  const note = await Note.findOneAndUpdate({ _id: id, userId: session.user.id }, { title, content, subject }, { new: true });
  if (!note) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json({ note });
}

export async function DELETE(req: Request, { params }: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  await connectToDatabase();
  const { id } = await params;
  // @ts-ignore
  await Note.findOneAndDelete({ _id: id, userId: session.user.id });
  return NextResponse.json({ message: "Deleted" });
}
