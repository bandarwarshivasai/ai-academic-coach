import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongoose";
import Subject from "@/models/Subject";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request, { params }: { params: Promise<{ id: string, topicId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { action, topicName } = await req.json();
    const { id, topicId } = await params;

    await connectToDatabase();
    // @ts-ignore
    const subject = await Subject.findOne({ _id: id, userId: session.user.id });
    if (!subject) return NextResponse.json({ message: "Subject not found" }, { status: 404 });

    const topic = subject.topics.id(topicId);
    if (!topic) return NextResponse.json({ message: "Topic not found" }, { status: 404 });

    if (action === "generate-notes") {
      let documentContext = "";
      if (topic.documentId) {
        try {
          const docRes = await fetch(`${new URL(req.url).origin}/api/documents/${topic.documentId}`, {
             headers: { cookie: req.headers.get("cookie") || "" }
          });
          if (docRes.ok) {
            const docData = await docRes.json();
            documentContext = `Use the following context from the student's uploaded document to tailor the resources:\n${docData.document.content.substring(0, 3000)}`;
          }
        } catch (err) {
          console.error("Failed to fetch document context:", err);
        }
      }

      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash", // Using 2.0 flash for better link quality
        generationConfig: { responseMimeType: "application/json" }
      });
      
      const prompt = `
        You are an expert academic tutor.
        Generate comprehensive study resources for the topic: "${topicName}" in the subject: "${subject.name}".
        ${documentContext}
        
        CRITICAL: All "url" fields MUST be real, valid, and direct links to high-quality educational content. 
        Preferred domains: wikipedia.org, geeksforgeeks.org, khanacademy.org, britannica.com, or official documentation.
        For YouTube, provide valid direct video URLs or extremely specific video-ID based URLs if possible.
        
        Return a JSON object with:
        1. "notes": Comprehensive notes in Markdown format.
        2. "studyLinks": An array of objects: { "title": string, "url": string }. (3 items)
        3. "youtubeLinks": An array of objects: { "title": string, "url": string }. (3 items)
        
        {
          "notes": "...",
          "studyLinks": [{ "title": "...", "url": "..." }],
          "youtubeLinks": [{ "title": "...", "url": "..." }]
        }
      `;
      
      const result = await model.generateContent(prompt);
      const data = JSON.parse(result.response.text());
 
      topic.notes = data.notes;
      topic.studyLinks = data.studyLinks;
      topic.youtubeLinks = data.youtubeLinks;
      
      await subject.save();
      return NextResponse.json(data, { status: 200 });
    }

    return NextResponse.json({ message: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Resource error:", error);
    return NextResponse.json({ message: "Failed to process resources" }, { status: 500 });
  }
}
