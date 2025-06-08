import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { sendEmail } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    // Only admin can send announcements
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, message, targetAudience } = await request.json()
    if (!title || !message) {
      return NextResponse.json({ error: "Title and message are required" }, { status: 400 })
    }

    // Determine recipients based on audience
    const db = await getDatabase()
    let query: any = {}
    if (targetAudience && targetAudience !== "all") {
      // e.g. { role: "paid" } or custom logic
      query.role = targetAudience
    }
    // Only get users with valid email
    query.email = { $exists: true, $ne: "" }

    const recipients = await db
      .collection("users")
      .find(query, { projection: { email: 1, name: 1 } })
      .toArray()
    const emails = recipients.map((u: any) => u.email)

    // Send emails (in real use, batch or queue for large lists)
    let sent = 0
    let failed = 0
    for (const email of emails) {
      try {
        await sendEmail({
          to: email,
          subject: `[Announcement] ${title}`,
          body: message,
        })
        sent++
      } catch {
        failed++
      }
    }

    // Optionally, store announcement in DB
    await db.collection("announcements").insertOne({
      title,
      message,
      targetAudience: targetAudience || "all",
      createdAt: new Date(),
      createdBy: user._id,
      totalRecipients: emails.length,
      sent,
      failed,
    })

    return NextResponse.json({
      success: true,
      message: "Announcement sent successfully",
      stats: {
        totalRecipients: emails.length,
        sent,
        failed,
      },
    })
  } catch (error) {
    console.error("Send announcement error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
