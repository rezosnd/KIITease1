import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getClientIP, logSecurityEvent } from "@/lib/security"
import { logger } from "@/lib/logger"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  const ip = getClientIP(request)

  try {
    const { token } = await request.json()

    if (!token) {
      await logSecurityEvent({
        type: "suspicious_activity",
        ip,
        details: { error: "Missing reset token" },
      })
      return NextResponse.json({ error: "Invalid token" }, { status: 400 })
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
        details: { error: "Invalid or expired reset token" },
      })
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 })
    }

    // Log token validation
    await db.collection("audit_logs").insertOne({
      userId: user._id,
      action: "password_reset_token_validated",
      ip,
      userAgent: request.headers.get("user-agent"),
      details: { email: user.email },
      createdAt: new Date(),
    })

    logger.info("Reset token validated", { userId: user._id.toString() }, { ip })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error("Token validation error", error, { ip })

    await logSecurityEvent({
      type: "suspicious_activity",
      ip,
      details: { error: "Token validation system error" },
    })

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
