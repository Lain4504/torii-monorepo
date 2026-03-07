# Placement Assessment Specification

## 1. Overview & Business Goals

### 1.1. Mục tiêu
Tính năng **Placement Assessment** (Kiểm tra đầu vào) giúp xác định trình độ tiếng Nhật hiện tại của học viên (theo chuẩn JLPT N5-N1) để đề xuất lộ trình học tập cá nhân hóa.

### 1.2. Giá trị cốt lõi
- **Đánh giá chính xác**: Sử dụng bài test đa cấp độ (Multi-level) để đánh giá năng lực thực tế.
- **Cá nhân hóa**: Không chỉ trả về điểm số, mà phân tích chi tiết điểm mạnh/yếu (Từ vựng, Ngữ pháp, Đọc hiểu) và gợi ý khóa học phù hợp.
- **Trải nghiệm liền mạch**: Hệ thống tự động lưu bài làm (autosave), không mất dữ liệu khi rớt mạng hoặc tắt trình duyệt.

---

## 2. Test Methodology (Phương pháp đánh giá)

### 2.1. Cấu trúc bài thi (Test Structure)
Bài thi được thiết kế mô phỏng theo chuẩn JLPT nhưng lược bỏ phần Nghe và Nói (do giới hạn dữ liệu hiện tại).

**Phạm vi kiến thức**:
1.  **Vocabulary (Moji/Goi)**: Từ vựng, Kanji.
2.  **Grammar (Bunpou)**: Cấu trúc ngữ pháp, trợ từ.
3.  **Reading (Dokkai)**: Đọc hiểu đoạn văn ngắn/trung bình.

**Chiến lược phân bổ câu hỏi (Progressive Difficulty)**:
Bài thi gồm **30 câu hỏi**, chia làm 3 giai đoạn để đánh giá từ thấp lên cao:

*   **Phase 1: Foundation (10 câu)** - *Mục tiêu: Check N5/N4*
    *   3 Vocab N5, 2 Vocab N4.
    *   3 Grammar N5, 2 Grammar N4.
*   **Phase 2: Intermediate (10 câu)** - *Mục tiêu: Check N3*
    *   3 Vocab N3.
    *   3 Grammar N3.
    *   4 Reading Comprehension (Đoạn văn độ khó N3).
*   **Phase 3: Advanced (10 câu)** - *Mục tiêu: Check N2/N1*
    *   3 Vocab N2.
    *   3 Grammar N2.
    *   4 Reading Comprehension (Đoạn văn độ khó N2).

### 2.2. Scoring & Evaluation Logic
*   **Điểm số**: Mỗi câu hỏi có trọng số điểm khác nhau (VD: Reading cao hơn Vocab).
*   **Ngưỡng đánh giá (Threshold)**:
    *   Nếu đúng < 60% Phase 1 -> **Level N5 (Beginner)**.
    *   Nếu đúng > 80% Phase 1 & < 50% Phase 2 -> **Level N4**.
    *   Nếu đúng > 70% Phase 2 & < 50% Phase 3 -> **Level N3**.
    *   Nếu đúng > 60% Phase 3 -> **Level N2+**.

---

## 3. System Architecture & Schema

Tính năng này sử dụng **Academy Core Schema** (`academy` service) kết hợp với **AI Agent**.

### 3.1. Database Schema
Sử dụng các bảng trong `schema.prisma` đã định nghĩa:

1.  **`academy_exams`**:
    *   `exam_type`: `PLACEMENT`
    *   `title`: "Standard Placement Assessment"
    *   `status`: `PUBLISHED`
    *   `settings`: `{ "adaptive": false, "allow_resume": true }`

2.  **`academy_questions`**:
    *   `question_type`: `SINGLE_CHOICE`
    *   `metadata`: `{ "jlptLevel": "N5", "category": "vocabulary" }`

3.  **`academy_exam_attempts`**:
    *   Lưu trạng thái làm bài của user.
    *   `status`: `IN_PROGRESS` | `COMPLETED`.
    *   `draft_answers` (JSONB): Lưu map `{ "questionId": "answerId" }` để autosave.
    *   `metadata`: Lưu kết quả phân tích AI sau khi nộp bài.

4.  **`academy_course_profiles`**: Dùng để map kết quả ra khóa học gợi ý.

### 3.2. AI Agent Integration
Agent đóng vai trò **Evaluator**:
*   **Input**: Danh sách câu hỏi + Đáp án của user + Metadata (Level, Category).
*   **Task**:
    1.  Chấm điểm chi tiết từng kỹ năng.
    2.  Nhận xét định tính (VD: "Bạn vững ngữ pháp N4 nhưng từ vựng còn hạn chế").
    3.  Đề xuất lộ trình học (dựa trên danh sách `CourseProfile` hiện có).
*   **Output**: JSON cấu trúc (Level, Radar Chart Data, Course Recommendations).

---

## 4. User Experience Flow (Chi tiết)

### 4.1. Entry Point
*   User truy cập Dashboard hoặc trang Landing.
*   Banner: "Kiểm tra trình độ tiếng Nhật miễn phí - Nhận lộ trình học tập ngay".
*   Click "Bắt đầu ngay" -> Điều hướng tới `/assessment/placement`.

### 4.2. Taking the Test (Làm bài)
1.  **Initialization**:
    *   Frontend gọi API `POST /api/agents/placement/test`.
    *   Backend kiểm tra:
        *   Nếu có `ExamAttempt` đang `IN_PROGRESS` -> Trả về bài thi cũ + `draftAnswers`.
        *   Nếu không -> Tạo `ExamAttempt` mới, lấy bộ câu hỏi từ `academy_exams`.
2.  **Interaction**:
    *   Hiển thị từng câu hỏi (dạng trắc nghiệm).
    *   User chọn đáp án -> Frontend gọi `PATCH /api/agents/placement/save-progress` (Debounce 500ms).
    *   Backend lưu vào `academy_exam_attempts.draft_answers`.
3.  **Completion**:
    *   User bấm "Nộp bài" -> Frontend gọi `POST /api/agents/placement/evaluate`.

### 4.3. Result & Recommendation
1.  **Processing**:
    *   Backend chấm điểm (Raw Score).
    *   Backend gọi AI Agent để phân tích sâu (Deep Analysis).
    *   Backend cập nhật `ExamAttempt` -> `status: COMPLETED`, lưu kết quả vào DB.
2.  **Display**:
    *   Hiển thị **Current Level** (VD: N4).
    *   Hiển thị **Skill Radar Chart** (Vocab, Grammar, Reading).
    *   Hiển thị **Suggested Courses**: Danh sách các khóa học (Class/Offering) phù hợp nhất.
        *   Button "Đăng ký học ngay" -> Link tới trang thanh toán/enrollment.

---

## 5. API Specification

### 5.1. Generate/Resume Test
*   **Endpoint**: `POST /api/agents/placement/test`
*   **Response**:
    ```json
    {
      "testId": "attempt_uuid",
      "questions": [
        {
          "id": "q_uuid",
          "content": "...",
          "options": ["A", "B", "C", "D"],
          "level": "N5",
          "category": "vocabulary"
        }
      ],
      "draftAnswers": { "q_uuid": "A" }, // Nếu resume
      "timeLeft": 1200 // Seconds
    }
    ```

### 5.2. Save Progress (Autosave)
*   **Endpoint**: `PATCH /api/agents/placement/progress`
*   **Body**:
    ```json
    {
      "attemptId": "attempt_uuid",
      "answers": { "q_uuid": "B" }
    }
    ```

### 5.3. Evaluate & Submit
*   **Endpoint**: `POST /api/agents/placement/evaluate`
*   **Body**: `{ "attemptId": "attempt_uuid" }`
*   **Response**:
    ```json
    {
      "level": "N4",
      "score": 24, // trên 30
      "analysis": {
        "strengths": ["Grammar"],
        "weaknesses": ["Reading"],
        "summary": "..."
      },
      "recommendations": [
        {
          "courseId": "course_uuid",
          "title": "Luyện thi N3 Capstone",
          "reason": "Phù hợp để nâng cao kỹ năng Đọc hiểu"
        }
      ]
    }
    ```

---

## 6. Implementation Plan

### Phase 1: Database & Core Logic (Backend)
1.  **Migration**: Đảm bảo schema `academy` đã sync.
2.  **Seeding**: Tạo dữ liệu mẫu:
    *   1 `Exam` (Type: PLACEMENT).
    *   30 `Question` (10 N5/N4, 10 N3, 10 N2) vào `academy_questions` và link vào `academy_exam_questions`.
3.  **Service**: Implement `AssessmentService` methods: `startPlacementTest`, `saveProgress`, `submitPlacementTest`.

### Phase 2: AI Agent & Integration
1.  **Prompt Engineering**: Viết prompt cho Agent để phân tích kết quả bài thi JLPT.
    *   Input: `[{level: 'N5', correct: true}, {level: 'N3', correct: false}...]`.
    *   Output: JSON Analysis.
2.  **Course Mapping**: Logic để map từ "AI recommendation" sang `CourseProfile` thực tế trong DB.

### Phase 3: Frontend Development
1.  **UI Component**:
    *   `PlacementAssessment.tsx`: Màn hình làm bài (Quiz UI).
    *   `AssessmentResult.tsx`: Màn hình kết quả (Chart, Course Cards).
2.  **State Management**: Xử lý logic timer, autosave, resume.

### Phase 4: Testing & Refinement
1.  **Test Case**:
    *   User làm nửa chừng, tắt tab, mở lại -> Phải còn nguyên đáp án.
    *   User làm đúng hết -> Phải ra level N2/N1.
    *   User làm sai hết -> Phải ra level N5.
2.  **Performance**: Đảm bảo AI analyze không quá 5s.

---

## 7. Notes
*   **Question Bank**: Cần bộ câu hỏi chất lượng cao để đánh giá chính xác. Giai đoạn đầu có thể import từ các đề thi thử JLPT public.
*   **Security**: API endpoint trả về câu hỏi **không được** chứa field `correctAnswer` (trừ khi client-side grading, nhưng tốt nhất là server-side grading).
*   **Scalability**: Thiết kế `ExamAttempt` cho phép mở rộng sang các bài thi thử (Practice Test) sau này mà không cần sửa schema.
