// MongoDB script to add OTP and pending registration collections for KIITease
const db = db.getSiblingDB("kiitease")

console.log("🚀 Updating KIITease MongoDB database for Google Auth + OTP...")

// 1. Create OTP collection with TTL index
console.log("📱 Creating OTP collection...")
db.createCollection("otps")
db.otps.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
db.otps.createIndex({ email: 1, type: 1 })
db.otps.createIndex({ email: 1, createdAt: 1 })

// 2. Create pending registrations collection with TTL index
console.log("⏳ Creating pending registrations collection...")
db.createCollection("pending_registrations")
db.pending_registrations.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
db.pending_registrations.createIndex({ email: 1 })

// 3. Create email logs collection for tracking
console.log("📧 Creating email logs collection...")
db.createCollection("email_logs")
db.email_logs.createIndex({ sentAt: 1 })
db.email_logs.createIndex({ recipients: 1 })
db.email_logs.createIndex({ type: 1 })

// 4. Create rate limiting collection
console.log("🛡️ Creating rate limiting collection...")
db.createCollection("rate_limits")
db.rate_limits.createIndex({ key: 1 })
db.rate_limits.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })

// 5. Update existing users collection for Google Auth
console.log("👤 Updating users collection schema...")
db.users.updateMany(
  {},
  {
    $set: {
      emailVerified: { $ifNull: ["$emailVerified", false] },
      googleId: { $ifNull: ["$googleId", null] },
      profilePicture: { $ifNull: ["$profilePicture", null] },
      authMethod: { $ifNull: ["$authMethod", "password"] },
    },
  },
)

// Add new indexes for users collection
db.users.createIndex({ googleId: 1 }, { sparse: true })
db.users.createIndex({ emailVerified: 1 })
db.users.createIndex({ authMethod: 1 })

// 6. Create announcements collection if not exists
console.log("📢 Creating announcements collection...")
if (!db.getCollectionNames().includes("announcements")) {
  db.createCollection("announcements")
}
db.announcements.createIndex({ createdAt: 1 })
db.announcements.createIndex({ targetRole: 1 })
db.announcements.createIndex({ active: 1 })

// 7. Create system settings collection
console.log("⚙️ Creating system settings collection...")
db.createCollection("system_settings")
db.system_settings.createIndex({ key: 1 }, { unique: true })

// Insert default system settings
db.system_settings.insertMany([
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
    },
    updatedAt: new Date(),
  },
])

console.log("✅ KIITease MongoDB database updated successfully!")
console.log("📊 Collections created/updated:")
console.log("   - otps (with TTL indexes)")
console.log("   - pending_registrations (with TTL indexes)")
console.log("   - email_logs")
console.log("   - rate_limits")
console.log("   - system_settings")
console.log("   - users (schema updated)")
console.log("   - announcements")
console.log("")
console.log("🎯 Ready for Google Auth + OTP authentication!")
