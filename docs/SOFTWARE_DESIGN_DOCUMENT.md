# II. Software Design Document (SDD)

> Tài liệu này được **đối chiếu trực tiếp từ codebase** trong `torii-monorepo` và mobile app Flutter ở `torri-mobile` (cùng workspace).
>
> Mục tiêu: mô tả **đúng kiến trúc triển khai thực tế**, tránh các tuyên bố không có bằng chứng trong repo.

## 1. System Design

## 1.1 System Architecture (as-built)

Torii Nihongo là nền tảng học tiếng Nhật gồm:

- **Client apps**
  - **Learner Web**: `apps/web-learner` (Next.js App Router)
  - **Admin Web**: `apps/web-admin` (Vite + React Router)
  - **Meet Web**: `apps/meet` (LiveKit meeting UI)
  - **Mobile (Learner)**: `torri-mobile` (Flutter + GoRouter + Riverpod) – *nằm ngoài `torii-monorepo` nhưng trong cùng workspace*
- **Backend** (NestJS) theo mô hình **multi-service** trong 1 workspace:
  - `apps/server/services/gateway` (HTTP API Gateway)
  - `apps/server/services/identity` (NATS microservice)
  - `apps/server/services/academy` (NATS microservice)
  - `apps/server/services/meet` (NATS microservice + JetStream KV/Streams phục vụ realtime state của room)
  - `apps/server/services/agents` (NATS microservice)
  - Ngoài nhóm NestJS: `apps/voice-agent` (dịch vụ agent backend – không phải UI end-user)
- **Shared packages** dùng chung FE/BE:
  - `packages/protocol`: Protobuf contracts (dùng cho Meet/NATS payloads, v.v.)
  - `packages/schemas`: shared DTO/Zod schemas
  - `packages/ui`: shared UI components/styles

### 1.1.1 Repository & Workspace structure (Turbo + PNPM)

- Repo sử dụng **PNPM workspaces** (`pnpm-workspace.yaml`) với scope:
  - `apps/*`
  - `packages/*`
- Repo dùng **Turborepo** (`turbo.json`) để orchestrate `dev/build/lint/check-types`.

> Lưu ý: Mobile Flutter `torri-mobile` **không nằm trong PNPM workspace** của `torii-monorepo` (không có `package.json`), nhưng có cơ chế đồng bộ proto từ `packages/protocol/proto` theo `torri-mobile/README.md`.

### 1.1.2 Backend runtime topology (Gateway HTTP + NATS microservices)

Backend NestJS được tổ chức dạng “**Gateway HTTP** + các service **NATS-only**”:

- **Gateway** (`apps/server/services/gateway`)
  - Chạy **HTTP server** và expose REST endpoints.
  - Sử dụng `NatsClientModule` để gọi sang các microservice nội bộ qua **NestJS Transport.NATS**.
  - Có `NatsAuthModule` (auth callout handler) được import riêng ở Gateway.
- **Identity / Academy / Meet / Agents**
  - Khởi chạy bằng `NestFactory.createMicroservice(..., createNatsServiceConfig('<service>_queue'))`
  - **Không chạy HTTP server**; nhận request qua NATS queue group.

Sơ đồ mức cao (as-built):

```mermaid
flowchart TB
  subgraph Clients["Clients"]
    WL["Web Learner (Next.js)"]
    WA["Web Admin (Vite)"]
    MW["Meet Web (LiveKit UI)"]
    MB["Mobile (Flutter - torri-mobile)"]
  end

  WL -->|HTTPS| GW["Gateway (NestJS HTTP)\napps/server/services/gateway"]
  WA -->|HTTPS| GW
  MB -->|HTTPS| GW
  MW -->|HTTPS (API)| GW

  subgraph NATS["NATS (Transport.NATS)"]
    BUS["NATS Server"]
  end

  GW <-->|Request/Response over NATS| BUS

  ID["Identity svc (NestJS NATS)\nservices/identity"] <-->|queue: identity_queue| BUS
  AC["Academy svc (NestJS NATS)\nservices/academy"] <-->|queue: academy_queue| BUS
  ME["Meet svc (NestJS NATS)\nservices/meet"] <-->|queue: meet_queue| BUS
  AG["Agents svc (NestJS NATS)\nservices/agents"] <-->|queue: agents_queue| BUS

  ME ---|"JetStream KV/Streams (room state, consumers)"| BUS
```

### 1.1.3 Inter-service communication patterns (đúng theo code)

Trong repo hiện tại có 2 lớp giao tiếp chính:

1) **Gateway ↔ Microservices**: NestJS **Transport.NATS** (queue groups)
- Config tạo microservice: `apps/server/libs/shared/src/nats/nats-service.config.ts` (`createNatsServiceConfig`)
- Client gọi từ Gateway: `apps/server/libs/shared/src/nats/nats-client.module.ts` (`NatsClientModule`, token `NATS_SERVICE`)

2) **Meet realtime state**: **NATS JetStream (KV + Streams + Consumers)** (trong Meet service)
- Ví dụ thao tác JetStream KV/streams/consumers nằm trong:
  - `apps/server/services/meet/src/infrastructure/nats/*` (ví dụ `nats-user.service.ts`, `nats-stream.service.ts`)

> Vì vậy, mô tả “Event-Driven + JetStream KV cho realtime state” **đúng cho Meet module**.  
> Với các service khác, repo thể hiện chủ yếu **request/response qua NATS transport** (không đủ bằng chứng để khẳng định mọi domain đều dùng JetStream streams/KV).

### 1.1.4 API Gateway pattern (đúng phạm vi)

- Gateway là **single entry point HTTP** cho client apps.
- Gateway **không “deploy” chung với các service khác** trong code; mỗi service là 1 Nest “app” build riêng (`apps/server/package.json` script `nest build gateway/identity/meet/academy/agents`).

### 1.1.5 Domain partitioning (theo codebase)

Trong `apps/server/services/` hiện có các bounded areas triển khai thành service:

- **gateway**: controllers + orchestration
- **identity**: auth/2FA/session/users/authorization/audit log/notification interfaces (theo module code)
- **academy**: classroom/live schedule, commerce (order/coupon/enrollment…), assessment/jlpt…, storage/blog/ticket… (theo module code)
- **meet**: room/users/waiting-room/whiteboard/polls/recording/ingress/insights… (NATS + JetStream)
- **agents**: AI-related handlers/services (NATS)

> Không áp đặt thuật ngữ “DDD đầy đủ” nếu chưa có explicit folder conventions (domain/application/infrastructure) nhất quán ở tất cả service; thay vào đó, tài liệu ghi theo cấu trúc thực tế.

---

## 1.2 Key Architectural Patterns (as-built)

### 1.2.1 Monorepo build orchestration (Turbo + PNPM)

- Root scripts dùng `turbo dev/build/lint`.
- Workspaces chia `apps/*` và `packages/*` giúp dùng chung `@workspace/*`.

### 1.2.2 Backend multi-service within one workspace (NestJS)

- Một workspace `apps/server` build ra nhiều service (`gateway`, `identity`, `academy`, `meet`, `agents`).
- Các service nội bộ giao tiếp qua NATS (queue groups).

### 1.2.3 Contract-first shared types

- **Protobuf**: `packages/protocol` (đặc biệt dùng nhiều trong Meet)
- **Shared schemas**: `packages/schemas` (DTO/Zod giữa FE/BE)

### 1.2.4 Realtime Meeting subsystem (Meet)

- `apps/meet` (web client) + `apps/server/services/meet` (backend meet) + LiveKit server.
- Meet backend có lớp JetStream KV/Streams để quản lý trạng thái room/user và broadcast events (theo code trong `services/meet/src/infrastructure/nats`).

---

## 1.3 Mapping ứng dụng theo repo (để audit nhanh)

| Component | Path | Runtime |
|---|---|---|
| Learner Web | `apps/web-learner` | Next.js |
| Admin Web | `apps/web-admin` | Vite + React Router |
| Meet Web | `apps/meet` | React (LiveKit meeting UI) |
| Backend Gateway | `apps/server/services/gateway` | NestJS HTTP + NATS client |
| Backend Identity | `apps/server/services/identity` | NestJS NATS microservice |
| Backend Academy | `apps/server/services/academy` | NestJS NATS microservice |
| Backend Meet | `apps/server/services/meet` | NestJS NATS microservice + JetStream KV/Streams |
| Backend Agents | `apps/server/services/agents` | NestJS NATS microservice |
| Voice agent | `apps/voice-agent` | Agent backend |
| Mobile Learner | `torri-mobile` | Flutter (GoRouter + Riverpod) |

