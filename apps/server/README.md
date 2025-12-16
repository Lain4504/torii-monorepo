# Torii Server (NestJS)

Back-end server logic cho Torii LMS, được thiết kế bằng kiến trúc NestJS hiện đại, hỗ trợ đầy đủ Protobuf, NATS JetStream, GraphQL/REST, và LiveKit integration.

---

## 📑 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Technology Stack](#technology-stack)
- [Quick Start](#quick-start)
- [Environment Configuration](#environment-configuration)
- [Running the Server](#running-the-server)
- [Project Structure](#project-structure)
- [Development Workflows](#development-workflows)
- [Troubleshooting](#troubleshooting)

---

## Architecture Overview

Dự án sử dụng mô hình **Monorepo** với các microservices:

### **Services:**
- **Gateway (`modules/gateway`)** - Port 8080
  - Entry point duy nhất cho tất cả requests
  - **GraphQL**: Management APIs (Courses, Users)
  - **REST/Protobuf**: Room APIs
  - **WebSocket**: LiveKit webhooks và realtime events

- **Room Service (`modules/room-service`)** - Port 8083
  - Quản lý logic phòng họp (rooms, polls, breakouts, recordings)
  - Sử dụng **Protobuf** để giao tiếp
  - Sync state với **NATS JetStream KV Stores**

- **Auth Service (`modules/auth-service`)** - Port 8081
  - JWT authentication và authorization

- **Course Service (`modules/course-service`)** - Port 8082
  - CRUD operations cho courses qua Prisma

### **Infrastructure Dependencies:**
- **PostgreSQL**: Primary database
- **Redis**: Caching, polls data, microservices communication
- **NATS JetStream**: Message broker, KV store, analytics
- **LiveKit**: Video conferencing (sử dụng Cloud hoặc self-hosted)

---

## Technology Stack

- **Framework**: NestJS v11
- **Database**: PostgreSQL via Prisma ORM
- **Message Broker**: NATS JetStream (Pub/Sub & Key-Value Store)
- **Caching**: Redis (ioredis)
- **API Protocols**:
  - **Protobuf** (`application/protobuf`): Room APIs
  - **GraphQL**: Management APIs
  - **REST**: File upload/download
- **Type Generation**: `ts-proto`, `@nestjs/graphql`, `prisma generate`
- **Video Infrastructure**: LiveKit

---

## Quick Start

### **TL;DR:**

```bash
# 1. Start infrastructure services
docker-compose up -d postgres redis nats

# 2. Setup environment
cp .env.example .env
# Edit .env với your credentials (xem Environment Configuration bên dưới)

# 3. Run database migrations
cd apps/server
npx prisma migrate dev

# 4. Start all NestJS servers
npm run dev
```

### **Option 1: Docker Development (Recommended)**

#### Step 1: Start Infrastructure
```bash
# Start PostgreSQL, Redis, NATS
docker-compose up -d postgres redis nats

# Verify services are running
docker-compose ps
```

**Expected Output:**
```
torii-postgres    running    0.0.0.0:5432->5432/tcp
torii-redis       running    0.0.0.0:6379->6379/tcp
torii-nats        running    0.0.0.0:4222->4222/tcp, 0.0.0.0:8222->8222/tcp
```

#### Step 2: Configure Environment
```bash
# Copy template
cp .env.example .env
```

**Edit `.env`** với your actual values (xem [Environment Configuration](#environment-configuration) section):
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/torii?schema=public"
REDIS_HOST="localhost"
REDIS_PORT="6379"
NATS_URL="nats://localhost:4222"

# LiveKit Cloud credentials
LIVEKIT_API_KEY="your-livekit-cloud-key"
LIVEKIT_API_SECRET="your-livekit-cloud-secret"
LIVEKIT_API_URL="wss://your-project.livekit.cloud"

JWT_SECRET="development-secret-change-in-production"
```

#### Step 3: Run Migrations
```bash
cd apps/server

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev
```

#### Step 4: Start Development Servers
```bash
# Start all 4 services (gateway, auth, course, room)
npm run dev
```

**Expected Output:**
```
[dev:gateway]  Nest application successfully started on port 8080
[dev:auth]     Nest application successfully started on port 8081
[dev:course]   Nest application successfully started on port 8082
[dev:room]     Nest application successfully started on port 8083
```

### **Option 2: Full Docker Stack**

```bash
# Build and start ALL services (including NestJS apps)
docker-compose up --build

# Detached mode
docker-compose up -d --build

# View logs
docker-compose logs -f gateway room-service
```

### **Option 3: Local Development (No Docker)**

#### Install Dependencies:

**PostgreSQL:**
```bash
# Mac
brew install postgresql@16
brew services start postgresql@16
createdb torii

# Windows
choco install postgresql
```

**Redis:**
```bash
# Mac
brew install redis
brew services start redis

# Windows
choco install redis
```

**NATS with JetStream:**
```bash
# Mac
brew install nats-server
nats-server -js -sd /tmp/nats-data

# Windows
choco install nats-server
nats-server.exe -js -sd C:\nats-data

# ⚠️ IMPORTANT: Must use -js flag to enable JetStream!
```

**LiveKit (Optional - hoặc dùng Cloud):**
```bash
# Download from https://github.com/livekit/livekit/releases
./livekit-server --dev
```

Sau đó chạy:
```bash
cd apps/server
npm run dev
```

---

## Environment Configuration

### **Centralized `.env` Management**

Tất cả services đọc environment variables từ **monorepo root** (`torii-monorepo/.env`).

### **File Structure:**
```
torii-monorepo/
├── .env                    ← 🎯 MAIN config (all services read from here)
├── .env.example            ← Template with all variables
└── apps/
    └── server/
        ├── prisma.config.ts     ← Loads ../../.env
        └── modules/
            └── */src/app.module.ts  ← envFilePath: '../../../.env'
```

### **Required Environment Variables (8 biến bắt buộc):**

#### 1. **DATABASE_URL** ⭐
```env
DATABASE_URL="postgresql://username:password@localhost:5432/database_name?schema=public"
```
- **Dùng cho**: Prisma ORM, all database operations
- **Examples**:
  ```env
  # Local PostgreSQL
  DATABASE_URL="postgresql://postgres:123456@localhost:5432/torii_db?schema=public"
  
  # Supabase
  DATABASE_URL="postgresql://postgres.xxxx:password@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
  ```

#### 2-4. **LiveKit Configuration** ⭐
```env
LIVEKIT_API_KEY="your-cloud-key"
LIVEKIT_API_SECRET="your-cloud-secret"
LIVEKIT_API_URL="wss://your-project.livekit.cloud"
```
- **Dùng cho**: Room Service, video conferencing
- **Local Dev**: Use `devkey`, `secret`, `http://localhost:7880`
- **Production**: Get from LiveKit Cloud dashboard

#### 5-6. **Redis Configuration** ⭐
```env
REDIS_HOST="localhost"
REDIS_PORT="6379"
```
- **Dùng cho**: Polls, caching, microservices communication
- **Docker**: Use `"redis"` as hostname

#### 7. **NATS Configuration** ⭐
```env
NATS_URL="nats://localhost:4222"
```
- **Dùng cho**: 
  - JetStream messaging
  - KV storage (room info, user info)
  - Analytics events
  - Chat messages
- **Docker**: Use `nats://nats:4222`

#### 8. **JWT Secret** ⭐
```env
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
```
- **Dùng cho**: Auth Service, token generation
- **⚠️ IMPORTANT**: MUST change in production!
- **Generate**: `openssl rand -base64 32`

### **Optional Environment Variables:**

```env
# Optional - Default values provided
PORT=8080                              # Gateway port
NODE_ENV="development"                 # development | production | staging
CORS_ORIGIN="http://localhost:5173"   # Frontend URL
JWT_EXPIRES_IN="7d"                    # Token expiration
UPLOAD_DIR="./uploads"                 # File upload directory
REDIS_PASSWORD=""                      # If Redis requires password

# Supabase (only if using Supabase-specific features)
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_KEY="your-anon-key"
```

### **Verification:**

```bash
cd apps/server
npm run dev:course

# Expected output:
# [dotenv] injecting env (X) from ../../.env ✓
```

---

## Running the Server

### **Development Mode (Hot Reload):**

```bash
cd apps/server

# Start all 4 services concurrently
npm run dev

# Or start individual services:
npm run dev:gateway  # Port 8080
npm run dev:auth     # Port 8081
npm run dev:course   # Port 8082
npm run dev:room     # Port 8083
```

### **Production Build:**

```bash
# Build all services
npm run build

# Start individual services
npm run prod:gateway
npm run prod:auth
npm run prod:course
npm run prod:room
```

### **Protobuf Generation:**

Khi nào cần: Bất cứ khi nào bạn sửa file `*.proto` trong `apps/server/proto/`

```bash
cd apps/server
./scripts/generate-proto.sh

# Generated files sẽ xuất hiện trong: libs/proto/src/generated/
# ⚠️ KHÔNG sửa trực tiếp generated files!
```

---

## Project Structure

```
apps/server/
├── libs/
│   ├── proto/              # Generated Protobuf Types & KV Helpers
│   │   ├── src/
│   │   │   ├── generated/  # ⚠️ Auto-generated - DO NOT EDIT
│   │   │   ├── index.ts
│   │   │   └── kv_types.ts # Manual KV Store types
│   ├── shared/             # Shared Services & Utilities
│   │   ├── interceptors/   # Protobuf, Transform interceptors
│   │   ├── nats/           # NATS Service (JetStream, KV)
│   │   ├── services/       # LiveKit, Redis, Supabase services
│   │   └── prisma.service.ts
├── modules/
│   ├── gateway/            # Main Entry Point (port 8080)
│   │   ├── src/
│   │   │   ├── room/       # REST + Protobuf endpoints
│   │   │   ├── file/       # File upload endpoints
│   │   │   └── main.ts
│   │   └── Dockerfile
│   ├── auth-service/       # Authentication (port 8081)
│   ├── course-service/     # Course CRUD (port 8082)
│   └── room-service/       # Room Logic (port 8083)
│       ├── src/
│       │   ├── room/       # Room, Breakout, Polling
│       │   ├── analytics/  # Analytics service
│       │   └── app.module.ts
│       └── Dockerfile
├── proto/                  # ✅ Source of Truth for .proto files
│   ├── dependencies/       # livekit, protovalidate
│   ├── wajlc_*.proto      # Main protocol definitions
│   └── README.md
├── prisma/                 # Database Schema
│   ├── schema.prisma
│   └── migrations/
└── scripts/
    └── generate-proto.sh   # Protobuf generation script
```

---

## NATS JetStream Structure

Server sử dụng NATS KV để lưu "hot" state (tránh query DB liên tục):

### **KV Buckets:**
- `pnm-roomInfo-<roomId>`: Room metadata (status, participants count, etc.)
- `pnm-userInfo-r_<roomId>-u_<userId>`: User info in room
- `pnm-roomUsers-<roomId>`: List of online users
- `pnm-breakoutRoom-<roomId>`: Breakout room metadata

### **Subjects:**
- `chat`: System chat messages
- `plugnmeet_analytics`: Analytics events (track room activity)

---

## Development Workflows

### **Scenario 1: Quick Dev Session**
```bash
# Terminal 1: Infrastructure
docker-compose up postgres redis nats

# Terminal 2: NestJS
cd apps/server && npm run dev
```

### **Scenario 2: Testing Specific Service**
```bash
# Start infrastructure
docker-compose up -d postgres redis nats

# Test room-service only
cd apps/server
npm run dev:room
```

### **Scenario 3: Full Docker Stack**
```bash
# Start everything
docker-compose up --build

# Watch specific logs
docker-compose logs -f gateway room-service
```

---

## Verification & Testing

### **Check Infrastructure:**

```bash
# PostgreSQL
psql postgresql://postgres:postgres@localhost:5432/torii -c "SELECT 1"

# Redis
redis-cli ping
# Expected: PONG

# NATS
curl http://localhost:8222/healthz
# Expected: OK

# NATS JetStream
curl http://localhost:8222/varz | grep jetstream
# Should show: "jetstream": { "enabled": true }
```

### **Check NestJS Services:**

```bash
# Gateway
curl http://localhost:8080/health

# Room Service
curl http://localhost:8083/health

# Course Service
curl http://localhost:8082/api/courses
```

### **Check NATS KV Buckets:**

```bash
# Install NATS CLI
brew install nats-io/nats-tools/nats  # Mac
choco install nats  # Windows

# List KV buckets (after creating some rooms)
nats kv ls

# View bucket contents
nats kv get pnm-roomInfo-<roomId>
```

---

## Troubleshooting

### ❌ "DATABASE_URL environment variable is not set"

**Solution:**
```bash
# Check if .env exists in root
ls ../../.env

# If not, copy from example
cp .env.example .env

# Verify it's being loaded
npm run dev:course
# Should see: [dotenv] injecting env (X) from ../../.env
```

### ❌ "Error connecting to NATS"

**Check:**
```bash
# Is NATS running?
docker ps | grep nats
# OR
ps aux | grep nats-server

# Is JetStream enabled?
curl http://localhost:8222/varz | grep jetstream
```

**Fix:**
```bash
# Docker
docker-compose restart nats

# Local - ⚠️ Must use -js flag!
nats-server -js -sd /tmp/nats-data
```

### ❌ "Cannot connect to Redis"

**Check:**
```bash
# Docker
docker logs torii-redis

# Local
redis-cli ping
```

**Fix:**
```bash
# Docker
docker-compose restart redis

# Local
redis-server
```

### ❌ "LiveKit connection failed"

**Solution:**
```bash
# If using LiveKit Cloud, verify credentials in .env
cat ../../.env | grep LIVEKIT

# If using local LiveKit
docker-compose up -d livekit
# OR
./livekit-server --dev
```

### ❌ "Module ... cannot find @server/proto"

**Solution:**
```bash
# Regenerate Protobuf files
cd apps/server
./scripts/generate-proto.sh

# Rebuild
npm run build
```

---

## Monitoring

### **NATS Monitoring UI:**
```
http://localhost:8222
```

### **LiveKit Monitoring:**
```bash
# Install LiveKit CLI
brew install livekit

# List active rooms
livekit-cli list-rooms \
  --url https://your-project.livekit.cloud \
  --api-key your-key \
  --api-secret your-secret
```

### **Docker Stats:**
```bash
docker stats
```

---

## Clean Up

```bash
# Stop all Docker services
docker-compose down

# Stop and remove all data volumes (⚠️ CAUTION!)
docker-compose down -v

# Remove unused Docker images
docker system prune -a
```

---

## Best Practices

1. ✅ **NEVER commit `.env`** - Only commit `.env.example`
2. ✅ **Use one `.env` file** - In monorepo root
3. ✅ **Keep `.env.example` updated** - When adding new variables
4. ✅ **Document all variables** - With comments in `.env.example`
5. ✅ **Change JWT_SECRET** - In production!
6. ✅ **Enable JetStream** - Always use `nats-server -js`
7. ✅ **Regenerate proto** - After modifying `.proto` files
8. ✅ **Run migrations** - Before starting servers

---

## Port Summary

```
8080 → Gateway           (REST + GraphQL + Protobuf + WebSocket)
8081 → Auth Service      (JWT Authentication)
8082 → Course Service    (Course CRUD)
8083 → Room Service      (Rooms, Polls, Breakouts, Analytics)

5432 → PostgreSQL        (Database)
6379 → Redis             (Cache + Polls)
4222 → NATS              (Messaging + KV)
8222 → NATS Monitoring   (HTTP UI)
```

---

## Infrastructure Dependencies

**Server KHÔNG tự động start các services sau. Bạn PHẢI start trước:**

1. ✅ PostgreSQL (port 5432)
2. ✅ Redis (port 6379)
3. ✅ NATS with JetStream (port 4222) - **Must use `-js` flag!**
4. ✅ LiveKit Cloud (hoặc local server port 7880)

**Easiest way:**
```bash
docker-compose up -d postgres redis nats
```

---

## Additional Resources

- **Protobuf Guide**: See `proto/README.md`
- **Database Schema**: See `prisma/schema.prisma`
- **LiveKit Docs**: https://docs.livekit.io
- **NATS JetStream**: https://docs.nats.io/nats-concepts/jetstream

---

**Happy Coding! 🚀**
