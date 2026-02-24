# Kế hoạch Triển khai: Hệ thống Học tập Thông minh từ Notebook (Notebook-to-Study System)

Bản kế hoạch này tổng hợp các phân tích và lộ trình để biến module **Notebook** thành trung tâm dữ liệu học tập cá nhân hóa, cho phép tự động hóa việc tạo Flashcards và Quizzes thông qua AI Sensei.

---

## 1. Triết lý Thiết kế (Core Philosophy)
- **Single Source of Truth:** Notebook là nơi duy nhất người dùng quản lý dữ liệu từ vựng cá nhân.
- **Separation of Concerns:** 
    - **Nội dung Chính quy (Staff Managed):** Quản lý qua Question Bank, Question Pool, dùng cho thi cử chính thức.
    - **Nội dung Cá nhân (AI/User Managed):** Sinh ra từ Notebook, chỉ phục vụ ôn tập cá nhân, không trộn lẫn vào dữ liệu hệ thống của Staff.
- **AI-Enriched Learning:** Sử dụng AI Sensei để biến các ghi chú thô trong Notebook thành các thẻ học tập (Flashcards) và câu hỏi bài tập (Quizzes) chất lượng cao.

---

## 2. Kế hoạch Thay đổi Schema (Database Changes)

### A. Tối ưu hóa Notebook & Flashcard
- **Notebook:** Sẽ "hợp nhất" các thuộc tính học tập từ `FlashcardDeck`.
    - Thêm: `srsSettings` (Json), `lastStudiedAt` (DateTime), `masteryPercentage` (Decimal).
    - Ý tưởng: Một Notebook giờ đây vừa là Sổ tay, vừa là một Bộ Flashcard.
- **Flashcard:** 
    - Thêm: `sourceNoteId` (@db.Uuid, Optional) - Liên kết trực tiếp thẻ này với từ vựng nào trong Notebook.
- **NoteEntry:** 
    - Thêm: `aiStatus` (Enum: PENDING, PROCESSED) - Trạng thái AI đã làm giàu dữ liệu (thêm ví dụ, âm thanh) hay chưa.

### B. Phân tách Question Bank & Notebook Quiz
- **Question:** 
    - Giữ nguyên cấu trúc hiện tại phục vụ Staff.
    - Đối với câu hỏi sinh ra từ Notebook:
        - `poolId`: để **NULL** (không thuộc kho câu hỏi chung).
        - `createdBy`: `userId` của học viên.
        - `aiGenerated`: `true`.
- **Quiz:**
    - Thêm `quizType`: `notebook_practice` để phân biệt với bài thi chính quy của khóa học.

---

## 3. Lộ trình Thực hiện (Implementation Roadmap)

### Giai đoạn 1: Bridge Construction (Backend Logic)
1. **Agents Service:**
    - Tạo Prompt Template mới: `sensei/notebook-enrichment.md` và `sensei/quiz-generation.md`.
    - Handler xử lý danh sách từ vựng đầu vào (Bulk processing).
2. **Learning Service:**
    - Viết logic đồng bộ: Khi một `NoteEntry` được tạo, gọi Agent để gen `Flashcard` tương ứng.
    - Viết logic `PracticeService`: Nhận `notebookId`, gọi AI gen câu hỏi và trả về `QuizAttempt`.

### Giai đoạn 2: Smart Interface (Web Learner)
1. **Notebook UI:**
    - Thêm Badge trạng thái học tập (SRS Level) cạnh mỗi từ.
    - Nút "Học ngay" (Flashcard mode) và "Kiểm tra" (Quiz mode).
2. **AI Assistant:**
    - Khi user đang viết Notebook, AI gợi ý tự động điền (Auto-complete) nghĩa và ví dụ.

### Giai đoạn 3: Gamification & Analytics
1. **Tracking:** Ghi lại tiến độ học tập từ Notebook vào bảng `UserGamification` (XP, Streak).
2. **Analytics:** Thống kê những từ "khó thuộc" nhất trong Notebook để AI tập trung gen nhiều bài tập hơn cho những từ đó.

---

## 4. Kiểm soát Rủi ro (Risk Control)
- **Dữ liệu Rác:** Các câu hỏi/flashcard cá nhân sẽ có filter mạnh để không bao giờ xuất hiện trên trang Quản lý của Staff hoặc Course chung.
- **Chi phí AI:** Sử dụng cơ chế Cache hoặc chỉ gen khi User yêu cầu (On-demand) để tối ưu API cost.
- **Đồng bộ:** Đảm bảo khi sửa từ trong Notebook, các liên kết Flashcard/Question cũ sẽ được cập nhật hoặc đánh dấu là cần cập nhật.

---
**Trạng thái:** Chờ Review. 
*Người lập: Antigravity AI*
