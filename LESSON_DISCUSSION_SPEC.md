# Spec: Tính năng Thảo luận (Discussion) trong Bài học (Lesson)

## 1. Tổng quan mục tiêu
Tích hợp tính năng bình luận, thảo luận dành cho học viên ngay bên trong giao diện học tập của các bài học (ChapterItem có kind là `LESSON`). Học viên có thể hỏi đáp, chia sẻ kiến thức, và giảng viên có thể vào giải đáp.

## 2. Đánh giá Schema hiện tại
Hệ thống hiện tại đã thiết kế sẵn kiến trúc **Polymorphic Comments** (Bình luận Đa hình) cực kỳ tối ưu. Chúng ta hoàn toàn **KHÔNG CẦN TẠO BẢNG MỚI**.

Các bảng liên quan đã có:
- `Comment`: Lưu nội dung bình luận, người tạo (`userId`), và bình luận cha (`parentCommentId` - dùng cho tính năng Reply).
- `CommentTarget`: Bảng liên kết (Junction table) để gán một bình luận vào một thực thể bất kỳ (Blog, Khóa học, hay Bài học). Nó chứa `targetId` và `targetType`.
- `CommentLike`: Lưu thông tin thả tim (like) của người dùng cho bình luận.

## 3. Thiết kế Liên kết (Mapping Design)

Để gắn thảo luận vào một Bài học cụ thể, ta sẽ sử dụng bảng `CommentTarget` với quy ước như sau:

- **`targetId`**: Sẽ là ID của `ChapterItem` (Bản ghi bài học).
- **`targetType`**: Cố định là chuỗi `"LESSON"`.

**Mối quan hệ:**
`ChapterItem` (1) <---> (N) `CommentTarget` (1) <---> (1) `Comment` <---> (N) `Comment` (Replies)

**Ví dụ:** Học viên A bình luận vào Lesson có ID là `d2fa...`.
1. Tạo 1 bản ghi `Comment` (content: "Chỗ này khó hiểu quá thầy ơi").
2. Tạo 1 bản ghi `CommentTarget` (commentId: [ID vừa tạo], targetId: `d2fa...`, targetType: `"LESSON"`).

## 4. Flow nghiệp vụ (Business Flow)

### 4.1. Luồng Học viên (Learner)
1. **Đọc thảo luận:** Học viên truy cập vào bài học (`/courses/:courseId/learn`). Cuộn xuống dưới (hoặc mở tab Thảo luận), hệ thống sẽ gọi API lấy danh sách comment theo `targetId = [lessonId]` và `targetType = "LESSON"`.
2. **Viết thảo luận mới:** Học viên gõ nội dung vào khung nhập liệu và nhấn gửi.
3. **Trả lời (Reply):** Học viên nhấn "Reply" dưới bình luận của người khác. Một bình luận mới được tạo ra với `parentCommentId` trỏ đến bình luận gốc.
4. **Tương tác:** Học viên có thể nhấn "Like" một bình luận (tạo bản ghi trong `CommentLike`).
5. **Chỉnh sửa/Xóa:** Học viên có thể sửa/xóa bình luận do chính mình viết.

### 4.2. Luồng Giảng viên/Admin (Lecturer/Admin)
1. **Giải đáp:** Giảng viên truy cập bài học (hoặc qua một trang quản lý thảo luận tập trung) để xem các bình luận chưa được giải đáp và Reply. Bình luận của giảng viên nên có badge (nhãn) "Giảng viên" để học viên dễ nhận biết.
2. **Kiểm duyệt (Moderation):** Admin/Giảng viên có quyền ẩn/xóa (đổi `status` thành `deleted` hoặc `spam`) các bình luận vi phạm.

## 5. Đề xuất thiết kế API

Tạo một module mới `academy-comments` ở Backend (hoặc sử dụng chung nếu đã có) với các API sau:

1. **`GET /api/academy/comments`**
   - Query: `targetId` (bắt buộc), `targetType` (bắt buộc, ví dụ: "LESSON"), `page`, `limit`.
   - Logic: Query bảng `Comment` thông qua `CommentTarget`. Lấy ra danh sách bình luận gốc (`parentCommentId` is null), và kèm theo (include) các `replies` (hoặc phân trang replies riêng nếu cần). Include cả thông tin `user` (avatar, name).

2. **`POST /api/academy/comments`**
   - Body: `{ targetId: string, targetType: string, content: string, parentCommentId?: string }`
   - Logic: Backend sử dụng Transaction: Tạo `Comment` trước, sau đó tạo `CommentTarget` nối `Comment` với `targetId`.

3. **`PUT /api/academy/comments/:id`**
   - Body: `{ content: string }`
   - Kiểm tra quyền: Chỉ tác giả mới được sửa.

4. **`DELETE /api/academy/comments/:id`**
   - Kiểm tra quyền: Tác giả (xóa thật hoặc xóa mềm tùy chính sách), hoặc Admin/Lecturer (xóa mềm bằng cách đổi `status` = 'deleted').

5. **`POST /api/academy/comments/:id/like`**
   - Logic: Toggle (Thích / Bỏ thích). Insert hoặc Delete bản ghi trong bảng `CommentLike`.

## 6. Đề xuất Thiết kế UI/UX (Frontend)

Tại trang `/courses/[courseId]/learn`:

**Cách bố trí:**
- **Cách 1 (Cuộn dọc - Truyền thống):** Đặt khu vực "Thảo luận" ngay bên dưới trình phát Video hoặc nội dung bài học. Giống thiết kế của Udemy.
- **Cách 2 (Mở Panel bên phải - Hiện đại):** Thêm một nút (Icon hình hộp thoại) ở góc màn hình hoặc thanh công cụ. Khi bấm vào, một Drawer/Sheet trượt ra từ bên phải hiển thị danh sách comment. Cách này giúp học viên vừa xem video vừa đọc thảo luận (giống Livestream chat).

**Thành phần Component cần xây dựng (`apps/web-learner/components/comments/`):**
1. `CommentSection`: Container chính quản lý fetch data và layout.
2. `CommentInput`: Khung nhập liệu (hỗ trợ multiline `Textarea`, nút Submit).
3. `CommentList`: Danh sách bình luận.
4. `CommentItem`: Hiển thị 1 bình luận (Avatar, Tên, Thời gian `date-fns`, Nội dung). Nút Reply, Like.
5. Hiển thị lùi lề (Indentation) cho các `replies` để tạo thành dạng Thread.
