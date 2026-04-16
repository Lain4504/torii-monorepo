# 📱 Tài liệu Tích hợp Mobile: Hỗ trợ & Hoàn tiền

Tài liệu này cung cấp các API và quy trình nghiệp vụ để tích hợp tính năng Hỗ trợ (Support), Báo lỗi (Error Report) và Hoàn tiền (Refund) trên ứng dụng Mobile.

---

## 🎟️ 1. Quản lý Ticket (Hỗ trợ & Báo lỗi)

### Gửi yêu cầu mới
- **Endpoint**: `POST /api/tickets`
- **Request Body**:
  ```json
  {
    "type": "SUPPORT" | "REFUND" | "ERROR_REPORT",
    "subject": "Tiêu đề yêu cầu",
    "description": "Mô tả chi tiết nội dung",
    "liveClassId": "UUID (Optional - dùng cho refund)",
    "vodPackageId": "UUID (Optional - dùng cho refund)",
    "metadata": {
      "any_additional_info": "..."
    }
  }
  ```
- **Lưu ý**: Đối với loại `REFUND`, bắt buộc phải gửi kèm một trong hai trường `liveClassId` (cho lớp LIVE) hoặc `vodPackageId` (cho gói VOD). Backend sẽ tự động tìm kiếm `enrollment` và `orderId` liên quan để xử lý.

### Lấy danh sách ticket của tôi
- **Endpoint**: `GET /api/tickets/me`
- **Query Params**: `page`, `limit`, `type`, `status`
- **Response**: Trả về danh sách ticket kèm trạng thái (`PENDING`, `PROCESSING`, `RESOLVED`, `CANCELLED`).

### Hủy yêu cầu
- **Endpoint**: `POST /api/tickets/{id}/cancel`
- **Lưu ý**: Chỉ có thể hủy các ticket đang ở trạng thái `PENDING`.

---

## 💰 2. Ví & Hoàn tiền (Refund to Coins)

Hệ thống sử dụng đơn vị **Xu (Coins)** để hoàn tiền. 1 Xu = 1 VNĐ.

### Kiểm tra số dư & Giao dịch
- **Lấy số dư ví**: `GET /api/academy/wallet/balance` -> Trả về số lượng Xu hiện có.
- **Lịch sử giao dịch**: `GET /api/academy/wallet/transactions`
  - `type`: `REFUND` (Hoàn tiền), `PURCHASE` (Thanh toán), `BONUS` (Thưởng).

### Quy tắc Hoàn tiền (Nghiệp vụ quan trọng cho Mobile)
Khi người dùng chọn loại ticket `REFUND`, Mobile cần lưu ý các quy tắc kiểm tra của Backend để hiển thị thông báo lỗi phù hợp:

| Trường hợp | Thông báo lỗi / Quy tắc |
| :--- | :--- |
| **Hết hạn** | Đã quá **14 ngày** kể từ ngày đăng ký khóa học. |
| **Tiến độ học** | Đã hoàn thành trên **20%** nội dung khóa học. |
| **Trạng thái lớp LIVE** | Lớp LIVE đã kết thúc giai đoạn tuyển sinh (vào giai đoạn học tập). |
| **Quyền sở hữu** | Người dùng chưa đăng ký hoặc đăng ký đã bị hủy trước đó. |

### Luồng xử lý kỹ thuật:
1. **Khóa enrollment**: Ngay khi ticket hoàn tiền được tạo thành công, trạng thái enrollment trên Backend sẽ chuyển sang `REFUND_PENDING`. Mobile nên hiển thị trạng thái này (ví dụ: "Đang chờ hoàn tiền - Khóa truy cập") trên màn hình chi tiết khóa học.
2. **Cộng tiền (Automatic Transaction)**: Sau khi Admin nhấn `RESOLVE`:
   - `User.walletBalance` tăng lên.
   - Một bản ghi `WalletTransaction` loại `REFUND` được tạo.
   - `Enrollment` chuyển sang `CANCELLED`.
   - `Order` chuyển sang `REFUNDED`.
3. **Xóa dữ liệu học tập**: Toàn bộ tiến độ bài học, kết quả thi và lộ trình liên quan của học viên cho khóa học đó sẽ bị xóa sạch sau khi hoàn tiền thành công.

---

## 💡 Lưu ý chung
1. **Authentication**: Luôn gửi kèm `Authorization: Bearer <JWT>`.
2. **Thông báo**: Khi ticket thay đổi trạng thái, Backend sẽ gửi Push Notification qua NATS. Team Mobile nên lắng nghe event hoặc polling trạng thái ticket để cập nhật ví cho người dùng.
3. **Metadata gợi ý**: Khi tạo ticket, team Mobile có thể gửi thêm thông tin vào `metadata` để hỗ trợ Admin:
   ```json
   {
     "device": "iPhone 15 Pro",
     "appVersion": "1.2.0",
     "courseTitle": "N3 Cấp tốc"
   }
   ```

---
**Torii Backend Team**
