-- ============================================
-- SQL Functions & Triggers cho Course Aggregate Fields
-- ============================================
-- File này chứa các functions và triggers để tự động update
-- các trường aggregate trong bảng courses khi có thay đổi
-- ở các bảng liên quan (modules, lessons, quizzes, enrollments, reviews)

-- ============================================
-- 1. Functions để tính toán aggregate values
-- ============================================

-- Function: Tính tổng số lessons của một course
CREATE OR REPLACE FUNCTION calculate_course_total_lessons(course_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM lessons l
        INNER JOIN modules m ON l.module_id = m.id
        WHERE m.course_id = course_uuid
          AND l.deleted_at IS NULL
          AND m.deleted_at IS NULL
    );
END;
$$ LANGUAGE plpgsql;

-- Function: Tính tổng số quizzes của một course
CREATE OR REPLACE FUNCTION calculate_course_total_quizzes(course_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM quizzes
        WHERE course_id = course_uuid
          AND deleted_at IS NULL
    );
END;
$$ LANGUAGE plpgsql;

-- Function: Tính tổng số students (enrollments) của một course
CREATE OR REPLACE FUNCTION calculate_course_total_students(course_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(DISTINCT user_id)
        FROM enrollments
        WHERE course_id = course_uuid
    );
END;
$$ LANGUAGE plpgsql;

-- Function: Tính điểm đánh giá trung bình của một course
CREATE OR REPLACE FUNCTION calculate_course_average_rating(course_uuid UUID)
RETURNS DECIMAL(3,2) AS $$
DECLARE
    avg_rating DECIMAL(3,2);
BEGIN
    SELECT COALESCE(AVG(rating), 0.00) INTO avg_rating
    FROM reviews
    WHERE course_id = course_uuid;
    
    RETURN avg_rating;
END;
$$ LANGUAGE plpgsql;

-- Function: Tính tổng số reviews của một course
CREATE OR REPLACE FUNCTION calculate_course_total_reviews(course_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM reviews
        WHERE course_id = course_uuid
    );
END;
$$ LANGUAGE plpgsql;

-- Function: Tính duration_weeks từ tổng duration của lessons
CREATE OR REPLACE FUNCTION calculate_course_duration_weeks(course_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    total_minutes INTEGER;
BEGIN
    SELECT COALESCE(SUM(l.video_duration), 0) INTO total_minutes
    FROM lessons l
    INNER JOIN modules m ON l.module_id = m.id
    WHERE m.course_id = course_uuid
      AND l.content_type = 'video'
      AND l.deleted_at IS NULL
      AND m.deleted_at IS NULL;
    
    -- Giả sử 1 tuần = 60 phút học (có thể điều chỉnh)
    RETURN CEIL(total_minutes / 60.0);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 2. Function chính để update tất cả aggregates
-- ============================================

CREATE OR REPLACE FUNCTION update_course_aggregates(course_uuid UUID)
RETURNS VOID AS $$
BEGIN
    -- Error handling: Nếu course không tồn tại hoặc có lỗi, log và return
    BEGIN
        UPDATE courses
        SET
            total_lessons = calculate_course_total_lessons(course_uuid),
            total_quizzes = calculate_course_total_quizzes(course_uuid),
            total_students = calculate_course_total_students(course_uuid),
            average_rating = calculate_course_average_rating(course_uuid),
            total_reviews = calculate_course_total_reviews(course_uuid),
            duration_weeks = calculate_course_duration_weeks(course_uuid),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = course_uuid;
        
        -- Chỉ log nếu có row được update (course tồn tại)
        IF NOT FOUND THEN
            RAISE WARNING 'Course % not found when updating aggregates', course_uuid;
        END IF;
    EXCEPTION
        WHEN OTHERS THEN
            -- Log error nhưng không fail transaction
            -- Có thể customize để fail transaction nếu cần
            RAISE WARNING 'Error updating course aggregates for %: %', course_uuid, SQLERRM;
            -- Re-raise nếu muốn fail transaction
            -- RAISE;
    END;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 3. Triggers cho bảng modules
-- ============================================

-- Trigger: Khi insert/update/delete module → update course aggregates
CREATE OR REPLACE FUNCTION trigger_update_course_on_module_change()
RETURNS TRIGGER AS $$
DECLARE
    affected_course_id UUID;
BEGIN
    -- Xác định course_id bị ảnh hưởng
    IF TG_OP = 'DELETE' THEN
        affected_course_id := OLD.course_id;
    ELSE
        affected_course_id := NEW.course_id;
    END IF;
    
    -- Chỉ update nếu course_id hợp lệ
    IF affected_course_id IS NOT NULL THEN
        -- Update aggregates của course
        -- Sử dụng PERFORM để không return value
        PERFORM update_course_aggregates(affected_course_id);
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Tạo triggers
DROP TRIGGER IF EXISTS trg_modules_update_course ON modules;
CREATE TRIGGER trg_modules_update_course
    AFTER INSERT OR UPDATE OR DELETE ON modules
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_course_on_module_change();

-- ============================================
-- 4. Triggers cho bảng lessons
-- ============================================

-- Trigger: Khi insert/update/delete lesson → update course aggregates
CREATE OR REPLACE FUNCTION trigger_update_course_on_lesson_change()
RETURNS TRIGGER AS $$
DECLARE
    affected_course_id UUID;
BEGIN
    -- Xác định course_id bị ảnh hưởng
    IF TG_OP = 'DELETE' THEN
        SELECT m.course_id INTO affected_course_id
        FROM modules m
        WHERE m.id = OLD.module_id;
    ELSE
        SELECT m.course_id INTO affected_course_id
        FROM modules m
        WHERE m.id = NEW.module_id;
    END IF;
    
    -- Update aggregates của course
    IF affected_course_id IS NOT NULL THEN
        PERFORM update_course_aggregates(affected_course_id);
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Tạo triggers
DROP TRIGGER IF EXISTS trg_lessons_update_course ON lessons;
CREATE TRIGGER trg_lessons_update_course
    AFTER INSERT OR UPDATE OR DELETE ON lessons
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_course_on_lesson_change();

-- ============================================
-- 5. Triggers cho bảng quizzes
-- ============================================

-- Trigger: Khi insert/update/delete quiz → update course aggregates
CREATE OR REPLACE FUNCTION trigger_update_course_on_quiz_change()
RETURNS TRIGGER AS $$
DECLARE
    affected_course_id UUID;
BEGIN
    -- Xác định course_id bị ảnh hưởng
    IF TG_OP = 'DELETE' THEN
        affected_course_id := OLD.course_id;
    ELSE
        affected_course_id := NEW.course_id;
    END IF;
    
    -- Chỉ update nếu quiz có course_id
    IF affected_course_id IS NOT NULL THEN
        PERFORM update_course_aggregates(affected_course_id);
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Tạo triggers
DROP TRIGGER IF EXISTS trg_quizzes_update_course ON quizzes;
CREATE TRIGGER trg_quizzes_update_course
    AFTER INSERT OR UPDATE OR DELETE ON quizzes
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_course_on_quiz_change();

-- ============================================
-- 6. Triggers cho bảng enrollments
-- ============================================

-- Trigger: Khi insert/delete enrollment → update course aggregates
CREATE OR REPLACE FUNCTION trigger_update_course_on_enrollment_change()
RETURNS TRIGGER AS $$
DECLARE
    affected_course_id UUID;
BEGIN
    -- Xác định course_id bị ảnh hưởng
    IF TG_OP = 'DELETE' THEN
        affected_course_id := OLD.course_id;
    ELSE
        affected_course_id := NEW.course_id;
    END IF;
    
    -- Update aggregates của course
    IF affected_course_id IS NOT NULL THEN
        PERFORM update_course_aggregates(affected_course_id);
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Tạo triggers (chỉ khi bảng enrollments tồn tại)
-- Lưu ý: Uncomment khi đã có bảng enrollments
/*
DROP TRIGGER IF EXISTS trg_enrollments_update_course ON enrollments;
CREATE TRIGGER trg_enrollments_update_course
    AFTER INSERT OR DELETE ON enrollments
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_course_on_enrollment_change();
*/

-- ============================================
-- 7. Triggers cho bảng reviews
-- ============================================

-- Trigger: Khi insert/update/delete review → update course aggregates
CREATE OR REPLACE FUNCTION trigger_update_course_on_review_change()
RETURNS TRIGGER AS $$
DECLARE
    affected_course_id UUID;
BEGIN
    -- Xác định course_id bị ảnh hưởng
    IF TG_OP = 'DELETE' THEN
        affected_course_id := OLD.course_id;
    ELSE
        affected_course_id := NEW.course_id;
    END IF;
    
    -- Update aggregates của course
    IF affected_course_id IS NOT NULL THEN
        PERFORM update_course_aggregates(affected_course_id);
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Tạo triggers
DROP TRIGGER IF EXISTS trg_reviews_update_course ON reviews;
CREATE TRIGGER trg_reviews_update_course
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_course_on_review_change();

-- ============================================
-- 8. Function để recalculate tất cả courses (dùng khi migrate data)
-- ============================================

CREATE OR REPLACE FUNCTION recalculate_all_course_aggregates()
RETURNS VOID AS $$
DECLARE
    course_record RECORD;
BEGIN
    FOR course_record IN SELECT id FROM courses LOOP
        PERFORM update_course_aggregates(course_record.id);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 9. Function để tính duration_minutes cho module
-- ============================================

CREATE OR REPLACE FUNCTION calculate_module_duration_minutes(module_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COALESCE(SUM(video_duration), 0)
        FROM lessons
        WHERE module_id = module_uuid
          AND content_type = 'video'
          AND deleted_at IS NULL
    );
END;
$$ LANGUAGE plpgsql;

-- Trigger: Khi insert/update/delete lesson → update module duration
CREATE OR REPLACE FUNCTION trigger_update_module_duration()
RETURNS TRIGGER AS $$
DECLARE
    affected_module_id UUID;
BEGIN
    -- Xác định module_id bị ảnh hưởng
    IF TG_OP = 'DELETE' THEN
        affected_module_id := OLD.module_id;
    ELSE
        affected_module_id := NEW.module_id;
    END IF;
    
    -- Update duration của module
    UPDATE modules
    SET
        duration_minutes = calculate_module_duration_minutes(affected_module_id),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = affected_module_id;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Tạo trigger
DROP TRIGGER IF EXISTS trg_lessons_update_module_duration ON lessons;
CREATE TRIGGER trg_lessons_update_module_duration
    AFTER INSERT OR UPDATE OR DELETE ON lessons
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_module_duration();

-- ============================================
-- 10. Indexes để optimize performance
-- ============================================

-- Đảm bảo có indexes cho các foreign keys
CREATE INDEX IF NOT EXISTS idx_modules_course_id ON modules(course_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON lessons(module_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_quizzes_course_id ON quizzes(course_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_reviews_course_id ON reviews(course_id);

-- ============================================
-- 11. Usage Examples
-- ============================================

-- Example 1: Update aggregates cho một course cụ thể
-- SELECT update_course_aggregates('course-uuid-here');

-- Example 2: Recalculate tất cả courses (sau khi migrate data)
-- SELECT recalculate_all_course_aggregates();

-- Example 3: Test function tính total_lessons
-- SELECT calculate_course_total_lessons('course-uuid-here');

-- ============================================
-- 11. Function để disable/enable tất cả triggers (utility)
-- ============================================

CREATE OR REPLACE FUNCTION disable_all_course_aggregate_triggers()
RETURNS VOID AS $$
BEGIN
    ALTER TABLE modules DISABLE TRIGGER trg_modules_update_course;
    ALTER TABLE lessons DISABLE TRIGGER trg_lessons_update_course;
    ALTER TABLE lessons DISABLE TRIGGER trg_lessons_update_module_duration;
    ALTER TABLE quizzes DISABLE TRIGGER trg_quizzes_update_course;
    ALTER TABLE reviews DISABLE TRIGGER trg_reviews_update_course;
    -- ALTER TABLE enrollments DISABLE TRIGGER trg_enrollments_update_course;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION enable_all_course_aggregate_triggers()
RETURNS VOID AS $$
BEGIN
    ALTER TABLE modules ENABLE TRIGGER trg_modules_update_course;
    ALTER TABLE lessons ENABLE TRIGGER trg_lessons_update_course;
    ALTER TABLE lessons ENABLE TRIGGER trg_lessons_update_module_duration;
    ALTER TABLE quizzes ENABLE TRIGGER trg_quizzes_update_course;
    ALTER TABLE reviews ENABLE TRIGGER trg_reviews_update_course;
    -- ALTER TABLE enrollments ENABLE TRIGGER trg_enrollments_update_course;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 12. Function để check trigger status
-- ============================================

CREATE OR REPLACE FUNCTION check_trigger_status()
RETURNS TABLE(
    table_name TEXT,
    trigger_name TEXT,
    status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.event_object_table::TEXT,
        t.trigger_name::TEXT,
        CASE 
            WHEN t.trigger_name IS NOT NULL THEN 'ENABLED'
            ELSE 'DISABLED'
        END::TEXT
    FROM information_schema.triggers t
    WHERE t.trigger_schema = 'public'
      AND t.trigger_name LIKE 'trg_%'
    ORDER BY t.event_object_table, t.trigger_name;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Notes:
-- ============================================
-- 1. Triggers tự động chạy khi có INSERT/UPDATE/DELETE
-- 2. Performance: Triggers chạy trong transaction, nên có thể chậm nếu có nhiều thay đổi cùng lúc
-- 3. Nếu cần batch update nhiều records, có thể tạm disable triggers:
--    SELECT disable_all_course_aggregate_triggers();
--    -- ... batch operations ...
--    SELECT enable_all_course_aggregate_triggers();
--    SELECT recalculate_all_course_aggregates();
-- 4. Các functions có thể được gọi trực tiếp từ application code nếu cần
-- 5. Error handling: Functions có try-catch để không fail transaction khi có lỗi
-- 6. Check trigger status: SELECT * FROM check_trigger_status();

