// Run this script to setup your MongoDB database
const { MongoClient } = require("mongodb")

async function setupDatabase() {
  const client = new MongoClient(process.env.MONGODB_URI)

  try {
    await client.connect()
    console.log("Connected to MongoDB")

    const db = client.db("eduplatform")

    // Create collections
    await db.createCollection("users")
    await db.createCollection("notes")
    await db.createCollection("reviews")
    await db.createCollection("teachers")
    await db.createCollection("referrals")

    // Create indexes
    await db.collection("users").createIndex({ email: 1 }, { unique: true })
    await db.collection("users").createIndex({ referralCode: 1 }, { unique: true })
    await db.collection("notes").createIndex({ branch: 1, year: 1 })
    await db.collection("reviews").createIndex({ teacherId: 1 })

    console.log("Database setup completed!")

    // Insert sample teachers
    await db.collection("teachers").insertMany([
      { name: "Dr. John Smith", department: "CSE", createdAt: new Date() },
      { name: "Prof. Sarah Johnson", department: "ECE", createdAt: new Date() },
      { name: "Dr. Michael Brown", department: "ME", createdAt: new Date() },
    ])

    console.log("Sample data inserted!")
  } catch (error) {
    console.error("Setup error:", error)
  } finally {
    await client.close()
  }
}

setupDatabase()
