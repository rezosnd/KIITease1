#!/bin/bash

echo "🚀 KIITease Database Setup Script"
echo "================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if MongoDB is running
echo "🔍 Checking MongoDB connection..."
if ! node -e "const { MongoClient } = require('mongodb'); const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017'); client.connect().then(() => { console.log('✅ MongoDB connected'); client.close(); }).catch(() => { console.log('❌ MongoDB connection failed'); process.exit(1); })"; then
    echo "❌ Cannot connect to MongoDB. Please check your connection."
    exit 1
fi

# Install required dependencies
echo "📦 Installing required dependencies..."
npm install mongodb bcryptjs

# Run database setup
echo "🗄️ Setting up database collections..."
node scripts/00-complete-database-setup.js

if [ $? -eq 0 ]; then
    echo "✅ Database setup completed successfully!"
    
    # Run data seeding
    echo "🌱 Seeding initial data..."
    node scripts/01-seed-initial-data.js
    
    if [ $? -eq 0 ]; then
        echo "🎉 Database setup and seeding completed!"
        echo ""
        echo "📋 Setup Summary:"
        echo "   ✅ 13 Collections created"
        echo "   ✅ Indexes optimized"
        echo "   ✅ Initial data seeded"
        echo "   ✅ Admin user created"
        echo "   ✅ System settings configured"
        echo ""
        echo "🔐 Admin Login:"
        echo "   Email: admin@kiitease.com"
        echo "   Password: Admin@123"
        echo ""
        echo "🚀 Your KIITease database is ready!"
    else
        echo "❌ Data seeding failed!"
        exit 1
    fi
else
    echo "❌ Database setup failed!"
    exit 1
fi
