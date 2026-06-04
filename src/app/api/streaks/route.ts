import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { Log } from "@/models/Log";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    
    // Fetch all logs for the user, sorted chronologically ascending
    const logs = await Log.find({ userId: (session.user as any).id }).sort({ date: 1 });

    if (logs.length === 0) {
      return NextResponse.json({ currentStreak: 0, longestStreak: 0, totalLogs: 0, recentDays: [] });
    }

    // Extract unique dates formatted as YYYY-MM-DD
    const loggedDates = Array.from(new Set(logs.map(log => {
      const d = new Date(log.date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }))).sort();

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;

    for (let i = 1; i < loggedDates.length; i++) {
      const d1 = new Date(loggedDates[i - 1]);
      const d2 = new Date(loggedDates[i]);
      const diffTime = Math.abs(d2.getTime() - d1.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    // Calculate current streak (must connect to today or yesterday)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const lastLogDateStr = loggedDates[loggedDates.length - 1];
    const lastLogDate = new Date(lastLogDateStr);
    lastLogDate.setHours(0, 0, 0, 0);

    if (lastLogDate.getTime() === today.getTime() || lastLogDate.getTime() === yesterday.getTime()) {
      // Current streak is active, count backwards
      let currentTemp = 1;
      for (let i = loggedDates.length - 1; i > 0; i--) {
        const d1 = new Date(loggedDates[i - 1]);
        const d2 = new Date(loggedDates[i]);
        const diffTime = Math.abs(d2.getTime() - d1.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          currentTemp++;
        } else {
          break;
        }
      }
      currentStreak = currentTemp;
    } else {
      currentStreak = 0;
    }

    // Prepare a list of the last 14 days and whether a log exists
    const recentDays = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      recentDays.push({
        date: dateStr,
        dayOfWeek: d.toLocaleDateString(undefined, { weekday: 'short' }),
        logged: loggedDates.includes(dateStr)
      });
    }

    return NextResponse.json({
      currentStreak,
      longestStreak,
      totalLogs: logs.length,
      recentDays
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
