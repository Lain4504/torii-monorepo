# Commerce LIVE/VOD & Enrollment (trạng thái hiện tại)

Tài liệu này **thay thế** các bản spec cũ về entity **`CourseOffering`** — model đó **không còn** trong `schema.prisma` và không dùng trong luồng runtime hiện tại.

## Thực thể chính (Prisma)

| Khái niệm | Ghi chú |
|-----------|---------|
| **Cohort** | Đợt / gói bán LIVE (catalog). |
| **LiveClass** | Một lớp LIVE cụ thể (thuộc cohort). |
| **VodPackage** | Gói VOD (catalog). |
| **Enrollment** | `userId` + **một trong hai**: `liveClassId` **hoặc** `vodPackageId`. Không có cột `offering_id`. |
| **Order** / **OrderItem** | Giỏ: `cohortId`, `liveClassId`, `vodPackageId`, … và **`offeringSnapshot`** (JSON) — **ảnh chụp** giá/tên/mô tả lúc mua, **không** là FK tới bảng CourseOffering. |

## Luồng nghiệp vụ

1. Learner chọn sản phẩm catalog (cohort / gói VOD / lớp LIVE) → **checkout** → tạo **Order** + **OrderItem**.
2. Sau thanh toán → tạo **Enrollment** trỏ tới đúng **LiveClass** hoặc **VodPackage** đã chốt.
3. Học, tiến độ, **quiz / attempt** dùng **`enrollmentId`** (phạm vi theo ghi danh).

## API & code

- Commerce: `apps/server/services/academy/src/modules/commerce/`.
- Enrollment: `apps/server/services/academy/src/modules/classroom/enrollment/`.
- Gateway: `apps/server/services/gateway/src/modules/academy/`.

## Migration lịch sử

Các file trong `prisma/migrations/**` giữ nguyên (audit DB). **Không** sửa migration đã chạy.

## Coupon & metadata

Coupon scope `SPECIFIC_OFFERING` (enum Prisma) là **tên lịch sử**. Giá trị áp dụng trong `metadata` có thể dùng key cũ `offeringIds` hoặc key mới `applicableTargetIds` — UUID **cohort / vodPackage / liveClass** trong giỏ, không phải bảng `academy_course_offerings`.
