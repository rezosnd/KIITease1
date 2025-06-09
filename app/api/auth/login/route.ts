import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { verifyPassword, generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const db = await getDatabase()
    const user = await db.collection("users").findOne({ email: email.toLowerCase() })

    // Check user existence and password validity (NO await needed)
    if (!user || !user.passwordHash || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Generate JWT token
    const token = generateToken({
      userId: user._id,
      email: user.email,
      role: user.role,
    })

    // Prepare response with auth cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        branch: user.branch,
        year: user.year,
      },
    })

    // Set secure, httpOnly cookie for 7 days
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // "lax" is recommended for most apps
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
