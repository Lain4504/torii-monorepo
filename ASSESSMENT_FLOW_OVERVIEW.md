# Tổng quan Flow nghiệp vụ & Logic Code: Hệ thống thi cử (Assessment)

## 1. Mục tiêu

Tài liệu này nhằm mục đích giải thích một cách chi tiết và trực quan toàn bộ luồng nghiệp vụ và logic code của hệ thống thi cử trong dự án. Mục tiêu là làm rõ mối quan hệ giữa các khái niệm (entity), quy trình dành cho từng vai trò (Admin, Giảng viên, Học viên), và sự khác biệt trong logic giữa các loại lớp học (VOD và LIVE).

## 2. Sơ đồ các Khái niệm Cốt lõi (Core Concepts)

Để hiểu được luồng, trước hết cần nắm rõ vai trò của từng khối lego trong hệ thống. (Đã được đơn giản hóa: Loại bỏ QuizTemplate/AssignmentTemplate).

```mermaid
erDiagram
    QuestionPool ||--o{ Question : contains
    
    Exam ||--|{ ExamSection : "is composed of"
    ExamSection ||--o{ ExamQuestion : "groups"
    ExamQuestion }o--|| Question : "references"

    Lesson ||--|| Exam : "has default (linkedExamId)"
    
    ClassLessonOverride ||--|| Exam : "can override with (overrideExamId)"
    ClassLessonOverride ||--|| Lesson : "overrides for"
    Class ||--o{ ClassLessonOverride : "contains overrides"

    Enrollment ||--|| Class : "enrolls in"
    Enrollment ||--|| User : "is for"

    ExamAttempt ||--|| Exam : "is an attempt of"
    ExamAttempt ||--|| User : "is by"
    ExamAttempt }o--|| Lesson : "is for lesson"
```

**Giải thích các khái niệm:**

-   **`Question`**: Là một câu hỏi duy nhất. Nó chứa nội dung, loại câu hỏi, các lựa chọn và đáp án đúng.
-   **`QuestionPool`**: Là một "ngân hàng câu hỏi". Nó là một bộ sưu tập lớn các `Question`, dùng để phân loại và quản lý câu hỏi.
-   **`Exam`**: Là một "đề thi" hoàn chỉnh (hoặc một bài Quiz, Assignment). Nó định nghĩa cấu trúc của một bài kiểm tra, bao gồm nhiều phần và một bộ câu hỏi cụ thể, cùng các thiết lập như `maxAttempts`, `timeLimit`.
-   **`ExamSection`**: Là một phần trong `Exam`. Mỗi section có thể có thời gian làm bài riêng.
-   **`ExamQuestion`**: Là một record cho biết câu hỏi nào nằm trong phần nào của đề thi nào, cùng với số điểm và thứ tự.
-   **`Lesson (ChapterItem)`**: Bài học trong Syllabus. Bổ sung trường `hasQuiz` / `hasAssignment` và trỏ trực tiếp đến `linkedExamId`.
-   **`ClassLessonOverride` (hoặc `ClassAssessment`):** Bảng trung gian dùng cho lớp LIVE. Cho phép giảng viên ghi đè (override) đề thi mặc định của Lesson thành một `overrideExamId` khác, đặt `deadline` riêng cho lớp đó.
-   **`ExamAttempt`**: Là một "lượt làm bài" của học viên.

---

## 3. Đề xuất: Đơn giản hóa kiến trúc Lesson - Assessment

Dựa trên yêu cầu: *"Loại bỏ `QuizTemplate` và `AssignmentTemplate`. `Lesson` sẽ có thêm field `hasAssignment` hoặc `hasQuiz`, nối thẳng tới bảng `Exam` hoặc `Assignment`"*.

### 3.1. Phân tích lợi ích & Sự thay đổi

**Lợi ích lớn nhất:** Giảm thiểu đáng kể số lượng bảng trung gian. Khi Admin tạo khóa học, họ chỉ cần tạo Lesson và gắn trực tiếp một `Exam` vào đó. Không cần phải đi đường vòng tạo Template.

**Sự thay đổi về Schema (Concept):**
- **Bỏ:** Bảng `QuizTemplate`, `AssignmentTemplate`.
- **Sửa bảng `ChapterItem` (hoặc `Lesson`):** Thêm field mới (ví dụ `linkedExamId` và `linkedAssignmentId`, cùng flag `hasQuiz`, `hasAssignment`).
- Mọi thiết lập như `maxAttempts`, `timeLimit`, `passScore` sẽ nằm trực tiếp trên bảng `Exam` hoặc cấu hình của Lesson đó.

### 3.2. Giải quyết bài toán: Override cho lớp LIVE

*"Làm theo cách này thì khóa học LIVE giảng viên có thể thay đổi (override) quiz được không?"*

**Trả lời: HOÀN TOÀN ĐƯỢC.** Ta sử dụng một bảng trung gian cho riêng lớp LIVE (giữ lại `ClassAssessment` hoặc tạo bảng `ClassLessonOverride`).

- **Đối với lớp VOD (Không override):**
    - Learner học xong Lesson A.
    - Nhấn nút "Làm bài tập".
    - Hệ thống check `linkedExamId` của Lesson A và tạo `ExamAttempt` trực tiếp từ ID đó.

- **Đối với lớp LIVE (Cho phép override):**
    - Giảng viên vào Dashboard lớp LIVE.
    - Hệ thống liệt kê tất cả các Lesson có gắn Quiz/Assignment.
    - Giảng viên chọn Lesson A, nhấn "Đổi đề thi".
    - Hệ thống tạo một bản ghi vào bảng override: `{ classId: 1, lessonId: A, overrideExamId: NewExamID }`.
    - Khi Learner của lớp LIVE làm bài, hệ thống ưu tiên check bảng Override này trước. Nếu có, lấy `NewExamID`, nếu không, lấy `linkedExamId` gốc.

### 3.3. Giải quyết bài toán: Quản lý Phiên bản (Course Edition Versioning)

*"Version 1 đang có class hoạt động. Tạo Version 2 gán cho class khác. Trong khi đó, nội dung Lesson của Edition 1 bị sửa đổi thì làm sao?"*

**Nguyên tắc vàng của Versioning (Bất biến - Immutability):**
Một khi `CourseEdition` đã được PUBLISHED và có `Class` đang chạy, thì **KHÔNG ĐƯỢC PHÉP SỬA ĐỔI NỘI DUNG** (Lesson, Exam) của Edition đó.

**Cách hệ thống giải quyết:**
1. **Trạng thái PUBLISHED là bất biến (Read-only):** Khi Edition v1 đã public, Admin không thể sửa text của Lesson hay đổi câu hỏi trong Exam của v1. Mọi nút "Edit" sẽ bị khóa hoặc hiện cảnh báo: *"Edition này đang có lớp học. Hãy Clone sang Edition mới để sửa"*.
2. **Cơ chế Clone (Deep Copy):**
    - Khi Admin muốn sửa, họ bấm nút "Create New Edition" (ví dụ v2).
    - Hành động này sẽ **nhân bản (clone)** toàn bộ `Chapter`, `ChapterItem`, `Lesson` từ v1 sang v2 (tạo ra ID mới hoàn toàn).
    - Về mặt Đề thi (`Exam`): Ở phiên bản đơn giản nhất, v2 vẫn trỏ chung `linkedExamId` của v1. Nếu Admin muốn sửa đề thi, họ phải clone cả `Exam` đó ra thành một bản mới và gắn vào v2.
3. **Tác dụng an toàn:** Lớp học cũ (đang dùng v1) vẫn học đúng Lesson ID cũ, làm đề Exam ID cũ. Lớp học mới (dùng v2) học Lesson ID mới, Exam ID mới. Dữ liệu của user đang học không bao giờ bị ảnh hưởng. Đề thi không bị sửa đổi làm mất tính toàn vẹn của lịch sử làm bài.

---

## 4. Luồng Quy trình chi tiết (Sau khi đơn giản hóa)

### Phần 1: Luồng Quản trị (Admin) - Chuẩn bị Nội dung & Cấu trúc

**Bước 1: Tạo Ngân hàng câu hỏi (Content Creation)**
1. Vào `Academy > Questions` để tạo các `Question`.
2. Vào `Academy > Question Pools` để tạo các `QuestionPool` và thêm câu hỏi vào.

**Bước 2: Tạo Đề thi (Exam Creation)**
1. Vào `Academy > Exams` và nhấn "Tạo mới". Đặt tên và cấu hình cơ bản.
2. Tạo các `ExamSection` và thêm câu hỏi vào đề.
3. Publish `Exam`.

**Bước 3: Tạo Bài học (Lesson) & Gắn đề thi**
1. Trong giao diện chỉnh sửa Syllabus (`Course Edition`), thêm một `ChapterItem` loại `LESSON`.
2. Trong form tạo Lesson, bật tùy chọn `Có Quiz/Assignment` (hasQuiz = true).
3. Chọn `Exam` đã tạo ở Bước 2 làm bài kiểm tra mặc định (`linkedExamId`).
4. Publish `CourseEdition`.

### Phần 2: Luồng Giảng viên (Lecturer) - Tùy chỉnh cho Lớp LIVE

- **Lớp VOD:** Không cần làm gì thêm, hệ thống tự động dùng đề mặc định từ Syllabus.
- **Lớp LIVE:**
  1. Giảng viên vào trang quản lý của `Class` (LIVE).
  2. Mở tab "Bài tập/Kiểm tra", danh sách các Lesson có bài kiểm tra sẽ hiện ra.
  3. Nếu muốn đổi đề: Chọn "Ghi đè đề thi (Override)", chọn một `Exam` khác thay thế cho đề gốc của Admin.
  4. Đặt `deadline` cho bài kiểm tra (nếu cần).

### Phần 3: Luồng Học viên (Learner) - Làm bài

1. Học viên vào khóa học và học bài (Lesson).
2. Cuối bài học, học viên nhấn nút "Làm bài kiểm tra".
3. **Xác định `examId`:** Backend kiểm tra xem có bản ghi Override cho Class/Lesson này không.
   - Nếu có (Lớp LIVE bị ghi đè) -> lấy `overrideExamId`.
   - Nếu không -> lấy `linkedExamId` gốc của Lesson.
4. **Validation:** Backend kiểm tra Enrollment (`ACTIVE` hoặc `COMPLETED`), `Exam` có câu hỏi hay không. Lớp VOD thì bỏ qua check `maxAttempts` (hoặc check theo cấu hình mới).
5. Tạo `ExamAttempt` và trả về giao diện thi. Nộp bài, lưu lịch sử như bình thường.

---

## 5. Kịch bản sử dụng thực tế (Use Case Scenarios)

### Kịch bản 1: Tạo một bài Quiz ngắn sau mỗi bài học (Lesson)
1. **Admin:** Vào `Exams`, tạo 1 `Exam` có tên "Quiz Bài 1", lấy 5 câu hỏi từ Pool. Publish.
2. **Admin:** Vào khóa học N5, chỉnh sửa Syllabus, tạo "Lesson 1". Tích chọn "Có bài Quiz" và chọn đề "Quiz Bài 1".
3. **Học viên:** Học xong Lesson 1, bấm "Làm bài" -> Hệ thống tự động mở "Quiz Bài 1".

### Kịch bản 2: Giảng viên đổi đề khó hơn cho lớp LIVE
1. **Giảng viên:** Thấy "Quiz Bài 1" mặc định hơi dễ. Vào `Exams` tự tạo một đề mới tên "Quiz Bài 1 - Nâng cao".
2. **Giảng viên:** Vào Dashboard quản lý lớp LIVE của mình. Chọn mục Bài tập, tìm đến "Lesson 1". Cài đặt Override trỏ tới đề "Quiz Bài 1 - Nâng cao" và set Hạn nộp là cuối tuần.
3. **Học viên (Lớp LIVE):** Khi học xong Lesson 1 và bấm làm bài, hệ thống sẽ mở đề "Nâng cao" thay vì đề gốc.

### Kịch bản 3: Tổ chức một kỳ thi thử JLPT N3 độc lập
1. **Admin:** Tạo một `Exam` tên "JLPT N3 Mock Test - 2025" với 3 Section (Từ vựng, Ngữ pháp + Đọc, Nghe) và thời gian chuẩn. Publish.
2. **Admin:** Có thể tạo một Khóa học/Lớp học đặc biệt chỉ để thi. Gắn đề "JLPT N3 Mock Test" vào một Lesson duy nhất của lớp đó.
3. **Học viên:** Tham gia lớp, mở Lesson và thi. Flow thi sẽ chạy theo trải nghiệm màn hình UI thi mô phỏng thực tế.