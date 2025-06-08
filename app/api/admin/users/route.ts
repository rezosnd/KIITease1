import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getAuthUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()

    // Get users with referral count
    const users = await db
      .collection("users")
      .aggregate([
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
                  cond: { $eq: ["$$this.status", "completed"] },
                },
              },
            },
          },
        },
        {
          $project: {
            passwordHash: 0,
            resetPasswordToken: 0,
            resetPasswordExpiry: 0,
          },
        },
        {
          $sort: { createdAt: -1 },
        },
      ])
      .toArray()

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Admin users fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
