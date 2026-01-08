# Software Requirements Specification (SRS)
## Section 9: Acceptance Criteria

---

## 9.1 Acceptance Test Overview

Acceptance criteria được định nghĩa dựa trên user stories và functional requirements. Mỗi criteria phải có thể test được và có thể verify được.

---

## 9.2 Learner Acceptance Criteria

### AC-L01: Course Browsing and Purchase

**User Story:** As a learner, I want to browse and purchase courses so that I can start learning.

**Acceptance Criteria:**
1. ✅ Learner can view course catalog with pagination
2. ✅ Learner can filter courses by JLPT level (N5-N1)
3. ✅ Learner can filter courses by type (VOD, Live)
4. ✅ Learner can search courses by title or tags
5. ✅ Learner can view course details including modules, lessons, instructors, price
6. ✅ Learner can preview course video
7. ✅ Learner can add course to wishlist
8. ✅ Learner can purchase course with payment gateway
9. ✅ Learner can apply coupon code during purchase
10. ✅ Learner receives enrollment confirmation email
11. ✅ Learner can gift course to another user

**Test Cases:**
- TC-L01-01: Browse courses with filters
- TC-L01-02: Search courses
- TC-L01-03: View course details
- TC-L01-04: Purchase course with payment
- TC-L01-05: Apply coupon code
- TC-L01-06: Gift course

---

### AC-L02: Access Course Content

**User Story:** As a learner, I want to access video-based courses so that I can learn at my own pace.

**Acceptance Criteria:**
1. ✅ Learner can view enrolled courses in "My Courses"
2. ✅ Learner can navigate through course modules and lessons
3. ✅ Learner can watch video lessons
4. ✅ System tracks lesson progress (watched duration)
5. ✅ System marks lesson as completed when 90%+ watched
6. ✅ Learner can take notes while watching
7. ✅ Learner can resume from last watched position
8. ✅ System updates course completion percentage
9. ✅ Learner receives certificate when course completed

**Test Cases:**
- TC-L02-01: Access enrolled course
- TC-L02-02: Watch video lesson
- TC-L02-03: Progress tracking
- TC-L02-04: Lesson completion
- TC-L02-05: Course completion

---

### AC-L03: Join Live Classes

**User Story:** As a learner, I want to join live classes so that I can learn interactively.

**Acceptance Criteria:**
1. ✅ Learner can view upcoming live class schedule
2. ✅ Learner can register for live class
3. ✅ Learner receives reminder notification before class starts
4. ✅ Learner can join live class at scheduled time
5. ✅ Learner can see lecturer and other students
6. ✅ Learner can use interactive whiteboard
7. ✅ Learner can send chat messages
8. ✅ Learner can share screen (if permitted)
9. ✅ System tracks attendance
10. ✅ Learner can access class materials after class

**Test Cases:**
- TC-L03-01: View live class schedule
- TC-L03-02: Register for live class
- TC-L03-03: Join live class
- TC-L03-04: Interactive features (whiteboard, chat)
- TC-L03-05: Attendance tracking

---

### AC-L04: Take Quizzes and Exams

**User Story:** As a learner, I want to take practice tests and JLPT exams so that I can assess my knowledge.

**Acceptance Criteria:**
1. ✅ Learner can view available quizzes
2. ✅ Learner can filter quizzes by type (practice, JLPT mock)
3. ✅ Learner can filter quizzes by JLPT level
4. ✅ Learner can start quiz attempt
5. ✅ System enforces time limit
6. ✅ Learner can flag questions for review
7. ✅ Learner can submit quiz
8. ✅ System auto-grades quiz
9. ✅ Learner can view detailed results with explanations
10. ✅ System tracks attempt history
11. ✅ System enforces max attempts limit

**Test Cases:**
- TC-L04-01: View available quizzes
- TC-L04-02: Start quiz attempt
- TC-L04-03: Answer questions with time limit
- TC-L04-04: Submit quiz
- TC-L04-05: View results
- TC-L04-06: Max attempts enforcement

---

### AC-L05: Study Flashcards

**User Story:** As a learner, I want to create and study flashcards so that I can memorize vocabulary.

**Acceptance Criteria:**
1. ✅ Learner can create flashcard decks
2. ✅ Learner can add flashcards to deck
3. ✅ Learner can study flashcards with SRS algorithm
4. ✅ System calculates next review date based on performance
5. ✅ Learner can rate difficulty (Again, Hard, Good, Easy)
6. ✅ System tracks review history
7. ✅ Learner can view deck statistics
8. ✅ Learner can share public decks
9. ✅ Learner can import/export decks

**Test Cases:**
- TC-L05-01: Create flashcard deck
- TC-L05-02: Add flashcards
- TC-L05-03: Study flashcards
- TC-L05-04: SRS algorithm calculation
- TC-L05-05: Deck statistics

---

## 9.3 Lecturer Acceptance Criteria

### AC-T01: Manage Live Classes

**User Story:** As a lecturer, I want to manage live classes so that I can teach effectively.

**Acceptance Criteria:**
1. ✅ Lecturer can view assigned live classes
2. ✅ Lecturer can create new live class
3. ✅ Lecturer can schedule live class with date/time
4. ✅ Lecturer can set maximum students
5. ✅ Lecturer can start live session
6. ✅ Lecturer can end live session
7. ✅ Lecturer can view enrolled students
8. ✅ Lecturer can check attendance
9. ✅ Lecturer can upload class materials
10. ✅ Lecturer can view class analytics

**Test Cases:**
- TC-T01-01: View assigned classes
- TC-T01-02: Create live class
- TC-T01-03: Start/end live session
- TC-T01-04: Manage attendance
- TC-T01-05: Upload materials

---

### AC-T02: Manage Assignments

**User Story:** As a lecturer, I want to assign and grade assignments so that I can assess student progress.

**Acceptance Criteria:**
1. ✅ Lecturer can create assignment
2. ✅ Lecturer can set due date and max score
3. ✅ Lecturer can attach files to assignment
4. ✅ Lecturer can view student submissions
5. ✅ Lecturer can grade submissions
6. ✅ Lecturer can provide feedback
7. ✅ System calculates late submission penalty
8. ✅ Lecturer can view submission statistics

**Test Cases:**
- TC-T02-01: Create assignment
- TC-T02-02: View submissions
- TC-T02-03: Grade submission
- TC-T02-04: Late submission handling

---

## 9.4 Staff Acceptance Criteria

### AC-S01: Manage Courses

**User Story:** As staff, I want to manage courses so that I can maintain course catalog.

**Acceptance Criteria:**
1. ✅ Staff can create new course
2. ✅ Staff can edit course details
3. ✅ Staff can add modules and lessons
4. ✅ Staff can upload course videos
5. ✅ Staff can set course price
6. ✅ Staff can publish course
7. ✅ Staff can archive course
8. ✅ Staff can view course statistics

**Test Cases:**
- TC-S01-01: Create course
- TC-S01-02: Add modules/lessons
- TC-S01-03: Upload videos
- TC-S01-04: Publish course

---

### AC-S02: Manage Question Bank

**User Story:** As staff, I want to manage question bank so that I can create quality quizzes.

**Acceptance Criteria:**
1. ✅ Staff can create questions
2. ✅ Staff can categorize questions by JLPT level
3. ✅ Staff can categorize questions by type (vocab, grammar, reading, listening)
4. ✅ Staff can set difficulty level
5. ✅ Staff can add explanations
6. ✅ Staff can edit/delete questions
7. ✅ Staff can bulk import questions
8. ✅ Staff can view question usage statistics

**Test Cases:**
- TC-S02-01: Create question
- TC-S02-02: Categorize questions
- TC-S02-03: Bulk import
- TC-S02-04: Question statistics

---

### AC-S03: Manage Coupons

**User Story:** As staff, I want to manage coupons so that I can run promotions.

**Acceptance Criteria:**
1. ✅ Staff can create coupon
2. ✅ Staff can set discount type (percentage, fixed amount)
3. ✅ Staff can set validity period
4. ✅ Staff can set usage limits
5. ✅ Staff can apply to specific courses
6. ✅ Staff can view coupon usage statistics
7. ✅ Staff can deactivate coupon

**Test Cases:**
- TC-S03-01: Create coupon
- TC-S03-02: Set discount rules
- TC-S03-03: View usage statistics
- TC-S03-04: Deactivate coupon

---

## 9.5 Admin Acceptance Criteria

### AC-A01: Manage Users

**User Story:** As admin, I want to manage users so that I can control system access.

**Acceptance Criteria:**
1. ✅ Admin can view all users
2. ✅ Admin can search/filter users
3. ✅ Admin can activate/deactivate users
4. ✅ Admin can change user roles
5. ✅ Admin can reset user passwords
6. ✅ Admin can view user activity logs
7. ✅ Admin can ban users temporarily/permanently

**Test Cases:**
- TC-A01-01: View users
- TC-A01-02: Activate/deactivate user
- TC-A01-03: Change user role
- TC-A01-04: View activity logs

---

### AC-A02: Manage Payments

**User Story:** As admin, I want to manage payments so that I can track revenue.

**Acceptance Criteria:**
1. ✅ Admin can view all payments
2. ✅ Admin can filter payments by status, date, user
3. ✅ Admin can view payment details
4. ✅ Admin can verify payment status
5. ✅ Admin can process refunds
6. ✅ Admin can view revenue statistics
7. ✅ Admin can export payment reports

**Test Cases:**
- TC-A02-01: View payments
- TC-A02-02: Filter payments
- TC-A02-03: Verify payment
- TC-A02-04: Process refund
- TC-A02-05: Revenue reports

---

## 9.6 System-Level Acceptance Criteria

### AC-SYS01: Performance

**Acceptance Criteria:**
1. ✅ API response time < 200ms (95th percentile)
2. ✅ Page load time < 2 seconds
3. ✅ Database query time < 100ms (average)
4. ✅ System supports 1000+ concurrent users
5. ✅ Live class supports 50+ participants

**Test Cases:**
- TC-SYS01-01: API performance test
- TC-SYS01-02: Page load performance
- TC-SYS01-03: Database performance
- TC-SYS01-04: Load testing
- TC-SYS01-05: Live class capacity test

---

### AC-SYS02: Security

**Acceptance Criteria:**
1. ✅ All API endpoints require authentication
2. ✅ Passwords are hashed (Argon2/bcrypt)
3. ✅ JWT tokens expire after 24 hours
4. ✅ HTTPS enforced for all connections
5. ✅ SQL injection prevention (Prisma ORM)
6. ✅ XSS prevention (Content Security Policy)
7. ✅ CSRF protection enabled
8. ✅ Rate limiting implemented

**Test Cases:**
- TC-SYS02-01: Authentication required
- TC-SYS02-02: Password hashing
- TC-SYS02-03: HTTPS enforcement
- TC-SYS02-04: SQL injection test
- TC-SYS02-05: XSS prevention test
- TC-SYS02-06: Rate limiting test

---

### AC-SYS03: Reliability

**Acceptance Criteria:**
1. ✅ System uptime > 99.9%
2. ✅ Database backups daily
3. ✅ Automatic failover for database
4. ✅ Error handling for all operations
5. ✅ Graceful degradation when services unavailable

**Test Cases:**
- TC-SYS03-01: Uptime monitoring
- TC-SYS03-02: Backup verification
- TC-SYS03-03: Failover test
- TC-SYS03-04: Error handling test
- TC-SYS03-05: Degradation test

---

## 9.7 Test Priority Matrix

| Test Case | Priority | Criticality | Estimated Time |
|-----------|----------|-------------|----------------|
| TC-L01-04 | P0 | High | 2h |
| TC-L02-02 | P0 | High | 1h |
| TC-L03-03 | P0 | High | 2h |
| TC-L04-04 | P1 | High | 1h |
| TC-T01-03 | P1 | Medium | 1h |
| TC-S01-01 | P1 | Medium | 2h |
| TC-A01-02 | P2 | Medium | 1h |
| TC-SYS01-04 | P1 | High | 4h |
| TC-SYS02-01 | P0 | High | 1h |

**Priority Levels:**
- **P0:** Must test before release
- **P1:** Should test before release
- **P2:** Nice to have, can test later

---

## 9.8 Acceptance Test Execution

### Test Environment
- **Development:** Local environment với Docker
- **Staging:** Production-like environment
- **Production:** Live environment (smoke tests only)

### Test Execution Plan
1. **Unit Tests:** Automated, run on every commit
2. **Integration Tests:** Automated, run on PR merge
3. **E2E Tests:** Automated, run nightly
4. **Manual Tests:** User acceptance testing (UAT)
5. **Performance Tests:** Weekly load testing
6. **Security Tests:** Monthly security audit

### Test Reporting
- Test results published to dashboard
- Failed tests trigger alerts
- Test coverage reports
- Performance metrics tracking

---

**Next Section:** [Section 10: Appendices](srs-09-appendices.md)

