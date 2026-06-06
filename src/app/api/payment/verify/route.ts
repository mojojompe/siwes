import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { User } from "@/models/User";
import { rateLimit } from "@/lib/rateLimit";
import { sanitize } from "@/lib/sanitize";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Rate limit: 10 requests per minute
    const rl = await rateLimit(`payment_verify_${userId}`, 10, 60000);
    if (!rl.success) return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });

    const body = sanitize(await req.json());
    const { reference } = body;
    if (!reference) {
      return NextResponse.json({ error: "Missing reference" }, { status: 400 });
    }

    const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || "sk_test_placeholder";
    
    // Verify transaction with Paystack API
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
      },
    });

    const data = await response.json();

    if (data.status && data.data.status === "success" && data.data.amount >= 150000) {
      // Payment verified!
      await connectToDatabase();
      
      const updatedUser = await User.findByIdAndUpdate(userId, { isPro: true }, { new: true });
      if (!updatedUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json({ success: true, message: "Upgraded to Pro!" });
    } else {
      return NextResponse.json({ 
        error: data.message || "Verification failed or amount invalid",
        paystackResponse: data
      }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
