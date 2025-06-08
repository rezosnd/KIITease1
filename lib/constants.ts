// Application constants and configuration for KIITease

export const APP_CONFIG = {
  name: "KIITease",
  version: "1.0.0",
  description: "Your Gateway to KIIT Academic Excellence",
  url: process.env.NEXTAUTH_URL || "http://localhost:3000",
  supportEmail: "support@kiitease.com",
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedFileTypes: ["pdf", "doc", "docx", "ppt", "pptx"],
  rateLimit: {
    api: { requests: 100, window: 15 * 60 * 1000 }, // 100 requests per 15 minutes
    auth: { requests: 10, window: 15 * 60 * 1000 }, // 10 auth requests per 15 minutes
  },
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },
  referral: {
    targetCount: 20,
    rewardAmount: 499,
  },
} as const

export const BRANCHES = [
  "CSE",  // Computer Science & Engineering
  "ECE",  // Electronics & Communication Engineering
  "ME",   // Mechanical Engineering
  "CE",   // Civil Engineering
  "EE",   // Electrical Engineering
  "IT",   // Information Technology
  "ETC",  // Electronics & Telecommunication Engineering
  "EEE",  // Electrical & Electronics Engineering
  "CSSE", // Computer Science & Systems Engineering
  "CSCE", // Computer Science & Computer Engineering
] as const

export const YEARS = [1, 2, 3, 4] as const

export const USER_ROLES = ["free", "paid", "admin"] as const

export const REFUND_STATUSES = ["none", "eligible", "pending", "issued"] as const

export const ERROR_MESSAGES = {
  UNAUTHORIZED: "You are not authorized to perform this action",
  INVALID_INPUT: "Invalid input data provided",
  USER_NOT_FOUND: "User not found",
  INTERNAL_ERROR: "Internal server error occurred",
  RATE_LIMITED: "Too many requests. Please try again later",
  FILE_TOO_LARGE: "File size exceeds maximum limit",
  INVALID_FILE_TYPE: "Invalid file type",
  ACCOUNT_LOCKED: "Account temporarily locked due to multiple failed attempts",
} as const
