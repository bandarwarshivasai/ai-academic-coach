import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongoose";
import DocumentDB from "@/models/Document";
import { Pinecone } from "@pinecone-database/pinecone";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { extractTextFromPDF } from "@/lib/pdf"; // ✅ NEW

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
const pcIndex = pc.index(process.env.PINECONE_INDEX!);

// Helper to get embeddings
async function getGeminiEmbedding(text: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-embedding-2-preview" });
  const result = await model.embedContent(text);
  return result.embedding.values;
}

// Intelligent text chunker
function chunkText(text: string, size: number = 400) {
  const cleanedText = text.replace(/[\n\r]+/g, ' ').replace(/\s+/g, ' ').trim();
  const words = cleanedText.split(" ");
  const chunks = [];
  const overlap = 50;

  for (let i = 0; i < words.length; i += (size - overlap)) {
    chunks.push(words.slice(i, i + size).join(" "));
    if (i + size >= words.length) break;
  }
  return chunks;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    console.log("[Upload] POST request received. Parsing FormData...");

    let formData;
    try {
      formData = await req.formData();
    } catch (formErr) {
      console.error("[Upload] Error parsing FormData:", formErr);
      return NextResponse.json({ message: "Failed to parse form data" }, { status: 400 });
    }

    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 });
    }

    console.log(`[Upload] File: ${file.name}`);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // ✅ NEW PDF PARSING (FIXED)
    let text = "";
    try {
      console.log("[Upload] Using pdfjs for extraction...");
      text = await extractTextFromPDF(buffer);

      console.log(`[Upload] PDF extraction complete. Length: ${text.length}`);
    } catch (parseErr: any) {
      console.error("[Upload] PDF Pipeline Failure:", parseErr);
      return NextResponse.json(
        { message: `PDF EXTRACTION FAILED: ${parseErr?.message}` },
        { status: 422 }
      );
    }

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ message: "Could not extract text from PDF" }, { status: 400 });
    }

    // Generate Summary
    let summary = "";
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent(
        `Summarize the following:\n\n${text.substring(0, 5000)}`
      );
      summary = result.response.text();
    } catch (err) {
      summary = "Summary failed";
    }

    await connectToDatabase();

    const namespace = `user-${session.user.id}-${Date.now()}`;

    const docRecord = await DocumentDB.create({
      userId: session.user.id,
      filename: file.name,
      summary,
      content: text,
      pineconeNamespace: namespace,
    });

    const chunks = chunkText(text);

    const vectors = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      if (!chunk.trim()) continue;

      try {
        const embedding = await getGeminiEmbedding(chunk);
        vectors.push({
          id: `chunk-${i}`,
          values: embedding,
          metadata: { text: chunk }
        });
      } catch (err) {
        console.error("Embedding error:", err);
      }
    }

    try {
      await pcIndex.namespace(namespace).upsert(vectors as any);
    } catch (err) {
      console.error("Pinecone error:", err);
    }

    return NextResponse.json({ document: docRecord }, { status: 201 });

  } catch (error: any) {
    console.error("[Upload] ERROR:", error);
    return NextResponse.json(
      { message: error?.message || "Failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const documents = await DocumentDB.find({
      userId: session.user.id
    }).sort({ createdAt: -1 });

    return NextResponse.json({ documents });

  } catch (err) {
    return NextResponse.json({ message: "Error fetching" }, { status: 500 });
  }
}