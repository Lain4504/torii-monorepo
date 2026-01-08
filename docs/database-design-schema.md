# Database Schema - Detailed Design

## 1. User Management & Authentication

### 1.1. users
Bảng chính quản lý người dùng trong hệ thống.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | User unique identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Email address (login) |
| display_name | VARCHAR(100) | | Full name |
| password | VARCHAR(255) | | Hashed password (nullable for OAuth) |
| avatar_url | TEXT | | Profile picture URL |
| app_metadata | JSONB | DEFAULT '{}' | App-specific metadata |
| user_metadata | JSONB | DEFAULT '{}' | User profile data from OAuth |
| role | VARCHAR(50) | DEFAULT 'learner' | Role: learner, lecturer, staff, admin |
| verified_at | TIMESTAMP | | Email verification timestamp |
| banned_until | TIMESTAMP | | Temporary ban expiration |
| last_sign_in_at | TIMESTAMP | | Last login time |
| created_at | TIMESTAMP | DEFAULT NOW() | Account creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |
| deleted_at | TIMESTAMP | | Soft delete timestamp |

**Indexes:**
- `idx_users_email` on (email)
- `idx_users_role` on (role)

**Business Rules:**
- Email must be unique across all users
- Role determines access level: learner, lecturer, staff, admin
- Soft delete: deleted_at IS NULL means active user

---

### 1.2. user_identities
OAuth provider identities (Google, Facebook, etc.)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Identity ID |
| user_id | UUID | FK → users(id) | Owner user |
| provider | VARCHAR(50) | NOT NULL | OAuth provider name |
| provider_id | VARCHAR(255) | NOT NULL | Provider's user ID |
| provider_data | JSONB | | Raw OAuth data |
| last_sign_in_at | TIMESTAMP | | Last OAuth login |
| created_at | TIMESTAMP | DEFAULT NOW() | Created time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Updated time |

**Unique Constraint:** (provider, provider_id)

---

### 1.3. sessions
User sessions and refresh tokens

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Session ID |
| user_id | UUID | FK → users(id) | User owner |
| token_hash | VARCHAR(64) | UNIQUE, NOT NULL | SHA-256 hash of refresh token |
| ip_address | VARCHAR(45) | | Client IP (IPv4/IPv6) |
| user_agent | TEXT | | Browser/client info |
| device_info | VARCHAR(100) | | Device description |
| expires_at | TIMESTAMP | NOT NULL | Token expiration |
| revoked_at | TIMESTAMP | | Revocation time |
| created_at | TIMESTAMP | DEFAULT NOW() | Created time |

**Indexes:**
- `idx_sessions_user_id` on (user_id)
- `idx_sessions_token_hash` on (token_hash)
- `idx_sessions_expires_at` on (expires_at)

---

### 1.4. two_factor_auth
Two-factor authentication configuration

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | 2FA ID |
| user_id | UUID | FK → users(id), UNIQUE | User owner |
| is_enabled | BOOLEAN | DEFAULT FALSE | 2FA enabled flag |
| method | VARCHAR(20) | | Method: 'totp' (Google Authenticator) |
| totp_secret | VARCHAR(255) | | Encrypted TOTP secret |
| totp_backup_codes | VARCHAR(100)[] | DEFAULT [] | Hashed backup codes |
| enabled_at | TIMESTAMP | | When 2FA was enabled |
| last_used_at | TIMESTAMP | | Last successful 2FA use |
| failed_attempts | INTEGER | DEFAULT 0 | Failed verification attempts |
| locked_until | TIMESTAMP | | Lock expiration if too many failures |
| created_at | TIMESTAMP | DEFAULT NOW() | Created time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Updated time |

---

### 1.5. role_permissions
RBAC: Role-Permission mapping

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| role_code | VARCHAR(50) | PK | Role identifier |
| permission_code | VARCHAR(100) | PK | Permission identifier |
| created_at | TIMESTAMP | DEFAULT NOW() | Created time |

**Composite Primary Key:** (role_code, permission_code)

**Example Roles:**
- learner, lecturer, staff, admin

**Example Permissions:**
- course.create, course.edit, course.delete
- user.manage, payment.view, analytics.view

---

### 1.6. audit_logs
System-wide audit trail

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Log ID |
| user_id | UUID | FK → users(id) | Actor user |
| user_email | VARCHAR(255) | NOT NULL | Actor email (snapshot) |
| user_role | VARCHAR(50) | NOT NULL | Actor role (snapshot) |
| action | VARCHAR(100) | NOT NULL | Action performed |
| entity | VARCHAR(100) | NOT NULL | Entity type |
| entity_id | VARCHAR(255) | | Entity ID |
| description | TEXT | NOT NULL | Human-readable description |
| metadata | JSONB | | Additional context |
| old_values | JSONB | | Previous state (for updates) |
| new_values | JSONB | | New state (for updates) |
| ip_address | VARCHAR(45) | | Request IP |
| user_agent | TEXT | | Request user agent |
| created_at | TIMESTAMP | DEFAULT NOW() | Action time |

**Indexes:**
- `idx_audit_logs_user_id` on (user_id)
- `idx_audit_logs_action` on (action)
- `idx_audit_logs_entity` on (entity)
- `idx_audit_logs_created_at` on (created_at)

---

## 2. Course Management

### 2.1. courses
Main course catalog

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Course ID |
| title | VARCHAR(255) | NOT NULL | Course title |
| slug | VARCHAR(255) | UNIQUE, NOT NULL | URL-friendly identifier |
| type | VARCHAR(20) | DEFAULT 'vod' | Type: 'vod' (video) or 'live' (WebRTC) |
| description | TEXT | | Full description |
| short_description | VARCHAR(500) | | Brief summary |
| jlpt_level | VARCHAR(5) | | JLPT level: N5, N4, N3, N2, N1 |
| ai_metadata | JSONB | DEFAULT '{}' | AI context metadata |
| thumbnail_url | TEXT | | Course thumbnail image |
| preview_video_url | TEXT | | Preview video URL |
| price | DECIMAL(10,2) | DEFAULT 0.00 | Original price |
| discount_price | DECIMAL(10,2) | | Discounted price |
| live_config | JSONB | | Live class config (if type='live') |
| duration_weeks | INTEGER | | Course duration in weeks |
| total_lessons | INTEGER | DEFAULT 0 | Total lesson count |
| total_quizzes | INTEGER | DEFAULT 0 | Total quiz count |
| total_students | INTEGER | DEFAULT 0 | Enrollment count |
| average_rating | DECIMAL(3,2) | DEFAULT 0.00 | Average rating (1-5) |
| total_reviews | INTEGER | DEFAULT 0 | Review count |
| status | VARCHAR(20) | DEFAULT 'draft' | Status: draft, published, archived |
| featured | BOOLEAN | DEFAULT FALSE | Featured course flag |
| is_free | BOOLEAN | DEFAULT FALSE | Free course flag |
| tags | VARCHAR(50)[] | DEFAULT [] | Course tags |
| learning_outcomes | JSONB | DEFAULT '[]' | Learning objectives |
| requirements | JSONB | DEFAULT '[]' | Prerequisites |
| created_by | UUID | FK → users(id) | Creator (staff/admin) |
| approved_by | UUID | FK → users(id) | Approver (admin) |
| approved_at | TIMESTAMP | | Approval timestamp |
| created_at | TIMESTAMP | DEFAULT NOW() | Created time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Updated time |
| deleted_at | TIMESTAMP | | Soft delete timestamp |

**Indexes:**
- `idx_courses_jlpt_level` on (jlpt_level)
- `idx_courses_status` on (status)
- `idx_courses_created_by` on (created_by)

**Business Rules:**
- slug must be unique and URL-friendly
- type='live' requires live_config JSONB
- status='published' requires approved_by and approved_at

---

### 2.2. modules
Course modules/chapters

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Module ID |
| course_id | UUID | FK → courses(id) | Parent course |
| title | VARCHAR(255) | NOT NULL | Module title |
| description | TEXT | | Module description |
| ai_metadata | JSONB | DEFAULT '{}' | AI context for module |
| order_index | INTEGER | DEFAULT 0 | Display order |
| duration_minutes | INTEGER | | Estimated duration |
| created_by | UUID | FK → users(id) | Creator |
| created_at | TIMESTAMP | DEFAULT NOW() | Created time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Updated time |
| deleted_at | TIMESTAMP | | Soft delete |

**Indexes:**
- `idx_modules_course_id` on (course_id)

---

### 2.3. lessons
Individual lessons within modules

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Lesson ID |
| module_id | UUID | FK → modules(id) | Parent module |
| title | VARCHAR(255) | NOT NULL | Lesson title |
| content_type | VARCHAR(20) | NOT NULL | Type: video, article, interactive |
| video_url | TEXT | | Video URL (if content_type='video') |
| video_duration | INTEGER | | Video length in seconds |
| article_content | TEXT | | Article HTML (if content_type='article') |
| ai_metadata | JSONB | DEFAULT '{}' | AI context for lesson |
| order_index | INTEGER | DEFAULT 0 | Display order |
| is_preview | BOOLEAN | DEFAULT FALSE | Free preview lesson |
| is_unlocked | BOOLEAN | DEFAULT TRUE | Unlock status |
| created_by | UUID | FK → users(id) | Creator |
| created_at | TIMESTAMP | DEFAULT NOW() | Created time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Updated time |
| deleted_at | TIMESTAMP | | Soft delete |

**Indexes:**
- `idx_lessons_module_id` on (module_id)

---

### 2.4. course_instructors
Many-to-many: Courses ↔ Lecturers

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Assignment ID |
| course_id | UUID | FK → courses(id) | Course |
| lecturer_id | UUID | FK → users(id) | Lecturer (role='lecturer') |
| is_primary | BOOLEAN | DEFAULT FALSE | Primary instructor flag |
| assigned_date | TIMESTAMP | DEFAULT NOW() | Assignment date |

**Unique Constraint:** (course_id, lecturer_id)

---

## 3. Enrollment & Learning Progress

### 3.1. enrollments
Course enrollments

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Enrollment ID |
| user_id | UUID | FK → users(id) | Student |
| course_id | UUID | FK → courses(id) | Course |
| enrollment_date | TIMESTAMP | DEFAULT NOW() | Enrollment time |
| completion_status | VARCHAR(20) | DEFAULT 'in_progress' | Status: in_progress, completed, dropped |
| completion_percentage | DECIMAL(5,2) | DEFAULT 0.00 | Progress percentage (0-100) |
| last_accessed_at | TIMESTAMP | | Last access time |
| completed_at | TIMESTAMP | | Completion time |
| payment_id | UUID | FK → payments(id) | Related payment |
| coupon_applied_id | UUID | FK → coupons(id) | Applied coupon |
| final_price | DECIMAL(10,2) | NOT NULL | Final paid amount |
| is_gift | BOOLEAN | DEFAULT FALSE | Gift enrollment flag |
| gift_message | TEXT | | Gift message (if is_gift=true) |
| sender_id | UUID | FK → users(id) | Gift sender (if is_gift=true) |

**Unique Constraint:** (user_id, course_id)

**Indexes:**
- `idx_enrollments_user_id` on (user_id)
- `idx_enrollments_course_id` on (course_id)
- `idx_enrollments_status` on (completion_status)

---

### 3.2. lesson_progress
Individual lesson progress tracking

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Progress ID |
| enrollment_id | UUID | FK → enrollments(id) | Enrollment |
| lesson_id | UUID | FK → lessons(id) | Lesson |
| status | VARCHAR(20) | DEFAULT 'not_started' | Status: not_started, in_progress, completed |
| watched_duration | INTEGER | DEFAULT 0 | Seconds watched |
| total_duration | INTEGER | NOT NULL | Total lesson duration (seconds) |
| last_watched_at | TIMESTAMP | | Last watch time |
| completed_at | TIMESTAMP | | Completion time |
| notes | TEXT | | Student notes |

**Unique Constraint:** (enrollment_id, lesson_id)

**Indexes:**
- `idx_lesson_progress_enrollment_id` on (enrollment_id)
- `idx_lesson_progress_lesson_id` on (lesson_id)

**Business Rules:**
- completion_percentage in enrollments is calculated from lesson_progress
- status='completed' when watched_duration >= total_duration * 0.9 (90% watched)

---

## 4. Live Classes (WebRTC)

### 4.1. live_classes
Scheduled live class sessions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Live class ID |
| course_id | UUID | FK → courses(id) | Related course (nullable) |
| title | VARCHAR(255) | NOT NULL | Class title |
| description | TEXT | | Class description |
| lecturer_id | UUID | FK → users(id) | Lecturer |
| start_time | TIMESTAMP | NOT NULL | Scheduled start time |
| duration_minutes | INTEGER | NOT NULL | Class duration |
| max_students | INTEGER | | Maximum enrollment |
| current_students | INTEGER | DEFAULT 0 | Current enrollment count |
| meeting_id | VARCHAR(100) | UNIQUE | LiveKit room identifier |
| meeting_password | VARCHAR(50) | | Room password (optional) |
| web_rtc_config | JSONB | | WebRTC/LiveKit configuration |
| status | VARCHAR(20) | DEFAULT 'scheduled' | Status: scheduled, live, ended, cancelled |
| recording_url | TEXT | | Recording URL (if recorded) |
| chat_enabled | BOOLEAN | DEFAULT TRUE | Chat feature enabled |
| whiteboard_enabled | BOOLEAN | DEFAULT TRUE | Whiteboard enabled |
| screen_sharing_enabled | BOOLEAN | DEFAULT TRUE | Screen sharing enabled |
| created_at | TIMESTAMP | DEFAULT NOW() | Created time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Updated time |

**Indexes:**
- `idx_live_classes_lecturer_id` on (lecturer_id)
- `idx_live_classes_start_time` on (start_time)
- `idx_live_classes_status` on (status)

**Business Rules:**
- status transitions: scheduled → live → ended
- meeting_id is generated when class is created
- current_students cannot exceed max_students

---

### 4.2. live_class_enrollments
Student enrollments in live classes

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Enrollment ID |
| live_class_id | UUID | FK → live_classes(id) | Live class |
| user_id | UUID | FK → users(id) | Student |
| enrollment_date | TIMESTAMP | DEFAULT NOW() | Enrollment time |
| attendance_status | VARCHAR(20) | DEFAULT 'registered' | Status: registered, attended, absent, late |
| joined_at | TIMESTAMP | | Join time (when entered room) |
| left_at | TIMESTAMP | | Leave time |
| total_duration | INTEGER | DEFAULT 0 | Total participation time (seconds) |
| participation_score | INTEGER | | Participation score (0-100) |

**Unique Constraint:** (live_class_id, user_id)

**Indexes:**
- `idx_live_class_enrollments_class_id` on (live_class_id)
- `idx_live_class_enrollments_user_id` on (user_id)

---

### 4.3. class_materials
Teaching materials for live classes

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Material ID |
| live_class_id | UUID | FK → live_classes(id) | Live class |
| title | VARCHAR(255) | NOT NULL | Material title |
| description | TEXT | | Description |
| file_url | TEXT | NOT NULL | File URL |
| file_type | VARCHAR(50) | | File type: pdf, docx, pptx, image, video |
| file_size | INTEGER | | File size in bytes |
| uploaded_by | UUID | FK → users(id) | Uploader (lecturer/staff) |
| uploaded_at | TIMESTAMP | DEFAULT NOW() | Upload time |
| download_count | INTEGER | DEFAULT 0 | Download count |

**Indexes:**
- `idx_class_materials_live_class_id` on (live_class_id)

---

### 4.4. room_info
LiveKit room information (WebRTC sessions)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PK, AUTO_INCREMENT | Room table ID |
| room_title | VARCHAR(255) | DEFAULT '' | Room title |
| room_id | VARCHAR(64) | NOT NULL | LiveKit room ID |
| sid | VARCHAR(64) | UNIQUE | LiveKit session ID |
| joined_participants | INTEGER | DEFAULT 0 | Current participants |
| is_running | INTEGER | DEFAULT 0 | 1=running, 0=stopped |
| is_recording | INTEGER | DEFAULT 0 | Recording flag |
| recorder_id | VARCHAR(36) | DEFAULT '' | Recorder ID |
| is_active_rtmp | INTEGER | DEFAULT 0 | RTMP streaming flag |
| rtmp_node_id | VARCHAR(36) | DEFAULT '' | RTMP node ID |
| webhook_url | VARCHAR(255) | DEFAULT '' | Webhook URL |
| is_breakout_room | INTEGER | DEFAULT 0 | Breakout room flag |
| parent_room_id | VARCHAR(64) | DEFAULT '' | Parent room (if breakout) |
| creation_time | INTEGER | DEFAULT 0 | Creation timestamp |
| created | TIMESTAMP | DEFAULT NOW() | Created time |
| ended | TIMESTAMP | | End time (nullable) |
| modified | TIMESTAMP | DEFAULT NOW() | Modified time |

**Indexes:**
- `idx_room_info_room_id` on (room_id, is_running)

**Business Rules:**
- room_id links to live_classes.meeting_id
- is_running=1 means active session
- ended IS NULL means session not ended

---

### 4.5. room_files
Files shared in LiveKit rooms

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PK, AUTO_INCREMENT | File ID |
| file_id | VARCHAR(191) | UNIQUE | Unique file identifier |
| room_id | VARCHAR(191) | NOT NULL | Room ID |
| user_id | VARCHAR(191) | NOT NULL | Uploader user ID |
| file_path | VARCHAR(191) | NOT NULL | File storage path |
| file_type | VARCHAR(191) | NOT NULL | File type |
| mime_type | VARCHAR(191) | NOT NULL | MIME type |
| file_size | DOUBLE PRECISION | DEFAULT 0 | File size |
| created | TIMESTAMP | DEFAULT NOW() | Created time |

**Indexes:**
- `idx_room_files_room_id` on (room_id)

---

## 5. Assessments & Quizzes

### 5.1. question_bank
Question repository for quizzes and exams

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Question ID |
| question_text | TEXT | NOT NULL | Question content |
| question_type | VARCHAR(30) | NOT NULL | Type: multiple_choice, true_false, fill_blank, essay |
| jlpt_level | VARCHAR(5) | | JLPT level: N5-N1 |
| category | VARCHAR(50) | | Category: vocab, grammar, reading, listening |
| subcategory | VARCHAR(50) | | Subcategory |
| difficulty | VARCHAR(20) | | Difficulty: easy, medium, hard |
| options | JSONB | | Answer options: {"A": "text", "B": "text", ...} |
| correct_answer | TEXT | | Correct answer |
| explanation | TEXT | | Answer explanation |
| tags | VARCHAR(50)[] | DEFAULT [] | Question tags |
| created_by | UUID | FK → users(id) | Creator (staff) |
| status | VARCHAR(20) | DEFAULT 'active' | Status: active, inactive, archived |
| usage_count | INTEGER | DEFAULT 0 | Times used in quizzes |
| created_at | TIMESTAMP | DEFAULT NOW() | Created time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Updated time |

**Indexes:**
- `idx_question_bank_type` on (question_type)
- `idx_question_bank_jlpt_level` on (jlpt_level)
- `idx_question_bank_difficulty` on (difficulty)
- `idx_question_bank_status` on (status)

---

### 5.2. quizzes
Quiz templates

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Quiz ID |
| title | VARCHAR(255) | NOT NULL | Quiz title |
| description | TEXT | | Description |
| quiz_type | VARCHAR(30) | DEFAULT 'practice' | Type: lesson, module, course, practice, jlpt_mock |
| jlpt_level | VARCHAR(5) | | JLPT level |
| course_id | UUID | FK → courses(id) | Related course (nullable) |
| lesson_id | UUID | FK → lessons(id) | Related lesson (nullable) |
| sections | JSONB | | Section configs: [{type, timeLimit, questionCount}, ...] |
| time_limit_minutes | INTEGER | | Total time limit |
| total_questions | INTEGER | DEFAULT 0 | Total question count |
| passing_score | DECIMAL(5,2) | | Minimum passing score (%) |
| max_attempts | INTEGER | DEFAULT 1 | Maximum attempts allowed |
| shuffle_questions | BOOLEAN | DEFAULT TRUE | Shuffle questions |
| show_explanation | BOOLEAN | DEFAULT FALSE | Show explanation after submit |
| status | VARCHAR(20) | DEFAULT 'draft' | Status: draft, published, archived |
| created_by | UUID | FK → users(id) | Creator (staff) |
| created_at | TIMESTAMP | DEFAULT NOW() | Created time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Updated time |

**Indexes:**
- `idx_quizzes_jlpt_level` on (jlpt_level)
- `idx_quizzes_status` on (status)
- `idx_quizzes_course_id` on (course_id)
- `idx_quizzes_lesson_id` on (lesson_id)

---

### 5.3. quiz_questions
Quiz-Question mapping

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Mapping ID |
| quiz_id | UUID | FK → quizzes(id) | Quiz |
| question_id | UUID | FK → question_bank(id) | Question |
| order_index | INTEGER | NOT NULL | Display order |
| points | DECIMAL(5,2) | DEFAULT 1.00 | Points for this question |
| section_type | VARCHAR(50) | | Section: vocab, grammar, reading, listening |

**Unique Constraint:** (quiz_id, order_index)

**Indexes:**
- `idx_quiz_questions_quiz_id` on (quiz_id)
- `idx_quiz_questions_question_id` on (question_id)

---

### 5.4. quiz_attempts
User quiz attempts

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Attempt ID |
| quiz_id | UUID | FK → quizzes(id) | Quiz |
| user_id | UUID | FK → users(id) | Student |
| status | VARCHAR(20) | DEFAULT 'in-progress' | Status: in-progress, completed, submitted, abandoned |
| started_at | TIMESTAMP | DEFAULT NOW() | Start time |
| submitted_at | TIMESTAMP | | Submit time |
| completed_at | TIMESTAMP | | Completion time |
| score | DECIMAL(5,2) | | Points earned |
| max_score | DECIMAL(5,2) | | Maximum possible points |
| percentage | DECIMAL(5,2) | | Score percentage |
| is_passed | BOOLEAN | | Passed flag (based on passing_score) |
| time_taken_seconds | INTEGER | | Time taken |
| attempt_number | INTEGER | DEFAULT 1 | Attempt number |
| time_remaining | INTEGER | | Seconds remaining |
| answers | JSONB | DEFAULT '{}' | User answers: {questionId: "answer", ...} |
| flagged_questions | UUID[] | DEFAULT [] | Flagged question IDs |
| current_section | VARCHAR(50) | | Current section (for multi-section quizzes) |
| current_question | INTEGER | DEFAULT 1 | Current question index |
| created_at | TIMESTAMP | DEFAULT NOW() | Created time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Updated time |

**Indexes:**
- `idx_quiz_attempts_quiz_id` on (quiz_id)
- `idx_quiz_attempts_user_id` on (user_id)
- `idx_quiz_attempts_status` on (status)
- `idx_quiz_attempts_started_at` on (started_at)

---

### 5.5. quiz_attempt_details
Per-question attempt details

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Detail ID |
| attempt_id | UUID | FK → quiz_attempts(id) | Quiz attempt |
| question_id | UUID | FK → question_bank(id) | Question |
| user_answer | TEXT | | User's answer |
| is_correct | BOOLEAN | | Correctness flag |
| points_earned | DECIMAL(5,2) | | Points earned for this question |
| time_spent_seconds | INTEGER | | Time spent on question |
| created_at | TIMESTAMP | DEFAULT NOW() | Created time |

**Indexes:**
- `idx_quiz_attempt_details_attempt_id` on (attempt_id)
- `idx_quiz_attempt_details_question_id` on (question_id)

---

**Continue in next file:** `database-design-schema-part2.md`

