---
title: Academy Class Review Specification
description: Thiết kế chi tiết flow review cho lớp học (Class) sau khi học viên hoàn thành, dựa trên core-lms.md, billing & gamification.
---

## 1. Mục tiêu & phạm vi

- **Mục tiêu**:
  - Cho phép **học viên đã học** (có `Enrollment`) để lại review cho từng lớp (`Class`) mà họ tham gia.
  - Mỗi **lần học (Enrollment)** chỉ có **1 review**, có thể chỉnh sửa.
  - Review dùng cho:
    - Hiển thị uy tín & chất lượng lớp trên catalog / trang class.
    - Cung cấp insight cho Academic/Teacher.
    - Kích hoạt **gamification** (thưởng điểm khi review).
- **Phạm vi**:
  - Service `academy` (core LMS mới).
  - Không đụng trực tiếp tới flow billing cũ; chỉ dựa trên `Enrollment` (đã liên kết từ Order).

---

## 2. Schema & liên kết (Prisma)

### 2.1. Model `ClassReview`

Đã được thêm vào `apps/server/prisma/schema.prisma`:

```1507:1531:apps/server/prisma/schema.prisma
model ClassReview {
  id           String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  classId      String   @map("class_id") @db.Uuid
  enrollmentId String   @map("enrollment_id") @db.Uuid
  userId       String   @map("user_id") @db.Uuid

  rating       Int      // 1-5
  title        String?  @db.VarChar(255)
  content      String?  @db.Text
  status       String   @default("PUBLISHED") @db.VarChar(20) // PENDING, PUBLISHED, HIDDEN, REJECTED
  isAnonymous  Boolean  @default(false) @map("is_anonymous")
  metadata     Json?    @default("{}") @db.JsonB
  publishedAt  DateTime? @map("published_at")
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @default(now()) @updatedAt @map("updated_at")

  // Relations
  class      Class       @relation(fields: [classId], references: [id], onDelete: Cascade)
  enrollment Enrollment  @relation(fields: [enrollmentId], references: [id], onDelete: Cascade)
  user       User        @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([enrollmentId])
  @@index([classId])
  @@index([userId])
  @@index([status])
  @@map("academy_class_reviews")
}
```

### 2.2. Liên kết với các model khác

- `User`:

```124:573:apps/server/prisma/schema.prisma
  academyEnrollments           Enrollment[]
  academyLearningProgresses    LearningProgress[]
  academyExamAttempts          ExamAttempt[]
  academyAssignmentSubmissions AssignmentSubmission[]
  academyClassesTaught         Class[]                @relation("AcademyClassTeacher")
  academyClassReviews          ClassReview[]
```

- `Class`:

```1391:1428:apps/server/prisma/schema.prisma
  enrollments           Enrollment[]
  schedules             ClassSchedule[]
  assessments           ClassAssessment[]
  learningProgress      LearningProgress[]
  examAttempts          ExamAttempt[]
  tickets               Ticket[]
  certificates          Certificate[]
  assignmentSubmissions AssignmentSubmission[]
  offeringLinks         CourseOfferingClass[]
  reviews               ClassReview[]
```

- `Enrollment`:

```1482:1499:apps/server/prisma/schema.prisma
  class       Class        @relation(fields: [classId], references: [id], onDelete: Cascade)
  user        User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  order       Order?       @relation(fields: [sourceOrderId], references: [id], onDelete: SetNull)
  certificate Certificate?
  review      ClassReview?
```

**Invariant quan trọng**:

- Mỗi `Enrollment` tối đa **1 `ClassReview`**:
  - Đã enforce bởi `@@unique([enrollmentId])` trên `ClassReview`.

---

## 3. Điều kiện & quyền review

### 3.1. Điều kiện bắt buộc khi tạo review

- Bắt buộc tồn tại `Enrollment` với:
  - `enrollment.userId = currentUser.id`.
  - `enrollment.classId = classId` (class đang review).
  - `enrollment.status ∈ { ACTIVE, COMPLETED }`.
- Không tồn tại `ClassReview` khác trỏ vào cùng `enrollmentId`.
- `rating` nằm trong `[1, 5]`.

### 3.2. Chính sách “sau khi học xong”

Tuỳ `Class.mode` và policy:

- **VOD**:
  - Cho phép review khi:
    - `Enrollment.status = COMPLETED`, **hoặc**
    - `Enrollment.status = ACTIVE` nhưng:
      - Tổng `LearningProgress` (lessons) đạt `progressPercent ≥ threshold` (ví dụ 70%).
- **LIVE / BLENDED**:
  - Ưu tiên:
    - `Class.status = COMPLETED`.
    - `Enrollment.status ∈ { ACTIVE, COMPLETED }`.
  - Có thể cho phép review sớm hơn (sau ngày `endDate`), nhưng khuyến nghị chờ `COMPLETED`.

### 3.3. Số lượng review

- 1 review / 1 enrollment:
  - **Không** cho phép tạo nhiều review cho cùng `enrollmentId`.
  - Cho phép **chỉnh sửa** review đã có.
- Nếu user retake cùng class (classId giống, Enrollment khác):
  - Mỗi lần retake có 1 review riêng (gắn với enrollment tương ứng).

---

## 4. State machine `ClassReview.status`

### 4.1. Các trạng thái

- `PENDING`: chờ duyệt (nếu bật moderation).
- `PUBLISHED`: review đã public.
- `HIDDEN`: bị ẩn khỏi public (user “xoá” hoặc mod ẩn).
- `REJECTED`: bị từ chối do vi phạm nội quy.

### 4.2. Transition hợp lệ

- `PENDING -> PUBLISHED`
- `PENDING -> REJECTED`
- `PUBLISHED -> HIDDEN`
- `HIDDEN -> PUBLISHED` (khôi phục)
- Optional: `REJECTED -> PENDING` (user sửa & gửi lại).

### 4.3. Chính sách mặc định

- **Simple mode (gợi ý)**:
  - Review user gửi lần đầu auto vào `PUBLISHED`.
  - Admin/Staff có thể ẩn/reject sau nếu cần.
- **Moderation mode (tùy bật)**:
  - Review với `rating <= 2` hoặc match từ khóa nhạy cảm → `PENDING`.
  - Review còn lại auto `PUBLISHED`.

---

## 5. Flow chi tiết (GIVEN / WHEN / THEN)

### 5.1. Flow: Học viên hoàn thành VOD, nhận prompt review

- **GIVEN**:
  - `Class.mode = VOD`.
  - `Enrollment.status = COMPLETED`.
  - Không có `ClassReview` cho `enrollmentId`.
- **WHEN**:
  1. Service `academy` emit event `enrollment.completed` (như trong `ACADEMY_BACKEND_PLAN.md`).
  2. Notification service gửi email/push với CTA “Đánh giá khóa học”.
  3. Học viên bấm link, điền `rating`, `title`, `content`, `isAnonymous`.
  4. Frontend gọi `POST /academy/classes/:classId/reviews`.
- **THEN**:
  - Tạo `ClassReview` (status theo policy – mặc định `PUBLISHED`).
  - Trigger Gamification: cộng điểm cho hoạt động review (xem §7).
  - `Class` trong trang detail hiển thị review mới.

### 5.2. Flow: Học viên LIVE review sau khi lớp kết thúc

- **GIVEN**:
  - `Class.mode = LIVE` hoặc `BLENDED`.
  - `Class.status` được chuyển `IN_PROGRESS -> COMPLETED`.
  - Nhiều `Enrollment.ACTIVE`.
- **WHEN**:
  - Cron / job `completeClass` trong `ClassService` chạy.
  - Sau khi chuyển class sang `COMPLETED`, tạo notification/email cho learners.
- **THEN**:
  - Học viên có thể review như case 5.1.

### 5.3. Flow: Tạo review

- **Endpoint**: `POST /api/v1/academy/classes/:classId/reviews`
- **Body**:

```json
{
  "enrollmentId": "UUID",
  "rating": 5,
  "title": "Khóa rất hữu ích",
  "content": "Giáo trình rõ ràng, giảng viên hỗ trợ tốt.",
  "isAnonymous": false
}
```

- **Logic (service `ClassReviewService.createFromEnrollment`)**:
  1. Lấy `Enrollment` theo `enrollmentId`.
  2. Validate:
     - Thuộc về `currentUser`.
     - `enrollment.classId = classId`.
     - `enrollment.status` hợp lệ (ACTIVE/COMPLETED + rule mode).
     - Chưa có `ClassReview` cho `enrollmentId`.
     - `rating ∈ [1,5]`.
  3. Tạo `ClassReview`:
     - `status`:
       - Default `PUBLISHED` (simple).
       - Hoặc `PENDING` nếu bật moderation / rating thấp.
     - `publishedAt = now()` nếu `status = PUBLISHED`.
  4. (Optional) Cập nhật aggregate rating cho `Class`.
  5. Gửi event/gọi service gamification để cộng điểm.

- **Error case**:
  - `REVIEW_NOT_ELIGIBLE`: chưa đủ điều kiện học xong.
  - `REVIEW_ALREADY_EXISTS`: đã có review cho enrollment này.

### 5.4. Flow: Sửa review

- **Endpoint**: `PATCH /api/v1/academy/class-reviews/:id`
- **Body**:

```json
{
  "rating": 4,
  "title": "Khóa tốt",
  "content": "Khóa tốt nhưng hơi nhanh.",
  "isAnonymous": true
}
```

- **Logic**:
  1. Lấy `ClassReview` theo `id`.
  2. Chỉ cho phép:
     - `userId = currentUser.id`, hoặc
     - Admin/Staff.
  3. Update các field cho phép (`rating`, `title`, `content`, `isAnonymous`).
  4. Nếu `status = REJECTED`:
     - Option 1: chuyển `PENDING` (review lại).
     - Option 2: giữ `REJECTED` (chỉ admin có thể chuyển).
  5. Nếu `status = HIDDEN` do user “xoá”:
     - Sau khi sửa → có thể restore `PUBLISHED` hoặc `PENDING`.
  6. Re-calc aggregate rating cho `Class`.

### 5.5. Flow: “Xóa” review (user)

- **Endpoint**: `DELETE /api/v1/academy/class-reviews/:id`
- **Logic**:
  1. Check `userId = currentUser.id`.
  2. Không xoá cứng, chỉ:
     - `status = HIDDEN`.
     - `publishedAt = null`.
  3. Cập nhật lại aggregate rating (loại bỏ review này).

### 5.6. Flow: Moderation (Admin/Staff)

- **Endpoints**:
  - `GET /api/v1/academy/admin/class-reviews`
    - Filter: `status`, `rating`, `classId`, `courseProfileId`, `userId`, thời gian.
  - `POST /api/v1/academy/admin/class-reviews/:id/moderate`

- **Body moderate**:

```json
{
  "action": "publish", // "publish" | "hide" | "reject"
  "reason": "Ngôn từ không phù hợp"
}
```

- **Logic**:
  - `publish`:
    - `status = PUBLISHED`, nếu chưa có `publishedAt` → set `publishedAt = now()`.
  - `hide`:
    - `status = HIDDEN`.
  - `reject`:
    - `status = REJECTED`.
    - Lưu `reason` trong `metadata`.
  - Ghi `AuditLog`:
    - `entity = "class_review"`, `entityId = review.id`, `action = "moderate.*"`.
  - Cập nhật lại aggregate rating nếu trạng thái ảnh hưởng tới hiển thị.

---

## 6. Hiển thị & tích hợp với Class / Offering

### 6.1. Aggregate rating (optional nhưng khuyến nghị)

- **Mục tiêu**:
  - Hiển thị nhanh các thông tin:
    - `averageRating` (1–5).
    - `ratingCount`.
- **Cách tính**:
  - Dựa trên tất cả `ClassReview` với `status = PUBLISHED`.
  - Công thức cơ bản:
    - `averageRating = sum(rating) / count(PUBLISHED)`.
- **Triển khai**:
  - Phase đầu: 
    - FE gọi API `GET /classes/:id/reviews` + tính client-side nếu số lượng không lớn.
  - Phase sau (tối ưu):
    - Thêm field trên `Class`:
      - `ratingAverage Decimal?`, `ratingCount Int`.
    - Update mỗi khi:
      - Review mới `PUBLISHED`.
      - Review chuyển `PUBLISHED -> HIDDEN/REJECTED`.
      - User chỉnh sửa `rating`.

### 6.2. Nguồn hiển thị

- **Trang Class detail**:
  - Tab/section `Đánh giá & nhận xét`.
  - Hiển thị danh sách review `status = PUBLISHED`.
  - Nếu `isAnonymous = true`:
    - Ẩn tên user, hiển thị “Người học ẩn danh”.
- **Catalog / Offering**:
  - Đối với `CourseOffering`:
    - Lấy rating từ 1 hoặc nhiều `Class` liên kết (ví dụ class VOD chính).
    - Quy ước:
      - Dùng rating của class VOD default, hoặc
      - Tính trung bình rating của các class liên quan.

---

## 7. Tích hợp Gamification

### 7.1. Schema hiện có

- `UserGamification`:
  - `points` (điểm dùng để đổi coupon).
- `GamificationHistory`:
  - `type` (`EARN`, `REDEEM`, ...).
  - `currency` (`POINT`, `XP`).
  - `activityType` (`REVIEW` đã tồn tại trong enum `ActivityType`).

### 7.2. Rule thưởng điểm

- Khi **lần đầu** tạo review cho một `Enrollment` và review đạt `PUBLISHED`:
  - Thực hiện:
    - Tạo `GamificationHistory`:
      - `userId = review.userId`.
      - `amount = POINT_REWARD_FOR_REVIEW` (config, ví dụ 50).
      - `currency = POINT`.
      - `type = EARN`.
      - `activityType = REVIEW`.
      - `metadata = { "classId": classId, "enrollmentId": enrollmentId, "reviewId": review.id, "rating": rating }`.
    - Cộng `UserGamification.points += amount`.
- Chỉ thưởng **một lần** per `enrollmentId` (đã enforce qua unique review).

### 7.3. Ảnh hưởng khi review bị ẩn/reject

- **Policy đơn giản (gợi ý)**:
  - Nếu review bị `HIDDEN` hoặc `REJECTED` sau đó:
    - **Giữ nguyên** điểm đã thưởng (ít logic hơn).
- **Policy nghiêm ngặt** (có thể thêm sau):
  - Tạo transaction `GamificationHistory` `type = EXPIRATION` để trừ lại điểm.

---

## 8. API tổng hợp

### 8.1. Public/Learner APIs

- `GET /api/v1/academy/classes/:classId/reviews`
  - Query params:
    - `status = PUBLISHED` (mặc định).
    - `limit`, `offset`.
- `GET /api/v1/academy/me/class-reviews`
  - Trả về các review của current user.
- `POST /api/v1/academy/classes/:classId/reviews`
  - Tạo review mới (theo flow 5.3).
- `PATCH /api/v1/academy/class-reviews/:id`
  - Sửa review (5.4).
- `DELETE /api/v1/academy/class-reviews/:id`
  - Ẩn review (5.5).

### 8.2. Admin/Staff APIs

- `GET /api/v1/academy/admin/class-reviews`
  - Filter đa dạng: status, rating, user, class, thời gian…
- `POST /api/v1/academy/admin/class-reviews/:id/moderate`
  - `{ "action": "publish" | "hide" | "reject", "reason"?: string }`.

---

## 9. Checklist triển khai

- **Schema/DB**:
  - [x] Thêm `ClassReview` + liên kết vào `User`, `Class`, `Enrollment`.
  - [ ] Chạy `prisma migrate dev` để tạo bảng mới.
- **Backend (academy)**:
  - [ ] Tạo `ClassReviewModule` (service + controller/handler).
  - [ ] Implement:
    - [ ] `createFromEnrollment(classId, enrollmentId, dto)` với đầy đủ validation.
    - [ ] `updateReview(id, dto)` với check owner/admin.
    - [ ] `hideReview(id)` (DELETE logic).
    - [ ] `listClassReviews(classId, query)`.
    - [ ] `adminListReviews(query)` + `moderateReview(id, action, reason?)`.
  - [ ] Hook với Gamification:
    - [ ] Service gọi `GamificationService.earnForReview(userId, review)` khi review `PUBLISHED` lần đầu.
  - [ ] (Optional) Tính & cache `ratingAverage`, `ratingCount` trên `Class`.
- **Notification**:
  - [ ] Lắng event `enrollment.completed` → gửi CTA review.
- **Frontend**:
  - [ ] My Courses → CTA “Đánh giá khóa học”.
  - [ ] Trang Class detail → section review + form viết/sửa review.
  - [ ] Admin UI → màn moderate review (filter + action).

---

## 10. Invariants cần giữ

- Không tạo `ClassReview` nếu:
  - Không có `Enrollment` hợp lệ.
  - Đã có review cho `enrollmentId`.
- Không cho user này sửa/xoá review của user khác (trừ admin).
- Không hiển thị review `status ∉ {PUBLISHED}` cho public/student (trừ chính owner thấy được review của mình).
- Thưởng điểm gamification **tối đa một lần** cho mỗi `enrollmentId`.

## 11. Lưu ý:
KHÔNG GIỮ CODE LEGACY, update xong là xóa hết schema entity cũ và code cũ,không backward compability gì hết.