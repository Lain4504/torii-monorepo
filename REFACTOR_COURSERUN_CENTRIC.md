# CourseRun-Centric Architecture Refactor - Summary

**Date**: March 2, 2026  
**Status**: Phase 1 Complete + Schema Updates

## Overview
Refactored the e-learning system to use a **CourseRun-centric** architecture where:
- **CourseMaster** = Syllabus/Course Definition (metadata, pricing template, curriculum)
- **CourseRun** = Transaction Entity (actual scheduled course instance with specific pricing, dates, enrollment)

## Changes Implemented

### 1. WishlistService & WishlistQuantityDTO
**File**: `apps/server/modules/learning/src/modules/wishlist/wishlist.service.ts`

- Updated `findAll()` to use `courseRunId` instead of `courseMasterId`
- Modified `whereClause` to filter directly by `courseRunId`
- Schema: `packages/schemas/src/dtos/wishlist.dto.ts`
  - Removed `courseMasterId` from `wishlistQueryDTOSchema`
  - Kept `courseRunId` as primary filter

### 2. ReviewService & ReviewQueryDTO
**File**: `apps/server/modules/learning/src/modules/review/review.service.ts`

- Updated `findAll()` to support both:
  - **courseRunId**: Filter reviews for specific course run
  - **courseMasterId**: Aggregate reviews from all runs of a course master
  
- Schema: `packages/schemas/src/dtos/review.dto.ts`
  - Made `courseMasterId` optional (was required)
  - Added `courseRunId` as an optional filter

### 3. EnrollmentService & EnrollmentQueryDTO
**File**: `apps/server/modules/learning/src/modules/enrollment/enrollment.service.ts`

- Updated `findAll()` to support filtering by:
  - **courseRunId**: Filter enrollments for specific course run
  - **courseMasterId**: Aggregate enrollments from all runs (legacy support)

- Schema: `packages/schemas/src/dtos/enrollment.dto.ts`
  - Added `courseRunId` as optional field

### 4. OrderService - Already CourseRun-centric
**File**: `apps/server/modules/billing/src/modules/payment/order.service.ts`

✅ Already uses `courseRunId` exclusively  
✅ Fetches pricing from `CourseRun` entity  
✅ Supports coupon validation for both `courseMasterId` and `courseRunId`

### 5. CourseMasterService - Auto-create CourseRun
**File**: `apps/server/modules/learning/src/modules/course-master/course-master.service.ts`

✅ Already implements automatic CourseRun creation for VOD courses:
- When publishing a VOD course, automatically creates default `CourseRun`
- Title: `{CourseMaster.title} (VOD)`
- Status: `enrolling`
- Price: `0` (or inherited from master)

### 6. Schema/DTO Cleanup

#### Cart Models
**File**: `packages/schemas/src/models/cart.model.ts`
- Changed `cartItemModelSchema.courseId` → `courseRunId`

#### Coupon Model
**File**: `packages/schemas/src/models/coupon.model.ts`
- Added `applicableCourseMasterIds` array
- Added `excludedCourseMasterIds` array
- Added `applicableRunIds` array
- Added `excludedRunIds` array
- Preserved backward compatibility with `applicableCourseIds` and `excludedCourseIds` (now maps to courseMaster IDs)

#### Certificate Model & DTO
**File**: `packages/schemas/src/models/certificate.model.ts`
- Changed `courseId` → `courseMasterId` (certificate is for completing a course master syllabus)

**File**: `packages/schemas/src/dtos/certificate.dto.ts`
- Updated `CertificateQueryDTO.courseId` → `courseMasterId`
- Updated `CertificateIssueDTO.courseId` → `courseMasterId`

#### Course Instructor DTO
**File**: `packages/schemas/src/dtos/course-instructor.dto.ts`
- Changed `courseId` → `courseMasterId` (instructors are assigned to course masters)

## Database (Prisma Schema)

### Already Correct
✅ Cart, Wishlist, Review, Enrollment, Enrollment - all use `courseRunId` with foreign keys  
✅ Coupon - supports both `applicableCourseMasterIds` and `applicableRunIds`  
✅ Certificate - uses `course_id` (foreign key to CourseMaster)

### CourseRun Auto-Creation Logic
When a VOD course is published:
1. Create CourseVersion snapshot
2. Check if CourseRun exists for this master
3. If not, create default CourseRun with:
   - Title: `{course.title} (VOD)`
   - versionId: Latest version
   - price: 0 (default)
   - status: `enrolling`

## Business Logic Flow

### Purchase Flow (COURSE_PURCHASE Order)
1. User adds `courseRunId` to cart (WebLearner)
2. User creates order with `courseRunId`
3. OrderService fetches pricing from `CourseRun` (not CourseMaster)
4. Coupon validation checks `applicableRunIds` and `applicableCourseMasterIds`
5. Create Enrollment with `courseRunId` in PENDING_PAYMENT status
6. Activate Enrollment → IN_PROGRESS status

### Review Flow
1. User reviews course run by providing `courseRunId`
2. ReviewService validates enrollment for user + courseRunId
3. Store review with `courseRunId`
4. Update CourseMaster aggregate rating stats (across all runs)

### Wishlist Flow
1. User adds `courseRunId` to wishlist
2. Query wishlists by `courseRunId` (or userId)
3. Display course run details (run title, price, dates)

## Pending Tasks (Phase 2)

- [ ] Update Certificate.service to handle courseMasterId correctly
- [ ] Update Coupon.service to use applicableCourseMasterIds/RunIds naming
- [ ] Add migration scripts for existing data (courseId → courseRunId where applicable)
- [ ] Update web-admin UI to reflect courseRunId in forms
- [ ] Update web-learner cart/checkout UI for courseRunId
- [ ] Add integration tests for new courseRunId flows
- [ ] Document API changes in migration guide

## API Breaking Changes

### ✅ Safe (Backward Compatible)
- EnrollmentQueryDTO now accepts both `courseMasterId` and `courseRunId`
- ReviewQueryDTO now accepts both `courseMasterId` and `courseRunId`
- WishlistQueryDTO removed `courseMasterId` (wasn't used)

### ⚠️ Breaking Changes
- Cart model now uses `courseRunId` (was `courseId`)
- Certificate model/DTO now uses `courseMasterId` (was `courseId`)
- CourseInstructor DTO now uses `courseMasterId` (was `courseId`)
- Coupon coupon model now has explicit `applicableCourseMasterIds` and `applicableRunIds`

## Files Modified

### Service Layer
- `apps/server/modules/learning/src/modules/wishlist/wishlist.service.ts`
- `apps/server/modules/learning/src/modules/review/review.service.ts`
- `apps/server/modules/learning/src/modules/enrollment/enrollment.service.ts`

### Schema/DTOs
- `packages/schemas/src/dtos/wishlist.dto.ts`
- `packages/schemas/src/dtos/review.dto.ts`
- `packages/schemas/src/dtos/enrollment.dto.ts`
- `packages/schemas/src/models/cart.model.ts`
- `packages/schemas/src/models/coupon.model.ts`
- `packages/schemas/src/models/certificate.model.ts`
- `packages/schemas/src/dtos/certificate.dto.ts`
- `packages/schemas/src/dtos/course-instructor.dto.ts`

## Validation Checklist

- [x] Wishlist queries now filter by courseRunId
- [x] Review queries support both courseRunId and courseMasterId aggregation
- [x] Enrollment queries support both courseRunId and courseMasterId
- [x] Order service already uses courseRunId for pricing
- [x] CourseMaster auto-creates default CourseRun for VOD courses
- [x] Cart model schema updated to courseRunId
- [x] Coupon supports both CourseMaster and CourseRun targeting
- [x] Certificate uses courseMasterId
- [x] CourseInstructor uses courseMasterId
- [ ] Dependencies updated (need compilation test)
- [ ] Integration tests passing
- [ ] Database migrations ready

## Notes

All changes maintain the principle:
- **Query/Filter Level**: Supports filtering by courseRunId (specific) or courseMasterId (aggregate)
- **Data Storage**: Always stores courseRunId in transaction tables (cart, enrollment, reviews)
- **Pricing**: Always fetched from CourseRun, never from CourseMaster directly
- **Legacy Support**: CourseMaster-based queries aggregate results from all related courseRuns
