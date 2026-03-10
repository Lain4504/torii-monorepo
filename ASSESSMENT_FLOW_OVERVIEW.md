# Spec: Toàn cảnh Hệ thống LMS - Kiến trúc Class-Centric hoàn thiện

## 1. Triết lý thiết kế: Một bộ khung, Hai thước đo

Hệ thống sử dụng chung cấu trúc Syllabus (`class_modules`) nhưng áp dụng logic vận hành và đánh giá khác nhau dựa trên cột `mode` của Lớp học:
- **VOD:** Đánh giá qua **Tiến độ học tập** (Học viên hoàn thành chuỗi bài học tự động).
- **LIVE:** Đánh giá qua **Điểm danh (Attendance)** và **Kết quả bài tập (Exam/Assignment)**.

---

## 2. Sơ đồ Database (ER Diagram)

```mermaid
erDiagram
    CourseProfile ||--o{ CourseOffering : "bán"
    CourseOffering ||--|{ Class : "nối vào"

    Class ||--o{ ClassModule : "sở hữu cấu trúc"
    ClassModule ||--o{ ClassContentItem : "sở hữu nội dung"
    
    %% VOD Logic
    Class ||--o{ LearningProgress : "tracks (VOD)"
    LearningProgress }o--|| ClassContentItem : "marked for"

    %% LIVE Logic
    Class ||--o{ LiveSchedule : "dates (LIVE)"
    LiveSchedule ||--o{ Attendance : "điểm danh"
    
    %% Content Mapping
    ClassContentItem }o--|| LessonBank : "video/lý thuyết gốc"
    ClassContentItem ||--|| Exam : "đề thi riêng lớp"
    ClassContentItem }o--|| Assignment : "bài tập riêng lớp"

    Class ||--o{ Assignment : "đề bài tập"
    Assignment ||--o{ AssignmentSubmission : "bài làm của học viên"

    Enrollment ||--|| Class : "ghi danh"
    ExamAttempt }o--|| Class : "kết quả thi"
```

---

## 3. Chi tiết Schema Database (SQL DDL)

### 3.1. Nhóm Bán hàng & Lớp học
```sql
CREATE TABLE classes (
    id UUID PRIMARY KEY,
    course_profile_id UUID REFERENCES course_profiles(id),
    name VARCHAR(255),
    mode VARCHAR(10), -- 'VOD' | 'LIVE'
    status VARCHAR(20),
    default_expires_months INT, -- VOD
    opening_date TIMESTAMP,     -- LIVE
    closing_date TIMESTAMP,     -- LIVE
    instructor_id UUID,         -- LIVE
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 3.2. Nhóm Syllabus (Sở hữu bởi từng Lớp học)
Giao diện nhập liệu sẽ thay đổi dựa trên `mode` của Lớp:
- **Lớp VOD (Picking Mode):** Chọn bài giảng từ `LessonBank`. Mặc định hiển thị trọn bộ Video + Files.
- **Lớp LIVE (Planning Mode):** 
    - **Nhặt tài liệu từ Bank:** Admin chọn bài từ `LessonBank` nhưng cấu hình là `kind: 'MATERIAL'`. Hệ thống sẽ **tự động ẩn Video**, chỉ cho phép học viên tải/xem tài liệu đi kèm.
    - **Soạn giáo án riêng:** Nhập `TOPIC` (tiêu đề buổi học) và upload `MATERIAL` (Slide/PDF lẻ) trực tiếp cho lớp.

```sql
CREATE TABLE class_modules (
    id UUID PRIMARY KEY,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    title VARCHAR(255),
    order_index INT
);

CREATE TABLE class_content_items (
    id UUID PRIMARY KEY,
    module_id UUID REFERENCES class_modules(id) ON DELETE CASCADE,
    kind VARCHAR(20), -- 'VIDEO' (từ Bank), 'MATERIAL' (Slide/PDF lẻ), 'EXAM', 'ASSIGNMENT', 'TOPIC'
    reference_id UUID, -- ID LessonBank, Exam, Assignment hoặc File
    order_index INT,
    status VARCHAR(20) DEFAULT 'PUBLISHED', -- 'HIDDEN' | 'PUBLISHED' (Cho LIVE điều phối)
    available_from TIMESTAMP,               -- Hẹn giờ mở (Cho LIVE)
    deadline TIMESTAMP,                     -- Hạn nộp (Cho LIVE)
    is_prerequisite BOOLEAN DEFAULT FALSE   -- Chặn tiến độ (Cho VOD)
);
```

### 3.3. Nhóm Đánh giá & Điểm danh
```sql
CREATE TABLE attendance (
    id UUID PRIMARY KEY,
    schedule_id UUID REFERENCES live_schedules(id) ON DELETE CASCADE,
    user_id UUID,
    status VARCHAR(20), -- 'PRESENT', 'ABSENT', 'LATE'
    marked_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE learning_progress (
    id UUID PRIMARY KEY,
    user_id UUID,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    content_item_id UUID REFERENCES class_content_items(id) ON DELETE CASCADE,
    completed_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, content_item_id)
);
```

---

## 4. Quản lý Phiên bản và Chỉnh sửa (Versioning)

1.  **Isolation:** Mỗi lớp học sở hữu Syllabus riêng. Sửa Lớp A không ảnh hưởng Lớp B.
2.  **Nâng cấp VOD:** Để tạo bản 2026 từ 2025, Admin dùng lệnh **Clone Class**.
    - Hệ thống nhân bản toàn bộ cấu trúc Syllabus và các bản ghi `Exam`, `Assignment`.
    - Các mục `kind: VIDEO` vẫn trỏ về Video ID cũ trong `LessonBank` để tiết kiệm dung lượng.
    - Admin thoải mái xóa bài cũ, thêm bài mới trong bản 2026.

---

## 5. Giả lập Quy trình Vận hành Thực tế

### 5.1. Luồng VOD: Đóng gói và Nâng cấp
- **Năm 2025:** Staff tạo `Class_VOD_2025`. Ráp 50 video từ Bank. Học viên mua và học theo tiến độ tự động.
- **Năm 2026:** Admin thực hiện **Clone Class** 2025 sang `Class_VOD_2026`. Admin xóa bài số 5, thêm 10 bài mới. Người dùng mua gói 2026 sẽ học lộ trình mới này.

### 5.2. Luồng LIVE: Theo đợt linh hoạt
- **Đợt 1 (Tháng 3):** Lớp thầy Tanaka dạy. Thầy upload Slide riêng của thầy vào Tab "Tài liệu" của lớp. Điểm danh học viên qua bảng `attendance`.
- **Đợt 2 (Tháng 6):** Lớp cô Yamada dạy. Cô không dùng Slide của thầy Tanaka mà tự soạn Syllabus mới, tự tạo bộ đề thi mới từ Question Bank.

-- 4. BÀI TẬP TỰ LUẬN (Dành cho Lớp học)
CREATE TABLE assignments (
    id UUID PRIMARY KEY,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE, -- Thuộc sở hữu của lớp
    title VARCHAR(255),
    instruction TEXT,         -- Đề bài, hướng dẫn làm bài
    attachments TEXT[],       -- Danh sách link file đính kèm (ví dụ đề bài PDF)
    max_score DECIMAL(5, 2),  -- Thang điểm (thường là 10 hoặc 100)
    status VARCHAR(20),       -- 'DRAFT', 'PUBLISHED'
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE assignment_submissions (
    id UUID PRIMARY KEY,
    assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20),       -- 'DRAFT', 'SUBMITTED', 'GRADED'
    content TEXT,             -- Nội dung bài viết của học viên
    file_urls TEXT[],         -- File bài làm học viên upload (ảnh chụp vở, file word)
    grade DECIMAL(5, 2),      -- Điểm do giảng viên chấm
    feedback TEXT,            -- Nhận xét của giảng viên
    submitted_at TIMESTAMP DEFAULT NOW(),
    graded_at TIMESTAMP,      -- Ngày chấm điểm
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

---

# HƯỚNG DẪN TRIỂN KHAI (IMPLEMENTATION PROMPT)

**LƯU Ý:** Chỉ đọc duy nhất file này, không đọc các file spec khác. KHÔNG giữ backward compatibility. Xóa sạch logic cũ liên quan đến `CourseEdition`. Chỉ chạy lệnh npx prisma generate, còn npx prisma db push hay migration tôi sẽ tự chạy sau. Yêu cầu làm xong phần nào thì update checklist bên dưới file này, bên dưới ##CHECKLIST để các agent khác có thể biết tiến độ.

## GIAI ĐOẠN 1: BACKEND REFACTOR - [x]
- [x] **DB:** Xóa các bảng `CourseEdition`, `Chapter`, `ChapterItem`, `QuizTemplate`, `AssignmentTemplate`.
- [x] **Schema:** Nâng cấp bảng `Class` và tạo các bảng `ClassModule`, `ClassContentItem`, `Attendance`, `LearningProgress`.
- [x] **Services:** 
    - Viết logic `Deep Clone Class`: Nhân bản toàn bộ Syllabus + Exams của lớp sang ID mới.
    - API `GET /classes/:id/syllabus`: Trả về cây dữ liệu dựa trên `class_id`.
    - API `Auto-Enroll`: Mua `CourseOffering` -> Tự động tạo `Enrollment` cho danh sách `classIds` gắn kèm.

## GIAI ĐOẠN 2: WEB-ADMIN (SYLLABUS BUILDER) - [ ]
- [ ] **Syllabus Manager:** Tạo UI quản lý chuyên đề (Module) và nội dung (Item).
    - **Mode VOD:** Ưu tiên nút "Chọn bài giảng từ Bank".
    - **Mode LIVE:** Ưu tiên nút "Thêm Tiêu đề" và "Upload Slide/PDF".
- [ ] **Exam Creator:** Tích hợp việc tạo trực tiếp `Exam` ngay tại Syllabus Item (không qua Template).

## GIAI ĐOẠN 3: WEB-LEARNER (STUDENT EXPERIENCE) - [ ]
- [ ] **Syllabus Sidebar:** 
    - Lớp VOD: Hiện % tiến độ, mở khóa bài học tuần tự.
    - Lớp LIVE: Hiện Roadmap kiến thức + Nút tải Tài liệu chuẩn bị bài.
- [ ] **Live Schedule Tab:** Hiển thị lịch học, link vào Zoom/Meet và trạng thái điểm danh.
- [ ] **Exam UI New:** Triển khai giao diện thi: **Cuộn dọc toàn bộ câu hỏi** + **Sidebar điều hướng câu hỏi** cố định ở góc. Hỗ trợ đếm ngược theo từng Section (JLPT Style).



## CHECKLIST 