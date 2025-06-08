import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { verifyAuth } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    // Authenticate the user
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId } = await request.json()
    const db = await getDatabase()

    // Create new support ticket
    const ticket = {
      userId: new ObjectId(userId),
      status: "open",
      priority: user.role === "paid" ? "high" : "normal",
      category: "general",
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: [],
      assignedAdmin: null,
      userRole: user.role,
    }

    const result = await db.collection("support_tickets").insertOne(ticket)

    // Log the support request
    await db.collection("audit_logs").insertOne({
      userId: new ObjectId(userId),
      action: "support_chat_initiated",
      details: { ticketId: result.insertedId, userRole: user.role },
      timestamp: new Date(),
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
    })

    return NextResponse.json({
      success: true,
      ticketId: result.insertedId.toString(),
      priority: ticket.priority,
    })
  } catch (error) {
    console.error("Support chat init error:", error)
    return NextResponse.json({ error: "Failed to initialize chat" }, { status: 500 })
  }
}
