-- ACADEMY CORE V2 COMPREHENSIVE SEED (MARCH 12, 2026)
-- Fix: Use proper snake_case column names and respect existing DB enums.

-- 1. Setup Users (Instructors and Learners)
INSERT INTO
    "users" (
        id,
        email,
        display_name,
        role,
        created_at,
        updated_at
    )
VALUES (
        'd1b3e8a4-1a2b-4c5d-8e9f-0a1b2c3d4e5f',
        'instructor1@torii.edu',
        'Sensei Tanaka',
        'INSTRUCTOR',
        NOW(),
        NOW()
    ),
    (
        'a2b3c4d5-e6f1-42a3-b4c5-d6e7f8a9b0c1',
        'learner1@example.com',
        'Nguyen Van A',
        'LEARNER',
        NOW(),
        NOW()
    ),
    (
        'b3c4d5e6-f7a2-43b4-c5d6-e7f8a9b0c1d2',
        'learner2@example.com',
        'Tran Thi B',
        'LEARNER',
        NOW(),
        NOW()
    )
ON CONFLICT (id) DO NOTHING;

-- 2. Course Profiles
INSERT INTO
    "academy_course_profiles" (
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
        'f0000000-0000-0000-0000-000000000001',
        'JLPT-N3-2026',
        'JLPT N3 Mastery',
        'Lộ trình từ N4 lên N3 cấp tốc với đầy đủ 4 kỹ năng.',
        'N3',
        'https://placehold.co/600x400/000/fff?text=N3+Mastery',
        NOW(),
        NOW()
    ),
    (
        'f0000000-0000-0000-0000-000000000002',
        'JLPT-N2-2026',
        'JLPT N2 Advance',
        'Khóa học chuyên sâu dành cho mục tiêu thi đỗ N2 trong 6 tháng.',
        'N2',
        'https://placehold.co/600x400/111/eee?text=N2+Advance',
        NOW(),
        NOW()
    )
ON CONFLICT (id) DO NOTHING;

-- 3. Syllabuses
INSERT INTO
    "academy_syllabuses" (
        id,
        course_profile_id,
        version_label,
        status,
        created_at,
        updated_at
    )
VALUES (
        '11111111-1111-1111-1111-111111111111',
        'f0000000-0000-0000-0000-000000000001',
        'v1.0 Standard',
        'LOCKED',
        NOW(),
        NOW()
    ),
    (
        '11111111-2222-2222-2222-222222222222',
        'f0000000-0000-0000-0000-000000000002',
        'v2.1 Beta',
        'ACTIVE',
        NOW(),
        NOW()
    )
ON CONFLICT (id) DO NOTHING;

-- 4. Modules for N3 Syllabus
INSERT INTO
    "academy_modules" (
        id,
        syllabus_id,
        title,
        order_index,
        created_at,
        updated_at
    )
VALUES (
        '33333333-3333-3333-3333-333333333331',
        '11111111-1111-1111-1111-111111111111',
        'Kanji & Vocabulary',
        1,
        NOW(),
        NOW()
    ),
    (
        '33333333-3333-3333-3333-333333333332',
        '11111111-1111-1111-1111-111111111111',
        'Grammar Patterns',
        2,
        NOW(),
        NOW()
    ),
    (
        '33333333-3333-3333-3333-333333333333',
        '11111111-1111-1111-1111-111111111111',
        'Reading Techniques',
        3,
        NOW(),
        NOW()
    )
ON CONFLICT (id) DO NOTHING;

-- 5. Lessons for N3 Modules
INSERT INTO
    "academy_lessons" (
        id,
        module_id,
        type,
        title,
        order_index,
        video_url,
        created_at,
        updated_at
    )
VALUES (
        '44444444-4444-4444-4444-444444444441',
        '33333333-3333-3333-3333-333333333331',
        'VIDEO',
        'Học Kanji theo bộ thủ (P1)',
        1,
        'https://vimeo.com/test-kanji-1',
        NOW(),
        NOW()
    ),
    (
        '44444444-4444-4444-4444-444444444442',
        '33333333-3333-3333-3333-333333333331',
        'VIDEO',
        'Kanji liên quan đến con người',
        2,
        'https://vimeo.com/test-kanji-2',
        NOW(),
        NOW()
    ),
    (
        '44444444-4444-4444-4444-444444444443',
        '33333333-3333-3333-3333-333333333331',
        'VIDEO',
        'Phân biệt Kanji tương tự',
        3,
        'https://vimeo.com/test-kanji-3',
        NOW(),
        NOW()
    ),
    (
        '44444444-4444-4444-4444-444444444444',
        '33333333-3333-3333-3333-333333333331',
        'READING',
        'Danh sách từ vựng N3 bài 1-5',
        4,
        NULL,
        NOW(),
        NOW()
    ),
    (
        '44444444-4444-4444-4444-444444444445',
        '33333333-3333-3333-3333-333333333331',
        'READING',
        'Bài tập luyện gõ Kanji',
        5,
        NULL,
        NOW(),
        NOW()
    ),
    (
        '44444444-4444-4444-4444-444444444451',
        '33333333-3333-3333-3333-333333333332',
        'VIDEO',
        'Cấu trúc ~ことにしている vs ~ことになっている',
        1,
        'https://vimeo.com/test-gram-1',
        NOW(),
        NOW()
    ),
    (
        '44444444-4444-4444-4444-444444444452',
        '33333333-3333-3333-3333-333333333332',
        'VIDEO',
        'Cấu trúc ~うちに vs ~あいだに',
        2,
        'https://vimeo.com/test-gram-2',
        NOW(),
        NOW()
    ),
    (
        '44444444-4444-4444-4444-444444444453',
        '33333333-3333-3333-3333-333333333332',
        'VIDEO',
        'Thực hành đặt câu với mẫu ~ところだった',
        3,
        'https://vimeo.com/test-gram-3',
        NOW(),
        NOW()
    ),
    (
        '44444444-4444-4444-4444-444444444454',
        '33333333-3333-3333-3333-333333333332',
        'READING',
        'Tổng hợp ngữ pháp N3 Unit 1',
        4,
        NULL,
        NOW(),
        NOW()
    ),
    (
        '44444444-4444-4444-4444-444444444455',
        '33333333-3333-3333-3333-333333333332',
        'READING',
        'Quiz ngữ pháp NHK news',
        5,
        NULL,
        NOW(),
        NOW()
    )
ON CONFLICT (id) DO NOTHING;

-- 6. Modules & Lessons for N2
INSERT INTO
    "academy_modules" (
        id,
        syllabus_id,
        title,
        order_index,
        created_at,
        updated_at
    )
VALUES (
        '55555555-5555-5555-5555-555555555551',
        '11111111-2222-2222-2222-222222222222',
        'N2 Advanced Grammar',
        1,
        NOW(),
        NOW()
    )
ON CONFLICT (id) DO NOTHING;

INSERT INTO
    "academy_lessons" (
        id,
        module_id,
        type,
        title,
        order_index,
        video_url,
        created_at,
        updated_at
    )
VALUES (
        '66666666-6666-6666-6666-666666666661',
        '55555555-5555-5555-5555-555555555551',
        'VIDEO',
        'Mẫu câu ~ものなら vs ~ものの',
        1,
        'https://vimeo.com/n2-gram-1',
        NOW(),
        NOW()
    )
ON CONFLICT (id) DO NOTHING;

-- 7. Classes
INSERT INTO
    "academy_classes" (
        id,
        course_profile_id,
        syllabus_id,
        code,
        name,
        mode,
        status,
        created_at,
        updated_at
    )
VALUES (
        '77777777-7777-7777-7777-777777777701',
        'f0000000-0000-0000-0000-000000000001',
        '11111111-1111-1111-1111-111111111111',
        'N3-VOD-B1',
        'N3 Online Self-Study',
        'VOD',
        'PUBLISHED',
        NOW(),
        NOW()
    )
ON CONFLICT (id) DO NOTHING;

INSERT INTO
    "academy_classes" (
        id,
        course_profile_id,
        syllabus_id,
        instructor_id,
        code,
        name,
        mode,
        status,
        created_at,
        updated_at
    )
VALUES (
        '77777777-7777-7777-7777-777777777702',
        'f0000000-0000-0000-0000-000000000001',
        '11111111-1111-1111-1111-111111111111',
        'd1b3e8a4-1a2b-4c5d-8e9f-0a1b2c3d4e5f',
        'N3-LIVE-SPRING',
        'N3 Intensive Spring 2026',
        'LIVE',
        'OPENING',
        NOW(),
        NOW()
    )
ON CONFLICT (id) DO NOTHING;

-- 8. Offerings
INSERT INTO
    "academy_course_offerings" (
        id,
        code,
        syllabus_id,
        title,
        price,
        sale_price,
        mode,
        status,
        type,
        created_at,
        updated_at
    )
VALUES (
        '88888888-8888-8888-8888-888888888801',
        'OFF-N3-VOD-FULL',
        '11111111-1111-1111-1111-111111111111',
        'Trọn bộ N3 Video Bài giảng',
        1200000,
        990000,
        'VOD',
        'PUBLISHED',
        'COURSE',
        NOW(),
        NOW()
    ),
    (
        '88888888-8888-8888-8888-888888888802',
        'OFF-N3-LIVE-SPRING',
        '11111111-1111-1111-1111-111111111111',
        'N3 Trực tuyến cường độ cao (12 tuần)',
        3500000,
        2800000,
        'LIVE',
        'PUBLISHED',
        'COURSE',
        NOW(),
        NOW()
    )
ON CONFLICT (id) DO NOTHING;

-- 9. Linking Offerings to Classes
INSERT INTO
    "academy_course_offering_classes" (
        offering_id,
        class_id,
        is_primary
    )
VALUES (
        '88888888-8888-8888-8888-888888888801',
        '77777777-7777-7777-7777-777777777701',
        true
    ),
    (
        '88888888-8888-8888-8888-888888888802',
        '77777777-7777-7777-7777-777777777702',
        true
    )
ON CONFLICT DO NOTHING;

-- 14. Extra lessons to make N3 syllabus richer
INSERT INTO
    "academy_lessons" (
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
    -- Thêm 5 bài VIDEO/READING cho module Kanji & Vocabulary
    (
        '44444444-4444-4444-4444-444444444456',
        '33333333-3333-3333-3333-333333333331',
        'VIDEO',
        'Kanji chủ đề Gia đình',
        6,
        'https://vimeo.com/test-kanji-4',
        NOW(),
        NOW()
    ),
    (
        '44444444-4444-4444-4444-444444444457',
        '33333333-3333-3333-3333-333333333331',
        'VIDEO',
        'Kanji chủ đề Công việc',
        7,
        'https://vimeo.com/test-kanji-5',
        NOW(),
        NOW()
    ),
    (
        '44444444-4444-4444-4444-444444444458',
        '33333333-3333-3333-3333-333333333331',
        'READING',
        'Đọc đoạn văn ngắn dùng Kanji N3 (1)',
        8,
        NULL,
        NOW(),
        NOW()
    ),
    (
        '44444444-4444-4444-4444-444444444459',
        '33333333-3333-3333-3333-333333333331',
        'READING',
        'Đọc đoạn văn ngắn dùng Kanji N3 (2)',
        9,
        NULL,
        NOW(),
        NOW()
    ),
    (
        '44444444-4444-4444-4444-444444444460',
        '33333333-3333-3333-3333-333333333331',
        'VIDEO',
        'Mini quiz Kanji N3',
        10,
        'https://vimeo.com/test-kanji-quiz',
        NOW(),
        NOW()
    ),
    -- Thêm 5 bài cho module Grammar Patterns
    (
        '44444444-4444-4444-4444-444444444461',
        '33333333-3333-3333-3333-333333333332',
        'VIDEO',
        'Mẫu câu ～わけではない',
        6,
        'https://vimeo.com/test-gram-4',
        NOW(),
        NOW()
    ),
    (
        '44444444-4444-4444-4444-444444444462',
        '33333333-3333-3333-3333-333333333332',
        'VIDEO',
        'Mẫu câu ～ことから',
        7,
        'https://vimeo.com/test-gram-5',
        NOW(),
        NOW()
    ),
    (
        '44444444-4444-4444-4444-444444444463',
        '33333333-3333-3333-3333-333333333332',
        'READING',
        'Bài đọc áp dụng mẫu ～わけではない',
        8,
        NULL,
        NOW(),
        NOW()
    ),
    (
        '44444444-4444-4444-4444-444444444464',
        '33333333-3333-3333-3333-333333333332',
        'READING',
        'Bài tập điền mẫu câu N3 tổng hợp',
        9,
        NULL,
        NOW(),
        NOW()
    ),
    (
        '44444444-4444-4444-4444-444444444465',
        '33333333-3333-3333-3333-333333333332',
        'VIDEO',
        'Mini quiz Ngữ pháp N3',
        10,
        'https://vimeo.com/test-gram-quiz',
        NOW(),
        NOW()
    )
ON CONFLICT (id) DO NOTHING;

-- 15. Enrollments for real admin/dev account so dashboard luôn có dữ liệu
INSERT INTO
    "academy_enrollments" (
        id,
        user_id,
        class_id,
        offering_id,
        status,
        enrolled_at
    )
VALUES (
        gen_random_uuid (),
        'fcfbe38a-8c9e-432e-8f51-268b7838b119',
        '77777777-7777-7777-7777-777777777701',
        '88888888-8888-8888-8888-888888888801',
        'ACTIVE',
        NOW() - INTERVAL '2 days'
    ),
    (
        gen_random_uuid (),
        'fcfbe38a-8c9e-432e-8f51-268b7838b119',
        '77777777-7777-7777-7777-777777777702',
        '88888888-8888-8888-8888-888888888802',
        'ACTIVE',
        NOW() - INTERVAL '1 days'
    )
ON CONFLICT DO NOTHING;

-- 16. Lesson progress for real admin/dev account (fill dashboard & course detail)
INSERT INTO
    "academy_user_lesson_progress" (
        user_id,
        class_id,
        lesson_id,
        is_completed,
        last_watched_at,
        updated_at
    )
VALUES
    -- VOD class
    (
        'fcfbe38a-8c9e-432e-8f51-268b7838b119',
        '77777777-7777-7777-7777-777777777701',
        '44444444-4444-4444-4444-444444444441',
        true,
        NOW() - INTERVAL '2 days',
        NOW()
    ),
    (
        'fcfbe38a-8c9e-432e-8f51-268b7838b119',
        '77777777-7777-7777-7777-777777777701',
        '44444444-4444-4444-4444-444444444442',
        true,
        NOW() - INTERVAL '1 days',
        NOW()
    ),
    (
        'fcfbe38a-8c9e-432e-8f51-268b7838b119',
        '77777777-7777-7777-7777-777777777701',
        '44444444-4444-4444-4444-444444444443',
        true,
        NOW() - INTERVAL '20 hours',
        NOW()
    ),
    (
        'fcfbe38a-8c9e-432e-8f51-268b7838b119',
        '77777777-7777-7777-7777-777777777701',
        '44444444-4444-4444-4444-444444444444',
        false,
        NOW() - INTERVAL '10 hours',
        NOW()
    ),
    (
        'fcfbe38a-8c9e-432e-8f51-268b7838b119',
        '77777777-7777-7777-7777-777777777701',
        '44444444-4444-4444-4444-444444444445',
        false,
        NOW() - INTERVAL '6 hours',
        NOW()
    ),
    -- Extra lessons in N3 syllabus (Kanji & Grammar)
    (
        'fcfbe38a-8c9e-432e-8f51-268b7838b119',
        '77777777-7777-7777-7777-777777777701',
        '44444444-4444-4444-4444-444444444456',
        false,
        NOW() - INTERVAL '3 hours',
        NOW()
    ),
    (
        'fcfbe38a-8c9e-432e-8f51-268b7838b119',
        '77777777-7777-7777-7777-777777777701',
        '44444444-4444-4444-4444-444444444457',
        false,
        NOW() - INTERVAL '2 hours',
        NOW()
    ),
    (
        'fcfbe38a-8c9e-432e-8f51-268b7838b119',
        '77777777-7777-7777-7777-777777777701',
        '44444444-4444-4444-4444-444444444458',
        false,
        NOW() - INTERVAL '90 minutes',
        NOW()
    ),
    (
        'fcfbe38a-8c9e-432e-8f51-268b7838b119',
        '77777777-7777-7777-7777-777777777701',
        '44444444-4444-4444-4444-444444444459',
        false,
        NOW() - INTERVAL '45 minutes',
        NOW()
    ),
    (
        'fcfbe38a-8c9e-432e-8f51-268b7838b119',
        '77777777-7777-7777-7777-777777777701',
        '44444444-4444-4444-4444-444444444460',
        false,
        NOW() - INTERVAL '20 minutes',
        NOW()
    )
ON CONFLICT DO NOTHING;

-- 10. Enrollments
INSERT INTO
    "academy_enrollments" (
        id,
        user_id,
        class_id,
        offering_id,
        status,
        enrolled_at
    )
VALUES (
        gen_random_uuid (),
        'a2b3c4d5-e6f1-42a3-b4c5-d6e7f8a9b0c1',
        '77777777-7777-7777-7777-777777777701',
        '88888888-8888-8888-8888-888888888801',
        'ACTIVE',
        NOW() - INTERVAL '5 days'
    ),
    (
        gen_random_uuid (),
        'b3c4d5e6-f7a2-43b4-c5d6-e7f8a9b0c1d2',
        '77777777-7777-7777-7777-777777777702',
        '88888888-8888-8888-8888-888888888802',
        'ACTIVE',
        NOW() - INTERVAL '1 day'
    )
ON CONFLICT DO NOTHING;

-- 11. Progress
INSERT INTO
    "academy_user_lesson_progress" (
        user_id,
        class_id,
        lesson_id,
        is_completed,
        last_watched_at,
        updated_at
    )
VALUES (
        'a2b3c4d5-e6f1-42a3-b4c5-d6e7f8a9b0c1',
        '77777777-7777-7777-7777-777777777701',
        '44444444-4444-4444-4444-444444444441',
        true,
        NOW() - INTERVAL '4 days',
        NOW()
    ),
    (
        'a2b3c4d5-e6f1-42a3-b4c5-d6e7f8a9b0c1',
        '77777777-7777-7777-7777-777777777701',
        '44444444-4444-4444-4444-444444444442',
        true,
        NOW() - INTERVAL '3 days',
        NOW()
    ),
    (
        'a2b3c4d5-e6f1-42a3-b4c5-d6e7f8a9b0c1',
        '77777777-7777-7777-7777-777777777701',
        '44444444-4444-4444-4444-444444444443',
        true,
        NOW() - INTERVAL '2 days',
        NOW()
    )
ON CONFLICT DO NOTHING;

-- 12. Assignments
INSERT INTO
    "academy_assignments" (
        id,
        title,
        instructions,
        created_at,
        updated_at
    )
VALUES (
        'aaaaaaaa-1111-1111-1111-111111111111',
        'Bài luận Giới thiệu bản thân',
        'Hãy viết một đoạn văn khoảng 200 chữ giới thiệu về bản thân và lý do học tiếng Nhật.',
        NOW(),
        NOW()
    )
ON CONFLICT (id) DO NOTHING;

INSERT INTO
    "academy_class_assignments" (
        id,
        class_id,
        assignment_id,
        title_override,
        deadline,
        created_at,
        updated_at
    )
VALUES (
        gen_random_uuid (),
        '77777777-7777-7777-7777-777777777702',
        'aaaaaaaa-1111-1111-1111-111111111111',
        'Bài tập tuần 1: Sakubun',
        NOW() + INTERVAL '7 days',
        NOW(),
        NOW()
    )
ON CONFLICT DO NOTHING;

-- 13. Live Schedule
INSERT INTO
    "academy_live_schedules" (
        id,
        class_id,
        weekday,
        start_time,
        end_time,
        location,
        room_id
    )
VALUES (
        gen_random_uuid (),
        '77777777-7777-7777-7777-777777777702',
        2,
        '19:00',
        '21:00',
        'ONLINE',
        'ROOM-ZOOM-01'
    ),
    (
        gen_random_uuid (),
        '77777777-7777-7777-7777-777777777702',
        4,
        '19:00',
        '21:00',
        'ONLINE',
        'ROOM-ZOOM-01'
    )
ON CONFLICT DO NOTHING;