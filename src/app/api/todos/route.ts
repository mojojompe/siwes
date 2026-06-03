import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { Todo } from "@/models/Todo";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const userId = (session.user as any).id;
    const todos = await Todo.find({ userId }).sort({ createdAt: -1 });
    
    return NextResponse.json({ todos });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = (session.user as any).id;
    const body = await req.json();
    const { title, date, reminderTime } = body;

    if (!title) {
      return NextResponse.json({ error: "Missing title" }, { status: 400 });
    }

    await connectToDatabase();

    const newTodo = await Todo.create({
      userId,
      title,
      date,
      reminderTime,
    });

    return NextResponse.json({ todo: newTodo }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
