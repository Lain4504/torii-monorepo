# Study Set & Note System Specification

## 1. Overview & Goals

Tài liệu này mô tả thiết kế cho hệ thống **Study Set & Study Note** mới, tích hợp sâu vào quá trình học tập (LMS). Mục tiêu là tạo ra một flow tự nhiên: "Học -> Ghi chú (StudyNote) -> Tạo thẻ (SetCard) -> Ôn tập (SRS)", hỗ trợ đa ngôn ngữ (không chỉ tiếng Nhật).

### Mục tiêu chính
1.  **Seamless Note-taking**: User có thể ghi chú nhanh (**StudyNote**) ngay trong lúc học bài (Lesson).
2.  **Thẻ học (SetCard) Generation**: Từ StudyNote hoặc nội dung bài học, user có thể tạo thẻ thủ công hoặc nhờ AI gợi ý.
3.  **Generic Design**: Data model phải hỗ trợ tốt tiếng Anh, tiếng Nhật, tiếng Trung, và các môn học khác (Lập trình, Lịch sử...).
4.  **Quizlet-like SRS**: Hệ thống ôn tập dựa trên Spaced Repetition System (SRS) nhưng đơn giản hóa (Learn -> Review -> Mastered), không quá phức tạp như Anki.

---

## 2. User Stories & Flow

### 2.1. Flow: StudyNote & SetCard Creation
**Context**: User đang xem một Video Lesson hoặc đọc Article.

1.  **Quick StudyNote**:
    -   User highlight một từ vựng hoặc đoạn văn.
    -   Bấm "Add Note". Sidebar hiện ra cho phép user nhập thêm ghi chú (Meaning, Example).
    -   Hệ thống lưu `StudyNote` gắn với `Lesson` đó (DB table đề xuất: `study_notes` – mapping từ model Prisma hiện tại `Note`).

2.  **Generate SetCard from StudyNote**:
    -   Tại giao diện StudyNote, user bấm "Create Card".
    -   Hệ thống pre-fill form SetCard từ nội dung StudyNote:
        -   Front: Từ vựng / Câu hỏi.
        -   Back: Nghĩa / Câu trả lời.
        -   Context: Link ngược lại Lesson đang học.
    -   User chỉnh sửa và bấm Save -> thẻ (`SetCard`) được thêm vào Study Set mặc định hoặc Study Set chọn sẵn.

3.  **Manual SetCard**:
    -   User vào trang "My Study Sets", tạo Study Set mới (VD: "Từ vựng IELTS").
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

## 3. Data Model (Generic & Extensible, naming đề xuất)

Thay vì các trường cứng nhắc như `kanji`, `furigana`, chúng ta sẽ dùng cấu trúc Generic kết hợp với JSONB để mở rộng cho từng ngôn ngữ.

### 3.1. StudyNote (Ghi chú học tập)
Lưu trữ các ghi chú thô của user.

-   `id`: UUID
-   `userId`: UUID
-   `content`: Text (Nội dung ghi chú, support Markdown/HTML)
-   `lessonId`: UUID (Optional - Link tới bài học nếu note trong lúc học)
-   `tags`: String[]
-   `metadata`: JSONB (Lưu vị trí timestamp video, highlight color, etc.)
-   `createdAt`, `updatedAt`

> **Mapping hiện tại**: Prisma model `Note` + bảng DB `notes`. Đề xuất rename DB table về `study_notes` và/hoặc model về `StudyNote` khi tiện migration; logic nghiệp vụ giữ nguyên.

### 3.2. StudySet (Bộ thẻ / Set học)
Nhóm các thẻ học (SetCard), tương đương \"Set\" trong Quizlet.

-   `id`: UUID
-   `userId`: UUID
-   `title`: String
-   `description`: String
-   `isPublic`: Boolean
-   `settings`: JSONB (Cấu hình SRS riêng cho set nếu cần – mapping từ `srsSettings` hiện tại)
-   `stats`: JSONB (Tổng số card, số card thuộc, etc.)

> **Mapping hiện tại**: Prisma model `FlashcardDeck` + bảng DB `flashcard_decks`. Đề xuất đổi tên logic/domain sang `StudySet` (DB table `study_sets`) trong migration tương lai; core field giữ nguyên.

### 3.3. SetCard (Generic)
Một thẻ học trong StudySet (1 hàng = 1 cặp term–definition).

-   `id`: UUID
-   `studySetId`: UUID (mapping từ `deckId` hiện tại)
-   `sourceNoteId`: UUID (Optional - Link nguồn gốc từ StudyNote nào; mapping từ `noteId`)
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

> **Mapping hiện tại**: Prisma model `Flashcard` + bảng DB `flashcards` (`deckId`, `noteId`, `term`, `definition`, `srsState`, ...). Đề xuất rename domain entity thành `SetCard` (DB table `set_cards`) về sau; cấu trúc cột không cần thay đổi.

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

## 7. Gap Analysis vs Quizlet & Future Roadmap (Pending)

> **Lưu ý**: Các tính năng dưới đây được liệt kê để đảm bảo hệ thống có khả năng mở rộng tương đương Quizlet trong tương lai. **Hiện tại CHƯA TRIỂN KHAI** (Out of scope MVP), chỉ làm khi flow chính đã ổn định và có yêu cầu từ User.

### 7.0. Có cần rebuild flow Flashcard/Note khi thêm chế độ học kiểu Quizlet?

**Không.** So sánh nhanh:

- **Quizlet**: "Set" = một bộ các cặp (term, definition). Các chế độ (Flashcards, Learn, Test, Match) chỉ là **cách tương tác khác nhau trên cùng bộ dữ liệu** đó.
- **LMS hiện tại**: "Bộ nội dung" tương đương Set của Quizlet chính là **Deck (FlashcardDeck)** + danh sách **Flashcard** (term, definition). **Note** trong spec là ghi chú khi học (có thể convert thành Flashcard), không đóng vai "collection" để chạy nhiều mode — collection để chạy mode là **Deck**.
- **Kết luận**: Data model hiện tại (Note, FlashcardDeck, Flashcard) **đủ** để thêm Test (trắc nghiệm / đúng-sai) và Match (nối thẻ). Chỉ cần thêm API và UI; không cần thêm bảng "Note collection" hay rebuild flow. Nếu muốn lưu lịch sử điểm / thời gian chơi thì có thể thêm bảng phiên (session) tùy chọn.

### 7.1. Study Modes (Ngoài SRS)
Quizlet có nhiều chế độ học; hệ thống hiện tại tập trung SRS (tương đương "Learn"). Các mode dưới đây chạy trên **cùng Deck + Flashcard**, không đổi schema.

-   **[PENDING] Test Mode**: Tự động sinh bài kiểm tra từ nội dung Deck.
    -   **Dạng**: Trắc nghiệm (chọn 1 đáp án đúng trong 4), Đúng/Sai (term → hiện definition, hỏi đúng hay sai), có thể mở rộng Điền từ (type definition).
    -   **Tech**: API `GET /decks/:id/cards` (hoặc endpoint riêng `GET /decks/:id/study-modes/test?count=N`) trả về N thẻ; frontend shuffle và render theo dạng (multiple choice / true-false). Không cần bảng mới; nếu cần lưu điểm có thể thêm `FlashcardStudySession` (deckId, userId, mode: TEST, score, completedAt).
-   **[PENDING] Match Game (Nối thẻ)**: Game kéo thả / tap nối term với definition trong thời gian ngắn nhất.
    -   **Tech**: Cùng nguồn Deck/cards; frontend shuffle cặp term–definition và hiển thị grid. Kỷ lục thời gian có thể lưu trong `Deck.settings` (bestTimeByUser) hoặc bảng `FlashcardStudySession` (mode: MATCH, durationSeconds).

**Tóm tắt**: Hỗ trợ thêm Test và Match **không** yêu cầu rebuild flow flashcard/note hay thêm "Note collection". Deck + Flashcard đã là "collection" để chạy mọi study mode; Note vẫn chỉ dùng để ghi chú và tạo thẻ, không thay đổi vai trò.

### 7.2. Organization & Social
-   **[PENDING] Folders**: Cho phép gom nhiều Decks vào một thư mục (VD: "Semester 1" chứa "Tuần 1", "Tuần 2").
    -   *Schema*: Cần thêm model `FlashcardFolder`.
-   **[PENDING] Class Integration**: Share bộ thẻ vào `Class` (Academy) để tất cả học viên đều thấy.
    -   *Schema*: Cần bảng liên kết `ClassFlashcardDeck`.

### 7.3. Content Creation Tools
-   **[PENDING] Import from CSV/Text**: Copy-paste danh sách từ Excel/Word để tạo nhanh.
-   **[PENDING] Text-to-Speech (TTS)**: Tự động sinh audio cho từ vựng nếu user không upload file.
    -   *Tech*: Tích hợp Google TTS hoặc OpenAI TTS API.

## 8. Migration Strategy (from Old Schema)

Nếu data cũ ít:
-   Convert column `frontText` -> `term`.
-   Convert column `backText` -> `definition`.
-   Move `kanji`, `furigana` vào `languageDetails`.
-   Tạo bảng `Note` mới hoàn toàn.

## 8. Lưu ý:
KHÔNG GIỮ CODE LEGACY, update xong là xóa hết schema entity cũ và code cũ,không backward compability gì hết.