# Torii Nihongo Monorepo

Dự án chuyên biệt đào tạo tiếng Nhật trực tuyến kết hợp WebRTC và AI Agents (FastMCP). Monorepo được quản lý bởi **TurboRepo**, tích hợp hệ thống Microservices mạnh mẽ.

## 🏗 Overall Monorepo Structure

```
torii-monorepo/
├── apps/
│   ├── server/               # NestJS Microservices Workspace
│   │   ├── modules/          # Các server độc lập (8 Services)
│   │   ├── libs/             # Thư viện dùng chung (shared, proto, prisma)
│   │   └── proto/            # Định nghĩa Protobuf (Source of Truth)
│   ├── web-admin/            # React Admin Dashboard (Vite) + Manual API
│   └── web-learner/          # Next.js Learning Platform
├── packages/
│   ├── dtos/                 # Shared Data Transfer Objects (BE & FE)
│   ├── protocol/             # Shared Types generated từ Proto
│   ├── ui/                   # Shared UI components
│   ├── eslint-config/        # Cấu hình ESLint dùng chung
│   └── typescript-config/    # Cấu hình TypeScript dùng chung
├── turbo.json                # TurboRepo config
└── pnpm-workspace.yaml       # PNPM Workspaces config
```

---

## 🛰 Microservices Architecture & Database Mapping

Dự án được chia thành 8 Microservices chuyên biệt để tối ưu hiệu năng và khả năng mở rộng:

| # | Service | Nhiệm vụ | Database Tables Mapping | Port |
|:---:|:---|:---|:---|:---|
| 1 | **Gateway** | Cổng điều phối API, Auth Check, Aggregator | - | 8080 |
| 2 | **Auth** | Định danh, Phân quyền RBAC | `users`, `roles`, `permissions`, `learners`, `lecturers`, `staff` | 8081 |
| 3 | **Course** | Quản lý khóa học Video & Lộ trình JLPT | `courses`, `modules`, `lessons`, `enrollments`, `progress` | 8082 |
| 4 | **Room** | Lớp học trực tuyến WebRTC (LiveKit) | `live_classes`, `class_materials`, `class_notes` | 8083 |
| 5 | **Assessment** | Ngân hàng câu hỏi, Thi thử & Bài tập | `quizzes`, `question_bank`, `quiz_attempts`, `submissions` | 8084 |
| 6 | **Payment** | Thanh toán, Hóa đơn & Khuyến mãi | `payments`, `invoices`, `coupons`, `coupon_redemptions` | 8085 |
| 7 | **AI (FastMCP)**| AI Agents, Flashcards & Lộ trình cá nhân hóa | `ai_interactions`, `analytics`, `flashcards`, `recommendations` | 8086 |
| 8 | **Social/Noti** | Thông báo, Thành tựu & Blogs | `notifications`, `achievements`, `blog_posts`, `tags` | 8087 |

---

## 🛠 Infrastructure Setup (Manual Docker Method)

Nếu không dùng `docker-compose`, bạn có thể chạy lẻ các container với Volume để lưu trữ dữ liệu bền vững:

### 1. PostgreSQL (Cơ sở dữ liệu chính)
```bash
docker run --name torii-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -v torii_db_data:/var/lib/postgresql/data -d postgres
```

### 2. Redis (Cache & Realtime State)
```bash
docker run --name torii-redis -p 6379:6379 -d redis
```

### 3. NATS với JetStream & Auth Callout (Message Broker)
Cực kỳ quan trọng: Phải sử dụng file cấu hình `nats_server.conf` để kích hoạt JetStream và Auth Callout.

**Chạy bằng Docker (Khuyên dùng):**
```bash
# Mount file config từ máy và volume để lưu trữ JetStream
docker run --name torii-nats \
  -p 4222:4222 -p 8222:8222 \
  -v ${PWD}/nats_server.conf:/etc/nats/nats.conf \
  -v nats_data:/data \
  -d nats:latest -c /etc/nats/nats.conf
```
*Lưu ý: `${PWD}` lấy đường dẫn thư mục hiện tại. Nếu dùng CMD Windows hãy thay bằng `%cd%`.*

**Chạy trực tiếp (.exe) trên Windows:**
```bash
nats-server.exe -c nats_server.conf
```

---

## 🚀 Development Workflows

### 1. Khởi tạo và Cài đặt
```bash
pnpm install
cp .env.example .env # Chỉnh sửa DATABASE_URL, NATS_URL...
```

### 2. Database (Prisma)
Bất cứ khi nào thay đổi `schema.prisma` hoặc `database.sql`:
```bash
cd apps/server
npx prisma generate
npx prisma db push   # Hoặc npx prisma migrate dev
```

### 3. Protobuf Generation
Bất cứ khi nào bạn thay đổi cấu trúc dữ liệu trong các file `.proto` (nằm trong `packages/protocol/proto`):
```bash
# Chạy từ root hoặc trực tiếp trong package protocol
pnpm --filter @workspace/protocol generate
```
Cấu lục này đảm bảo tính nhất quán (Source of Truth) giữa Backend và Frontend bằng cách sử dụng chung kiểu dữ liệu được gen tự động.

### 4. API Client (Manual với TanStack Query)
Dự án sử dụng **manual API calls** kết hợp với **TanStack Query** để gọi API từ frontend.

**Cấu trúc API Client:**
```
apps/web-admin/src/api/
├── users.ts          # Users API functions
└── [resource].ts     # Thêm API mới tại đây
```

**Ví dụ sử dụng:**
```tsx
import { useQuery } from '@tanstack/react-query';
import { getUsers } from './api/users';

function UsersList() {
    const { data, isLoading } = useQuery({
        queryKey: ['users'],
        queryFn: () => getUsers(1, 100),
    });
    
    const users = data?.data || [];
    return <div>{/* Render users */}</div>;
}
```

**Thêm API mới:** Copy `users.ts`, đổi endpoint và types từ `@workspace/protocol`.


### 5. Shared DTOs
Dự án sử dụng shared package `@workspace/dtos` để đảm bảo kiểu dữ liệu đồng nhất giữa Backend và Frontend mà không cần code generation.
- **Vị trí:** `packages/dtos/src`
- **Frontend Import:** `import { UserResponseDto } from '@workspace/dtos'`
- **Backend Usage:** Dùng làm DTO cho Controller/Service.
- **Lưu ý:** Sau khi sửa DTO, chạy `pnpm --filter @workspace/dtos run build` để cập nhật.

---

## 🏁 How to Run

### Chạy toàn bộ (Turbo)
```bash
pnpm dev
```

### Chạy riêng lẻ Microservices (Backend)
```bash
cd apps/server
pnpm dev:gateway      # Cổng chính
pnpm dev:auth         # Auth service
pnpm dev:course       # LMS service
pnpm dev:room         # WebRTC service
pnpm dev:assessment   # Quiz service
pnpm dev:payment      # Payment service
pnpm dev:ai           # AI Agents service
pnpm dev:notification # Social service
```

---
**Happy Coding! 🚀**
