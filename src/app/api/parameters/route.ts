import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongoose";
import StudyParameter from "@/models/StudyParameter";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    
    // @ts-ignore
    const parameters = await StudyParameter.find({ userId: session.user.id }).sort({ date: -1 });
    return NextResponse.json({ parameters }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const data = await req.json();

    const { studyHours, sleepHours, attendancePercentage, internalMarks, practiceTestScores, date } = data;

    if (
      studyHours === undefined || sleepHours === undefined || 
      attendancePercentage === undefined || internalMarks === undefined || 
      practiceTestScores === undefined
    ) {
      return NextResponse.json({ message: "All parameters are required" }, { status: 400 });
    }

    await connectToDatabase();

    const newParam = await StudyParameter.create({
      // @ts-ignore
      userId: session.user.id,
      date: date ? new Date(date) : new Date(),
      studyHours: Number(studyHours),
      sleepHours: Number(sleepHours),
      attendancePercentage: Number(attendancePercentage),
      internalMarks: Number(internalMarks),
      practiceTestScores: Number(practiceTestScores),
    });

    return NextResponse.json({ parameter: newParam }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { preferences } = await req.json();
    await connectToDatabase();

    const User = (await import("@/models/User")).default;
    // @ts-ignore
    await User.findByIdAndUpdate(session.user.id, { preferences });

    return NextResponse.json({ message: "Preferences updated" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
