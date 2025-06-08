import { NextResponse } from "next/server"

export async function POST() {
  // Create a response that deletes the auth-token cookie
  const response = NextResponse.json({ success: true })

  response.cookies.set("auth-token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/", // Ensure the path matches the login cookie
    maxAge: 0, // Immediately expire the cookie
  })

  return response
}
