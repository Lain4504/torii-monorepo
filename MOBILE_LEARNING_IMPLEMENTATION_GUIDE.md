# 📘 Technical Guide: Implementing Learning Features on Mobile (Comprehensive)

This guide outlines the technical requirements and UI/UX recommendations for implementing a complete learning ecosystem in the **Torii Mobile (Meet/Learner)** app, matching the feature set of the `web-learner` application.

## 1. Core Learning Components

| Component | Scope | Gating (VOD) | Gating (Live) |
| :--- | :--- | :--- | :--- |
| **Quiz** (Lesson Checkpoint) | After specific lessons | **Mandatory**: Must pass to continue | Optional (Reminder only) |
| **Exam** (Module/Final) | End of Module/Course | **Mandatory**: Must pass to unlock next Module | Optional (Reminder only) |
| **Assignment** (Essay/File) | Specific to Live Classes | N/A | Manual submission & Grading |
| **Study Sets** (Flashcards) | Self-study / Spaced Repetition | Optional | Activity tracking |

---

## 2. API Endpoints

### 2.1 Quizzes & Exams (Assessment Plan)
The mobile app should use the unified Assessment Plan API to fetch all milestones for a course.

- **Check Assessment Status**:
  `GET /api/academy/assessment-plans/learner/status?classId={{classId}}`
  - *Returns*: List of milestones with `status` (`LOCKED`, `AVAILABLE`, `IN_PROGRESS`, `PASSED`, `FAILED`).
  - *Status mapping*: Use this to show/hide/lock quiz buttons in the curriculum.

- **Start Exam/Quiz Attempt**:
  `POST /api/academy/exams/{{examId}}/attempts`
  - *Body*: `{ "classId": "{{classId}}" }` -> Returns `attemptId`.

- **Submit Exam/Quiz**:
  `POST /api/academy/exams/attempts/{{attemptId}}/submit`
  - *Request Body*:
    ```json
    {
      "answers": {
        "uuid-question-1": "uuid-option-a",
        "uuid-question-2": "uuid-option-c"
      }
    }
    ```

---

### 2.2 Assignments (Live Class)
Assignments require manual submission of text or files.

- **List Assignments**:
  `GET /api/academy/live-classes/{{classId}}/assignments`
  - *Response Item Example*:
    ```json
    {
      "id": "uuid-assignment-id",
      "title": "BTVN Buổi 1: Giới thiệu bản thân",
      "deadline": "2024-04-10T23:59:59Z"
    }
    ```

- **Submit Assignment**:
  `POST /api/academy/assignment-submissions`
  - *Request Body*:
    ```json
    {
      "classId": "uuid-class-id",
      "liveClassAssignmentId": "uuid-assignment-id",
      "content": "Nội dung bài làm...",
      "fileUrls": ["https://storage.torii.com/file.pdf"],
      "status": "SUBMITTED"
    }
    ```

---

### 2.3 Study Sets & Flashcards
- **Find My Sets**: `GET /api/academy/study-sets`
- **Study Mode**: `GET /api/academy/study-sets/{{id}}/study` (Returns cards for review)
- **Review Card**: `POST /api/academy/set-cards/{{cardId}}/review` (Payload: `{ "rating": 1-5 }` for SRS)

### 2.4 Gamification & Social
- **Streak Status**: `GET /api/gamification/streak`
- **Leaderboard**: `GET /api/gamification/leaderboard?type=global`
- **Discussions**: `GET /api/comments?discussionId={{lessonId}}&targetType=DISCUSSION`

---

## 3. Advanced Features: Adaptive Roadmap
- **Onboarding**: `PUT /learners/me/profile` (Set goals and availability).
- **Get Weekly Plan**: `GET /roadmaps/current` (Lists Must/Should/Could tasks).
- **Progress Insight**: `GET /progress/overview` (Shows Mastery and XP).

---

## 4. UI/UX Recommendations for Mobile

### 4.1 Home Page: "Learning Center"
Use a **Quick Nav Grid** or **Horizontal Scroll**:
- **Icons**: [My Courses], [Flashcards], [Assignments], [Leaderboard].
- **Today's Focus**: Card showing the top task from the Adaptive Roadmap.

### 4.2 Learning Experience
- **VOD Roadmap**: Sequential list. Lock next lessons if previous Quiz is not `PASSED`.
- **Micro-interactions**: Confetti on passing an Exam or completing a 7-day Streak.

---

## 5. Feature Parity Checklist
- [x] Quizzes & Midterms (Assessment Plan)
- [x] Assignment Submissions
- [x] Study Sets / Flashcards (SRS)
- [x] Gamification (XP/Streak/Leaderboard)
- [x] Discussion/Comments
- [x] Adaptive Roadmap
