# Course Aggregate Triggers - Hướng Dẫn Sử Dụng

## Tổng Quan

File `course-aggregate-triggers.sql` chứa các **SQL Functions và Triggers** để tự động cập nhật các trường aggregate trong bảng `courses` và `modules` khi có thay đổi ở các bảng liên quan.

## Các Trường Được Tự Động Update

### Bảng `courses`:
- ✅ `total_lessons` - Tổng số lessons
- ✅ `total_quizzes` - Tổng số quizzes
- ✅ `total_students` - Tổng số học viên đã enroll
- ✅ `average_rating` - Điểm đánh giá trung bình
- ✅ `total_reviews` - Tổng số reviews
- ✅ `duration_weeks` - Số tuần học (tính từ video duration)

### Bảng `modules`:
- ✅ `duration_minutes` - Thời lượng module (tính từ lessons)

## Cách Sử Dụng

### 1. Apply Triggers vào Database

```bash
# Sử dụng psql
psql -U your_username -d your_database -f scripts/course-aggregate-triggers.sql

# Hoặc từ trong psql console
\i scripts/course-aggregate-triggers.sql
```

### 2. Recalculate Tất Cả Data Hiện Tại

Sau khi apply triggers, cần recalculate để đảm bảo data chính xác:

```sql
SELECT recalculate_all_course_aggregates();
```

### 3. Test Triggers

```sql
-- Test: Thêm một lesson mới
INSERT INTO lessons (module_id, title, content_type, order_index, video_duration)
VALUES (
    'module-uuid-here',
    'Test Lesson',
    'video',
    1,
    300  -- 5 phút
);

-- Kiểm tra course.total_lessons đã được update
SELECT id, title, total_lessons, duration_weeks 
FROM courses 
WHERE id = 'course-uuid-here';
```

## Cách Hoạt Động

### Triggers Tự Động Chạy Khi:

1. **Insert/Update/Delete `modules`** → Update `courses.total_lessons`, `courses.duration_weeks`
2. **Insert/Update/Delete `lessons`** → Update `courses.total_lessons`, `courses.duration_weeks`, `modules.duration_minutes`
3. **Insert/Update/Delete `quizzes`** → Update `courses.total_quizzes`
4. **Insert/Delete `enrollments`** → Update `courses.total_students`
5. **Insert/Update/Delete `reviews`** → Update `courses.average_rating`, `courses.total_reviews`

### Functions Có Sẵn:

```sql
-- Update aggregates cho một course cụ thể
SELECT update_course_aggregates('course-uuid-here');

-- Recalculate tất cả courses
SELECT recalculate_all_course_aggregates();

-- Tính total_lessons cho một course
SELECT calculate_course_total_lessons('course-uuid-here');

-- Tính average_rating cho một course
SELECT calculate_course_average_rating('course-uuid-here');
```

## Batch Operations

Khi cần import/update nhiều data cùng lúc, có thể tạm disable triggers để tăng performance:

```sql
-- Disable triggers
ALTER TABLE lessons DISABLE TRIGGER trg_lessons_update_course;
ALTER TABLE lessons DISABLE TRIGGER trg_lessons_update_module_duration;
ALTER TABLE modules DISABLE TRIGGER trg_modules_update_course;
ALTER TABLE quizzes DISABLE TRIGGER trg_quizzes_update_course;
ALTER TABLE reviews DISABLE TRIGGER trg_reviews_update_course;

-- ... Thực hiện batch operations ...

-- Enable lại triggers
ALTER TABLE lessons ENABLE TRIGGER trg_lessons_update_course;
ALTER TABLE lessons ENABLE TRIGGER trg_lessons_update_module_duration;
ALTER TABLE modules ENABLE TRIGGER trg_modules_update_course;
ALTER TABLE quizzes ENABLE TRIGGER trg_quizzes_update_course;
ALTER TABLE reviews ENABLE TRIGGER trg_reviews_update_course;

-- Recalculate tất cả
SELECT recalculate_all_course_aggregates();
```

## Performance Considerations

### ✅ Ưu Điểm:
- Tự động maintain consistency
- Không cần viết logic trong application code
- Update ngay trong transaction

### ⚠️ Lưu Ý:
- Triggers chạy trong transaction, có thể chậm nếu có nhiều thay đổi cùng lúc
- Khi batch import data lớn, nên disable triggers tạm thời
- Monitor performance và optimize queries trong functions nếu cần

## Troubleshooting

### Kiểm Tra Triggers Đã Được Tạo:

```sql
-- List tất cả triggers
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table IN ('modules', 'lessons', 'quizzes', 'reviews', 'enrollments')
ORDER BY event_object_table, trigger_name;
```

### Kiểm Tra Functions Đã Được Tạo:

```sql
-- List tất cả functions
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%course%aggregate%'
ORDER BY routine_name;
```

### Nếu Triggers Không Chạy:

1. Kiểm tra triggers đã được enable chưa:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname LIKE 'trg_%';
   ```

2. Kiểm tra logs để xem có lỗi không

3. Test manual function:
   ```sql
   SELECT update_course_aggregates('course-uuid-here');
   ```

## Rollback (Nếu Cần)

Nếu muốn remove triggers:

```sql
-- Drop triggers
DROP TRIGGER IF EXISTS trg_modules_update_course ON modules;
DROP TRIGGER IF EXISTS trg_lessons_update_course ON lessons;
DROP TRIGGER IF EXISTS trg_lessons_update_module_duration ON lessons;
DROP TRIGGER IF EXISTS trg_quizzes_update_course ON quizzes;
DROP TRIGGER IF EXISTS trg_reviews_update_course ON reviews;
DROP TRIGGER IF EXISTS trg_enrollments_update_course ON enrollments;

-- Drop functions (optional)
DROP FUNCTION IF EXISTS update_course_aggregates(UUID);
DROP FUNCTION IF EXISTS calculate_course_total_lessons(UUID);
DROP FUNCTION IF EXISTS calculate_course_total_quizzes(UUID);
DROP FUNCTION IF EXISTS calculate_course_total_students(UUID);
DROP FUNCTION IF EXISTS calculate_course_average_rating(UUID);
DROP FUNCTION IF EXISTS calculate_course_total_reviews(UUID);
DROP FUNCTION IF EXISTS calculate_course_duration_weeks(UUID);
DROP FUNCTION IF EXISTS recalculate_all_course_aggregates();
DROP FUNCTION IF EXISTS calculate_module_duration_minutes(UUID);
```

## Notes

- Triggers tự động chạy, không cần thay đổi application code
- Các aggregate fields vẫn có thể được đọc như bình thường
- Nếu cần, có thể gọi functions trực tiếp từ application code
- Đảm bảo có indexes phù hợp để optimize performance

