# Course-Module-Lesson Schema - Production Readiness Checklist

## Tổng Quan

Tài liệu này đánh giá mức độ sẵn sàng của schema Course-Module-Lesson để lên production.

---

## ✅ Đã Có (Production Ready)

### 1. Core Tables
- ✅ **courses** - Đầy đủ fields cần thiết
- ✅ **modules** - Đầy đủ fields cần thiết
- ✅ **lessons** - Đầy đủ fields cần thiết
- ✅ **course_instructors** - Junction table cho instructors
- ✅ **lesson_materials** - Junction table cho materials
- ✅ **reviews** - Đánh giá courses
- ✅ **wishlists** - Favorite courses
- ✅ **quizzes** - Quizzes liên kết với courses/lessons

### 2. Essential Features
- ✅ Soft delete (`deletedAt`) cho tất cả tables
- ✅ Timestamps (`createdAt`, `updatedAt`)
- ✅ Indexes cơ bản (foreign keys, status, jlptLevel)
- ✅ Unique constraints (slug, course+user combinations)
- ✅ Cascade deletes (modules → lessons, courses → modules)
- ✅ Status management (draft/published/archived)
- ✅ Ordering support (`orderIndex`)

### 3. Business Logic
- ✅ Preview lessons (`isPreview`)
- ✅ Free courses (`isFree`)
- ✅ Featured courses
- ✅ Pricing (price, discountPrice)
- ✅ Ratings & reviews
- ✅ Tags & filtering
- ✅ JLPT level filtering

---

## ⚠️ Thiếu (Cần Bổ Sung Cho Production)

### 1. **Enrollment Table** ❌ CRITICAL

**Vấn đề:** Bảng `enrollments` có trong SQL nhưng **chưa có trong Prisma schema**.

**Tại sao cần:**
- Track user enrollment vào courses
- Payment tracking
- Completion status
- Progress tracking
- Analytics

**Cần migrate:**
```prisma
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

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  course Course @relation(fields: [courseId], references: [id], onDelete: Cascade)

  @@unique([userId, courseId])
  @@index([userId])
  @@index([courseId])
  @@index([completionStatus])
  @@map("enrollments")
}
```

**Impact:** ⚠️ **CRITICAL** - Không thể track enrollment, payment, completion

---

### 2. **Lesson Progress Table** ❌ CRITICAL

**Vấn đề:** Bảng `lesson_progress` có trong SQL nhưng **chưa có trong Prisma schema**.

**Tại sao cần:**
- Track lesson completion
- Video watch progress
- Student notes
- Analytics
- Resume watching

**Cần migrate:**
```prisma
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
  lesson     Lesson     @relation(fields: [lessonId], references: [id], onDelete: Cascade)

  @@unique([enrollmentId, lessonId])
  @@index([enrollmentId])
  @@index([lessonId])
  @@index([status])
  @@map("lesson_progress")
}
```

**Impact:** ⚠️ **CRITICAL** - Không thể track progress, resume watching

---

### 3. **Missing Indexes** ⚠️ MEDIUM

**Cần bổ sung indexes cho performance:**

```sql
-- Course indexes
CREATE INDEX IF NOT EXISTS idx_courses_type_status ON courses(type, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_courses_featured ON courses(featured) WHERE featured = true AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_courses_created_at ON courses(created_at DESC) WHERE deleted_at IS NULL;

-- Module indexes
CREATE INDEX IF NOT EXISTS idx_modules_course_order ON modules(course_id, order_index) WHERE deleted_at IS NULL;

-- Lesson indexes
CREATE INDEX IF NOT EXISTS idx_lessons_module_order ON lessons(module_id, order_index) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_lessons_preview ON lessons(is_preview) WHERE is_preview = true AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_lessons_content_type ON lessons(content_type) WHERE deleted_at IS NULL;
```

**Impact:** ⚠️ **MEDIUM** - Performance có thể chậm với nhiều data

---

### 4. **Validation Constraints** ⚠️ MEDIUM

**Cần thêm CHECK constraints:**

```sql
-- Course constraints
ALTER TABLE courses ADD CONSTRAINT chk_course_price_non_negative 
    CHECK (price >= 0);
ALTER TABLE courses ADD CONSTRAINT chk_course_discount_valid 
    CHECK (discount_price IS NULL OR discount_price <= price);
ALTER TABLE courses ADD CONSTRAINT chk_course_rating_range 
    CHECK (average_rating >= 0 AND average_rating <= 5);
ALTER TABLE courses ADD CONSTRAINT chk_course_status_valid 
    CHECK (status IN ('draft', 'published', 'archived'));

-- Lesson constraints
ALTER TABLE lessons ADD CONSTRAINT chk_lesson_duration_positive 
    CHECK (video_duration IS NULL OR video_duration > 0);
ALTER TABLE lessons ADD CONSTRAINT chk_lesson_content_type_valid 
    CHECK (content_type IN ('video', 'article', 'interactive'));
```

**Impact:** ⚠️ **MEDIUM** - Data integrity, tránh invalid data

---

### 5. **SQL Triggers** ⚠️ RECOMMENDED

**Cần apply SQL triggers để auto-update aggregates:**

- File: `scripts/course-aggregate-triggers.sql`
- Status: ✅ Đã tạo, cần apply vào database

**Impact:** ⚠️ **RECOMMENDED** - Tự động maintain consistency

---

### 6. **Missing Relations** ⚠️ LOW

**Cần thêm relations trong Prisma:**

```prisma
// Trong Course model
enrollments Enrollment[]

// Trong Lesson model  
progress LessonProgress[]
```

**Impact:** ⚠️ **LOW** - Chỉ ảnh hưởng code convenience

---

## 📊 Production Readiness Score

| Category | Status | Score |
|----------|--------|-------|
| **Core Schema** | ✅ Complete | 100% |
| **Enrollment Tracking** | ❌ Missing | 0% |
| **Progress Tracking** | ❌ Missing | 0% |
| **Indexes** | ⚠️ Partial | 60% |
| **Constraints** | ⚠️ Partial | 50% |
| **Triggers** | ⚠️ Created, not applied | 50% |
| **Relations** | ⚠️ Partial | 70% |

**Overall Score: ~55%** ⚠️ **NOT READY FOR PRODUCTION**

---

## 🎯 Action Items Trước Khi Lên Production

### Priority 1: CRITICAL (Phải có)

1. ✅ **Migrate Enrollment table vào Prisma schema**
   - Tạo migration
   - Update relations
   - Test enrollment flow

2. ✅ **Migrate LessonProgress table vào Prisma schema**
   - Tạo migration
   - Update relations
   - Test progress tracking

3. ✅ **Apply SQL Triggers**
   - Run `scripts/course-aggregate-triggers.sql`
   - Test triggers hoạt động
   - Recalculate existing data

### Priority 2: IMPORTANT (Nên có)

4. ⚠️ **Add missing indexes**
   - Performance optimization
   - Query speed improvement

5. ⚠️ **Add validation constraints**
   - Data integrity
   - Prevent invalid data

### Priority 3: NICE TO HAVE

6. ⚠️ **Complete Prisma relations**
   - Code convenience
   - Type safety

---

## ✅ Checklist Trước Khi Deploy

### Schema
- [ ] Enrollment table migrated
- [ ] LessonProgress table migrated
- [ ] All indexes created
- [ ] All constraints added
- [ ] SQL triggers applied and tested
- [ ] Relations complete in Prisma

### Data Integrity
- [ ] Foreign key constraints working
- [ ] Unique constraints working
- [ ] Check constraints working
- [ ] Soft delete working correctly
- [ ] Cascade deletes working correctly

### Performance
- [ ] Indexes on all foreign keys
- [ ] Indexes on frequently queried fields
- [ ] Query performance tested
- [ ] Triggers performance acceptable

### Testing
- [ ] Unit tests for models
- [ ] Integration tests for enrollment flow
- [ ] Integration tests for progress tracking
- [ ] Load testing (if applicable)

### Documentation
- [ ] Schema documented
- [ ] API endpoints documented
- [ ] Business rules documented
- [ ] Migration guide available

---

## 🚀 Migration Plan

### Step 1: Add Missing Tables
```bash
# 1. Add Enrollment và LessonProgress vào Prisma schema
# 2. Generate migration
npx prisma migrate dev --name add_enrollment_and_progress

# 3. Review migration SQL
# 4. Apply migration
```

### Step 2: Add Indexes & Constraints
```bash
# 1. Create migration file manually
# 2. Add indexes và constraints
# 3. Apply migration
npx prisma migrate dev --name add_indexes_and_constraints
```

### Step 3: Apply Triggers
```bash
# 1. Apply SQL triggers
psql -U username -d database -f scripts/course-aggregate-triggers.sql

# 2. Recalculate existing data
psql -U username -d database -c "SELECT recalculate_all_course_aggregates();"
```

### Step 4: Update Application Code
- Update Prisma client
- Add enrollment endpoints
- Add progress tracking endpoints
- Update relations usage

### Step 5: Testing
- Test enrollment flow
- Test progress tracking
- Test triggers
- Performance testing

---

## 📝 Kết Luận

### Hiện Tại: ⚠️ **CHƯA SẴN SÀNG**

**Lý do:**
1. ❌ Thiếu **Enrollment** table (CRITICAL)
2. ❌ Thiếu **LessonProgress** table (CRITICAL)
3. ⚠️ Thiếu một số indexes và constraints

### Sau Khi Bổ Sung: ✅ **SẴN SÀNG**

**Sau khi:**
1. ✅ Migrate Enrollment và LessonProgress
2. ✅ Add indexes và constraints
3. ✅ Apply SQL triggers
4. ✅ Test đầy đủ

**Thì schema sẽ sẵn sàng cho production!**

---

**Tài liệu được tạo:** 2025-01-09
**Phiên bản:** 1.0
**Status:** ⚠️ Needs Migration Before Production

