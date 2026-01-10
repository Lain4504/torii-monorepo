# Tổng Hợp Các Thay Đổi: Course Purchase & Enrollment Flow

## Tổng Quan
Đã hoàn thiện luồng mua khóa học và enrollment với mock payment, bao gồm:
- Database Schema (Prisma)
- Backend Services & APIs
- Frontend Services & UI Components
- Payment Processing (Mock)

---

## 1. Database Schema Changes

### 1.1 Enrollment Model (`apps/server/prisma/schema.prisma`)
Thêm model `Enrollment` với các trường:
- `id`, `userId`, `courseId`
- `enrollmentDate`, `completionStatus`, `completionPercentage`
- `lastAccessedAt`, `completedAt`
- `paymentId`, `couponAppliedId`, `finalPrice`
- `isGift`, `giftMessage`, `senderId`
- Relations: `User`, `Course`, `Payment`

### 1.2 Payment Model (`apps/server/prisma/schema.prisma`)
Thêm model `Payment` với các trường:
- `id`, `userId`, `courseId` (optional)
- `amount`, `currency`, `paymentMethod`, `paymentGateway`
- `transactionId`, `gatewayTransactionId`
- `status` (PaymentStatus enum)
- `paymentType` (PaymentType enum)
- `enrollmentId`, `couponId`
- `description`, `metadata` (JSON)
- `completedAt`, `failedAt`
- Relations: `User`, `Enrollment`, `Coupon`

### 1.3 Enums
- `PaymentStatus`: pending, processing, completed, failed, cancelled
- `PaymentMethod`: credit_card, bank_transfer, momo, zalopay, vnpay, mock
- `PaymentGateway`: stripe, paypal, vnpay, momo, mock
- `PaymentType`: course_purchase, subscription, top_up, gift

### 1.4 Relations Updated
- `User`: thêm relations `enrollments`, `payments`, `giftEnrollments`
- `Course`: thêm relation `enrollments`

---

## 2. Schema Models (packages/schemas)

### 2.1 Enrollment Model (`packages/schemas/src/models/enrollment.model.ts`)
- Zod schema cho `Enrollment`
- `EnrollmentStatus` enum: IN_PROGRESS, COMPLETED, DROPPED, CANCELLED, EXPIRED

### 2.2 Payment Model (`packages/schemas/src/models/payment.model.ts`)
- Zod schema cho `Payment`
- Enums: `PaymentStatus`, `PaymentMethod`, `PaymentGateway`, `PaymentType`
- **Update**: Thêm `originalAmount` và `discountAmount` vào schema (optional)

### 2.3 Enrollment DTOs (`packages/schemas/src/dtos/enrollment.dto.ts`)
- `enrollmentResponseDTOSchema`: Response DTO (đã loại bỏ backward compatibility aliases)
- `enrollmentCreateDTOSchema`: Create DTO (chỉ `courseId`)
- `enrollmentQueryDTOSchema`: Query DTO với pagination và filters
- `enrollmentPaginatedResponseSchema`: Paginated response

### 2.4 Payment DTOs (`packages/schemas/src/dtos/payment.dto.ts`)
- `paymentResponseDTOSchema`: Response DTO
- `paymentCreateDTOSchema`: Create DTO
- `paymentQueryDTOSchema`: Query DTO với pagination và filters
- `paymentConfirmDTOSchema`: Confirm payment DTO
- `paymentPaginatedResponseSchema`: Paginated response

---

## 3. Backend Services

### 3.1 Enrollment Service (`apps/server/modules/learning/src/modules/enrollment/`)

#### Repository (`enrollment.repository.ts`)
- `findById(id)`
- `findByUserAndCourse(userId, courseId)`
- `findMany(options)` với pagination
- `count(where)`
- `create(data)`
- `update(id, data)`
- `delete(id)`
- **Update**: Sửa `orderBy` từ `enrolledAt` → `enrollmentDate`

#### Service (`enrollment.service.ts`)
- `findAll(query)`: Lấy danh sách enrollments với pagination
- `findOne(id)`: Lấy enrollment theo ID
- `findByUserAndCourse(userId, courseId)`: Kiểm tra enrollment
- `create(userId, input)`: Tạo enrollment mới
  - Kiểm tra duplicate enrollment
  - Xử lý free courses (tự động enroll)
  - Tính `finalPrice` từ course price/discount
- `isEnrolled(userId, courseId)`: Kiểm tra enrollment status
- `updateProgress(enrollmentId, completionPercentage)`: Cập nhật tiến độ
  - **Update**: Đổi tên parameter từ `progressPercentage` → `completionPercentage`
  - Tự động complete khi đạt 100%

### 3.2 Payment Service (`apps/server/modules/learning/src/modules/payment/`)

#### Repository (`payment.repository.ts`)
- `findById(id)`
- `findMany(options)` với pagination
- `count(where)`
- `create(data)`
- `update(id, data)`

#### Service (`payment.service.ts`)
- `findAll(query)`: Lấy danh sách payments với pagination
- `findOne(id)`: Lấy payment theo ID
- `create(userId, input)`: Tạo payment mới
  - Tính `amount` từ course price/discount
  - Xử lý free courses (throw error)
  - **Update**: Thêm tính toán `originalAmount` và `discountAmount` khi có discount
  - Lưu `courseId` vào metadata
- `confirm(paymentId, input)`: Xác nhận payment (MOCK)
  - Simulate payment confirmation
  - Tự động tạo enrollment sau khi payment thành công
  - Link payment với enrollment

### 3.3 Wishlist Service (Updated)
- Thêm method `toggleWishlist(userId, courseId)`: Toggle add/remove khỏi wishlist

---

## 4. Backend Controllers

### 4.1 Enrollment Controller (`apps/server/modules/learning/src/controllers/enrollment.controller.ts`)
- `GET /enrollments`: Lấy danh sách enrollments
- `GET /enrollments/:id`: Lấy enrollment theo ID
- `GET /enrollments/check/:courseId`: Kiểm tra enrollment status cho current user
- `POST /enrollments`: Tạo enrollment mới
- `PATCH /enrollments/:id/progress`: Cập nhật tiến độ
  - **Update**: Body parameter từ `progressPercentage` → `completionPercentage`

### 4.2 Payment Controller (`apps/server/modules/learning/src/controllers/payment.controller.ts`)
- `GET /payments`: Lấy danh sách payments
- `GET /payments/:id`: Lấy payment theo ID
- `POST /payments`: Tạo payment mới
- `POST /payments/:id/confirm`: Xác nhận payment (MOCK)

### 4.3 Wishlist Controller (Updated)
- `POST /wishlist/toggle/:courseId`: Toggle wishlist

---

## 5. Frontend API Services

### 5.1 Enrollment API (`apps/web-learner/api/services/enrollment-api.ts`)
- `getEnrollments(query)`: Lấy danh sách enrollments
- `getEnrollment(id)`: Lấy enrollment theo ID
- `checkEnrollment(courseId)`: Kiểm tra enrollment status
- `createEnrollment(courseId)`: Tạo enrollment mới
- `updateProgress(enrollmentId, completionPercentage)`: Cập nhật tiến độ
  - **Update**: Parameter từ `progressPercentage` → `completionPercentage`

### 5.2 Payment API (`apps/web-learner/api/services/payment-api.ts`)
- `getPayments(query)`: Lấy danh sách payments
- `getPayment(id)`: Lấy payment theo ID
- `createPayment(courseId, data)`: Tạo payment mới
- `confirmPayment(paymentId, data)`: Xác nhận payment

### 5.3 Wishlist API (Updated) (`apps/web-learner/api/services/wishlist-api.ts`)
- `toggleWishlist(courseId)`: Toggle wishlist
- `checkCourseInWishlist(courseId)`: Kiểm tra wishlist status

---

## 6. Frontend UI Components

### 6.1 Course Sidebar (`apps/web-learner/components/courses/course-sidebar.tsx`)
**Các tính năng đã thêm:**
- State management:
  - `isInWishlist`: Trạng thái wishlist
  - `wishlistId`: ID của wishlist item
  - `isEnrolled`: Trạng thái enrollment
  - `isLoadingEnrollment`, `isToggling`: Loading states

- Functions:
  - `checkWishlistStatus()`: Kiểm tra wishlist status khi mount
  - `checkEnrollmentStatus()`: Kiểm tra enrollment status khi mount
  - `handleToggleWishlist()`: Toggle wishlist với heart icon
  - Dynamic button rendering:
    - Free courses: "Enroll Now"
    - Already enrolled: "Continue Learning"
    - Paid courses: "Buy Now" → redirect to `/checkout/[courseId]`

### 6.2 Checkout Page (`apps/web-learner/app/checkout/[courseId]/page.tsx`)
**Tính năng:**
- Fetch course details và enrollment status
- Hiển thị course info, price, discount
- Mock payment flow:
  1. Tạo payment (`paymentApi.createPayment`)
  2. Confirm payment (`paymentApi.confirmPayment`)
  3. Tự động redirect đến course learning page sau khi thành công
- Error handling và loading states

---

## 7. Các Thay Đổi Quan Trọng (No Backward Compatibility)

### 7.1 Enrollment DTO
- **Removed**: Các backward compatibility aliases (`enrolledAt`, `status`, `progressPercentage`)
- **Direct mapping**: Sử dụng trực tiếp các field từ schema (`enrollmentDate`, `completionStatus`, `completionPercentage`)

### 7.2 API Parameters
- **Enrollment Progress Update**: `progressPercentage` → `completionPercentage`
- Tất cả các API endpoints đã được cập nhật để sử dụng tên mới

### 7.3 Repository Ordering
- **Enrollment Repository**: `enrolledAt` → `enrollmentDate` trong orderBy

### 7.4 Payment Schema
- **Added**: `originalAmount` và `discountAmount` (optional) vào payment model và schema
- Payment service tự động tính toán khi tạo payment cho course có discount

---

## 8. Module Registration

### 8.1 Learning Module (`apps/server/modules/learning/src/learning.module.ts`)
- Import và register `EnrollmentModule`
- Import và register `PaymentModule`
- Register controllers: `EnrollmentController`, `PaymentController`

### 8.2 Enrollment Module (`apps/server/modules/learning/src/modules/enrollment/enrollment.module.ts`)
- Provide `EnrollmentService` và `EnrollmentRepository`

### 8.3 Payment Module (`apps/server/modules/learning/src/modules/payment/payment.module.ts`)
- Provide `PaymentService` và `PaymentRepository`
- Import `EnrollmentModule` và `CourseModule` để có thể tự động tạo enrollment

---

## 9. Luồng Hoạt Động

### 9.1 Mua Khóa Học (Paid Course)
1. User xem course detail page
2. Click "Buy Now" → redirect to `/checkout/[courseId]`
3. Checkout page:
   - Fetch course details
   - Check enrollment status
   - Display price và discount
4. User click "Complete Payment" (Mock):
   - `POST /payments`: Tạo payment với status `pending`
   - `POST /payments/:id/confirm`: Confirm payment → status `completed`
   - Payment service tự động tạo enrollment
5. Redirect to course learning page

### 9.2 Enroll Free Course
1. User xem course detail page
2. Click "Enroll Now" (free course) hoặc "Buy Now" → tự động enroll
3. `POST /enrollments`: Tạo enrollment trực tiếp (không cần payment)

### 9.3 Wishlist
1. User click heart icon trên course sidebar
2. `POST /wishlist/toggle/:courseId`: Toggle add/remove
3. UI update ngay lập tức

---

## 10. Các Files Đã Tạo/Cập Nhật

### Database & Schema
- ✅ `apps/server/prisma/schema.prisma` (Enrollment, Payment models)
- ✅ `packages/schemas/src/models/enrollment.model.ts`
- ✅ `packages/schemas/src/models/payment.model.ts`
- ✅ `packages/schemas/src/dtos/enrollment.dto.ts`
- ✅ `packages/schemas/src/dtos/payment.dto.ts`

### Backend Services
- ✅ `apps/server/modules/learning/src/interfaces/repositories/i-enrollment.repository.ts`
- ✅ `apps/server/modules/learning/src/interfaces/repositories/i-payment.repository.ts`
- ✅ `apps/server/modules/learning/src/interfaces/services/i-enrollment.service.ts`
- ✅ `apps/server/modules/learning/src/interfaces/services/i-payment.service.ts`
- ✅ `apps/server/modules/learning/src/modules/enrollment/enrollment.repository.ts`
- ✅ `apps/server/modules/learning/src/modules/enrollment/enrollment.service.ts`
- ✅ `apps/server/modules/learning/src/modules/enrollment/enrollment.module.ts`
- ✅ `apps/server/modules/learning/src/modules/payment/payment.repository.ts`
- ✅ `apps/server/modules/learning/src/modules/payment/payment.service.ts`
- ✅ `apps/server/modules/learning/src/modules/payment/payment.module.ts`
- ✅ `apps/server/modules/learning/src/controllers/enrollment.controller.ts`
- ✅ `apps/server/modules/learning/src/controllers/payment.controller.ts`

### Frontend Services
- ✅ `apps/web-learner/api/services/enrollment-api.ts`
- ✅ `apps/web-learner/api/services/payment-api.ts`
- ✅ `apps/web-learner/api/services/wishlist-api.ts` (updated)

### Frontend UI
- ✅ `apps/web-learner/components/courses/course-sidebar.tsx` (updated)
- ✅ `apps/web-learner/app/checkout/[courseId]/page.tsx`

---

## 11. Next Steps (Cần Thực Hiện)

1. **Database Migration**:
   ```bash
   cd apps/server
   npx prisma migrate dev --name add_enrollment_payment
   npx prisma generate
   ```

2. **Testing**:
   - Test payment flow với paid courses
   - Test enrollment flow với free courses
   - Test wishlist toggle
   - Test enrollment status check

3. **Future Enhancements**:
   - Tích hợp real payment gateway (Stripe, VNPay, MoMo)
   - Coupon system integration
   - Gift enrollment feature
   - Enrollment analytics

---

## 12. Notes

- **Mock Payment**: Hiện tại sử dụng mock payment cho development. Cần tích hợp real payment gateway cho production.
- **Free Courses**: Tự động enroll, không cần payment.
- **Enrollment Auto-creation**: Khi payment được confirm, enrollment sẽ tự động được tạo.
- **No Backward Compatibility**: Đã loại bỏ tất cả các backward compatibility aliases, sử dụng trực tiếp field names từ schema.

