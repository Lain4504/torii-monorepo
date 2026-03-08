# Academy Achievement Specification

Tài liệu này mô tả thiết kế chi tiết **hệ thống Achievement (Thành tựu)** trong module Gamification của Academy, bổ sung cho [ACADEMY_GAMIFICATION_SPEC.md](./ACADEMY_GAMIFICATION_SPEC.md) và tích hợp với các flow sẵn có trong [core-lms.md](./core-lms.md).

> **Mục tiêu**: Thêm lớp "Achievement" lên trên Streak/XP/Points: người dùng đạt các cột mốc (streak 7 ngày, hoàn thành 10 bài, đỗ 1 bài thi, v.v.) → mở khóa thành tựu → có thể thưởng thêm Points hoặc chỉ hiển thị huy hiệu, tăng engagement và gắn với flow học tập thực tế.

---

## 1. Tổng quan & vị trí trong hệ thống

### 1.1. Quan hệ với Gamification hiện tại

| Thành phần hiện có | Quan hệ với Achievement |
|--------------------|-------------------------|
| **UserGamification** | Achievement có thể dùng `totalXp`, `currentStreak`, `longestStreak`, `points`, `totalActiveDays` làm **criteria** (điều kiện mở khóa). |
| **GamificationHistory** | Không bắt buộc; nếu achievement thưởng Points thì tạo thêm record EARN + metadata `achievementId`. |
| **DailyActivity** | Dùng để đếm số ngày login / loại hoạt động (criteria kiểu "login 7 ngày liên tiếp" đã phản ánh qua streak). |
| **PointReward (Coupon)** | Achievement có thể **reward**: thưởng Points (để user đổi Coupon), hoặc chỉ badge (không đổi được). |

Achievement **không thay thế** flow Coupon; nó bổ sung động lực "mở khóa huy hiệu" và tùy chọn thưởng Points khi unlock.

### 1.2. Quan hệ với LMS (core-lms)

Các nguồn dữ liệu để **đánh giá điều kiện achievement** đến từ:

- **Classroom**: `Enrollment`, `LearningProgress` (lesson completed), `Class` (completed).
- **Assessment**: `ExamAttempt` (status SUBMITTED/COMPLETED, isPassed), `AssignmentSubmission` (graded).
- **ClassReview**: `ClassReview` (status PUBLISHED).
- **Gamification**: `UserGamification`, `GamificationHistory`, `DailyActivity`.

Flow nghiệp vụ:

1. User học bài → `LearningProgress.status = COMPLETED` → `trackActivity(LESSON_COMPLETE)` → cộng Points/XP.
2. Sau khi cộng Points/XP (hoặc sau khi cập nhật streak), service **kiểm tra achievement**: nếu user đạt điều kiện → unlock achievement → (optional) cộng thêm Points + ghi history + gửi notification.

---

## 2. Schema Design (Prisma)

### 2.1. Model `Achievement` (định nghĩa thành tựu)

Bảng **định nghĩa** từng loại achievement (do admin tạo, học viên không tạo).

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | PK |
| `code` | String (unique) | Mã cố định để code tham chiếu (VD: `STREAK_7`, `LESSONS_10`, `FIRST_EXAM_PASS`). |
| `category` | Enum | `STREAK`, `CONSISTENCY`, `LEARNING_PROGRESS`, `RECOVERY`, `SOCIAL`, `MASTERY` — khớp `AchievementCategory` trong DTO. |
| `title` | String | Tên hiển thị (VD: "Chuỗi 7 ngày", "Hoàn thành 10 bài học"). |
| `description` | String (nullable) | Mô tả ngắn. |
| `icon` | String (nullable) | Tên icon (Lucide hoặc asset), VD: `Flame`, `BookOpen`. |
| `requirements` | JSON | Cấu hình điều kiện (xem mục 3). |
| `rewards` | JSON | Cấu hình thưởng khi unlock (points bonus, v.v.). |
| `isActive` | Boolean | Ẩn/hiện với user. |
| `orderIndex` | Int | Thứ tự hiển thị trong danh sách. |
| `createdAt`, `updatedAt` | DateTime | |

**Ví dụ `requirements` (chi tiết mục 3):**

```json
{ "type": "STREAK_DAYS", "value": 7 }
{ "type": "LESSONS_COMPLETED", "value": 10 }
{ "type": "EXAM_PASSED_COUNT", "value": 1 }
{ "type": "REVIEWS_PUBLISHED", "value": 1 }
{ "type": "POINTS_EARNED_TOTAL", "value": 500 }
{ "type": "CLASSES_COMPLETED", "value": 1 }
```

**Ví dụ `rewards`:**

```json
{ "points": 50 }
{}
```

- Có `points` → khi unlock sẽ cộng vào `UserGamification.points` và ghi `GamificationHistory` (type EARN, metadata `achievementId`).
- Để trống `{}` → chỉ mở khóa badge, không thưởng Points.

### 2.2. Model `UserAchievement` (tiến độ / đã mở khóa)

Bảng lưu **trạng thái từng achievement theo user**: chưa đạt, đang tiến triển, hoặc đã unlock.

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | PK |
| `userId` | UUID | FK → User |
| `achievementId` | UUID | FK → Achievement |
| `isUnlocked` | Boolean | Đã đạt điều kiện và mở khóa. |
| `progress` | JSON (nullable) | Giá trị hiện tại dùng cho progress bar (VD: `{ "current": 5, "target": 7 }` cho streak 7 ngày). |
| `unlockedAt` | DateTime (nullable) | Thời điểm unlock. |
| `createdAt`, `updatedAt` | DateTime | |

**Ràng buộc**: Unique `(userId, achievementId)`. Mỗi user tối đa một record cho mỗi achievement.

**Quan hệ**:

- `User` 1–n `UserAchievement`.
- `Achievement` 1–n `UserAchievement`.

### 2.3. Định nghĩa Prisma (gợi ý)

```prisma
model Achievement {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  code        String   @unique @db.VarChar(64)
  category    String   @db.VarChar(32)   // STREAK | CONSISTENCY | LEARNING_PROGRESS | ...
  title       String   @db.VarChar(255)
  description String?  @db.Text
  icon        String?  @db.VarChar(64)
  requirements Json    @default("{}") @db.JsonB
  rewards     Json     @default("{}") @db.JsonB
  isActive    Boolean  @default(true) @map("is_active")
  orderIndex  Int      @default(0) @map("order_index")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @default(now()) @updatedAt @map("updated_at")

  userAchievements UserAchievement[]

  @@map("achievements")
}

model UserAchievement {
  id            String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId        String    @map("user_id") @db.Uuid
  achievementId String    @map("achievement_id") @db.Uuid
  isUnlocked    Boolean   @default(false) @map("is_unlocked")
  progress      Json?     @default("{}") @db.JsonB
  unlockedAt    DateTime? @map("unlocked_at")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @default(now()) @updatedAt @map("updated_at")

  user       User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  achievement Achievement @relation(fields: [achievementId], references: [id], onDelete: Cascade)

  @@unique([userId, achievementId])
  @@index([userId])
  @@index([achievementId])
  @@map("user_achievements")
}
```

Trong `User` thêm:

```prisma
userAchievements UserAchievement[]
```

---

## 3. Criteria (Điều kiện mở khóa)

### 3.1. Các loại criteria đề xuất

Tất cả lấy dữ liệu từ các bảng và flow **đã có** trong Academy/LMS.

| `requirements.type` | Mô tả | Nguồn dữ liệu | Ví dụ `requirements` |
|---------------------|--------|----------------|------------------------|
| `STREAK_DAYS` | Chuỗi ngày hoạt động liên tục ≥ value | `UserGamification.currentStreak` | `{ "type": "STREAK_DAYS", "value": 7 }` |
| `LONGEST_STREAK` | Kỷ lục chuỗi ngày ≥ value | `UserGamification.longestStreak` | `{ "type": "LONGEST_STREAK", "value": 30 }` |
| `LOGIN_DAYS` | Tổng số ngày đã login ≥ value | `UserGamification.totalActiveDays` hoặc count `DailyActivity` (LOGIN) | `{ "type": "LOGIN_DAYS", "value": 30 }` |
| `LESSONS_COMPLETED` | Số lesson đã hoàn thành (mọi class) ≥ value | Count `LearningProgress` where `status = COMPLETED` | `{ "type": "LESSONS_COMPLETED", "value": 10 }` |
| `EXAM_PASSED_COUNT` | Số lần nộp bài thi và đỗ ≥ value | Count `ExamAttempt` where `status = COMPLETED` (hoặc SUBMITTED) and `isPassed = true` | `{ "type": "EXAM_PASSED_COUNT", "value": 1 }` |
| `EXAM_ATTEMPT_COUNT` | Số lần đã làm bài thi (bất kể đỗ/trượt) ≥ value | Count `ExamAttempt` where `status` ∈ {COMPLETED, SUBMITTED} | `{ "type": "EXAM_ATTEMPT_COUNT", "value": 5 }` |
| `REVIEWS_PUBLISHED` | Số review đã publish ≥ value | Count `ClassReview` where `userId` and `status = PUBLISHED` | `{ "type": "REVIEWS_PUBLISHED", "value": 1 }` |
| `POINTS_EARNED_TOTAL` | Tổng Points đã nhận (từ trước tới giờ) ≥ value | Sum `GamificationHistory` where `userId`, `type = EARN`, `currency = POINT` (hoặc dùng cột tổng nếu có) | `{ "type": "POINTS_EARNED_TOTAL", "value": 500 }` |
| `CLASSES_COMPLETED` | Số class đã hoàn thành ≥ value | Count `Enrollment` where `userId` and `status = COMPLETED` (hoặc logic “class completion” theo core-lms) | `{ "type": "CLASSES_COMPLETED", "value": 1 }` |
| `ENROLLMENTS_COUNT` | Số lớp đã ghi danh ≥ value | Count `Enrollment` where `userId` | `{ "type": "ENROLLMENTS_COUNT", "value": 3 }` |
| `LEVEL_REACHED` | Level người chơi ≥ value | `UserGamification.level` | `{ "type": "LEVEL_REACHED", "value": 5 }` |

`requirements` có thể mở rộng thêm (VD: `ASSIGNMENTS_GRADED`, `COURSE_PROFILE_IDS` cho từng khóa cụ thể) trong tương lai; engine chỉ cần đọc `type` và `value` (và optional params) rồi gọi đúng hàm đếm/lấy giá trị.

### 3.2. Cách tính “progress” (cho progress bar)

- **STREAK_DAYS**: `current = UserGamification.currentStreak`, `target = requirements.value`.
- **LESSONS_COMPLETED**: `current = count(LearningProgress COMPLETED)`, `target = value`.
- **EXAM_PASSED_COUNT**: `current = count(ExamAttempt passed)`, `target = value`.
- Tương tự cho các type khác: `current` = giá trị hiện tại, `target` = `requirements.value`.

Lưu vào `UserAchievement.progress` dạng `{ "current": number, "target": number }` (và có thể thêm `label` nếu cần).

---

## 4. Luồng nghiệp vụ (Flow)

### 4.1. Khi nào cần “evaluate” achievement?

Để tránh chậm và tránh bỏ sót, có 2 hướng:

**Option A – Evaluate sau mỗi hành động liên quan (recommended)**  
Sau khi:

- `GamificationService.trackActivity(...)` kết thúc (LOGIN, LESSON_COMPLETE, EXAM_COMPLETE, REVIEW),
- Hoặc sau khi cập nhật streak (`checkAndGetStreak`),
- Hoặc sau khi có thay đổi trạng thái: ExamAttempt (submit/completed), ClassReview (published), Enrollment (completed),

service gọi `AchievementService.evaluateForUser(userId)`. Method này:

1. Lấy tất cả Achievement `isActive = true`.
2. Với mỗi achievement, lấy hoặc tạo `UserAchievement`.
3. Nếu đã `isUnlocked` thì bỏ qua.
4. Tính lại `progress` và so sánh với `requirements`; nếu đạt → unlock (xem 4.2).

**Option B – Evaluate on-demand (GET profile / GET achievements)**  
Khi user (hoặc client) gọi `GET /api/gamification/achievements` hoặc `GET /api/gamification/me`, backend trước khi trả về gọi `evaluateForUser(userId)` một lần. Đơn giản nhưng có thể chậm nếu nhiều achievement; có thể cache “last evaluated at” và chỉ evaluate lại nếu đã qua vài phút hoặc sau khi có event.

**Đề xuất**: Kết hợp – **sau mỗi `trackActivity`** (và sau khi submit exam / publish review) gọi `evaluateForUser` **bất đồng bộ** (queue/job hoặc fire-and-forget). Khi client gọi GET achievements thì trả về từ DB (đã được cập nhật bởi job), không bắt buộc evaluate đồng bộ trong request.

### 4.2. Unlock achievement

1. Set `UserAchievement.isUnlocked = true`, `unlockedAt = now()`, `progress = { current, target }`.
2. Nếu `achievement.rewards.points` > 0:
   - Cộng `UserGamification.points += rewards.points`.
   - Tạo `GamificationHistory`: `type = EARN`, `currency = POINT`, `amount = rewards.points`, `metadata = { source: "ACHIEVEMENT", achievementId }`. Có thể thêm `activityType = null` hoặc enum mới `ACHIEVEMENT_UNLOCK` nếu muốn.
3. (Optional) Publish event `AchievementUnlockedEvent` (NATS hoặc in-process) để notification service gửi in-app/email.
4. (Optional) Ghi notification record với `type = ACHIEVEMENT` (khớp `packages/schemas/src/models/notification.model.ts`).

### 4.3. Tránh duplicate unlock

- Chỉ unlock khi `UserAchievement.isUnlocked === false` và lần evaluate này thỏa điều kiện.
- Một khi đã set `isUnlocked = true` thì không ghi đè; không trừ điểm hay thu hồi achievement.

---

## 5. Tích hợp với các service hiện có

### 5.1. GamificationService (`trackActivity`)

- **Hiện tại**: `trackActivity(userId, activityType, metadata)` cộng XP/Points, ghi DailyActivity và GamificationHistory.
- **Bổ sung**: Cuối `trackActivity`, sau khi commit transaction, gọi `AchievementService.evaluateForUser(userId)` (async, không chờ). Có thể inject `AchievementService` vào `GamificationService` hoặc emit event để worker gọi evaluate.

### 5.2. LearningProgressService

- **Hiện tại**: Khi `status = COMPLETED` gọi `gamificationService.trackActivity(userId, 'LESSON_COMPLETE', { lessonId, classId })`.
- **Achievement**: Không cần sửa thêm; evaluate đã được kích hoạt trong `trackActivity`.

### 5.3. ClassReviewService

- **Hiện tại**: Khi publish review gọi `gamification.trackActivity(userId, ActivityType.REVIEW, { reviewId, ... })`.
- **Achievement**: Evaluate chạy sau trackActivity; criteria `REVIEWS_PUBLISHED` sẽ dùng count ClassReview PUBLISHED.

### 5.4. ExamAttemptService (submit)

- **Hiện tại**: Chưa gọi gamification khi submit/completed.
- **Bổ sung**: Khi exam attempt chuyển sang SUBMITTED/COMPLETED (và đã chấm xong `isPassed`), gọi `GamificationService.trackActivity(userId, 'EXAM_COMPLETE', { examAttemptId, examId, classId, isPassed })`. Sau đó achievement evaluate sẽ chạy; criteria `EXAM_PASSED_COUNT` / `EXAM_ATTEMPT_COUNT` dựa trên ExamAttempt.

### 5.5. Enrollment / Class completion

- Khi enrollment chuyển sang `COMPLETED` (theo logic “hoàn thành class” trong core-lms), gọi `AchievementService.evaluateForUser(userId)` (hoặc emit event) để cập nhật achievement kiểu `CLASSES_COMPLETED`.

---

## 6. API Endpoints

### 6.1. Learner

- **`GET /api/gamification/achievements`**  
  - Trả về danh sách achievement của user: mỗi item là **UserAchievement** (kèm nested Achievement).  
  - Format khớp `UserAchievementDTO[]` trong `packages/schemas` (id, achievementId, isUnlocked, progress, unlockedAt, achievement: AchievementDTO).  
  - Chỉ lấy achievement `isActive = true`; với mỗi achievement, trả về 1 UserAchievement (tạo mới nếu chưa có, với isUnlocked = false, progress = computed).

- **`GET /api/gamification/profile`** (đã có)  
  - Có thể bổ sung field `achievementsUnlockedCount` (số achievement đã mở khóa) để dashboard không cần gọi thêm achievements nếu chỉ cần số.

### 6.2. Admin (CRUD Achievement)

- **`GET /api/gamification/admin/achievements`** – List tất cả Achievement (kèm thống kê số user đã unlock nếu cần).
- **`POST /api/gamification/admin/achievements`** – Tạo Achievement (body: code, category, title, description, icon, requirements, rewards, isActive, orderIndex).
- **`PATCH /api/gamification/admin/achievements/:id`** – Cập nhật Achievement.
- **`DELETE /api/gamification/admin/achievements/:id`** – Xóa (hoặc soft-delete bằng isActive = false).

Validation: `code` unique; `requirements` và `rewards` phải đúng schema (type hợp lệ, value ≥ 0).

---

## 7. Seed data gợi ý (Achievement)

Để chạy ngay sau khi implement, có thể seed một vài achievement mẫu:

| code | category | title | requirements | rewards |
|------|----------|--------|---------------|---------|
| `STREAK_3` | STREAK | Chuỗi 3 ngày | `{ "type": "STREAK_DAYS", "value": 3 }` | `{ "points": 10 }` |
| `STREAK_7` | STREAK | Chuỗi 7 ngày | `{ "type": "STREAK_DAYS", "value": 7 }` | `{ "points": 30 }` |
| `LESSONS_5` | LEARNING_PROGRESS | Hoàn thành 5 bài | `{ "type": "LESSONS_COMPLETED", "value": 5 }` | `{ "points": 20 }` |
| `LESSONS_10` | LEARNING_PROGRESS | Hoàn thành 10 bài | `{ "type": "LESSONS_COMPLETED", "value": 10 }` | `{ "points": 50 }` |
| `FIRST_EXAM_PASS` | MASTERY | Lần đầu đỗ bài thi | `{ "type": "EXAM_PASSED_COUNT", "value": 1 }` | `{ "points": 50 }` |
| `FIRST_REVIEW` | SOCIAL | Viết review đầu tiên | `{ "type": "REVIEWS_PUBLISHED", "value": 1 }` | `{ "points": 50 }` |
| `LOGIN_30` | CONSISTENCY | Đăng nhập 30 ngày | `{ "type": "LOGIN_DAYS", "value": 30 }` | `{ "points": 100 }` |

---

## 8. Frontend & Contract (đã có sẵn)

- **web-learner** đã có:
  - `GET /api/gamification/achievements` → `UserAchievementDTO[]` (achievements trong response).
  - Hook `useAchievements()`, trang `/dashboard/achievements`, `AchievementCard`, `AchievementList`.
- **Gateway** hiện chưa có route `GET /api/gamification/achievements`; cần thêm và forward qua NATS tới academy (pattern giống `getProfile`, `getHistory`).
- **Academy** cần implement handler NATS `gamification.getAchievements` (hoặc tên tương đương) trả về list UserAchievement với Achievement nested.

DTO trong `packages/schemas` đã đủ: `AchievementDTO`, `UserAchievementDTO`, `AchievementCategory`. Chỉ cần backend trả đúng format (id, achievementId, isUnlocked, progress, unlockedAt, achievement: { id, code, category, title, description, icon, requirements, rewards, isActive, orderIndex }).

---

## 9. Notification (optional)

- Khi unlock: tạo bản ghi notification với `type = 'achievement'` (đã có trong notification model), `metadata = { achievementId, achievementCode, achievementTitle }`.
- Có thể emit `AchievementUnlockedEvent` (NATS) để service notification gửi in-app + email “Bạn vừa mở khóa: [title]”.

---

## 10. Tóm tắt checklist triển khai

- [ ] Thêm model `Achievement`, `UserAchievement` vào Prisma; chạy migration.
- [ ] Implement `AchievementService`: `evaluateForUser(userId)`, `getAchievementsForUser(userId)`, logic từng criteria type (streak, lessons, exam, review, points, class completed, login days, level).
- [ ] Sau `GamificationService.trackActivity` gọi `AchievementService.evaluateForUser` (async).
- [ ] ExamAttempt: khi submit/completed gọi `trackActivity(EXAM_COMPLETE, ...)` nếu chưa có.
- [ ] Enrollment/class completion: trigger evaluate (event hoặc gọi trực tiếp).
- [ ] Gateway: thêm `GET /api/gamification/achievements` → NATS → academy.
- [ ] Academy: message pattern `gamification.getAchievements` trả về UserAchievement[].
- [ ] Admin: CRUD Achievement (gateway + academy handlers + quyền `gamification:admin` hoặc tương đương).
- [ ] Seed vài achievement mẫu (streak, lessons, first exam pass, first review).
- [ ] (Optional) Notification khi unlock + AchievementUnlockedEvent.

Spec này phù hợp với flow sẵn có của dự án (core-lms, gamification coupon, class review, exam attempt) và tái sử dụng DTO/schema hiện tại; khi review xong có thể triển khai theo từng bước trên.
