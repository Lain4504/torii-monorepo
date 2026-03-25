# SPEC TRIỂN KHAI TÍNH NĂNG GỢI Ý LỘ TRÌNH HỌC CÁ NHÂN HÓA VÀ THEO DÕI TIẾN ĐỘ

## 1) Mục đích tài liệu

Tài liệu này là bộ đặc tả triển khai chi tiết để đội Product, Engineering, Data, QA và các AI agent khác có thể phối hợp xây dựng tính năng:

- Gợi ý lộ trình học cá nhân hóa sâu cho từng người dùng.
- Theo dõi tiến độ và sự tiến triển năng lực thực tế (không chỉ theo hình thức).
- Can thiệp kịp thời để tăng xác suất hoàn thành mục tiêu học.

Tài liệu đã gộp đầy đủ 4 phần theo yêu cầu:

1. PRD template hoàn chỉnh (điền sẵn nội dung triển khai).
2. API contract chi tiết.
3. DB schema (PostgreSQL) + event schema (analytics).
4. User stories + test case QA theo format có thể import sang Jira/TestRail.

**Lưu ý cập nhật v2 (theo backend hiện tại của dự án):**
- Tài liệu này đã được hiệu chỉnh để bám kiến trúc Prisma hiện có tại `torii-monorepo/apps/server/prisma/schema.prisma`.
- Trọng tâm triển khai là thêm **planning layer** cho lộ trình cá nhân hóa, không làm lại LMS/commerce/gamification đã có.
- Domain mặc định là trung tâm Nhật ngữ (JLPT, live class, VOD, SRS, AI practice).

---

## 2) PRD hoàn chỉnh (Product Requirements Document)

## 2.1 Tên tính năng

**Adaptive Learning Roadmap & Progress Intelligence**

## 2.2 Bối cảnh và vấn đề

### Hiện trạng

- Mục tiêu học, khảo sát và roadmap hiện tại còn sơ sài.
- Roadmap mang tính tĩnh, không điều chỉnh theo năng lực/nhịp học thực tế.
- Theo dõi tiến độ chủ yếu theo “đếm số lượng” (số bài, số phút) thay vì hiệu quả.
- Người dùng thiếu phản hồi cá nhân hóa, dẫn đến cảm giác dư thừa và bỏ học sớm.

### Vấn đề cốt lõi cần giải quyết

1. Không tạo được thay đổi hành vi học bền vững.
2. Không phát hiện sớm rủi ro tụt tiến độ.
3. Không có cơ chế recovery rõ ràng khi user bị “rớt nhịp”.
4. Không chứng minh được giá trị học tập thực tế.

## 2.3 Mục tiêu sản phẩm

### Mục tiêu chính

1. Tăng tỷ lệ hoàn thành lộ trình trong 4/8/12 tuần.
2. Tăng mức độ làm chủ kỹ năng (mastery) theo mục tiêu.
3. Giảm dropout giai đoạn tuần đầu.
4. Tạo trải nghiệm “coach cá nhân” có tác dụng thực tế.

### KPI và chỉ số thành công

#### North-star metric

- **% người dùng đạt mức mastery mục tiêu đúng hạn** (theo cohort tuần bắt đầu).

#### KPI phụ

- D7, D30 retention của user có roadmap.
- Weekly plan completion rate.
- Milestone completion rate.
- Median learning streak (số ngày học liên tiếp).
- Quiz accuracy progression theo tuần.
- Tỷ lệ user ở trạng thái On-track.

#### Guardrail metrics

- Tỷ lệ user tắt roadmap.
- Tỷ lệ user skip/tắt notification.
- Tỷ lệ khiếu nại “gợi ý không liên quan”.
- Latency API và tỷ lệ lỗi hệ thống.

## 2.4 Phạm vi (Scope)

### In-scope cho bản MVP+

1. Onboarding v2 (nhanh + có pre-test).
2. Roadmap Generator v2 (theo mục tiêu, skill gap, thời gian rảnh).
3. Adaptive Weekly Planner (replan theo dữ liệu tuần trước).
4. Progress Intelligence (activity + performance + mastery).
5. Intervention Engine (nhắc học và recovery plan).
6. Coach UI dashboard.

### Out-of-scope giai đoạn đầu

- Mentor thật 1:1.
- Chấm bài nâng cao cho toàn bộ domain.
- Cộng đồng/social phức tạp.

## 2.5 Đối tượng người dùng & segmentation

### Segment chính

- **S1 - Beginner**: chưa biết bắt đầu từ đâu.
- **S2 - Busy Learner**: thời gian học ít, cần tối ưu.
- **S3 - Goal-driven**: đã có nền tảng, cần tăng tốc mục tiêu cụ thể (chuyển việc/chứng chỉ).

### Persona mẫu

1. Nhân sự đi làm 9-6, chỉ học được 45 phút/ngày.
2. Sinh viên có quỹ thời gian lớn nhưng thiếu cấu trúc học.
3. Người học chuẩn bị thi JLPT cần roadmap có checkpoint rõ ràng.

## 2.6 Nguyên tắc thiết kế sản phẩm (Product Principles)

1. **Roadmap là living plan**: luôn thích ứng, không tĩnh.
2. **Đo hiệu quả thật**: ưu tiên mastery > vanity metrics.
3. **Nhỏ, rõ, khả thi**: task ngắn giúp duy trì đà.
4. **Can thiệp đúng thời điểm**: cảnh báo sớm + recovery.
5. **Minh bạch lý do gợi ý**: tăng trust và khả năng hành động.

## 2.7 Luồng người dùng cấp cao

1. User vào onboarding.
2. Hệ thống tạo Learner Profile v1.
3. Sinh lộ trình tuần 1..N theo mục tiêu.
4. User học hàng ngày, làm quiz/task.
5. Hệ thống đo tiến độ và trạng thái rủi ro.
6. Mỗi tuần hệ thống tự replan.
7. Khi user tụt nhịp -> kích hoạt recovery mode.

## 2.8 Yêu cầu chức năng chi tiết

### F1 - Onboarding v2 (2 tầng)

#### Tầng 1 (bắt buộc, <= 3 phút)

- Mục tiêu học (goal type, target date).
- Thời gian rảnh/tuần.
- Mức tự đánh giá.
- Pre-test nhanh 5-10 câu.

#### Tầng 2 (khuyến khích)

- Preference học (video/text/practice-first).
- Khung giờ tập trung tốt.
- Ràng buộc lịch.

#### Acceptance criteria

- Hoàn thành onboarding <= 3 phút với >70% user.
- Tỷ lệ bỏ onboarding giảm so với bản cũ >= 20%.

### F2 - Roadmap Generator v2 (bám mô hình Live + VOD + JLPT + SRS)

#### Input

- Learner profile.
- Mục tiêu người dùng (vd: đỗ JLPT N4 trong 5 tháng).
- Skill graph theo domain Nhật ngữ (Kanji, Từ vựng, Ngữ pháp, Đọc, Nghe, Nói, Viết).
- Catalog nội dung học hiện có trong hệ thống:
  - `CourseProfile`, `Module`, `Lesson` (VOD).
  - `Cohort`, `LiveClass`, `LiveScheduleSession` (live class).
  - `SetCard` (SRS flashcard).
  - `JlptMock*` (mock exam).

#### Output

- Roadmap theo tuần gồm:
  - Objective tuần.
  - Danh sách task Must/Should/Could.
  - Ước lượng thời gian.
  - Điều kiện hoàn thành.
  - Checkpoint đánh giá mastery.

#### Quy tắc

- Tôn trọng prerequisite trong skill graph.
- Tổng effort không vượt quá năng lực thời gian user +/- 10%.
- Có đường fallback nếu user bị trễ.

### F3 - Adaptive Weekly Planner

#### Trigger

- Chạy định kỳ hàng tuần (vd: Chủ nhật 23:00 theo timezone user).

#### Logic mẫu

- completion < 60% -> giảm scope 20-30% + bổ sung foundation.
- quiz/mock accuracy < ngưỡng -> thêm revision/spaced repetition.
- completion > 90% và accuracy tốt -> tăng độ khó vừa phải.
- User bận đột xuất -> rebalance tasks và dời milestone phụ.
- attendance live thấp -> bổ sung review lesson + mini task bù buổi.

#### Output

- Tạo `path_version` mới.
- Lưu diff kế hoạch + lý do điều chỉnh.

### F4 - Progress Intelligence

#### 3 lớp chỉ số

1. Activity: số phiên học, phút focus.
2. Performance: điểm quiz, tỷ lệ đúng theo kỹ năng.
3. Mastery: mức độ làm chủ skill theo thời gian.

#### Chỉ số đặc thù Nhật ngữ (bắt buộc cho dashboard)
- JLPT readiness theo level mục tiêu (N5..N1).
- Section score theo `LANGUAGE_VOCAB`, `LANGUAGE_GRAMMAR_READING`, `LISTENING`.
- SRS retention rate (tỷ lệ nhớ theo mốc 1d/3d/7d/14d).
- Live attendance quality (present/late/absent).

#### Trạng thái tiến độ

- On-track
- Slightly-off
- At-risk
- Recovering

#### Công thức gợi ý (điều chỉnh bằng config)

- `progress_score = 0.25*activity + 0.35*performance + 0.40*mastery`
- Kèm `confidence_score` để tránh kết luận sai khi dữ liệu ít.

### F5 - Intervention Engine

#### Trigger chính

- Không học 3 ngày liên tiếp.
- 2 lần quiz dưới ngưỡng.
- Dự báo trễ milestone.
- Vừa đạt milestone (reinforcement).

#### Action

- Push/in-app/email (tùy consent).
- Gợi ý “next best action” 5-15 phút.
- Recovery plan 3 ngày khi user đứt chuỗi học.
- Ưu tiên action theo entitlement hiện có (`Enrollment` active) để tránh gợi ý ngoài gói đã mua.

#### Quy tắc thông điệp

- Cụ thể kỹ năng bị thiếu.
- Có thời lượng ước tính.
- Có lý do và lợi ích rõ ràng.

### F6 - Coach UI

#### Màn hình cần có

1. Today Focus (1-3 việc quan trọng nhất).
2. Timeline lộ trình theo tuần.
3. Skill Progress Map.
4. Insight cá nhân (khung giờ học hiệu quả, pattern tụt hiệu suất).
5. Recovery Mode (nút reset kế hoạch tuần).

## 2.9 Yêu cầu phi chức năng (NFR)

- P95 latency API read < 300ms.
- P95 latency replan API < 800ms (không gồm job batch).
- Idempotent cho event ingest.
- Timezone-aware cho toàn bộ lịch học.
- Dữ liệu cá nhân hóa cần minh bạch và có opt-out.
- Có monitoring và alert cho pipeline chấm điểm/replan.

## 2.10 Phụ thuộc hệ thống

- Content service (bài học/quiz/project).
- User profile service.
- Notification service.
- Analytics data warehouse.
- Feature flag + A/B testing framework.

## 2.11 Rủi ro và phương án giảm thiểu

1. **Rủi ro gợi ý sai ngữ cảnh**  
   -> triển khai rule-based trước, log explainability, review hàng tuần.
2. **Rủi ro quá nhiều nhắc nhở gây khó chịu**  
   -> frequency capping + quiet hours + user controls.
3. **Rủi ro roadmap quá tham**  
   -> hard cap effort theo thời gian rảnh user.
4. **Rủi ro đo mastery thiếu chính xác**  
   -> confidence threshold + kết hợp nhiều tín hiệu.

## 2.12 Kế hoạch rollout

1. Internal dogfooding (team nội bộ).
2. Beta 5% user mới.
3. Mở rộng 25% + cohort opt-in.
4. Rollout toàn bộ khi KPI đạt ngưỡng.

## 2.13 A/B test đề xuất

1. Roadmap tĩnh vs adaptive.
2. Reminder chung vs reminder theo thời điểm cá nhân.
3. Full task list vs “Top 3 nhiệm vụ hôm nay”.
4. Có explanation vs không explanation.

## 2.14 Mốc triển khai theo sprint

- Sprint 1-2: onboarding + generator + tracking cơ bản.
- Sprint 3-4: adaptive planner + dashboard v1.
- Sprint 5-6: intervention + recovery + A/B infra.
- Sprint 7+: ML ranking + tối ưu sâu.

---

## 3) API contract chi tiết

## 3.1 Quy ước chung

- Base URL: `/api/v1`
- Auth: `Authorization: Bearer <token>`
- Content-Type: `application/json`
- Time format: ISO-8601 UTC (`2026-03-24T12:00:00Z`)
- Idempotency cho endpoint tạo dữ liệu quan trọng qua header `Idempotency-Key`.

### Mapping API với schema hiện có

- Endpoint tạo/cập nhật lộ trình chỉ ghi vào nhóm bảng `personal_learning_*` (mới).
- Endpoint đọc tiến độ tổng hợp sẽ join dữ liệu từ:
  - `academy_user_lesson_progress`
  - `academy_class_attendances`
  - `academy_assignment_submissions`
  - `academy_set_cards`
  - `jlpt_mock_attempts`
  - `user_gamification` / `streaks`
- Endpoint generate/replan phải lọc theo `academy_enrollments.status = ACTIVE` để tránh gợi ý nội dung user chưa mua.

### Chuẩn response

```json
{
  "success": true,
  "data": {},
  "meta": {
    "request_id": "req_123",
    "timestamp": "2026-03-24T12:00:00Z"
  },
  "error": null
}
```

### Chuẩn lỗi

```json
{
  "success": false,
  "data": null,
  "meta": {
    "request_id": "req_123",
    "timestamp": "2026-03-24T12:00:00Z"
  },
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "weekly_available_minutes is required",
    "details": [
      { "field": "weekly_available_minutes", "reason": "missing" }
    ]
  }
}
```

## 3.2 Onboarding & Profile APIs

### 3.2.1 Tạo/cập nhật learner profile

- `PUT /learners/me/profile`

#### Request

```json
{
  "goal_type": "jlpt_exam",
  "goal_title": "Đỗ JLPT N4 trong 5 tháng",
  "target_date": "2026-09-15",
  "target_jlpt_level": "N4",
  "weekly_available_minutes": 420,
  "self_assessed_level": "N5.2",
  "preferred_learning_modes": ["practice", "video"],
  "preferred_study_slots": ["20:00-22:00"],
  "constraints": {
    "quiet_hours": ["23:00-07:00"],
    "max_session_minutes": 45
  }
}
```

#### Response data

```json
{
  "profile_id": "lp_001",
  "profile_version": 3,
  "completeness_score": 0.86,
  "next_step": "take_pretest"
}
```

### 3.2.2 Nộp kết quả pre-test

- `POST /learners/me/pretest/submit`

#### Request

```json
{
  "assessment_id": "jlpt_placement_n5_n4_v1",
  "answers": [
    { "question_id": "q1", "choice": "B" },
    { "question_id": "q2", "choice": "A" }
  ],
  "duration_seconds": 430
}
```

#### Response data

```json
{
  "result_id": "ar_123",
  "overall_score": 0.58,
  "skill_scores": [
    { "skill_id": "kanji_n5", "score": 0.7 },
    { "skill_id": "listening_n5", "score": 0.4 }
  ],
  "recommended_action": "generate_roadmap"
}
```

## 3.3 Roadmap APIs

### 3.3.1 Tạo roadmap mới

- `POST /roadmaps/generate`

#### Request

```json
{
  "goal_id": "goal_001",
  "horizon_weeks": 12,
  "generation_mode": "balanced",
  "include_recovery_buffer": true,
  "enrollment_scope": "owned_only"
}
```

#### Response data

```json
{
  "roadmap_id": "rm_001",
  "path_version": 1,
  "start_date": "2026-03-30",
  "end_date": "2026-06-21",
  "weekly_plan": [
    {
      "week_index": 1,
      "objective": "Củng cố N5.2 và chuyển tiếp N4 nền tảng",
      "estimated_minutes": 360,
      "tasks": [
        {
          "task_id": "t_101",
          "title": "VOD: Bài 12 Ngữ pháp N5 + Quiz ôn tập",
          "priority": "must",
          "estimated_minutes": 90,
          "task_type": "VOD_LESSON",
          "source_ref": {
            "enrollment_id": "enr_001",
            "lesson_id": "lesson_12"
          },
          "skill_targets": ["grammar_n5", "reading_n5"]
        }
      ],
      "checkpoint": {
        "assessment_id": "wk1_jlpt_n5_to_n4_checkpoint",
        "target_score": 0.75
      }
    }
  ],
  "explanations": [
    "Ưu tiên ngữ pháp N5 trước vì là nền tảng để theo kịp buổi live N4 tuần 3."
  ]
}
```

### 3.3.2 Lấy roadmap hiện tại

- `GET /roadmaps/current`

#### Query params

- `include=weeks,tasks,insights`

### 3.3.3 Replan roadmap theo tuần

- `POST /roadmaps/{roadmap_id}/replan`

#### Request

```json
{
  "trigger": "weekly_scheduler",
  "week_index": 3,
  "reason_context": {
    "completion_rate": 0.52,
    "avg_quiz_score": 0.61,
    "inactive_days": 2
  }
}
```

#### Response data

```json
{
  "roadmap_id": "rm_001",
  "old_path_version": 2,
  "new_path_version": 3,
  "changes": [
    {
      "type": "scope_reduce",
      "week_index": 4,
      "delta_minutes": -80,
      "explanation": "Giảm tải để bảo toàn consistency."
    },
    {
      "type": "add_revision_block",
      "week_index": 4,
      "skill_id": "listening_n5",
      "explanation": "Điểm quiz thấp hơn ngưỡng 0.7."
    }
  ],
  "next_best_actions": [
    {
      "action_id": "nba_001",
      "title": "SRS review từ vựng N5 10 phút",
      "estimated_minutes": 10
    }
  ]
}
```

### 3.3.4 Cập nhật trạng thái task

- `PATCH /roadmaps/{roadmap_id}/tasks/{task_id}`

#### Request

```json
{
  "status": "completed",
  "actual_minutes": 37,
  "completed_at": "2026-04-02T13:20:00Z"
}
```

## 3.4 Progress & Insight APIs

### 3.4.1 Lấy tổng quan tiến độ

- `GET /progress/overview`

#### Response data

```json
{
  "progress_score": 0.68,
  "confidence_score": 0.82,
  "status": "slightly_off",
  "activity": {
    "weekly_minutes": 210,
    "streak_days": 4
  },
  "performance": {
    "avg_quiz_score": 0.64
  },
  "mastery": {
    "skills_mastered": 3,
    "skills_in_progress": 7
  },
  "risk_flags": ["low_listening_score", "high_srs_due_count"],
  "updated_at": "2026-04-03T10:00:00Z"
}
```

### 3.4.2 Lấy bản đồ kỹ năng

- `GET /progress/skills`

#### Query params

- `include=history,decay_prediction`

### 3.4.3 Lấy insight cá nhân hóa

- `GET /progress/insights`

#### Response data

```json
{
  "insights": [
    {
      "type": "best_study_time",
      "message": "Bạn có completion cao nhất khi học 20:00-22:00."
    },
    {
      "type": "fatigue_pattern",
      "message": "Phiên học >45 phút làm giảm accuracy khoảng 12%."
    }
  ],
  "recommended_changes": [
    "Giữ phiên học 25-40 phút.",
    "Ưu tiên quiz ngay sau bài lý thuyết."
  ]
}
```

## 3.5 Intervention APIs

### 3.5.1 Lấy next best actions

- `GET /interventions/next-actions`

#### Response data

```json
{
  "actions": [
    {
      "action_id": "nba_001",
      "title": "Ôn SRS Kanji N5 12 phút",
      "reason": "Kanji là prerequisite để hoàn thành Reading quiz của tuần này.",
      "estimated_minutes": 12,
      "priority": "high"
    }
  ]
}
```

### 3.5.2 Tạo recovery plan

- `POST /interventions/recovery-plan`

#### Request

```json
{
  "trigger": "user_clicked_recovery_mode",
  "recovery_window_days": 3
}
```

#### Response data

```json
{
  "plan_id": "rp_001",
  "window_days": 3,
  "daily_actions": [
    {
      "day": 1,
      "tasks": ["Quiz foundation 10 phút", "Video recap 15 phút"]
    }
  ],
  "expected_outcome": "Quay lại trạng thái on_track trong 5-7 ngày."
}
```

### 3.5.3 Ghi nhận phản hồi can thiệp

- `POST /interventions/{action_id}/feedback`

#### Request

```json
{
  "feedback": "helpful",
  "comment": "Nội dung đúng cái mình đang yếu",
  "acted": true
}
```

## 3.6 Analytics ingest API

### 3.6.1 Ingest events

- `POST /analytics/events`

#### Request

```json
{
  "events": [
    {
      "event_name": "task_completed",
      "event_time": "2026-04-02T13:20:00Z",
      "user_id": "u_001",
      "session_id": "s_001",
      "properties": {
        "task_id": "t_101",
        "roadmap_id": "rm_001",
        "actual_minutes": 37,
        "task_type": "VOD_LESSON",
        "jlpt_level": "N5"
      }
    }
  ]
}
```

---

## 4) DB schema chi tiết (PostgreSQL) + event schema (analytics)

## 4.0 Cập nhật quan trọng: bám schema Prisma hiện tại của dự án

Phần này định nghĩa theo nguyên tắc **không thay thế** các bảng đã có trong `schema.prisma`, chỉ bổ sung lớp điều phối lộ trình cá nhân hóa.

### 4.0.1 Các bảng hiện có sẽ được tái sử dụng trực tiếp

- Hồ sơ và mục tiêu ban đầu: `User`, `OnboardingSurvey`.
- Nội dung và tiến độ học: `CourseProfile`, `Module`, `Lesson`, `UserLessonProgress`.
- Live class: `Cohort`, `LiveClass`, `LiveScheduleSession`, `ClassAttendance`.
- Bài tập và chấm điểm: `LiveClassAssignment`, `AssignmentSubmission`.
- SRS/flashcard: `StudySet`, `SetCard`.
- Gamification: `UserGamification`, `Streak`, `GamificationHistory`.
- JLPT đánh giá năng lực: `JlptMockAttempt` và các bảng liên quan.
- Entitlement và thương mại: `Enrollment`, `Order`, `OrderItem`, `AiUserSubscription`.

### 4.0.2 Bảng mới cần thêm cho planning layer (MVP)

1. `personal_learning_plans`
2. `personal_learning_plan_weeks`
3. `personal_learning_plan_tasks`
4. `personal_learning_skill_snapshots`
5. `personal_learning_replan_logs`

### 4.0.3 Mapping nguồn dữ liệu -> tính điểm tiến độ

- Completion VOD: từ `academy_user_lesson_progress`.
- Attendance live: từ `academy_class_attendances`.
- Quality bài tập: từ `academy_assignment_submissions.grade`.
- Năng lực JLPT: từ `jlpt_mock_attempts` (scaled/raw score).
- Retention trí nhớ: từ `academy_set_cards` (`srs_state`, `next_review_at`).
- Consistency và động lực: từ `user_gamification`, `streaks`.

## 4.1 Mô hình dữ liệu tổng quan

### Nhóm transactional

- users
- learner_profiles
- goals
- roadmaps
- roadmap_weeks
- roadmap_tasks
- learning_sessions
- assessments
- assessment_results
- skill_mastery_snapshots
- interventions
- recovery_plans
- recovery_plan_actions

### Nhóm analytics (event stream + warehouse)

- app_events_raw
- app_events_enriched
- fact_learning_daily
- fact_weekly_progress
- dim_skill
- dim_content

## 4.2 Định nghĩa bảng chính (DDL gợi ý)

### 4.2.1 DDL ưu tiên triển khai (planning layer bám backend hiện có)

```sql
CREATE TABLE personal_learning_plans (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  onboarding_survey_id     UUID REFERENCES onboarding_surveys(id) ON DELETE SET NULL,
  target_jlpt_level        VARCHAR(10), -- N5..N1
  plan_type                VARCHAR(30) NOT NULL DEFAULT 'ADAPTIVE', -- ADAPTIVE|RECOVERY|INTENSIVE
  status                   VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE|PAUSED|COMPLETED|ARCHIVED
  current_version          INT NOT NULL DEFAULT 1,
  started_at               TIMESTAMP NOT NULL DEFAULT NOW(),
  ended_at                 TIMESTAMP,
  goal_snapshot            JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at               TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_plans_user_status ON personal_learning_plans(user_id, status);

CREATE TABLE personal_learning_plan_weeks (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id                  UUID NOT NULL REFERENCES personal_learning_plans(id) ON DELETE CASCADE,
  version                  INT NOT NULL,
  week_index               INT NOT NULL,
  week_start_date          DATE NOT NULL,
  week_end_date            DATE NOT NULL,
  objective                VARCHAR(255) NOT NULL,
  estimated_minutes        INT NOT NULL CHECK (estimated_minutes >= 0),
  status                   VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING|IN_PROGRESS|COMPLETED|SKIPPED
  created_at               TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(plan_id, version, week_index)
);

CREATE TABLE personal_learning_plan_tasks (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_week_id             UUID NOT NULL REFERENCES personal_learning_plan_weeks(id) ON DELETE CASCADE,
  task_type                VARCHAR(40) NOT NULL, -- VOD_LESSON|LIVE_ATTENDANCE|ASSIGNMENT_SUBMIT|SRS_REVIEW|JLPT_MOCK_SECTION|AI_PRACTICE_CHAT
  priority                 VARCHAR(10) NOT NULL DEFAULT 'must', -- must|should|could
  title                    VARCHAR(255) NOT NULL,
  estimated_minutes        INT NOT NULL CHECK (estimated_minutes >= 0),
  actual_minutes           INT CHECK (actual_minutes >= 0),
  status                   VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING|IN_PROGRESS|COMPLETED|SKIPPED
  due_at                   TIMESTAMP,
  completed_at             TIMESTAMP,
  source_type              VARCHAR(40), -- LESSON|LIVE_SESSION|ASSIGNMENT|SET_CARD|JLPT_TEMPLATE|AI_TOOL
  source_enrollment_id     UUID REFERENCES academy_enrollments(id) ON DELETE SET NULL,
  source_lesson_id         UUID REFERENCES academy_lessons(id) ON DELETE SET NULL,
  source_live_session_id   UUID REFERENCES academy_live_schedule_sessions(id) ON DELETE SET NULL,
  source_assignment_id     UUID REFERENCES academy_live_class_assignments(id) ON DELETE SET NULL,
  source_study_set_id      UUID REFERENCES academy_study_sets(id) ON DELETE SET NULL,
  source_jlpt_template_id  UUID REFERENCES jlpt_mock_exam_templates(id) ON DELETE SET NULL,
  explanation              TEXT,
  metadata                 JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at               TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_plan_tasks_week_status ON personal_learning_plan_tasks(plan_week_id, status);
CREATE INDEX idx_plan_tasks_source_enrollment ON personal_learning_plan_tasks(source_enrollment_id);

CREATE TABLE personal_learning_skill_snapshots (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id                  UUID REFERENCES personal_learning_plans(id) ON DELETE SET NULL,
  snapshot_date            DATE NOT NULL,
  skill_key                VARCHAR(64) NOT NULL, -- grammar_n5, listening_n4, kanji_n3...
  jlpt_level               VARCHAR(10),
  score                    NUMERIC(5,4) NOT NULL,
  confidence_score         NUMERIC(5,4) NOT NULL DEFAULT 0.5,
  source_breakdown         JSONB NOT NULL DEFAULT '{}'::jsonb, -- lesson/live/mock/srs weights
  created_at               TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, snapshot_date, skill_key)
);

CREATE INDEX idx_skill_snapshots_user_date ON personal_learning_skill_snapshots(user_id, snapshot_date DESC);

CREATE TABLE personal_learning_replan_logs (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id                  UUID NOT NULL REFERENCES personal_learning_plans(id) ON DELETE CASCADE,
  from_version             INT NOT NULL,
  to_version               INT NOT NULL,
  trigger_type             VARCHAR(50) NOT NULL, -- WEEKLY_SCHEDULER|INACTIVITY|LOW_SCORE|USER_REQUEST
  reason_context           JSONB NOT NULL DEFAULT '{}'::jsonb,
  changes_summary          JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at               TIMESTAMP NOT NULL DEFAULT NOW()
);
```

```sql
CREATE TABLE users (
  id                  VARCHAR(64) PRIMARY KEY,
  email               VARCHAR(255) UNIQUE NOT NULL,
  timezone            VARCHAR(64) NOT NULL DEFAULT 'UTC',
  created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE learner_profiles (
  id                          VARCHAR(64) PRIMARY KEY,
  user_id                     VARCHAR(64) NOT NULL REFERENCES users(id),
  version                     INT NOT NULL DEFAULT 1,
  goal_type                   VARCHAR(64) NOT NULL,
  goal_title                  VARCHAR(255) NOT NULL,
  target_date                 DATE NOT NULL,
  weekly_available_minutes    INT NOT NULL CHECK (weekly_available_minutes > 0),
  self_assessed_level         VARCHAR(32) NOT NULL,
  preferred_learning_modes    JSONB NOT NULL DEFAULT '[]'::jsonb,
  preferred_study_slots       JSONB NOT NULL DEFAULT '[]'::jsonb,
  constraints_json            JSONB NOT NULL DEFAULT '{}'::jsonb,
  completeness_score          NUMERIC(5,4) NOT NULL DEFAULT 0,
  is_active                   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at                  TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_learner_profiles_user_active
ON learner_profiles(user_id, is_active);

CREATE TABLE goals (
  id                          VARCHAR(64) PRIMARY KEY,
  user_id                     VARCHAR(64) NOT NULL REFERENCES users(id),
  learner_profile_id          VARCHAR(64) REFERENCES learner_profiles(id),
  title                       VARCHAR(255) NOT NULL,
  description                 TEXT,
  target_date                 DATE NOT NULL,
  status                      VARCHAR(32) NOT NULL DEFAULT 'active',
  created_at                  TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE roadmaps (
  id                          VARCHAR(64) PRIMARY KEY,
  user_id                     VARCHAR(64) NOT NULL REFERENCES users(id),
  goal_id                     VARCHAR(64) NOT NULL REFERENCES goals(id),
  path_version                INT NOT NULL DEFAULT 1,
  generation_mode             VARCHAR(32) NOT NULL DEFAULT 'balanced',
  status                      VARCHAR(32) NOT NULL DEFAULT 'active',
  start_date                  DATE NOT NULL,
  end_date                    DATE NOT NULL,
  explanation_json            JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at                  TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, goal_id, path_version)
);

CREATE INDEX idx_roadmaps_user_status
ON roadmaps(user_id, status);

CREATE TABLE roadmap_weeks (
  id                          VARCHAR(64) PRIMARY KEY,
  roadmap_id                  VARCHAR(64) NOT NULL REFERENCES roadmaps(id),
  week_index                  INT NOT NULL,
  objective                   VARCHAR(255) NOT NULL,
  estimated_minutes           INT NOT NULL CHECK (estimated_minutes >= 0),
  checkpoint_assessment_id    VARCHAR(64),
  checkpoint_target_score     NUMERIC(5,4),
  status                      VARCHAR(32) NOT NULL DEFAULT 'pending',
  created_at                  TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (roadmap_id, week_index)
);

CREATE TABLE roadmap_tasks (
  id                          VARCHAR(64) PRIMARY KEY,
  roadmap_week_id             VARCHAR(64) NOT NULL REFERENCES roadmap_weeks(id),
  task_type                   VARCHAR(32) NOT NULL,
  title                       VARCHAR(255) NOT NULL,
  description                 TEXT,
  priority                    VARCHAR(16) NOT NULL,
  estimated_minutes           INT NOT NULL CHECK (estimated_minutes >= 0),
  actual_minutes              INT CHECK (actual_minutes >= 0),
  status                      VARCHAR(32) NOT NULL DEFAULT 'pending',
  skill_targets_json          JSONB NOT NULL DEFAULT '[]'::jsonb,
  due_at                      TIMESTAMP,
  completed_at                TIMESTAMP,
  created_at                  TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_roadmap_tasks_week_status
ON roadmap_tasks(roadmap_week_id, status);

CREATE TABLE learning_sessions (
  id                          VARCHAR(64) PRIMARY KEY,
  user_id                     VARCHAR(64) NOT NULL REFERENCES users(id),
  roadmap_id                  VARCHAR(64) REFERENCES roadmaps(id),
  started_at                  TIMESTAMP NOT NULL,
  ended_at                    TIMESTAMP,
  focused_minutes             INT CHECK (focused_minutes >= 0),
  distractions_count          INT NOT NULL DEFAULT 0,
  created_at                  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE assessments (
  id                          VARCHAR(64) PRIMARY KEY,
  code                        VARCHAR(128) UNIQUE NOT NULL,
  title                       VARCHAR(255) NOT NULL,
  assessment_type             VARCHAR(32) NOT NULL,
  max_score                   NUMERIC(6,2) NOT NULL,
  metadata_json               JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at                  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE assessment_results (
  id                          VARCHAR(64) PRIMARY KEY,
  user_id                     VARCHAR(64) NOT NULL REFERENCES users(id),
  assessment_id               VARCHAR(64) NOT NULL REFERENCES assessments(id),
  roadmap_id                  VARCHAR(64) REFERENCES roadmaps(id),
  score                       NUMERIC(6,2) NOT NULL,
  normalized_score            NUMERIC(5,4) NOT NULL,
  duration_seconds            INT CHECK (duration_seconds >= 0),
  skill_scores_json           JSONB NOT NULL DEFAULT '[]'::jsonb,
  submitted_at                TIMESTAMP NOT NULL,
  created_at                  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_assessment_results_user_time
ON assessment_results(user_id, submitted_at DESC);

CREATE TABLE skill_mastery_snapshots (
  id                          VARCHAR(64) PRIMARY KEY,
  user_id                     VARCHAR(64) NOT NULL REFERENCES users(id),
  roadmap_id                  VARCHAR(64) REFERENCES roadmaps(id),
  skill_id                    VARCHAR(64) NOT NULL,
  mastery_score               NUMERIC(5,4) NOT NULL,
  confidence_score            NUMERIC(5,4) NOT NULL,
  decay_risk_score            NUMERIC(5,4) NOT NULL DEFAULT 0,
  computed_at                 TIMESTAMP NOT NULL,
  created_at                  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_skill_mastery_user_skill_time
ON skill_mastery_snapshots(user_id, skill_id, computed_at DESC);

CREATE TABLE interventions (
  id                          VARCHAR(64) PRIMARY KEY,
  user_id                     VARCHAR(64) NOT NULL REFERENCES users(id),
  roadmap_id                  VARCHAR(64) REFERENCES roadmaps(id),
  intervention_type           VARCHAR(32) NOT NULL,
  trigger_type                VARCHAR(64) NOT NULL,
  channel                     VARCHAR(32) NOT NULL,
  payload_json                JSONB NOT NULL DEFAULT '{}'::jsonb,
  status                      VARCHAR(32) NOT NULL DEFAULT 'sent',
  user_feedback               VARCHAR(32),
  acted                       BOOLEAN,
  created_at                  TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE recovery_plans (
  id                          VARCHAR(64) PRIMARY KEY,
  user_id                     VARCHAR(64) NOT NULL REFERENCES users(id),
  roadmap_id                  VARCHAR(64) REFERENCES roadmaps(id),
  window_days                 INT NOT NULL CHECK (window_days BETWEEN 1 AND 14),
  expected_outcome            VARCHAR(255),
  status                      VARCHAR(32) NOT NULL DEFAULT 'active',
  created_at                  TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE recovery_plan_actions (
  id                          VARCHAR(64) PRIMARY KEY,
  recovery_plan_id            VARCHAR(64) NOT NULL REFERENCES recovery_plans(id),
  day_index                   INT NOT NULL CHECK (day_index >= 1),
  action_title                VARCHAR(255) NOT NULL,
  estimated_minutes           INT NOT NULL CHECK (estimated_minutes >= 0),
  status                      VARCHAR(32) NOT NULL DEFAULT 'pending',
  completed_at                TIMESTAMP,
  created_at                  TIMESTAMP NOT NULL DEFAULT NOW()
);
```

## 4.3 Event schema cho analytics

## 4.3.1 Danh sách event bắt buộc

- `onboarding_started`
- `onboarding_completed`
- `pretest_submitted`
- `roadmap_generated`
- `roadmap_replanned`
- `task_started`
- `task_completed`
- `session_started`
- `session_ended`
- `quiz_submitted`
- `milestone_reached`
- `intervention_sent`
- `intervention_clicked`
- `recovery_plan_created`
- `recovery_plan_completed`
- `live_session_attended`
- `live_session_absent`
- `vod_lesson_completed`
- `srs_review_completed`
- `jlpt_mock_submitted`
- `ai_practice_completed`
- `gamification_xp_earned`

## 4.3.2 Cấu trúc event chuẩn

```json
{
  "event_id": "evt_001",
  "event_name": "task_completed",
  "event_time": "2026-04-02T13:20:00Z",
  "event_version": 1,
  "user_id": "u_001",
  "session_id": "s_001",
  "platform": "web",
  "app_version": "1.10.0",
  "context": {
    "timezone": "Asia/Ho_Chi_Minh",
    "ab_experiment": {
      "exp_key": "adaptive_roadmap_v1",
      "variant": "B"
    }
  },
  "properties": {
    "roadmap_id": "rm_001",
    "task_id": "t_101",
    "actual_minutes": 37,
    "skill_targets": ["kanji_n5", "reading_n5"]
  }
}
```

## 4.3.3 Quy tắc dữ liệu event

1. `event_id` unique toàn cục để chống duplicate.
2. Event phải có `event_version` để quản lý backward compatibility.
3. PII không được gửi trong `properties` nếu không cần thiết.
4. Event ingest idempotent theo `(event_id)`.
5. Tách lớp raw và enriched trong pipeline.

## 4.4 Materialized views/fact tables gợi ý

### fact_learning_daily

- user_id, date, total_minutes, tasks_completed, avg_quiz_score, streak_day, progress_score_daily

### fact_weekly_progress

- user_id, week_start, plan_minutes, actual_minutes, completion_rate, mastery_delta, status_bucket

### dim_skill

- skill_id, domain, level, prerequisite_skills

---

## 5) User stories + test cases QA

## 5.1 User stories (format Jira-ready)

## Epic A - Onboarding & Profile

### US-A1

- **Title**: User tạo hồ sơ học tập nhanh trong 3 phút
- **As a**: người học mới
- **I want**: nhập mục tiêu, thời gian rảnh, mức hiện tại
- **So that**: hệ thống có thể tạo lộ trình phù hợp

**Acceptance Criteria**

1. Form hiển thị các field bắt buộc rõ ràng.
2. Validation báo lỗi đúng field.
3. Submit thành công trả về profile version mới.
4. Dữ liệu được lưu và dùng cho generate roadmap.

### US-A2

- **Title**: User làm pre-test để calibrate năng lực
- **As a**: người học
- **I want**: hoàn thành quiz đầu vào ngắn
- **So that**: roadmap chính xác hơn

**Acceptance Criteria**

1. Quiz submit lưu được score tổng và score theo skill.
2. Score phản ánh vào input roadmap generator.
3. Nếu user bỏ qua pre-test, roadmap vẫn tạo được nhưng confidence thấp hơn.

## Epic B - Roadmap Generation

### US-B1

- **Title**: Hệ thống sinh roadmap theo mục tiêu + thời gian thật
- **As a**: người học bận rộn
- **I want**: kế hoạch tuần không vượt quá quỹ thời gian
- **So that**: tôi có thể theo được lâu dài

**Acceptance Criteria**

1. Tổng phút/tuần nằm trong ngưỡng cho phép.
2. Task được sắp xếp theo prerequisite.
3. Có milestone và checkpoint cụ thể theo tuần.

### US-B2

- **Title**: User xem lý do của từng gợi ý
- **As a**: người học
- **I want**: biết vì sao task này quan trọng
- **So that**: tăng niềm tin và động lực

**Acceptance Criteria**

1. Mỗi tuần có ít nhất 1 explanation.
2. Explanation có liên kết tới goal/skill gap/risk.

## Epic C - Adaptive Replan

### US-C1

- **Title**: Hệ thống tự replan khi user tụt tiến độ
- **As a**: người học
- **I want**: kế hoạch mới phù hợp tình trạng thực tế
- **So that**: không bị vỡ lộ trình

**Acceptance Criteria**

1. Job replan chạy theo lịch.
2. Khi completion thấp, scope được giảm hợp lý.
3. Phiên bản roadmap tăng và lưu lịch sử thay đổi.

### US-C2

- **Title**: User kích hoạt recovery mode
- **As a**: người học bị đứt chuỗi
- **I want**: có kế hoạch 3 ngày quay lại nhịp
- **So that**: không bỏ cuộc

**Acceptance Criteria**

1. Nút recovery mode khả dụng khi trạng thái at-risk.
2. Plan tạo trong <2 giây.
3. Có daily action rõ ràng và đo được completion.

## Epic D - Progress Intelligence & Coaching

### US-D1

- **Title**: User xem tiến độ đa chiều
- **As a**: người học
- **I want**: thấy activity, performance, mastery
- **So that**: hiểu mình đang tiến bộ thật hay không

**Acceptance Criteria**

1. Dashboard hiển thị đủ 3 lớp chỉ số.
2. Có trạng thái on-track/slightly-off/at-risk.
3. Dữ liệu cập nhật tối đa chậm 15 phút.

### US-D2

- **Title**: User nhận next best action đúng thời điểm
- **As a**: người học
- **I want**: biết nên làm gì tiếp theo ngay bây giờ
- **So that**: giảm trì hoãn

**Acceptance Criteria**

1. Next action có estimated minutes.
2. Có reason cá nhân hóa.
3. Click action dẫn đúng nội dung học.

## Epic E - Notification & Intervention

### US-E1

- **Title**: Hệ thống nhắc học cá nhân hóa
- **As a**: người học
- **I want**: nhận nhắc đúng lúc tôi dễ học nhất
- **So that**: tăng tỷ lệ hoàn thành task

**Acceptance Criteria**

1. Tuân thủ quiet hours.
2. Có frequency capping.
3. Log đầy đủ sent/open/click/acted.

---

## 5.2 Test cases QA chi tiết

## 5.2.1 Functional test cases

| TC ID | Module | Mô tả | Precondition | Steps | Expected Result | Priority |
|---|---|---|---|---|---|---|
| TC-F-001 | Onboarding | Tạo profile hợp lệ | User đã đăng nhập | Nhập đầy đủ field bắt buộc -> Submit | API 200, profile_version tăng, dữ liệu lưu đúng | P0 |
| TC-F-002 | Onboarding | Thiếu field bắt buộc | User đã đăng nhập | Bỏ trống weekly_available_minutes -> Submit | API 400, message lỗi đúng field | P0 |
| TC-F-003 | Pre-test | Nộp pre-test hợp lệ | Có assessment | Trả lời đủ câu -> Submit | Kết quả trả score tổng + skill_scores | P0 |
| TC-F-004 | Roadmap | Generate roadmap thành công | Có profile + goal | Gọi generate | Tạo roadmap + tuần + task + explanation | P0 |
| TC-F-005 | Roadmap | Đảm bảo effort tuần hợp lệ | Có profile minutes=300 | Generate roadmap | estimated_minutes mỗi tuần không vượt ngưỡng config | P1 |
| TC-F-006 | Replan | Replan khi completion thấp | Có dữ liệu tuần completion < 60% | Trigger replan | path_version tăng, scope giảm, có explanation | P0 |
| TC-F-007 | Task | Update task completed | Có task pending | PATCH status=completed | task trạng thái completed + completed_at | P0 |
| TC-F-008 | Progress | Lấy progress overview | Có dữ liệu session/quiz | GET /progress/overview | Trả đủ progress_score, status, risk_flags | P0 |
| TC-F-009 | Intervention | Lấy next action | Có risk flag | GET next-actions | Có action hợp lệ, reason rõ | P1 |
| TC-F-010 | Recovery | Tạo recovery plan | User trạng thái at-risk | POST recovery-plan | Tạo plan + daily actions | P0 |

## 5.2.2 Integration test cases

| TC ID | Scope | Mô tả | Steps | Expected Result | Priority |
|---|---|---|---|---|---|
| TC-I-001 | Profile -> Roadmap | Profile ảnh hưởng generator | Cập nhật available_minutes rồi generate lại | Roadmap mới thay đổi effort tương ứng | P0 |
| TC-I-002 | Quiz -> Replan | Điểm quiz ảnh hưởng replan | Nộp quiz thấp rồi chạy replan | Planner chèn revision block | P0 |
| TC-I-003 | Task events -> Progress | Event phản ánh dashboard | Complete nhiều task + gửi events | Progress overview cập nhật đúng trong SLA | P0 |
| TC-I-004 | Risk -> Intervention | At-risk kích hoạt can thiệp | Tạo 3 ngày inactive | Có intervention_sent + next-actions | P1 |
| TC-I-005 | Recovery -> Status | Recovery thành công đổi trạng thái | Hoàn thành action recovery 3 ngày | Status từ at-risk -> recovering/on-track | P1 |

## 5.2.3 Non-functional test cases

| TC ID | Loại | Mô tả | Cách test | Expected Result | Priority |
|---|---|---|---|---|---|
| TC-NF-001 | Performance | GET progress overview P95 | Load test 1k RPS | P95 < 300ms | P0 |
| TC-NF-002 | Performance | POST replan API | Load test 200 RPS | P95 < 800ms | P1 |
| TC-NF-003 | Reliability | Event ingest idempotency | Gửi trùng event_id nhiều lần | Chỉ ghi nhận 1 lần | P0 |
| TC-NF-004 | Security | Auth bắt buộc | Gọi API không token | 401 Unauthorized | P0 |
| TC-NF-005 | Privacy | Quiet hours enforcement | Cấu hình quiet hours | Không gửi notification trong khung giờ cấm | P0 |

## 5.2.4 Edge cases quan trọng

1. User đổi timezone liên tục.
2. User giảm thời gian rảnh đột ngột (420 -> 90 phút/tuần).
3. User bỏ pre-test nhưng vẫn yêu cầu roadmap.
4. Quiz có kết quả bất thường (0 hoặc 100% liên tục).
5. Duplicate event từ client retry mạng yếu.
6. User có nhiều thiết bị gửi session chồng lấn.

## 5.2.5 Regression checklist

- Tạo goal cũ vẫn hoạt động.
- Màn hình roadmap cũ không vỡ UI.
- Notification hệ thống khác không bị ảnh hưởng.
- Dashboard analytics tổng không sai lệch dữ liệu cũ.

## 5.2.6 UAT checklist cho Product

1. Có cảm giác cá nhân hóa rõ ràng sau 7 ngày.
2. Gợi ý hành động đủ cụ thể để làm ngay.
3. Recovery mode giúp user quay lại nhịp thật.
4. Explanation dễ hiểu, không quá kỹ thuật.
5. Không gây phiền bởi thông báo dày đặc.

---

## 6) Đề xuất cấu trúc backlog kỹ thuật (tham khảo)

## 6.1 Backend

- Module learner-profile service.
- Module roadmap generation engine.
- Module weekly replan orchestrator.
- Module progress scoring service.
- Module intervention/recovery service.
- Event ingest + validation pipeline.

## 6.2 Frontend

- Onboarding flow v2.
- Roadmap timeline UI.
- Today focus widget.
- Skill progress map.
- Recovery mode entrypoint.

## 6.3 Data/ML

- Event taxonomy + tracking plan.
- Daily/weekly aggregates.
- Rule engine config.
- Sau MVP: bandit/ranking next best action.

## 6.4 QA

- Bộ API test tự động.
- Bộ UI e2e cho luồng chính.
- Data quality checks cho pipeline events.

---

## 7) Tiêu chí hoàn thành toàn dự án (Definition of Done)

1. Toàn bộ API cốt lõi có contract test pass.
2. Dashboard phản ánh đúng dữ liệu trong SLA.
3. Replan chạy ổn định theo lịch ít nhất 2 tuần beta.
4. Có log explainability cho mọi thay đổi kế hoạch.
5. Tối thiểu 1 thử nghiệm A/B chạy thành công với dữ liệu hợp lệ.
6. Tài liệu vận hành và runbook sự cố đầy đủ.

---

## 8) Ghi chú triển khai cho các AI agent khác

1. Ưu tiên triển khai rule-based trước để có giá trị sớm.
2. Mọi quyết định gợi ý cần lưu `explanation` để debug.
3. Thiết kế event từ ngày đầu, tránh “làm xong mới track”.
4. Tách rõ transactional DB và analytics warehouse.
5. Bảo đảm idempotency ở ingest events và replan job.

---

## 9) Gamification V2 (đập đi xây lại)

Phần này định nghĩa lại toàn bộ luồng gamification theo mục tiêu: tăng động lực học tập thực chất, giữ nhịp học dài hạn, và bám chặt lộ trình cá nhân hóa.

## 9.1 Nguyên tắc thiết kế

1. Gamification phải phục vụ học thật, không tối ưu cho spam hoạt động.
2. Điểm thưởng phải gắn với `plan task` và tiến bộ năng lực.
3. Mọi cơ chế cạnh tranh phải đi kèm fairness và anti-cheat.
4. Người học luôn thấy mục tiêu ngắn hạn rõ ràng (hôm nay cần làm gì).
5. Thưởng phải có vòng lặp ngắn (daily dopamine) và vòng lặp dài (mastery milestones).

## 9.2 Trải nghiệm người dùng cốt lõi (Duolingo-like nhưng phù hợp Nhật ngữ)

### A. Daily Loop (vòng lặp hằng ngày)

1. Mở app -> nhận `Daily Mission` (3 nhiệm vụ cá nhân hóa theo roadmap).
2. Hoàn thành nhiệm vụ -> nhận XP/points + streak progress.
3. Thấy ngay tiến độ league, trạng thái streak, reward gần đạt.
4. Nếu bỏ 1 ngày -> cơ chế freeze/recovery mission để quay lại nhịp.

### B. Weekly Loop

1. Cạnh tranh theo league tuần (Bronze/Silver/Gold/...).
2. Cuối tuần tổng kết:
   - XP tuần.
   - Tỷ lệ hoàn thành nhiệm vụ roadmap.
   - Mức tăng skill snapshot (kanji/grammar/listening/...).
3. Thăng/hạ hạng theo performance thực + anti-abuse rules.

### C. Mastery Loop

1. Milestone theo năng lực thực (JLPT readiness, listening score, SRS retention).
2. Badge/achievement mở khóa theo năng lực và consistency.
3. Phần thưởng có giá trị sử dụng thật trong hệ sinh thái (coupon, AI credits, unlock content).

## 9.3 Luồng gamification mới (business flow)

### 1) Activity Ingestion Layer (chuẩn hóa nguồn sự kiện)

Tất cả hoạt động học phải đi qua pipeline thống nhất:

- `VOD_LESSON_COMPLETED`
- `LIVE_SESSION_ATTENDED`
- `ASSIGNMENT_SUBMITTED`
- `ASSIGNMENT_GRADED`
- `SRS_REVIEW_COMPLETED`
- `JLPT_MOCK_SUBMITTED`
- `AI_PRACTICE_COMPLETED`
- `DAILY_LOGIN`

Mỗi event bắt buộc có:
- `user_id`, `event_id`, `event_time`, `source_type`, `source_ref`, `quality_signal`.

### 2) Gamification Rule Engine

Rule Engine quyết định:
- Award XP/points bao nhiêu.
- Có tính vào streak hay không.
- Có tiến triển mission/challenge hay không.
- Có đủ điều kiện mở achievement hay không.

Rule phải dựa trên:
- `task_type`, `task_priority` (`must/should/could`).
- `plan adherence` (đúng/đi chệch roadmap).
- `quality score` (điểm quiz/mock/chấm assignment).
- `difficulty`, `time_spent_validated`, `anti-cheat flags`.

### 3) Reward Ledger

Mọi biến động thưởng phải ghi ledger chuẩn:
- `currency`: XP | POINT | GEM (nếu mở rộng).
- `type`: EARN | REDEEM | BONUS | PENALTY | EXPIRATION.
- `reason_code`: PLAN_TASK_COMPLETED, STREAK_BONUS, LEAGUE_PROMOTION...
- `metadata`: tham chiếu plan/task/enrollment.

### 4) Motivation Orchestrator

Dịch trạng thái học thành can thiệp động lực:
- Sắp vỡ streak -> push “rescue task 8 phút”.
- At-risk -> hạ yêu cầu mission, ưu tiên win nhỏ.
- On-track -> mở challenge tăng tốc.

## 9.4 Thiết kế cơ chế game cụ thể

### 9.4.1 XP & Level

- `XP` phản ánh effort + chất lượng.
- Level up theo đường cong tăng dần (không tuyến tính).
- XP cho task roadmap `must` cao hơn `should/could`.
- Bonus chuỗi hoàn thành task đúng deadline.

### 9.4.2 Points Economy

- `POINT` dùng để đổi quà/coupon/AI credits.
- Nguồn POINT chính: milestone thật, challenge tuần, achievement.
- Tránh cho points quá dễ ở hoạt động spam (quiz click nhanh).

### 9.4.3 Streak 2.0

- Streak chỉ tăng khi có “valid learning activity”.
- Có `freeze` giới hạn để tránh abuse.
- Có recovery mission nếu vừa đứt streak.
- Streak bonus nên theo bậc (3-7-14-30 ngày).

### 9.4.4 League & Leaderboard

- League theo tuần, dùng `weekly_xp_valid`.
- Chia theo bracket để tránh chênh lệch quá lớn.
- Promotion/demotion rõ ràng và minh bạch.
- Leaderboard cần filter anti-cheat trước khi xếp hạng.

### 9.4.5 Mission/Challenge

- Daily mission lấy từ roadmap task + điểm yếu skill.
- Weekly challenge: ví dụ “3 buổi live đúng giờ + 2 bài SRS retention > 80%”.
- Challenge phải có reward rõ, thời gian rõ, điều kiện pass rõ.

### 9.4.6 Achievement 2.0

- Thành tựu theo:
  - consistency (streak/attendance),
  - mastery (JLPT/skill snapshot),
  - output (assignment quality),
  - cộng đồng (review/comment chất lượng, nếu cần).
- Achievement có tier (bronze/silver/gold) để kéo dài động lực.

## 9.5 Refactor kiến trúc backend (khuyến nghị mạnh)

Tách module gamification hiện tại thành 4 module rõ ràng:

1. `gamification-activity-ingestor`
2. `gamification-rule-engine`
3. `gamification-ledger-service`
4. `gamification-achievement-service`

Và thêm 1 module phối hợp:
5. `motivation-orchestrator` (kết nối roadmap status + can thiệp gamification)

## 9.6 Đề xuất data model mới (hard cutover, không backward compatibility)

Áp dụng chiến lược **đập đi xây lại hoàn toàn** trên code mới nhất:

- Không giữ backward compatibility cho API/DB gamification cũ.
- Không cần adapter/backfill để tương thích nghiệp vụ cũ.
- Endpoint cũ bị ngắt sau khi Go-live v2.
- Dữ liệu lịch sử cần thiết cho UX chỉ giữ ở lớp streak log mới.

Data model v2:

1. `game_profiles` (state tổng: level/xp/points/streak/freeze_count)
2. `game_ledger_entries` (sổ cái thưởng/phạt)
3. `game_coupon_rewards` (catalog phần thưởng quy đổi coupon)
4. `game_coupon_redemptions` (lịch sử đổi coupon theo user)
5. `game_missions` (định nghĩa mission theo template)
6. `game_user_missions` (trạng thái mission theo user/ngày/tuần)
7. `game_leagues` (định nghĩa giải đấu)
8. `game_league_memberships` (membership theo tuần)
9. `game_achievements` + `game_user_achievements`
10. `game_streak_logs` (lịch sử ngày hoạt động để user xem lại chuỗi học)

Không dùng bảng `game_anti_cheat_flags` ở pha này để giữ hệ thống gọn nhẹ.

### 9.6.1 Mô tả nhanh 2 bảng coupon mới

- `game_coupon_rewards`
  - Mục đích: định nghĩa các gói đổi coupon, thay thế `PointReward` cũ.
  - Field gợi ý: `id`, `code`, `title`, `description`, `cost_points`, `discount_type`, `discount_value`, `max_discount_amount`, `min_order_value`, `expires_in_days`, `is_active`, `created_at`, `updated_at`.

- `game_coupon_redemptions`
  - Mục đích: lưu lịch sử user đổi coupon để audit và hiển thị lịch sử redeem.
  - Field gợi ý: `id`, `user_id`, `reward_id`, `ledger_entry_id`, `coupon_id`, `coupon_code`, `cost_points`, `status` (`CREATED|USED|EXPIRED|CANCELLED`), `redeemed_at`, `used_at`, `expires_at`, `idempotency_key`, `metadata`.

## 9.7 Rule gợi ý cho thưởng (MVP v2)

- `VOD_LESSON_COMPLETED`: 20 XP + 1 điểm base; +bonus nếu đúng roadmap task must.
- `LIVE_SESSION_ATTENDED`: 40 XP + 2 điểm; +bonus punctuality.
- `SRS_REVIEW_COMPLETED`: XP theo số card valid + retention.
- `JLPT_MOCK_SUBMITTED`: thưởng theo completion + scaled score delta.
- `AI_PRACTICE_COMPLETED`: thưởng theo quality rubric (không chỉ số lượt).
- `DAILY_LOGIN`: chỉ là trigger nhẹ, không là nguồn điểm chính.

Giới hạn anti-spam:
- cap theo activity/day.
- diminishing return khi lặp hoạt động giống nhau.
- dedup theo object (`lessonId`, `sessionId`, `attemptId`, `missionId`).

## 9.8 Integrity rules (không dùng bảng anti-cheat riêng)

1. Kiểm tra thời lượng tối thiểu hợp lệ trước khi công nhận completion.
2. Dedup event theo `idempotency_key` + `source_ref`.
3. Giới hạn cap thưởng theo ngày/loại activity.
4. Chỉ chấp nhận event có `source_ref` hợp lệ và có entitlement.

## 9.9 API contract mới cho gamification v2

### Endpoint learner

- `GET /api/v2/game/profile`
- `GET /api/v2/game/daily-missions`
- `POST /api/v2/game/missions/{mission_id}/claim`
- `GET /api/v2/game/leaderboard?league=weekly`
- `GET /api/v2/game/achievements`
- `GET /api/v2/game/ledger?limit=50`
- `GET /api/v2/game/coupon-rewards`
- `POST /api/v2/game/coupon-rewards/{reward_id}/redeem`
- `GET /api/v2/game/coupon-redemptions?status=CREATED|USED|EXPIRED`

### Endpoint system/internal

- `POST /internal/game/ingest-activity`
- `POST /internal/game/recompute-user/{user_id}`
- `POST /internal/game/redemptions/reconcile`

## 9.10 Kế hoạch triển khai (đập đi xây lại)

### Phase 1 - Core rewrite (2-3 sprint)
- Viết lại ingestion + rule engine + ledger.
- Mở Daily Mission + XP/points/streak 2.0.
- Dựng `game_streak_logs` để hiển thị lịch sử ngày học cho user.

### Phase 2 - Engagement (2 sprint)
- League/leaderboard mới.
- Achievement 2.0.
- Reward shop chuẩn hóa.

### Phase 3 - Optimization (liên tục)
- A/B test nhiệm vụ.
- Cá nhân hóa reward theo phân khúc.
- Tối ưu fairness bằng rule config (không thêm bảng anti-cheat riêng).

## 9.12 Chính sách cutover v2 (bắt buộc)

1. Tắt toàn bộ endpoint gamification v1 ngay khi release v2.
2. Toàn bộ write chỉ đi qua `/api/v2/game/*` và `/internal/game/*`.
3. Không maintain song song 2 rule engine.
4. `game_streak_logs` là nguồn sự thật duy nhất cho lịch sử hoạt động theo ngày.

## 9.11 KPI riêng cho gamification

- D7 retention tăng.
- % user hoàn thành daily mission >= 1.
- Streak median tăng và ổn định.
- % user on-track roadmap tăng.
- Tỷ lệ spam activity giảm.
- Conversion reward (đổi quà hợp lệ) tăng.

---

## 10) Phụ lục: JSON schema mẫu cho một số object

### 9.1 Roadmap object

```json
{
  "roadmap_id": "string",
  "path_version": 1,
  "goal_id": "string",
  "start_date": "date",
  "end_date": "date",
  "weeks": [
    {
      "week_index": 1,
      "objective": "string",
      "estimated_minutes": 300,
      "status": "pending|in_progress|completed",
      "tasks": [
        {
          "task_id": "string",
          "title": "string",
          "priority": "must|should|could",
          "estimated_minutes": 30,
          "status": "pending|in_progress|completed"
        }
      ],
      "checkpoint": {
        "assessment_id": "string",
        "target_score": 0.75
      },
      "explanations": ["string"]
    }
  ]
}
```

### 9.2 Progress overview object

```json
{
  "progress_score": 0.68,
  "confidence_score": 0.82,
  "status": "on_track|slightly_off|at_risk|recovering",
  "activity": {
    "weekly_minutes": 240,
    "streak_days": 5
  },
  "performance": {
    "avg_quiz_score": 0.71
  },
  "mastery": {
    "skills_mastered": 4,
    "skills_in_progress": 6
  },
  "risk_flags": ["string"],
  "recommended_actions": [
    {
      "action_id": "string",
      "title": "string",
      "estimated_minutes": 15,
      "reason": "string"
    }
  ]
}
```

---

Tài liệu kết thúc.
