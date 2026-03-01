# Simulation Scenarios: E-Learning Business Flow (VOD & Live)

Tài liệu này liệt kê toàn bộ các kịch bản (use cases) mô phỏng quá trình vận hành thực tế của hệ thống E-Learning, bám sát tài liệu [Business Flow](./elearning-business-flow.md).

---

## 1. Quản lý nội dung (Course Master & Content)
| ID | Kịch bản (Scenario) | Vai trò (Role) | Kết quả mong đợi (Expected Result) |
|:---|:---|:---|:---|
| CM-01 | Tạo khung khóa học mới (Draft) | Staff | Khóa học ở trạng thái `DRAFT`, chưa hiển thị cho học viên. |
| CM-02 | Chặn Publish khi nội dung chưa đủ (Guard Logic) | Staff | Hệ thống báo lỗi nếu thiếu Module, Lesson hoặc Price khi nhấn Publish. |
| CM-03 | Phê duyệt nội dung khóa học | Admin | Chuyển trạng thái từ `IN_REVIEW` sang `APPROVED` hoặc `PUBLISHED`. |
| CM-04 | Chụp Snapshot khi Publish | System | Khi Publish, hệ thống tự động tạo một `CourseVersion` chứa snapshot toàn bộ modules/lessons hiện tại. |

## 2. Phiên bản khóa học (Course Versioning)
| ID | Kịch bản (Scenario) | Vai trò (Role) | Kết quả mong đợi (Expected Result) |
|:---|:---|:---|:---|
| CV-01 | Thay đổi nội dung Master sau khi đã có học viên | Staff | Sửa bài học ở Master. Học viên cũ (đang ở version cũ) vẫn thấy nội dung cũ từ snapshot. |
| CV-02 | Học viên mới đăng ký sau khi update Master | Learner | Học viên mới tự động được gán vào `versionId` mới nhất và thấy nội dung mới. |
| CV-03 | Nâng cấp phiên bản cho học viên cũ | Staff/Learner | Học viên cũ nhấn "Nâng cấp giáo trình" -> `Enrollment.versionId` cập nhật sang version mới nhất -> Thấy nội dung mới. |
| CV-04 | Truy cập bài học preview không cần enrollment | Guest | Xem được video/bài viết của bài học có đánh dấu `isPreview: true`. |

## 3. Khai giảng lớp học (Course Run / Live Class)
| ID | Kịch bản (Scenario) | Vai trò (Role) | Kết quả mong đợi (Expected Result) |
|:---|:---|:---|:---|
| CR-01 | Lên lịch khai giảng (Planning) | Staff | Tạo Course Run, thiết lập `minStudents`, `maxStudents`, `startDate`, `endDate`. |
| CR-02 | Mở bán khóa học (Enrolling) | Staff | Chuyển trạng thái Run sang `ENROLLING`. Học viên có thể mua/đăng ký. |
| CR-03 | Tự động hủy lớp do không đủ sĩ số | System | Đến `enrollmentEnd`, nếu `totalStudents < minStudents` -> Chuyển sang `CANCELLED_BY_SYSTEM`. |
| CR-04 | Chặn đăng ký khi lớp đã đầy | Learner | Nút đăng ký bị vô hiệu hóa hoặc báo lỗi khi `totalStudents >= maxStudents`. |
| CR-05 | Bắt đầu lớp học (In Progress) | System/Staff | Đến `startDate` và đủ sĩ số -> Trạng thái sang `IN_PROGRESS`. Các buổi Live Session bắt đầu được active. |

## 4. Buổi học trực tuyến & Điểm danh (Live Session & Attendance)
| ID | Kịch bản (Scenario) | Vai trò (Role) | Kết quả mong đợi (Expected Result) |
|:---|:---|:---|:---|
| LS-01 | Tạo Token WebRTC theo vai trò | System | Lecturer nhận Host token, Student nhận Viewer token, Support nhận Invisible token. |
| LS-02 | Theo dõi thời gian tham gia (Real-time) | System | Ghi nhận `joinTime` và `leaveTime` mỗi khi học viên ra/vào phòng. Cộng dồn vào `duration`. |
| LS-03 | Điểm danh đạt chuẩn (70% Threshold) | Learner | Học viên tham gia 75/90 phút -> Kết thúc buổi học, trạng thái Attendance là `present`. |
| LS-04 | Điểm danh không đạt (Cúp cua/Mạng lag) | Learner | Học viên tham gia 20/90 phút -> Kết thúc buổi học, trạng thái Attendance là `absent`. |
| LS-05 | Dạy thay (Substitute Teacher) | Admin | Thay đổi `lecturerId` trong một `LiveSession` cụ thể mà không ảnh hưởng toàn bộ Course Run. |
| LS-06 | Dời lịch học (Reschedule) | Staff | Cập nhật `startTime` mới và lưu `rescheduleReason`. Gửi thông báo cho toàn bộ học viên lớp đó. |

## 5. Case đặc biệt & Edge Cases (Common Issues)
| ID | Kịch bản (Scenario) | Vai trò (Role) | Kết quả mong đợi (Expected Result) |
|:---|:---|:---|:---|
| EC-01 | Mạng lag văng ra nhiều lần | Learner | Hệ thống cộng dồn tổng thời gian ở trong phòng (cumulative duration) để tính % điểm danh. |
| EC-02 | Khóa học hết hạn (Expiration) | Learner | Sau N tháng (VOD) hoặc sau `endDate` (Live) -> Trạng thái Enrollment sang `EXPIRED`, không xem được nội dung khóa. |
| EC-03 | Bảo lưu khóa học (Freeze) | Support | Chuyển trạng thái sang `SUSPENDED`. Học viên không thể truy cập nhưng dữ liệu tiến độ vẫn giữ nguyên. |
| EC-04 | Admin xóa bài học đang có người học | Admin | Hệ thống chỉ soft-delete. Học viên cũ vẫn truy cập được nội dung qua snapshot của Version. |
| EC-05 | Lỗi NATS/Media Server khi kết thúc phòng | System | Cơ chế Retry hoặc Job bù (Cron) quét các phòng đã kết thúc nhưng chưa xử lý Attendance để tính toán lại. |

---

## 6. Luồng Kiểm Thử Đề Xuất (Testing Workflow)
1. **Admin**: Tạo Course Master -> Thêm 2 Modules -> 4 Lessons (1 Preview).
2. **Admin**: Publish khóa học -> Tạo Version v1.
3. **Learner A**: Đăng ký học (v1).
4. **Admin**: Sửa nội dung Lesson 2 ở Master -> Publish v2.
5. **Learner B**: Đăng ký học (v2).
6. **Kiểm tra**: Learner A thấy nội dung cũ, Learner B thấy nội dung mới.
7. **Staff**: Tạo Course Run cho Live Course -> Set Enrollment End là ngày mai, Min 5 học viên.
8. **Learner C**: Đăng ký Course Run này.
9. **System (Wait 24h)**: Sĩ số chỉ có 1 -> Tự động Cancel Run.
10. **Staff**: Override ép chạy lớp -> Start Session -> Learner C vào học 80% thời gian -> Check Attendance `present`.
