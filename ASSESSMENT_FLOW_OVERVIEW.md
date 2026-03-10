# Spec: Toàn cảnh Hệ thống LMS - Kiến trúc Class-Centric hoàn thiện

## 1. Triết lý thiết kế: Sự tự chủ của Lớp học

Hệ thống tách rời hoàn toàn giữa nội dung "nguyên liệu" và lộ trình "thực tế".
- **Syllabus cũ (Edition/Chapter):** Bị loại bỏ.
- **Class (VOD/LIVE):** Là trung tâm điều phối toàn bộ nội dung học tập và thi cử.
- **Exam/Assignment:** Được tạo trực tiếp và thuộc sở hữu của riêng từng Lớp.

---

## 2. Sơ đồ Database hoàn chỉnh (ER Diagram)

```mermaid
erDiagram
    %% --- LỚP BÁN HÀNG (SALES LAYER) ---
    CourseProfile ||--o{ CourseOffering : "is sold as"
    CourseOffering ||--|| Class : "connects to"

    %% --- LỚP VẬN HÀNH (EXECUTION LAYER) ---
    Class ||--|? VodClass : "is"
    Class ||--|? LiveClass : "is"

    %% VOD: Lộ trình cố định (Path)
    VodClass ||--o{ VodPathItem : "fixed sequence"
    VodPathItem }o--|| LessonBank : "picks video"
    VodPathItem ||--|| Exam : "assigned quiz"

    %% LIVE: Lịch trình & Thư viện (Flexible)
    LiveClass ||--o{ LiveSchedule : "calendar"
    LiveClass ||--o{ ClassMaterial : "slides/pdfs"
    LiveClass ||--o{ ClassAssessment : "exams/assignments"

    %% --- LỚP ĐÁNH GIÁ (ASSESSMENT LAYER - OWNED BY CLASS) ---
    ClassAssessment ||--|| Exam : "can be"
    ClassAssessment ||--|| Assignment : "can be"

    Exam ||--|{ ExamSection : "composed of"
    ExamSection ||--o{ ExamQuestion : "links"
    ExamQuestion }o--|| QuestionBank : "picks from pool"

    %% --- LỚP KẾT QUẢ (RESULTS LAYER) ---
    Enrollment ||--|| Class : "joins"
    ExamAttempt }o--|| Exam : "attempt of"
    ExamAttempt }o--|| Class : "within class"
    ExamAttempt }o--|| User : "by user"
```

---

## 3. Định nghĩa các bảng chính (Schema Definition)

### 3.1. Nhóm Bán hàng (Sales)
- **`CourseProfile`**: Đóng vai trò là "Không gian tên" (Namespace) và "Danh mục" môn học. Nó lưu trữ thông tin định danh (Tên, Cấp độ, Mô tả chung) và dùng để phân loại (Scoping) các tài nguyên trong Bank (Video, Câu hỏi) thuộc về môn học đó.
- **`CourseOffering`**: Gói sản phẩm thương mại cụ thể (Giá tiền, mô tả gói). Mỗi Offering sẽ dẫn lối người dùng vào một `Class` cụ thể.

### 3.2. Nhóm Ngân hàng Nội dung (The Banks - Admin quản lý)
- **`LessonBank`**: Lưu trữ các Video, bài viết lý thuyết mẫu.
- **`QuestionBank` (`QuestionPool` & `Question`)**: Ngân hàng câu hỏi khổng lồ để các lớp học vào "nhặt" đề.

### 3.3. Nhóm Vận hành Lớp VOD (Automated Path)
- **`VodPathItem`**: 
    - `classId`: ID lớp VOD.
    - `orderIndex`: Thứ tự bước.
    - `kind`: `LESSON` | `EXAM`.
    - `referenceId`: ID của Lesson hoặc Exam tương ứng.
    - `isPrerequisite`: Bắt buộc xong mới được qua bước sau.

### 3.4. Nhóm Vận hành Lớp LIVE (Flexible & Scheduled)
- **`LiveSchedule`**: Danh sách ngày/giờ lên lớp, Link Zoom/Meet.
- **`ClassMaterial`**: Thư viện Slide/PDF/Tài liệu tham khảo của riêng lớp đó.
- **`ClassAssessment`**: 
    - `classId`: ID lớp LIVE.
    - `kind`: `EXAM` | `ASSIGNMENT`.
    - `referenceId`: ID đề thi/bài tập.
    - `status`: `DRAFT` | `SCHEDULED` | `PUBLISHED`.
    - `availableFrom`: Thời điểm tự động mở đề.
    - `deadline`: Thời điểm đóng link nộp bài.

### 3.5. Nhóm Đề thi & Kết quả (Exam & Results)
- **`Exam`**: Bản ghi đề thi được tạo cho Lớp (Sở hữu bởi `classId`).
- **`ExamSection`**: Các phần thi (Từ vựng, Nghe, Đọc). Lưu `timeLimitSeconds` riêng từng phần.
- **`ExamQuestion`**: Liên kết giữa Section và Câu hỏi từ Bank.
- **`ExamAttempt`**: Lưu kết quả làm bài của từng User kèm theo `classId` để phân tách dữ liệu.

---

## 4. Danh sách các bảng bị loại bỏ (The Purge)

Để dọn dẹp Database sạch sẽ, các bảng sau sẽ bị **XÓA HOÀN TOÀN**:
1.  **`CourseEdition`**: Không dùng cơ chế phiên bản cứng nhắc nữa.
2.  **`Chapter` / `ChapterItem`**: Thứ tự bài học đã được thay thế bằng `VodPathItem` hoặc `LiveActivity`.
3.  **`QuizTemplate` / `AssignmentTemplate`**: Không dùng bảng mẫu trung gian.
4.  **`ClassAssessment` (Cũ)**: Thay bằng bảng quản lý hoạt động thực tế của lớp.

## 5. Kết luận
Kiến trúc này biến Database thành một hệ thống **Dynamic (Động)**. Nội dung không còn bị "chôn chân" trong những bản Edition cố định, mà được linh hoạt lắp ghép theo từng lớp học. Đây là giải pháp tối ưu nhất để xử lý mọi tình huống giảng dạy thực tế cho cả VOD và LIVE.

---
*Bản spec này là thiết kế Database cuối cùng cho module LMS.*
