# Hướng dẫn triển khai LiveKit (Fix 4G/VPN)

Tài liệu này hướng dẫn cách triển khai LiveKit Server tích hợp với Nginx hiện có, hỗ trợ đầy đủ TURN Server để người dùng 4G và VPN kết nối ổn định.

## 1. Cơ chế hoạt động
- **Nginx**: Phụ trách HTTPS (TCP 443) cho API và Client.
- **LiveKit TURN/UDP**: Chạy trên cổng **443 UDP** (không xung đột với Nginx) để vượt tường lửa 4G.
- **LiveKit TURN/TLS**: Chạy trên cổng **5349 TCP** làm phương án dự phòng cuối cùng.

## 2. Các cổng cần mở (Firewall GCP/VPS)
Bạn phải đảm bảo các cổng sau đã được ALLOW:
- **TCP**: `80`, `443`, `7881`, `5349`
- **UDP**: `443`, `7882`, `50000-60000`
- **UDP**: `443`, `7882`, `50000-60000`

## 3. Cấu hình DNS
Bạn cần trỏ 2 subdomain sau về IP của VPS (Tắt Proxy Cloudflare):
1. **api.torii.sbs** -> IP VPS
2. **turn.torii.sbs** -> IP VPS
1. **Cấp chứng chỉ SSL (Certbot)**:
   Nên tạo chứng chỉ gộp cho cả 2 domain để tối ưu:
   ```bash
   sudo certbot certonly --manual -d api.torii.sbs -d turn.torii.sbs
   ```
   Hoặc tạo riêng cho `turn.torii.sbs`:
   ```bash
   sudo certbot certonly --manual -d turn.torii.sbs
   ```

2. **Đồng bộ Chứng chỉ SSL**:
   Chạy script để copy cert vào dự án:
   ```bash
   chmod +x scripts/update-livekit-certs.sh
   ./scripts/update-livekit-certs.sh
   ```
3. **Khởi động hệ thống**:
   ```bash
   sudo docker compose up -d
   ```

## 4. Tự động hóa cập nhật SSL (Certbot Hook)
Để hệ thống tự động nhận SSL mới mỗi khi Certbot gia hạn thành công (khoảng 3 tháng/lần), hãy cấu hình `renew_hook`:

1. Cấp quyền cho script:
   ```bash
   chmod +x scripts/update-livekit-certs.sh
   ```
2. Cấu hình Certbot:
   Mở file: `sudo nano /etc/letsencrypt/renewal/api.torii.sbs.conf`
   Thêm dòng sau vào dưới mục `[renewalparams]`:
   ```text
   renew_hook = /home/lain4504/SEP490/torii-monorepo/scripts/update-livekit-certs.sh
   ```

## 5. Xử lý thủ công (Khi cần thiết)
Nếu bạn muốn cập nhật chứng chỉ ngay lập tức mà không chờ Certbot gia hạn:
```bash
./scripts/update-livekit-certs.sh
```

## 6. Kiểm tra trạng thái
- Kiểm tra log: `sudo docker logs -f torii-livekit`
- Kiểm tra kết nối: Truy cập [LiveKit Connection Tester](https://livekit.io/connection-test) và nhập `wss://api.torii.sbs/socket-b`.
