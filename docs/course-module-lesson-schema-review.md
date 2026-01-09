# Đánh Giá Schema Course - Module - Lesson

## Tổng Quan

Tài liệu này đánh giá các bảng và trường hiện tại trong luồng Course → Module → Lesson, đánh giá mức độ cần thiết và đề xuất đơn giản hóa.

## 📋 Tóm Tắt Nhanh

### Bảng Tổng Hợp Các Trường Có Thể Loại Bỏ

| Bảng | Trường | Lý Do | Độ Ưu Tiên |
|------|--------|-------|------------|
| `courses` | `aiMetadata` | Không dùng AI features | ⭐ Low |
| `courses` | `durationWeeks` | Tính từ lessons | ⭐ Low |
| `courses` | `totalLessons` | Tính động từ queries | ⭐⭐ Medium |
| `courses` | `totalQuizzes` | Tính động từ queries | ⭐⭐ Medium |
| `courses` | `totalStudents` | Tính động từ enrollments | ⭐⭐ Medium |
| `courses` | `averageRating` | Tính động từ reviews | ⭐⭐ Medium |
| `courses` | `totalReviews` | Tính động từ reviews | ⭐⭐ Medium |
| `courses` | `approvedBy` | Không có workflow approval | ⭐ Low |
| `courses` | `approvedAt` | Không có workflow approval | ⭐ Low |
| `modules` | `description` | Không cần mô tả riêng | ⭐ Low |
| `modules` | `aiMetadata` | Không dùng AI features | ⭐ Low |
| `modules` | `durationMinutes` | Tính từ lessons | ⭐ Low |
| `lessons` | `aiMetadata` | Không dùng AI features | ⭐ Low |
| `lessons` | `isUnlocked` | Tính từ enrollment/payment | ⭐⭐ Medium |
| `course_instructors` | `id` | Dùng composite PK | ⭐ Low |
| `course_instructors` | `assignedDate` | Dùng createdAt | ⭐ Low |
| `lesson_materials` | `id` | Dùng composite unique | ⭐ Low |

### Số Lượng Trường Có Thể Loại Bỏ

- **courses**: 8 trường (2 bắt buộc, 6 có thể tính động)
- **modules**: 3 trường
- **lessons**: 2 trường
- **course_instructors**: 2 trường
- **lesson_materials**: 1 trường

**Tổng cộng: ~16 trường có thể loại bỏ hoặc đơn giản hóa**

---

## 1. Bảng `courses`

### Các Trường Hiện Tại

| Trường | Kiểu | Mô Tả | Mức Độ Cần Thiết |
|--------|------|-------|------------------|
| `id` | UUID | Primary key | ⭐⭐⭐ **Bắt buộc** |
| `title` | VARCHAR(255) | Tiêu đề khóa học | ⭐⭐⭐ **Bắt buộc** |
| `slug` | VARCHAR(255) | URL-friendly identifier | ⭐⭐⭐ **Bắt buộc** (SEO) |
| `type` | VARCHAR(20) | 'vod' \| 'live' | ⭐⭐⭐ **Bắt buộc** |
| `description` | TEXT | Mô tả đầy đủ | ⭐⭐ **Quan trọng** |
| `shortDescription` | VARCHAR(500) | Mô tả ngắn | ⭐⭐ **Quan trọng** (hiển thị list) |
| `jlptLevel` | VARCHAR(5) | JLPT level | ⭐⭐⭐ **Bắt buộc** (filtering) |
| `aiMetadata` | JSON | AI context metadata | ⭐ **Có thể loại bỏ** |
| `thumbnailUrl` | TEXT | Ảnh thumbnail | ⭐⭐⭐ **Bắt buộc** (UI) |
| `previewVideoUrl` | TEXT | Video preview | ⭐⭐ **Quan trọng** (marketing) |
| `price` | DECIMAL(10,2) | Giá gốc | ⭐⭐⭐ **Bắt buộc** |
| `discountPrice` | DECIMAL(10,2) | Giá giảm | ⭐⭐ **Quan trọng** |
| `liveConfig` | JSON | Config cho live courses | ⭐⭐ **Quan trọng** (nếu có live) |
| `durationWeeks` | INTEGER | Số tuần học | ⭐ **Có thể loại bỏ** (tính từ lessons) |
| `totalLessons` | INTEGER | Tổng số lessons | ⭐⭐ **Quan trọng** (có thể tính động) |
| `totalQuizzes` | INTEGER | Tổng số quizzes | ⭐⭐ **Quan trọng** (có thể tính động) |
| `totalStudents` | INTEGER | Số học viên | ⭐⭐ **Quan trọng** (có thể tính động) |
| `averageRating` | DECIMAL(3,2) | Điểm đánh giá TB | ⭐⭐ **Quan trọng** (có thể tính động) |
| `totalReviews` | INTEGER | Số lượt đánh giá | ⭐⭐ **Quan trọng** (có thể tính động) |
| `status` | VARCHAR(20) | draft/published/archived | ⭐⭐⭐ **Bắt buộc** |
| `featured` | BOOLEAN | Nổi bật | ⭐⭐ **Quan trọng** |
| `isFree` | BOOLEAN | Miễn phí | ⭐⭐⭐ **Bắt buộc** |
| `tags` | VARCHAR(50)[] | Tags | ⭐⭐ **Quan trọng** (search/filter) |
| `learningOutcomes` | JSON | Kết quả học tập | ⭐⭐ **Quan trọng** |
| `requirements` | JSON | Yêu cầu | ⭐⭐ **Quan trọng** |
| `createdBy` | UUID | Người tạo | ⭐⭐ **Quan trọng** (audit) |
| `approvedBy` | UUID | Người duyệt | ⭐ **Có thể loại bỏ** (nếu không cần workflow) |
| `approvedAt` | TIMESTAMP | Thời gian duyệt | ⭐ **Có thể loại bỏ** (nếu không cần workflow) |
| `createdAt` | TIMESTAMP | Thời gian tạo | ⭐⭐⭐ **Bắt buộc** |
| `updatedAt` | TIMESTAMP | Thời gian cập nhật | ⭐⭐⭐ **Bắt buộc** |
| `deletedAt` | TIMESTAMP | Soft delete | ⭐⭐ **Quan trọng** (nếu cần soft delete) |

### Đề Xuất Đơn Giản Hóa

#### ✅ **Có thể loại bỏ:**
1. **`aiMetadata`** - Nếu không sử dụng AI features, có thể bỏ hoặc merge vào `metadata` chung
2. **`durationWeeks`** - Có thể tính từ tổng `durationMinutes` của tất cả lessons
3. **`approvedBy` / `approvedAt`** - Nếu không có workflow phê duyệt, chỉ cần `status = 'published'`
4. **Các trường aggregate** (`totalLessons`, `totalQuizzes`, `totalStudents`, `averageRating`, `totalReviews`) - Có thể tính động từ queries thay vì lưu, tránh data inconsistency

#### 💡 **Giải pháp: Sử dụng SQL Triggers & Functions**

Thay vì tính động trong code hoặc loại bỏ, có thể sử dụng **SQL Triggers** để tự động update các trường aggregate khi có thay đổi. Điều này giúp:
- ✅ Giữ nguyên schema hiện tại
- ✅ Tự động maintain consistency
- ✅ Không cần viết logic trong application code
- ✅ Performance tốt (update ngay khi có thay đổi)

**File SQL đã tạo:** `scripts/course-aggregate-triggers.sql`

**Các functions và triggers tự động update:**
- `totalLessons` → Trigger khi insert/update/delete lessons
- `totalQuizzes` → Trigger khi insert/update/delete quizzes  
- `totalStudents` → Trigger khi insert/delete enrollments
- `averageRating` → Trigger khi insert/update/delete reviews
- `totalReviews` → Trigger khi insert/update/delete reviews
- `durationWeeks` → Tính từ tổng video_duration của lessons
- `modules.durationMinutes` → Tính từ tổng video_duration của lessons trong module

---

## 2. Bảng `modules`

### Các Trường Hiện Tại

| Trường | Kiểu | Mô Tả | Mức Độ Cần Thiết |
|--------|------|-------|------------------|
| `id` | UUID | Primary key | ⭐⭐⭐ **Bắt buộc** |
| `courseId` | UUID | FK → courses | ⭐⭐⭐ **Bắt buộc** |
| `title` | VARCHAR(255) | Tiêu đề module | ⭐⭐⭐ **Bắt buộc** |
| `description` | TEXT | Mô tả module | ⭐ **Có thể loại bỏ** |
| `aiMetadata` | JSON | AI context | ⭐ **Có thể loại bỏ** |
| `orderIndex` | INTEGER | Thứ tự hiển thị | ⭐⭐⭐ **Bắt buộc** |
| `durationMinutes` | INTEGER | Thời lượng ước tính | ⭐ **Có thể loại bỏ** (tính từ lessons) |
| `createdBy` | UUID | Người tạo | ⭐⭐ **Quan trọng** (audit) |
| `createdAt` | TIMESTAMP | Thời gian tạo | ⭐⭐⭐ **Bắt buộc** |
| `updatedAt` | TIMESTAMP | Thời gian cập nhật | ⭐⭐⭐ **Bắt buộc** |
| `deletedAt` | TIMESTAMP | Soft delete | ⭐⭐ **Quan trọng** |

### Đề Xuất Đơn Giản Hóa

#### ✅ **Có thể loại bỏ:**
1. **`description`** - Nếu không cần mô tả riêng cho module, có thể bỏ
2. **`aiMetadata`** - Tương tự như Course, bỏ nếu không dùng AI
3. **`durationMinutes`** - Tính từ tổng `videoDuration` của tất cả lessons trong module

**Module đơn giản hóa chỉ cần:**
- `id`, `courseId`, `title`, `orderIndex`
- Timestamps và soft delete (nếu cần)

---

## 3. Bảng `lessons`

### Các Trường Hiện Tại

| Trường | Kiểu | Mô Tả | Mức Độ Cần Thiết |
|--------|------|-------|------------------|
| `id` | UUID | Primary key | ⭐⭐⭐ **Bắt buộc** |
| `moduleId` | UUID | FK → modules | ⭐⭐⭐ **Bắt buộc** |
| `title` | VARCHAR(255) | Tiêu đề lesson | ⭐⭐⭐ **Bắt buộc** |
| `contentType` | VARCHAR(20) | video/article/interactive | ⭐⭐⭐ **Bắt buộc** |
| `videoUrl` | TEXT | URL video | ⭐⭐ **Quan trọng** (nếu contentType='video') |
| `videoDuration` | INTEGER | Độ dài video (giây) | ⭐⭐ **Quan trọng** (progress tracking) |
| `articleContent` | TEXT | Nội dung article | ⭐⭐ **Quan trọng** (nếu contentType='article') |
| `aiMetadata` | JSON | AI context | ⭐ **Có thể loại bỏ** |
| `orderIndex` | INTEGER | Thứ tự hiển thị | ⭐⭐⭐ **Bắt buộc** |
| `isPreview` | BOOLEAN | Lesson preview miễn phí | ⭐⭐⭐ **Bắt buộc** (marketing) |
| `isUnlocked` | BOOLEAN | Trạng thái unlock | ⭐ **Có thể loại bỏ** (logic phức tạp) |
| `createdBy` | UUID | Người tạo | ⭐⭐ **Quan trọng** (audit) |
| `createdAt` | TIMESTAMP | Thời gian tạo | ⭐⭐⭐ **Bắt buộc** |
| `updatedAt` | TIMESTAMP | Thời gian cập nhật | ⭐⭐⭐ **Bắt buộc** |
| `deletedAt` | TIMESTAMP | Soft delete | ⭐⭐ **Quan trọng** |

### Đề Xuất Đơn Giản Hóa

#### ✅ **Có thể loại bỏ:**
1. **`aiMetadata`** - Bỏ nếu không dùng AI features
2. **`isUnlocked`** - Logic unlock có thể dựa vào:
   - Enrollment status
   - Payment status
   - Course `isFree` flag
   - Lesson `isPreview` flag
   
   → Không cần field riêng, tính toán từ business logic

#### 💡 **Cải thiện:**
- `videoUrl` và `articleContent` có thể merge vào một field `content` JSON:
  ```json
  {
    "type": "video",
    "videoUrl": "...",
    "videoDuration": 300
  }
  ```
  Hoặc giữ nguyên nhưng đảm bảo chỉ một trong hai có giá trị tùy `contentType`

**Lesson đơn giản hóa:**
- `id`, `moduleId`, `title`, `contentType`
- `videoUrl` + `videoDuration` (nếu video) HOẶC `articleContent` (nếu article)
- `orderIndex`, `isPreview`
- Timestamps và soft delete

---

## 4. Bảng `course_instructors`

### Các Trường Hiện Tại

| Trường | Kiểu | Mô Tả | Mức Độ Cần Thiết |
|--------|------|-------|------------------|
| `id` | UUID | Primary key | ⭐ **Có thể loại bỏ** (dùng composite PK) |
| `courseId` | UUID | FK → courses | ⭐⭐⭐ **Bắt buộc** |
| `lecturerId` | UUID | FK → users | ⭐⭐⭐ **Bắt buộc** |
| `isPrimary` | BOOLEAN | Giảng viên chính | ⭐⭐ **Quan trọng** |
| `assignedDate` | TIMESTAMP | Ngày phân công | ⭐ **Có thể loại bỏ** (dùng createdAt) |

### Đề Xuất Đơn Giản Hóa

#### ✅ **Có thể loại bỏ:**
1. **`id`** - Dùng composite primary key `(courseId, lecturerId)` thay vì UUID riêng
2. **`assignedDate`** - Dùng `createdAt` thay thế

**Đơn giản hóa thành:**
- `(courseId, lecturerId)` composite PK
- `isPrimary` boolean
- `createdAt`, `updatedAt` (nếu cần track changes)

---

## 5. Bảng `lesson_materials`

### Các Trường Hiện Tại

| Trường | Kiểu | Mô Tả | Mức Độ Cần Thiết |
|--------|------|-------|------------------|
| `id` | UUID | Primary key | ⭐ **Có thể loại bỏ** (dùng composite PK) |
| `lessonId` | UUID | FK → lessons | ⭐⭐⭐ **Bắt buộc** |
| `fileAssetId` | UUID | FK → file_assets | ⭐⭐⭐ **Bắt buộc** |
| `type` | VARCHAR(50) | slides/video/reading/assignment | ⭐⭐ **Quan trọng** |
| `title` | VARCHAR(255) | Tiêu đề material | ⭐⭐ **Quan trọng** |
| `orderIndex` | INTEGER | Thứ tự hiển thị | ⭐⭐ **Quan trọng** |
| `createdBy` | UUID | Người tạo | ⭐⭐ **Quan trọng** |
| `createdAt` | TIMESTAMP | Thời gian tạo | ⭐⭐⭐ **Bắt buộc** |
| `updatedAt` | TIMESTAMP | Thời gian cập nhật | ⭐⭐⭐ **Bắt buộc** |

### Đề Xuất Đơn Giản Hóa

#### ✅ **Có thể loại bỏ:**
1. **`id`** - Dùng composite unique constraint `(lessonId, fileAssetId)` thay vì UUID riêng
   - Nếu cần PK riêng, có thể dùng composite PK

**Giữ lại:**
- Tất cả các trường khác đều cần thiết cho việc quản lý materials

---

## 6. Các Bảng Liên Quan (Quizzes)

### `quizzes` - Liên kết với Course/Lesson

| Trường | Kiểu | Mô Tả | Mức Độ Cần Thiết |
|--------|------|-------|------------------|
| `courseId` | UUID | FK → courses (nullable) | ⭐⭐ **Quan trọng** |
| `lessonId` | UUID | FK → lessons (nullable) | ⭐⭐ **Quan trọng** |

**Lưu ý:** Quiz có thể thuộc Course hoặc Lesson, không bắt buộc cả hai.

---

## 7. Các Bảng Chưa Có Trong Prisma Schema

### `enrollments` (có trong SQL nhưng chưa migrate)

Bảng này **quan trọng** cho tracking enrollment nhưng chưa có trong Prisma schema. Cần migrate nếu muốn track:
- User enrollment vào course
- Completion status
- Payment tracking

### `lesson_progress` (có trong SQL nhưng chưa migrate)

Bảng này **quan trọng** cho tracking progress nhưng chưa có trong Prisma schema. Cần migrate nếu muốn track:
- Lesson completion status
- Watched duration
- Student notes

---

## Tổng Kết Đề Xuất Đơn Giản Hóa

### 🎯 **Giải pháp đã áp dụng: SQL Triggers**

✅ **Đã tạo SQL Triggers để tự động maintain các trường aggregate:**
- `courses.totalLessons` → Auto-update khi thay đổi lessons
- `courses.totalQuizzes` → Auto-update khi thay đổi quizzes
- `courses.totalStudents` → Auto-update khi thay đổi enrollments
- `courses.averageRating` → Auto-update khi thay đổi reviews
- `courses.totalReviews` → Auto-update khi thay đổi reviews
- `courses.durationWeeks` → Auto-calculate từ lessons
- `modules.durationMinutes` → Auto-calculate từ lessons

**File:** `scripts/course-aggregate-triggers.sql`

### 🎯 **Vẫn có thể loại bỏ (nếu muốn):**

1. **Tất cả `aiMetadata` fields** (nếu không dùng AI)
   - `courses.aiMetadata`
   - `modules.aiMetadata`
   - `lessons.aiMetadata`

3. **Workflow approval (nếu không cần):**
   - `courses.approvedBy`
   - `courses.approvedAt`

4. **Trường trùng lặp:**
   - `course_instructors.id` → dùng composite PK
   - `course_instructors.assignedDate` → dùng `createdAt`
   - `lesson_materials.id` → dùng composite unique

5. **Logic phức tạp không cần thiết:**
   - `lessons.isUnlocked` → tính từ enrollment/payment status
   - `modules.description` (nếu không dùng)

### ✅ **Giữ lại (Core fields):**

**Course:**
- `id`, `title`, `slug`, `type`, `description`, `shortDescription`
- `jlptLevel`, `thumbnailUrl`, `previewVideoUrl`
- `price`, `discountPrice`, `isFree`
- `status`, `featured`, `tags`
- `learningOutcomes`, `requirements`
- `liveConfig` (nếu có live courses)
- Timestamps và soft delete

**Module:**
- `id`, `courseId`, `title`, `orderIndex`
- Timestamps và soft delete

**Lesson:**
- `id`, `moduleId`, `title`, `contentType`
- `videoUrl`, `videoDuration` (nếu video)
- `articleContent` (nếu article)
- `orderIndex`, `isPreview`
- Timestamps và soft delete

### 📊 **Lợi Ích Của SQL Triggers Approach:**

1. **Tự động maintain:** Database tự động update khi có thay đổi
2. **Consistency:** Luôn đảm bảo data chính xác, không cần sync thủ công
3. **Giảm code complexity:** Không cần viết logic trong application code
4. **Performance:** Update ngay trong transaction, không cần query lại
5. **Centralized logic:** Tất cả logic tính toán ở một nơi (database)
6. **Giữ nguyên schema:** Không cần migrate, không ảnh hưởng existing code

### ⚠️ **Lưu Ý:**

- Nếu đã có data production, cần migration plan cẩn thận
- Các trường aggregate nếu bỏ, cần đảm bảo queries tính động không quá chậm
- Nếu có nhiều nơi đọc aggregate fields, cần refactor code trước khi bỏ

---

## Implementation Plan: SQL Triggers

### Bước 1: Backup Database
```sql
-- Backup trước khi apply triggers
pg_dump -U username -d database_name > backup_before_triggers.sql
```

### Bước 2: Apply SQL Triggers
```bash
# Chạy file SQL để tạo functions và triggers
psql -U username -d database_name -f scripts/course-aggregate-triggers.sql
```

### Bước 3: Recalculate Existing Data
```sql
-- Recalculate tất cả courses để đảm bảo data chính xác
SELECT recalculate_all_course_aggregates();
```

### Bước 4: Verify Triggers Hoạt Động
```sql
-- Test: Thêm một lesson mới
INSERT INTO lessons (module_id, title, content_type, order_index)
VALUES ('module-uuid', 'Test Lesson', 'video', 1);

-- Kiểm tra course.total_lessons đã được update chưa
SELECT id, title, total_lessons FROM courses WHERE id = 'course-uuid';
```

### Bước 5: Update Application Code (Optional)
- **Không cần thay đổi gì!** Triggers tự động chạy
- Có thể remove code manual update nếu có
- Giữ nguyên cách đọc các aggregate fields như cũ

### Bước 6: Monitor Performance
- Kiểm tra performance của triggers
- Nếu cần, có thể optimize queries trong functions
- Có thể disable triggers tạm thời khi batch import data lớn

### ⚠️ **Lưu Ý:**

1. **Batch Operations:** Khi import nhiều data, có thể tạm disable triggers:
   ```sql
   ALTER TABLE lessons DISABLE TRIGGER trg_lessons_update_course;
   -- ... batch insert/update ...
   ALTER TABLE lessons ENABLE TRIGGER trg_lessons_update_course;
   SELECT recalculate_all_course_aggregates();
   ```

2. **Performance:** Triggers chạy trong transaction, nên có thể chậm nếu có nhiều thay đổi cùng lúc. Monitor và optimize nếu cần.

3. **Testing:** Test kỹ các scenarios:
   - Insert/Update/Delete modules
   - Insert/Update/Delete lessons
   - Insert/Update/Delete quizzes
   - Insert/Delete enrollments
   - Insert/Update/Delete reviews

---

**Tài liệu được tạo:** {{ current_date }}
**Phiên bản:** 1.0

