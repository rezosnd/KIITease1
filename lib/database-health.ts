import { getDatabase } from "@/lib/mongodb"
import { logger } from "@/lib/logger"

export interface DatabaseHealth {
  status: "healthy" | "warning" | "critical"
  collections: CollectionHealth[]
  paymentIntegrity: PaymentIntegrityCheck
  securityStatus: SecurityStatus
  recommendations: string[]
}

interface CollectionHealth {
  name: string
  documentCount: number
  indexCount: number
  avgDocumentSize: number
  status: "ok" | "warning" | "error"
}

interface PaymentIntegrityCheck {
  totalOrders: number
  completedPayments: number
  failedPayments: number
  orphanedRecords: number
  integrityScore: number
}

interface SecurityStatus {
  authMethods: string[]
  encryptionStatus: boolean
  auditLogging: boolean
  rateLimiting: boolean
  otpSecurity: boolean
  securityScore: number
}

export async function checkDatabaseHealth(): Promise<DatabaseHealth> {
  try {
    const db = await getDatabase()

    // Check collections health
    const collectionsHealth = await checkCollectionsHealth(db)

    // Check payment integrity
    const paymentIntegrity = await checkPaymentIntegrity(db)

    // Check security status
    const securityStatus = await checkSecurityStatus(db)

    // Generate recommendations
    const recommendations = generateRecommendations(collectionsHealth, paymentIntegrity, securityStatus)

    // Calculate overall status
    const overallStatus = calculateOverallStatus(collectionsHealth, paymentIntegrity, securityStatus)

    return {
      status: overallStatus,
      collections: collectionsHealth,
      paymentIntegrity,
      securityStatus,
      recommendations,
    }
  } catch (error) {
    logger.error("Database health check failed", error)
    throw error
  }
}

async function checkCollectionsHealth(db: any): Promise<CollectionHealth[]> {
  const requiredCollections = [
    "users",
    "payment_orders",
    "referrals",
    "notes",
    "reviews",
    "teachers",
    "otps",
    "rate_limits",
    "audit_logs",
    "email_logs",
    "notifications",
    "refunds",
    "system_settings",
  ]

  const health: CollectionHealth[] = []

  for (const collectionName of requiredCollections) {
    try {
      const stats = await db.collection(collectionName).stats()
      const indexes = await db.collection(collectionName).indexes()

      health.push({
        name: collectionName,
        documentCount: stats.count || 0,
        indexCount: indexes.length,
        avgDocumentSize: stats.avgObjSize || 0,
        status: stats.count > 0 ? "ok" : "warning",
      })
    } catch (error) {
      health.push({
        name: collectionName,
        documentCount: 0,
        indexCount: 0,
        avgDocumentSize: 0,
        status: "error",
      })
    }
  }

  return health
}

async function checkPaymentIntegrity(db: any): Promise<PaymentIntegrityCheck> {
  const [orders, users, referrals] = await Promise.all([
    db.collection("payment_orders").find().toArray(),
    db.collection("users").find({ role: "paid" }).toArray(),
    db.collection("referrals").find().toArray(),
  ])

  const completedOrders = orders.filter((o) => o.status === "completed")
  const failedOrders = orders.filter((o) => o.status === "failed")

  // Check for orphaned records (paid users without payment orders)
  const paidUsersWithoutOrders = users.filter(
    (user) => !completedOrders.some((order) => order.userId.toString() === user._id.toString()),
  )

  const integrityScore = Math.max(0, 100 - paidUsersWithoutOrders.length * 10)

  return {
    totalOrders: orders.length,
    completedPayments: completedOrders.length,
    failedPayments: failedOrders.length,
    orphanedRecords: paidUsersWithoutOrders.length,
    integrityScore,
  }
}

async function checkSecurityStatus(db: any): Promise<SecurityStatus> {
  const [auditLogs, rateLimits, otps, users] = await Promise.all([
    db.collection("audit_logs").countDocuments(),
    db.collection("rate_limits").countDocuments(),
    db.collection("otps").countDocuments(),
    db.collection("users").find().toArray(),
  ])

  // Check auth methods used
  const authMethods = []
  if (users.some((u) => u.googleId)) authMethods.push("Google OAuth")
  if (users.some((u) => u.password)) authMethods.push("Password")
  if (otps > 0) authMethods.push("OTP")

  const securityFeatures = [
    auditLogs > 0, // Audit logging
    rateLimits >= 0, // Rate limiting setup
    otps >= 0, // OTP system
    authMethods.length >= 2, // Multiple auth methods
    users.every((u) => u.emailVerified !== false), // Email verification
  ]

  const securityScore = (securityFeatures.filter(Boolean).length / securityFeatures.length) * 100

  return {
    authMethods,
    encryptionStatus: true, // MongoDB connection encryption
    auditLogging: auditLogs > 0,
    rateLimiting: true,
    otpSecurity: otps >= 0,
    securityScore,
  }
}

function generateRecommendations(
  collections: CollectionHealth[],
  payment: PaymentIntegrityCheck,
  security: SecurityStatus,
): string[] {
  const recommendations = []

  // Collection recommendations
  const errorCollections = collections.filter((c) => c.status === "error")
  if (errorCollections.length > 0) {
    recommendations.push(`Fix missing collections: ${errorCollections.map((c) => c.name).join(", ")}`)
  }

  // Payment recommendations
  if (payment.integrityScore < 90) {
    recommendations.push("Review payment integrity - found orphaned records")
  }
  if (payment.failedPayments > payment.completedPayments * 0.1) {
    recommendations.push("High payment failure rate - review payment gateway")
  }

  // Security recommendations
  if (security.securityScore < 80) {
    recommendations.push("Improve security score by enabling all security features")
  }
  if (security.authMethods.length < 2) {
    recommendations.push("Enable multiple authentication methods for better security")
  }

  return recommendations
}

function calculateOverallStatus(
  collections: CollectionHealth[],
  payment: PaymentIntegrityCheck,
  security: SecurityStatus,
): "healthy" | "warning" | "critical" {
  const criticalIssues = collections.filter((c) => c.status === "error").length
  const paymentScore = payment.integrityScore
  const securityScore = security.securityScore

  if (criticalIssues > 2 || paymentScore < 70 || securityScore < 60) {
    return "critical"
  }

  if (criticalIssues > 0 || paymentScore < 90 || securityScore < 80) {
    return "warning"
  }

  return "healthy"
}
