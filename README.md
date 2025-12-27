# Torii Nihongo Monorepo

Dự án chuyên biệt đào tạo tiếng Nhật trực tuyến kết hợp WebRTC và AI Agents. Monorepo được quản lý bởi **TurboRepo**, tích hợp hệ thống Microservices hiện đại giao tiếp qua **NATS Message Broker** và **Protobuf**.

## 🏗 Overall Monorepo Structure

```
torii-monorepo/
├── apps/
│   ├── server/               # NestJS Microservices Workspace
│   │   ├── modules/          # 8 Microservices độc lập
│   │   └── libs/             # Thư viện dùng chung (shared logic, nats, prisma)
│   ├── web-admin/            # React Admin Dashboard (Vite)
│   └── web-learner/          # Next.js Learning Platform
├── packages/
│   ├── protocol/             # Shared Protobuf definitions & generated code (@bufbuild/protobuf)
│   ├── dtos/                 # Shared Data Transfer Objects (Plain TS)
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

1. **Cài đặt dependencies:**
   ```bash
   pnpm install
   ```

2. **Cấu hình biến môi trường:**
   Copy file mẫu và tạo file `.env` tại thư mục root:
   ```bash
   cp .env.example .env
   ```
   *Lưu ý: `.env.example` đã được cấu hình sẵn để kết nối với Infrastructure Docker mặc định.*

3. **Database Migration & Generation:**
   ```bash
   cd apps/server
   pnpx prisma generate
   pnpx prisma db push
   ```
   *Lệnh `db push` sẽ đồng bộ schema Prisma vào database `wajlc` đang chạy trên Docker.*

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

## 🛰 Microservices Architecture (NATS-based)

Toàn bộ hệ thống backend giao tiếp qua **NATS Message Broker**.

| # | Service | Port (Local) | Nhiệm vụ chính |
|:---:|:---|:---|:---|
| 1 | **Gateway** | `8080` (HTTP) | API Gateway, Auth Interceptor, NATS Proxy |
| 2 | **Auth** | `8081` | Quản lý User, RBAC, Authentication Service |
| 3 | **Course** | `8082` | Quản lý khóa học, bài học, lộ trình JLPT |
| 4 | **Room** | `8083` | Quản lý phòng học trực tuyến (LiveKit integration) |
| - | ... | ... | Các service khác (Assessment, Payment, AI...) |

---

## 📦 Protocol Workflow

**Cập nhật Protocol:**
1. Chỉnh sửa file `.proto` trong `packages/protocol/proto/`.
2. Generate code:
   ```bash
   cd packages/protocol
   pnpm run clean
   pnpm run generate
   pnpm run build
   ```

### 5. Shared DTOs
Sử dụng `@workspace/dtos` cho các data structure không cần Protobuf (thường là API response/request đơn giản).
```bash
pnpm --filter @workspace/dtos run build # Sau khi thay đổi nội dung DTO
```

**Happy Coding! 🚀**
