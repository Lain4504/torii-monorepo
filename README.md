# Torii Nihongo Monorepo
WebRTC-based live classes and FastMCP-powered AI feedback solution for a Japanese Learning Center.

## 🌐 Official Domains
- **Backend API**: [api.torii.sbs](https://api.torii.sbs)
- **Learning Platform**: [app.torii.sbs](https://app.torii.sbs)
- **Live Class**: [meet.torii.sbs](https://meet.torii.sbs)
- **System Management**: [admin.torii.sbs](https://admin.torii.sbs)
## 🏗 Overall Monorepo Structure

```
torii-monorepo/
├── apps/
│   ├── server/               # NestJS Microservices Workspace
│   │   ├── modules/          # 4 Microservices độc lập (gateway, identity, learning, agents, meet)
│   │   └── libs/             # Thư viện dùng chung (shared logic, nats, prisma)
│   ├── web-admin/            # React Admin Dashboard (Vite)
│   └── web-learner/          # Next.js Learning Platform
├── packages/
│   ├── protocol/             # Shared Protobuf definitions & generated code (@bufbuild/protobuf)
│   ├── schemas/              # Shared Zod schemas & DTO types (@workspace/schemas)
│   ├── ui/                   # Shared UI components
│   └── *-config/             # Cấu hình ESLint, TypeScript dùng chung
├── nats_server.conf          # Cấu hình NATS Server (JetStream, Auth Callout)
├── livekit.yaml              # Cấu hình LiveKit Server (Local Dev)
├── turbo.json                # TurboRepo config
└── pnpm-workspace.yaml       # PNPM Workspaces config
```

---

## 🛠 Local Development Setup

Để chạy dự án trên môi trường local, chúng ta sử dụng **Docker** cho các Infrastructure Services (DB, Redis, NATS, LiveKit) và chạy **Node.js** trực tiếp cho mã nguồn ứng dụng (Service/Frontend) để tận dụng trải nghiệm dev tốt nhất (Hot Reload, Debugging).

### 1. Prerequisites
- Docker & Docker Compose
- Node.js (v20+)
- PNPM (Package Manager)

### 2. Infrastructure Setup (Docker)
Khởi chạy toàn bộ hạ tầng cần thiết chỉ với một lệnh:

```bash
docker-compose up -d
```

Các services sẽ chạy tại:
- **PostgreSQL**: `localhost:5432` (User: `postgres`, Pass: `123456789`, DB: `wajlc`)
- **Redis**: `localhost:6379`
- **NATS**: `localhost:4222` (Monitor: `localhost:8222`)
- **LiveKit**: `localhost:7880` (API Key: `APIiYAA5w37Cfo2`, Secret: `6aNur7qqupeZhFYNOJVUyeXxXhVw8f4lm13pEDUx8SgB`)

Để dừng và xóa dữ liệu (nếu cần reset):
```bash
docker-compose down -v
```

### 3. Application Setup

1.  **Cài đặt dependencies:**
    ```bash
    pnpm install
    ```

2.  **Cấu hình biến môi trường:**
    Copy file mẫu và tạo file `.env` tại thư mục root:
    ```bash
    cp .env.example .env
    ```
    *Lưu ý: `.env.example` đã được cấu hình sẵn để kết nối với Infrastructure Docker mặc định.*

3.  **Database Migration & Generation:**
    ```bash
    cd apps/server
    pnpx prisma generate
    pnpx prisma db push
    ```
    *Lệnh `db push` sẽ đồng bộ schema Prisma vào database `wajlc` đang chạy trên Docker.*

4.  **Environment Variables (Service URLs):**
    Đảm bảo `.env` có các biến sau cho microservices:
    ```bash
    # Microservice HTTP Ports
    GATEWAY_PORT=8080
    IDENTITY_HTTP_PORT=8081
    LEARNING_HTTP_PORT=8082
    COMMUNICATION_HTTP_PORT=8083
    AGENTS_HTTP_PORT=8090
    MEET_HTTP_PORT=8091
    
    # Service URLs (for Gateway proxy)
    IDENTITY_SERVICE_URL=http://localhost:8081
    LEARNING_SERVICE_URL=http://localhost:8082
    COMMUNICATION_SERVICE_URL=http://localhost:8083
    AGENTS_SERVICE_URL=http://localhost:8090
    MEET_SERVICE_URL=http://localhost:8091
    ```


### 4. Running the App

Chạy toàn bộ Backend Microservices ở chế độ Watch Mode:
```bash
# Tại root project
pnpm dev
# Hoặc chạy cụ thể backend:
pnpm --filter server dev
```

Chạy Frontend (nếu cần):
```bash
pnpm --filter web-admin dev
pnpm --filter web-learner dev
```

---

## 🎨 UI Library (shadcn/ui)

Dự án sử dụng **shadcn/ui** tập trung tại `@workspace/ui`. Để cài đặt thêm component mới:

```bash
cd packages/ui
pnpm dlx shadcn@latest add [component-name]
```

---

## 🛰 Microservices Architecture (HTTP + NATS Hybrid)

Hệ thống backend được chia thành **4 Domain Services độc lập**, giao tiếp qua **HTTP REST API** (cho request/response) và **NATS Message Broker** (cho realtime events và async jobs). Kiến trúc này tập trung vào các nghiệp vụ lõi (Identity, Learning, AI, Real-time Class) với mô hình consolidated để dễ quản lý và triển khai.

### 🏛 System Architecture

```mermaid
graph TB
    Client((Clients)) -->|HTTP| Gateway[API Gateway :8080]
    Gateway -->|HTTP Proxy| ServiceLayer
    Gateway -.->|NATS Auth Callout| NATS[(NATS Server)]
    
    subgraph ServiceLayer [Microservices Ecosystem]
        direction TB
        Identity[<b>Identity</b> :8081<br>Auth, Users, RBAC, Audit, 2FA, Billing]
        Learning[<b>Learning</b> :8082<br>LMS, Community, Assessment, Flashcards]
        Comm[<b>Communication</b> :8083<br>Notifications, Messaging]
        Agents[<b>Agents</b> :8090<br>AI Agents: Sensei, Assessment, Analytics]
        Meet[<b>Meet</b> :8091<br>WebRTC, Live Classes, Rooms]
        Gamification[<b>Gamification</b> (NATS)<br>Streaks, Achievements, XP]
    end
    
    ServiceLayer -.->|Realtime Events| NATS
    Meet -.->|WebSocket & Jobs| NATS
    Gamification -.->|Event Processing| NATS
```

### 📡 Communication Patterns

**1. HTTP (Request/Response):**
- Client → Gateway → Microservice HTTP endpoint
- Synchronous CRUD operations
- RESTful API design

**2. NATS (Realtime & Async):**
- Auth callout for LiveKit (Meet service)
- WebSocket communication (Meet service)
- Async job processing (transcoding, analytics)
- Inter-service events (optional)

### 🧩 Service Domains (Modules)

| Service | Port | Protocol | Trách nhiệm chính (Bounded Context) |
|:---|:---|:---|:---|
| **Gateway** | `8080` | HTTP | Entry point duy nhất, HTTP proxy routing, Authentication guard (Auth Callout via NATS). |
| **Identity** | `8081` | HTTP | **Auth & Identity**: Registration, Login, User Management, RBAC, Audit Logs, 2FA, Billing & Payments. |
| **Learning** | `8082` | HTTP | **Learning Content**: Courses, Modules, Lessons, Assessment (Exams/Questions), Flashcards (SRS), Community (Blogs). |
| **Communication** | `8083` | HTTP | **Communication**: System notifications, user messages, email dispatching. |
| **Agents** | `8090` | HTTP | **AI Brain**: Multi-Agent System (Sensei, Assessment, Analytics) powered by FastMCP. |
| **Meet** | `8091` | HTTP + NATS | **Live Class Engine**: Virtual classroom (WebRTC), Recording, Polls, Breakout Rooms. |
| **Gamification** | `NATS` | NATS | **Engagement**: Streaks, Achievements, Points, Leaderboards (Process via NATS events). |

### 🔌 Service Communication Examples

**HTTP Request Flow (Course Creation):**
```
Client → Gateway:8080/api/courses
       → Learning:8082/courses
       → CourseService.createCourse()
       → PostgreSQL
       ← Response
```

**NATS Realtime Flow (WebSocket Events):**
```
WebSocket Client → NATS (system worker stream)
                 → Meet NATS Controller
                 → Process PING, raise hand, etc.
                 → Broadcast via NATS
                 → All connected clients
```

**LiveKit Auth Callout:**
```
LiveKit → NATS (auth.request)
        → Gateway NatsAuthModule
        → Verify JWT token
        ← Auth response
```

### 📂 Service Internal Modules

#### **Identity Service** (`apps/server/modules/identity`)
- **Auth Module**: Registration, Login, JWT/Firebase Auth, OAuth (Google)
- **Users Module**: User management, profile updates
- **RBAC Module**: Role-Based Access Control, permissions
- **Audit Module**: Audit logs for security tracking
- **Two-Factor Auth Module**: TOTP-based 2FA
- **Payments Module**: Billing, invoices, transactions

#### **Learning Service** (`apps/server/modules/learning`)
- **Course Module**: Course CRUD, enrollment
- **Module Module**: Course modules/chapters
- **Lesson Module**: Lesson content, progress tracking
- **Wishlist Module**: Course wishlists
- **Review Module**: Course reviews and ratings
- **Blog Module**: Community blog posts
- **Blog Comment Module**: Comments on blog posts
- **Notification Module**: User notifications
- **Question Bank Module**: Question repository for exams
- **Exam Module**: Exam creation, attempts, sessions
- **Flashcard Deck Module**: Flashcard deck management
- **Flashcard Module**: Individual flashcards, SRS algorithm
- **Gamification Module**: Points, badges, leaderboards

#### **Agents Service** (`apps/server/modules/agents`)
- **Sensei Agent Module**: AI tutor for personalized learning
- **Assessment Agent Module**: AI-powered assessment and grading
- **Analytics Agent Module**: Learning analytics and insights
- **FastMCP Module**: Fast Model Context Protocol integration

#### **Meet Service** (`apps/server/modules/meet`)
- **Room Module**: Virtual classroom management, LiveKit integration
- **Polls Module**: Real-time polling in classes
- **Waiting Room Module**: Pre-class waiting room
- **User Room Settings Module**: Per-user room preferences
- **Breakout Rooms**: Small group sessions

---

---

## 📦 Protocol Workflow

**Cập nhật Protocol:**
1.  Chỉnh sửa file `.proto` trong `packages/protocol/proto/`.
2.  Generate code:
    ```bash
    pnpm --filter @workspace/protocol run generate
    pnpm --filter @workspace/protocol run build
    ```

### 5. Shared Schemas & DTOs
Sử dụng `@workspace/schemas` cho Zod schemas và TypeScript types được chia sẻ giữa Backend và Frontend.
```bash
pnpm --filter @workspace/schemas run build # Sau khi thay đổi nội dung schemas
```

**Happy Coding! 🚀**

---

## 🐳 Docker Deployment Guide (Commands Only)

### 1. Build & Push (Local)
```bash
docker login
# Build backend image
docker build -t your_username/torii-backend:latest -f apps/server/Dockerfile .
# Push to Docker Hub
docker push your_username/torii-backend:latest
```

### 2. Deploy / Update (VPS)
```bash
# Pull new image
docker-compose pull
# Update stack
docker-compose up -d
# Sync DB schema (on first deploy or update)
pnpx prisma db push
# Cleanup old images if need
docker image prune -f
```

### 3. Monitoring & Logs
```bash
# View all logs
docker-compose logs -f
# View specific service logs
docker-compose logs -f [gateway|identity|learning|meet|agents]
# Check container status
docker ps
```
