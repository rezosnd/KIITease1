import { type NextRequest, NextResponse } from "next/server"
import { verifyGoogleToken } from "@/lib/google-auth"
import { getDatabase } from "@/lib/mongodb"
import { generateToken, generateReferralCode } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { token, branch, year, referralCode } = await request.json()

    if (!token) {
      return NextResponse.json({ error: "Google token is required" }, { status: 400 })
    }

    // Verify Google token
    const googleUser = await verifyGoogleToken(token)
    if (!googleUser || !googleUser.verified) {
      return NextResponse.json({ error: "Invalid Google token" }, { status:400 })
    }

    const db = await getDatabase()

    // Check if user already exists
    const user = await db.collection("users").findOne({ email: googleUser.email.toLowerCase() })

    if (user) {
      // User exists, log them in
      const authToken = generateToken({
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

      response.cookies.set("auth-token", authToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60,
      })

      return response
    } else {
      // New user, create account
      if (!branch || !year) {
        return NextResponse.json(
          {
            error: "Branch and year are required for new users",
            requiresAdditionalInfo: true,
            googleUser: {
              email: googleUser.email,
              name: googleUser.name,
              picture: googleUser.picture,
            },
          },
          { status: 400 }
        )
      }

      const userReferralCode = generateReferralCode()

      // Handle referral
      let referredBy = null
      if (referralCode) {
        const referrer = await db.collection("users").findOne({ referralCode })
        if (referrer) {
          referredBy = referrer._id
        }
      }

      const newUser = {
        name: googleUser.name,
        email: googleUser.email.toLowerCase(),
        passwordHash: null,
        branch,
        year: Number.parseInt(year),
        role: "free",
        referralCode: userReferralCode,
        referredBy,
        refundEligible: false,
        refundStatus: "none",
        emailVerified: true,
        googleId: googleUser.email,
        profilePicture: googleUser.picture,
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

      // Generate JWT token
      const authToken = generateToken({
        userId: result.insertedId,
        email: newUser.email,
        role: newUser.role,
      })

      const response = NextResponse.json({
        success: true,
        message: "Account created successfully",
        user: {
          id: result.insertedId,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          branch: newUser.branch,
          year: newUser.year,
        },
      })

      response.cookies.set("auth-token", authToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60,
      })

      return response
    }
  } catch (error) {
    console.error("Google auth error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
