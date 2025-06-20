import { z } from "zod"

// Input validation schemas
export const registerSchema = z.object({
  name: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
  email: z.string().email().max(100),
  password: z
    .string()
    .min(8)
    .max(128)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      "Password must contain uppercase, lowercase, number and special character"
    ),
  branch: z.enum(["CSE", "ECE", "ME", "CE", "EE", "IT"]),
  year: z.number().int().min(1).max(4),
  referralCode: z.string().optional(),
})

export const loginSchema = z.object({
  email: z.string().email().max(100),
  password: z.string().min(1).max(128),
})

export const reviewSchema = z.object({
  teacherId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid teacher ID"),
  subject: z.string().min(1).max(100),
  rating: z.number().int().min(2).max(5),
  comment: z.string().max(1000).optional(),
})

export const noteUploadSchema = z.object({
  title: z.string().min(1).max(200),
  subject: z.string().min(1).max(100),
  branch: z.enum(["CSE", "ECE", "ME", "CE", "EE", "IT"]),
  year: z.number().int().min(1).max(4),
})

/**
 * Sanitize HTML content by removing scripts, iframes, javascript: and inline event handlers.
 * This is a basic sanitizer. For stricter security, use a library like DOMPurify on the frontend.
 */
export function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
}

/**
 * Validate file upload for allowed types and size.
 * Only PDF and DOC/DOCX files allowed, max 10MB.
 */
export function validateFileUpload(file: File): { valid: boolean; error?: string } {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ]
  const maxSize = 10 * 1024 * 1024 // 10MB

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: "Invalid file type. Only PDF and DOC files are allowed." }
  }

  if (file.size > maxSize) {
    return { valid: false, error: "File size too large. Maximum 10MB allowed." }
  }

  return { valid: true }
}

/**
 * Validate payment amount.
 * Only allows numbers between 1 and 100000 (adjust as needed).
 */
export function validatePaymentAmount(amount: number): { valid: boolean; error?: string } {
  if (typeof amount !== "number" || isNaN(amount)) {
    return { valid: false, error: "Amount must be a valid number." }
  }
  if (amount <= 0) {
    return { valid: false, error: "Amount must be greater than zero." }
  }
  if (amount > 100000) {
    return { valid: false, error: "Amount exceeds maximum allowed limit." }
  }
  return { valid: true }
}
