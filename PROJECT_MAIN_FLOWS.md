# Torii Monorepo - Main Flows (Spec + Code Mapped)

Tài liệu này tổng hợp **các main flow quan trọng nhất** của dự án Torii dựa trên:

- Spec trong `apps/server` (đặc biệt: `core-lms.md`, `ACADEMY_BACKEND_PLAN.md`, `QUESTION_POOL_SPEC.md`, `PLACEMENT_ASSESSMENT_SPEC.md`, `JAPANESE_AI_AGENT_SPEC.md`, `ACADEMY_GAMIFICATION_SPEC.md`, `ACADEMY_ACHIEVEMENT_SPEC.md`).
- Code backend thực tế ở `apps/server/services/*` (gateway, academy, identity, meet, agents).
- Code frontend thực tế ở `apps/web-learner`, `apps/web-admin`, `apps/meet`.

---

## 1) Kiến trúc tổng thể (flow gốc toàn hệ thống)

1. Người dùng thao tác ở 3 frontend chính:
   - `apps/web-learner` (cổng học viên),
   - `apps/web-admin` (quản trị),
   - `apps/meet` (lớp học live realtime).
2. Frontend gọi HTTP API qua Gateway (`apps/server/services/gateway`).
3. Gateway điều phối request theo module:
   - `api/auth`, `api/admin/users` -> Identity service,
   - `api/academy/*` -> Academy service,
   - `api/agents/*` -> Agents service,
   - `auth/room`, `api/insights`, `api/polls`, `api/ingress`... -> Meet service.
4. Các service backend chạy mô hình microservice NATS (request-response + event).
5. Dữ liệu nghiệp vụ lưu ở PostgreSQL/Redis; Meet tích hợp LiveKit cho media.

---

## 2) Flow xác thực và hồ sơ người dùng (Identity)

### Mục tiêu
Đăng ký/đăng nhập, quản lý phiên, 2FA, phân quyền RBAC.

### Luồng chính
1. User vào trang auth:
   - Learner: `/login`, `/register`, `/forgot-password`.
   - Admin: `/login` (web-admin).
2. Frontend gọi:
   - `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout`,
   - `POST /api/auth/2fa/totp/generate|enable|disable`,
   - `GET /api/auth/me`, `GET /api/auth/sessions`.
3. Gateway chuyển sang Identity service qua NATS.
4. Identity xử lý:
   - xác thực tài khoản,
   - kiểm tra 2FA nếu bật,
   - phát hành token + quản lý session.
5. Frontend lưu trạng thái auth, hiển thị giao diện theo role/permission.

### Kết quả nghiệp vụ
- Hệ thống có auth đa lớp (JWT + 2FA), phân quyền theo role (admin, lecturer, learner, staff...).

---

## 3) Flow quản trị học thuật LMS (Admin Academy)

### Mục tiêu
Team vận hành tạo và quản lý toàn bộ domain học tập theo 4 lớp: Content -> Delivery -> Assessment -> Commerce.

### Frontend
- `apps/web-admin`, nhóm route `/academy/*`:
  - course profiles, editions, chapters/items, lessons,
  - classes/live schedules/enrollments,
  - exams/questions/question-pools,
  - offerings, approvals, reports.

### API chính
- Content: `/api/academy/course-profiles`, `/course-editions`, `/chapters`, `/chapter-items`, `/lessons`, `/quiz-templates`, `/assignment-templates`.
- Assessment: `/api/academy/questions`, `/question-pools`, `/exams`, `/exam-attempts`, `/class-assessments`.
- Delivery: `/api/academy/classes`, `/live-schedules`, `/enrollments`, `/class-attendances`.
- Commerce: `/api/academy/course-offerings`, `/api/academy/orders`, `/api/academy/coupons`.
- Approval flow: `submit-for-approval`, `approve`, `reject` trên edition/class/offering.

### Kết quả nghiệp vụ
- Staff/Admin có thể vận hành full vòng đời khóa học từ xây dựng nội dung đến mở bán và quản lý lớp.

---

## 4) Flow learner khám phá và mua khóa học

### Mục tiêu
Học viên xem khóa học, checkout, thanh toán, nhận quyền học.

### Frontend
- Marketing/dashboard learner:
  - `/dashboard/available-courses`,
  - `/checkout/[courseId]`,
  - `/payment/success`, `/payment/cancel`,
  - `/dashboard/payment`.

### Luồng chính
1. Learner xem offering public (`GET /api/academy/course-offerings/public`).
2. Vào checkout, hệ thống lấy:
   - thông tin offering,
   - số dư ví,
   - preview đơn hàng (`POST /api/academy/orders/preview`),
   - coupon validation (`POST /api/academy/coupons/validate`) nếu có mã.
3. Learner xác nhận thanh toán (`POST /api/academy/orders/checkout`).
4. Sau khi thanh toán thành công, backend fulfillment tạo enrollment theo class map của offering.

### Kết quả nghiệp vụ
- Từ 1 giao dịch thương mại, learner được cấp quyền vào 1 hoặc nhiều class liên quan.

---

## 5) Flow học tập VOD (self-paced learning)

### Mục tiêu
Học viên học lesson, làm quiz/assignment, theo dõi tiến độ và hoàn thành khóa.

### Frontend
- `/dashboard/my-courses`,
- `/courses/[courseId]/learn`,
- `/courses/[courseId]/quizzes/*`,
- `/dashboard/history`, `/dashboard/certificates`.

### Luồng chính
1. Learner vào course player -> load class + curriculum + enrollment check.
2. Khi học lesson:
   - tracking tiến độ qua `/api/learning-progress/track`,
   - lấy lesson đã hoàn thành, thống kê và lịch sử.
3. Khi làm assessment:
   - exam attempts: `/api/academy/exam-attempts/start|save-answers|submit`,
   - assignment submissions: `/api/academy/assignment-submissions`.
4. Nếu đạt điều kiện hoàn thành, enrollment chuyển trạng thái completed (theo rule backend/spec).

### Kết quả nghiệp vụ
- Có full learning loop: học nội dung -> kiểm tra -> theo dõi tiến độ -> hoàn thành.

---

## 6) Flow lớp LIVE và lịch học

### Mục tiêu
Cho learner theo lịch live class và tham gia đúng phiên học.

### Frontend
- `/dashboard/schedule` (learner),
- `/academy/classes/*`, `/academy/live-schedule/*` (admin).

### Luồng chính
1. Admin tạo class LIVE + live schedules trong Academy.
2. Learner xem lịch cá nhân (`useMySchedule` -> live session API).
3. Tại thời điểm join:
   - learner gọi join session (`/api/live-sessions/:id/join`),
   - backend trả meet access token.
4. Frontend mở tab `meet` với token để vào phòng live.

### Kết quả nghiệp vụ
- Live class được vận hành xuyên suốt từ lịch học LMS sang phòng học realtime.

---

## 7) Flow vào phòng họp Meet realtime

### Mục tiêu
Kết nối người dùng vào phòng LiveKit + NATS channel và điều khiển phiên họp.

### Frontend (`apps/meet`)
1. App đọc `access_token` từ URL.
2. Gọi verify token (`verifyToken`) để lấy:
   - `roomId`, `userId`,
   - `natsWsUrls`,
   - subjects/stream cần subscribe.
3. Mở kết nối NATS + media server, vào trạng thái ready.
4. Render full meeting UI: header, main area, footer, chat, participants, polls, whiteboard...

### Backend Meet API chính
- Room: `auth/room/getJoinToken`, `auth/room/create`, `auth/room/endRoom`.
- Polls: `api/polls/*`.
- Waiting room: `api/waitingRoom/*`.
- Breakout: `api/breakoutRoom/*`.
- Recording/artifact/download: `auth/recording/*`, `auth/artifact/*`, `download/*`.
- Ingress/RTMP: `api/ingress/create`, `api/rtmp`.

### Kết quả nghiệp vụ
- Hệ thống lớp học live có đầy đủ tính năng vận hành thực tế (moderation + collaboration + recording).

---

## 9) Flow Placement Assessment (kiểm tra đầu vào)

### Mục tiêu
Xác định trình độ (JLPT) dựa trên chấm điểm cấu hình, không hardcode.

### Frontend
- `/dashboard/assessment/placement`.

### API
- `GET /api/academy/placement/info`,
- `POST /api/academy/placement/start`,
- `POST /api/academy/placement/submit`.

### Luồng chính
1. Learner xem info bài placement + policy làm lại.
2. Start attempt, nhận đề và làm bài trên client.
3. Submit toàn bộ answers.
4. Backend chấm điểm theo rule cấu hình (`placementScoring`) và trả assessed level + recommendation.

### Kết quả nghiệp vụ
- Placement trở thành entry flow để gợi ý lộ trình/khóa học phù hợp.

---

## 10) Flow AI Sensei (chat, translate, roleplay, drill)

### Mục tiêu
AI trợ giảng tiếng Nhật bám context học tập (lesson-level/syllabus-aware).

### Frontend
- `/ai-sensei/chat`,
- `/ai-sensei/translate`,
- `/ai-sensei/roleplay`,
- `/dashboard/assessment` (AI hỗ trợ phần luyện tập).

### API (Gateway -> Agents)
- `POST /api/agents/chat`,
- `POST /api/agents/translate`,
- `POST /api/agents/grammar-check`,
- `POST /api/agents/roleplay`,
- `POST /api/agents/drill/generate`,
- `POST /api/agents/tts`,
- `GET /api/agents/sensei/quota-status`,
- `POST /api/agents/livekit-token`, `POST /api/agents/livekit-end`.

### Kết quả nghiệp vụ
- Learner có kênh học AI song song với LMS core: hỏi đáp, dịch, luyện hội thoại, voice roleplay.

---

## 11) Flow Study Notes + Study Sets (flashcard/SRS)

### Mục tiêu
Biến quá trình học thành ghi chú và ôn tập lặp lại ngắt quãng.

### Frontend
- `/dashboard/study-notes`,
- `/dashboard/study-sets`,
- `/dashboard/study-sets/[setId]/review`,
- `/dashboard/study-sets/[setId]/test`,
- `/dashboard/study-sets/[setId]/match`.

### API
- Study notes: `/api/academy/study-notes`.
- Study sets/cards/review/test/match: `/api/academy/study-sets/*`, `/api/academy/set-cards/*`.

### Kết quả nghiệp vụ
- Vòng học cá nhân hóa: học bài -> tạo note/card -> ôn tập daily -> tăng retention.

---

## 12) Flow Gamification -> Rewards -> Coupon -> Conversion

### Mục tiêu
Tăng engagement và chuyển đổi doanh thu qua điểm thưởng.

### Frontend
- `/dashboard/rewards`,
- `/dashboard/achievements`,
- Header hiển thị streak/xp/points/wallet.

### API
- Learner: `GET /api/gamification/profile|streak|history|rewards|achievements|activity-heatmap`, `POST /api/gamification/redeem`.
- Admin: `api/gamification/admin/rewards*`, `api/gamification/admin/achievements*`.

### Luồng chính
1. User học tập/hoạt động -> tích điểm XP/streak.
2. User đổi reward -> nhận coupon cá nhân.
3. Coupon được dùng tại checkout để giảm giá khóa học.
4. Thành tích (achievement) mở khóa theo mốc học tập và có thể thưởng thêm points.

### Kết quả nghiệp vụ
- Tạo vòng lặp kinh doanh rõ ràng: Learn -> Earn -> Redeem -> Buy.

---

## 14) Tóm tắt nhanh để thuyết trình

Nếu cần trình bày ngắn gọn 1 slide:

1. **Identity**: auth + 2FA + RBAC.
2. **Academy Core**: Content -> Delivery -> Assessment -> Commerce.
3. **Learner Journey**: Discover -> Checkout -> Enroll -> Learn -> Complete.
4. **Meet**: live class realtime + polls/breakout/recording.
5. **AI Layer**: AI Sensei (outside class) + Insights AI (inside live class).
6. **Growth Loop**: Gamification -> Reward coupon -> tăng conversion.

---

## 15) Phạm vi đã đối chiếu

- Backend services: `gateway`, `academy`, `identity`, `meet`, `agents`.
- Frontends: `web-learner`, `web-admin`, `meet`.
- Spec files trong `apps/server` dùng để đối chiếu nghiệp vụ.

Tài liệu này phù hợp để dùng làm baseline trình bày kiến trúc và main flows của đồ án.
