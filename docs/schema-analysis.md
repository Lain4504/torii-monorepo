# Phân Tích Schema Backend - Torii Monorepo

> **File:** `apps/server/prisma/schema.prisma` (2159 dòng)
> **Database:** PostgreSQL
> **ORM:** Prisma Client
> **Ngày phân tích:** 2026-03-05

---

## Mục Lục

1. [Tổng quan kiến trúc](#1-tổng-quan-kiến-trúc)
2. [Domain: Khóa học (Course)](#2-domain-khóa-học-course)
3. [Domain: Nội dung (Content)](#3-domain-nội-dung-content)
4. [Domain: Live Session & Lịch dạy](#4-domain-live-session--lịch-dạy)
5. [Domain: Đánh giá & Bài tập](#5-domain-đánh-giá--bài-tập)
6. [Domain: Người dùng (User)](#6-domain-người-dùng-user)
7. [Domain: Xác thực & Phiên đăng nhập](#7-domain-xác-thực--phiên-đăng-nhập)
8. [Domain: Thương mại (Commerce)](#8-domain-thương-mại-commerce)
9. [Domain: Flashcard & SRS](#9-domain-flashcard--srs)
10. [Domain: Bài kiểm tra (Quiz)](#10-domain-bài-kiểm-tra-quiz)
11. [Domain: Gamification](#11-domain-gamification)
12. [Domain: Cộng đồng (Community)](#12-domain-cộng-đồng-community)
13. [Domain: File & Media](#13-domain-file--media)
14. [Domain: Phòng học trực tuyến (Room)](#14-domain-phòng-học-trực-tuyến-room)
15. [Domain: Hệ thống (System)](#15-domain-hệ-thống-system)
16. [Sơ đồ quan hệ tổng thể](#16-sơ-đồ-quan-hệ-tổng-thể)
17. [Bảng tổng hợp tất cả Entities](#17-bảng-tổng-hợp-tất-cả-entities)
18. [Bảng tổng hợp tất cả Enums](#18-bảng-tổng-hợp-tất-cả-enums)

---

## 1. Tổng quan kiến trúc

Hệ thống sử dụng mô hình **Master/Run** cho khóa học:

```
CourseMaster (Blueprint) → CourseVersion (Snapshot) → CourseRun (Lần chạy cụ thể)
```

- **CourseMaster**: Template/bản thiết kế của khóa học. Định nghĩa cấu trúc, nội dung, syllabus.
- **CourseVersion**: Snapshot của CourseMaster tại một thời điểm (dùng để track thay đổi).
- **CourseRun**: Một lần mở khóa học thực tế — có giảng viên, ngày khai giảng, giá tiền, học viên đăng ký.

**Mô hình này cho phép:**
- Một CourseMaster có nhiều phiên bản (v1.0, v1.1, v2.0…)
- Một CourseMaster có thể chạy nhiều lần (mỗi học kỳ một CourseRun)
- Học viên enroll vào **CourseRun**, không phải CourseMaster

---

## 2. Domain: Khóa học (Course)

### 2.1 Sơ đồ quan hệ

```
CourseMaster (1) ──────────────── (N) CourseVersion
     │                                      │
     │ (1-N)                                │ (1-N)
     ▼                                      ▼
  Module (N)                          CourseRun (N) ──── User (Lecturer)
     │                                      │
     │ (1-N)                                │
     ▼                            ┌─────────┼──────────────────────────┐
  Lesson (N)                      │         │                          │
     │                       Enrollment  LiveSession             Assignment
     │ (1-N)                      │         │                          │
     ▼                       LessonProgress Attendance           Submission
 CourseRunLesson                                                       │
                                                                 GradeHistory
```

### 2.2 CourseMaster

| Field | Type | Mô tả |
|-------|------|-------|
| `id` | UUID | Primary key |
| `title` | VARCHAR(255) | Tên khóa học |
| `slug` | VARCHAR(255) UNIQUE | URL slug |
| `type` | VARCHAR(20) | `vod` hoặc `live` |
| `description` | Text | Mô tả đầy đủ |
| `shortDescription` | VARCHAR(500) | Mô tả ngắn |
| `jlptLevel` | VARCHAR(5) | N5, N4, N3, N2, N1 |
| `tags` | String[] | Tags phân loại |
| `status` | CourseMasterStatus | DRAFT → PENDING_REVIEW → APPROVED → ARCHIVED |
| `rejectionReason` | Text | Lý do từ chối review |
| `learningOutcomes` | JSON | Mục tiêu học tập (JSON array) |
| `requirements` | JSON | Yêu cầu đầu vào |
| `coverUrl` | Text | Ảnh bìa |
| `trialDays` | Int | Số ngày học thử |
| `maxTrialLessons` | Int | Số bài học thử tối đa |
| `aiMetadata` | JSON | Metadata AI sinh tự động |
| `createdBy` | UUID (→ User) | Giảng viên tạo |
| `approvedBy` | UUID (→ User) | Admin duyệt |
| `totalLessons` | Int | Bộ đếm tổng số bài học |
| `totalModules` | Int | Bộ đếm tổng số module |
| `totalQuizzes` | Int | Bộ đếm tổng số quiz |

**Quan hệ:**
- `modules` → `Module[]` (1-N, Cascade delete)
- `versions` → `CourseVersion[]` (1-N)
- `courseRuns` → `CourseRun[]` (1-N)

**CourseMasterStatus enum:**
```
DRAFT → PENDING_REVIEW → CHANGES_REQUIRED ↔ APPROVED → ARCHIVED
```

---

### 2.3 CourseVersion

Lưu snapshot của curriculum tại thời điểm publish.

| Field | Type | Mô tả |
|-------|------|-------|
| `id` | UUID | Primary key |
| `courseMasterId` | UUID | FK → CourseMaster |
| `versionTag` | VARCHAR(20) | v1.0, v1.1, v2.0… |
| `curriculumSnapshot` | JSONB | Snapshot đầy đủ Module + Lesson |
| `changelog` | Text | Ghi chú thay đổi |
| `publishedAt` | DateTime | Thời điểm publish |

**Quan hệ:**
- `courseMaster` → `CourseMaster`
- `enrollments` → `Enrollment[]` (học viên enroll theo version nào)
- `courseRuns` → `CourseRun[]`

---

### 2.4 CourseRun

Bản chạy thực tế của khóa học.

| Field | Type | Mô tả |
|-------|------|-------|
| `id` | UUID | Primary key |
| `courseMasterId` | UUID | FK → CourseMaster |
| `versionId` | UUID? | FK → CourseVersion |
| `title` | VARCHAR(255) | Tên lần chạy (có thể khác master) |
| `slug` | UNIQUE | URL slug |
| `lecturerId` | UUID? | FK → User (giảng viên phụ trách) |
| `isLegacy` | Boolean | Flag khóa học cũ |
| `startDate` / `endDate` | DateTime? | Ngày bắt đầu / kết thúc |
| `enrollmentStart` / `enrollmentEnd` | DateTime? | Khoảng thời gian đăng ký |
| `maxStudents` | Int? | Giới hạn học viên |
| `minStudents` | Int? | Số học viên tối thiểu để khai giảng |
| `totalStudents` | Int | Đếm học viên hiện tại |
| `price` | Decimal(10,2)? | Giá gốc |
| `discountPrice` | Decimal(10,2)? | Giá giảm |
| `liveConfig` | JSON? | Cấu hình LiveKit/WebRTC |
| `status` | CourseRunStatus | Trạng thái vận hành |
| `averageRating` | Decimal(3,2) | Đánh giá trung bình |
| `totalReviews` | Int | Tổng số đánh giá |

**CourseRunStatus enum:**
```
DRAFT → PENDING_REVIEW → CHANGES_REQUIRED ↔ APPROVED
                                                ↓
PLANNING → ENROLLING → IN_PROGRESS → COMPLETED
                    ↘ POSTPONED
                    ↘ CANCELLED / CANCELLED_BY_SYSTEM → ARCHIVED
```

**Quan hệ (1 CourseRun liên kết với):**

| Relation | Cardinality | Entity |
|----------|-------------|--------|
| `courseMaster` | N → 1 | CourseMaster |
| `version` | N → 1 (nullable) | CourseVersion |
| `lecturer` | N → 1 (nullable) | User |
| `enrollments` | 1 → N | Enrollment |
| `discussions` | 1 → N | DiscussionTopic |
| `tickets` | 1 → N | Ticket |
| `liveSessions` | 1 → N | LiveSession |
| `wishlists` | 1 → N | Wishlist |
| `reviews` | 1 → N | Review |
| `cartItems` | 1 → N | CartItem |
| `assignments` | 1 → N | Assignment |
| `submissions` | 1 → N | Submission |
| `quizzes` | 1 → N | Quiz |
| `attempts` | 1 → N | QuizAttempt |
| `certificates` | 1 → N | Certificate |
| `teachingSchedules` | 1 → N | TeachingSchedule |
| `scheduleRequests` | 1 → N | LiveSessionScheduleRequest |

---

### 2.5 CourseMasterReview & CourseRunReview

Quy trình duyệt 2 cấp:

```
Giảng viên tạo CourseMaster → Nộp review (CourseMasterReview)
    Admin duyệt → CourseMaster APPROVED
        → Tạo CourseRun → Nộp review (CourseRunReview)
            Admin duyệt → CourseRun APPROVED → PLANNING → ENROLLING...
```

**CourseMasterReview:**
- `courseMasterId` → CourseMaster
- `versionId` → CourseVersion (nullable)
- `reviewerId` → User (admin)
- `status`: PENDING / APPROVED / REJECTED / CHANGES_REQUIRED
- `checklist`: JSON (danh sách tiêu chí)
- `comments`, `rejectionReason`

**CourseRunReview:**
- `courseRunId` → CourseRun
- `reviewerId` → User (admin)
- `roundNumber`: Vòng review (1, 2, 3…)
- `status`: PENDING / APPROVED / REJECTED / CHANGES_REQUIRED

---

## 3. Domain: Nội dung (Content)

### 3.1 Hierarchy

```
CourseMaster
    └── Module (orderIndex)
            └── Lesson (orderIndex)
                    ├── LessonMaterial (FileAsset)
                    ├── Quiz
                    ├── Assignment
                    └── CourseRunLesson (override per Run)
```

### 3.2 Module

| Field | Mô tả |
|-------|-------|
| `courseMasterId` | FK → CourseMaster |
| `title`, `description` | Thông tin chương |
| `status` | published / draft |
| `orderIndex` | Thứ tự trong khóa học |
| `durationMinutes` | Tổng thời lượng ước tính |
| `createdBy` | UUID → User |

**Quan hệ:** `lessons` → `Lesson[]`

---

### 3.3 Lesson

| Field | Mô tả |
|-------|-------|
| `moduleId` | FK → Module |
| `contentType` | video / article / quiz / assignment |
| `videoUrl`, `videoDuration` | Nội dung video |
| `articleContent` | Nội dung bài đọc |
| `hasQuiz`, `hasAssignment` | Flag |
| `requiresPassingGrade` | Yêu cầu đạt điểm để vượt qua |
| `status` | published / draft |
| `orderIndex` | Thứ tự trong module |
| `isPreview` | Có thể xem thử không? |
| `isUnlocked` | Đã mở khóa chưa? |
| `aiMetadata` | Metadata AI |

**Quan hệ:**
- `module` → Module
- `quizzes` → Quiz[]
- `materials` → LessonMaterial[]
- `lessonProgress` → LessonProgress[]
- `assignments` → Assignment[]
- `runLessons` → CourseRunLesson[]

---

### 3.4 CourseRunLesson

**Mục đích:** Override nội dung bài học cho từng CourseRun cụ thể (giảng viên của run này có thể upload video riêng, ghi chú riêng, v.v.)

| Field | Mô tả |
|-------|-------|
| `courseRunId` | FK → CourseRun |
| `lessonId` | FK → Lesson (template gốc) |
| `videoUrl` | Video override của run này |
| `recordingUrl` | URL recording buổi live |
| `isUnlocked` | Trạng thái mở khóa cho run này |

**Unique constraint:** `(courseRunId, lessonId)` — mỗi lesson chỉ có 1 override per run.

---

### 3.5 LessonProgress

Theo dõi tiến trình học từng bài học của một học viên.

| Field | Mô tả |
|-------|-------|
| `enrollmentId` | FK → Enrollment |
| `lessonId` | FK → Lesson |
| `courseRunId` | FK → CourseRun (denormalized) |
| `status` | not_started / in_progress / completed |
| `watchedDuration` | Thời gian đã xem (giây) |
| `totalDuration` | Tổng thời lượng |
| `lastWatchedAt` | Lần xem cuối |
| `completedAt` | Thời điểm hoàn thành |
| `notes` | Ghi chú cá nhân |

**Unique:** `(enrollmentId, lessonId)`

---

### 3.6 LessonMaterial

Junction table giữa Lesson và FileAsset.

| Field | Mô tả |
|-------|-------|
| `lessonId` | FK → Lesson |
| `fileAssetId` | FK → FileAsset |
| `type` | slides / video / reading / assignment |
| `usageType` | pre_class / post_class / recording |
| `title` | Tiêu đề tài liệu |
| `orderIndex` | Thứ tự hiển thị |

---

## 4. Domain: Live Session & Lịch dạy

### 4.1 Sơ đồ

```
CourseRun
    ├── TeachingSchedule (lịch cố định hàng tuần)
    │       └── LiveSession (các buổi học được tạo theo lịch)
    │       └── LiveSessionScheduleRequest (giảng viên xin đổi lịch)
    │
    └── LiveSession (có thể tạo độc lập hoặc theo schedule)
            └── Attendance (điểm danh học viên)
```

### 4.2 TeachingSchedule

Lịch dạy cố định theo tuần (ví dụ: mỗi Thứ 3 và Thứ 5, 19:00-20:30).

| Field | Mô tả |
|-------|-------|
| `courseRunId` | FK → CourseRun |
| `lecturerId` | FK → User |
| `dayOfWeek` | 0 (Chủ Nhật) → 6 (Thứ 7) |
| `startTime` | HH:mm |
| `duration` | Phút (default 90) |

---

### 4.3 LiveSession

Một buổi học live cụ thể.

| Field | Mô tả |
|-------|-------|
| `courseRunId` | FK → CourseRun |
| `lecturerId` | UUID (giảng viên) |
| `title`, `description` | Thông tin buổi học |
| `scheduledAt` | Thời điểm dự kiến |
| `duration` | Thời lượng (phút) |
| `status` | scheduled / live / ended / cancelled |
| `meetingId` | ID phòng LiveKit |
| `scheduleId` | FK → TeachingSchedule (nullable) |
| `moduleId`, `lessonId` | Liên kết curriculum |
| `recordingUrl` | URL recording sau buổi học |
| `originalStartTime` | Thời gian gốc nếu đã reschedule |
| `rescheduleReason` | Lý do đổi lịch |

---

### 4.4 Attendance

Điểm danh học viên trong buổi live.

| Field | Mô tả |
|-------|-------|
| `liveSessionId` | FK → LiveSession |
| `userId` | FK → User |
| `status` | present / absent / late / excused |
| `joinTime`, `leaveTime` | Thời điểm vào/ra |
| `duration` | Thời gian có mặt (giây) |

**Unique:** `(liveSessionId, userId)`

---

### 4.5 LiveSessionScheduleRequest

Giảng viên xin thay đổi lịch của một buổi.

| Field | Mô tả |
|-------|-------|
| `lecturerId` | FK → User |
| `originalScheduleId` | FK → TeachingSchedule |
| `courseRunId` | FK → CourseRun |
| `dayOfWeek`, `startTime`, `duration` | Lịch mới đề xuất |
| `reason` | Lý do |
| `status` | pending / approved / rejected |

---

## 5. Domain: Đánh giá & Bài tập

### 5.1 Assignment (Bài tập)

| Field | Mô tả |
|-------|-------|
| `courseRunId` | FK → CourseRun |
| `lessonId` | FK → Lesson (nullable) |
| `title`, `description` | Thông tin bài tập |
| `type` | TEXT / FILE / BOTH |
| `maxScore` | Điểm tối đa (default 100) |
| `passingScore` | Điểm đạt |
| `dueDate` | Hạn nộp |
| `allowLateSubmission` | Cho phép nộp muộn? |
| `latePenaltyPercent` | Trừ điểm khi nộp muộn (%) |
| `allowedFileTypes` | Loại file cho phép |
| `maxFileSize` | Kích thước file tối đa (bytes) |
| `maxFiles` | Số file tối đa |
| `status` | DRAFT / PUBLISHED / CLOSED |
| `createdBy` | UUID → User |

---

### 5.2 Submission (Bài nộp)

| Field | Mô tả |
|-------|-------|
| `assignmentId` | FK → Assignment |
| `userId` | UUID → học viên |
| `courseRunId` | FK → CourseRun |
| `textAnswer` | Câu trả lời text |
| `fileUrls` | Danh sách URL file đính kèm |
| `status` | DRAFT / SUBMITTED / GRADED / RETURNED |
| `submittedAt` | Thời điểm nộp |
| `isLate`, `daysLate` | Thông tin nộp muộn |
| `score`, `feedback` | Điểm và nhận xét |
| `gradedBy`, `gradedAt` | Người chấm và thời điểm |
| `attemptNumber` | Lần nộp thứ mấy |

**Unique:** `(assignmentId, userId, attemptNumber)`

---

### 5.3 GradeHistory (Audit Trail điểm)

Lưu lịch sử mọi thay đổi điểm — phục vụ audit và tranh chấp.

| Field | Mô tả |
|-------|-------|
| `submissionId` | FK → Submission |
| `oldScore`, `newScore` | Điểm trước/sau |
| `oldFeedback`, `newFeedback` | Feedback trước/sau |
| `changedBy` | UUID → User (người thay đổi) |
| `reason` | Lý do thay đổi |

---

## 6. Domain: Người dùng (User)

### 6.1 User

Entity trung tâm, liên kết với hầu hết mọi domain.

| Field | Mô tả |
|-------|-------|
| `id` | UUID |
| `email` | UNIQUE |
| `displayName` | Tên hiển thị |
| `password` | Nullable (dành cho OAuth-only user) |
| `avatarUrl` | Ảnh đại diện |
| `appMetadata` | JSON — dữ liệu ứng dụng (providers, permissions...) |
| `userMetadata` | JSON — dữ liệu profile từ OAuth |
| `role` | `learner` / `lecturer` / `admin` / ... |
| `verifiedAt` | null = chưa verify email |
| `bannedUntil` | null = không bị ban |
| `lastSignInAt` | Lần đăng nhập cuối |
| `deletedAt` | Soft delete |

**Tổng số quan hệ trực tiếp của User:**

| Quan hệ | Mô tả |
|---------|-------|
| `identities` | OAuth providers (UserIdentity) |
| `sessions` | Phiên đăng nhập (Session) |
| `twoFactorAuth` | 2FA config |
| `enrollments` | Khóa học đã đăng ký |
| `giftEnrollments` | Khóa học đã tặng người khác |
| `orders` | Đơn hàng |
| `payments` | Thanh toán |
| `certificates` | Chứng chỉ |
| `reviews` | Đánh giá khóa học |
| `wishlists` | Danh sách yêu thích |
| `balance` | Số dư tài khoản |
| `runsTaught` | CourseRun đang dạy (giảng viên) |
| `gamification` | Hồ sơ gamification |
| `dailyActivities` | Hoạt động hàng ngày |
| `achievements` | Thành tích |
| `createdCoupons` | Coupon đã tạo |
| `redeemedCoupons` | Coupon đã sử dụng |
| `teachingSchedules` | Lịch dạy |
| `scheduleRequests` | Yêu cầu đổi lịch |
| `discussions` | Chủ đề thảo luận |
| `commentLikes` | Like bình luận |
| `attendances` | Điểm danh |
| `tickets` | Ticket hỗ trợ (user gửi) |
| `handledTickets` | Ticket đã xử lý (admin/staff) |
| `balanceTransactions` | Lịch sử giao dịch số dư |
| `gamificationHistories` | Lịch sử điểm gamification |
| `notebooks` | Sổ tay từ vựng |
| `cart` | Giỏ hàng |
| `blogs` | Bài viết blog |
| `placementResults` | Kết quả test xếp lớp |
| `flashcardDecks` | Bộ thẻ flashcard |
| `auditLogs` | Nhật ký hành động |

---

## 7. Domain: Xác thực & Phiên đăng nhập

### 7.1 UserIdentity

Liên kết provider OAuth với User.

| Field | Mô tả |
|-------|-------|
| `userId` | FK → User |
| `provider` | email / google / facebook / ... |
| `providerId` | ID từ phía provider |
| `providerData` | JSON — raw data từ provider |

**Unique:** `(provider, providerId)` — không trùng tài khoản provider.

---

### 7.2 Session

Quản lý refresh token và phiên đăng nhập.

| Field | Mô tả |
|-------|-------|
| `userId` | FK → User |
| `tokenHash` | SHA-256 hash của refresh token |
| `deviceInfo` | Thông tin thiết bị |
| `expiresAt` | Hết hạn |
| `revokedAt` | Thời điểm thu hồi (null = còn hiệu lực) |

---

### 7.3 TwoFactorAuth

| Field | Mô tả |
|-------|-------|
| `userId` | UNIQUE FK → User (1-1) |
| `isEnabled` | Bật/tắt 2FA |
| `method` | Hiện tại chỉ hỗ trợ `totp` |
| `totpSecret` | Secret key (AES-256-GCM encrypted) |
| `totpBackupCodes` | Mã dự phòng (Argon2 hashed) |
| `failedAttempts` | Số lần nhập sai |
| `lockedUntil` | Khóa sau nhiều lần sai |

---

## 8. Domain: Thương mại (Commerce)

### 8.1 Luồng mua khóa học

```
User thêm vào Cart (CartItem)
    → Tạo Order (pending)
        → Áp dụng Coupon (giảm giá)
            → Thanh toán qua Payment Gateway
                → Payment webhook nhận (Payment record)
                    → Order cập nhật (completed)
                        → Enrollment được tạo (ACTIVE)
                            → Certificate sau khi hoàn thành
```

### 8.2 Cart & CartItem

```
User (1) ──── (1) Cart ──── (N) CartItem ──── (N-1) CourseRun
```

- Mỗi user có **1 Cart** duy nhất.
- Cart có nhiều CartItem, mỗi CartItem là 1 CourseRun.
- **Unique:** `(cartId, courseRunId)` — không thêm 2 lần cùng 1 khóa.

---

### 8.3 Order

Entity business — đại diện cho **ý định mua hàng** (Invoice).

| Field | Mô tả |
|-------|-------|
| `userId` | FK → User |
| `amount` | Tổng tiền |
| `currency` | VND (default) |
| `paymentMethod` | credit_card / bank_transfer / momo / zalopay / vnpay / sepay |
| `paymentGateway` | stripe / paypal / vnpay / momo / sepay |
| `transactionId` | Internal unique ID |
| `gatewayTransactionId` | ID từ cổng thanh toán |
| `status` | pending → processing → completed / failed / refunded / cancelled |
| `orderType` | course_purchase / subscription / top_up / gift / refund |
| `couponId` | FK → Coupon (nullable) |
| `metadata` | JSON — chi tiết bổ sung |

**Quan hệ:**
- `user` → User
- `enrollment` → Enrollment (1-1, nullable, từ phía Enrollment)
- `payments` → Payment[] (1-N)
- `coupon` → Coupon (N-1, nullable)

---

### 8.4 Payment

Entity kỹ thuật — đại diện cho **giao dịch tiền thực tế** (Receipt).

| Field | Mô tả |
|-------|-------|
| `orderId` | FK → Order (nullable) |
| `transactionId` | ID giao dịch từ SePay |
| `gateway` | Cổng thanh toán |
| `amount` | Số tiền |
| `status` | success / fail |
| `rawResponse` | JSON — raw webhook data |

---

### 8.5 Enrollment

Đăng ký học của học viên.

| Field | Mô tả |
|-------|-------|
| `userId` | FK → User |
| `courseRunId` | FK → CourseRun |
| `versionId` | FK → CourseVersion (snapshot lúc enroll) |
| `orderId` | FK → Order (1-1 unique) |
| `completionStatus` | pending_payment / in_progress / completed / dropped |
| `completionPercentage` | Phần trăm hoàn thành |
| `finalPrice` | Giá thực tế đã thanh toán |
| `isGift` | Có phải quà tặng? |
| `giftMessage` | Lời nhắn khi tặng |
| `senderId` | FK → User (người tặng, nullable) |
| `expiresAt` | Hết hạn khóa học (nullable) |
| `trialExpiresAt` | Hết hạn học thử |
| `enrollmentStatus` | ACTIVE / SUSPENDED / REFUNDED / CANCELLED / COMPLETED |

**Unique:** `(userId, courseRunId)` — mỗi user chỉ enroll 1 lần / 1 run.

---

### 8.6 Coupon

| Field | Mô tả |
|-------|-------|
| `code` | UNIQUE — mã dùng khi checkout |
| `discountType` | percentage / fixed_amount |
| `discountValue` | Giá trị giảm |
| `maxDiscountAmount` | Giảm tối đa (cho % discount) |
| `minOrderAmount` | Đơn hàng tối thiểu |
| `applicableCourseMasterIds` | Áp dụng cho course masters nào |
| `applicableRunIds` | Áp dụng cho run nào |
| `validFrom`, `validUntil` | Hiệu lực |
| `usageLimit` | Số lần dùng tối đa |
| `userUsageLimit` | Giới hạn mỗi user (default 1) |
| `createdBy` | FK → User (admin tạo) |
| `userId` | FK → User (coupon dùng riêng cho 1 user) |

---

### 8.7 Ticket

Yêu cầu hỗ trợ / hoàn tiền.

| Field | Mô tả |
|-------|-------|
| `userId` | FK → User (người gửi) |
| `handlerId` | FK → User (admin/staff xử lý) |
| `type` | REFUND / SUPPORT / ERROR_REPORT |
| `status` | PENDING → PROCESSING → RESOLVED / CANCELLED |
| `courseRunId` | FK → CourseRun (context) |
| `metadata` | JSON — chứa `originalOrderId` nếu là REFUND |

---

### 8.8 Certificate

Chứng chỉ sau khi hoàn thành khóa học.

| Field | Mô tả |
|-------|-------|
| `userId` | FK → User |
| `courseRunId` | FK → CourseRun |
| `enrollmentId` | UNIQUE FK → Enrollment (1-1) |
| `certificateCode` | UNIQUE — mã chứng chỉ |
| `fileUrl` | URL file PDF |
| `metadata` | JSON |

---

### 8.9 UserBalance & BalanceTransaction

```
UserBalance (1-1 với User) ────── BalanceTransaction (N)
```

**UserBalance:**
- `balance`: Số dư hiện tại (Int — đơn vị xu/coin)
- `aiRoleplayTrialLimit`: Số lượt thử AI roleplay miễn phí
- `liveMeetingTrialLimit`: Số lượt thử live meeting miễn phí

**BalanceTransaction** — lịch sử biến động:
- `type`: TOP_UP / REFUND / PURCHASE / REWARD / BONUS / OTHER
- `amount`: Số tiền biến động
- `description`, `metadata`: Chi tiết giao dịch

---

## 9. Domain: Flashcard & SRS

### 9.1 Sơ đồ Anki-like SRS

```
User
 └── FlashcardDeck (nhiều bộ thẻ)
         └── Flashcard (nhiều thẻ)
                 ├── FlashcardUserProgress (SRS state per-user)
                 └── FlashcardReview (lịch sử mỗi lượt ôn)
                         └── FlashcardReviewSession (gom nhóm theo phiên)
```

### 9.2 FlashcardDeck

| Field | Mô tả |
|-------|-------|
| `userId` | FK → User |
| `name`, `description` | Thông tin bộ thẻ |
| `jlptLevel` | N5 → N1 |
| `isPublic` | Dùng chung hay riêng tư |
| `srsSettings` | JSON — cài đặt SRS (newCardsPerDay, maxReviewsPerDay...) |
| `aiSettings` | JSON — cài đặt AI tự sinh thẻ |
| `sourceType` | manual / ai / import |
| `masteryPercentage` | % thành thạo |

---

### 9.3 Flashcard

| Field | Mô tả |
|-------|-------|
| `deckId` | FK → FlashcardDeck |
| `frontText`, `backText` | Nội dung mặt trước/sau |
| `exampleSentence` | Câu ví dụ |
| `pronunciation` | Phiên âm |
| `furigana`, `kanji` | Chữ Nhật đặc thù |
| `partOfSpeech` | noun / verb_ichidan / adjective_i... |
| `wordJlptLevel` | Level từ vựng |
| `meanings` | JSON — nhiều nghĩa có ví dụ |
| `aiGenerated` | Có phải AI tự tạo? |
| `sourceDocumentId` | FK → FileAsset (tài liệu nguồn) |
| `generationMethod` | manual / ai_auto / ai_assisted / import |
| `nextReviewDate`, `intervalDays`, `easeFactor` | SRS global state |

---

### 9.4 FlashcardUserProgress

**Per-user SRS state** — quan trọng nhất trong hệ thống SRS.

| Field | Mô tả |
|-------|-------|
| `userId` | FK → User |
| `flashcardId` | FK → Flashcard |
| `state` | new / learning / review / relearning |
| `currentInterval` | Số ngày đến lần ôn tiếp |
| `easeFactor` | Hệ số độ khó (Anki algo) |
| `nextReviewDate` | Ngày ôn tiếp theo |
| `timesReviewed` | Tổng số lần ôn |
| `consecutiveCorrect` | Số lần đúng liên tiếp |

**Unique:** `(userId, flashcardId)`

---

### 9.5 FlashcardReview (Lịch sử mỗi lượt ôn)

| Field | Mô tả |
|-------|-------|
| `userId`, `flashcardId`, `deckId` | FK |
| `sessionId` | FK → FlashcardReviewSession |
| `quality` | ZERO(Again) / ONE(Hard) / TWO(Good) / THREE(Easy) / FOUR(Easy+) |
| `timeSpent` | Milliseconds |
| `previousInterval`, `previousEaseFactor`, `previousState` | Trước khi ôn |
| `newInterval`, `newEaseFactor`, `newState` | Sau khi ôn |
| `newNextReviewDate` | Ngày ôn tiếp mới |

---

### 9.6 FlashcardReviewSession

Gom nhóm nhiều FlashcardReview thành 1 phiên học.

| Field | Mô tả |
|-------|-------|
| `userId`, `deckId` | FK |
| `startedAt`, `completedAt` | Thời gian |
| `totalCards` | Tổng thẻ đã ôn |
| `newCards`, `learningCards`, `reviewCards` | Phân loại |
| `correctCount`, `incorrectCount`, `hardCount`, `easyCount` | Kết quả |
| `masteryScore` | Điểm thành thạo phiên này |

---

## 10. Domain: Bài kiểm tra (Quiz)

### 10.1 Sơ đồ

```
QuestionPool ──── Question
                     │
                QuizQuestion ──── Quiz ──── CourseRun / Lesson
                                    │
                               QuizAttempt ──── User
                                    │
                           QuizAttemptDetail (chi tiết từng câu)
                                    │
                           PlacementResult (nếu là bài xếp lớp)
```

### 10.2 QuestionPool

Ngân hàng câu hỏi được phân nhóm.

| Field | Mô tả |
|-------|-------|
| `courseMasterId`, `lessonId` | Context (nullable) |
| `jlptLevel` | N5 → N1 |
| `usageType` | PLACEMENT / COURSE_ASSESS / JLPT_MOCK / PRACTICE |

---

### 10.3 Question

| Field | Mô tả |
|-------|-------|
| `poolId` | FK → QuestionPool (nullable) |
| `questionText` | Nội dung câu hỏi |
| `questionType` | multiple_choice / true_false / fill_blank / ... |
| `jlptLevel` | Level câu hỏi |
| `category` | vocab / grammar / reading / listening |
| `difficulty` | easy / medium / hard |
| `options` | JSONB — { "A": "text", "B": "text", ... } |
| `correctAnswer` | Đáp án đúng |
| `explanation` | Giải thích |
| `metadata` | JSONB — audio, images, reading passages |
| `usageCount` | Đếm số lần dùng |

---

### 10.4 Quiz

| Field | Mô tả |
|-------|-------|
| `quizType` | lesson / module / course / practice / jlpt_mock |
| `courseRunId`, `lessonId` | Context |
| `sections` | JSONB — cấu trúc các phần thi |
| `totalTime` | Tổng thời gian (phút) |
| `passingScore` | % điểm đạt |
| `maxAttempts` | Số lần làm tối đa |
| `shuffleQuestions` | Xáo trộn câu hỏi? |
| `showExplanation` | Hiện giải thích sau khi nộp? |

---

### 10.5 QuizAttempt

Một lượt làm bài của user.

| Field | Mô tả |
|-------|-------|
| `quizId`, `userId`, `courseRunId` | FK |
| `status` | in-progress / completed / submitted / abandoned |
| `score`, `maxScore`, `percentage` | Điểm số |
| `isPassed` | Đạt/Không đạt |
| `timeTakenSeconds` | Thời gian làm |
| `answers` | JSONB — `{ questionId: "answer", ... }` |
| `flaggedQuestions` | Các câu đã gắn cờ |
| `currentSection`, `currentQuestion` | Resume state |

---

### 10.6 PlacementResult

Kết quả bài test xếp lớp.

| Field | Mô tả |
|-------|-------|
| `userId`, `quizId`, `attemptId` | FK (attemptId là UNIQUE) |
| `overallScore` | Tổng điểm |
| `vocabScore`, `grammarScore`, `readingScore`, `listeningScore` | Điểm theo kỹ năng |
| `recommendedLevel` | Level được đề xuất (N5-N1) |
| `recommendedCourseRunId` | CourseRun được gợi ý |

---

## 11. Domain: Gamification

### 11.1 Sơ đồ

```
User (1) ──── (1) UserGamification (XP, Level, Streak, Points)
     │
     ├── DailyActivity (log hàng ngày)
     ├── GamificationHistory (lịch sử +/- điểm)
     ├── UserAchievement (thành tích đã mở khóa)
     │       └── Achievement (định nghĩa thành tích)
     └── UserBalance (số dư coin)
             └── BalanceTransaction (lịch sử giao dịch)
```

### 11.2 UserGamification

| Field | Mô tả |
|-------|-------|
| `level`, `currentXp`, `totalXp` | Hệ thống XP và Level |
| `points` | Điểm đổi quà (economy) |
| `gems` | Đơn vị cao cấp |
| `currentStreak`, `longestStreak` | Chuỗi ngày học liên tiếp |
| `lastActiveDate` | YYYY-MM-DD |
| `freezeCount` | Số "bùa" bảo vệ streak |
| `totalActiveDays` | Tổng ngày đã học |

**Index quan trọng:** `totalXp DESC` — dùng cho Leaderboard.

---

### 11.3 DailyActivity

| Field | Mô tả |
|-------|-------|
| `userId` | FK → User |
| `date` | YYYY-MM-DD |
| `activityType` | LESSON_COMPLETE / QUIZ_ANSWER / VIDEO_WATCH / REVIEW / FLASHCARD_REVIEW / LOGIN / ... |

**Unique:** `(userId, date, activityType)` — log 1 lần/ngày/loại hoạt động.

---

### 11.4 Achievement

Định nghĩa thành tích (seed data).

| Field | Mô tả |
|-------|-------|
| `code` | UNIQUE — STREAK_7, STREAK_30, FIRST_LESSON... |
| `category` | STREAK / CONSISTENCY / LEARNING_PROGRESS / RECOVERY / SOCIAL / MASTERY |
| `title`, `description`, `icon` | Hiển thị |
| `requirements` | JSON — điều kiện mở khóa |
| `rewards` | JSON — `{"freezeCount": 1, "xp": 100}` |

---

### 11.5 PointReward (Đổi điểm lấy coupon)

| Field | Mô tả |
|-------|-------|
| `points` | Số điểm cần đổi |
| `discountType` | percentage / fixed_amount |
| `discountValue` | Giá trị giảm |
| `validDuration` | Hiệu lực sau khi đổi (ngày) |

---

## 12. Domain: Cộng đồng (Community)

### 12.1 Blog

| Field | Mô tả |
|-------|-------|
| `authorId` | FK → User |
| `title`, `slug`, `content` | Nội dung |
| `status` | draft / published / archived |
| `tags` | Tags phân loại |
| `seoTitle`, `seoDescription` | SEO metadata |
| `viewCount`, `commentCount` | Counters |

---

### 12.2 Comment (Polymorphic, Nested)

```
Comment có thể đính vào:
  - Blog (via CommentTarget)
  - DiscussionTopic (via CommentTarget)
  - Lesson (via CommentTarget)

Comment có thể có reply (self-referential):
  - Comment (parent) ──── Comment[] (replies)
```

| Field | Mô tả |
|-------|-------|
| `userId` | FK → User |
| `parentCommentId` | FK → Comment (nullable — nested replies) |
| `content` | Nội dung |
| `status` | pending / approved / spam / deleted |

**CommentTarget** — Polymorphic junction:
- `commentId` → Comment
- `targetType`: BLOG / DISCUSSION / LESSON
- `targetId`: UUID của target tương ứng

---

### 12.3 DiscussionTopic

Q&A trong khóa học.

| Field | Mô tả |
|-------|-------|
| `authorId` | FK → User |
| `courseRunId` | FK → CourseRun (bắt buộc) |
| `moduleId`, `lessonId` | Context (nullable) |
| `category` | GENERAL / QUESTION / ANNOUNCEMENT |
| `status` | OPEN / ANSWERED / RESOLVED / CLOSED |
| `isPinned`, `isLocked` | Trạng thái pin/khóa |

---

### 12.4 CommentLike

| Field | Mô tả |
|-------|-------|
| `commentId`, `userId` | Composite PK |

---

### 12.5 Notification

| Field | Mô tả |
|-------|-------|
| `userId` | FK → User |
| `title`, `message` | Nội dung |
| `notificationType` | Loại thông báo |
| `metadata` | JSON — data bổ sung |
| `isRead`, `readAt` | Trạng thái đọc |
| `sentVia` | email / push / in_app... |

---

### 12.6 Notebook & NoteEntry (Sổ tay từ vựng)

```
User (1) ──── Notebook (N) ──── NoteEntry (N)
```

**Notebook:**
- Tên, mô tả, isPublic
- Unique: `(userId, name)`

**NoteEntry:**
- `word`: Từ vựng
- `phonetic`: Phiên âm
- `meaning`: Nghĩa
- `partOfSpeech`: Loại từ

---

## 13. Domain: File & Media

### 13.1 FileAsset

Source of truth cho mọi file trong hệ thống.

| Field | Mô tả |
|-------|-------|
| `fileUrl` | UNIQUE — URL truy cập file |
| `mimeType` | MIME type |
| `fileSize` | BigInt — bytes |
| `isPublic` | Công khai hay riêng tư |
| `status` | pending / uploaded / failed |
| `ownerId` | UUID → user/entity sở hữu |
| `moduleOrigin` | USER / COURSE / CHAT |
| `metadata` | JSON — thông tin bổ sung |

**Quan hệ:**
- `lessonMaterials` → LessonMaterial[]
- `flashcardSourceDocs` → Flashcard[] (tài liệu nguồn sinh flashcard)

---

## 14. Domain: Phòng học trực tuyến (Room)

### 14.1 RoomInfo

Thông tin phòng LiveKit/WebRTC.

| Field | Mô tả |
|-------|-------|
| `roomId`, `sid` | Định danh phòng |
| `roomTitle` | Tên phòng |
| `joinedParticipants` | Số người đang tham gia |
| `isRunning`, `isRecording` | Trạng thái |
| `isBreakoutRoom`, `parentRoomId` | Phòng nhóm nhỏ |
| `creationTime`, `created`, `ended` | Thời gian |

**Quan hệ:** `artifacts` → RoomArtifact[]

---

### 14.2 RoomFile

File được chia sẻ trong phòng.

| Field | Mô tả |
|-------|-------|
| `fileId` | UNIQUE |
| `roomId`, `userId` | Context |
| `filePath`, `fileType`, `mimeType`, `fileSize` | Thông tin file |

---

### 14.3 RoomArtifact

Artifacts từ phòng (recording, whiteboard snapshot, v.v.)

| Field | Mô tả |
|-------|-------|
| `artifactId` | UNIQUE |
| `roomTableId` | FK → RoomInfo |
| `type` | Loại artifact |
| `metadata` | JSON |

---

## 15. Domain: Hệ thống (System)

### 15.1 RolePermission (RBAC)

Composite PK: `(roleCode, permissionCode)`.  
Quản lý phân quyền dạng table — có thể chỉnh sửa qua Admin UI mà không cần deploy lại code.

| Field | Mô tả |
|-------|-------|
| `roleCode` | Mã vai trò (admin, staff, lecturer, learner...) |
| `permissionCode` | Mã quyền (course.create, user.ban...) |

---

### 15.2 AuditLog

Ghi log mọi hành động quan trọng trong hệ thống.

| Field | Mô tả |
|-------|-------|
| `userId` | FK → User (ai thực hiện) |
| `action` | Hành động (permission.grant, user.create...) |
| `entity` | Loại entity bị tác động |
| `entityId` | ID entity |
| `description` | Mô tả dạng đọc được |
| `metadata` | JSON — dữ liệu chi tiết |
| `oldValues`, `newValues` | State trước/sau thay đổi |

---

## 16. Sơ đồ quan hệ tổng thể

```
                    ┌─────────────────────────────┐
                    │           USER               │
                    │  (Trung tâm của toàn hệ thống)│
                    └──────────────┬──────────────┘
                                   │
          ┌──────────┬─────────────┼────────────┬──────────────┐
          │          │             │            │              │
    UserIdentity  Session    TwoFactorAuth  UserBalance  UserGamification
    (OAuth)      (Token)     (2FA)          (Coin)       (XP/Streak)
                                   │
          ┌──────────┬─────────────┼────────────┬──────────────┐
          │          │             │            │              │
     Enrollment   Order        FlashcardDeck  Blog          Notebook
          │          │             │            │              │
          │       Payment      Flashcard     Comment        NoteEntry
          │          │             │
    LessonProgress  Coupon    FlashcardUserProgress
          │                        │
    Certificate              FlashcardReview
                                   │
                           FlashcardReviewSession

COURSE DOMAIN:
CourseMaster ─── CourseVersion ─── CourseRun ─── Enrollment ─── User
     │                                  │
   Module                        ┌──────┴───────────────────────┐
     │                           │              │               │
   Lesson                  LiveSession     Assignment       DiscussionTopic
     │                           │              │
LessonMaterial            Attendance       Submission
(FileAsset)                                    │
                                         GradeHistory

QUIZ DOMAIN:
QuestionPool ─── Question ─── QuizQuestion ─── Quiz ─── CourseRun
                                                  │
                                            QuizAttempt ─── User
                                                  │
                                        QuizAttemptDetail
                                                  │
                                         PlacementResult

ROOM DOMAIN:
RoomInfo ─── RoomArtifact
RoomFile

SYSTEM:
AuditLog ─── User
RolePermission
Notification ─── User
```

---

## 17. Bảng tổng hợp tất cả Entities

| # | Entity (Table) | Domain | Mô tả |
|---|----------------|--------|-------|
| 1 | `CourseMaster` (course_masters) | Course | Template/blueprint khóa học |
| 2 | `CourseVersion` (course_versions) | Course | Snapshot phiên bản curriculum |
| 3 | `CourseRun` (course_runs) | Course | Lần chạy thực tế của khóa học |
| 4 | `CourseMasterReview` (course_master_reviews) | Course | Review duyệt CourseMaster |
| 5 | `CourseRunReview` (course_run_reviews) | Course | Review duyệt CourseRun |
| 6 | `Module` (modules) | Content | Chương/phần của CourseMaster |
| 7 | `Lesson` (lessons) | Content | Bài học trong Module |
| 8 | `CourseRunLesson` (course_run_lessons) | Content | Override bài học per CourseRun |
| 9 | `LessonProgress` (lesson_progress) | Content | Tiến trình học từng bài |
| 10 | `LessonMaterial` (lesson_materials) | Content | Tài liệu đính kèm bài học |
| 11 | `Assignment` (assignments) | Assessment | Bài tập do giảng viên tạo |
| 12 | `Submission` (submissions) | Assessment | Bài nộp của học viên |
| 13 | `GradeHistory` (grade_histories) | Assessment | Audit trail điểm |
| 14 | `LiveSession` (live_sessions) | Live | Buổi học live |
| 15 | `Attendance` (attendances) | Live | Điểm danh buổi live |
| 16 | `TeachingSchedule` (teaching_schedules) | Live | Lịch dạy cố định hàng tuần |
| 17 | `LiveSessionScheduleRequest` (live_session_schedule_requests) | Live | Yêu cầu đổi lịch |
| 18 | `User` (users) | User | Người dùng hệ thống |
| 19 | `UserIdentity` (user_identities) | Auth | OAuth provider links |
| 20 | `Session` (sessions) | Auth | Phiên đăng nhập / refresh token |
| 21 | `TwoFactorAuth` (two_factor_auth) | Auth | Cấu hình 2FA |
| 22 | `Enrollment` (enrollments) | Commerce | Đăng ký học |
| 23 | `Order` (orders) | Commerce | Đơn hàng |
| 24 | `Payment` (payments) | Commerce | Giao dịch thanh toán |
| 25 | `Cart` (carts) | Commerce | Giỏ hàng |
| 26 | `CartItem` (cart_items) | Commerce | Item trong giỏ hàng |
| 27 | `Coupon` (coupons) | Commerce | Mã giảm giá |
| 28 | `Ticket` (tickets) | Commerce | Yêu cầu hỗ trợ/hoàn tiền |
| 29 | `Certificate` (certificates) | Commerce | Chứng chỉ hoàn thành |
| 30 | `UserBalance` (user_balances) | Commerce | Số dư tài khoản |
| 31 | `BalanceTransaction` (balance_transactions) | Commerce | Lịch sử giao dịch số dư |
| 32 | `FlashcardDeck` (flashcard_decks) | Flashcard | Bộ thẻ flashcard |
| 33 | `Flashcard` (flashcards) | Flashcard | Thẻ flashcard |
| 34 | `FlashcardUserProgress` (flashcard_user_progress) | Flashcard | SRS state per-user |
| 35 | `FlashcardReview` (flashcard_reviews) | Flashcard | Lịch sử mỗi lượt ôn tập |
| 36 | `FlashcardReviewSession` (flashcard_review_sessions) | Flashcard | Phiên ôn tập |
| 37 | `QuestionPool` (question_pools) | Quiz | Ngân hàng câu hỏi |
| 38 | `Question` (questions) | Quiz | Câu hỏi |
| 39 | `Quiz` (quizzes) | Quiz | Bài kiểm tra |
| 40 | `QuizQuestion` (quiz_questions) | Quiz | Junction Quiz ↔ Question |
| 41 | `QuizAttempt` (quiz_attempts) | Quiz | Lượt làm bài |
| 42 | `QuizAttemptDetail` (quiz_attempt_details) | Quiz | Chi tiết từng câu trong lượt làm |
| 43 | `PlacementResult` (placement_results) | Quiz | Kết quả bài xếp lớp |
| 44 | `UserGamification` (user_gamification) | Gamification | Hồ sơ XP/Streak/Points |
| 45 | `DailyActivity` (daily_activities) | Gamification | Log hoạt động hàng ngày |
| 46 | `Achievement` (achievements) | Gamification | Định nghĩa thành tích |
| 47 | `UserAchievement` (user_achievements) | Gamification | Thành tích đã mở khóa |
| 48 | `GamificationHistory` (gamification_histories) | Gamification | Lịch sử +/- điểm gamification |
| 49 | `PointReward` (point_rewards) | Gamification | Phần thưởng đổi điểm |
| 50 | `Blog` (blogs) | Community | Bài viết blog |
| 51 | `Comment` (comments) | Community | Bình luận (nested) |
| 52 | `CommentTarget` (comment_targets) | Community | Polymorphic target cho Comment |
| 53 | `CommentLike` (comment_likes) | Community | Like bình luận |
| 54 | `DiscussionTopic` (discussion_topics) | Community | Chủ đề Q&A trong khóa học |
| 55 | `Notification` (notifications) | Community | Thông báo |
| 56 | `Notebook` (notebooks) | Community | Sổ tay từ vựng |
| 57 | `NoteEntry` (note_entries) | Community | Entry trong sổ tay |
| 58 | `FileAsset` (file_assets) | File | Tài nguyên file trung tâm |
| 59 | `RoomInfo` (room_info) | Room | Thông tin phòng LiveKit |
| 60 | `RoomFile` (room_files) | Room | File trong phòng |
| 61 | `RoomArtifact` (room_artifacts) | Room | Artifacts từ phòng |
| 62 | `RolePermission` (role_permissions) | System | RBAC phân quyền |
| 63 | `AuditLog` (audit_logs) | System | Nhật ký hành động hệ thống |
| 64 | `Wishlist` (wishlist) | UX | Danh sách yêu thích |
| 65 | `Review` (reviews) | UX | Đánh giá khóa học |

---

## 18. Bảng tổng hợp tất cả Enums

| Enum | Values | Entity sử dụng |
|------|--------|---------------|
| `CourseMasterStatus` | DRAFT, PENDING_REVIEW, CHANGES_REQUIRED, APPROVED, ARCHIVED | CourseMaster |
| `CourseRunStatus` | DRAFT, PENDING_REVIEW, CHANGES_REQUIRED, APPROVED, PLANNING, ENROLLING, IN_PROGRESS, POSTPONED, COMPLETED, CANCELLED_BY_SYSTEM, CANCELLED, ARCHIVED | CourseRun |
| `EnrollmentStatus` | ACTIVE, SUSPENDED, REFUNDED, CANCELLED, COMPLETED | Enrollment |
| `LiveSessionStatus` | SCHEDULED, LIVE, ENDED, RESCHEDULED, CANCELLED | (string field trên LiveSession) |
| `MasterReviewStatus` | PENDING, APPROVED, REJECTED, CHANGES_REQUIRED | CourseMasterReview |
| `RunReviewStatus` | PENDING, APPROVED, REJECTED, CHANGES_REQUIRED | CourseRunReview |
| `AssignmentType` | TEXT, FILE, BOTH | Assignment |
| `AssignmentStatus` | DRAFT, PUBLISHED, CLOSED | Assignment |
| `SubmissionStatus` | DRAFT, SUBMITTED, GRADED, RETURNED | Submission |
| `FlashcardState` | new, learning, review, relearning | FlashcardUserProgress |
| `FlashcardGenerationMethod` | manual, ai_auto, ai_assisted, import | Flashcard |
| `JapanesePartOfSpeech` | noun, verb_ichidan, verb_godan, verb_suru, verb_kuru, adjective_i, adjective_na, adverb, particle, conjunction, interjection, pronoun, number, other | Flashcard |
| `ReviewQuality` | ZERO, ONE, TWO, THREE, FOUR | FlashcardReview |
| `CommentTargetType` | BLOG, DISCUSSION, LESSON | CommentTarget |
| `DiscussionTopicStatus` | OPEN, ANSWERED, RESOLVED, CLOSED | DiscussionTopic |
| `DiscussionTopicCategory` | GENERAL, QUESTION, ANNOUNCEMENT | DiscussionTopic |
| `ActivityType` | LESSON_COMPLETE, QUIZ_ANSWER, VIDEO_WATCH, REVIEW, PRACTICE, FLASHCARD_REVIEW, EXAM_COMPLETE, BLOG_CREATE, COMMENT_CREATE, LOGIN | DailyActivity, GamificationHistory |
| `AchievementCategory` | STREAK, CONSISTENCY, LEARNING_PROGRESS, RECOVERY, SOCIAL, MASTERY | Achievement |
| `BalanceTransactionType` | TOP_UP, REFUND, PURCHASE, REWARD, BONUS, OTHER | BalanceTransaction |
| `GamificationTransactionType` | EARN, REDEEM, BONUS, EXPIRATION, OTHER | GamificationHistory |
| `OrderStatus` | pending, processing, completed, failed, refunded, cancelled, timed_out | Order |
| `PaymentMethod` | credit_card, bank_transfer, momo, zalopay, vnpay, sepay, mock | Order |
| `PaymentGateway` | stripe, paypal, vnpay, momo, sepay, mock | Order |
| `OrderType` | course_purchase, subscription, top_up, gift, refund | Order |
| `CouponStatus` | active, inactive, expired | Coupon |
| `CouponDiscountType` | percentage, fixed_amount | Coupon, PointReward |
| `TicketType` | REFUND, SUPPORT, ERROR_REPORT | Ticket |
| `TicketStatus` | PENDING, PROCESSING, RESOLVED, CANCELLED | Ticket |

---

> **Tổng kết:** Schema gồm **65 entities**, **29 enums**, tổ chức thành **12 domain** chính. Entity `User` là trung tâm với hơn **30 quan hệ trực tiếp** tới các entity khác. Kiến trúc Master/Run cho phép tái sử dụng nội dung khóa học linh hoạt qua nhiều kỳ học.
