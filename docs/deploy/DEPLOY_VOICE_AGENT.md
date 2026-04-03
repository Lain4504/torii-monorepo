# Hướng dẫn triển khai Voice Agent (Full Setup)

Tài liệu này hướng dẫn chi tiết cách triển khai Voice Agent tích hợp với LiveKit Cloud và Gemini AI trên VPS Google Cloud.

> **Lưu ý quan trọng:** Tài liệu này mô tả đúng trạng thái hiện tại của codebase. Không cần chỉnh sửa thêm `Dockerfile` hay `docker-compose.yml` nếu bạn đã có code mới nhất từ repo.

---

## 1. Cơ chế hoạt động

```
[Web Learner (Vercel)]
  → POST /start (HTTPS)
  → [Nginx Reverse Proxy] /voice-agent/
  → [Voice Agent Container :8082] (HTTP nội bộ)
  → [LiveKit Cloud] (WebSocket + HTTPS)
  → [Gemini API] (AI)
```

---

## 2. Cấu hình đã có sẵn trong codebase

### `apps/voice-agent/Dockerfile`

> **Thay đổi quan trọng**: Đã thêm `ca-certificates` vào runner stage. Đây là bắt buộc trên Google Cloud vì thư viện `@livekit/rtc-node` sử dụng binary Rust native cần CA certificates của hệ điều hành để xác thực HTTPS (khác với Node.js tự gói sẵn certs riêng). Thiếu dòng này sẽ gây lỗi `ConnectError: failed to retrieve region info`.

```dockerfile
# --- Runner Stage ---
FROM node:20-slim AS runner

# IMPORTANT: Required for @livekit/rtc-node native Rust binary on GCP.
# It uses system CA certs (not Node.js bundled certs) for HTTPS connections.
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app/apps/voice-agent
# ...
```

### `docker-compose.yml` (phần `voice-agent`)

> **Thay đổi quan trọng**: Biến `GOOGLE_API_KEY` được map với fallback từ `GEMINI_API_KEY`. Điều này đảm bảo nếu VPS chỉ có `GEMINI_API_KEY` thì agent vẫn khởi động được.

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
    networks:
      - voice-agent-net
    env_file:
      - .env
    environment:
      - NODE_ENV=production
      - LIVEKIT_URL=${LIVEKIT_URL}
      - LIVEKIT_API_KEY=${LIVEKIT_API_KEY}
      - LIVEKIT_API_SECRET=${LIVEKIT_API_SECRET}
      - GOOGLE_API_KEY=${GOOGLE_API_KEY}
    ports:
      - "8082:8082"
    depends_on:
      - livekit

# Thêm vào cuối file (ngang hàng với `volumes:`)
networks:
  # Mạng riêng cho voice-agent với MTU 1400 để tương thích Google Cloud.
  # Không ảnh hưởng tới mạng default của các service khác (LiveKit Meet, v.v.)
  voice-agent-net:
    driver: bridge
    driver_opts:
      com.docker.network.driver.mtu: 1400
```

---

## 3. Quy trình triển khai từng bước

### Bước 1: Chuẩn bị file `.env` trên VPS

Tại thư mục gốc (`~/torii-monorepo`), tạo hoặc chỉnh sửa file `.env`:

```bash
nano .env
```

Nội dung tối thiểu cần có:

```env
# Docker Hub username để pull/push image
DOCKER_USERNAME=your_dockerhub_username

# AI Key (dùng một trong hai)
GEMINI_API_KEY=AIzaSy...

# LiveKit Cloud
LIVEKIT_URL=wss://[your-project].livekit.cloud
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret

# Port nội bộ của Voice Agent
PORT=8082
```

### Bước 2: Build và khởi động Voice Agent

Vì `Dockerfile` đã thay đổi (thêm `ca-certificates`), bắt buộc phải **build lại image**:

```bash
# Chỉ rebuild và restart riêng voice-agent, không ảnh hưởng các service khác
docker compose stop voice-agent
docker compose build voice-agent --no-cache
docker compose up -d voice-agent
```

> **Lưu ý**: Lệnh `--no-cache` đảm bảo Docker cài `ca-certificates` vào image mới, không dùng cache cũ.

### Bước 3: Cấu hình Nginx (Bắt buộc cho HTTPS)

Mở file cấu hình Nginx của domain:

```bash
sudo nano /etc/nginx/sites-available/api.torii.sbs
```

Thêm đoạn sau vào bên trong block `server { listen 443 ssl; ... }`:

```nginx
location /voice-agent/ {
    proxy_pass http://127.0.0.1:8082/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;

    # Timeout dài hơn cho AI phản hồi
    proxy_read_timeout 300s;
    proxy_connect_timeout 75s;
}
```

Kiểm tra và khởi động lại Nginx:

```bash
sudo nginx -t && sudo systemctl restart nginx
```

### Bước 4: Cấu hình Frontend (Vercel)

1. Vào **Vercel** → Project Settings → **Environment Variables**.
2. Thêm biến: `NEXT_PUBLIC_VOICE_AGENT_URL` = `https://api.torii.sbs/voice-agent`
3. Thực hiện **Redeploy** thủ công (không cache) trên Vercel.

---

## 4. Kiểm tra hệ thống

**Health check:**
```bash
curl https://api.torii.sbs/voice-agent/health
# Kết quả đúng: {"status":"ok","agentServer":true}
```

**Xem log real-time:**
```bash
docker compose logs -f voice-agent
```

**Log khởi động thành công trông như thế này:**
```
[Server] AgentServer is running.
[xx:xx:xx] DEBUG: connected to LiveKit server
[xx:xx:xx] INFO: registered worker
    id: "AW_..."
    region: "Singapore South East"
```

**Kiểm tra container:**
```bash
docker compose ps
```

---

## 5. Troubleshooting

| Lỗi | Nguyên nhân | Giải pháp |
|-----|------------|-----------|
| `ConnectError: failed to retrieve region info` | Thiếu `ca-certificates` trong Docker image | Rebuild: `docker compose build voice-agent --no-cache` |
| `GOOGLE_API_KEY is not set` | `.env` thiếu API key | Thêm `GEMINI_API_KEY` vào `.env` trên VPS |
| `502 Bad Gateway` từ Nginx | Container chưa chạy hoặc sai port | Kiểm tra `docker compose ps` và `PORT=8082` trong `.env` |
| `runner initialization timed out` | CPU VPS quá tải (load > 0.7) | Đợi vài giây hoặc nâng cấp VPS lên ít nhất 2GB RAM |
| Agent không vào phòng | Image cũ chưa được rebuild | Chạy lại `docker compose build voice-agent --no-cache` |

---

## 6. Các cổng cần mở (Firewall GCP)

| Cổng | Giao thức | Mục đích |
|------|----------|---------|
| `80` | TCP | HTTP (redirect sang HTTPS) |
| `443` | TCP | HTTPS (Nginx) |
| `8080` | TCP | Backend Gateway API |
| `8082` | TCP | Voice Agent (chỉ nội bộ, Nginx proxy) |

---

*Tài liệu hướng dẫn triển khai hệ thống Torii Nihongo. Cập nhật lần cuối: 2026-03-19.*
