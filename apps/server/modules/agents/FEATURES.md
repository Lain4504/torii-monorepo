# Agents Service – Phân tích tính năng & luồng xử lý

Tài liệu mô tả các tính năng hiện có và luồng xử lý của **Agents Service** trong backend Torii (học tiếng Nhật / JLPT).

---

## 1. Tổng quan kiến trúc

### 1.1. Kiến trúc end-to-end

Luồng chính từ học viên (web) đến AI:

```mermaid
flowchart LR
    learner[WebLearnerApp] -->|HTTP (REST)| gateway[GatewayService]
    gateway -->|NATS cmds| agents[AgentsService]
    agents --> sensei[Sensei/Assessment/Analytics Services]
    sensei --> fastmcp[FastMcpService]
    fastmcp --> prisma[Prisma DB]
    fastmcp --> gemini[Gemini API]
```

- **Web-learner** (`apps/web-learner/`): NextJS app, gọi REST `POST /api/agents/*` qua `agentApi` (file `apis/services/agent-api.ts`).
- **Gateway** (`apps/server/modules/gateway/`): Controller nhận HTTP, inject `userId` từ JWT, publish message NATS với `cmd` dạng `agents.sensei.*`, `agents.assessment.*`, `agents.analytics.*`.
- **Agents Service** (`apps/server/modules/agents/`):
  - Chạy **hybrid**: NestJS HTTP + NATS microservice (port mặc định **8090**).
  - Các **NATS handlers** (Sensei / Assessment / Analytics) nhận message, gọi Domain Service tương ứng.
- **FastMcpService**:
  - Đăng ký và thực thi **tools** nội bộ (grammar check, drill generation, test generation, analytics…).
  - Lấy **user context** từ Prisma: enrollment, course JLPT level, quiz attempts, lesson progress.
  - Load **prompt template** (Handlebars) từ `src/assets/prompts/`, render với input + userContext.
  - Gọi **Gemini** (`gemini-2.0-flash`) và parse JSON từ response.
- **Prisma DB**: lưu toàn bộ dữ liệu học tập thật (courses, lessons, quizzes, flashcards, progress, attempts…).

### 1.2. Data flow chi tiết (request → AI → response)

1. Học viên thao tác trên UI (ví dụ: gửi câu cần sửa ngữ pháp, yêu cầu đề JLPT, mở dashboard analytics).
2. Frontend gọi **REST** tới Gateway, ví dụ:
   - `POST /api/agents/grammar-check`
   - `POST /api/agents/test/generate`
   - `POST /api/agents/progress/track`
3. Gateway:
   - Check auth (`GatewayAuthGuard`), lấy `userId` từ token.
   - Build payload `{ userId, ...body }`.
   - Gửi **NATS message** với pattern `agents.<domain>.<action>`.
4. NATS Handler tương ứng trong **Agents Service** nhận payload:
   - Gọi Service (Sensei/Assessment/Analytics) theo từng action.
5. Domain Service gọi **FastMcpService.callTool(toolName, { userId, ...input })**:
   - `getUserContext(userId)` → enrollments, JLPT levels, recentActivity.
   - `loadPromptTemplate()` → render prompt tiếng Nhật + metadata JLPT.
   - `callGemini(prompt)` → nhận text kết quả.
   - `cleanJsonResponse()` → trích JSON (có thể chứa phần tiếng Nhật, romaji, giải thích tiếng Việt/Anh).
6. Domain Service chuẩn hóa dữ liệu trả về (đúng với response schema mà frontend mong đợi) và trả về qua NATS → Gateway → REST response cho frontend.

### 1.3. MCP và các luồng AI khác trong hệ thống

- Agents Service còn khởi chạy **FastMCP HTTP server** nội bộ (port **4000**) và mount proxy `/mcp/*`:
  - Dùng cho client **MCP bên ngoài** (IDE, tool) nếu cần truy cập thẳng vào tools.
  - Trong luồng e-learning hiện tại, **web-learner chỉ dùng NATS/REST**, không dùng `/mcp`.
- Trong `apps/server/modules/meet/`, module **Insights** sử dụng AI cho transcription, translation, AI chat, meeting summarization:
  - Đây là luồng AI phục vụ **phòng họp / lớp học live** (LiveKit), không đi qua Agents Service.
  - Insights gửi payload qua NATS channel riêng (`plug-n-meet-insights`) và quản lý context bằng Redis.

- **Kết luận kiến trúc**:  
  - Agents Service là lớp **AI cho e-learning self-paced** (Sensei, Assessment, Analytics) dựa trên dữ liệu học tập trong Prisma.  
  - Insights Service là lớp **AI cho realtime meeting**. Hai luồng này tách biệt nhưng cùng chạy trong `apps/server`.

---

## 2. Giao tiếp với các module backend khác

Agents Service không hoạt động độc lập mà dựa vào/làm việc cùng nhiều module backend khác:

- **Learning module (flashcards, lessons, quizzes)**:
  - Chịu trách nhiệm **lưu trữ dữ liệu học tập thật**:
    - Deck flashcards, thẻ, metadata JLPT (furigana, kanji, partOfSpeech, wordJlptLevel…).
    - Lesson progress, quiz attempts, điểm số, lịch sử học.
  - Agents Service:
    - Dùng Prisma để đọc các thông tin này trong `FastMcpService.getUserContext`.
    - Khi AI sinh flashcards, kết quả được gửi về frontend, sau đó được lưu qua **learning flashcard service** (`FlashcardService`) với cờ `aiGenerated`, `generationMethod`, `generationMetadata`.
  - **Ranh giới**:
    - Agents: \"nghĩ\" và sinh nội dung/giải thích.
    - Learning: lưu dữ liệu, quản lý SRS, quyền sở hữu deck, thống kê sử dụng.

- **Assessment/Learning core (điểm, tiến độ, readiness)**:
  - Logic chấm điểm, lưu kết quả quiz/test, tính toán tiến độ nên nằm ở các service này.
  - Agents Service chỉ nên:
    - Nhận dữ liệu đã chấm (score, đúng/sai từng câu) → sinh **giải thích** và **đề xuất luyện tập**.
    - Hoặc khi cần benchmark/readiness, đọc aggregations sẵn từ DB rồi tóm tắt.

- **Meet/Insights module (realtime lớp học / meeting)**:
  - Insights Service quản lý transcription, translation, AI chat, meeting summarization cho phòng LiveKit:
    - Giao tiếp qua NATS channel riêng (`plug-n-meet-insights`), dùng Redis để giữ context và token usage.
    - Kịch bản: giáo viên/buổi học live muốn phụ đề, dịch, tóm tắt cuộc họp.
  - Agents Service không tham gia trực tiếp luồng này; cả hai chỉ cùng dùng chung:
    - Cơ sở hạ tầng NATS, Redis, Prisma, AppConfig.
  - **Ranh giới**:
    - Insights: realtime, room-based, multi-user.
    - Agents: request/response cho từng learner, không có khái niệm room.

Tóm lại:

- **Agents Service** = lớp AI domain-specific cho e-learning tiếng Nhật (Sensei, Assessment, Analytics) dựa trên dữ liệu học tập.
- **Các module Learning/Assessment/Analytics core** = nơi giữ nghiệp vụ deterministic (lưu trữ, scoring, tracking, scheduling).
- **Insights Service** = lớp AI realtime cho meeting/lớp học trực tuyến.

---

## 13. Định hướng refactor trong tương lai

Một số hướng refactor/tối giản có thể cân nhắc để Agents Service bám sát nghiệp vụ hơn:

- **1. Scoring & Readiness deterministic**
  - Chấm điểm (score, đúng/sai) hiện đã được thực hiện bằng **TypeScript code** trong Agents service (không để AI tự quyết định số liệu).
  - Readiness profile sử dụng số liệu thật từ DB (Prisma) thông qua NATS pattern `learning.readinessMetrics`.
  - AI chỉ đóng vai trò sinh **giải thích (narrative)**, **gợi ý học tập (recommendations)** và **phân tích điểm yếu (weaknesses)**.

- **2. Hợp nhất các luồng Readiness/Benchmark/Weaknesses**
  - Thiết kế một API duy nhất kiểu `agents.analytics.readinessProfile`:
    - Input: `userId`, `targetLevel`.
    - Output: metrics (từ DB) + narrative (từ AI).
  - Cập nhật frontend (Assessment/Analytics dashboard) để dùng API này thay vì nhiều endpoint nhỏ.

- **3. Đơn giản hóa Sensei endpoints với mô hình chat + tools**
  - Xem xét hướng:
    - Giữ `agents.sensei.chat` là endpoint chính.
    - Các tool `grammarCheck`, `translate`, `generateDrill`, `createFlashcard`, `recommendResources`, `simulateConversation` trở thành **internal tools** được model gọi trong quá trình chat.
  - Frontend:
    - Có thể giữ các màn hình shortcut (Grammar, Translate…) nhưng phía gateway gom về cùng một luồng agent nếu phù hợp.

- **4. Chuẩn hoá và/hoặc loại bỏ các API ít dùng**
  - `scheduleTest`: Đã xoá (legacy). Gợi ý lịch thi nên là một phần của `readinessProfile`.
  - `predictReadiness`, `identifyWeaknesses`: Đã gộp vào `readinessProfile`.
  - Luồng `PlacementTestWizard` cũ: Đã xoá, sử dụng luồng `/assessment/placement` (PlacementTest) chuẩn.

- **5. Rà soát nhu cầu MCP**
  - Nếu team không dùng client MCP bên ngoài (IDE, tooling), có thể:
    - Tắt FastMCP HTTP server.
    - Giữ lại `FastMcpService` như một lớp tool registry + prompt engine nội bộ.
  - Nếu cần MCP:
    - Hoàn thiện SSE, healthcheck, docs cho `/mcp`.
    - Quy định rõ tool nào exposed cho MCP, tool nào chỉ dùng nội bộ.

- **6. Tăng độ gắn kết với dữ liệu JLPT & course**
  - Dần chuyển từ prompt \"tự do\" sang:
    - Prompt biết rõ course, lesson, jlptLevel, mục tiêu học cụ thể.
    - Kết hợp dữ liệu từ bảng course/lesson/flashcard/quiz để AI bám sát nội dung đã học.

Đây là tài liệu thiết kế để team backend + frontend + product thảo luận và đồng bộ khi chỉnh sửa Agents Service trong các sprint sau.

---

## 2. Luồng xử lý chi tiết

1. **Gateway** nhận HTTP request → gửi NATS message với `cmd` (pattern) và payload.
2. **NATS Handler** tương ứng (Sensei / Assessment / Analytics) nhận message, gọi **Domain Service**.
3. **Domain Service** đăng ký **tools** với FastMcpService; mỗi lần gọi = `callTool(toolName, args)`.
4. **FastMcpService**:
   - Lấy **user context** (enrollments, courses, JLPT levels, recent activity) từ **Prisma**.
   - Load **prompt template** (Handlebars) từ `src/assets/prompts/`.
   - Gọi **Gemini** với prompt đã render.
   - Parse response (ưu tiên JSON trong code block) và trả về.

---

## 3. Luồng người dùng chính (End-user flows)

Mục này mô tả theo **góc nhìn học viên**: UI nào gọi Agents, qua REST nào, đi vào NATS/Service nào.

### 3.1. Sensei – Gia sư AI hỗ trợ học tiếng Nhật

| Flow | UI (web-learner) | REST Gateway | NATS `cmd` | Ghi chú |
|------|------------------|--------------|------------|--------|
| **Chat với Sensei** | `/ai-sensei/chat` (ChatInterface) | `POST /api/agents/chat` | `agents.sensei.chat` | Chat tự do, frontend gửi `{ message, history }`. History chỉ là context tạm thời, không có memory dài hạn phía backend. |
| **Kiểm tra ngữ pháp** | `/ai-sensei/grammar` (GrammarForm) | `POST /api/agents/grammar-check` | `agents.sensei.grammarCheck` | Input `{ text }`. Dùng cho câu tiếng Nhật bất kỳ, không gắn lesson cụ thể. |
| **Dịch (JA ↔ EN/VN)** | `/ai-sensei/translate` (TranslatorView) | `POST /api/agents/translate` | `agents.sensei.translate` | Input `{ text, sourceLanguage, targetLanguage }`. Ngôn ngữ có thể là Japanese, English, Vietnamese. |
| **Sinh bài tập luyện (Drill)** | `/ai-sensei/drill` (DrillGenerator) | `POST /api/agents/drill/generate` | `agents.sensei.generateDrill` | Input `{ type, topic, difficulty, count }` với `type = grammar/vocabulary/kanji/listening/reading`, `difficulty = N5–N1`. |
| **Sinh flashcard** | `/ai-sensei/flashcards` (FlashcardGenerator) | `POST /api/agents/flashcard` | `agents.sensei.createFlashcard` | Input `{ topic, difficulty }` với `difficulty = beginner/intermediate/advanced`. Dùng để tạo bộ thẻ từ chủ đề. |
| **Gợi ý tài nguyên học** | `/ai-sensei/resources` (ResourceRecommender) | `POST /api/agents/resources/recommend` | `agents.sensei.recommendResources` | Input `{ topic, resourceType }` với `resourceType = all/video/article/book/tool`. Hiện AI dựa trên prompt chung, chưa nối catalog thật. |
| **Roleplay hội thoại** | `/ai-sensei/roleplay` (RoleplayStudio) | `POST /api/agents/conversation/simulate` | `agents.sensei.simulateConversation` | Input `{ scenario, difficulty, turns }`. Frontend cho phép nhập scenario tự do trong khi backend mong đợi enum (restaurant/shopping/station/office/casual/formal). |

- **Context backend**: mọi flow trên chỉ gửi dữ liệu cần thiết (text, topic, level…), còn thông tin về:
  - Khóa học đã enroll, JLPT levels, lịch sử điểm/lesson trong 30 ngày
  - … được **FastMcpService.getUserContext(userId)** lấy từ Prisma và đưa vào prompt.

### 3.2. Assessment – Thi thử JLPT, placement

| Flow | UI (web-learner) | REST Gateway | NATS `cmd` | Ghi chú |
|------|------------------|--------------|------------|--------|
| **Tạo đề JLPT test** | `/assessment/test` (TestRunner – bước tạo đề) | `POST /api/agents/test/generate` | `agents.assessment.generateTest` | Input `{ level, section, questionCount }`. Đề hoàn toàn do AI sinh từ prompt, chưa dùng question bank thật. |
| **Làm & chấm bài JLPT test** | `/assessment/test` (TestRunner – nộp bài) | `POST /api/agents/test/evaluate` | `agents.assessment.evaluateTest` | Input `{ testId, answers }`. Payload đã chứa đáp án đúng nhưng vẫn gửi qua AI để chấm + feedback. |
| **Readiness Profile** | `/assessment`, `/ai-analytics` | `POST /api/agents/analytics/readiness-profile` | `agents.analytics.readinessProfile` | **Mới**. Thống nhất benchmark, readiness, và weaknesses vào một API. |
| **Placement test (xếp lớp)** | `/assessment/placement` (PlacementTest) | `POST /api/agents/placement/test` | `agents.assessment.placementTest` | Input `{ questionCount }` (mặc định 15). Câu hỏi do AI sinh. |
| **Chấm placement test** | `/assessment/placement` (PlacementTest) | `POST /api/agents/placement/evaluate` | `agents.assessment.evaluatePlacement` | Input `{ testId, userAnswers }`. Output gồm điểm + `suggestedLevel`, `analysis`. |

Ngoài ra còn tồn tại một luồng placement cũ hơn (`PlacementTestWizard`) sử dụng `fetch('/api/agents/placement/...')` trực tiếp, không đi qua `agentApi`. Luồng này:

- Gửi `questionCount = 10` thay vì 15.
- Kỳ vọng response shape hơi khác (ví dụ field `assessedLevel`, `studyPathRecommendation.weeklySchedule`).
- Dễ bị 404 nếu không cấu hình reverse proxy từ frontend tới Gateway.  

→ Với góc nhìn product, nên coi **luồng `/assessment/placement` + `agentApi` là chuẩn**, luồng cũ cần dọn dẹp hoặc ẩn.

### 3.3. Analytics – Theo dõi tiến độ, lộ trình học

| Flow | UI (web-learner) | REST Gateway | NATS `cmd` | Ghi chú |
|------|------------------|--------------|------------|--------|
| **Xem tiến độ tổng quan** | `/ai-analytics` (AnalyticsDashboard) | `POST /api/agents/progress/track` | `agents.analytics.trackProgress` | Input `{ timeframe }` (thường là `'month'`). Dữ liệu chuẩn nên đến từ DB (lessonProgress, quizAttempt). |
| **Gợi ý lộ trình học (study path)** | `/ai-analytics` (AnalyticsDashboard) | `POST /api/agents/path/suggest` | `agents.analytics.suggestStudyPath` | Input `{ targetLevel }` (UI thường hardcode `'N5'`). Output: roadmap tuần, focus areas. |
| **Xác định điểm yếu** | `/ai-analytics` | `POST /api/agents/analytics/readiness-profile` | `agents.analytics.readinessProfile` | Đã gộp vào Readiness Profile. |
| **Predict readiness** | `/ai-analytics` | `POST /api/agents/analytics/readiness-profile` | `agents.analytics.readinessProfile` | Đã gộp vào Readiness Profile. |
| **Generate report (chưa có UI)** | (chưa có màn hình) | `POST /api/agents/analytics/report` | `agents.analytics.generateReport` | Tạo báo cáo tổng hợp dạng markdown/nội dung chi tiết. |

---

## 4. Các module và tính năng

### 4.1. Sensei Agent (Gia sư / Hỗ trợ học tập)

| # | Tính năng | Tool (internal) | NATS `cmd` | REST Gateway | Dùng trong frontend? | Mô tả ngắn |
|---|-----------|------------------|------------|--------------|----------------------|------------|
| 1 | **Grammar Check** | `sensei_check_grammar` | `agents.sensei.grammarCheck` | `POST /api/agents/grammar-check` | **core** (`/ai-sensei/grammar`) | Kiểm tra ngữ pháp tiếng Nhật, gợi ý sửa. |
| 2 | **Translate** | `sensei_translate` | `agents.sensei.translate` | `POST /api/agents/translate` | **core** (`/ai-sensei/translate`) | Dịch văn bản JA ↔ EN/VN với ghi chú văn hoá. |
| 3 | **Create Flashcard** | `sensei_create_flashcard` | `agents.sensei.createFlashcard` | `POST /api/agents/flashcard` | **core** (`/ai-sensei/flashcards`, dashboard flashcards) | Tạo flashcard theo chủ đề, mức độ. |
| 4 | **Practice Drill** | `sensei_generate_drill` | `agents.sensei.generateDrill` | `POST /api/agents/drill/generate` | **core** (`/ai-sensei/drill`) | Sinh bài tập (grammar / vocabulary / kanji / listening / reading) theo level JLPT. |
| 5 | **Simulate Conversation** | `sensei_simulate_conversation` | `agents.sensei.simulateConversation` | `POST /api/agents/conversation/simulate` | **core** (`/ai-sensei/roleplay`) | Mô phỏng hội thoại theo scenario, gồm tiếng Nhật, romaji, tiếng Anh. |
| 6 | **Recommend Resources** | `sensei_recommend_resources` | `agents.sensei.recommendResources` | `POST /api/agents/resources/recommend` | **auxiliary** (`/ai-sensei/resources`) | Gợi ý tài liệu (article, video, book, app, website); cần nối catalog thật. |
| 7 | **Chat** | `sensei_chat` | `agents.sensei.chat` | `POST /api/agents/chat` | **core** (`/ai-sensei/chat`) | Chat chung với Sensei (message + history), có thể là entry point để gọi các tool khác. |

**Payload NATS (đã chuẩn hoá theo gateway/frontend):**

- `grammarCheck`: `{ userId, text }`
- `translate`: `{ userId, text, sourceLanguage, targetLanguage }`
- `createFlashcard`: `{ userId, topic, difficulty? }`
- `generateDrill`: `{ userId, type, topic, difficulty?, count? }`
- `simulateConversation`: `{ userId, scenario, difficulty?, turns? }`
- `recommendResources`: `{ userId, topic, resourceType? }`
- `chat`: `{ userId, message, history? }`

**Prompt templates:** `assets/prompts/sensei/` (grammar-check, translation, flashcard-creation, practice-drill, conversation-simulation, resource-recommendation, chat).

---

### 4.2. Assessment Agent (Đánh giá / Thi thử JLPT)

| # | Tính năng | Tool (internal) | NATS `cmd` | REST Gateway | Dùng trong frontend? | Mô tả ngắn |
|---|-----------|------------------|------------|--------------|----------------------|------------|
| 1 | **Generate JLPT Test** | `assessment_generate_test` | `agents.assessment.generateTest` | `POST /api/agents/test/generate` | **core** (`/assessment/test`) | Tạo đề thi thử JLPT theo level, section. |
| 2 | **Evaluate Test** | `assessment_evaluate_test` | `agents.assessment.evaluateTest` | `POST /api/agents/test/evaluate` | **core** (`/assessment/test`) | Chấm bài và sinh feedback chi tiết. |
| 3 | **Progress Benchmark** | `assessment_get_benchmark` | `agents.assessment.progressBenchmark` | `POST /api/agents/assessment/benchmark` | **core** (`/assessment`) | So sánh tiến độ với chuẩn JLPT cho một target level. |
| 4 | **Schedule Test** | - | - | - | **Đã xoá** | Gợi ý lịch thi đã gộp vào Readiness Profile. |
| 5 | **Placement Test** | `assessment_placement_test` | `agents.assessment.placementTest` | `POST /api/agents/placement/test` | **core** (`/assessment/placement`) | Tạo bài test xếp lớp, câu hỏi từ AI. |
| 6 | **Evaluate Placement** | `assessment_evaluate_placement` | `agents.assessment.evaluatePlacement` | `POST /api/agents/placement/evaluate` | **core** (`/assessment/placement`) | Chấm placement, đề xuất level và phân tích. |

**Payload NATS (đã chuẩn hoá theo gateway/frontend):**

- `generateTest`: `{ userId, level, section, questionCount? }`
- `evaluateTest`: `{ userId, testId, answers }`
- `progressBenchmark`: `{ userId, targetLevel? }`
- `scheduleTest`: `{ userId, targetLevel? }`
- `placementTest`: `{ userId, questionCount? }`
- `evaluatePlacement`: `{ userId, testId, userAnswers }`

**Prompt templates:** `assets/prompts/assessment/` (jlpt-test-generation, test-evaluation, progress-benchmark, test-scheduling, placement-test, placement-evaluation).

---

### 4.3. Analytics Agent (Phân tích & báo cáo)

| # | Tính năng | Tool (internal) | NATS `cmd` | REST Gateway | Dùng trong frontend? | Mô tả ngắn |
|---|-----------|------------------|------------|--------------|----------------------|------------|
| 1 | **Track Progress** | `analytics_track_progress` | `agents.analytics.trackProgress` | `POST /api/agents/progress/track` | **core** (`/ai-analytics`) | Theo dõi tiến độ học theo timeframe (week / month / quarter / year). |
| 2 | **Suggest Study Path** | `analytics_suggest_study_path` | `agents.analytics.suggestStudyPath` | `POST /api/agents/path/suggest` | **core** (`/ai-analytics`) | Gợi ý lộ trình học cá nhân hóa theo target JLPT. |
| 3 | **Identify Weaknesses** | `analytics_identify_weaknesses` | `agents.analytics.identifyWeaknesses` | `POST /api/agents/analytics/weaknesses` | **core** (`/ai-analytics`) | Xác định điểm yếu / lỗ hổng kiến thức dựa trên kết quả học. |
| 4 | **Predict Readiness** | `analytics_predict_readiness` | `agents.analytics.predictReadiness` | `POST /api/agents/analytics/readiness` | **auxiliary** (API, chưa UI riêng) | Dự đoán mức độ sẵn sàng JLPT, trùng ý với benchmark. |
| 5 | **Generate Report** | `analytics_generate_report` | `agents.analytics.generateReport` | `POST /api/agents/analytics/report` | **auxiliary** (API, chưa UI) | Tạo báo cáo chi tiết (progress / assessment / comprehensive). |

**Payload NATS (đã chuẩn hoá theo gateway/frontend):**

- `trackProgress`: `{ userId, timeframe? }`
- `suggestStudyPath`: `{ userId, targetLevel?, timeframe? }`
- `identifyWeaknesses`: `{ userId }`
- `predictReadiness`: `{ userId, targetLevel? }`
- `generateReport`: `{ userId, reportType?, timeframe? }`

**Prompt templates:** `assets/prompts/analytics/` (progress-tracking, study-path-suggestion, weakness-identification, readiness-prediction, report-generation).

---

## 5. Bảng NATS commands (Gateway gọi)

| Command | Handler | Service method (ví dụ) |
|--------|---------|------------------------|
| `agents.sensei.grammarCheck` | SenseiHandler | senseiService.checkGrammar |
| `agents.sensei.translate` | SenseiHandler | senseiService.translate |
| `agents.sensei.createFlashcard` | SenseiHandler | senseiService.createFlashcard |
| `agents.sensei.generateDrill` | SenseiHandler | senseiService.generatePracticeDrill |
| `agents.sensei.simulateConversation` | SenseiHandler | senseiService.simulateConversation |
| `agents.sensei.recommendResources` | SenseiHandler | senseiService.recommendResources |
| `agents.sensei.chat` | SenseiHandler | senseiService.chat |
| `agents.assessment.generateTest` | AssessmentHandler | assessmentService.generateJlptTest |
| `agents.assessment.evaluateTest` | AssessmentHandler | assessmentService.evaluateTest |
| `agents.assessment.progressBenchmark` | AssessmentHandler | assessmentService.getProgressBenchmark |
| `agents.assessment.scheduleTest` | AssessmentHandler | assessmentService.scheduleTest |
| `agents.assessment.placementTest` | AssessmentHandler | assessmentService.generatePlacementTest |
| `agents.assessment.evaluatePlacement` | AssessmentHandler | assessmentService.evaluatePlacementTest |
| `agents.analytics.trackProgress` | AnalyticsHandler | analyticsService.trackProgress |
| `agents.analytics.suggestStudyPath` | AnalyticsHandler | analyticsService.suggestStudyPath |
| `agents.analytics.identifyWeaknesses` | AnalyticsHandler | analyticsService.identifyWeaknesses |
| `agents.analytics.predictReadiness` | AnalyticsHandler | analyticsService.predictReadiness |
| `agents.analytics.generateReport` | AnalyticsHandler | analyticsService.generateReport |

---

## 6. Cấu trúc thư mục (tóm tắt)

```
apps/server/modules/agents/
├── src/
│   ├── agents.module.ts          # Module gốc, import Sensei/Assessment/Analytics/FastMcp, đăng ký 3 NATS handlers
│   ├── main.ts                   # Bootstrap: NATS + HTTP (port 8090), proxy /mcp -> FastMCP :4000
│   ├── assets/prompts/           # Handlebars templates cho từng tool
│   │   ├── sensei/
│   │   ├── assessment/
│   │   └── analytics/
│   ├── dtos/                     # DTO validation (sensei, assessment, analytics)
│   ├── fastmcp/
│   │   ├── fastmcp.module.ts
│   │   ├── fastmcp.service.ts    # Gemini, tools, prompt load, user context, cleanJsonResponse
│   │   └── mcp.controller.ts     # GET /mcp/sse, /mcp/health
│   ├── interfaces/nats/          # NATS message handlers (sensei, assessment, analytics)
│   └── modules/
│       ├── sensei/               # SenseiService + SenseiModule
│       ├── assessment/           # AssessmentService + AssessmentModule
│       └── analytics/            # AnalyticsService + AnalyticsModule
├── README.md                     # Mô tả Cortex/Sensei/Assessment/Analytics (conceptual)
└── FEATURES.md                   # File này – phân tích tính năng & luồng
```

---

## 7. Công nghệ & phụ thuộc

- **NestJS**: Module, Controller (NATS), Service, Dependency Injection.
- **NATS**: Microservice transport (gateway ↔ agents).
- **FastMCP**: Server MCP (HTTP stream), đăng ký tools; có thể dùng từ client MCP bên ngoài (qua proxy /mcp).
- **Google Generative AI (Gemini)**: `gemini-2.0-flash`, temperature 0.7, maxOutputTokens 8192.
- **Handlebars**: Render prompt từ template + userContext/timestamp/input.
- **Prisma**: Lấy user context (enrollment, course, lesson progress, quiz attempt).
- **Zod**: Schema cho tham số tool khi đăng ký trong FastMcpService.

---

## 8. User context (FastMcpService.getUserContext)

Dùng cho mọi tool để AI biết ngữ cảnh học viên:

- `userId`
- `enrolledCourses`: tên khóa học học viên đang tham gia.
- `jlptLevels`: các level JLPT liên quan đến khóa học.
- `aiMetadata`: dữ liệu bổ sung từ khóa học.
- `recentActivity`: 14 ngày gần nhất (số bài học, điểm trung bình).
- `commonErrors`: danh sách 10-20 câu hỏi người dùng hay sai nhất (từ QuizAttemptDetail).
- `recentVocabulary`: danh sách từ vựng mới học/ôn tập gần đây (từ FlashcardReview).
- `stats`: thông tin gamification (Level, Streak, XP hiện tại).

---

## 9. Ghi chú triển khai

- **Port**: Agents HTTP mặc định **8090**; FastMCP chạy nội bộ **4000** (proxy qua `/mcp`).
- **Không có REST API trực tiếp** cho logic agent: gateway phải gửi NATS đúng `cmd` và payload.
- Response từ AI được chuẩn hóa: ưu tiên JSON trong markdown code block, sau đó parse và trả về object; lỗi parse thì trả về `{ error, raw }`.
- DTO trong `dtos/` có thể được dùng ở gateway khi validate trước khi gửi NATS; trong agents service hiện tại handler nhận payload trực tiếp.

---

## 10. Điểm dư thừa đối với hệ thống e-learning

Phân tích dưới đây chỉ ra những phần trong luồng agents **dư thừa hoặc không phù hợp** với mô hình e-learning chuẩn (dữ liệu thật từ DB, nghiệp vụ rõ ràng, chi phí AI hợp lý).

### 9.1. Dùng AI cho nghiệp vụ có thể làm bằng DB/logic thuần

| Điểm | Mô tả | Đề xuất |
|------|--------|---------|
| **Evaluate Test** | Payload đã có `correctAnswer` từng câu. So sánh `userAnswer` vs `correctAnswer` → điểm, đúng/sai là **deterministic**. Hiện tại vẫn gọi Gemini để "evaluate". | Chấm điểm (score, correct/incorrect) nên làm ở **Learning/Assessment service** (Prisma + logic). Chỉ dùng AI (nếu cần) cho **explanation** hoặc **recommendations** cho từng câu sai. |
| **Track Progress** | Dữ liệu đã có trong DB: lesson progress, quiz attempt, completion. "Progress" = aggregate (số bài hoàn thành, điểm TB, streak). | **Analytics/Learning service** nên tính từ Prisma (group by date, sum/avg). AI chỉ nên dùng cho phần **insights** / **nextSteps** (text), không dùng để "tính" số liệu. |
| **Progress Benchmark / Predict Readiness** | Cả hai đều: userId + targetLevel → AI trả về % readiness, skill gaps. Dữ liệu thật (quiz scores, lesson completion) đã có trong userContext. | Tính **readiness %** từ dữ liệu thật (ngưỡng passing, điểm các section). Một tool **Readiness Report** (DB + optional AI cho narrative) thay cho hai tools trùng ý. |

→ **Kết luận**: Mọi thứ có thể tính được từ DB (điểm, tiến độ, readiness) không nên phụ thuộc hoàn toàn vào LLM; AI nên bổ sung **giải thích / gợi ý**, không thay thế tính toán.

---

### 9.2. Trùng lặp chức năng giữa Assessment và Analytics

| Nhóm | Tools liên quan | Vấn đề |
|------|------------------|--------|
| Readiness / Benchmark | `assessment_get_benchmark`, `analytics_predict_readiness` | Cùng input (userId, level), cùng output ý tưởng (readiness %, gaps, recommendations). Hai tools cho một nhu cầu: "Tôi đã sẵn sàng thi JLPT mức nào?". |
| Weaknesses vs Benchmark | `analytics_identify_weaknesses`, `assessment_get_benchmark` | Điểm yếu và skill gaps là một phía của cùng báo cáo. Có thể gộp vào **một báo cáo learner profile / readiness** hiển thị cả strengths/weaknesses. |

→ **Đề xuất**: Gộp thành **một luồng \"Learner Readiness / Profile\"** (Analytics hoặc Assessment), một NATS cmd, một prompt (hoặc tốt hơn: logic DB tính toán số liệu, AI chỉ tóm tắt/narrative).

---

### 9.3. Tính năng không gắn với dữ liệu thật của nền tảng

| Điểm | Mô tả | Đề xuất |
|------|--------|---------|
| **Schedule Test** | AI chỉ generate JSON schedule (ngày, loại test, topic). Không lưu DB, không tích hợp calendar/reminder thật. | Trong e-learning, "lên lịch thi" nên là **CRUD** (user chọn ngày → lưu `scheduled_test` hoặc event). Có thể bỏ tool AI hoặc chỉ dùng AI để gợi ý ngày (suggestedTestDate), còn persist do service khác. |
| **Recommend Resources** | Gợi ý article, video, book, app, website. README nói "from the platform's library" nhưng prompt không có catalog thật → AI đang **hallucinate** tên tài liệu. | Gợi ý phải dựa trên **catalog thật** (courses, lessons, quizzes trong DB). Service gọi API/DB lấy danh sách phù hợp (theo topic, level), AI có thể rank hoặc mô tả, không tự bịa tên. |
| **Generate JLPT Test / Placement Test** | Đề thi do AI sinh từ prompt. Không có question bank (câu hỏi có đáp án, giải thích, metadata) trong DB. | E-learning chuẩn: **question bank** trong DB, generate test = random/lọc theo level + section từ bank. AI có thể dùng cho **authoring** (tạo câu hỏi mới), không nên là nguồn duy nhất khi user "làm bài". |

→ **Kết luận**: Mọi tính năng "đưa ra nội dung / lịch / gợi ý" phải dựa trên **dữ liệu nền tảng** (DB). AI chỉ bổ sung (ranking, mô tả, tạo mới), không thay thế catalog/calendar/question bank.

---

### 9.4. Kiến trúc / lớp giao tiếp dư thừa

| Điểm | Mô tả | Đề xuất |
|------|--------|---------|
| **FastMCP server (port 4000) + proxy /mcp** | FastMCP chạy HTTP riêng, main app proxy `/mcp` → :4000. `McpController` chỉ placeholder (SSE chưa implement đầy đủ). | Nếu **không có client MCP bên ngoài** (IDE, Cursor, tool) kết nối tới agents thì không cần transport MCP. Chỉ cần **toolRegistry + callTool** trong FastMcpService, gọi qua NATS là đủ. Giảm một server, một proxy, dễ deploy. |
| **Tool đăng ký hai nơi** | Mỗi tool vừa `server.addTool` (FastMCP) vừa `toolRegistry.set` (NATS). Chỉ NATS đang được dùng thực tế. | Nếu bỏ MCP transport: chỉ giữ toolRegistry + handler; bỏ `this.server.addTool` và có thể đơn giản hóa FastMCP (chỉ giữ Gemini + prompt + userContext). |
| **DTO trong agents** | Thư mục `dtos/` có DTO (GrammarCheckDto, TranslateDto, ...) nhưng **handlers không dùng** (chỉ `@Payload() data: {...}`). Validation đang (hoặc nên) ở gateway. | DTO trong agents không được dùng → dư. Hoặc dùng cho validation trong handler (class-validator), hoặc xóa và chuẩn hóa payload ở gateway. |

---

### 9.5. Sensei: nhiều endpoint có thể gộp vào Chat

| Hiện tại | Nhận xét |
|----------|----------|
| 7 NATS cmd: grammarCheck, translate, createFlashcard, generateDrill, simulateConversation, recommendResources, chat | Nhiều tác vụ có thể coi là **một cuộc hội thoại** với Sensei: user nói "sửa giúp câu này", "dịch giúp", "tạo flashcard chủ đề X". |
| **Chat** đã có `message` + `history` → có thể dùng **tool-calling** trong chat: model quyết định gọi grammar_check, translate, generate_drill... | Một luồng **Sensei Chat** (có tools bên trong) có thể thay thế phần lớn 6 cmd riêng, giảm số endpoint và prompt cần bảo trì, trải nghiệm người dùng tự nhiên hơn. |

→ **Đề xuất**: Giữ các tool (grammar, translate, drill, ...) như **tools nội bộ** của một agent chat; gateway chỉ cần một (hoặc vài) pattern kiểu `agents.sensei.chat` hoặc `agents.sensei.invoke`. Các cmd riêng vẫn có thể giữ cho client cũ gọi trực tiếp (quick actions) tùy product.

---

### 9.6. Tóm tắt mức độ dư thừa

| Mức | Nội dung |
|-----|----------|
| **Nên thay đổi** | Evaluate Test (chấm bằng DB); Track Progress (tính từ DB); Schedule Test (persist lịch thật); Recommend Resources (dựa catalog); Generate Test (từ question bank). |
| **Nên gộp / đơn giản hóa** | Progress Benchmark + Predict Readiness + Identify Weaknesses → một Learner Readiness/Profile; Sensei: nhiều cmd gộp vào Chat + tool-calling. |
| **Có thể bỏ nếu không dùng** | FastMCP HTTP server + proxy /mcp; DTO trong agents nếu không validate. |

Áp dụng các điểm trên sẽ:

- Giảm chi phí AI (ít gọi model cho nghiệp vụ deterministic).
- Tăng độ tin cậy (số liệu thống kê từ DB chuẩn hoá).
- Làm trải nghiệm học tiếng Nhật mạch lạc hơn (AI tập trung vào giải thích, sửa lỗi, gợi ý lộ trình thay vì làm cả phần tính toán).

---

## 11. Phân loại tính năng: core / auxiliary / legacy

Bảng này tổng hợp lại các tính năng chính trong Agents Service theo tác động đến trải nghiệm học viên.

### 11.1. Core – bắt buộc phải ổn định, sát nghiệp vụ

| Nhóm | Tính năng | Ghi chú |
|------|-----------|--------|
| Sensei | Chat, Grammar Check, Translate, Practice Drill, Create Flashcard, Simulate Conversation | Trực tiếp hỗ trợ học viên luyện tiếng Nhật (từ vựng, ngữ pháp, hội thoại) theo JLPT. |
| Assessment | Generate JLPT Test, Evaluate Test, Progress Benchmark, Placement Test, Evaluate Placement | Liên quan đến thi thử JLPT, xếp lớp; kết quả nên dựa trên dữ liệu/question bank thật, AI chủ yếu cho giải thích & feedback. |
| Analytics | Track Progress, Suggest Study Path, Identify Weaknesses | Cho học viên cái nhìn tổng quan & lộ trình học; số liệu nên từ DB, AI viết narrative + gợi ý. |

### 11.2. Auxiliary – giá trị thêm, có thể cải thiện dần

| Nhóm | Tính năng | Ghi chú |
|------|-----------|--------|
| Sensei | Recommend Resources | Giá trị nếu gắn với catalog thật (courses/lessons/quizzes); hiện tại dễ hallucinate nên cần kiểm soát. |
| Assessment | Progress Benchmark (phần narrative), Evaluate Test (phần giải thích), Evaluate Placement (phần phân tích) | Phần giải thích/khuyến nghị là auxiliary – nên thiết kế sao cho nếu AI lỗi, điểm số & kết quả chính vẫn dùng được. |
| Analytics | Predict Readiness, Generate Report | Bổ sung thêm góc nhìn và báo cáo; có thể gộp/chung logic với benchmark & weaknesses. |

### 11.3. Legacy / experimental – xem xét dọn dẹp hoặc ẩn khỏi UI

| Nhóm | Tính năng / Luồng | Ghi chú |
|------|-------------------|--------|
| Assessment | Schedule Test (AI-only) | Không ghi vào DB hoặc calendar thực tế; có thể bỏ hoặc chuyển thành gợi ý trong UI, việc lưu do service khác làm. |
| Analytics | Readiness/Benchmark/Weaknesses trùng vai trò | Cần refactor/gộp thành 1 luồng Readiness/Profile rõ ràng, tránh API thừa. |
| Sensei | Nhiều endpoint tách biệt khi đã có Chat | Nếu sản phẩm chuyển sang mô hình agent chat + tool-calling, các endpoint riêng có thể coi là legacy (giữ cho backward-compat). |
| Hạ tầng | FastMCP HTTP server + `/mcp` proxy (nếu không có client MCP) | Nếu không dùng MCP bên ngoài, có thể tắt server này để đơn giản hoá. |
| Frontend | Luồng `PlacementTestWizard` dùng `fetch('/api/agents/placement/...')` | Khác shape và questionCount so với luồng mới; nên chuẩn hoá/loại bỏ để tránh nhầm lẫn. |

---

## 12. Nguyên tắc sử dụng AI trong e-learning tiếng Nhật

Để Agents Service thực sự phục vụ đúng nghiệp vụ học tiếng Nhật, cần tuân theo một số guideline:

- **1. Tôn trọng JLPT level và syllabus**
  - Mọi nội dung sinh ra (câu hỏi, ví dụ, hội thoại, từ vựng) phải phù hợp với **level mục tiêu** (N5–N1).
  - Prompt nên truyền rõ: `userContext.jlptLevels`, mục tiêu gần nhất (targetLevel) và loại kỹ năng (vocabulary/grammar/reading/listening).
  - Khi dùng AI để sinh câu hỏi, nên:
    - Ràng buộc cấu trúc: số lượng từ, kiểu câu, loại ngữ pháp cần kiểm tra.
    - Có bước **review/duyệt** (authoring) trước khi cho learner làm chính thức.

- **2. Ngôn ngữ hiển thị thân thiện với người học Việt**
  - Đối với giải thích, feedback:
    - Ưu tiên trả về **tiếng Nhật + romaji + giải thích tiếng Việt** (hoặc tiếng Anh nếu ngữ cảnh quốc tế).
    - Có thể cấu hình mode: `explanationLanguage = 'vi' | 'en'`.
  - Ví dụ kỳ vọng trong grammar check, drill, roleplay:  
    - Câu tiếng Nhật chuẩn + furigana (nếu là kanji).  
    - Romaji để người mới dễ đọc.  
    - Giải thích lỗi/đáp án bằng tiếng Việt, kèm ví dụ thêm nếu cần.

- **3. Hạn chế hallucination bằng dữ liệu thật từ DB**
  - Các tính năng như **Recommend Resources**, **Study Path**, **Analytics** nên:
    - Lấy danh sách courses/lessons/quizzes thật qua Prisma.
    - Cho AI nhiệm vụ **chọn lọc, sắp xếp, mô tả** thay vì tự bịa tên khóa học, link, sách.
  - Với đề thi, flashcards:
    - Ưu tiên **question bank / card bank** trong DB.
    - AI dùng cho khâu **gợi ý thêm item mới** hoặc **giải thích chi tiết**, không là nguồn duy nhất.

- **4. Rõ ràng ranh giới AI vs logic deterministic**
  - Score, pass/fail, phần trăm hoàn thành… phải được tính toán bằng code từ DB.
  - AI nên tập trung vào:
    - Giải thích vì sao sai, vì sao đúng, gợi ý bài học/phần ôn tập.
    - Tóm tắt tiến độ dưới dạng đoạn văn, nêu điểm mạnh/yếu, đưa lời khuyên.
  - Thiết kế response theo kiểu:
    - `metrics` (deterministic) + `aiNarrative` (từ Agents Service).

- **5. Tối ưu cost và latency**
  - Gom nhiều yêu cầu vào 1 lần gọi nếu hợp lý:
    - Ví dụ: generate full test (n câu) thay vì gọi AI từng câu lẻ.
  - Cache các kết quả:
    - Đề JLPT test đã sinh cho user trong 1 session.
    - Lộ trình học cho targetLevel không đổi trong một khoảng thời gian.
  - Chỉ gọi AI khi thực sự cần:
    - Không gọi AI cho những thao tác đơn giản có thể xử lý bằng DB (filter, sort, count).

- **6. Thiết kế prompt & schema chặt chẽ**
  - Duy trì prompt templates trong `assets/prompts/*` với:
    - Mô tả role rõ ràng (ví dụ: \"Bạn là gia sư tiếng Nhật...\", \"Bạn là chuyên gia JLPT...\").
    - Yêu cầu output JSON cụ thể, có ví dụ minh hoạ.
  - `FastMcpService.cleanJsonResponse()` + Zod schema nên được dùng để validate:
    - Nếu parse lỗi hoặc thiếu field quan trọng, nên trả về lỗi rõ ràng cho client để retry/hiển thị fallback.

---

*Tài liệu được tạo từ phân tích code trong `apps/server/modules/agents/`. Cập nhật khi thêm/sửa tools, handlers hoặc NATS patterns.*
