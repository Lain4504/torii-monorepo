# Spec: Learning Roadmap – Phase 2 (REVIEW & PRACTICE + AI-generated practice)

## 1) Mục tiêu

Phase 2 mở rộng roadmap hiện tại để:

- Hỗ trợ **task `REVIEW`** (ôn tập/củng cố) một cách có hệ thống, bám tiến độ học thật.
- Hỗ trợ **task `PRACTICE`** (luyện tập) theo 2 mức:
  - **Practice không AI**: điều hướng vào nội dung/engine sẵn có (lesson/assessment/study-set).
  - **Practice có AI**: sinh bài luyện mới từ nội dung lesson (content/transcript), có attempt/chấm điểm.
- Chuẩn hóa **action/điều hướng** cho mọi task loại mới để UI không phải “đoán” bằng `lessonId` như Phase 1.

Không thay đổi định hướng entitlement:

- **Paid user** (có `Enrollment ACTIVE/COMPLETED`) có roadmap đầy đủ.
- **Non-paid**: không có roadmap chính thức (chỉ recommendation/survey).

---

## 2) Phạm vi

### In scope

- Planner rule-based sinh thêm task `REVIEW` + `PRACTICE` cho tuần/ngày.
- Chuẩn hóa metadata/action cho task để điều hướng UI.
- (Tuỳ chọn) AI pipeline sinh practice từ lesson: generate → validate → store → serve → submit.
- Tracking/metrics cho `REVIEW/PRACTICE`.

### Out of scope (để phase sau)

- Tối ưu hóa nâng cao đa mục tiêu (multi-objective scheduling).
- Tự động “tuning” planner bằng ML.
- Social/mentor/competitive features.

---

## 3) Định nghĩa task types (mở rộng thực thi)

### 3.1 `REVIEW`

**Mục tiêu**: củng cố kiến thức đã học, giảm quên, ổn định nhịp.

Các dạng REVIEW tiêu chuẩn:

- `REVIEW_LAST_LESSONS`: ôn 1–3 bài gần nhất đã hoàn thành.
- `REVIEW_MODULE`: ôn theo module/nhóm bài (vd: “Ôn module N5-1”).
- `REVIEW_SRS_SET`: ôn flashcards/SRS (nếu user có `StudySet`).

### 3.2 `PRACTICE`

**Mục tiêu**: luyện tập “tạo đầu ra”, có đo lường (ít nhất completion; tốt nhất có accuracy/score).

Các dạng PRACTICE tiêu chuẩn:

- `PRACTICE_LESSON_DRILL` (không AI): chọn lesson phù hợp để luyện (listening/reading/quiz-kind).
- `PRACTICE_ASSESSMENT` (không AI): điều hướng tới engine exam/quiz sẵn có theo spec `JLPT_MOCK_EXAM_SPEC.md`.
- `PRACTICE_AI_GENERATED` (AI): sinh bài luyện từ lesson content/transcript.

---

## 4) Chuẩn hóa action/metadata để UI điều hướng (bắt buộc)

Phase 1 đang “hack nhẹ” bằng `metadata.lessonId` + `learnHref?...lesson=...`.
Phase 2 cần hợp đồng rõ ràng để mọi task có thể “Click → đúng nơi”.

### 4.1 Đề xuất chuẩn `task.metadata.action`

Mỗi `LearningRoadmapTask.metadata` **phải** có:

- `action.type` (enum)
- `action.payload` (object theo type)

Các action types:

- `OPEN_COURSE_LESSON`
  - payload: `{ targetId, lessonId }`
- `OPEN_COURSE_REVIEW`
  - payload: `{ targetId, lessonIds: string[] }`
- `OPEN_STUDY_SET`
  - payload: `{ studySetId }`
- `OPEN_EXAM_TEMPLATE`
  - payload: `{ examTemplateId }`
- `OPEN_EXAM_ATTEMPT`
  - payload: `{ attemptId }`
- `OPEN_AI_PRACTICE`
  - payload: `{ practiceId }`

### 4.2 Backward compatibility

Trong 1–2 release đầu:

- Nếu `metadata.action` chưa có, UI fallback theo:
  - `metadata.lessonId` → `OPEN_COURSE_LESSON`
  - `sourceRef` (nếu là lessonId) → `OPEN_COURSE_LESSON`

---

## 5) Thiết kế dữ liệu (Phase 2)

### 5.1 Reuse (đang có)

- `academy_enrollments`
- `academy_user_lesson_progress`
- `academy_live_schedule_sessions`
- `academy_exam_*` (theo `JLPT_MOCK_EXAM_SPEC.md`)
- `academy_study_set_*` (nếu có/đang dùng)
- `learning_roadmaps`, `learning_roadmap_tasks`, `learning_roadmap_replans` (Phase 1/DB đã có)

### 5.2 Bảng mới cho AI practice (chỉ khi bật AI)

#### `learning_practices`

- `id` (uuid)
- `user_id`
- `target_id` (liveClassId/vodPackageId)
- `lesson_id` (nguồn)
- `type` (`AI_GENERATED`)
- `status` (`DRAFT | READY | ARCHIVED | FAILED`)
- `schema_version`
- `content_json` (jsonb: câu hỏi/đáp án/giải thích)
- `quality_score` (optional)
- `created_at`, `updated_at`

#### `learning_practice_attempts`

- `id`
- `practice_id`
- `user_id`
- `status` (`IN_PROGRESS | SUBMITTED | GRADED`)
- `score` (optional)
- `submitted_at`, `graded_at`
- `answers_json` (jsonb)

Ghi chú production:

- Có thể tái dùng `academy_exam_attempt` nếu format practice đồng nhất với exam engine.
- Nếu reuse được exam engine thì **ưu tiên reuse**, giảm chi phí UI/QA.

---

## 6) Planner rules (Phase 2)

### 6.1 Today Focus composition

Mỗi ngày (hoặc mỗi lần fetch roadmap), sinh/ưu tiên:

- 1 task core: `LESSON` hoặc `LIVE_SESSION`
- 1 task reinforce: `REVIEW` hoặc `PRACTICE`
- 1 task optional: `REVIEW` hoặc `PRACTICE` (nếu còn budget)

### 6.2 REVIEW rule (gợi ý v1)

- Nếu user hoàn thành ≥ 1 lesson trong 7 ngày:
  - tạo `REVIEW_LAST_LESSONS` với 1–2 lesson gần nhất
- Nếu không có đủ data:
  - fallback sang review module hiện tại hoặc review “bài đang học dở”

### 6.3 PRACTICE rule (gợi ý v1)

**Không AI (default):**

- Nếu lesson kind có “drill/quiz/listening/reading”:
  - chọn 1 lesson phù hợp level và chưa hoàn thành → `PRACTICE_LESSON_DRILL`
- Nếu course có template quiz (ExamTemplate context=LESSON):
  - `PRACTICE_ASSESSMENT` → `OPEN_EXAM_TEMPLATE`

**Có AI (optional, feature-flag):**

- Khi thiếu quiz template hoặc muốn micro-practice:
  - generate practice từ lesson content/transcript → `PRACTICE_AI_GENERATED`

### 6.4 Budget & guardrails

- Không vượt `studyTimePerSession` từ `OnboardingSurvey` (nếu có).
- Hard cap:
  - `≤ 3 task/ngày`
  - `≤ 90 phút/ngày` (config)
- Nếu tuần trước completion < 60%:
  - giảm số task reinforce/optional (recovery mode)

---

## 7) API (Phase 2)

### 7.1 Roadmap API (giữ nguyên, mở rộng response)

- `GET /api/academy/roadmap/me`
  - Bổ sung: mỗi task có `metadata.action`

### 7.2 Practice APIs (nếu bật AI practice)

- `POST /api/academy/practices/ai/generate`
  - body: `{ targetId, lessonId }`
  - response: `{ practiceId, status }`

- `GET /api/academy/practices/:id`
  - trả nội dung practice JSON (đã validate schema)

- `POST /api/academy/practices/:id/attempts`
  - tạo attempt

- `POST /api/academy/practices/:id/attempts/:attemptId/submit`
  - nộp bài + chấm điểm (rule-based hoặc AI-assisted)

---

## 8) AI pipeline (nếu bật)

### 8.1 Input

- Lesson `content` (html/markdown) hoặc transcript (nếu có).
- Level (JLPT target), mục tiêu survey, lịch học.

### 8.2 Output schema bắt buộc

AI phải trả JSON theo schema versioned, ví dụ:

- `items[]`: `{ question, options[], answerKey, explanation, difficultyTag }`
- `estimatedMinutes`
- `focusAreas[]`

### 8.3 Safety/quality

- Validate bằng Zod schema (reject nếu sai).
- Sanitize content (chống prompt injection từ lesson content).
- (Optional) moderation / human approval cho teacher/staff.
- Cache theo `(lessonId, schemaVersion, targetLevel)` để tiết kiệm chi phí.

---

## 9) UI/UX (Phase 2)

### 9.1 Dashboard

- Task badges: `Bài học` / `Buổi live` / `Ôn tập` / `Luyện tập`
- Khi click:
  - Nếu `OPEN_COURSE_LESSON` → `/courses/:targetId/learn?lesson=:lessonId`
  - Nếu `OPEN_EXAM_TEMPLATE/ATTEMPT` → route exam engine
  - Nếu `OPEN_AI_PRACTICE` → route practice page

### 9.2 Practice UI (nếu AI)

Ưu tiên reuse UI exam (nếu format tương thích). Nếu không:

- Trang `Practice` hiển thị câu hỏi + đáp án, submit, xem giải thích.

---

## 10) Tracking & KPI (Phase 2)

Events tối thiểu:

- `roadmap_task_viewed`
- `roadmap_task_started`
- `roadmap_task_completed`
- `practice_attempt_started`
- `practice_attempt_submitted`

KPI bổ sung:

- Review completion rate
- Practice completion rate
- Practice accuracy/score (nếu có)

---

## 11) Test plan (Phase 2)

### Functional

- REVIEW task điều hướng đúng và hoàn thành update đúng trạng thái.
- PRACTICE non-AI điều hướng đúng tới lesson/exam.
- PRACTICE AI: generate → attempt → submit → score.

### Security

- Không leak practice/attempt giữa users.
- Entitlement bắt buộc (paid) cho practice nội dung.

### Non-functional

- AI generate có timeout/retry, không block UX.
- Cache hit rate theo lessonId.

---

## 12) Rollout plan

- Feature flags:
  - `roadmap_review_tasks`
  - `roadmap_practice_tasks`
  - `ai_practice_generation`
- Canary 5% paid users → 25% → 100%
- Dashboard KPI theo cohort + flag state.

