-- Sanity checks for simplified LMS schema

-- 1) Offerings must have class_id
SELECT COUNT(*) AS offerings_missing_class
FROM academy_course_offerings
WHERE class_id IS NULL;

-- 2) Offerings class_id must reference existing class (FK should enforce)
-- (If FK not applied, this query will reveal orphan rows)
SELECT o.id AS offering_id, o.code AS offering_code, o.class_id
FROM academy_course_offerings o
LEFT JOIN academy_classes c ON c.id = o.class_id
WHERE o.class_id IS NOT NULL AND c.id IS NULL;

-- 3) LIVE offering should point to LIVE class
SELECT o.id, o.code, o.mode AS offering_mode, c.mode AS class_mode
FROM academy_course_offerings o
JOIN academy_classes c ON c.id = o.class_id
WHERE o.mode <> c.mode;

-- 4) VOD: at most one PUBLISHED class per course_profile_id
SELECT c.course_profile_id, COUNT(*) AS published_vod_classes
FROM academy_classes c
WHERE c.mode = 'VOD' AND c.status = 'PUBLISHED'
GROUP BY c.course_profile_id
HAVING COUNT(*) > 1;

-- 5) LIVE classes must have term_id (business rule; FK optional)
SELECT COUNT(*) AS live_classes_missing_term
FROM academy_classes
WHERE mode = 'LIVE' AND term_id IS NULL;

