import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { verifyPaymentSignature, processPaymentSuccess } from "@/lib/razorpay-service"
import { sendPaymentSuccessEmail } from "@/lib/email-service"
import { createNotification, NOTIFICATION_TEMPLATES } from "@/lib/notifications"

export async function POST(request: NextRequest) {
  try {
    // Authenticate the user
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse verification data from request body
    const verification = await request.json()
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = verification

    // Check for required payment verification fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing payment verification data" }, { status: 400 })
    }

    // Verify payment signature
    const isValidSignature = verifyPaymentSignature(verification)
    if (!isValidSignature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 })
    }

    // Process payment success, handle referrals, upgrade user, etc.
    const result = await processPaymentSuccess(verification, user.id)

    // Send payment success email
    await sendPaymentSuccessEmail({ name: user.name, email: user.email }, result.order.amount)

    // Create a notification for the user
    await createNotification({
      userId: user.id,
      ...NOTIFICATION_TEMPLATES.PAYMENT_SUCCESS(result.order.amount),
    })

    return NextResponse.json({
      success: true,
      message: "Payment verified and processed successfully",
      referralProcessed: !!result.order.referralCode,
    })
  } catch (error) {
    console.error("Payment verification error:", error)
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 })
  }
}
