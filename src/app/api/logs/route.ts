import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { Log } from "@/models/Log";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const userId = (session.user as any).id;
    
    // Sort by date ascending
    const logs = await Log.find({ userId }).sort({ date: 1 });
    
    return NextResponse.json({ logs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const { date, description, tags, reminder } = body;

    if (!date || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const logDate = new Date(date);
    
    // Calculate Day of Week
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayOfWeek = days[logDate.getDay()];
    
    // Simple week calculation based on year
    const startOfYear = new Date(logDate.getFullYear(), 0, 1);
    const pastDaysOfYear = (logDate.getTime() - startOfYear.getTime()) / 86400000;
    const weekNumber = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);

    await connectToDatabase();

    const newLog = await Log.create({
      userId,
      date: logDate,
      dayOfWeek,
      description,
      weekNumber,
      tags: tags || [],
      reminder: reminder ? new Date(reminder) : undefined,
    });

    return NextResponse.json({ log: newLog }, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: "A log for this date already exists." }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
