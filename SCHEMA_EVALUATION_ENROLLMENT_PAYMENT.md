# Đánh Giá Schema: Enrollment & Payment Flow

## ✅ Tổng Quan

Schema hiện tại **đã đủ hoàn chỉnh** cho luồng enrollment và payment cơ bản, và **đã sẵn sàng** để mở rộng cho coupon và gift course. Tuy nhiên, cần một số cải thiện nhỏ để tận dụng tối đa các tính năng này.

---

## 1. ✅ Đã Hoàn Chỉnh

### 1.1 Enrollment Flow
- ✅ Basic enrollment: `userId`, `courseId`, `enrollmentDate`
- ✅ Progress tracking: `completionStatus`, `completionPercentage`, `lastAccessedAt`, `completedAt`
- ✅ Payment linking: `paymentId` (one-to-one relation)
- ✅ Price tracking: `finalPrice`
- ✅ **Gift support**: `isGift`, `giftMessage`, `senderId` (relation to User)
- ✅ **Coupon support**: `couponAppliedId` (UUID field, sẵn sàng cho Coupon model)

### 1.2 Payment Flow
- ✅ Payment details: `amount`, `currency`, `paymentMethod`, `paymentGateway`
- ✅ Transaction tracking: `transactionId`, `gatewayTransactionId`, `status`
- ✅ Payment types: `paymentType` enum (course_purchase, subscription, top_up, gift)
- ✅ **Coupon support**: `couponId` (UUID field, sẵn sàng cho Coupon model)
- ✅ Flexible metadata: JSON field cho các dữ liệu bổ sung
- ✅ Enrollment linking: `enrollmentId` (field for reverse lookup)

### 1.3 Relations
- ✅ User ↔ Enrollment (one-to-many)
- ✅ Course ↔ Enrollment (one-to-many)
- ✅ Payment ↔ Enrollment (one-to-one via `paymentId`)
- ✅ User ↔ Payment (one-to-many)
- ✅ User ↔ GiftEnrollments (sender relation)

---

## 2. 🎁 Gift Course - Đã Sẵn Sàng

### 2.1 Schema Support
```prisma
// Enrollment model
isGift              Boolean   @default(false)
giftMessage         String?
senderId            String?   @map("sender_id") @db.Uuid
sender  User?    @relation("GiftEnrollments", fields: [senderId], references: [id])
```

### 2.2 Cần Bổ Sung (Minor)
- ⚠️ **EnrollmentCreateDTO**: Cần thêm optional fields cho gift
- ⚠️ **EnrollmentService.create()**: Cần xử lý gift fields khi tạo
- ⚠️ **PaymentService**: Cần hỗ trợ `paymentType: 'gift'`

**Đề xuất cải thiện:**
```typescript
// packages/schemas/src/dtos/enrollment.dto.ts
export const enrollmentCreateDTOSchema = z.object({
    courseId: z.string().uuid(),
    paymentId: z.string().uuid().optional(),
    couponAppliedId: z.string().uuid().optional(),
    finalPrice: z.number().min(0).optional(), // Auto-calculate if not provided
    isGift: z.boolean().default(false),
    giftMessage: z.string().optional(),
    senderId: z.string().uuid().optional(), // Required if isGift = true
});
```

---

## 3. 🎫 Coupon System - Sẵn Sàng Mở Rộng

### 3.1 Schema Support (Hiện Tại)
```prisma
// Payment model
couponId            String?   @map("coupon_id") @db.Uuid
// Note: Coupon relation will be added when Coupon model is created

// Enrollment model  
couponAppliedId     String?   @map("coupon_applied_id") @db.Uuid
```

### 3.2 Cần Tạo Coupon Model
```prisma
model Coupon {
  id                  String              @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  code                String              @unique @db.VarChar(50)
  name                String              @db.VarChar(100)
  description         String?             @db.Text
  discountType        CouponDiscountType  // percentage, fixed_amount
  discountValue       Decimal             @db.Decimal(10, 2)
  minOrderAmount      Decimal?            @db.Decimal(10, 2)
  maxDiscountAmount   Decimal?            @db.Decimal(10, 2)
  validFrom           DateTime
  validUntil          DateTime
  usageLimit          Int?                // NULL = unlimited
  usageCount          Int                 @default(0)
  userUsageLimit      Int                 @default(1) // Per user limit
  applicableCourseIds String[]            @default([]) @db.Uuid // Empty = all courses
  excludedCourseIds   String[]            @default([]) @db.Uuid
  status              CouponStatus        @default(active)
  createdBy           String?             @db.Uuid
  createdAt           DateTime            @default(now())
  updatedAt           DateTime            @default(now()) @updatedAt

  // Relations
  creator User?     @relation("CouponCreator", fields: [createdBy], references: [id])
  payments Payment[]
  
  @@index([code])
  @@index([status])
  @@index([validFrom, validUntil])
  @@map("coupons")
}

enum CouponDiscountType {
  percentage
  fixed_amount
}

enum CouponStatus {
  active
  inactive
  expired
}
```

### 3.3 Cần Bổ Sung Logic
- ⚠️ **PaymentService.create()**: Validate và apply coupon
- ⚠️ **CouponService**: Validate coupon code, check expiry, usage limits
- ⚠️ **Price calculation**: Apply discount trong PaymentService

**Flow đề xuất:**
```
1. User nhập coupon code khi checkout
2. PaymentService.validateCoupon() → Check code, expiry, usage, applicable courses
3. PaymentService.create() → Calculate discount:
   - originalAmount = course.price
   - discountAmount = calculateDiscount(coupon, originalAmount)
   - amount = originalAmount - discountAmount
   - Store couponId in payment
4. EnrollmentService.create() → Store couponAppliedId in enrollment
```

---

## 4. 📋 Checklist Hoàn Thiện

### 4.1 Gift Course (Dễ dàng thêm)
- [x] Schema đã có đủ fields
- [ ] Update EnrollmentCreateDTO để hỗ trợ gift fields
- [ ] Update EnrollmentService để xử lý gift khi tạo
- [ ] Update PaymentService để hỗ trợ paymentType: 'gift'
- [ ] UI: Form nhập gift message và recipient email
- [ ] API endpoint: POST /enrollments/gift

### 4.2 Coupon System (Cần Coupon Model)
- [x] Schema đã có couponId fields
- [ ] Tạo Coupon model và enums
- [ ] Tạo CouponService (validate, apply, track usage)
- [ ] Update PaymentService để validate và apply coupon
- [ ] Update EnrollmentService để lưu couponAppliedId
- [ ] API endpoints:
  - POST /coupons/validate
  - GET /coupons/:code
  - POST /coupons (admin)
- [ ] UI: Coupon code input trong checkout

### 4.3 Enhanced Features (Optional)
- [ ] Refund flow (thêm PaymentStatus.REFUNDED)
- [ ] Subscription management (recurring payments)
- [ ] Course bundles (multiple courses in one payment)
- [ ] Installment payments
- [ ] Loyalty points integration

---

## 5. 💡 Đề Xuất Cải Thiện Ngay

### 5.1 Update EnrollmentCreateDTO (Ưu tiên cao)
```typescript
// packages/schemas/src/dtos/enrollment.dto.ts
export const enrollmentCreateDTOSchema = z.object({
    courseId: z.string().uuid(),
    paymentId: z.string().uuid().optional(),
    couponAppliedId: z.string().uuid().optional(),
    finalPrice: z.number().min(0).optional(), // Auto-calculate if not provided
    isGift: z.boolean().default(false),
    giftMessage: z.string().optional(),
    senderId: z.string().uuid().optional(),
}).refine((data) => {
    // If isGift, senderId is required
    if (data.isGift && !data.senderId) return false;
    return true;
}, {
    message: "senderId is required when isGift is true",
    path: ["senderId"]
});
```

### 5.2 Update PaymentCreateDTO (Ưu tiên cao)
```typescript
// packages/schemas/src/dtos/payment.dto.ts
export const paymentCreateDTOSchema = z.object({
    courseId: z.string().uuid().optional(),
    couponCode: z.string().optional(), // Add coupon code input
    paymentMethod: z.nativeEnum(PaymentMethod).default(PaymentMethod.MOCK),
    paymentGateway: z.nativeEnum(PaymentGateway).optional(),
    paymentType: z.nativeEnum(PaymentType).default(PaymentType.COURSE_PURCHASE),
    description: z.string().optional(),
    metadata: z.record(z.any()).optional(),
    // Gift fields
    recipientEmail: z.string().email().optional(), // For gift purchases
    giftMessage: z.string().optional(),
});
```

---

## 6. ✅ Kết Luận

### Schema Hiện Tại: **8/10** ⭐

**Ưu điểm:**
- ✅ Đủ fields cho enrollment và payment flow cơ bản
- ✅ Đã có sẵn fields cho gift và coupon (chỉ cần thêm logic)
- ✅ Relations đúng và tối ưu
- ✅ Flexible với metadata field
- ✅ Dễ dàng mở rộng

**Cần cải thiện:**
- ⚠️ Cần update DTOs để hỗ trợ đầy đủ gift và coupon
- ⚠️ Cần tạo Coupon model và service
- ⚠️ Cần thêm validation logic cho coupon và gift

**Đánh giá mở rộng:**
- 🎁 **Gift Course**: Dễ dàng (1-2 giờ)
- 🎫 **Coupon System**: Trung bình (4-6 giờ, cần Coupon model)
- 💳 **Real Payment Gateway**: Phức tạp (tùy gateway)

**Khuyến nghị:**
1. ✅ Schema hiện tại **đủ tốt** để bắt đầu
2. ⚠️ Nên update DTOs ngay để hỗ trợ gift và coupon inputs
3. 📋 Tạo Coupon model khi cần implement coupon feature
4. 🚀 Có thể deploy và test với mock payment ngay bây giờ

---

## 7. 🎯 Next Steps

### Phase 1: Basic Flow (Đã hoàn thành ✅)
- [x] Enrollment và Payment models
- [x] Basic enrollment flow
- [x] Mock payment flow
- [x] Wishlist integration

### Phase 2: Gift Support (Dễ dàng thêm)
- [ ] Update DTOs
- [ ] Update services
- [ ] UI components
- [ ] Testing

### Phase 3: Coupon System (Cần Coupon Model)
- [ ] Create Coupon model
- [ ] Create CouponService
- [ ] Integrate vào PaymentService
- [ ] UI và validation
- [ ] Testing

### Phase 4: Production Ready
- [ ] Real payment gateway integration
- [ ] Email notifications
- [ ] Refund handling
- [ ] Analytics và reporting

