# Agents Service – Phân tích tính năng & luồng xử lý

Tài liệu mô tả các tính năng hiện có và luồng xử lý của **Agents Service** trong backend Torii (học tiếng Nhật / JLPT).

---

## 1. Tổng quan kiến trúc

```
Gateway (HTTP)  →  NATS  →  Agents Service (NATS Handlers)
                                    ↓
                            Domain Services (Sensei / Assessment / Analytics)
                                    ↓
                            FastMcpService (Tools + Prompt Engine)
                                    ↓
                            Gemini API (AI)
```

- **Không có HTTP controller trực tiếp** cho business logic: mọi request từ client đi qua **Gateway**, Gateway gửi message **NATS** tới Agents Service.
- Agents Service chạy **hybrid**: vừa lắng nghe NATS microservice, vừa chạy HTTP server (mặc định port **8090**) để mount proxy **/mcp** tới FastMCP (port 4000).
- **AI**: dùng **Google Gemini** (model `gemini-2.0-flash`), cấu hình qua `GEMINI_API_KEY` hoặc config.

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

## 3. Các module và tính năng

### 3.1. Sensei Agent (Gia sư / Hỗ trợ học tập)

| # | Tính năng | Tool (internal) | NATS `cmd` | Mô tả ngắn |
|---|-----------|------------------|------------|------------|
| 1 | **Grammar Check** | `sensei_check_grammar` | `agents.sensei.grammarCheck` | Kiểm tra ngữ pháp tiếng Nhật, gợi ý sửa (input: `text`, `userId`). |
| 2 | **Translate** | `sensei_translate` | `agents.sensei.translate` | Dịch văn bản giữa các ngôn ngữ (input: `text`, `from`, `to`, `userId`). |
| 3 | **Create Flashcard** | `sensei_create_flashcard` | `agents.sensei.createFlashcard` | Tạo flashcard theo chủ đề (input: `topic`, `difficulty`, `userId`). |
| 4 | **Practice Drill** | `sensei_generate_drill` | `agents.sensei.generateDrill` | Sinh bài tập (grammar / vocabulary / kanji / listening / reading) theo level JLPT. |
| 5 | **Simulate Conversation** | `sensei_simulate_conversation` | `agents.sensei.simulateConversation` | Mô phỏng hội thoại theo scenario (restaurant, shopping, station, office, casual, formal). |
| 6 | **Recommend Resources** | `sensei_recommend_resources` | `agents.sensei.recommendResources` | Gợi ý tài liệu (article, video, book, app, website). |
| 7 | **Chat** | `sensei_chat` | `agents.sensei.chat` | Chat chung với Sensei (message + history). |

**Payload NATS (ví dụ):**

- `grammarCheck`: `{ text, userId }`
- `translate`: `{ text, from, to, userId }`
- `createFlashcard`: `{ topic, difficulty?, userId }`
- `generateDrill`: `{ drillType, topic, level?, count?, userId }`
- `simulateConversation`: `{ scenario, difficulty?, turns?, userId }`
- `recommendResources`: `{ topic, resourceType?, userId }`
- `chat`: `{ message, history?, userId }`

**Prompt templates:** `assets/prompts/sensei/` (grammar-check, translation, flashcard-creation, practice-drill, conversation-simulation, resource-recommendation, chat).

---

### 3.2. Assessment Agent (Đánh giá / Thi thử JLPT)

| # | Tính năng | Tool (internal) | NATS `cmd` | Mô tả ngắn |
|---|-----------|------------------|------------|------------|
| 1 | **Generate JLPT Test** | `assessment_generate_test` | `agents.assessment.generateTest` | Tạo đề thi thử JLPT (level N5–N1, section: vocabulary / grammar / reading / listening / full). |
| 2 | **Evaluate Test** | `assessment_evaluate_test` | `agents.assessment.evaluateTest` | Chấm bài: nhận testId + danh sách câu trả lời, trả về đánh giá chi tiết. |
| 3 | **Progress Benchmark** | `assessment_get_benchmark` | `agents.assessment.progressBenchmark` | So sánh tiến độ với chuẩn JLPT (targetLevel). |
| 4 | **Schedule Test** | `assessment_schedule_test` | `agents.assessment.scheduleTest` | Lên lịch thi (targetLevel). |
| 5 | **Placement Test** | `assessment_placement_test` | `agents.assessment.placementTest` | Tạo bài test xếp lớp (số câu mặc định 15). |
| 6 | **Evaluate Placement** | `assessment_evaluate_placement` | `agents.assessment.evaluatePlacement` | Chấm bài placement, trả về mức độ đề xuất. |

**Payload NATS (ví dụ):**

- `generateTest`: `{ level, section, questionCount?, userId }`
- `evaluateTest`: `{ testId, answers: [{ questionId, userAnswer, correctAnswer }], userId }`
- `progressBenchmark`: `{ userId, targetLevel? | level? }`
- `scheduleTest`: `{ userId, targetLevel? | level? }`
- `placementTest`: `{ userId, questionCount? }`
- `evaluatePlacement`: `{ userId, testId, answers }`

**Prompt templates:** `assets/prompts/assessment/` (jlpt-test-generation, test-evaluation, progress-benchmark, test-scheduling, placement-test, placement-evaluation).

---

### 3.3. Analytics Agent (Phân tích & báo cáo)

| # | Tính năng | Tool (internal) | NATS `cmd` | Mô tả ngắn |
|---|-----------|------------------|------------|------------|
| 1 | **Track Progress** | `analytics_track_progress` | `agents.analytics.trackProgress` | Theo dõi tiến độ học theo khoảng thời gian (week / month / quarter / year). |
| 2 | **Suggest Study Path** | `analytics_suggest_study_path` | `agents.analytics.suggestStudyPath` | Gợi ý lộ trình học cá nhân hóa theo targetLevel (N5–N1). |
| 3 | **Identify Weaknesses** | `analytics_identify_weaknesses` | `agents.analytics.identifyWeaknesses` | Xác định điểm yếu / lỗ hổng kiến thức (chỉ cần userId). |
| 4 | **Predict Readiness** | `analytics_predict_readiness` | `agents.analytics.predictReadiness` | Dự đoán mức độ sẵn sàng cho kỳ thi JLPT (targetLevel). |
| 5 | **Generate Report** | `analytics_generate_report` | `agents.analytics.generateReport` | Tạo báo cáo: progress / assessment / comprehensive, theo timeframe. |

**Payload NATS (ví dụ):**

- `trackProgress`: `{ userId, timeframe? }`
- `suggestStudyPath`: `{ userId, targetLevel?, timeframe? }`
- `identifyWeaknesses`: `{ userId }`
- `predictReadiness`: `{ userId, targetLevel? | level? }`
- `generateReport`: `{ userId, reportType?, timeframe? }`

**Prompt templates:** `assets/prompts/analytics/` (progress-tracking, study-path-suggestion, weakness-identification, readiness-prediction, report-generation).

---

## 4. Bảng NATS commands (Gateway gọi)

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

## 5. Cấu trúc thư mục (tóm tắt)

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

## 6. Công nghệ & phụ thuộc

- **NestJS**: Module, Controller (NATS), Service, Dependency Injection.
- **NATS**: Microservice transport (gateway ↔ agents).
- **FastMCP**: Server MCP (HTTP stream), đăng ký tools; có thể dùng từ client MCP bên ngoài (qua proxy /mcp).
- **Google Generative AI (Gemini)**: `gemini-2.0-flash`, temperature 0.7, maxOutputTokens 8192.
- **Handlebars**: Render prompt từ template + userContext/timestamp/input.
- **Prisma**: Lấy user context (enrollment, course, lesson progress, quiz attempt).
- **Zod**: Schema cho tham số tool khi đăng ký trong FastMcpService.

---

## 7. User context (FastMcpService.getUserContext)

Dùng cho mọi tool để AI biết ngữ cảnh học viên:

- `userId`
- `enrolledCourses`: tên khóa học
- `jlptLevels`: các level JLPT của khóa đang học
- `aiMetadata`: metadata từ course (nếu có)
- `recentActivity`: 14 ngày gần nhất – mỗi ngày có số lesson hoàn thành và điểm quiz trung bình

---

## 8. Ghi chú triển khai

- **Port**: Agents HTTP mặc định **8090**; FastMCP chạy nội bộ **4000** (proxy qua `/mcp`).
- **Không có REST API trực tiếp** cho logic agent: gateway phải gửi NATS đúng `cmd` và payload.
- Response từ AI được chuẩn hóa: ưu tiên JSON trong markdown code block, sau đó parse và trả về object; lỗi parse thì trả về `{ error, raw }`.
- DTO trong `dtos/` có thể được dùng ở gateway khi validate trước khi gửi NATS; trong agents service hiện tại handler nhận payload trực tiếp.

---

## 9. Điểm dư thừa đối với hệ thống e-learning

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
| Readiness / Benchmark | `assessment_get_benchmark`, `analytics_predict_readiness` | Cùng input (userId, level), cùng output ý tưởng (readiness %, gaps, recommendations). Hai tools cho một nhu cầu. |
| Weaknesses vs Benchmark | `analytics_identify_weaknesses`, `assessment_get_benchmark` | Điểm yếu và skill gaps là một phía của cùng báo cáo. Có thể gộp vào **một báo cáo learner profile / readiness**. |

→ **Đề xuất**: Gộp thành **một luồng "Learner Readiness / Profile"** (Analytics hoặc Assessment), một NATS cmd, một prompt (hoặc logic DB + AI cho phần mô tả).

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

Áp dụng các điểm trên sẽ giảm chi phí AI, tăng độ tin cậy (số liệu từ DB), và gọn hơn cho một hệ thống e-learning thực tế.

---

*Tài liệu được tạo từ phân tích code trong `apps/server/modules/agents/`. Cập nhật khi thêm/sửa tools, handlers hoặc NATS patterns.*
