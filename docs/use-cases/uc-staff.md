# Use Case Specifications: Staff Features

**Project:** Torii Nihongo Learning Platform  
**Module:** Staff Features  
**Use Cases:** UC-031 to UC-038  
**Version:** 1.0  
**Date:** January 2026

---

## Table of Contents

1. [UC-031: Manage Courses](#uc-031-manage-courses)
2. [UC-032: Manage Posts](#uc-032-manage-posts)
3. [UC-033: Assign Lecturers](#uc-033-assign-lecturers)
4. [UC-034: Schedule Live Class](#uc-034-schedule-live-class)
5. [UC-035: Monitor Live Session](#uc-035-monitor-live-session)
6. [UC-036: Manage Question Bank](#uc-036-manage-question-bank)
7. [UC-037: Manage Exams](#uc-037-manage-exams)
8. [UC-038: Manage Coupons](#uc-038-manage-coupons)

---

## UC-031: Manage Courses

### Primary Actor
- Staff, Admin, Lecturer

### Secondary Actor
- File Storage Service
- NATS (for events)

### Description
As staff/admin/lecturer, I want to create, view, update, delete courses and manage lessons so that I can maintain course content.

### Trigger
**Navigation path:** Dashboard → Courses → Manage

**Direct trigger:** User clicks "Create Course" or "Edit Course"

### Pre-condition
- User has role: Staff, Admin, or Lecturer
- For update/delete: Course exists

### Post-condition
- **Create:** New course is created
- **Update:** Course is updated
- **Delete:** Course is soft-deleted
- **Manage Lessons:** Lessons are created/updated/deleted

### Validation Rules
- **VR-COURSE-001:** Title is required, max 255 characters
- **VR-COURSE-002:** JLPT level must be valid (N5, N4, N3, N2, N1)
- **VR-COURSE-003:** Price must be non-negative

### Business Rules
- **BR-COURSE-001:** Only admin and lecturer can create courses
- **BR-COURSE-003:** Slug auto-generated from title
- **BR-COURSE-005:** New courses default to draft status

### Normal Flow (Create Course)
1. User clicks "Create Course"
2. System displays course creation form
3. User fills in course details
4. User uploads thumbnail
5. User clicks "Create"
6. System validates input
7. System generates unique slug
8. System uploads thumbnail to S3
9. System creates course with status = 'draft'
10. System displays success message
11. System redirects to course editor

### Normal Flow (Update Course)
1. User clicks "Edit" on course
2. System displays edit form with current values
3. User modifies course details
4. User clicks "Save"
5. System validates input
6. System updates course
7. If published: System emits course.updated event
8. System displays success message

### Normal Flow (Delete Course)
1. User clicks "Delete" on course
2. System displays confirmation dialog
3. User confirms deletion
4. System soft-deletes course (sets deletedAt)
5. System displays success message

### Normal Flow (Manage Lessons)
1. User navigates to course curriculum
2. System displays module and lesson tree
3. **Create Module:**
   - User clicks "Add Module"
   - User enters module title
   - System creates module
4. **Create Lesson:**
   - User clicks "Add Lesson" in module
   - User enters lesson details
   - User uploads video/materials
   - System creates lesson
5. **Reorder Lessons:**
   - User drags and drops lessons
   - System updates orderIndex
6. **Delete Lesson:**
   - User clicks "Delete" on lesson
   - System confirms and deletes

### Alternative Flows

**Alternative Flow A: Publish Course**
- User clicks "Publish Course"
- System validates course has content
- System sets status = 'published'
- System emits course.published event

**Alternative Flow B: Duplicate Course**
- User clicks "Duplicate"
- System creates copy with "(Copy)" suffix
- New course is in draft status

---

## UC-032: Manage Posts

### Primary Actor
- Staff, Admin

### Secondary Actor
- File Storage Service

### Description
As staff/admin, I want to create, view, update, and delete blog posts so that I can manage platform content.

### Trigger
**Navigation path:** Dashboard → Content → Posts

**Direct trigger:** User clicks "Create Post" or "Edit Post"

### Pre-condition
- User has role: Staff or Admin

### Post-condition
- **Create:** New post is created
- **Update:** Post is updated
- **Delete:** Post is soft-deleted

### Validation Rules
- **VR-POST-001:** Title is required
- **VR-POST-002:** Slug must be unique
- **VR-POST-003:** Content is required

### Business Rules
- **BR-POST-001:** Post slug must be unique
- **BR-POST-003:** Author ID is required

### Normal Flow (Create Post)
1. User clicks "Create Post"
2. System displays rich text editor
3. User writes post content
4. User uploads featured image
5. User adds tags
6. User clicks "Publish" or "Save Draft"
7. System validates input
8. System generates slug from title
9. System creates post
10. System displays success message

### Normal Flow (Update Post)
1. User clicks "Edit" on post
2. System displays editor with current content
3. User modifies post
4. User clicks "Save"
5. System updates post
6. System displays success message

### Normal Flow (Delete Post)
1. User clicks "Delete" on post
2. System confirms deletion
3. System soft-deletes post
4. System displays success message

### Alternative Flows
**Alternative Flow A: Slug Conflict**
- System detects duplicate slug
- System appends number to make unique

---

## UC-033: Assign Lecturers

### Primary Actor
- Staff, Admin

### Secondary Actor
- Email Service

### Description
As staff/admin, I want to assign lecturers to courses so that they can manage course content.

### Trigger
**Navigation path:** Dashboard → Courses → Assign Lecturer

**Direct trigger:** User clicks "Assign Lecturer"

### Pre-condition
- User has role: Staff or Admin
- Course exists
- Lecturer user exists

### Post-condition
- Lecturer is assigned to course
- Lecturer receives notification email

### Validation Rules
- **VR-ASSIGN-001:** Lecturer must have Lecturer role

### Business Rules
- None specific

### Normal Flow
1. User navigates to course
2. User clicks "Assign Lecturer"
3. System displays lecturer selection dialog
4. System shows list of users with Lecturer role
5. User selects lecturer(s)
6. User clicks "Assign"
7. System creates course-lecturer relationship
8. System sends notification email to lecturer
9. System displays success message

### Alternative Flows
**Alternative Flow A: Remove Lecturer**
- User clicks "Remove" on assigned lecturer
- System confirms removal
- System removes relationship

---

## UC-034: Schedule Live Class

### Primary Actor
- Staff, Admin

### Secondary Actor
- Email Service
- LiveKit Server

### Description
As staff/admin, I want to schedule live classes so that students can attend real-time lessons.

### Trigger
**Navigation path:** Dashboard → Live Classes → Schedule

**Direct trigger:** User clicks "Schedule Live Class"

### Pre-condition
- User has role: Staff or Admin
- Course exists
- Lecturer is assigned

### Post-condition
- Live class is scheduled
- LiveKit room is created
- Notifications sent to enrolled students

### Validation Rules
- **VR-LIVE-001:** Start time must be in future
- **VR-LIVE-002:** Duration must be positive
- **VR-LIVE-003:** Max students must be positive

### Business Rules
- None specific

### Normal Flow
1. User clicks "Schedule Live Class"
2. System displays scheduling form
3. User fills in:
   - Title
   - Description
   - Start date/time
   - Duration
   - Max students
   - Related course
   - Assigned lecturer
4. User clicks "Schedule"
5. System validates input
6. System creates live class record
7. System creates LiveKit room
8. System sends calendar invites to enrolled students
9. System displays success message

### Alternative Flows
**Alternative Flow A: Recurring Classes**
- User selects "Recurring"
- User sets recurrence pattern
- System creates multiple class instances

---

## UC-035: Monitor Live Session

### Primary Actor
- Staff, Admin

### Secondary Actor
- LiveKit Server

### Description
As staff/admin, I want to monitor live sessions so that I can ensure quality and handle issues.

### Trigger
**Navigation path:** Dashboard → Live Classes → Monitor

**Direct trigger:** User clicks "Monitor Session"

### Pre-condition
- User has role: Staff or Admin
- Live class is running

### Post-condition
- Session metrics are displayed

### Validation Rules
- None

### Business Rules
- None specific

### Normal Flow
1. User navigates to live sessions
2. System displays active sessions list
3. User clicks "Monitor" on session
4. System displays monitoring dashboard:
   - Participant count
   - Connection quality metrics
   - Chat messages
   - Recording status
   - Duration
5. System displays "Join as Observer" button
6. System auto-refreshes metrics every 5 seconds

### Alternative Flows
**Alternative Flow A: Join as Observer**
- User clicks "Join as Observer"
- System generates observer token
- User joins room (hidden from participants)

---

## UC-036: Manage Question Bank

### Primary Actor
- Staff, Admin

### Secondary Actor
- AI Service (for auto-generation)

### Description
As staff/admin, I want to create, view, update, and delete questions so that I can build quizzes and exams.

### Trigger
**Navigation path:** Dashboard → Assessments → Question Bank

**Direct trigger:** User clicks "Create Question" or "Edit Question"

### Pre-condition
- User has role: Staff or Admin

### Post-condition
- **Create:** Question is created
- **Update:** Question is updated
- **Delete:** Question is deleted or archived

### Validation Rules
- **VR-QUESTION-001:** Question text is required
- **VR-QUESTION-002:** Multiple choice must have >= 2 options
- **VR-QUESTION-003:** Correct answer is required (except essay)

### Business Rules
- **BR-QUESTION-002:** Multiple choice questions must have at least 2 options
- **BR-QUESTION-005:** Questions in use cannot be deleted

### Normal Flow (Create Question)
1. User clicks "Create Question"
2. System displays question form
3. User selects question type
4. User fills in question details
5. For multiple choice: User adds options
6. User marks correct answer
7. User adds explanation (optional)
8. User clicks "Save"
9. System validates input
10. System creates question
11. System displays success message

### Normal Flow (Bulk Create)
1. User clicks "Bulk Create"
2. User uploads CSV/Excel file
3. System parses file
4. System validates all questions
5. System creates questions in batch
6. System displays import summary

### Normal Flow (Update Question)
1. User clicks "Edit" on question
2. System displays edit form
3. User modifies question
4. User clicks "Save"
5. System updates question
6. System displays success message

### Normal Flow (Delete Question)
1. User clicks "Delete" on question
2. System checks if question is in use
3. If not in use: System deletes question
4. If in use: System archives question instead
5. System displays success message

### Alternative Flows
**Alternative Flow A: AI Generation**
- User clicks "Generate with AI"
- User provides topic/text
- AI generates questions
- User reviews and edits
- User saves selected questions

---

## UC-037: Manage Exams

### Primary Actor
- Staff, Admin

### Secondary Actor
- None

### Description
As staff/admin, I want to create and update exams so that students can take assessments.

### Trigger
**Navigation path:** Dashboard → Assessments → Exams

**Direct trigger:** User clicks "Create Exam" or "Edit Exam"

### Pre-condition
- User has role: Staff or Admin
- Question bank has questions

### Post-condition
- **Create:** Exam is created
- **Update:** Exam is updated

### Validation Rules
- **VR-EXAM-001:** Title is required
- **VR-EXAM-002:** At least 1 question required
- **VR-EXAM-003:** Time limit must be positive (if set)

### Business Rules
- **BR-QUIZ-005:** maxAttempts limits number of attempts

### Normal Flow (Create Exam)
1. User clicks "Create Exam"
2. System displays exam builder
3. User enters exam details:
   - Title
   - Description
   - Time limit
   - Passing score
   - Max attempts
4. User adds questions:
   - Search question bank
   - Select questions
   - Set points per question
5. User sets question order
6. User clicks "Publish"
7. System creates exam
8. System displays success message

### Normal Flow (Update Exam)
1. User clicks "Edit" on exam
2. System displays exam builder
3. User modifies exam settings
4. User adds/removes questions
5. User clicks "Save"
6. System updates exam
7. System displays success message

### Alternative Flows
**Alternative Flow A: Randomize Questions**
- User enables "Shuffle Questions"
- System randomizes question order for each attempt

---

## UC-038: Manage Coupons

### Primary Actor
- Staff, Admin

### Secondary Actor
- None

### Description
As staff/admin, I want to create, view, update, and delete coupons so that I can offer discounts to students.

### Trigger
**Navigation path:** Dashboard → Marketing → Coupons

**Direct trigger:** User clicks "Create Coupon"

### Pre-condition
- User has role: Staff or Admin

### Post-condition
- **Create:** Coupon is created
- **Update:** Coupon is updated
- **Delete:** Coupon is deleted

### Validation Rules
- **VR-COUPON-001:** Code is required and unique
- **VR-COUPON-002:** Discount must be positive
- **VR-COUPON-003:** Expiry date must be in future

### Business Rules
- None specific

### Normal Flow (Create Coupon)
1. User clicks "Create Coupon"
2. System displays coupon form
3. User fills in:
   - Code (e.g., "SUMMER2026")
   - Discount type (percentage or fixed amount)
   - Discount value
   - Expiry date
   - Usage limit
   - Applicable courses (optional)
4. User clicks "Create"
5. System validates input
6. System creates coupon
7. System displays success message

### Normal Flow (Update Coupon)
1. User clicks "Edit" on coupon
2. System displays edit form
3. User modifies coupon details
4. User clicks "Save"
5. System updates coupon
6. System displays success message

### Normal Flow (Delete Coupon)
1. User clicks "Delete" on coupon
2. System confirms deletion
3. System deletes coupon
4. System displays success message

### Alternative Flows
**Alternative Flow A: View Usage Statistics**
- User clicks "View Stats" on coupon
- System displays:
  - Times used
  - Total discount given
  - Revenue generated

---

**Last Updated:** 2026-01-12  
**Version:** 1.0  
**Status:** ✅ Complete
