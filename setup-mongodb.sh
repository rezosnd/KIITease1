#!/bin/bash

# MongoDB Setup Script for KIITease
echo "🚀 Setting up MongoDB for KIITease..."

# Check if MongoDB URI is provided
if [ -z "$1" ]; then
  echo "❌ Error: MongoDB URI is required"
  echo "Usage: ./setup-mongodb.sh mongodb+srv://username:password@cluster.mongodb.net/kiitease"
  exit 1
fi

# Set MongoDB URI
export MONGODB_URI="$1"

# Run database setup scripts
echo "🗄️ Creating database structure..."
node scripts/00-complete-database-setup.js

echo "🌱 Seeding initial data..."
node scripts/01-seed-initial-data.js

echo "✅ MongoDB setup complete!"
echo "🔑 Admin credentials:"
echo "   Email: admin@kiitease.com"
echo "   Password: Admin@123"
echo ""
echo "⚠️ IMPORTANT: Change the admin password immediately after first login!"
