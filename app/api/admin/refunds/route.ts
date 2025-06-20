import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getAuthUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Authenticate admin user
    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()

    // Aggregate refund eligible users with referral info
    const refunds = await db
      .collection("users")
      .aggregate([
        {
          $match: {
            refundEligible: true,
          },
        },
        {
          $lookup: {
            from: "referrals",
            localField: "_id",
            foreignField: "referrerId",
            as: "referrals",
          },
        },
        {
          $addFields: {
            referralCount: {
              $size: {
                $filter: {
                  input: "$referrals",
                  as: "ref",
                  cond: { $eq: ["$$ref.status", "completed"] },
                },
              },
            },
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            email: 1,
            paymentAmount: 1,
            refundStatus: 1,
            referralCount: 1,
            updatedAt: 1,
          },
        },
        {
          $sort: { updatedAt: -1 },
        },
      ])
      .toArray()

    return NextResponse.json({ refunds })
  } catch (error) {
    console.error("Admin refunds fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
