import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongoose";
import Subject from "@/models/Subject";

export async function DELETE(req: Request, { params }: any) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { id } = await Promise.resolve(params);
    await connectToDatabase();
    
    // @ts-ignore
    const deleted = await Subject.findOneAndDelete({ _id: id, userId: session.user.id });
    
    if (!deleted) return NextResponse.json({ message: "Subject not found" }, { status: 404 });

    return NextResponse.json({ message: "Subject deleted" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
