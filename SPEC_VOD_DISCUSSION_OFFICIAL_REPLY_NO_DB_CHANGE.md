# SPEC: VOD Discussion Official Reply (No DB Change)

## Mục tiêu

- Triển khai cơ chế phản hồi chính thức cho thảo luận bài học VOD mà **không thay đổi schema DB**.
- Khi nhân sự Torii (admin/staff/instructor có quyền phù hợp) trả lời bình luận học viên, UI hiển thị rõ là phản hồi chính thức.
- Giữ nguyên luồng hiện tại của live class, không phá vỡ hành vi đang chạy.

## Bối cảnh hiện tại

- Comment bài học đang dùng module `comments` chung với `targetType=DISCUSSION`.
- Dữ liệu author hiện có: `id`, `displayName`, `avatarUrl`.
- Permission đã có trong request (`requesterPermissions`) và logic check quyền ở `CommentService`.
- Chưa có trường DB cho `supportInstructor` hoặc `officialReply`.

## Phạm vi triển khai

- Chỉ xử lý phần hiển thị/logic nghiệp vụ bằng dữ liệu sẵn có.
- Không thêm bảng/cột mới.
- Không đổi contract DB.

## Không nằm trong phạm vi

- Không làm assignment support theo từng khóa VOD ở DB.
- Không triển khai SLA/ticketing backend mới.
- Không thêm hệ thống phân công nhân sự tự động.

## Định nghĩa vai trò hiển thị (không đổi DB)

Sử dụng role/quyền hiện có để gán nhãn khi render comment:

- `INSTRUCTOR` hoặc có quyền học thuật (`academy.delivery.*`, `academy.content.*`) -> nhãn `Torii Support`.
- `ADMIN/STAFF` (hoặc quyền override nội bộ) -> nhãn `Torii Support`.
- Còn lại -> nhãn mặc định `Học viên`.

Lưu ý:

- Không đổi dữ liệu user trong DB.
- Ở UI VOD discussion, **không hiển thị danh tính staff/instructor** cho phản hồi official.
- Chỉ hiển thị tên đại diện thống nhất: `Torii Support`.

## Phương án kỹ thuật đề xuất

### 1) Backend: enrich response DTO (không đổi DB)

Tại `CommentService.toCommentDTO(...)`, bổ sung computed field trong response (runtime-only):

- `authorRoleLabel`: `'Torii Support' | 'Giảng viên' | 'Học viên'`
- `isOfficialReply`: `boolean`

Nguồn suy luận:

- Từ `comment.user.role` (nếu đang include được).
- Hoặc từ permission hiện có ở layer xử lý request.

Nếu contract schema hiện tại chưa có hai field này:

- Giai đoạn 1: tạm đưa vào dạng mở rộng (không strict) ở frontend qua `as any`.
- Giai đoạn 2: cập nhật schema TypeScript (không phải schema DB) để typed rõ ràng.

### 2) Frontend: hiển thị badge official + ẩn danh tính staff

Tại các UI discussion:

- `components/courses/lesson-discussion.tsx`
- `components/blog/comment-section.tsx` (nếu dùng chung renderer)

Render badge theo priority:

1. `isOfficialReply=true` -> hiển thị tên tác giả là `Torii Support` + badge official.
2. Không phải official -> hiển thị bình thường theo user thật.

Quy tắc hiển thị tên:

- Official comment/reply: luôn render `Torii Support`.
- Non-official: render `author.displayName` như hiện tại.
- Không hiển thị “staff nào” trong luồng VOD discussion.

### 3) Rule hiển thị theo ngữ cảnh VOD

- Với `DISCUSSION` trong trang học VOD: bật full rule official badge.
- Với live class: giữ hành vi hiện tại, có thể dùng lại cùng logic badge (không bắt buộc đổi wording).

### 4) Fallback khi thiếu dữ liệu role

- Nếu không resolve được role/permission -> coi là `Học viên`.
- Tuyệt đối không tự nhận là official nếu thiếu tín hiệu rõ ràng.

## Kế hoạch triển khai theo bước

### Bước 1: Backend mapping

- Bổ sung mapper label trong service comment.
- Trả về `authorRoleLabel`, `isOfficialReply`.
- Đảm bảo endpoint hiện có vẫn backward-compatible.

### Bước 2: Frontend render

- Thêm badge vào row header của comment/topic/reply.
- Không đổi form tạo comment của học viên.

### Bước 3: Guard hiển thị

- Chỉ hiển thị badge official cho đúng role/quyền.
- Không phụ thuộc dữ liệu phân công support.

### Bước 4: QA/UAT

- Test matrix theo user role: learner, instructor, staff/admin.
- Test cả topic-level và reply-level.
- Test các màn có dùng `CommentSection`.

## Tiêu chí chấp nhận (Acceptance Criteria)

- Học viên thấy phản hồi của staff/admin/instructor có badge chính thức.
- Với phản hồi official ở VOD discussion, UI luôn hiển thị `Torii Support` (không lộ staff cụ thể).
- Không có migration DB.
- Không ảnh hưởng API create/list/update/delete comment hiện tại.
- Không ảnh hưởng luồng comment ở các targetType khác (BLOG/FEED).

## Rủi ro & giảm thiểu

- Rủi ro: role data không đủ ở response comment -> badge sai/mất.
  - Giảm thiểu: fallback `Học viên`, không gắn official bừa.
- Rủi ro: logic role lệch giữa backend và frontend.
  - Giảm thiểu: chuẩn hóa map ở backend, frontend chỉ render theo field trả về.
- Rủi ro: hiểu nhầm giữa live và vod.
  - Giảm thiểu: gate logic theo context trang học VOD.

## Gợi ý rollout

- Rollout theo feature flag FE (`ENABLE_OFFICIAL_DISCUSSION_BADGE`).
- Bật nội bộ trước, verify với 1-2 khóa VOD, sau đó bật toàn bộ.

## Kết luận

Giải pháp tối ưu hiện tại là thêm lớp `official label` ở response + UI render badge, tận dụng role/quyền sẵn có, không đổi DB. Cách này triển khai nhanh, rủi ro thấp, và vẫn đủ rõ ràng cho học viên nhận biết phản hồi chính thức từ Torii.

