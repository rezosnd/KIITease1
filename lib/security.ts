import crypto from "crypto"
import type { NextRequest } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { logger } from "@/lib/logger"

// CSRF Protection
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

export function verifyCSRFToken(token: string, sessionToken: string): boolean {
  if (!token || !sessionToken) return false
  try {
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(sessionToken))
  } catch {
    // In case of length mismatch or error, prevent bypass
    return false
  }
}

// MongoDB Query Injection Prevention
export function sanitizeMongoQuery(query: any): any {
  if (typeof query !== "object" || query === null) {
    return query
  }

  const sanitized: any = {}
  for (const [key, value] of Object.entries(query)) {
    // Only allow certain safe operators; block others
    if (key.startsWith("$") && !["$eq", "$ne", "$in", "$nin", "$gt", "$gte", "$lt", "$lte"].includes(key)) {
      continue
    }
    sanitized[key] = typeof value === "object" && value !== null ? sanitizeMongoQuery(value) : value
  }
  return sanitized
}

// Password Strength Validation
export function validatePasswordStrength(password: string): {
  valid: boolean
  score: number
  feedback: string[]
} {
  const feedback: string[] = []
  let score = 0

  if (password.length >= 8) score += 1
  else feedback.push("Use at least 8 characters")

  if (/[a-z]/.test(password)) score += 1
  else feedback.push("Include lowercase letters")

  if (/[A-Z]/.test(password)) score += 1
  else feedback.push("Include uppercase letters")

  if (/\d/.test(password)) score += 1
  else feedback.push("Include numbers")

  if (/[@$!%*?&]/.test(password)) score += 1
  else feedback.push("Include special characters")

  if (password.length >= 12) score += 1

  return {
    valid: score >= 4,
    score,
    feedback,
  }
}

// Secure Session Token Generation
export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

// IP Extraction from NextRequest
export function getClientIP(request: NextRequest): string {
  // Trust x-forwarded-for first, then x-real-ip, then request.ip
  const forwarded = request.headers.get("x-forwarded-for")
  const real = request.headers.get("x-real-ip")
  const ip = (request as any).ip // NextRequest.ip may be undefined, fallback to "unknown"

  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }
  if (real) {
    return real
  }
  return ip || "unknown"
}

// Security/Audit Logging to MongoDB
export async function logSecurityEvent(event: {
  type: "login_attempt" | "failed_login" | "admin_access" | "suspicious_activity"
  userId?: string
  ip: string
  userAgent?: string
  details?: any
}) {
  const logEntry = {
    ...event,
    timestamp: new Date(),
  }

  try {
    const db = await getDatabase()
    await db.collection("security_logs").insertOne(logEntry)
    logger.info(`[SECURITY] ${event.type}`, logEntry)
  } catch (err) {
    // Fallback: log to console if DB logging fails
    logger.error("Failed to log security event", { err, logEntry })
    // eslint-disable-next-line no-console
    console.log(`[SECURITY] ${event.type}:`, logEntry)
  }
}
