import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { Chat } from "@/models/Chat";
import { Log } from "@/models/Log";
import { Note } from "@/models/Note";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { rateLimit } from "@/lib/rateLimit";
import { sanitize } from "@/lib/sanitize";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    
    // Rate limit: 200 requests per minute
    const rl = await rateLimit(`chatid_get_${(session.user as any).id}`, 200, 60000);
    if (!rl.success) return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });

    const chat = await Chat.findOne({ _id: id, userId: (session.user as any).id });
    
    if (!chat) return NextResponse.json({ error: "Chat not found" }, { status: 404 });

    return NextResponse.json({ messages: chat.messages });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch chat", details: err.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!(session.user as any).isPro) return NextResponse.json({ error: "Pro required" }, { status: 403 });

    // Rate limit: 200 requests per minute
    const rl = await rateLimit(`chatid_post_${(session.user as any).id}`, 200, 60000);
    if (!rl.success) return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });

    const body = sanitize(await req.json());
    const { text, action } = body;

    await connectToDatabase();
    const chat = await Chat.findOne({ _id: id, userId: (session.user as any).id });
    if (!chat) return NextResponse.json({ error: "Chat not found" }, { status: 404 });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not configured.");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    let finalPrompt = text;

    // Context-Aware Actions
    if (action === "summarize-logs") {
      const logs = await Log.find({ userId: (session.user as any).id }).sort({ date: -1 }).limit(10);
      const logData = logs.map(l => `Date: ${new Date(l.date).toDateString()} - ${l.description}`).join('\n');
      finalPrompt = `Summarize my recent logs:\n${logData}`;
    }

    // Save User Message
    chat.messages.push({ role: "user", content: finalPrompt });
    
    const history = chat.messages.slice(0, -1).map((msg: any) => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    }));

    const chatSession = model.startChat({
      history,
      systemInstruction: "You are a helpful, friendly, and concise AI assistant for a university student undergoing their SIWES (industrial training). Help them brainstorm daily logs, organize tasks, explain concepts, and provide general productivity advice. Keep responses clear and well-structured, using markdown formatting when helpful.",
    });

    const result = await chatSession.sendMessage(finalPrompt);
    const responseText = result.response.text();

    // Save Model Message
    chat.messages.push({ role: "model", content: responseText });
    await chat.save();

    return NextResponse.json({ response: responseText });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to generate response", details: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    await Chat.deleteOne({ _id: id, userId: (session.user as any).id });
    
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to delete chat", details: err.message }, { status: 500 });
  }
}
