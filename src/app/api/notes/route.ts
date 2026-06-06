import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { Note } from "@/models/Note";
import { rateLimit } from "@/lib/rateLimit";
import { sanitize } from "@/lib/sanitize";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const userId = (session.user as any).id;

    // Rate limit: 100 requests per minute
    const rl = await rateLimit(`notes_get_${userId}`, 100, 60000);
    if (!rl.success) return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });

    const notes = await Note.find({ userId }).sort({ updatedAt: -1 });
    
    return NextResponse.json({ notes });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = (session.user as any).id;

    // Rate limit: 50 requests per minute
    const rl = await rateLimit(`notes_post_${userId}`, 50, 60000);
    if (!rl.success) return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });

    const body = sanitize(await req.json());
    const { title, content } = body;

    if (!title || !content) return NextResponse.json({ error: "Title and content required" }, { status: 400 });

    await connectToDatabase();
    const newNote = await Note.create({ userId, title, content });

    return NextResponse.json({ note: newNote }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
