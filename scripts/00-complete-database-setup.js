// Complete MongoDB Database Setup for KIITease Platform
const { MongoClient } = require("mongodb")

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017"
const DB_NAME = "kiitease"

async function setupCompleteDatabase() {
  const client = new MongoClient(MONGODB_URI)

  try {
    console.log("🚀 Starting KIITease Database Setup...")
    await client.connect()
    console.log("✅ Connected to MongoDB")

    const db = client.db(DB_NAME)

    // Drop existing database for fresh setup (CAUTION: Only for initial setup)
    console.log("🗑️ Cleaning existing database...")
    await db.dropDatabase()
    console.log("✅ Database cleaned")

    // 1. USERS COLLECTION
    console.log("👤 Creating users collection...")
    await db.createCollection("users", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["name", "email", "role", "referralCode", "branch", "year"],
          properties: {
            name: { bsonType: "string", minLength: 2, maxLength: 100 },
            email: { bsonType: "string", pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$" },
            passwordHash: { bsonType: "string" },
            googleId: { bsonType: "string" },
            profilePicture: { bsonType: "string" },
            branch: { bsonType: "string", enum: ["CSE", "ECE", "ME", "CE", "EE", "IT", "ETC", "CSSE", "CSCE"] },
            year: { bsonType: "int", minimum: 1, maximum: 4 },
            role: { bsonType: "string", enum: ["free", "paid", "admin"] },
            referralCode: { bsonType: "string", minLength: 6, maxLength: 10 },
            referredBy: { bsonType: "objectId" },
            totalReferrals: { bsonType: "int", minimum: 0 },
            totalReferralEarnings: { bsonType: "number", minimum: 0 },
            paymentId: { bsonType: "string" },
            paymentAmount: { bsonType: "number" },
            paymentDate: { bsonType: "date" },
            refundEligible: { bsonType: "bool" },
            refundStatus: { bsonType: "string", enum: ["not_eligible", "eligible", "requested", "processed"] },
            emailVerified: { bsonType: "bool" },
            authMethod: { bsonType: "string", enum: ["password", "google", "otp"] },
            isActive: { bsonType: "bool" },
            lastLogin: { bsonType: "date" },
            createdAt: { bsonType: "date" },
            updatedAt: { bsonType: "date" },
          },
        },
      },
    })

    // Users indexes
    await db
      .collection("users")
      .createIndexes([
        { key: { email: 1 }, unique: true },
        { key: { referralCode: 1 }, unique: true },
        { key: { googleId: 1 }, unique: true, sparse: true },
        { key: { branch: 1, year: 1 } },
        { key: { role: 1 } },
        { key: { referredBy: 1 } },
        { key: { emailVerified: 1 } },
        { key: { authMethod: 1 } },
        { key: { createdAt: -1 } },
      ])

    // 2. PAYMENT ORDERS COLLECTION
    console.log("💳 Creating payment_orders collection...")
    await db.createCollection("payment_orders", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["userId", "orderId", "amount", "currency", "status"],
          properties: {
            userId: { bsonType: "objectId" },
            orderId: { bsonType: "string" },
            razorpayOrderId: { bsonType: "string" },
            razorpayPaymentId: { bsonType: "string" },
            razorpaySignature: { bsonType: "string" },
            amount: { bsonType: "number", minimum: 0 },
            currency: { bsonType: "string", enum: ["INR"] },
            status: { bsonType: "string", enum: ["created", "pending", "completed", "failed", "cancelled"] },
            referralCode: { bsonType: "string" },
            referrerId: { bsonType: "objectId" },
            referralReward: { bsonType: "number" },
            failureReason: { bsonType: "string" },
            createdAt: { bsonType: "date" },
            updatedAt: { bsonType: "date" },
          },
        },
      },
    })

    await db
      .collection("payment_orders")
      .createIndexes([
        { key: { orderId: 1 }, unique: true },
        { key: { userId: 1, createdAt: -1 } },
        { key: { razorpayOrderId: 1 }, sparse: true },
        { key: { status: 1 } },
        { key: { referrerId: 1 } },
        { key: { createdAt: -1 } },
      ])

    // 3. REFERRALS COLLECTION
    console.log("🎁 Creating referrals collection...")
    await db.createCollection("referrals", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["referrerId", "referredUserId", "referralCode", "status"],
          properties: {
            referrerId: { bsonType: "objectId" },
            referredUserId: { bsonType: "objectId" },
            referralCode: { bsonType: "string" },
            paymentOrderId: { bsonType: "objectId" },
            rewardAmount: { bsonType: "number", minimum: 0 },
            status: { bsonType: "string", enum: ["pending", "completed", "failed"] },
            completedAt: { bsonType: "date" },
            createdAt: { bsonType: "date" },
          },
        },
      },
    })

    await db
      .collection("referrals")
      .createIndexes([
        { key: { referrerId: 1, status: 1 } },
        { key: { referredUserId: 1 } },
        { key: { referralCode: 1 } },
        { key: { paymentOrderId: 1 } },
        { key: { createdAt: -1 } },
      ])

    // 4. NOTES COLLECTION
    console.log("📚 Creating notes collection...")
    await db.createCollection("notes", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["title", "subject", "branch", "year", "uploadedBy"],
          properties: {
            title: { bsonType: "string", minLength: 3, maxLength: 200 },
            description: { bsonType: "string", maxLength: 1000 },
            subject: { bsonType: "string", minLength: 2, maxLength: 100 },
            branch: { bsonType: "string", enum: ["CSE", "ECE", "ME", "CE", "EE", "IT", "ETC", "CSSE", "CSCE"] },
            year: { bsonType: "int", minimum: 1, maximum: 4 },
            semester: { bsonType: "int", minimum: 1, maximum: 8 },
            fileUrl: { bsonType: "string" },
            fileName: { bsonType: "string" },
            fileSize: { bsonType: "number" },
            fileType: { bsonType: "string" },
            uploadedBy: { bsonType: "objectId" },
            downloadCount: { bsonType: "int", minimum: 0 },
            isPremium: { bsonType: "bool" },
            isApproved: { bsonType: "bool" },
            tags: { bsonType: "array", items: { bsonType: "string" } },
            createdAt: { bsonType: "date" },
            updatedAt: { bsonType: "date" },
          },
        },
      },
    })

    await db
      .collection("notes")
      .createIndexes([
        { key: { branch: 1, year: 1, semester: 1 } },
        { key: { subject: 1 } },
        { key: { title: "text", subject: "text", description: "text" } },
        { key: { uploadedBy: 1 } },
        { key: { isPremium: 1 } },
        { key: { isApproved: 1 } },
        { key: { createdAt: -1 } },
        { key: { downloadCount: -1 } },
      ])

    // 5. TEACHERS COLLECTION
    console.log("👨‍🏫 Creating teachers collection...")
    await db.createCollection("teachers", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["name", "department"],
          properties: {
            name: { bsonType: "string", minLength: 2, maxLength: 100 },
            department: { bsonType: "string", enum: ["CSE", "ECE", "ME", "CE", "EE", "IT", "ETC", "CSSE", "CSCE"] },
            designation: { bsonType: "string" },
            subjects: { bsonType: "array", items: { bsonType: "string" } },
            averageRating: { bsonType: "number", minimum: 0, maximum: 5 },
            totalReviews: { bsonType: "int", minimum: 0 },
            profilePicture: { bsonType: "string" },
            isActive: { bsonType: "bool" },
            createdAt: { bsonType: "date" },
            updatedAt: { bsonType: "date" },
          },
        },
      },
    })

    await db
      .collection("teachers")
      .createIndexes([
        { key: { name: 1 } },
        { key: { department: 1 } },
        { key: { averageRating: -1 } },
        { key: { totalReviews: -1 } },
        { key: { isActive: 1 } },
      ])

    // 6. REVIEWS COLLECTION
    console.log("⭐ Creating reviews collection...")
    await db.createCollection("reviews", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["teacherId", "userId", "rating", "subject"],
          properties: {
            teacherId: { bsonType: "objectId" },
            userId: { bsonType: "objectId" },
            rating: { bsonType: "int", minimum: 1, maximum: 5 },
            subject: { bsonType: "string", minLength: 2, maxLength: 100 },
            comment: { bsonType: "string", maxLength: 1000 },
            branch: { bsonType: "string", enum: ["CSE", "ECE", "ME", "CE", "EE", "IT", "ETC", "CSSE", "CSCE"] },
            year: { bsonType: "int", minimum: 1, maximum: 4 },
            semester: { bsonType: "int", minimum: 1, maximum: 8 },
            isAnonymous: { bsonType: "bool" },
            isApproved: { bsonType: "bool" },
            createdAt: { bsonType: "date" },
            updatedAt: { bsonType: "date" },
          },
        },
      },
    })

    await db
      .collection("reviews")
      .createIndexes([
        { key: { teacherId: 1, createdAt: -1 } },
        { key: { userId: 1 } },
        { key: { rating: 1 } },
        { key: { branch: 1, year: 1 } },
        { key: { subject: 1 } },
        { key: { isApproved: 1 } },
        { key: { createdAt: -1 } },
      ])

    // 7. OTP COLLECTION (with TTL)
    console.log("📱 Creating otps collection...")
    await db.createCollection("otps")
    await db
      .collection("otps")
      .createIndexes([
        { key: { expiresAt: 1 }, expireAfterSeconds: 0 },
        { key: { email: 1, type: 1 } },
        { key: { email: 1, createdAt: 1 } },
      ])

    // 8. RATE LIMITS COLLECTION (with TTL)
    console.log("🛡️ Creating rate_limits collection...")
    await db.createCollection("rate_limits")
    await db
      .collection("rate_limits")
      .createIndexes([{ key: { key: 1 } }, { key: { expiresAt: 1 }, expireAfterSeconds: 0 }])

    // 9. AUDIT LOGS COLLECTION
    console.log("📋 Creating audit_logs collection...")
    await db.createCollection("audit_logs")
    await db
      .collection("audit_logs")
      .createIndexes([
        { key: { userId: 1, createdAt: -1 } },
        { key: { action: 1 } },
        { key: { ipAddress: 1 } },
        { key: { createdAt: -1 } },
      ])

    // 10. EMAIL LOGS COLLECTION
    console.log("📧 Creating email_logs collection...")
    await db.createCollection("email_logs")
    await db
      .collection("email_logs")
      .createIndexes([{ key: { sentAt: 1 } }, { key: { recipients: 1 } }, { key: { type: 1 } }, { key: { status: 1 } }])

    // 11. NOTIFICATIONS COLLECTION
    console.log("🔔 Creating notifications collection...")
    await db.createCollection("notifications")
    await db
      .collection("notifications")
      .createIndexes([
        { key: { userId: 1, createdAt: -1 } },
        { key: { isRead: 1 } },
        { key: { type: 1 } },
        { key: { createdAt: -1 } },
      ])

    // 12. REFUNDS COLLECTION
    console.log("💰 Creating refunds collection...")
    await db.createCollection("refunds", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["userId", "amount", "status"],
          properties: {
            userId: { bsonType: "objectId" },
            paymentOrderId: { bsonType: "objectId" },
            amount: { bsonType: "number", minimum: 0 },
            reason: { bsonType: "string" },
            status: { bsonType: "string", enum: ["requested", "approved", "processed", "rejected"] },
            processedBy: { bsonType: "objectId" },
            processedAt: { bsonType: "date" },
            refundId: { bsonType: "string" },
            createdAt: { bsonType: "date" },
            updatedAt: { bsonType: "date" },
          },
        },
      },
    })

    await db
      .collection("refunds")
      .createIndexes([
        { key: { userId: 1, createdAt: -1 } },
        { key: { status: 1 } },
        { key: { processedBy: 1 } },
        { key: { createdAt: -1 } },
      ])

    // 13. SYSTEM SETTINGS COLLECTION
    console.log("⚙️ Creating system_settings collection...")
    await db.createCollection("system_settings")
    await db.collection("system_settings").createIndex({ key: 1 }, { unique: true })

    console.log("✅ All collections created successfully!")
    console.log("📊 Database setup completed!")

    // Get collection stats
    const collections = await db.listCollections().toArray()
    console.log(`\n📈 Created ${collections.length} collections:`)
    collections.forEach((col, index) => {
      console.log(`   ${index + 1}. ${col.name}`)
    })
  } catch (error) {
    console.error("❌ Database setup failed:", error)
    throw error
  } finally {
    await client.close()
    console.log("🔌 MongoDB connection closed")
  }
}

// Run the setup
setupCompleteDatabase()
  .then(() => {
    console.log("\n🎉 KIITease Database Setup Complete!")
    console.log("🚀 Ready to run seed data script...")
  })
  .catch((error) => {
    console.error("💥 Setup failed:", error)
    process.exit(1)
  })
