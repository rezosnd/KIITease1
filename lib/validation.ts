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
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must contain uppercase, lowercase, number and special character",
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

// Sanitize HTML content
export function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
}

// Validate file uploads
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
