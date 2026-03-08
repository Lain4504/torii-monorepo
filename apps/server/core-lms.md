### 1. Layer CONTENT – Syllabus chuẩn, dùng chung

Đây là “chương trình học” không phụ thuộc live/VOD.

- **`CourseProfile`**  
  - Ý nghĩa: 1 “khóa học” trừu tượng (VD: “JLPT N5”, “IELTS 6.5+”, “Web Backend”).  
  - Field chính:
    - `id`
    - `code` (unique, ví dụ: `JP_N5`)
    - `title`, `shortTitle`
    - `description`
    - `subject` (japanese / english / programming / …)
    - `level` (N5, Beginner, Intermediate, …)
    - `defaultLanguage`

- **`CourseEdition`** (version chương trình)  
  - Field:
    - `id`
    - `courseProfileId` → `CourseProfile`
    - `editionTag` (v1, v2, 2026, …)
    - `isCurrent`
    - `status` (draft / pending_approval / published / archived)
    - `syllabusSnapshot` (JSON, optional)
    - `changelog`
  - Quan hệ:
    - 1 `CourseProfile` có nhiều `CourseEdition`.
    - Mọi **Class** (run) sẽ trỏ tới **1 `CourseEdition`**.

- **`Chapter`** (thay cho module)  
  - Field:
    - `id`
    - `courseEditionId` → `CourseEdition`
    - `title`
    - `description`
    - `orderIndex`
    - `estimatedMinutes`
    - `status` (draft / published)
  - Mỗi edition có nhiều chapter, sắp xếp bằng `orderIndex`.

- **`ChapterItem`** (giống module item, nhưng tên mới + rõ nghĩa)  
  - Field:
    - `id`
    - `chapterId` → `Chapter`
    - `title`
    - `kind` (`lesson | quiz_template | assignment_template | reading | project | ...`)
    - `referenceId` (id của `Lesson` / `QuizTemplate` / `AssignmentTemplate`…)
    - `orderIndex`
  - Đây chính là “index của list bài học trong 1 chapter”.

- **`Lesson`**  
  - Field:
    - `id`
    - `courseProfileId`
    - `title`
    - `contentType` (video / html / markdown / external_link / …)
    - `contentUrl` hoặc `contentBody`
    - `attachments` (JSON)
    - `metadata` (JSON: level, tags, …)

- **`QuizTemplate`** (template đề kiểm tra)  
  - Field:
    - `id`
    - `courseProfileId`
    - `title`
    - `description`
    - `questionPoolId` (nếu dùng bank chung)
    - `defaultTimeLimit`
    - `defaultMaxAttempts`
    - `defaultPassingScore`
    - `settings` (shuffle, showExplanation, …)

- **`AssignmentTemplate`**  
  - Field:
    - `id`
    - `courseProfileId`
    - `title`
    - `description`
    - `defaultType` (text / file / both)
    - `defaultMaxScore`
    - `defaultRubric` (JSON)
    - `defaultSubmissionSettings` (JSON)

> **Tóm tắt CONTENT:**  
> `CourseProfile` → nhiều `CourseEdition` → nhiều `Chapter` → nhiều `ChapterItem` → trỏ tới `Lesson` / `QuizTemplate` / `AssignmentTemplate`.

---

### 2. Layer DELIVERY – Lớp học, đợt khai giảng

Đây là nơi thể hiện “3 đợt live mỗi năm”, “1 VOD luôn mở”, v.v.

- **`Class`** (base – fields chung cho VOD và LIVE)  
  - Field:
    - `id`
    - `courseProfileId` → `CourseProfile`
    - `courseEditionId` → `CourseEdition` (edition dùng cho lớp này)
    - `code` (ví dụ: `JP_N5_LIVE_SPRING_2026`)
    - `name` (ví dụ: “N5 Live Spring 2026”)
    - `mode` (`VOD | LIVE`) – xác định có VodClass hay LiveClass
    - approval fields, `settings` (JSON)
    - `status` (draft / pending_approval / enrolling / in_progress / completed / cancelled)

- **`VodClass`** (extends Class, 1–1 khi mode = VOD)
  - Field: `id`, `classId` → `Class` (unique), `enrollmentOpenAt`, `enrollmentCloseAt`, `maxStudents`, `defaultExpiresMonths`
  - Rule: VOD dùng mãi; có thể đổi `Class.courseEditionId` sang edition mới.

- **`LiveClass`** (extends Class, 1–1 khi mode = LIVE)
  - Field: `id`, `classId` → `Class` (unique), `term`, `batch`, `startDate`, `endDate`, `enrollmentOpenAt`, `enrollmentCloseAt`, `minStudents`, `maxStudents`, `minStudentsEnforcement`, `primaryTeacherId`
  - Rule: Chỉ 1 giảng viên dạy chính và xuyên suốt (`primaryTeacherId`). `courseEditionId` không đổi sau ENROLLING; cần ít nhất 1 LiveSchedule.

- **`LiveSchedule`** (cho LiveClass, 1–n)
  - Field:
    - `id`
    - `liveClassId` → `LiveClass`
    - `weekday`, `startTime`, `endTime`, `location`
    - `excludedDates` (jsonb, ngày nghỉ lễ), `note`

- **`ClassAssessment`** (instance per class nếu cần override)  
  - Field:
    - `id`
    - `classId` → `Class`
    - `kind` (`quiz | assignment`)
    - `templateId` → `QuizTemplate` hoặc `AssignmentTemplate`
    - `titleOverride` (optional)
    - `deadline` (nếu có)
    - `weight` (tỷ trọng điểm)
    - `maxAttemptsOverride` / `timeLimitOverride` / `maxScoreOverride`…
    - `status` (draft / published / closed)

- **`Enrollment`**  
  - Field:
    - `id`
    - `classId` → `Class`
    - `userId`
    - `enrolledAt`
    - `expiresAt`
    - `status` (active / completed / cancelled / expired)
    - `sourceProductId` (link về product/bundle đã mua)

- **`LearningProgress`** (per learner per lesson)  
  - Field:
    - `id`
    - `classId` → `Class`
    - `userId`
    - `lessonId` → `Lesson`
    - `status` (not_started / in_progress / completed)
    - `lastAccessedAt`
    - `progressPercent`

- **`QuizAttempt` / `AssignmentSubmission`**  
  - Gần giống hiện tại, nhưng:
    - luôn có `classId`
    - và nếu dùng instance: có `classAssessmentId`.

> **Tóm tắt DELIVERY:**  
> `Class` (base) → `VodClass` (khi mode=VOD) hoặc `LiveClass` (khi mode=LIVE). `LiveClass` có `LiveSchedule`. Có `Enrollment`, `ClassAssessment`.

---

### 3. Layer COMMERCE – Gói sản phẩm để bán

Tách hẳn ra, không dính vào nội dung/delivery.

- **`CourseOffering`** (product/gói bán)  
  - Field:
    - `id`
    - `code` (ví dụ: `JP_N5_LIVE_SPRING_2026_BUNDLE`)
    - `title`
    - `description`
    - `price`
    - `currency`
    - `status` (draft / pending_approval / published / hidden)
    - `salesStartAt`, `salesEndAt`
    - `metadata` (JSON: marketing tags, banner, …)

- **`CourseOfferingClass`** (nhiều–nhiều giữa Offering và Class)  
  - Field:
    - `offeringId` → `CourseOffering`
    - `classId` → `Class`
  - Ví dụ:
    - Offering “N5 Live Spring + VOD”:
      - Link tới `Class`:
        - `JP_N5_LIVE_SPRING_2026`
        - `JP_N5_VOD_MAIN_2026`

- **`Order` / `OrderItem`**  
  - Khi học viên mua:
    - `OrderItem.offeringId`
    - Sau khi thanh toán ok → tạo `Enrollment` tương ứng cho **tất cả `Class` gắn với offering đó**.

> **Tóm tắt COMMERCE:**  
> `CourseOffering` (gói bán) → nhiều `Class` qua `CourseOfferingClass`.  
> Mua 1 offering = auto enroll vào 1 hoặc nhiều class.

---

### 4. Áp lại vào case tiếng Nhật (5 N + live 3 đợt/năm)

- **Content:**
  - 5 `CourseProfile`: `JP_N5` … `JP_N1`.
  - Mỗi cái có 1–x `CourseEdition`: `JP_N5_v1`, `JP_N5_v2`…
  - Trong `JP_N5_v1`:
    - nhiều `Chapter`, mỗi `Chapter` nhiều `ChapterItem` → lesson/quiz/assignment template.

- **Delivery:**
  - `Class`:
    - `JP_N5_VOD_MAIN_2026` (mode = VOD, start bất kỳ).
    - `JP_N5_LIVE_SPRING_2026`, `JP_N5_LIVE_SUMMER_2026`, `JP_N5_LIVE_FALL_2026` (mode = LIVE, cùng version).
- **Commerce:**
  - `CourseOffering` “N5 VOD” → link 1 class: `JP_N5_VOD_MAIN_2026`.
  - `CourseOffering` “N5 Live Spring + VOD” → link 2 class:
    - `JP_N5_LIVE_SPRING_2026`
    - `JP_N5_VOD_MAIN_2026`.

---

### 5. Điểm mấu chốt giúp schema này “dễ mở sang tiếng Anh / lập trình”

- **Tên gọi trung tính**: `CourseProfile`, `CourseEdition`, `Chapter`, `Class`, `CourseOffering` – không cột nào đặc thù tiếng Nhật.
- **3 layer rõ ràng**:
  - Content (Syllabus) – không dính lịch/khoa khai giảng.
  - Delivery (Class) – không dính giá/bundle.
  - Commerce (Offering) – chỉ nói chuyện tiền & gói.
- **Re-use Syllabus**:
  - Dù là tiếng Nhật, tiếng Anh hay lập trình, **mọi thứ dùng chung schema**; khác biệt chỉ là **data + subject**.

Nếu bạn muốn bước tiếp theo, tôi có thể:

- Map từng bảng hiện tại (`CourseMaster`, `CourseVersion`, `CourseRun`, `Module`, `ModuleItem`, `Quiz`, `Assignment`) sang schema mới này,
- Và gợi ý lộ trình migrate theo từng phase (chỉ đổi tên & thêm bảng trước, migrate logic sau).

---

### 6. Nguyên tắc thiết kế & phạm vi refactor (KHÔNG backward-compatible)

- **Xóa bỏ hoàn toàn flow cũ**:
  - Không giữ `CourseMaster`, `CourseVersion`, `CourseRun`, `Module`, `ModuleItem` trong domain mới.
  - Không cố gắng map 1–1 sang schema mới ở cấp code; coi như **thiết kế lại core LMS từ đầu**.
- **Giữ tối đa các khối tái sử dụng được**:
  - Auth, User, Payment, Order hiện tại vẫn có thể dùng lại.
  - Question bank / Quiz engine có thể reuse, chỉ cần thêm `classId` / `courseProfileId` phù hợp.
- **Domain-first, code-second**:
  - Định nghĩa rõ **trạng thái (state machine)** cho `CourseEdition`, `Class`, `CourseOffering`.
  - Định nghĩa rõ **use-case** trước khi implement service/controller.
- **Tách rõ 3 bounded context**:
  - `content-service` (hoặc module “Content”).
  - `learning-service` (Delivery/Class, Enrollment, Progress, Assessment).
  - `commerce-service` (Offering, Order, Payment, Promotion).

---

### 7. Chi tiết schema mới (dạng gần với Prisma)

> Đây là phiên bản “gần code” để dễ implement vào `schema.prisma`. Tên bảng/field có thể adjust theo convention thực tế (snake_case / camelCase).

#### 7.1. Content schema

- **`CourseProfile`**

  - Columns:
    - `id` (UUID, PK)
    - `code` (string, unique, index)
    - `title` (string)
    - `shortTitle` (string, nullable)
    - `description` (text, nullable)
    - `subject` (string, index) – ví dụ: `japanese`, `english`, `programming`
    - `level` (string, nullable) – ví dụ: `N5`, `A2`, `Beginner`
    - `defaultLanguage` (string, nullable)
    - `thumbnailUrl` (text, nullable)
    - `metadata` (jsonb, default `{}`)
    - `createdAt`, `updatedAt`

- **`CourseEdition`**

  - Columns:
    - `id` (UUID, PK)
    - `courseProfileId` (FK → `CourseProfile.id`)
    - `editionTag` (string) – ví dụ: `v1`, `2026`
    - `isCurrent` (boolean, default false)
    - `status` (enum: `DRAFT`, `PENDING_APPROVAL`, `PUBLISHED`, `ARCHIVED`) – `PENDING_APPROVAL` khi bật approval
    - `syllabusSnapshot` (jsonb, nullable)
    - `changelog` (text, nullable)
    - `submittedForApprovalAt`, `submittedBy`, `approvedAt`, `approvedBy`, `rejectedAt`, `rejectedBy`, `rejectionReason` (nullable)
    - `createdAt`, `updatedAt`, `publishedAt?`
  - Constraint:
    - Unique `(courseProfileId, editionTag)`
    - Chỉ 1 `isCurrent = true` trên mỗi `courseProfileId`.

- **`Chapter`**

  - Columns:
    - `id` (UUID, PK)
    - `courseEditionId` (FK → `CourseEdition.id`)
    - `title` (string)
    - `description` (text, nullable)
    - `orderIndex` (int)
    - `estimatedMinutes` (int, nullable)
    - `status` (enum: `DRAFT`, `PUBLISHED`)
    - `createdAt`, `updatedAt`
  - Index:
    - `(courseEditionId, orderIndex)`

- **`ChapterItem`**

  - Columns:
    - `id` (UUID, PK)
    - `chapterId` (FK → `Chapter.id`)
    - `title` (string)
    - `kind` (enum: `LESSON`, `QUIZ_TEMPLATE`, `ASSIGNMENT_TEMPLATE`, `READING`, `PROJECT`, ...)
    - `referenceId` (UUID) – trỏ tới `Lesson.id` / `QuizTemplate.id` / `AssignmentTemplate.id` / ...
    - `orderIndex` (int)
    - `metadata` (jsonb, default `{}`)
  - Index:
    - `(chapterId, orderIndex)`

- **`Lesson`**

  - Columns:
    - `id` (UUID, PK)
    - `courseProfileId` (FK → `CourseProfile.id`)
    - `title` (string)
    - `contentType` (enum: `VIDEO`, `HTML`, `MARKDOWN`, `EXTERNAL_LINK`, ...)
    - `contentUrl` (text, nullable)
    - `contentBody` (text, nullable)
    - `attachments` (jsonb, default `[]`)
    - `metadata` (jsonb, default `{}`)
    - `createdAt`, `updatedAt`

- **`QuizTemplate`**

  - Columns:
    - `id` (UUID, PK)
    - `courseProfileId` (FK → `CourseProfile.id`)
    - `title` (string)
    - `description` (text, nullable)
    - `questionPoolId` (UUID, nullable) – reuse question bank hiện tại
    - `defaultTimeLimitMinutes` (int, nullable)
    - `defaultMaxAttempts` (int, default 1)
    - `defaultPassingScorePercent` (decimal, nullable)
    - `settings` (jsonb, default `{}`)
    - `createdAt`, `updatedAt`

- **`AssignmentTemplate`**

  - Columns:
    - `id` (UUID, PK)
    - `courseProfileId` (FK → `CourseProfile.id`)
    - `title` (string)
    - `description` (text, nullable)
    - `defaultType` (enum: `TEXT`, `FILE`, `BOTH`)
    - `defaultMaxScore` (decimal, nullable)
    - `defaultRubric` (jsonb, default `{}`)
    - `defaultSubmissionSettings` (jsonb, default `{}`)
    - `createdAt`, `updatedAt`

#### 7.2. Delivery schema

- **`Class`** (base – fields chung)

  - Columns:
    - `id` (UUID, PK)
    - `mode` (enum: `VOD`, `LIVE`) – xác định có VodClass hay LiveClass
    - `courseProfileId` (FK → `CourseProfile.id`)
    - `courseEditionId` (FK → `CourseEdition.id`)
    - `code` (string, unique) – `JP_N5_LIVE_SPRING_2026`
    - `name` (string)
    - `status` (enum: `DRAFT`, `PENDING_APPROVAL`, `ENROLLING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`)
    - `submittedForApprovalAt`, `submittedBy`, `approvedAt`, `approvedBy`, `rejectedAt`, `rejectedBy`, `rejectionReason` (nullable)
    - `settings` (jsonb, default `{}`)
    - `createdAt`, `updatedAt`
  - Constraint: Mỗi Class có đúng 1 VodClass (khi mode=VOD) hoặc 1 LiveClass (khi mode=LIVE).

- **`VodClass`** (extends Class, 1–1 khi mode = VOD)
  - Columns:
    - `id` (UUID, PK), `classId` (FK → `Class.id`, unique)
    - `enrollmentOpenAt`, `enrollmentCloseAt` (datetime, nullable) – null = luôn mở
    - `maxStudents` (int, nullable), `defaultExpiresMonths` (int, nullable)
  - Rule: VOD dùng mãi; có thể đổi `Class.courseEditionId` sang edition mới.

- **`LiveClass`** (extends Class, 1–1 khi mode = LIVE)
  - Columns:
    - `id` (UUID, PK), `classId` (FK → `Class.id`, unique)
    - `term` (string, nullable), `batch` (string, nullable)
    - `startDate`, `endDate`, `enrollmentOpenAt`, `enrollmentCloseAt`
    - `minStudents`, `maxStudents`
    - `minStudentsEnforcement` (enum: `STRICT`, `NOTIFY`, `DISABLED`, nullable)
    - `primaryTeacherId` (FK → `User.id`, nullable) – 1 giảng viên dạy chính và xuyên suốt
  - Rule: `Class.courseEditionId` không đổi sau ENROLLING; cần ít nhất 1 LiveSchedule khi publish. Không hỗ trợ nhiều GV (assistant) – chỉ 1 primary teacher.

- **`LiveSchedule`** (cho LiveClass, 1–n)

  - Columns:
    - `id` (UUID, PK)
    - `liveClassId` (FK → `LiveClass.id`)
    - `weekday` (int 0–6) hoặc `dayOfWeek` enum
    - `startTime` (time)
    - `endTime` (time)
    - `location` (string/text)
    - `excludedDates` (jsonb, nullable) – danh sách ngày nghỉ (Tết, lễ) không học
    - `note` (text, nullable)

- **`ClassAssessment`**

  - Columns:
    - `id` (UUID, PK)
    - `classId` (FK → `Class.id`)
    - `kind` (enum: `QUIZ`, `ASSIGNMENT`)
    - `templateId` (FK → `QuizTemplate.id` hoặc `AssignmentTemplate.id`)
    - `titleOverride` (string, nullable)
    - `deadline` (datetime, nullable)
    - `weight` (decimal, nullable)
    - `maxAttemptsOverride` (int, nullable)
    - `timeLimitOverrideMinutes` (int, nullable)
    - `maxScoreOverride` (decimal, nullable)
    - `settings` (jsonb, default `{}`)
    - `status` (enum: `DRAFT`, `PUBLISHED`, `CLOSED`)
    - `createdAt`, `updatedAt`

- **`Enrollment`**

  - Columns:
    - `id` (UUID, PK)
    - `classId` (FK → `Class.id`)
    - `userId` (FK → `User.id`)
    - `enrolledAt` (datetime)
    - `expiresAt` (datetime, nullable)
    - `status` (enum: `ACTIVE`, `COMPLETED`, `CANCELLED`, `EXPIRED`)
    - `sourceOfferingId` (FK → `CourseOffering.id`, nullable)
    - `metadata` (jsonb, default `{}`)

- **`LearningProgress`**

  - Columns:
    - `id` (UUID, PK)
    - `classId` (FK → `Class.id`)
    - `userId` (FK → `User.id`)
    - `lessonId` (FK → `Lesson.id`)
    - `status` (enum: `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`)
    - `lastAccessedAt` (datetime, nullable)
    - `progressPercent` (int 0–100)
    - Unique `(classId, userId, lessonId)`

- **`QuizAttempt`** (reused / adjusted từ hiện tại)

  - Columns bổ sung/điều chỉnh quan trọng:
    - `classId` (FK → `Class.id`, bắt buộc)
    - `classAssessmentId` (FK → `ClassAssessment.id`, nullable nếu chưa tách instance)
    - `quizTemplateId` (FK → `QuizTemplate.id`, nullable nếu vẫn dùng bảng Quiz hiện tại)

- **`AssignmentSubmission`** (tương tự)

  - Columns:
    - `id` (UUID, PK)
    - `classId` (FK → `Class.id`)
    - `classAssessmentId` (FK → `ClassAssessment.id`)
    - `assignmentTemplateId` (FK → `AssignmentTemplate.id`)
    - `userId` (FK → `User.id`)
    - `status` (enum: `DRAFT`, `SUBMITTED`, `GRADED`, ...)
    - `score` (decimal, nullable)
    - `submittedAt`, `gradedAt`
    - `content` (text/jsonb, tùy kiểu bài)

#### 7.3. Commerce schema

- **`CourseOffering`**

  - Columns:
    - `id` (UUID, PK)
    - `code` (string, unique)
    - `title` (string)
    - `description` (text, nullable)
    - `price` (decimal)
    - `currency` (string)
    - `status` (enum: `DRAFT`, `PENDING_APPROVAL`, `PUBLISHED`, `HIDDEN`)
    - `submittedForApprovalAt`, `submittedBy`, `approvedAt`, `approvedBy`, `rejectedAt`, `rejectedBy`, `rejectionReason` (nullable)
    - `salesStartAt` (datetime, nullable)
    - `salesEndAt` (datetime, nullable)
    - `metadata` (jsonb, default `{}`)
    - `createdAt`, `updatedAt`

- **`CourseOfferingClass`**

  - Columns:
    - `offeringId` (FK → `CourseOffering.id`)
    - `classId` (FK → `Class.id`)
    - PK có thể là composite `(offeringId, classId)`

- **`Order` / `OrderItem`**

  - Có thể reuse flow hiện tại, chỉ cần:
    - `OrderItem.offeringId` → sau khi thanh toán, tìm tất cả `CourseOfferingClass` tương ứng, tạo `Enrollment` cho từng `classId`.

#### 7.4. Entity bổ sung (theo nghiệp vụ trung tâm tiếng Nhật)

- **`Waitlist`**
  - Columns:
    - `id` (UUID, PK), `classId` (FK → `Class.id`), `userId` (FK → `User.id`)
    - `joinedAt` (datetime), `status` (enum: `WAITING`, `OFFERED`, `ENROLLED`, `EXPIRED`)
  - Khi lớp đủ maxStudents, học viên đăng ký waitlist. Khi có slot trống, staff gửi offer → chuyển sang Enrollment.

- **`ClassAttendance`** – **chỉ dành cho lớp LIVE**
  - Columns:
    - `id` (UUID, PK), `liveScheduleId` (FK → `LiveSchedule.id`), `userId` (FK → `User.id`)
    - `status` (enum: `PRESENT`, `ABSENT`, `LATE`, `EXCUSED`), `recordedAt` (datetime)
  - Rule: Điểm danh theo từng buổi (LiveSchedule). **VOD không có buổi học cố định → không dùng ClassAttendance.** Chỉ áp dụng khi `Class.mode = LIVE`.

- **`Certificate`**
  - Columns:
    - `id` (UUID, PK), `enrollmentId` (FK), `userId` (FK), `classId` (FK)
    - `issuedAt`, `certificateType` (enum: `COMPLETION`, `ATTENDANCE`, `JLPT_MOCK`, ...), `metadata` (jsonb)

- **`RefundPolicy`**
  - Columns:
    - `id` (UUID, PK), `companyId` (FK, nullable), `name`, `conditions` (jsonb), `isDefault`
  - Rule: trước 7 ngày = 100%, sau 3 buổi = 50%, v.v.

- **`RefundRequest`**
  - Columns:
    - `id` (UUID, PK), `enrollmentId` (FK → `Enrollment.id`), `userId` (FK)
    - `reason` (text), `requestedAt` (datetime), `status` (enum: `PENDING`, `APPROVED`, `REJECTED`)
    - `processedAt`, `processedBy` (nullable)

- **`ClassAssessment` – late submission**
  - Thêm `lateSubmissionPolicy` (enum: `REJECT`, `ACCEPT_PENALTY`, `ACCEPT_NO_PENALTY`, nullable)
  - Thêm `settings.latePenaltyPercentPerDay` (decimal, nullable)

---

### 8. Approval workflow (cấu hình optional)

Trung tâm có thể bật/tắt luồng approval. Mặc định: **có thể tắt** để Staff-LMS tự publish (quy mô nhỏ). Khi bật, Staff-LMS chỉ tạo draft, Admin/Academic Director mới approve.

#### 8.0.1. Cấu hình `requireApprovalForPublish`

- **OFF** (mặc định): Staff-LMS có `academy.content.write` / `academy.classroom.write` / `academy.commerce.write` có thể publish trực tiếp.
- **ON**: Staff-LMS chỉ có thể `submitForApproval`; Admin (hoặc role có `academy.approve`) mới được `approve` hoặc `reject`.

#### 8.0.2. Luồng approval (khi bật)

- **CourseEdition**:
  - Staff tạo `DRAFT` → `submitForApproval` → `PENDING_APPROVAL`.
  - Admin: `approve` → `PUBLISHED`, hoặc `reject` → `DRAFT`.
- **Class**:
  - Staff tạo `DRAFT` → `submitForApproval` → `PENDING_APPROVAL`.
  - Admin: `approve` → `ENROLLING`, hoặc `reject` → `DRAFT`.
- **CourseOffering**:
  - Staff tạo `DRAFT` → `submitForApproval` → `PENDING_APPROVAL`.
  - Admin: `approve` → `PUBLISHED`, hoặc `reject` → `DRAFT`.

#### 8.0.3. Fields bổ sung cho audit

- `submittedForApprovalAt` (datetime, nullable)
- `submittedBy` (FK → User, nullable)
- `approvedAt` (datetime, nullable)
- `approvedBy` (FK → User, nullable)
- `rejectedAt`, `rejectedBy`, `rejectionReason` (nullable)

---

### 9. State machine & rule nghiệp vụ cốt lõi

#### 9.1. `CourseEdition.status`

- Luồng đơn giản (approval OFF):
  - `DRAFT` → `PUBLISHED` → `ARCHIVED`
- Luồng có approval (approval ON):
  - `DRAFT` → `PENDING_APPROVAL` → `PUBLISHED` hoặc `DRAFT` (reject)
  - Chỉ `PUBLISHED` mới được chọn bởi `Class`.
  - Khi publish:
    - Set tất cả edition khác `isCurrent = false`.
    - Set edition này `isCurrent = true`, `publishedAt = now()`.
  - Với LIVE: không sửa `courseEditionId` khi `Class.status ∈ {ENROLLING, IN_PROGRESS}` (enforce lock). Với VOD: có thể đổi `courseEditionId` sang edition mới.

#### 9.2. `Class.status`

- Luồng gợi ý (approval OFF):
  - `DRAFT` → `ENROLLING` → `IN_PROGRESS` → `COMPLETED`
  - `DRAFT` → `CANCELLED`
  - `ENROLLING` → `CANCELLED`
- Luồng có approval (approval ON):
  - `DRAFT` → `PENDING_APPROVAL` → `ENROLLING` (approve) hoặc `DRAFT` (reject)
- Rule:
  - `ENROLLING`:
    - Với `mode = LIVE` → LiveClass cần có `startDate`, `endDate` & ít nhất 1 `LiveSchedule`.
  - `IN_PROGRESS`:
    - LIVE: Chỉ khi `now >= LiveClass.startDate`. VOD: khi có enrollment active.
  - `COMPLETED`:
    - LIVE: Chỉ khi `now >= LiveClass.endDate` hoặc manual close. VOD: manual close.
  - `* → CANCELLED`:
    - Chỉ cho phép theo rule hủy lớp (xem mục 17).

#### 9.3. `CourseOffering.status`

- Luồng đơn giản (approval OFF):
  - `DRAFT` → `PUBLISHED` / `HIDDEN`
- Luồng có approval (approval ON):
  - `DRAFT` → `PENDING_APPROVAL` → `PUBLISHED` (approve) hoặc `DRAFT` (reject)

#### 9.4. Enrollment

- Có thể enroll:
  - Trực tiếp (free class, internal add).
  - Thông qua `CourseOffering` + Order/Payment.
- Rule:
  - Chỉ cho phép enroll nếu:
    - `Class.status` ∈ {`ENROLLING`, `IN_PROGRESS`} (tùy policy).
    - `enrollmentOpenAt <= now <= enrollmentCloseAt` (nếu có).
    - `currentActiveEnrollments < maxStudents` (nếu có max).

---

### 10. Luồng use-case chính theo schema mới

#### 10.1. Academic tạo chương trình mới

1. Tạo `CourseProfile` (ví dụ: “JLPT N5”).
2. Tạo `CourseEdition` đầu tiên (`editionTag = 'v1'`, `status = DRAFT`).
3. Tạo `Chapter` + `ChapterItem` để build syllabus.
4. Tạo `Lesson`, `QuizTemplate`, `AssignmentTemplate` và link vào `ChapterItem.referenceId`.
5. Khi sẵn sàng:
   - Publish edition: `status = PUBLISHED`, `isCurrent = true`.

#### 10.2. Tạo lớp VOD cho N5

1. Tạo `Class` (mode=VOD) + `VodClass`:
   - `courseProfileId = JP_N5`
   - `courseEditionId = JP_N5_v1`
   - `mode = VOD`
   - `status = ENROLLING` (hoặc `IN_PROGRESS` luôn).
2. (Optional) Auto-generate `ClassAssessment` từ tất cả `QuizTemplate` / `AssignmentTemplate` trong edition.

#### 10.3. Tạo 3 lớp LIVE cho N5 trong năm

1. Cho mỗi đợt (Spring/Summer/Fall):
   - Tạo `Class` (mode=LIVE) + `LiveClass` với:
     - `mode = LIVE`
     - `term = 'Spring 2026'`...
     - `startDate`, `endDate`
   - Thêm `LiveSchedule` tương ứng (thứ/giờ dạy).
2. (Optional) Auto-generate cùng bộ `ClassAssessment` như VOD hoặc khác đi (override deadline, weight).

#### 10.4. Tạo product “N5 Live Spring + VOD”

1. Tạo `CourseOffering`:
   - `code = 'JP_N5_LIVE_SPRING_2026_BUNDLE'`
   - `title`, `price`, `status = PUBLISHED`.
2. Tạo 2 bản ghi `CourseOfferingClass`:
   - `(offeringId, classId = JP_N5_LIVE_SPRING_2026)`
   - `(offeringId, classId = JP_N5_VOD_MAIN_2026)`.
3. Khi học viên mua offering:
   - Sau khi `Order` PAID:
     - Query tất cả `CourseOfferingClass` theo `offeringId`.
     - Tạo `Enrollment` cho từng `classId`.

---

### 11. Plan triển khai code theo flow mới

> Vì không giữ backward-compatible, có thể triển khai theo hướng “new core” và dần dần migrate các service khác dựa trên core mới.

#### 11.1. Bước 1 – Thiết kế & implement schema Prisma mới

- Sửa `schema.prisma`:
  - Thêm các model:
    - `CourseProfile`, `CourseEdition`, `Chapter`, `ChapterItem`,
    - `Lesson`, `QuizTemplate`, `AssignmentTemplate`,
    - `Class`, `VodClass`, `LiveClass`, `LiveSchedule`, `ClassAssessment`,
    - `CourseOffering`, `CourseOfferingClass`,
    - `Waitlist`, `ClassAttendance`, `Certificate`, `RefundPolicy`, `RefundRequest`,
    - Adjust `Enrollment`, `QuizAttempt`, `AssignmentSubmission` để thêm `classId` / `classAssessmentId`,
    - Thêm fields approval (`submittedForApprovalAt`, `approvedBy`, v.v.) và status `PENDING_APPROVAL` cho CourseEdition, Class, CourseOffering.
  - Xóa/hoặc comment out các model cũ không dùng nữa (nếu quyết định drop luôn DB cũ).
- Chạy `prisma migrate dev` để tạo/migrate schema DB.

#### 11.2. Bước 2 – Tạo module/service mới cho Content

- Module `content` (trong `services/learning` hoặc service riêng):
  - Service:
    - `CourseProfileService`
    - `CourseEditionService`
    - `ChapterService`
    - `LessonService`
    - `QuizTemplateService`
    - `AssignmentTemplateService`
  - API chính:
    - CRUD CourseProfile.
    - Tạo/publish CourseEdition.
    - CRUD Chapter + ChapterItem.
    - CRUD Lesson/QuizTemplate/AssignmentTemplate.

#### 11.3. Bước 3 – Tạo module/service mới cho Delivery

- Module `classroom` hoặc `delivery`:
  - Service:
    - `ClassService`
    - `VodClassService`, `LiveClassService`
    - `LiveScheduleService`
    - `ClassAssessmentService`
    - `EnrollmentService`
    - `LearningProgressService`
  - Logic chính:
    - Create/update Class + VodClass hoặc Class + LiveClass (validate state machine).
    - Sync auto-generate ClassAssessment từ template (nếu muốn).
    - Enroll learner (direct + qua commerce).
    - Track progress, quiz attempt, assignment submission.

#### 11.4. Bước 4 – Tạo module/service mới cho Commerce

- Module `commerce`:
  - Service:
    - `CourseOfferingService`
    - Integration với `OrderService` hiện có.
  - Logic:
    - CRUD offering.
    - Link offering ↔ class.
    - Hook sau khi đơn hàng được thanh toán → tạo Enrollment.

#### 11.5. Bước 5 – Xóa dần code flow cũ

- Loại bỏ:
  - `CourseMasterService`, `CourseRunService`, `ModuleService`, `ModuleItemRepository`, ...
  - Router/API cũ tương ứng.
- Điều chỉnh frontend:
  - Admin UI:
    - Tạo/sửa `CourseProfile`, `CourseEdition`, `Chapter`, `Class`, `CourseOffering`.
  - Student UI:
    - Trang catalog → đọc từ `CourseOffering`.
    - Trang “My Courses” → từ `Enrollment` + `Class`.
    - Player lesson → từ `Class` + `CourseEdition` + `Lesson` + `ChapterItem`.

---

### 12. Checklist để review logic nghiệp vụ (tránh sai sót)

- **Content:**
  - [ ] Một `CourseProfile` có thể dùng cho nhiều subject/cấp độ? (yes – subject/level là field mềm).
  - [ ] Một `CourseEdition` chỉ dùng cho các `Class` được tạo sau khi publish? (nên enforce).
  - [ ] Thay đổi syllabus cho tương lai → tạo edition mới, không phá edition cũ? (yes).

- **Delivery:**
  - [ ] `Class` có thể sử dụng chung `CourseEdition`? (yes – các đợt live & vod).
  - [ ] `ClassAssessment` có optional hay bắt buộc? (nên optional, auto-generate).
  - [ ] Chỉ hỗ trợ VOD và LIVE; không hỗ trợ BLENDED.

- **Commerce:**
  - [ ] Một `CourseOffering` có thể chứa nhiều `Class`? (yes – bundle live + vod).
  - [ ] Hủy đơn hàng có rollback Enrollment? (phụ thuộc chính sách; cần rule riêng).

- **Mở rộng các mảng khác (English, Programming, …):**
  - [ ] Có field nào hard-code tiếng Nhật? (không, chỉ có `subject`, `level` dạng text).
  - [ ] Có logic nào dựa vào JLPT-level? (nên đưa vào `metadata` thay vì field cứng).

- **Approval:**
  - [ ] Có bật `requireApprovalForPublish`? Nếu có: Staff submit → Admin approve.
  - [ ] Phân quyền `academy.approve` chỉ cho Admin/Academic Director.

- **Delivery bổ sung:**
  - [ ] minStudentsEnforcement: STRICT / NOTIFY / DISABLED khi &lt; minStudents?
  - [ ] **Không hỗ trợ** EnrollmentFreeze (tạm ngừng học).
  - [ ] VOD expiresAt: job/cron check và set EXPIRED?

- **Assessment:**
  - [ ] lateSubmissionPolicy cho Assignment?

- **Commerce:**
  - [ ] RefundRequest flow: Ticket → approve → Billing?

---

### 12.A. Danh mục use-case theo ưu tiên (trung tâm tiếng Nhật)

| Ưu tiên | Use-case | Mô tả ngắn | Spec |
|---------|----------|------------|------|
| **P0** | Approval (CourseEdition, Class, Offering) | Staff tạo draft → submit → Admin approve | Mục 8 |
| **P0** | Lớp không đủ minStudents | Khi hết hạn enroll, nếu &lt; minStudents → hủy/gộp/notify | Mục 17.B |
| **P0** | Hủy lớp có enrollments | Rule hủy + refund + thông báo | Mục 17.A |
| **P1** | Waitlist | Lớp đủ maxStudents → đăng ký chờ; có slot → offer | Mục 7.4, 17.D |
| **P1** | Refund policy | Hoàn tiền theo điều kiện (trước 7 ngày, sau 3 buổi...) | Mục 7.4, 17.C |
| **P1** | Chuyển lớp | Transfer cùng level, cùng CourseProfile | Mục 17.E |
| **P2** | Trial class | Học thử 1–2 buổi trước khi mua | Mục 17.F |
| **P2** | Khuyến mãi (Early bird, voucher) | Giảm giá theo thời điểm / mã | Commerce |
| **P2** | Certificate | Chứng nhận hoàn thành | Mục 7.4 |
| **P3** | Điểm danh (ClassAttendance) | Chỉ LIVE – gắn với LiveSchedule, PRESENT/ABSENT/LATE | Mục 7.4 |
| **P3** | Clone edition / Duplicate class | Tạo mới từ edition/lớp cũ | Mục 17.H |
| **P3** | Placement test | Thi xếp lớp N5/N4/N3 | Exam (examType = PLACEMENT) |
| **P3** | VOD enrollment hết hạn | expiresAt → EXPIRED, mất quyền truy cập | Mục 17.I |
| **P3** | Late submission (Assignment) | Nộp muộn: reject / chấp nhận có trừ điểm | Mục 17.J |
| **P3** | Refund request (Ticket) | Học viên yêu cầu → Staff approve → Billing | Mục 17.K |
| **P3** | Notification triggers | Lớp sắp khai giảng, bài tập đến hạn, có điểm... | Mục 17.L |
| **P3** | Lịch nghỉ lễ | Excluded dates cho LiveSchedule | Mục 17.M |

File này là **nguồn sự thật (single source of truth)** cho core LMS mới, dùng làm chuẩn khi implement code và khi các agent/chat khác cần hiểu context hệ thống.

---

### 13. Thiết kế Assessment/Quiz/Question nâng cao cho JLPT / IELTS / TOEIC

#### 13.1. Vấn đề với thiết kế quiz đơn giản

- Nếu chỉ có:
  - `Quiz` + `QuizQuestion` + `Question`
- Thì sẽ khó hỗ trợ:
  - **Section có time limit riêng** (ví dụ Listening 40 phút, Reading 70 phút).
  - **Group câu hỏi dùng chung passage/audio** (1 đoạn văn/file nghe → nhiều câu).
  - **Logic shuffle** nhưng vẫn giữ group không bị vỡ.

=> Cần tách **Section** và **Group Question** thành entity riêng.

#### 13.2. Schema đề xuất cho quiz/assessment

> Phần này bổ sung chi tiết để implement trong `schema.prisma` của service `academy` mới.

- **`Exam`**

  - Tương đương `Quiz`, nhưng dùng tên trung tính hơn.
  - Columns:
    - `id` (UUID, PK)
    - `courseProfileId` (nullable, nếu exam chung hệ thống)
    - `title`
    - `description` (text, nullable)
    - `examType` (enum: `COURSE`, `PLACEMENT`, `MOCK`, `CERTIFICATION`, ...)
    - `level` (string, nullable, ví dụ: `N3`, `B2`)
    - `totalTimeLimitMinutes` (int, nullable)
    - `status` (enum: `DRAFT`, `PUBLISHED`, `ARCHIVED`)
    - `settings` (jsonb, default `{}`) – các flag như cho phép review, xem giải thích, v.v.

- **`ExamSection`**

  - Thay cho `sections` dạng JSON.
  - Columns:
    - `id` (UUID, PK)
    - `examId` (FK → `Exam.id`)
    - `title` (string) – ví dụ: `Language Knowledge`, `Listening`
    - `instruction` (text, nullable) – hướng dẫn chi tiết cho section.
    - `timeLimitSeconds` (int, nullable) – thời gian riêng cho section.
    - `orderIndex` (int)
    - `sectionType` (string) – `vocab`, `grammar`, `reading`, `listening`, `speaking`, ...
    - `metadata` (jsonb, default `{}`)

- **`Question`** (hỗ trợ group Đọc/Nghe)

  - Columns:
    - `id` (UUID, PK)
    - `parentId` (UUID, nullable) – nếu là sub question của một group.
    - `content` (text) – nội dung câu hỏi, hoặc passage/audio description.
    - `mediaUrl` (text, nullable) – link file nghe, ảnh, etc.
    - `questionType` (enum: `SINGLE_CHOICE`, `MULTIPLE_CHOICE`, `SHORT_ANSWER`, `GROUP_PARENT`, ...)
    - `options` (jsonb, nullable) – list đáp án chọn sẵn.
    - `correctAnswer` (jsonb, nullable) – dạng flexible (A/B/C, multiple, text).
    - `explanation` (text, nullable)
    - `metadata` (jsonb, default `{}`)
    - `createdAt`, `updatedAt`
  - Relations:
    - `subQuestions` (1–n) – các câu hỏi con của một passage/audio.
    - `parent` – group cha nếu có.

- **`ExamQuestion`** (mapping ExamSection ↔ Question)

  - Columns:
    - `id` (UUID, PK)
    - `examId` (FK → `Exam.id`)
    - `sectionId` (FK → `ExamSection.id`)
    - `questionId` (FK → `Question.id`)
    - `orderIndex` (int)
    - `points` (decimal, default 1.0)
    - `metadata` (jsonb, default `{}`)
  - Rule:
    - Nếu `questionType = GROUP_PARENT`:
      - `ExamQuestion` gắn vào group parent, subQuestions được render chung UI, nhưng chấm điểm trên từng subQuestion (có thể cần bảng `ExamSubQuestionOverride` nếu muốn override points/hints).

#### 13.3. Attempt & Section flow

- **`ExamAttempt`**

  - Columns chính:
    - `id` (UUID, PK)
    - `examId` (FK → `Exam.id`)
    - `classId` (FK → `Class.id`, nullable nếu exam độc lập)
    - `userId`
    - `status` (enum: `IN_PROGRESS`, `SUBMITTED`, `COMPLETED`, `ABANDONED`)
    - `startedAt`, `submittedAt`, `completedAt`
    - `rawScore` (decimal, nullable)
    - `maxScore` (decimal, nullable)
    - `percentage` (decimal, nullable)
    - `isPassed` (boolean, nullable)
    - `draftAnswers` (jsonb, default `{}`) – lưu tạm client answers.

- **`ExamAttemptSectionState`**

  - Để track flow JLPT-style (hết section không quay lại).
  - Columns:
    - `id` (UUID, PK)
    - `attemptId` (FK → `ExamAttempt.id`)
    - `sectionId` (FK → `ExamSection.id`)
    - `status` (enum: `LOCKED`, `IN_PROGRESS`, `COMPLETED`, `SKIPPED`)
    - `startedAt` (datetime, nullable)
    - `endedAt` (datetime, nullable)
    - `timeSpentSeconds` (int, default 0)
  - Rule:
    - UI chỉ cho phép truy cập các section có `status ∈ {IN_PROGRESS, NOT_STARTED nhưng được phép mở}`.
    - Khi hết `timeLimitSeconds`, backend/websocket auto mark `COMPLETED`, khóa section.

- **`ExamAttemptDetail`**

  - Tương tự `QuizAttemptDetail` hiện tại, nhưng:
    - có `examQuestionId`, `questionId`, `sectionId`.
    - giúp làm analytics sau này: tỉ lệ chọn A/B/C theo câu.

#### 13.4. Logic xử lý answers

- Trong khi làm bài:
  - Client gửi các update nhỏ (autosave) → backend chỉ cập nhật vào `draftAnswers` (JSON).
- Khi học viên nhấn “Nộp bài”:
  - Backend/job service:
    - Parse `draftAnswers` → ghi vào `ExamAttemptDetail`.
    - Tính điểm từng `ExamQuestion` (và từng subQuestion).
    - Tính `rawScore`, `maxScore`, `percentage`, `isPassed`.
    - Clear hoặc archive `draftAnswers` nếu muốn.

#### 13.5. Shuffle logic

- Shuffle **trong phạm vi 1 `ExamSection`**.
- Nếu `Question.questionType = GROUP_PARENT`:
  - Không shuffle subQuestions ra khỏi group.
  - Có thể shuffle vị trí group trong section, nhưng toàn bộ group luôn đi chung.

---

### 14. Kiến trúc service NestJS mới: `academy`

Mục tiêu: một service LMS core **tự chứa**, có thể mang sang hệ thống khác (như `service-meet`) mà **code không phụ thuộc các legacy service**.

#### 14.1. Bounded context trong `academy`

Đề xuất chia module nội bộ:

- **ContentModule**
  - Quản lý:
    - `CourseProfile`, `CourseEdition`, `Chapter`, `ChapterItem`, `Lesson`,
    - `QuizTemplate` (có thể đổi tên thành `ExamTemplate` nếu unify),
    - `AssignmentTemplate`.
- **ClassroomModule**
  - Quản lý:
    - `Class`, `VodClass`, `LiveClass`, `LiveSchedule`,
    - `ClassAssessment`, `ClassAttendance`,
    - `Enrollment`, `LearningProgress`, `Waitlist`.
- **AssessmentModule**
  - Quản lý:
    - `Exam`, `ExamSection`, `ExamQuestion`,
    - Question bank (`Question`, `QuestionPool` nếu cần),
    - `ExamAttempt`, `ExamAttemptSectionState`, `ExamAttemptDetail`,
    - `AssignmentSubmission`.
- **CommerceModule** (tùy, có thể nằm ngoài `academy` nếu bạn đã có service payment riêng)
  - Quản lý:
    - `CourseOffering`, `CourseOfferingClass`,
    - `RefundPolicy`, `RefundRequest`,
    - Integration với `Order`/`Payment` bên ngoài qua NATS/HTTP.

#### 14.2. API high-level của `academy`

- **Content APIs**
  - `POST /course-profiles`
  - `POST /course-profiles/:id/editions`
  - `POST /editions/:id/clone` – clone edition từ edition hiện tại
  - `POST /editions/:id/chapters`
  - `POST /lessons`, `POST /quiz-templates`, `POST /assignment-templates`
  - `POST /chapters/:id/items`

- **Classroom APIs**
  - `POST /classes` – tạo VOD (Class + VodClass) hoặc LIVE (Class + LiveClass) class.
  - `POST /classes/:id/duplicate` – duplicate class từ class hiện tại
  - `POST /classes/:id/schedules` – chỉ cho LIVE (LiveSchedule).
  - `POST /classes/:id/transfer` – chuyển enrollment từ lớp khác (hoặc endpoint riêng trên Enrollment)
  - `POST /classes/:id/assessments` – map template vào class.
  - `POST /classes/:id/enrollments` – enroll trực tiếp / từ event bên commerce.

- **Assessment APIs**
  - `POST /exams` – tạo đề thi (có thể link với CourseProfile hoặc độc lập).
  - `POST /exams/:id/sections`
  - `POST /sections/:id/questions` – attach Question (group hoặc đơn).
  - `POST /questions` – CRUD question + pool.
  - `POST /exams/:id/attempts` – start attempt.
  - `PATCH /attempts/:id/answers` – autosave draft.
  - `POST /attempts/:id/submit` – chấm điểm & finalize.

#### 14.3. Triển khai `academy` như một service mới

- Tạo project mới: `apps/academy` (NestJS microservice hoặc REST service riêng).
- Kết nối DB:
  - Có thể share cùng PostgreSQL nhưng schema tách biệt (prefix bảng `academy_` nếu muốn).
  - Hoặc DB riêng nếu bạn muốn isolation cao.
- Giao tiếp với các service khác:
  - `identity`/`user` – để lấy thông tin user/teacher.
  - `payment`/`order` – nhận event khi đơn hàng được thanh toán để tạo `Enrollment`.
  - `notification` – gửi thông báo khi class sắp bắt đầu, bài tập sắp đến hạn, etc.

#### 14.4. Chiến lược “ném đi chỗ khác vẫn chạy được”

- **Không import** code từ service cũ (learning, exam, v.v.).
- Chỉ giao tiếp qua:
  - HTTP (REST) public.
  - Hoặc NATS events với contract rõ ràng (DTO trong `@workspace/schemas` nhưng độc lập flow).
- Mọi logic domain của LMS (syllabus, class, assessment) **nằm trọn trong `academy`**.
- Nếu sau này bạn copy/paste `apps/academy` sang repo khác:
  - Chỉ cần trỏ lại:
    - `USER_SERVICE_URL` (hoặc topic NATS cho user).
    - `ORDER_SERVICE_URL` (hoặc topic NATS cho order).

---

### 15. Hướng triển khai tiếp theo cho team / AI Agent

- **Bước 1:** Freeze toàn bộ flow cũ (`CourseMaster`, `CourseRun`, `Module`, `Exam` hiện tại) – không thêm tính năng mới.
- **Bước 2:** Dùng file `core-lms.md` này làm spec để:
  - Thiết kế `schema.prisma` mới cho `academy`.
  - Generate migration và chạy trên DB dev mới (không đụng DB production cũ).
- **Bước 3:** Implement dần:
  - `ContentModule` trước (CourseProfile, Edition, Chapter, Lesson).
  - Sau đó `ClassroomModule` (Class, Enrollment).
  - Rồi tới `AssessmentModule` với `ExamSection`, `Question group`.
- **Bước 4:** Khi `academy` chạy ổn:
  - Dừng sử dụng service learning/exam cũ cho flow mới.
  - Dần dần migrate dữ liệu/nội dung cần thiết (nếu cần) hoặc build mới.

Khi các agent khác đọc file này, hãy coi đây là **thiết kế chuẩn** cho LMS core mới (`academy`) và không dựa vào schema/tên model cũ nữa.

---

### 16. Rules quan trọng cho `Class.mode` (VOD / LIVE)

Các rule này nhằm tránh việc dùng `Class` sai cách, đặc biệt với VOD-only class.

- **16.1. Quy ước `mode`**
  - **`VOD`** (Class + VodClass):
    - Dùng cho lớp tự học (self-paced), không phụ thuộc lịch live.
    - Không có LiveSchedule; VodClass có enrollmentOpenAt, enrollmentCloseAt, maxStudents, defaultExpiresMonths.
  - **`LIVE`**:
    - Dùng cho lớp chỉ học live (online/offline).
    - LiveClass bắt buộc có:
      - `startDate`, `endDate`; ít nhất một `LiveSchedule`.
    - Enrollment rule nên yêu cầu `now <= startDate` khi mở `ENROLLING`.
- **16.2. Validation khi đổi trạng thái `Class.status`**
  - `DRAFT → ENROLLING`:
    - `mode = LIVE`: yêu cầu LiveClass có `startDate`, `endDate` và ít nhất một `LiveSchedule`.
    - `mode = VOD`: cho phép thiếu schedule; yêu cầu CourseEdition hợp lệ.
  - `ENROLLING → IN_PROGRESS`:
    - `mode = LIVE`: chỉ cho phép khi `now >= LiveClass.startDate`.
    - `mode = VOD`: có thể cho phép ngay khi có ít nhất một `Enrollment` active.
  - `IN_PROGRESS → COMPLETED`:
    - Thông thường `now >= LiveClass.endDate` (LIVE), hoặc staff đóng thủ công.
  - `* → CANCELLED`:
    - Chỉ cho phép theo rule hủy lớp (xem mục 17).

- **16.3. Thiết kế kế thừa Class + VodClass + LiveClass**
  - `Class` là “instance quyền học”:
    - Ai (`Enrollment.userId`), học cái gì (`CourseProfile`/`CourseEdition`), trong khoảng thời gian nào.
  - Cả VodClass và LiveClass đều kế thừa Class, cần:
    - Enrollment, progress, assessment, certificate, reporting.
  - Dùng `Class` (base) + `VodClass` / `LiveClass` (TPT) giúp:
    - “My Courses” luôn đọc từ `Enrollment` + `Class`.
    - Player lesson luôn đi qua `Class` → `CourseEdition` → `ChapterItem`.
    - `CourseOffering` bundle Live + VOD chỉ cần liên kết tới nhiều `Class` khác nhau qua `CourseOfferingClass`.

- **16.4. VOD – rule tổng quát**
  - VOD = `Class` (mode=VOD) + `VodClass`:
    - `mode = VOD`.
    - Không có `LiveSchedule`.
    - `VodClass.maxStudents`, `defaultExpiresMonths` optional.
  - Enrollment vào VOD-only class:
    - Được phép ngay khi:
      - `Class.status ∈ {ENROLLING, IN_PROGRESS}`.
      - Không check `startDate` nếu không được set (policy có thể khác nhau).
  - UI không nên ẩn `Class` chỉ vì không có schedule:
    - Schedule là optional cho VOD, required cho LIVE.

- **16.5. ClassAttendance – chỉ LIVE**
  - `ClassAttendance` gắn với `LiveSchedule` (liveClassId → LiveSchedule).
  - **VOD không có buổi học cố định** → không dùng ClassAttendance. Không tạo/ghi điểm danh cho class mode = VOD.
  - API/UI điểm danh chỉ hiển thị và hoạt động khi `Class.mode = LIVE`.

---

### 17. Rule nghiệp vụ bổ sung (trung tâm tiếng Nhật)

#### 17.A. Rule hủy lớp có enrollments

- **Class** chuyển `* → CANCELLED`:
  - Nếu `enrollments ACTIVE = 0`: cho phép hủy.
  - Nếu có enrollments: theo policy (vd: chỉ Admin hủy được; phải gửi thông báo; xử lý refund theo RefundPolicy).
  - Khi hủy: cập nhật `Enrollment.status` sang `CANCELLED`; trigger refund nếu cần (qua service Billing).

#### 17.B. Rule lớp không đủ học viên (minStudents) – chỉ LIVE

- Khi `LiveClass.enrollmentCloseAt` đã qua và `currentActiveEnrollments < LiveClass.minStudents`:
  - Option 1: Auto `Class.status = CANCELLED` (job/cron).
  - Option 2: Thông báo Staff quyết định (hủy / gộp lớp / chạy dưới minStudents).
  - Spec: nên có rule rõ (field `minStudentsEnforcement`: `STRICT` | `NOTIFY` | `DISABLED`).

#### 17.C. Rule refund

- Refund theo `RefundPolicy.conditions`:
  - Ví dụ: trước 7 ngày khai giảng = 100%; sau 3 buổi học = 50%; sau đó = 0%.
  - Yêu cầu refund (Ticket) → Staff/Admin approve → Billing service xử lý.

#### 17.D. Rule waitlist

- Khi `currentActiveEnrollments < maxStudents` (VodClass.maxStudents hoặc LiveClass.maxStudents) và có người trong waitlist:
  - Staff có thể offer slot → chuyển `Waitlist.status = OFFERED`; học viên confirm trong thời hạn → tạo Enrollment.

#### 17.E. Rule chuyển lớp (Transfer)

- Học viên đang enroll lớp A (cùng CourseProfile, cùng level) muốn chuyển sang lớp B:
  - Điều kiện: `Class B.status ∈ {ENROLLING, IN_PROGRESS}`, còn slot, cùng `courseProfileId`.
  - Flow: Staff tạo Enrollment mới cho lớp B; cập nhật Enrollment lớp A sang `CANCELLED` (hoặc `TRANSFERRED`); ghi `metadata.transferredToEnrollmentId`.
  - Refund: tùy policy (có thể không refund nếu chuyển trong cùng kỳ).

#### 17.F. Rule trial class (học thử)

- Lớp cho phép học thử 1–2 buổi miễn phí trước khi quyết định mua:
  - Option 1: `Class.settings.allowTrial = true`, `trialSessionsCount = 2` → Enrollment tạm (trial) không qua Order.
  - Option 2: Offering riêng "Trial 2 buổi" → mua 0đ hoặc giá symbolic.
  - Sau trial: học viên chuyển sang Enrollment chính thức qua mua Offering.

#### 17.G. ~~Rule học bù (make-up session)~~ – **Không hỗ trợ**

- Tính năng "học bù" (nghỉ có phép → học bù buổi khác) **không nằm trong scope** core LMS hiện tại.

#### 17.H. Rule clone edition / duplicate class

- **Clone CourseEdition**: Tạo edition mới từ edition hiện tại (copy Chapter + ChapterItem, không copy Lesson/QuizTemplate – chỉ reference). API: `POST /editions/:id/clone` → trả về edition mới `status = DRAFT`.
- **Duplicate Class**: Tạo class mới từ class cũ (copy `courseProfileId`, `courseEditionId`, `mode`, VodClass/LiveClass, LiveSchedule, ClassAssessment mapping; đổi `term`/`batch`/`startDate`/`endDate` cho LiveClass). API: `POST /classes/:id/duplicate`.

#### 17.I. Rule VOD enrollment hết hạn (expiresAt)

- `Enrollment.expiresAt` (cho VOD): khi `now > expiresAt` → cập nhật `Enrollment.status = EXPIRED`; học viên mất quyền truy cập.
  - Job/cron chạy định kỳ hoặc check tại thời điểm truy cập.

#### 17.J. Rule late submission (Assignment)

- `ClassAssessment` có `deadline`; AssignmentSubmission nộp sau deadline:
  - Policy: `lateSubmissionPolicy` (enum: `REJECT`, `ACCEPT_PENALTY`, `ACCEPT_NO_PENALTY`).
  - Nếu `ACCEPT_PENALTY`: trừ X% điểm mỗi ngày muộn (lưu trong `settings.latePenaltyPercentPerDay`).

#### 17.K. Rule refund request (Ticket)

- Học viên yêu cầu refund → tạo Ticket (entity ngoài academy hoặc `RefundRequest`):
  - `RefundRequest`: enrollmentId, userId, reason, requestedAt, status (PENDING/APPROVED/REJECTED), processedAt, processedBy.
  - Staff/Admin approve → gọi Billing service refund; cập nhật `Enrollment.status = CANCELLED`.

#### 17.L. Notification triggers (tham chiếu)

- Thông báo nên gửi khi: lớp sắp khai giảng (X ngày trước), bài tập sắp đến hạn, có điểm mới, lớp bị hủy, offer từ waitlist.
  - Implementation: integration với Notification service (NATS event hoặc HTTP).

#### 17.M. Lịch nghỉ lễ (holiday / excluded dates)

- LIVE: một số ngày không học (Tết, lễ Nhật...).
  - Option 1: `LiveSchedule.excludedDates` (jsonb array of dates).
  - Option 2: Bảng `HolidayCalendar` (companyId, date, reason) – LiveSchedule skip các ngày trong calendar.
  - UI: Staff nhập danh sách ngày nghỉ khi tạo/sửa class.

---

### 18. Ghi chú frontend cho admin/staff – `academy` admin UI

Mục tiêu: xây dựng một bộ UI admin mới (cho `academy`) độc lập với các trang course cũ, phục vụ chủ yếu cho role **Admin**, **Staff-LMS**, **Lecturer**. Toàn bộ UI mới phải:

- Sử dụng **shadcn/ui** từ `@workspace/ui`.
- Không viết CSS custom ngoài các class tailwind cơ bản đã chuẩn hóa, không ghi đè style mặc định.
- Không reuse các trang course cũ trong web-admin; build trong một folder mới (ví dụ: `academy-admin`).

#### 18.1. Cấu trúc tính năng & folder gợi ý

- Trong web-admin:
  - Tạo một feature mới, ví dụ: `apps/web-admin/src/features/academy-admin` (hoặc tương đương theo convention hiện tại).
  - Bên trong chia nhỏ theo domain:
    - `course-profiles/`
    - `editions-syllabus/`
    - `classes/`
    - `offerings/`
    - `exams-question-bank/`
    - `enrollments-learners/`
    - `reports/`
  - Routing:
    - Gắn vào một root path mới, ví dụ: `/academy` trong admin.

#### 18.2. Role & permission (ở level UI)

- **Admin**
  - Toàn quyền trên tất cả module (`CourseProfile`, `CourseEdition`, `Chapter`, `Lesson`, `Class`, `Exam`, `Offering`, `Report`).
- **Staff-LMS (Academic staff)**
  - Tập trung vào:
    - Thiết kế chương trình: `CourseProfile`, `CourseEdition`, `Chapter`, `Lesson`, template quiz/assignment.
    - Tạo/sửa `Class` (VOD/LIVE), schedule, assessment mapping.
    - Quản lý enrollment thủ công (add/remove), theo dõi progress.
- **Lecturer**
  - Tập trung vào:
    - Xem danh sách `Class` mình dạy (filter theo teacherId).
    - Quản lý assessment trong class đó (deadline, grading).
    - Xem progress và kết quả exam/assignment của học viên trong class mình phụ trách.

UI cần đọc permission từ hệ thống role/permission hiện tại để:

- Ẩn menu không được phép truy cập.
- Disable action (button) nếu không có quyền (`create`, `update`, `delete`).

#### 18.3. Các màn hình chính cho admin/staff

1. **Dashboard `Academy` tổng quan**
   - Đối tượng: Admin, Staff-LMS.
   - Thành phần:
     - Thống kê số `CourseProfile`, `Class` đang mở, số learner active.
     - (Khi bật approval) Số item `PENDING_APPROVAL` (CourseEdition, Class, Offering) – link tới trang duyệt.
     - Biểu đồ đơn giản (dùng `Card`, `Tabs`, `Table` của shadcn/ui).

2. **Course Profiles**
   - Đường dẫn: `/academy/course-profiles`.
   - Chức năng:
     - List tất cả `CourseProfile` (search, filter theo subject, level).
     - CRUD (create/update/archive).
   - UI:
     - List view dùng `Table` + `Input` + `Select`.
     - Form dùng `Card` + `Field` components + `Tabs` (General / Metadata).

3. **Course Edition & Syllabus Builder**
   - Đường dẫn: `/academy/course-profiles/:id/editions`.
   - Chức năng:
     - Xem danh sách edition của một course profile.
     - Tạo draft edition mới từ current (hoặc clone từ edition khác).
     - Submit for approval / Publish edition (set `isCurrent`). Khi status = PENDING_APPROVAL: Admin thấy nút Approve/Reject.
     - Syllabus builder cho edition:
       - List `Chapter` (draggable order).
       - Bên trong chapter: list `ChapterItem` (lesson, quiz template, assignment template).
   - UI:
     - Layout hai cột:
       - Trái: list edition (dùng `Tabs` hoặc `Accordion`).
       - Phải: syllabus tree (dùng list + drag handle, `Card`).
     - Form edit chapter sử dụng `Sheet` hoặc `Dialog` với `Field`, `Input`, `Textarea`.

4. **Lessons & Content Library**
   - Đường dẫn: `/academy/lessons`.
   - Chức năng:
     - Tìm kiếm và quản lý `Lesson` (video, markdown, external link).
   - UI:
     - List view + filter theo subject/level.
     - Form chi tiết lesson dùng `Card` + `Tabs` (Content / Attachments / Metadata).

5. **Question Bank & Exams**
   - Đường dẫn: `/academy/exams` + `/academy/questions`.
   - Chức năng:
     - Quản lý bank câu hỏi (`Question`) và pool (nếu dùng).
     - Builder cho `Exam`:
       - Tab `Sections`: thêm/sửa `ExamSection` (title, timeLimit, instruction).
       - Tab `Questions`: gắn question (bao gồm group parent + subQuestions) vào từng section, sắp xếp order.
   - UI:
     - Dùng `Tabs` (`Overview`, `Sections`, `Questions`, `Preview`).
     - Dùng `Table` + `Command`/`Combobox` của shadcn để chọn question nhanh.

6. **Classes (VOD / LIVE)**
   - Đường dẫn: `/academy/classes`.
   - Chức năng:
     - List tất cả `Class` (filter theo mode, status, teacher, course). Duplicate class từ class có sẵn.
     - Tạo mới class:
       - Chọn `CourseProfile`, `CourseEdition`, `mode` (VOD hoặc LIVE).
       - Với VOD: form VodClass (enrollmentOpenAt, enrollmentCloseAt, maxStudents, defaultExpiresMonths).
       - Với LIVE: form LiveClass (term, batch, startDate, endDate, minStudents, maxStudents, primaryTeacherId – 1 giảng viên dạy chính xuyên suốt) + thêm LiveSchedule.
     - Xem chi tiết class:
       - Tab `Overview`: info cơ bản, subject, edition, stats.
       - Tab `Schedule`: danh sách LiveSchedule – chỉ hiển thị khi class mode = LIVE.
       - Tab `Attendance`: điểm danh theo LiveSchedule – **chỉ hiển thị khi class mode = LIVE** (VOD không có).
       - Tab `Assessment`: `ClassAssessment` (quiz/assignment instance).
       - Tab `Learners`: enrollment list + quick actions (add/remove).
       - Tab `Waitlist`: danh sách Waitlist (nếu lớp đủ maxStudents), action offer slot.
   - UI:
     - List view dùng `Table`.
     - Detail page dùng `Tabs` + `Card` + `Table`.

7. **Offerings (Products để bán)**
   - Đường dẫn: `/academy/offerings`.
   - Chức năng:
     - CRUD `CourseOffering`.
     - Map offering ↔ classes qua UI chọn nhiều `Class`.
   - UI:
     - Form `CourseOffering` dùng `Card` + form components.
     - Section chọn `Class` dùng `Table` dạng pick-list (2 cột: available classes / selected classes).

8. **Learners & Enrollments**
   - Đường dẫn: `/academy/enrollments`.
   - Chức năng:
     - Tìm kiếm learner theo email/name và xem danh sách class đã enroll.
     - Từ trang class detail tab `Learners`: xem danh sách enrollment của class đó.
   - UI:
     - Dùng `Table` + `Badge` cho status, `Button` cho action (drop-out, re-enroll).

9. **Reports**
   - Đường dẫn: `/academy/reports`.
   - Giai đoạn đầu có thể đơn giản:
     - Báo cáo enrollment theo course/class.
     - Tỷ lệ hoàn thành lesson (progress).
     - Kết quả exam/assignment tổng quan.
   - UI:
     - Dùng `Card`, `Table`, và nếu cần `Tabs` cho nhiều loại report.

#### 18.4. Cấu trúc điều hướng gợi ý (sidebar admin)

- `Academy`
  - `Dashboard` (khi bật approval: có widget Pending approval)
  - `Courses` (Course Profiles)
  - `Syllabus` (Edition & Chapters)
  - `Lessons`
  - `Exams & Questions`
  - `Classes`
  - `Offerings`
  - `Learners & Enrollments`
  - `Reports`

Permission sẽ quyết định mục nào hiển thị:

- Staff-LMS: thấy tất cả mục ở trên (trừ khi bị giới hạn bởi policy riêng).
- Lecturer: thấy `Classes`, `Learners & Enrollments`, và phần liên quan tới exam/assignment của class mình dạy.
- Admin: full access.

Toàn bộ layout nên dùng các component layout có sẵn (sidebar, topbar) và bên trong mỗi page dùng `Card`, `Tabs`, `Table`, `Form` của shadcn/ui, tránh CSS tự viết trừ các utility cơ bản đã dùng sẵn trong project.