import { getDatabase } from "./mongodb"
import { ObjectId } from "mongodb"
import { sendEmail } from "./email-service"

export class LiveSupportService {
  private static instance: LiveSupportService
  private db: any

  private constructor() {}

  public static getInstance(): LiveSupportService {
    if (!LiveSupportService.instance) {
      LiveSupportService.instance = new LiveSupportService()
    }
    return LiveSupportService.instance
  }

  async initializeDatabase() {
    this.db = await getDatabase()
  }

  // 1. CREATE NEW SUPPORT TICKET
  async createTicket(userId: string, userRole: string) {
    const ticket = {
      userId: new ObjectId(userId),
      status: "open",
      priority: userRole === "paid" ? "high" : "normal",
      category: "general",
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: [],
      assignedAdmin: null,
      userRole,
      resolved: false,
      rating: null,
      tags: [],
    }

    const result = await this.db.collection("support_tickets").insertOne(ticket)

    // Create chat session
    await this.db.collection("chat_sessions").insertOne({
      ticketId: result.insertedId,
      userId: new ObjectId(userId),
      adminId: null,
      isActive: true,
      startTime: new Date(),
      endTime: null,
      messageCount: 0,
      lastActivity: new Date(),
      connectionStatus: "connected",
    })

    // If premium user, try to assign admin immediately
    if (userRole === "paid") {
      await this.assignAdminToTicket(result.insertedId.toString())
    }

    return result.insertedId.toString()
  }

  // 2. ASSIGN ADMIN TO PREMIUM TICKET
  async assignAdminToTicket(ticketId: string) {
    // Find available admin with lowest active tickets
    const availableAdmin = await this.db.collection("admin_availability").findOne({
      isOnline: true,
      status: "available",
      $expr: { $lt: ["$activeTickets", "$maxTickets"] },
    })

    if (availableAdmin) {
      // Assign admin to ticket
      await this.db.collection("support_tickets").updateOne(
        { _id: new ObjectId(ticketId) },
        {
          $set: {
            assignedAdmin: availableAdmin.adminId,
            status: "in_progress",
            updatedAt: new Date(),
          },
        },
      )

      // Update admin availability
      await this.db.collection("admin_availability").updateOne(
        { adminId: availableAdmin.adminId },
        {
          $inc: { activeTickets: 1 },
          $set: { lastSeen: new Date() },
        },
      )

      // Update chat session
      await this.db.collection("chat_sessions").updateOne(
        { ticketId: new ObjectId(ticketId) },
        {
          $set: {
            adminId: availableAdmin.adminId,
            lastActivity: new Date(),
          },
        },
      )

      // Notify admin
      await this.db.collection("notifications").insertOne({
        userId: availableAdmin.adminId,
        title: "New Premium Support Request",
        message: "You have been assigned a new premium support ticket",
        type: "info",
        read: false,
        actionUrl: `/admin/support/${ticketId}`,
        createdAt: new Date(),
      })

      return availableAdmin.adminId
    }

    return null
  }

  // 3. ADD MESSAGE TO TICKET
  async addMessage(ticketId: string, content: string, sender: "user" | "admin", senderId: string) {
    const message = {
      id: new ObjectId(),
      content,
      sender,
      timestamp: new Date(),
      userId: sender === "user" ? new ObjectId(senderId) : null,
      adminId: sender === "admin" ? new ObjectId(senderId) : null,
      status: "sent",
    }

    // Add message to ticket
    await this.db.collection("support_tickets").updateOne(
      { _id: new ObjectId(ticketId) },
      {
        $push: { messages: message },
        $set: {
          updatedAt: new Date(),
          status: sender === "user" ? "awaiting_response" : "in_progress",
        },
      },
    )

    // Update chat session
    await this.db.collection("chat_sessions").updateOne(
      { ticketId: new ObjectId(ticketId) },
      {
        $inc: { messageCount: 1 },
        $set: { lastActivity: new Date() },
      },
    )

    // If admin message, notify user
    if (sender === "admin") {
      const ticket = await this.db.collection("support_tickets").findOne({ _id: new ObjectId(ticketId) })
      const user = await this.db.collection("users").findOne({ _id: ticket.userId })

      if (user) {
        // Send email notification
        await sendEmail({
          to: user.email,
          subject: "New Response from KIITease Support",
          html: `
            <h3>New Response from Support</h3>
            <p>Hello ${user.name},</p>
            <p>You have received a new response for your support ticket:</p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p><strong>Message:</strong> ${content}</p>
            </div>
            <p><a href="${process.env.NEXTAUTH_URL}/dashboard?tab=support">View Full Conversation</a></p>
            <p>Best regards,<br>KIITease Support Team</p>
          `,
        })

        // Create in-app notification
        await this.db.collection("notifications").insertOne({
          userId: user._id,
          title: "New Support Response",
          message: `You have a new response from support: ${content.substring(0, 50)}...`,
          type: "info",
          read: false,
          actionUrl: `/dashboard?tab=support&ticket=${ticketId}`,
          createdAt: new Date(),
        })
      }
    }

    return message.id
  }

  // 4. RESOLVE TICKET
  async resolveTicket(ticketId: string, adminId: string) {
    // Update ticket status
    await this.db.collection("support_tickets").updateOne(
      { _id: new ObjectId(ticketId) },
      {
        $set: {
          status: "resolved",
          resolved: true,
          updatedAt: new Date(),
        },
      },
    )

    // End chat session
    await this.db.collection("chat_sessions").updateOne(
      { ticketId: new ObjectId(ticketId) },
      {
        $set: {
          isActive: false,
          endTime: new Date(),
          connectionStatus: "disconnected",
        },
      },
    )

    // Update admin availability
    await this.db.collection("admin_availability").updateOne(
      { adminId: new ObjectId(adminId) },
      {
        $inc: { activeTickets: -1 },
        $set: { lastSeen: new Date() },
      },
    )

    // Get ticket and user info
    const ticket = await this.db.collection("support_tickets").findOne({ _id: new ObjectId(ticketId) })
    const user = await this.db.collection("users").findOne({ _id: ticket.userId })

    if (user) {
      // Send resolution email
      await sendEmail({
        to: user.email,
        subject: "Your Support Ticket Has Been Resolved",
        html: `
          <h3>Ticket Resolved</h3>
          <p>Hello ${user.name},</p>
          <p>Your support ticket has been resolved successfully!</p>
          <p><strong>Ticket ID:</strong> ${ticketId}</p>
          <p><strong>Resolution Time:</strong> ${new Date().toLocaleString()}</p>
          <p>We hope we were able to help you. If you have any feedback, please let us know!</p>
          <p><a href="${process.env.NEXTAUTH_URL}/dashboard?tab=support&feedback=${ticketId}">Rate Our Support</a></p>
          <p>Best regards,<br>KIITease Support Team</p>
        `,
      })
    }

    // Record analytics
    await this.recordSupportAnalytics(ticketId, adminId)
  }

  // 5. RECORD ANALYTICS
  async recordSupportAnalytics(ticketId: string, adminId: string) {
    const ticket = await this.db.collection("support_tickets").findOne({ _id: new ObjectId(ticketId) })
    const session = await this.db.collection("chat_sessions").findOne({ ticketId: new ObjectId(ticketId) })

    if (ticket && session) {
      const responseTime = session.endTime.getTime() - session.startTime.getTime()
      const responseTimeMinutes = Math.floor(responseTime / (1000 * 60))

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Update daily analytics
      await this.db.collection("support_analytics").updateOne(
        { date: today },
        {
          $inc: {
            totalTickets: 1,
            resolvedTickets: 1,
            [`${ticket.userRole}Tickets`]: 1,
          },
          $push: {
            adminPerformance: {
              adminId: new ObjectId(adminId),
              ticketId: new ObjectId(ticketId),
              responseTime: responseTimeMinutes,
              userRole: ticket.userRole,
            },
          },
          $set: { lastUpdated: new Date() },
        },
        { upsert: true },
      )
    }
  }

  // 6. GET REAL-TIME UPDATES
  async getTicketUpdates(ticketId: string, lastMessageId?: string) {
    const ticket = await this.db.collection("support_tickets").findOne({ _id: new ObjectId(ticketId) })

    if (!ticket) return null

    let newMessages = ticket.messages
    if (lastMessageId) {
      const lastIndex = ticket.messages.findIndex((msg: any) => msg.id.toString() === lastMessageId)
      newMessages = ticket.messages.slice(lastIndex + 1)
    }

    return {
      ticket,
      newMessages,
      hasUpdates: newMessages.length > 0,
    }
  }
}

export const liveSupport = LiveSupportService.getInstance()
