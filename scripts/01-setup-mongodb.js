// MongoDB setup and indexing for optimal performance
const { MongoClient } = require("mongodb")

async function setupDatabase() {
  const client = new MongoClient(process.env.MONGODB_URI)

  try {
    await client.connect()
    const db = client.db("eduplatform")

    // Create collections with validation
    await db.createCollection("users", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["name", "email", "passwordHash", "branch", "year", "role", "referralCode"],
          properties: {
            name: { bsonType: "string" },
            email: { bsonType: "string" },
            passwordHash: { bsonType: "string" },
            branch: { bsonType: "string", enum: ["CSE", "ECE", "ME", "CE", "EE", "IT"] },
            year: { bsonType: "int", minimum: 1, maximum: 4 },
            role: { bsonType: "string", enum: ["free", "paid", "admin"] },
            referralCode: { bsonType: "string" },
            referredBy: { bsonType: "objectId" },
            paymentId: { bsonType: "string" },
            paymentAmount: { bsonType: "number" },
            paymentDate: { bsonType: "date" },
            refundEligible: { bsonType: "bool" },
            refundStatus: { bsonType: "string", enum: ["none", "eligible", "pending", "issued"] },
          },
        },
      },
    })

    // Create indexes for performance optimization
    await db
      .collection("users")
      .createIndexes([
        { key: { email: 1 }, unique: true },
        { key: { referralCode: 1 }, unique: true },
        { key: { branch: 1, year: 1 } },
        { key: { role: 1 } },
        { key: { referredBy: 1 } },
      ])

    await db.collection("notes").createIndexes([
      { key: { branch: 1, year: 1 } },
      { key: { subject: 1 } },
      { key: { title: "text", subject: "text" } }, // Text search
      { key: { createdAt: -1 } },
    ])

    await db
      .collection("reviews")
      .createIndexes([
        { key: { teacherId: 1 } },
        { key: { branch: 1, year: 1 } },
        { key: { rating: 1 } },
        { key: { createdAt: -1 } },
      ])

    await db
      .collection("referrals")
      .createIndexes([{ key: { referrerId: 1 } }, { key: { referredId: 1 } }, { key: { status: 1 } }])

    console.log("Database setup completed with optimized indexes")
  } finally {
    await client.close()
  }
}

setupDatabase().catch(console.error)
