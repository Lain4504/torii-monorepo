# Phân tích & Kế hoạch Checklist Công Việc

Dựa trên yêu cầu của bạn, tôi đã tổng hợp lại checklist, phân nhóm công việc, đánh giá mức độ ưu tiên và ước tính thời gian hoàn thành.

## 1. Danh sách công việc (Checklist)

### 🌍 Application - Trang chủ & Khám phá (Marketing & Discovery)
- [x] **Home Page**: Map API hiển thị danh sách khoá học. (Yêu cầu thêm: Tạo API mới trả về số lượng người đã mua/học viên của khoá học).
- [x] **Home Page**: Map API hiển thị danh sách đánh giá (Review list), lấy các đánh giá mới nhất.
- [x] **Course List (`/courses`)**: Cập nhật header; Sửa các bộ lọc (search/filter) để hoạt động toàn bộ; Hiển thị danh sách bài giảng (lecture) trong component `CourseCard`.
- [x] **Live Classes List (`/live-classes`)**: Cập nhật lại header tương tự.

### 📚 Application - Chi tiết & Học tập (Course Details & Learning)
- [x] **Course Detail (`/courses/[slug]`)**: Hoàn thiện tích hợp API cho trang chi tiết khóa học.
- [x] **Live Class Detail (`/live-classes/[slug]`)**: Hoàn thiện tích hợp API cho trang chi tiết live class.
- [ ] **Course Detail**: Sửa lỗi không hiển thị được nội dung Syllabus (Đề cương).
- [ ] **Learning Page (`/learn`)**: Sửa lỗi gọi API (Hiện tại gọi bằng 'slug' nhưng API yêu cầu 'id' nên không lấy được dữ liệu học tập).

### ✍️ Application - Blog & Cộng đồng (Community)
- [ ] **Blog List (`/blog`)**: Các bộ lọc (filter) phải hoạt động đầy đủ, không hiển thị Tác giả (Author) ở phía client.
- [ ] **Blog Detail (`/blog/[slug]`)**: Ẩn thông tin Tác giả ở trang chi tiết.
- [ ] **Admin Blog**: Cập nhật logic để hỗ trợ thêm bảng `BlogCategory`, hỗ trợ tìm kiếm theo tags trong Admin và khi tạo/chỉnh sửa (create/edit) bài viết.

### 🎓 Hệ thống chức năng Lõi (Quizzes, Assignments, Question Bank)
- [ ] **Quizzes**: Bổ sung logic hiển thị và làm bài Quiz trong trang học tập.
- [ ] **Assignments**: Bổ sung logic hiển thị và nộp bài tập (Assignment) trong trang học tập.
- [ ] **Question Bank**: Fix lõi tính năng Ngân hàng câu hỏi (hiện tại chưa hoạt động).
- [ ] **Instructor/Staff Portal**: Bổ sung tính năng chấm bài (Assigment/Quiz submission), xem danh sách và tiến độ học viên của khóa học (hiện chưa hoạt động).

### ⚙️ Quy trình Admin (Admin Workflow Analysis & Refactoring)
- [ ] **Course Workflow (VOD & Livestream)**: Phân tích và làm rõ nghiệp vụ, xây dựng lại (rebuild) flow duyệt khóa học từ trạng thái Draft -> Approved.
  - *Vấn đề cần giải quyết*: Ai là người tạo Lesson/Module? Lecture (Giảng viên) hay Staff-LMS? 
  - *Phân tích sơ bộ VOD*: Staff điền khung Syllabus, Lecture tải video lên, Staff-LMS (người có chuyên môn) duyệt.
  - *Phân tích sơ bộ Livestream*: Quy trình chuẩn bị Syllabus và tài liệu học sẽ như thế nào? Cần chuẩn hóa quy trình này.

---

## 2. Phân tích thứ tự ưu tiên (Ưu tiên làm gì trước)

Chúng ta nên áp dụng phương pháp giải quyết các **Blocker (Lỗi chặn tính năng)** trước, sau đó phát triển **Tính năng Core/Quy trình**, rồi mới đến **Tính năng phụ** và cuối cùng là **Các chức năng phức tạp/mới hoàn toàn**.

**Thứ tự thực hiện đề xuất:**

1. **🔴 MỨC ĐỘ 1: FIX CÁC LỖI BLOCKER (Ngày 1)**
   *Phải làm ngay vì ảnh hưởng trực tiếp đến End-User flow (Học viên không học được).*
   - [ ] Sửa API Learning page từ gọi `slug` thành gọi `id`.
   - [ ] Sửa lỗi trang Course Detail không thấy Syllabus.
   - [ ] Hoàn thiện call API cho trang Course Detail (`/courses/:slug`) và Live Class Detail (`/live-classes/:slug`).

2. **🟠 MỨC ĐỘ 2: THIẾT KẾ QUY TRÌNH & MAP API TRANG CHỦ (Ngày 2)**
   *Song song việc hiển thị ra bên ngoài, cần chốt quy trình cốt lõi bên trong.*
   - [ ] **Admin Workflow**: Phân tích chốt lại nghiệp vụ VOD vs Livestream course flow. Bắt tay vào làm lại flow duyệt khóa/bài giảng.
   - [ ] Map API Home Page (Course list + API số học viên, Review list).
   - [ ] Header & Filter trang `Courses` và `Live Classes`, hiển thị Lecture trong CourseCard.

3. **🟡 MỨC ĐỘ 3: BLOG & CỘNG ĐỒNG (Ngày 3)**
   *Module tách biệt, dễ dàng xử lý mà không sợ quá ảnh hưởng tới Core LMS.*
   - [ ] Chỉnh sửa Blog client (Filter, ẩn Author).
   - [ ] Cập nhật DB và Admin cho Blog Category và Tags.

4. **🔵 MỨC ĐỘ 4: HỆ THỐNG KIỂM TRA & ĐÁNH GIÁ LUYỆN TẬP (Quizzes/Assignments) (Ngày 4 - Ngày 7)**
   *Đây là cụm Epic tốn nhiều effort nhất.*
   - [ ] Fix Question Bank.
   - [ ] Xây dựng UI/Logic cho Assignment (Hiển thị + Nộp bài) và Quiz (Làm bài test).
   - [ ] Xây dựng màn hình Chấm bài (Grade submissions) và Màn hình quản lý Học viên trong Admin/Instructor Dashboard.

---

## 3. Tổng thời gian dự kiến (Estimation)

*(Estimate mang tính chất tham khảo cho một Dev Fullstack có kinh nghiệm với hệ thống, giả định làm việc tập trung 8h/ngày)*

- **Nhóm 1 (Blocker Fix & Details):** ~1 Ngày làm việc (6 - 8 giờ)
- **Nhóm 2 (Map Layout + Filters + Home API):** ~1.5 Ngày làm việc (10 - 12 giờ)
- **Nhóm 3 (Phân tích & Xây lại Admin Course Flow):** ~1.5 Ngày làm việc (4h phân tích kiến trúc + 8h code logic)
- **Nhóm 4 (Blog / Categories):** ~1 Ngày làm việc (6 - 8 giờ)
- **Nhóm 5 (Quiz, Assignment, Chấm bài, Question Bank):** ~3 - 4 Ngày làm việc (24 - 32 giờ). (Bao gồm làm logic Nộp bài, Quản lý ngân hàng câu hỏi, Chấm điểm).

**⏳ TỔNG THỜI GIAN DỰ TÍNH:** Khoảng **8 đến 9 ngày làm việc** (~60 - 70 giờ code thực tế) để có thể release toàn bộ checklist này ở mức hoạt động trơn tru (không tính thời gian QA/Test lại toàn hệ thống).
