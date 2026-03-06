# Academy Billing & Commerce Specification

Tài liệu này mô tả chi tiết thiết kế cho module **Commerce** (Billing mới), phục vụ việc bán các khóa học (`CourseOffering`) trong hệ thống Academy. Thiết kế này tuân thủ flow của [core-lms.md](./core-lms.md) và thay thế hoàn toàn logic của service `billing` cũ (không giữ backward compatibility).

## 1. Kiến trúc & Vị trí

Để đảm bảo tính nhất quán với `Academy` (Content & Delivery) và giảm thiểu độ phức tạp khi xử lý transaction phân tán, module này sẽ được implement như là **`CommerceModule`** nằm bên trong service `Academy` (Monolith modular).

> **Lý do merge vào Academy**:
> - `CourseOffering` có quan hệ chặt chẽ với `Class` (Delivery).
> - Việc tạo `Enrollment` sau khi thanh toán (`Order` -> `Enrollment`) cần transaction hoặc event consistency cao.
> - Dễ dàng query cross-domain (ví dụ: "User A đã mua Offering nào chứa Class B?").

## 2. Schema Design (Database)

Schema này sẽ thay thế các bảng `Order`, `Coupon`, `UserBalance` (nếu có) cũ.

### 2.1. Product & Pricing (`CourseOffering`)

Đây là entity đại diện cho "Gói sản phẩm" được bán.

- **`CourseOffering`**
  - `id`: UUID (PK)
  - `code`: String (Unique, e.g., `JP_N5_BUNDLE_2026`)
  - `title`: String
  - `description`: Text (HTML/Markdown)
  - `originalPrice`: Decimal (Giá gốc/niêm yết)
  - `currency`: String (Default `VND`)
  - `status`: Enum (`DRAFT`, `ACTIVE`, `HIDDEN`) — *Prisma hiện dùng `ARCHIVED` thay cho HIDDEN; có thể bổ sung enum HIDDEN nếu cần tách "ẩn" và "lưu trữ".*
  - `type`: Enum (`COURSE`, `BUNDLE`, `SUBSCRIPTION` - future)
  - `metadata`: JSONB (Images, SEO tags, etc.)
  - `validFrom`: DateTime (Nullable - ngày bắt đầu mở bán)
  - `validTo`: DateTime (Nullable - ngày đóng bán)
  - `createdAt`, `updatedAt`

- **`CourseOfferingClass`** (Bảng junction N–N giữa Offering và Class)
  - `offeringId`: UUID (FK -> `CourseOffering`)
  - `classId`: UUID (FK -> `Class`)
  - `isPrimary`: Boolean (Optional, đánh dấu class chính trong bundle)
  - *PK: (offeringId, classId)*
  - Một Offering có thể gắn nhiều Class (bundle); một Class có thể thuộc nhiều Offering.

### 2.2. Coupon & Promotion

Hệ thống Coupon mới linh hoạt hơn, hỗ trợ giảm giá theo % hoặc số tiền cố định.

- **`Coupon`**
  - `id`: UUID (PK)
  - `code`: String (Unique, Uppercase, e.g., `SUMMER2026`)
  - `description`: String
  - `discountType`: Enum (`PERCENTAGE`, `FIXED_AMOUNT`)
  - `discountValue`: Decimal (VD: `10` cho 10%, `50000` cho 50k)
  - `maxDiscountAmount`: Decimal (Nullable, dùng cho loại Percentage. VD: Giảm 10% tối đa 200k)
  - `minOrderValue`: Decimal (Nullable, giá trị đơn hàng tối thiểu để áp dụng)
  - `usageLimit`: Integer (Nullable, tổng số lần mã có thể dùng toàn hệ thống)
  - `usageCount`: Integer (Default 0, số lần đã dùng)
  - `perUserLimit`: Integer (Default 1, mỗi user được dùng mấy lần)
  - `startDate`: DateTime (Nullable)
  - `endDate`: DateTime (Nullable)
  - `status`: Enum (`ACTIVE`, `INACTIVE`)
  - `scope`: Enum (`GLOBAL`, `SPECIFIC_OFFERING`)
  - `metadata`: JSONB (Lưu target offerings nếu scope=SPECIFIC)

- **`CouponUsage`** (History)
  - `id`: UUID
  - `couponId`: UUID
  - `userId`: UUID
  - `orderId`: UUID
  - `usedAt`: DateTime

### 2.3. Order & Payment

Quản lý đơn hàng và trạng thái thanh toán.

- **`Order`**
  - `id`: UUID (PK)
  - `code`: String (Unique, Human readable, e.g., `ORD-20260306-XXXX`)
  - `userId`: UUID (FK -> `User`)
  - `status`: Enum (`PENDING`, `PROCESSING`, `PAID`, `CANCELLED`, `REFUNDED`, `FAILED`)
  - `subTotal`: Decimal (Tổng giá trị các items trước giảm giá)
  - `discountTotal`: Decimal (Tổng giảm giá từ coupon)
  - `grandTotal`: Decimal (Số tiền phải trả cuối cùng = subTotal - discountTotal)
  - `currency`: String
  - `couponCode`: String (Nullable, snapshot mã coupon đã dùng)
  - `couponId`: UUID (Nullable)
  - `note`: Text
  - `paymentMethod`: Enum (`PAYOS`, `BANK_TRANSFER`, `MANUAL`)
  - `metadata`: JSONB (Lưu IP, Device info, etc.)
  - `createdAt`, `updatedAt`, `paidAt`

- **`OrderItem`**
  - `id`: UUID
  - `orderId`: UUID
  - `offeringId`: UUID (FK -> `CourseOffering`)
  - `price`: Decimal (Snapshot giá tại thời điểm mua)
  - `offeringSnapshot`: JSONB (Lưu title, code của offering tại thời điểm mua để history không bị đổi)

- **`Transaction`** (Payment Logs)
  - `id`: UUID
  - `orderId`: UUID
  - `gateway`: String (`PAYOS`, `MOMO`, `STRIPE`)
  - `transactionCode`: String (Mã giao dịch từ Gateway)
  - `amount`: Decimal
  - `status`: Enum (`PENDING`, `SUCCESS`, `FAILED`)
  - `responsePayload`: JSONB (Full log từ gateway hook)
  - `createdAt`

---

## 3. Detailed Flows (Luồng nghiệp vụ)

### 3.1. Create Order (Checkout Flow)

**Actor**: Learner (User)

1.  **Request**: `POST /orders/checkout`
    - Body: `{ offeringIds: [uuid], couponCode?: string, paymentMethod: 'PAYOS' }`
2.  **Logic**:
    - Validate `offeringIds`:
        - Tồn tại, `status=ACTIVE`.
        - Còn trong thời gian `validFrom` - `validTo`.
        - (Optional) Check xem user đã mua/enroll chưa (tránh mua trùng nếu không cần thiết).
    - Calculate `SubTotal`: Tổng `originalPrice` của các offering.
    - Validate `Coupon` (nếu có):
        - Check `code`, `status`, date range.
        - Check `usageLimit` (tổng và per user).
        - Check `minOrderValue`.
        - Check `scope`: nếu `SPECIFIC_OFFERING` thì `metadata.offeringIds` (mảng UUID) phải chứa tất cả `offeringId` trong giỏ.
    - Calculate `Discount`: Áp dụng logic %, check `maxDiscountAmount`.
    - Calculate `GrandTotal` = `SubTotal` - `Discount`. (Không âm).
    - **Create Order** (Status: `PENDING`):
        - Lưu `OrderItem` với snapshot giá.
        - Nếu có coupon, chưa tăng `usageCount` ngay (hoặc tăng tạm thời và rollback nếu timeout - *Simple approach: tăng khi Order PAID*).
3.  **Payment Integration (PayOS)**:
    - Tạo Payment Link từ PayOS API với `amount = GrandTotal`, `description = Order Code`, `returnUrl`, `cancelUrl`.
    - Update Order metadata với `paymentLinkId`.
4.  **Response**: Trả về `orderCode` và `paymentUrl` để frontend redirect user.

### 3.2. Payment Webhook (Fulfillment Flow)

**Actor**: Payment Gateway (System)

1.  **Trigger**: Webhook từ PayOS báo `status = SUCCESS` cho `orderCode`.
2.  **Logic**:
    - Verify Webhook Signature (Security).
    - Tìm `Order` theo `orderCode`.
    - Check Order Status:
        - Nếu đã `PAID`: return OK (Idempotency).
        - Nếu `PENDING` / `PROCESSING`:
            - Update `Transaction` log.
            - Update `Order.status` = `PAID`, `paidAt` = now.
            - **Xử lý Coupon**: Nếu order có dùng coupon, tăng `Coupon.usageCount` và `CouponUsage` record.
            - **Trigger Fulfillment (Enrollment)**:
                - Query tất cả `OrderItem` -> `offeringId`.
                - Với mỗi `offeringId`, query **`CourseOfferingClass`** -> danh sách `classId`.
                - Với mỗi `classId`: chỉ tạo Enrollment nếu **chưa tồn tại** Enrollment với `(userId, classId, status = ACTIVE)` (idempotency + rule tối đa 1 ACTIVE per (userId, classId)); và nếu Class đang `ENROLLING`/`IN_PROGRESS`, chưa vượt `maxStudents` (nếu có).
                - Gọi `EnrollmentService.enroll(userId, classId, sourceOfferingId=offeringId, sourceOrderId?=orderId)` cho từng class.
                - (Lưu ý: Logic này nên chạy trong Transaction DB hoặc đảm bảo tính consistency).
    - Gửi Email xác nhận đơn hàng (via Notification Service).
    - Gửi thông báo nhập học (via Notification Service).

### 3.3. Coupon Management (Admin Flow)

**Actor**: Admin / Staff

- **Create Coupon**:
    - Input: Code, Type, Value, Limits, Dates.
    - Validate: Code unique, logic ngày tháng.
- **Stop Coupon**:
    - Update `status = INACTIVE`.

### 3.4. Update CourseOffering (Price Change)

**Actor**: Admin

- Admin đổi giá `CourseOffering`.
- Các `Order` cũ (`PAID`, `PENDING` cũ) **không bị ảnh hưởng** vì `OrderItem` đã lưu snapshot giá (`price`).
- `Order` mới sẽ dùng giá mới.

---

## 4. API Specification (Draft)

Module: `CommerceModule` (prefix `/api/v1/commerce`)

### 4.1. Offerings (Public)
- `GET /offerings`: List offerings (filter by type, status).
- `GET /offerings/:id`: Detail offering (kèm list classes info).

### 4.2. Cart/Checkout (Protected)
- `POST /orders/preview`: Tính toán giá (Subtotal, Discount, GrandTotal) để hiển thị trước khi tạo đơn. Input giống Checkout.
- `POST /orders/checkout`: Tạo Order và lấy Payment Link.

### 4.3. Orders (Protected - User)
- `GET /orders/me`: Lịch sử đơn hàng của tôi.
- `GET /orders/me/:code`: Chi tiết đơn hàng.

### 4.4. Webhook (Public)
- `POST /webhook/payos`: Nhận callback từ PayOS.

### 4.5. Management (Admin/Staff)
- `POST /admin/offerings`: Create offering.
- `PUT /admin/offerings/:id`: Update offering.
- `GET /admin/orders`: Quản lý toàn bộ đơn hàng.
- `POST /admin/coupons`: Tạo mã giảm giá.

---

## 5. Các thay đổi cần thiết trong Codebase

Do yêu cầu **không giữ backward compatibility**, chúng ta sẽ thực hiện:

1.  **Delete/Archive**:
    - Xóa (hoặc ignore) toàn bộ code trong `apps/server/services/billing/src/modules/payment`, `coupon`, `user-balance` cũ nếu chúng không còn phù hợp.
    - Có thể tái sử dụng file `payos.service.ts` (logic gọi API PayOS) nhưng move vào structure mới.

2.  **Implementation Steps**:
    - **Step 1**: Define Prisma Schema mới trong `apps/server/services/academy/prisma/schema.prisma` (hoặc file schema chung của Monorepo).
    - **Step 2**: Generate Migration.
    - **Step 3**: Implement `CommerceModule` trong `apps/server/services/academy/src/modules/commerce`.
        - `CourseOfferingService`
        - `OrderService`
        - `CouponService`
        - `PaymentService` (PayOS integration)
    - **Step 4**: Implement Listener/Hook:
        - Khi `OrderService` confirm paid -> gọi `EnrollmentService`.

## 6. Integration với Core LMS

- **Enrollment**:
  - Field `sourceOfferingId` (FK → CourseOffering) — bắt buộc để trace nguồn gốc từ gói nào. Đã có trong core-lms và Prisma.
  - (Khuyến nghị khi triển khai refund) Thêm `sourceOrderId` (FK → Order, nullable) để khi hoàn tiền biết đơn nào và enrollment nào cần xử lý.
  - **Ràng buộc**: Chỉ có tối đa một Enrollment **ACTIVE** cho mỗi cặp `(classId, userId)`; service phải kiểm tra trước khi tạo (từ Order hoặc từ staff).
- **Class**: `CourseOffering` chỉ giữ reference qua bảng `CourseOfferingClass` (offeringId, classId), không sở hữu Class.

---

## 7. Rà soát với schema & core-lms

- File **ACADEMY_BILLING_REVIEW.md** ghi lại kết quả review schema và flow so với core-lms.md và Prisma; sau khi chỉnh sửa theo review, spec này đã thống nhất với core-lms và Backend Plan.

---
*Tài liệu này dùng làm chuẩn để dev implement Billing flow mới.*
