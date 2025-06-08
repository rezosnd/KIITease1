// Seed initial data for KIITease Platform
const { MongoClient, ObjectId } = require("mongodb")
const bcrypt = require("bcryptjs")

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017"
const DB_NAME = "kiitease"

async function seedInitialData() {
  const client = new MongoClient(MONGODB_URI)

  try {
    console.log("🌱 Starting data seeding...")
    await client.connect()
    const db = client.db(DB_NAME)

    // 1. SEED SYSTEM SETTINGS
    console.log("⚙️ Seeding system settings...")
    await db.collection("system_settings").insertMany([
      {
        key: "payment_settings",
        value: {
          razorpay_enabled: true,
          auto_verification: true,
          referral_reward_percentage: 10,
          refund_threshold: 20,
          premium_price: 499,
          currency: "INR",
        },
        updatedAt: new Date(),
      },
      {
        key: "otp_settings",
        value: {
          expiryMinutes: 10,
          maxAttempts: 3,
          rateLimit: {
            maxRequests: 3,
            windowMinutes: 1,
          },
        },
        updatedAt: new Date(),
      },
      {
        key: "email_settings",
        value: {
          fromName: "KIITease Team",
          fromEmail: "noreply@kiitease.com",
          replyTo: "support@kiitease.com",
          batchSize: 50,
          delayMs: 5000,
        },
        updatedAt: new Date(),
      },
      {
        key: "auth_settings",
        value: {
          googleAuthEnabled: true,
          otpAuthEnabled: true,
          passwordAuthEnabled: true,
          requireEmailVerification: true,
          jwtExpiryHours: 24,
        },
        updatedAt: new Date(),
      },
      {
        key: "app_settings",
        value: {
          appName: "KIITease",
          appVersion: "1.0.0",
          maintenanceMode: false,
          registrationEnabled: true,
          maxFileUploadSize: 10485760, // 10MB
        },
        updatedAt: new Date(),
      },
    ])

    // 2. SEED TEACHERS
    console.log("👨‍🏫 Seeding teachers...")
    const teachersData = [
      {
        name: "Dr. Rajesh Kumar",
        department: "CSE",
        designation: "Professor",
        subjects: ["Data Structures", "Algorithms", "Database Management"],
        averageRating: 0,
        totalReviews: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Prof. Priya Sharma",
        department: "CSE",
        designation: "Associate Professor",
        subjects: ["Web Development", "Software Engineering", "Computer Networks"],
        averageRating: 0,
        totalReviews: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Dr. Amit Singh",
        department: "ECE",
        designation: "Professor",
        subjects: ["Digital Electronics", "Microprocessors", "Communication Systems"],
        averageRating: 0,
        totalReviews: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Prof. Sneha Patel",
        department: "ME",
        designation: "Assistant Professor",
        subjects: ["Thermodynamics", "Fluid Mechanics", "Machine Design"],
        averageRating: 0,
        totalReviews: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Dr. Vikram Gupta",
        department: "EE",
        designation: "Professor",
        subjects: ["Power Systems", "Control Systems", "Electrical Machines"],
        averageRating: 0,
        totalReviews: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    const teachersResult = await db.collection("teachers").insertMany(teachersData)
    console.log(`✅ Inserted ${teachersResult.insertedCount} teachers`)

    // 3. SEED ADMIN USER
    console.log("👑 Creating admin user...")
    const adminPassword = await bcrypt.hash("Admin@123", 12)
    const adminUser = {
      name: "KIITease Admin",
      email: "admin@kiitease.com",
      passwordHash: adminPassword,
      branch: "CSE",
      year: 4,
      role: "admin",
      referralCode: "ADMIN001",
      totalReferrals: 0,
      totalReferralEarnings: 0,
      refundEligible: false,
      refundStatus: "not_eligible",
      emailVerified: true,
      authMethod: "password",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await db.collection("users").insertOne(adminUser)
    console.log("✅ Admin user created")

    // 4. SEED SAMPLE NOTES
    console.log("📚 Seeding sample notes...")
    const sampleNotes = [
      {
        title: "Data Structures and Algorithms - Complete Notes",
        description: "Comprehensive notes covering all DSA topics with examples",
        subject: "Data Structures",
        branch: "CSE",
        year: 2,
        semester: 3,
        uploadedBy: new ObjectId(),
        downloadCount: 0,
        isPremium: false,
        isApproved: true,
        tags: ["DSA", "Programming", "Algorithms"],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: "Database Management System - Premium Notes",
        description: "Advanced DBMS concepts with practical examples",
        subject: "Database Management",
        branch: "CSE",
        year: 3,
        semester: 5,
        uploadedBy: new ObjectId(),
        downloadCount: 0,
        isPremium: true,
        isApproved: true,
        tags: ["DBMS", "SQL", "Database"],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: "Digital Electronics Fundamentals",
        description: "Basic to advanced digital electronics concepts",
        subject: "Digital Electronics",
        branch: "ECE",
        year: 2,
        semester: 4,
        uploadedBy: new ObjectId(),
        downloadCount: 0,
        isPremium: false,
        isApproved: true,
        tags: ["Digital", "Electronics", "Logic Gates"],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    const notesResult = await db.collection("notes").insertMany(sampleNotes)
    console.log(`✅ Inserted ${notesResult.insertedCount} sample notes`)

    console.log("\n🎉 Initial data seeding completed!")
    console.log("📊 Database is ready for use!")
  } catch (error) {
    console.error("❌ Data seeding failed:", error)
    throw error
  } finally {
    await client.close()
  }
}

// Run the seeding
seedInitialData()
  .then(() => {
    console.log("✅ Seeding completed successfully!")
  })
  .catch((error) => {
    console.error("💥 Seeding failed:", error)
    process.exit(1)
  })
