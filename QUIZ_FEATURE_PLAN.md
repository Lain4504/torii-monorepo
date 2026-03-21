# Tài liệu Đặc tả Tính năng Quiz (Hybrid LMS Engine)

Tài liệu này đóng vai trò là bản đặc tả kỹ thuật (Spec) để đội ngũ phát triển (Backend & Frontend) có thể triển khai tính năng Quiz cho hệ thống LMS hiện tại.

---

## 1. Kiến trúc Tổng quan (Architectural Overview)

Hệ thống Quiz được thiết kế theo mô hình **Hybrid (Lai)**: đảm bảo tính chuẩn hóa của nội dung bài học (Syllabus) và tính linh hoạt cho giảng viên dạy trực tiếp (Class LIVE).

*   **Quiz Lesson**: Quản lý bởi `Syllabus`. Là một bài học trong lộ trình học tập.
*   **Class Quiz**: Quản lý bởi `Class`. Là bài tập về nhà hoặc bài kiểm tra bổ trợ do giảng viên giao.
*   **Exit Quiz**: Bài thi cuối khoá (có thể lấy từ Syllabus mặc định hoặc do lớp LIVE ghi đè).

---

## 2. Chi tiết Cơ sở dữ liệu (Prisma Schema)

Cần bổ sung các Model sau vào `schema.prisma`. Lưu ý các mối quan hệ (Relations) và cơ chế Khóa (Locking).

```prisma
// --- Quiz Engine Models ---

enum QuizStatus {
  DRAFT     // Đang soạn, có thể sửa nội dung
  LOCKED    // Đã gắn vào Syllabus/Class đã xuất bản, chỉ đọc
}

model QuizTemplate {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  code        String   @unique @db.VarChar(50)
  title       String   @db.VarChar(255)
  description String?  @db.Text
  passScore   Int      @default(80) // Điểm đạt (trên 100)
  timeLimit   Int?     @map("time_limit") // Phút (null = không giới hạn)
  status      QuizStatus @default(DRAFT)
  
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @default(now()) @updatedAt @map("updated_at")

  questions   QuizQuestion[]
  lessonLinks Lesson[]       // Liên kết bài học Quiz
  classQuizzes ClassQuiz[]    // Liên kết bài tập lớp LIVE
  attempts    QuizAttempt[]
  
  // Exit Quiz default in Syllabus
  syllabusesWithExit Syllabus[] @relation("SyllabusExitQuiz")
  // Exit Quiz override in Class
  classesWithExit   Class[]    @relation("ClassExitQuizOverride")

  @@map("academy_quiz_templates")
}

model QuizQuestion {
  id             String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  quizTemplateId String   @map("quiz_template_id") @db.Uuid
  stem           String   @db.Text // Nội dung câu hỏi
  explanation    String?  @db.Text // Giải thích đáp án
  orderIndex     Int      @map("order_index")
  
  quizTemplate   QuizTemplate @relation(fields: [quizTemplateId], references: [id], onDelete: Cascade)
  options        QuizOption[]
  userAnswers    QuizAnswer[]

  @@map("academy_quiz_questions")
}

model QuizOption {
  id         String  @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  questionId String  @map("question_id") @db.Uuid
  contentText String @map("content_text") @db.Text
  isCorrect  Boolean @default(false) @map("is_correct")
  orderIndex Int     @map("order_index")

  question   QuizQuestion @relation(fields: [questionId], references: [id], onDelete: Cascade)
  selectedIn QuizAnswer[] @relation("SelectedOption")

  @@map("academy_quiz_options")
}

model ClassQuiz {
  id             String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  classId        String    @map("class_id") @db.Uuid
  quizTemplateId String    @map("quiz_template_id") @db.Uuid
  openAt         DateTime? @map("open_at")
  deadline       DateTime?
  isMandatory    Boolean   @default(true) @map("is_mandatory")

  class          Class        @relation(fields: [classId], references: [id], onDelete: Cascade)
  quizTemplate   QuizTemplate @relation(fields: [quizTemplateId], references: [id], onDelete: Cascade)

  @@unique([classId, quizTemplateId])
  @@map("academy_class_quizzes")
}

model QuizAttempt {
  id             String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId         String    @map("user_id") @db.Uuid
  quizTemplateId String    @map("quiz_template_id") @db.Uuid
  classId        String?   @map("class_id") @db.Uuid // Context lượt làm bài
  
  score          Int       @default(0)
  isPassed       Boolean   @default(false) @map("is_passed")
  status         String    @default("IN_PROGRESS") // IN_PROGRESS, SUBMITTED
  
  startedAt      DateTime  @default(now()) @map("started_at")
  submittedAt    DateTime? @map("submitted_at")

  user           User         @relation(fields: [userId], references: [id])
  quizTemplate   QuizTemplate @relation(fields: [quizTemplateId], references: [id])
  answers        QuizAnswer[]

  @@map("academy_quiz_attempts")
}

model QuizAnswer {
  id               String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  attemptId        String @map("attempt_id") @db.Uuid
  questionId       String @map("question_id") @db.Uuid
  selectedOptionId String? @map("selected_option_id") @db.Uuid

  attempt        QuizAttempt  @relation(fields: [attemptId], references: [id], onDelete: Cascade)
  question       QuizQuestion @relation(fields: [questionId], references: [id])
  selectedOption QuizOption?  @relation("SelectedOption", fields: [selectedOptionId], references: [id])

  @@unique([attemptId, questionId])
  @@map("academy_quiz_answers")
}
```

---

## 3. Quy trình Nghiệp vụ (Business Logic)

### 3.1. Logic Khóa phiên bản nội dung (Versioning)
*   Mặc định `QuizTemplate` là `DRAFT`.
*   Khi `SyllabusService.lock(id)` được gọi:
    1. Lấy danh sách tất cả `Lesson` có `quizTemplateId != null`.
    2. Chuyển trạng thái các `QuizTemplate` này sang `LOCKED`.
    3. `LOCKED` QuizTemplate: Không cho phép thêm/sửa/xóa Question và Option.
*   Khi `SyllabusService.create()` (cloning): Clone cả QuizTemplate liên kết (tạo bản sao mới) nếu cần chỉnh sửa riêng, hoặc giữ nguyên ID nếu dùng chung (vô hiệu hóa chỉnh sửa).

### 3.2. Chấm điểm & Tiến độ học tập
*   Kết quả `QuizAttempt.isPassed` được quyết định bởi: `(Số câu đúng / Tổng số câu) * 100 >= QuizTemplate.passScore`.
*   Đối với Quiz thuộc loại **Lesson**: Khi `isPassed = true`, hệ thống tự động gọi hàm `markLessonComplete` cho bài học đó.
*   Đối với **Exit Quiz**: Enrollment chỉ được chuyển sang `COMPLETED` khi `Exit Quiz` đã đạt `isPassed`.

---

## 4. Đặc tả Giao diện (UI/UX Spec)

### 4.1. Learner App (Frontend - Next.js)
*   **Quiz Player Interface**:
    - **Header**: Hiển thị Tiêu đề Quiz, Nút "Nộp bài", Đồng hồ đếm ngược (nếu có `timeLimit`).
    - **Sidebar/Nav question**: Danh sách số hiệu câu hỏi (1, 2, 3...) để nhảy nhanh. Đổi màu ô số khi học viên đã chọn đáp án.
    - **Question Area**: Hiển thị Nội dung câu hỏi (`stem`) và các Radio button lựa chọn (`QuizOption`).
    - **Overlay Warning**: Cảnh báo khi thời gian sắp hết. Tự động thu bài khi hết giờ.
*   **Result View**:
    - Hiển thị Score dạng % và kết quả (ĐẠT/KHÔNG ĐẠT) kèm pháo hoa nếu Đạt.
    - Nút "Xem lại đáp án" (mở ra giao diện tương tự Player nhưng highlight đáp án đúng/sai và hiển thị `explanation`).
    - Nút "Làm lại" (nếu chưa đạt).

### 4.2. Admin App (Frontend - React)
*   **Quiz Builder**:
    - Giao diện dạng Flow: Thêm câu hỏi nhanh -> Nhập nội dung vế trên -> Nhập 4 đáp án vế dưới -> Click chọn "Correct" trên đáp án đúng.
    - Support kéo thả `orderIndex`.
*   **Class Quiz Dashboard**:
    - Hiển thị danh sách Quiz đang giao cho lớp LIVE.
    - Nút "Giao bài từ ngân hàng": Mở Modal chọn `QuizTemplate` và set `deadline`.

---

## 5. Danh sách Endpoints API (Backend)

*   **Learner API**:
    - `POST /academy/quiz/attempts`: Bắt đầu một lượt làm bài mới (Tạo record `QuizAttempt`, trả về đề bài nhưng KHÔNG trả về `isCorrect`).
    - `PATCH /academy/quiz/attempts/:id/answer`: Lưu nháp câu trả lời cho một câu hỏi trong khi đang thi.
    - `POST /academy/quiz/attempts/:id/submit`: Kết thúc bài thi, tính điểm, trả về kết quả (Pass/Fail).
*   **Admin API**:
    - `POST /academy/quiz/templates`: Tạo mới đề thi.
    - `GET /academy/quiz/templates/:id/questions`: Quản trị nội dung câu hỏi (Chỉ cho phép nếu `status != LOCKED`).
    - `POST /academy/class/quizzes`: Giao Quiz bổ trợ cho lớp LIVE.

---

## 6. Checklist Triển khai cho Developer

- [ ] Chạy Migration Prisma cho 6 bảng mới và các trường bổ sung ở model cũ.
- [ ] Implement `QuizService` xử lý logic chấm điểm Server-side.
- [ ] Cập nhật `SyllabusService` thêm logic khóa Quiz khi khóa Syllabus.
- [ ] Cập nhật `ClassService` logic kiểm tra hoàn thành (Completion Check) tích hợp Exit Quiz.
- [ ] Xây dựng giao diện Quiz Player mượt mà trên Mobile & Web.
- [ ] Đảm bảo cơ chế Security: Không bao giờ trả về cột `isCorrect` cho Client trước khi nộp bài.

---
*Dài hạn: Hệ thống này có thể mở rộng thêm các loại câu hỏi tự luận hoặc kéo thả trong tương lai.*
