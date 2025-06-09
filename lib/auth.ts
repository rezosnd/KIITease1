import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { ObjectId } from "mongodb"
import type { NextRequest } from "next/server"

// Ensure JWT_SECRET is set in your .env.local at the project root
const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable must be set")
}

/**
 * Hash a password using bcrypt.
 */
export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 12)
}

/**
 * Compare a plain password with a hashed password.
 */
export function verifyPassword(password: string, hashedPassword: string): boolean {
  return bcrypt.compareSync(password, hashedPassword)
}

/**
 * Generate a JWT token for a given payload.
 */
export function generateToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET as string, { expiresIn: "7d" })
}

/**
 * Verify a JWT token and return the decoded payload, or null if invalid.
 */
export function verifyToken(token: string): any | null {
  try {
    return jwt.verify(token, JWT_SECRET as string)
  } catch {
    return null
  }
}

/**
 * Generate a random referral code (6 uppercase alphanumeric characters).
 */
export function generateReferralCode(): string {
  // Ensures always 6 uppercase alphanumeric
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let code = ""
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

/**
 * Get the authenticated user from a NextRequest (expects cookie "auth-token").
 */
export async function getAuthUser(request: NextRequest) {
  // Compatible with Next.js App Router (NextRequest)
  const token = request.cookies.get("auth-token")?.value
  if (!token) return null
  const decoded = verifyToken(token)
  return decoded || null
}

/**
 * Convert a string to a MongoDB ObjectId.
 */
export function toObjectId(id: string): ObjectId {
  if (!ObjectId.isValid(id)) {
    throw new Error("Invalid ObjectId string")
  }
  return new ObjectId(id)
}

/**
 * Verify authentication for API routes.
 * Returns the decoded user if valid, otherwise null.
 */
export async function verifyAuth(request: NextRequest) {
  return await getAuthUser(request)
}
