import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { sendAnnouncementToAll } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)

    // Check if user is admin
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, message, targetAudience } = await request.json()

    if (!title || !message) {
      return NextResponse.json({ error: "Title and message are required" }, { status: 400 })
    }

    // Send announcement
    const result = await sendAnnouncementToAll({
      title,
      message,
      targetAudience: targetAudience || "all",
    })

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Announcement sent successfully",
        stats: {
          totalRecipients: result.totalRecipients,
          sent: result.sent,
          failed: result.failed,
        },
      })
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error("Send announcement error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
