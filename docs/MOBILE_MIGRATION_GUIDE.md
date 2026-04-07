# Hướng dẫn Chuyển đổi Model Giá sang Class-Only (Mobile)

Để đảm bảo hệ sinh thái học tập nhất quán giữa Web, Backend và Mobile, chúng tôi đã triển khai mô hình **"Class-Only Pricing"** (Giá theo từng lớp cụ thể). Từ thời điểm này, giá tiền sẽ không còn nằm ở cấp độ **Đợt khai giảng (Cohort)** mà sẽ nằm ở cấp độ **Lớp học (LiveClass)**.

## 1. Thay đổi về Model (Data Transfer Objects)

Team Mobile cần cập nhật các Model dữ liệu (Dart/Kotlin/Swift) tương ứng:

### Đối với `AcademyCohort` (Đợt khai giảng)
- **XÓA BỎ**: Hai trường `price` và `discountPrice` (số thực/Decimal). 
- **LƯU Ý**: Nếu mobile tiếp tục truy xuất vào hai trường này, giá trị trả về sẽ là `null` hoặc không xác định.

### Đối với `AcademyLiveClass` (Lớp học LIVE)
- **BỔ SUNG**: Hai trường mới là `price` (giá gốc) và `discountPrice` (giá khuyến mãi - optional).
- Đây chính là nguồn dữ liệu chính để hiển thị giá trên mobile.

## 2. Thay đổi Luồng Hiển thị (UI/UX)

Trước đây, giá được hiển thị chung cho toàn bộ đợt học. Giờ đây, khi người dùng xem thông tin một đợt học (Cohort), ứng dụng cần:
1. Duyệt qua danh sách `liveClasses` của đợt đó.
2. Hiển thị mức giá của lớp học cụ thể (thường thì các lớp trong cùng đợt có giá bằng nhau, nhưng hệ thống mới cho phép set giá khác nhau cho từng lớp).

## 3. Cập nhật API Checkout & Preview

Khi thực hiện thanh toán khóa học qua API `api/academy/orders/preview` hoặc `api/academy/orders/checkout`, team Mobile cần cập nhật payload:

### Payload cũ (Chỉ gửi danh sách đợt):
```json
{
  "cohortIds": ["uuid-cohort-123"],
  "paymentMethod": "PAYOS"
}
```

### Payload mới (Cần chỉ định rõ lớp học được chọn):
Trường `liveClassIdByCohort` là một bản đồ (Map/Dictionary) dùng để ánh xạ ID của đợt học sang ID của lớp cụ thể mà người dùng chọn.

```json
{
  "cohortIds": ["uuid-cohort-123"],
  "liveClassIdByCohort": {
    "uuid-cohort-123": "uuid-specific-live-class-456"
  },
  "paymentMethod": "PAYOS"
}
```

### Phương thức mua hàng trực tiếp qua Lớp học (`liveClassIds`):
Ngoài việc gửi `cohortIds`, mobile team có thể gửi trực tiếp danh sách ID lớp học vào mảng `liveClassIds`. Cách này giúp backend xử lý nhanh hơn nếu bạn đã biết chính xác lớp muốn mua.

```json
{
  "liveClassIds": ["uuid-specific-live-class-456"],
  "paymentMethod": "PAYOS"
}
```

*Lưu ý quan trọng về trạng thái Đợt học (Cohort Status):*
Backend chỉ cho phép thanh toán các Đợt học (Cohort) đang ở trạng thái **`OPENING`** (Đang tuyển sinh). Nếu gửi ID của một đợt ở trạng thái khác (như `APPROVED`, `IN_PROGRESS`), API sẽ trả về lỗi **400 Bad Request**.

*Lưu ý: Backend hiện có cơ chế fallback sẽ tự chọn lớp đầu tiên nếu không gửi `liveClassIdByCohort`, tuy nhiên để tránh sai sót về giá hiển thị và trải nghiệm người dùng, mobile NÊN gửi ID lớp học cụ thể.*

## 4. Bổ sung API Danh mục tất cả khóa học (Course Catalog)

Để hiển thị trang "Tất cả khóa học" (giống trên web learner), team Mobile có thể sử dụng các endpoint public sau:

### Lấy danh sách sản phẩm (LIVE & VOD)
- **Endpoint**: `GET /api/academy/live-classes/public`
- **Các tham số lọc (Query Params)**:
  - `mode`: `LIVE` hoặc `VOD` (mặc định là LIVE nếu bỏ trống).
  - `level`: Lọc theo trình độ (N5, N4, N3, N2, N1).
  - `q`: Tìm kiếm theo tên khóa học.
  - `limit` / `page`: Phân trang.
- **Dữ liệu trả về**: Danh sách các sản phẩm kèm theo thông tin `price`, `discountPrice`, `thumbnailUrl` và ID (`id`). Chú ý ID trả về là `liveClassId` (nếu là LIVE) hoặc `vodPackageId` (nếu là VOD).

### Xem trước đơn hàng (Preview)
- **Endpoint**: `POST /api/academy/orders/preview`
- **Dữ liệu trả về**: Một object chuẩn bao gồm:
  - `subTotal`: Tổng tiền trước giảm giá.
  - `discountTotal`: Tổng số tiền được giảm.
  - `grandTotal`: Số tiền cuối cùng cần thanh toán.
  - `products`: Danh sách chi tiết các sản phẩm trong giỏ.

**Lưu ý về cấu trúc Response chung:**
Tất cả các API của Torii Backend đều trả về dưới dạng bọc (wrapper):
```json
{
  "success": true,
  "data": {
     "subTotal": 500000,
     "discountTotal": 50000,
     "grandTotal": 450000,
     "products": [...]
  }
}
```
Mobile team cần truy cập vào trường `data` để lấy các giá trị thực tế.

## 5. Tính năng Tặng khóa học (Gift Course)

Luồng tặng khóa học giúp người dùng mua nội dung cho một tài khoản khác thông qua email. Dưới đây là hướng dẫn tích hợp chi tiết:

### Bước 1: UI Giao diện Chọn
- Thêm một Switch/Checkbox: **"Mua làm quà tặng"**.
- Khi bật Switch này, hiển thị 2 trường input:
    - `recipientEmail` (Bắt buộc): Email của người nhận.
    - `giftMessage` (Tùy chọn): Lời nhắn gửi kèm.

### Bước 2: Kiểm tra người nhận (Real-time Validation)
Ngay khi người dùng nhập đủ email, ứng dụng nên gọi API kiểm tra để tránh trường hợp mua tặng cho người đã có khóa học.
- **Endpoint**: `GET /api/academy/enrollments/check-gift-recipient`
- **Query Params**:
  - `recipientEmail`: Email người nhận.
  - `courseId`: ID của Đợt khai giảng hoặc Gói VOD.
- **Xử lý logic trên Mobile dựa vào kết quả trả về (`result`)**:
    - `isEnrolled == true`: **CẢNH BÁO**. Hiển thị lỗi "Người nhận đã sở hữu khóa học này" và **Vô hiệu hóa** nút thanh toán.
    - `isRegistered == false`: **THÔNG BÁO**. "Email chưa có tài khoản Torii, hệ thống sẽ tự động tạo tài khoản mới cho người nhận sau khi thanh toán".
    - `recipientEmail == user.email`: **CẢNH BÁO**. Không cho phép người dùng tự tặng cho chính mình.

### Bước 3: Xem trước đơn hàng (Preview)
Khi gọi `POST /api/academy/orders/preview`, gửi thông tin quà tặng trong `metadata`. Điều này giúp Backend áp dụng đúng các khuyến mãi (nếu có) dành cho người nhận.

### Bước 4: Tạo đơn hàng và Thanh toán (Checkout)
Gửi payload đầy đủ thông tin vào object `metadata`. Đây là trường bắt buộc để Backend biết đây là một đơn hàng tặng phẩm.

**Mẫu Payload chuẩn:**
```json
{
  "cohortIds": ["uuid-cua-dot-hoc"],
  "liveClassIdByCohort": {
    "uuid-cua-dot-hoc": "uuid-cua-lop-hoc-cu-the"
  },
  "paymentMethod": "PAYOS",
  "couponCode": "GIAM_GIA_2024",
  "metadata": {
    "isGift": true,
    "recipientEmail": "nguoinhan@gmail.com",
    "giftMessage": "Chúc bạn học tập tốt nhé!"
  }
}
```

### Bước 5: Sau khi thanh toán thành công
Hệ thống Backend sẽ tự động xử lý các việc sau:
1. Xác định `userId` của người nhận quà (tạo mới nếu email chưa có tài khoản).
2. Ghi danh (Enrollment) cho người nhận vào lớp học đã chọn.
3. Gửi email thông báo kích hoạt khóa học kèm theo lời nhắn (`giftMessage`) tới người nhận.

## 6. Luồng Kiểm tra Dữ liệu (Mobile App Checklist)
Để đảm bảo trải nghiệm tốt nhất, team Mobile cần đảm bảo:
- [ ] Luôn kiểm tra `isEnrolled` của người nhận trước khi cho phép bấm thanh toán.
- [ ] Không cho phép email người nhận trùng với email người mua.
- [ ] Đảm bảo mã lớp (`liveClassId`) được gửi đi chính xác theo lựa chọn của người dùng.

## 6. Lý do của sự thay đổi
Việc đẩy giá xuống cấp độ lớp học giúp hệ thống linh hoạt hơn trong quản lý kinh doanh, ví dụ: các lớp học vào giờ cao điểm hoặc lớp có giảng viên cao cấp có thể có giá cao hơn các lớp khác trong cùng một đợt khai giảng.

---
Mọi thắc mắc về tích hợp API, xin liên hệ team Backend.
