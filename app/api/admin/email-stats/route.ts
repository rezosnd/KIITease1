import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getAuthUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)

    // Enforce real admin authentication
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()

    // Get email statistics in parallel
    const [totalEmails, sentEmails, failedEmails, recentEmails, announcements] = await Promise.all([
      db.collection("email_logs").countDocuments(),
      db.collection("email_logs").countDocuments({ status: "sent" }),
      db.collection("email_logs").countDocuments({ status: "failed" }),
      db.collection("email_logs").find({}, { projection: { _id: 0, subject: 1, to: 1, status: 1, sentAt: 1, error: 1 } }).sort({ sentAt: -1 }).limit(10).toArray(),
      db.collection("announcements").find({}, { projection: { _id: 0, message: 1, createdAt: 1 } }).sort({ createdAt: -1 }).limit(5).toArray(),
    ])

    // Email stats by day (last 7 days)
    const now = new Date()
    const sevenDaysAgo = new Date(now)
    sevenDaysAgo.setDate(now.getDate() - 7)
    sevenDaysAgo.setHours(0, 0, 0, 0)

    const dailyStats = await db
      .collection("email_logs")
      .aggregate([
        {
          $match: {
            sentAt: { $gte: sevenDaysAgo },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$sentAt" },
            },
            sent: {
              $sum: { $cond: [{ $eq: ["$status", "sent"] }, 1, 0] },
            },
            failed: {
              $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] },
            },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .toArray()

    return NextResponse.json({
      success: true,
      stats: {
        total: totalEmails,
        sent: sentEmails,
        failed: failedEmails,
        successRate: totalEmails > 0 ? ((sentEmails / totalEmails) * 100).toFixed(1) : "0",
      },
      recentEmails,
      announcements,
      dailyStats,
    })
  } catch (error) {
    console.error("Email stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
