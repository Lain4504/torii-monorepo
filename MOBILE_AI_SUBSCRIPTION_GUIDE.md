# Hướng dẫn Tích hợp Subscription AI cho Mobile App

Tài liệu này hướng dẫn cách tích hợp tính năng đăng ký gói AI (AI Sensei) vào ứng dụng di động (Flutter/React Native/Native).

## 1. Authentication
Tất cả các API yêu cầu Header Authorization:
```http
Authorization: Bearer <JWT_TOKEN>
```

---

## 2. Các API quan trọng

### 2.1 Lấy danh sách gói cước
Dùng để hiển thị bảng giá cho người dùng.

*   **Endpoint:** `GET /api/agents/sensei/subscription-plans`
*   **Response:**
    ```json
    {
      "success": true,
      "data": [
        {
          "id": "uuid-gói-plus",
          "code": "plus",
          "name": "Plus",
          "price": 50000,
          "quotas": { "ai_turns": 100 },
          "features": ["100 lượt/ngày", "Roleplay & Voice"]
        },
        ...
      ]
    }
    ```

### 2.2 Kiểm tra trạng thái hiện tại (Quota)
Dùng để hiển thị gói đang dùng và số lượt còn lại.

*   **Endpoint:** `GET /api/agents/sensei/quota-status`
*   **Response:**
    ```json
    {
      "success": true,
      "data": {
        "tier": "plus",
        "limit": 100,
        "used": 45,
        "remaining": 55,
        "resetAt": "2024-03-26T00:00:00.000Z"
      }
    }
    ```

### 2.3 Tạo đơn hàng (Checkout)
Dùng khi người dùng bấm "Nâng cấp".

*   **Endpoint:** `POST /api/academy/orders/checkout`
*   **Request Body:**
    ```json
    {
      "subscriptionPlanIds": ["id-gói-muốn-mua"],
      "paymentMethod": "PAYOS", // Hoặc "COIN" nếu dùng ví nội bộ
      "description": "Đăng ký gói Plus - Mobile App"
    }
    ```
*   **Response (Đối với PAYOS):**
    ```json
    {
      "success": true,
      "data": {
        "id": "order-uuid",
        "code": "ORD-XXXX",
        "paymentUrl": "https://pay.payos.vn/web/..." // Link thanh toán
      }
    }
    ```
*   **Response (Đối với COIN):**
    ```json
    {
      "success": true,
      "data": {
        "id": "order-uuid",
        "status": "PAID" // Thanh toán xong luôn nếu đủ Xu
      }
    }
    ```

---

## 3. Luồng tích hợp (Workflow)

### Luồng Thanh toán PayOS:
1.  App gọi API **Checkout** với `paymentMethod: "PAYOS"`.
2.  App nhận `paymentUrl` từ Server.
3.  Mở `paymentUrl` bằng **WebView** hoặc **In-App Browser**.
4.  Lắng nghe sự kiện chuyển hướng về `returnUrl` (nếu có cấu hình) hoặc người dùng bấm "Đã thanh toán xong".
5.  Đóng WebView, gọi lại API **Quota Status** để cập nhật giao diện hiển thị gói mới.

### Luồng Thanh toán bằng Xu (Internal Coin):
1.  App kiểm tra số dư xu của người dùng (trong API User Profile).
2.  Nếu đủ xu, gọi API **Checkout** với `paymentMethod: "COIN"`.
3.  Server trừ xu và kích hoạt gói ngay lập tức.
4.  App thông báo thành công và cập nhật UI.

---

## 4. Lưu ý quan trọng
*   **Reset Time:** Hạn mức AI được reset vào 0h00 sáng mỗi ngày (giờ UTC).
*   **Error Handling:** Nếu API AI trả về lỗi "Bạn đã hết lượt sử dụng...", hãy điều hướng người dùng đến trang nâng cấp.
*   **Deep Link:** Cần cấu hình `returnUrl` để ứng dụng biết lúc nào thanh toán xong.
