#!/bin/bash

# KIITease Quick Setup Script
echo "🚀 KIITease Quick Setup Starting..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ required. Current version: $(node -v)"
    exit 1
fi

print_status "Node.js version check passed: $(node -v)"

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    print_warning ".env.local not found. Creating from template..."
    cp .env.example .env.local
    print_info "Please edit .env.local with your API keys before continuing."
    print_info "Run: nano .env.local"
    exit 1
fi

print_status ".env.local found"

# Install dependencies
print_info "Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    print_status "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Setup database
print_info "Setting up database..."
node scripts/00-complete-database-setup.js

if [ $? -eq 0 ]; then
    print_status "Database setup completed"
else
    print_error "Database setup failed. Check your MongoDB URI in .env.local"
    exit 1
fi

# Seed initial data
print_info "Seeding initial data..."
node scripts/01-seed-initial-data.js

if [ $? -eq 0 ]; then
    print_status "Initial data seeded successfully"
else
    print_warning "Initial data seeding had issues, but continuing..."
fi

# Setup support system
print_info "Setting up support system..."
node scripts/08-add-support-system.js

if [ $? -eq 0 ]; then
    print_status "Support system setup completed"
else
    print_warning "Support system setup had issues, but continuing..."
fi

# Build the application
print_info "Building application..."
npm run build

if [ $? -eq 0 ]; then
    print_status "Application built successfully"
else
    print_error "Build failed. Check for errors above."
    exit 1
fi

# Final status
echo ""
echo "🎉 KIITease Setup Complete!"
echo ""
print_status "Database: Configured and seeded"
print_status "Dependencies: Installed"
print_status "Application: Built successfully"
echo ""
print_info "Default Admin Credentials:"
echo "  Email: admin@kiitease.com"
echo "  Password: Admin@123"
echo ""
print_warning "IMPORTANT: Change the admin password after first login!"
echo ""
print_info "To start the application:"
echo "  Development: npm run dev"
echo "  Production:  npm start"
echo ""
print_info "Access your application at: http://localhost:3000"
echo ""
print_info "Need help? Check COMPLETE_SETUP_GUIDE.md for detailed instructions."
