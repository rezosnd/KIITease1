import { type NextRequest, NextResponse } from "next/server"
import { liveSupport } from "@/lib/live-support-service"
import { verifyAuth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const ticketId = searchParams.get("ticketId")
    const lastMessageId = searchParams.get("lastMessageId")

    if (!ticketId) {
      return NextResponse.json({ error: "Ticket ID required" }, { status: 400 })
    }

    // Initialize DB if needed
    await liveSupport.initializeDatabase()
    // Get ticket updates since lastMessageId (if present)
    const updates = await liveSupport.getTicketUpdates(ticketId, lastMessageId || undefined)

    return NextResponse.json({
      success: true,
      ...updates,
    })
  } catch (error) {
    console.error("Realtime updates error:", error)
    return NextResponse.json({ error: "Failed to get updates" }, { status: 500 })
  }
}
