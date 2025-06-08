import { getDatabase } from "@/lib/mongodb"
import { cache, CACHE_KEYS } from "@/lib/cache"
import { logger } from "@/lib/logger"

export interface AnalyticsData {
  totalUsers: number
  paidUsers: number
  conversionRate: number
  totalNotes: number
  totalReviews: number
  topBranches: Array<{ branch: string; count: number }>
  topSubjects: Array<{ subject: string; count: number }>
  recentActivity: Array<{ action: string; count: number; date: string }>
  paymentStats: {
    totalRevenue: number
    averageOrderValue: number
    successRate: number
  }
}

/**
 * Fetch analytics for the dashboard, with caching for 10 minutes.
 * Pulls from multiple collections in parallel for performance.
 */
export async function getAnalytics(): Promise<AnalyticsData> {
  try {
    // Check cache first
    const cached = cache.get(CACHE_KEYS.ANALYTICS("dashboard"))
    if (cached) return cached

    const db = await getDatabase()

    // Parallel queries for better performance
    const [
      totalUsers,
      paidUsers,
      totalNotes,
      totalReviews,
      branchStats,
      subjectStats,
      recentActivity,
      paymentStats,
    ] = await Promise.all([
      db.collection("users").countDocuments(),
      db.collection("users").countDocuments({ role: "paid" }),
      db.collection("notes").countDocuments(),
      db.collection("reviews").countDocuments(),

      // Top branches
      db
        .collection("users")
        .aggregate([
          { $group: { _id: "$branch", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 5 },
          { $project: { branch: "$_id", count: 1, _id: 0 } },
        ])
        .toArray(),

      // Top subjects
      db
        .collection("notes")
        .aggregate([
          { $group: { _id: "$subject", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 5 },
          { $project: { subject: "$_id", count: 1, _id: 0 } },
        ])
        .toArray(),

      // Recent activity (last 7 days)
      db
        .collection("audit_logs")
        .aggregate([
          {
            $match: {
              createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
            },
          },
          {
            $group: {
              _id: {
                action: "$action",
                date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { "_id.date": -1 } },
          {
            $project: {
              action: "$_id.action",
              date: "$_id.date",
              count: 1,
              _id: 0,
            },
          },
        ])
        .toArray(),

      // Payment statistics
      db
        .collection("payment_orders")
        .aggregate([
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, "$amount", 0] } },
              totalOrders: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
              totalAttempts: { $sum: 1 },
            },
          },
        ])
        .toArray(),
    ])

    const conversionRate = totalUsers > 0 ? (paidUsers / totalUsers) * 100 : 0
    const paymentData = paymentStats[0] || { totalRevenue: 0, totalOrders: 0, totalAttempts: 0 }

    const analytics: AnalyticsData = {
      totalUsers,
      paidUsers,
      conversionRate: Number(conversionRate.toFixed(2)),
      totalNotes,
      totalReviews,
      topBranches: branchStats,
      topSubjects: subjectStats,
      recentActivity,
      paymentStats: {
        totalRevenue: paymentData.totalRevenue,
        averageOrderValue:
          paymentData.totalOrders > 0
            ? Number((paymentData.totalRevenue / paymentData.totalOrders).toFixed(2))
            : 0,
        successRate:
          paymentData.totalAttempts > 0
            ? Number(((paymentData.totalOrders / paymentData.totalAttempts) * 100).toFixed(2))
            : 0,
      },
    }

    // Cache for 10 minutes (600 seconds)
    cache.set(CACHE_KEYS.ANALYTICS("dashboard"), analytics, 600)

    return analytics
  } catch (error) {
    logger.error("Failed to get analytics", error)
    throw new Error("Failed to fetch analytics data")
  }
}

/**
 * Track a user or system event for analytics.
 * Stores event in analytics_events collection, adds timestamp and metadata if provided.
 */
export async function trackEvent(event: {
  userId?: string
  action: string
  category: string
  label?: string
  value?: number
  metadata?: any
}) {
  try {
    const db = await getDatabase()

    await db.collection("analytics_events").insertOne({
      ...event,
      timestamp: new Date(),
      sessionId: event.metadata?.sessionId,
      userAgent: event.metadata?.userAgent,
      ip: event.metadata?.ip,
    })

    logger.info("Analytics event tracked", event)
  } catch (error) {
    logger.error("Failed to track analytics event", error)
  }
}
