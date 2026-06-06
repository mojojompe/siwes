import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { User } from "@/models/User";

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    await connectToDatabase();
    
    // Check if another user already has this email (optional, but good practice)
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser._id.toString() !== (session.user as any).id) {
      return NextResponse.json({ error: "Email is already in use by another account" }, { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(
      (session.user as any).id,
      { email },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, email: updatedUser.email });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update email", details: error.message }, { status: 500 });
  }
}
