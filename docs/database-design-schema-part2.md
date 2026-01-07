# Database Schema - Part 2: Payments, Flashcards, Assignments, Gamification

## 6. Payments & Financial

### 6.1. payments
Payment transactions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Payment ID |
| user_id | UUID | FK → users(id) | Payer |
| amount | DECIMAL(10,2) | NOT NULL | Payment amount |
| currency | VARCHAR(3) | DEFAULT 'VND' | Currency code |
| payment_method | VARCHAR(50) | NOT NULL | Method: credit_card, bank_transfer, momo, zalopay, vnpay |
| payment_gateway | VARCHAR(50) | | Gateway: stripe, paypal, vnpay, momo |
| transaction_id | VARCHAR(100) | UNIQUE | Internal transaction ID |
| gateway_transaction_id | VARCHAR(100) | | Gateway transaction ID |
| status | VARCHAR(20) | DEFAULT 'pending' | Status: pending, processing, completed, failed, cancelled |
| payment_type | VARCHAR(30) | DEFAULT 'course_purchase' | Type: course_purchase, subscription, top_up, gift |
| enrollment_id | UUID | FK → enrollments(id) | Related enrollment |
| coupon_id | UUID | FK → coupons(id) | Applied coupon |
| description | TEXT | | Payment description |
| metadata | JSONB | DEFAULT '{}' | Additional data (coupon, discount, invoice, etc.) |
| completed_at | TIMESTAMP | | Completion time |
| failed_at | TIMESTAMP | | Failure time |
| created_at | TIMESTAMP | DEFAULT NOW() | Created time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Updated time |

**Indexes:**
- `idx_payments_user_id` on (user_id)
- `idx_payments_status` on (status)
- `idx_payments_payment_type` on (payment_type)
- `idx_payments_enrollment_id` on (enrollment_id)
- `idx_payments_created_at` on (created_at)
- `idx_payments_transaction_id` on (transaction_id)

**Business Rules:**
- status='completed' requires completed_at
- payment_type='course_purchase' requires enrollment_id
- metadata contains: coupon_code, discount_amount, original_price, final_price, gateway_response

---

### 6.2. coupons
Discount coupons and promotions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Coupon ID |
| code | VARCHAR(50) | UNIQUE, NOT NULL | Coupon code |
| name | VARCHAR(100) | NOT NULL | Coupon name |
| description | TEXT | | Description |
| discount_type | VARCHAR(20) | NOT NULL | Type: percentage, fixed_amount |
| discount_value | DECIMAL(10,2) | NOT NULL | Discount value |
| min_order_amount | DECIMAL(10,2) | | Minimum order amount |
| max_discount_amount | DECIMAL(10,2) | | Maximum discount cap |
| valid_from | TIMESTAMP | NOT NULL | Valid from date |
| valid_until | TIMESTAMP | NOT NULL | Valid until date |
| usage_limit | INTEGER | | Total usage limit (NULL = unlimited) |
| usage_count | INTEGER | DEFAULT 0 | Current usage count |
| user_usage_limit | INTEGER | DEFAULT 1 | Per-user usage limit |
| applicable_course_ids | UUID[] | DEFAULT [] | Applicable courses (empty = all) |
| excluded_course_ids | UUID[] | DEFAULT [] | Excluded courses |
| status | VARCHAR(20) | DEFAULT 'active' | Status: active, inactive, expired |
| created_by | UUID | FK → users(id) | Creator (staff/admin) |
| created_at | TIMESTAMP | DEFAULT NOW() | Created time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Updated time |

**Indexes:**
- `idx_coupons_code` on (code)
- `idx_coupons_status` on (status)
- `idx_coupons_valid_dates` on (valid_from, valid_until)

**Business Rules:**
- code must be uppercase and unique
- status='expired' when valid_until < NOW()
- usage_count cannot exceed usage_limit

---

### 6.3. user_wallets
User wallet for credits/points

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Wallet ID |
| user_id | UUID | FK → users(id), UNIQUE | Wallet owner |
| balance | DECIMAL(10,2) | DEFAULT 0.00 | Wallet balance (VND) |
| currency | VARCHAR(3) | DEFAULT 'VND' | Currency code |
| points | INTEGER | DEFAULT 0 | Gamification points |
| created_at | TIMESTAMP | DEFAULT NOW() | Created time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Updated time |

**Indexes:**
- `idx_user_wallets_user_id` on (user_id)

**Business Rules:**
- One wallet per user
- balance >= 0 (no negative balance)
- points are non-negative integers

---

### 6.4. wallet_transactions
Wallet transaction history

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Transaction ID |
| wallet_id | UUID | FK → user_wallets(id) | Wallet |
| user_id | UUID | FK → users(id) | User (for quick lookup) |
| transaction_type | VARCHAR(30) | NOT NULL | Type: credit, debit, refund, reward, expired |
| amount | DECIMAL(10,2) | NOT NULL | Transaction amount |
| points | INTEGER | DEFAULT 0 | Points change |
| balance_before | DECIMAL(10,2) | NOT NULL | Balance before transaction |
| balance_after | DECIMAL(10,2) | NOT NULL | Balance after transaction |
| reference_type | VARCHAR(50) | | Reference: payment, enrollment, reward |
| reference_id | UUID | | Related entity ID |
| description | TEXT | | Transaction description |
| metadata | JSONB | DEFAULT '{}' | Additional data (refund reason, expiry date, etc.) |
| created_at | TIMESTAMP | DEFAULT NOW() | Created time |

**Indexes:**
- `idx_wallet_transactions_wallet_id` on (wallet_id)
- `idx_wallet_transactions_user_id` on (user_id)
- `idx_wallet_transactions_type` on (transaction_type)
- `idx_wallet_transactions_created_at` on (created_at)

**Business Rules:**
- transaction_type='refund' stores refund details in metadata
- transaction_type='expired' for expired credits (cron job)
- balance_after = balance_before + amount (for credit) or - amount (for debit)

---

## 7. Flashcards & Vocabulary

### 7.1. flashcard_decks
Flashcard deck collections

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Deck ID |
| user_id | UUID | FK → users(id) | Deck owner |
| name | VARCHAR(255) | NOT NULL | Deck name |
| description | TEXT | | Description |
| jlpt_level | VARCHAR(5) | | JLPT level: N5-N1 |
| is_public | BOOLEAN | DEFAULT FALSE | Public deck flag |
| tags | VARCHAR(50)[] | DEFAULT [] | Deck tags |
| card_count | INTEGER | DEFAULT 0 | Total card count |
| studied_count | INTEGER | DEFAULT 0 | Cards studied count |
| created_at | TIMESTAMP | DEFAULT NOW() | Created time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Updated time |

**Indexes:**
- `idx_flashcard_decks_user_id` on (user_id)

---

### 7.2. flashcards
Individual flashcard cards

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Card ID |
| deck_id | UUID | FK → flashcard_decks(id) | Parent deck |
| front_text | TEXT | NOT NULL | Front side (question) |
| back_text | TEXT | NOT NULL | Back side (answer) |
| example_sentence | TEXT | | Example sentence |
| pronunciation | TEXT | | Pronunciation (hiragana/katakana) |
| image_url | TEXT | | Image URL |
| audio_url | TEXT | | Audio pronunciation URL |
| tags | VARCHAR(50)[] | DEFAULT [] | Card tags |
| difficulty | VARCHAR(20) | DEFAULT 'medium' | Difficulty: easy, medium, hard |
| next_review_date | DATE | | Next review date (SRS algorithm) |
| interval_days | INTEGER | DEFAULT 1 | Review interval (days) |
| ease_factor | DECIMAL(4,2) | DEFAULT 2.50 | Ease factor (SM-2 algorithm) |
| review_count | INTEGER | DEFAULT 0 | Total review count |
| correct_count | INTEGER | DEFAULT 0 | Correct answer count |
| created_at | TIMESTAMP | DEFAULT NOW() | Created time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Updated time |

**Indexes:**
- `idx_flashcards_deck_id` on (deck_id)

**Business Rules:**
- SRS (Spaced Repetition System) algorithm updates next_review_date, interval_days, ease_factor
- review_count increments on each review
- correct_count increments when user answers correctly

---

### 7.3. flashcard_reviews
Flashcard review history

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Review ID |
| user_id | UUID | FK → users(id) | Reviewer |
| flashcard_id | UUID | FK → flashcards(id) | Flashcard |
| rating | INTEGER | | Rating: 1=Again, 2=Hard, 3=Good, 4=Easy |
| review_date | TIMESTAMP | DEFAULT NOW() | Review time |
| next_review_date | DATE | | Calculated next review date |
| time_spent_seconds | INTEGER | | Time spent reviewing |

**Indexes:**
- `idx_flashcard_reviews_user_id` on (user_id)
- `idx_flashcard_reviews_flashcard_id` on (flashcard_id)
- `idx_flashcard_reviews_review_date` on (review_date)

---

## 8. Assignments & Submissions

### 8.1. assignments
Assignments for live classes or courses

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Assignment ID |
| live_class_id | UUID | FK → live_classes(id) | Related live class (nullable) |
| course_id | UUID | FK → courses(id) | Related course (nullable) |
| title | VARCHAR(255) | NOT NULL | Assignment title |
| description | TEXT | | Description |
| instructions | TEXT | | Assignment instructions |
| assignment_type | VARCHAR(30) | | Type: essay, quiz, project, presentation |
| attachments | JSONB | | Array of file URLs |
| max_score | DECIMAL(5,2) | NOT NULL | Maximum score |
| passing_score | DECIMAL(5,2) | | Minimum passing score |
| due_date | TIMESTAMP | | Due date |
| allow_late_submission | BOOLEAN | DEFAULT FALSE | Allow late submission |
| late_penalty_per_day | DECIMAL(5,2) | | Penalty per day late |
| status | VARCHAR(20) | DEFAULT 'draft' | Status: draft, published, grading, completed |
| created_by | UUID | FK → users(id) | Creator (lecturer/staff) |
| created_at | TIMESTAMP | DEFAULT NOW() | Created time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Updated time |

**Indexes:**
- `idx_assignments_live_class_id` on (live_class_id)
- `idx_assignments_course_id` on (course_id)
- `idx_assignments_created_by` on (created_by)

**Business Rules:**
- Either live_class_id or course_id must be set (not both)
- status='published' makes assignment visible to students
- due_date triggers notifications

---

### 8.2. submissions
Student assignment submissions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Submission ID |
| assignment_id | UUID | FK → assignments(id) | Assignment |
| user_id | UUID | FK → users(id) | Student |
| submitted_at | TIMESTAMP | DEFAULT NOW() | Submission time |
| content | TEXT | | Submission content |
| attachments | JSONB | | Array of file URLs |
| is_late | BOOLEAN | DEFAULT FALSE | Late submission flag |
| late_days | INTEGER | DEFAULT 0 | Days late |
| status | VARCHAR(20) | DEFAULT 'submitted' | Status: submitted, graded, returned |
| score | DECIMAL(5,2) | | Graded score |
| feedback | TEXT | | Lecturer feedback |
| graded_by | UUID | FK → users(id) | Grader (lecturer/staff) |
| graded_at | TIMESTAMP | | Grading time |
| created_at | TIMESTAMP | DEFAULT NOW() | Created time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Updated time |

**Unique Constraint:** (assignment_id, user_id)

**Indexes:**
- `idx_submissions_assignment_id` on (assignment_id)
- `idx_submissions_user_id` on (user_id)
- `idx_submissions_status` on (status)

**Business Rules:**
- is_late=true if submitted_at > assignment.due_date
- late_days = (submitted_at - due_date) in days
- status='graded' requires score, graded_by, graded_at

---

## 9. Gamification

### 9.1. achievements
Achievement definitions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Achievement ID |
| name | VARCHAR(100) | NOT NULL | Achievement name |
| description | TEXT | | Description |
| icon_url | TEXT | | Achievement icon URL |
| achievement_type | VARCHAR(50) | | Type: course, streak, quiz, flashcard, participation, special |
| criteria | JSONB | NOT NULL | Unlock criteria: {type, target, condition} |
| points_reward | INTEGER | DEFAULT 0 | Points awarded |
| badge_image_url | TEXT | | Badge image URL |
| is_secret | BOOLEAN | DEFAULT FALSE | Secret achievement flag |
| created_at | TIMESTAMP | DEFAULT NOW() | Created time |

**Example criteria:**
```json
{
  "type": "course_completed",
  "target": 5,
  "condition": "complete 5 courses"
}
```

---

### 9.2. user_achievements
User achievement unlocks

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | User achievement ID |
| user_id | UUID | FK → users(id) | User |
| achievement_id | UUID | FK → achievements(id) | Achievement |
| unlocked_at | TIMESTAMP | DEFAULT NOW() | Unlock time |
| progress_current | INTEGER | DEFAULT 0 | Current progress |
| progress_target | INTEGER | | Target progress |
| is_unlocked | BOOLEAN | DEFAULT FALSE | Unlocked flag |

**Unique Constraint:** (user_id, achievement_id)

**Indexes:**
- `idx_user_achievements_user_id` on (user_id)
- `idx_user_achievements_achievement_id` on (achievement_id)

---

### 9.3. user_points
User points and badges (alternative to wallet.points)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Points record ID |
| user_id | UUID | FK → users(id), UNIQUE | User |
| total_points | INTEGER | DEFAULT 0 | Total lifetime points |
| current_points | INTEGER | DEFAULT 0 | Current available points |
| level | INTEGER | DEFAULT 1 | User level |
| badges | UUID[] | DEFAULT [] | Earned badge IDs |
| streak_days | INTEGER | DEFAULT 0 | Current streak |
| longest_streak | INTEGER | DEFAULT 0 | Longest streak |
| last_activity_date | DATE | | Last activity date (for streak) |
| created_at | TIMESTAMP | DEFAULT NOW() | Created time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Updated time |

**Indexes:**
- `idx_user_points_user_id` on (user_id)

**Business Rules:**
- Level calculated from total_points (e.g., level = floor(total_points / 1000))
- streak_days increments on consecutive days of activity
- last_activity_date updates on any learning activity

---

## 10. Community & Content

### 10.1. blog_posts
Blog posts

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Post ID |
| title | VARCHAR(255) | NOT NULL | Post title |
| slug | VARCHAR(255) | UNIQUE, NOT NULL | URL-friendly identifier |
| excerpt | VARCHAR(500) | | Short excerpt |
| content | TEXT | NOT NULL | Post content (HTML/Markdown) |
| cover_image_url | TEXT | | Cover image URL |
| author_id | UUID | FK → users(id) | Author (staff) |
| status | VARCHAR(20) | DEFAULT 'draft' | Status: draft, published, archived |
| published_at | TIMESTAMP | | Publication time |
| view_count | INTEGER | DEFAULT 0 | View count |
| like_count | INTEGER | DEFAULT 0 | Like count |
| comment_count | INTEGER | DEFAULT 0 | Comment count |
| tags | VARCHAR(50)[] | DEFAULT [] | Post tags |
| seo_title | VARCHAR(255) | | SEO title |
| seo_description | TEXT | | SEO description |
| created_at | TIMESTAMP | DEFAULT NOW() | Created time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Updated time |

**Indexes:**
- `idx_blog_posts_status` on (status)
- `idx_blog_posts_published_at` on (published_at DESC)
- `idx_blog_posts_author` on (author_id)

---

### 10.2. blog_comments
Blog post comments

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Comment ID |
| post_id | UUID | FK → blog_posts(id) | Blog post |
| user_id | UUID | FK → users(id) | Commenter |
| parent_comment_id | UUID | FK → blog_comments(id) | Parent comment (for replies) |
| content | TEXT | NOT NULL | Comment content |
| status | VARCHAR(20) | DEFAULT 'approved' | Status: pending, approved, spam, deleted |
| likes | INTEGER | DEFAULT 0 | Like count |
| created_at | TIMESTAMP | DEFAULT NOW() | Created time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Updated time |

**Indexes:**
- `idx_blog_comments_post_id` on (post_id)
- `idx_blog_comments_user_id` on (user_id)
- `idx_blog_comments_parent_id` on (parent_comment_id)
- `idx_blog_comments_created_at` on (created_at DESC)

---

### 10.3. notifications
User notifications

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Notification ID |
| user_id | UUID | FK → users(id) | Recipient |
| title | VARCHAR(255) | NOT NULL | Notification title |
| message | TEXT | NOT NULL | Notification message |
| notification_type | VARCHAR(50) | | Type: course_update, live_class_reminder, assignment_due, payment_success, etc. |
| data | JSONB | | Additional data |
| is_read | BOOLEAN | DEFAULT FALSE | Read flag |
| read_at | TIMESTAMP | | Read time |
| sent_via | VARCHAR(20)[] | DEFAULT [] | Channels: email, push, in_app |
| created_at | TIMESTAMP | DEFAULT NOW() | Created time |

**Indexes:**
- `idx_notifications_user_id` on (user_id)
- `idx_notifications_is_read` on (is_read)
- `idx_notifications_created_at` on (created_at)

---

## 11. File Management

### 11.1. file_assets
File storage registry

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | File ID |
| file_url | TEXT | UNIQUE, NOT NULL | File URL |
| mime_type | VARCHAR(100) | | MIME type |
| file_size | BIGINT | | File size in bytes |
| is_public | BOOLEAN | DEFAULT FALSE | Public access flag |
| status | VARCHAR(20) | DEFAULT 'pending' | Status: pending, uploaded, failed |
| metadata | JSONB | DEFAULT '{}' | Additional metadata |
| owner_id | UUID | FK → users(id) | File owner |
| module_origin | VARCHAR(50) | | Origin: USER, COURSE, CHAT, LIVE_CLASS |
| created_at | TIMESTAMP | DEFAULT NOW() | Created time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Updated time |

**Indexes:**
- `idx_file_assets_owner_id` on (owner_id)
- `idx_file_assets_file_url` on (file_url)
- `idx_file_assets_status` on (status)

---

## 12. Additional Tables

### 12.1. wishlist
Course wishlist

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Wishlist ID |
| user_id | UUID | FK → users(id) | User |
| course_id | UUID | FK → courses(id) | Course |
| added_at | TIMESTAMP | DEFAULT NOW() | Added time |

**Unique Constraint:** (user_id, course_id)

---

### 12.2. reviews
Course reviews

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Review ID |
| user_id | UUID | FK → users(id) | Reviewer |
| course_id | UUID | FK → courses(id) | Course |
| rating | INTEGER | NOT NULL | Rating: 1-5 |
| comment | TEXT | | Review comment |
| created_at | TIMESTAMP | DEFAULT NOW() | Created time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Updated time |

**Unique Constraint:** (user_id, course_id)

**Indexes:**
- `idx_reviews_course_id` on (course_id)
- `idx_reviews_user_id` on (user_id)

---

**Continue in:** `database-design-user-stories.md` for user story flows

