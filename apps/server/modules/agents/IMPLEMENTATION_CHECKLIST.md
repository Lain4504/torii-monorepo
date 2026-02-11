## Agents Service – Implementation Checklist

Dựa trên phân tích trong `FEATURES.md`, file này dùng để theo dõi tiến độ thực hiện các hạng mục refactor/triển khai liên quan đến AI Agents cho e-learning tiếng Nhật.

Trạng thái gợi ý: `TODO` / `IN_PROGRESS` / `DONE` (có thể cập nhật dần theo sprint).

---

## A. Scoring, progress, analytics (logic deterministic)

- **A1 – Chấm điểm JLPT test/placement bằng DB (không phụ thuộc AI cho score)**  
  - Trạng thái: TODO  
  - Việc cần làm:
    - Implement scoring trong core Assessment/Learning service (so sánh `userAnswer` vs `correctAnswer`).
    - Điều chỉnh `agents.assessment.evaluateTest` / `evaluatePlacement` để AI chỉ sinh **feedback + giải thích**, không quyết định điểm.

- **A2 – Progress & readiness dựa trên số liệu Prisma**  
  - Trạng thái: TODO  
  - Việc cần làm:
    - Viết service tổng hợp `progress` (completedLessons, averageScore, streak…) từ DB.
    - Thiết kế 1 API readiness/profile (metrics + narrative) thay thế combo `progressBenchmark`, `predictReadiness`, `identifyWeaknesses`.

---

## B. Test, question bank, placement

- **B1 – Thiết kế & sử dụng question bank JLPT**  
  - Trạng thái: TODO  
  - Việc cần làm:
    - Thiết kế schema DB cho question bank JLPT (level, section, answers, explanations, tags).
    - Cập nhật `generateTest` / `placementTest` để lấy câu hỏi từ bank + optional AI cho authoring, không sinh full đề 100% từ model.

- **B2 – Chuẩn hoá luồng placement test**  
  - Trạng thái: TODO  
  - Việc cần làm:
    - Gộp/xoá luồng `PlacementTestWizard` cũ (fetch `/api/agents/placement/...`) hoặc map về API chuẩn trong `agentApi`.
    - Thống nhất `questionCount` (10 vs 15) và response shape (sử dụng `PlacementEvaluationResponse` hiện tại).

---

## C. Sensei flows & Chat + Tools

- **C1 – Chuẩn hoá scenario trong Roleplay**  
  - Trạng thái: TODO  
  - Việc cần làm:
    - Cập nhật frontend để gửi `scenario` enum (restaurant/shopping/station/office/casual/formal) đúng với backend.
    - Điều chỉnh prompt roleplay để đảm bảo output có Japanese + romaji + (vi/en) rõ ràng.

- **C2 – Thiết kế mô hình “Sensei Chat + internal tools”**  
  - Trạng thái: TODO  
  - Việc cần làm:
    - Định nghĩa cơ chế tool-calling nội bộ trong `sensei.chat` (grammar, translate, drill, flashcard, resources, conversation).
    - Quyết định giữ hay gom bớt các endpoint riêng (`/grammar-check`, `/translate`, ...) làm shortcut map về cùng luồng chat.

---

## D. Recommend resources & study path gắn dữ liệu thật

- **D1 – Resource recommendation dựa trên catalog thật**  
  - Trạng thái: TODO  
  - Việc cần làm:
    - Thiết kế/query catalog tài nguyên (courses, lessons, quizzes, docs, videos…) từ DB.
    - Cập nhật tool `recommendResources` để dùng catalog này, AI chỉ sắp xếp/mô tả, không bịa tên/URL.

- **D2 – Study path dựa trên syllabus JLPT**  
  - Trạng thái: TODO  
  - Việc cần làm:
    - Định nghĩa syllabus JLPT cho mỗi level (topics, grammar points, kanji sets…).
    - Cập nhật `suggestStudyPath` để dựa vào syllabus + progress thật, AI tạo phần narrative roadmap/focusAreas.

---

## E. Flashcards & Learning integration

- **E1 – Chuẩn hoá luồng AI → FlashcardService**  
  - Trạng thái: TODO  
  - Việc cần làm:
    - Định nghĩa format chuẩn flashcard từ Agents (furigana, kanji, meanings, wordJlptLevel, tags…).  
    - Mapping từ output Agents sang DTO `FlashcardCreateDTO`, sử dụng các field `aiGenerated`, `generationMethod`, `generationMetadata`.

- **E2 – Mapping difficulty với jlptLevel**  
  - Trạng thái: TODO  
  - Việc cần làm:
    - Thống nhất quy tắc mapping `jlptLevel` của deck → `difficulty` (beginner/intermediate/advanced).  
    - Cập nhật các nơi frontend đang hardcode difficulty (ví dụ manage deck luôn dùng `intermediate`).

---

## F. Schedule test & calendar

- **F1 – Quyết định nghiệp vụ & triển khai schedule test**  
  - Trạng thái: TODO  
  - Việc cần làm:
    - Chốt: giữ hay bỏ `scheduleTest`.  
    - Nếu giữ:
      - Thiết kế bảng `scheduled_tests` + API/cron cần thiết.  
      - Dùng AI để gợi ý ngày/plan, còn việc persist & nhắc nhở do core service xử lý.

---

## G. Analytics dashboard & UI

- **G1 – Chuẩn hoá dashboard readiness/profile**  
  - Trạng thái: DONE
  - Ghi chú:
    - Đã tạo API `readiness-profile` thống nhất thay thế combo benchmark/readiness/weaknesses.
    - Tích hợp vào `/assessment` và `/ai-analytics` dashboards.
    - Sử dụng `targetLevel` linh hoạt thay vì hardcode.

- **G2 – Dọn API/UI legacy/auxiliary**  
  - Trạng thái: DONE
  - Ghi chú:
    - Đã xoá `PlacementTestWizard` legacy, redirect về luồng `/assessment/placement` chuẩn.
    - Ẩn các card/nút tính năng chưa dùng (schedule test) trên dashboard.

---

## H. Hạ tầng AI & chi phí

- **H1 – Quyết định về FastMCP HTTP server**
  - Trạng thái: DONE
  - Ghi chú:
    - Không dùng client MCP external.
    - `FastMcpService` chỉ còn là tool registry/prompt engine nội bộ (không khởi chạy FastMCP HTTP server).
    - Đã xoá proxy `/mcp` trong `main.ts` và bỏ MCP controller khỏi `FastMcpModule`/`AgentsModule`, không còn endpoint `/mcp` trong Agents Service.

- **H2 – Caching & tối ưu token**  
  - Trạng thái: TODO  
  - Việc cần làm:
    - Thiết kế cơ chế cache cho đề thi đã sinh, lộ trình học, phân tích analytics ổn định.  
    - Thêm metric log (token, latency) cho từng tool để tối ưu prompt/flow.

---

## I. Prompt & validation

- **I1 – Rà soát & chuẩn hoá prompt templates**  
  - Trạng thái: DONE
  - Ghi chú:
    - Đã rà soát toàn bộ template trong `assets/prompts/**`.
    - Chuẩn hoá meta-instructions sang tiếng Anh (để LLM hiểu tốt nhất) và output nội dung sang tiếng Việt (cho người dùng).
    - Tích hợp cấu trúc JSON bám sát Zod schemas.

- **I2 – Tăng cường validation output AI**  
  - Trạng thái: DONE
  - Ghi chú:
    - Đã thay thế `cleanJsonResponse` bằng `callGeminiWithSchema` tích hợp Zod validation.
    - Xử lý retry logic tự động khi AI sinh sai format JSON hoặc thiếu field.

- **I3 – Structured Output & Retry Loop (New)**
  - Trạng thái: DONE
  - Ghi chú:
    - Đã thêm `callGeminiWithSchema` trong `FastMcpService` sử dụng Zod schema + retry loop.
    - Đã định nghĩa và chia sẻ schema Sensei qua `@workspace/schemas` (`agent.dto.ts`).
    - Đã cập nhật `SenseiService` dùng các schema này cho toàn bộ tools (grammar, translate, flashcard, drill, conversation, resources, chat).

- **H3 – Caching & Internal Resources (New)**
  - Trạng thái: TODO
  - Việc cần làm:
    - Redis Cache cho `getUserContext`: Cache user profile/level/history (TTL 5-10 phút).
    - Resource Abstraction: Tạo khái niệm internal resource (ví dụ `jlpt_syllabus`) để load dữ liệu tĩnh từ DB vào context thay vì để AI tự nhớ.

- **D1+ – Hybrid Search cho Resource Recommendation (New)**
  - Trạng thái: TODO
  - Việc cần làm:
    - Kết hợp tìm kiếm DB (Postgres/Elastic) để lấy danh sách bài học/quiz phù hợp level.
    - AI chỉ đóng vai trò rank/filter và viết lời giới thiệu (narrative) từ kết quả DB.

