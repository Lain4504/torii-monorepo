# Academy Core V2 - Đặc tả Hệ thống Nhật ngữ (Strictly Typed) - Final Comprehensive Spec

## 1. Nguyên tắc thiết kế (Core Principles)
- **Không Metadata (No JSON)**: Mọi trường dữ liệu nghiệp vụ quan trọng đều được định nghĩa kiểu rõ ràng (Physical Columns) để đảm bảo toàn vẹn dữ liệu, tối ưu hóa Indexing và bảo vệ logic DB.
- **Luồng thích ứng (Adaptive Flow)**: Tự động hóa cho VOD và tùy biến sâu (Manual Grading/Override) cho lớp LIVE.
- **Duy nhất một nguồn sự thật (SSOT)**: Kết quả của học viên được lưu vết theo đúng loại thực thể để bảo toàn logic chấm điểm đặc thù.

---

## 2. Cấu trúc Database (Lớp Blueprint & Vận hành)

### 2.1 Lớp Master (Content Bank)
1. **CourseProfile**: Định nghĩa cấp độ (N5-N1), mã chuẩn và tiêu chuẩn.
2. **Assignment (Bài tập về nhà)**: Thực thể dùng cho bài tập tự luận (Sakubun, Kaiwa). Cần chấm điểm thủ công.

### 2.2 Lớp Giáo trình (Syllabus)
3. **Syllabus**: Phiên bản giáo trình (v1.0, v2.0).
4. **Module**: Đóng vai trò là folder/chương (VD: Bài 1, Bài 2) nằm trong một Syllabus.
5. **Lesson**: Đơn vị nội dung thực tế (VIDEO, READING, ASSIGNMENT) nằm trong một Module.
   - `video_url`: Chỉ dành cho loại VIDEO.

### 2.3 Lớp Vận hành (Class Delivery - LIVE specific)
6. **Class**: Thực thể lớp học. Gắn với 1 Syllabus.
7. **ClassAssignment**: Giao bài tập riêng cho lớp LIVE (Tách khỏi Syllabus).
8. **UserProgress**: Theo dõi tiến độ học tập của từng học viên.

### 2.4 Lớp Thương mại & Ghi danh (Commerce & Enrollment - CLASS-CENTRIC)
9. **CourseOffering**: Gói sản phẩm (Sản phẩm bán). 
   - Kiểm soát việc bán thông qua `status`. 
   - Một Offering có thể trỏ tới một hoặc nhiều Class (Combo).
10. **Enrollment**: Quyền truy cập nội dung học tập thông qua **Class**.
    - **SSOT cho Tiến độ**: Tiến độ học viên (UserProgress) luôn gắn với `userId` và `classId`.
    - **VOD**: Mỗi Syllabus dùng cho VOD sẽ có một "VOD Class" tương ứng. Mua xong sẽ Enroll vào Class này.
    - **LIVE**: Enroll vào Class được chỉ định hoặc hàng chờ (nếu chưa có Class).
11. **OfferingClass**: Kết nối gói bán với danh sách các lớp cụ thể.

---

## 3. Quy tắc Toàn vẹn & Vận hành (Integrity Rules) - CỰC KỲ QUAN TRỌNG

### 3.1 Khóa Giáo trình (Syllabus Locking)
- **Quy tắc**: Khi một `Syllabus` đã gắn với một `Class` có trạng thái `ONGOING` hoặc `PUBLISHED`, Syllabus đó chuyển sang trạng thái **LOCKED**.
- **Hành động**: Chặn mọi hành vi thêm/sửa/xóa bài học (`Lesson`) trong Syllabus đó để tránh làm hỏng tiến độ của các lớp đang học.
- **Cập nhật**: Muốn sửa giáo trình, Admin phải thực hiện "v1.0 -> v1.1" (Clone logic).

### 3.2 Bất biến nội dung gốc (Content Bank Immutability)
- **Quy tắc**: Assignment Master sẽ được khóa (LOCKED-READONLY) ngay khi có ít nhất 1 bản ghi làm bài (`Submission`) để bảo toàn tính minh bạch của điểm số.
- **Sửa đề**: Muốn thay đối bài tập, Sensei tạo một `ClassAssignment` mới gắn vào lớp với Assignment khác. Việc này hoàn toàn nằm trong quyền hạn vận hành của lớp học.

### 3.3 Logic Tính Tiến độ (Progress Calculation)
- **Nguồn dữ liệu**: Bảng `user_lesson_progress` lưu trạng thái hoàn thành từng bài học.
- **Công thức**: `% Tiến độ = (Số lesson đã hoàn thành) / (Tổng số lesson trong Syllabus) x 100`.
- **Phạm vi**: Chỉ đếm các thực thể bài học thực tế trong bảng `lessons`, không tính các folder `modules`.

### 3.4 Quy tắc Nộp bài (Assignment Submission)
- **Single Submission**: Mỗi học viên chỉ được phép nộp bài **01 lần duy nhất** cho mỗi Assignment trong một lớp học. Sau khi nhấn "Nộp bài", nội dung sẽ được khóa để chờ Sensei chấm điểm.
- **Không hỗ trợ nộp lại**: Hệ thống không lưu trữ lịch sử phiên bản. Mọi phản hồi của Sensei sẽ được ghi trực tiếp vào kết quả bài nộp duy nhất đó.

### 3.5 Kiểm soát "Hàn gắn" (Self-Healing Fallback)
- Nếu logic ghi đè bị lỗi (trỏ về ID không tồn tại): Hệ thống tự động **Fallback** về nội dung gốc của Lesson để không làm gián đoạn việc học.

### 3.6 Ràng buộc Cấu trúc (Structural Integrity)
- **Type-Safe Lessons**: Database phải đảm bảo loại bài học (`type`) khớp với cột dữ liệu tương ứng.
- **No Duplicate Delivery**: Chặn việc gán trùng lặp bài giảng vào lớp hoặc trùng lặp bài tập vào lớp.

### 3.7 Quy tắc Bán hàng & Trạng thái (Selling & Availability)
Để đơn giản hóa vận hành, hệ thống loại bỏ việc check `startDate/endDate` ở tầng DB cho việc bán hàng, thay vào đó sử dụng **Trạng thái (Status)**:
- **Đối với VOD (Video on Demand)**:
  - `PUBLISHED`: Gói đang được bán. Học viên mua xong có quyền vào học ngay lập tức qua VOD Class.
  - VOD không có ngày khai giảng cố định.
- **Đối với LIVE (Lớp trực tuyến)**:
  - `OPENING`: Gói đang mở bán (đang tuyển sinh). Học viên có thể mua để giữ chỗ.
  - Việc học chỉ bắt đầu khi Lớp học (`Class`) chuyển sang `ONGOING`.
  - Không quản lý ngày bắt đầu bán bằng DB, Admin chủ động chuyển trạng thái khi muốn mở/đóng cổng đăng ký.
- **Dừng bán**: Chuyển trạng thái về `DRAFT` hoặc `ARCHIVED`.

### 3.8 Mô hình "Class-Centric Enrollment" (NEW)
Hệ thống coi mọi thực thể học tập là **Class**.
- **VOD = Forever Class**: Một Syllabus dành cho VOD sẽ trỏ tới một `Class` (mode: VOD). Enrollment sẽ trỏ trực tiếp vào `class_id` này.
- **LIVE = Scheduled Class**: Enrollment sẽ trỏ vào `class_id` của lớp theo lịch.
- **Audit Trace**: `offering_id` trong bảng Enrollment dùng để truy vết nguồn gốc thanh toán (mua gói nào), không dùng cho logic lấy nội dung.
- **Tiến độ tập trung**: Mọi progress tracking luôn dựa trên `(user_id, class_id)`.

---

## 4. SQL Physical Schema (PostgreSQL)

### 4.1 Master & Infrastructure
```sql
CREATE TABLE course_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    level VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE syllabuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_profile_id UUID REFERENCES course_profiles(id),
    version_label VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, LOCKED
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    syllabus_id UUID REFERENCES syllabuses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    order_index INT DEFAULT 0,
    CONSTRAINT unique_module_order UNIQUE (syllabus_id, order_index)
);

CREATE TYPE lesson_type AS ENUM ('VIDEO', 'READING');

CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    assignment_id UUID REFERENCES assignments(id) ON DELETE SET NULL,
    type lesson_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    order_index INT DEFAULT 0,
    video_url TEXT,
    -- Enforce Type Consistency
    CONSTRAINT lesson_type_integrity CHECK (
        (type = 'VIDEO' AND video_url IS NOT NULL AND assignment_id IS NULL)
        OR
        (type = 'READING' AND video_url IS NULL AND assignment_id IS NULL)
    ),
    -- Prevent order conflicts within a module
    CONSTRAINT unique_lesson_order UNIQUE (module_id, order_index)
);
```

### 4.2 Content Bank & Exam (Standalone)
```sql
-- Content Bank
CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    instructions TEXT NOT NULL
);
```

### 4.3 Operational & Learning Layer (THE CENTER)
```sql
-- class_status: Phân tách rõ vòng đời theo loại hình
-- VOD: DRAFT -> PUBLISHED -> ARCHIVED
-- LIVE: DRAFT -> OPENING -> ONGOING -> COMPLETED -> ARCHIVED
CREATE TYPE class_status AS ENUM (
    'DRAFT',      -- Nháp
    'PENDING_APPROVAL', -- Chờ duyệt
    'PUBLISHED',  -- Đã phát hành (VOD)
    'OPENING',    -- Đang tuyển sinh (LIVE)
    'ONGOING',    -- Đang học (LIVE)
    'COMPLETED',  -- Đã kết thúc (LIVE)
    'ARCHIVED'    -- Lưu trữ
);

CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    syllabus_id UUID REFERENCES syllabuses(id),
    instructor_id UUID REFERENCES users(id),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    mode VARCHAR(10) DEFAULT 'VOD', -- 'VOD' hoặc 'LIVE'
    status class_status DEFAULT 'DRAFT',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Ghi danh (Class-Centric)
CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    class_id UUID NOT NULL REFERENCES classes(id), -- BẮT BUỘC
    offering_id UUID REFERENCES course_offerings(id), -- Tracking
    status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, EXPIRED, CANCELLED
    enrolled_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    source_order_id UUID,
    
    -- Constraints
    UNIQUE(user_id, class_id), -- Một user chỉ được vào 1 lớp 1 lần
    UNIQUE(user_id, offering_id) -- Tránh mua trùng gói
);

-- Tiến độ học tập (Tied to Class)
CREATE TABLE user_lesson_progress (
  user_id UUID NOT NULL REFERENCES users(id),
  class_id UUID NOT NULL REFERENCES classes(id),
  lesson_id UUID NOT NULL REFERENCES lessons(id),
  is_completed BOOLEAN DEFAULT FALSE,
  last_watched_at TIMESTAMP,
  PRIMARY KEY (user_id, class_id, lesson_id)
);

-- 4.4 Content Bank & Assignments
CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    instructions TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 4.5 Delivery & Submissions (LIVE specific results)
CREATE TABLE class_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
    title_override VARCHAR(255),
    open_at TIMESTAMP,
    deadline TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    -- Prevent duplicate same assignment in one class
    CONSTRAINT unique_class_assignment UNIQUE (class_id, assignment_id)
);

CREATE TABLE assignment_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    class_assignment_id UUID REFERENCES class_assignments(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    score DECIMAL(5,2),
    sensei_comment TEXT,
    status VARCHAR(20) DEFAULT 'SUBMITTED', -- SUBMITTED, GRADED, REJECTED
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    -- Single Submission per assignment/user/class instance
    CONSTRAINT unique_submission UNIQUE (user_id, class_assignment_id)
);
```

### 4.4 Commerce Layer
```sql
CREATE TYPE offering_status AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'PUBLISHED', 'OPENING', 'ARCHIVED');

CREATE TABLE course_offerings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    syllabus_id UUID REFERENCES syllabuses(id),
    code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(12,2) NOT NULL,
    sale_price DECIMAL(12,2),
    status offering_status DEFAULT 'DRAFT',
    mode VARCHAR(10) DEFAULT 'VOD',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Linking Offering to specific Classes
CREATE TABLE offering_classes (
    offering_id UUID REFERENCES course_offerings(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    PRIMARY KEY (offering_id, class_id)
);
```

