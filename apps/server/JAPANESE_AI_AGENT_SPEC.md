# Japanese AI Agent Specification (AI Sensei)

## 1. Overview & Vision

### 1.1. Goal
Xây dựng một **"AI Sensei"** (Trợ giảng ảo) chuyên biệt cho tiếng Nhật, không chỉ là một chatbot hỏi đáp thông thường. AI Sensei đóng vai trò là người đồng hành, hiểu rõ lộ trình học của học viên (Syllabus Awareness) để hỗ trợ đúng ngữ cảnh, đúng trình độ (JLPT Level).

### 1.2. The "Standout" Factors (USP)
Khác với ChatGPT hay các bot chung chung, AI Sensei của Torii Academy có các đặc điểm "sát sườn" với trung tâm Nhật ngữ:

1.  **Syllabus & Level Awareness**: AI biết học viên đang học **Bài 3 - Minna no Nihongo**. Khi giải thích, nó chỉ dùng từ vựng/ngữ pháp của bài 1-3, không dùng kiến thức N3 để giải thích cho N5.
2.  **Roleplay Scenarios (Kaiwa Dojo)**: AI đóng vai nhân vật trong bài học (ví dụ: nhân viên cửa hàng, bác sĩ) để luyện hội thoại theo kịch bản có sẵn.
3.  **Nuance & Keigo Correction**: Đặc thù tiếng Nhật là kính ngữ (Keigo) và sắc thái (Nuance). AI tập trung sửa lỗi dùng từ sai ngữ cảnh (văn nói vs văn viết).

---

## 2. Agent Personas

Hệ thống cho phép cấu hình "Tính cách" của Agent để phù hợp với đối tượng học viên:

1.  **The Sensei (Mặc định)**:
    -   Tone: Lịch sự (`Desu/Masu`), ân cần, khuyến khích.
    -   Role: Giáo viên hướng dẫn, giải thích cặn kẽ ngữ pháp.
2.  **The Senpai (Bạn đồng hành)**:
    -   Tone: Thân thiện, có thể dùng thể ngắn (`Casual form`) nếu học viên đã học tới.
    -   Role: Bạn luyện giao tiếp, tạo cảm giác thoải mái.
3.  **The Interviewer (Luyện thi/Phỏng vấn)**:
    -   Tone: Nghiêm túc, Kính ngữ (`Sonkeigo/Kenjougo`).
    -   Role: Người phỏng vấn xin việc hoặc giám thị thi vấn đáp.

---

## 3. Key Features & User Flows

### 3.1. Feature: Contextual Lesson Helper (Trợ giảng bài học)

**Scenario**: Học viên đang xem Video Bài 5 (Động từ đi/đến/về).
-   **User**: "Tại sao chỗ này dùng trợ từ 'ni' mà không phải 'e'?"
-   **AI Sensei**:
    1.  *Context Check*: AI nhận biết User đang ở `Lesson ID: xyz` (Bài 5).
    2.  *Knowledge Retrieval*: AI truy xuất dữ liệu bài học (RAG) để biết giáo trình đang dạy mẫu câu `Địa điểm + e/ni + Ikimasu`.
    3.  *Response*: "Ở bài 5, cả 'ni' và 'e' đều dùng để chỉ hướng di chuyển. Tuy nhiên, giáo trình Minna thường dùng 'e' (へ) để nhấn mạnh phương hướng. Em dùng cái nào cũng đúng nhé!" (Giải thích gọn, đúng trọng tâm bài).

### 3.2. Feature: Kaiwa Roleplay (Luyện hội thoại nhập vai)

**Scenario**: Luyện tập tình huống "Mua hàng tại Conbini" (Bài 3).
-   **Setup**: AI đóng vai nhân viên bán hàng. User đóng vai khách.
-   **Flow**:
    1.  **AI**: "Irasshaimase! Nanika o sagashi desu ka?" (Kính chào quý khách! Quý khách tìm gì ạ?)
    2.  **User**: "Kore wa ikura desu ka?" (Cái này bao nhiêu tiền?)
    3.  **AI**: "Sore wa 300-en desu." (Cái đó 300 yên.)
    4.  **User**: (Nói sai) "Watashi wa kaimasu." (Tôi mua - hơi thiếu tự nhiên)
    5.  **AI Feedback** (Sau khi đoạn hội thoại kết thúc hoặc Real-time tùy setting):
        -   "Em làm tốt lắm! Tuy nhiên câu cuối người Nhật thường nói là 'Kore o kudasai' (Cho tôi cái này) sẽ tự nhiên hơn 'Watashi wa kaimasu' nhé."

### 3.3. Feature: Sakubun Corrector (Sửa bài viết/Nhật ký)

**Scenario**: Học viên viết một đoạn văn ngắn về "Gia đình tôi".
-   **User Input**: "Watashi no kazoku wa 4-nin imasu. Chichi to haha to..."
-   **AI Sensei**:
    -   **Correction**: Highlight lỗi sai.
        -   *Lỗi*: "4-nin imasu" -> *Sửa*: "4-nin desu" (Tự nhiên hơn khi giới thiệu tổng số) hoặc giữ nguyên nếu ngữ cảnh đếm sự tồn tại.
    -   **Explanation**: Giải thích tại sao sai.
    -   **Polished Version**: Đưa ra phiên bản "Native" hơn.

### 3.4. Feature: Furigana & Translation Helper
-   Mọi đầu ra của AI (tiếng Nhật) đều phải kèm theo metadata để Frontend hiển thị:
    -   **Furigana**: Cách đọc Kanji (trên đầu chữ).
    -   **Romaji**: (Optional, cho N5).
    -   **Translation**: Dịch nghĩa tiếng Việt.

---

## 4. Technical Architecture (Japanese Specific)

Hệ thống không dùng logic Agent cũ, mà xây dựng một pipeline RAG (Retrieval-Augmented Generation) chuyên biệt.

### 4.1. The "Syllabus Knowledge Base" (Vector DB)
Để AI hiểu bài học, chúng ta cần index nội dung khóa học vào Vector DB (như Pinecone, Weaviate, hoặc pgvector ngay trong Postgres).

-   **Document Structure**:
    -   `CourseID / LessonID`
    -   `Grammar Points`: Các mẫu ngữ pháp trong bài (VD: `V-masu`, `Adj-na`).
    -   `Vocabulary List`: Từ vựng xuất hiện trong bài.
    -   `Target Level`: N5, N4...

### 4.2. Prompt Engineering Strategy

Cấu trúc System Prompt mẫu cho AI Sensei:

```text
You are 'Torii Sensei', a helpful Japanese language tutor.
Your student is currently at Level: {{CURRENT_LEVEL}} (e.g., JLPT N5).
Current Lesson Context: {{LESSON_CONTEXT_SUMMARY}}.

Rules:
1. ONLY use vocabulary and grammar appropriate for {{CURRENT_LEVEL}}. Do NOT use N2/N1 grammar unless explicitly asked.
2. If the user makes a mistake, correct them gently and explain WHY based on the grammar rules of {{LESSON_CONTEXT}}.
3. Always respond in a polite 'Desu/Masu' form unless in a specific Roleplay mode.
4. For every Japanese sentence you generate, provide the output in a JSON structure containing: { "text": "...", "furigana": "...", "vietnamese": "..." }.
```

### 4.3. Data Model (New)

Tạo thêm các bảng hỗ trợ cho Agent Tiếng Nhật trong `schema.prisma`.

#### `AiConversation`
Lưu trữ lịch sử chat.
-   `id`: UUID
-   `userId`: UUID
-   `mode`: Enum (`FREE_CHAT`, `ROLEPLAY`, `CORRECTION`)
-   `contextType`: Enum (`LESSON`, `GENERAL`)
-   `contextId`: UUID? (Link tới Lesson đang học)
-   `createdAt`: DateTime

#### `AiMessage`
Chi tiết tin nhắn.
-   `conversationId`: UUID
-   `role`: Enum (`USER`, `ASSISTANT`)
-   `content`: Text
-   `structuredContent`: JSONB (Chứa Furigana, Translation, AudioUrl)
-   `correctionData`: JSONB (Nếu là bài sửa lỗi: chứa diff, explanation)

#### `JapaneseRoleplayScenario`
Kịch bản hội thoại mẫu (do giáo viên biên soạn).
-   `id`: UUID
-   `lessonId`: UUID
-   `title`: String (e.g., "Tại bưu điện")
-   `botPersona`: String (e.g., "Post Office Staff")
-   `userRole`: String (e.g., "Customer sending a package")
-   `mission`: String (e.g., "Gửi bưu kiện sang Nhật bằng đường biển")
-   `sampleDialog`: JSONB (Hội thoại mẫu để AI tham khảo)
-   `initialMessage`: String

---

## 5. Development Roadmap

### Phase 1: The "Lesson Explainer" (MVP)
-   Tích hợp cửa sổ chat vào trang bài học (`LessonPlayer`).
-   Gửi `lessonId` kèm theo tin nhắn.
-   Backend lookup nội dung text của bài học -> Gửi vào Prompt.
-   AI trả lời câu hỏi ngữ pháp.

### Phase 2: The "Sakubun Helper"
-   Tạo UI cho phép user nhập đoạn văn.
-   Prompt chuyên biệt để check lỗi chính tả, ngữ pháp tiếng Nhật.
-   Hiển thị Diff (Sự khác biệt) giữa bản gốc và bản sửa.

### Phase 3: The "Kaiwa Partner" (Voice)
-   Tích hợp STT (Speech-to-Text) và TTS (Text-to-Speech) tiếng Nhật (Google/OpenAI/Azure).
-   User nói -> Chuyển thành text -> AI xử lý -> AI trả lời bằng Voice.
-   Hỗ trợ kịch bản Roleplay.

---

## 6. Integration with Core LMS

-   **LearningProgress**: AI sẽ được trigger dựa trên progress.
    -   Ví dụ: Nếu user fail Quiz bài 3 -> AI tự động nhắn: "Em có vẻ đang gặp khó khăn với trợ từ 'de', chúng ta ôn lại chút nhé?".
-   **Flashcard System**:
    -   Trong lúc chat, nếu gặp từ mới, User có thể bấm "Add to Flashcard" -> Gọi API tạo Flashcard từ đoạn chat.

---

## 7. Migration Note
Đây là module hoàn toàn mới, không phụ thuộc vào code cũ. Nó sẽ nằm trong service `apps/server/services/ai-sensei` (hoặc module `ai` trong `academy` monolith) và giao tiếp với Core LMS qua Database (Read-only) hoặc Internal API.
