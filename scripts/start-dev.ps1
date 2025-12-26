# Script to start development environment
# Requires: Docker Desktop running

Write-Host "🚀 Starting Torii Nihongo Development Environment..." -ForegroundColor Cyan

# Step 1: Start Infrastructure
Write-Host "`n📦 Starting Infrastructure (PostgreSQL, Redis, NATS)..." -ForegroundColor Yellow
docker-compose up -d postgres redis nats

# Wait for services to be ready
Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Step 2: Setup Database
Write-Host "`n🗄️  Setting up database..." -ForegroundColor Yellow
cd apps/server
npx prisma generate
npx prisma db push
cd ../..

# Step 3: Start Backend Services
Write-Host "`n🔧 Starting Backend Services..." -ForegroundColor Yellow
Write-Host "Gateway will run on http://localhost:8080" -ForegroundColor Green
cd apps/server
Start-Process powershell -ArgumentList "-NoExit", "-Command", "pnpm run dev:gateway"
cd ../..

# Step 4: Start Frontend
Write-Host "`n🎨 Starting Frontend..." -ForegroundColor Yellow
Write-Host "Web Admin will run on http://localhost:5173" -ForegroundColor Green
cd apps/web-admin
Start-Process powershell -ArgumentList "-NoExit", "-Command", "pnpm run dev"
cd ../..

Write-Host "`n✅ Development environment started!" -ForegroundColor Green
Write-Host "`n📝 Services:" -ForegroundColor Cyan
Write-Host "  - Gateway: http://localhost:8080" -ForegroundColor White
Write-Host "  - Web Admin: http://localhost:5173" -ForegroundColor White
Write-Host "`n💡 Note: Make sure Docker Desktop is running!" -ForegroundColor Yellow






