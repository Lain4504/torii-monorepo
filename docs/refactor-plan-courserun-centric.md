# Kế hoạch Refactor Hệ thống: Kiến trúc CourseRun-Centric (Transactional & Activity)

Tài liệu này tổng hợp và chốt lại kế hoạch refactor toàn bộ các luồng giao dịch, hoạt động học tập và đánh giá sang mô hình lấy **CourseRun** làm trọng tâm, loại bỏ sự phụ thuộc trực tiếp vào **CourseMaster** cho các dữ liệu phát sinh (Legacy removal).

---

## 1. Nguyên tắc cốt lõi (Core Principles)

1. **CourseMaster = Blueprint**: Chỉ chứa nội dung học thuật, syllabus mẫu và các thông số cài đặt mặc định.
2. **CourseRun = Instance & Transaction**: Mọi hoạt động có sự tham gia của con người (Mua hàng, Nộp bài, Làm quizz, Đánh giá) **bắt buộc** phải gắn với `CourseRunId`.
3. **Legacy Clean-up**: Loại bỏ hoàn toàn các trường `courseMasterId` hoặc `courseId` trong các bảng transactional nếu chúng có thể truy vấn ngược lại từ `CourseRun`. Không duy trì tính tương thích ngược (Backward Compatibility).
4. **Owner Power**: Giảng viên của `CourseRun` có toàn quyền tùy chỉnh (override) bài tập và đề thi cho lớp của mình mà không ảnh hưởng đến syllabus gốc.

---

## 2. Thiết kế Schema & Entity (Prisma Refactor)

### 2.1. Đánh giá & Phản hồi (Review)
- **Review**: Chuyển từ `userId + courseMasterId` sang `userId + courseRunId`. 
- **Business Logic**: Học viên đánh giá "Trải nghiệm học tập tại lớp X với giảng viên Y". Điểm trung bình của Course Master sẽ là hàm `Aggregate(AVG)` của tất cả các Run thuộc Master đó.

### 2.2. Bài tập & Bài nộp (Assignment & Submission)
- **Assignment**: Thêm `courseRunId` (Optional).
    - `courseRunId IS NULL`: Bài tập mẫu trong Syllabus.
    - `courseRunId IS NOT NULL`: Bài tập cụ thể của một lớp (do Lecturer lớp đó tạo hoặc customize).
- **Submission**: Gắn trực tiếp vào `courseRunId`. Giảng viên chỉ nhìn thấy bài nộp của học viên trong lớp mình quản lý.

### 2.3. Đề thi & Phiên làm bài (Quiz & QuizAttempt)
- **Quiz**: Tương tự Assignment, có thể là template của Syllabus hoặc instance riêng của CourseRun.
- **QuizAttempt**: Gỡ bỏ `courseMasterId`, bắt buộc dùng `courseRunId`.
- **Question & QuestionPool**: Giữ nguyên liên kết với Syllabus/Master (vì câu học thuật là tài sản chung), nhưng Quiz (tập hợp câu hỏi) thì có thể tùy biến theo Run.

---

## 3. Luồng Nghiệp vụ mới (New Business Flows)

### 3.1. Quản lý Đề thi (Quiz Management)
Hỗ trợ Lecturer tạo đề thi cho `CourseRun` theo 2 cách:
1. **Manual Selection**: Lecturer duyệt `QuestionBank`, pick từng câu hỏi (`questionIds`) để tạo `Quiz` instance gắn với `CourseRun`.
2. **Auto-Generation**: Hệ thống dựa trên tiêu chí (JLPT, độ khó, category) để random-pick từ `QuestionPool` và đóng gói thành đề thi riêng cho lớp.

### 3.2. Chấm điểm & Phản hồi (Grading)
- Quyền chấm điểm (`Submission`) và xem kết quả (`QuizAttempt`) được phân quyền dựa trên `lecturerId` gắn tại `CourseRun`. Giảng viên dạy thay chỉ có quyền trên `LiveSession` cụ thể, giảng viên chính có quyền trên toàn bộ `CourseRun`.

---

## 4. Danh sách các File cần Refactor ngay

### Server Side (NestJS)
| Module | File cần xử lý | Hành động |
| :--- | :--- | :--- |
| **Prisma** | `schema.prisma` | Cập nhật cấu trúc bảng Review, Assignment, Quiz, Submission, Attempt. |
| **Learning** | `quiz.service.ts` | Refactor logic `startExam`, `submitSession` sang dùng `courseRunId`. |
| **Learning** | `assignment.service.ts` | Refactor logic giao bài và nộp bài. |
| **Learning** | `review.service.ts` | Refactor logic tính toán rating (hỗ trợ aggregate Master rating từ Run). |
| **Billing** | `order.service.ts` | Đảm bảo khi tạo Order, `courseRunId` là bắt buộc. |

### Client Side (Web-Learner)
| Component | Mô tả |
| :--- | :--- |
| **Check-out** | Gửi đúng `courseRunId` khi validate coupon và create order. |
| **LMS Dashboard** | Hiển thị nội dung dựa trên `enrollment.courseRunId`. |
| **Review UI** | Gửi feedback kèm theo `courseRunId`. |

---

## 5. Kế hoạch triển khai (Step-by-step)

1. **Step 1**: Cập nhật `schema.prisma` và chạy `npx prisma generate`.
2. **Step 2**: Refactor các DTOs trong package `@workspace/schemas` để thay thế `courseId` bằng `courseRunId`.
3. **Step 3**: Sửa lỗi Compile tại các Service sau khi đổi schema.
4. **Step 4**: Viết logic `Auto-gen Quiz` service.
5. **Step 5**: Test tích hợp luồng Checkout -> Enroll -> Study -> Review.

---
> [!IMPORTANT]
> **Quyết định cuối cùng**: Chúng ta sẽ xóa bỏ hoàn toàn `courseMasterId` trong các bảng Transaction để giữ cho database sạch và tránh logic bị "lẫn lộn" (ambiguous) giữa syllabus mẫu và thực tế triển khai.
