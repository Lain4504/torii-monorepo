# Hướng dẫn triển khai LiveKit (Fix 4G/VPN)

Tài liệu này hướng dẫn cách triển khai LiveKit Server tích hợp với Nginx hiện có, hỗ trợ đầy đủ TURN Server để người dùng 4G và VPN kết nối ổn định.

## 1. Cơ chế hoạt động
- **Nginx**: Phụ trách HTTPS (TCP 443) cho API và Client.
- **LiveKit TURN/UDP**: Chạy trên cổng **443 UDP** (không xung đột với Nginx) để vượt tường lửa 4G.
- **LiveKit TURN/TLS**: Chạy trên cổng **5349 TCP** làm phương án dự phòng cuối cùng.

## 2. Các cổng cần mở (Firewall GCP/VPS)
Bạn phải đảm bảo các cổng sau đã được ALLOW:
- **TCP**: `80`, `443`, `7881`, `5349`
- **UDP**: `443`, `7882`, `50000-50100`

## 3. Quy trình triển khai lần đầu
1. **Chuẩn bị cấu hình**:
   - Sửa file `livekit.yaml`: Thay `YOUR_VPS_IP` bằng IP thật của VPS.
2. **Đồng bộ Chứng chỉ SSL**:
   Chạy script để copy cert từ Let's Encrypt vào dự án:
   ```bash
   chmod +x scripts/update-livekit-certs.sh
   ./scripts/update-livekit-certs.sh
   ```
3. **Khởi động hệ thống**:
   ```bash
   sudo docker compose up -d
   ```

## 4. Xử lý khi gia hạn SSL (Certbot Renew)
Khi bạn chạy `certbot renew` thành công, LiveKit sẽ chưa nhận ngay được cert mới vì file đã được copy ra thư mục riêng. Bạn chỉ cần chạy lại script đồng bộ:
```bash
./scripts/update-livekit-certs.sh
```

## 5. Kiểm tra trạng thái
- Kiểm tra log: `sudo docker logs -f torii-livekit`
- Kiểm tra kết nối: Truy cập [LiveKit Connection Tester](https://livekit.io/connection-test) và nhập `wss://api.torii.sbs/socket-b`.
