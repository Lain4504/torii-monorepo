# Hướng dẫn triển khai Voice Agent (Full Setup)

Tài liệu này hướng dẫn chi tiết cách triển khai Voice Agent tích hợp với LiveKit Cloud và Gemini AI, đảm bảo kết nối ổn định qua HTTPS và xử lý lỗi mạng (DNS/MTU) trong Docker.

---

## 1. Cơ chế hoạt động
- **Web Frontend (Vercel)**: Gửi yêu cầu khởi tạo (`/start`) tới Voice Agent URL.
- **Nginx (Reverse Proxy)**: Nhận request HTTPS tại `/voice-agent/` và chuyển tới cổng **8082** (HTTP) nội bộ của VPS.
- **Voice Agent (Docker)**: Kết nối tới **LiveKit Cloud** để quản lý âm thanh và gọi **Gemini API** để xử lý ngôn ngữ.
- **DNS**: Sử dụng Google DNS (`8.8.8.8`) để đảm bảo container luôn phân giải được domain của LiveKit Cloud.

---

## 2. Các cổng cần mở (Firewall GCP/VPS)
Bạn phải đảm bảo các cổng sau đã được **ALLOW** trong bảng điều khiển Google Cloud:
- **TCP**: `80` (HTTP), `443` (HTTPS)
- **TCP**: `8080` (Gateway API - Nếu dùng trực tiếp)
- **TCP**: `8082` (Voice Agent - Cổng nội bộ cho Nginx proxy)

---

## 3. Quy trình triển khai từng bước

### Bước 1: Chuẩn bị file `.env` trên VPS
Tại thư mục gốc của dự án (`/home/deploy/torii-monorepo`), mở hoặc tạo file `.env`:
```bash
nano .env
```
Nội dung tối thiểu cần có cho Voice Agent:
```env
# AI Keys
GEMINI_API_KEY=AIzaSy... (Key từ Google AI Studio)

# LiveKit Cloud (Voice Agent sử dụng Cloud để ổn định)
LIVEKIT_URL=wss://[your-project].livekit.cloud
LIVEKIT_API_KEY=your_key
LIVEKIT_API_SECRET=your_secret

# Cấu hình Port nội bộ
PORT=8082
```

### Bước 2: Cấu hình Docker Compose
Mở file `docker-compose.yml`, cập nhật phần `voice-agent`:
```yaml
  voice-agent:
    build:
      context: .
      dockerfile: apps/voice-agent/Dockerfile
    image: ${DOCKER_USERNAME}/torii-voice-agent:latest
    restart: always
    dns:
      - 8.8.8.8
      - 8.8.4.4
    env_file:
      - .env
    environment:
      - NODE_ENV=production
      - LIVEKIT_URL=${LIVEKIT_URL}
      - LIVEKIT_API_KEY=${LIVEKIT_API_KEY}
      - LIVEKIT_API_SECRET=${LIVEKIT_API_SECRET}
      - GOOGLE_API_KEY=${GEMINI_API_KEY:-${GOOGLE_API_KEY}}
    ports:
      - "8082:8082"
```

### Bước 3: Cấu hình Nginx (Bắt buộc cho HTTPS)
Mở file cấu hình Nginx của domain (ví dụ: `api.torii.sbs`):
```bash
sudo nano /etc/nginx/sites-available/api.torii.sbs
```
Thêm đoạn sau vào block `server { listen 443 ssl; ... }`:
```nginx
location /voice-agent/ {
    proxy_pass http://127.0.0.1:8082/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    
    # Timeout cho AI phản hồi
    proxy_read_timeout 300s;
    proxy_connect_timeout 75s;
}
```
Kiểm tra và Restart Nginx:
```bash
sudo nginx -t && sudo systemctl restart nginx
```

---

## 4. Cấu hình Frontend (Vercel)
Để ứng dụng gọi đúng vào URL vừa cấu hình ở Bước 3:
1. Vào **Vercel Settings** > **Environment Variables**.
2. Thêm: `NEXT_PUBLIC_VOICE_AGENT_URL = https://api.torii.sbs/voice-agent`
3. Thực hiện **Redeploy** thủ công trên Vercel.

---

## 5. Kiểm tra trạng thái hệ thống

- **Kiểm tra sức khỏe (Health Check)**:
  Truy cập: `https://api.torii.sbs/voice-agent/health`
  *Kết quả đúng: `{"status":"ok", "agentServer": true}`*

- **Xem Log real-time**:
  ```bash
  docker compose logs -f voice-agent
  ```

- **Lỗi 502 Bad Gateway?**: Kiểm tra xem `PORT` trong `.env` có đúng là `8082` không và container `voice-agent` đã `Up` chưa bằng lệnh `docker compose ps`.

---
*Tài liệu hướng dẫn triển khai hệ thống Torii Nihongo.*
