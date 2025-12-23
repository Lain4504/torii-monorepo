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
├── turbo.json                # TurboRepo config
└── pnpm-workspace.yaml       # PNPM Workspaces config
```

---

## 🛰 Microservices Architecture (NATS-based)

Toàn bộ hệ thống backend đã được chuyển dịch từ HTTP/TCP sang kiến trúc hướng sự kiện (Event-driven) sử dụng **NATS**. Các service giao tiếp với nhau qua các Subjects được định nghĩa chặt chẽ.

| # | Service | Nhiệm vụ chính | Database Tables Mapping |
|:---:|:---|:---|:---|
| 1 | **Gateway** | API Gateway (HTTP), Auth Interceptor, NATS Proxy | - |
| 2 | **Auth** | Quản lý User, RBAC, Authentication Service | `users`, `roles`, `permissions`, `learners` |
| 3 | **Course** | Quản lý khóa học, bài học, lộ trình JLPT | `courses`, `modules`, `lessons`, `enrollments` |
| 4 | **Room** | Quản lý phòng học trực tuyến (LiveKit integration) | `live_classes`, `class_materials` |
| 5 | **Assessment** | Ngân hàng câu hỏi, bài tập & thi thử | `quizzes`, `questions`, `submissions` |
| 6 | **Payment** | Xử lý giao dịch, hóa đơn & gói học phí | `payments`, `invoices`, `subscriptions` |
| 7 | **AI (FastMCP)**| AI Agents, Flashcards, Personalized Learning | `flashcards`, `ai_interactions` |
| 8 | **Social/Noti** | Thông báo (Push/Email), Blog & Achievements | `notifications`, `blog_posts`, `achievements` |


---

## 🛠 Infrastructure Setup

Dự án yêu cầu các thành phần hạ tầng sau chạy bằng Docker hoặc cài đặt cục bộ:

### 1. NATS Server (Bắt buộc)
Sử dụng file cấu hình `nats_server.conf` để kích hoạt JetStream.
```bash
docker run --name torii-nats \
  -p 4222:4222 -p 8222:8222 \
  -v %cd%/nats_server.conf:/etc/nats/nats.conf \
  -v nats_data:/data \
  -d nats:latest -c /etc/nats/nats.conf
```

### 2. PostgreSQL & Redis
```bash
# PostgreSQL
docker run --name torii-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -v torii_db_data:/var/lib/postgresql/data -d postgres

# Redis
docker run --name torii-redis -p 6379:6379 -d redis
```

---

## 🚀 Development Workflows

### 1. Khởi tạo
```bash
pnpm install
cp .env.example .env # Cập nhật DATABASE_URL, NATS_URL...
```

### 2. Protobuf & Types Safety
Dự án sử dụng **@bufbuild/protobuf** (Type-safe Protobuf ES) làm "Source of Truth" cho dữ liệu giữa các service và frontend.

**Cập nhật Protocol:**
1. Chỉnh sửa file [.proto](cci:7://file:///e:/demo/team-source/torii-monorepo/packages/protocol/proto/flash_card.proto:0:0-0:0) trong `packages/protocol/proto/`.
2. Thực hiện quy trình tái tạo code:
   ```bash
   cd packages/protocol
   pnpm run clean      # Xóa code cũ đã generate
   pnpm run generate   # Tạo code TypeScript mới từ .proto
   pnpm run build      # Biên dịch sang JS và tạo Type Definitions (.d.ts)
   ```
### 3. Database (Prisma)
```bash
cd apps/server
npx prisma generate
npx prisma db push
```

### 4. Shared DTOs
Sử dụng `@workspace/dtos` cho các data structure không cần Protobuf (thường là API response/request đơn giản).
```bash
pnpm --filter @workspace/dtos run build # Sau khi thay đổi nội dung DTO
```

---

## 🏁 How to Run

### Chạy chế độ Development (Watch mode cho tất cả services)
```bash
pnpm dev
```

### Chạy riêng lẻ Microservices (Backend)
```bash
cd apps/server
pnpm dev:gateway
pnpm dev:auth
pnpm dev:course
# ... tương tự cho các service khác (xem package.json)
```

---
**Happy Coding! 🚀**
