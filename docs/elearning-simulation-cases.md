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

## 5. Tiếp thị & Bán hàng (Marketing & Sales)
| ID | Kịch bản (Scenario) | Vai trò (Role) | Kết quả mong đợi (Expected Result) |
|:---|:---|:---|:---|
| MK-01 | Áp dụng Coupon cho toàn bộ Master | Admin | Tạo coupon, gắn `courseMasterId`. Mọi Run của Master này đều validate thành công. |
| MK-02 | Coupon giới hạn cho 01 Course Run | Admin | Tạo coupon chỉ gắn `courseRunId` (Cohort VIP). Run khác của cùng Master validate thất bại. |
| MK-03 | Coupon loại trừ (Blacklist Run) | Admin | Coupon áp dụng cho Master nhưng blacklist `run_02`. Run_02 validate thất bại. |
| MK-04 | Thêm vào giỏ hàng (Cart) | Learner | Chọn một Course Run cụ thể -> Add to Cart -> `cart_items` lưu `courseRunId`. |
| MK-05 | Lưu vào danh sách yêu thích (Wishlist) | Learner | Lưu Course Run -> Wishlist lưu `courseRunId`. |
| MK-06 | Thanh toán & Enrollment | Learner | Thanh toán thành công -> Tự động Enroll vào đúng `courseRunId` đã mua. |

## 6. Đánh giá & Phản hồi (Feedback & Reviews)
| ID | Kịch bản (Scenario) | Vai trò (Role) | Kết quả mong đợi (Expected Result) |
|:---|:---|:---|:---|
| RV-01 | Đánh giá sau khi hoàn thành | Learner | Học viên đã hoàn thành (hoặc đủ điều kiện) mới được để lại comment & rating (gắn với `courseRunId`). |
| RV-02 | Xem đánh giá theo Run (Cohort-reflect) | Learner | Xem review của lớp khai giảng tháng 10 (thấy khen giảng viên X nhiệt tình). |
| RV-03 | Điểm rate trung bình của Run (Cohort Rating) | System | Hệ thống tính `averageRating` và `totalReviews` riêng cho mỗi `CourseRun`. |
| RV-04 | Điểm rate trung bình của Master (Global Aggregate) | System | Hệ thống tính trung bình rating từ tất cả các Run của cùng một Master để hiển thị ở trang Landing Page. |

## 7. Quản lý Bài tập & Bài nộp (Assignment & Submission)
| ID | Kịch bản (Scenario) | Vai trò (Role) | Kết quả mong đợi (Expected Result) |
|:---|:---|:---|:---|
| AS-01 | Bài tập mẫu từ syllabus (Master Template) | Staff | Tạo bài tập ở Master. Mọi Course Run kế thừa giáo trình này đều hiển thị bài tập đó. |
| AS-02 | Bài tập đặc thù cho lớp (Run Specific) | Lecturer | Giảng viên tạo thêm bài tập "Challenge Week 5" chỉ dành riêng cho Run A. Run B không thấy. |
| AS-03 | Nộp bài theo bối cảnh lớp (Run Context) | Learner | Học viên lớp A nộp bài -> `submission` lưu `courseRunId: A`. |
| AS-04 | Cách ly dữ liệu chấm điểm (Grading Isolation) | Lecturer | Giảng viên lớp A chỉ thấy và chấm được bài của học viên lớp A. |
| AS-05 | Lưu nháp & Nộp chính thức | Learner | Học viên lưu nháp (status `DRAFT`). Khi nộp chính thức (status `SUBMITTED`), hệ thống ghi nhận thời gian nộp để check `isLate`. |
| AS-06 | Trả bài yêu cầu làm lại | Lecturer | Chuyển trạng thái sang `RETURNED`. Học viên nộp lại -> `attemptNumber` tăng lên 2. |

## 8. Hệ thống Kiểm tra & Quiz (Quiz & Exam)
| ID | Kịch bản (Scenario) | Vai trò (Role) | Kết quả mong đợi (Expected Result) |
|:---|:---|:---|:---|
| QZ-01 | Quiz cố định theo giáo trình | Staff | Quiz được định nghĩa sẵn trong Syllabus Master. |
| QZ-02 | Tự động sinh đề từ Ngân hàng (Auto-gen Quiz) | Lecturer | Giảng viên chọn "Gen 20 câu ngẫu nhiên từ Pool JLPT N3" cho Run A. Mỗi Run có một bộ đề riêng lẻ. |
| QZ-03 | Giới hạn lượt làm bài theo Run | System | Run A (Free) cho làm 1 lần. Run B (Premium) cho làm 5 lần. Check theo `courseRunId`. |
| QZ-04 | Tiếp tục phiên làm bài (Resume) | Learner | Đang làm Quiz bị mất điện -> Đăng nhập lại -> Hệ thống tìm phiên `IN_PROGRESS` của đúng Run đó để làm tiếp. |
| QZ-05 | Chấm điểm tự động & NATS Notify | System | Submit Quiz -> Tính điểm -> Nếu đạt `passingScore` -> Bắn NATS Notify để cập nhật tiến trình hoặc cấp Certificate. |

## 9. Discussion & Support (Cohort Isolation)
- **Scenario 9.1: Private Cohort Discussion**
  - **Context**: "N5 Course Master" has two runs: `N5-FEB` (Lecturer A) and `N5-MAR` (Lecturer B).
  - **Action**: Student A (in `N5-FEB`) posts a topic "How to remember Kanji?".
  - **Verification**: 
    - Discussion is linked to `courseRunId` of `N5-FEB`.
    - Student B (in `N5-MAR`) **cannot** see this topic when browsing discussions for their class.
    - Lecturer A can reply, but Lecturer B does not see it in their "My Class Discussions" dashboard.

- **Scenario 9.2: Cohort-Specific Support/Refund**
  - **Action**: Student A requests a refund for "N5-FEB".
  - **Verification**:
    - Ticket stores `courseRunId`.
    - `TicketService` uses this ID to precisely verify enrollment and calculation (e.g. if `N5-FEB` has a different price than `N5-MAR`).
    - Audit log entries are scoped to the specific run.

## 10. Thống kê & Báo cáo (Analytics & Reporting)
| ID | Kịch bản (Scenario) | Vai trò (Role) | Kết quả mong đợi (Expected Result) |
|:---|:---|:---|:---|
| AN-01 | Tính điểm trung bình theo lớp | Admin | Xem báo cáo: Run A (Lecturer X) có điểm trung bình Assignment cao hơn Run B (Lecturer Y). |
| AN-02 | Tỷ lệ hoàn thành (Completion Rate) | Staff | Thống kê bao nhiêu % học viên của Run A đã hoàn thành 100% syllabus. |
| AN-03 | Đánh giá hiệu quả giảng viên | Admin | Dựa trên Rating của các Run mà giảng viên đó phụ trách để đánh giá KPI. |

## 11. Case đặc biệt & Edge Cases (Common Issues)
| ID | Kịch bản (Scenario) | Vai trò (Role) | Kết quả mong đợi (Expected Result) |
|:---|:---|:---|:---|
| EC-01 | Mạng lag văng ra nhiều lần | Learner | Hệ thống cộng dồn tổng thời gian ở trong phòng (cumulative duration) để tính % điểm danh. |
| EC-02 | Khóa học hết hạn (Expiration) | Learner | Sau N tháng (VOD) hoặc sau `endDate` (Live) -> Trạng thái Enrollment sang `EXPIRED`, không xem được nội dung khóa. |
| EC-03 | Bảo lưu khóa học (Freeze) | Support | Chuyển trạng thái sang `SUSPENDED`. Học viên không thể truy cập nhưng dữ liệu tiến độ vẫn giữ nguyên. |
| EC-04 | Admin xóa bài học đang có người học | Admin | Hệ thống chỉ soft-delete. Học viên cũ vẫn truy cập được nội dung qua snapshot của Version. |
| EC-05 | Lỗi NATS/Media Server khi kết thúc phòng | System | Cơ chế Retry hoặc Job bù (Cron) quét các phòng đã kết thúc nhưng chưa xử lý Attendance để tính toán lại. |

---

## 11. Luồng Kiểm Thử Đề Xuất (Testing Workflow)
1. **Admin**: Tạo Course Master (Syllabus N3) -> Publish.
2. **System**: Tự động tạo 01 Course Run (VOD) đại diện cho syllabus này.
3. **Staff**: Tạo thêm 02 Course Run (Live) khai giảng tháng 4 và tháng 5, gán giảng viên khác nhau.
4. **Lecturer A (Run 04)**: Vào tạo thêm 1 Bài tập bổ sung chỉ cho lớp tháng 4.
5. **Learner A**: Mua lớp tháng 4 -> Thấy bài tập chung & bài tập bổ sung.
6. **Learner B**: Mua lớp tháng 5 -> Chỉ thấy bài tập chung.
7. **Learner A**: Nộp bài -> Lecturer A thấy bài để chấm. Lecturer B không thấy.
8. **Learner A**: Hoàn thành khóa học -> Đánh giá 4 sao cho Run 04.
9. **System**: Cập nhật `averageRating` cho Run 04 là 4.0 và cập nhật rating tổng cho Master Syllabus N3.
