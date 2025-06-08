#!/bin/bash

# Production deployment script
echo "🚀 Starting deployment..."

# Check if required environment variables are set
required_vars=("MONGODB_URI" "JWT_SECRET" "GMAIL_USER" "GMAIL_APP_PASSWORD")
for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "❌ Error: $var is not set"
    exit 1
  fi
done

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Build the application
echo "🔨 Building application..."
npm run build

# Run database migrations/setup
echo "🗄️ Setting up database..."
node scripts/01-setup-mongodb.js
node scripts/02-seed-data.js

# Health check
echo "🏥 Running health check..."
curl -f http://localhost:3000/api/health || exit 1

echo "✅ Deployment completed successfully!"
