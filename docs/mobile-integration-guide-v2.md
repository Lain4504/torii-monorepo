# 📱 Tài liệu Tích hợp Mobile: Khóa học, Bài tập & Quiz

Tài liệu này hướng dẫn chi tiết các API tích hợp cho luồng Học tập, Làm bài tập và Thi thử trên ứng dụng Mobile.

---

## 🏗 1. Khóa học & Bài học (Nền tảng)
- **My Courses**: `GET /api/academy/enrollments/me` (Lấy danh sách khóa học đã đăng ký).
- **Curriculum**: `GET /api/academy/course-profiles/{id}` (Lấy cấu trúc Module > Lesson).
- **Lesson Content**: `GET /api/academy/lessons/{lessonId}` (Video URL hoặc Article content).
- **Track Progress**: `POST /api/academy/live-classes/{classId}/lessons/{lessonId}/complete` (Đánh dấu hoàn thành).

---

## 📝 2. Hệ thống Quiz & Exam (Kỹ thuật chi tiết)
Hệ thống sử dụng cơ chế **Attempt** (Lượt thi). Team Mobile cần tuân thủ đúng luồng dữ liệu để Backend có thể chấm điểm chính xác.

### Luồng lưu bài & Nộp bài:
1. **Lưu nháp (Bắt buộc)**: `POST /api/academy/exam-attempts/save-draft`
   - **Tác dụng**: Gửi toàn bộ câu trả lời của học sinh lên Server để lưu vào database.
   - **Request Body**:
     ```json
     {
       "attemptId": "UUID",
       "draftAnswers": {
         "question_id_1": "option_id_hoac_key",
         "question_id_2": "option_id_hoac_key"
       }
     }
     ```
   - **Cấu trúc `draftAnswers`**: Phải là một **Object (Map)**, không phải Mảng (Array). 
     - **Key**: Sử dụng `question.id` (ID gốc của câu hỏi).
     - **Value**: Sử dụng `option.id` (UUID) hoặc `optionKey` (như "A", "B", "C").
2. **Nộp bài (Submit)**: `POST /api/academy/exam-attempts/submit`
   - **Tác dụng**: Kích hoạt Backend tính toán điểm số dựa trên `draftAnswers` đã lưu trước đó.
   - **Request Body**: `{ "attemptId": "UUID" }` (Chỉ cần ID, không gửi kèm answers ở đây).

### Tại sao Score = 0?
Nếu team Mobile gửi câu trả lời trực tiếp trong lệnh `submit` hoặc quên gọi `save-draft`, Backend sẽ không thấy dữ liệu trả lời và trả về 0 điểm.

---

## 📤 3. Bài tập về nhà (Assignments - Chi tiết)
Dành cho học viên nộp bài luận hoặc file đính kèm.

### Luồng nộp bài và nhận điểm:
1. **Nộp bài**: `POST /api/academy/assignment-submissions`.
   - Trạng thái ban đầu: `SUBMITTED`.
2. **Theo dõi kết quả**: `GET /api/academy/assignment-submissions?classId={classId}`.
   - Kiểm tra `status`: `SUBMITTED` (Đang chờ) hoặc `GRADED` (Đã có điểm).
3. **Thông tin điểm số & Phản hồi**:
   - `grade`: Điểm chữ hoặc số (ví dụ: "A", "9.0").
   - `feedback`: **Nhận xét của giáo viên**. 

---

## 💡 Lưu ý Kỹ thuật
1. **Token**: Luôn đính kèm `Authorization: Bearer <JWT>`.
2. **isPassed flag**: Trong kết quả thi, dùng `isPassed` để hiển thị Đạt/Không đạt.
3. **selectedOptionId = null**: Nếu log response thấy trường này null, đừng quá lo lắng vì Backend lưu vào `answerPayload` để chấm điểm. Quan trọng là `isCorrect` và `scoreAwarded` phải đúng.

---
**Torii Backend Team**
