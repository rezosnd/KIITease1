import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { hashPassword } from "@/lib/auth"
import { getClientIP, logSecurityEvent, validatePasswordStrength } from "@/lib/security"
import { logger } from "@/lib/logger"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  const ip = getClientIP(request)

  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      await logSecurityEvent({
        type: "suspicious_activity",
        ip,
        details: { error: "Missing token or password in reset request" },
      })
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        {
          error: "Password is too weak",
          feedback: passwordValidation.feedback,
        },
        { status: 400 },
      )
    }

    // Hash the token to compare with stored hash
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex")

    const db = await getDatabase()

    // Find user with valid reset token
    const user = await db.collection("users").findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpiry: { $gt: new Date() },
    })

    if (!user) {
      await logSecurityEvent({
        type: "suspicious_activity",
        ip,
        details: { error: "Invalid or expired reset token in password reset" },
      })
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 })
    }

    // Hash the new password (ensure await if hashPassword is async)
    const passwordHash = await hashPassword(password)

    // Update user password and clear reset token
    await db.collection("users").updateOne(
      { _id: user._id },
      {
        $set: {
          passwordHash,
          updatedAt: new Date(),
          loginAttempts: 0,
          accountLocked: false,
        },
        $unset: {
          resetPasswordToken: "",
          resetPasswordExpiry: "",
          lockedUntil: "",
        },
      }
    )

    // Log successful password reset
    await db.collection("audit_logs").insertOne({
      userId: user._id,
      action: "password_reset_completed",
      ip,
      userAgent: request.headers.get("user-agent"),
      details: { email: user.email },
      createdAt: new Date(),
    })

    await logSecurityEvent({
      type: "login_attempt",
      userId: user._id.toString(),
      ip,
      details: { action: "password_reset_completed" },
    })

    logger.info("Password reset completed", { userId: user._id.toString(), email: user.email }, { ip })

    return NextResponse.json({
      success: true,
      message: "Password has been reset successfully",
    })
  } catch (error) {
    logger.error("Password reset error", error, { ip })

    await logSecurityEvent({
      type: "suspicious_activity",
      ip,
      details: { error: "Password reset system error" },
    })

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
