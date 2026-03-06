# Review: Schema & Flow nghiệp vụ Billing / Commerce

Tài liệu này tổng hợp kết quả rà soát giữa **core-lms.md**, **ACADEMY_BILLING_SPEC.md**, **ACADEMY_BACKEND_PLAN.md** và **Prisma schema** hiện tại để đảm bảo logic schema và flow nghiệp vụ chính xác, nhất quán.

---

## 1. Tổng quan so khớp

| Hạng mục | core-lms.md | ACADEMY_BILLING_SPEC | ACADEMY_BACKEND_PLAN | Prisma schema | Ghi chú |
|----------|-------------|----------------------|----------------------|---------------|--------|
| Bảng Offering ↔ Class | `CourseOfferingClass` | `CourseOfferingItem` | `CourseOfferingClass` | `CourseOfferingClass` | **Spec dùng sai tên** → sửa Spec dùng `CourseOfferingClass` |
| Enrollment nguồn gốc | `sourceOfferingId` (§7.2) | `sourceOfferingId` / sourceOrderCode | `sourceOfferingId` / orderItemId | `sourceOfferingId` (có) | Thêm `sourceOrderId` (nullable) vào Enrollment **khuyến nghị** cho refund traceability |
| CourseOffering status | draft / published / hidden | DRAFT, ACTIVE, ARCHIVED | DRAFT, ACTIVE, **HIDDEN** | DRAFT, ACTIVE, **ARCHIVED** | Plan dùng HIDDEN, Prisma dùng ARCHIVED → cần **thống nhất** (xem §2) |
| Order status | — | PENDING, PROCESSING, PAID, … | — | PENDING, PROCESSING, PAID, CANCELLED, REFUNDED, FAILED | Khớp Spec + Prisma |
| OrderItem snapshot | — | price + offeringSnapshot | — | price + offeringSnapshot | Khớp |
| Fulfillment sau PAID | Query CourseOfferingClass → tạo Enrollment | Query CourseOffering**Item** → enroll | Query CourseOfferingClass → enroll | — | Chỉ cần sửa tên bảng trong Spec |

---

## 2. Điểm cần sửa / thống nhất

### 2.1. Tên bảng: CourseOfferingItem vs CourseOfferingClass

- **core-lms.md** và **Prisma** dùng **`CourseOfferingClass`** (nhiều–nhiều giữa Offering và Class).
- **ACADEMY_BILLING_SPEC.md** đang ghi **`CourseOfferingItem`** (và "Mapping 1-N").

**Kết luận**:  
- Sửa toàn bộ Spec: dùng **`CourseOfferingClass`** thay cho `CourseOfferingItem`.  
- Quan hệ đúng là **N–N** (một Offering nhiều Class, một Class có thể thuộc nhiều Offering): dùng bảng junction `CourseOfferingClass` là đúng.

**Đã cập nhật**: ACADEMY_BILLING_SPEC.md dùng `CourseOfferingClass` và mô tả đúng quan hệ N–N.

---

### 2.2. CourseOffering.status: ACTIVE vs PUBLISHED, HIDDEN vs ARCHIVED

- **core-lms.md** (§3, §7.3): `status` (draft / published / hidden).
- **ACADEMY_BACKEND_PLAN.md** (§5.1): `DRAFT`, `ACTIVE`, `HIDDEN`.
- **Prisma**: `OfferingStatus` = `DRAFT` | `ACTIVE` | `ARCHIVED`.
- **Billing Spec** (§2.1): `DRAFT`, `ACTIVE`, `ARCHIVED`.

**Ý nghĩa đề xuất thống nhất**:

- **DRAFT**: Chưa mở bán.
- **ACTIVE**: Đang mở bán (tương đương "published" trong core-lms).
- **HIDDEN**: Tạm ẩn, không hiển thị, không cho tạo đơn mới (core-lms "hidden").
- **ARCHIVED**: Ngừng bán, lưu trữ (có thể gộp với HIDDEN nếu không cần tách).

**Đề xuất** (để khớp core-lms + Backend Plan + code):

- Trong **spec & plan**: dùng 3 trạng thái **DRAFT**, **ACTIVE**, **HIDDEN**.
- Trong **Prisma**:  
  - Hoặc thêm enum **HIDDEN** và giữ ARCHIVED (4 giá trị),  
  - Hoặc dùng **ARCHIVED** thay cho HIDDEN (coi "hidden" = "archived" cho đến khi có nhu cầu tách).

**Quy tắc nghiệp vụ** (giữ nguyên trong spec/plan):

- Chỉ cho tạo Order khi `CourseOffering.status = ACTIVE`.
- `HIDDEN` / `ARCHIVED`: không cho tạo Order mới; đơn cũ và Enrollment vẫn tồn tại.

---

### 2.3. Enrollment: sourceOfferingId và sourceOrderId

- **core-lms.md** (§7.2): `Enrollment.sourceOfferingId` (FK → CourseOffering) — đủ để biết “mua từ gói nào”.
- **Prisma**: chỉ có `sourceOfferingId`; chưa có `sourceOrderId`.

**Kết luận**:

- **Hiện tại**: Chỉ dùng `sourceOfferingId` là đủ cho flow “Order PAID → tạo Enrollment” và đúng với core-lms.
- **Khuyến nghị (refund sau này)**: Thêm `sourceOrderId` (nullable, FK → Order) trên Enrollment để:
  - Khi refund, biết chính xác đơn nào cần hoàn tiền và enrollment nào cần hủy.
  - Không bắt buộc cho phase 1; có thể bổ sung khi implement refund.

Spec/plan nên ghi rõ: "Có thể bổ sung `sourceOrderId` khi triển khai refund."

---

### 2.4. Luồng Checkout & Coupon

**Spec đã đúng hướng**, cần làm rõ thêm:

1. **SubTotal**: Tổng `originalPrice` của từng offering trong giỏ — khớp với `OrderItem.price` snapshot và `CourseOffering.originalPrice`.
2. **Coupon scope = SPECIFIC_OFFERING**:  
   - Trong Spec cần ghi rõ: khi `scope = SPECIFIC_OFFERING`, `metadata` (ví dụ `metadata.offeringIds: string[]`) chứa danh sách `offeringId` được áp dụng.  
   - Ở bước validate coupon: mọi `offeringId` trong đơn phải nằm trong `metadata.offeringIds` (hoặc toàn bộ đơn nếu GLOBAL).
3. **Tăng usageCount coupon**: Chỉ khi Order chuyển **PAID** (như Spec), tránh tăng khi PENDING/PROCESSING — đúng với logic hiện tại.

---

### 2.5. Fulfillment (Order PAID → Enrollment)

**Luồng chuẩn** (đã khớp giữa core-lms, Plan và Prisma):

1. Webhook PayOS báo thanh toán thành công → tìm `Order` theo `orderCode`.
2. Idempotency: nếu `Order.status === PAID` → return OK, không tạo Enrollment lại.
3. Cập nhật Order: `status = PAID`, `paidAt = now()`; ghi `Transaction`; cập nhật Coupon (usageCount, CouponUsage).
4. Fulfillment:
   - Với mỗi `OrderItem` (→ `offeringId`):
     - Lấy danh sách class: query **`CourseOfferingClass`** theo `offeringId` → danh sách `classId`.
     - Với mỗi `classId`: nếu chưa tồn tại `Enrollment` với `(userId, classId, status = ACTIVE)` thì tạo mới, set `sourceOfferingId = offeringId` (và sau này có thể set `sourceOrderId = orderId`).

**Ràng buộc nghiệp vụ** (cần giữ trong spec/plan):

- Không tạo Enrollment nếu `Class.status = CANCELLED`.
- Có thể (tùy policy) không enroll nếu class đã hết hạn đăng ký (`enrollmentCloseAt < now`) hoặc đã đủ `maxStudents`; nếu từ chối thì ghi log / thông báo và xử lý bồi hoàn/đổi lớp theo quy định.

---

### 2.6. Uniqueness Enrollment (userId, classId)

- **core-lms & Backend Plan**: "Không duplicate ACTIVE enrollment cho cùng userId + classId".
- **Prisma**: Không có unique constraint trên `(classId, userId)` (cho phép nhiều bản ghi khác trạng thái, ví dụ ACTIVE và EXPIRED).

**Kết luận**:

- Ràng buộc nghiệp vụ: **tối đa một Enrollment ACTIVE cho mỗi (classId, userId)**.
- Nên đảm bảo ở **service**: trước khi tạo Enrollment (từ Order hoặc từ staff), kiểm tra không tồn tại bản ghi ACTIVE với (classId, userId); nếu đã có thì skip (fulfillment) hoặc báo lỗi (staff add).
- (Tùy chọn) Có thể thêm unique partial index DB: `UNIQUE (class_id, user_id) WHERE status = 'ACTIVE'` để enforce tại DB; nếu chưa có thì ít nhất enforce trong code.

Spec/plan nên ghi rõ: "Chỉ có tối đa một Enrollment ACTIVE cho mỗi (classId, userId); service phải kiểm tra trước khi tạo."

---

### 2.7. Order.status PROCESSING

- **Prisma** có `PROCESSING` trong `OrderStatus`.
- **Spec** nói "PENDING / PROCESSING" khi xử lý webhook.

**Gợi ý**:

- **PENDING**: Order vừa tạo, chưa (hoặc đã) redirect sang PayOS.
- **PROCESSING**: Đã tạo payment link / user đang ở trang thanh toán — tùy chọn, có thể set khi tạo link PayOS.
- **PAID**: Webhook xác nhận thanh toán thành công.

Nếu không cần phân biệt "đang chờ thanh toán" vs "đã redirect", có thể chỉ dùng PENDING cho đến khi PAID. Spec hiện tại đã chấp nhận cả PENDING và PROCESSING khi nhận webhook — ổn.

---

### 2.8. CourseOffering: price vs originalPrice

- **core-lms** (§3): `CourseOffering.price`.
- **Prisma**: `CourseOffering.originalPrice`.
- **Billing Spec**: `originalPrice` (giá gốc/niêm yết).

**Kết luận**: Dùng **originalPrice** là hợp lý (giá gốc; giá sau coupon nằm ở Order). Spec và Prisma nhất quán; core-lms dùng "price" với nghĩa tương đương "giá bán/niêm yết". Không cần đổi tên trong Prisma.

---

## 3. Checklist áp dụng

Sau khi chỉnh sửa:

- [x] Spec dùng **CourseOfferingClass** (không dùng CourseOfferingItem).
- [x] Spec ghi rõ validate Coupon **SPECIFIC_OFFERING** với `metadata.offeringIds`.
- [x] Spec/plan ghi rõ: **chỉ một Enrollment ACTIVE** cho (classId, userId); service phải check trước khi tạo.
- [x] Spec/plan thống nhất **CourseOffering.status**: DRAFT | ACTIVE | HIDDEN (và/hoặc ARCHIVED tùy Prisma).
- [ ] (Tùy chọn) Prisma: thêm **Enrollment.sourceOrderId** khi triển khai refund.
- [ ] (Tùy chọn) Prisma: thêm **HIDDEN** vào `OfferingStatus` nếu muốn tách ẩn vs lưu trữ.

---

## 4. Kết luận

- **Schema**: Prisma đã khớp với core-lms (CourseOffering, CourseOfferingClass, Order, OrderItem, Enrollment.sourceOfferingId). Chỉ cần thống nhất tên bảng trong Spec (CourseOfferingClass) và thống nhất trạng thái Offering (ACTIVE / HIDDEN / ARCHIVED).
- **Flow**: Checkout → Coupon → PayOS → Webhook → Fulfillment qua CourseOfferingClass → tạo Enrollment với sourceOfferingId là đúng và nhất quán với core-lms.
- **Sửa Spec**: Đổi CourseOfferingItem → CourseOfferingClass; bổ sung mô tả Coupon SPECIFIC_OFFERING; bổ sung rule uniqueness Enrollment và (nếu dùng) sourceOrderId.

Sau các chỉnh sửa này, logic schema và flow nghiệp vụ Billing/Commerce có thể coi là đã chính xác và thống nhất với spec và schema hiện tại.
