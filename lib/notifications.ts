import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { logger } from "@/lib/logger"

export interface Notification {
  _id?: ObjectId
  userId: ObjectId
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  read: boolean
  actionUrl?: string
  createdAt: Date
  expiresAt?: Date
}

export async function createNotification(notification: Omit<Notification, "_id" | "read" | "createdAt">) {
  try {
    const db = await getDatabase()

    const newNotification: Notification = {
      ...notification,
      read: false,
      createdAt: new Date(),
    }

    const result = await db.collection("notifications").insertOne(newNotification)
    logger.info("Notification created", { notificationId: result.insertedId, userId: notification.userId })

    return result.insertedId
  } catch (error) {
    logger.error("Failed to create notification", error)
    throw error
  }
}

export async function getUserNotifications(userId: string, limit = 20) {
  try {
    const db = await getDatabase()

    const notifications = await db
      .collection("notifications")
      .find({
        userId: new ObjectId(userId),
        $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gt: new Date() } }],
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray()

    return notifications
  } catch (error) {
    logger.error("Failed to get user notifications", error)
    throw error
  }
}

export async function markNotificationAsRead(notificationId: string, userId: string) {
  try {
    const db = await getDatabase()

    await db
      .collection("notifications")
      .updateOne({ _id: new ObjectId(notificationId), userId: new ObjectId(userId) }, { $set: { read: true } })

    logger.info("Notification marked as read", { notificationId, userId })
  } catch (error) {
    logger.error("Failed to mark notification as read", error)
    throw error
  }
}

// Notification templates
export const NOTIFICATION_TEMPLATES = {
  WELCOME: (name: string) => ({
    title: "Welcome to EduPlatform! 🎉",
    message: `Hi ${name}! Welcome to our platform. Start exploring study materials and teacher reviews.`,
    type: "success" as const,
  }),

  PAYMENT_SUCCESS: (amount: number) => ({
    title: "Payment Successful! ✅",
    message: `Your payment of ₹${amount} has been processed. You now have premium access!`,
    type: "success" as const,
  }),

  REFERRAL_MILESTONE: (count: number) => ({
    title: "Referral Milestone! 🌟",
    message: `Congratulations! You've referred ${count} friends. ${count >= 20 ? "You're eligible for a refund!" : `${20 - count} more to go for refund eligibility.`}`,
    type: count >= 20 ? ("success" as const) : ("info" as const),
  }),

  REFUND_PROCESSED: () => ({
    title: "Refund Processed! 💰",
    message: "Your refund has been processed successfully. It will reflect in your account within 3-5 business days.",
    type: "success" as const,
  }),

  ACCOUNT_LOCKED: () => ({
    title: "Account Security Alert 🔒",
    message:
      "Your account has been temporarily locked due to multiple failed login attempts. Please try again after 15 minutes.",
    type: "warning" as const,
  }),
}
