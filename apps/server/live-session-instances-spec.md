# Spec: Live Session Instances (Theo ngày) cho lớp LIVE

## Bối cảnh
Hiện tại hệ thống đang dùng `LiveSchedule` như lịch học theo tuần (recurring template) với các trường `weekday`, `startTime`, `endTime` gắn vào `classId`. Cách này phù hợp để cấu hình lịch cố định, nhưng thiếu khả năng xử lý thực tế:

- Nghỉ 1 buổi (cancel 1 ngày cụ thể)
- Dời 1 buổi (reschedule 1 ngày cụ thể)
- Học bù 1 buổi (make-up)
- Theo dõi trạng thái từng buổi (scheduled/cancelled/completed)
- Join room theo đúng “buổi học” thay vì theo template tuần

Hiện có `excludedDates` (kiểu `unknown`) nhưng việc dựa vào nó dễ chắp vá và khó đảm bảo đúng flow, đặc biệt khi có dời lịch/học bù.

Tài liệu này mô tả hướng triển khai “**session instances theo ngày**”, trong đó:
- `LiveSchedule` giữ vai trò **template (recurring rule)**
- Phát sinh `LiveScheduleSession` (instance) theo **ngày cụ thể**

## Mục tiêu
- Học viên xem lịch theo ngày/tuần/tháng dựa trên “instances”.
- Giảng viên có thể xin nghỉ/dời lịch cho **một buổi cụ thể**.
- Admin/approver duyệt request; hệ thống materialize thay đổi lên instances.
- Join room theo instance; roomId per-instance.
- Triển khai theo **một flow chuẩn duy nhất** (không giữ legacy/backward compatibility).

## Không nằm trong phạm vi (Phase 1)
- Attendance theo từng “occurrence date” (có thể mở rộng sau).
- Auto-completion dựa vào recording/meeting end.
- Đồng bộ calendar external.

> Ghi chú: Dù Phase 1 không triển khai Attendance “chuẩn theo instance”, phần **tác động lên Attendance** vẫn cần được xác định để tránh lệch schema/flow khi chuyển đổi (xem mục “Attendance impact” bên dưới).

## Quyết định quan trọng
- **Không giữ legacy / không backward compatibility**: các endpoint/DTO/logic cũ dựa trên `liveClassId`, `liveScheduleId + requestedDate`, hoặc join theo schedule-template sẽ **không được hỗ trợ** trong triển khai này.
- Triển khai theo hướng **cutover hoàn chỉnh**: client + gateway + academy service + schemas được nâng cấp đồng thời.

## Breaking changes (danh sách thay đổi phá vỡ)
- Join session đổi sang join theo **`sessionId` (instance)**, không join theo schedule-template.
- Lịch hiển thị/đọc đổi sang **`live_schedule_sessions`** (instance) là nguồn sự thật.
- Request nghỉ/dời đổi sang thao tác bằng **`sessionId`**, không dùng `liveScheduleId + requestedDate`.
- Attendance (nếu triển khai) phải gắn theo **`sessionId`**.

---

## Thuật ngữ
- **Schedule Template**: bản ghi lịch theo tuần (`live_schedules`).
- **Session Instance**: buổi học theo ngày (`live_schedule_sessions`).
- **Request**: yêu cầu nghỉ/dời lịch (workflow).

---

## Thiết kế dữ liệu

### 1) Giữ nguyên: `live_schedules` (template)
`live_schedules` tiếp tục lưu:
- `id`, `class_id`, `weekday`, `start_time`, `end_time`, `location`, `note`, ...

> `room_id` ở schedule template nếu có xem như legacy; roomId chuẩn sẽ nằm ở instance.

### 2) Bảng mới: `live_schedule_sessions` (instances theo ngày)
Một record tương ứng một buổi học cụ thể.

**Schema đề xuất**
- `id: uuid` (PK)
- `class_id: uuid` (FK -> classes)
- `schedule_id: uuid | null` (FK -> live_schedules, null nếu ad-hoc/make-up)
- `session_date: date` (ngày diễn ra theo timezone vận hành, mặc định Asia/Ho_Chi_Minh)
- `start_time: varchar(20)` (HH:mm)
- `end_time: varchar(20)` (HH:mm)
- `status: enum`
  - `SCHEDULED`
  - `CANCELLED`
  - `RESCHEDULED` (optional; hoặc dùng `superseded_by_session_id`)
  - `COMPLETED` (optional; có thể thêm sau)
- `cancellation_reason: text | null`
- `room_id: varchar(64) | null` (room theo buổi)
- `location: varchar(255) | null` (override từ template)
- `note: text | null`
- `instructor_id: uuid | null` (snapshot/override; default lấy từ class)
- `superseded_by_session_id: uuid | null` (FK -> live_schedule_sessions)
- `created_at`, `updated_at`
- `created_by`, `updated_by` (uuid | null)

**Index/constraint**
- Index `(class_id, session_date)`
- Unique chống trùng instance: ví dụ `(class_id, session_date, start_time, end_time)` hoặc `(class_id, schedule_id, session_date)` (tuỳ policy)

### 3) Deprecate `excludedDates`
- Không dùng `excludedDates` để logic join/hiển thị trong flow mới.
- Có thể giữ để migrate dữ liệu cũ (nếu cần).

---

## Chiến lược tạo instances

### Option A: Lazy generation (khuyến nghị MVP)
Khi client hỏi lịch theo khoảng ngày (`from`–`to`):
1. Query `live_schedule_sessions` trong range.
2. Xác định “thiếu” instances theo template `live_schedules`.
3. Generate và upsert phần thiếu.
4. Trả về danh sách instances đầy đủ.

Ưu điểm: ít cron, idempotent, tạo đúng theo nhu cầu.

### Option B: Pre-generate (phase sau)
Cron chạy mỗi đêm generate X tuần tới cho các class LIVE.

### Khuyến nghị vận hành (Hybrid để “sống được”)
Để tránh tạo instance “lụi” theo request và vẫn đảm bảo UX ổn định, khuyến nghị dùng **hybrid**:

- **Khi admin tạo/sửa `LiveSchedule` (template)**:
  - Trigger generate instances cho một “horizon” gần, ví dụ **2–4 tuần tới** (idempotent).
  - Mục tiêu: vừa tạo schedule xong thì learner/lecturer vào tab lịch là có ngay “buổi theo ngày”.

- **Cronjob hằng ngày** (hoặc cuối tuần / đầu tuần tuỳ vận hành):
  - Rolling generate để luôn có sẵn instances cho **N tuần tới** (ví dụ 4–8 tuần).
  - Idempotent (upsert) để không tạo trùng và có thể “tự chữa” nếu có sự cố.

- **Lazy generation** vẫn giữ như fallback:
  - Nếu UI hỏi range vượt ngoài horizon hoặc cron chưa chạy, backend generate thêm phần thiếu.

Ưu điểm:
- Lịch hiển thị ổn định, ít phụ thuộc thời điểm user truy cập.
- Không cần generate vô hạn.
- Dễ rollback và dễ debug vì có data materialized.

---

## API & Contract đề xuất

### A) Session Instances API (mới)

#### 1) List sessions theo range
`GET /api/academy/live-sessions`

Query:
- `classId: uuid` (required)
- `from: ISO date` (required, yyyy-mm-dd)
- `to: ISO date` (required, yyyy-mm-dd)

Response:
- `items: LiveScheduleSession[]`

#### 2) Generate sessions (optional, admin/internal)
`POST /api/academy/live-sessions/generate`

Body:
- `classId, from, to`

Response:
- `createdCount, updatedCount`

### B) LiveSchedule Template API (giữ)
`GET /api/academy/live-schedules?classId=...` để admin cấu hình template.

Tùy chọn: khi tạo template mới, có thể trigger generate instances cho 2–4 tuần tới.

### C) Join live session (đổi sang instance)
Hiện join đang theo `scheduleId` (id của `live_schedules` hoặc `live_schedule` record).

**Đề xuất**
- `POST /api/live-sessions/:sessionId/join/student`
- `POST /api/live-sessions/:sessionId/join/lecturer`

Validation join:
- `session.status === SCHEDULED`
- now nằm trong join window quanh session time
- session_date nằm trong class active date range (mở rộng: class status)

Room:
- `roomId` per-instance (stable theo `sessionId` hoặc theo rule rõ ràng).

---

## Workflow: Nghỉ / Dời lịch

### Hiện trạng
Request DTO backend đang dựa vào `liveScheduleId` + `requestedDate` cho `LEAVE`/`RESCHEDULE`.

### Đề xuất (chuẩn theo instances)
Request tạo theo **sessionId**:

#### Create request
`POST /api/academy/live-sessions/requests`

Body:
- `sessionId: uuid` (required)
- `type: LEAVE | RESCHEDULE`
- `reason?: string`
- Nếu RESCHEDULE:
  - `proposedDate: yyyy-mm-dd`
  - `proposedStartTime: HH:mm`
  - `proposedEndTime: HH:mm`
  - `proposedTeacherId?: uuid`

#### Approve request
Kết quả:
- LEAVE: update session -> `CANCELLED`, set reason
- RESCHEDULE:
  - session cũ -> `RESCHEDULED` (hoặc `CANCELLED`) và set `superseded_by_session_id`
  - tạo session mới với ngày/giờ đề xuất (có thể `schedule_id` null hoặc giữ theo template)

#### Conflict preview
API preview conflict nên theo `classId` + `date/time` + optional `excludeSessionId`:
- `classId: uuid`
- `sessionDate: yyyy-mm-dd`
- `weekday` (optional; có thể derive từ date)
- `startTime`, `endTime`
- `excludeSessionId?: uuid`

---

## Attendance impact (cần chỉnh theo instances hay không?)

### Hiện trạng (flow/template)
Ở flow cũ, Attendance thường bám theo:
- `liveScheduleId` (template/schedule) hoặc
- `liveClassId` (legacy) + ngày (ngầm định)

Cách này sẽ **không đủ** khi chuyển sang session instances vì:
- Một template tạo ra nhiều buổi theo ngày.
- “Nghỉ/dời/học bù” tạo ra ngoại lệ theo ngày.
- Attendance cần phân biệt từng buổi cụ thể.

### Đề xuất chuẩn (khuyến nghị)
Attendance nên gắn theo **session instance**:
- `liveScheduleSessionId` (hoặc `sessionId`) là khóa chính để ghi nhận điểm danh.

**Schema gợi ý**
- Attendance record:
  - `sessionId: uuid` (FK -> live_schedule_sessions)
  - `userId: uuid`
  - `status: PRESENT | ABSENT | LATE | EXCUSED`
  - `recordedBy`, `recordedAt`, `note?`

**Query**
- Lấy attendance theo session: `GET /api/academy/attendances?sessionId=...`
- Lấy attendance theo class + range: `GET /api/academy/attendances?classId=...&from=...&to=...` (phase sau)

### Backward compatibility
Trong giai đoạn chuyển đổi, có thể:
- Giữ endpoint/query legacy (theo `liveScheduleId`/`liveClassId`) nhưng **map sang sessions** trong range.
- Hoặc freeze attendance legacy và chỉ dùng attendance theo session cho lớp mới.

### MVP tối thiểu
Nếu Phase 1 chưa làm attendance theo session, cần chốt rõ:
- UI điểm danh chỉ hiển thị theo “session list”, nhưng khi lưu sẽ lưu theo `sessionId` (khuyến nghị).
- Tránh tiếp tục mở rộng theo `liveClassId`/`liveScheduleId` vì sẽ gây nợ kỹ thuật lớn.

---

## UI/UX (web-admin/web-learner)

### Admin / Lecturer
- Tab “Lịch học” hiển thị **instances** theo tuần (week view).
- Actions:
  - “Nghỉ buổi này” (LEAVE)
  - “Dời buổi này” (RESCHEDULE)
  - “Học bù” (create ad-hoc session)

### Learner
- Xem lịch theo instances.
- Buổi cancelled/rescheduled hiển thị trạng thái rõ.

---

## Migration & Backward Compatibility
> Mục này trước đây mô tả hướng có backward compatibility. Theo quyết định mới: **cutover hoàn chỉnh, không legacy**.

### Phase 0: DB & service nền (bắt buộc)
- Thêm bảng `live_schedule_sessions`.
- Implement service generate instances theo range (idempotent/upsert).
- Định nghĩa model/DTO/schema cho session instance.

### Phase 1: Cutover read-path (instances là nguồn sự thật)
- UI lịch (admin/lecturer/learner) chỉ đọc từ `GET /api/academy/live-sessions?classId&from&to`.
- Không dùng `GET /live-schedules` để hiển thị lịch cho user (schedule template chỉ dùng cho cấu hình).

### Phase 2: Cutover workflow request (session-based)
- Request nghỉ/dời chỉ thao tác theo `sessionId`.
- Approve tạo/cập nhật session instance theo outcome.

### Phase 3: Cutover join (session-based)
- Join endpoint chỉ nhận `sessionId`.
- RoomId per-instance.
- Join window tính theo `session_date + start/end`.

### Phase 4: Attendance (khuyến nghị triển khai cùng đợt hoặc ngay sau join)
- Attendance chuyển sang gắn theo `sessionId`.
- UI điểm danh chọn session instance làm “buổi học”.

### Phase 5: Cleanup
- Không dùng `excludedDates` (có thể giữ cột nhưng không còn logic).
- Không duy trì DTO/query theo `liveClassId` cho lịch.

---

## Acceptance Criteria (MVP)
- Có thể list lịch theo ngày/tuần/tháng cho 1 class LIVE.
- Tạo schedule template vẫn hoạt động.
- Tạo session instance trong range (lazy) không tạo trùng (idempotent).
- Lecturer tạo request LEAVE/RESCHEDULE cho 1 session.
- Approve RESCHEDULE tạo session mới và buổi cũ không còn joinable.
- Join session chỉ dựa vào instance, trả lỗi rõ nếu ngoài join window/status.

---

## Open Questions
- Timezone chuẩn: mặc định Asia/Ho_Chi_Minh hay theo config?
- Chính sách unique và “overlap”: cho phép 2 sessions cùng ngày khác giờ? (có)
- Teacher conflict scope: cùng instructorId across classes hay chỉ trong class?
- Khi class instructor đổi giữa kỳ, instances cũ có snapshot instructor hay luôn follow class?

---

## Đối chiếu spec vs code hiện tại (Implementation checklist)

> Phần này so sánh spec với code trong `apps/server` (academy service, gateway, prisma). Cập nhật khi triển khai thay đổi.

### Đã triển khai đúng spec

| Hạng mục | Spec | Hiện trạng |
|----------|------|------------|
| **Bảng `live_schedule_sessions`** | Instance theo ngày, đủ trường status/roomId/supersededBySessionId | ✅ Prisma model `LiveScheduleSession` có đủ field; unique `(classId, sessionDate, startTime, endTime)`; index `(classId, sessionDate)`. |
| **Template `live_schedules`** | Giữ nguyên, không dùng cho join/hiển thị | ✅ Template CRUD giữ; `assertTemplateMutable` khóa sửa sau khi class publish. |
| **List sessions theo range** | `GET /api/academy/live-sessions?classId&from&to` → items | ✅ Gateway `AcademyLiveSessionController` GET với `AcademyLiveSessionQueryDTO` (classId, from, to); backend gọi `findAllByClassAndRange` → lazy generate rồi `listSessionsForClassRange`. |
| **Lazy generation** | Khi client hỏi range, generate thiếu rồi trả instances | ✅ Handler `academy.liveSession.findAllByClassAndRange` gọi `generateInstancesForClassRange` trước khi `listSessionsForClassRange`. |
| **Hybrid: generate khi tạo/sửa template** | Tạo/sửa LiveSchedule → generate 2–4 tuần tới | ✅ `create`/`update` schedule gọi `generateInstancesForClassRange(classId, from, to)` với `DEFAULT_GENERATE_HORIZON_DAYS = 28`. |
| **Join theo instance** | Join theo `sessionId`; roomId per-instance | ✅ Gateway `POST /api/live-sessions/:sessionId/join/student` và `.../join/lecturer`; service `joinBySessionId`; roomId từ session hoặc `ensureSessionRoomId`. |
| **Request nghỉ/dời theo sessionId** | Create request với `sessionId`; approve LEAVE/RESCHEDULE | ✅ Request create DTO có `sessionId`; approve LEAVE → session CANCELLED; RESCHEDULE → session mới + cũ RESCHEDULED + `supersededBySessionId`. |
| **Conflict preview** | classId + sessionDate + start/end + excludeSessionId | ✅ `previewConflict` theo session instances, có `excludeSessionId`. |
| **Attendance theo session** | Attendance gắn `sessionId` (FK live_schedule_sessions) | ✅ Prisma `ClassAttendance` có `sessionId` FK; service create/find theo `sessionId`. |

### Chưa đúng / cần bổ sung

| Hạng mục | Spec | Hiện trạng | Hành động đề xuất |
|----------|------|------------|-------------------|
| **Validate join: session.status === SCHEDULED** | Chỉ cho join khi `session.status === SCHEDULED` | `joinBySessionId` chưa kiểm tra `session.status` | Trong `joinBySessionId`, thêm check: nếu `session.status !== 'SCHEDULED'` thì throw BadRequest (không cho join CANCELLED/RESCHEDULED). |
| **POST generate (admin)** | `POST /api/academy/live-sessions/generate` body classId, from, to → createdCount, updatedCount | Chưa có endpoint riêng; generate chỉ chạy khi gọi GET list | (Tùy chọn) Thêm endpoint POST generate cho admin/cron, trả về `createdCount`/`updatedCount` nếu cần báo cáo hoặc cron job. |
| **Deprecate join theo scheduleId** | Cutover: join chỉ theo sessionId | Service vẫn có method `join(id)` theo `liveSchedule` id | Không expose `join(scheduleId)` ở gateway (đã đúng). Nên ghi chú trong code rằng `join(scheduleId)` là legacy; hoặc xóa nếu không còn caller. |
| **Deprecate excludedDates trong logic** | Không dùng `excludedDates` cho join/hiển thị | Cột và DTO vẫn có `excludedDates`; không thấy logic join/list dựa vào nó | Giữ cột cho migration; đảm bảo không thêm logic mới dựa trên `excludedDates`. Ghi chú trong spec/README. |
| **List sessions response shape** | Trả về đủ thông tin cho UI (class title, instructor…) | `listSessionsForClassRange` trả về session thuần, không include class/courseProfile | (Tùy chọn) Nếu UI lịch cần tên lớp/giảng viên: mở rộng `listSessionsForClassRange` hoặc gateway map thêm include `class: { courseProfile, instructor }`. |

### Tóm tắt hành động ưu tiên

1. **Bắt buộc**: Trong `joinBySessionId`, thêm kiểm tra `session.status === 'SCHEDULED'`; nếu không thì trả lỗi rõ (ví dụ: "Buổi học đã bị hủy hoặc đã được dời.").
2. **Tùy chọn**: Thêm `POST /api/academy/live-sessions/generate` (body: classId, from, to) cho admin/cron nếu cần trigger generate độc lập.
3. **Tùy chọn**: Ghi chú hoặc xóa method `join(scheduleId)` nếu không còn sử dụng; giữ nguyên quy ước không dùng `excludedDates` trong logic mới.
4. **Tùy chọn**: Mở rộng response list sessions (include class/courseProfile/instructor) nếu UI lịch cần hiển thị đầy đủ.

