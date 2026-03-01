# Phân tích & Đề xuất Quy trình (Business Flow) cho Hệ thống E-Learning (VOD & Live)

Tài liệu này tổng hợp và phân tích các luồng (flow) thực tế để quản lý khóa học VOD và WebRTC Livestream cho hệ thống. Dựa trên bối cảnh chuyển đổi số của trung tâm ngoại ngữ, mô hình kết hợp (hybrid) quản lý theo **Course Master** (khung chương trình) và **Course Run** (lớp học/khóa khai giảng) là tối ưu nhất.

---

## 1. Kiến trúc dữ liệu cốt lõi (Core Data Model)

Để đáp ứng được khả năng mở rộng và vận hành thực tế (1 giáo trình có thể mở nhiều khóa học trực tuyến khác nhau theo thời gian), hệ thống nên chia khóa học thành 2 khái niệm:

1. **Course Master (Khung chương trình chuẩn)**: Chứa thông tin chung (Title, Description, Outline, Syllabus, tài liệu, bộ đề Quiz). Phù hợp cho VOD bán quanh năm hoặc làm gốc cho Live.
2. **Course Run / Class (Lớp/Khóa khai giảng)**: Dành riêng cho Live/Hybrid. Kế thừa từ Course Master, có chứa lịch học cụ thể (`Live Sessions`), giảng viên dạy (`Lecturer`), danh sách học viên (`Enrollments`) và phòng WebRTC.

---

## 2. Các Vai trò (Roles) & Phân quyền chuẩn

| Role | Trách nhiệm chính trong hệ thống |
| :--- | :--- |
| **Admin** | Quản lý toàn hệ thống, doanh thu, thanh toán, cấu hình global. Cấp quyền. |
| **Staff-LMS (Academic/Ops)** | Xây dựng khung khóa học, kiểm duyệt nội dung, setup giá, lên lịch khai giảng (Course Run) và publish. |
| **Lecturer (Giảng viên)** | Tạo nội dung trực tiếp (upload video, soạn quiz), confirm lịch dạy, lên lớp Livestream, chấm bài. |
| **Staff-Support (CSKH)** | Giải quyết ticket, refund, reset progress, hỗ trợ kỹ thuật WebRTC trong giờ Live (moderator), quản lý tài khoản. |

---

## 3. Đề xuất State Machine (Trạng thái)

Không nên làm quá phức tạp ngay từ đầu, cấu trúc state chuẩn SaaS bao gồm:

### Course Status (Khóa học chuẩn / VOD - *Course Master*)
- `DRAFT`: Đang xây dựng khung hoặc upload nội dung.
- `IN_REVIEW`: Giảng viên đã chuẩn bị xong, gửi cho Staff-LMS kiểm duyệt.
- `APPROVED`: Nội dung đã đạt chuẩn, chờ set giá và lịch publish.
- `PUBLISHED`: Đang hiển thị trên web public, cho phép mua/enroll (với VOD) hoặc để tham khảo (với Live).
- `ARCHIVED`: Khóa học đã cũ, ngừng bán (học viên cũ vẫn truy cập được).

### Class / Course Run Status (Dành cho Lớp Live)
- `PLANNING`: Đang lên lịch, chưa chốt giảng viên.
- `ENROLLING`: Mở đăng ký bán vé / Thu tiền học viên.
- `IN_PROGRESS`: Lớp đang diễn ra (nằm trong khoảng `start_date` tới `end_date`).
- `COMPLETED`: Đã kết thúc toàn bộ chương trình lớp học.

### Live Session Status (Từng buổi học)
- `SCHEDULED`: Đã lên lịch, chưa tới giờ.
- `LIVE`: Đang diễn ra (Room WebRTC được active).
- `ENDED`: Đã kết thúc buổi (Room WebRTC đóng, xử lý Video Record).
- `CANCELLED`: Buổi học bị hủy/dời lịch lấy buổi khác.

---

## 4. Flow Tiêu chuẩn (VOD & Livestream)

### A. Flow Khóa học Video (VOD)
1. **Tạo Khung (Staff/Lecturer)**: Staff-LMS hoặc Lecturer tạo `Course Master` định dạng VOD (DRAFT), sinh ra cấu trúc Module/Lesson.
2. **Upload & Biên soạn (Lecturer)**: Giảng viên upload video, thiết lập quiz, assignment. Sau đó gán chuyển sang trạng thái `IN_REVIEW`.
3. **Kiểm duyệt (Staff-LMS)**: Staff-LMS xem thử video từng bài, test quiz. Nếu có lỗi -> Trả về `DRAFT` kèm comment báo sửa. Nếu OK -> Chuyển `APPROVED`.
4. **Mở bán (Admin/Staff-LMS)**: Set giá, đăng ảnh bìa, meta SEO. Bấm Publish -> Trạng thái là `PUBLISHED`.
5. **Vận hành**: Học viên mua, học, hệ thống track progress, cấp chứng chỉ tự động.

### B. Flow Khóa học Livestream (WebRTC)
1. **Thiết kế Khung**: Giống VOD (tạo Syllabus, tài liệu PDF, bộ đề thi), nhưng là `Course Master` loại hình Live.
2. **Mở Lớp (Course Run)**: Mùa tuyển sinh tới, Staff-LMS tạo lớp mới dựa trên Khung (Vd: "Toeic N5 - Lớp Khai giảng tháng 10").
3. **Lên lịch & Chọn Giảng viên**: Setup cụ thể 20 buổi học, gán Giảng viên phụ trách. Trạng thái `SCHEDULED`.
4. **Cho phép Đăng ký (Enrolling)**: Học viên thanh toán để enroll đúng vào lớp đó (Course Run).
5. **Vận hành Buổi học (Live Session)**:
   - *Trước 15 phút*: Room WebRTC tạo (Lazy create), sinh Token/Pass rải cho Giảng viên & Học viên đã enroll.
   - *Đang học*: Giảng viên dạy/share screen. Ghi nhận Attendance (hệ thống tự lấy log join/leave WebRTC).
   - *Staff-Support*: Có thể vào âm thầm (moderator) để hỗ trợ fix lỗi mic/cam cho người dùng.
   - *Kết thúc*: Đóng WebRTC room tự động.
6. **Hậu kì (Pipeline)**: Video Record được vứt xuống queue encode -> Upload S3 -> Trả Server dưới dạng VOD để học viên lớp đó có thể xem Re-play.

---

## 5. Điểm "Ăn tiền" (Critical Points) khi tự build WebRTC & LMS

Để hệ thống không bị "nghẽn" trên thực tế (Production), cần chú ý:

1. **Lazy Room Creation & Token Lifecycle**: KHÔNG tạo WebRTC ID ngay từ khi tạo lớp. Chỉ gọi API khởi tạo phòng và token trước 15-30 phút tính theo giờ session. Hết giờ học thu hồi token -> Tránh được việc leak link và dọn dẹp tài nguyên dễ hơn.
2. **Tách việc giảng dạy (Master) với Việc mở lớp (Runs)**: Bắt buộc cấu trúc Database cần có `course_master` và `course_runs`. Vì hàng quý trung tâm sẽ mở lớp liên tục từ cùng 1 bộ giáo trình. Giữ 1 bản Master giúp update 1 lần cho nhiều lớp, tránh đẻ ra dữ liệu rác dài hạn.
3. **Giao diện Fall-back kĩ thuật**: Trên phòng Live chuẩn cần có 1 nút "Trợ Giúp" (bắn ticket socket ngay sang Staff-Support) vì băng thông và Device của người học ở các dải mạng VN cực kì hên xui. Thiếu tính năng này, support sẽ quá tải ở Zalo/Facebook.
4. **Microservice cho Async Tasks**: Việc Recording băng thông WebRTC + Convert Video tốn cực nhiều CPU, phải tách ra chạy Worker (BullMQ/RabbitMQ) hoặc giao cho Service khác, nếu không server NestJS chính sẽ sập ngay khi nhiều lớp học kết thúc cùng lúc.

---

## 6. Kết luận & Khuyến nghị Mức độ Triển khai

Dựa vào quy mô và nguồn lực của một đồ án/startup:
- **Flow chuẩn nhất**: Sự kết hợp giữa State Machine tinh gọn của Flow số 1 (DRAFT, REVIEW, APPROVED, PUBLISHED) và Kiến trúc Master/Run của Flow số 3 là **mô hình hoàn thiện nhất** cho Torii. Nó đáp ứng 100% flow công ty edu, scalable cực cao.

### Next steps (Nếu bạn chốt Flow này)
1. **Thiết kế/Refactor lại Entity/Schema**: Sửa lại Database Design để hỗ trợ `Course_Runs` (Classes) và `Live_Sessions`.
2. **Workflow API**: Xây dựng service để đổi Status mượt theo quy trình, validate check (chỉ được Publish nếu Syllabus có content).
3. **WebRTC Infra**: Đảm bảo luồng generate Room/Token lazy evaluation map đúng với Date/Time của `Live_Sessions`.

Bạn có thể review kỹ. Nếu OK với hệ quy chuẩn này, chúng ta có thể tiến hành ngay việc thiết kế Entity quan hệ (Database Schema / ERD) làm bước đầu tiên!
