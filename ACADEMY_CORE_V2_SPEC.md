# Academy Core V2 - Đặc tả Hệ thống Nhật ngữ (Strictly Typed)

## 1. Nguyên tắc thiết kế
- **Không Metadata (No JSON)**: Mọi trường dữ liệu đều được định nghĩa kiểu rõ ràng để đảm bảo toàn vẹn dữ liệu.
- **Thực thể tách biệt (Separated Entities)**: Quiz, Exam và Assignment được quản lý như các thực thể riêng biệt trong Content Bank.
- **Luồng thích ứng (Adaptive Flow)**: Phân biệt rõ nhu cầu của lớp VOD (Tự động) và lớp LIVE (Tương tác/Chấm điểm manual).

---

## 2. Database Schema (Kiến trúc 9 Bảng)

### 2.1 Cấu trúc Cơ sở
1. **Course**: Định danh khóa học gốc (VD: N3 Cấp tốc).
2. **Syllabus**: Phiên bản giáo trình (v1.0, v2.0). Chứa cây thư mục bài học.

### 2.2 Content Bank (Kho nội dung Master/Blueprint)
Hệ thống tách biệt rõ 3 thực thể để đảm bảo tính "Strictly Typed" và không conflict logic:

3. **Quiz (Trắc nghiệm nhanh)**:
   - Dùng cho kiểm tra ngắn trong bài học. Chấm tự động.
   - Model: `Quiz` -> `Question`.

4. **Exam (Kỳ thi chuẩn)**:
   - Dùng cho thi giữa/cuối khóa, thi thử JLPT. Có cấu trúc phức tạp (Sections).
   - Model: `Exam` -> `ExamSection` -> `ExamQuestion`.

5. **Assignment (Bài tập tự luận)**:
   - Dùng cho bài viết/nói cần Sensei chấm điểm. Tập trung vào lớp LIVE.
   - Model: `Assignment`.

### 2.3 Cấu trúc bài học & Vận hành
6. **Lesson**: Blueprint của Syllabus.
   - `type`: ENUM (QUIZ, EXAM, ASSIGNMENT, VIDEO, etc).
   - `quizId`, `examId`, `assignmentId`: Các FK trỏ trực tiếp (Nullable). 
   - *Lưu ý*: Chỉ 1 trong 3 ID này được phép có giá trị tùy theo `type`.

7. **ClassContent**: Phiên bản vận hành tại Lớp.
   - Chứa thông tin `openAt`, `deadline`.
   - Chứa các cột **Override**: `overrideQuizId`, `overrideExamId`, `overrideAssignmentId`.

### 2.4 Theo dõi Kết quả (Activity Layer - Không Conflict)
Thay vì dùng 1 bảng chung gây chồng chéo với logic `ExamAttempt` đã có, hệ thống sử dụng 3 bảng kết quả riêng biệt nhưng có cấu trúc đồng nhất để dễ dàng làm báo cáo:

8. **QuizAttempt**: Lưu kết quả Quiz. (Chấm tự động).
9. **ExamAttempt (Đã có)**: Lưu kết quả Exam. (Hỗ trợ cấu hình Sections phức tạp).
10. **AssignmentSubmission (Đã có)**: Lưu file nộp và điểm/lời phê từ Sensei.

---

## 3. Giải quyết Conflict & Logic Đồng bộ

### 3.1 Tại sao không Conflict với ExamAttempt?
- **Syllabus/ClassContent** đóng vai trò là "Người điều hướng" (Router). Nó chỉ định: "Ở bài học này, học viên phải làm Exam ID = 001".
- Khi học viên bấm làm bài, hệ thống sẽ khởi tạo một bản ghi trong bảng **ExamAttempt** tương ứng. 
- Mọi logic về điểm số, thời gian làm bài, chi tiết câu trả lời đều nằm trong `ExamAttempt`.
- **Báo cáo tổng hợp**: Khi cần xem "Bảng điểm lớp X", Backend sẽ thực hiện `UNION` dữ liệu từ 3 bảng `QuizAttempt`, `ExamAttempt` và `AssignmentSubmission` dựa trên `classId` và `userId`.

### 3.2 Tối ưu cho Nhật ngữ
- **Assignment**: Sensei vào bảng `AssignmentSubmission` để xem bài viết tay của học viên và nhập điểm trực tiếp.
- **Exam**: Hệ thống tự động chấm điểm Trắc nghiệm và cập nhật trạng thái `COMPLETED` vào `ExamAttempt`.

---

## 3. Đặc thù vận hành & UI

### 3.1 Quiz vs Exam
- **Quiz**: Hiển thị nút "Làm bài" ngay dưới video bài giảng. Kết quả hiện ra ngay sau khi nộp.
- **Exam**: Hiển thị trang riêng biệt với đồng hồ đếm ngược. Thường đòi hỏi hoàn thành các bài học trước đó mới được mở.

### 3.2 Assignment (Live Class Focus)
- Với lớp VOD, `Assignment` có thể hiển thị như bài tham khảo (không bắt buộc).
- Với lớp LIVE, `Assignment` là cột mốc bắt buộc.
- **UI cho Sensei**: Một Dashboard tập trung liệt kê các Assignment của các lớp đang phụ trách để vào chấm bài nhanh (Speed Grading).

### 3.3 Logic Override
Giáo viên có thể:
- Thay bài **Quiz** dễ bằng bài khó hơn.
- Thay **Assignment** "Viết về gia đình" bằng "Viết về sở thích" để tránh quay cóp giữa các khóa.
- Thay đề **Exam** chính thức bằng đề thi thử dự phòng nếu rò rỉ đề.

---

## 4. Lợi ích
1. **Minh bạch**: Quản trị viên biết rõ nội dung nào cần chấm tay (Assignment), nội dung nào tự động (Quiz/Exam).
2. **Linh hoạt**: Dễ dàng mở rộng thêm loại nội dung mới (VD: Lab, Coding) mà không phá vỡ cấu trúc cũ.
3. **Báo cáo**: Dễ dàng trích xuất "Bảng tổng hợp điểm" gồm 3 cột riêng biệt: Trung bình Quiz, Điểm Exam, Trung bình Assignment.

---

## 5. Quy tắc Toàn vẹn & Vận hành (Integrity Rules)

Để tránh các lỗ hổng kiến trúc, hệ thống áp dụng các quy tắc "Thép" sau:

### 5.1 Khóa Giáo trình (Syllabus Locking)
- **Quy tắc**: Khi một `Syllabus` đã được gán cho một `Class` đang hoạt động (`status = ACTIVE`), Syllabus đó sẽ chuyển sang trạng thái **LOCKED**.
- **Hành động**: Admin không được phép sửa đổi/xóa các `Lesson` bên trong Syllabus đã bị khóa. 
- **Thay đổi**: Muốn thay đổi giáo trình, Admin phải dùng tính năng "Clone to new version" (v1.0 -> v1.1), chỉnh sửa trên v1.1 và gán cho các lớp học sau này.

### 5.2 Logic Tính Tiến độ (Progress Calculation with Overrides)
- **Vấn đề**: Học viên hoàn thành bài học nào? Bài gốc hay bài ghi đè?
- **Quy tắc**: Hệ thống ưu tiên **Override**. 
- **Công thức**: 
  - Nếu `ClassContent.overrideId` có giá trị: Trạng thái hoàn thành tính dựa trên `Attempt` của `overrideId`.
  - Nếu `ClassContent.overrideId` là NULL: Tính dựa trên `Attempt` của `Lesson.referenceId`.
- Điều này đảm bảo khi giáo viên đổi đề thi, học sinh làm đề mới thì tiến độ vẫn được ghi nhận đúng.

### 5.3 Bảo vệ nội dung (Referential Integrity)
- **Quy tắc**: Không được phép xóa (Hard Delete) các thực thể trong Content Bank (Quiz, Exam, Assignment) nếu chúng đang được tham chiếu bởi bất kỳ `Lesson` hoặc `ClassContent` (nội dung ghi đè) nào.
- **Giải pháp**: Ưu tiên sử dụng `status = ARCHIVED` để ẩn nội dung cũ, thay vì xóa khỏi Database.

### 5.4 Luồng nộp lại bài (Assignment Revisions)
- **Đặc thù Nhật ngữ**: Bài viết Sakubun thường phải sửa nhiều lần.
- **Quy tắc**: 
  - Bảng `AssignmentSubmission` đóng vai trò là "Thư mục nộp bài". 
  - Mỗi lần học viên nộp lại, hệ thống sẽ tạo một bản ghi mới trong bảng `AssignmentHistory` (lưu trữ file, thời gian nộp, lời phê cũ).
  - Trạng thái và điểm số cuối cùng được cập nhật ngược lại bảng `AssignmentSubmission` (Latest State).

### 5.5 Kiểm soát "Hàn gắn" (Self-Healing)
- Nếu một `ClassContent` cố tình trỏ ghi đè tới một ID không tồn tại hoặc sai loại (Ví dụ: `overrideQuizId` trỏ tới một `AssignmentId`): Hệ thống phải có cơ chế **Fallback** tự động quay về nội dung mặc định của Syllabus và ghi log cảnh báo cho Admin.

### 5.6 Clone Giáo trình (Versioning Mechanics)
- **Hành vi Clone**: Khi tạo Syllabus v2.0 từ v1.0, hệ thống sẽ **clone toàn bộ các bản ghi `Lesson`** của v1.0. 
- **Giữ nguyên tham chiếu**: Các `Lesson` ở v2.0 ban đầu vẫn sẽ trỏ (`referenceId`) về cùng các đề Quiz/Exam trong Content Bank giống hệt v1.0. Điều này giúp tối ưu dung lượng DB.

### 5.7 Bất biến dữ liệu gốc (Content Bank Immutability) - Lỗ hổng cuối cùng
- **Vấn đề**: Syllabus v1 và v2 đều trỏ chung về "Quiz A". Nếu Admin vào kho đề sửa trực tiếp nội dung của "Quiz A", thì các lớp đang học v1 cũng bị đổi đề giữa chừng! 
- **Quy tắc**: Nếu một nội dung trong Content Bank (Quiz/Exam/Assignment) đang được trỏ tới bởi ít nhất 1 Syllabus ở trạng thái **LOCKED** hoặc 1 `ClassContent` **ACTIVE**, nội dung đó sẽ trở thành **Read-Only (Chỉ đọc)**.
- **Giải pháp**: Muốn sửa đề thi, Admin phải dùng nút "Duplicate to Edit", tạo ra "Quiz A (Bản sửa đính chính)", sau đó vào Syllabus v2.0 để trỏ định tuyến sang Quiz mới này.
