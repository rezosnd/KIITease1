// Seed initial data
const { MongoClient, ObjectId } = require("mongodb")
const bcrypt = require("bcryptjs")

async function seedData() {
  const client = new MongoClient(process.env.MONGODB_URI)

  try {
    await client.connect()
    const db = client.db("eduplatform")

    // Insert teachers
    const teachers = await db.collection("teachers").insertMany([
      { name: "Dr. John Smith", department: "CSE", createdAt: new Date() },
      { name: "Prof. Sarah Johnson", department: "ECE", createdAt: new Date() },
      { name: "Dr. Michael Brown", department: "ME", createdAt: new Date() },
      { name: "Prof. Emily Davis", department: "CE", createdAt: new Date() },
      { name: "Dr. Robert Wilson", department: "EE", createdAt: new Date() },
      { name: "Prof. Lisa Anderson", department: "IT", createdAt: new Date() },
    ])

    // Insert admin user
    const adminPassword = await bcrypt.hash("admin123", 10)
    await db.collection("users").insertOne({
      name: "Admin User",
      email: "admin@edu.com",
      passwordHash: adminPassword,
      branch: "CSE",
      year: 4,
      role: "admin",
      referralCode: "ADMIN001",
      refundEligible: false,
      refundStatus: "none",
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    console.log("Seed data inserted successfully")
  } finally {
    await client.close()
  }
}

seedData().catch(console.error)
