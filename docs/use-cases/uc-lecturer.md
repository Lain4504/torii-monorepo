# Use Case Specifications: Lecturer Features

**Project:** Torii Nihongo Learning Platform  
**Module:** Lecturer Features  
**Use Cases:** UC-028 to UC-030  
**Version:** 1.0  
**Date:** January 2026

---

## Table of Contents

1. [UC-028: View Assigned Classes](#uc-028-view-assigned-classes)
2. [UC-029: Manage Live Session](#uc-029-manage-live-session)
3. [UC-030: Manage Assignments](#uc-030-manage-assignments)

---

## UC-028: View Assigned Classes

### Primary Actor
- Lecturer

### Secondary Actor
- None

### Description
As a lecturer, I want to view my assigned classes so that I can manage my teaching schedule.

### Trigger
**Navigation path:** Dashboard → My Classes

**Direct trigger:** User clicks "My Classes"

### Pre-condition
- User is logged in as Lecturer

### Post-condition
- Assigned classes list is displayed

### Validation Rules
- None

### Business Rules
- None specific

### Normal Flow
1. User navigates to "My Classes"
2. System retrieves courses where user is instructor
3. System displays class list with:
   - Course title
   - Course thumbnail
   - Number of enrolled students
   - Course status (draft, published)
   - Last updated date
   - "Manage" button
   - "View Analytics" button
4. System displays filters:
   - All Courses
   - Published
   - Draft
5. System displays "Create Course" button (if permitted)
6. System displays statistics:
   - Total students across all courses
   - Total courses
   - Average rating

### Alternative Flows

**Alternative Flow A: No Assigned Classes**
- System displays empty state
- "Contact admin to get assigned" message

**Alternative Flow B: View Course Analytics**
- User clicks "View Analytics"
- System displays:
  - Enrollment trend
  - Completion rate
  - Average quiz scores
  - Student engagement

---

## UC-029: Manage Live Session

### Primary Actor
- Lecturer

### Secondary Actor
- LiveKit Server
- NATS

### Description
As a lecturer, I want to start, manage, and end live class sessions so that I can teach students in real-time.

### Trigger
**Navigation path:** My Classes → Live Class → Manage

**Direct trigger:** User clicks "Start Class" or "Manage Session"

### Pre-condition
- User is assigned as instructor for live class
- Live class is scheduled

### Post-condition
- **Start:** Live class room is created and started
- **Manage:** Session settings are updated
- **End:** Live class is ended, recording saved

### Validation Rules
- None

### Business Rules
- **BR-ROOM-002:** Room status tracking
- **BR-ROOM-003:** Recording status tracking

### Normal Flow (Start Live Class)
1. User clicks "Start Class"
2. System creates LiveKit room
3. System generates instructor token with full permissions
4. System redirects to LiveKit room
5. Instructor joins room
6. System updates room status = 'running'
7. System sends notifications to registered students
8. System displays instructor controls:
   - Mute/unmute all
   - Enable/disable chat
   - Start/stop recording
   - Share screen
   - Create polls
   - Manage participants

### Normal Flow (Manage Session)
1. Instructor uses control panel
2. **Mute/Unmute Participants:**
   - Select participant
   - Click mute/unmute
3. **Enable/Disable Chat:**
   - Toggle chat on/off
4. **Start/Stop Recording:**
   - Click "Start Recording"
   - System starts recording to S3
   - Click "Stop Recording"
   - System saves recording
5. **Share Screen:**
   - Click "Share Screen"
   - Select screen/window
   - System broadcasts screen
6. **Create Poll:**
   - Click "Create Poll"
   - Enter question and options
   - System broadcasts poll to participants
   - System collects responses
   - System displays results
7. **Manage Participants:**
   - View participant list
   - Promote to co-host
   - Remove participant
   - Spotlight participant

### Normal Flow (End Live Class)
1. Instructor clicks "End Class"
2. System displays confirmation dialog
3. Instructor confirms
4. System stops recording (if active)
5. System saves recording to S3
6. System ends LiveKit room
7. System updates room status = 'ended'
8. System calculates attendance for all participants
9. System sends class summary email to participants
10. System redirects instructor to class summary page

### Alternative Flows

**Alternative Flow A: Technical Issues**
- Connection lost: Auto-reconnect
- Recording failed: Display error, allow retry

**Alternative Flow B: Emergency End**
- Instructor force-ends class
- System saves partial recording
- System notifies participants

---

## UC-030: Manage Assignments

### Primary Actor
- Lecturer

### Secondary Actor
- Email Service
- File Storage Service

### Description
As a lecturer, I want to create, review, grade, and provide feedback on assignments so that I can assess student learning.

### Trigger
**Navigation path:** My Classes → Course → Assignments

**Direct trigger:** User clicks "Create Assignment" or "Review Submissions"

### Pre-condition
- User is assigned as instructor for course

### Post-condition
- **Create:** Assignment is created and published
- **Review:** Submissions are viewed
- **Grade:** Scores are assigned
- **Feedback:** Comments are provided to students

### Validation Rules
- **VR-ASSIGN-001:** Assignment title is required
- **VR-ASSIGN-002:** Due date must be in future
- **VR-ASSIGN-003:** Max points must be positive number

### Business Rules
- None specific

### Normal Flow (Create Assignment)
1. User clicks "Create Assignment"
2. System displays assignment form
3. User fills in:
   - Title
   - Description
   - Due date
   - Max points
   - Attachments (optional)
4. User clicks "Publish"
5. System creates assignment
6. System sends notification to enrolled students
7. System displays success message

### Normal Flow (Review Submissions)
1. User navigates to assignment
2. System displays submissions list with:
   - Student name
   - Submission date
   - Status (submitted, late, not submitted)
   - Grade (if graded)
3. User clicks on submission
4. System displays:
   - Student's work
   - Submitted files
   - Submission date
   - Grade input field
   - Feedback text area

### Normal Flow (Grade Assignment)
1. User reviews student's work
2. User enters grade (0 to max points)
3. User clicks "Save Grade"
4. System validates grade
5. System saves grade
6. System sends notification to student

### Normal Flow (Provide Feedback)
1. User writes feedback comments
2. User can attach files (rubric, corrections)
3. User clicks "Send Feedback"
4. System saves feedback
5. System sends email to student with feedback
6. System displays success message

### Alternative Flows

**Alternative Flow A: Bulk Grading**
- User selects multiple submissions
- User enters same grade for all
- System applies grade to all selected

**Alternative Flow B: Late Submission**
- System marks submission as "Late"
- Lecturer can apply late penalty
- System calculates adjusted grade

---

**Last Updated:** 2026-01-12  
**Version:** 1.0  
**Status:** ✅ Complete
