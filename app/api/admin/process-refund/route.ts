import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getAuthUser, toObjectId } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const db = await getDatabase()

    // Update user refund status
    const result = await db.collection("users").updateOne(
      { _id: toObjectId(userId), refundEligible: true, refundStatus: "eligible" },
      {
        $set: {
          refundStatus: "issued",
          refundProcessedAt: new Date(),
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found or not eligible for refund" }, { status: 404 })
    }

    // Log the refund processing
    await db.collection("audit_logs").insertOne({
      userId: toObjectId(user.id),
      action: "refund_processed",
      details: {
        processedUserId: userId,
        processedBy: user.name,
      },
      createdAt: new Date(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Refund processing error:", error)
    return NextResponse.json({ error: "Failed to process refund" }, { status: 500 })
  }
}
