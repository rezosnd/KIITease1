import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { verifyOTP } from "@/lib/otp-service"
import { hashPassword, generateToken, generateReferralCode } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, otp, type } = await request.json()

    if (!email || !otp || !type) {
      return NextResponse.json({ error: "Email, OTP, and type are required" }, { status: 400 })
    }

    // Verify OTP
    const otpResult = await verifyOTP(email, otp, type)
    if (!otpResult.valid) {
      return NextResponse.json({ error: otpResult.error }, { status: 400 })
    }

    const db = await getDatabase()

    if (type === "registration") {
      // Get pending registration data
      const pendingReg = await db.collection("pending_registrations").findOne({
        email: email.toLowerCase(),
        expiresAt: { $gt: new Date() },
      })

      if (!pendingReg) {
        return NextResponse.json({ error: "Registration data expired. Please start again." }, { status: 400 })
      }

      // Hash password (ensure await if hashPassword is async)
      const passwordHash = await hashPassword(pendingReg.password)
      const userReferralCode = generateReferralCode()

      // Handle referral
      let referredBy = null
      if (pendingReg.referralCode) {
        const referrer = await db.collection("users").findOne({ referralCode: pendingReg.referralCode })
        if (referrer) {
          referredBy = referrer._id
        }
      }

      const newUser = {
        name: pendingReg.name,
        email: email.toLowerCase(),
        passwordHash,
        branch: pendingReg.branch,
        year: Number.parseInt(pendingReg.year),
        role: "free",
        referralCode: userReferralCode,
        referredBy,
        refundEligible: false,
        refundStatus: "none",
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = await db.collection("users").insertOne(newUser)

      // Create referral record if referred
      if (referredBy) {
        await db.collection("referrals").insertOne({
          referrerId: referredBy,
          referredId: result.insertedId,
          status: "pending",
          createdAt: new Date(),
        })
      }

      // Clean up pending registration
      await db.collection("pending_registrations").deleteOne({ _id: pendingReg._id })

      // Generate JWT token
      const token = generateToken({
        userId: result.insertedId,
        email: newUser.email,
        role: newUser.role,
      })

      const response = NextResponse.json({
        success: true,
        message: "Registration completed successfully",
        user: {
          id: result.insertedId,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          branch: newUser.branch,
          year: newUser.year,
        },
      })

      // Set HTTP-only cookie
      response.cookies.set("auth-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60, // 7 days
      })

      return response
    } else if (type === "login") {
      // Find user and log them in
      const user = await db.collection("users").findOne({ email: email.toLowerCase() })

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      // Generate JWT token
      const token = generateToken({
        userId: user._id,
        email: user.email,
        role: user.role,
      })

      const response = NextResponse.json({
        success: true,
        message: "Login successful",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          branch: user.branch,
          year: user.year,
        },
      })

      // Set HTTP-only cookie
      response.cookies.set("auth-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60, // 7 days
      })

      return response
    } else if (type === "password-reset") {
      // Mark email as verified for password reset
      return NextResponse.json({
        success: true,
        message: "OTP verified. You can now reset your password.",
        verified: true,
      })
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 })
  } catch (error) {
    console.error("Verify OTP error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
