import { type NextRequest, NextResponse } from "next/server"
import { liveSupport } from "@/lib/live-support-service"
import { verifyAuth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const ticketId = searchParams.get("ticketId")
    const lastMessageId = searchParams.get("lastMessageId")

    if (!ticketId) {
      return NextResponse.json({ error: "Ticket ID required" }, { status: 400 })
    }

    await liveSupport.initializeDatabase()
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
