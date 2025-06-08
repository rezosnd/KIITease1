import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { markNotificationAsRead } from "@/lib/notifications"
import { logger } from "@/lib/logger"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  let user
  try {
    user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Mark the notification as read for this user
    await markNotificationAsRead(params.id, user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error("Failed to mark notification as read", error, { userId: user?.id })
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 })
  }
}
