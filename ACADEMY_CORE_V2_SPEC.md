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

### 2.4 Lớp Thương mại & Ghi danh (Commerce & Enrollment)
9. **CourseOffering**: Gói sản phẩm (Sản phẩm bán). 
   - Kiểm soát việc bán thông qua `status` thay vì dùng các cột ngày tháng phức tạp, remove các field đó.
10. **Enrollment**: Quyền truy cập.
    - **VOD**: Truy cập Syllabus ngay khi thanh toán.
    - **LIVE**: Được xếp vào hàng chờ, truy cập nội dung theo tiến độ khai giảng của Lớp.
11. **OfferingClass**: (LIVE only) Kết nối gói bán với danh sách các lớp dự kiến.

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
  - `PUBLISHED`: Gói đang được bán. Học viên mua xong có quyền vào học ngay lập tức.
  - VOD không có ngày khai giảng cố định.
- **Đối với LIVE (Lớp trực tuyến)**:
  - `OPENING`: Gói đang mở bán (đang tuyển sinh). Học viên có thể mua để giữ chỗ.
  - Việc học chỉ bắt đầu khi Lớp học (`Class`) chuyển sang `ONGOING`.
  - Không quản lý ngày bắt đầu bán bằng DB, Admin chủ động chuyển trạng thái khi muốn mở/đóng cổng đăng ký.
- **Dừng bán**: Chuyển trạng thái về `DRAFT` hoặc `ARCHIVED`.

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
        (type = 'ASSIGNMENT' AND assignment_id IS NOT NULL AND video_url IS NULL)
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

### 4.3 Delivery & Results (Operational)
```sql
-- class_status: Phân tách rõ vòng đời theo loại hình
-- VOD: DRAFT -> PUBLISHED -> ARCHIVED
-- LIVE: DRAFT -> OPENING -> ONGOING -> COMPLETED -> ARCHIVED
CREATE TYPE class_status AS ENUM (
    'DRAFT',      -- Nháp (Dùng chung)
    'PUBLISHED',  -- Đã phát hành - Học viên có thể vào học (VOD only)
    'OPENING',    -- Đang tuyển sinh (LIVE only)
    'ONGOING',    -- Đang học (LIVE only)
    'COMPLETED',  -- Đã kết thúc (LIVE only)
    'ARCHIVED'    -- Lưu trữ củ (Dùng chung)
);

CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    syllabus_id UUID REFERENCES syllabuses(id),
    instructor_id UUID,
    mode VARCHAR(10) DEFAULT 'VOD', -- 'VOD' hoặc 'LIVE'
    status class_status DEFAULT 'DRAFT'
);

-- Theo dõi tiến độ học bài
CREATE TABLE user_lesson_progress (
    user_id UUID NOT NULL,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT FALSE,
    last_watched_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, class_id, lesson_id)
);

-- Assignment cho lớp LIVE (Tách khỏi Syllabus)
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

-- Results Layer
CREATE TABLE assignment_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    class_assignment_id UUID REFERENCES class_assignments(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    score DECIMAL(5,2),
    sensei_comment TEXT,
    status VARCHAR(20) DEFAULT 'SUBMITTED',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    -- Enforce Single Submission per assignment/user
    CONSTRAINT unique_submission UNIQUE (user_id, class_assignment_id)
);
```

### 4.4 Commerce & Enrollment (Commercial Layer)
```sql
CREATE TYPE offering_status AS ENUM ('DRAFT', 'PUBLISHED', 'OPENING', 'ARCHIVED');

CREATE TABLE course_offerings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    syllabus_id UUID REFERENCES syllabuses(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(12,2) NOT NULL,
    sale_price DECIMAL(12,2),
    status offering_status DEFAULT 'DRAFT',
    mode VARCHAR(10) DEFAULT 'VOD', -- 'VOD' hoặc 'LIVE'
    created_at TIMESTAMP DEFAULT NOW()
);

-- Linking Offering to specific Classes (especially for LIVE)
CREATE TABLE offering_classes (
    offering_id UUID REFERENCES course_offerings(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    PRIMARY KEY (offering_id, class_id)
);

CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    offering_id UUID REFERENCES course_offerings(id),
    class_id UUID REFERENCES classes(id), -- NULL cho VOD, bắt buộc cho LIVE
    status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, EXPIRED, CANCELLED
    enrolled_at TIMESTAMP DEFAULT NOW(),
    -- LIVE: class_id bắt buộc, VOD: class_id NULL
    CONSTRAINT enrollment_live_requires_class CHECK (
        -- Chỉ enforce khi có dữ liệu offering.mode (cần check ở tầng Service với offering.mode = LIVE)
        class_id IS NOT NULL OR class_id IS NULL -- placeholder, logic check ở Service
    ),
    CONSTRAINT unique_enrollment UNIQUE (user_id, offering_id)
);
```
