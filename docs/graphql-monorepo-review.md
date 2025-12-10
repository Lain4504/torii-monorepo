## Đánh giá khả thi: GraphQL + Monorepo trên dự án hiện tại

### 1) Ảnh chụp trạng thái hiện tại
- Monorepo dùng `pnpm` + `turbo` (chưa dùng Nx). Workspace: `apps/*`, `packages/*`.
- Backend: `apps/server` là NestJS 11, GraphQL code-first (Apollo driver) với autoSchemaFile `apps/gateway/schema.gql`, microservice TCP `auth-service`.
- Web client: `apps/web-learner` (Next.js 16, App Router).
- Admin: `apps/web-admin` (React + Vite).
- Shared UI: `packages/ui` (shadcn-based). Config lint/ts riêng (`packages/eslint-config`, `packages/typescript-config`).
- Mobile: `apps/mobile_app` Flutter, chưa nối GraphQL.

### 2) So khớp với kiến trúc bạn mong muốn
- ✅ Đã có GraphQL code-first và schema auto-gen ở Gateway → đủ nguồn cho codegen.
- ✅ Đã tách Web (Next) và Admin (Vite) đúng ý.
- ✅ Đã có thư viện UI chung.
- ⚠️ Chưa có thư viện `data-access` dùng chung để cấu hình GraphQL client + chứa `.graphql`.
- ⚠️ Chưa bật pipeline codegen; chưa có `codegen.yml`.
- ⚠️ Không dùng Nx, nhưng Turbo + pnpm vẫn hỗ trợ mô hình tương đương (có thể thêm Nx sau nếu cần affected builds/generators).

### 3) Kết luận nhanh
Hoàn toàn làm được end-to-end type-safety với GraphQL codegen trên codebase này mà **không bắt buộc phải chuyển sang Nx ngay**. Nếu muốn Nx, có thể migrate dần (Turbo và Nx cùng tồn tại khó khăn, nên chọn một; hiện tại giữ Turbo để tránh phá vỡ).

### 4) Kế hoạch triển khai đề xuất (giữ Turbo/pnpm)
1) **Chuẩn hóa schema output**
   - Gateway đã ghi ra `apps/gateway/schema.gql`. Giữ ổn định đường dẫn này để frontend/mobile đọc.
   - Script backend: `pnpm --filter server dev` (hoặc `nest start gateway --watch`) để luôn cập nhật schema.

2) **Thêm thư viện data-access dùng chung**
   - Tạo package mới: `packages/data-access` (type: module).
   - Bên trong chứa: `src/graphql/operations/*.graphql` (chia domain), `src/graphql/client.ts` (Apollo/Urql), `generated/` (kết quả codegen).
   - Xuất các hàm/hook từ package này để web-admin & web-learner dùng chung.

3) **Thiết lập GraphQL Code Generator**
   - Cài tại root: `pnpm add -D @graphql-codegen/cli @graphql-codegen/client-preset @graphql-codegen/typescript @graphql-codegen/typescript-operations @graphql-codegen/typescript-react-apollo graphql`.
   - Tạo `codegen.ts` (hoặc `codegen.yml`) ở root, ví dụ:
     - `schema: apps/server/apps/gateway/schema.gql`
     - `documents: "packages/data-access/src/graphql/**/*.graphql"`
     - `generates: { "packages/data-access/generated/": { preset: "client", plugins: [] } }`
   - Script: thêm `codegen: "graphql-codegen"` vào `package.json` root; optional watch: `codegen:watch: "graphql-codegen --watch"`.

4) **Kết nối Next.js (web-learner)**
   - Cài client: `pnpm --filter web-learner add @apollo/client` (hoặc `@urql/core @urql/react`).
   - Tạo `apps/web-learner/lib/apollo-client.ts` hoặc dùng trực tiếp client từ `packages/data-access`.
   - Sử dụng hook sinh sẵn: `const { data } = useAuthHealthQuery();`.

5) **Kết nối Admin (web-admin)**
   - Cài tương tự: `pnpm --filter web-admin add @apollo/client`.
   - Import hook từ `@workspace/data-access` (tên package mới).

6) **Mobile Flutter**
   - Dùng cùng `schema.gql`: thêm phụ thuộc `ferry` hoặc `graphql_flutter`, đặt `schema.gql` trong `apps/mobile_app/lib/graphql/schema.gql`.
   - Dùng codegen Flutter (ferry_codegen) để tạo `*.g.dart` từ cùng câu lệnh GraphQL (có thể reuse `.graphql` trong `packages/data-access` bằng copy step trong CI).

7) **CI/CD**
   - Bước build: `pnpm install` → `pnpm codegen` → `pnpm build`.
   - Cache node_modules/.turbo. Đảm bảo step codegen chạy trước build web-admin/web-learner.

### 5) Gợi ý thay đổi thư mục (giữ tên cũ)
```
apps/
  server/           # NestJS Gateway + microservices (schema.gql ở apps/gateway/)
  web-learner/      # Next.js client (SSR)
  web-admin/        # React + Vite admin
  mobile_app/       # Flutter
packages/
  ui/               # shared UI (đã có)
  data-access/      # <== mới, chứa client, .graphql, generated
  util-formatting/  # (optional) các hàm helper chung
codegen.ts
```

### 6) Lưu ý/cảnh báo
- Turbo + pnpm đủ đáp ứng; chỉ chuyển Nx nếu bạn cần affected-graph & generators của Nx (cần effort migrate cấu hình).
- Gateway hiện tắt playground, bật `graphiql: true`; giữ CORS phù hợp khi web gọi trực tiếp.
- Microservice `auth-service` trả dữ liệu demo; cần mở rộng resolver/domain trước khi codegen có ý nghĩa.
- Khi đổi đường dẫn schema, cập nhật `codegen.ts` và CI.

### 7) Mẫu `codegen.ts` (TypeScript, dễ mở rộng)
```ts
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'apps/server/apps/gateway/schema.gql',
  documents: ['packages/data-access/src/graphql/**/*.graphql'],
  generates: {
    'packages/data-access/generated/': {
      preset: 'client', // tạo typed hooks, helpers
      plugins: [],
    },
  },
  ignoreNoDocuments: false,
  hooks: {
    afterAllFileWrite: ['pnpm lint --filter @workspace/data-access --fix'],
  },
};

export default config;
```

### 8) Các bước thực thi tối thiểu
1. `pnpm add -D @graphql-codegen/cli @graphql-codegen/client-preset ...` (như mục 3).
2. Tạo package `packages/data-access` + `codegen.ts` như trên.
3. Viết 1 query mẫu, ví dụ `packages/data-access/src/graphql/auth/getAuthHealth.graphql`:
   ```graphql
   query GetAuthHealth {
     authHealth {
       service
       status
     }
   }
   ```
4. Chạy `pnpm codegen` → sinh hook `useGetAuthHealthQuery`.
5. Dùng ở Next/Admin: `import { useGetAuthHealthQuery } from '@workspace/data-access/generated';`.

Làm xong các bước trên, bạn đã có end-to-end type-safety giống luồng bạn mô tả, ngay trên dự án hiện tại.

