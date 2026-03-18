import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongoose";
import StudyParameter from "@/models/StudyParameter";
import Subject from "@/models/Subject";
import Prediction from "@/models/Prediction";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    // @ts-ignore
    const predictions = await Prediction.find({ userId: session.user.id }).sort({ date: -1 });

    return NextResponse.json({ predictions }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    // @ts-ignore
    const userId = session.user.id;

    // Fetch user data context
    const parameters = await StudyParameter.find({ userId }).sort({ date: -1 }).limit(10);
    const subjects = await Subject.find({ userId });

    if (!parameters.length) {
      return NextResponse.json({ message: "Not enough data to generate prediction. Log parameters first." }, { status: 400 });
    }

    // Format data for AI
    const syllabusContext = subjects.map(s => {
      const completed = s.topics.filter((t: any) => t.isCompleted).map((t: any) => t.name);
      const pending = s.topics.filter((t: any) => !t.isCompleted).map((t: any) => t.name);
      return `${s.name}: Completed (${completed.join(', ')}). Pending (${pending.join(', ')}).`;
    }).join('\n');

    const paramContext = parameters.map(p => 
      `Date: ${new Date(p.date).toISOString().split('T')[0]}, Study: ${p.studyHours}h, Sleep: ${p.sleepHours}h, Avg Marks: ${p.internalMarks}%, Practice: ${p.practiceTestScores}%`
    ).join('\n');

    const prompt = `
      You are an expert AI Academic Coach & Data Scientist.
      Analyze the following student data and predict their final exam score percentage. Identify weak topics and provide exact study recommendations.
      
      Student Syllabus Progress:
      ${syllabusContext}

      Recent Study Metrics (last 10 days):
      ${paramContext}

      Return ONLY a JSON response with the following exact keys (no markdown formatting, no codeblocks, parseable by JSON.parse):
      {
         "predictedScore": <integer out of 100>,
         "confidence": "<High, Medium, or Low>",
         "weakTopics": ["<topic1>", "<topic2>"],
         "recommendations": ["<rec1>", "<rec2>"]
      }
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", generationConfig: { responseMimeType: "application/json" } });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    const output = JSON.parse(responseText);

    const newPrediction = await Prediction.create({
      userId,
      predictedScore: output.predictedScore,
      confidence: output.confidence,
      weakTopics: output.weakTopics,
      recommendations: output.recommendations
    });

    return NextResponse.json({ prediction: newPrediction }, { status: 201 });
  } catch (error) {
    console.error("AI Prediction Error:", error);
    return NextResponse.json({ message: "Failed to generate prediction from AI" }, { status: 500 });
  }
}
