import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { User } from "@/models/User";
import webpush from "web-push";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || "mailto:test@example.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
  process.env.VAPID_PRIVATE_KEY as string
);

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const subscription = await req.json();
    await connectToDatabase();

    const userId = (session.user as any).id;
    
    // Check if subscription already exists to avoid duplicates
    const user = await User.findById(userId);
    const exists = user.pushSubscriptions.some((sub: any) => sub.endpoint === subscription.endpoint);
    
    if (!exists) {
      await User.findByIdAndUpdate(userId, {
        $push: { pushSubscriptions: subscription }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
