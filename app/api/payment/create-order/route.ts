import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { createRazorpayOrder } from "@/lib/razorpay-service"
import { validatePaymentAmount } from "@/lib/validation"

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse request body
    const { amount, referralCode } = await request.json()

    // Validate amount
    if (!validatePaymentAmount(amount)) {
      return NextResponse.json({ error: "Invalid payment amount" }, { status: 400 })
    }

    // Check if user is already paid/premium
    if (user.role === "paid" || user.isPremium) {
      return NextResponse.json({ error: "User already has premium access" }, { status: 400 })
    }

    // Create Razorpay order with optional referral code
    const order = await createRazorpayOrder(amount, user.id, referralCode)

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      },
      referralApplied: !!referralCode,
    })
  } catch (error) {
    console.error("Payment order creation error:", error)
    return NextResponse.json({ error: "Failed to create payment order" }, { status: 500 })
  }
}
