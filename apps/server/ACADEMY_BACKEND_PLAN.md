---
title: Kế hoạch hoàn thiện nghiệp vụ backend Academy
description: Kế hoạch chi tiết để nâng backend Academy từ CRUD cơ bản lên full nghiệp vụ LMS (Content, Delivery, Assessment, Commerce) theo thiết kế trong core-lms.md
---

> File này **bổ sung cho** `core-lms.md`, tập trung vào **kế hoạch triển khai nghiệp vụ backend** (service logic, state machine, event flow, background job, validation rule), không bàn về UI.  
> **Rà soát với core-lms**: Logic schema và flow đã được review so với `core-lms.md`; chi tiết xem [ACADEMY_BACKEND_PLAN_REVIEW.md](./ACADEMY_BACKEND_PLAN_REVIEW.md).

## 1. Phạm vi & mục tiêu

- **Phạm vi**: microservice `academy` (NestJS) + gateway module `AcademyModule`.
- **Mục tiêu**:
  - Hoàn thiện logic nghiệp vụ cho 4 layer:
    - **Content**: CourseProfile, CourseEdition, Chapter, ChapterItem, Lesson, QuizTemplate, AssignmentTemplate.
    - **Delivery/Classroom**: Class, ClassSchedule, ClassAssessment, Enrollment, LearningProgress.
    - **Assessment**: Question, Exam, ExamSection, ExamAttempt (+ ExamAttemptDetail), AssignmentSubmission.
    - **Commerce**: CourseOffering (+ CourseOfferingClass) – phần core này đã có CRUD & setClasses, sẽ bổ sung thêm rule.
  - Đảm bảo **state machine** rõ ràng cho:
    - `CourseEdition`, `Class`, `ClassAssessment`, `Exam`, `ExamAttempt`, `AssignmentSubmission`, `Enrollment`, `CourseOffering`.
  - Chuẩn hóa **event flow** để tích hợp với:
    - Identity (role/permission không bàn nhiều ở đây),
    - Payment/Order (tạo Enrollment từ Order),
    - Communication (Ticket, Notification),
    - Certificate (cấp chứng chỉ khi hoàn thành).
  - Chuẩn hóa **validation & invariant** tránh trạng thái “rác” (class enrolling khi edition draft, exam đã closed vẫn attempt, v.v.).

---

## 2. Content layer – Nâng từ CRUD lên “Syllabus engine”

### 2.1. CourseProfile

**Hiện tại**: CRUD đơn giản, không ràng buộc nhiều.

**Kế hoạch nghiệp vụ**:

- **Rule đặt tên & code**:
  - `code` immutable sau khi tạo (đang enforce qua DTO create vs update, cần double-check ở service).
  - Thêm validate pattern (tự nguyện, soft rule):
    - Ví dụ: `^[A-Z0-9_]+$`, độ dài 3–50.
- **Khóa xoá**:
  - Không cho `delete` nếu:
    - Tồn tại `CourseEdition` liên kết.
    - Tồn tại `Class` liên kết.
  - Thay vì xoá cứng, cho phép:
    - `archived` flag trên CourseProfile (nếu sau này cần), hiện tại có thể **block delete** và yêu cầu admin xoá dependent trước.
- **Use-case cần triển khai trong service**:
  1. `archiveProfile(profileId)`
     - Chuyển tất cả `CourseEdition` sang `ARCHIVED` (nếu đang `PUBLISHED`/`DRAFT`).
     - Chặn tạo `Class`/`CourseOffering` mới cho profile này.
  2. `cloneProfile(profileId, newCode, newTitle?)` (optional – phase sau)
     - Tạo CourseProfile mới sao chép metadata cơ bản, **không clone edition**.

### 2.2. CourseEdition

**Hiện tại**: CRUD + `setCurrent` đã có (gateway + handler).

**State machine đề xuất**:

- States: `DRAFT`, `PUBLISHED`, `ARCHIVED`.
- Transition hợp lệ:
  - `DRAFT -> PUBLISHED`
  - `PUBLISHED -> ARCHIVED`
  - `DRAFT -> ARCHIVED`
- `isCurrent = true` chỉ được set khi:
  - `status = PUBLISHED`.
  - Cùng `courseProfileId`.
  - Mỗi `CourseProfile` chỉ có **1 edition current**.

**Kế hoạch nghiệp vụ**:

- Service `CourseEditionService` bổ sung:
  1. `publishEdition(id)`:
     - Validate: không có Chapter/ChapterItem nào “sai chuẩn” (ví dụ orderIndex trùng, thiếu link reference).
     - Set `status = PUBLISHED`.
  2. `archiveEdition(id)`:
     - Chỉ cho phép nếu:
       - Không còn `Class` ở trạng thái `ENROLLING/IN_PROGRESS` trỏ vào edition đó.
     - Nếu `isCurrent = true` → un-set hoặc bắt buộc chọn edition khác làm current trước.
  3. `setCurrent(id)` (đã có):
     - Bổ sung rule: chỉ cho phép nếu `status = PUBLISHED`.
     - Transaction:
       - Unset `isCurrent` của tất cả edition cùng `courseProfileId`.
       - Set `isCurrent = true` cho bản được chọn.

### 2.3. Chapter & ChapterItem

**Hiện tại**: CRUD đầy đủ.

**Nghiệp vụ cần bổ sung**:

- **Reorder**:
  - API `reorderChapters(courseEditionId, orderedIds: string[])`:
    - Set `orderIndex` theo thứ tự mảng.
    - Validate:
      - Danh sách `orderedIds` phải chứa đúng **tập id** chapter của edition (hoặc subset) – tuỳ thiết kế.
  - API `reorderChapterItems(chapterId, orderedIds: string[])` tương tự.

- **Status propagation**:
  - Khi `CourseEdition` chuyển `PUBLISHED`, enforce:
    - Tất cả `Chapter.status` phải là `PUBLISHED` (theo core-lms §7.1 — không dùng trạng thái READY).
  - Option phase sau: cho phép publish từng Chapter độc lập (không bắt buộc).

- **Validation khi xoá**:
  - Không cho xoá `Chapter` nếu đang được tham chiếu bởi:
    - Không có constraint trực tiếp ngoài `ChapterItem`, nhưng về mặt nghiệp vụ:
      - Nếu class đã `IN_PROGRESS` dùng edition đó, có thể cấm xoá Chapter hoặc chỉ cho phép khi no active learners.

### 2.4. Lesson, QuizTemplate, AssignmentTemplate

**Hiện tại**: CRUD + DTO đã có (code đã implement).

**Kế hoạch nghiệp vụ**:

- **Lesson**:
  - Rule:
    - Một Lesson có thể được dùng ở nhiều ChapterItem, nhưng luôn cùng `courseProfileId`.
  - Service helper:
    - `validateLessonUsedInEdition(lessonId, courseEditionId)` – đảm bảo lesson thuộc đúng CourseProfile.
  - Soft-delete (phase sau) nếu nhiều class đã đang dùng.

- **QuizTemplate / AssignmentTemplate**:
  - Cho phép dùng chung nhiều ClassAssessment.
  - Cần service helper:
    - `getUsages(templateId)` – số lớp đang dùng template này (cho UI cảnh báo khi chỉnh sửa).
  - Khi cập nhật template:
    - Không thay đổi các `ExamAttempt` / `AssignmentSubmission` lịch sử (vì chúng link qua ClassAssessment hoặc snapshot).

---

## 3. Classroom layer – State machine cho Class & Enrollment

### 3.1. Class

**State machine**:

- States: `DRAFT`, `ENROLLING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`.
- Transition:
  - `DRAFT -> ENROLLING` (mở đăng ký).
  - `ENROLLING -> IN_PROGRESS` (khi tới ngày start hoặc được staff bật).
  - `IN_PROGRESS -> COMPLETED` (khi hết lịch / staff đóng).
  - `ENROLLING -> CANCELLED`, `IN_PROGRESS -> CANCELLED` (huỷ lớp).

**Kế hoạch nghiệp vụ**:

- Service `ClassService` bổ sung:
  1. `openEnrollment(classId)`:
     - Validate:
       - `status` hiện tại phải là `DRAFT`.
       - `CourseEdition.status = PUBLISHED`.
       - Theo **core-lms §15.2**: nếu `mode = LIVE` hoặc `BLENDED` → bắt buộc có `startDate` và ít nhất một `ClassSchedule`; nếu `mode = VOD` → không bắt buộc schedule, chỉ cần edition hợp lệ.
     - Set `status = ENROLLING`, `enrollmentOpenAt = now()` nếu chưa có.
  2. `startClass(classId)`:
     - From `ENROLLING -> IN_PROGRESS`.
     - Set `status = IN_PROGRESS`, `startDate = startDate || now()`.
  3. `completeClass(classId)`:
     - From `IN_PROGRESS -> COMPLETED`.
     - Check tất cả Exam/Assignment chính đã closed (optional soft rule).
  4. `cancelClass(classId, reason)`:
     - From `DRAFT/ENROLLING/IN_PROGRESS -> CANCELLED`.
     - Nếu có Enrollment ACTIVE:
       - Emit event để service Payment xử lý refund/compensation (tuỳ business).

- **Scheduling support** (phase sau, optional):
  - Cron job check:
    - `now >= startDate` & status `ENROLLING` → auto `IN_PROGRESS`.
    - `now >= endDate` & status `IN_PROGRESS` → auto `COMPLETED`.

### 3.2. ClassSchedule

**Nghiệp vụ**:

- Chỉ áp dụng cho `mode = LIVE` hoặc `BLENDED`.
- Rules:
  - `weekday` trong `[0..6]`.
  - `startTime < endTime`.
  - Không bắt buộc enforce “không trùng lịch” ngay, nhưng có thể:
    - Helper `detectConflicts(classId)` để UI hiển thị cảnh báo.

### 3.3. ClassAssessment

**Vai trò**: Instance của quiz/assignment per class để override setting.

**Nghiệp vụ chính**:

- States: `DRAFT`, `PUBLISHED`, `CLOSED`.
- Rule:
  - Chỉ khi `PUBLISHED` thì learner mới được attempt/submission.
  - Chỉ khi `CLOSED` mới không nhận attempt/submission mới.
- Service `ClassAssessmentService` bổ sung:
  1. `publishAssessment(id)`:
     - Validate:
       - Class `status` ∈ {`ENROLLING`, `IN_PROGRESS`}.
       - Template tồn tại.
     - Set `status = PUBLISHED`.
  2. `closeAssessment(id)`:
     - Set `status = CLOSED`.
  3. `updateOverrides(id, overrides)`:
     - Chỉ cho phép khi `status != CLOSED`.

### 3.4. Enrollment

**State machine**:

- States: `ACTIVE`, `COMPLETED`, `CANCELLED`, `EXPIRED`.

**Nguồn tạo Enrollment**:

1. **Tự ghi danh bởi staff**:
   - Handler `academy.enrollment.create` (đã có service).
   - Rule:
     - Không duplicate ACTIVE enrollment cho cùng `userId` + `classId`.
2. **Từ Order/Payment**:
   - Sự kiện từ service Payment/Order: `order.paid` với `offeringId`.
   - Logic:
     - Lấy danh sách `CourseOfferingClass` theo offering.
     - Tạo Enrollment cho mỗi `classId` nếu:
       - Class `status` != `CANCELLED`.
       - Nếu class là VOD: có thể ignore `enrollmentOpenAt/CloseAt` (tuỳ rule).
       - Nếu class LIVE: có thể chặn ENROLL nếu hết hạn đăng ký (optional).
   - Cần **NATS listener** trong `academy` hoặc xử lý via gateway.

**Transitions**:

- `ACTIVE -> COMPLETED`:
  - Khi learner đạt điều kiện hoàn thành:
    - Tỷ lệ Lesson completed ≥ threshold.
    - Hoặc pass kỳ thi chính.
  - Implement:
    - Background job hoặc khi update LearningProgress/ExamAttempt.
- `ACTIVE -> CANCELLED`:
  - Do staff huỷ.
  - Có thể phát event cho Payment để xử lý phụ trợ.
- `ACTIVE -> EXPIRED`:
  - Khi `expiresAt < now`.
  - Cron job quét và update định kỳ.

### 3.5. LearningProgress

**Logic**:

- API `upsertProgress(classId, userId, lessonId, status, progressPercent)`:
  - Nếu record chưa tồn tại → tạo.
  - Nếu đã tồn tại:
    - Không cho downgrade từ `COMPLETED` về `IN_PROGRESS` (chỉ nếu explicit).
  - Tự động:
    - Nếu `progressPercent = 100` → `status = COMPLETED`.
    - Nếu `progressPercent > 0 && < 100` → `status = IN_PROGRESS`.

- Background:
  - Khi update progress của nhiều lesson, có thể check và update:
    - `Enrollment.status = COMPLETED` khi đạt tiêu chí.

---

## 4. Assessment layer – Exam & Question engine

### 4.1. Question

**Hiện tại**: CRUD handler đã có theo DTO `question.dto.ts`.

**Nghiệp vụ**:

- Question có thể:
  - Thuộc `courseProfileId` (để gắn với chương trình).
  - Có loại (MCQ, multiple-select, true/false, essay, v.v.) – chi tiết trong schema.
- Rule:
  - Không cho xoá nếu đang được tham chiếu trong `ExamQuestion` hoặc `QuizTemplate`.
  - Sửa nội dung:
    - Cho phép, nhưng cần đánh dấu version nếu muốn audit (phase sau).

### 4.2. Exam & ExamSection

**Hiện tại**: Service + handler `exam.service.ts`, `exam.handler.ts` đã hỗ trợ CRUD (create với sections).

**State machine**:

- States: `DRAFT`, `PUBLISHED`, `ARCHIVED`.

**Nghiệp vụ**:

- `publishExam(id)`:
  - Validate:
    - Ít nhất 1 section.
    - Mỗi section có question mapping hợp lệ (ExamQuestion).
  - Set `status = PUBLISHED`.
- `archiveExam(id)`:
  - Không xoá attempt cũ, chỉ ngừng cho attempt mới.
- `scheduleExam` (phase sau, optional):
  - Cho phép set window `openAt`, `closeAt`.

### 4.3. ExamAttempt

**Hiện tại**:

- Handler đã có methods:
  - `start`, `saveAnswers`, `submit`, `findAll`, `findById`.

**State machine** (có thể map với core-lms §12.3):

- States (field `status` trong `ExamAttempt`): `PENDING`, `IN_PROGRESS`, `SUBMITTED`, `CANCELLED`.
- core-lms §12.3 dùng `IN_PROGRESS`, `SUBMITTED`, `COMPLETED`, `ABANDONED` — flow tương đương; CANCELLED ≈ ABANDONED, SUBMITTED/COMPLETED tùy implementation.

**Nghiệp vụ chi tiết theo flow**:

1. **Start** (`start(input: ExamAttemptStartDto)`)  
   - Input:
     - `userId`, `classAssessmentId` hoặc `examId` (tùy binding),
     - optional `resumeAttemptId` (nếu muốn resume).
   - Logic:
     - Kiểm tra learner có `Enrollment.ACTIVE` trong class tương ứng (nếu đi qua ClassAssessment).
     - Kiểm tra `ClassAssessment.status = PUBLISHED` **và** exam/quiz còn trong thời gian.
     - Kiểm tra số lần attempt không vượt `maxAttempts` (template hoặc override).
     - Tạo `ExamAttempt`:
       - Generate `ExamAttemptDetail` (snapshot câu hỏi, đáp án đúng, scoring rule).
       - Set `status = IN_PROGRESS`, `startedAt = now`, `deadlineAt = now + timeLimit`.

2. **Lưu bài làm tạm** (`saveAnswers(input: ExamAttemptSaveAnswersDto)`)  
   - Chỉ cho phép khi:
     - `status = IN_PROGRESS`.
     - `now < deadlineAt` (nếu có).
   - Cập nhật:
     - `ExamAttemptDetail` (câu trả lời learner).
     - `lastSavedAt`.

3. **Nộp bài** (`submit(input: ExamAttemptSubmitDto)`)  
   - Validate:
     - `status` ∈ {`IN_PROGRESS`, `PENDING`} – tuỳ initial.
   - Logic:
     - Tính điểm:
       - Với MCQ/true-false: auto grade.
       - Với essay: mark `needsManualGrading = true`.
     - Set:
       - `status = SUBMITTED`.
       - `score`, `passed` (so sánh với passingScore).
       - `submittedAt`.
   - Emit event:
     - `examAttempt.submitted` cho analytics / certificate / gamification (nếu dùng).

4. **Timeout & auto-submit** (background job – phase sau):
   - Cron job quét `ExamAttempt`:
     - `status = IN_PROGRESS` & `now > deadlineAt + gracePeriod`:
       - Auto `submit` với state hiện tại.

### 4.4. AssignmentSubmission

**Hiện tại**: CRUD handler đã có.

**State machine**:

- States: `DRAFT`, `SUBMITTED`, `GRADED`, `RETURNED`.

**Flow**:

1. Learner tạo submission (qua LMS khác, ở đây backend chỉ xử lý):
   - `create` → `status = DRAFT` hoặc `SUBMITTED` tùy input.
2. Khi learner ấn nộp:
   - `update` → `status = SUBMITTED`, lock không cho sửa file (trừ khi cho phép re-submit).
3. Lecturer chấm điểm:
   - Cập nhật `score`, `feedback`, `status = GRADED`.
4. (Optional) Khi feedback đã gửi cho learner:
   - `status = RETURNED`.

**Nghiệp vụ cần bổ sung**:

- Rule:
  - Không cho xoá submission nếu đã `GRADED` (trừ admin).
  - Có thể tạo nhiều submission per learner nếu `maxAttempts > 1`, cần:
    - Service helper `createOrReplaceLatestSubmission` theo policy.

---

## 5. Commerce layer – Enrollment từ Order & Offering lifecycle

### 5.1. CourseOffering

**Hiện tại**: CRUD + `setClasses` đã có.

**State machine** (bám core-lms §7.3):

- States: `DRAFT`, `ACTIVE`, `HIDDEN` (hoặc `ARCHIVED` trong Prisma — dùng cho "ẩn/ngừng bán").
- **ACTIVE** trong Plan = **PUBLISHED** trong core-lms — trạng thái "đang mở bán". Chỉ khi `status = ACTIVE` mới cho phép tạo Order từ offering này.

**Nghiệp vụ**:

- `activateOffering(id)`:
  - Validate:
    - Ít nhất 1 Class được link (bảng `CourseOfferingClass`).
    - Class không `CANCELLED`.
  - Set `status = ACTIVE`; có thể set `validFrom = now()` nếu dùng.
- `hideOffering(id)` / `archiveOffering(id)`:
  - Set `status = HIDDEN` (hoặc `ARCHIVED` nếu Prisma chỉ có enum này).
  - Không cho tạo Order mới từ offering này (gateway hoặc service order validate).

### 5.2. Order → Enrollment

Phần này nằm một phần trong service Payment/Order, nhưng `academy` cần contract rõ:

- Khi Order được thanh toán:
  - Gửi event: `order.paid` với payload:
    - `userId`, `offeringId`, `orderItemId`, …
  - `academy` subscribe event này và:
    - Tìm `CourseOfferingClass` theo `offeringId` (từ từng OrderItem).
    - Với mỗi `classId`:
      - **Chỉ tạo Enrollment nếu thỏa điều kiện enroll theo core-lms §8.3**:
        - `Class.status` ∈ {`ENROLLING`, `IN_PROGRESS`} (không enroll vào DRAFT/CANCELLED/COMPLETED).
        - Nếu Class có `enrollmentOpenAt`/`enrollmentCloseAt` thì `now` nằm trong khoảng đó (trừ policy "enroll muộn").
        - Nếu Class có `maxStudents` thì số Enrollment ACTIVE hiện tại < maxStudents.
        - Chưa tồn tại Enrollment **ACTIVE** cho `(userId, classId)` (tối đa 1 ACTIVE per cặp).
      - Ghi `sourceOfferingId`; (tùy chọn) ghi `sourceOrderId` nếu có field này để phục vụ refund sau này.
      - Nếu không thỏa (ví dụ class đã đủ slot): log lỗi / xử lý theo chính sách (waitlist, refund, thông báo staff), không tạo Enrollment.

- Khi Order bị refund toàn phần:
  - Event: `order.refunded`.
  - Policy:
    - Có thể `CANCELLED` Enrollment, hoặc chuyển `EXPIRED` tùy business.
    - Kế hoạch chi tiết có thể thêm sau, nhưng structure event phải sẵn.

---

## 6. Integration & event flow giữa services

### 6.1. Với Communication (Ticket, Notification)

- **Ticket**:
  - Hiện Ticket đã link với `classId` và `enrollmentId` (đã chỉnh theo schema mới).
  - Khi class `CANCELLED`:
    - Có thể emit event để tạo ticket tự động cho learner thông báo huỷ lớp (optional).

- **Notification**:
  - Event candidates:
    - `class.enrollment.opened` – gửi email/push staff.
    - `class.enrollment.started` hoặc `class.started` – nhắc học viên.
    - `examAttempt.submitted` – gửi kết quả/notification.

### 6.2. Với Certificate

- Khi `Enrollment.status` chuyển `COMPLETED`:
  - Emit event `enrollment.completed` chứa:
    - `userId`, `classId`, `courseProfileId`, `scoreSummary` (optional).
  - Service Certificate sẽ:
    - Tạo record certificate,
    - Render PDF (nếu đã có template).

---

## 7. Kế hoạch triển khai theo phase

### Phase 1 – Cứng hóa state machine & service API

1. **Cập nhật service lớp Content**:
   - `CourseEditionService`: thêm methods `publishEdition`, `archiveEdition`, tighten `setCurrent`.
   - `ChapterService`/`ChapterItemService`: thêm `reorder` APIs, tighten delete rule.
2. **Cập nhật service lớp Classroom**:
   - `ClassService`: `openEnrollment`, `startClass`, `completeClass`, `cancelClass`.
   - `ClassAssessmentService`: `publishAssessment`, `closeAssessment`, `updateOverrides`.
   - `EnrollmentService`: enforce state & uniqueness.
3. **Assessment**:
   - Đảm bảo `ExamAttemptService` có đủ guard theo state/time limit.
   - Thêm helper auto grading trong `submit`.

### Phase 2 – Event & background jobs

1. Implement cron jobs trong `academy`:
   - Auto move Class `ENROLLING -> IN_PROGRESS -> COMPLETED`.
   - Auto expire Enrollments (`EXPIRED`).
   - Auto submit ExamAttempt hết hạn.
2. Implement NATS listener (hoặc gateway integration) cho:
   - `order.paid`, `order.refunded` → Enrollment.
   - `enrollment.completed` → Certificate.

### Phase 3 – Hardening & monitoring

1. **Audit & logging**:
   - Ghi audit cho thay đổi state quan trọng (publish/close/cancel).
2. **Metrics**:
   - Số lớp đang `ENROLLING`, `IN_PROGRESS`.
   - ExamAttempt pass rate, assignment submission rate.
3. **Test**:
   - Viết test unit/integration cho:
     - State machine (Class, CourseEdition, Assessment).
     - `start/saveAnswers/submit` exam.
     - Enrollment creation từ Order event.

---

## 8. Checklist công việc còn thiếu (backend)

- [ ] **Content**:
  - [ ] Thêm method publish/archive edition + tighten `setCurrent`.
  - [ ] Thêm API reorder Chapters/ChapterItems.
- [ ] **Classroom**:
  - [ ] Thêm state machine methods cho `ClassService`.
  - [ ] Thêm publish/close cho `ClassAssessmentService`.
  - [ ] Ràng buộc Enrollment uniqueness + state transitions.
- [ ] **Assessment**:
  - [ ] Ràng buộc Question không bị xoá khi được dùng.
  - [ ] Thêm state machine cho Exam (publish/archive).
  - [ ] Hoàn thiện logic `ExamAttemptService` (limit attempts, time limit, grading).
  - [ ] Thêm rule cho AssignmentSubmission (re-submit policy, grading).
- [ ] **Commerce & integration**:
  - [ ] Thêm activate/hide cho CourseOffering.
  - [ ] Implement listener `order.paid` → tạo Enrollments.
- [ ] **Background jobs**:
  - [ ] Cron cho Class auto state transition.
  - [ ] Cron cho Enrollment expire.
  - [ ] Cron cho ExamAttempt timeout auto-submit.
- [ ] **Testing**:
  - [ ] Viết test theo các scenario đã mô tả ở `core-lms.md` + file này.

---

## 9. End-to-end business flows (chi tiết theo vai trò)

> Mục tiêu phần này: gom lại toàn bộ nghiệp vụ e-learning đã thảo luận (JLPT/IELTS, VOD + LIVE, bundle, staff/lecturer/learner) thành **các flow cụ thể GIVEN/WHEN/THEN** để khi implement có thể kiểm từng bước.

### 9.1. Flow: Academic staff dựng chương trình JLPT từ zero

**Goal**: Tạo đủ data Content + Delivery + Commerce cho case: 5 khóa JLPT (N5..N1), mỗi N có:
- 1 lớp VOD chính (self-paced),
- 3 lớp LIVE mỗi năm (Spring, Summer, Fall),
- Các gói bán: VOD only, LIVE only, LIVE+VOD bundle.

#### 9.1.1. Dựng Content (CourseProfile + CourseEdition + Syllabus)

- GIVEN: Không có course JLPT trong hệ thống.
- WHEN:
  1. Staff tạo `CourseProfile`:
     - `code = 'JP_N5'`, `title = 'JLPT N5'`.
  2. Staff tạo `CourseEdition` v1 cho N5:
     - `courseProfileId = JP_N5`, `editionTag = 'v1'`, `status = DRAFT`, `isCurrent = false`.
  3. Staff tạo các `Chapter`:
     - `orderIndex` lần lượt: 1: "Ngữ âm & chữ cái", 2: "Ngữ pháp cơ bản", ...
  4. Staff tạo `Lesson`, `QuizTemplate`, `AssignmentTemplate` cho từng nội dung.
  5. Staff tạo các `ChapterItem`, gắn từng lesson/quiz/assignment vào chapter.
  6. Staff review, sau đó gọi `publishEdition(JP_N5_v1)`:
     - `status = PUBLISHED`, `isCurrent = true`.
- THEN:
  - `CourseEdition.status = PUBLISHED`.
  - Không class nào có thể trỏ vào edition khác chưa publish.

**Edge cases**:
- Nếu staff chỉnh sửa syllabus sau khi đã có class:
  - Thay đổi nhỏ (sửa title Chapter, không đổi cấu trúc) → cho phép update inline.
  - Thay đổi lớn (thêm/bớt Chapter/Item quan trọng) → khuyến nghị:
    - Clone edition: `v2` từ snapshot (phase sau), set `isCurrent` cho lớp mở mới.

#### 9.1.2. Dựng lớp VOD & LIVE cho N5

- GIVEN: `CourseProfile JP_N5`, `CourseEdition JP_N5_v1 (PUBLISHED)`.
- WHEN (VOD):
  1. Staff tạo `Class`:
     - `code = 'JP_N5_VOD_MAIN_2026'`
     - `mode = VOD`
     - `courseProfileId = JP_N5`, `courseEditionId = JP_N5_v1`
     - `status = ENROLLING` (hoặc `IN_PROGRESS` ngay nếu self-paced).
  2. Không tạo `ClassSchedule` (VOD không cần).
- WHEN (LIVE):
  1. Staff tạo 3 `Class`:
     - `JP_N5_LIVE_SPRING_2026`: `mode = LIVE`, `term = 'Spring 2026'`, `startDate`, `endDate`, `status = DRAFT`.
     - `JP_N5_LIVE_SUMMER_2026`, `JP_N5_LIVE_FALL_2026` tương tự.
  2. Staff tạo `ClassSchedule` cho từng lớp:
     - Ví dụ: Thứ 3 & 5, 19:00–21:00 JST.
  3. Staff gọi `openEnrollment(classId)` để chuyển `DRAFT -> ENROLLING`.
- THEN:
  - Với VOD: learner có thể được enroll ngay khi class `ENROLLING` hoặc `IN_PROGRESS`.
  - Với LIVE: chỉ `ENROLLING` khi có `startDate` & ít nhất 1 schedule (rule trong service).

#### 9.1.3. Tạo Offering & auto-enroll từ Order

- GIVEN: Các lớp N5 đã tồn tại (VOD + các LIVE).
- WHEN:
  1. Staff tạo `CourseOffering`:
     - `JP_N5_VOD_2026`: link 1 class → `JP_N5_VOD_MAIN_2026`.
     - `JP_N5_LIVE_SPRING_2026`: link 1 class → `JP_N5_LIVE_SPRING_2026`.
     - `JP_N5_LIVE_SPRING_2026_BUNDLE`: link 2 class → LIVE Spring + VOD main.
  2. Payment service tạo Order và khi đơn hàng `PAID`:
     - Emit event `order.paid` với `offeringId`.
  3. `academy` listener:
     - Lấy `CourseOfferingClass` theo `offeringId`.
     - Cho mỗi `classId`:
       - Nếu chưa có Enrollment ACTIVE cho `(userId, classId)` → tạo mới.
       - Set `sourceOfferingId`.
- THEN:
  - Learner vào `My Courses` sẽ thấy 1 hoặc nhiều class tương ứng với offering đã mua.

**Edge cases**:
- Nếu class `CANCELLED` sau khi đã có Enrollment do order:
  - Policy A: staff chuyển Enrollment về `CANCELLED`, Payment service xử lý refund.
  - Policy B: chuyển Enrollment sang class khác (cùng profile/edition), cần thêm endpoint `moveEnrollment`.

### 9.2. Flow: Học viên tham gia VOD-only course

- GIVEN:
  - Class `JP_N5_VOD_MAIN_2026` với `mode = VOD`, `status = ENROLLING/IN_PROGRESS`.
  - Learner có `Enrollment.ACTIVE`.
- WHEN:
  1. Learner vào trang Class:
     - API fetch:
       - Syllabus từ `CourseEdition` (Chapter + ChapterItem).
       - Progress từ `LearningProgress` per lesson.
  2. Learner mở 1 Lesson:
     - Backend:
       - `upsertProgress` với `status = IN_PROGRESS`, `progressPercent` tăng dần.
  3. Learner hoàn thành toàn bộ Lesson chính & pass các Quiz/Exam yêu cầu:
     - Background job hoặc khi submit last exam:
       - Check completion rule:
         - Ví dụ: ≥ 80% lesson completed + pass final exam.
       - Set `Enrollment.status = COMPLETED`.
       - Emit event `enrollment.completed`.
- THEN:
  - Certificate service có thể cấp chứng chỉ:
    - Ghi nhận `courseProfileId = JP_N5`, `level = N5`, score summary.

### 9.3. Flow: Lớp LIVE với attendance & recording (tương lai)

> Phần này chưa code, nhưng plan backend cần tính trước.

- GIVEN:
  - `Class.mode = LIVE`, có `ClassSchedule`.
- WHEN:
  1. Mỗi buổi học, hệ thống meeting (Livekit/Zoom) gửi event `liveSession.ended`:
     - Bao gồm `classId`, `scheduleId`, `participant userIds`, `recordingUrl` (optional).
  2. `academy` có thể:
     - Lưu attendance vào bảng riêng (hoặc reuse `Attendance` model trong schema tổng).
     - Lưu `recordingUrl` vào Lesson/metadata nếu quy ước “mỗi buổi là 1 lesson VOD”.
- THEN:
  - Staff có thể xem “Ai vắng mặt buổi nào”, “Replay link” trong Class detail.

---

## 10. Edge cases & invariants bắt buộc

> Tổng hợp các rule “không được phá” để tránh data rác / logic sai.

### 10.1. Content

- Không được:
  - Xoá `CourseProfile` nếu tồn tại:
    - `CourseEdition`, `Class`, `Enrollment`, `CourseOffering` trỏ tới.
  - Xoá `CourseEdition` nếu tồn tại:
    - `Class` đang `ENROLLING/IN_PROGRESS` trỏ tới.
  - Xoá `Chapter` nếu:
    - `CourseEdition.status = PUBLISHED` **và** có class IN_PROGRESS dựa trên edition đó.
- Invariant:
  - Mỗi `CourseProfile` tối đa **1** `CourseEdition.isCurrent = true`.
  - Mọi `ChapterItem.referenceId` phải trỏ tới entity có `courseProfileId` cùng với edition.

### 10.2. Class & Enrollment

- Không được:
  - Đổi `courseEditionId` của Class sau khi có Enrollment ACTIVE (trừ khi migration đặc biệt).
  - Downgrade `Class.status` (ví dụ `IN_PROGRESS` về `ENROLLING`) trừ admin với flag đặc biệt.
  - Tạo 2 Enrollment ACTIVE cho cùng `(classId, userId)`.
- Invariant:
  - `Enrollment.status = COMPLETED` **chỉ** khi đã thỏa điều kiện hoàn thành (rule central).
  - `Enrollment.status = EXPIRED` **chỉ** khi `expiresAt < now`.

### 10.3. Assessment

- Không được:
  - Xoá `Question` nếu nó đang tồn tại trong `ExamQuestion`.
  - Xoá `Exam` nếu tồn tại `ExamAttempt` trỏ tới (chỉ được ARCHIVE).
  - Chỉnh sửa cấu trúc Exam (thêm/bớt section hoặc group) sau khi đã có attempt:
    - Phase đầu: chặn sửa; chỉ cho đổi `status` hoặc metadata.
- Invariant:
  - `ExamAttempt.status = SUBMITTED`/`COMPLETED` → không cho saveAnswers nữa.
  - `ExamAttempt.deadlineAt` luôn >= `startedAt` (nếu có time limit).

### 10.4. Commerce

- Không được:
  - Set `CourseOffering.status = ACTIVE` nếu không có `CourseOfferingClass`.
  - Liên kết Offering với Class `CANCELLED`.
- Invariant:
  - Khi nhận `order.paid` cho `offeringId`:
    - Mọi class được enrol phải có `status ∈ {ENROLLING, IN_PROGRESS}` (trừ chính sách cho phép enroll muộn).

---

## 11. Mapping sang test scenario (GIVEN/WHEN/THEN)

> Gợi ý để khi viết test backend có thể bám theo.

- **Scenario A – Publish edition với syllabus lỗi**:
  - GIVEN: `CourseEdition` DRAFT, có 2 chapter, trong đó 1 chapter có 2 item với cùng `orderIndex = 1`.
  - WHEN: gọi `publishEdition`.
  - THEN: service throw error `INVALID_SYLLABUS_ORDER`, không đổi status.

- **Scenario B – Enroll quá maxStudents**:
  - GIVEN: Class `maxStudents = 30`, đã có 30 Enrollment ACTIVE.
  - WHEN: event `order.paid` tới cho offering link class đó.
  - THEN: EnrollmentService từ chối tạo Enrollment mới, log lỗi để staff xử lý (hoặc queue waitlist – phase sau).

- **Scenario C – Attempt exam sau giờ đóng**:
  - GIVEN: `ClassAssessment.deadline` đã qua, `Exam` `PUBLISHED`.
  - WHEN: learner gọi `startExamAttempt`.
  - THEN: service trả lỗi `ASSESSMENT_CLOSED`, không tạo attempt.

- **Scenario D – Auto complete enrollment**:
  - GIVEN: learner đã `COMPLETED` tất cả lessons + pass final exam.
  - WHEN: background job nightly chạy:
    - Query all Enrollment ACTIVE.
    - Check rule:
      - progressPercent ≥ threshold & examPassed.
  - THEN: set `Enrollment.status = COMPLETED`, emit `enrollment.completed`.

Các scenario kiểu này nên được thêm dần vào test file tương ứng:

- `academy-content.e2e-spec.ts`
- `academy-classroom.e2e-spec.ts`
- `academy-assessment.e2e-spec.ts`
- `academy-commerce.e2e-spec.ts`

---

## 12. Billing & Commerce Transition

> Chi tiết kỹ thuật xem tại [ACADEMY_BILLING_SPEC.md](./ACADEMY_BILLING_SPEC.md).

### 12.1. Chiến lược Merge vào Academy
- Thay thế hoàn toàn service `billing` cũ bằng `CommerceModule` nằm trong `academy` service.
- **Lý do**:
  - Đảm bảo tính toàn vẹn dữ liệu (transactional integrity) giữa `Order` và `Enrollment`.
  - Giảm độ phức tạp khi vận hành (bớt 1 microservice).
  - Phù hợp với kiến trúc "Academy Monolith" mới.

### 12.2. Các bước thực hiện
1. **Schema Migration**:
   - Thêm bảng `CourseOffering`, `Order`, `Coupon`, `Transaction` vào schema của Academy.
   - Xóa bỏ các bảng cũ liên quan đến billing trong schema (hoặc ignore).
2. **Code Migration**:
   - Port logic `PayOS` service từ `billing` sang `academy/modules/commerce`.
   - Viết lại logic `OrderService` và `CouponService` theo spec mới.
3. **Deprecation**:
   - Xóa code trong `apps/server/services/billing`.
   - Update `package.json` để remove script `start:billing`.
   - Redirect traffic gateway từ `/billing/*` sang `/academy/commerce/*`.
