# 📱 Tài liệu Tích hợp Mobile - Torii Monorepo

Tài liệu này hướng dẫn đội ngũ phát triển Mobile (Flutter) cách tích hợp các chức năng cốt lõi từ hệ thống Torii Backend qua App Gateway.

---

## 🏗 Kiến trúc Cơ bản
- **API Gateway**: `https://api.torii.sbs` (hoặc cấu hình qua `.env`)
- **Định dạng dữ liệu**: JSON
- **Cấu trúc Response chuẩn**: 
```json
{
  "success": true,
  "data": { ... },
  "message": "..."
}
```

---

## 🔐 1. Xác thực (Authentication)
Tất cả các request cần đính kèm Header: `Authorization: Bearer <JWT_TOKEN>`

- **Đăng nhập**: `POST /api/auth/login`
- **Thông tin Profile**: `GET /api/profile/me`

---

## 📚 2. Quản lý Khóa học & Bài học
### Danh sách khóa học
- **Lấy danh sách Course Profiles**: `GET /api/academy/course-profiles`
- **Chi tiết Khóa học**: `GET /api/academy/course-profiles/{id}`

### Bài học (Lesson Content)
- **Lấy chi tiết Bài học**: `GET /api/academy/lessons/{lessonId}`
    - Trả về `contentType` (VIDEO, ARTICLE, ...) và `content` (URL video hoặc nội dung text).
- **Đánh dấu hoàn thành bài học**:
  `POST /api/academy/live-classes/{classId}/lessons/{lessonId}/complete`

---

## 📝 3. Bài thi & Quizz (Exams & Quizzes)
Hệ thống sử dụng cơ chế **Attempts** (Lượt thi).

- **Bắt đầu lượt thi**: `POST /api/academy/exam-attempts/start`
    - Body: `{ "examId": "..." }`
- **Lưu nháp câu trả lời**: `POST /api/academy/exam-attempts/save-draft`
    - Body: `{ "attemptId": "...", "answers": [...] }`
- **Nộp bài thi**: `POST /api/academy/exam-attempts/submit`
    - Body: `{ "attemptId": "..." }`
- **Lịch sử thi**: `GET /api/academy/exam-attempts` (Query params: `examId`, `status`)

---

## 📤 4. Bài tập về nhà (Assignments)
Dành cho các lớp học (Live Class).

- **Danh sách bài tập của lớp**: `GET /api/academy/live-classes/{classId}/assignments`
- **Lấy danh sách bài đã nộp**: `GET /api/academy/assignment-submissions?classId={classId}`
- **Nộp bài tập**: `POST /api/academy/assignment-submissions`
    - Body: 
    ```json
    {
      "classId": "...",
      "assignmentTemplateId": "...",
      "content": { "text": "...", "url": "..." }
    }
    ```

---

## 🗂 5. Flashcards & SRS (Study Sets)
Hệ thống giúp ghi nhớ từ vựng.

- **Danh sách bộ thẻ của tôi**: `GET /api/academy/study-sets`
- **Chi tiết bộ thẻ & danh sách Card**: `GET /api/academy/study-sets/{id}`
- **Học từ vựng (SRS Mode)**: `GET /api/academy/study-sets/{id}/study`
- **Review thẻ (Cập nhật tiến độ SRS)**: `POST /api/academy/set-cards/{cardId}/review`
    - Body: `{ "rating": 1-5 }` (Dựa trên mức độ ghi nhớ).

---

## 💡 Lưu ý Kỹ thuật
1. **Timeouts**: Các dịch vụ backend xử lý qua NATS JetStream, gateway có thể mất 5-10s cho các request nặng (ví dụ: tạo đề thi).
2. **Real-time**: Đối với Live Class, nên sử dụng LiveKit SDK dành cho Flutter để tích hợp âm thanh/hình ảnh.
3. **Schemas**: Tham khảo các Zod schemas tại `packages/schemas` để biết chi tiết các trường dữ liệu bắt buộc.

---
**Torii Backend Team**
