# Hướng dẫn Tích hợp Tính năng Mở rộng (Mobile)

Tài liệu này hướng dẫn Team Mobile tích hợp các tính năng bổ sung đã có trên Web Learner vào ứng dụng di động, bao gồm: Lịch sử thanh toán, Cửa hàng quà tặng, Mã giảm giá và Hệ thống hỗ trợ.

---

## 1. Lịch sử thanh toán

Người dùng có thể theo dõi danh sách các đơn hàng và sản phẩm đã thanh toán thành công hoặc đang chờ xử lý.

- **Endpoint**: `GET /api/academy/orders/my`
- **Params**: 
  - `status`: Lọc theo trạng thái (`PAID`, `PENDING`, `CANCELLED`, `FAILED`).
  - `page`, `limit`: Phân trang.
- **Model**: `LearnerOrder` (id, code, status, amount, description, createdAt).

---

## 2. Cửa hàng quà tặng (Rewards Shop)

Hệ thống Gamification cho phép người dùng dùng điểm XP tích lũy để đổi lấy các vật phẩm hoặc mã giảm giá.

### Lấy thông tin điểm XP và Level
- **Endpoint**: `GET /api/gamification/profile`
- **Dữ liệu**: `currentXp`, `level`, `currentStreak` (Chuỗi ngày học).

### Danh sách quà tặng có thể đổi
- **Endpoint**: `GET /api/gamification/rewards`
- **Dữ liệu**: Danh sách `Reward` gồm `id`, `name`, `description`, `requiredPoints`.

### Đổi quà
- **Endpoint**: `POST /api/gamification/redeem` (body: `{ "rewardId": "uuid" }`).
- **Kết quả**: Thường sẽ nhận được một mã giảm giá mới trong kho Coupon của người dùng.

---

## 3. Mã giảm giá (Coupons)

### Danh sách mã giảm giá của tôi
- **Endpoint**: `GET /api/academy/coupons/my-coupons`
- **Hiển thị**: Các mã người dùng đang sở hữu (từ đổi quà hoặc hệ thống tặng).

### Kiểm tra mã giảm giá (Validate)
- **Endpoint**: `POST /api/academy/coupons/validate`
- **Body**: 
  ```json
  {
    "code": "MA_GIAM_GIA",
    "productType": "COHORT" | "VOD",
    "productId": "uuid-cua-san-pham"
  }
  ```
- **Xử lý**: Dùng để hiển thị số tiền được giảm trong giao diện xem trước đơn hàng.

---

## 4. Hệ thống Hỗ trợ (Support & FAQ)

### Gửi yêu cầu hỗ trợ (Support Ticket)
- **Endpoint**: `POST /api/tickets`
- **Body**: `{ "title": "...", "content": "...", "priority": "NORMAL", "category": "TECHNICAL" }`

### Danh sách yêu cầu đã gửi
- **Endpoint**: `GET /api/tickets/me`
- **Theo dõi**: Hiển thị trạng thái ticket (OPEN, IN_PROGRESS, RESOLVED, CLOSED).

### Câu hỏi thường gặp (FAQ)
- **Hiện tại**: Dữ liệu FAQ đang được fix cứng (hardcoded) trên giao diện Web.
- **Khuyến nghị**: Có thể hardcode nội dung tương tự trên Mobile hoặc Backend sẽ bổ sung API trong tương lai.

---

## 5. Điều khoản & Chính sách (Legal)

- **Địa chỉ**: `https://torii-nihongo.vn/privacy-policy`
- **Mobile**: Nên sử dụng **WebView** để hiển thị trang này nhằm đảm bảo nội dung pháp lý luôn được cập nhật đồng bộ.

---
> [!IMPORTANT]
> Tất cả các API yêu cầu Header `Authorization: Bearer <Token>`. Dữ liệu trả về nằm trong trường `data` của Response.
