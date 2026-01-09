# SQL Triggers - Troubleshooting Guide

## Các Vấn Đề Thường Gặp & Cách Xử Lý

### 1. Triggers Không Chạy

#### Triệu Chứng:
- Insert/Update/Delete records nhưng aggregates không được update

#### Kiểm Tra:
```sql
-- 1. Check triggers đã được tạo chưa
SELECT * FROM check_trigger_status();

-- 2. Check triggers có enabled không
SELECT 
    tgname,
    tgenabled
FROM pg_trigger
WHERE tgname LIKE 'trg_%';

-- tgenabled: 'O' = enabled, 'D' = disabled
```

#### Giải Pháp:
```sql
-- Enable lại triggers
SELECT enable_all_course_aggregate_triggers();

-- Hoặc enable từng trigger
ALTER TABLE lessons ENABLE TRIGGER trg_lessons_update_course;
```

---

### 2. Performance Chậm

#### Triệu Chứng:
- Queries chậm khi insert/update nhiều records
- Database CPU cao

#### Kiểm Tra:
```sql
-- Check slow queries
SELECT 
    query,
    calls,
    mean_exec_time,
    max_exec_time
FROM pg_stat_statements
WHERE query LIKE '%update_course_aggregates%'
ORDER BY mean_exec_time DESC;

-- Check indexes
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('modules', 'lessons', 'quizzes', 'reviews', 'courses');
```

#### Giải Pháp:

**a) Disable triggers khi batch operations:**
```sql
SELECT disable_all_course_aggregate_triggers();
-- ... batch operations ...
SELECT enable_all_course_aggregate_triggers();
SELECT recalculate_all_course_aggregates();
```

**b) Optimize indexes:**
```sql
-- Đảm bảo có indexes
CREATE INDEX IF NOT EXISTS idx_modules_course_id 
    ON modules(course_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_lessons_module_id 
    ON lessons(module_id) WHERE deleted_at IS NULL;
```

**c) Analyze tables:**
```sql
ANALYZE courses;
ANALYZE modules;
ANALYZE lessons;
```

---

### 3. Deadlocks

#### Triệu Chứng:
```
ERROR: deadlock detected
DETAIL: Process 12345 waits for ShareLock on transaction 67890
```

#### Nguyên Nhân:
- Nhiều transactions cùng update cùng một course
- Lock ordering không nhất quán

#### Giải Pháp:

**a) Retry logic trong application:**
```typescript
// Example: Retry on deadlock
async function insertLesson(data) {
  let retries = 3;
  while (retries > 0) {
    try {
      return await db.lesson.create(data);
    } catch (error) {
      if (error.code === '40P01' && retries > 0) { // Deadlock
        retries--;
        await sleep(100 * (4 - retries)); // Exponential backoff
        continue;
      }
      throw error;
    }
  }
}
```

**b) Lock ordering:**
- Đảm bảo luôn lock courses theo thứ tự UUID
- Hoặc sử dụng advisory locks

---

### 4. Data Inconsistency

#### Triệu Chứng:
- Aggregates không khớp với actual data
- `total_lessons` khác với số lessons thực tế

#### Kiểm Tra:
```sql
-- So sánh stored value vs calculated value
SELECT 
    c.id,
    c.title,
    c.total_lessons AS stored_value,
    calculate_course_total_lessons(c.id) AS calculated_value,
    c.total_lessons - calculate_course_total_lessons(c.id) AS difference
FROM courses c
WHERE c.total_lessons != calculate_course_total_lessons(c.id);
```

#### Giải Pháp:
```sql
-- Recalculate tất cả
SELECT recalculate_all_course_aggregates();

-- Hoặc recalculate một course cụ thể
SELECT update_course_aggregates('course-uuid-here');
```

---

### 5. Errors trong Triggers

#### Triệu Chứng:
- Transactions fail với error messages không rõ ràng
- Warnings trong logs

#### Kiểm Tra:
```sql
-- Check PostgreSQL logs
-- Location: thường ở /var/log/postgresql/ hoặc check postgresql.conf

-- Check recent errors
SELECT * FROM pg_stat_statements
WHERE query LIKE '%WARNING%' OR query LIKE '%ERROR%';
```

#### Giải Pháp:

**a) Test functions manually:**
```sql
-- Test từng function
SELECT calculate_course_total_lessons('course-uuid-here');
SELECT calculate_course_average_rating('course-uuid-here');

-- Test update function
SELECT update_course_aggregates('course-uuid-here');
```

**b) Add more logging:**
```sql
-- Modify function để log chi tiết hơn
CREATE OR REPLACE FUNCTION update_course_aggregates(course_uuid UUID)
RETURNS VOID AS $$
DECLARE
    v_total_lessons INTEGER;
BEGIN
    v_total_lessons := calculate_course_total_lessons(course_uuid);
    RAISE NOTICE 'Updating course %: total_lessons = %', course_uuid, v_total_lessons;
    
    UPDATE courses SET total_lessons = v_total_lessons WHERE id = course_uuid;
END;
$$ LANGUAGE plpgsql;
```

---

### 6. Concurrent Updates Race Condition

#### Triệu Chứng:
- Aggregates không chính xác khi có nhiều concurrent updates
- `total_lessons` thiếu một vài lessons

#### Giải Pháp:

**a) Use SERIALIZABLE isolation:**
```sql
BEGIN ISOLATION LEVEL SERIALIZABLE;
-- ... operations ...
COMMIT;
```

**b) Use SELECT FOR UPDATE:**
```sql
-- Trong trigger function, lock course row
SELECT * FROM courses WHERE id = course_uuid FOR UPDATE;
```

**c) Accept eventual consistency:**
- Nếu không critical, có thể accept data không chính xác trong thời gian ngắn
- Recalculate định kỳ

---

### 7. Triggers Chạy Quá Nhiều Lần

#### Triệu Chứng:
- Một operation trigger nhiều updates
- Performance issues

#### Kiểm Tra:
```sql
-- Check trigger execution count
SELECT 
    schemaname,
    tablename,
    trigger_name,
    trigger_count
FROM pg_stat_user_triggers
WHERE trigger_name LIKE 'trg_%';
```

#### Giải Pháp:

**a) Debounce logic:**
```sql
-- Chỉ update nếu course chưa được update trong 1 giây
CREATE OR REPLACE FUNCTION update_course_aggregates_debounced(course_uuid UUID)
RETURNS VOID AS $$
DECLARE
    last_updated TIMESTAMP;
BEGIN
    SELECT updated_at INTO last_updated
    FROM courses
    WHERE id = course_uuid;
    
    -- Chỉ update nếu đã qua 1 giây
    IF last_updated IS NULL OR (CURRENT_TIMESTAMP - last_updated) > INTERVAL '1 second' THEN
        PERFORM update_course_aggregates(course_uuid);
    END IF;
END;
$$ LANGUAGE plpgsql;
```

---

### 8. Migration Issues

#### Triệu Chứng:
- Migration fail
- Triggers không được tạo đúng

#### Giải Pháp:

**a) Check migration status:**
```sql
-- Check functions exist
SELECT routine_name 
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%course%aggregate%';

-- Check triggers exist
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name LIKE 'trg_%';
```

**b) Rollback migration:**
```sql
-- Disable triggers
SELECT disable_all_course_aggregate_triggers();

-- Drop triggers
DROP TRIGGER IF EXISTS trg_modules_update_course ON modules;
DROP TRIGGER IF EXISTS trg_lessons_update_course ON lessons;
-- ... etc

-- Drop functions
DROP FUNCTION IF EXISTS update_course_aggregates(UUID);
-- ... etc
```

---

## Monitoring & Maintenance

### Daily Checks:
```sql
-- Check for inconsistencies
SELECT 
    c.id,
    c.title,
    c.total_lessons,
    calculate_course_total_lessons(c.id) AS actual_lessons
FROM courses c
WHERE c.total_lessons != calculate_course_total_lessons(c.id)
LIMIT 10;
```

### Weekly Maintenance:
```sql
-- Recalculate all courses
SELECT recalculate_all_course_aggregates();

-- Analyze tables
ANALYZE courses;
ANALYZE modules;
ANALYZE lessons;
```

### Performance Monitoring:
```sql
-- Check slow queries
SELECT 
    query,
    calls,
    mean_exec_time,
    total_exec_time
FROM pg_stat_statements
WHERE query LIKE '%course%aggregate%'
ORDER BY mean_exec_time DESC
LIMIT 10;
```

---

## Emergency Procedures

### Disable All Triggers (Emergency):
```sql
SELECT disable_all_course_aggregate_triggers();
```

### Re-enable All Triggers:
```sql
SELECT enable_all_course_aggregate_triggers();
SELECT recalculate_all_course_aggregates();
```

### Quick Fix Data:
```sql
-- Fix one course
SELECT update_course_aggregates('course-uuid-here');

-- Fix all courses
SELECT recalculate_all_course_aggregates();
```

---

**Tài liệu được tạo:** 2025-01-09
**Phiên bản:** 1.0

