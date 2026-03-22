# Đặc tả Quiz / Trắc nghiệm (LMS V2 — CourseProfile-centric)

Tài liệu spec cho Backend & Frontend, **đã căn chỉnh** với kiến trúc hiện tại: không còn `Syllabus`, lộ trình nội dung là **CourseProfile → Module → Lesson**, lớp vận hành là **Class**, học viên gắn qua **Enrollment**.

---

## 0. Phân tích & Lựa chọn giải pháp (khuyến nghị)

### Bối cảnh thực tế trong repo

- **Syllabus đã gỡ**; khóa / versioning nội dung gắn với **CourseProfile** (`DRAFT` → duyệt → `PUBLISHED`, chỉnh sửa profile chính khi `DRAFT`, bản mới nhờ **duplicate**).
- **Lesson** hiện chỉ `VIDEO` | `READING`; bài tập tự luận dùng **Assignment** + **ClassAssignment** (giao theo lớp).
- Bảng **Academy Exam** cũ đã bị **drop** trong migration overhaul; **JLPT Mock Exam** là **module tách biệt** — không gộp vào quiz khóa học thường.
- Learner vẫn có route/UI nhắc tới **Exam** (`/exams/...`) — cần **hợp nhất** với lớp assessment mới để tránh hai nền song song.

### Các hướng đã xem xét

| Hướng | Ưu | Nhược |
|--------|-----|--------|
| **A. Một bảng `ClassDelivery` đa loại** (quiz + assignment + …) | Một API “giao bài” | Refactor lớn `ClassAssignment`, migration rủi ro, khó đọc query |
| **B. Gắn quiz chỉ qua JSON/metadata trên Lesson** | Nhanh | Khó query, khó khóa phiên bản, khó chấm & audit |
| **C. Ngân hàng `QuizTemplate` + bảng giao lớp riêng (`ClassQuiz`) + Lesson kiểu `QUIZ`** | **Đồng nhất** với pattern Assignment/ClassAssignment; curriculum vẫn là một cây Lesson | Thêm vài bảng/quan hệ |

### Khuyến nghị (giải pháp tốt nhất cho LMS này): **Hướng C**

1. **Một nguồn nội dung trắc nghiệm**: `QuizTemplate` + `QuizQuestion` + `QuizOption` (content bank).
2. **Một vị trí trong lộ trình**: mở rộng `LessonType` thêm **`QUIZ`**, thêm `lesson.quizTemplateId` (bắt buộc khi `type = QUIZ`).
3. **Giao thêm cho lớp LIVE** (ôn tập / kiểm tra phụ): bảng **`ClassQuiz`** song song **`ClassAssignment`** — cùng kiểu “master + delivery”, team đã quen mental model.
4. **Exit assessment**: `courseProfile.exitQuizTemplateId` (mặc định khóa) + tùy chọn `class.exitQuizTemplateId` **ghi đè** (nullable = dùng của profile).
5. **Đặt tên API**: dùng **`/api/academy/quizzes`** (hoặc `quiz-templates` / `quiz-attempts`) cho nghiệp vụ mới; **deprecated** flow Exam cũ: redirect hoặc adapter mỏng sang endpoint mới trong một phiên bản để không gãy bookmark.
6. **Tách bạch JLPT**: không map `QuizTemplate` sang JLPT; JLPT giữ pipeline riêng.

### Khóa phiên bản (thay cho “SyllabusService.lock”)

- Gắn với **CourseProfile lifecycle**: khi profile chuyển sang trạng thái **không còn soạn thảo tự do** (khuyến nghị: **`PUBLISHED`**), mọi `QuizTemplate` được **Lesson** trong profile đó tham chiếu → chuyển **`LOCKED`** (cấm sửa câu hỏi/đáp án).
- Khi **`CourseProfileService.duplicate`**: **deep-clone** từng `QuizTemplate` gắn lesson + gán `quizTemplateId` mới cho bản lesson clone (tương tự clone lesson hiện tại nhưng thêm nhánh quiz).

---

## 1. Kiến trúc tổng quan

Mô hình **hybrid** giữ nguyên tinh thần ban đầu, đổi “Syllabus” → **CourseProfile / Lesson**:

| Khái niệm | Nơi quản lý | Mô tả |
|-----------|-------------|--------|
| **Quiz trong lộ trình** | `Lesson` (`type = QUIZ`) | Một bài trong module; học xong / đạt điểm → có thể `markLessonComplete`. |
| **Quiz giao riêng lớp** | `ClassQuiz` | Giảng viên giao thêm từ ngân hàng template; có `openAt` / `deadline`. |
| **Exit quiz** | `CourseProfile` + override `Class` | Bài buộc đạt trước khi coi là hoàn thành khóa (tích hợp `Enrollment`). |

---

## 2. Prisma Schema (bổ sung / chỉnh sửa)

> Áp dụng vào `apps/server/prisma/schema.prisma`. Cần **migration** và cập nhật quan hệ `User`, `Class`, `CourseProfile`, `Lesson`.

### 2.1. Mở rộng enum & model hiện có

```prisma
enum LessonType {
  VIDEO
  READING
  QUIZ // Mới: bài trắc nghiệm trong curriculum
}

// Bổ sung vào model Lesson:
//   quizTemplateId String? @map("quiz_template_id") @db.Uuid
//   quizTemplate   QuizTemplate? @relation(fields: [quizTemplateId], references: [id], onDelete: Restrict)
//   quizAttempts   QuizAttempt[]
// Ràng buộc nghiệp vụ (service layer): type = QUIZ ⇒ quizTemplateId bắt buộc; type khác ⇒ null.

// Bổ sung vào model CourseProfile:
//   exitQuizTemplateId String? @map("exit_quiz_template_id") @db.Uuid
//   exitQuizTemplate   QuizTemplate? @relation("CourseProfileExitQuiz", ...)

// Bổ sung vào model Class:
//   exitQuizTemplateId String? @map("exit_quiz_template_id") @db.Uuid  // null = inherit CourseProfile
//   exitQuizTemplate   QuizTemplate? @relation("ClassExitQuizOverride", ...)
//   classQuizzes       ClassQuiz[]
```

### 2.2. Models quiz engine

```prisma
enum QuizTemplateStatus {
  DRAFT   // Đang soạn
  LOCKED  // Đã khóa theo CourseProfile PUBLISHED (hoặc theo policy đã chốt)
}

enum QuizAttemptStatus {
  IN_PROGRESS
  SUBMITTED
}

model QuizTemplate {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  code        String   @unique @db.VarChar(50)
  title       String   @db.VarChar(255)
  description String?  @db.Text
  passScore   Int      @default(80) // Điểm đạt (0–100)
  timeLimitMinutes Int? @map("time_limit_minutes") // null = không giới hạn
  status      QuizTemplateStatus @default(DRAFT)

  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  questions   QuizQuestion[]
  lessons     Lesson[]
  classQuizzes ClassQuiz[]
  attempts    QuizAttempt[]

  courseProfilesExit CourseProfile[] @relation("CourseProfileExitQuiz")
  classesExitOverride Class[]        @relation("ClassExitQuizOverride")

  @@map("academy_quiz_templates")
}

model QuizQuestion {
  id             String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  quizTemplateId String   @map("quiz_template_id") @db.Uuid
  stem           String   @db.Text
  explanation    String?  @db.Text
  orderIndex     Int      @map("order_index")

  quizTemplate QuizTemplate @relation(fields: [quizTemplateId], references: [id], onDelete: Cascade)
  options      QuizOption[]
  userAnswers  QuizAnswer[]

  @@map("academy_quiz_questions")
}

model QuizOption {
  id          String  @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  questionId  String  @map("question_id") @db.Uuid
  contentText String  @map("content_text") @db.Text
  isCorrect   Boolean @default(false) @map("is_correct")
  orderIndex  Int     @map("order_index")

  question   QuizQuestion @relation(fields: [questionId], references: [id], onDelete: Cascade)
  selectedIn QuizAnswer[] @relation("QuizAnswerSelectedOption")

  @@map("academy_quiz_options")
}

model ClassQuiz {
  id             String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  classId        String    @map("class_id") @db.Uuid
  quizTemplateId String    @map("quiz_template_id") @db.Uuid
  openAt         DateTime? @map("open_at")
  deadline       DateTime?
  isMandatory    Boolean   @default(true) @map("is_mandatory")

  class        Class        @relation(fields: [classId], references: [id], onDelete: Cascade)
  quizTemplate QuizTemplate @relation(fields: [quizTemplateId], references: [id], onDelete: Cascade)
  attempts     QuizAttempt[]

  @@unique([classId, quizTemplateId])
  @@map("academy_class_quizzes")
}

model QuizAttempt {
  id             String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId         String   @map("user_id") @db.Uuid
  quizTemplateId String   @map("quiz_template_id") @db.Uuid
  classId        String?  @map("class_id") @db.Uuid
  /// Bối cảnh lesson (khi làm quiz trong lộ trình); null nếu chỉ là class quiz / exit
  lessonId       String?  @map("lesson_id") @db.Uuid
  classQuizId    String?  @map("class_quiz_id") @db.Uuid
  attemptKind    String   @default("LESSON") @map("attempt_kind") // LESSON | CLASS_QUIZ | EXIT — hoặc dùng enum

  score        Int               @default(0)
  isPassed     Boolean           @default(false) @map("is_passed")
  status       QuizAttemptStatus @default(IN_PROGRESS)

  startedAt   DateTime  @default(now()) @map("started_at")
  submittedAt DateTime? @map("submitted_at")

  user         User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  quizTemplate QuizTemplate @relation(fields: [quizTemplateId], references: [id], onDelete: Restrict)
  class        Class?       @relation(fields: [classId], references: [id], onDelete: SetNull)
  lesson       Lesson?      @relation(fields: [lessonId], references: [id], onDelete: SetNull)
  classQuiz    ClassQuiz?   @relation(fields: [classQuizId], references: [id], onDelete: SetNull)
  answers      QuizAnswer[]

  @@index([userId, quizTemplateId])
  @@index([classId])
  @@map("academy_quiz_attempts")
}

model QuizAnswer {
  id               String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  attemptId        String @map("attempt_id") @db.Uuid
  questionId       String @map("question_id") @db.Uuid
  selectedOptionId String? @map("selected_option_id") @db.Uuid

  attempt        QuizAttempt  @relation(fields: [attemptId], references: [id], onDelete: Cascade)
  question       QuizQuestion @relation(fields: [questionId], references: [id], onDelete: Restrict)
  selectedOption QuizOption?  @relation("QuizAnswerSelectedOption", fields: [selectedOptionId], references: [id], onDelete: SetNull)

  @@unique([attemptId, questionId])
  @@map("academy_quiz_answers")
}
```

**Ghi chú implementation:**

- `QuizAttempt` cần quan hệ tới `Class` / `Lesson` nếu thêm FK — cập nhật tương ứng trên `Class` và `Lesson`.
- Có thể thay `attemptKind` + nullable FKs bằng **enum một cột** `QuizAttemptContext` + rule validate trong service (gọn schema hơn).

---

## 3. Quy trình nghiệp vụ

### 3.1. Khóa & clone

1. **`CourseProfileService.approve`** (hoặc ngay khi chuyển `PUBLISHED`): Duyệt tất cả `Lesson` thuộc profile có `quizTemplateId` → set `QuizTemplate.status = LOCKED`.
2. **Sửa nội dung sau khi đã publish**: tạo **CourseProfile mới** qua `duplicate` → clone quiz + lesson trỏ template mới (DRAFT).
3. **`QuizTemplate` độc lập** chưa gắn profile nào: có thể giữ `DRAFT` để tái sử dụng; policy có thể bổ sung “không cho publish lesson QUIZ trỏ template DRAFT”.

### 3.2. Chấm điểm & tiến độ

- `isPassed` khi `(đúng / tổng câu) * 100 >= passScore` (làm tròn thống nhất một chuẩn trong `QuizService`).
- **Lesson QUIZ**: sau `submit` nếu `isPassed` → gọi `markLessonComplete(userId, classId, lessonId)` (đã có trong `ClassService`).
- **Exit quiz**: điều kiện gọi `EnrollmentService.completeEnrollment` (hoặc tương đương) **chỉ khi** attempt `EXIT` cuối cùng `isPassed` (và các rule khóa học khác nếu có).
- **ClassQuiz**: không tự hoàn thành lesson; có thể hiển thị trong dashboard giảng viên / báo cáo.

### 3.3. Bảo mật

- API **start / save draft**: không trả `isCorrect` cho options.
- API **review** sau submit: mới trả đáp án đúng + `explanation` theo policy (có thể giới hạn thời gian hoặc chỉ sau deadline).

---

## 4. UI/UX (giữ nguyên hướng, bổ sung chỗ cần)

### 4.1. Learner (Next.js — `web-learner`)

- **Player**: header (tiêu đề, nộp bài, countdown), navigator câu, vùng câu hỏi, cảnh báo hết giờ / auto-submit.
- **Kết quả**: % điểm, Đạt/Không đạt, xem lại (sau submit), làm lại nếu policy cho phép.
- **Điều hướng**: từ trang học lesson `QUIZ` mở player với `lessonId` + `classId`; exit quiz từ màn “Kết thúc khóa” hoặc banner cố định.

### 4.2. Admin (React — `web-admin`)

- **Quiz Builder**: CRUD template, câu hỏi, option, đánh dấu đúng, kéo thả `orderIndex` (chỉ khi `status != LOCKED`).
- **Course editor**: thêm lesson loại QUIZ, chọn template; set exit quiz mặc định trên CourseProfile.
- **Lớp**: tab tương tự Assignment — danh sách `ClassQuiz`, modal giao từ ngân hàng + deadline; override exit quiz nếu cần.

---

## 5. API (Gateway — convention `/api/academy/...`)

**Learner / chung**

- `POST   /api/academy/quiz-attempts/start` — body: `classId`, và một trong: `lessonId` | `classQuizId` | `kind: EXIT`.
- `PATCH  /api/academy/quiz-attempts/:id/answers` — autosave từng câu (hoặc batch nhỏ).
- `POST   /api/academy/quiz-attempts/:id/submit` — chấm, trả kết quả.
- `GET    /api/academy/quiz-attempts/:id` — chi tiết sau submit (review), có `isCorrect` theo policy.

**Staff / admin**

- `POST   /api/academy/quiz-templates` / `GET` / `PATCH` — quản lý template (respect `LOCKED`).
- `GET    /api/academy/quiz-templates/:id` — include questions (admin); learner dùng DTO đã ẩn đáp án.
- `POST   /api/academy/classes/:classId/class-quizzes` — giao quiz phụ.

*(Đường dẫn chi tiết có thể map sang NATS cmd pattern hiện có trong `academy` service.)*

---

## 6. Checklist triển khai

- [ ] Migration: bảng quiz + cột `LessonType.QUIZ`, `lesson.quizTemplateId`, `courseProfile.exitQuizTemplateId`, `class.exitQuizTemplateId`, FK `User`/relations.
- [ ] `QuizService`: start/save/submit/score, không lộ đáp án trước submit.
- [ ] `CourseProfileService.approve`: khóa mọi `QuizTemplate` được curriculum sử dụng.
- [ ] `CourseProfileService.duplicate`: deep-clone quiz templates gắn lesson.
- [ ] `ClassService` / curriculum API: trả `type: QUIZ` và metadata cần cho learner.
- [ ] Tích hợp `markLessonComplete` khi lesson quiz pass.
- [ ] Rule **Exit quiz** + `Enrollment.completeEnrollment` (và UI chặn “hoàn thành khóa” nếu chưa đạt).
- [ ] Admin: builder + giao `ClassQuiz` + exit settings.
- [ ] Learner: player + redirect từ route Exam cũ (nếu còn) sang flow mới.
- [ ] **Không** trộn với module JLPT (dataset/API riêng).

---

## 7. Phạm vi tương lai

- Loại câu hỏi mở rộng (multi-select, matching), ngân hàng câu hỏi dùng chung, anti-cheat nhẹ, giới hạn số lần làm lại — bổ sung sau khi MCQ ổn định.

---

*Tài liệu thay thế các mục tham chiếu `Syllabus` / `SyllabusService` trong bản plan cũ; mọi task implement nên trace về **CourseProfile + Class + Lesson** như trên.*
