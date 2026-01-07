# Database Design - User Stories & Business Flows

## User Story Flows

### 1. Learner User Stories

#### 1.1. Browse and Purchase Course

**Flow:**
```
1. Learner browses courses (courses table)
   - Filter by JLPT level (N5-N1)
   - Search by title, tags
   - View course details: modules, lessons, instructors, price

2. Learner adds course to wishlist (wishlist table)
   - INSERT INTO wishlist (user_id, course_id)

3. Learner purchases course
   a. Apply coupon (if any)
      - Check coupons table: code, valid_from, valid_until, usage_limit
      - Calculate discount
   
   b. Create payment (payments table)
      - INSERT INTO payments (user_id, amount, payment_method, status='pending')
      - Process payment via gateway
      - UPDATE payments SET status='completed', completed_at=NOW()
   
   c. Create enrollment (enrollments table)
      - INSERT INTO enrollments (user_id, course_id, payment_id, final_price)
      - UPDATE courses SET total_students = total_students + 1
   
   d. Gift course (if is_gift=true)
      - INSERT INTO enrollments (user_id, course_id, is_gift=true, sender_id)
      - Send notification to recipient
```

**Database Operations:**
- `SELECT * FROM courses WHERE jlpt_level = ? AND status = 'published'`
- `INSERT INTO wishlist (user_id, course_id)`
- `INSERT INTO payments (...)`
- `INSERT INTO enrollments (...)`
- `UPDATE courses SET total_students = ...`

---

#### 1.2. Access Video-Based Course

**Flow:**
```
1. Learner views enrolled courses
   - SELECT * FROM enrollments WHERE user_id = ? AND completion_status != 'dropped'

2. Learner accesses course modules
   - SELECT * FROM modules WHERE course_id = ? ORDER BY order_index

3. Learner watches lesson
   - SELECT * FROM lessons WHERE module_id = ? ORDER BY order_index
   - Track progress: INSERT/UPDATE lesson_progress
      - status: 'not_started' → 'in_progress' → 'completed'
      - watched_duration increments
      - last_watched_at updates
   
4. Update enrollment progress
   - Calculate completion_percentage from lesson_progress
   - UPDATE enrollments SET completion_percentage = ?, last_accessed_at = NOW()
```

**Database Operations:**
- `SELECT * FROM enrollments WHERE user_id = ?`
- `SELECT * FROM modules WHERE course_id = ?`
- `SELECT * FROM lessons WHERE module_id = ?`
- `INSERT/UPDATE lesson_progress (...)`
- `UPDATE enrollments SET completion_percentage = ...`

---

#### 1.3. Register and Join Live Class

**Flow:**
```
1. Learner views live class schedule
   - SELECT * FROM live_classes 
     WHERE status = 'scheduled' 
     AND start_time > NOW()
     ORDER BY start_time

2. Learner enrolls in live class
   - Check availability: current_students < max_students
   - INSERT INTO live_class_enrollments (live_class_id, user_id)
   - UPDATE live_classes SET current_students = current_students + 1
   - Send notification: "You've enrolled in [Class Title]"

3. Before class starts (reminder)
   - SELECT * FROM live_class_enrollments 
     WHERE user_id = ? 
     AND live_class_id IN (
       SELECT id FROM live_classes 
       WHERE start_time BETWEEN NOW() AND NOW() + INTERVAL '1 hour'
     )
   - Send notification: "Live class starts in 1 hour"

4. Learner joins live class (WebRTC)
   - Get meeting_id from live_classes.meeting_id
   - Connect to LiveKit room (room_info table)
   - UPDATE live_class_enrollments SET joined_at = NOW(), attendance_status = 'attended'
   - UPDATE room_info SET joined_participants = joined_participants + 1, is_running = 1

5. During class
   - Track participation: UPDATE live_class_enrollments SET total_duration = ...
   - Upload files: INSERT INTO room_files (...)

6. After class ends
   - UPDATE live_class_enrollments SET left_at = NOW()
   - UPDATE room_info SET is_running = 0, ended = NOW()
   - Calculate participation_score
```

**Database Operations:**
- `SELECT * FROM live_classes WHERE status = 'scheduled'`
- `INSERT INTO live_class_enrollments (...)`
- `UPDATE live_classes SET current_students = ...`
- `SELECT * FROM room_info WHERE room_id = ?`
- `INSERT INTO room_files (...)`

---

#### 1.4. Access Shared Class Materials

**Flow:**
```
1. Learner views enrolled live classes
   - SELECT * FROM live_class_enrollments WHERE user_id = ?

2. Learner accesses class materials
   - SELECT * FROM class_materials 
     WHERE live_class_id IN (
       SELECT live_class_id FROM live_class_enrollments WHERE user_id = ?
     )
   
3. Download material
   - UPDATE class_materials SET download_count = download_count + 1
```

**Database Operations:**
- `SELECT * FROM live_class_enrollments WHERE user_id = ?`
- `SELECT * FROM class_materials WHERE live_class_id = ?`
- `UPDATE class_materials SET download_count = ...`

---

#### 1.5. Create and Study Flashcards

**Flow:**
```
1. Learner creates flashcard deck
   - INSERT INTO flashcard_decks (user_id, name, jlpt_level)

2. Learner adds flashcards
   - INSERT INTO flashcards (deck_id, front_text, back_text, ...)
   - UPDATE flashcard_decks SET card_count = card_count + 1

3. Learner studies flashcards (SRS algorithm)
   - SELECT * FROM flashcards 
     WHERE deck_id = ? 
     AND (next_review_date IS NULL OR next_review_date <= CURRENT_DATE)
     ORDER BY next_review_date ASC
   
4. Learner reviews flashcard
   - INSERT INTO flashcard_reviews (user_id, flashcard_id, rating)
   - Update SRS algorithm:
     - Calculate new interval_days based on rating
     - Calculate new ease_factor
     - Calculate next_review_date = CURRENT_DATE + interval_days
     - UPDATE flashcards SET next_review_date = ?, interval_days = ?, ease_factor = ?, review_count = review_count + 1
     - If rating >= 3: UPDATE flashcards SET correct_count = correct_count + 1
   
5. Update deck statistics
   - UPDATE flashcard_decks SET studied_count = (
     SELECT COUNT(*) FROM flashcards WHERE deck_id = ? AND review_count > 0
   )
```

**Database Operations:**
- `INSERT INTO flashcard_decks (...)`
- `INSERT INTO flashcards (...)`
- `SELECT * FROM flashcards WHERE next_review_date <= CURRENT_DATE`
- `INSERT INTO flashcard_reviews (...)`
- `UPDATE flashcards SET next_review_date = ..., ease_factor = ...`

---

#### 1.6. Take Practice Tests and JLPT Exams

**Flow:**
```
1. Learner browses available quizzes
   - SELECT * FROM quizzes 
     WHERE status = 'published' 
     AND (quiz_type = 'practice' OR quiz_type = 'jlpt_mock')
     AND (jlpt_level = ? OR jlpt_level IS NULL)

2. Learner starts quiz attempt
   - Check max_attempts: SELECT COUNT(*) FROM quiz_attempts WHERE quiz_id = ? AND user_id = ?
   - INSERT INTO quiz_attempts (quiz_id, user_id, status='in-progress', started_at=NOW())
   - Load questions: SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY order_index

3. Learner answers questions
   - UPDATE quiz_attempts SET answers = jsonb_set(answers, '{questionId}', '"answer"')
   - Track time: UPDATE quiz_attempts SET time_remaining = time_remaining - 1

4. Learner submits quiz
   - Calculate score:
     - For each question: SELECT * FROM question_bank WHERE id = ?
     - Compare user_answer with correct_answer
     - Calculate points_earned
     - INSERT INTO quiz_attempt_details (attempt_id, question_id, user_answer, is_correct, points_earned)
   
   - Calculate total score:
     - SELECT SUM(points_earned) FROM quiz_attempt_details WHERE attempt_id = ?
     - UPDATE quiz_attempts SET 
         score = ?, 
         max_score = (SELECT SUM(points) FROM quiz_questions WHERE quiz_id = ?),
         percentage = (score / max_score) * 100,
         is_passed = (percentage >= passing_score),
         status = 'completed',
         completed_at = NOW(),
         time_taken_seconds = EXTRACT(EPOCH FROM (NOW() - started_at))

5. Learner views results
   - SELECT * FROM quiz_attempts WHERE id = ?
   - SELECT * FROM quiz_attempt_details WHERE attempt_id = ?
```

**Database Operations:**
- `SELECT * FROM quizzes WHERE status = 'published'`
- `INSERT INTO quiz_attempts (...)`
- `SELECT * FROM quiz_questions WHERE quiz_id = ?`
- `UPDATE quiz_attempts SET answers = ...`
- `INSERT INTO quiz_attempt_details (...)`
- `UPDATE quiz_attempts SET score = ..., status = 'completed'`

---

#### 1.7. View Test History and Performance

**Flow:**
```
1. Learner views test history
   - SELECT * FROM quiz_attempts 
     WHERE user_id = ? 
     ORDER BY started_at DESC

2. Learner views detailed results
   - SELECT * FROM quiz_attempt_details 
     WHERE attempt_id = ?
   - JOIN question_bank to get question details and explanations

3. Learner views performance analytics
   - Calculate average score: SELECT AVG(percentage) FROM quiz_attempts WHERE user_id = ?
   - Calculate pass rate: SELECT COUNT(*) FILTER (WHERE is_passed = true) / COUNT(*) FROM quiz_attempts WHERE user_id = ?
   - Group by JLPT level: SELECT jlpt_level, AVG(percentage) FROM quiz_attempts JOIN quizzes ON ...
```

**Database Operations:**
- `SELECT * FROM quiz_attempts WHERE user_id = ?`
- `SELECT * FROM quiz_attempt_details WHERE attempt_id = ?`
- `SELECT AVG(percentage) FROM quiz_attempts WHERE user_id = ?`

---

#### 1.8. Track Payment History

**Flow:**
```
1. Learner views payment history
   - SELECT * FROM payments 
     WHERE user_id = ? 
     ORDER BY created_at DESC

2. Learner views course purchase records
   - SELECT e.*, c.title, c.thumbnail_url 
     FROM enrollments e
     JOIN courses c ON e.course_id = c.id
     WHERE e.user_id = ?
```

**Database Operations:**
- `SELECT * FROM payments WHERE user_id = ?`
- `SELECT * FROM enrollments WHERE user_id = ? JOIN courses`

---

### 2. Lecturer User Stories

#### 2.1. View Assigned Live Classes

**Flow:**
```
1. Lecturer views assigned classes
   - SELECT * FROM live_classes 
     WHERE lecturer_id = ? 
     ORDER BY start_time

2. Lecturer views class details
   - SELECT * FROM live_class_enrollments 
     WHERE live_class_id = ?
   - Count enrolled students: SELECT COUNT(*) FROM live_class_enrollments WHERE live_class_id = ?
```

**Database Operations:**
- `SELECT * FROM live_classes WHERE lecturer_id = ?`
- `SELECT * FROM live_class_enrollments WHERE live_class_id = ?`

---

#### 2.2. Manage Live Sessions

**Flow:**
```
1. Lecturer starts live session
   - UPDATE live_classes SET status = 'live'
   - Create/update room_info: INSERT/UPDATE room_info SET is_running = 1

2. Lecturer ends live session
   - UPDATE live_classes SET status = 'ended'
   - UPDATE room_info SET is_running = 0, ended = NOW()
   - If recording: UPDATE live_classes SET recording_url = ?
```

**Database Operations:**
- `UPDATE live_classes SET status = 'live'`
- `UPDATE room_info SET is_running = 1`

---

#### 2.3. Manage Class Members and Attendance

**Flow:**
```
1. Lecturer views enrolled students
   - SELECT u.*, lce.* 
     FROM live_class_enrollments lce
     JOIN users u ON lce.user_id = u.id
     WHERE lce.live_class_id = ?

2. Lecturer checks attendance
   - SELECT * FROM live_class_enrollments 
     WHERE live_class_id = ? 
     AND attendance_status IN ('attended', 'late')
   
3. Lecturer updates attendance
   - UPDATE live_class_enrollments 
     SET attendance_status = 'absent' 
     WHERE live_class_id = ? AND user_id = ?
```

**Database Operations:**
- `SELECT * FROM live_class_enrollments WHERE live_class_id = ?`
- `UPDATE live_class_enrollments SET attendance_status = ...`

---

#### 2.4. Assign and Review Assignments

**Flow:**
```
1. Lecturer creates assignment
   - INSERT INTO assignments (live_class_id, title, description, due_date, max_score, created_by)

2. Lecturer views submissions
   - SELECT * FROM submissions 
     WHERE assignment_id = ? 
     ORDER BY submitted_at DESC

3. Lecturer grades submission
   - UPDATE submissions 
     SET score = ?, 
         feedback = ?, 
         status = 'graded',
         graded_by = ?,
         graded_at = NOW()
```

**Database Operations:**
- `INSERT INTO assignments (...)`
- `SELECT * FROM submissions WHERE assignment_id = ?`
- `UPDATE submissions SET score = ..., status = 'graded'`

---

#### 2.5. Upload Teaching Materials

**Flow:**
```
1. Lecturer uploads material
   - Upload file → file_assets table
   - INSERT INTO class_materials (live_class_id, title, file_url, uploaded_by)

2. Lecturer views uploaded materials
   - SELECT * FROM class_materials 
     WHERE live_class_id = ? 
     ORDER BY uploaded_at DESC
```

**Database Operations:**
- `INSERT INTO file_assets (...)`
- `INSERT INTO class_materials (...)`
- `SELECT * FROM class_materials WHERE live_class_id = ?`

---

### 3. Staff User Stories

#### 3.1. Manage Courses

**Flow:**
```
1. Staff creates course
   - INSERT INTO courses (title, slug, description, jlpt_level, price, created_by, status='draft')

2. Staff creates modules
   - INSERT INTO modules (course_id, title, order_index, created_by)

3. Staff creates lessons
   - INSERT INTO lessons (module_id, title, content_type, video_url, order_index, created_by)

4. Staff publishes course
   - UPDATE courses SET status = 'published', approved_by = ?, approved_at = NOW()
```

**Database Operations:**
- `INSERT INTO courses (...)`
- `INSERT INTO modules (...)`
- `INSERT INTO lessons (...)`
- `UPDATE courses SET status = 'published'`

---

#### 3.2. Manage Question Banks

**Flow:**
```
1. Staff creates question
   - INSERT INTO question_bank (question_text, question_type, jlpt_level, options, correct_answer, explanation, created_by)

2. Staff views questions
   - SELECT * FROM question_bank 
     WHERE created_by = ? 
     ORDER BY created_at DESC

3. Staff updates question
   - UPDATE question_bank SET question_text = ?, options = ?, correct_answer = ? WHERE id = ?
```

**Database Operations:**
- `INSERT INTO question_bank (...)`
- `SELECT * FROM question_bank WHERE created_by = ?`
- `UPDATE question_bank SET ...`

---

#### 3.3. Manage Tests and Exams

**Flow:**
```
1. Staff creates quiz
   - INSERT INTO quizzes (title, quiz_type, jlpt_level, time_limit_minutes, passing_score, created_by)

2. Staff adds questions to quiz
   - INSERT INTO quiz_questions (quiz_id, question_id, order_index, points)

3. Staff publishes quiz
   - UPDATE quizzes SET status = 'published'
```

**Database Operations:**
- `INSERT INTO quizzes (...)`
- `INSERT INTO quiz_questions (...)`
- `UPDATE quizzes SET status = 'published'`

---

#### 3.4. Manage Coupons and Promotions

**Flow:**
```
1. Staff creates coupon
   - INSERT INTO coupons (code, name, discount_type, discount_value, valid_from, valid_until, usage_limit, created_by)

2. Staff views coupon usage
   - SELECT c.*, COUNT(p.id) as used_count 
     FROM coupons c
     LEFT JOIN payments p ON p.coupon_id = c.id
     WHERE c.id = ?
     GROUP BY c.id

3. Staff deactivates coupon
   - UPDATE coupons SET status = 'inactive'
```

**Database Operations:**
- `INSERT INTO coupons (...)`
- `SELECT * FROM coupons WHERE id = ?`
- `UPDATE coupons SET status = 'inactive'`

---

#### 3.5. Monitor Live Sessions

**Flow:**
```
1. Staff views active sessions
   - SELECT * FROM room_info 
     WHERE is_running = 1

2. Staff views session details
   - SELECT * FROM live_classes 
     WHERE id = ?
   - SELECT * FROM live_class_enrollments 
     WHERE live_class_id = ?
```

**Database Operations:**
- `SELECT * FROM room_info WHERE is_running = 1`
- `SELECT * FROM live_classes WHERE id = ?`

---

### 4. Admin User Stories

#### 4.1. Manage Dashboard Statistics

**Flow:**
```
1. Admin views system stats
   - Total users: SELECT COUNT(*) FROM users WHERE deleted_at IS NULL
   - Total courses: SELECT COUNT(*) FROM courses WHERE status = 'published'
   - Total revenue: SELECT SUM(amount) FROM payments WHERE status = 'completed'
   - Total enrollments: SELECT COUNT(*) FROM enrollments
   - Active live classes: SELECT COUNT(*) FROM live_classes WHERE status = 'live'
```

**Database Operations:**
- `SELECT COUNT(*) FROM users`
- `SELECT SUM(amount) FROM payments WHERE status = 'completed'`
- `SELECT COUNT(*) FROM enrollments`

---

#### 4.2. Manage User Accounts

**Flow:**
```
1. Admin views users
   - SELECT * FROM users WHERE role = ? ORDER BY created_at DESC

2. Admin activates/deactivates user
   - Activate: UPDATE users SET verified_at = NOW() WHERE id = ?
   - Deactivate: UPDATE users SET banned_until = NOW() + INTERVAL '30 days' WHERE id = ?
   - Delete: UPDATE users SET deleted_at = NOW() WHERE id = ?
```

**Database Operations:**
- `SELECT * FROM users WHERE role = ?`
- `UPDATE users SET verified_at = NOW()`
- `UPDATE users SET banned_until = ...`

---

#### 4.3. Manage Payments

**Flow:**
```
1. Admin views payments
   - SELECT * FROM payments 
     ORDER BY created_at DESC

2. Admin verifies payment
   - UPDATE payments SET status = 'completed' WHERE id = ?
```

**Database Operations:**
- `SELECT * FROM payments ORDER BY created_at DESC`
- `UPDATE payments SET status = 'completed'`

---

## Business Rules Summary

### Enrollment Rules
- One enrollment per user per course (UNIQUE constraint)
- Enrollment requires completed payment (status='completed')
- Gift enrollments don't require payment from recipient

### Live Class Rules
- Enrollment limited by max_students
- Attendance tracked via joined_at timestamp
- Participation score calculated from total_duration

### Quiz Rules
- Max attempts enforced per quiz
- Time limit enforced (time_remaining tracked)
- Passing score required for is_passed flag

### Payment Rules
- Payment status: pending → processing → completed/failed
- Coupon validation: check valid_from, valid_until, usage_limit
- Refunds tracked in wallet_transactions

### Progress Rules
- Lesson completion: watched_duration >= 90% of total_duration
- Course completion: all lessons completed
- Progress percentage calculated from lesson_progress

---

**See also:**
- `database-design-overview.md` - ERD and overview
- `database-design-schema.md` - Detailed schema (Part 1)
- `database-design-schema-part2.md` - Detailed schema (Part 2)

