import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { verifyAuth } from "@/lib/auth"
import { sendEmail } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { ticketId, message, userId } = await request.json()
    const db = await getDatabase()

    // Create message object
    const messageObj = {
      id: new ObjectId(),
      content: message,
      sender: "user",
      timestamp: new Date(),
      userId: new ObjectId(userId),
    }

    // Update ticket with new message
    await db.collection("support_tickets").updateOne(
      { _id: new ObjectId(ticketId) },
      {
        $push: { messages: messageObj },
        $set: { updatedAt: new Date(), status: "awaiting_response" },
      }
    )

    // Check if admin is available for premium users
    let adminAvailable = false
    let adminName = null
    let autoResponse = null

    if (user.role === "paid") {
      // For premium users, try to assign an admin immediately
      const availableAdmin = await db.collection("users").findOne({
        role: "admin",
        isOnline: true,
      })

      if (availableAdmin) {
        adminAvailable = true
        adminName = availableAdmin.name

        // Assign admin to ticket
        await db
          .collection("support_tickets")
          .updateOne({ _id: new ObjectId(ticketId) }, { $set: { assignedAdmin: availableAdmin._id } })

        // Send notification to admin
        await db.collection("notifications").insertOne({
          userId: availableAdmin._id,
          title: "New Premium Support Request",
          message: `New message from ${user.name}: ${message.substring(0, 100)}...`,
          type: "info",
          read: false,
          actionUrl: `/admin/support/${ticketId}`,
          createdAt: new Date(),
        })

        autoResponse = "An admin has been notified and will respond shortly."
      } else {
        autoResponse = "All admins are currently busy. You'll receive a response within 1 hour."
      }
    } else {
      // For free users, send email notification to admin
      autoResponse = "Thank you for your message. We'll respond within 24 hours."

      // Send email to admin team
      await sendEmail({
        to: "admin@kiitease.com",
        subject: `New Support Request - ${user.name}`,
        html: `
          <h3>New Support Request</h3>
          <p><strong>User:</strong> ${user.name} (${user.email})</p>
          <p><strong>Role:</strong> ${user.role}</p>
          <p><strong>Message:</strong> ${message}</p>
          <p><strong>Ticket ID:</strong> ${ticketId}</p>
          <p><a href="${process.env.NEXTAUTH_URL}/admin/support/${ticketId}">View Ticket</a></p>
        `,
      })
    }

    return NextResponse.json({
      success: true,
      adminAvailable,
      adminName,
      autoResponse,
    })
  } catch (error) {
    console.error("Support chat send error:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
