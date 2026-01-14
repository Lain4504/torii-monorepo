# Business Rules & System Messages

**Project:** Torii Nihongo Learning Platform  
**Project Code:** SP26SE005  
**Version:** 1.0  
**Date:** January 2026

---

## 📋 Table of Contents

1. [Authentication & Authorization](#1-authentication--authorization)
2. [User Management](#2-user-management)
3. [Course Management](#3-course-management)
4. [Enrollment & Payment](#4-enrollment--payment)
5. [Learning Progress & Assessment](#5-learning-progress--assessment)
6. [Flashcard & SRS System](#6-flashcard--srs-system)
7. [Live Classes (WebRTC)](#7-live-classes-webrtc)
8. [Content Management](#8-content-management)
9. [File Upload & Storage](#9-file-upload--storage)
10. [System-Wide Rules](#10-system-wide-rules)

---

## 1. Authentication & Authorization

### 1.1 User Registration

**Business Rules:**
- BR-AUTH-001: Email must be unique across the system
- BR-AUTH-002: Password must be hashed using Argon2 before storage
- BR-AUTH-003: New users are assigned role `learner` by default
- BR-AUTH-004: Email verification is required before account activation
- BR-AUTH-005: Display name defaults to email username if not provided
- BR-AUTH-006: Users can register via email/password or OAuth (Google)
- BR-AUTH-007: OAuth users don't require password (nullable field)

**System Messages:**
```typescript
// Success
"Registration successful. Please check your email for verification."

// Errors
"Email already exists" // ConflictException (409)
"Invalid email format" // BadRequestException (400)
"Password must be at least 8 characters" // BadRequestException (400)
```

---

### 1.2 User Login

**Business Rules:**
- BR-AUTH-010: Email and password are required for login
- BR-AUTH-011: Email must be verified (`verifiedAt` not null) before login
- BR-AUTH-012: Account must not be banned (`bannedUntil` is null or past)
- BR-AUTH-013: Account must not be soft-deleted (`deletedAt` is null)
- BR-AUTH-014: If 2FA is enabled, return temporary token instead of access token
- BR-AUTH-015: Admin portal login rejects users with role `learner`
- BR-AUTH-016: Password verification uses Argon2
- BR-AUTH-017: JWT access token expires based on `JWT_EXPIRY` env variable

**System Messages:**
```typescript
// Success
"Login successful"
{ requiresTwoFactor: true, tempToken: "..." } // 2FA required

// Errors
"Invalid credentials" // UnauthorizedException (401)
"Email not verified. Please check your email." // UnauthorizedException (401)
"Account is disabled or deleted" // UnauthorizedException (401)
"Access denied: Admin portals are restricted" // UnauthorizedException (401) - Learner trying admin login
```

---

### 1.3 Two-Factor Authentication (2FA)

**Business Rules:**
- BR-2FA-001: Only TOTP (Google Authenticator) method is supported
- BR-2FA-002: Temporary 2FA token expires in 5 minutes (configurable via `TWO_FACTOR_TEMP_TOKEN_EXPIRY`)
- BR-2FA-003: Temporary token is stored in Redis and deleted after use
- BR-2FA-004: Backup codes are hashed with Argon2
- BR-2FA-005: Failed 2FA attempts increment counter; account locks after threshold
- BR-2FA-006: TOTP secret is encrypted with AES-256-GCM

**System Messages:**
```typescript
// Success
"2FA enabled successfully"
"2FA verification successful"

// Errors
"Invalid or expired temporary token" // UnauthorizedException (401)
"Temporary token expired or already used" // UnauthorizedException (401)
"Invalid 2FA code" // UnauthorizedException (401)
"2FA is locked due to too many failed attempts" // UnauthorizedException (401)
```

---

### 1.4 Email Verification

**Business Rules:**
- BR-VERIFY-001: Verification token is 64-character hex string (32 bytes random)
- BR-VERIFY-002: Verification token expires in 24 hours
- BR-VERIFY-003: Verification token is one-time use (deleted after verification)
- BR-VERIFY-004: Mobile platform uses 6-digit OTP instead of token
- BR-VERIFY-005: OTP expires in 10 minutes
- BR-VERIFY-006: Resend verification is rate-limited to 3 requests per hour
- BR-VERIFY-007: Only users with `verifiedAt` = null can resend verification

**System Messages:**
```typescript
// Success
"Email verified successfully"
"Verification email sent"

// Errors
"Invalid or expired verification token" // BadRequestException (400)
"Email already verified or account is not active" // BadRequestException (400)
"Too many requests. Please try again in X minutes." // BadRequestException (400)
"Invalid or expired verification code" // UnauthorizedException (401)
```

---

### 1.5 Password Reset

**Business Rules:**
- BR-RESET-001: Password reset is rate-limited to 3 requests per hour per email
- BR-RESET-002: Reset token is 64-character hex string, expires in 1 hour
- BR-RESET-003: Mobile platform uses 6-digit OTP, expires in 10 minutes
- BR-RESET-004: OAuth-only users (no password) cannot reset password
- BR-RESET-005: After password reset, all existing sessions are revoked
- BR-RESET-006: Password reset token is one-time use
- BR-RESET-007: New password must be hashed with Argon2

**System Messages:**
```typescript
// Success
"Password reset email sent"
"Password reset successful"

// Errors
"Invalid or expired reset token" // BadRequestException (400)
"This account uses OAuth login. Password reset is not available." // BadRequestException (400)
"Too many requests. Please try again in X minutes." // BadRequestException (400)
```

---

### 1.6 Logout

**Business Rules:**
- BR-LOGOUT-001: Access token is blacklisted in Redis until expiry
- BR-LOGOUT-002: Refresh token session is revoked in database
- BR-LOGOUT-003: Expired tokens are blacklisted for 1 minute (safety measure)
- BR-LOGOUT-004: Invalid tokens are ignored (no error thrown)

**System Messages:**
```typescript
// Success
"Logout successful"
```

---

### 1.7 Role-Based Access Control (RBAC)

**Business Rules:**
- BR-RBAC-001: System supports 4 roles: `learner`, `lecturer`, `staff`, `admin`
- BR-RBAC-002: Only `admin` and `lecturer` can create courses
- BR-RBAC-003: Only `admin` can delete courses (hard or soft delete)
- BR-RBAC-004: Only `admin` and `lecturer` can publish/unpublish courses
- BR-RBAC-005: Permissions are checked at both Gateway and Service levels
- BR-RBAC-006: Role changes require admin privileges

**System Messages:**
```typescript
// Errors
"Only admins and lecturers can create courses" // ForbiddenException (403)
"Only admins can delete courses" // ForbiddenException (403)
"Only admins and lecturers can publish courses" // ForbiddenException (403)
"Insufficient permissions" // ForbiddenException (403)
```

---

## 2. User Management

### 2.1 User Profile

**Business Rules:**
- BR-USER-001: User ID is UUID v4 generated by database
- BR-USER-002: Email is unique and case-insensitive
- BR-USER-003: Display name is required (max 100 characters)
- BR-USER-004: Avatar URL is optional
- BR-USER-005: User metadata (JSON) stores OAuth profile data
- BR-USER-006: App metadata (JSON) stores provider information
- BR-USER-007: Soft delete sets `deletedAt` timestamp

**System Messages:**
```typescript
// Success
"Profile updated successfully"

// Errors
"User not found" // NotFoundException (404)
"Email already in use" // ConflictException (409)
```

---

### 2.2 User Status

**Business Rules:**
- BR-STATUS-001: User status is determined by timestamps:
  - `verifiedAt` = null → Pending verification
  - `bannedUntil` > now → Banned
  - `deletedAt` != null → Soft deleted
- BR-STATUS-002: Banned users cannot login until `bannedUntil` expires
- BR-STATUS-003: Deleted users cannot login or access system

---

## 3. Course Management

### 3.1 Course Creation

**Business Rules:**
- BR-COURSE-001: Only `admin` and `lecturer` roles can create courses
- BR-COURSE-002: Course title is required (max 255 characters)
- BR-COURSE-003: Slug is auto-generated from title with date suffix for uniqueness
- BR-COURSE-004: If slug exists, append timestamp to ensure uniqueness
- BR-COURSE-005: New courses default to `draft` status
- BR-COURSE-006: Course type is either `vod` (video-on-demand) or `live`
- BR-COURSE-007: JLPT level must be one of: N5, N4, N3, N2, N1
- BR-COURSE-008: Price defaults to 0 (free course)
- BR-COURSE-009: `isFree` flag overrides price (free courses ignore price)
- BR-COURSE-010: `createdBy` is set to requester's user ID

**System Messages:**
```typescript
// Success
"Course created successfully"

// Errors
"Only admins and lecturers can create courses" // ForbiddenException (403)
"Course title is required" // BadRequestException (400)
"Failed to create course: {error}" // BadRequestException (400)
```

---

### 3.2 Course Publishing

**Business Rules:**
- BR-PUBLISH-001: Only `admin` and `lecturer` can publish courses
- BR-PUBLISH-002: Publishing sets `status` = 'published', `approvedBy`, and `approvedAt`
- BR-PUBLISH-003: Publishing emits `course.published` event via NATS
- BR-PUBLISH-004: Unpublishing sets `status` = 'draft' and clears approval fields
- BR-PUBLISH-005: Only published courses appear in client search results

**System Messages:**
```typescript
// Success
"Course published successfully"
"Course unpublished successfully"

// Errors
"Only admins and lecturers can publish courses" // ForbiddenException (403)
"Course not found" // NotFoundException (404)
```

---

### 3.3 Course Search & Filtering

**Business Rules:**
- BR-SEARCH-001: Client search only returns published courses (`status` = 'published')
- BR-SEARCH-002: Admin search can filter by any status (draft, published)
- BR-SEARCH-003: Search supports text search in title, description, shortDescription
- BR-SEARCH-004: Filters: JLPT level, price range, rating, course type
- BR-SEARCH-005: Sorting options: newest, oldest, price-asc, price-desc, popular
- BR-SEARCH-006: Soft-deleted courses (`deletedAt` != null) are excluded from all searches
- BR-SEARCH-007: Default pagination: page=1, limit=10 (admin), limit=12 (client)

**System Messages:**
```typescript
// Success
{ data: [...], total: X, page: Y, limit: Z, totalPages: W }

// Errors
"Failed to retrieve courses" // BadRequestException (400)
"Failed to search courses" // BadRequestException (400)
```

---

### 3.4 Course Deletion

**Business Rules:**
- BR-DELETE-001: Only `admin` can delete courses
- BR-DELETE-002: Default deletion is soft delete (sets `deletedAt`)
- BR-DELETE-003: Hard delete permanently removes course and cascades to modules/lessons
- BR-DELETE-004: Soft-deleted courses can be restored by clearing `deletedAt`

**System Messages:**
```typescript
// Success
"Course deleted successfully"

// Errors
"Only admins can delete courses" // ForbiddenException (403)
"Course not found" // NotFoundException (404)
"Failed to delete course: {error}" // BadRequestException (400)
```

---

### 3.5 Course Curriculum

**Business Rules:**
- BR-CURRICULUM-001: Curriculum consists of Modules → Lessons hierarchy
- BR-CURRICULUM-002: Modules are ordered by `orderIndex`
- BR-CURRICULUM-003: Lessons are ordered by `orderIndex` within each module
- BR-CURRICULUM-004: Preview lessons (`isPreview` = true) are accessible without enrollment
- BR-CURRICULUM-005: Locked lessons (`isUnlocked` = false) require enrollment

---

## 4. Enrollment & Payment

### 4.1 Course Enrollment

**Business Rules:**
- BR-ENROLL-001: User can only enroll once per course (unique constraint on userId + courseId)
- BR-ENROLL-002: Course must exist and not be soft-deleted
- BR-ENROLL-003: Enrollment status defaults to `in_progress`
- BR-ENROLL-004: Completion percentage defaults to 0%
- BR-ENROLL-005: Final price is set from course's `discountPrice` or `price`
- BR-ENROLL-006: Free courses (`isFree` = true) don't require payment
- BR-ENROLL-007: Gift enrollments set `isGift` = true and `senderId`

**System Messages:**
```typescript
// Success
"Enrollment created successfully"

// Errors
"CourseId is required" // BadRequestException (400)
"Course not found" // NotFoundException (404)
"Already enrolled in this course" // BadRequestException (400)
```

---

### 4.2 Enrollment Progress

**Business Rules:**
- BR-PROGRESS-001: Completion percentage must be between 0 and 100
- BR-PROGRESS-002: When progress reaches 100%, status auto-updates to `completed`
- BR-PROGRESS-003: `completedAt` timestamp is set when status becomes `completed`
- BR-PROGRESS-004: `lastAccessedAt` updates on every progress update

**System Messages:**
```typescript
// Success
"Progress updated successfully"

// Errors
"Completion percentage must be between 0 and 100" // BadRequestException (400)
"Enrollment not found" // NotFoundException (404)
```

---

### 4.3 Payment Processing

**Business Rules:**
- BR-PAY-001: Payment types: `course_purchase`, `subscription`, `top_up`, `gift`
- BR-PAY-002: Payment status: `pending`, `processing`, `completed`, `failed`, `cancelled`
- BR-PAY-003: Payment methods: `credit_card`, `bank_transfer`, `momo`, `zalopay`, `vnpay`, `mock`
- BR-PAY-004: Payment gateways: `stripe`, `paypal`, `vnpay`, `momo`, `mock`
- BR-PAY-005: Free courses cannot create payment (`isFree` = true)
- BR-PAY-006: `course_purchase` type requires `courseId`
- BR-PAY-007: Payment amount must match course final price
- BR-PAY-008: Payment can only be confirmed if status is `pending` or `processing`
- BR-PAY-009: Completed payments cannot be modified
- BR-PAY-010: Payment confirmation creates enrollment if not exists

**System Messages:**
```typescript
// Success
"Payment created successfully"
"Payment confirmed successfully"

// Errors
"Free courses do not require payment" // BadRequestException (400)
"CourseId is required for course_purchase payment type" // BadRequestException (400)
"Payment already completed" // BadRequestException (400)
"Payment cannot be confirmed in current status" // BadRequestException (400)
"Payment not found" // NotFoundException (404)
```

---

## 5. Learning Progress & Assessment

### 5.1 Quiz & Exam Management

**Business Rules:**
- BR-QUIZ-001: Quiz types: `lesson`, `module`, `course`, `practice`, `jlpt_mock`
- BR-QUIZ-002: Quiz status: `draft`, `published`, `archived`
- BR-QUIZ-003: Quizzes can have time limits (in minutes)
- BR-QUIZ-004: Quizzes can have passing scores (percentage)
- BR-QUIZ-005: `maxAttempts` limits number of attempts (default: 1, unlimited: -1)
- BR-QUIZ-006: Questions can be shuffled if `shuffleQuestions` = true
- BR-QUIZ-007: Explanations shown after submission if `showExplanation` = true

---

### 5.2 Question Bank

**Business Rules:**
- BR-QUESTION-001: Question types: `multiple_choice`, `true_false`, `fill_blank`, `essay`, `listening`, `reading`
- BR-QUESTION-002: Multiple choice questions must have at least 2 options
- BR-QUESTION-003: Correct answer is required for non-essay questions
- BR-QUESTION-004: Question status: `draft`, `active`, `archived`, `rejected`
- BR-QUESTION-005: Questions in use cannot be deleted (must archive instead)
- BR-QUESTION-006: Bulk operations limited to 100 questions at once
- BR-QUESTION-007: Questions can be tagged for categorization
- BR-QUESTION-008: JLPT level filtering: N5, N4, N3, N2, N1

**System Messages:**
```typescript
// Success
"Question created successfully"
"Questions created successfully"

// Errors
"Multiple choice questions must have at least 2 options" // BadRequestException (400)
"Correct answer is required for non-essay questions" // BadRequestException (400)
"Cannot delete question that is in use. Archive it instead." // BadRequestException (400)
"Cannot create more than 100 questions at once" // BadRequestException (400)
"No questions provided" // BadRequestException (400)
```

---

### 5.3 Quiz Attempts

**Business Rules:**
- BR-ATTEMPT-001: Attempt status: `in-progress`, `completed`, `submitted`, `abandoned`
- BR-ATTEMPT-002: User can flag questions for review during attempt
- BR-ATTEMPT-003: Time remaining is tracked and enforced
- BR-ATTEMPT-004: Answers are stored in JSON format: `{ questionId: "answer", ... }`
- BR-ATTEMPT-005: Score calculation: `(correctAnswers / totalQuestions) * 100`
- BR-ATTEMPT-006: `isPassed` = true if percentage >= passingScore
- BR-ATTEMPT-007: Attempt number increments for each new attempt

---

## 6. Flashcard & SRS System

### 6.1 Flashcard Deck Management

**Business Rules:**
- BR-DECK-001: Deck name is required (max 255 characters)
- BR-DECK-002: Decks can be public or private (`isPublic` flag)
- BR-DECK-003: JLPT level filtering: N5, N4, N3, N2, N1
- BR-DECK-004: SRS settings (Anki-like):
  - `newCardsPerDay`: default 20
  - `maxReviewsPerDay`: default 200
  - `easyBonus`: default 1.3
  - `intervalModifier`: default 1.0
  - `maximumInterval`: default 36500 days
- BR-DECK-005: AI settings:
  - `autoGenerate`: default false
  - `requireApproval`: default true
  - `minConfidence`: default 0.8

---

### 6.2 Flashcard Management

**Business Rules:**
- BR-CARD-001: Front text and back text are required
- BR-CARD-002: Generation methods: `manual`, `ai_auto`, `ai_assisted`, `import`
- BR-CARD-003: Japanese-specific fields: `furigana`, `kanji`, `partOfSpeech`
- BR-CARD-004: Part of speech types: `noun`, `verb_ichidan`, `verb_godan`, `verb_suru`, `verb_kuru`, `adjective_i`, `adjective_na`, `adverb`, `particle`, etc.
- BR-CARD-005: Difficulty levels: `easy`, `medium`, `hard`
- BR-CARD-006: Cards can be archived (`isArchived` = true)

---

### 6.3 SRS Algorithm (Spaced Repetition)

**Business Rules:**
- BR-SRS-001: Card states: `new`, `learning`, `review`, `relearning`
- BR-SRS-002: Review quality ratings: `ZERO` (Again), `ONE` (Hard), `TWO` (Good), `THREE` (Easy), `FOUR` (Easy+)
- BR-SRS-003: Ease factor range: 1.30 to 2.50 (default: 2.50)
- BR-SRS-004: Interval calculation based on Anki SM-2 algorithm
- BR-SRS-005: Per-user progress tracking (separate from global card stats)
- BR-SRS-006: Daily limits enforced: `newCardsPerDay`, `maxReviewsPerDay`
- BR-SRS-007: Consecutive correct answers tracked for mastery calculation

---

### 6.4 Flashcard Review Sessions

**Business Rules:**
- BR-SESSION-001: Session tracks: total cards, new cards, learning cards, review cards
- BR-SESSION-002: Performance metrics: correct count, incorrect count, hard count, easy count
- BR-SESSION-003: Average response time calculated per session
- BR-SESSION-004: Mastery score calculated based on performance
- BR-SESSION-005: Session duration tracked in seconds

---

## 7. Live Classes (WebRTC)

### 7.1 Room Management

**Business Rules:**
- BR-ROOM-001: Room ID is unique identifier for LiveKit room
- BR-ROOM-002: Room status: `isRunning` (1 = running, 0 = not running)
- BR-ROOM-003: Recording status: `isRecording` (1 = recording, 0 = not recording)
- BR-ROOM-004: RTMP streaming: `isActiveRtmp` (1 = active, 0 = inactive)
- BR-ROOM-005: Breakout rooms: `isBreakoutRoom` (1 = breakout, 0 = main room)
- BR-ROOM-006: Room creation time tracked in Unix timestamp
- BR-ROOM-007: Room ended when `ended` timestamp is set

---

### 7.2 LiveKit Authentication

**Business Rules:**
- BR-LIVEKIT-001: LiveKit uses NATS auth callout for token validation
- BR-LIVEKIT-002: Gateway validates JWT token and returns auth response
- BR-LIVEKIT-003: Room access requires valid enrollment or instructor role
- BR-LIVEKIT-004: Room tokens expire based on class duration

---

## 8. Content Management

### 8.1 Blog Posts

**Business Rules:**
- BR-POST-001: Post slug must be unique
- BR-POST-002: Post status: `draft`, `published`, `archived`
- BR-POST-003: Author ID is required
- BR-POST-004: Published posts have `publishedAt` timestamp
- BR-POST-005: View count, like count, comment count tracked automatically
- BR-POST-006: SEO fields: `seoTitle`, `seoDescription`

**System Messages:**
```typescript
// Success
"Post created successfully"

// Errors
"Author ID is required" // BadRequestException (400)
"Post with slug \"{slug}\" already exists" // BadRequestException (400)
```

---

### 8.2 Comments

**Business Rules:**
- BR-COMMENT-001: Comments support nested replies (`parentCommentId`)
- BR-COMMENT-002: Comment status: `pending`, `approved`, `spam`, `deleted`
- BR-COMMENT-003: Comments cascade delete when post is deleted
- BR-COMMENT-004: Likes tracked per comment

---

## 9. File Upload & Storage

### 9.1 File Assets

**Business Rules:**
- BR-FILE-001: File URL must be unique
- BR-FILE-002: File status: `pending`, `uploaded`, `failed`
- BR-FILE-003: File metadata stored in JSON format
- BR-FILE-004: Module origin: `USER`, `COURSE`, `CHAT`
- BR-FILE-005: Public files (`isPublic` = true) accessible without auth
- BR-FILE-006: File size tracked in bytes

**System Messages:**
```typescript
// Success
"File uploaded successfully"

// Errors
"No file data provided" // BadRequestException (400)
"File not found in storage. Upload might have failed." // BadRequestException (400)
```

---

### 9.2 Lesson Materials

**Business Rules:**
- BR-MATERIAL-001: Material types: `slides`, `video`, `reading`, `assignment`
- BR-MATERIAL-002: Materials linked to lessons via `lessonId`
- BR-MATERIAL-003: Materials ordered by `orderIndex`
- BR-MATERIAL-004: Materials reference file assets (foreign key constraint)
- BR-MATERIAL-005: Deleting lesson cascades to materials
- BR-MATERIAL-006: Deleting file asset restricted if used in materials

---

## 10. System-Wide Rules

### 10.1 Data Validation

**Business Rules:**
- BR-VALID-001: All IDs are UUID v4 format
- BR-VALID-002: Email format validated using regex
- BR-VALID-003: Dates stored in ISO 8601 format with timezone
- BR-VALID-004: Decimal precision: 2 decimal places for currency, percentages
- BR-VALID-005: Text fields have max length constraints
- BR-VALID-006: Required fields validated at DTO level (Zod schemas)

---

### 10.2 Soft Delete

**Business Rules:**
- BR-SOFT-001: Soft delete sets `deletedAt` timestamp
- BR-SOFT-002: Soft-deleted records excluded from queries by default
- BR-SOFT-003: Soft-deleted records can be restored by clearing `deletedAt`
- BR-SOFT-004: Hard delete permanently removes records

---

### 10.3 Pagination

**Business Rules:**
- BR-PAGE-001: Default page = 1, default limit = 10
- BR-PAGE-002: Page and limit must be positive integers
- BR-PAGE-003: Invalid page/limit defaults to 1/10
- BR-PAGE-004: Response includes: `data`, `total`, `page`, `limit`, `totalPages`

---

### 10.4 Rate Limiting

**Business Rules:**
- BR-RATE-001: Email verification resend: 3 requests per hour
- BR-RATE-002: Password reset: 3 requests per hour
- BR-RATE-003: OTP resend: 3 requests per hour
- BR-RATE-004: Rate limit counters stored in Redis with TTL

**System Messages:**
```typescript
"Too many requests. Please try again in X minutes." // BadRequestException (400)
```

---

### 10.5 Audit Logging

**Business Rules:**
- BR-AUDIT-001: All critical actions logged to `audit_logs` table
- BR-AUDIT-002: Audit log includes: userId, userEmail, userRole, action, entity, entityId
- BR-AUDIT-003: State changes tracked: `oldValues`, `newValues`
- BR-AUDIT-004: Request context tracked: `ipAddress`, `userAgent`
- BR-AUDIT-005: Audit logs cannot be deleted (compliance requirement)

---

### 10.6 Error Handling

**Standard HTTP Status Codes:**
- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid input or business rule violation
- `401 Unauthorized`: Authentication required or failed
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource already exists (e.g., duplicate email)
- `500 Internal Server Error`: Unexpected server error

**Error Response Format:**
```typescript
{
  statusCode: number,
  message: string | string[],
  error: string,
  timestamp: string,
  path: string
}
```

---

### 10.7 Timezone & Localization

**Business Rules:**
- BR-TZ-001: All timestamps stored in UTC
- BR-TZ-002: Client-side timezone conversion for display
- BR-TZ-003: Supported languages: English, Vietnamese, Japanese
- BR-TZ-004: Currency: VND (Vietnamese Dong)

---

### 10.8 Security

**Business Rules:**
- BR-SEC-001: All passwords hashed with Argon2
- BR-SEC-002: JWT tokens signed with RS256 algorithm
- BR-SEC-003: Refresh tokens hashed with SHA-256
- BR-SEC-004: 2FA secrets encrypted with AES-256-GCM
- BR-SEC-005: Sensitive data never logged
- BR-SEC-006: CORS enabled for whitelisted origins only
- BR-SEC-007: Rate limiting on all public endpoints

---

### 10.9 Performance

**Business Rules:**
- BR-PERF-001: Database queries use indexes on frequently queried fields
- BR-PERF-002: Redis caching for frequently accessed data
- BR-PERF-003: Pagination required for list endpoints
- BR-PERF-004: Bulk operations limited to prevent timeout
- BR-PERF-005: File uploads limited to 100MB

---

### 10.10 Data Integrity

**Business Rules:**
- BR-INTEGRITY-001: Foreign key constraints enforced at database level
- BR-INTEGRITY-002: Cascade delete for dependent records
- BR-INTEGRITY-003: Unique constraints on business keys (email, slug, etc.)
- BR-INTEGRITY-004: Transactions used for multi-step operations
- BR-INTEGRITY-005: Optimistic locking for concurrent updates

---

## 📊 Business Rule Summary by Module

| Module | Total Rules | Critical Rules |
|--------|-------------|----------------|
| Authentication & Authorization | 35 | 15 |
| User Management | 10 | 5 |
| Course Management | 30 | 12 |
| Enrollment & Payment | 20 | 10 |
| Learning Progress & Assessment | 25 | 8 |
| Flashcard & SRS System | 20 | 10 |
| Live Classes (WebRTC) | 7 | 4 |
| Content Management | 10 | 3 |
| File Upload & Storage | 12 | 4 |
| System-Wide Rules | 35 | 15 |
| **TOTAL** | **204** | **86** |

---

## 🔍 Validation Checklist

Before deploying any feature, ensure:

- [ ] All business rules are implemented
- [ ] System messages are user-friendly and informative
- [ ] Error handling covers all edge cases
- [ ] Rate limiting is configured
- [ ] Audit logging is enabled for critical actions
- [ ] Security measures are in place (encryption, hashing, validation)
- [ ] Performance optimizations applied (caching, indexing, pagination)
- [ ] Data integrity constraints enforced
- [ ] Unit tests cover business rules
- [ ] Integration tests cover workflows

---

**Last Updated:** 2026-01-11  
**Version:** 1.0  
**Status:** ✅ Complete

