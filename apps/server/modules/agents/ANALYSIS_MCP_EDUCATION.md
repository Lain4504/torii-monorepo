# Phân tích & Đề xuất cải tiến luồng AI Agents cho Torii E-learning

Tài liệu này tổng hợp các bài học từ việc nghiên cứu 4 dự án MCP Education mã nguồn mở (EduChain, OpenEdu, WaniKani, EduBase) và đề xuất lộ trình cải tiến kỹ thuật cụ thể cho `apps/server/modules/agents`.

---

## 1. Phân tích các Reference Repositories

### A. [Lain4504/wanikani-mcp](https://github.com/Lain4504/wanikani-mcp) (Python)
*Mô hình: Personal Learning Assistant & Flashcard System*

- **Điểm mạnh:**
  - **Background Sync & Caching:** Sử dụng `APScheduler` để đồng bộ dữ liệu từ API WaniKani về database local (PostgreSQL) mỗi 30 phút.
    - *Lợi ích:* Giảm latency khi AI cần tra cứu trạng thái học tập (Level, Reviews), giảm tải cho API gốc, tránh rate limit.
  - **Tool vs Resource Separation:** Phân tách rõ ràng:
    - **Tools:** Hành động thay đổi trạng thái (`sync_data`) hoặc tính toán phức tạp (`get_leeches`).
    - **Resources:** Dữ liệu tham chiếu tĩnh hoặc ít thay đổi (`item_database`, `user_progress`).
  - **Leech Detection Logic:** Logic nghiệp vụ cứng (sai > 3 lần) để xác định từ khó nhớ, thay vì hỏi AI "cái nào khó".

### B. [Lain4504/MCP-server- (EduChain)](https://github.com/Lain4504/MCP-server-) (Python)
*Mô hình: Content Generation & Lesson Planning*

- **Điểm mạnh:**
  - **Structured Data Generation:** Sử dụng Pydantic models (`MultipleChoiceQuestion`, `LessonPlan`) để ép kiểu dữ liệu đầu ra.
    - *Lợi ích:* Đảm bảo AI luôn trả về JSON đúng cấu trúc để frontend render, không bị lỗi parse.
  - **Mock Data for Testing:** Có lớp `MockEducationalContentGenerator` giúp test luồng UI/Logic mà không tốn token AI.

### C. [Lain4504/openedu-mcp](https://github.com/Lain4504/openedu-mcp) (Python)
*Mô hình: Educational Resource Discovery*

- **Điểm mạnh:**
  - **Educational Filtering (Logic cứng):** Bộ lọc nội dung dựa trên **Grade Level** (K-2, 3-5, 6-8...) và **Subject**.
    - *Lợi ích:* Kết quả tìm kiếm (sách, bài báo) luôn phù hợp lứa tuổi, không phụ thuộc vào việc AI "tự cảm thấy" phù hợp.
  - **Cross-API Integration:** Kết hợp Wikipedia, OpenLibrary, Arxiv để đa dạng nguồn tài liệu.

### D. [EduBase/MCP](https://github.com/EduBase/MCP) (TypeScript)
*Mô hình: LMS Platform Integration*

- **Điểm mạnh:**
  - **API-First Mapping:** Mỗi endpoint API nghiệp vụ (`GET /user:me`, `POST /quiz`) được map thành một MCP Tool riêng biệt.
  - **Transport & Auth:** Hỗ trợ đầy đủ SSE/HTTP và Authentication (Bearer Token) cho remote server.

---

## 2. Gap Analysis: Torii Agents vs Best Practices

| Tính năng | Torii Agents (Hiện tại) | Best Practice (Tham khảo) | Đánh giá / Rủi ro |
| :--- | :--- | :--- | :--- |
| **Output Validation** | `cleanJsonResponse` (Regex/JSON.parse) | **Zod/Pydantic Schema** (Structured Output) | Torii dễ bị lỗi parse hoặc thiếu field khi model "sáng tạo" sai format. |
| **Context Loading** | Query Prisma trực tiếp mỗi request (`getUserContext`) | **Redis Caching / Background Sync** | Latency cao nếu user học nhiều khóa; spam DB không cần thiết cho dữ liệu ít đổi (Syllabus). |
| **Kiến thức nguồn** | Dựa vào "trí nhớ" của model (Prompt) | **Resource Abstraction / DB Lookup** | AI dễ hallucinate tên sách/bài học nếu không được cung cấp danh mục thật từ DB/Resources. |
| **Logic nghiệp vụ** | Nằm lẫn trong Prompt (ví dụ: "hãy tìm bài N5") | **Logic Code (Filter/Sort)** | Khó kiểm soát chất lượng; AI có thể gợi ý sai level JLPT. |

---

## 3. Đề xuất cải tiến kỹ thuật (Actionable Items)

Dựa trên phân tích trên, đề xuất các thay đổi kỹ thuật cụ thể cho Torii:

### 3.1. Structured Output & Validation (Học từ EduChain)
Thay vì chỉ nhắc prompt "hãy trả về JSON", hãy áp dụng validation chặt chẽ:
- **Cơ chế:**
  1. Định nghĩa **Zod Schema** cho mỗi tool output (ví dụ `DrillResponseSchema`, `FlashcardSchema`).
  2. Sử dụng chế độ **JSON Mode** hoặc **Response Schema** của Gemini 1.5 (nếu lib hỗ trợ) hoặc validate sau khi parse.
  3. **Feedback Loop:** Nếu validate lỗi, tự động gửi lại lỗi cho AI để nó sửa (tối đa 1-2 lần retry).

### 3.2. Caching Layer & Internal Resources (Học từ WaniKani)
Giảm tải DB và tăng tốc độ phản hồi:
- **Redis Cache cho UserContext:**
  - Cache `getUserContext(userId)` trong Redis với TTL 5-10 phút.
  - Invalidate cache khi user hoàn thành bài học/quiz.
- **Internal Resources (Abstraction):**
  - Tạo khái niệm "Resource" nội bộ (dù không expose qua MCP HTTP).
  - Ví dụ: `jlpt_syllabus:n5` (list grammar/vocab cứng từ DB).
  - Khi AI cần "gợi ý lộ trình", code sẽ load resource này đưa vào context thay vì để AI tự bịa.

### 3.3. Hybrid Search & Filtering (Học từ OpenEdu)
Kết hợp sức mạnh tìm kiếm của DB và khả năng tổng hợp của AI:
- **Quy trình `recommendResources` mới:**
  1. **Bước 1 (DB):** Query Elastic/Postgres tìm bài học/quiz theo `topic` và `jlptLevel` (Logic cứng).
  2. **Bước 2 (AI):** Đưa danh sách candidate từ DB vào prompt AI để rank và viết lời giới thiệu (Narrative).
  - *Kết quả:* Không bao giờ hallucinate link/tên bài học không tồn tại.

---

## 4. Lộ trình tích hợp (Mapping to Checklist)

Các đề xuất này sẽ được cập nhật vào `IMPLEMENTATION_CHECKLIST.md` dưới các mục tương ứng:

- **[I3] Structured Output & Retry Loop:** (Priority High - Ổn định hệ thống)
- **[H3] Redis Caching cho Context:** (Priority Medium - Tối ưu performance)
- **[D1+] Hybrid Search cho Resources:** (Priority Medium - Tăng độ chính xác nghiệp vụ)
