# SPEC: Quiz cố định cho LMS (VOD Package + Live Class)

## 1) Mục tiêu

- Bổ sung tính năng quiz đơn giản cho hệ thống LMS.
- Quiz là **cố định theo CourseProfile** (master), không có cơ chế override theo từng VOD package hay từng live class.
- Hỗ trợ 3 lớp đánh giá:
  - Quiz sau một số lesson (lesson checkpoint quiz).
  - Bài kiểm tra lớn mỗi chương (module/chapter checkpoint exam).
  - Bài kiểm tra tổng kết cuối khóa (final exam).

## 2) Kết luận nghiệp vụ sau review khách hàng

- Dùng một bộ quiz/exam cố định cho mỗi CourseProfile.
- Người học VOD package và người học live class (kể cả học viên live xem VOD replay) đều dùng chung bộ quiz/exam đó.
- **Không làm override** (không chọn exam riêng theo class, không generate exam riêng theo class).
- Quy tắc khóa/mở:
  - VOD package: có khóa tiến độ — phải học đến mốc quy định và làm quiz thì mới học tiếp.
  - Live class: không khóa học tập theo quiz (vì đặc thù học live/luyện giao tiếp), quiz chủ yếu để đánh giá tiến độ.

## 3) Hiện trạng codebase (AS-IS)

- Luồng học hiện tại trong learner dựa trên curriculum `Module → Lesson` và `Lesson.type` chỉ có `VIDEO | READING`.
- Trang quiz theo route cũ:
  - `courses/[courseId]/quizzes`: đang hiển thị thông báo “Chưa có bài kiểm tra được phát hành”.
  - `courses/[courseId]/quizzes/[quizId]`: đã deprecate, redirect về danh sách.
- Service exam/question pool/exam attempt đã có DTO và API client cho admin/learner nhưng chưa gắn chặt vào luồng học curriculum hiện tại.
- UI admin vẫn còn dấu vết ý tưởng override quiz cho live class; yêu cầu mới là bỏ toàn bộ hướng override.

## 4) Phạm vi triển khai (IN-SCOPE)

- Định nghĩa “assessment plan” cố định theo CourseProfile.
- Gắn exam có sẵn vào các mốc:
  - Sau lesson X (checkpoint nhỏ).
  - Kết thúc module/chapter Y (checkpoint lớn).
  - Kết thúc khóa (final).
- Learner flow:
  - VOD: enforce gate.
  - Live: không enforce gate.
- Theo dõi kết quả exam attempt theo enrollment người học.
- Hiển thị trạng thái chưa làm/đã làm/đạt-chưa đạt cho các mốc quiz.

## 5) Ngoài phạm vi (OUT-OF-SCOPE)

- Không thiết kế hệ thống đề ngẫu nhiên theo từng class.
- Không phát sinh bản đề riêng cho mỗi live class.
- Không làm adaptive path phức tạp trong phase này.
- Không thay đổi logic assignment tự luận hiện có.

## 5.1) Quyết định về compatibility

- **Không yêu cầu backward compatibility**.
- Cho phép thay đổi schema/API theo thiết kế mới, không cần giữ contract cũ của luồng quiz legacy.
- Ưu tiên sự đơn giản, tính nhất quán và dễ vận hành lâu dài.

## 5.2) Định dạng câu hỏi (thống nhất với phong cách JLPT, không dùng chung bảng JLPT)

- Mỗi câu hỏi trong ngân hàng LMS chỉ hỗ trợ **một lựa chọn đúng** (single choice).
- Mỗi câu có **đúng 4 phương án** (A, B, C, D) — cùng UX với bài JLPT mock (không multi-choice, không true/false tách kiểu, không câu trả lời ngắn).
- **Không** nối dữ liệu vào bảng `jlpt_*`; chỉ bắt chước **quy ước 4 đáp án / một đáp án đúng**.
- Khi import/soạn thảo ở admin: validate bắt buộc 4 option, đúng một `is_correct = true`.

## 6) Nguyên tắc thiết kế

- Single source of truth:
  - Exam và mapping quiz thuộc cấp `CourseProfile`.
- Đối tượng triển khai (`VodPackage`, `LiveClass`) chỉ “consume” assessment plan của CourseProfile.
- Dữ liệu cố định, dễ quản trị, dễ test, dễ giải thích với khách hàng.

## 7) Schema DB cần bổ sung (đối chiếu từ `schema.prisma`)

### 7.1 Các bảng đã có sẵn (không cần tạo mới)

Theo `apps/server/prisma/schema.prisma`, hiện đã có các bảng LMS nền tảng:

- `academy_course_profiles`
- `academy_modules`
- `academy_lessons`
- `academy_vod_packages`
- `academy_live_classes`
- `academy_enrollments`
- `academy_user_lesson_progress`

→ Nghĩa là phần curriculum, enrollment, progress đã đủ để làm gating theo lesson/module.

### 7.2 Các bảng quiz/exam tổng quát còn thiếu (cần bổ sung)

Hiện tại trong `schema.prisma` **không còn** các model exam tổng quát cho Academy (non-JLPT), trong khi code DTO/service vẫn có luồng exam/attempt.  
Đề xuất bổ sung các bảng sau:

1) `academy_exams`  
- Mục đích: lưu đề quiz/exam cố định theo CourseProfile.  
- Cột chính:
  - `id` (uuid, PK)
  - `course_profile_id` (nullable FK → `academy_course_profiles`)
  - `title`, `description`
  - `exam_type` (QUIZ | MODULE_TEST | FINAL_EXAM)
  - `level` (nullable)
  - `total_time_limit_minutes` (nullable)
  - `status` (DRAFT | PUBLISHED | ARCHIVED)
  - `settings` (jsonb, nullable)
  - `created_at`, `updated_at`

2) `academy_exam_sections`  
- Mục đích: chia đề thành các section/phần.  
- Cột chính:
  - `id` (uuid, PK)
  - `exam_id` (FK → `academy_exams`)
  - `title`, `instruction` (nullable)
  - `section_type`
  - `time_limit_seconds` (nullable)
  - `order_index`
  - `metadata` (jsonb, nullable)
  - `created_at`, `updated_at`

3) `academy_questions`  
- Mục đích: ngân hàng câu hỏi cho LMS (tách biệt bảng `jlpt_*`).  
- Quy ước nội dung: **chỉ loại chọn một đáp án** (có thể lưu `question_type = SINGLE_CHOICE` cố định hoặc bỏ enum, chỉ document là single-choice 4 phương án).  
- Cột chính:
  - `id` (uuid, PK)
  - `stem` (text — đề bài)
  - `explanation` (nullable — giải thích sau khi nộp)
  - `difficulty` (nullable)
  - `review_status` (optional: DRAFT | IN_REVIEW | APPROVED | REJECTED)
  - `reviewed_by`, `reviewed_at`, `review_note` (nullable)
  - `metadata` (jsonb, nullable — **không** dùng để chứa đáp án kiểu tự luận)
  - `created_at`, `updated_at`

4) `academy_question_categories`  
- Mục đích: phân loại câu hỏi tập trung (kỹ năng, chủ đề, độ khó, mục tiêu học tập…).  
- Cột chính:
  - `id` (uuid, PK)
  - `code` (unique)
  - `name`
  - `description` (nullable)
  - `parent_id` (nullable, self FK để làm cây category)
  - `is_active` (bool)
  - `created_at`, `updated_at`

5) `academy_question_options`  
- Mục đích: **đúng 4** đáp án A/B/C/D cho mỗi câu; **một** đáp án đúng.  
- Cột chính:
  - `id` (uuid, PK)
  - `question_id` (FK → `academy_questions`)
  - `option_key` (char(1) hoặc varchar(1), chỉ `A`|`B`|`C`|`D`)
  - `content` (text)
  - `is_correct` (bool)
  - `order_index` (1–4, tùy map với A–D)
- Ràng buộc (gợi ý DB hoặc validate ở service):
  - Mỗi `question_id` có **đúng 4** bản ghi option.
  - Đúng **một** bản ghi `is_correct = true` trên mỗi `question_id`.
  - `option_key` unique theo cặp (`question_id`, `option_key`).

6) `academy_question_category_links`  
- Mục đích: map nhiều-nhiều giữa câu hỏi và category.  
- Cột chính:
  - `question_id` (FK → `academy_questions`)
  - `category_id` (FK → `academy_question_categories`)
  - `created_at`
- Ràng buộc:
  - PK/Unique (`question_id`, `category_id`)

7) `academy_exam_questions`  
- Mục đích: map câu hỏi vào section của đề.  
- Cột chính:
  - `id` (uuid, PK)
  - `exam_id` (FK → `academy_exams`)
  - `section_id` (FK → `academy_exam_sections`)
  - `question_id` (FK → `academy_questions`)
  - `order_index`
  - `points` (nullable)
  - `metadata` (jsonb, nullable)

8) `academy_exam_attempts`  
- Mục đích: lưu lượt làm bài của học viên.  
- Cột chính:
  - `id` (uuid, PK)
  - `exam_id` (FK → `academy_exams`)
  - `user_id` (FK → `users`)
  - `enrollment_id` (nullable FK → `academy_enrollments`)
  - `class_id` (nullable FK → `academy_live_classes`)
  - `status` (IN_PROGRESS | SUBMITTED | CANCELLED)
  - `score`, `max_score`, `percentage` (nullable)
  - `is_passed` (nullable)
  - `started_at`, `submitted_at` (nullable), `completed_at` (nullable)
  - `draft_answers` (jsonb, nullable — chỉ map `exam_question_id` → `selected_option_id` hoặc key A–D)
  - `result_metadata` (jsonb, nullable)
  - `created_at`, `updated_at`

9) `academy_exam_attempt_answers`  
- Mục đích: lưu đáp án từng câu trong một lượt làm bài — **chỉ chọn một option**.  
- Cột chính:
  - `id` (uuid, PK)
  - `attempt_id` (FK → `academy_exam_attempts`)
  - `exam_question_id` (FK → `academy_exam_questions`)
  - `question_id` (FK → `academy_questions`)
  - `selected_option_id` (FK → `academy_question_options`, **bất buộc** khi đã trả lời)
  - **Không** dùng `answer_payload` cho multi-select hay câu tự luận.
  - `is_correct` (nullable)
  - `score_awarded` (nullable)
  - `answered_at`

10) `academy_course_profile_assessments`  
- Mục đích: map đề thi cố định vào các mốc lesson/module/final theo CourseProfile.  
- Cột chính:
  - `id` (uuid, PK)
  - `course_profile_id` (FK → `academy_course_profiles`)
  - `exam_id` (FK → `academy_exams`)
  - `assessment_kind` (`LESSON_CHECKPOINT` | `MODULE_CHECKPOINT` | `FINAL_EXAM`)
  - `module_id` (nullable, bắt buộc với `MODULE_CHECKPOINT`)
  - `trigger_lesson_id` (nullable, bắt buộc với `LESSON_CHECKPOINT`)
  - `order_index`
  - `is_required` (bool, mặc định true cho VOD gate)
  - `is_active` (bool)
  - `created_at`, `updated_at`

### 7.3 Ràng buộc quan trọng

- Unique:
  - (`course_profile_id`, `assessment_kind`, `trigger_lesson_id`) cho lesson checkpoint.
  - (`course_profile_id`, `assessment_kind`, `module_id`) cho module checkpoint.
  - Một final exam active / một CourseProfile.
- Index gợi ý:
  - `academy_exam_attempts(exam_id, user_id, started_at desc)`
  - `academy_course_profile_assessments(course_profile_id, is_active, order_index)`
  - `academy_exam_questions(exam_id, section_id, order_index)`
  - `academy_questions(created_at desc)` hoặc `(review_status, created_at desc)`
  - `academy_question_category_links(category_id, question_id)`
  - `academy_question_options(question_id)`

### 7.4 Quản lý question bank tập trung cho staff

Hệ thống này đáp ứng yêu cầu: *Staff can manage question banks, adding, categorizing, and reviewing questions for quizzes and exams* — tức quản lý tập trung, bằng cách:

- Quản lý tập trung tại nhóm bảng:
  - `academy_questions`
  - `academy_question_options` (luôn 4 đáp án, một đáp án đúng)
  - `academy_question_categories`
  - `academy_question_category_links`
- Exam chỉ là lớp “compose/deploy”, tái sử dụng câu hỏi từ question bank.
- Workflow review: dùng các trường `review_status`, `reviewed_by`, `reviewed_at`, `review_note` trên `academy_questions`.
- Permission gợi ý:
  - `academy.question_bank.read`
  - `academy.question_bank.write`
  - `academy.question_bank.review`

### 7.5 Không bổ sung schema override theo class

- Không thêm cột/bảng cho override ở `academy_live_classes` hoặc `academy_vod_packages`.
- Không có `override_exam_id`, không có `live_override_mode`.

### 7.6 Tách biệt hoàn toàn với luồng JLPT

- Các bảng JLPT có tiền tố `jlpt_*` là module riêng, giữ nguyên.
- Tuyệt đối không tái sử dụng `jlpt_*` cho quiz LMS của VOD/Live class.
- Quiz LMS trong spec này chỉ dùng nhóm bảng `academy_*` đã nêu; **chỉ đồng bộ quy ước UI/đáp án (4 lựa chọn, một đúng)** với trải nghiệm JLPT mock.

## 8) Quy tắc nghiệp vụ chi tiết

### 8.1 Lesson checkpoint quiz

- Được khai báo tại mốc lesson cụ thể.
- Điều kiện mở bài quiz:
  - VOD: lesson trigger đã hoàn thành.
  - Live: cho phép vào quiz khi đến mốc (có thể vào ngay), không khóa bài học tiếp theo.
- Kết quả:
  - Nếu có rule pass/fail trong exam settings thì hiển thị đúng kết quả.
  - Phase đơn giản: cho phép học viên nộp nhiều lần theo cấu hình exam (nếu có).

### 8.2 Module checkpoint exam (kiểm tra tiến độ lớn mỗi chương)

- Mỗi module có thể có 0..1 bài kiểm tra lớn.
- Kích hoạt sau khi hoàn tất toàn bộ lesson “trackable” trong module.
- VOD:
  - Nếu exam module là required và chưa hoàn tất → khóa module tiếp theo.
- Live:
  - Không khóa, chỉ cảnh báo “chưa hoàn thành bài kiểm tra chương”.

### 8.3 Final exam

- Một bài final exam cho mỗi CourseProfile (bản active).
- Kích hoạt khi hoàn tất phần học theo quy tắc (ví dụ: hết module hoặc đạt ngưỡng progress).
- VOD:
  - Có thể dùng làm điều kiện “hoàn thành khóa học” (khuyến nghị).
- Live:
  - Không khóa buổi live; dùng để đánh giá tổng kết/cuối kỳ.

## 9) Rule khóa/mở theo loại chương trình

### 9.1 VOD package (có gate)

- Rule chính:
  - Học đến mốc → làm quiz bắt buộc → mới mở tiếp.
- Thứ tự ưu tiên gate:
  1. Lesson prerequisite (hiện có).
  2. Required assessment gate tại mốc lesson/module.
  3. Module sau bị khóa nếu module checkpoint chưa đạt quy tắc required.

### 9.2 Live class (không gate)

- Không khóa lesson/module vì quiz.
- Với khóa luyện giao tiếp hoặc học live thuần, có thể tắt required gate bằng cấu hình (`is_required = false`) nhưng vẫn hiển thị bài kiểm tra để học viên tự đánh giá.

## 10) API và backend contract đề xuất

### 10.1 Admin

- `GET /api/academy/course-profiles/:id/assessment-plan`
- `PUT /api/academy/course-profiles/:id/assessment-plan`
  - Input là danh sách mapping cố định (lesson/module/final).
  - Validate:
    - exam phải `PUBLISHED`
    - trigger lesson/module phải thuộc CourseProfile
    - không trùng vị trí trigger.
- CRUD question bank: tạo/sửa câu phải validate **4 option, một đúng**.

### 10.2 Learner

- `GET /api/academy/live-classes/:classId/assessment-plan`  
  → Trả về plan đã resolve từ CourseProfile của class/enrollment.
- `GET /api/academy/live-classes/:classId/assessment-status`  
  → Trạng thái từng mốc: locked / available / in_progress / submitted / passed / failed.
- `POST /api/academy/exam-attempts/start`  
  → Body: `examId`, `classId` (hoặc `enrollmentId`) và context mốc assessment.
- `POST /api/academy/exam-attempts/:id/submit`  
  → Sau submit, cập nhật gate state cho enrollment (VOD).

## 11) Frontend thay đổi tối thiểu

### 11.1 Web Admin

- Bỏ UI/chức năng override exam cho live class.
- Thêm màn hình “Assessment Plan” trong CourseProfile:
  - Chọn exam có sẵn cho từng mốc lesson/module/final.
  - Xem trước thứ tự và cờ required.
- Form soạn câu: radio một đáp án, hiển thị đúng 4 ô A–D (giống flow JLPT learner).

### 11.2 Web Learner

- Tại trang học:
  - Hiện mục quiz đúng mốc trong sidebar/timeline.
  - VOD: mục tiếp theo hiện khóa nếu chưa qua gate required.
  - Live: không khóa, chỉ badge nhắc nhở.
- Trang quizzes:
  - Không còn thông báo trống; hiển thị danh sách quiz/exam theo assessment plan.
- Màn làm bài: chỉ single choice, 4 nút/chọn A–D.

## 12) Tiêu chí chấp nhận (Acceptance Criteria)

- AC1: Một CourseProfile có một assessment plan cố định; VOD và Live đều dùng chung plan.
- AC2: Không tồn tại luồng override exam theo live class/VOD package.
- AC3: VOD enforce gate đúng: chưa đạt quiz required thì không học tiếp.
- AC4: Live class không bị khóa bài học vì quiz.
- AC5: Có bài kiểm tra chương và bài final theo cấu hình.
- AC6: Learner xem được trạng thái từng mốc quiz rõ ràng.
- AC7: Admin cấu hình được plan mà không cần tạo dữ liệu theo từng class.
- AC8: Mọi câu hỏi LMS có đúng 4 đáp án và chỉ một đáp án đúng; UI/API không cho multi-choice hay tự luận trong phase này.

## 13) Migration và rollout

### 13.1 Dữ liệu

- Tạo migration cho toàn bộ nhóm bảng ở mục 7.2 (theo thứ tự phụ thuộc FK):
  1. `academy_exams`
  2. `academy_exam_sections`
  3. `academy_questions`
  4. `academy_question_categories`
  5. `academy_question_options`
  6. `academy_question_category_links`
  7. `academy_exam_questions`
  8. `academy_exam_attempts`
  9. `academy_exam_attempt_answers`
  10. `academy_course_profile_assessments`
- Không làm backfill legacy; dữ liệu quiz/exam vận hành theo schema mới.

### 13.2 Code cleanup

- Xóa/ẩn UI override trong `class-quiz-source-*`.
- Đổi thông điệp route quiz learner từ “chưa có bài kiểm tra” sang lấy theo assessment plan.

### 13.3 Rollout an toàn

- Bật bằng feature flag: `ACADEMY_FIXED_QUIZ_PLAN`.
- UAT với một khóa VOD + một khóa Live trước khi bật rộng.

## 14) Kịch bản test tối thiểu

- VOD:
  - Học đến lesson trigger, quiz mở.
  - Chưa đạt quiz required → bài tiếp theo bị khóa.
  - Đạt quiz → mở tiếp.
  - Kết thúc module → module checkpoint xuất hiện.
  - Final exam xuất hiện cuối khóa.
- Live:
  - Quiz/module/final vẫn hiển thị.
  - Không khóa bài học dù chưa làm quiz.
- Dùng chung:
  - Học viên live xem VOD replay vẫn dùng cùng bộ quiz cố định.
  - Không có endpoint nào cho phép set override theo class.
- Câu hỏi:
  - Tạo câu thiếu/khác 4 option → API/validate từ chối.
  - Hai đáp án đúng → từ chối.
  - Làm bài chỉ gửi một `selected_option_id` mỗi câu.

## 15) Rủi ro và giảm thiểu

- Rủi ro: Luồng học hiện tại chưa có content item quiz native.  
  **Giảm thiểu:** map quiz thành “assessment milestones” tách khỏi `Lesson.type`.
- Rủi ro: Team chưa bỏ hết luồng override cũ.  
  **Giảm thiểu:** xóa endpoint/UI override và thêm test contract.
- Rủi ro: Nhầm lẫn với JLPT.  
  **Giảm thiểu:** document và prefix bảng rõ ràng; không join `jlpt_*` trong code LMS quiz.

## 16) Kết luận

Giải pháp đúng yêu cầu khách hàng: **cố định hóa quiz theo CourseProfile**, không override theo class; **câu hỏi LMS thống nhất kiểu một đáp án, bốn phương án** (giống trải nghiệm JLPT nhưng **không** dùng chung schema JLPT). Cách này đơn giản, dễ vận hành, giảm lệch nội dung giữa VOD và Live, và vẫn đủ ba lớp đánh giá: quiz theo lesson, kiểm tra chương, và final exam.
