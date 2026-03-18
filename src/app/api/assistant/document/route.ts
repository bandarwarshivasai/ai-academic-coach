import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Pinecone } from "@pinecone-database/pinecone";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
const pcIndex = pc.index(process.env.PINECONE_INDEX!);

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { question, namespace } = await req.json();

    if (!question || !namespace) {
      return NextResponse.json({ message: "Question and document namespace required" }, { status: 400 });
    }

    // Embed question
    const modelEm = genAI.getGenerativeModel({ model: "gemini-embedding-2-preview" });
    const queryEmbedding = await modelEm.embedContent(question);
    const vector = queryEmbedding.embedding.values;

    // Search Pinecone
    const searchResults = await pcIndex.namespace(namespace).query({
      topK: 8,
      vector: vector,
      includeMetadata: true,
    });

    const context = searchResults.matches
      .filter(m => m.metadata?.text && (m.metadata.text as string).trim().length > 0)
      .map(m => m.metadata?.text as string)
      .join("\n\n---\n\n");

    if (!context || context.trim().length < 50) {
      return NextResponse.json({ answer: "This document doesn't appear to have any searchable content yet. Please try re-uploading the PDF and ask your question again." }, { status: 200 });
    }

    // Generate Answer
    const prompt = `You are a precise and confident academic AI assistant. Your job is to answer student questions based ONLY on the document text provided below.

Rules:
- Answer directly and confidently using information from the context.
- If the exact answer is present, state it clearly without hedging.
- If the context partially answers the question, share what you found and extend with your knowledge.
- DO NOT say "I couldn't find" if there is relevant text in the context below.
- Write in clear, natural English. Be concise but complete.

Document Context:
${context}

Student Question: ${question}

Answer:`;

    const modelGen = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const answerResult = await modelGen.generateContent(prompt);

    try {
      const { updateAcademicMetrics } = await import("@/lib/metrics");
      // @ts-ignore
      await updateAcademicMetrics(session.user.id, "aiInteractions", 1);
    } catch (metricErr) {
      console.error("Metric tracking failed:", metricErr);
    }

    return NextResponse.json({ answer: answerResult.response.text(), sources: searchResults.matches.map(m => m.metadata?.text) }, { status: 200 });
    
  } catch (error) {
    console.error("Doc QA error:", error);
    return NextResponse.json({ message: "Failed to answer question" }, { status: 500 });
  }
}
