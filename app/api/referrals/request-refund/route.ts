import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { processAutoRefund } from "@/lib/razorpay-service"

export async function POST(request: NextRequest) {
  try {
    // Authenticate the user
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Process the automatic refund for the user
    await processAutoRefund(user.id)

    return NextResponse.json({
      success: true,
      message: "Refund request processed successfully",
    })
  } catch (error) {
    console.error("Refund request error:", error)
    return NextResponse.json({ error: error.message || "Failed to process refund request" }, { status: 500 })
  }
}
