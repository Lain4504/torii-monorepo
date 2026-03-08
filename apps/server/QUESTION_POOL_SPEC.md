# Question Pool Specification

Spec chi tiết cho **Question Pool** (ngân hàng câu hỏi có nhóm) trong Academy LMS, bổ sung cho [core-lms.md](./core-lms.md) và tương thích với các flow hiện có (QuizTemplate, Exam, ExamSection, ExamQuestion).

---

## 1. Mục tiêu & tương thích với core-lms

### 1.1. Mục tiêu
- **Question Pool**: Nhóm câu hỏi theo level, category, chủ đề để Lecturer dễ chọn khi build quiz/exam.
- **Flow**: Lecturer tạo pool → thêm câu vào pool → khi build Exam/Quiz, chọn pool → lấy câu (chọn thủ công hoặc random N câu).
- **QuizTemplate** (core-lms §1): Đã có `questionPoolId` — cần model `QuestionPool` và logic "lấy câu từ pool" khi build quiz.

### 1.2. Tương thích với core-lms
- **QuizTemplate** (§1, §7.1): Giữ nguyên `questionPoolId` (FK → QuestionPool). Khi có pool: có thể dùng pool làm nguồn câu cho quiz.
- **Exam, ExamSection, ExamQuestion** (§12.2): Giữ nguyên flow — câu hỏi được gắn qua `ExamQuestion` (examId, sectionId, questionId). Pool dùng khi **build exam**: "lấy N câu từ pool X" → tạo `ExamQuestion` tương ứng.
- **Question** (§12.2): Giữ nguyên schema cơ bản; bổ sung `level`, `category` (cột riêng) để filter tối ưu, đồng thời vẫn cho phép lưu trong `metadata` để backward compatible.

---

## 2. Schema Design (Prisma)

### 2.1. Model `QuestionPool`

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | PK |
| `code` | String (unique, nullable) | Mã pool (VD: `N5_VOCAB`, `N4_GRAMMAR`) |
| `name` | String | Tên hiển thị |
| `description` | String (nullable) | Mô tả ngắn |
| `courseProfileId` | UUID (nullable) | FK → CourseProfile. Pool thuộc course cụ thể; null = pool chung hệ thống |
| `level` | String (nullable) | Cấp độ (N5, N4, N3, N2, N1 hoặc CEFR) — gợi ý filter, không bắt buộc |
| `category` | String (nullable) | Kỹ năng (vocabulary, grammar, reading, listening) |
| `status` | Enum | `DRAFT`, `ACTIVE`, `ARCHIVED` |
| `metadata` | JSON (nullable) | Mở rộng |
| `createdAt`, `updatedAt` | DateTime | |

**Quan hệ**:
- `courseProfile` → CourseProfile (optional)
- `poolQuestions` → PoolQuestion[] (nhiều câu trong pool)
- `quizTemplates` → QuizTemplate[] (các QuizTemplate tham chiếu pool này)

### 2.2. Model `PoolQuestion` (many-to-many Question ↔ QuestionPool)

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | PK |
| `poolId` | UUID | FK → QuestionPool |
| `questionId` | UUID | FK → Question |
| `orderIndex` | Int (default 0) | Thứ tự trong pool (tùy chọn) |
| `createdAt` | DateTime | |

**Ràng buộc**: Unique `(poolId, questionId)`. Một câu có thể thuộc nhiều pool.

**Quan hệ**:
- `pool` → QuestionPool
- `question` → Question

### 2.3. Cập nhật `Question` — thêm cột `level`, `category`

Để filter tối ưu (thay vì query metadata):

| Field | Type | Description |
|-------|------|-------------|
| `level` | String (nullable) | N5, N4, N3, N2, N1 (hoặc CEFR) |
| `category` | String (nullable) | vocabulary, grammar, reading, listening |

- **Backward compatible**: Cột nullable. Câu cũ không có level/category vẫn hoạt động; có thể migration populate từ `metadata.jlptLevel`, `metadata.category` nếu có.

### 2.4. Cập nhật `QuizTemplate`

- Đã có `questionPoolId` (nullable).
- Thêm FK relation: `questionPool` → QuestionPool.
- Khi `questionPoolId` có giá trị: QuizTemplate "sử dụng pool này" làm nguồn câu.

### 2.5. Prisma schema gợi ý

```prisma
model QuestionPool {
  id              String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  code            String?  @unique @db.VarChar(64)
  name            String   @db.VarChar(255)
  description     String?  @db.Text
  courseProfileId String?  @map("course_profile_id") @db.Uuid
  level           String?  @db.VarChar(20)
  category        String?  @db.VarChar(50)
  status          String   @default("DRAFT") @db.VarChar(20)  // DRAFT, ACTIVE, ARCHIVED
  metadata        Json?    @default("{}") @db.JsonB
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @default(now()) @updatedAt @map("updated_at")

  courseProfile  CourseProfile?  @relation(fields: [courseProfileId], references: [id], onDelete: SetNull)
  poolQuestions  PoolQuestion[]
  quizTemplates  QuizTemplate[]

  @@index([courseProfileId])
  @@index([level])
  @@index([category])
  @@index([status])
  @@map("academy_question_pools")
}

model PoolQuestion {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  poolId      String   @map("pool_id") @db.Uuid
  questionId  String   @map("question_id") @db.Uuid
  orderIndex  Int      @default(0) @map("order_index")
  createdAt   DateTime @default(now()) @map("created_at")

  pool     QuestionPool @relation(fields: [poolId], references: [id], onDelete: Cascade)
  question Question     @relation(fields: [questionId], references: [id], onDelete: Cascade)

  @@unique([poolId, questionId])
  @@index([poolId])
  @@index([questionId])
  @@map("academy_pool_questions")
}

model Question {
  // ... existing fields
  level    String? @db.VarChar(20)
  category String? @db.VarChar(50)
  // ...
  poolQuestions PoolQuestion[]

  @@index([level])
  @@index([category])
}

model QuizTemplate {
  // ... existing fields
  questionPool   QuestionPool? @relation(fields: [questionPoolId], references: [id], onDelete: SetNull)
}
```

Trong `CourseProfile` thêm:
```prisma
questionPools QuestionPool[]
```

---

## 3. Luồng nghiệp vụ (Business Flow)

### 3.1. Tạo & quản lý Pool

1. **Tạo Pool**  
   - Lecturer/Admin tạo QuestionPool: name, description, courseProfileId (optional), level, category, status = DRAFT.

2. **Thêm câu vào Pool**  
   - API: `POST /question-pools/:poolId/questions` body `{ questionIds: string[] }`.  
   - Tạo PoolQuestion cho mỗi cặp (poolId, questionId). Bỏ qua nếu đã tồn tại.

3. **Xóa câu khỏi Pool**  
   - API: `DELETE /question-pools/:poolId/questions/:questionId`.  
   - Xóa record PoolQuestion tương ứng.

4. **Activate Pool**  
   - Chỉ pool `status = ACTIVE` mới được chọn khi build Exam/Quiz.

### 3.2. Build Quiz (QuizTemplate có questionPoolId)

- **Hiện tại**: QuizTemplate có questionPoolId nhưng chưa có logic "lấy câu từ pool".
- **Sau khi có Pool**:
  - Khi tạo **ClassAssessment** từ QuizTemplate (hoặc khi generate quiz instance): nếu QuizTemplate có questionPoolId, có thể:
    - **Option A**: Lấy toàn bộ câu trong pool → tạo Exam + ExamSection + ExamQuestion (nếu QuizTemplate map tới Exam).
    - **Option B**: Trong UI build quiz, Lecturer chọn "Pool X" → hệ thống list câu trong pool → Lecturer chọn N câu hoặc "random N câu" → tạo Exam/ExamQuestion.
  - Logic cụ thể phụ thuộc cách QuizTemplate gắn với Exam (1-1 hay nhiều-nhiều). Spec giữ mức: **QuizTemplate.questionPoolId = nguồn câu gợi ý / mặc định**; bước build cụ thể do implementation quyết định.

### 3.3. Build Exam (Exam + ExamSection + ExamQuestion)

- **Flow hiện tại** (core-lms §12): Exam → ExamSection → ExamQuestion (gắn từng questionId).
- **Bổ sung**:
  - Trong UI build Exam: Lecturer có thể chọn "Thêm section từ Pool X" → nhập số câu cần lấy (vd: 20) → hệ thống:
    1. Query câu trong pool (qua PoolQuestion).
    2. Random (hoặc theo orderIndex) lấy N câu.
    3. Tạo ExamQuestion cho từng câu (examId, sectionId, questionId, orderIndex, points).
  - Kết quả vẫn là **ExamQuestion** (snapshot cố định). Pool chỉ dùng ở bước chọn câu, không ảnh hưởng ExamAttempt/ExamAttemptDetail.

### 3.4. Filter câu khi chọn từ Pool

- Lấy câu trong pool: query `PoolQuestion` join `Question` where `poolId = :id`.
- Có thể filter thêm: `Question.level`, `Question.category` (nếu cần thu hẹp trong pool).
- Random: `ORDER BY RANDOM() LIMIT :n` (PostgreSQL).

---

## 4. API Endpoints

### 4.1. Question Pool CRUD

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/academy/question-pools` | List pool (filter: courseProfileId, level, category, status) |
| GET | `/api/academy/question-pools/:id` | Chi tiết pool (kèm số câu, danh sách questionIds) |
| POST | `/api/academy/question-pools` | Tạo pool |
| PATCH | `/api/academy/question-pools/:id` | Cập nhật pool |
| DELETE | `/api/academy/question-pools/:id` | Xóa pool (chỉ khi không có QuizTemplate đang dùng) |

### 4.2. Pool Questions

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/academy/question-pools/:id/questions` | Danh sách câu trong pool (có pagination) |
| POST | `/api/academy/question-pools/:id/questions` | Thêm câu: body `{ questionIds: string[] }` |
| DELETE | `/api/academy/question-pools/:id/questions/:questionId` | Xóa câu khỏi pool |

### 4.3. Helper (dùng khi build Exam)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/academy/question-pools/:id/sample` | Lấy mẫu ngẫu nhiên: body `{ count: number }` → trả về danh sách Question (hoặc questionIds) để tạo ExamQuestion |

---

## 5. Question: bổ sung level, category

### 5.1. Migration

1. Thêm cột `level`, `category` (nullable) vào `Question`.
2. (Optional) Populate từ `metadata.jlptLevel`, `metadata.category` cho câu đã có.
3. Cập nhật DTO Create/Update: thêm `level`, `category`.
4. Cập nhật form tạo/sửa Question: thêm Select cho level, category.

### 5.2. Backward compatibility

- Cột nullable: câu cũ không có level/category vẫn hiển thị, vẫn dùng trong Exam.
- Nếu logic placement/chấm điểm đọc từ `metadata.jlptLevel`: có thể đọc từ `Question.level` trước, fallback `metadata.jlptLevel`.

---

## 6. QuizTemplate.questionPoolId — rule

- **Optional**: QuizTemplate không bắt buộc có questionPoolId.
- Khi có: dùng làm nguồn câu mặc định khi build quiz cho Class.
- **Validation**: Khi set questionPoolId, kiểm tra QuestionPool tồn tại và status = ACTIVE.
- **Xóa pool**: Không cho xóa QuestionPool nếu có QuizTemplate đang trỏ tới (hoặc set questionPoolId = null trước khi xóa).

---

## 7. ExamSection và Pool

- **core-lms** (§12.2): ExamSection không có poolId; câu được gắn qua ExamQuestion.
- **Spec này**: Không thay đổi ExamSection schema. Pool dùng trong **UI/API build exam**: "lấy N câu từ pool X" → tạo ExamQuestion. ExamSection vẫn chỉ có ExamQuestion.
- (Tùy chọn tương lai) Có thể thêm `ExamSection.poolId` (nullable) để lưu "section này được tạo từ pool X" — dùng cho audit / regenerate. Không bắt buộc phase 1.

---

## 8. Checklist triển khai

- [ ] Thêm model `QuestionPool`, `PoolQuestion` vào Prisma.
- [ ] Thêm cột `level`, `category` vào `Question`; tạo index.
- [ ] Cập nhật `QuizTemplate` relation `questionPool`; thêm FK constraint nếu chưa có.
- [ ] Chạy migration.
- [ ] Implement `QuestionPoolService`: CRUD, add/remove questions, sample.
- [ ] Implement API: question-pools CRUD, pool questions, sample.
- [ ] Cập nhật DTO Question: level, category.
- [ ] Cập nhật form Question (admin): Select level, category.
- [ ] (Optional) Populate Question.level, category từ metadata.
- [ ] Cập nhật UI build Exam: thêm flow "Thêm section từ Pool".
- [ ] Cập nhật logic QuizTemplate: khi có questionPoolId, gợi ý/lấy câu từ pool khi build quiz.

---

## 9. Tóm tắt

| Thành phần | Thay đổi |
|------------|----------|
| **QuestionPool** | Model mới: nhóm câu theo level, category, courseProfile |
| **PoolQuestion** | Model mới: many-to-many Question ↔ QuestionPool |
| **Question** | Thêm `level`, `category` (nullable) để filter tốt hơn |
| **QuizTemplate** | Đã có questionPoolId → thêm relation tới QuestionPool |
| **Exam / ExamSection / ExamQuestion** | Giữ nguyên; Pool dùng khi build (tạo ExamQuestion) |
| **Flow** | Lecturer tạo pool → thêm câu → khi build Exam/Quiz chọn pool → lấy câu (manual hoặc random) → tạo ExamQuestion |

Spec đảm bảo logic tương thích với core-lms, không phá vỡ flow Exam/ExamAttempt/ExamAttemptDetail hiện tại.
