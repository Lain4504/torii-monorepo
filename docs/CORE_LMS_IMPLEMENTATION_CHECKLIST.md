# Checklist triển khai Core LMS (core-lms.md) – Phiên bản vận hành 100%

Tài liệu này là checklist và kế hoạch triển khai đầy đủ backend + frontend theo spec [core-lms.md](../apps/server/core-lms.md) và [ACADEMY_WEB_ADMIN_UI_SPEC.md](./ACADEMY_WEB_ADMIN_UI_SPEC.md).

---

## 1. Tình hình hiện tại (tóm tắt)

### Đã có

- **Schema Prisma:** Đa số model Content/Delivery/Commerce/Assessment đã có: CourseProfile, CourseEdition, Chapter, ChapterItem, Lesson, QuizTemplate, AssignmentTemplate, Class, VodClass, LiveClass, LiveSchedule, ClassAssessment, Enrollment, LearningProgress, Exam, ExamSection, Question, ExamQuestion, ExamAttempt, ExamAttemptSectionState, ExamAttemptDetail, QuestionPool, PoolQuestion, ClassAttendance, Certificate, CourseOffering, CourseOfferingClass, AssignmentSubmission. Có trường approval (submittedForApprovalAt, approvedBy, …) cho Edition, Class, Offering. Có `minStudentsEnforcement` trên LiveClass.

- **Academy service (NATS):** Content (profile, edition, chapter, chapter-item, lesson, quiz-template, assignment-template), Classroom (class, live-schedule, enrollment, learning-progress, class-assessment, class-attendance, certificate, class-review), Commerce (course-offering, order, coupon), Assessment (exam, exam-attempt, question, assignment-submission). Có duplicate class. Order listener tạo enrollment khi order paid. Cron: chuyển trạng thái class (DRAFT→ENROLLING→IN_PROGRESS→COMPLETED), expiration enrollment (expiresAt → EXPIRED).

- **Gateway:** Controller REST → NATS cho: course-profile, course-edition, chapter, chapter-item, lesson, quiz-template, assignment-template, class, live-schedule, class-assessment, enrollment, order, exam, exam-attempt, assignment-submission, learning-progress, class-review, study-note, placement, live-session, class-attendance, blog, ticket. **Không có** controller cho **question-pools** (academy có handler HTTP nhưng service chạy NATS-only → cần gateway proxy + message pattern).

- **Web-admin:** Có route/trang cho dashboard, course-profiles, editions, chapters, classes, offerings, enrollments, lessons, quiz-templates, assignment-templates, exams, questions, question-pools, reports. Dashboard stats đang hardcode "--". Có form và list cơ bản cho hầu hết resource.

- **Web-learner:** Có my-courses, dashboard, course learn (curriculum, lesson, quiz, assignment), API academy.

### Chưa có / thiếu so với spec

- **Schema:** Waitlist, RefundPolicy, RefundRequest. ClassAssessment chưa có lateSubmissionPolicy (và latePenaltyPercentPerDay trong settings).

- **Backend:** Cron minStudents (LIVE: sau enrollmentCloseAt nếu < minStudents → cancel/notify). Logic hủy lớp có enrollment (17.A) rõ ràng. Clone edition (POST /editions/:id/clone). **Khóa chỉnh sửa syllabus khi edition đã PUBLISHED**. Waitlist (model + service + API). RefundPolicy / RefundRequest (model + service + API). Late submission cho assignment. **Offering publish validation (class hợp lệ + edition published) và fulfillment không bypass enrollment rule**. Gateway: Question Pools (proxy NATS + pattern academy).

- **Frontend admin:** Dashboard số liệu thật (profiles, classes, enrollments). Tab Waitlist + offer slot. Refund (policy + request). Permission ẩn menu theo role (Lecturer vs Staff). Kiểm tra form/filter/validation khớp DTO.

- **Frontend learner:** Đảm bảo catalog và mua khóa dùng Offering + Order; flow payment success/cancel ổn.

- **Optional:** requireApprovalForPublish (config ON/OFF), notification (lớp sắp khai giảng, bài tập đến hạn, …).

---

## 2. Ước lượng tổng thời gian

**28–35 ngày làm việc** (1 dev full-time).

Giả định: 1 developer, đã quen codebase, làm tuần tự; không tính QA chuyên biệt hay deploy infra. Nếu làm song song backend + frontend có thể rút còn **22–28 ngày**.

---

## 3. Chi tiết từng ngày (theo phase)

### Phase 1: Schema & backend nền (5–6 ngày)

| Ngày | Công việc |
|------|------------|
| **Ngày 1** | **Schema & migration:** Thêm model `Waitlist` (classId, userId, joinedAt, status: WAITING/OFFERED/ENROLLED/EXPIRED). Thêm `RefundPolicy` (companyId?, name, conditions jsonb, isDefault). Thêm `RefundRequest` (enrollmentId, userId, reason, requestedAt, status, processedAt, processedBy). Thêm vào `ClassAssessment`: `lateSubmissionPolicy` (enum), `settings.latePenaltyPercentPerDay` (hoặc chỉ dùng settings jsonb). Chạy `prisma migrate dev`, kiểm tra quan hệ và index. |
| **Ngày 2** | **Waitlist backend:** Service + handler (NATS message pattern) trong academy: join waitlist, list by class, offer slot (chuyển WAITING→OFFERED, tạo Enrollment khi user accept). Gateway: thêm `QuestionPoolController` proxy NATS (list, get, create, update, delete, pool questions, sample) và đăng ký pattern tương ứng trong academy question-pool (đổi handler từ HTTP sang `@MessagePattern` nếu hiện đang dùng @Get/@Post). Test API question-pools từ gateway. |
| **Ngày 3** | **RefundPolicy & RefundRequest backend:** Service + handler (CRUD RefundPolicy; tạo/yêu cầu RefundRequest, approve/reject bởi staff). Rule: approve → cập nhật Enrollment (status CANCELLED hoặc theo policy), gọi Billing/refund nếu có. Gateway controller cho refund (policy + request). **Offering governance:** khi publish/approve offering phải validate classIds không rỗng, class status hợp lệ để bán, edition của class đã `PUBLISHED`; quy định mutate offering đã publish theo re-approval hoặc clone. |
| **Ngày 4** | **ClassAssessment late submission:** Trong assignment-submission service: khi nộp bài kiểm tra `submittedAt` > `ClassAssessment.deadline` → áp dụng `lateSubmissionPolicy` (REJECT / ACCEPT_PENALTY / ACCEPT_NO_PENALTY), nếu ACCEPT_PENALTY thì tính trừ điểm theo `settings.latePenaltyPercentPerDay`. Cập nhật DTO và validation. **Edition immutable sau publish:** chặn update chapter/chapter-item và update syllabus của `CourseEdition` khi `status = PUBLISHED`; chỉ cho clone. **Clone edition:** `POST /editions/:id/clone` → tạo CourseEdition mới (DRAFT), copy Chapter + ChapterItem (referenceId giữ nguyên), không copy Lesson/QuizTemplate. Gateway expose clone edition. |
| **Ngày 5** | **Cron minStudents (LIVE):** Trong classroom-cron: sau `enrollmentCloseAt`, nếu class LIVE và `currentActiveEnrollments < LiveClass.minStudents`: theo `minStudentsEnforcement` (STRICT → set Class CANCELLED; NOTIFY → log/event; DISABLED → bỏ qua). Cập nhật enrollment status khi cancel. **Rule hủy lớp (17.A):** Khi Class → CANCELLED: nếu có enrollment ACTIVE thì chỉ cho phép theo policy (ví dụ chỉ Admin), cập nhật Enrollment status CANCELLED, trigger refund/notification nếu cần (integration RefundRequest hoặc event). |
| **Ngày 6** | **Certificate:** Logic issue certificate (khi enrollment completed hoặc theo rule nghiệp vụ). API list/get certificate cho user/class. **Approval config (optional):** Biến config `requireApprovalForPublish` (env hoặc DB): khi ON thì CourseEdition/Class/Offering chỉ publish sau approve; khi OFF staff publish trực tiếp. Đọc config trong service và giữ nguyên luồng submit/approve/reject đã có. |

### Phase 2: Gateway & API hoàn thiện (2–3 ngày)

| Ngày | Công việc |
|------|------------|
| **Ngày 7** | **Gateway:** Đảm bảo mọi resource academy đều có controller tương ứng (course-profile, edition, chapter, chapter-item, lesson, quiz-template, assignment-template, class, live-schedule, class-assessment, enrollment, order, exam, exam-attempt, assignment-submission, learning-progress, class-review, **question-pool**, class-attendance, placement, live-session, ticket, blog). Kiểm tra permission (`academy.content.read/write`, `academy.delivery.*`, `academy.commerce.*`) và role Lecturer (filter class theo primaryTeacherId). Thêm endpoint waitlist, refund policy, refund request nếu chưa có. |
| **Ngày 8** | **API consistency:** So sánh DTO trong `@workspace/schemas` với Prisma model và handler: CourseOffering (price/originalPrice, salesStartAt/salesEndAt vs validFrom/validTo), CourseEdition status enum, Class status enum. Chuẩn hóa query param (filter, pagination) cho list API. Test E2E các luồng: tạo profile → edition → chapter → chapter-item → lesson/template; tạo class VOD/LIVE → schedule (LIVE) → assessment; tạo offering → set classes → order → payment → enrollment. Xác nhận order fulfillment không bypass rule enrollment (status/window/maxStudents). |

### Phase 3: Web-admin UI (10–12 ngày)

| Ngày | Công việc |
|------|------------|
| **Ngày 9** | **Dashboard:** Thay "--" bằng API thật: tổng CourseProfile, Class đang mở (ENROLLING/IN_PROGRESS), tổng enrollment active. Giữ widget “Chờ phê duyệt” (edition, class, offering). Có thể thêm chart đơn giản (theo spec: Card, Table). |
| **Ngày 10** | **Course Profile & Edition:** List/filter (subject, level), CRUD form khớp DTO. Detail profile → tab Editions. Edition detail: chapters + chapter items (syllabus builder), drag order nếu cần. Actions: set-current, submit-for-approval, approve, reject (theo quyền). Clone edition: nút + form (editionTag mới). Với edition `PUBLISHED`: UI read-only + disable mọi action edit syllabus. |
| **Ngày 11** | **Chapter & Chapter Item:** Trong edition detail: CRUD chapter (orderIndex, estimatedMinutes, status). Chapter items: thêm item chọn kind (LESSON, QUIZ_TEMPLATE, ASSIGNMENT_TEMPLATE) + referenceId (load Lesson/Template theo courseProfileId). Form và validation zod theo DTO. |
| **Ngày 12** | **Lesson, QuizTemplate, AssignmentTemplate:** List theo courseProfileId, CRUD. Quiz template form có chọn Question Pool (questionPoolId). Assignment template: defaultType (TEXT/FILE/BOTH), defaultMaxScore, rubric. Đảm bảo filter và breadcrumb rõ ràng. |
| **Ngày 13** | **Class:** List filter (mode, status, courseProfileId). Form tạo class **tách VOD vs LIVE** (chung profile, edition, code, name, mode; VOD: enrollmentOpenAt/CloseAt, maxStudents, defaultExpiresMonths; LIVE: term, batch, startDate, endDate, minStudents, maxStudents, minStudentsEnforcement, primaryTeacherId, enrollmentOpenAt/CloseAt). Duplicate class: nút + form (term, batch, startDate, endDate, code, name). Class detail: tab Overview (VOD/LIVE block), **Schedule** (chỉ LIVE), **Assessment**, **Learners**, **Waitlist**, **Attendance** (chỉ LIVE). |
| **Ngày 14** | **Class detail (tiếp):** Tab Learners: table enrollment, thêm/xóa/sửa status. Tab **Waitlist:** table waitlist, action “Offer slot” (chuyển OFFERED hoặc tạo enrollment). Tab **Attendance** (LIVE): theo LiveSchedule, ghi nhận PRESENT/ABSENT/LATE/EXCUSED. Tab Assessment: list ClassAssessment, thêm/sửa (template, deadline, weight, override), với **lateSubmissionPolicy** và latePenalty trong form. |
| **Ngày 15** | **Enrollment & Offerings:** Trang enrollments (filter classId, userId, status), CRUD. Offerings: list, CRUD, **map classIds** (pick-list: available classes / selected classes). Form offering khớp DTO (code, title, originalPrice, currency, status, validFrom/validTo, classIds). UI phải thể hiện rule publish validation và cảnh báo/re-approval khi sửa offering đã `PUBLISHED`. |
| **Ngày 16** | **Question Pool & Question:** Question pools list/detail: CRUD pool, trong detail: add/remove questions (multi-select), sample (nếu API có). Questions list (filter type, level, category), CRUD, “Add to pool”. Form question: content, questionType, options, correctAnswer, explanation, parentId (group). Kiểm tra permission: ẩn “Course Profiles”, “Offerings”, “Question Pools” cho Lecturer; Lecturer chỉ thấy Classes (filter primaryTeacherId). |
| **Ngày 17** | **Refund & Reports:** Trang RefundPolicy (list, CRUD conditions). Trang RefundRequest (list, filter status), action approve/reject. Reports: trang đơn giản (enrollment theo course/class, tỷ lệ hoàn thành lesson, kết quả exam/assignment) dùng Card + Table. |
| **Ngày 18** | **Admin UI polish:** Permission: ẩn menu/button theo `academy.content.write`, `academy.delivery.write`, `academy.delivery.approve`, `academy.commerce.*`. Không hardcode option (subject, level, status): dùng constant/enum từ schema hoặc API. Form validate zod trùng với DTO backend. AlertDialog cho hành động xóa hoặc chuyển trạng thái quan trọng (publish, cancel class). |
| **Ngày 19–20** | **Testing & fix admin:** Click-through toàn bộ luồng Staff: profile → edition → chapter → items → lesson/template; class VOD/LIVE → schedule → assessment → enrollment; offering → set classes. Luồng Lecturer: chỉ class mình dạy, assessment, learners, attendance. Sửa lỗi hiển thị, submit form, lỗi API. |

### Phase 4: Web-learner (4–5 ngày)

| Ngày | Công việc |
|------|------------|
| **Ngày 21** | **Catalog & mua khóa:** Trang “Khóa học”/catalog lấy từ **CourseOffering** (published), hiển thị title, price, classes gắn kèm. Chi tiết offering → nút “Mua” → checkout (order preview, coupon nếu có) → PayOS (hoặc gateway thanh toán). |
| **Ngày 22** | **Payment & enrollment:** Sau thanh toán thành công (webhook/redirect): redirect đến “My Courses” hoặc trang success; kiểm tra enrollment đã tạo (order listener). Trang cancel/error. Kiểm tra enrollment expiresAt (VOD) và thông báo sắp hết hạn (nếu có). |
| **Ngày 23** | **My Courses & curriculum:** “My Courses” đã có; đảm bảo data từ Enrollment + Class + CourseEdition, progress đúng. Vào học: `/dashboard/courses/:classId` hoặc `/courses/:classId/learn`: curriculum từ Class → CourseEdition → Chapter → ChapterItem; sidebar đúng, bài lesson/quiz/assignment mở đúng, progress cập nhật. |
| **Ngày 24** | **Learner assessment & progress:** Trong course learn: quiz (start attempt, autosave draft, submit, xem điểm); assignment (nộp text/file, xem deadline, late submission bị từ chối hoặc trừ điểm theo policy). Learning progress: completed lesson/quiz/assignment cập nhật đúng; certificate (nếu có) hiển thị sau khi hoàn thành. |
| **Ngày 25** | **Learner polish:** Live class: hiển thị schedule, link phòng (roomId) nếu có. Điểm danh (nếu learner cần xem trạng thái). Trial class (nếu làm theo spec 17.F). Fix lỗi UI/API và test E2E luồng học viên: đăng ký → mua → vào lớp → học bài → nộp bài → xem điểm/certificate. |

### Phase 5: Tích hợp & vận hành (3–5 ngày)

| Ngày | Công việc |
|------|------------|
| **Ngày 26** | **Order & enrollment E2E:** Kiểm tra order flow: preview → checkout → payment → webhook paid → order status PAID → order listener tạo enrollment cho từng class trong offering. Rollback: order refund/cancel → revoke enrollment (đã có trong order.listener). RefundRequest approve → gọi refund (Billing) + cập nhật enrollment. |
| **Ngày 27** | **State machine & validation:** Rà soát CourseEdition (DRAFT → PENDING_APPROVAL → PUBLISHED/ARCHIVED), Class (DRAFT → ENROLLING → IN_PROGRESS → COMPLETED/CANCELLED), CourseOffering (DRAFT → PUBLISHED/HIDDEN). Validation: LIVE class bắt buộc startDate, endDate, ít nhất 1 LiveSchedule khi ENROLLING; VOD không đổi courseEditionId khi không cho phép; lock courseEditionId khi LIVE đã ENROLLING/IN_PROGRESS. |
| **Ngày 28** | **Notification (optional):** Nếu có notification service: trigger khi lớp sắp khai giảng, bài tập sắp đến hạn, có điểm mới, lớp bị hủy, offer từ waitlist. Nếu chưa có service thì bỏ qua hoặc ghi event/log để sau tích hợp. |
| **Ngày 29–30** | **Documentation, seed data, deploy:** Ghi lại env (DB, NATS, PayOS, gateway URL). Seed tối thiểu: 1 CourseProfile, 1 CourseEdition (có chapter + items), 1 Lesson, 1 Class VOD, 1 CourseOffering gắn class đó. Hướng dẫn chạy migration, gateway, academy, web-admin, web-learner. Deploy (dev/staging) và smoke test. |
| **Ngày 31–35** | **Buffer:** Sửa lỗi phát sinh, tối ưu query (N+1), bổ sung test unit/integration cho service quan trọng (enrollment, order, class state). |

---

## 4. Checklist tổng hợp (đánh dấu khi xong)

### Schema & migration
- [ ] Waitlist, RefundPolicy, RefundRequest
- [ ] ClassAssessment: lateSubmissionPolicy (và/hoặc settings.latePenaltyPercentPerDay)

### Backend (Academy)
- [ ] Waitlist: join, list by class, offer slot
- [ ] RefundPolicy & RefundRequest: CRUD, approve/reject
- [ ] Late submission logic (assignment)
- [ ] Clone edition (POST /editions/:id/clone)
- [ ] Edition immutable sau publish (chặn update syllabus trực tiếp; chỉ clone để thay đổi)
- [ ] Offering publish validation (class hợp lệ để bán + edition của class phải `PUBLISHED`)
- [ ] Offering `PUBLISHED` mutate policy (re-approval hoặc clone version)
- [ ] Cron minStudents (LIVE)
- [ ] Rule hủy lớp có enrollment (17.A)
- [ ] Certificate issue logic
- [ ] requireApprovalForPublish (config)
- [ ] Order fulfillment enforce đủ enrollment rules (không tạo enrollment thẳng khi class không hợp lệ)

### Gateway
- [ ] Question Pools proxy (NATS + pattern)
- [ ] API waitlist, refund policy, refund request
- [ ] Permission và filter Lecturer

### Web-admin
- [ ] Dashboard: số liệu thật (profiles, classes, enrollments)
- [ ] Course Profile / Edition / Chapter / ChapterItem CRUD + syllabus builder
- [ ] Với edition `PUBLISHED`: chế độ read-only + CTA Clone Edition
- [ ] Lesson / QuizTemplate / AssignmentTemplate CRUD
- [ ] Class: form tách VOD vs LIVE, duplicate
- [ ] Class detail: Overview, Schedule, Assessment, Learners, **Waitlist**, **Attendance**
- [ ] Enrollment; Offering + map classIds
- [ ] Offering form/detail phản ánh publish validation và policy re-approval khi offering đã `PUBLISHED`
- [ ] Question Pool + Question; Refund policy/request; Reports
- [ ] Permission & role (Lecturer ẩn menu); form zod = DTO

### Web-learner
- [ ] Catalog từ Offering; mua khóa → Order → Payment → Enrollment
- [ ] My Courses + curriculum; course learn (lesson, quiz, assignment, progress)
- [ ] Certificate; late submission UX

### E2E
- [ ] Order paid → enrollments; refund → revoke
- [ ] State machine Edition / Class / Offering; LIVE/VOD rules

---

## 5. Tham chiếu

- Spec core LMS: [apps/server/core-lms.md](../apps/server/core-lms.md)
- Spec UI admin: [ACADEMY_WEB_ADMIN_UI_SPEC.md](./ACADEMY_WEB_ADMIN_UI_SPEC.md)
- Question Pool: [apps/server/QUESTION_POOL_SPEC.md](../apps/server/QUESTION_POOL_SPEC.md)
