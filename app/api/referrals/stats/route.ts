import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { getReferralStats } from "@/lib/razorpay-service"

export async function GET(request: NextRequest) {
  try {
    // Authenticate the user
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Retrieve referral stats for the authenticated user
    const stats = await getReferralStats(user.id)

    return NextResponse.json({
      success: true,
      stats,
    })
  } catch (error) {
    console.error("Referral stats error:", error)
    return NextResponse.json({ error: "Failed to get referral statistics" }, { status: 500 })
  }
}
