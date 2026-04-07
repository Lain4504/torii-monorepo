# 📱 Tài liệu Tích hợp Mobile: Khóa học, Bài tập & Quiz

Tài liệu này hướng dẫn chi tiết các API tích hợp cho luồng Học tập, Làm bài tập và Thi thử trên ứng dụng Mobile.

---

## 🏗 1. Khóa học & Bài học (Nền tảng)
- **My Courses**: `GET /api/academy/enrollments/me` (Lấy danh sách khóa học đã đăng ký).
- **Curriculum**: `GET /api/academy/course-profiles/{id}` (Lấy cấu trúc Module > Lesson).
- **Lesson Content**: `GET /api/academy/lessons/{lessonId}` (Video URL hoặc Article content).
- **Track Progress**: `POST /api/academy/live-classes/{classId}/lessons/{lessonId}/complete` (Đánh dấu hoàn thành).

---

## 📝 2. Hệ thống Quiz & Exam (Chi tiết)
Hệ thống sử dụng cơ chế **Attempt** (Lượt thi) để quản lý trạng thái làm bài.

### Quy trình thực hiện:
1. **Bắt đầu**: `POST /api/academy/exam-attempts/start` -> Trả về `attemptId`.
2. **Lưu nháp**: `POST /api/academy/exam-attempts/save-draft`.
3. **Nộp bài**: `POST /api/academy/exam-attempts/submit` -> Trả về kết quả ngay lập tức.

### Kết quả & Điều kiện Đạt (Pass Conditions):
Khi nộp bài thành công (Submit), API trả về object `AcademyExamAttempt` với các trường quan trọng:
- `score`: Điểm số đạt được (số câu đúng).
- `maxScore`: Tổng số câu hỏi/điểm tối đa.
- `percentage`: Tỷ lệ phần trăm hoàn thành (ví dụ: 85.5).
- `isPassed`: **Flag quan trọng nhất** (true/false). Quyết định xem người dùng có được tính là vượt qua bài thi này không (dựa trên điểm sàn cấu hình trên Admin).
- `timeTakenSeconds`: Thời gian làm bài thực tế.

---

## 📤 3. Bài tập về nhà (Assignments - Chi tiết)
Dành cho học viên nộp bài luận hoặc file đính kèm.

### Luồng nộp bài và nhận điểm:
1. **Nộp bài**: `POST /api/academy/assignment-submissions`.
   - Trạng thái ban đầu: `SUBMITTED`.
2. **Theo dõi kết quả**: `GET /api/academy/assignment-submissions?classId={classId}`.
   - Mobile cần kiểm tra trường `status`:
     - `SUBMITTED`: Đã nộp, đang chờ giáo viên chấm.
     - `GRADED`: Đã có điểm.
3. **Thông tin điểm số & Phản hồi**:
   - `grade`: Điểm chữ hoặc số (ví dụ: "A", "9.0").
   - `score`: Điểm số định lượng (nếu có).
   - `feedback`: **Nhận xét của giáo viên**. Đây là phần quan trọng để học sinh cải thiện bài làm.
   - `gradedAt`: Thời gian giáo viên chấm bài.

---

## 🗂 4. Flashcards (SRS)
- **Học tập**: `GET /api/academy/study-sets/{id}/study`
- **Đánh giá ghi nhớ**: `POST /api/academy/set-cards/{cardId}/review`
  - Body: `{ "rating": 1-5 }` (1: Quên, 5: Nhớ rõ).

---

## 💡 Lưu ý Kỹ thuật
1. **Token**: Luôn đính kèm `Authorization: Bearer <JWT>`.
2. **Offline Mode**: Khuyến khích Mobile cache lại nội dung Quiz Draft.
3. **Real-time Results**: Đối với Quiz, kết quả trả về ngay khi gọi `submit`. Đối với Assignment, kết quả phụ thuộc vào thời gian chấm bài của giáo viên (cần cơ chế Pull-to-refresh hoặc Notification).

---
**Torii Backend Team**
