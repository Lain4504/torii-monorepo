# Phân tích luồng Course & Business Cases – Torii Monorepo

> **Mục đích:** Thống kê, đánh giá mức độ hoàn chỉnh của luồng course (VOD vs Livestream), liệt kê business cases theo role, và các logic/case còn thiếu để tiện theo dõi và chỉnh sửa.  
> **Cập nhật:** Feb 2026.

---

## 1. Tổng quan nghiệp vụ Course

| Loại course | Mô tả | Công nghệ / Luồng chính |
|-------------|--------|--------------------------|
| **VOD** | Khóa học quay sẵn – học viên xem video/ bài học bất kỳ lúc nào | Video URL, Lesson progress, Curriculum (Module/Lesson), Learning progress |
| **Live** | Khóa học livestream – học online với giảng viên qua WebRTC | LiveSession, TeachingSchedule, Meet (LiveKit/WebRTC), Start/End/Join session |

- **Schema:** `Course.type` = `'vod'` \| `'live'` (mặc định `vod`).
- **Backend:** Course service có `getByType(type)`, `updateLiveConfig` chỉ cho course `type === 'live'`.
- **LiveSession:** Chỉ tạo được khi `course.type === 'live'`; khi Start session thì tạo room Meet (WebRTC) và gán `meetingId`.

---

## 2. Thống kê & đánh giá mức độ hoàn chỉnh

### 2.1 Luồng VOD (Course quay sẵn)

| Hạng mục | Trạng thái | Ghi chú |
|----------|------------|--------|
| Tạo/sửa/xóa course (admin/staff/instructor) | ✅ Có | Permissions: course.create, course.update, course.delete |
| Duyệt course (submit for review, publish, reject) | ✅ Có | course.submitForReview, course.publish, course.reject |
| Curriculum (Module / Lesson) | ✅ Có | CRUD module, lesson; lesson có contentType (video, article, …) |
| Ẩn video cho user chưa enroll (chỉ preview) | ✅ Có | getCurriculum truyền userId → isEnrolled → showVideoUrl |
| Learning progress (lesson progress, completion %) | ✅ Có | Lesson progress, enrollment completionPercentage |
| Enrollment (đăng ký, check enrolled) | ✅ Có | enrollmentApi.checkEnrollment, createEnrollment; gateway có `/enrollments/check/:courseId` |
| Checkout & thanh toán (mua khóa) | ✅ Có | Checkout page, PayOS; Order + Enrollment |
| Trang chi tiết khóa (marketing) | ✅ Có | `/courses/[slug]` – curriculum, sidebar, reviews, assignments list |
| Trang học bài (lesson) | ✅ Có | `/courses/[slug]/learn/lessons/[lessonId]` – video, progress tracking |
| Bài tập (Assignment) trong khóa | ✅ Một phần | Admin: CRUD, publish; Learner: list + submission; thiếu lesson contentType=assignment đầy đủ (xem CHECKLIST) |
| Quiz trong khóa | ⚠️ Chưa đủ | Trang quizzes có, nhưng chưa gắn API thật (CHECKLIST_ELEARNING.md) |
| Tài liệu bài học (Lesson materials) | ⚠️ Chưa đủ | Schema có LessonMaterial; UI tab “Tài liệu” chưa fetch API (CHECKLIST) |
| Ghi chú (Notes) | ⚠️ Chưa đủ | LessonProgress.notes có; API/UI chưa đầy đủ (CHECKLIST) |
| Comment trên lesson | ❌ Chưa | CHECKLIST: cần targetType=LESSON, lessonId |

**Kết luận VOD:** Luồng cốt lõi (course, curriculum, enrollment, học bài, tiến độ, checkout) đã có. Thiếu chủ yếu: quiz thật, lesson materials, notes, comments.

---

### 2.2 Luồng Live (Course livestream – WebRTC)

| Hạng mục | Trạng thái | Ghi chú |
|----------|------------|--------|
| Tạo course type=live, liveConfig | ✅ Có | createCourse/updateCourse type, PATCH live-config |
| Tạo/sửa/xóa LiveSession (staff) | ✅ Có | live_class.schedule; bulkCreate, create, update, delete |
| TeachingSchedule (lịch cố định tuần) | ✅ Có | TeachingScheduleSheet, API teaching-schedule |
| Schedule request (lecturer đổi lịch) | ✅ Có | LiveSessionScheduleRequest, schedule-requests page |
| Start/End session (lecturer hoặc staff) | ✅ Có | Start → tạo room Meet (WebRTC), End → room.end |
| Join session (learner enrolled, lecturer, admin) | ✅ Có | joinSession → token Meet, mở tab Meet |
| Phân quyền join (enrolled / lecturer / admin-staff) | ✅ Có | live-session.service joinSession: enrollment check |
| Sync ended (Meet → LiveSession status) | ✅ Có | syncEndedSession(meetingId) |
| Web-admin: tab “Lịch học Live” trong course detail | ✅ Có | Luôn hiển thị (nên ẩn với course type=vod) |
| Web-learner: danh sách “Live classes” | ❌ Mock | `/live-classes`, `/live-classes/[slug]` dùng mock data, không gọi API course type=live / LiveSession |
| Web-learner: xem lịch live trong khóa đã mua | ❌ Thiếu | Trong “Khóa học của tôi” / course learn không có block “Buổi sắp diễn ra” + nút “Vào phòng” |
| Recording playback sau buổi học | ⚠️ Chưa xác minh | CHECKLIST: “Xác minh Recording playback cho học viên sau buổi học” |
| Báo lỗi chất lượng video/network khi live | ❌ Chưa | CHECKLIST: “Cơ chế báo lỗi chất lượng video/network khi live” |

**Kết luận Live:** Backend và Web-admin (schedule, start/end, join) đủ dùng. Web-learner thiếu: trang live-classes dùng API thật, và trong khóa đã mua chưa có lịch live + nút vào phòng.

---

### 2.3 Đáp ứng yêu cầu nghiệp vụ

- **VOD – “quay sẵn”:** Đáp ứng đủ cho luồng: xem danh sách, chi tiết, mua, học bài, theo dõi tiến độ. Chưa đủ: quiz thật, tài liệu lesson, notes, comments.
- **Live – “stream học online WebRTC”:** Đáp ứng phía quản trị và giảng viên (lịch, bắt đầu/kết thúc, vào phòng). Học viên thiếu: danh sách lớp live thật, và trong khóa của tôi không có lịch + nút vào phòng.

---

### 2.4 Thuận tiện cho user (UX)

- **Learner:** Mua khóa, vào học bài (VOD) ổn. Không thấy lịch live và nút “Vào phòng” khi đã mua khóa live; trang “Lớp học trực tuyến” lại dùng mock nên dễ gây nhầm lẫn.
- **Lecturer:** Vào course detail (admin) để Start/End/Join live ổn; có thể cải thiện: thông báo sắp tới buổi dạy, link nhanh vào Meet.
- **Admin/Staff:** Quản lý course, curriculum, live schedule, assignments đủ dùng; có thể ẩn tab “Lịch học Live” khi course type=vod để tránh thao tác thừa.

---

## 3. Các role trong dự án (liên quan course)

Từ `packages/schemas/src/models/user.model.ts` và gateway permissions:

| Role | Mô tả ngắn |
|------|-------------|
| **ADMIN** | Toàn quyền; permissions thường bao gồm `*` hoặc đủ course.*, live_class.* |
| **LECTURER** | Giảng viên; được gán course qua CourseInstructor; có thể update course được gán, start/end/join live session được assign |
| **STAFF** / **STAFF_LMS** / **STAFF_SUPPORT** / **STAFF_SALES** / **STAFF_FINANCE** | Nhân viên; quyền theo template (course.view_restricted, course.publish, live_class.schedule, live_class.manage, …) |
| **LEARNER** | Học viên; xem catalog, mua khóa, học bài, (sẽ) xem lịch live và join nếu enrolled |

---

## 4. Business cases theo từng role

### 4.1 LEARNER

| Case | Mô tả | Hiện trạng | Ghi chú |
|------|--------|------------|--------|
| Xem catalog khóa (VOD + Live) | Lọc, tìm kiếm, xem theo loại | ✅ API advancedSearch, getByType; catalog có | Có thể thêm filter “Chỉ VOD” / “Chỉ Live” trên UI |
| Xem chi tiết khóa (trang marketing) | Curriculum, giá, instructor, reviews | ✅ Có | Dùng chung cho VOD và Live |
| Đăng ký / Mua khóa (paid) | Checkout, coupon, PayOS | ✅ Có | |
| Đăng ký khóa miễn phí | Nút “Đăng ký” → createEnrollment | ✅ Có | |
| Vào học (VOD) | Vào learn, chọn lesson, xem video, progress | ✅ Có | |
| Xem tiến độ khóa | Progress %, completed | ✅ Có (my-courses, progress page) | |
| Làm bài tập (assignment) | Xem đề, nộp bài (text/file) | ✅ Một phần | Thiếu đầy đủ lesson contentType=assignment (CHECKLIST) |
| Làm quiz trong khóa | Làm bài, nộp, xem điểm | ⚠️ Chưa đủ | Cần API + UI thật (CHECKLIST) |
| Xem lịch live của khóa đã mua | Trong “Khóa của tôi” hoặc trong course learn | ❌ Thiếu | Cần block “Buổi sắp diễn ra” + API live-sessions by course |
| Vào phòng live (khi session đang live) | Nút “Vào phòng” → join → mở Meet | ❌ Thiếu trên learner | API join có; web-learner chưa có UI gọi join + mở Meet |
| Xem lại recording buổi live | Sau khi kết thúc | ⚠️ Chưa xác minh | CHECKLIST |
| Thêm/xóa wishlist | Nút yêu thích trên course | ✅ Có | |
| Đánh giá khóa (reviews) | Xem và gửi review | ✅ Có | |
| Yêu cầu hoàn tiền (refund) | Tạo ticket | ✅ Có (support) | Logic refund → coin chưa (CHECKLIST mục 8) |

### 4.2 LECTURER

| Case | Mô tả | Hiện trạng | Ghi chú |
|------|--------|------------|--------|
| Xem danh sách khóa được gán | Chỉ courses mình là instructor | ✅ Có | Gateway filter instructorId khi không có course.view_restricted |
| Sửa nội dung khóa (draft) | Update course, module, lesson | ✅ Có | isInstructor check trong course.update |
| Tạo/sửa lesson (course live: không cho video-only) | Lesson create: live course + contentType=video → lỗi | ✅ Có | lesson.service |
| Submit course duyệt | Gửi duyệt | ✅ Có | course.update / submitForReview |
| Xem lịch dạy live (teaching schedule + sessions) | Tab “Lịch học Live” trong course detail | ✅ Có | |
| Tạo/yêu cầu đổi lịch (schedule request) | TeachingSchedule, LiveSessionScheduleRequest | ✅ Có | live_class.schedule, live_class.request_change |
| Bắt đầu buổi live | Start session → tạo room Meet | ✅ Có | Chỉ lecturer được assign hoặc staff |
| Kết thúc buổi live | End session → room.end | ✅ Có | |
| Vào phòng dạy (Join) | Join session → Meet | ✅ Có (web-admin) | |
| Xem bài tập / chấm bài | Assignments, submissions | ✅ Một phần | Admin có; lecturer có thể cần route riêng tùy permission |

### 4.3 ADMIN / STAFF (LMS / Support / Sales / Finance)

| Case | Mô tả | Hiện trạng | Ghi chú |
|------|--------|------------|--------|
| Xem toàn bộ khóa | findAll không filter instructor | ✅ Có | Khi có * hoặc course.view_restricted |
| Tạo/sửa/xóa course | CRUD course | ✅ Có | course.create, update, delete |
| Duyệt / từ chối / publish / unpublish | Workflow duyệt khóa | ✅ Có | course.publish, reject, unpublish, submitForReview |
| Gán/bỏ giảng viên (CourseInstructor) | Manage instructors | ✅ Có | course-instructor API |
| Quản lý curriculum (module, lesson) | CRUD module, lesson | ✅ Có | |
| Quản lý lịch live (teaching schedule, live sessions) | Schedule, bulk create, start/end | ✅ Có | live_class.schedule, live_class.manage |
| Join bất kỳ live session | Join với quyền staff | ✅ Có | |
| Quản lý assignments, chấm submissions | Assignments, submissions | ✅ Có (admin) | |
| Cấu hình live (liveConfig) | PATCH live-config | ✅ Có | Chỉ course type=live |
| Xử lý refund / cộng coin | Hoàn tiền cho learner | ⚠️ Chưa đủ | CHECKLIST mục 8 (Coin, Refund) |

### 4.4 Hệ thống / Tích hợp

| Case | Mô tả | Hiện trạng | Ghi chú |
|------|--------|------------|--------|
| Meet kết thúc phòng → cập nhật LiveSession | room.end hoặc webhook → status ENDED | ✅ Có | syncEndedSession(meetingId) |
| Sau khi thanh toán thành công → tạo Enrollment | Order success → Enrollment | ✅ Có (logic order/enrollment) | |
| Audit log (course create/update/publish/…) | Ghi log hành động | ✅ Có | course.service createAuditLog |
| Event course.published | Emit khi publish | ✅ Có | NATS course.published |

---

## 5. Logic / Case bị thiếu hoặc chưa triển khai đầy đủ

### 5.1 Gateway / API

- **`GET /api/courses/:id/enrollment-status`**  
  Trả về placeholder `{ isEnrolled: false }`. Trạng thái enrolled thực tế đang dùng qua `GET /api/enrollments/check/:courseId`. Nên: xóa placeholder hoặc chuyển sang gọi enrollment check và trả về thống nhất.

- **Check enrollment khi join live:**  
  Đã có: joinSession kiểm tra enrollment. Không thiếu.

- **Lecturer update liveConfig:**  
  TODO trong code: “Ensure lecturer is assigned to this course before allowing update” (course.controller PATCH live-config). Nên thêm check isInstructor trước khi cho phép update liveConfig.

### 5.2 Web-admin

- **Tab “Lịch học Live” với course VOD:**  
  Tab luôn hiển thị. Với course type=vod nên ẩn tab (hoặc disable) để tránh staff tạo live session (sẽ lỗi backend “Live sessions can only be scheduled for live courses”).

- **Phân biệt course type trên list/detail:**  
  Đã có badge/ cột type (vod/live) ở courses-columns; có thể làm rõ hơn trên course detail header.

### 5.3 Web-learner

- **Trang “Lớp học trực tuyến” (`/live-classes`, `/live-classes/[slug]`):**  
  Đang dùng mock data. Cần: gọi API (vd. getByType('live') hoặc endpoint danh sách course live + live sessions), hiển thị thật và nút đăng ký/mua dẫn tới checkout hoặc enroll.

- **Lịch live trong “Khóa học của tôi” / trong trang learn:**  
  Với course type=live, cần:  
  - Gọi API lấy danh sách LiveSession (sắp tới / đang live) theo courseId.  
  - Hiển thị block “Buổi sắp diễn ra” / “Đang live”.  
  - Nút “Vào phòng” khi status=live: gọi join API → nhận token → mở Meet (giống web-admin handleJoinLiveSession).

- **Phân biệt VOD vs Live trên course card / sidebar:**  
  Có thể hiển thị badge “Live” hoặc “VOD” và với live thì nhấn mạnh lịch sắp tới.

### 5.4 Nghiệp vụ chung (đã nêu trong CHECKLIST_ELEARNING.md)

- Quiz trong khóa: API + UI thật (endpoint, làm bài, nộp, điểm).
- Lesson materials: API + tab “Tài liệu” trong lesson.
- Notes: API + UI lưu/sửa ghi chú theo lesson.
- Comments trên lesson: targetType=LESSON, lessonId.
- Recording playback sau buổi live: xác minh và hiển thị cho học viên.
- Báo lỗi chất lượng video/network khi live.
- Refund & Coin: schema + flow (CHECKLIST mục 8).
- Points đổi coupon (CHECKLIST mục 13).
- enrollment-status: thống nhất với enrollments/check hoặc bỏ placeholder.

### 5.5 Bảo mật / Validation

- **Enrollment check:**  
  Handler `checkEnrollment` trả về isEnrolled khi `completionStatus === 'in_progress'`. Cần rõ: “completed” hoặc “dropped” có được coi là “đã từng enroll” không (vd. cho certificate, re-enroll). Hiện tại “enrolled” để vào học = in_progress là hợp lý.

- **Lesson unlock theo thứ tự:**  
  Schema có Lesson.isUnlocked; logic “bài sau mở khi hoàn thành bài trước” cần xác nhận đã áp dụng đầy đủ ở getCurriculum / learning flow.

---

## 6. Đề xuất ưu tiên chỉnh sửa

1. **Cao:**  
   - Web-learner: Kết nối `/live-classes` với API thật (course type=live + sessions).  
   - Web-learner: Trong my-courses / course learn, với course live hiển thị lịch sắp tới + nút “Vào phòng” (gọi join, mở Meet).  
   - Sửa hoặc bỏ `GET /api/courses/:id/enrollment-status` (thống nhất với enrollments/check).  
   - Web-admin: Ẩn hoặc disable tab “Lịch học Live” khi course.type === 'vod'.

2. **Trung bình:**  
   - Lecturer update liveConfig: thêm check isInstructor.  
   - Quiz trong khóa: API + UI thật.  
   - Xác minh recording playback sau buổi live và (nếu có) báo lỗi chất lượng.

3. **Thấp:**  
   - Lesson materials, Notes, Comments (theo CHECKLIST).  
   - Filter catalog “Chỉ VOD” / “Chỉ Live”.

---

## 7. Tóm tắt một trang

| Khối | VOD | Live (WebRTC) |
|------|-----|----------------|
| **Backend** | Đủ: course, curriculum, enrollment, progress, checkout | Đủ: LiveSession, TeachingSchedule, Start/End/Join, Meet integration |
| **Web-admin** | Đủ: CRUD, curriculum, assignments | Đủ: lịch live, start/end/join; nên ẩn tab Live khi type=vod |
| **Web-learner** | Đủ: xem, mua, học bài, tiến độ; thiếu quiz/materials/notes/comments | Thiếu: live-classes thật, lịch + nút “Vào phòng” trong khóa của tôi |
| **Business cases** | Phần lớn đã cover theo role | Learner chưa có UI lịch live và vào phòng; recording chưa xác minh |

---

## 8. Bảng nhanh: Logic / Case còn thiếu (checklist)

| # | Vị trí | Mô tả ngắn | Ưu tiên |
|---|--------|------------|--------|
| 1 | Gateway | `GET /api/courses/:id/enrollment-status` trả placeholder; thống nhất với enrollments/check | Cao |
| 2 | Web-admin | Ẩn tab "Lịch học Live" khi course.type === 'vod' | Cao |
| 3 | Web-learner | Trang /live-classes và /live-classes/[slug] dùng API thật (course live + sessions) | Cao |
| 4 | Web-learner | Trong my-courses / course learn: block lịch live + nút "Vào phòng" (join → Meet) | Cao |
| 5 | Gateway/Service | PATCH live-config: check lecturer được gán khóa trước khi cho phép update | TB |
| 6 | Web-learner | Quiz trong khóa: API + UI thật (làm bài, nộp, điểm) | TB |
| 7 | Hệ thống | Xác minh recording playback cho học viên sau buổi live | TB |
| 8 | Hệ thống | Cơ chế báo lỗi chất lượng video/network khi live | Thấp |
| 9 | Web-learner | Lesson materials: tab Tài liệu + API | Thấp |
| 10 | Web-learner | Notes: API + UI lưu ghi chú theo lesson | Thấp |
| 11 | Web-learner | Comments trên lesson (targetType=LESSON, lessonId) | Thấp |
| 12 | Catalog | Filter "Chỉ VOD" / "Chỉ Live" (optional) | Thấp |

---

File này có thể dùng làm checklist và theo dõi khi chỉnh sửa: đánh dấu từng mục khi hoàn thành hoặc cập nhật ghi chú theo từng sprint.
