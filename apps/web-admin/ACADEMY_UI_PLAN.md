---
title: Kế hoạch nâng cấp UI LMS Academy
description: Nâng cấp toàn bộ UI web-admin cho module Academy (Course, Lesson, Class, Exam, v.v.) dùng shadcn/ui, rich text, media R2, tối ưu cho staff & lecturer.
---

## Mục tiêu tổng

- **Trải nghiệm form chuyên nghiệp**: Không còn nhập text/raw ID hay type, tất cả quan hệ (courseProfileId, courseEditionId, classId, examId, ...) đều chọn qua `Select`/`Combobox` rõ ràng (code + title).
- **Soạn nội dung chuyên nghiệp**: Dùng `RichTextEditor` cho mô tả dài (lesson, course, exam, question, v.v.), hỗ trợ upload ảnh/video/file qua `storageApi` (signed URL tới R2) và dùng `fileUrl` để lưu.
- **UI upload & preview media nhất quán**: Dùng uploader chung (dựa trên `LessonMediaUploader`) cho thumbnail/banner/media chính, có progress, lỗi, preview ảnh/video/link.
- **Không lộ metadata JSON**: Các field JSON/metadata như `metadata`, `syllabusSnapshot` chỉ quản lý ở backend/builder, **không render** cho staff/lecturer trừ khi thật sự cần.
- **Chuẩn shadcn/ui**: Dùng `Card`, `Tabs`, `FieldGroup`, `Field`, `Item`, `Table`, v.v. từ `@workspace/ui`. Không CSS Tailwind override ngoài pattern đã được chuẩn hóa trong project.
- **Flow nghiệp vụ mượt cho staff & lecturer**: Quy trình rõ ràng từ tạo Course → Edition → Syllabus → Offering → Class → Schedule → Lesson/Exam/Question, mỗi bước 1 màn hình tập trung, không rối.

## Module & pages trong Academy

### Danh sách page chính

- **Dashboard**
  - `academy-dashboard-page.tsx`

- **Course / Program**
  - Course Profile: `course-profiles-page.tsx`, `course-profile-create-page.tsx`, `course-profile-edit-page.tsx`
  - Course Edition: `course-editions-page.tsx`, `course-edition-create-page.tsx`, `course-edition-edit-page.tsx`
  - Course Offering: `course-offerings-page.tsx`, `course-offering-create-page.tsx`, `course-offering-edit-page.tsx`

- **Nội dung học tập**
  - Chapter: `chapters-page.tsx`, `chapter-create-page.tsx`, `chapter-edit-page.tsx`
  - Chapter Item: `chapter-items-page.tsx`, `chapter-item-create-page.tsx`, `chapter-item-edit-page.tsx`
  - Lesson: `lessons-page.tsx`, `lesson-create-page.tsx`, `lesson-edit-page.tsx`

- **Lớp, lịch, đánh giá**
  - Class: `classes-page.tsx`, `class-create-page.tsx`, `class-edit-page.tsx`
  - Class Schedule: `class-schedules-page.tsx`, `class-schedule-create-page.tsx`, `class-schedule-edit-page.tsx`
  - Class Assessment: `class-assessments-page.tsx`, `class-assessment-create-page.tsx`, `class-assessment-edit-page.tsx`

- **Kỳ thi, câu hỏi, bài nộp**
  - Exam: `exams-page.tsx`, `exam-create-page.tsx`, `exam-edit-page.tsx`
  - Question: `questions-page.tsx`, `question-create-page.tsx`, `question-edit-page.tsx`
  - Exam Attempt: `exam-attempts-page.tsx`, `exam-attempt-detail-page.tsx`
  - Assignment Submission: `assignment-submissions-page.tsx`, `assignment-submission-detail-page.tsx`

### API client & backend tương ứng

- Frontend services (`apps/web-admin/src/lib/api/services`):
  - `academy-course-profiles.ts`, `academy-course-editions.ts`, `academy-course-offerings.ts`
  - `academy-chapters.ts`, `academy-chapter-items.ts`, `academy-lessons.ts`
  - `academy-classes.ts`, `academy-class-schedules.ts`, `academy-class-assessments.ts`
  - `academy-exams.ts`, `academy-questions.ts`, `academy-exam-attempts.ts`, `academy-assignment-submissions.ts`

- Backend controllers (`apps/server/services/gateway/src/modules/academy/controllers`):
  - `course-profile.controller.ts`, `course-edition.controller.ts`, `course-offering.controller.ts`
  - `chapter.controller.ts`, `chapter-item.controller.ts`, `lesson.controller.ts`
  - `class.controller.ts`, `class-schedule.controller.ts`, `class-assessment.controller.ts`
  - `exam.controller.ts`, `question.controller.ts`, `exam-attempt.controller.ts`, `assignment-submission.controller.ts`

## Wave 1 – Lesson & core LMS (ĐÃ THỰC HIỆN)

### LessonForm & Lesson pages

- File chính: `apps/web-admin/src/components/academy/lesson-form.tsx`
- Thay đổi:
  - Chia form thành nhiều `Card`:
    - **Thông tin chung**: `courseProfileId` (Select), `title`, `contentType` (Select với VIDEO/HTML/MARKDOWN/EXTERNAL_LINK/PDF).
    - **Nội dung bài học**: `contentBody` dùng `RichTextEditor` + `Tabs` (Chỉnh sửa / Xem trước).
    - **Media & liên kết**: `contentUrl` dùng uploader (khi phù hợp) hoặc nhập link external.
    - **Metadata nâng cao**: `metadata` JSON (hiện tại vẫn có, nhưng chỉ cho admin kỹ thuật – có thể ẩn sau này nếu không cần).
  - Logic theo `contentType`:
    - `HTML` / `MARKDOWN`: hiển thị `RichTextEditor`, preview HTML.
    - `VIDEO` / `PDF` / `EXTERNAL_LINK`: tập trung vào `contentUrl` + media uploader.

### RichTextEditor

- File: `apps/web-admin/src/components/editor/rich-text-editor.tsx`
- Sử dụng bộ `reactjs-tiptap-editor` với rất nhiều extension (heading, list, table, code, highlight, image, video, attachment, callout, mermaid, v.v.).
- Cập nhật:
  - Bỏ `DEFAULT` demo (callout + emoji), editor chỉ **dùng đúng `initialContent`** từ DB.
  - `content` trong `useEditor` dùng `initialContent ?? ''`.

### Media uploader cho Lesson

- File: `apps/web-admin/src/components/academy/lesson-media-uploader.tsx`
- Chức năng:
  - Nút \"Chọn file\" (Button shadcn) → upload qua `storageApi.uploadFile(file, 'academy-lessons')`.
  - Hiển thị progress (Progress), trạng thái uploading, lỗi (FieldError), preview:
    - Video: `<video controls />`
    - Ảnh: `<img />`
    - Khác: link `Mở file`.
  - Kết quả trả về `fileUrl` từ R2 và set vào `contentUrl`.

### Lesson create/edit pages

- Files:
  - `apps/web-admin/src/routes/academy/lesson-create-page.tsx`
  - `apps/web-admin/src/routes/academy/lesson-edit-page.tsx`
- Đã dùng `LessonForm` mới, hiển thị trong `Card` với `PageHeader`, handle toast và điều hướng.

## Wave 2 – Course Profile / Course Edition / Course Offering

### Course Profile Form

- File: `apps/web-admin/src/components/academy/course-profile-form.tsx`
- Mục tiêu:
  - Định nghĩa khung Course trừu tượng (VD: JLPT N5) với thông tin cơ bản + thumbnail + (optional) mô tả phong phú.
- Kế hoạch UI:
  - Card **Thông tin chung**:
    - Fields hiện có: `code` (create-only), `title`, `shortTitle`, `subject`, `level`, `defaultLanguage`.
    - Bổ sung `FieldDescription` giải thích từng field (vd: convention cho code, level).
  - Card **Hình ảnh & trình bày**:
    - `thumbnailUrl` thay từ `Input` sang uploader (tái sử dụng generic media uploader).
    - (Option) Nếu schema có `description` dài → thêm `RichTextEditor` cho mô tả course.

### Course Edition Form

- File: `apps/web-admin/src/components/academy/course-edition-form.tsx`
- Mục tiêu:
  - Liên kết Course Profile và phiên bản syllabus (edition) với tag, trạng thái, changelog.
- Kế hoạch UI:
  - Card **Liên kết Course Profile**:
    - `courseProfileId` (chỉ create): `Select` đã có, thêm `FieldDescription` rõ ràng, disable khi edit.
  - Card **Phiên bản & trạng thái**:
    - `editionTag`: Input (vd: `2026-Q1`, `v1`, ...).
    - `status`: chuyển từ Input tự do sang `Select` với các enum: `DRAFT`, `PUBLISHED`, `ARCHIVED`.
    - `isCurrent`: thể hiện bằng `Checkbox` + text \"Đặt làm edition hiện tại cho Course Profile\" (nếu schema/DTO cho phép).
  - Card **Mô tả thay đổi (changelog)**:
    - `changelog` dùng `RichTextEditor` + `Tabs` (Chỉnh sửa / Xem trước).
  - **Ẩn metadata JSON**:
    - `syllabusSnapshot` (JSON) **không hiển thị** trong form – chỉ được quản qua `SyllabusBuilder` + backend.

### Course Offering Form

- File: `apps/web-admin/src/components/academy/course-offering-form.tsx`
- Mục tiêu:
  - Định nghĩa gói bán (bundle) cho learner đăng ký: tiêu đề, mô tả, giá, trạng thái, currency, và (optional) media.
- Kế hoạch UI:
  - Card **Thông tin cơ bản**:
    - `code` (create-only), `title`, kèm `FieldDescription` cho code naming convention.
  - Card **Nội dung & quyền lợi**:
    - `description` chuyển từ `Textarea` sang `RichTextEditor` + Tabs.
    - (Option) Thêm uploader banner/thumbnail nếu schema có field tương ứng.
  - Card **Giá & trạng thái**:
    - `price`: Input number với min/step rõ ràng + `FieldDescription` (đơn vị, ví dụ: VND).
    - `currency`: chuyển thành `Select` (ví dụ: `VND`, `USD`), tránh user gõ tự do.
    - `status`: chuyển thành `Select` với enum: `DRAFT`, `ACTIVE`, `HIDDEN`.

## Wave 3 – Chapter / Chapter Item / Lesson list

### Chapter

- Pages: `chapter-create-page.tsx`, `chapter-edit-page.tsx`, `chapters-page.tsx`
- Kế hoạch:
  - Form create/edit: chọn Course Edition qua `Select`/`Combobox`, không nhập ID.
  - Fields: tên chapter, mô tả ngắn, thứ tự hiển thị; dùng `FieldGroup` + `Card`.
  - Nếu cần mô tả dài → `RichTextEditor`.

### Chapter Item

- Pages: `chapter-item-create-page.tsx`, `chapter-item-edit-page.tsx`, `chapter-items-page.tsx`
- Kế hoạch:
  - Chọn `chapterId` bằng Select.
  - Chọn type item (Lesson / Quiz / Assignment / Exam link, ...) bằng `Select`, không nhập text type.
  - Rõ ràng vị trí/thứ tự trong chapter.

### Lessons list

- Page: `lessons-page.tsx`
- Kế hoạch:
  - Thêm filter bar (trên `Table`): `CourseProfile`, `CourseEdition`, `Chapter`, text search theo title.
  - Dùng `Select`/`Combobox` lấy từ services tương ứng (`academy-course-profiles`, `academy-course-editions`, `academy-chapters`).

## Wave 4 – Class / Schedule / Assessment

### Class

- Pages: `class-create-page.tsx`, `class-edit-page.tsx`, `classes-page.tsx`
- Kế hoạch:
  - Card **Thông tin lớp**:
    - Tên lớp, mã lớp, liên kết Course Offering hoặc Course Edition (Select).
  - Card **Vận hành**:
    - Trạng thái lớp, ghi chú nội bộ (optional `RichTextEditor`).

### Class Schedule

- Pages: `class-schedule-create-page.tsx`, `class-schedule-edit-page.tsx`, `class-schedules-page.tsx`
- Kế hoạch:
  - Form dùng `Select` cho Class, giảng viên, loại buổi; Date/Time picker cho thời gian.
  - Tránh nhập tay ID hoặc text ngày/giờ.

### Class Assessment

- Pages: `class-assessment-create-page.tsx`, `class-assessment-edit-page.tsx`, `class-assessments-page.tsx`
- Kế hoạch:
  - Liên kết Class bằng Select.
  - Chọn loại assessment (quiz, assignment, exam) bằng Select.
  - Mô tả, tiêu chí đánh giá (rubric) bằng `RichTextEditor`.

## Wave 5 – Exam / Question / Attempt / Submission

### Exam

- Pages: `exam-create-page.tsx`, `exam-edit-page.tsx`, `exams-page.tsx`
- Kế hoạch:
  - Card **Thông tin cơ bản**: title, mã kỳ thi, loại kỳ thi (Select).
  - Card **Cấu hình**: thời lượng, thời gian mở/đóng, số lần attempt, v.v. với Input/Select rõ nghĩa.
  - Card **Mô tả & hướng dẫn**: `RichTextEditor` + uploader media.

### Question

- Pages: `question-create-page.tsx`, `question-edit-page.tsx`, `questions-page.tsx`
- Kế hoạch:
  - Editor soạn đề, option, giải thích bằng `RichTextEditor`, hỗ trợ chèn ảnh/video/file.
  - Chọn loại câu hỏi (MCQ, essay, true/false, ...) bằng Select.

### Exam Attempt & Assignment Submission

- Pages:
  - `exam-attempts-page.tsx`, `exam-attempt-detail-page.tsx`
  - `assignment-submissions-page.tsx`, `assignment-submission-detail-page.tsx`
- Kế hoạch:
  - Dùng `Tabs` cho detail view: Thông tin chung / Bài làm / Chấm điểm / Log.
  - Dùng `Table` + `Item` list để staff/lecturer theo dõi nhanh, không lộ JSON thô.

## API hỗ trợ UX

- Tận dụng các service `academy-*` đã có, bổ sung nếu thiếu:
  - Endpoint \"lookup nhẹ\" (minimal) cho dropdown/combobox: Course Profile, Course Edition, Class, Exam, v.v.
  - Dashboard API (ví dụ `/academy/dashboard`) trả tổng quan: số course, class đang chạy, exam sắp tới, submissions chờ chấm.
- Tất cả list page (lessons, chapters, classes, exams, questions, submissions) nên hỗ trợ filter & sort bằng query param (`status`, `courseProfileId`, `classId`, `search`, ...).

## Nguyên tắc UX & shadcn/ui xuyên suốt

- **Không nhập ID thô**: mọi quan hệ đều hiển thị bằng label + code trong `Select`/`Combobox`.
- **Không hiển thị metadata JSON**: các field JSON/metadata được backend/builder quản, UI chỉ cung cấp những gì staff/lecturer thực sự cần.
- **Chuẩn shadcn/ui**:
  - Dùng `Card`, `Tabs`, `FieldGroup`, `Field`, `Item`, `Table`, `Button`, `Alert`, `ScrollArea` đúng pattern.
  - Chỉ dùng `className` cho spacing cơ bản (`space-y-6`, `p-6`, ...) theo chuẩn dự án, không CSS Tailwind override custom.
- **Flow rõ ràng cho staff & lecturer**:
  - Mỗi bước chính có `PageHeader` với title + subtitle mô tả ngắn nghiệp vụ.
  - Form không quá 2–3 block lớn, không nhồi metadata, không bắt user nhớ ID hay enum string.

---

## Vai trò & luồng nghiệp vụ theo role

> Mục tiêu: UI `academy-admin` phải phục vụ đúng việc của từng role: **Staff-LMS**, **Lecturer**, **Admin**, và phối hợp mượt với luồng **Learner** (phía web-learner) dựa trên backend `academy` + các service hiện có (identity, order/payment, communication, certificate, meet).

### 1. Staff-LMS (Academic / Operations)

#### 1.1. Phạm vi quyền & menu

- Thấy đầy đủ nhóm menu `Academy`:
  - `Dashboard`
  - `Course Profiles`
  - `Course Editions`
  - `Lessons`
  - `Chapters` / `Chapter Items`
  - `Exams & Questions`
  - `Classes`
  - `Course Offerings`
  - `Learners & Enrollments` (phase sau)
  - `Reports` (phase sau)
- Có permission:
  - `academy.content.read/write`
  - `academy.delivery.read/write`
  - `academy.commerce.read/write`
  - `exam.manage` (hoặc `academy.assessment.*` sau này)

#### 1.2. Công việc chính & các màn hình hỗ trợ

- **Thiết kế chương trình (Content)**:
  - Màn hình:
    - `Course Profiles`
    - `Course Editions`
    - `Chapters` + `Chapter Items`
    - `Lessons`
  - Tác vụ:
    - Tạo mới `CourseProfile` → cấu hình subject/level/thumbnail.
    - Tạo `CourseEdition` (v1, v2, năm 2026...) → quản lý status, changelog, `isCurrent`.
    - Dựng syllabus:
      - Thêm/sửa `Chapter`, `ChapterItem` (link Lesson/QuizTemplate/AssignmentTemplate).
    - Quản lý thư viện Lesson:
      - Soạn nội dung bằng `RichTextEditor` + media uploader.
      - Filter theo courseProfile/subject/level.

- **Quản lý lớp (Delivery)**:
  - Màn hình:
    - `Classes`
    - `Class Schedules`
    - `Class Assessments`
  - Tác vụ:
    - Tạo Class VOD/LIVE/BLENDED:
      - Chọn `CourseProfile`, `CourseEdition` (Select, không nhập ID).
      - Đặt `code`, `name`, `term`, `mode`.
    - Đối với LIVE/BLENDED:
      - Thêm `ClassSchedule` (weekday, time, location/meeting link).
      - Mở đăng ký (`DRAFT → ENROLLING`).
    - Với mỗi Class:
      - Tab `Assessment`:
        - Gắn `ClassAssessment` từ Quiz/Assignment template.
        - Đặt deadline, weight, override time/attempt/score.
        - Publish/Close assessment.

- **Quản lý Enrollment & Learners**:
  - Màn hình (phase sau):
    - `Learners & Enrollments` (hoặc tab `Learners` trong Class detail).
  - Tác vụ:
    - Xem danh sách learner của từng class (status, tiến độ).
    - Thêm Enrollment thủ công (scholarship, internal).
    - Huỷ Enrollment (drop out) theo policy.

- **Gắn với Commerce (Course Offering)**:
  - Màn hình:
    - `Course Offerings`
  - Tác vụ:
    - Tạo gói VOD-only, LIVE-only, LIVE+VOD:
      - Đặt `code`, `title`, `price`, `currency`, `status`.
      - Chọn một hoặc nhiều `Class` trong list để build bundle.
    - Kiểm tra cross-check:
      - Khi learner mở ticket “mua rồi nhưng không thấy khóa”, Staff-LMS:
        - Vào `Course Offerings` + `Classes` để kiểm Enrollment & mapping.

### 2. Lecturer (Giảng viên)

#### 2.1. Phạm vi quyền & menu

- Thấy subset của nhóm `Academy`:
  - `Classes` (chỉ các class mình dạy).
  - `Exams & Questions` (chỉ view/edit nếu được assign).
  - `Learners & Enrollments` (chỉ trong class mình).
- Permission:
  - `academy.delivery.read` + một phần `write` (có thể chỉnh schedule nhỏ, deadline).
  - `exam.manage` giới hạn theo lớp (hoặc flag `exam.grade`).

#### 2.2. Công việc chính & UI hỗ trợ

- **Quản lý lớp mình dạy**:
  - Màn hình:
    - `Classes` → detail page với Tabs:
      - `Overview`: thông tin khóa, edition, stats.
      - `Schedule`: lịch dạy (view, minor edit).
      - `Assessment`: danh sách ClassAssessment.
      - `Learners`: danh sách học viên.
  - Tác vụ:
    - Xem syllabus class (link tới Lessons).
    - Điều chỉnh minor schedule (thay đổi thời gian/note) nếu policy cho phép.

- **Quản lý Assessment**:
  - Tab `Assessment` trong Class detail:
    - View tất cả quiz/assignment của class.
    - Có thể:
      - Chỉnh deadline (kéo dài cho cả class hoặc cá nhân – phase sau).
      - Publish/Close assessment theo lịch thực tế nếu Staff-LMS ủy quyền.

- **Chấm điểm & phản hồi**:
  - Màn hình:
    - `exam-attempts-page.tsx` + detail, filter theo class.
    - `assignment-submissions-page.tsx` + detail, filter theo class.
  - Tác vụ:
    - Grade essay/open question trong exam:
      - UI detail attempt với Tabs: “Thông tin”, “Bài làm”, “Chấm điểm”, “Log”.
    - Chấm assignment:
      - Gán `score`, `feedback`, set `status = GRADED/RETURNED`.

- **Theo dõi tiến độ**:
  - Tab `Learners`:
    - `Table` hiển thị:
      - learner name/email,
      - `Enrollment.status`,
      - % lesson completed,
      - exam/assignment key results.
  - Dùng để:
    - Xác định ai cần được nhắc nhở hoặc support thêm.

### 3. Learner (Học viên) – luồng liên quan tới UI admin/gateway

> Learner không dùng web-admin, nhưng luồng của họ quyết định spec API + UI admin kiểm soát.

#### 3.1. Trước khi mua

- UI learner (web-learner) sẽ:
  - Đọc **catalog** từ `CourseOffering` + `CourseProfile`:
    - Card course hiển thị title, level, mode (VOD/LIVE/BLENDED), mô tả ngắn, syllabus summary.
  - Kết nối sang `order/payment` để tạo và thanh toán Order.

#### 3.2. Sau khi thanh toán

- `order/payment` gọi event `order.paid` → `academy` tạo Enrollment.
- Learner thấy class mới ở trang `My Courses` (web-learner).
- Staff-LMS & Lecturer thấy learner mới trong:
  - `Classes` → tab `Learners` (web-admin).

#### 3.3. Trong khi học

- Learner:
  - Dùng flow player/lesson/quiz/exam/submission ở web-learner (không trong web-admin).
  - Khi có vấn đề:
    - Tạo ticket (support) → Support/Staff-LMS dùng web-admin (`Tickets`, `Academy` modules) để tra cứu:
      - Enrollment,
      - Class,
      - ExamAttempt,
      - AssignmentSubmission.

#### 3.4. Hoàn thành & chứng chỉ

- Khi rule hoàn thành được thoả:
  - `Enrollment.status = COMPLETED`.
  - Certificate service cấp chứng chỉ (view ở learner).
- Staff-LMS/lecturer:
  - Thấy trạng thái này ở web-admin:
    - Dễ lọc “đã hoàn thành”, kiểm định chất lượng.

### 4. Admin

#### 4.1. Phạm vi & menu

- Thấy toàn bộ menu `Academy` + các module hệ thống:
  - `Users`, `Permissions`, `Orders`, `Reports`, `System Settings`, v.v.
- Quyền:
  - Full `academy.*`, `user.manage`, `payment.manage`, `report.view`, `system.config`, etc.

#### 4.2. Công việc trong Academy

- Cấu hình / override chính sách:
  - Điều kiện hoàn thành khóa (tối thiểu % lesson, exam pass rate, assignment required).
  - Giới hạn enroll, chính sách cancel/refund liên quan đến class/courses.
- Audit:
  - Xem log trạng thái:
    - Ai publish/close exam/class/edition.
  - Kiểm tra tổng thể:
    - Số learner active theo course/class.
    - Pass rate JLPT mock / exam nội bộ.

---

### Tóm tắt: Mapping role → màn hình chính

- **Staff-LMS**:
  - Main: `Dashboard`, `Course Profiles`, `Course Editions`, `Chapters`, `Lessons`, `Classes`, `Assessments`, `Offerings`, `Reports`.
  - Nhiệm vụ: thiết kế chương trình, dựng lớp, cấu hình đánh giá, điều phối enrollment.
- **Lecturer**:
  - Main: `Classes` (của mình), `Exam Attempts`, `Assignment Submissions`, tab `Learners`.
  - Nhiệm vụ: dạy, chấm, theo dõi tiến độ, tinh chỉnh deadline/schedule trong phạm vi class.
- **Admin**:
  - Main: tất cả Academy + hệ thống.
  - Nhiệm vụ: cấu hình chính sách, giám sát quality, audit.
- **Learner** (web-learner, không phải admin UI):
  - Main: `Catalog` (offerings), `My Courses`, `My Certificates`.
  - Nhiệm vụ: mua, học, làm bài, nhận chứng chỉ; support qua ticket (support/admin xử lý trong web-admin).

