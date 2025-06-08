import Razorpay from "razorpay"
import crypto from "crypto"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { logger } from "@/lib/logger"

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export interface PaymentOrder {
  id: string
  amount: number
  currency: string
  receipt: string
  status: string
  created_at: number
}

export interface PaymentVerification {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

// Create Razorpay order
export async function createRazorpayOrder(amount: number, userId: string, referralCode?: string) {
  try {
    const receipt = `receipt_${Date.now()}_${userId.slice(-6)}`

    const orderOptions = {
      amount: amount * 100, // Convert to paise
      currency: "INR",
      receipt,
      notes: {
        userId,
        referralCode: referralCode || "",
        platform: "KIITease",
      },
    }

    const order = await razorpay.orders.create(orderOptions)

    // Store order in database
    const db = await getDatabase()
    await db.collection("payment_orders").insertOne({
      userId: new ObjectId(userId),
      orderId: order.id,
      amount: amount,
      currency: order.currency,
      receipt: order.receipt,
      status: "created",
      referralCode: referralCode || null,
      createdAt: new Date(),
      razorpayOrderData: order,
    })

    logger.info("Razorpay order created", { orderId: order.id, userId, amount })
    return order
  } catch (error) {
    logger.error("Failed to create Razorpay order", error)
    throw error
  }
}

// Verify payment signature
export function verifyPaymentSignature(verification: PaymentVerification): boolean {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = verification

    const body = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex")

    return expectedSignature === razorpay_signature
  } catch (error) {
    logger.error("Payment signature verification failed", error)
    return false
  }
}

// Get payment details from Razorpay
export async function getPaymentDetails(paymentId: string) {
  try {
    const payment = await razorpay.payments.fetch(paymentId)
    return payment
  } catch (error) {
    logger.error("Failed to fetch payment details", error)
    throw error
  }
}

// Auto-verify payment and process referrals
export async function processPaymentSuccess(verification: PaymentVerification, userId: string) {
  const db = await getDatabase()
  const session = db.client.startSession()

  try {
    await session.withTransaction(async () => {
      // Get order details
      const order = await db
        .collection("payment_orders")
        .findOne({ orderId: verification.razorpay_order_id }, { session })

      if (!order) {
        throw new Error("Order not found")
      }

      // Get payment details from Razorpay
      const paymentDetails = await getPaymentDetails(verification.razorpay_payment_id)

      // Update order status
      await db.collection("payment_orders").updateOne(
        { orderId: verification.razorpay_order_id },
        {
          $set: {
            status: "completed",
            paymentId: verification.razorpay_payment_id,
            paymentDetails,
            verifiedAt: new Date(),
            updatedAt: new Date(),
          },
        },
        { session },
      )

      // Update user to paid status
      const userUpdate = await db.collection("users").findOneAndUpdate(
        { _id: new ObjectId(userId) },
        {
          $set: {
            role: "paid",
            paymentId: verification.razorpay_payment_id,
            paymentAmount: order.amount,
            paymentDate: new Date(),
            updatedAt: new Date(),
          },
        },
        { session, returnDocument: "after" },
      )

      // Process referral if exists
      if (order.referralCode) {
        await processReferralReward(order.referralCode, userId, order.amount, session)
      }

      // Log successful payment
      await db.collection("audit_logs").insertOne(
        {
          userId: new ObjectId(userId),
          action: "payment_successful",
          details: {
            orderId: verification.razorpay_order_id,
            paymentId: verification.razorpay_payment_id,
            amount: order.amount,
            referralCode: order.referralCode,
          },
          createdAt: new Date(),
        },
        { session },
      )

      return { user: userUpdate.value, order, paymentDetails }
    })

    logger.info("Payment processed successfully", {
      userId,
      paymentId: verification.razorpay_payment_id,
    })
  } catch (error) {
    logger.error("Payment processing failed", error)
    throw error
  } finally {
    await session.endSession()
  }
}

// Process referral rewards
async function processReferralReward(referralCode: string, newUserId: string, amount: number, session: any) {
  const db = await getDatabase()

  try {
    // Find referrer by code
    const referrer = await db.collection("users").findOne({ referralCode }, { session })

    if (!referrer) {
      logger.warn("Referral code not found", { referralCode })
      return
    }

    // Create referral record
    await db.collection("referrals").insertOne(
      {
        referrerId: referrer._id,
        referredUserId: new ObjectId(newUserId),
        referralCode,
        status: "completed",
        rewardAmount: Math.floor(amount * 0.1), // 10% referral reward
        paymentAmount: amount,
        createdAt: new Date(),
        completedAt: new Date(),
      },
      { session },
    )

    // Update referrer's referral count and earnings
    await db.collection("users").updateOne(
      { _id: referrer._id },
      {
        $inc: {
          totalReferrals: 1,
          totalReferralEarnings: Math.floor(amount * 0.1),
        },
        $set: {
          updatedAt: new Date(),
        },
      },
      { session },
    )

    // Check if referrer reached refund milestone (20 referrals)
    const referralCount = await db
      .collection("referrals")
      .countDocuments({ referrerId: referrer._id, status: "completed" }, { session })

    if (referralCount >= 20 && !referrer.refundEligible) {
      await db.collection("users").updateOne(
        { _id: referrer._id },
        {
          $set: {
            refundEligible: true,
            refundStatus: "eligible",
            refundEligibleDate: new Date(),
            updatedAt: new Date(),
          },
        },
        { session },
      )

      // Create notification for milestone
      await db.collection("notifications").insertOne(
        {
          userId: referrer._id,
          title: "🎉 Refund Milestone Achieved!",
          message: `Congratulations! You've referred ${referralCount} friends and are now eligible for a full refund. Contact admin to claim your refund.`,
          type: "success",
          read: false,
          actionUrl: "/dashboard?tab=payment",
          createdAt: new Date(),
        },
        { session },
      )
    }

    logger.info("Referral reward processed", {
      referrerId: referrer._id,
      newUserId,
      referralCount,
      rewardAmount: Math.floor(amount * 0.1),
    })
  } catch (error) {
    logger.error("Referral processing failed", error)
    // Don't throw - payment should still succeed even if referral fails
  }
}

// Get referral statistics
export async function getReferralStats(userId: string) {
  try {
    const db = await getDatabase()

    const [referralCount, totalEarnings, user] = await Promise.all([
      db.collection("referrals").countDocuments({
        referrerId: new ObjectId(userId),
        status: "completed",
      }),
      db
        .collection("referrals")
        .aggregate([
          { $match: { referrerId: new ObjectId(userId), status: "completed" } },
          { $group: { _id: null, total: { $sum: "$rewardAmount" } } },
        ])
        .toArray(),
      db.collection("users").findOne({ _id: new ObjectId(userId) }),
    ])

    return {
      referralCount,
      totalEarnings: totalEarnings[0]?.total || 0,
      refundEligible: user?.refundEligible || false,
      refundStatus: user?.refundStatus || "not_eligible",
      referralCode: user?.referralCode,
    }
  } catch (error) {
    logger.error("Failed to get referral stats", error)
    throw error
  }
}

// Auto-refund processing
export async function processAutoRefund(userId: string) {
  const db = await getDatabase()
  const session = db.client.startSession()

  try {
    await session.withTransaction(async () => {
      const user = await db.collection("users").findOne({ _id: new ObjectId(userId) }, { session })

      if (!user || !user.refundEligible || user.refundStatus !== "eligible") {
        throw new Error("User not eligible for refund")
      }

      // Create refund record
      const refundAmount = user.paymentAmount || 499
      await db.collection("refunds").insertOne(
        {
          userId: new ObjectId(userId),
          amount: refundAmount,
          status: "processing",
          method: "auto_referral",
          referralCount: await db.collection("referrals").countDocuments({
            referrerId: new ObjectId(userId),
            status: "completed",
          }),
          requestedAt: new Date(),
          processedAt: new Date(),
        },
        { session },
      )

      // Update user refund status
      await db.collection("users").updateOne(
        { _id: new ObjectId(userId) },
        {
          $set: {
            refundStatus: "processing",
            refundRequestedAt: new Date(),
            updatedAt: new Date(),
          },
        },
        { session },
      )

      // Create notification
      await db.collection("notifications").insertOne(
        {
          userId: new ObjectId(userId),
          title: "💰 Refund Processing!",
          message: `Your refund of ₹${refundAmount} is being processed. You'll receive it within 3-5 business days.`,
          type: "success",
          read: false,
          createdAt: new Date(),
        },
        { session },
      )
    })

    logger.info("Auto refund processed", { userId })
  } catch (error) {
    logger.error("Auto refund processing failed", error)
    throw error
  } finally {
    await session.endSession()
  }
}
