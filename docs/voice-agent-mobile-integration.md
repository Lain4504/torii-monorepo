# Mobile Integration Guide - Torii Voice Agent

Tài liệu này hướng dẫn cách tích hợp tính năng AI Voice Sensei từ hệ thống Torii vào ứng dụng Mobile (React Native, Flutter, hoặc Native iOS/Android).

## 1. Kiến trúc hệ thống
Hệ thống Voice Agent của Torii hoạt động dựa trên LiveKit Cloud và Gemini Multimodal Live API. Quy trình kết nối như sau:
1. **Mobile App** gọi API Gateway (`apps/server`) để lấy LiveKit Access Token.
2. **Mobile App** sử dụng Token này để kết nối trực tiếp vào **LiveKit Cloud Room**.
3. **Voice Agent** (Node.js) sẽ tự động join vào cùng Room đó để bắt đầu hội thoại.

---

## 2. Quy trình chi tiết

### Bước 1: Lấy LiveKit Access Token
Mobile App cần gửi yêu cầu đến Gateway để nhận Token và WebSocket URL.

**Endpoint:** `POST https://<your-gateway-url>/api/agents/livekit-token`

**Headers:**
- `Authorization: Bearer <User-JWT-Token>`
- `Content-Type: application/json`

**Body:**
```json
{
  "graphName": "japanese_tutor" 
}
```
*(Các graphName khả dụng: `japanese_tutor`, `roleplay`, `free_conversation`)*

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "...",
    "wsUrl": "wss://...",
    "roomId": "roleplay-japanese_tutor-...",
    "quota": { ... }
  }
}
```

### Bước 2: Cài đặt SDK LiveKit trên Mobile
Sử dụng SDK chính thức của LiveKit cho từng nền tảng:
- **React Native:** `@livekit/react-native`
- **Flutter:** `livekit_client`
- **iOS (Swift):** `LiveKit`
- **Android (Kotlin):** `livekit-android`

### Bước 3: Kết nối vào Room
Sử dụng `token` và `wsUrl` nhận được ở Bước 1.

**Ví dụ (React Native):**
```typescript
import { Room, RoomEvent, TrackSource } from '@livekit/react-native';

const room = new Room();

// 1. Phải xin quyền Microphone trước
await requestMicrophonePermission(); 

// 2. Kết nối
await room.connect(wsUrl, token);

// 3. Turn on microphone để AI nghe thấy bạn
await room.localParticipant.setMicrophoneEnabled(true);

// 4. Lắng nghe audio từ Agent
room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
  if (participant.identity.startsWith('agent-') && track.kind === 'audio') {
    // Audio sẽ tự động phát qua SDK
  }
});
```

---

## 3. Lưu ý quan trọng cho Mobile

### Cấp quyền (Permissions)
Bạn **bắt buộc** phải khai báo và yêu cầu quyền sử dụng Microphone trong:
- **iOS:** `NSMicrophoneUsageDescription` trong `Info.plist`.
- **Android:** `RECORD_AUDIO` trong `AndroidManifest.xml`.

### Voice Activity Detection (VAD)
Hệ thống Voice Agent hiện tại đã được tối ưu hóa VAD phía Server (phản hồi sau 400ms im lặng). Tuy nhiên, trên Mobile:
- Đảm bảo Microphone không bị ngắt quãng do các tác vụ nền.
- Sử dụng hiệu ứng sóng âm (Visualizer) từ `AudioTrack` của LiveKit để người dùng biết AI đang nghe.

### Network Latency
Vì đây là truyền phát âm thanh thời gian thực (WebRTC), hãy đảm bảo kết nối 4G/Wifi ổn định. LiveKit SDK sẽ tự động xử lý việc kết nối lại (reconnect) nếu mạng chập chờn.

---

## 4. Danh sách API endpoints hỗ trợ
| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `POST` | `/api/agents/livekit-token` | Lấy Token để bắt đầu gọi. |
| `POST` | `/api/agents/livekit-end` | Gửi báo cáo kết thúc session (tùy chọn). |
| `GET` | `/api/agents/sensei/quota-status` | Kiểm tra số lượt gọi còn lại của user. |

---
*Tài liệu này được biên soạn cho dự án SEP490 - Torii Monorepo.*
