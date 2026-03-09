# Tổng quan Flow nghiệp vụ & Logic Code: Hệ thống thi cử (Assessment)

## 1. Mục tiêu

Tài liệu này nhằm mục đích giải thích một cách chi tiết và trực quan toàn bộ luồng nghiệp vụ và logic code của hệ thống thi cử trong dự án. Mục tiêu là làm rõ mối quan hệ giữa các khái niệm (entity), quy trình dành cho từng vai trò (Admin, Giảng viên, Học viên), và sự khác biệt trong logic giữa các loại lớp học (VOD và LIVE).

## 2. Sơ đồ các Khái niệm Cốt lõi (Core Concepts)

Để hiểu được luồng, trước hết cần nắm rõ vai trò của từng khối lego trong hệ thống.

```mermaid
erDiagram
    QuestionPool ||--o{ Question : contains
    QuizTemplate }o--|| QuestionPool : "can source from"
    QuizTemplate }o--|| Exam : "has default"

    Exam ||--|{ ExamSection : "is composed of"
    ExamSection ||--o{ ExamQuestion : "groups"
    ExamQuestion }o--|| Question : "references"

    ClassAssessment ||--|| QuizTemplate : "is an instance of"
    ClassAssessment }o--|| Exam : "can override with"

    Class ||--o{ ClassAssessment : "contains"
    Enrollment ||--|| Class : "enrolls in"
    Enrollment ||--|| User : "is for"

    ExamAttempt ||--|| Exam : "is an attempt of"
    ExamAttempt ||--|| User : "is by"
    ExamAttempt }o--|| ClassAssessment : "can be for"
```

**Giải thích các khái niệm:**

-   **`Question`**: Là một câu hỏi duy nhất (ví dụ: "Thủ đô của Nhật Bản là gì?"). Nó chứa nội dung, loại câu hỏi (trắc nghiệm, tự luận...), các lựa chọn và đáp án đúng.
-   **`QuestionPool`**: Là một "ngân hàng câu hỏi". Nó là một bộ sưu tập lớn các `Question`, dùng để phân loại và quản lý câu hỏi.
-   **`Exam`**: Là một "đề thi" hoàn chỉnh. Nó định nghĩa cấu trúc của một bài kiểm tra, bao gồm nhiều phần và một bộ câu hỏi cụ thể. Một `Exam` được tạo ra để có thể tái sử dụng.
    -   *Ví dụ:* "Đề thi thử JLPT N5 - Tháng 12/2025", "Đề kiểm tra cuối chương 1".
-   **`ExamSection`**: Là một phần trong `Exam` (ví dụ: "Phần 1: Từ vựng", "Phần 2: Nghe hiểu"). Mỗi section có thể có thời gian làm bài riêng.
-   **`ExamQuestion`**: Là một record cho biết câu hỏi (`Question`) nào nằm trong phần (`ExamSection`) nào của đề thi (`Exam`) nào, cùng với số điểm và thứ tự.
-   **`QuizTemplate`**: Là một **mẫu bài kiểm tra** dùng trong syllabus của khóa học. Nó không phải là đề thi, mà là một "khuôn mẫu" định nghĩa các quy tắc mặc định như:
    -   Đề thi mặc định sẽ dùng là gì (`defaultExamId`).
    -   Số lần làm bài tối đa, thời gian mặc định, v.v.
    -   *Ví dụ:* Trong syllabus, mục "Kiểm tra cuối Chương 1" sẽ trỏ đến một `QuizTemplate`.
-   **`Class`**: Là một lớp học cụ thể, có thể là `VOD` (tự học qua video) hoặc `LIVE` (học trực tiếp).
-   **`ClassAssessment`**: Là một **bài kiểm tra thực tế** được gán cho một `Class`. Nó là một "thể hiện" của `QuizTemplate` trong một lớp học cụ thể. Nó cho phép giảng viên tùy chỉnh bài kiểm tra cho riêng lớp đó.
-   **`ExamAttempt`**: Là một "lượt làm bài" của học viên. Nó ghi lại toàn bộ quá trình làm bài của một học viên cho một `Exam`, bao gồm câu trả lời, thời gian, và kết quả.

---

## 3. Luồng Quy trình chi tiết

### Phần 1: Luồng Quản trị (Admin) - Chuẩn bị Nội dung & Cấu trúc

Đây là bước nền tảng, tạo ra các "nguyên liệu" cho toàn bộ hệ thống.

**Bước 1: Tạo Ngân hàng câu hỏi (Content Creation)**
-   **Mục đích:** Xây dựng kho tài nguyên câu hỏi.
-   **Hành động:**
    1.  Vào `Academy > Questions` để tạo các `Question` đơn lẻ.
    2.  Vào `Academy > Question Pools` để tạo các `QuestionPool` (ví dụ: "N5 - Từ vựng", "N5 - Ngữ pháp").
    3.  Thêm các `Question` đã tạo vào `QuestionPool` tương ứng.

**Bước 2: Tạo Đề thi (Exam Creation)**
-   **Mục đích:** Từ ngân hàng câu hỏi, tạo ra một đề thi hoàn chỉnh có cấu trúc.
-   **Hành động:**
    1.  Vào `Academy > Exams` và nhấn "Tạo mới".
    2.  Đặt tên cho `Exam` (ví dụ: "Đề giữa kỳ N5 - Mặc định").
    3.  Trong trang chi tiết `Exam`, tạo các `ExamSection` (ví dụ: "Phần 1: Kanji", "Phần 2: Đọc hiểu").
    4.  Trong mỗi `ExamSection`, sử dụng chức năng "Lấy từ Pool" hoặc "Chọn câu hỏi cụ thể" để thêm `Question` vào đề. Hành động này sẽ tạo ra các `ExamQuestion`.
    5.  Sau khi hoàn tất, chuyển trạng thái của `Exam` từ `DRAFT` sang `PUBLISHED`. Chỉ có `Exam` đã `PUBLISHED` mới có thể sử dụng được.

**Bước 3: Tạo Mẫu Quiz (Quiz Template Creation)**
-   **Mục đích:** Tạo một "khuôn mẫu" cho bài kiểm tra để gắn vào syllabus.
-   **Hành động:**
    1.  Vào `Academy > Quiz Templates` và nhấn "Tạo mới".
    2.  Điền các thông tin cơ bản (tên, mô tả...).
    3.  **Quan trọng nhất:** Trong phần "Đề mặc định cho Quiz Template", chọn `Exam` đã `PUBLISHED` ở Bước 2. ID của Exam này sẽ được lưu vào `QuizTemplate.settings.defaultExamId`.
    4.  Lưu `QuizTemplate`.

### Phần 2: Luồng Giảng viên (Lecturer) - Gán & Tùy chỉnh Quiz cho Lớp

Đây là bước giảng viên sử dụng các "nguyên liệu" đã tạo để gán bài kiểm tra cho lớp học của mình.

**Bối cảnh:** Giảng viên đang ở trang chi tiết của một `Class`.
**Hành động:** Trong tab "Assessments", nhấn "Tạo mới" và chọn loại là "Quiz".

**Logic sẽ rẽ nhánh tùy thuộc vào `Class.mode`:**

#### → Trường hợp 1: Lớp VOD (Tự học)

-   **Quy tắc:** Đơn giản, không tùy chỉnh. Học viên luôn làm theo đề mặc định.
-   **Luồng UI:**
    1.  **Bước 1:** Giảng viên chỉ cần chọn `QuizTemplate` đã tạo ở Phần 1.
    2.  **Bước 2 (Nguồn đề thi):** Giao diện sẽ bị khóa, hiển thị thông báo "VOD: dùng đề mặc định của Quiz Template (không override)".
    3.  **Bước 3 & 4:** Giảng viên có thể tùy chỉnh một vài thông số cơ bản như `maxAttempts` (số lần làm lại), `weight` (trọng số điểm). **Deadline không áp dụng** cho lớp VOD.
    4.  Lưu `ClassAssessment`.
-   **Kết quả:** Hệ thống tạo một `ClassAssessment`. Khi học viên làm bài, hệ thống sẽ tự động tìm đến `QuizTemplate` và lấy `defaultExamId` để bắt đầu bài thi.

#### → Trường hợp 2: Lớp LIVE (Học trực tiếp)

-   **Quy tắc:** Linh hoạt, cho phép giảng viên tùy chỉnh đề thi cho phù hợp với từng lớp LIVE cụ thể.
-   **Luồng UI:**
    1.  **Bước 1:** Giảng viên chọn `QuizTemplate`.
    2.  **Bước 2 (Nguồn đề thi):** Giảng viên có 3 lựa chọn:
        -   **a) Dùng đề mặc định:** Chọn "Nhanh nhất: dùng đề mặc định từ template".
        -   **b) Dùng Exam đã tạo sẵn:** Chọn "Chủ động: chọn đề đã tạo sẵn", sau đó chọn một `Exam` khác từ danh sách. ID của `Exam` này sẽ được lưu vào `ClassAssessment.settings.overrideExamId`.
        -   **c) Sinh đề mới từ Pool:** Chọn "Tạo nhanh: tự sinh đề mới từ pool", sau đó chọn một `QuestionPool` và số lượng câu hỏi. Hệ thống sẽ tự động tạo một `Exam` mới, thêm câu hỏi vào, publish nó, và lưu ID vào `ClassAssessment.settings.overrideExamId`.
    3.  **Bước 3 & 4:** Giảng viên có thể đặt `deadline` (hạn nộp bài) cho lớp LIVE này.
    4.  Lưu `ClassAssessment`.
-   **Kết quả:** Hệ thống tạo một `ClassAssessment`. Khi học viên làm bài, logic sẽ ưu tiên `overrideExamId` trước.

### Phần 3: Luồng Học viên (Learner) - Làm bài

Đây là luồng cuối cùng, nơi học viên tương tác với bài kiểm tra.

**Bối cảnh:** Học viên đã ghi danh vào một `Class` và đang ở trang học (`/courses/.../learn`).
**Hành động:** Click vào một mục quiz trong syllabus.

**Luồng Logic (Code Flow):**

1.  **Chuyển hướng:** Học viên được chuyển đến trang "Chuẩn bị làm bài" (`/courses/.../quizzes/[quizId]`).
2.  **Xác định `examId`:**
    -   Trang này fetch dữ liệu của `ClassAssessment` (dựa vào `quizId`) và `QuizTemplate` liên quan.
    -   Nó dùng một logic ưu tiên để tìm ra `examId` cuối cùng sẽ được dùng để làm bài:
        1.  Kiểm tra `ClassAssessment.settings.overrideExamId` có tồn tại không? Nếu có, dùng nó. (Dành cho lớp LIVE override).
        2.  Nếu không, lấy `QuizTemplate.settings.defaultExamId`. (Dành cho lớp VOD và lớp LIVE không override).
    -   Nếu không tìm thấy `examId` nào, giao diện sẽ báo lỗi "Bài kiểm tra chưa được liên kết đề thi".
3.  **Bắt đầu làm bài:**
    -   Học viên nhấn nút "Bắt đầu làm bài".
    -   Frontend chuyển hướng đến trang làm bài (`/exams/[examId]/take`), truyền `classId` và `classAssessmentId` qua URL params.
    -   Trang `take` sẽ gọi API `POST /api/academy/exam-attempts/start` với `examId` và các ID khác.
4.  **Backend xử lý `startAttempt`:**
    -   `ExamAttemptService` nhận yêu cầu.
    -   **Validation:**
        -   Kiểm tra `Enrollment` của học viên phải là `ACTIVE` hoặc `COMPLETED`.
        -   Kiểm tra `Exam` phải có ít nhất 1 câu hỏi.
        -   Kiểm tra số lần làm bài (`maxAttempts`), nhưng **bỏ qua nếu là lớp VOD**.
    -   Tạo một record `ExamAttempt` mới với `status: 'IN_PROGRESS'` và trả về `attemptId`.
5.  **Giao diện làm bài:**
    -   Trang `take` nhận `attemptId`, sau đó fetch toàn bộ câu hỏi của `examId` và hiển thị giao diện làm bài.
    -   Câu trả lời của học viên được tự động lưu (auto-save) vào `ExamAttempt.draftAnswers`.
6.  **Nộp bài & Xem lại:**
    -   Khi nộp bài, frontend gọi API `submitAttempt`. Backend sẽ chấm điểm và cập nhật `ExamAttempt`.
    -   Sau khi nộp, học viên được chuyển đến trang xem lại bài (`/exams/[examId]/review/[sessionId]`) để xem kết quả chi tiết.
    -   Học viên cũng có thể xem lại lịch sử các lần làm bài của mình ở trang `/dashboard/exams/[examId]/history`.

---

## 4. Kịch bản sử dụng thực tế (Use Case Scenarios)

Dưới đây là các kịch bản mô tả tuần tự các bước mà từng vai trò cần thực hiện để tạo ra một bài kiểm tra hoàn chỉnh cho học viên.

### Kịch bản 1: Tạo một bài Quiz ngắn sau mỗi bài học (Lesson)

**Mục tiêu:** Học viên vừa học xong một bài lý thuyết ("Lesson 1: Chào hỏi") và cần làm một bài quiz nhỏ để củng cố kiến thức.

**Vai trò & Thao tác:**

1.  **Admin/Content Creator (Người tạo nội dung):**
    *   **Thao tác 1 (Câu hỏi):** Vào `Academy > Questions`, tạo 5-10 câu hỏi liên quan đến bài "Chào hỏi".
    *   **Thao tác 2 (Ngân hàng câu hỏi):** Vào `Academy > Question Pools`, tạo một Pool tên là "Chapter 1 - Lesson 1: Greetings". Thêm 5-10 câu hỏi vừa tạo vào Pool này.
    *   **Thao tác 3 (Đề thi):** Vào `Academy > Exams`, tạo một `Exam` tên là "Quiz for Lesson 1: Greetings".
        *   Tạo 1 `ExamSection`.
        *   Trong section đó, dùng chức năng "Lấy từ Pool" để lấy ngẫu nhiên 5 câu hỏi từ Pool "Chapter 1 - Lesson 1: Greetings".
        *   Publish `Exam` này.
    *   **Thao tác 4 (Mẫu Quiz):** Vào `Academy > Quiz Templates`, tạo một `QuizTemplate` tên "Quiz Template for Lesson 1".
        *   Trong phần "Đề mặc định", chọn `Exam` "Quiz for Lesson 1: Greetings".
        *   Lưu `QuizTemplate`.

2.  **Admin/Curriculum Designer (Người thiết kế Syllabus):**
    *   **Thao tác 5 (Gắn vào Syllabus):** Mở `Course Edition` của khóa học liên quan.
        *   Trong syllabus, sau `ChapterItem` của "Lesson 1: Chào hỏi", thêm một `ChapterItem` mới với `kind` là `QUIZ`.
        *   Trỏ `referenceId` của item này đến `QuizTemplate` "Quiz Template for Lesson 1" vừa tạo.
        *   Publish `Course Edition`.

3.  **Học viên (Learner):**
    *   **Thao tác 6 (Làm bài):**
        *   Vào khóa học và hoàn thành "Lesson 1: Chào hỏi".
        *   Mục "Quiz for Lesson 1" sẽ hiện ra trong syllabus.
        *   Học viên click vào để bắt đầu làm bài. Hệ thống sẽ tự động lấy đề thi từ `defaultExamId` của `QuizTemplate`.

---

### Kịch bản 2: Tạo một bài kiểm tra cuối Chương (Chapter Exam)

**Mục tiêu:** Sau khi học xong toàn bộ Chương 2, học viên cần làm một bài kiểm tra tổng hợp kiến thức của cả chương.

**Vai trò & Thao tác:**

1.  **Admin/Content Creator:**
    *   **Thao tác 1 (Tổng hợp câu hỏi):** Giả định các câu hỏi cho các bài học trong Chương 2 đã được tạo và nằm trong các Pool nhỏ (ví dụ: "Pool Lesson 2.1", "Pool Lesson 2.2",...).
    *   **Thao tác 2 (Đề thi cuối chương):** Vào `Academy > Exams`, tạo `Exam` tên "Chapter 2 Final Test".
        *   Tạo các `ExamSection` nếu cần (ví dụ: "Phần Từ vựng", "Phần Ngữ pháp").
        *   Sử dụng chức năng "Lấy từ Pool", lấy một vài câu từ mỗi Pool của các bài học trong Chương 2 để đảm bảo kiến thức được kiểm tra toàn diện.
        *   Publish `Exam` "Chapter 2 Final Test".
    *   **Thao tác 3 (Mẫu Quiz):** Vào `Academy > Quiz Templates`, tạo `QuizTemplate` tên "Chapter 2 Final Test Template".
        *   Gắn `Exam` "Chapter 2 Final Test" làm đề mặc định.

2.  **Admin/Curriculum Designer:**
    *   **Thao tác 4 (Gắn vào Syllabus):** Trong `Course Edition`, đặt `ChapterItem` `QUIZ` này ở cuối cùng của Chương 2.
        *   Trỏ `referenceId` đến "Chapter 2 Final Test Template".
        *   Publish `Course Edition`.

3.  **Giảng viên (Lecturer - Chỉ áp dụng cho lớp LIVE):**
    *   **Thao tác 5 (Tùy chỉnh nếu cần):** Nếu giảng viên muốn thay đổi đề kiểm tra cuối chương cho lớp LIVE của mình (ví dụ muốn đề khó hơn), họ sẽ:
        *   Vào `Class > Assessments`, tạo một `ClassAssessment` mới từ `QuizTemplate` "Chapter 2 Final Test Template".
        *   Trong phần "Nguồn đề thi", chọn "Chủ động: chọn đề đã tạo sẵn" và chọn một `Exam` khác (ví dụ: "Chapter 2 Final Test - Advanced").
        *   Đặt `deadline` cho bài kiểm tra này.

4.  **Học viên (Learner):**
    *   **Thao tác 6 (Làm bài):** Sau khi hoàn thành các bài học trong Chương 2, học viên sẽ làm bài kiểm tra cuối chương.
        *   Nếu là lớp VOD, họ sẽ làm đề mặc định.
        *   Nếu là lớp LIVE, họ sẽ làm đề đã được giảng viên override.

---

### Kịch bản 3: Tổ chức một kỳ thi thử JLPT N3 đầy đủ

**Mục tiêu:** Mô phỏng một kỳ thi JLPT N3 hoàn chỉnh với nhiều phần và thời gian làm bài riêng biệt cho từng phần.

**Vai trò & Thao tác:**

1.  **Admin/Content Creator:**
    *   **Thao tác 1 (Chuẩn bị ngân hàng câu hỏi lớn):** Đảm bảo `QuestionPool` đã có đủ câu hỏi cho cấp độ N3, được phân loại rõ ràng (ví dụ: "N3 - Từ vựng", "N3 - Ngữ pháp", "N3 - Đọc hiểu", "N3 - Nghe hiểu").
    *   **Thao tác 2 (Tạo Đề thi JLPT):** Vào `Academy > Exams`, tạo một `Exam` tên "JLPT N3 Mock Test - 2025".
        *   **Tạo Section 1:**
            *   Title: "Phần 1: Kiến thức ngôn ngữ (Từ vựng)".
            *   `timeLimitSeconds`: 1800 (tương đương 30 phút).
            *   Thêm câu hỏi từ Pool "N3 - Từ vựng".
        *   **Tạo Section 2:**
            *   Title: "Phần 2: Kiến thức ngôn ngữ (Ngữ pháp) & Đọc hiểu".
            *   `timeLimitSeconds`: 4200 (tương đương 70 phút).
            *   Thêm câu hỏi từ các Pool "N3 - Ngữ pháp" và "N3 - Đọc hiểu".
        *   **Tạo Section 3:**
            *   Title: "Phần 3: Nghe hiểu".
            *   `timeLimitSeconds`: 2400 (tương đương 40 phút).
            *   Thêm câu hỏi từ Pool "N3 - Nghe hiểu".
        *   Sau khi hoàn tất, Publish `Exam` này.

2.  **Giảng viên/Điều phối viên (Coordinator):**
    *   **Thao tác 3 (Lên lịch thi):** Kỳ thi lớn như thế này thường không nằm trong một khóa học cụ thể mà được tổ chức riêng.
        *   Tạo một `Class` đặc biệt, có thể là `LIVE`, với tên là "Kỳ thi thử JLPT N3 - Tháng 12/2025".
        *   Tạo một `QuizTemplate` có tên tương tự, và gắn `Exam` "JLPT N3 Mock Test - 2025" làm mặc định.
        *   Trong `Class` vừa tạo, tạo một `ClassAssessment` duy nhất từ `QuizTemplate` trên.
        *   Đặt `deadline` rõ ràng.

3.  **Học viên (Learner):**
    *   **Thao tác 4 (Tham gia và làm bài):**
        *   Học viên được ghi danh (enroll) vào lớp "Kỳ thi thử JLPT N3 - Tháng 12/2025".
        *   Đến ngày thi, họ truy cập vào `ClassAssessment`.
        *   Hệ thống sẽ bắt đầu Phần 1 với 30 phút đếm ngược.
        *   Khi hết 30 phút hoặc học viên nộp Phần 1, giao diện sẽ hiển thị màn hình nghỉ.
        *   Học viên nhấn "Bắt đầu phần tiếp theo" để làm Phần 2 với 70 phút đếm ngược.
        *   Quy trình tương tự cho Phần 3.
        *   Sau khi hoàn thành cả 3 phần, bài thi sẽ được nộp và chấm điểm.
