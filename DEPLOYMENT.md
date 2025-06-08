# KIITease Deployment Guide

## 1. Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account or local MongoDB server
- Gmail account with App Password enabled
- Razorpay account (for payments)
- Google Cloud Console project (for OAuth)

## 2. API Keys & Credentials Setup

### MongoDB Setup
1. Create a MongoDB Atlas cluster or use local MongoDB
2. Create a database named `kiitease`
3. Get your MongoDB connection string:
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/kiitease`

### JWT Secret
1. Generate a secure random string (min 32 characters)
   \`\`\`bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   \`\`\`

### Gmail Setup
1. Go to your Google Account → Security
2. Enable 2-Step Verification
3. Create an App Password:
   - Select "Mail" as app
   - Select "Other" as device
   - Name it "KIITease"
   - Copy the 16-character password

### Razorpay Setup
1. Create a Razorpay account at [razorpay.com](https://razorpay.com)
2. Go to Dashboard → Settings → API Keys
3. Generate API keys (Key ID and Secret)
4. Set up webhooks:
   - Add webhook URL: `https://your-domain.com/api/payment/webhook`
   - Select events: `payment.authorized`, `payment.failed`

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Go to "APIs & Services" → "Credentials"
4. Create OAuth client ID:
   - Application type: Web application
   - Name: KIITease
   - Authorized JavaScript origins: `https://your-domain.com`
   - Authorized redirect URIs: `https://your-domain.com/api/auth/google/callback`
5. Copy Client ID and Client Secret

## 3. Environment Variables

Create a `.env.local` file with these variables:

\`\`\`env
# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kiitease

# Authentication
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
NEXTAUTH_SECRET=your-nextauth-secret-key

# Email Configuration (Gmail)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password

# Payment Gateway (Razorpay)
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret_key
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id

# Security
ENCRYPTION_KEY=your-32-character-encryption-key
CSRF_SECRET=your-csrf-secret-key

# Environment
NODE_ENV=production
NEXTAUTH_URL=https://your-domain.com

# Optional: Email Rate Limiting
EMAIL_RATE_LIMIT=100
EMAIL_BATCH_SIZE=50
EMAIL_DELAY_MS=5000
\`\`\`

## 4. Database Setup

Run the database setup scripts:

\`\`\`bash
node scripts/00-complete-database-setup.js
node scripts/01-seed-initial-data.js
\`\`\`

## 5. Build and Deploy

### Local Development
\`\`\`bash
npm install
npm run dev
\`\`\`

### Production Build
\`\`\`bash
npm install
npm run build
npm start
\`\`\`

### Vercel Deployment
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Configure environment variables in Vercel dashboard

### Docker Deployment
\`\`\`bash
docker build -t kiitease .
docker run -p 3000:3000 kiitease
\`\`\`

## 6. Post-Deployment

1. **Admin Access**:
   - Email: `admin@kiitease.com`
   - Password: `Admin@123`
   - Change this password immediately!

2. **Verify Functionality**:
   - Test authentication (Password, Google, OTP)
   - Test payment flow
   - Test referral system
   - Test notes upload/download

3. **Security Checklist**:
   - Enable rate limiting
   - Set up monitoring
   - Configure backups
   - Enable HTTPS

## 7. Troubleshooting

- **Database Connection Issues**:
  - Check MongoDB URI format
  - Verify IP whitelist in MongoDB Atlas

- **Email Not Sending**:
  - Verify Gmail App Password
  - Check for rate limiting

- **Payment Issues**:
  - Verify Razorpay API keys
  - Check webhook configuration

- **Authentication Problems**:
  - Verify Google OAuth setup
  - Check JWT secret configuration
