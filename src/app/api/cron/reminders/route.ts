import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { User } from "@/models/User";
import { Log } from "@/models/Log";
import webpush from "web-push";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || "mailto:test@example.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
  process.env.VAPID_PRIVATE_KEY as string
);

export async function GET(req: Request) {
  try {
    // Vercel Cron sends an Authorization header. You should configure CRON_SECRET in Vercel.
    const authHeader = req.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // Check for users who haven't filled their logbook today
    const users = await User.find({});
    const todayStr = new Date().toISOString().split("T")[0];

    const pushPromises = [];

    for (const user of users) {
      if (!user.pushSubscriptions || user.pushSubscriptions.length === 0) continue;

      const logToday = await Log.findOne({ userId: user._id, date: todayStr });
      
      if (!logToday) {
        // Send push notification
        const payload = JSON.stringify({
          title: "Daily Log Reminder",
          body: "You haven't filled your SIWES logbook today! Don't lose your streak.",
          url: "/home"
        });

        for (const sub of user.pushSubscriptions) {
          pushPromises.push(
            webpush.sendNotification(sub, payload).catch(err => {
              console.error("Failed to send push to subscription", err);
            })
          );
        }
      }
    }

    await Promise.all(pushPromises);

    return NextResponse.json({ success: true, pushesSent: pushPromises.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
