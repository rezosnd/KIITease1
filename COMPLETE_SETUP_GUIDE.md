# 🎓 KIITease - Complete Setup & Deployment Guide

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Configuration](#database-configuration)
4. [API Keys & Services](#api-keys--services)
5. [Installation & Build](#installation--build)
6. [Deployment Options](#deployment-options)
7. [Testing & Verification](#testing--verification)
8. [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

### Required Software
- **Node.js 18+** - [Download](https://nodejs.org/)
- **MongoDB Atlas Account** - [Sign up](https://www.mongodb.com/cloud/atlas)
- **Git** - [Download](https://git-scm.com/)

### Required Accounts
- **Gmail Account** (for email services)
- **Razorpay Account** (for payments) - [Sign up](https://razorpay.com/)
- **Google Cloud Console** (for OAuth) - [Console](https://console.cloud.google.com/)
- **Vercel Account** (for deployment) - [Sign up](https://vercel.com/)

---

## ⚙️ Environment Setup

### 1. Clone Repository
\`\`\`bash
git clone https://github.com/yourusername/kiitease.git
cd kiitease
\`\`\`

### 2. Create Environment File
\`\`\`bash
cp .env.example .env.local
\`\`\`

### 3. Complete Environment Variables
Edit `.env.local` with all required variables:

\`\`\`env
# ===== DATABASE CONFIGURATION =====
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kiitease

# ===== AUTHENTICATION =====
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
NEXTAUTH_SECRET=your-nextauth-secret-key-32-characters-minimum
NEXTAUTH_URL=http://localhost:3000

# ===== EMAIL CONFIGURATION (GMAIL) =====
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password

# ===== PAYMENT GATEWAY (RAZORPAY) =====
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret_key
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id

# ===== GOOGLE OAUTH =====
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# ===== SECURITY =====
ENCRYPTION_KEY=your-32-character-encryption-key-for-security
CSRF_SECRET=your-csrf-secret-key-for-protection

# ===== ENVIRONMENT =====
NODE_ENV=development
\`\`\`

---

## 🗄️ Database Configuration

### 1. MongoDB Atlas Setup
1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for free account

2. **Create Cluster**
   - Choose "Build a Database"
   - Select "M0 Sandbox" (Free tier)
   - Choose your preferred region
   - Name your cluster (e.g., "kiitease-cluster")

3. **Create Database User**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Username: `kiitease_admin`
   - Generate secure password
   - Grant "Atlas Admin" privileges

4. **Configure Network Access**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Choose "Allow Access from Anywhere" (0.0.0.0/0)
   - Or add your specific IP addresses

5. **Get Connection String**
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `kiitease`

### 2. Database Setup Scripts
Run these scripts to set up your database:

\`\`\`bash
# Install dependencies first
npm install

# Set up complete database structure
node scripts/00-complete-database-setup.js

# Seed initial data (admin user, settings, etc.)
node scripts/01-seed-initial-data.js

# Add support system collections
node scripts/08-add-support-system.js

# Verify database setup
node scripts/09-support-system-analysis.js
\`\`\`

---

## 🔑 API Keys & Services

### 1. Gmail App Password Setup
1. **Enable 2-Step Verification**
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable "2-Step Verification"

2. **Generate App Password**
   - Go to [App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" as app
   - Select "Other" as device, name it "KIITease"
   - Copy the 16-character password
   - Add to `.env.local` as `GMAIL_APP_PASSWORD`

### 2. Razorpay Setup
1. **Create Razorpay Account**
   - Sign up at [Razorpay](https://razorpay.com/)
   - Complete KYC verification

2. **Get API Keys**
   - Go to Dashboard → Settings → API Keys
   - Generate Key ID and Secret for Test Mode
   - Add to `.env.local`

3. **Configure Webhooks**
   - Go to Settings → Webhooks
   - Add webhook URL: `https://your-domain.com/api/payment/webhook`
   - Select events: `payment.authorized`, `payment.failed`, `payment.captured`
   - Set secret for webhook verification

### 3. Google OAuth Setup
1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create new project named "KIITease"

2. **Enable APIs**
   - Go to "APIs & Services" → "Library"
   - Enable "Google+ API" and "Gmail API"

3. **Configure OAuth Consent Screen**
   - Go to "APIs & Services" → "OAuth consent screen"
   - Choose "External" user type
   - Fill in application details:
     - App name: "KIITease"
     - User support email: your email
     - Developer contact: your email

4. **Create OAuth Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Name: "KIITease Web Client"
   - Authorized JavaScript origins: `http://localhost:3000`, `https://your-domain.com`
   - Authorized redirect URIs: `http://localhost:3000/api/auth/google/callback`
   - Copy Client ID and Secret to `.env.local`

### 4. Generate Security Keys
\`\`\`bash
# Generate JWT Secret (32+ characters)
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"

# Generate NextAuth Secret
node -e "console.log('NEXTAUTH_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"

# Generate Encryption Key
node -e "console.log('ENCRYPTION_KEY=' + require('crypto').randomBytes(32).toString('hex'))"

# Generate CSRF Secret
node -e "console.log('CSRF_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
\`\`\`

---

## 📦 Installation & Build

### 1. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 2. Build Application
\`\`\`bash
npm run build
\`\`\`

### 3. Start Development Server
\`\`\`bash
npm run dev
\`\`\`

### 4. Start Production Server
\`\`\`bash
npm start
\`\`\`

---

## 🚀 Deployment Options

### Option 1: Vercel Deployment (Recommended)

1. **Install Vercel CLI**
   \`\`\`bash
   npm i -g vercel
   \`\`\`

2. **Deploy to Vercel**
   \`\`\`bash
   vercel
   \`\`\`

3. **Configure Environment Variables**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add all variables from `.env.local`
   - Make sure to update `NEXTAUTH_URL` to your Vercel domain

4. **Update OAuth Redirect URIs**
   - Update Google OAuth redirect URIs with your Vercel domain
   - Update Razorpay webhook URL with your Vercel domain

### Option 2: Docker Deployment

1. **Build Docker Image**
   \`\`\`bash
   docker build -t kiitease .
   \`\`\`

2. **Run Container**
   \`\`\`bash
   docker run -p 3000:3000 --env-file .env.local kiitease
   \`\`\`

### Option 3: Traditional VPS Deployment

1. **Setup PM2**
   \`\`\`bash
   npm install -g pm2
   \`\`\`

2. **Start with PM2**
   \`\`\`bash
   pm2 start npm --name "kiitease" -- start
   pm2 save
   pm2 startup
   \`\`\`

---

## ✅ Testing & Verification

### 1. Database Connection Test
\`\`\`bash
# Test MongoDB connection
curl http://localhost:3000/api/health
# Should return: {"status":"ok","database":"connected"}
\`\`\`

### 2. Authentication Tests
- **Admin Login**: `admin@kiitease.com` / `Admin@123`
- **Google OAuth**: Test Google sign-in
- **OTP Login**: Test email OTP functionality
- **Registration**: Test new user registration

### 3. Payment System Test
- **Test Card**: 4111 1111 1111 1111
- **CVV**: Any 3 digits
- **Expiry**: Any future date
- **Test referral code**: Use admin's referral code

### 4. Support System Test
- **Free User**: Test email support
- **Premium User**: Test live chat (24/7)
- **Admin Dashboard**: Test ticket management

### 5. Email System Test
- Test welcome emails
- Test OTP emails
- Test payment confirmation emails
- Test support notification emails

---

## 🔧 Troubleshooting

### Common Issues & Solutions

#### Database Connection Issues
\`\`\`bash
# Check MongoDB URI format
# Correct: mongodb+srv://username:password@cluster.mongodb.net/kiitease
# Verify IP whitelist in MongoDB Atlas
# Check network connectivity
\`\`\`

#### Email Sending Issues
\`\`\`bash
# Verify Gmail App Password (16 characters, no spaces)
# Check Gmail account security settings
# Verify 2-Step Verification is enabled
# Test with different email provider if needed
\`\`\`

#### Payment Issues
\`\`\`bash
# Verify Razorpay test mode is enabled
# Check API key format (starts with rzp_test_)
# Verify webhook URL is accessible
# Check webhook secret configuration
\`\`\`

#### Google OAuth Issues
\`\`\`bash
# Verify OAuth consent screen is configured
# Check authorized domains and redirect URIs
# Ensure APIs are enabled in Google Cloud Console
# Verify client ID format (.apps.googleusercontent.com)
\`\`\`

#### Build/Runtime Issues
\`\`\`bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check Node.js version (18+ required)
node --version
\`\`\`

---

## 📊 Default Credentials & Settings

### Admin Access
- **Email**: `admin@kiitease.com`
- **Password**: `Admin@123`
- **⚠️ IMPORTANT**: Change this password immediately after first login!

### System Settings
- **Premium Price**: ₹499 (lifetime)
- **Referral Reward**: ₹50 per referral (10%)
- **Refund Eligibility**: 20 successful referrals
- **OTP Expiry**: 10 minutes
- **File Upload Limit**: 10MB
- **Supported Branches**: CSE, ECE, ME, CE, EE, IT, ETC, EEE, CSSE, CSCE

### Support System
- **Free Users**: Email support (24-48 hours)
- **Premium Users**: Live chat (24/7)
- **Admin Dashboard**: Complete ticket management
- **Auto-notifications**: Email + in-app alerts

---

## 🎯 Post-Deployment Checklist

- [ ] Database connection working
- [ ] Admin login successful
- [ ] Email system sending emails
- [ ] Payment system processing test transactions
- [ ] Google OAuth working
- [ ] OTP system functional
- [ ] Support chat working for premium users
- [ ] Admin dashboard accessible
- [ ] Terms & Privacy pages accessible
- [ ] Mobile responsiveness verified
- [ ] SSL certificate installed (production)
- [ ] Backup system configured
- [ ] Monitoring tools set up

---

## 📞 Support & Contact

- **Email**: support@kiitease.com
- **Documentation**: [GitHub Wiki](https://github.com/yourusername/kiitease/wiki)
- **Issues**: [GitHub Issues](https://github.com/yourusername/kiitease/issues)
- **Live Chat**: Available 24/7 for premium users

---

**🎉 Congratulations! Your KIITease platform is now fully deployed and ready to serve KIIT University students!**
