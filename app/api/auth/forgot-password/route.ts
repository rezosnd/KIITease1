import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { sendPasswordResetEmail } from "@/lib/email"
import { getClientIP, logSecurityEvent } from "@/lib/security"
import { logger } from "@/lib/logger"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  let email: string
  const ip = getClientIP(request)

  try {
    const body = await request.json()
    email = body.email?.toLowerCase().trim()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      await logSecurityEvent({
        type: "suspicious_activity",
        ip,
        details: { error: "Invalid email format in forgot password" },
      })
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
    }

    const db = await getDatabase()

    // Check if user exists
    const user = await db.collection("users").findOne({ email })

    // Always return success to prevent email enumeration attacks
    // But only send email if user actually exists
    if (user) {
      // Generate secure reset token
      const resetToken = crypto.randomBytes(32).toString("hex")
      const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex")
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      // Store reset token in database
      await db.collection("users").updateOne(
        { _id: user._id },
        {
          $set: {
            resetPasswordToken: resetTokenHash,
            resetPasswordExpiry: resetTokenExpiry,
            updatedAt: new Date(),
          },
        },
      )

      // Create reset link
      const resetLink = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`

      // Send password reset email
      await sendPasswordResetEmail({ name: user.name, email: user.email }, resetLink)

      // Log the password reset request
      await db.collection("audit_logs").insertOne({
        userId: user._id,
        action: "password_reset_requested",
        ip,
        userAgent: request.headers.get("user-agent"),
        details: { email },
        createdAt: new Date(),
      })

      await logSecurityEvent({
        type: "login_attempt",
        userId: user._id.toString(),
        ip,
        details: { action: "password_reset_requested" },
      })

      logger.info("Password reset email sent", { userId: user._id.toString(), email }, { ip })
    } else {
      // Log attempt for non-existent user
      await logSecurityEvent({
        type: "suspicious_activity",
        ip,
        details: { error: "Password reset attempt for non-existent user", email },
      })

      logger.warn("Password reset attempt for non-existent user", { email }, { ip })
    }

    // Always return success response (security best practice)
    return NextResponse.json({
      success: true,
      message: "If an account with that email exists, we've sent password reset instructions.",
    })
  } catch (error) {
    logger.error("Forgot password error", error, { ip })

    await logSecurityEvent({
      type: "suspicious_activity",
      ip,
      details: { error: "Forgot password system error" },
    })

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
