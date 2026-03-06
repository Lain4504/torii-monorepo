# Flashcard & Note System Specification

## 1. Overview & Goals

Tài liệu này mô tả thiết kế cho hệ thống **Flashcard & Note** mới, tích hợp sâu vào quá trình học tập (LMS). Mục tiêu là tạo ra một flow tự nhiên: "Học -> Ghi chú -> Tạo Flashcard -> Ôn tập (SRS)", hỗ trợ đa ngôn ngữ (không chỉ tiếng Nhật).

### Mục tiêu chính
1.  **Seamless Note-taking**: User có thể ghi chú nhanh (Note) ngay trong lúc học bài (Lesson).
2.  **Flashcard Generation**: Từ Note hoặc nội dung bài học, user có thể tạo Flashcard thủ công hoặc nhờ AI gợi ý.
3.  **Generic Design**: Data model phải hỗ trợ tốt tiếng Anh, tiếng Nhật, tiếng Trung, và các môn học khác (Lập trình, Lịch sử...).
4.  **Quizlet-like SRS**: Hệ thống ôn tập dựa trên Spaced Repetition System (SRS) nhưng đơn giản hóa (Learn -> Review -> Mastered), không quá phức tạp như Anki.

---

## 2. User Stories & Flow

### 2.1. Flow: Note-taking & Flashcard Creation
**Context**: User đang xem một Video Lesson hoặc đọc Article.

1.  **Quick Note**:
    -   User highlight một từ vựng hoặc đoạn văn.
    -   Bấm "Add Note". Sidebar hiện ra cho phép user nhập thêm ghi chú (Meaning, Example).
    -   Hệ thống lưu `Note` gắn với `Lesson` đó.

2.  **Generate Flashcard from Note**:
    -   Tại giao diện Note, user bấm "Create Flashcard".
    -   Hệ thống pre-fill form Flashcard từ nội dung Note:
        -   Front: Từ vựng / Câu hỏi.
        -   Back: Nghĩa / Câu trả lời.
        -   Context: Link ngược lại Lesson đang học.
    -   User chỉnh sửa và bấm Save -> Flashcard được thêm vào Deck mặc định hoặc Deck chọn sẵn.

3.  **Manual Flashcard**:
    -   User vào trang "My Flashcards", tạo Deck mới (VD: "Từ vựng IELTS").
    -   Bấm "Add Card", điền Front/Back và lưu.

### 2.2. Flow: Review (SRS)
**Context**: User vào ôn tập hàng ngày.

1.  **Learning Phase (Học từ mới)**:
    -   Hệ thống hiển thị các thẻ chưa thuộc (`state = NEW` hoặc `LEARNING`).
    -   User lật thẻ. Nếu chọn "Biết" -> thẻ chuyển sang trạng thái Review. Nếu "Quên" -> lặp lại trong phiên.

2.  **Review Phase (Ôn tập)**:
    -   Dựa trên thuật toán SRS (tương tự Leitner hoặc SM-2 simplified), hệ thống nhắc lại các thẻ sắp quên.
    -   User đánh giá: "Still Know" (tăng interval), "Forgot" (reset interval).

---

## 3. Data Model (Generic & Extensible)

Thay vì các trường cứng nhắc như `kanji`, `furigana`, chúng ta sẽ dùng cấu trúc Generic kết hợp với JSONB để mở rộng cho từng ngôn ngữ.

### 3.1. Note (Ghi chú học tập)
Lưu trữ các ghi chú thô của user.

-   `id`: UUID
-   `userId`: UUID
-   `content`: Text (Nội dung ghi chú, support Markdown/HTML)
-   `lessonId`: UUID (Optional - Link tới bài học nếu note trong lúc học)
-   `tags`: String[]
-   `metadata`: JSONB (Lưu vị trí timestamp video, highlight color, etc.)
-   `createdAt`, `updatedAt`

### 3.2. FlashcardDeck (Bộ thẻ)
Nhóm các thẻ.

-   `id`: UUID
-   `userId`: UUID
-   `title`: String
-   `description`: String
-   `subject`: String (e.g., "JAPANESE", "ENGLISH", "CODING")
-   `isPublic`: Boolean
-   `settings`: JSONB (Cấu hình SRS riêng cho deck nếu cần)
-   `stats`: JSONB (Tổng số card, số card thuộc, etc.)

### 3.3. Flashcard (Generic)
Thẻ học.

-   `id`: UUID
-   `deckId`: UUID
-   `noteId`: UUID (Optional - Link nguồn gốc từ Note nào)
-   `term`: String (Mặt trước - Từ vựng, Câu hỏi)
-   `definition`: String (Mặt sau - Nghĩa, Câu trả lời)
-   `hint`: String? (Gợi ý, Example sentence)
-   `mediaUrl`: String? (Ảnh/Audio minh họa)
-   **`languageDetails`**: JSONB
    -   Chứa các field đặc thù ngôn ngữ.
    -   Ví dụ Tiếng Nhật: `{ "kanji": "猫", "furigana": "ねこ", "romaji": "neko" }`
    -   Ví dụ Tiếng Anh: `{ "ipa": "/kæt/", "type": "noun" }`
-   `tags`: String[]
-   `srsState`: Enum (`NEW`, `LEARNING`, `REVIEW`, `MASTERED`)
-   `nextReviewAt`: DateTime
-   `interval`: Int (Số ngày/giờ đến lần review tiếp theo)
-   `easeFactor`: Float (Độ khó, default 2.5)

---

## 4. SRS Algorithm (Quizlet-style Simplified)

Chúng ta không dùng Anki thuần (quá phức tạp cho user phổ thông), mà dùng mô hình **Buckets/Leitner** kết hợp interval tăng dần.

### Trạng thái thẻ (`FlashcardState`)
1.  **NEW**: Thẻ mới tạo, chưa học.
2.  **LEARNING**: Đang học trong phiên hiện tại (cần trả lời đúng X lần để qua Review).
3.  **REVIEW**: Đã thuộc, chờ đến ngày ôn lại.
4.  **MASTERED**: Đã nhớ rất lâu (interval > 180 ngày hoặc user mark manually).

### Logic Review
-   **Khi gặp thẻ NEW/LEARNING**:
    -   Hỏi: "Biết hay Không?"
    -   Không: Giữ ở Learning, hiện lại sau 1 phút.
    -   Biết: Chuyển sang REVIEW, `interval = 1` ngày.
-   **Khi gặp thẻ REVIEW**:
    -   Hỏi: "Vẫn nhớ hay Đã quên?"
    -   Quên: Reset `interval = 1`, `srsState = LEARNING` (hoặc REVIEW step 1).
    -   Nhớ: Tăng `interval` theo công thức: `newInterval = oldInterval * easeFactor`.

---

## 5. API Design (NestJS)

### 5.1. Note Module
-   `POST /notes`: Tạo note (có thể kèm lessonId).
-   `GET /notes`: List notes (filter by lesson, tags).
-   `POST /notes/:id/to-flashcard`: API tiện ích để convert Note -> Flashcard (Draft).

### 5.2. Flashcard Module
-   `POST /decks`: Tạo bộ thẻ.
-   `POST /decks/:id/cards`: Thêm thẻ vào bộ.
-   `GET /decks/:id/study`: Lấy danh sách thẻ cần học hôm nay (Logic: `nextReviewAt <= now` OR `state = NEW`).
-   `POST /cards/:id/review`: Submit kết quả học.
    -   Body: `{ quality: 0 | 1 }` (0: Quên, 1: Nhớ).
    -   Server tính toán lại `nextReviewAt` và trả về state mới.

---

## 6. Integration Points

-   **LMS Integration**:
    -   Trong giao diện `LessonPlayer` (xem video/đọc bài), thêm nút "Note" ở toolbar.
    -   Hiển thị list Notes bên cạnh bài học.
-   **Mobile App**:
    -   Flashcard là tính năng mobile-first. API cần tối ưu cho mobile fetch (sync data).

---

## 7. Migration Strategy (from Old Schema)

Nếu data cũ ít:
-   Convert column `frontText` -> `term`.
-   Convert column `backText` -> `definition`.
-   Move `kanji`, `furigana` vào `languageDetails`.
-   Tạo bảng `Note` mới hoàn toàn.

## 8. Lưu ý:
KHÔNG GIỮ CODE LEGACY, update xong là xóa hết schema entity cũ và code cũ,không backward compability gì hết.