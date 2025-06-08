import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { getUserNotifications } from "@/lib/notifications"
import { logger } from "@/lib/logger"

export async function GET(request: NextRequest) {
  let user
  try {
    user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch all notifications for the authenticated user
    const notifications = await getUserNotifications(user.id)

    return NextResponse.json({ notifications })
  } catch (error) {
    logger.error("Failed to fetch notifications", error, { userId: user?.id })
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}
