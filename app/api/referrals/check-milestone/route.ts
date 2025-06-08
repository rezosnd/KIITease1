import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getAuthUser, toObjectId } from "@/lib/auth"
import { sendReferralMilestoneEmail } from "@/lib/email"

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()

    // Count completed referrals
    const referralCount = await db.collection("referrals").countDocuments({
      referrerId: toObjectId(user.id),
      status: "completed",
    })

    // Check if user has reached 20 referrals and is not already eligible
    const userData = await db.collection("users").findOne({ _id: toObjectId(user.id) })

    if (referralCount >= 20 && userData && !userData.refundEligible) {
      // Update user to be refund eligible
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

      // Log the milestone in audit logs
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
