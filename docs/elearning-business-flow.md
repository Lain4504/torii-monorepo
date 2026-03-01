# Phân tích & Đề xuất Quy trình (Business Flow) cho Hệ thống E-Learning (VOD & Live)

Tài liệu này tổng hợp và phân tích các luồng (flow) thực tế để quản lý khóa học VOD và WebRTC Livestream cho hệ thống. Dựa trên bối cảnh chuyển đổi số của trung tâm ngoại ngữ, mô hình kết hợp quản lý theo **Course Master** (khung chương trình) và **Course Run** (lớp học/khóa khai giảng) là tối ưu nhất, đạt chuẩn SaaS/EdTech hiện đại.

---

## 1. Kiến trúc dữ liệu cốt lõi (Core Data Model)

Để đáp ứng được khả năng mở rộng (scale) và vận hành thực tế (update giáo trình), hệ thống chia khóa học thành các khái niệm sau:

1. **Course Master (Khung chương trình chuẩn)**: Chứa thông tin chung (Title, Description, Outline, Syllabus, tài liệu, bộ đề Quiz). Phù hợp cho VOD bán quanh năm hoặc làm gốc cho Live.
2. **Course Master Version (Phiên bản nội dung)**: Quản lý versioning của khung chương trình. Khi đổi syllabus (thêm/bớt module, sửa tài liệu) cho lớp khai giảng mới, cần tạo một version mới (`MAJOR`/`MINOR`) để lớp/khóa đang học lịch sử cũ không bị ảnh hưởng (ngăn chặn rủi ro dữ liệu bị loạn gián đoạn).
3. **Course Run / Class (Lớp/Khóa khai giảng)**: Dành riêng cho Live/Hybrid. Kế thừa và Reference tới 1 `Course Master Version` cụ thể. Chứa lịch khai giảng, giảng viên dạy chính, và danh sách học viên (`Enrollments`).
4. **Live Session (Buổi học Live)**: Từng buổi học cụ thể thuộc một `Course Run`. Quản lý `lecturer_id` (nếu có dạy thay/nghỉ đột xuất), thời gian bắt đầu, kết thúc, và cấu hình phòng WebRTC.

---

## 2. Các Vai trò (Roles) & Phân quyền chuẩn

| Role | Trách nhiệm chính trong hệ thống |
| :--- | :--- |
| **Admin** | Quản lý hệ thống, doanh thu, thanh toán, cấu hình global. Cấp quyền. |
| **Staff-LMS (Academic/Ops)** | Xây dựng khung khóa học, kiểm duyệt nội dung, setup giá, lên lịch khai giảng (Course Run) và publish. |
| **Lecturer (Giảng viên)** | Tạo nội dung trực tiếp, confirm lịch dạy, lên lớp Livestream, chấm bài. |
| **Staff-Support (CSKH)** | Giải quyết ticket, refund, freeze account, đóng vai trò moderator (ẩn danh) trong WebRTC để hỗ trợ kĩ thuật. |

---

## 3. Hệ thống Trạng thái (State Machine & Guard Logic)

Cấu trúc state chuẩn SaaS bắt buộc phải đi kèm Guard Logic (điều kiện chuyển trạng thái tự động hoặc chặn lỗi từ con người):

### Course Status (Khóa học chuẩn / VOD - *Course Master*)
- `DRAFT`: Đang xây dựng khung.
- `IN_REVIEW`: Chờ kiểm duyệt.
- `APPROVED`: Nội dung đã đạt chuẩn chất lượng.
- `PUBLISHED`: Đang public hiển thị và kinh doanh.
> **Guard Logic (CanPublish)**: Tự động chặn chuyển sang `PUBLISHED` nếu thiếu điều kiện cơ bản. Logic: `AllLessonsApproved && HasThumbnail && HasPrice && HasAtLeastOneModule`.
- `ARCHIVED`: Ngừng kinh doanh/Hiển thị.

### Class / Course Run Status (Dành cho Lớp Live)
- `PLANNING`: Đang lên lịch.
- `ENROLLING`: Mở đăng ký bán vé / Tuyển sinh.
- `IN_PROGRESS`: Lớp đang diễn ra.
- `POSTPONED` / `CANCELLED_BY_SYSTEM`: Đóng/Hủy lớp nếu không đạt **Min Enrollment** (số lượng tuyển sinh tối thiểu). Refund hệ thống tự động thông báo để support xử lý hoàn trả/dời lớp.
- `COMPLETED`: Đã kết thúc toàn bộ chương trình lớp.

### Live Session Status (Từng buổi học)
- `SCHEDULED`: Đã lên lịch, chưa tới giờ.
- `LIVE`: Đang diễn ra (Room WebRTC được active).
- `ENDED`: Đã kết thúc buổi học (Đóng room, xử lý queue Video Record).
- `RESCHEDULED`: Dời lịch học. Đặc biệt quan trọng ở VN. (Cần lưu `original_start_time`, `rescheduled_time` và `reschedule_reason`).
- `CANCELLED`: Buổi học bị hủy không dời lại (Lecturer vắng gấp/Sự cố nặng).

### Enrollment Status (Trạng thái Tham gia của Học viên)
- `ACTIVE`: Đang tham gia lớp / Khóa học bình thường.
- `SUSPENDED` (Freeze): Bảo lưu khóa học hoặc Đình chỉ tài khoản (do chargeback, vi phạm nội quy, pending xử lý sự cố).
- `REFUNDED`: Đã rời lớp và hoàn tiền (Full refund trước start date hoặc Partial hoàn lại một phần).
- `CANCELLED`: Tự hủy hoặc System kick.
- `COMPLETED`: Thi đỗ và đạt đủ điều kiện khóa học.

---

## 4. Điểm "Ăn tiền" (Production-Grade Concepts) của Hệ thống

Để hệ thống đủ sức scale và không trục trặc lúc cao điểm, cần chú ý 4 điểm cực kỳ nhạy cảm sau đây:

### 1. Lazy Room Creation & Role-Based Tokens (WebRTC Logic)
- **Lazy Load**: KHÔNG tạo WebRTC ID room sẵn. Server chỉ call qua Media API lấy Phòng & Token trước 15-30 phút tính theo giờ khai pháo.
- **Role-based Token Lifecycle**:
   - `lecturer_token`: Quyền Publisher/Host.
   - `student_token`: Quyền Subscriber, Viewer, Raise-Hand.
   - `support_token`: Tham gia ngầm, **invisible** trong phòng để Support không chen tiếng nhưng vẫn test/theo dõi được cam/mic của học viên bị lỗi.

### 2. Logic Điểm Chuyên cần (Attendance Threshold)
Hành vi ở môi trường thật: Người học ấn vào mạng lag văng ra, hoặc điểm danh rồi cúp cua. Không ghi nhận đơn thuần theo Boolean (Yes/No).
- **Quy chuẩn Check-in**: `attendance = true if (join_duration >= 70% session_duration)`. 

### 3. Reporting & Analytics Layer
Tách biệt Service hoặc API cho phần Data nhằm hỗ trợ phía Vận Hành (Trung tâm trực tiếp hưởng lợi):
- Theo dõi được Retention/NPS của học viên với từng Giáo viên.
- Refund rate của các khóa học.
- Thời gian trung bình Completion rate.

### 4. Định Hướng Kiến Trúc Microservices (Scale Phase)
Với hệ thống tích hợp Media và Tracking realtime như WebRTC, việc tách biệt service để giảm tải rủi ro là tất yếu:
```
User & Auth Service
Course Service (Master + Version) -> Class Service (Runs) -> Enrollment Service
Live Session Service -> Attendance Service (Query time/log tracking lớn)
Media Worker Service (Convert Video/Gom file Record qua Message Queue NHƯ BullMQ)
Payment / Notification Service
```

---

## 5. Kết luận & Tối Ưu Hóa (MVP vs Scale)

Flow ở trên sẽ phủ từ 85% cho tới 95% nghiệp vụ e-learning SaaS ngoài đời thật. Lựa chọn mức độ triển khai:

- **Giai đoạn 1 (Torii MVP)**:
  Tập trung triển khai vững mô hình **Master/Run**, State machine từ cơ bản đến Publish Guard. Xây dựng tốt module Lazy loading WebRTC Room. Chưa nhất thiết phải đụng tới Versioning (Course Master), System Postponed hay Complex Refund Flow để tối ưu thời gian ra mắt.
  
- **Giai đoạn 2 (Scale Phase)**:
  Thêm logic Versioning, Attendance Threshold % Time, Guard Enrollment (Waitlist/Min) và Async Workers xử lý Video Streaming hoàn thiện.

### Đề Xuất Ưu Tiên Tiếp Theo
1. Thiết kế ERD Database Schema chuẩn logic **Course_Masters (versions) -> Course_Runs -> Live_Sessions (nhớ mang `lecturer_id` xuống Session để hỗ trợ dạy thay)**.
2. Thiết lập State Transition Rules cho backend chặn các API thay đổi dữ liệu trái luồng.
