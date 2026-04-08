## Spec LIVE/VOD – Class, Offering, Order, Enrollment

> Tài liệu này mô tả mô hình dữ liệu và luồng xử lý mới nhất cho LIVE/VOD trong Academy.  
> Mục tiêu: để các agent/DEV khác có thể implement mà không lệch với backend hiện tại.

---

### 1. Thực thể chính

#### 1.1. `Class` (VOD / LIVE)

- Prisma `Class`:
  - `id: string @id`
  - `courseProfileId: string`
  - `syllabusId?: string`
  - `code: string @unique`
  - `name: string`
  - `mode: 'VOD' | 'LIVE'` (`ClassMode`)
  - `status: ClassStatus` → `DRAFT | PENDING_APPROVAL | OPENING | ONGOING | COMPLETED | ARCHIVED`
  - `instructorId?: string` (LIVE only)
  - **LIVE timeline (mới)**:
    - `openingDate?: DateTime` → ngày khai giảng / bắt đầu học
    - `closingDate?: DateTime` → ngày bế giảng / kết thúc học
    - `enrollmentOpenAt?: DateTime` → mở đăng ký/mở bán
    - `enrollmentCloseAt?: DateTime` → đóng đăng ký/mở bán
  - Workflow phê duyệt: `submittedForApprovalAt`, `submittedBy`, `approvedAt`, `approvedBy`, `rejectedAt`, `rejectedBy`, `rejectionReason`.

- DTO backend:
  - `ClassCreateDto`:
    - bắt buộc: `courseProfileId`, `code`, `name`, `mode`
    - optional: `syllabusId`, `status`, `instructorId`
    - optional: `openingDate`, `closingDate`, `enrollmentOpenAt`, `enrollmentCloseAt` (ISO string)
  - `ClassUpdateDto`:
    - optional: `name`, `status`, `syllabusId`, `instructorId`
    - optional: `openingDate`, `closingDate`, `enrollmentOpenAt`, `enrollmentCloseAt`

- `@workspace/schemas` (`academy-class.dto.ts`):
  - `AcademyClassCreateDTO/UpdateDTO` mirror các field trên với `z.coerce.date()` cho các mốc thời gian.
  - `AcademyClassModel` có thêm: `openingDate`, `closingDate`, `enrollmentOpenAt`, `enrollmentCloseAt`.

#### 1.2. `CourseOffering`

- Prisma:
  - `code`, `title`, `description?`
  - `price`, `salePr  - `courseProfileId?: string`
  - `status?: string` (DRAFT, PUBLISHED, etc.)
  - `instructorId?: string`

### [GET] /api/academy/classes?courseProfileId=...
- Admin/Staff query classes.
- Filtering options:
    - optional: `courseProfileId`, `status`, `instructorId`

### [PUT] /api/academy/classes/:id
- Update class details.
- payload:
    - optional: `name`, `status`, `courseProfileId`, `instructorId`
    - logic check: if changing `courseProfileId`, and existing students present, warn (or fail).
    - note: VOD classes usually stay fixed to their profile.

---

## Part 2: Course Offering (Packages)

Enrollment entry points are defined via `CourseOffering`.

### [POST] /api/academy/offerings
- payload: `code`, `title`, `description`, `price`, `salePrice`, `currency`, `classId`, `validFrom`, `validTo`.
- logic: Automatically sets `mode` based on target `class.mode`.
- approval: `status` starts as `DRAFT`. Must be approved via `submitForApproval` workflow.

### [GET] /api/academy/available-courses
- Public endpoint for store front.
- Returns `CourseOffering` items.
- Filter by `category` (N5, N4, etc.).
- Metadata: `isEnrollable`, `enrollableReason`.

---

## Part 3: Enrollment

### [POST] /api/academy/enrollments
- Admin manually adds a student to a class.
- payload: `userId`, `classId`, `offeringId?`.

### [GET] /api/academy/enrollments/my-courses
- Learner gets their active classes.
- Include course profile and recent learning progress.

---

## Refactoring Summary (Syllabus Removal)

- All references to `Syllabus` have been removed.
- Course Content (Modules, Lessons) is now directly linked to `CourseProfileId`.
- Classes now belong directly to a `CourseProfile`.
- Duplicating a `CourseProfile` duplicates its entire curriculum (Modules + Lessons), enabling easy "2025 versioning" without the extra Syllabus layer.
- Create/Update DTO only contains: `code`, `title`, `description?`, `price`, `salePrice?`, `currency`, `mode`, `status?`, `type?`, `courseProfileId?`, `classIds?`.

---

## Implementation Log

- [x] Prisma Schema update (Remove academy_syllabuses table).
- [x] Service refactor (Academy, Gateway, Agents).
- [x] Frontend UI update (Web Admin course detail, Web Learner portal).
- [x] Documentation update (Current file).
 `code`, `title`, `description?`, `price`, `salePrice?`, `currency`, `mode`, `status?`, `type?`, `courseProfileId?`, `classIds?` (tuỳ backend).

#### 1.3. `Order` / `OrderItem`

- `Order`:
  - 1 đơn checkout, thuộc 1 `userId`.
  - Chứa tổng tiền, trạng thái thanh toán, timestamps, v.v.

- `OrderItem`:
  - 1 dòng hàng trong `Order`.
  - Trường chính:
    - `orderId`
    - `offeringId`
    - `unitPrice`, `quantity`, `total`, metadata (có thể chứa `classId` người dùng đã chọn).
  - 1 `Order` có thể có nhiều `OrderItem` (mua nhiều khoá).

#### 1.4. `Enrollment`

- Prisma:
  - `id`, `userId`, `classId`, `offeringId?`, `enrolledAt`, `expiresAt?`, `status`.
  - Constraints:
    - `@@unique([userId, classId])`
    - `@@unique([userId, offeringId])`

- Ý nghĩa:
  - Mỗi `Enrollment` = 1 user được học 1 `Class` cụ thể.
  - `offeringId` dùng để trace “học viên vào lớp này nhờ gói bán nào”.

---

### 2. LIVE Schedule & Session

#### 2.1. `LiveSchedule` (template tuần)

- Mô tả khung giờ trong tuần:
  - `classId`, `weekday (0-6)`, `startTime`, `endTime`, `location?`, `excludedDates?`, `note?`, `roomId?`.
- Dùng để:
  - Kiểm tra conflict lịch lớp và lịch giảng viên.
  - Là template để generate các buổi `LiveScheduleSession` trong 1 khoảng ngày.

#### 2.2. `LiveScheduleSession` (buổi học theo ngày)

- Trường chính:
  - `classId`, `scheduleId?`
  - `sessionDate: DateTime`
  - `startTime`, `endTime`
  - `status: 'SCHEDULED' | 'CANCELLED' | 'RESCHEDULED' | 'COMPLETED'`
  - `roomId?`, `location?`, `note?`, `instructorId?`
  - `supersededBySessionId?`
  - audit: `createdAt`, `updatedAt`, `createdBy?`, `updatedBy?`.

- RoomId cho session:
  - Được generate **deterministic** trong `LiveScheduleService.generateInstancesForClassRange`:
    - `roomId = "live-" + classId(8) + "-" + yyyymmdd + "-" + startHHmm + "-" + endHHmm`
  - Khi join lại theo `sessionId`, nếu `roomId` chưa tồn tại thì dùng `ensureSessionRoomId(sessionId, roomId)`:
    - `live-sess-<sessionId8>` (fallback).

#### 2.3. `LiveScheduleRequest`

- Yêu cầu thay đổi buổi học:
  - `sessionId`, `classId?`, `requestedBy`
  - `type: 'RESCHEDULE'`
  - `status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'`
  - `requestedDate?`, `proposedDate?`
  - `proposedStartTime?`, `proposedEndTime?`, `proposedTeacherId?`
  - `reason?`, `reviewNote?`, `reviewedBy?`, `reviewedAt?`

- Approve logic (tóm tắt):
  - `RESCHEDULE`:
    - Validate không conflict bằng `previewConflict`.
    - Tạo `LiveScheduleSession` mới với slot được đề xuất.
    - Update session cũ → `status = RESCHEDULED`, `supersededBySessionId = newSession.id`.
  - Update request → `status = APPROVED`, set reviewer.

- `academy-live-schedule-request.dto.ts` (schemas) đã sync đầy đủ các field trên.

---

### 3. Logic generate sessions & khoá template

#### 3.1. Khi **publish/approve class LIVE**

- Trong `ClassService.publishClass(id, requesterId)`:
  - Kiểm tra:
    - `mode === LIVE`
    - Có `syllabusId`
    - Có ít nhất 1 `LiveSchedule` cho class.
    - Có `openingDate` và `closingDate`.
  - Cập nhật `status`:
    - LIVE: `DRAFT/PENDING_APPROVAL → OPENING`, set `approvedAt/approvedBy`.
  - Gọi:
    - `liveSchedules.generateInstancesForClassRange(classId, openingDate, closingDate, requesterId)`
      - Duyệt từng ngày trong khoảng.
      - Với mỗi ngày, tìm `LiveSchedule` (weekday khớp).
      - Upsert `LiveScheduleSession` với:
        - `classId`, `scheduleId`, `sessionDate`, `startTime`, `endTime`.
        - `status = 'SCHEDULED'`
        - `roomId` deterministic (như trên).
        - `instructorId = class.instructorId`.
        - `createdBy/updatedBy = requesterId`.

#### 3.2. Khóa `LiveSchedule` sau publish

- Trong `LiveScheduleService`:
  - Các hàm `create/update/delete` đều gọi `assertTemplateMutable(classId)`:
    - Chỉ cho phép chỉnh sửa khi `Class.status ∈ {DRAFT, PENDING_APPROVAL}`.
    - Nếu đã `OPENING/ONGOING/…` → ném lỗi:
      - `"LiveSchedule is locked after class is published. Please use session change requests."`
  - Điều này đảm bảo:
    - Template chỉ dùng để thiết kế trước.
    - Sau khi publish, mọi thay đổi đi qua `LiveScheduleRequest` (theo từng session).

---

### 4. Luồng Commerce cho LIVE

#### 4.1. Mục tiêu

- 1 `CourseProfile` (ví dụ N3) có thể có **nhiều `Class` LIVE cùng kỳ** (batch), khác giảng viên.
- 1 `CourseOffering` LIVE đại diện cho **gói bán N3 LIVE kỳ X**, **không cột cứng vào 1 class**.
- Khi học viên mua gói, họ phải **chọn 1 lớp LIVE cụ thể** để học.
- 1 học viên chỉ nên có **tối đa 1 enrollment ACTIVE cho mỗi `courseProfile` trong cùng 1 kỳ** (tránh học 2 lớp N3 cùng batch).

#### 4.2. Bước 1 – Learner xem trang Offering LIVE

- Input: `offeringId`, mode = LIVE.
- Backend/FE:
  - Load `CourseOffering` + `CourseProfile`.
  - Query các `Class` LIVE khả dụng:
    - `class.courseProfileId = offering.courseProfileId`.
    - `class.mode = 'LIVE'`.
    - `class.status ∈ {OPENING, ONGOING}` (tuỳ rule, thường là `OPENING`).
    - `now ∈ [class.enrollmentOpenAt, class.enrollmentCloseAt]`.

- UI:
  - Hiển thị thông tin gói: tên, giá, mô tả, profile, …
  - Hiển thị list lớp LIVE (batch) để user chọn:
    - giảng viên, `openingDate/closingDate`, `enrollmentOpenAt/CloseAt`.
  - Bắt buộc: user chọn 1 `classId` trước khi bấm “Đăng ký/Thanh toán”.

#### 4.3. Bước 2 – Tạo `Order` + `OrderItem`

- Khi user bấm mua:
  - Payload gửi lên:
    - `offeringId`
    - `classId` đã chọn
    - `userId` từ auth
  - Backend:
    1. Validate:
       - Offering ở trạng thái được bán (ví dụ LIVE: `OPENING`).
       - `Class` hợp lệ:
         - thuộc cùng `courseProfileId`.
         - `mode = LIVE`.
         - `status = OPENING`.
         - `now ∈ [enrollmentOpenAt, enrollmentCloseAt]`.
    2. Tạo/ghi nhận `Order` cho user.
    3. Tạo `OrderItem` với `offeringId` tương ứng (classId có thể lưu trong metadata).

#### 4.4. Bước 3 – Sau thanh toán thành công → tạo `Enrollment`

- Trigger khi `Order` chuyển sang `PAID`:
  - Với mỗi `OrderItem` LIVE:
    1. Lấy `classId` user đã chọn.
    2. Chống trùng enrollment trong cùng profile & kỳ:
       - Tìm `Enrollment` hiện có:
         - `userId = currentUserId`.
         - `status` trong {`ACTIVE`, `...`} (không tính CANCELLED/EXPIRED).
         - Join `Class`:
           - `class.mode = 'LIVE'`.
           - `class.courseProfileId = targetClass.courseProfileId`.
           - Cùng “kỳ” (term) với `targetClass.openingDate` (VD: Q1/2026 – kỳ 4 tháng).
       - Nếu tìm thấy → chặn, báo lỗi:  
         **“Bạn đã đăng ký 1 lớp LIVE cho khoá này trong kỳ hiện tại”**.
    3. Nếu không trùng:
       - Tạo `Enrollment`:
         - `userId`, `classId`, `offeringId`.
         - `status = ACTIVE`.
         - `expiresAt` với LIVE thường `null`.

---

### 5. Luồng Commerce cho VOD (tóm tắt)

- Thường mỗi VOD có 1 `Class` VOD cố định.
- Offering VOD:
  - Không cần chọn class (classId gắn sẵn).
- Sau khi thanh toán:
  - Backend tạo `Enrollment(userId, classId, offeringId, status=ACTIVE)`.
  - `expiresAt` = `now + defaultExpiresMonths` của lớp VOD.

---

### 6. Rule hiển thị & enable/disable nút mua

- LIVE:
  - Button “Đăng ký/Mua” cho 1 lớp trong danh sách chỉ enable nếu:
    - `Class.status = OPENING` (hoặc rule tương đương).
    - `now ∈ [enrollmentOpenAt, enrollmentCloseAt]`.
  - Mỗi lần mua 1 offering LIVE → học viên chọn 1 `Class` duy nhất.

- VOD:
  - Có thể chỉ cần check `Offering.status = PUBLISHED` và/hoặc `now` trong khoảng `enrollmentOpenAt/CloseAt` nếu dùng.

---

### 7. Frontend web-learner: Dashboard & Available course

> Ứng dụng: `apps/web-learner`. Route chính: Dashboard `/dashboard`, Khám phá khóa học `/dashboard/available-courses`, Chi tiết offering `/dashboard/available-courses/[slug]` (slug = `offeringId`). Cập nhật UI để phản ánh đúng logic commerce LIVE (offering → chọn lớp → checkout với `offeringId` + `classId`).

#### 7.1. Dashboard (`/dashboard`)

- **Hiện trạng**: Có CTA "Khám phá khóa học" dẫn tới `/dashboard/available-courses`; không hiển thị danh sách "khóa có sẵn" ngay trên dashboard.
- **Cập nhật (nếu có block "Khóa có sẵn" / "Gợi ý khóa" trên dashboard)**:
  - Nguồn dữ liệu: **Offerings** (có thể gọi API list offerings cho learner).
  - **LIVE**: Chỉ hiển thị offering khi có **ít nhất 1 Class** thuộc offering đó (cùng `courseProfileId`) thỏa:
    - `Class.mode = LIVE`, `Class.status = OPENING`;
    - `now ∈ [Class.enrollmentOpenAt, Class.enrollmentCloseAt]`.
  - Link từ dashboard: tới `/dashboard/available-courses` hoặc trực tiếp `/dashboard/available-courses/[offeringId]`.
- **API gợi ý**: Endpoint list offerings có filter kiểu `hasEnrollableLiveClass=true` (backend chỉ trả về offerings LIVE có ít nhất một class trong cửa sổ đăng ký) để dashboard/available-courses dùng chung.

#### 7.2. Trang danh sách Khám phá khóa học (`/dashboard/available-courses`)

- **Nguồn dữ liệu**: List offerings (ví dụ `useAcademyOfferings`); có tab/filter "Tất cả" / "VOD" / "LIVE".
- **LIVE**:
  - Chỉ hiển thị offering LIVE khi **có ít nhất 1 Class** thỏa: `mode = LIVE`, `status = OPENING`, `now ∈ [enrollmentOpenAt, enrollmentCloseAt]`.
  - Backend: API list offerings nên hỗ trợ filter (ví dụ `mode=LIVE` và chỉ trả về offering có ít nhất một class đang mở đăng ký) để danh sách không hiển thị lớp LIVE "hết hạn" hoặc chưa mở.
- **Link sang chi tiết**: Giữ như hiện tại — click vào thẻ khóa dẫn tới `/dashboard/available-courses/[offeringId]` (slug = `offeringId`).

#### 7.3. Trang chi tiết Offering (`/dashboard/available-courses/[slug]`)

- **Tham số**: `slug` = `offeringId`. Load offering bằng `useAcademyOffering(offeringId)` (hoặc API tương đương).
- **VOD**: Giữ luồng hiện tại: thông tin offering + 1 lớp VOD gắn sẵn; nút "Tiến hành thanh toán" → `/checkout/[offeringId]` (không cần chọn lớp).
- **LIVE** — cập nhật bắt buộc:
  1. **Danh sách lớp LIVE (batch)**:
     - Gọi API (hoặc dữ liệu kèm trong offering detail) để lấy danh sách **Class** LIVE khả dụng:
       - `class.courseProfileId` = profile của offering;
       - `class.mode = LIVE`;
       - `class.status = OPENING`;
       - `now ∈ [class.enrollmentOpenAt, class.enrollmentCloseAt]`.
     - Hiển thị từng lớp: tên lớp, mã lớp, giảng viên, `openingDate`–`closingDate`, cửa sổ đăng ký (`enrollmentOpenAt` – `enrollmentCloseAt`).
  2. **Chọn 1 lớp**: UI radio hoặc select — user **bắt buộc chọn đúng 1 `classId`** trước khi bấm đăng ký/thanh toán.
  3. **Nút "Đăng ký" / "Tiến hành thanh toán"**:
     - **Enable** chỉ khi: (a) có ít nhất 1 lớp trong danh sách khả dụng, và (b) user đã chọn 1 lớp.
     - **Disable** nếu: không có lớp nào trong cửa sổ đăng ký, hoặc chưa chọn lớp.
  4. **Checkout**: Khi bấm nút, chuyển sang checkout với **`offeringId` + `classId`** (ví dụ `/checkout/[offeringId]?classId=...` hoặc POST body khi tạo order). Backend đã xử lý theo mục 4.2–4.4 (validate class, tạo Order/OrderItem, sau thanh toán tạo Enrollment với `classId` đã chọn).

#### 7.4. API cần dùng / mở rộng

- **Dashboard / Available courses list**:
  - List offerings: hỗ trợ filter (ví dụ `mode=LIVE`) và **chỉ trả về offering LIVE có ít nhất 1 class** thỏa `status=OPENING` và `now ∈ [enrollmentOpenAt, enrollmentCloseAt]` (có thể tham số kiểu `hasEnrollableLiveClass=true` hoặc logic tương đương phía backend).
- **Offering detail (LIVE)**:
  - Trả về offering + **danh sách Class LIVE** thuộc cùng `courseProfileId`, đã lọc: `status = OPENING`, `now ∈ [enrollmentOpenAt, enrollmentCloseAt]`; có thể kèm thông tin giảng viên, `openingDate`, `closingDate` để FE render list chọn lớp.

#### 7.5. Tóm tắt luồng LIVE trên FE

1. User vào Dashboard → (tuỳ chọn) thấy "Khóa có sẵn" chỉ gồm offering có lớp LIVE đang mở đăng ký.
2. User vào "Khám phá khóa học" → danh sách LIVE chỉ gồm offering có ít nhất 1 class trong cửa sổ đăng ký.
3. User bấm vào 1 khóa LIVE → trang chi tiết: thông tin offering + **danh sách lớp LIVE** (batch); user **chọn 1 lớp** → bấm "Đăng ký/Thanh toán" → checkout với `offeringId` + `classId`.
4. Nút "Đăng ký" disable nếu không có lớp nào hoặc chưa chọn lớp.

---

### 8. Ghi chú triển khai

- Khi thêm/đổi schema Prisma (các field timeline ở `Class`), cần chạy migration tương ứng.
- Các agent khác khi implement FE/BE mới cần:
  - Không thêm `startDate/sellDate` riêng cho `CourseOffering` (dùng `Class` làm nguồn sự thật về thời gian).
  - Khi xử lý LIVE, luôn dựa vào `Class` (timeline + status) để quyết định:
    - lớp khả dụng để đăng ký,
    - rule chọn lớp,
    - tạo Enrollment.

