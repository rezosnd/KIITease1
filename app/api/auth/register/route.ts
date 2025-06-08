import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { hashPassword, generateReferralCode } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, branch, year, referralCode } = await request.json()

    // Validate input
    if (!name || !email || !password || !branch || !year) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    const db = await getDatabase()

    // Check if user exists (case-insensitive)
    const existingUser = await db.collection("users").findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Hash password and generate referral code
    const passwordHash = await hashPassword(password)
    const userReferralCode = generateReferralCode()

    // Handle referral
    let referredBy = null
    if (referralCode) {
      const referrer = await db.collection("users").findOne({ referralCode })
      if (referrer) {
        referredBy = referrer._id
      }
    }

    // Create user
    const newUser = {
      name,
      email: email.toLowerCase(),
      passwordHash,
      branch,
      year: Number.parseInt(year),
      role: "free",
      referralCode: userReferralCode,
      referredBy,
      refundEligible: false,
      refundStatus: "none",
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

    return NextResponse.json({ success: true, message: "User created successfully" })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
