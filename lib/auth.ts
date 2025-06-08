import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import type { NextRequest } from "next/server";

// Ensure JWT_SECRET is set in your .env.local at the project root
const JWT_SECRET = process.env.JWT_SECRET as string;

/**
 * Hash a password using bcrypt.
 */
export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 12);
}

/**
 * Compare a plain password with a hashed password.
 */
export function verifyPassword(password: string, hashedPassword: string): boolean {
  return bcrypt.compareSync(password, hashedPassword);
}

/**
 * Generate a JWT token for a given payload.
 */
export function generateToken(payload: any): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

/**
 * Verify a JWT token and return the decoded payload, or null if invalid.
 */
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

/**
 * Generate a random referral code (6 uppercase alphanumeric characters).
 */
export function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

/**
 * Get the authenticated user from a NextRequest (expects cookie "auth-token").
 */
export async function getAuthUser(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value;
  if (!token) return null;

  const decoded = verifyToken(token);
  return decoded;
}

/**
 * Convert a string to a MongoDB ObjectId.
 */
export function toObjectId(id: string): ObjectId {
  return new ObjectId(id);
}
