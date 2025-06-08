#!/bin/bash

echo "🚀 Deploying to Vercel..."

# Install Vercel CLI if not installed
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm i -g vercel
fi

# Set environment variables
echo "Setting environment variables..."
vercel env add MONGODB_URI
vercel env add JWT_SECRET
vercel env add GMAIL_USER
vercel env add GMAIL_APP_PASSWORD
vercel env add RAZORPAY_KEY_ID
vercel env add RAZORPAY_KEY_SECRET

# Deploy to production
echo "Deploying to production..."
vercel --prod

echo "✅ Deployment completed!"
echo "🌐 Your app is live at: https://your-app.vercel.app"
