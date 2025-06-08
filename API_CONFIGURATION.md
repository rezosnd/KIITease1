# KIITease API Configuration Guide

## Required API Keys & Credentials

### 1. MongoDB Connection String
- **Format:** `mongodb+srv://username:password@cluster.mongodb.net/kiitease`
- **Where to get:** [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **How to set up:**
  1. Create MongoDB Atlas account
  2. Create a new cluster
  3. Create a database user
  4. Get connection string from "Connect" button
  5. Add to `.env.local` as `MONGODB_URI`

### 2. JWT Secret
- **Format:** 32+ character random string
- **How to generate:**
  \`\`\`bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  \`\`\`
- **Add to `.env.local` as `JWT_SECRET`**

### 3. Gmail Credentials
- **Required fields:**
  - `GMAIL_USER`: Your Gmail address
  - `GMAIL_APP_PASSWORD`: 16-character app password
- **How to get App Password:**
  1. Go to [Google Account Security](https://myaccount.google.com/security)
  2. Enable 2-Step Verification
  3. Go to [App passwords](https://myaccount.google.com/apppasswords)
  4. Select "Mail" and "Other" (Custom name: "KIITease")
  5. Copy the 16-character password

### 4. Razorpay API Keys
- **Required fields:**
  - `RAZORPAY_KEY_ID`: Public key for API
  - `RAZORPAY_KEY_SECRET`: Secret key for API
  - `NEXT_PUBLIC_RAZORPAY_KEY_ID`: Same as key ID (for frontend)
- **Where to get:** [Razorpay Dashboard](https://dashboard.razorpay.com/)
- **How to set up:**
  1. Create Razorpay account
  2. Go to Settings → API Keys
  3. Generate Key ID and Secret
  4. Add webhook URL: `https://your-domain.com/api/payment/webhook`

### 5. Google OAuth Credentials
- **Required fields:**
  - `GOOGLE_CLIENT_ID`: OAuth client ID
  - `GOOGLE_CLIENT_SECRET`: OAuth client secret
  - `GOOGLE_REDIRECT_URI`: Callback URL
  - `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: Same as client ID (for frontend)
- **Where to get:** [Google Cloud Console](https://console.cloud.google.com/)
- **How to set up:**
  1. Create new project
  2. Enable Google OAuth API
  3. Configure OAuth consent screen
  4. Create OAuth client ID (Web application)
  5. Add authorized redirect URI: `https://your-domain.com/api/auth/google/callback`

## Files That Need API Configuration

| File | API Keys Needed | Purpose |
|------|----------------|---------|
| `.env.local` | ALL | Environment variables |
| `lib/mongodb.ts` | MongoDB URI | Database connection |
| `lib/auth.ts` | JWT Secret | Authentication |
| `lib/email-service.ts` | Gmail credentials | Email sending |
| `lib/razorpay-service.ts` | Razorpay keys | Payment processing |
| `lib/google-auth.ts` | Google OAuth | Social login |

## Complete Setup Process

1. **Clone the repository:**
   \`\`\`bash
   git clone https://github.com/yourusername/kiitease.git
   cd kiitease
   \`\`\`

2. **Create environment file:**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`

3. **Edit `.env.local` with all API keys**

4. **Set up MongoDB:**
   \`\`\`bash
   ./setup-mongodb.sh "your_mongodb_uri"
   \`\`\`

5. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

6. **Build and start:**
   \`\`\`bash
   npm run build
   npm start
   \`\`\`

## Testing API Configuration

After setup, verify your configuration:

1. **Test MongoDB connection:**
   - Visit `/api/health` - should return status "ok"

2. **Test authentication:**
   - Try logging in with admin credentials
   - Try Google OAuth login
   - Try OTP login

3. **Test payment:**
   - Create a test order
   - Use Razorpay test card: 4111 1111 1111 1111

4. **Test email:**
   - Request password reset
   - Check if email is received

## Troubleshooting

- **MongoDB connection issues:**
  - Check network access in MongoDB Atlas
  - Verify connection string format
  - Check IP whitelist

- **Email sending issues:**
  - Verify Gmail app password
  - Check for Gmail sending limits
  - Try different email service

- **Payment issues:**
  - Verify Razorpay test mode
  - Check webhook configuration
  - Verify key format

- **Google OAuth issues:**
  - Check authorized domains
  - Verify redirect URI
  - Check OAuth consent screen configuration
