# Use Case Specifications: Learning & Assessments

**Project:** Torii Nihongo Learning Platform  
**Module:** Learning & Progress, Assessments  
**Use Cases:** UC-014 to UC-018  
**Version:** 1.0  
**Date:** January 2026

---

## Table of Contents

1. [UC-014: Access Video Lesson](#uc-014-access-video-lesson)
2. [UC-015: View Learning Progress](#uc-015-view-learning-progress)
3. [UC-016: Take Quiz](#uc-016-take-quiz)
4. [UC-017: Take JLPT Practice Test](#uc-017-take-jlpt-practice-test)
5. [UC-018: View Test Result](#uc-018-view-test-result)

---

## UC-014: Access Video Lesson

### Primary Actor
- Learner

### Secondary Actor
- File Storage Service (S3/MinIO)
- Progress Tracking Service

### Description
As a learner, I want to watch video lessons so that I can learn course content.

### Trigger
**Navigation path:** My Courses → Course → Lesson

**Direct trigger:** User clicks on a lesson

### Pre-condition
- User is enrolled in course
- Lesson is unlocked or is preview lesson

### Post-condition
- Video player loads and plays lesson
- Progress is tracked and saved

### Validation Rules
- None

### Business Rules
- **BR-CURRICULUM-004:** Preview lessons accessible without enrollment
- **BR-CURRICULUM-005:** Locked lessons require enrollment

### Normal Flow
1. User clicks on lesson in curriculum
2. System checks enrollment status
3. System checks if lesson is unlocked
4. System retrieves video URL from S3/MinIO
5. System loads video player with:
   - Video controls (play, pause, volume, fullscreen)
   - Playback speed options (0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x)
   - Quality selection (360p, 480p, 720p, 1080p)
   - Subtitles (if available - EN, VI, JP)
6. User watches video
7. System tracks progress every 5 seconds:
   - Updates watchedDuration
   - Updates lastWatchedAt
   - Saves current timestamp
8. When video reaches 90%:
   - System marks lesson as completed
   - System updates course progress percentage
9. System displays "Next Lesson" button
10. System displays lesson resources (if available):
    - Downloadable materials
    - Transcript
    - Notes

### Alternative Flows

**Alternative Flow A: Lesson Locked**
- 3a.1. Lesson is locked (isUnlocked = false)
- 3a.2. User is not enrolled or hasn't completed prerequisites
- 3a.3. System displays "This lesson is locked"
- 3a.4. System shows "Complete previous lessons" message
- 3a.5. End use case

**Alternative Flow B: Not Enrolled**
- 2b.1. User is not enrolled in course
- 2b.2. If lesson is preview (isPreview = true): Allow access
- 2b.3. If lesson is not preview: Display "Enroll to access this lesson"
- 2b.4. System shows "Enroll Now" button
- 2b.5. End use case

**Alternative Flow C: Resume Playback**
- 6c.1. User previously watched part of video (watchedDuration > 0)
- 6c.2. System displays modal: "Resume from {timestamp} or Start from beginning?"
- 6c.3. User selects option
- 6c.4. System starts playback from selected position

**Alternative Flow D: Video Loading Failed**
- 4d.1. S3/MinIO returns error or video file not found
- 4d.2. System displays error: "Video failed to load. Please try again."
- 4d.3. System provides "Retry" button
- 4d.4. System logs error for admin review

**Alternative Flow E: Network Issues**
- 6e.1. User's network connection is slow or interrupted
- 6e.2. Video player automatically adjusts quality
- 6e.3. System displays buffering indicator
- 6e.4. System saves last watched position
- 6e.5. User can resume when connection improves

---

## UC-015: View Learning Progress

### Primary Actor
- Learner

### Secondary Actor
- None

### Description
As a learner, I want to view my learning progress so that I can track my course completion.

### Trigger
**Navigation path:** My Courses → Course → Progress

**Direct trigger:** User clicks "View Progress" in course

### Pre-condition
- User is enrolled in course

### Post-condition
- Progress dashboard is displayed

### Validation Rules
- None

### Business Rules
- **BR-PROGRESS-001:** Completion percentage between 0 and 100
- **BR-PROGRESS-002:** Auto-complete at 100%

### Normal Flow
1. User navigates to course progress page
2. System retrieves enrollment data
3. System calculates progress metrics:
   - Overall completion percentage
   - Lessons completed / Total lessons
   - Quizzes completed / Total quizzes
   - Time spent learning
   - Streak (consecutive days of learning)
4. System displays progress dashboard with:
   - **Progress Bar:** Visual representation of completion
   - **Completion Statistics:**
     - X% Complete
     - X of Y lessons completed
     - X of Y quizzes completed
   - **Module-by-Module Breakdown:**
     - Each module with completion percentage
     - Lessons completed per module
   - **Recent Activity:**
     - Last 5 lessons accessed
     - Recent quiz attempts
   - **Achievements/Badges:**
     - Milestones reached (25%, 50%, 75%, 100%)
     - Perfect quiz scores
     - Streak achievements
   - **Time Statistics:**
     - Total time spent
     - Average daily time
     - Learning streak
5. System displays certificate button (if course completed)
6. System displays "Continue Learning" button

### Alternative Flows

**Alternative Flow A: Course Completed**
- 4a.1. Completion percentage = 100%
- 4a.2. System displays "Congratulations!" message
- 4a.3. System shows "Download Certificate" button
- 4a.4. System displays completion date
- 4a.5. System shows course review prompt
- 4a.6. System suggests related courses

**Alternative Flow B: Download Certificate**
- 5b.1. User clicks "Download Certificate"
- 5b.2. System generates PDF certificate with:
   - Student name
   - Course title
   - Completion date
   - Certificate ID
   - QR code for verification
- 5b.3. System downloads certificate
- 5b.4. System records certificate issuance

**Alternative Flow C: No Progress Yet**
- 3c.1. User just enrolled, no lessons completed
- 3c.2. System displays 0% progress
- 3c.3. System shows "Start Learning" button
- 3c.4. System displays course curriculum

---

## UC-016: Take Quiz

### Primary Actor
- Learner

### Secondary Actor
- None

### Description
As a learner, I want to take quizzes so that I can test my knowledge.

### Trigger
**Navigation path:** Course → Quiz

**Direct trigger:** User clicks "Start Quiz"

### Pre-condition
- User is enrolled in course
- Quiz is published
- User has not exceeded max attempts

### Post-condition
- Quiz attempt is created and saved
- Score is calculated and displayed

### Validation Rules
- **VR-QUIZ-001:** All questions must be answered before submission

### Business Rules
- **BR-QUIZ-005:** maxAttempts limits number of attempts
- **BR-ATTEMPT-001:** Attempt status: in-progress, completed, submitted, abandoned

### Normal Flow
1. User clicks "Start Quiz"
2. System checks max attempts
3. System displays quiz information:
   - Quiz title
   - Number of questions
   - Time limit (if set)
   - Passing score
   - Number of attempts remaining
4. User clicks "Begin Quiz"
5. System creates quiz attempt with status 'in-progress'
6. System displays first question with:
   - Question number (e.g., "Question 1 of 10")
   - Question text
   - Question type (multiple choice, true/false, etc.)
   - Answer options
   - "Flag for review" checkbox
7. User selects answer
8. System saves answer in real-time
9. User clicks "Next" to move to next question
10. System displays timer (if time limit set)
11. System displays progress bar (questions answered)
12. User can navigate between questions using:
    - "Previous" button
    - "Next" button
    - Question number buttons
13. User can flag questions for review
14. User clicks "Review Answers" before submission
15. System displays summary:
    - Answered questions (green)
    - Unanswered questions (red)
    - Flagged questions (yellow)
16. User clicks "Submit Quiz"
17. System displays confirmation: "Are you sure you want to submit?"
18. User confirms submission
19. System validates all questions answered
20. System calculates score:
    - Compares answers with correct answers
    - Calculates points earned
    - Calculates percentage
    - Determines pass/fail (percentage >= passingScore)
21. System updates attempt status = 'submitted'
22. System saves attempt details
23. System displays results:
    - Score and percentage
    - Pass/fail status
    - Correct/incorrect answers
    - Explanations (if enabled)
24. System updates course progress

### Alternative Flows

**Alternative Flow A: Time Expired**
- 10a.1. Time limit reached while user is taking quiz
- 10a.2. System displays "Time's up!" message
- 10a.3. System auto-submits quiz
- 10a.4. System calculates score with answered questions
- 10a.5. Unanswered questions marked as incorrect
- 10a.6. Continue to step 21

**Alternative Flow B: Max Attempts Reached**
- 2b.1. User has already used all allowed attempts
- 2b.2. System displays "Maximum attempts reached"
- 2b.3. System shows best score from previous attempts
- 2b.4. System displays "View Results" button
- 2b.5. End use case

**Alternative Flow C: Save and Exit**
- 9c.1. User clicks "Save and Exit" button
- 9c.2. System saves current progress
- 9c.3. System keeps attempt status = 'in-progress'
- 9c.4. System displays "Quiz saved. You can resume later."
- 9c.5. User can resume quiz from where they left off

**Alternative Flow D: Unanswered Questions**
- 19d.1. System detects unanswered questions
- 19d.2. System displays warning: "You have X unanswered questions"
- 19d.3. System shows list of unanswered question numbers
- 19d.4. User can:
   - Go back and answer them
   - Submit anyway (unanswered = incorrect)
- 19d.5. If user chooses to submit: Continue to step 20

**Alternative Flow E: Network Disconnection**
- 8e.1. User loses network connection
- 8e.2. System saves answers locally (browser storage)
- 8e.3. When connection restored: System syncs answers to server
- 8e.4. System displays "Connection restored" message

---

## UC-017: Take JLPT Practice Test

### Primary Actor
- Learner

### Secondary Actor
- None

### Description
As a learner, I want to take JLPT practice tests so that I can prepare for the actual exam.

### Trigger
**Navigation path:** Dashboard → JLPT Practice → Select Level

**Direct trigger:** User clicks "Start JLPT Practice Test"

### Pre-condition
- User is logged in
- User selects JLPT level (N5, N4, N3, N2, N1)

### Post-condition
- JLPT practice test attempt is created
- Score is calculated with section breakdown

### Validation Rules
- **VR-JLPT-001:** JLPT level must be selected

### Business Rules
- **BR-QUIZ-001:** Quiz types include jlpt_mock

### Normal Flow
1. User navigates to JLPT Practice page
2. System displays JLPT level selection:
   - N5 (Beginner)
   - N4 (Elementary)
   - N3 (Intermediate)
   - N2 (Upper Intermediate)
   - N1 (Advanced)
3. User selects JLPT level
4. System displays test information:
   - Test structure
   - Total questions
   - Total time
   - Passing criteria
5. System displays test sections:
   - **Section 1: Vocabulary (語彙)** - 30 minutes
   - **Section 2: Grammar (文法)** - 40 minutes
   - **Section 3: Reading (読解)** - 60 minutes
   - **Section 4: Listening (聴解)** - 40 minutes
6. User clicks "Start Test"
7. System creates quiz attempt
8. System displays Section 1 (Vocabulary)
9. User completes section questions
10. System displays section timer
11. When section time expires or user clicks "Next Section":
    - System saves section answers
    - System moves to next section
12. Repeat steps 8-11 for all sections
13. After all sections completed:
    - System calculates total score
    - System calculates section scores
    - System determines pass/fail based on JLPT criteria:
      - Overall score >= 50%
      - Each section score >= 38%
14. System displays detailed results:
    - **Overall Score:** X/180 points
    - **Section Breakdown:**
      - Vocabulary: X/60 points
      - Grammar: X/60 points
      - Reading: X/60 points
      - Listening: X/60 points
    - **Pass/Fail Status**
    - **Percentile Ranking**
    - **Recommended Study Areas** (weakest sections)
15. System saves attempt to history
16. System displays "Retake Test" button

### Alternative Flows

**Alternative Flow A: Section Time Limits**
- 10a.1. Each section has separate time limit
- 10a.2. When section time expires:
   - System auto-submits current section
   - System moves to next section
   - User cannot return to previous section

**Alternative Flow B: Listening Section**
- 12b.1. Listening section has audio playback
- 12b.2. Each question plays audio once or twice (based on JLPT rules)
- 12b.3. User cannot replay audio after limit reached
- 12b.4. System provides audio controls (play, pause, volume)

**Alternative Flow C: Test Abandoned**
- 11c.1. User closes browser or navigates away
- 11c.2. System saves progress
- 11c.3. User can resume test later (if within 24 hours)
- 11c.4. After 24 hours: Test is marked as abandoned

**Alternative Flow D: View Answer Explanations**
- 14d.1. User clicks "View Explanations"
- 14d.2. System displays question-by-question review
- 14d.3. For each question:
   - Question text
   - User's answer
   - Correct answer
   - Detailed explanation
   - Grammar/vocabulary notes

---

## UC-018: View Test Result

### Primary Actor
- Learner

### Secondary Actor
- None

### Description
As a learner, I want to view my test results so that I can review my performance.

### Trigger
**Navigation path:** My Courses → Course → Quizzes → View Results

**Direct trigger:** User clicks "View Results" after quiz submission

### Pre-condition
- User has completed at least one quiz attempt

### Post-condition
- Test results are displayed with detailed breakdown

### Validation Rules
- None

### Business Rules
- **BR-ATTEMPT-006:** isPassed = true if percentage >= passingScore

### Normal Flow
1. User navigates to quiz results
2. System retrieves quiz attempt data
3. System displays results page with:
   
   **Header Section:**
   - Quiz title
   - Attempt number (e.g., "Attempt 2 of 3")
   - Date completed
   - Time taken
   
   **Score Section:**
   - Overall score (e.g., "85/100")
   - Percentage (e.g., "85%")
   - Pass/fail status with icon
   - Passing score threshold
   
   **Performance Breakdown:**
   - Correct answers: X
   - Incorrect answers: Y
   - Unanswered: Z (if any)
   
4. System displays question-by-question breakdown:
   - Question number
   - Question text
   - User's answer (highlighted)
   - Correct answer (if different)
   - Points earned / Total points
   - Explanation (if available)
   - Mark (✓ for correct, ✗ for incorrect)

5. System displays performance analytics:
   - **Strengths:** Topics with high scores (>80%)
   - **Weaknesses:** Topics with low scores (<60%)
   - **Comparison:** Average score vs. user's score
   - **Time Analysis:** Time spent per question
   
6. System displays chart:
   - Score distribution by topic
   - Performance trend (if multiple attempts)
   
7. System displays "Retake Quiz" button (if attempts remaining)
8. System displays "Download Results" button (PDF)

### Alternative Flows

**Alternative Flow A: Multiple Attempts**
- 2a.1. User has taken quiz multiple times
- 2a.2. System displays all attempts in dropdown
- 2a.3. User can select which attempt to view
- 2a.4. System highlights best attempt
- 2a.5. System shows improvement trend graph

**Alternative Flow B: Failed Quiz**
- 3b.1. User's score < passing score
- 3b.2. System displays "Failed" status with encouraging message
- 3b.3. System shows "Try Again" button prominently
- 3b.4. System displays study recommendations:
   - Review specific topics
   - Practice similar questions
   - Watch related lessons

**Alternative Flow C: Perfect Score**
- 3c.1. User scored 100%
- 3c.2. System displays "Perfect Score!" celebration
- 3c.3. System awards achievement badge
- 3c.4. System suggests moving to next level

**Alternative Flow D: Download Results**
- 8d.1. User clicks "Download Results"
- 8d.2. System generates PDF with:
   - Student name
   - Quiz title
   - Score and percentage
   - Date completed
   - Question breakdown
- 8d.3. System downloads PDF

**Alternative Flow E: Share Results**
- 8e.1. User clicks "Share Results"
- 8e.2. System generates shareable link
- 8e.3. User can share on social media
- 8e.4. Shared view shows only score, not answers

---

**Last Updated:** 2026-01-12  
**Version:** 1.0  
**Status:** ✅ Complete
