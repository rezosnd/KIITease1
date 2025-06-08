#!/bin/bash

# KIITease Complete Deployment Script
echo "🚀 Starting KIITease Deployment..."

# 1. Environment Setup
echo "⚙️ Setting up environment variables..."
cp .env.example .env.local

# Prompt for environment variables
read -p "Enter MongoDB URI: " mongodb_uri
read -p "Enter JWT Secret (min 32 chars): " jwt_secret
read -p "Enter Gmail User: " gmail_user
read -sp "Enter Gmail App Password: " gmail_password
echo ""
read -p "Enter Razorpay Key ID: " razorpay_key_id
read -sp "Enter Razorpay Key Secret: " razorpay_key_secret
echo ""
read -p "Enter Google Client ID: " google_client_id
read -sp "Enter Google Client Secret: " google_client_secret
echo ""

# Update .env.local file
sed -i "s|MONGODB_URI=.*|MONGODB_URI=$mongodb_uri|g" .env.local
sed -i "s|JWT_SECRET=.*|JWT_SECRET=$jwt_secret|g" .env.local
sed -i "s|GMAIL_USER=.*|GMAIL_USER=$gmail_user|g" .env.local
sed -i "s|GMAIL_APP_PASSWORD=.*|GMAIL_APP_PASSWORD=$gmail_password|g" .env.local
sed -i "s|RAZORPAY_KEY_ID=.*|RAZORPAY_KEY_ID=$razorpay_key_id|g" .env.local
sed -i "s|RAZORPAY_KEY_SECRET=.*|RAZORPAY_KEY_SECRET=$razorpay_key_secret|g" .env.local
sed -i "s|NEXT_PUBLIC_RAZORPAY_KEY_ID=.*|NEXT_PUBLIC_RAZORPAY_KEY_ID=$razorpay_key_id|g" .env.local
sed -i "s|GOOGLE_CLIENT_ID=.*|GOOGLE_CLIENT_ID=$google_client_id|g" .env.local
sed -i "s|GOOGLE_CLIENT_SECRET=.*|GOOGLE_CLIENT_SECRET=$google_client_secret|g" .env.local
sed -i "s|NEXT_PUBLIC_GOOGLE_CLIENT_ID=.*|NEXT_PUBLIC_GOOGLE_CLIENT_ID=$google_client_id|g" .env.local

echo "✅ Environment variables configured!"

# 2. Install dependencies
echo "📦 Installing dependencies..."
npm install

# 3. Setup database
echo "🗄️ Setting up database..."
node scripts/00-complete-database-setup.js
node scripts/01-seed-initial-data.js

# 4. Build the application
echo "🏗️ Building application..."
npm run build

# 5. Start the application
echo "🚀 Starting KIITease..."
npm start

echo "✅ KIITease deployment complete! Access at http://localhost:3000"
