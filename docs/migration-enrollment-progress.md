# Migration Guide: Enrollment & LessonProgress

## Tổng Quan

Hướng dẫn migrate các bảng `enrollments` và `lesson_progress` vào Prisma schema.

---

## Step 1: Thêm Models Vào Prisma Schema

Thêm vào file `apps/server/prisma/schema.prisma`:

```prisma
// Enrollment - User enrollment vào courses
model Enrollment {
  id                String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId            String    @map("user_id") @db.Uuid
  courseId          String    @map("course_id") @db.Uuid
  enrollmentDate    DateTime  @default(now()) @map("enrollment_date")
  completionStatus  String    @default("in_progress") @map("completion_status") @db.VarChar(20)
  completionPercentage Decimal @default(0.00) @map("completion_percentage") @db.Decimal(5, 2)
  lastAccessedAt    DateTime? @map("last_accessed_at")
  completedAt       DateTime? @map("completed_at")
  paymentId         String?   @map("payment_id") @db.Uuid
  couponAppliedId   String?   @map("coupon_applied_id") @db.Uuid
  finalPrice        Decimal   @map("final_price") @db.Decimal(10, 2)
  isGift            Boolean   @default(false) @map("is_gift")
  giftMessage       String?   @map("gift_message") @db.Text
  senderId          String?   @map("sender_id") @db.Uuid
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @default(now()) @updatedAt @map("updated_at")

  user   User   @relation("UserEnrollments", fields: [userId], references: [id], onDelete: Cascade)
  course Course @relation("CourseEnrollments", fields: [courseId], references: [id], onDelete: Cascade)
  sender User?  @relation("GiftEnrollments", fields: [senderId], references: [id], onDelete: SetNull)
  progress LessonProgress[]

  @@unique([userId, courseId])
  @@index([userId])
  @@index([courseId])
  @@index([completionStatus])
  @@map("enrollments")
}

// LessonProgress - Progress tracking cho từng lesson
model LessonProgress {
  id              String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  enrollmentId    String    @map("enrollment_id") @db.Uuid
  lessonId        String    @map("lesson_id") @db.Uuid
  status          String    @default("not_started") @db.VarChar(20)
  watchedDuration Int       @default(0) @map("watched_duration")
  totalDuration   Int       @map("total_duration")
  lastWatchedAt   DateTime? @map("last_watched_at")
  completedAt     DateTime? @map("completed_at")
  notes           String?   @db.Text
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @default(now()) @updatedAt @map("updated_at")

  enrollment Enrollment @relation(fields: [enrollmentId], references: [id], onDelete: Cascade)
  lesson     Lesson     @relation("LessonProgress", fields: [lessonId], references: [id], onDelete: Cascade)

  @@unique([enrollmentId, lessonId])
  @@index([enrollmentId])
  @@index([lessonId])
  @@index([status])
  @@map("lesson_progress")
}
```

---

## Step 2: Update Existing Models

### Update User Model

Thêm relations vào `User` model:

```prisma
model User {
  // ... existing fields ...
  
  // Relations
  enrollments      Enrollment[] @relation("UserEnrollments")
  giftEnrollments  Enrollment[] @relation("GiftEnrollments")
  // ... other relations ...
}
```

### Update Course Model

Thêm relations vào `Course` model:

```prisma
model Course {
  // ... existing fields ...
  
  // Relations
  enrollments Enrollment[] @relation("CourseEnrollments")
  // ... other relations ...
}
```

### Update Lesson Model

Thêm relations vào `Lesson` model:

```prisma
model Lesson {
  // ... existing fields ...
  
  // Relations
  progress LessonProgress[] @relation("LessonProgress")
  // ... other relations ...
}
```

---

## Step 3: Generate Migration

```bash
cd apps/server

# Generate migration
npx prisma migrate dev --name add_enrollment_and_lesson_progress

# Hoặc nếu đã có database, tạo migration SQL manually
npx prisma migrate dev --create-only --name add_enrollment_and_lesson_progress
```

---

## Step 4: Review Migration SQL

Kiểm tra file migration được tạo trong `apps/server/prisma/migrations/`:

```sql
-- CreateTable
CREATE TABLE "enrollments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "enrollment_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completion_status" VARCHAR(20) NOT NULL DEFAULT 'in_progress',
    "completion_percentage" DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    "last_accessed_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "payment_id" UUID,
    "coupon_applied_id" UUID,
    "final_price" DECIMAL(10,2) NOT NULL,
    "is_gift" BOOLEAN NOT NULL DEFAULT false,
    "gift_message" TEXT,
    "sender_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_progress" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "enrollment_id" UUID NOT NULL,
    "lesson_id" UUID NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'not_started',
    "watched_duration" INTEGER NOT NULL DEFAULT 0,
    "total_duration" INTEGER NOT NULL,
    "last_watched_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lesson_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "enrollments_user_id_course_id_key" ON "enrollments"("user_id", "course_id");

-- CreateIndex
CREATE INDEX "enrollments_user_id_idx" ON "enrollments"("user_id");

-- CreateIndex
CREATE INDEX "enrollments_course_id_idx" ON "enrollments"("course_id");

-- CreateIndex
CREATE INDEX "enrollments_completion_status_idx" ON "enrollments"("completion_status");

-- CreateIndex
CREATE UNIQUE INDEX "lesson_progress_enrollment_id_lesson_id_key" ON "lesson_progress"("enrollment_id", "lesson_id");

-- CreateIndex
CREATE INDEX "lesson_progress_enrollment_id_idx" ON "lesson_progress"("enrollment_id");

-- CreateIndex
CREATE INDEX "lesson_progress_lesson_id_idx" ON "lesson_progress"("lesson_id");

-- CreateIndex
CREATE INDEX "lesson_progress_status_idx" ON "lesson_progress"("status");

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

---

## Step 5: Add Constraints (Optional but Recommended)

Thêm CHECK constraints sau khi migration:

```sql
-- Enrollment constraints
ALTER TABLE enrollments 
  ADD CONSTRAINT chk_enrollment_status_valid 
  CHECK (completion_status IN ('in_progress', 'completed', 'dropped'));

ALTER TABLE enrollments 
  ADD CONSTRAINT chk_enrollment_percentage_range 
  CHECK (completion_percentage >= 0 AND completion_percentage <= 100);

ALTER TABLE enrollments 
  ADD CONSTRAINT chk_enrollment_price_non_negative 
  CHECK (final_price >= 0);

-- LessonProgress constraints
ALTER TABLE lesson_progress 
  ADD CONSTRAINT chk_progress_status_valid 
  CHECK (status IN ('not_started', 'in_progress', 'completed'));

ALTER TABLE lesson_progress 
  ADD CONSTRAINT chk_progress_duration_valid 
  CHECK (watched_duration >= 0 AND watched_duration <= total_duration);

ALTER TABLE lesson_progress 
  ADD CONSTRAINT chk_progress_total_duration_positive 
  CHECK (total_duration > 0);
```

---

## Step 6: Update Prisma Client

```bash
npx prisma generate
```

---

## Step 7: Test Migration

```typescript
// Test enrollment creation
const enrollment = await prisma.enrollment.create({
  data: {
    userId: 'user-uuid',
    courseId: 'course-uuid',
    finalPrice: 100.00,
  },
});

// Test progress tracking
const progress = await prisma.lessonProgress.create({
  data: {
    enrollmentId: enrollment.id,
    lessonId: 'lesson-uuid',
    totalDuration: 300, // 5 minutes
    status: 'in_progress',
  },
});
```

---

## Step 8: Update SQL Triggers

Cập nhật `scripts/course-aggregate-triggers.sql` để include enrollment triggers (đã có sẵn, chỉ cần uncomment).

---

## ⚠️ Lưu Ý

1. **Backup database** trước khi migrate
2. **Test trên staging** trước
3. **Check foreign keys** đã tồn tại (users, courses, lessons)
4. **Data migration** nếu đã có data cũ
5. **Update application code** để sử dụng models mới

---

**Tài liệu được tạo:** 2025-01-09
**Phiên bản:** 1.0

