import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongoose";
import Subject from "@/models/Subject";
import Prediction from "@/models/Prediction";
import StudyPlan from "@/models/StudyPlan";
import User from "@/models/User";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { plan, type } = await req.json();
    await connectToDatabase();
    
    // @ts-ignore
    const userId = session.user.id;

    // Fetch old plan to compare
    const oldDoc = await StudyPlan.findOne({ userId, type });
    const oldPlan = oldDoc?.plan || [];
    
    // Count newly completed tasks
    let newlyCompleted = 0;
    plan.forEach((task: any, idx: number) => {
      if (task.isCompleted && (!oldPlan[idx] || !oldPlan[idx].isCompleted)) {
        newlyCompleted++;
      }
    });
    
    await StudyPlan.findOneAndUpdate(
      { userId, type },
      { plan },
      { upsert: true }
    );

    if (newlyCompleted > 0) {
      const { updateAcademicMetrics } = await import("@/lib/metrics");
      await updateAcademicMetrics(userId, "tasksCompleted", newlyCompleted);
    }

    return NextResponse.json({ message: "Plan updated" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Failed to update plan" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    // @ts-ignore
    const plan = await StudyPlan.findOne({ userId: session.user.id }).sort({ createdAt: -1 });

    return NextResponse.json({ plan: plan?.plan || [], type: plan?.type || "weekly", createdAt: plan?.createdAt }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: "Error fetching plan" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { type } = await req.json(); // "daily" or "weekly"

    await connectToDatabase();
    const userId = (session.user as any).id;

    // Fetch user context
    const user = await User.findById(userId);
    const subjects = await Subject.find({ userId });
    const latestPrediction = await Prediction.findOne({ userId }).sort({ date: -1 });

    const syllabusContext = subjects.map(s => {
      const pending = s.topics.filter((t: any) => !t.isCompleted).map((t: any) => t.name);
      return `${s.name}: Pending (${pending.join(', ')}).`;
    }).join('\n');

    const predictionContext = latestPrediction ? `Recent Weak Topics Identified: ${latestPrediction.weakTopics.join(', ')}` : "";
    const preferenceContext = user?.preferences ? `User Preferences: Difficulty: ${user.preferences.difficulty}, Pace: ${user.preferences.learningPace}, Depth: ${user.preferences.topicDepth}` : "";

    const prompt = `
      You are an expert academic planner.
      Generate a ${type} study plan for a student based on their pending syllabus, identified weak topics, and learning preferences.

      Pending Syllabus:
      ${syllabusContext}

      ${predictionContext}

      ${preferenceContext}

      Format the output as a JSON object with a single key "plan" containing an array of objects.
      If type is "daily", generate 4-5 study blocks for the day. If "weekly", generate 7 days of tasks.

      Response Format for Daily:
      { "plan": [ { "time": "Morning (2h)", "task": "Study Calculus", "isCompleted": false }, ... ] }

      Response Format for Weekly:
      { "plan": [ { "day": "Monday", "task": "Complete Algebra Practice", "isCompleted": false }, ... ] }

      Ensure each task object has an "isCompleted" field set to false.
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", generationConfig: { responseMimeType: "application/json" } });
    const result = await model.generateContent(prompt);
    const parsed = JSON.parse(result.response.text());

    // Persist the plan
    await StudyPlan.findOneAndUpdate(
      { userId, type },
      { plan: parsed.plan },
      { upsert: true, new: true }
    );
    
    return NextResponse.json(parsed, { status: 200 });
  } catch (error) {
    console.error("Study plan generation error:", error);
    return NextResponse.json({ message: "Failed to generate study plan" }, { status: 500 });
  }
}
