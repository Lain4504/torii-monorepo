# SPEC: Quiz Co Dinh cho LMS (VOD Package + Live Class)

## 1) Muc tieu

- Bo sung tinh nang quiz don gian cho he thong LMS.
- Quiz la **co dinh theo CourseProfile** (master), khong co co che override theo tung VOD package hay tung live class.
- Ho tro 3 lop danh gia:
  - Quiz sau mot so lesson (lesson checkpoint quiz).
  - Bai kiem tra lon moi chuong (module/chapter checkpoint exam).
  - Bai kiem tra tong ket cuoi khoa (final exam).

## 2) Ket luan nghiep vu sau review khach hang

- Dung 1 bo quiz/exam co dinh cho moi CourseProfile.
- Nguoi hoc VOD package va nguoi hoc live class (ke ca hoc vien live xem VOD replay) cung dung cung bo quiz/exam do.
- **Khong lam override** (khong chon exam rieng theo class, khong generate exam rieng theo class).
- Quy tac khoa mo:
  - VOD package: co khoa tien do, phai hoc den moc quy dinh va lam quiz thi moi hoc tiep.
  - Live class: khong khoa hoc tap theo quiz (vi dac thu hoc live/luyen giao tiep), quiz chu yeu de danh gia tien do.

## 3) Hien trang codebase (AS-IS)

- Luong hoc hien tai trong learner dang dua tren curriculum `Module -> Lesson` va `Lesson.type` chi co `VIDEO | READING`.
- Trang quiz theo route cu:
  - `courses/[courseId]/quizzes`: dang hien thong bao "Chua co bai kiem tra duoc phat hanh".
  - `courses/[courseId]/quizzes/[quizId]`: da deprecate, redirect ve danh sach.
- Service exam/question pool/exam attempt da co DTO va API client cho admin/learner, nhung chua gan chat vao luong hoc curriculum hien tai.
- UI admin van con dau vet y tuong override quiz cho live class, nhung yeu cau moi la bo toan bo huong override.

## 4) Pham vi trien khai (IN-SCOPE)

- Dinh nghia "assessment plan" co dinh theo CourseProfile.
- Gan exam co san vao cac moc:
  - Sau lesson X (checkpoint nho).
  - Ket thuc module/chapter Y (checkpoint lon).
  - Ket thuc khoa (final).
- Learner flow:
  - VOD: enforce gate.
  - Live: khong enforce gate.
- Tracking ket qua exam attempt theo enrollment nguoi hoc.
- Hien thi trang thai chua lam/da lam/qua-rot cho cac moc quiz.

## 5) Ngoai pham vi (OUT-OF-SCOPE)

- Khong thiet ke he thong de ngau nhien theo tung class.
- Khong phat sinh ban de rieng cho moi live class.
- Khong lam adaptive path phuc tap trong phase nay.
- Khong thay doi logic assignment tu luan hien co.

## 5.1) Quyet dinh ve compatibility

- **Khong yeu cau backward compatibility**.
- Cho phep thay doi schema/API theo thiet ke moi, khong can giu contract cu cua luong quiz legacy.
- Uu tien su don gian, tinh nhat quan va de van hanh lau dai.

## 6) Nguyen tac thiet ke

- Single source of truth:
  - Exam va mapping quiz thuoc cap `CourseProfile`.
- Delivery object (`VodPackage`, `LiveClass`) chi "consume" assessment plan cua CourseProfile.
- Du lieu co dinh, de quan tri, de test, de giai thich voi khach hang.

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

=> Nghĩa là phần curriculum, enrollment, progress đã đủ để làm gating theo lesson/module.

### 7.2 Các bảng quiz/exam tổng quát còn thiếu (cần bổ sung)

Hiện tại trong `schema.prisma` **không còn** các model exam tổng quát cho Academy (non-JLPT), trong khi code DTO/service vẫn có luồng exam/attempt.  
Đề xuất bổ sung các bảng sau:

1) `academy_exams`  
- Mục đích: lưu đề quiz/exam cố định theo CourseProfile.  
- Cột chính:
  - `id` (uuid, PK)
  - `course_profile_id` (nullable FK -> `academy_course_profiles`)
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
  - `exam_id` (FK -> `academy_exams`)
  - `title`, `instruction` (nullable)
  - `section_type`
  - `time_limit_seconds` (nullable)
  - `order_index`
  - `metadata` (jsonb, nullable)
  - `created_at`, `updated_at`

3) `academy_questions`  
- Mục đích: ngân hàng câu hỏi tổng quát cho LMS (không dùng bộ JLPT riêng).  
- Cột chính:
  - `id` (uuid, PK)
  - `question_type` (SINGLE_CHOICE | MULTIPLE_CHOICE | TRUE_FALSE | SHORT_TEXT)
  - `stem` (text)
  - `explanation` (nullable)
  - `difficulty` (nullable)
  - `metadata` (jsonb, nullable)
  - `created_at`, `updated_at`

4) `academy_question_categories`
- Muc dich: phan loai cau hoi tap trung (ky nang, chu de, do kho, muc tieu hoc tap...).
- Cot chinh:
  - `id` (uuid, PK)
  - `code` (unique)
  - `name`
  - `description` (nullable)
  - `parent_id` (nullable, self FK de lam cay category)
  - `is_active` (bool)
  - `created_at`, `updated_at`

5) `academy_question_options`  
- Mục đích: đáp án lựa chọn cho câu hỏi trắc nghiệm.  
- Cột chính:
  - `id` (uuid, PK)
  - `question_id` (FK -> `academy_questions`)
  - `option_key` (A/B/C/D...)
  - `content`
  - `is_correct` (bool)
  - `order_index`

6) `academy_question_category_links`
- Muc dich: map nhieu-nhieu giua cau hoi va category.
- Cot chinh:
  - `question_id` (FK -> `academy_questions`)
  - `category_id` (FK -> `academy_question_categories`)
  - `created_at`
- Rang buoc:
  - PK/Unique (`question_id`, `category_id`)

7) `academy_exam_questions`  
- Mục đích: map câu hỏi vào section của đề.  
- Cột chính:
  - `id` (uuid, PK)
  - `exam_id` (FK -> `academy_exams`)
  - `section_id` (FK -> `academy_exam_sections`)
  - `question_id` (FK -> `academy_questions`)
  - `order_index`
  - `points` (nullable)
  - `metadata` (jsonb, nullable)

8) `academy_exam_attempts`  
- Mục đích: lưu lượt làm bài của học viên.  
- Cột chính:
  - `id` (uuid, PK)
  - `exam_id` (FK -> `academy_exams`)
  - `user_id` (FK -> `users`)
  - `enrollment_id` (nullable FK -> `academy_enrollments`)
  - `class_id` (nullable FK -> `academy_live_classes`)
  - `status` (IN_PROGRESS | SUBMITTED | CANCELLED)
  - `score`, `max_score`, `percentage` (nullable)
  - `is_passed` (nullable)
  - `started_at`, `submitted_at` (nullable), `completed_at` (nullable)
  - `draft_answers` (jsonb, nullable)
  - `result_metadata` (jsonb, nullable)
  - `created_at`, `updated_at`

9) `academy_exam_attempt_answers`  
- Mục đích: lưu câu trả lời chi tiết từng câu trong attempt.  
- Cột chính:
  - `id` (uuid, PK)
  - `attempt_id` (FK -> `academy_exam_attempts`)
  - `exam_question_id` (FK -> `academy_exam_questions`)
  - `question_id` (FK -> `academy_questions`)
  - `selected_option_id` (nullable FK -> `academy_question_options`)
  - `answer_payload` (jsonb, nullable; hỗ trợ short-text/multi-select)
  - `is_correct` (nullable)
  - `score_awarded` (nullable)
  - `answered_at`

10) `academy_course_profile_assessments`  
- Mục đích: map đề thi cố định vào các mốc lesson/module/final theo CourseProfile.  
- Cột chính:
  - `id` (uuid, PK)
  - `course_profile_id` (FK -> `academy_course_profiles`)
  - `exam_id` (FK -> `academy_exams`)
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
  - 1 final exam active / 1 course profile.
- Index gợi ý:
  - `academy_exam_attempts(exam_id, user_id, started_at desc)`
  - `academy_course_profile_assessments(course_profile_id, is_active, order_index)`
  - `academy_exam_questions(exam_id, section_id, order_index)`
  - `academy_questions(question_type, created_at desc)`
  - `academy_question_category_links(category_id, question_id)`

### 7.4 Quan ly ngan hang cau hoi tap trung cho staff

He thong nay dap ung duoc requirement:

- `Staff can manage question banks, adding, categorizing, and reviewing questions for quizzes and exams.`

Bang cach:

- Quan ly tap trung tai nhom bang:
  - `academy_questions`
  - `academy_question_options`
  - `academy_question_categories`
  - `academy_question_category_links`
- Exam chi la lop "compose/deploy", tai su dung cau hoi tu question bank.
- Co workflow review (de xuat):
  - Them `review_status` trong `academy_questions`: `DRAFT | IN_REVIEW | APPROVED | REJECTED`
  - Them `reviewed_by`, `reviewed_at`, `review_note` (nullable)
- Permission goi y:
  - `academy.question_bank.read`
  - `academy.question_bank.write`
  - `academy.question_bank.review`

### 7.5 Không bổ sung schema override theo class

- Không thêm cột/bảng cho override ở `academy_live_classes` hoặc `academy_vod_packages`.
- Không có `override_exam_id`, không có `live_override_mode`.

### 7.6 Tách biệt hoàn toàn với luồng JLPT

- Các bảng JLPT đang có tiền tố `jlpt_*` là module riêng, giữ nguyên.
- Tuyệt đối không tái sử dụng `jlpt_*` cho quiz LMS của VOD/Live class.
- Quiz LMS trong spec này chỉ dùng nhóm bảng `academy_*` nêu tại mục 7.2.

## 8) Quy tac nghiep vu chi tiet

### 8.1 Lesson checkpoint quiz

- Duoc khai bao tai moc lesson cu the.
- Dieu kien mo bai quiz:
  - VOD: lesson trigger da hoan thanh.
  - Live: cho phep vao quiz khi den moc (co the cho vao ngay, khong khoa bai hoc tiep theo).
- Ket qua:
  - Neu pass/fail rule duoc cau hinh trong exam settings thi hien thi dung ket qua.
  - Phase don gian: cho phep hoc vien submit 1+ lan theo setting exam.

### 8.2 Module checkpoint exam (kiem tra tien do lon moi chuong)

- Moi module co the co 0..1 bai kiem tra lon.
- Trigger sau khi hoan tat toan bo lesson trackable trong module.
- VOD:
  - Neu exam module la required va chua hoan tat -> khoa module tiep theo.
- Live:
  - Khong khoa, chi canh bao "chua hoan thanh bai kiem tra chuong".

### 8.3 Final exam

- 1 bai final exam cho moi CourseProfile (ban active).
- Trigger khi hoan tat hoc phan theo quy tac (vd: het module hoac dat nguong progress).
- VOD:
  - Co the dung lam dieu kien "hoan thanh khoa hoc" (khuyen nghi).
- Live:
  - Khong khoa hoc buoi live; dung de danh gia tong ket/cuoi ky.

## 9) Rule khoa mo theo loai chuong trinh

### 9.1 VOD package (co gate)

- Rule chinh:
  - Hoc den moc -> lam quiz required -> moi mo tiep.
- Gate uu tien:
  1. Lesson prerequisite (hien co).
  2. Required assessment gate tai moc lesson/module.
  3. Module sau bi khoa neu module checkpoint chua dat quy tac required.

### 9.2 Live class (khong gate)

- Khong khoa lesson/module vi quiz.
- Voi khoa luyen giao tiep hoac hoc live thuan, co the tat required gate bang cau hinh curriculum level (`is_required=false`) nhung van hien thi bai kiem tra de hoc vien tu danh gia.

## 10) API va backend contract de xuat

### 10.1 Admin

- `GET /api/academy/course-profiles/:id/assessment-plan`
- `PUT /api/academy/course-profiles/:id/assessment-plan`
  - Input la danh sach mapping co dinh (lesson/module/final).
  - Validate:
    - exam phai `PUBLISHED`
    - trigger lesson/module phai thuoc course profile
    - khong cho duplicate vi tri trigger.

### 10.2 Learner

- `GET /api/academy/live-classes/:classId/assessment-plan`
  - Tra ve plan da resolve tu CourseProfile cua class/enrollment.
- `GET /api/academy/live-classes/:classId/assessment-status`
  - Tra ve trang thai cua tung moc: locked/available/in_progress/submitted/passed/failed.
- `POST /api/academy/exam-attempts/start`
  - Nhap `examId`, `classId` (hoac `enrollmentId`) va context moc assessment.
- `POST /api/academy/exam-attempts/:id/submit`
  - Sau submit, cap nhat gate state cho enrollment.

## 11) Frontend thay doi toi thieu

### 11.1 Web Admin

- Bo UI/chuc nang override exam cho live class.
- Them man hinh "Assessment Plan" trong CourseProfile:
  - Chon exam co san cho tung moc lesson/module/final.
  - Preview thu tu va required flag.

### 11.2 Web Learner

- Tai trang hoc:
  - Hien item quiz dung moc trong sidebar/timeline.
  - VOD: item tiep theo hien lock neu chua qua gate required.
  - Live: khong lock, chi hien badge nhac nho.
- Trang quizzes:
  - Khong con thong bao trong; hien danh sach quiz/exam theo assessment plan.

## 12) Tieu chi chap nhan (Acceptance Criteria)

- AC1: 1 CourseProfile co 1 assessment plan co dinh; VOD va Live deu dung cung plan.
- AC2: Khong ton tai luong override exam theo live class/vod package.
- AC3: VOD enforce gate dung:
  - Chua dat quiz required thi khong hoc tiep.
- AC4: Live class khong bi khoa bai hoc do quiz.
- AC5: Co bai kiem tra chuong va bai final theo cau hinh.
- AC6: Learner xem duoc trang thai tung moc quiz ro rang.
- AC7: Admin cau hinh duoc plan ma khong can tao du lieu theo tung class.

## 13) Migration va rollout

### 13.1 Du lieu

- Tạo migration cho toàn bộ nhóm bảng ở mục 7.2 (ưu tiên theo thứ tự phụ thuộc FK):
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

- Xoa/an UI override trong `class-quiz-source-*`.
- Doi thong diep route quiz learner tu "chua co bai kiem tra" thanh lay theo assessment plan.

### 13.3 Rollout an toan

- Bat bang feature flag: `ACADEMY_FIXED_QUIZ_PLAN`.
- UAT voi 1 khoa VOD + 1 khoa Live truoc khi bat rong.

## 14) Test scenario toi thieu

- VOD:
  - Hoc den lesson trigger, quiz mo.
  - Chua dat quiz required -> bai tiep theo bi khoa.
  - Dat quiz -> mo tiep.
  - Ket thuc module -> module checkpoint xuat hien.
  - Final exam xuat hien cuoi khoa.
- Live:
  - Quiz/module/final van hien thi.
  - Khong co khoa bai hoc du chua lam quiz.
- Dung chung:
  - Hoc vien live xem VOD replay van dung cung bo quiz co dinh.
  - Khong co endpoint nao cho phep set override theo class.

## 15) Rui ro va giam thieu

- Rui ro: Luong hoc hien tai chua co content item quiz native.
  - Giam thieu: map quiz thanh "assessment milestones" tach khoi `Lesson.type`.
- Rui ro: Du lieu legacy exam/cohort truoc day khong dong nhat.
  - Giam thieu: script backfill + danh dau cac plan chua day du de staff review.
- Rui ro: Team quen chua bo luong override cu.
  - Giam thieu: xoa endpoint/UI override va them test contract.

## 16) Ket luan

Giai phap dung yeu cau khach hang la "co dinh hoa quiz theo CourseProfile", khong override theo class. Cach nay don gian, de van hanh, giam sai lech noi dung giua VOD va Live, va van dam bao duoc 3 lop danh gia: quiz theo lesson, kiem tra chuong, va final exam.

