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
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: "You are a helpful, friendly, and concise AI assistant for a university student undergoing their SIWES (industrial training). Help them brainstorm daily logs, organize tasks, explain concepts, and provide general productivity advice. Keep responses clear and well-structured, using markdown formatting when helpful."
    });

    let finalPrompt = text;

    // Context-Aware Actions
    if (action === "summarize-logs") {
      const logs = await Log.find({ userId: (session.user as any).id }).sort({ date: -1 }).limit(10);
      const logData = logs.map(l => `Date: ${new Date(l.date).toDateString()} - ${l.description}`).join('\n');
      finalPrompt = `Summarize my recent logs:\n${logData}`;
    } else if (action === "generate-report" || action === "generate-presentation") {
      const logs = await Log.find({ userId: (session.user as any).id }).sort({ date: 1 });
      const logData = logs.map(l => `Date: ${new Date(l.date).toDateString()} - ${l.description}`).join('\n');
      
      if (action === "generate-report") {
        finalPrompt = `Generate a comprehensive SIWES Report Draft based on the following user logs:\n\n${logData}\n\nUse formal academic writing style, clear and grammatically correct English. Avoid unnecessary repetition, informal expressions and unsupported claims. Use technical terms correctly.\n\nStrictly follow this structure for the report:\n1.0 INTRODUCTION\nThe Students Industrial Work Experience Scheme (SIWES) is an integral component of the academic programme of the Department of Computer Science... (expand based on logs)\n\n2.0 GENERAL REQUIREMENTS\nReflect actual experiences and activities from the logs.\n\n3.0 STRUCTURE OF THE SIWES REPORT\nPreliminary Pages: Title Page, Declaration, Certification, Dedication, Acknowledgement, Table of Contents, Abstract.\n\nMain Body:\nChapter One: Introduction\n1.1 Background to SIWES\n1.2 Objectives of SIWES\n1.3 Scope of the Training\n1.4 Duration of the Training\n1.5 Significance of the Training\n\nChapter Two: Profile of the Host Organisation\n2.1 History and Background\n2.2 Vision and Mission\n2.3 Organisational Structure\n2.4 Department or Unit of Attachment\n2.5 Services and Activities\n\nChapter Three: Activities and Experience During the Training (Core section, use logs extensively)\n3.1 Orientation and Induction\n3.2 Training Activities Undertaken\n3.3 Technical Skills Acquired\n3.4 Software, Tools and Technologies Used\n3.5 Projects and Major Tasks Undertaken (include problem, methodology, tools, procedures, results, challenges, solutions)\n3.6 Professional and Workplace Skills Acquired\n\nChapter Four: Challenges, Observations and Recommendations\n4.1 Challenges Encountered\n4.2 Measures Adopted\n4.3 General Observations\n4.4 Relevance of the Training\n4.5 Recommendations to Host Organisation\n4.6 Recommendations to University\n4.7 Recommendations to Future Students\n\nChapter Five: Summary and Conclusion\n5.1 Summary\n5.2 Knowledge and Skills\n5.3 Conclusion\n5.4 Suggestions\n\nEnd Matter:\nReferences\nAppendices (Logbook extracts, code, diagrams etc.)\n\nPlease expand and fill in the contents for Chapter 3, 4, 5 particularly, using the information extracted from the provided logs. Structure it properly using markdown headings.`;
      } else if (action === "generate-presentation") {
        finalPrompt = `Generate a SIWES Presentation Draft based on the following user logs:\n\n${logData}\n\nPlease write out what each slide should contain. The presentation should focus on the organisation of attachment, major activities undertaken, technical skills acquired, significant projects or tasks completed, challenges encountered, solutions implemented and lessons learned. Ensure the content is formal and professional, suitable for a university defense presentation. Outline the slides sequentially (e.g., Slide 1: Title, Slide 2: Introduction, etc.) with bullet points for the talking points on each slide.`;
      }
    }

    // Save User Message
    chat.messages.push({ role: "user", content: finalPrompt });
    
    const history = chat.messages.slice(0, -1).map((msg: any) => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    }));

    const chatSession = model.startChat({
      history,
    });

    const result = await chatSession.sendMessage(finalPrompt);
    const responseText = result.response.text();

    // Save Model Message
    chat.messages.push({ role: "model", content: responseText });

    // Generate a title if this is the first message exchange (history was empty)
    if (history.length === 0) {
      try {
        const titlePrompt = `Generate a very short 3-5 word title summarizing this user request: "${finalPrompt}". Respond ONLY with the title, no quotes, no extra text.`;
        const titleResult = await model.generateContent(titlePrompt);
        const generatedTitle = titleResult.response.text().trim().replace(/['"]+/g, '');
        if (generatedTitle) {
          chat.title = generatedTitle;
        }
      } catch (titleErr) {
        console.error("Failed to generate title:", titleErr);
      }
    }

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
