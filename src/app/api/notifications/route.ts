import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { Notification } from "@/models/Notification";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const notifications = await Notification.find({ userId: (session.user as any).id })
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json({ notifications });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    await connectToDatabase();

    if (body.action === "markRead") {
      const { notificationId } = body;
      const updated = await Notification.findOneAndUpdate(
        { _id: notificationId, userId: (session.user as any).id },
        { isRead: true },
        { new: true }
      );
      return NextResponse.json({ success: true, notification: updated });
    }

    if (body.action === "markAllRead") {
      await Notification.updateMany(
        { userId: (session.user as any).id, isRead: false },
        { isRead: true }
      );
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    await connectToDatabase();

    const notification = await Notification.create({
      userId: (session.user as any).id,
      title: body.title,
      message: body.message,
      type: body.type || "system",
      relatedId: body.relatedId,
      actionLink: body.actionLink
    });

    return NextResponse.json({ success: true, notification });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
