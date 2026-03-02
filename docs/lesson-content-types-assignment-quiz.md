# Quy trình Lesson: Video / Quiz / Assignment

Tài liệu này phân tích nghiệp vụ thực tế cho các loại `Lesson` trong hệ thống (VOD & Live), tập trung vào hai loại đặc biệt: **QUIZ** và **ASSIGNMENT**, trên nền kiến trúc hiện tại (Course Master / Course Run / Assignment / Quiz / Submission).

---

## 1. Mô hình dữ liệu liên quan

### 1.1. Lesson

```ts
// packages/schemas/src/models/lesson.model.ts
export enum LessonContentType {
  VIDEO = 'video',
  ARTICLE = 'article',
  QUIZ = 'quiz',
  ASSIGNMENT = 'assignment',
}

export const lessonSchema = z.object({
  id: z.string().uuid(),
  moduleId: z.string().uuid(),
  title: z.string().min(1),
  contentType: z.nativeEnum(LessonContentType),
  videoUrl: z.string().optional(),
  videoDuration: z.number().optional(),
  durationMinutes: z.number().optional(),
  articleContent: z.string().optional(),
  aiMetadata: z.record(z.any()).optional(),
  orderIndex: z.number().default(0),
  isPreview: z.boolean().default(false),
  isUnlocked: z.boolean().default(false),
  status: z.enum(['published', 'draft']).default('published'),
  createdBy: z.string().uuid().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().optional(),
});
```

### 1.2. Assignment & Submission (tách khỏi Lesson)

- `Assignment` gắn với `courseRunId`, `moduleId`, `lessonId` (ít nhất một trong ba), có `dueDate`, `maxScore`, `type` (TEXT/FILE/BOTH), cấu hình file upload, v.v.
- `Submission` là bài nộp của học viên, gắn với `assignmentId` + `courseRunId` + `userId`, có trạng thái `DRAFT`, `SUBMITTED`, `GRADED`, `RETURNED`, điểm, feedback và lịch sử (GradeHistory).
- UI phía learner:
  - Tab **Assignments** ở `LessonContent` dùng `CourseAssignmentsList` để liệt kê bài tập theo **đúng Course Run mà học viên đã đăng ký** (query theo `courseRunId` lấy từ `Enrollment`), không trộn lẫn các đợt khai giảng khác.
  - Component `AssignmentSubmission` xử lý create/update bài nộp.

### 1.3. Quiz & Exam (tách logic đánh giá khỏi Lesson)

- `Quiz` gắn với `courseRunId` và `lessonId` (hoặc cấp khóa), có `quizType`, số câu, thời gian, cấu hình shuffle, show giải thích, v.v.
- `QuizAttempt` + `QuizAttemptDetail` theo dõi từng lần làm bài, điểm, trạng thái.
- `Exam` là tập hợp quiz/section cao hơn, dùng cho placement test / final exam.

**Kết luận mô hình**: Lesson chỉ đóng vai trò **anchor nội dung** (video/bài viết) và **entry point** để điều hướng tới Assignment/Quiz tương ứng. Toàn bộ logic chấm điểm, hạn nộp, multi‑attempt… được tách sang bảng riêng (Assignment, Submission, Quiz, QuizAttempt).

---

## 2. Nghiệp vụ thực tế cho từng loại Lesson

### 2.1. VIDEO / ARTICLE

**Mục tiêu**: truyền đạt nội dung (video bài giảng, tài liệu đọc).

- Không bắt buộc có Assignment/Quiz kèm theo.
- `durationMinutes` dùng cho:
  - Ước lượng thời gian học.
  - Tính % hoàn thành khóa.
- Flag:
  - `isPreview = true`: dùng cho free preview / marketing (hiển thị public).
  - `isUnlocked = false`: chỉ mở khi đã hoàn thành prerequisite (có thể dùng sau này).

**Business rules đề xuất**:

1. Khi `contentType = VIDEO`:
   - Bắt buộc có `videoUrl` hoặc gắn `aiMetadata` mô tả nguồn video (nếu dùng HLS/ID).
   - `durationMinutes` nên >= 1 để tránh lesson “rỗng”.
2. Khi `contentType = ARTICLE`:
   - `articleContent` không nên rỗng; nếu rỗng thì lesson nên là `draft`.

### 2.2. QUIZ Lesson

**Mục tiêu**: kiểm tra nhanh sau bài học, thường là formative assessment (không tính điểm chính thức hoặc điểm nhẹ).  
Trong hệ thống hiện tại:

- Quiz thực sự nằm ở bảng `Quiz` + `QuizAttempt`.
- Lesson `contentType = QUIZ` nên được hiểu là **“Lesson gateway” dẫn vào quiz**.
- Trên FE learner:
  - `LessonContent` tab “Bài học” hiển thị mô tả; nút “Làm bài trắc nghiệm” nên điều hướng tới trang quiz (`/courses/[slug]/quizzes` hoặc `/learn?page` tương ứng).

**Quy tắc ràng buộc đề xuất**:

1. **Mapping 1–N**:
   - Một `Lesson` loại QUIZ có thể:
     - Gắn trực tiếp 1 `Quiz` (recommended).
     - Hoặc là “anchor” cho nhiều quiz nhỏ (list quiz) nếu muốn chia nhỏ.
2. **Hiển thị / Điều hướng**:
   - Khi `lesson.contentType === QUIZ` và có quiz gắn:
     - Ở màn learn page, thay nội dung chính bằng card:
       - Mô tả quiz, thời lượng, số câu.
       - CTA rõ ràng: **“Bắt đầu làm quiz”**.
   - Nếu chưa có quiz nào gắn → lesson nên là `draft` hoặc UI hiển thị trạng thái cấu hình chưa hoàn thiện (cho giảng viên).
3. **Ảnh hưởng tới tiến độ khóa**:
   - Hoàn thành quiz (attempt đạt ngưỡng) mới đánh dấu lesson là `completed` trong `LessonProgress`.
   - Nếu chỉ vào xem nội dung mà chưa làm quiz → lesson có thể là `in_progress`.

### 2.3. ASSIGNMENT Lesson

**Mục tiêu**: bài tập tự luận / nộp file, thường có deadline, chấm điểm, feedback.

Hiện tại hệ thống:

- `Assignment` là entity riêng (gắn `courseRunId`, `moduleId`, `lessonId`).
- UI Admin:
  - Tab “Kho bài tập” ở Course Master để tạo assignment template.
  - Trong file tree syllabus, menu context cho Lesson có action “Thêm bài tập”, tạo assignment gắn với lesson.
- UI Learner:
  - Tab “Assignments” trong `LessonContent` hiển thị danh sách bài tập của khóa (theo `courseMasterId`), không chỉ của lesson hiện tại.
  - `AssignmentSubmission` xử lý nộp bài, lưu draft, submit, xem điểm.

**Ràng buộc nghiệp vụ đề xuất**:

1. **Gắn Assignment với Lesson khi thích hợp**:
   - Nếu bài tập là “bài tập chương” → gắn với `moduleId` hoặc `courseRunId` (không cần `lessonId`).
   - Nếu bài tập là “bài tập sau bài X” → gắn với `lessonId` tương ứng.
2. **Điều kiện mở bài tập theo tiến độ**:
   - Optional: yêu cầu học viên **xem xong** hoặc hoàn thành quiz của lesson trước khi cho phép nộp assignment:
     - Check `LessonProgress.status === 'completed'` cho lesson đó.
3. **Deadline & Late Policy**:
   - `dueDate` + `allowLateSubmission` + `latePenaltyPercent`:
     - Nếu quá hạn và không cho nộp muộn → khóa UI “Nộp bài”.
     - Nếu cho nộp muộn → vẫn cho nộp nhưng flag `isLate = true` và tính `daysLate`.
4. **Điểm & Completion**:
   - Hoàn thành assignment **không nhất thiết** là điều kiện bắt buộc để unlock lesson sau, nhưng:
     - Có thể là điều kiện để unlock certificate / hoàn thành khóa.
   - Khi `Submission.status === GRADED` và `score >= passingScore` (nếu có) → cộng vào completion hoặc gamification.

---

## 3. Đề xuất flow chuẩn Production cho QUIZ & ASSIGNMENT

### 3.1. Khi thiết kế Syllabus (Admin/Staff-LMS)

1. Tạo `Lesson` loại VIDEO/ARTICLE cho nội dung chính.
2. Nếu cần quiz nhanh:
   - Tạo `Lesson` loại QUIZ ngay sau lesson nội dung.
   - Tạo `Quiz` gắn với `lessonId` đó.
3. Nếu cần bài tập:
   - Tạo `Assignment` gắn với `lessonId` hoặc `moduleId` tương ứng.
   - Đặt `dueDate` tương ứng với timeline Course Run.

### 3.2. Khi học viên học trên FE (Learner)

1. Vào trang `learn`:
   - Tab “Bài học” hiển thị nội dung (video/text).
   - Tab “Bài tập” liệt kê toàn bộ assignments liên quan đến khóa.
2. Nếu lesson là QUIZ:
   - CTA “Làm bài trắc nghiệm” → mở Quiz runner.
   - Kết quả quiz cập nhật `LessonProgress`.
3. Nếu lesson có ASSIGNMENT liên quan:
   - Tab “Bài tập” hiển thị assignment đó trong danh sách.
   - Học viên có thể:
     - Lưu nháp (DRAFT).
     - Submit (SUBMITTED).
     - Nhận điểm (GRADED) + feedback.

---

## 4. Quy tắc ràng buộc nên enforce trong code

1. **Lesson loại QUIZ phải có ít nhất một Quiz gắn** trước khi cho publish:
   - Guard ở backend khi `contentType === QUIZ && status === 'published'`.
2. **Lesson loại ASSIGNMENT không bắt buộc có Assignment**, nhưng:
   - Nếu đã gán `lessonId` cho assignment thì không được xóa lesson nếu còn assignment active.
3. **Không cho sửa `contentType` tự do trên production**:
   - Nếu lesson đã có learner progress, đổi từ VIDEO → QUIZ hoặc QUIZ → ASSIGNMENT cần migration dữ liệu, nên:
     - Chỉ cho phép khi `LessonProgress.count == 0`, hoặc
     - Yêu cầu clone lesson mới (versioning).
4. **OrderIndex auto-managed**:
   - Đã cập nhật FE admin: không cho nhập thứ tự thủ công; `orderIndex` được set tự động dựa trên danh sách hiện tại.
   - Dialog “Lưu thứ tự học phần/bài học” là nơi duy nhất thực sự commit thứ tự xuống DB.

---

## 5. Gợi ý cải tiến tiếp theo

1. **UI LessonContent**:
   - Nếu `contentType === QUIZ` hoặc lesson có quiz gắn → hiện block “Bài kiểm tra nhanh” nổi bật, không chỉ nằm trong tab “Bài tập”.
   - Nếu lesson có assignment gắn trực tiếp → highlight assignment đó trong tab chính.
2. **Progress & Gamification**:
   - Hoàn thành Quiz/Assignment nên cộng XP, streak.
   - Lưu lại `ActivityType.QUIZ_ANSWER` và `ActivityType.PRACTICE` trong `DailyActivity`.
3. **Reporting**:
   - Thống kê conversion giữa “xem nội dung” → “làm quiz” → “nộp assignment” → “đậu khóa”.

