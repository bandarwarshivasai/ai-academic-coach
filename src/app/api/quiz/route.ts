import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { topic, type, count = 5 } = await req.json();
    // type: "mcq" | "flashcard" | "short_answer" | "practice"

    if (!topic || !type) {
      return NextResponse.json({ message: "Topic and type are required" }, { status: 400 });
    }

    let prompt = "";

    if (type === "mcq") {
      prompt = `Generate ${count} multiple-choice quiz questions on the topic: "${topic}".
      Return ONLY valid JSON (no markdown, no codeblock) with this structure:
      {
        "questions": [
          {
            "question": "...",
            "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
            "answer": "A) ...",
            "explanation": "..."
          }
        ]
      }`;
    } else if (type === "flashcard") {
      prompt = `Generate ${count} flashcards for the topic: "${topic}".
      Return ONLY valid JSON with this structure:
      {
        "flashcards": [
          { "front": "...", "back": "..." }
        ]
      }`;
    } else if (type === "short_answer") {
      prompt = `Generate ${count} short-answer questions on the topic: "${topic}".
      Return ONLY valid JSON:
      {
        "questions": [
          { "question": "...", "answer": "..." }
        ]
      }`;
    } else if (type === "practice") {
      prompt = `Generate ${count} practice problems for: "${topic}".
      Return ONLY valid JSON:
      {
        "problems": [
          { "problem": "...", "solution": "..." }
        ]
      }`;
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });
    const result = await model.generateContent(prompt);
    const output = JSON.parse(result.response.text());

    try {
      const { updateAcademicMetrics } = await import("@/lib/metrics");
      // @ts-ignore
      await updateAcademicMetrics(session.user.id, "aiInteractions", 1);
    } catch (metricErr) {
      console.error("Metric tracking failed:", metricErr);
    }

    return NextResponse.json(output, { status: 200 });
  } catch (error) {
    console.error("Quiz generation error:", error);
    return NextResponse.json({ message: "Failed to generate quiz" }, { status: 500 });
  }
}
