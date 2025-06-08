import { getDatabase } from "@/lib/mongodb"
import { sendEmail } from "@/lib/email-service"
import { render } from "@react-email/render"
import OTPEmail from "@/emails/otp-email"
import { logger } from "@/lib/logger"

/**
 * Generate a 6-digit OTP as a string.
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Store a new OTP for an email and type, deleting any old ones.
 */
export async function storeOTP(email: string, otp: string, type: string): Promise<void> {
  const db = await getDatabase()

  await db.collection("otps").deleteMany({
    email: email.toLowerCase(),
    type,
  })

  await db.collection("otps").insertOne({
    email: email.toLowerCase(),
    otp,
    type,
    attempts: 0,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
  })
}

/**
 * Verify the OTP for given email and type.
 */
export async function verifyOTP(
  email: string,
  otp: string,
  type: string,
): Promise<{
  valid: boolean
  error?: string
}> {
  const db = await getDatabase()

  const otpRecord = await db.collection("otps").findOne({
    email: email.toLowerCase(),
    type,
    expiresAt: { $gt: new Date() },
  })

  if (!otpRecord) {
    return { valid: false, error: "OTP expired or not found" }
  }

  if (otpRecord.attempts >= 3) {
    return { valid: false, error: "Too many attempts. Please request a new OTP." }
  }

  // Increment attempts
  await db.collection("otps").updateOne({ _id: otpRecord._id }, { $inc: { attempts: 1 } })

  if (otpRecord.otp !== otp) {
    return { valid: false, error: "Invalid OTP" }
  }

  // OTP is valid, remove it
  await db.collection("otps").deleteOne({ _id: otpRecord._id })

  return { valid: true }
}

/**
 * Rate limit OTP requests per email (max 3 per minute).
 */
export async function checkOTPRateLimit(email: string): Promise<{
  allowed: boolean
  waitTime?: number
}> {
  const db = await getDatabase()
  const now = new Date()
  const oneMinuteAgo = new Date(now.getTime() - 60 * 1000)

  const recentOTPs = await db.collection("otps").countDocuments({
    email: email.toLowerCase(),
    createdAt: { $gte: oneMinuteAgo },
  })

  if (recentOTPs >= 3) {
    return { allowed: false, waitTime: 60 }
  }

  return { allowed: true }
}

/**
 * Send an OTP email using the OTPEmail React template.
 */
export async function sendOTPEmail(
  email: string,
  name: string,
  otp: string,
  type: "registration" | "login" | "password-reset",
): Promise<{ success: boolean; error?: string }> {
  try {
    const emailHtml = render(
      OTPEmail({
        name,
        otp,
        type,
      }),
    )

    const subject =
      type === "registration"
        ? "🎓 Complete Your KIITease Registration"
        : type === "login"
        ? "🔐 Your KIITease Login Code"
        : "🔒 Reset Your KIITease Password"

    const result = await sendEmail({
      to: email,
      subject,
      html: emailHtml,
    })

    // Log email for tracking
    const db = await getDatabase()
    await db.collection("email_logs").insertOne({
      type: "otp",
      recipients: [email],
      subject,
      sentAt: new Date(),
      success: result.success,
      error: result.error || null,
    })

    if (result.success) {
      logger.info("OTP email sent", { email, type })
    } else {
      logger.error("OTP email send failed", { email, type, error: result.error })
    }

    return result
  } catch (error: any) {
    logger.error("Send OTP email error", error)
    return { success: false, error: "Failed to send email" }
  }
}
