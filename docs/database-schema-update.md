# Triển khai Data Schema (Prisma) cho Hybrid LMS (Course Master & Course Run)

Để triển khai thiết kế này vào ứng dụng NestJS/Prisma hiện tại mà **không làm crash hệ thống cũ** (Backward Compatible), chúng ta sẽ thực hiện theo phương pháp **thêm mới (additive)**. Bạn có thể dần dịch chuyển logic API sang các bảng mới này.

Dưới đây là các Model và Enum cần được cập nhật vào `apps/server/prisma/schema.prisma`.

## 1. Các Enums mới

Bạn cần thêm các Enum để quản lý state machine cho Lớp học (Course Run) và Trạng thái tham gia (Enrollment Status).

```prisma
// Trạng thái của Lớp Khai Giảng (Course Run)
enum CourseRunStatus {
  PLANNING
  ENROLLING
  IN_PROGRESS
  POSTPONED
  CANCELLED_BY_SYSTEM
  COMPLETED
}

// Trạng thái tham gia của Học viên (Dành cho bản update của Enrollment)
enum EnrollmentStatus {
  ACTIVE
  SUSPENDED
  REFUNDED
  CANCELLED
  COMPLETED
}
```

Khuyến nghị cập nhật status của `LiveSession` thành Enum thay vì String hiện tại (hiện tại `schema.prisma` đang dùng String "scheduled"):
```prisma
enum LiveSessionStatus {
  SCHEDULED
  LIVE
  ENDED
  RESCHEDULED
  CANCELLED
}
```

## 2. Tạo bảng `CourseRun` mới

`CourseRun` là lớp học cụ thể, kế thừa từ `Course` (Master).

```prisma
model CourseRun {
  id              String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  courseId        String   @map("course_id") @db.Uuid
  versionId       String?  @map("version_id") @db.Uuid // Gắn với một version cụ thể của CourseMaster
  
  title           String   @db.VarChar(255) // VD: "Lớp N5 Khai giảng tháng 10"
  slug            String   @unique @db.VarChar(255)
  
  // Giảng viên dạy chính của lớp này
  lecturerId      String?  @map("lecturer_id") @db.Uuid
  
  // Thời gian khai giảng & Kết thúc
  startDate       DateTime? @map("start_date")
  endDate         DateTime? @map("end_date")
  
  // Thời gian mở/đóng cổng đăng ký
  enrollmentStart DateTime? @map("enrollment_start")
  enrollmentEnd   DateTime? @map("enrollment_end")
  
  // Guard Logic (Sĩ số)
  maxStudents     Int?      @map("max_students")
  minStudents     Int?      @default(1) @map("min_students")
  
  // Ghi đè cấu hình kinh doanh (nếu có khác biệt so với Course Master)
  price           Decimal?  @db.Decimal(10, 2)
  discountPrice   Decimal?  @map("discount_price") @db.Decimal(10, 2)
  
  status          CourseRunStatus @default(PLANNING)
  
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @default(now()) @updatedAt @map("updated_at")

  // --- Relations ---
  course    Course         @relation(fields: [courseId], references: [id], onDelete: Cascade)
  version   CourseVersion? @relation(fields: [versionId], references: [id], onDelete: SetNull)
  lecturer  User?          @relation("RunLecturer", fields: [lecturerId], references: [id], onDelete: SetNull)
  
  enrollments   Enrollment[]
  liveSessions  LiveSession[]

  @@index([courseId])
  @@index([versionId])
  @@index([lecturerId])
  @@index([status])
  @@map("course_runs")
}
```

## 3. Cập nhật các bảng hiện có

Để kết nối với `CourseRun`, bạn cần cập nhật bản `User`, `Course`, `LiveSession` và `Enrollment` hiện có.

### A. Cập nhật `Course` (Course Master)
Thêm relation `courseRuns` vào model `Course`:
```prisma
model Course {
  // ... các trường hiện tại
  
  // Relation mới
  courseRuns CourseRun[]
}
```

### B. Cập nhật `User`
Do thêm relation `RunLecturer` ở `CourseRun`, ta cần cập nhật `User`:
```prisma
model User {
  // ... các trường hiện tại
  
  // Relation mới
  runsTaught CourseRun[] @relation("RunLecturer")
}
```

### C. Cập nhật `LiveSession` (Từng buổi học)
Thêm `courseRunId` để biết buổi dạy này thuộc lớp nào. Vẫn giữ `lecturerId` để cover trường hợp **Dạy Thay** hoặc **Đổi Giảng Viên** giữa chừng.

```prisma
model LiveSession {
  // ... các trường hiện tại giữ nguyên
  
  courseRunId       String?  @map("course_run_id") @db.Uuid // Relation tới lớp
  
  // Bám sát luồng Reschedule
  originalStartTime DateTime? @map("original_start_time")
  rescheduleReason  String?   @map("reschedule_reason") @db.Text
  
  // Relations
  courseRun CourseRun? @relation(fields: [courseRunId], references: [id], onDelete: Cascade)
  
  @@index([courseRunId])
}
```

### D. Cập nhật `Enrollment` (Học viên tham gia)
Trong mô hình mới, học viên học file VOD thì enroll vào `Course` (Master). Học viên học Live thì enroll vào `CourseRun` cụ thể. Do đó cần nullable `courseId` hoặc thêm `courseRunId`.

```prisma
model Enrollment {
  // ... các trường hiện tại giữ nguyên
  
  // Relation tới Lớp Khai Giảng (Dành cho khóa Live/Hybrid)
  courseRunId String? @map("course_run_id") @db.Uuid
  
  // Chuyển đổi trạng thái tham gia theo chuẩn
  enrollmentStatus EnrollmentStatus @default(ACTIVE) @map("enrollment_status")

  courseRun CourseRun? @relation(fields: [courseRunId], references: [id], onDelete: Cascade)

  @@index([courseRunId])
  @@index([enrollmentStatus])
}
```

## 4. Các bước triển khai để không chết Backend

Nếu paste toàn bộ đống này vào `schema.prisma` rồi chạy `prisma generate` + `prisma db push`, các API hiện tại của bạn sẽ **không chết** vì mình đã cố tình set các trường `courseRunId` ở dạng Nullable (`?`). 

Tuy nhiên, bạn nên làm theo lộ trình sau:
1. **Bước 1**: Copy các schema trên vào `apps/server/prisma/schema.prisma` và ấn lưu.
2. **Bước 2**: Chạy `pnpm --filter server run db:push` (hoặc `prisma migrate dev`) để map DB. (Lưu ý: Bạn phải map relation 2 chiều cẩn thận).
3. **Bước 3**: Tạo các API CRUD cho `CourseRun` (`CourseRunModule`).
4. **Bước 4**: Cập nhật logic khi tạo `LiveSession` -> Gắn thêm `courseRunId`.
5. **Bước 5**: Dần dần chuyển UI ở Web Admin quản lý theo danh sách `Course Run`. 

Bạn có muốn mình **trực tiếp thao tác sửa file `schema.prisma`** bằng công cụ và chạy lệnh generate Prisma luôn để xem có bung lỗi chỗ nào không? (Việc này hoàn toàn an toàn do mình làm backward-compatible).
