const { MongoClient } = require("mongodb")

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/kiitease"

async function updatePaymentSystem() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log("🔗 Connected to MongoDB")

    const db = client.db()

    // Update users collection with referral fields
    console.log("📊 Updating users collection...")
    await db.collection("users").updateMany(
      {},
      {
        $set: {
          totalReferrals: 0,
          totalReferralEarnings: 0,
          refundEligible: false,
          refundStatus: "not_eligible",
        },
      },
    )

    // Update payment_orders collection structure
    console.log("💳 Updating payment orders...")
    await db.collection("payment_orders").createIndex({ userId: 1, createdAt: -1 })
    await db.collection("payment_orders").createIndex({ orderId: 1 }, { unique: true })

    // Update referrals collection
    console.log("🎁 Updating referrals collection...")
    await db.collection("referrals").createIndex({ referrerId: 1, status: 1 })
    await db.collection("referrals").createIndex({ referredUserId: 1 })
    await db.collection("referrals").createIndex({ referralCode: 1 })

    // Create refunds collection
    console.log("💰 Creating refunds collection...")
    await db.createCollection("refunds")
    await db.collection("refunds").createIndex({ userId: 1, createdAt: -1 })
    await db.collection("refunds").createIndex({ status: 1 })

    // Add sample system settings for payment
    console.log("⚙️ Adding payment system settings...")
    await db.collection("system_settings").updateOne(
      { key: "payment_settings" },
      {
        $set: {
          key: "payment_settings",
          value: {
            razorpay_enabled: true,
            auto_verification: true,
            referral_reward_percentage: 10,
            refund_threshold: 20,
            premium_price: 499,
          },
          updatedAt: new Date(),
        },
      },
      { upsert: true },
    )

    console.log("✅ Payment system update completed successfully!")

    // Verify the updates
    const userCount = await db.collection("users").countDocuments()
    const paymentOrderCount = await db.collection("payment_orders").countDocuments()
    const referralCount = await db.collection("referrals").countDocuments()

    console.log(`📈 Database Statistics:`)
    console.log(`   Users: ${userCount}`)
    console.log(`   Payment Orders: ${paymentOrderCount}`)
    console.log(`   Referrals: ${referralCount}`)
  } catch (error) {
    console.error("❌ Payment system update failed:", error)
  } finally {
    await client.close()
    console.log("🔌 MongoDB connection closed")
  }
}

updatePaymentSystem()
