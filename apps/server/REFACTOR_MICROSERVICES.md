# Hướng dẫn Refactor Microservices (Server Architecture)

Tài liệu này đề xuất kiến trúc chuẩn cho toàn bộ `apps/server`, bao gồm cấu trúc tổng thể (Global Structure) và cấu trúc chi tiết từng Service (Microservice Structure).

## 1. Cấu trúc tổng thể (Global Structure)

Hiện tại, các microservices đang nằm trong thư mục `modules`, gây nhầm lẫn với khái niệm Module của NestJS. Chúng ta cần quy hoạch lại như sau:

```text
apps/server/
├── services/               # [NEW] Thay thế thư mục 'modules' cũ
│   ├── gateway/            # API Gateway (HTTP Entry Point)
│   ├── identity/           # Identity Microservice (NATS)
│   ├── learning/           # Learning Microservice (NATS)
│   ├── billing/            # Billing Microservice (NATS)
│   └── ...
│
├── libs/                   # Thư viện dùng chung nội bộ Server
│   └── shared/             # (@server/shared) - Guards, Interceptors, Config
│
├── prisma/                 # Database Schema & Migrations (Dùng chung hoặc tách tùy chiến lược)
├── package.json
├── nest-cli.json
└── tsconfig.json           # Cấu hình path alias (@server/*)
```

### Hành động cần làm:
1.  **Rename Folder:** `apps/server/modules` -> `apps/server/services`.
2.  **Update `tsconfig.json`:** Sửa `paths` từ `@server/identity/*: ["./modules/identity/src/*"]` thành `["./services/identity/src/*"]`.
3.  **Update `nest-cli.json`:** Cập nhật đường dẫn root của các projects.

---

## 2. Cấu trúc chi tiết từng Service

Áp dụng cho các service trong `apps/server/services/`.

### A. Gateway Service (`services/gateway`)
Gateway chịu trách nhiệm expose API HTTP và forward request sang Microservices.

```text
apps/server/services/gateway/
├── src/
│   ├── modules/
│   │   └── identity/           # Client Module gọi sang Identity Service
│   │       ├── identity.controller.ts  # @Controller: Nhận HTTP Request
│   │       ├── identity.service.ts     # Wrapper gọi ClientProxy (NATS)
│   │       └── identity.module.ts
│   ├── main.ts
│   └── gateway.module.ts
└── ...
```

### B. Microservice (VD: `services/identity`)
Microservice xử lý logic nghiệp vụ, giao tiếp qua NATS, dùng Shared Schema.

```text
apps/server/services/identity/
├── src/
│   ├── config/                     # Cấu hình riêng cho service
│   │   └── index.ts
│   │
│   ├── modules/                    # Các Feature Modules (Gom nhóm theo chức năng)
│   │   └── users/                  # Feature "Users"
│   │       ├── interfaces/         # Interfaces nội bộ
│   │       │   └── users.service.interface.ts
│   │       │
│   │       ├── mappings/           # AutoMapper profiles
│   │       │   └── users.profile.ts
│   │       │
│   │       ├── users.handler.ts    # [Transport Layer] @MessagePattern (Thay thế Controller)
│   │       ├── users.service.ts    # [Domain Layer] Business Logic
│   │       ├── users.repository.ts # [Infra Layer] Database Access (Prisma)
│   │       └── users.module.ts     # Wiring
│   │
│   ├── shared/                     # Utilities nội bộ service
│   ├── identity.module.ts          # Root Module
│   └── main.ts                     # Entry Point
│
├── test/
├── package.json
└── tsconfig.json
```

---

## 3. Nguyên tắc quan trọng

1.  **Shared Schemas (`@packages/schemas`):**
    - Tất cả DTO dùng cho API public (Gateway <-> Client) và Message Payload (Gateway <-> Service) **PHẢI** nằm trong `@packages/schemas`.
    - Không duplicate DTO trong từng service trừ khi đó là DTO nội bộ (không expose ra ngoài).

2.  **Shared Server Libs (`apps/server/libs/shared`):**
    - Chứa các logic dùng chung cho backend như: `BaseRepository`, `RedisConfig`, `Logging`, `AuthGuards`.
    - Được alias là `@server/shared`.

3.  **Separation of Concerns:**
    - **Gateway:** Routing, Validation (Input), Authentication (Sơ bộ).
    - **Microservice:** Business Rules, Database Interactions, Authorization (Chi tiết).

## 4. Lộ trình Refactor

1.  ✅ **Rename Top-level:** Đổi `modules` -> `services`. Fix `tsconfig.json`.
2.  ✅ **Refactor Identity:** Áp dụng cấu trúc `modules/users/` (gom handler, service, repo vào một chỗ) cho Identity Service trước làm mẫu.
3.  ⏳ **Refactor Gateway:** Đảm bảo Gateway dùng DTO từ `@packages/schemas`.
4.  ✅ **Refactor Learning Service:** Hoàn tất refactor cho Learning Service theo pattern của Identity Service

---

## 5. Chi tiết Refactor Learning Service

### 5.1. Cấu trúc sau refactor

```text
apps/server/services/learning/
├── src/
│   ├── modules/                    # Feature Modules (27 modules)
│   │   ├── assignment/
│   │   │   ├── assignment.handler.ts
│   │   │   ├── assignment.service.ts
│   │   │   ├── assignment.repository.ts
│   │   │   └── assignment.module.ts
│   │   ├── enrollment/
│   │   ├── course-master/
│   │   └── ... (24 more modules)
│   │
│   ├── infrastructure/              # Shared utilities & mappings
│   ├── interfaces/                  # Central interfaces & DI tokens
│   ├── learning.module.ts           # Root Module
│   └── main.ts                      # Entry point
│
└── ...
```

### 5.2. Key Changes

1. **Handlers now integrated into modules:**
   - Mỗi feature module chứa `*.handler.ts` (transport layer)
   - Handler được khai báo trong `*.module.ts` với `controllers: [Handler]`

2. **Root Module simplified:**
   - Chỉ import feature modules, không import handler/service/repo trực tiếp
   - GlobalRpcExceptionFilter provide ở đây

3. **Service Tokens centralized:**
   - `interfaces/services/index.ts` - tất cả COURSE_MASTER_SERVICE_TOKEN, ENROLLMENT_SERVICE_TOKEN, etc

### 5.3. Configuration Updates

- ✅ `tsconfig.json`: Updated `@server/learning/*` path to `services/learning/src/*`
- ✅ `nest-cli.json`: Updated learning project root to `services/learning`

---

## 6. Implementation Status

### Completed Tasks:
- ✅ Copied `modules/learning` → `services/learning`
- ✅ Moved handlers into feature modules
- ✅ Updated all 27 module files with proper controllers declaration
- ✅ Fixed duplicate imports and circular dependencies
- ✅ Updated `tsconfig.json` paths
- ✅ Updated `nest-cli.json` project configuration
- ✅ Verified build (compilation successful, no errors)

### Remaining Tasks:
- ⏳ Test Learning Service runtime with pnpm run dev:learning
- ⏳ Update and refactor remaining services (billing, agents)
- ⏳ Remove old `modules/learning` after testing
- ⏳ Update CI/CD pipeline```
