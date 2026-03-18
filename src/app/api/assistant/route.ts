import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { messages, subjectContext } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ message: "Invalid message format" }, { status: 400 });
    }

    const systemPrompt = `You are AI Academic Assistant, an expert academic tutor. 
    ${subjectContext ? `The student is currently focusing on this subject: ${subjectContext}.` : ""}
    Your goal is to explain concepts clearly, provide examples, solve problems step-by-step, and generate practice questions if asked. 
    Be encouraging, concise, and format your responses in clear markdown.`;

    // Initialize model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Format history for Gemini
    const history = messages.slice(0, -1).map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    // Start chat session
    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: "System Instructions: " + systemPrompt }] },
        { role: "model", parts: [{ text: "Understood. I am ready to tutor." }] },
        ...history,
      ],
    });

    const latestMessage = messages[messages.length - 1].content;
    const result = await chat.sendMessage(latestMessage);

    const { updateAcademicMetrics } = await import("@/lib/metrics");
    // @ts-ignore
    await updateAcademicMetrics(session.user.id, "aiInteractions", 1);

    return NextResponse.json({ response: result.response.text() }, { status: 200 });

  } catch (error) {
    console.error("Assistant Error:", error);
    return NextResponse.json({ message: "Failed to communicate with AI Assistant" }, { status: 500 });
  }
}
