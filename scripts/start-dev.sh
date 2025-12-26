#!/bin/bash

# Script to start development environment
# Requires: Docker Desktop running

echo "🚀 Starting Torii Nihongo Development Environment..."

# Step 1: Start Infrastructure
echo ""
echo "📦 Starting Infrastructure (PostgreSQL, Redis, NATS)..."
docker-compose up -d postgres redis nats

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 5

# Step 2: Setup Database
echo ""
echo "🗄️  Setting up database..."
cd apps/server
npx prisma generate
npx prisma db push
cd ../..

# Step 3: Start Backend Services
echo ""
echo "🔧 Starting Backend Services..."
echo "Gateway will run on http://localhost:8080"
cd apps/server
pnpm run dev:gateway &
cd ../..

# Step 4: Start Frontend
echo ""
echo "🎨 Starting Frontend..."
echo "Web Admin will run on http://localhost:5173"
cd apps/web-admin
pnpm run dev &
cd ../..

echo ""
echo "✅ Development environment started!"
echo ""
echo "📝 Services:"
echo "  - Gateway: http://localhost:8080"
echo "  - Web Admin: http://localhost:5173"
echo ""
echo "💡 Note: Make sure Docker Desktop is running!"






