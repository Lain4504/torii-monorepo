-- ================================================================
-- ACADEMY CORE V2 — Comprehensive Seed Data
-- Date reference: 2026-03-11 (current date)
-- Run inside Docker: docker exec -i <postgres_container> psql -U <user> -d <db> < seed_academy_v2.sql
-- ================================================================

BEGIN;

-- ==============================================================
-- 1. USERS
-- admin, instructor, 3 students
-- ==============================================================

INSERT INTO
    users (
        id,
        email,
        display_name,
        password,
        role,
        verified_at,
        created_at,
        updated_at
    )
VALUES (
        '00000000-0001-0000-0000-000000000001',
        'admin@torii.dev',
        'Admin Torii',
        '$2b$10$HASH_PLACEHOLDER_ADMIN',
        'admin',
        NOW(),
        NOW(),
        NOW()
    ),
    (
        '00000000-0001-0000-0000-000000000002',
        'sensei.yamada@torii.dev',
        'Yamada Sensei',
        '$2b$10$HASH_PLACEHOLDER_INST',
        'instructor',
        NOW(),
        NOW(),
        NOW()
    ),
    (
        '00000000-0001-0000-0000-000000000003',
        'student.alice@gmail.com',
        'Alice Nguyen',
        '$2b$10$HASH_PLACEHOLDER_S1',
        'learner',
        NOW(),
        NOW(),
        NOW()
    ),
    (
        '00000000-0001-0000-0000-000000000004',
        'student.bob@gmail.com',
        'Bob Tran',
        '$2b$10$HASH_PLACEHOLDER_S2',
        'learner',
        NOW(),
        NOW(),
        NOW()
    ),
    (
        '00000000-0001-0000-0000-000000000005',
        'student.carol@gmail.com',
        'Carol Le',
        '$2b$10$HASH_PLACEHOLDER_S3',
        'learner',
        NOW(),
        NOW(),
        NOW()
    )
ON CONFLICT (id) DO NOTHING;

-- ==============================================================
-- 2. COURSE PROFILE — N3 Japanese
-- ==============================================================

INSERT INTO
    academy_course_profiles (
        id,
        code,
        title,
        description,
        level,
        thumbnail_url,
        created_at,
        updated_at
    )
VALUES (
        'cp000000-0000-0000-0000-000000000001',
        'JLPT-N3-2026',
        'Tiếng Nhật JLPT N3 — Toàn diện',
        'Khóa học JLPT N3 chuẩn bị đầy đủ Ngữ pháp, Từ vựng và Đọc hiểu. Phù hợp cho người đã hoàn thành N4.',
        'N3',
        'https://cdn.torii.dev/courses/n3-thumbnail.jpg',
        NOW(),
        NOW()
    )
ON CONFLICT (id) DO NOTHING;

-- ==============================================================
-- 3. SYLLABUS — v1.0 (Active)
-- ==============================================================

INSERT INTO
    academy_syllabuses (
        id,
        course_profile_id,
        version_label,
        status,
        created_at,
        updated_at
    )
VALUES (
        'sy000000-0000-0000-0000-000000000001',
        'cp000000-0000-0000-0000-000000000001',
        'v1.0',
        'ACTIVE',
        NOW(),
        NOW()
    )
ON CONFLICT (id) DO NOTHING;

-- ==============================================================
-- 4. MODULES — 2 modules trong Syllabus v1.0
-- ==============================================================

INSERT INTO
    academy_modules (
        id,
        syllabus_id,
        title,
        order_index,
        created_at,
        updated_at
    )
VALUES (
        'mo000000-0000-0000-0000-000000000001',
        'sy000000-0000-0000-0000-000000000001',
        'Chương 1: Ngữ pháp cơ bản N3',
        1,
        NOW(),
        NOW()
    ),
    (
        'mo000000-0000-0000-0000-000000000002',
        'sy000000-0000-0000-0000-000000000001',
        'Chương 2: Từ vựng và Đọc hiểu',
        2,
        NOW(),
        NOW()
    )
ON CONFLICT (id) DO NOTHING;

-- ==============================================================
-- 5. LESSONS — 2 per module (VIDEO + READING each)
-- ==============================================================

INSERT INTO
    academy_lessons (
        id,
        module_id,
        type,
        title,
        order_index,
        video_url,
        created_at,
        updated_at
    )
VALUES
    -- Module 1
    (
        'le000000-0000-0000-0000-000000000001',
        'mo000000-0000-0000-0000-000000000001',
        'VIDEO',
        'Bài 1: て形 (Te-form) và cách dùng',
        1,
        'https://vod.torii.dev/n3/grammar/te-form.mp4',
        NOW(),
        NOW()
    ),
    (
        'le000000-0000-0000-0000-000000000002',
        'mo000000-0000-0000-0000-000000000001',
        'READING',
        'Bài 2: Bài đọc — Ngữ pháp て形 trong văn phong',
        2,
        NULL,
        NOW(),
        NOW()
    ),
    -- Module 2
    (
        'le000000-0000-0000-0000-000000000003',
        'mo000000-0000-0000-0000-000000000002',
        'VIDEO',
        'Bài 3: Từ vựng chủ đề Công việc & Văn phòng',
        1,
        'https://vod.torii.dev/n3/vocab/work-office.mp4',
        NOW(),
        NOW()
    ),
    (
        'le000000-0000-0000-0000-000000000004',
        'mo000000-0000-0000-0000-000000000002',
        'READING',
        'Bài 4: Luyện đọc — Bài báo ngắn N3',
        2,
        NULL,
        NOW(),
        NOW()
    )
ON CONFLICT (id) DO NOTHING;

-- ==============================================================
-- 6. ASSIGNMENTS — Content bank (for LIVE class use)
-- ==============================================================

INSERT INTO
    academy_assignments (
        id,
        title,
        instructions,
        created_at,
        updated_at
    )
VALUES (
        'as000000-0000-0000-0000-000000000001',
        'Sakubun: Viết đoạn văn dùng て形',
        E'Viết một đoạn văn 100~150 chữ mô tả ngày thường của bạn.\n' '- Sử dụng tối thiểu 5 câu có て形\n' '- Dùng ít nhất 2 mẫu câu nối như 「〜てから」, 「〜ている」\n' '- Nộp dưới dạng văn bản hoặc file ảnh viết tay.',
        NOW(),
        NOW()
    ),
    (
        'as000000-0000-0000-0000-000000000002',
        'Kaiwa: Giới thiệu bản thân (N3 Level)',
        E'Chuẩn bị đoạn giới thiệu bản thân theo phong cách phỏng vấn xin việc tại Nhật.\n' '- Thời lượng: 60~90 giây\n' '- Nội dung: tên, quê quán, kinh nghiệm, mục tiêu\n' '- Nộp file âm thanh (mp3/m4a) hoặc video.',
        NOW(),
        NOW()
    )
ON CONFLICT (id) DO NOTHING;

-- ==============================================================
-- 7. CLASSES — 1 LIVE (ONGOING) + 1 VOD (PUBLISHED)
-- ==============================================================

INSERT INTO
    academy_classes (
        id,
        course_profile_id,
        syllabus_id,
        code,
        name,
        mode,
        status,
        instructor_id,
        approved_at,
        approved_by,
        created_at,
        updated_at
    )
VALUES (
        'cl000000-0000-0000-0000-000000000001',
        'cp000000-0000-0000-0000-000000000001',
        'sy000000-0000-0000-0000-000000000001', -- Locks syllabus
        'N3-LIVE-2026-03',
        'JLPT N3 Lớp LIVE — Khai giảng 3/2026',
        'LIVE',
        'ONGOING',
        '00000000-0001-0000-0000-000000000002', -- Yamada Sensei
        '2026-02-15T00:00:00Z',
        '00000000-0001-0000-0000-000000000001',
        NOW(),
        NOW()
    ),
    (
        'cl000000-0000-0000-0000-000000000002',
        'cp000000-0000-0000-0000-000000000001',
        'sy000000-0000-0000-0000-000000000001',
        'N3-VOD-2026',
        'JLPT N3 Khóa Tự học (On-Demand)',
        'VOD',
        'PUBLISHED',
        NULL,
        '2026-02-20T00:00:00Z',
        '00000000-0001-0000-0000-000000000001',
        NOW(),
        NOW()
    )
ON CONFLICT (id) DO NOTHING;

-- Lock the Syllabus because it's attached to ONGOING class
UPDATE academy_syllabuses
SET
    status = 'LOCKED'
WHERE
    id = 'sy000000-0000-0000-0000-000000000001';

-- ==============================================================
-- 8. CLASS ASSIGNMENTS — Chỉ cho lớp LIVE
-- ==============================================================

INSERT INTO
    academy_class_assignments (
        id,
        class_id,
        assignment_id,
        title_override,
        open_at,
        deadline,
        created_at,
        updated_at
    )
VALUES (
        'ca000000-0000-0000-0000-000000000001',
        'cl000000-0000-0000-0000-000000000001',
        'as000000-0000-0000-0000-000000000001',
        NULL, -- Dùng tên gốc
        '2026-03-10T00:00:00Z',
        '2026-03-17T23:59:59Z',
        NOW(),
        NOW()
    ),
    (
        'ca000000-0000-0000-0000-000000000002',
        'cl000000-0000-0000-0000-000000000001',
        'as000000-0000-0000-0000-000000000002',
        'Kaiwa Sprint — Buổi 2',
        '2026-03-12T00:00:00Z',
        '2026-03-20T23:59:59Z',
        NOW(),
        NOW()
    )
ON CONFLICT (id) DO NOTHING;

-- ==============================================================
-- 9. COURSE OFFERINGS — 1 LIVE (OPENING) + 1 VOD (PUBLISHED)
-- ==============================================================

INSERT INTO
    academy_course_offerings (
        id,
        syllabus_id,
        code,
        title,
        description,
        price,
        sale_price,
        currency,
        mode,
        status,
        type,
        approved_at,
        approved_by,
        created_at,
        updated_at
    )
VALUES (
        'co000000-0000-0000-0000-000000000001',
        'sy000000-0000-0000-0000-000000000001',
        'OFFER-N3-LIVE-2026-03',
        'JLPT N3 Lớp Thứ 2-4-6 (Tháng 3/2026)',
        'Lớp học LIVE trực tiếp với giáo viên người Nhật. Học 3 buổi/tuần, kéo dài 3 tháng.',
        4500000, -- 4.5M VND
        3990000, -- Sale price
        'VND',
        'LIVE',
        'OPENING',
        'COURSE',
        '2026-02-15T00:00:00Z',
        '00000000-0001-0000-0000-000000000001',
        NOW(),
        NOW()
    ),
    (
        'co000000-0000-0000-0000-000000000002',
        'sy000000-0000-0000-0000-000000000001',
        'OFFER-N3-VOD-2026',
        'JLPT N3 Tự học Trọn đời',
        'Học online theo lịch riêng, truy cập vĩnh viễn. Bao gồm 4 bài học VIDEO + READING.',
        1200000,
        NULL,
        'VND',
        'VOD',
        'PUBLISHED',
        'COURSE',
        '2026-02-20T00:00:00Z',
        '00000000-0001-0000-0000-000000000001',
        NOW(),
        NOW()
    )
ON CONFLICT (id) DO NOTHING;

-- Link offerings to classes
INSERT INTO
    academy_course_offering_classes (
        offering_id,
        class_id,
        is_primary
    )
VALUES (
        'co000000-0000-0000-0000-000000000001',
        'cl000000-0000-0000-0000-000000000001',
        true
    ),
    (
        'co000000-0000-0000-0000-000000000002',
        'cl000000-0000-0000-0000-000000000002',
        true
    )
ON CONFLICT DO NOTHING;

-- ==============================================================
-- 10. ENROLLMENTS
-- Alice & Bob → LIVE class (classId set)
-- Carol → VOD (classId nullable — access via syllabus)
-- All enrolled via offerings
-- ==============================================================

INSERT INTO
    academy_enrollments (
        id,
        user_id,
        offering_id,
        class_id,
        enrolled_at,
        status,
        created_at,
        updated_at
    )
VALUES
    -- Alice — LIVE
    (
        'en000000-0000-0000-0000-000000000001',
        '00000000-0001-0000-0000-000000000003',
        'co000000-0000-0000-0000-000000000001',
        'cl000000-0000-0000-0000-000000000001',
        '2026-03-01T08:00:00Z',
        'ACTIVE',
        NOW(),
        NOW()
    ),
    -- Bob — LIVE
    (
        'en000000-0000-0000-0000-000000000002',
        '00000000-0001-0000-0000-000000000004',
        'co000000-0000-0000-0000-000000000001',
        'cl000000-0000-0000-0000-000000000001',
        '2026-03-02T10:00:00Z',
        'ACTIVE',
        NOW(),
        NOW()
    ),
    -- Carol — VOD (classId = NULL → access via syllabus)
    (
        'en000000-0000-0000-0000-000000000003',
        '00000000-0001-0000-0000-000000000005',
        'co000000-0000-0000-0000-000000000002',
        'cl000000-0000-0000-0000-000000000002',
        '2026-03-05T14:00:00Z',
        'ACTIVE',
        NOW(),
        NOW()
    )
ON CONFLICT (id) DO NOTHING;

-- ==============================================================
-- 11. USER LESSON PROGRESS
-- ==============================================================

INSERT INTO
    academy_user_lesson_progress (
        user_id,
        class_id,
        lesson_id,
        is_completed,
        last_watched_at,
        updated_at
    )
VALUES
    -- Alice (LIVE) — completed 3/4 lessons
    (
        '00000000-0001-0000-0000-000000000003',
        'cl000000-0000-0000-0000-000000000001',
        'le000000-0000-0000-0000-000000000001',
        true,
        '2026-03-04T10:00:00Z',
        NOW()
    ),
    (
        '00000000-0001-0000-0000-000000000003',
        'cl000000-0000-0000-0000-000000000001',
        'le000000-0000-0000-0000-000000000002',
        true,
        '2026-03-06T11:00:00Z',
        NOW()
    ),
    (
        '00000000-0001-0000-0000-000000000003',
        'cl000000-0000-0000-0000-000000000001',
        'le000000-0000-0000-0000-000000000003',
        true,
        '2026-03-09T09:30:00Z',
        NOW()
    ),
    (
        '00000000-0001-0000-0000-000000000003',
        'cl000000-0000-0000-0000-000000000001',
        'le000000-0000-0000-0000-000000000004',
        false,
        '2026-03-10T14:00:00Z',
        NOW()
    ),
    -- Bob (LIVE) — completed 2/4 lessons
    (
        '00000000-0001-0000-0000-000000000004',
        'cl000000-0000-0000-0000-000000000001',
        'le000000-0000-0000-0000-000000000001',
        true,
        '2026-03-05T09:00:00Z',
        NOW()
    ),
    (
        '00000000-0001-0000-0000-000000000004',
        'cl000000-0000-0000-0000-000000000001',
        'le000000-0000-0000-0000-000000000002',
        false,
        '2026-03-07T10:00:00Z',
        NOW()
    ),
    -- Carol (VOD) — completed 2/4 lessons
    (
        '00000000-0001-0000-0000-000000000005',
        'cl000000-0000-0000-0000-000000000002',
        'le000000-0000-0000-0000-000000000001',
        true,
        '2026-03-06T20:00:00Z',
        NOW()
    ),
    (
        '00000000-0001-0000-0000-000000000005',
        'cl000000-0000-0000-0000-000000000002',
        'le000000-0000-0000-0000-000000000002',
        true,
        '2026-03-08T21:00:00Z',
        NOW()
    )
ON CONFLICT (user_id, class_id, lesson_id) DO NOTHING;

-- ==============================================================
-- 12. ASSIGNMENT SUBMISSIONS (Single Submission Policy)
-- ==============================================================

INSERT INTO
    academy_assignment_submissions (
        id,
        class_assignment_id,
        user_id,
        status,
        content,
        file_urls,
        submitted_at,
        created_at,
        updated_at
    )
VALUES
    -- Assignment 1 (Sakubun): Alice SUBMITTED
    (
        gen_random_uuid (),
        'ca000000-0000-0000-0000-000000000001',
        '00000000-0001-0000-0000-000000000003',
        'SUBMITTED',
        E'毎日、朝６時に起きてから、シャワーを浴びます。それから、朝ごはんを食べてから、学校へ行きます。\n' '授業が終わってから、図書館で勉強しています。夜は家族と話してから、寝ます。',
        '{}',
        '2026-03-11T08:30:00Z',
        NOW(),
        NOW()
    ),
    -- Assignment 1 (Sakubun): Bob SUBMITTED
    (
        gen_random_uuid (),
        'ca000000-0000-0000-0000-000000000001',
        '00000000-0001-0000-0000-000000000004',
        'SUBMITTED',
        '毎朝、コーヒーを飲んでから仕事を始めます。仕事が終わってから、ジムで運動しています。',
        '{}',
        '2026-03-11T09:15:00Z',
        NOW(),
        NOW()
    ),
    -- Assignment 2 (Kaiwa): Alice GRADED
    (
        gen_random_uuid (),
        'ca000000-0000-0000-0000-000000000002',
        '00000000-0001-0000-0000-000000000003',
        'GRADED',
        '',
        '{"https://cdn.torii.dev/submissions/alice-kaiwa-march.m4a"}',
        '2026-03-11T10:00:00Z',
        NOW(),
        NOW()
    )
ON CONFLICT DO NOTHING;

-- ==============================================================
-- 13. LIVE SCHEDULE — Lớp LIVE (Thứ 2, 4, 6 — 19:00–20:30)
-- ==============================================================

INSERT INTO
    academy_live_schedules (
        id,
        class_id,
        weekday,
        start_time,
        end_time,
        location,
        note,
        room_id
    )
VALUES (
        'ls000000-0000-0000-0000-000000000001',
        'cl000000-0000-0000-0000-000000000001',
        1, -- Thứ Hai
        '19:00',
        '20:30',
        'Online — Google Meet',
        'Session định kỳ Thứ Hai',
        'room-n3-live-001'
    ),
    (
        'ls000000-0000-0000-0000-000000000002',
        'cl000000-0000-0000-0000-000000000001',
        3, -- Thứ Tư
        '19:00',
        '20:30',
        'Online — Google Meet',
        'Session định kỳ Thứ Tư',
        'room-n3-live-002'
    ),
    (
        'ls000000-0000-0000-0000-000000000003',
        'cl000000-0000-0000-0000-000000000001',
        5, -- Thứ Sáu
        '19:00',
        '20:30',
        'Online — Google Meet',
        'Session định kỳ Thứ Sáu',
        'room-n3-live-003'
    )
ON CONFLICT (id) DO NOTHING;

-- ==============================================================
-- 14. LIVE SCHEDULE SESSIONS — Week of 2026-03-09 to 2026-03-20
-- ==============================================================

INSERT INTO
    academy_live_schedule_sessions (
        id,
        class_id,
        schedule_id,
        session_date,
        start_time,
        end_time,
        status,
        room_id,
        location,
        instructor_id,
        created_at,
        updated_at
    )
VALUES
    -- Week 1
    (
        'lss00000-0000-0000-0000-000000000001',
        'cl000000-0000-0000-0000-000000000001',
        'ls000000-0000-0000-0000-000000000001',
        '2026-03-09',
        '19:00',
        '20:30',
        'COMPLETED',
        'room-n3-live-001',
        'Online',
        '00000000-0001-0000-0000-000000000002',
        NOW(),
        NOW()
    ),
    (
        'lss00000-0000-0000-0000-000000000002',
        'cl000000-0000-0000-0000-000000000001',
        'ls000000-0000-0000-0000-000000000002',
        '2026-03-11',
        '19:00',
        '20:30',
        'SCHEDULED',
        'room-n3-live-002',
        'Online',
        '00000000-0001-0000-0000-000000000002',
        NOW(),
        NOW()
    ),
    (
        'lss00000-0000-0000-0000-000000000003',
        'cl000000-0000-0000-0000-000000000001',
        'ls000000-0000-0000-0000-000000000003',
        '2026-03-13',
        '19:00',
        '20:30',
        'SCHEDULED',
        'room-n3-live-003',
        'Online',
        '00000000-0001-0000-0000-000000000002',
        NOW(),
        NOW()
    ),
    -- Week 2
    (
        'lss00000-0000-0000-0000-000000000004',
        'cl000000-0000-0000-0000-000000000001',
        'ls000000-0000-0000-0000-000000000001',
        '2026-03-16',
        '19:00',
        '20:30',
        'SCHEDULED',
        'room-n3-live-001',
        'Online',
        '00000000-0001-0000-0000-000000000002',
        NOW(),
        NOW()
    ),
    (
        'lss00000-0000-0000-0000-000000000005',
        'cl000000-0000-0000-0000-000000000001',
        'ls000000-0000-0000-0000-000000000002',
        '2026-03-18',
        '19:00',
        '20:30',
        'SCHEDULED',
        'room-n3-live-002',
        'Online',
        '00000000-0001-0000-0000-000000000002',
        NOW(),
        NOW()
    ),
    (
        'lss00000-0000-0000-0000-000000000006',
        'cl000000-0000-0000-0000-000000000001',
        'ls000000-0000-0000-0000-000000000003',
        '2026-03-20',
        '19:00',
        '20:30',
        'SCHEDULED',
        'room-n3-live-003',
        'Online',
        '00000000-0001-0000-0000-000000000002',
        NOW(),
        NOW()
    )
ON CONFLICT (
    class_id,
    session_date,
    start_time,
    end_time
) DO NOTHING;

-- ==============================================================
-- 15. CLASS ATTENDANCE — Session 1 (09/03 — COMPLETED)
-- ==============================================================

INSERT INTO
    academy_class_attendances (
        id,
        session_id,
        user_id,
        status,
        recorded_at
    )
VALUES (
        gen_random_uuid (),
        'lss00000-0000-0000-0000-000000000001',
        '00000000-0001-0000-0000-000000000003',
        'PRESENT',
        '2026-03-09T20:35:00Z'
    ),
    (
        gen_random_uuid (),
        'lss00000-0000-0000-0000-000000000001',
        '00000000-0001-0000-0000-000000000004',
        'LATE',
        '2026-03-09T19:20:00Z'
    ),
    (
        gen_random_uuid (),
        'lss00000-0000-0000-0000-000000000001',
        '00000000-0001-0000-0000-000000000005',
        'ABSENT',
        '2026-03-09T20:35:00Z'
    )
ON CONFLICT DO NOTHING;

-- ==============================================================
-- 16. CLASS REVIEWS — 1 review từ Carol (VOD)
-- ==============================================================

INSERT INTO
    academy_class_reviews (
        id,
        class_id,
        enrollment_id,
        user_id,
        rating,
        title,
        content,
        status,
        is_anonymous,
        published_at,
        created_at,
        updated_at
    )
VALUES (
        gen_random_uuid (),
        'cl000000-0000-0000-0000-000000000002',
        'en000000-0000-0000-0000-000000000003',
        '00000000-0001-0000-0000-000000000005',
        5,
        'Rất hài lòng với khóa học!',
        'Nội dung rõ ràng, dễ hiểu. Video chất lượng cao. Bài đọc có giải thích từ vựng chi tiết. Mình tự học được quả.',
        'PUBLISHED',
        false,
        '2026-03-10T08:00:00Z',
        NOW(),
        NOW()
    )
ON CONFLICT DO NOTHING;

COMMIT;

-- ================================================================
-- QUICK VERIFICATION QUERIES (optional, comment out if not needed)
-- ================================================================
-- SELECT COUNT(*) AS profiles FROM academy_course_profiles;       -- 1
-- SELECT COUNT(*) AS syllabuses FROM academy_syllabuses;          -- 1
-- SELECT COUNT(*) AS modules FROM academy_modules;                -- 2
-- SELECT COUNT(*) AS lessons FROM academy_lessons;                -- 4
-- SELECT COUNT(*) AS assignments FROM academy_assignments;        -- 2
-- SELECT COUNT(*) AS classes FROM academy_classes;                -- 2
-- SELECT COUNT(*) AS class_assignments FROM academy_class_assignments; -- 2
-- SELECT COUNT(*) AS offerings FROM academy_course_offerings;     -- 2
-- SELECT COUNT(*) AS enrollments FROM academy_enrollments;        -- 3
-- SELECT COUNT(*) AS progress FROM academy_user_lesson_progress;  -- 8
-- SELECT COUNT(*) AS submissions FROM academy_assignment_submissions; -- 3
-- SELECT COUNT(*) AS schedules FROM academy_live_schedules;       -- 3
-- SELECT COUNT(*) AS sessions FROM academy_live_schedule_sessions; -- 6
-- SELECT COUNT(*) AS attendances FROM academy_class_attendances;  -- 3
-- SELECT COUNT(*) AS reviews FROM academy_class_reviews;          -- 1