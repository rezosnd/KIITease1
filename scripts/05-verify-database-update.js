// Verification script to check if database update was successful
const { MongoClient } = require("mongodb")

async function verifyDatabaseUpdate() {
  const client = new MongoClient(process.env.MONGODB_URI)

  try {
    await client.connect()
    const db = client.db("kiitease")

    console.log("🔍 Verifying KIITease database update...")

    // Check collections exist
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map((c) => c.name)

    const requiredCollections = [
      "users",
      "otps",
      "pending_registrations",
      "email_logs",
      "rate_limits",
      "system_settings",
    ]

    console.log("\n📋 Collection Status:")
    for (const collection of requiredCollections) {
      const exists = collectionNames.includes(collection)
      console.log(`   ${exists ? "✅" : "❌"} ${collection}`)

      if (exists) {
        const count = await db.collection(collection).countDocuments()
        console.log(`      Documents: ${count}`)
      }
    }

    // Check indexes
    console.log("\n🔍 Index Status:")
    const otpIndexes = await db.collection("otps").indexes()
    const userIndexes = await db.collection("users").indexes()

    console.log(`   OTP indexes: ${otpIndexes.length}`)
    console.log(`   User indexes: ${userIndexes.length}`)

    // Check system settings
    const settings = await db.collection("system_settings").find().toArray()
    console.log(`\n⚙️ System Settings: ${settings.length} configured`)

    console.log("\n✅ Database verification complete!")
  } catch (error) {
    console.error("❌ Database verification failed:", error)
  } finally {
    await client.close()
  }
}

verifyDatabaseUpdate()
