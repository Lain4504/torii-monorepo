## 📌 Summary
<!-- Tóm tắt ngắn gọn nội dung PR -->

**Thêm tính năng Exam/Quiz System hoàn chỉnh với khả năng resume và auto-submit**

PR này implement hệ thống thi trắc nghiệm (Exam/Quiz) với các tính năng:
- Tạo và quản lý bài thi với nhiều section (vocab, grammar, reading, listening)
- Bắt đầu và làm bài thi với timer
- Lưu tiến độ tự động (auto-save)
- Resume bài thi đã làm dở (load lại answers, flags, current question, time remaining)
- Tự động nộp bài khi hết giờ
- Xem lịch sử làm bài (attempts history)
- Đồng bộ thời gian chính xác giữa client và server

---

## 📁 Related Issues / Tickets
<!-- Ví dụ: Fixes #123 hoặc liên kết task trong Jira, Trello -->
- Issue/Ticket: # (Exam Center Feature - Story 6.1)

---

## 🔍 Changes
<!-- Liệt kê những thay đổi chính -->
- [x] New feature
- [x] Bug fix
- [ ] Refactor
- [x] UI/UX update
- [x] Performance improvement
- [ ] Config/Chore

**Details:**

### Backend Changes:
1. **Exam Module** (`apps/server/modules/assessment/src/modules/exam/`):
   - `exam.controller.ts`: API endpoints cho exam operations
   - `exam.service.ts`: Business logic cho exam, session management, question generation
   - `exam.module.ts`: Module configuration

2. **Database Schema** (`apps/server/prisma/schema.prisma`):
   - Thêm `Quiz` model (mapped to `quizzes` table)
   - Thêm `QuizQuestion` model (mapped to `quiz_questions` table)
   - Thêm `QuizAttempt` model (mapped to `quiz_attempts` table)
   - Thêm `QuizAttemptDetail` model (mapped to `quiz_attempt_details` table)
   - Note: Sử dụng "Quiz" trong database nhưng giữ tên API là "Exam" để tương thích

3. **API Endpoints**:
   - `GET /api/v1/exams` - Lấy danh sách exams với session status
   - `GET /api/v1/exams/attempts` - Lấy lịch sử làm bài
   - `POST /api/v1/exams/:id/start` - Bắt đầu/Resume exam session
   - `PUT /api/v1/exams/sessions/:sessionId/answers` - Lưu tiến độ (answers, flags, time)
   - `POST /api/v1/exams/sessions/:sessionId/submit` - Nộp bài

4. **Features**:
   - Resume functionality: Load lại answers, flagged questions, current question, time remaining
   - Server-side time calculation: Tính toán thời gian còn lại dựa trên `startedAt` để đảm bảo chính xác
   - Auto-submit: Tự động nộp bài khi hết giờ
   - Idempotent submit: Cho phép submit lại nếu đã submit (tránh lỗi 400)

### Frontend Changes:
1. **API Services** (`apps/web-learner/api/services/exam-api.ts`):
   - `startExam()` - Bắt đầu exam
   - `saveExamAnswers()` - Lưu tiến độ
   - `submitExam()` - Nộp bài
   - `getExams()` - Lấy danh sách exams
   - `getExamAttempts()` - Lấy lịch sử

2. **Pages**:
   - `app/(exam)/exams/[examId]/take/page.tsx` - Trang làm bài thi
     - Auto-save mỗi 2 giây
     - Resume functionality
     - Timer synchronization
     - Auto-submit khi hết giờ
   - `app/(marketing)/exams/page.tsx` - Trang danh sách exams

3. **Components**:
   - `components/exams/exam-card.tsx` - Card hiển thị exam
   - `components/exams/exam-history.tsx` - Lịch sử làm bài
   - `components/exams/exam-stats.tsx` - Thống kê (placeholder)
   - `components/exams/take/exam-timer.tsx` - Timer component với sync
   - `components/exams/take/question-area.tsx` - Hiển thị câu hỏi
   - `components/exams/take/question-navigator.tsx` - Navigation sidebar

4. **Schemas** (`packages/schemas/`):
   - `src/models/exam.model.ts` - Exam models với Zod schemas
   - `src/dtos/exam.dto.ts` - Exam DTOs với validation

### Bug Fixes:
1. **Logic Fixes**:
   - Sửa lỗi xử lý giá trị `0` với `||` operator → dùng `??` (nullish coalescing)
   - Sửa field mapping: `examType` query param → `quizType` field trong database
   - Sửa logic timer: Đảm bảo timer sync đúng khi resume
   - Sửa logic save: Xử lý đúng mảng rỗng và giá trị undefined

2. **Error Handling**:
   - Cải thiện error messages
   - Xử lý lỗi khi save trước submit (không chặn submit)
   - Idempotent submit để tránh lỗi 400 khi submit lại

---

## 🧪 How to Test
<!-- Hướng dẫn reviewer test PR -->

### 1. Test List Exams
1. Navigate to `/exams` page
2. Verify exams list is displayed with status (new, in-progress, submitted)
3. Check pagination works correctly

### 2. Test Start Exam
1. Click "Bắt đầu" on an exam
2. Verify exam page loads with questions
3. Verify timer starts correctly
4. Answer some questions and flag some questions
5. Navigate between questions using sidebar/navigator

### 3. Test Auto-Save
1. Start an exam
2. Answer questions and flag questions
3. Wait 2 seconds (auto-save triggers)
4. Check browser network tab - should see PUT request to `/api/v1/exams/sessions/:sessionId/answers`
5. Verify answers are saved

### 4. Test Resume Functionality
1. Start an exam and answer some questions
2. Flag some questions
3. Navigate to a specific question (e.g., question 5)
4. Close the browser tab or navigate away
5. Re-open the exam (click "Tiếp tục" or "Bắt đầu" again)
6. **Expected**: 
   - Answers should be loaded
   - Flagged questions should be marked
   - Current question should be at question 5
   - Timer should show remaining time (not reset to full time)

### 5. Test Timer Synchronization
1. Start an exam with 30 minutes time limit
2. Wait 5 minutes
3. Close browser and wait 10 minutes
4. Re-open exam
5. **Expected**: Timer should show ~15 minutes remaining (not 25 minutes)
   - Server calculates time based on `startedAt` and current time

### 6. Test Auto-Submit
1. Start an exam with short time limit (e.g., 1 minute for testing)
2. Wait for timer to reach 0
3. **Expected**: 
   - Exam should auto-submit
   - Alert message: "Hết giờ! Bài thi đã được nộp tự động."
   - Redirect to `/exams` page
   - Attempt should be marked as "submitted" in history

### 7. Test Manual Submit
1. Start an exam
2. Answer some questions
3. Click "Nộp bài" button
4. Confirm in dialog
5. **Expected**: 
   - Exam is submitted
   - Redirect to `/exams` page
   - Attempt appears in history with "submitted" status

### 8. Test Exam History
1. Navigate to exam history (if available in UI)
2. Or use API: `GET /api/v1/exams/attempts`
3. **Expected**: 
   - See list of past attempts
   - Each attempt shows exam info, status, score (if submitted)

### 9. Test Error Handling
1. Try to submit an already-submitted exam
2. **Expected**: Should not error (idempotent), returns existing attempt
3. Try to save answers when time is up
4. **Expected**: Should handle gracefully, continue to submit

---

## 📝 Notes (Optional)
<!-- Thông tin thêm nếu cần -->

### Database Schema Notes:
- Database uses "Quiz" naming (`quizzes`, `quiz_attempts`, etc.) to match provided SQL schema
- API endpoints use "Exam" naming for backward compatibility
- Service layer maps between Quiz models and Exam DTOs

### Time Management:
- Time is calculated server-side based on `startedAt` to ensure accuracy
- Client timer syncs with server time on resume
- Time continues to elapse even when user is offline/navigated away

### Auto-Save:
- Debounced to 2 seconds after last change
- Saves: answers, flagged questions, current question, current section, time remaining
- Errors in auto-save don't block user interaction

### Future Improvements:
- [ ] Implement actual grading logic (currently placeholder)
- [ ] Add exam review page with correct answers (review page removed, will be added in future PR)
- [ ] Add exam statistics/analytics
- [ ] Add exam creation/editing UI for admins
- [ ] Add question bank integration for dynamic question generation

---

## 📷 Screenshots / API Request (Optional)
<!-- UI screenshots hoặc example API JSON nếu có -->

### API Examples:

**Start Exam:**
```http
POST /api/v1/exams/{examId}/start
Authorization: Bearer {token}
```

**Response:**
```json
{
  "sessionId": "uuid",
  "exam": {
    "id": "uuid",
    "title": "JLPT N5 Practice Test",
    "totalTime": 1800,
    "totalQuestions": 50
  },
  "questions": [...],
  "timeLimit": 1800,
  "answers": {},
  "flaggedQuestions": [],
  "currentQuestion": 1,
  "timeRemaining": 1800
}
```

**Save Answers:**
```http
PUT /api/v1/exams/sessions/{sessionId}/answers
Authorization: Bearer {token}
Content-Type: application/json

{
  "answers": {
    "question-id-1": "option-a",
    "question-id-2": "option-b"
  },
  "flaggedQuestions": ["question-id-3"],
  "currentQuestion": 5,
  "timeRemaining": 1650
}
```

**Submit Exam:**
```http
POST /api/v1/exams/sessions/{sessionId}/submit
Authorization: Bearer {token}
```

---

## ✔️ Checklist Before Requesting Review
- [x] My code follows the project coding standards
- [x] I have tested this code locally
- [ ] I added/updated unit tests if needed (Note: Unit tests can be added in future PR)
- [x] I updated documentation (API docs, comments, README)
- [x] No console logs / debug code left (except for error logging)
- [x] No unused imports / variables
- [x] Code is formatted (Prettier/ESLint)
- [x] All TypeScript errors resolved
- [x] All merge conflicts resolved
- [x] Database migrations are included (schema changes)

---

## 🔗 Related Files
- Backend: `apps/server/modules/assessment/src/modules/exam/`
- Frontend: `apps/web-learner/app/(exam)/exams/`, `apps/web-learner/components/exams/`
- Schemas: `packages/schemas/src/models/exam.model.ts`, `packages/schemas/src/dtos/exam.dto.ts`
- Database: `apps/server/prisma/schema.prisma`

