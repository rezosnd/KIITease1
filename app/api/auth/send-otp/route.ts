import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { generateOTP, storeOTP, sendOTPEmail, checkOTPRateLimit } from "@/lib/otp-service"
import { registerSchema } from "@/lib/validation"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, type, ...otherData } = body

    if (!email || !name || !type) {
      return NextResponse.json({ error: "Email, name, and type are required" }, { status: 400 })
    }

    // Check rate limiting
    const rateLimit = await checkOTPRateLimit(email)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: `Too many requests. Please wait ${rateLimit.waitTime} seconds.` },
        { status: 429 },
      )
    }

    const db = await getDatabase()

    // For registration, validate all required fields and check if user exists
    if (type === "registration") {
      try {
        registerSchema.parse(body)
      } catch (error) {
        return NextResponse.json({ error: "Invalid registration data" }, { status: 400 })
      }

      const existingUser = await db.collection("users").findOne({ email: email.toLowerCase() })
      if (existingUser) {
        return NextResponse.json({ error: "User already exists" }, { status: 400 })
      }

      // Store registration data temporarily
      await db.collection("pending_registrations").deleteMany({ email: email.toLowerCase() })
      await db.collection("pending_registrations").insertOne({
        ...otherData,
        email: email.toLowerCase(),
        name,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      })
    }

    // For login, check if user exists
    if (type === "login") {
      const user = await db.collection("users").findOne({ email: email.toLowerCase() })
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }
    }

    // Generate and store OTP
    const otp = generateOTP()
    await storeOTP(email, otp, type)

    // Send OTP email
    const emailResult = await sendOTPEmail(email, name, otp, type)

    if (!emailResult.success) {
      return NextResponse.json({ error: "Failed to send OTP email" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
      expiresIn: 600, // 10 minutes in seconds
    })
  } catch (error) {
    console.error("Send OTP error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
