## Hướng dẫn chạy demo CRUD (Course)

### 0) Yêu cầu môi trường
- Node >= 20, pnpm (đã khai báo `pnpm@10.x`), Docker + Docker Compose.
- Cổng mặc định: Postgres `5432`, Gateway `3000`, Web-learner `3002`, Web-admin `4173`.

### 1) Cài đặt dependencies
```bash
pnpm install
```

### 2) Khởi động Postgres (docker-compose)
```bash
docker-compose up -d postgres
```
Thông tin kết nối (đã set trong `docker-compose.yml`):
- host: postgres (trong container) / localhost (từ máy ngoài)
- user: postgres
- password: 123456789
- db: torii

Nếu muốn seed thủ công, có thể `docker exec -it postgres psql -U postgres -d torii`.

### 3) Chạy backend (Nest Gateway + Auth service)
- Gateway dùng TypeORM + GraphQL code-first, sẽ tạo bảng `courses`.
- Schema GraphQL tự sinh tại `apps/gateway/schema.gql` khi gateway chạy.

Chạy cả gateway và auth microservice:
```bash
cd apps/server
pnpm dev
```
- Gateway lắng trên `http://localhost:3000/graphql`
- CORS đã bật.

Nếu chỉ cần gateway: `pnpm dev:gateway`.

### 4) Chạy codegen (hooks + types React)
Ở root:
```bash
pnpm codegen
```
Điều kiện: Gateway phải đang chạy để có schema, hoặc đã có file `apps/gateway/schema.gql`.
Kết quả sinh vào `packages/data-access/generated/graphql.tsx`.

### 5) Chạy frontend
- Next.js (Learner):
```bash
pnpm --filter web-learner dev
```
Truy cập `http://localhost:3002`. Trang `/` có form + bảng CRUD Course.

- Admin (Vite):
```bash
pnpm --filter web-admin dev
```
Truy cập `http://localhost:5173` (Vite dev default) hoặc `4173` nếu preview/build.

### 6) Biến môi trường tùy chọn
- Gateway: `DATABASE_URL` (đang default `postgres://postgres:123456789@localhost:5432/torii` trong code bạn chỉnh). Nếu chạy qua docker compose, bên trong container gateway dùng host `postgres` (đã set trong compose).
- Frontend: 
  - `NEXT_PUBLIC_GRAPHQL_ENDPOINT` (Next) 
  - `VITE_GRAPHQL_ENDPOINT` (Vite)  
  Mặc định trỏ `http://localhost:3000/graphql`.

### 7) Luồng kiểm thử nhanh
1. `docker-compose up -d postgres`
2. `cd apps/server && pnpm dev`
3. (tab mới) `pnpm codegen`
4. (tab mới) `pnpm --filter web-learner dev`
5. (tab mới) `pnpm --filter web-admin dev`
6. Mở web-learner và web-admin, tạo/sửa/xóa Course, dữ liệu đồng bộ qua Postgres.

### 8) Build/preview (tùy chọn)
- Web-admin build + preview:
```bash
pnpm --filter web-admin build
pnpm --filter web-admin preview  # cổng 4173
```
- Web-learner build/start:
```bash
pnpm --filter web-learner build
pnpm --filter web-learner start  # cổng 3000/3002 tùy env
```

### 10) Mobile Flutter codegen (graphql_codegen)
1. Đảm bảo đã có schema ở `apps/mobile_app/lib/graphql/schema.graphql` (copy từ `apps/server/apps/gateway/schema.gql` sau khi gateway chạy).
2. Operations gom vào một file: `apps/mobile_app/lib/graphql/operations.graphql` (có GetCourses/Create/Update/Delete).
3. Chạy trong thư mục mobile:
```bash
cd apps/mobile_app
flutter pub get
dart run build_runner build --delete-conflicting-outputs
```
- Cấu hình codegen: `apps/mobile_app/graphql_codegen.yaml`
- Operations: `apps/mobile_app/lib/graphql/operations.graphql`
- Code sinh ra nằm dưới `apps/mobile_app/lib/graphql/__generated__/`.
4. Runtime client: dùng `graphql_flutter` với endpoint `http://localhost:3000/graphql` (hoặc env bạn đặt).

### 11) CI/CD mẫu (GitHub Actions, tách job theo app)
- File: `.github/workflows/ci.yml`
- Ý tưởng: setup + cache pnpm, lint affected, build matrix cho `server`, `web-learner`, `web-admin` (affected-only với `--since`), deploy tách theo app (fail-fast: false để app lỗi không chặn app khác).
- Triển khai thật: thay step deploy bằng script/CLI của bạn cho từng app.
### 9) Ghi chú
- TypeORM `synchronize: true` đang bật cho demo (tự tạo bảng). Khi lên môi trường thật, chuyển sang migration.
- Giá trị `DATABASE_URL` trong code đã được chỉnh password `123456789`; nếu đổi, cần cập nhật cả compose hoặc env khi chạy gateway.
- Nếu schema thay đổi, chạy lại `pnpm codegen` để đồng bộ hooks/types.

