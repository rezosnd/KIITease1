#!/bin/bash

echo "🐳 Deploying with Docker..."

# Build and start containers
docker-compose up -d --build

# Wait for services to be ready
echo "Waiting for services to start..."
sleep 30

# Run database setup
echo "Setting up database..."
docker-compose exec app node scripts/01-setup-mongodb.js
docker-compose exec app node scripts/02-seed-data.js

# Health check
echo "Running health check..."
curl -f http://localhost/api/health || exit 1

echo "✅ Docker deployment completed!"
echo "🌐 Your app is running at: http://localhost"
