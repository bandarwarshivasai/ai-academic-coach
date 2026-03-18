import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongoose";
import DocumentDB from "@/models/Document";
import { Pinecone } from "@pinecone-database/pinecone";
import { GoogleGenerativeAI } from "@google/generative-ai";
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
  // Overlap chunks slightly for better context retention
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
    if (!session || !session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

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
      console.error("[Upload] No file found in FormData");
      return NextResponse.json({ message: "No file provided" }, { status: 400 });
    }

    console.log(`[Upload] File identified: ${file.name}, type: ${file.type}`);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log(`[Upload] Buffer created: ${buffer.length} bytes`);

    // Parse PDF
    let text = "";
    try {
      console.log("[Upload] Initializing pdf-parse extraction...");
      const { PDFParse } = require("pdf-parse");
      
      if (!PDFParse) {
        throw new Error("PDF parsing engine interface not found");
      }

      const parser = new PDFParse({ data: buffer });
      const data = await parser.getText();
      await parser.destroy();
      
      let rawText = data?.text || "";
      // Clean up excessive newlines for better DB readability
      text = rawText.replace(/\n{3,}/g, '\n\n').trim();
      console.log(`[Upload] PDF extraction complete. Length: ${text.length}`);
    } catch (parseErr: any) {
      console.error("[Upload] PDF Pipeline Failure:", parseErr);
      return NextResponse.json({ 
        message: `PDF EXTRACTION FAILED: ${parseErr?.message || "Internal engine error"}`,
        details: parseErr?.stack
      }, { status: 422 }); // 422 Unprocessable Entity
    }

    if (!text || text.trim().length === 0) {
       console.warn("[Upload] Warning: PDF text extraction returned empty content.");
       return NextResponse.json({ message: "Could not extract text from PDF" }, { status: 400 });
    }

    // Generate Summary
    console.log("[Upload] Generating summary with Gemini...");
    let summary = "";
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const summaryResult = await model.generateContent(`Summarize the following academic text in one short paragraph:\n\n${text.substring(0, 5000)}`);
      summary = summaryResult.response.text();
      console.log("[Upload] Summary generated successfully.");
    } catch (sumErr) {
      console.error("[Upload] Summary generation error:", sumErr);
      summary = "Summary generation failed, but document was processed.";
    }

    await connectToDatabase();
    
    // @ts-ignore
    const namespace = `user-${session.user.id}-${Date.now()}`;
    console.log(`[Upload] Using namespace: ${namespace}`);
    
    // Save to Mongo
    const docRecord = await DocumentDB.create({
      // @ts-ignore
      userId: session.user.id,
      filename: file.name,
      summary,
      content: text,
      pineconeNamespace: namespace,
    });
    console.log(`[Upload] Document record created in MongoDB: ${docRecord._id}`);

    // Chunk the text before embedding
    const chunks = chunkText(text);

    // Parallel Chunk Embedding
    console.log(`[Upload] Total chunks to embed: ${chunks.length}`);
    const vectors = [];
    const batchSize = 10; // Embed 10 chunks at a time

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      console.log(`[Upload] Embedding batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(chunks.length/batchSize)}...`);
      
      const batchPromises = batch.map(async (chunk, idx) => {
        if (chunk.trim().length === 0) return null;
        try {
          const embedding = await getGeminiEmbedding(chunk);
          return {
            id: `chunk-${i + idx}`,
            values: embedding,
            metadata: { text: chunk, filename: file.name }
          };
        } catch (embedErr) {
          console.error(`[Upload] Embedding error at chunk ${i + idx}:`, embedErr);
          return null; // Don't fail the whole batch for one bad chunk
        }
      });

      const batchResults = await Promise.all(batchPromises);
      vectors.push(...batchResults.filter(Boolean));
    }
    console.log(`[Upload] All chunks embedded. Total vectors: ${vectors.length}`);
    
    // Batch upsert into Pinecone
    try {
      const batchSize = 100;
      for (let i = 0; i < vectors.length; i += batchSize) {
        const batch = vectors.slice(i, i + batchSize);
        console.log(`[Upload] Upserting batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(vectors.length/batchSize)} to Pinecone...`);
        await pcIndex.namespace(namespace).upsert(batch as any); 
      }
      console.log("[Upload] Pinecone upsert complete.");
    } catch (pcErr) {
      console.error("[Upload] Pinecone sync error:", pcErr);
    }

    const { updateAcademicMetrics } = await import("@/lib/metrics");
    // @ts-ignore
    await updateAcademicMetrics(session.user.id, "documentCount", 1);

    return NextResponse.json({ document: docRecord }, { status: 201 });
  } catch (error: any) {
    console.error("[Upload] CRITICAL ERROR:", error);
    return NextResponse.json({ message: error?.message || "Failed to process document" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    // @ts-ignore
    const documents = await DocumentDB.find({ userId: session.user.id }).sort({ createdAt: -1 });

    return NextResponse.json({ documents }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: "Error fetching" }, { status: 500 });
  }
}
