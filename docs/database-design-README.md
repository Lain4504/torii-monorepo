# Database Design Documentation - Torii Nihongo

## Tổng quan

Tài liệu này mô tả thiết kế database hoàn chỉnh cho dự án **Torii Nihongo** - Giải pháp lớp học trực tuyến WebRTC và AI phản hồi thời gian thực bằng FastMCP cho trung tâm Nhật Ngữ.

**Project Code:** SP26SE005

## Cấu trúc tài liệu

Tài liệu được chia thành các file sau để dễ quản lý:

### 1. `database-design-overview.md`
- Tổng quan về database
- Entity Relationship Diagram (ERD) - Mermaid format
- Nhóm các bảng theo chức năng
- Technology stack

### 2. `database-design-schema.md`
- Chi tiết schema các bảng nhóm 1-5:
  - User Management & Authentication
  - Course Management
  - Enrollment & Learning Progress
  - Live Classes (WebRTC)
  - Assessments & Quizzes

### 3. `database-design-schema-part2.md`
- Chi tiết schema các bảng nhóm 6-12:
  - Payments & Financial
  - Flashcards & Vocabulary
  - Assignments & Submissions
  - Gamification
  - Community & Content
  - File Management
  - Additional Tables

### 4. `database-design-user-stories.md`
- User story flows cho từng role:
  - Learner (8 stories)
  - Lecturer (5 stories)
  - Staff (5 stories)
  - Admin (3 stories)
- Business rules summary
- Database operations cho mỗi flow

## Các nhóm bảng chính

### 1. User Management & Authentication (6 bảng)
- `users` - Người dùng chính
- `user_identities` - OAuth providers
- `sessions` - User sessions
- `two_factor_auth` - 2FA configuration
- `role_permissions` - RBAC
- `audit_logs` - Audit trail

### 2. Course Management (4 bảng)
- `courses` - Khóa học
- `modules` - Modules/chapters
- `lessons` - Bài học
- `course_instructors` - Giảng viên khóa học

### 3. Enrollment & Learning Progress (2 bảng)
- `enrollments` - Đăng ký khóa học
- `lesson_progress` - Tiến độ học tập

### 4. Live Classes - WebRTC (5 bảng)
- `live_classes` - Lớp học trực tuyến
- `live_class_enrollments` - Đăng ký lớp học
- `class_materials` - Tài liệu lớp học
- `room_info` - LiveKit room info
- `room_files` - Files trong room

### 5. Assessments & Quizzes (5 bảng)
- `question_bank` - Ngân hàng câu hỏi
- `quizzes` - Bài kiểm tra
- `quiz_questions` - Câu hỏi trong quiz
- `quiz_attempts` - Lần làm bài
- `quiz_attempt_details` - Chi tiết từng câu

### 6. Payments & Financial (4 bảng)
- `payments` - Thanh toán
- `coupons` - Mã giảm giá
- `user_wallets` - Ví người dùng
- `wallet_transactions` - Lịch sử giao dịch ví

### 7. Flashcards & Vocabulary (3 bảng)
- `flashcard_decks` - Bộ flashcard
- `flashcards` - Thẻ flashcard
- `flashcard_reviews` - Lịch sử ôn tập

### 8. Assignments & Submissions (2 bảng)
- `assignments` - Bài tập
- `submissions` - Nộp bài

### 9. Gamification (3 bảng)
- `achievements` - Thành tựu
- `user_achievements` - Thành tựu người dùng
- `user_points` - Điểm và cấp độ

### 10. Community & Content (3 bảng)
- `blog_posts` - Bài viết blog
- `blog_comments` - Bình luận
- `notifications` - Thông báo

### 11. File Management (1 bảng)
- `file_assets` - File storage

### 12. Additional Tables (2 bảng)
- `wishlist` - Danh sách yêu thích
- `reviews` - Đánh giá khóa học

**Tổng cộng: ~40 bảng**

## Technology Stack

- **Database:** PostgreSQL
- **ORM:** Prisma
- **Primary Keys:** UUID (gen_random_uuid())
- **Timestamps:** TIMESTAMP with timezone
- **JSON Fields:** JSONB for flexible metadata

## Key Features

### 1. Multi-Role System
- **Learner:** Học viên
- **Lecturer:** Giảng viên
- **Staff:** Nhân viên
- **Admin:** Quản trị viên

### 2. Course Types
- **VOD (Video on Demand):** Khóa học video
- **Live (WebRTC):** Lớp học trực tuyến real-time

### 3. Live Classes (WebRTC)
- Tích hợp LiveKit
- Recording support
- Whiteboard, chat, screen sharing
- Attendance tracking
- Class materials

### 4. Assessment System
- Question bank với nhiều loại câu hỏi
- Practice tests và JLPT mock exams
- Time-limited quizzes
- Detailed attempt tracking

### 5. Gamification
- Points system
- Achievements và badges
- Streak tracking
- Leaderboards

### 6. Payment System
- Multiple payment methods (VNPay, MoMo, ZaloPay, etc.)
- Coupon system
- User wallet với credits
- Refund tracking

### 7. Flashcards với SRS
- Spaced Repetition System (SM-2 algorithm)
- Multiple decks
- Review tracking

### 8. AI Integration Ready
- `ai_metadata` JSONB fields trong courses, modules, lessons
- Support cho FastMCP AI agents:
  - Sensei Agent (grammar, translation)
  - Assessment Agent (test generation)
  - Analytics Agent (progress tracking)

## Business Rules Highlights

### Enrollment
- Một user chỉ có thể enroll một lần cho mỗi course (UNIQUE constraint)
- Enrollment yêu cầu payment status='completed'
- Gift enrollments không yêu cầu payment từ người nhận

### Live Classes
- Enrollment giới hạn bởi max_students
- Attendance được track qua joined_at timestamp
- Participation score tính từ total_duration

### Quizzes
- Max attempts được enforce
- Time limit được track (time_remaining)
- Passing score required cho is_passed flag

### Payments
- Status flow: pending → processing → completed/failed
- Coupon validation: check valid_from, valid_until, usage_limit
- Refunds tracked trong wallet_transactions

### Progress
- Lesson completion: watched_duration >= 90% của total_duration
- Course completion: tất cả lessons completed
- Progress percentage calculated từ lesson_progress

## ERD Visualization

Xem ERD diagram trong `database-design-overview.md` (Mermaid format)

Có thể render bằng:
- GitHub (tự động render Mermaid)
- VS Code với Mermaid extension
- Online: https://mermaid.live

## Implementation Notes

### Prisma Schema
Schema hiện tại trong `apps/server/prisma/schema.prisma` đã có một số bảng. Cần bổ sung:
- `live_classes`
- `live_class_enrollments`
- `class_materials`
- `payments`
- `coupons`
- `user_wallets`
- `wallet_transactions`
- `assignments`
- `submissions`
- `achievements`
- `user_achievements`
- `user_points`
- `flashcard_reviews`

### Migrations
Khi thêm bảng mới, tạo migration:
```bash
cd apps/server
npx prisma migrate dev --name add_live_classes
```

### Indexes
Tất cả indexes quan trọng đã được định nghĩa trong schema. Đảm bảo:
- Foreign keys có indexes
- Columns thường query có indexes
- Composite indexes cho queries phức tạp

## User Story Coverage

Tài liệu `database-design-user-stories.md` cover đầy đủ các user stories từ requirements:

### Learner (8 stories)
✅ Browse and purchase courses  
✅ Access video-based courses  
✅ Register and join live classes  
✅ Access shared class materials  
✅ Create and study flashcards  
✅ Take practice tests and JLPT exams  
✅ View test history and performance  
✅ Track payment history  

### Lecturer (5 stories)
✅ View assigned live classes  
✅ Manage live sessions  
✅ Manage class members and attendance  
✅ Assign and review assignments  
✅ Upload teaching materials  

### Staff (5 stories)
✅ Manage courses  
✅ Manage question banks  
✅ Manage tests and exams  
✅ Manage coupons and promotions  
✅ Monitor live sessions  

### Admin (3 stories)
✅ Manage dashboard statistics  
✅ Manage user accounts  
✅ Manage payments  

## Next Steps

1. **Review và validate** schema với team
2. **Implement missing tables** trong Prisma schema
3. **Create migrations** cho các bảng mới
4. **Update API services** để support các features mới
5. **Add indexes** nếu cần optimize queries
6. **Test user flows** với database mới

## References

- Prisma Schema: `apps/server/prisma/schema.prisma`
- SQL Scripts: `scripts/database.sql`
- Requirements: User query (functional requirements)

---

**Last Updated:** 2024-12-28  
**Version:** 1.0

