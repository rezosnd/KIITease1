// Add indexes for password reset functionality
const { MongoClient } = require("mongodb")

async function addPasswordResetIndexes() {
  const client = new MongoClient(process.env.MONGODB_URI)

  try {
    await client.connect()
    const db = client.db("eduplatform")

    // Add index for password reset token lookup
    await db.collection("users").createIndex(
      { resetPasswordToken: 1 },
      {
        name: "resetPasswordToken_1",
        sparse: true, // Only index documents that have this field
      },
    )

    // Add compound index for token and expiry
    await db.collection("users").createIndex(
      { resetPasswordToken: 1, resetPasswordExpiry: 1 },
      {
        name: "resetPasswordToken_expiry_1",
        sparse: true,
      },
    )

    // Add TTL index to automatically remove expired tokens
    await db.collection("users").createIndex(
      { resetPasswordExpiry: 1 },
      {
        name: "resetPasswordExpiry_ttl",
        expireAfterSeconds: 0, // Documents expire at the time specified in resetPasswordExpiry
        sparse: true,
      },
    )

    console.log("Password reset indexes created successfully")
  } finally {
    await client.close()
  }
}

addPasswordResetIndexes().catch(console.error)
