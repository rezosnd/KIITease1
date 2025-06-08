import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getAuthUser, toObjectId } from "@/lib/auth"
import { sendReferralMilestoneEmail } from "@/lib/email"

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()

    // Count completed referrals for this user
    const referralCount = await db.collection("referrals").countDocuments({
      referrerId: toObjectId(user.id),
      status: "completed",
    })

    // Fetch user data
    const userData = await db.collection("users").findOne({ _id: toObjectId(user.id) })

    // If user reaches milestone and is not already eligible
    if (referralCount >= 20 && userData && !userData.refundEligible) {
      // Mark user as refund eligible
      await db.collection("users").updateOne(
        { _id: toObjectId(user.id) },
        {
          $set: {
            refundEligible: true,
            refundStatus: "eligible",
            updatedAt: new Date(),
          },
        },
      )

      // Send milestone email
      await sendReferralMilestoneEmail({ name: user.name, email: user.email }, referralCount)

      // Log in audit_logs
      await db.collection("audit_logs").insertOne({
        userId: toObjectId(user.id),
        action: "referral_milestone_reached",
        details: {
          referralCount,
          refundEligible: true,
        },
        createdAt: new Date(),
      })

      return NextResponse.json({
        success: true,
        referralCount,
        milestoneReached: true,
        refundEligible: true,
      })
    }

    // Otherwise, just return the referral status
    return NextResponse.json({
      success: true,
      referralCount,
      milestoneReached: referralCount >= 20,
      refundEligible: userData?.refundEligible || false,
    })
  } catch (error) {
    console.error("Referral milestone check error:", error)
    return NextResponse.json({ error: "Failed to check referral milestone" }, { status: 500 })
  }
}
