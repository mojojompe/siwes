import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { Chat } from "@/models/Chat";
import { rateLimit } from "@/lib/rateLimit";
import { sanitize } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(session.user as any).isPro) {
      return NextResponse.json({ error: "Premium feature. Upgrade to Pro required." }, { status: 403 });
    }

    await connectToDatabase();
    
    // Looser Rate limit: 200 requests per minute
    const rl = await rateLimit(`chat_get_${(session.user as any).id}`, 200, 60000);
    if (!rl.success) return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });

    const chats = await Chat.find({ userId: (session.user as any).id }).sort({ updatedAt: -1 });

    return NextResponse.json({ chats });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch chats", details: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    if (!(session.user as any).isPro) {
      return NextResponse.json({ error: "Premium feature. Upgrade to Pro required." }, { status: 403 });
    }

    // Looser Rate limit: 200 requests per minute
    const rl = await rateLimit(`chat_post_${(session.user as any).id}`, 200, 60000);
    if (!rl.success) return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });

    const body = sanitize(await req.json());
    const { title } = body;

    await connectToDatabase();
    
    const newChat = await Chat.create({ 
      userId: (session.user as any).id, 
      title: title || "New Chat",
      messages: [] 
    });

    return NextResponse.json({ chat: newChat });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to create chat", details: err.message }, { status: 500 });
  }
}
