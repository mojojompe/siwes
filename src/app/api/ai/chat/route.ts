import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { User } from "@/models/User";
import { Chat } from "@/models/Chat";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    
    let chat = await Chat.findOne({ userId: (session.user as any).id });
    if (!chat) {
      chat = await Chat.create({ userId: (session.user as any).id, messages: [] });
    }

    return NextResponse.json({ messages: chat.messages });
  } catch (err: any) {
    console.error("Chat GET Error:", err);
    require("fs").writeFileSync("C:/Users/HP/Desktop/Work/React/siwes/chat_error.txt", err.stack || err.message);
    return NextResponse.json({ error: "Failed to fetch chat history", details: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { text } = await req.json();
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Invalid text" }, { status: 400 });
    }

    await connectToDatabase();
    
    let chat = await Chat.findOne({ userId: (session.user as any).id });
    if (!chat) {
      chat = await Chat.create({ userId: (session.user as any).id, messages: [] });
    }

    // Add user message to DB
    chat.messages.push({ role: "user", content: text });
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Format history for Gemini SDK
    // The SDK expects history as { role: "user" | "model", parts: [{ text: "..." }] }
    const history = chat.messages.slice(0, -1).map((msg: any) => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    }));

    const chatSession = model.startChat({
      history,
      systemInstruction: "You are a helpful, friendly, and concise AI assistant for a university student undergoing their SIWES (industrial training). Help them brainstorm daily logs, organize tasks, explain concepts, and provide general productivity advice. Keep responses clear and well-structured, using markdown formatting when helpful.",
    });

    const result = await chatSession.sendMessage(text);
    const responseText = result.response.text();

    // Add model response to DB
    chat.messages.push({ role: "model", content: responseText });
    await chat.save();

    return NextResponse.json({ response: responseText });
  } catch (err: any) {
    console.error("Chat POST Error:", err);
    return NextResponse.json({ error: "Failed to generate response", details: err.message }, { status: 500 });
  }
}
