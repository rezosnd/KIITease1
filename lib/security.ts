import crypto from "crypto"
import type { NextRequest } from "next/server"

// CSRF Protection
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

export function verifyCSRFToken(token: string, sessionToken: string): boolean {
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(sessionToken))
}

// SQL Injection Prevention (for MongoDB)
export function sanitizeMongoQuery(query: any): any {
  if (typeof query !== "object" || query === null) {
    return query
  }

  const sanitized: any = {}
  for (const [key, value] of Object.entries(query)) {
    // Remove dangerous operators
    if (key.startsWith("$") && !["$eq", "$ne", "$in", "$nin", "$gt", "$gte", "$lt", "$lte"].includes(key)) {
      continue
    }

    if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeMongoQuery(value)
    } else {
      sanitized[key] = value
    }
  }

  return sanitized
}

// Password strength validation
export function validatePasswordStrength(password: string): { valid: boolean; score: number; feedback: string[] } {
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

// Secure session management
export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

// IP-based security
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const real = request.headers.get("x-real-ip")
  const ip = request.ip

  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }
  if (real) {
    return real
  }
  return ip || "unknown"
}

// Audit logging
export async function logSecurityEvent(event: {
  type: "login_attempt" | "failed_login" | "admin_access" | "suspicious_activity"
  userId?: string
  ip: string
  userAgent?: string
  details?: any
}) {
  // In production, send to security monitoring service
  console.log(`[SECURITY] ${event.type}:`, {
    timestamp: new Date().toISOString(),
    ...event,
  })
}
