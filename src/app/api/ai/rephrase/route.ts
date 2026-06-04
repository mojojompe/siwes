import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { text } = await req.json();
    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AI API Key is not configured." }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are an AI assistant helping a university student rewrite their SIWES (industrial training) daily log.
Please rephrase the following text to sound professional, clear, and well-structured, suitable for an official logbook. Do not add any new facts, just improve the grammar and tone. Return ONLY the rewritten text, nothing else.

Original text:
${text}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rephrased = response.text().trim();

    return NextResponse.json({ rephrased });
  } catch (error: any) {
    console.error("AI Rephrase Error:", error);
    return NextResponse.json({ error: "Failed to rephrase text." }, { status: 500 });
  }
}
