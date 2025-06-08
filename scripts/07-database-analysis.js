const { MongoClient } = require("mongodb")

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/kiitease"

async function analyzeDatabaseStructure() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log("🔗 Connected to MongoDB for analysis")

    const db = client.db()

    // Get all collections
    const collections = await db.listCollections().toArray()
    console.log("\n📊 DATABASE COLLECTIONS ANALYSIS:")
    console.log("=".repeat(50))

    for (const collection of collections) {
      const collectionName = collection.name
      const count = await db.collection(collectionName).countDocuments()
      const indexes = await db.collection(collectionName).indexes()

      console.log(`\n📁 Collection: ${collectionName}`)
      console.log(`   Documents: ${count}`)
      console.log(`   Indexes: ${indexes.length}`)

      // Show sample document structure
      const sample = await db.collection(collectionName).findOne()
      if (sample) {
        console.log(`   Structure: ${Object.keys(sample).join(", ")}`)
      }
    }

    // Analyze payment flow integrity
    console.log("\n💳 PAYMENT FLOW ANALYSIS:")
    console.log("=".repeat(50))

    const paymentOrders = await db.collection("payment_orders").find().toArray()
    const users = await db.collection("users").find().toArray()
    const referrals = await db.collection("referrals").find().toArray()

    console.log(`Payment Orders: ${paymentOrders.length}`)
    console.log(`Paid Users: ${users.filter((u) => u.role === "paid").length}`)
    console.log(`Total Referrals: ${referrals.length}`)
    console.log(`Completed Referrals: ${referrals.filter((r) => r.status === "completed").length}`)

    // Security analysis
    console.log("\n🔒 SECURITY FEATURES ANALYSIS:")
    console.log("=".repeat(50))

    const auditLogs = await db.collection("audit_logs").countDocuments()
    const emailLogs = await db.collection("email_logs").countDocuments()
    const rateLimits = await db.collection("rate_limits").countDocuments()
    const otps = await db.collection("otps").countDocuments()

    console.log(`Audit Logs: ${auditLogs}`)
    console.log(`Email Logs: ${emailLogs}`)
    console.log(`Rate Limits: ${rateLimits}`)
    console.log(`Active OTPs: ${otps}`)

    // Check for security indexes
    console.log("\n🛡️ SECURITY INDEXES:")
    console.log("=".repeat(50))

    const collections_to_check = ["users", "payment_orders", "otps", "rate_limits"]
    for (const collName of collections_to_check) {
      const indexes = await db.collection(collName).indexes()
      console.log(`${collName}: ${indexes.map((i) => i.name).join(", ")}`)
    }
  } catch (error) {
    console.error("❌ Database analysis failed:", error)
  } finally {
    await client.close()
  }
}

analyzeDatabaseStructure()
