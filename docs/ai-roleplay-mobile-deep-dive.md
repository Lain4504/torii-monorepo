# Mobile Deep Dive - AI Roleplay (Interactive)

Tài liệu này cung cấp hướng dẫn kỹ thuật chuyên sâu để triển khai tính năng **AI Roleplay** trên Mobile với đầy đủ tính năng: Nhận diện giọng nói (STT), Chuyển văn bản thành giọng nói (TTS) chất lượng cao, và Cài đặt giọng đọc như phiên bản Web Learner.

---

## 1. Kiến trúc tính năng
Tính năng Roleplay hoạt động theo 4 giai đoạn chính, được đồng bộ chặt chẽ với logic của Web Learner:
1. **Setup**: Người dùng chọn chủ đề (Topic) hoặc tình huống.
2. **Hội thoại**: Gửi tin nhắn văn bản hoặc giọng nói (STT). **Lưu ý: Cần tối thiểu 5 lượt trao đổi để kích hoạt đánh giá.**
3. **Phản hồi**: AI trả về nội dung Nhật ngữ kèm Romaji, nghĩa tiếng Việt và Feedback.
4. **Âm thanh**: Tự động phát âm thanh (TTS) bằng giọng đọc đã chọn.

---

## 2. Nhận diện giọng nói (Speech-to-Text - STT)
Trên Mobile, không dùng Browser API mà dùng các thư viện native để có độ chính xác cao nhất (đặc biệt là tiếng Nhật).

**Thư viện đề xuất:**
- **React Native:** `@react-native-voice/voice` (Dùng bộ engine mạnh mẽ của Google/Apple).
- **Flutter:** `speech_to_text` (Native binding).

### 2.1 Cấu hình & Xử lý sự kiện (React Native Detailed)
Để đạt được hiệu ứng "chữ chạy theo giọng nói" (Interim Results) như trên Web Learner, bạn cần xử lý 3 sự kiện chính:

```typescript
import Voice, { SpeechResultsEvent, SpeechErrorEvent } from '@react-native-voice/voice';

const SpeechToTextModule = () => {
  const [interimText, setInterimText] = useState(''); // Chữ đang nhận diện (mờ)
  const [finalText, setFinalText] = useState('');     // Chữ đã nhận diện xong (đậm)

  useEffect(() => {
    // 1. Gán Listener
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechPartialResults = onSpeechPartialResults; // QUAN TRỌNG cho Interim Results
    Voice.onSpeechError = onSpeechError;

    return () => Voice.destroy().then(Voice.removeAllListeners);
  }, []);

  // Xử lý khi đang nói (chữ bắt đầu hiện lên)
  const onSpeechPartialResults = (e: SpeechResultsEvent) => {
    if (e.value) setInterimText(e.value[0]);
  };

  // Xử lý khi kết thúc câu nói
  const onSpeechResults = (e: SpeechResultsEvent) => {
    if (e.value) {
      const result = e.value[0];
      setFinalText(prev => prev + " " + result);
      setInterimText(''); // Reset chữ tạm
    }
  };

  const startListening = async () => {
    try {
      await Voice.start('ja-JP'); // Bắt buộc Japanese
    } catch (e) {
      handleSTTError(e);
    }
  };
  
  const stopListening = async () => {
    await Voice.stop();
  };
};
```

### 2.2 Xử lý lỗi & Quyền Microphone
Web Learner sử dụng các lỗi chuẩn của Browser. Trên Mobile, bạn cần xử lý các mã lỗi Native:

| Mã lỗi (RN Voice) | Ý nghĩa | Cách xử lý gợi ý |
| :--- | :--- | :--- |
| `permission` | Chưa cấp quyền Mic | Hiện Dialog hướng dẫn vào Settings điện thoại để bật. |
| `no-speech` | Không nghe thấy tiếng | Tự động tắt Mic sau 5s để tiết kiệm pin. |
| `network` | Mạng yếu (Cần cho Google STT) | Thông báo yêu cầu chuyển sang Wifi/4G. |
| `not-allowed` | Quyền bị từ chối vĩnh viễn | Yêu cầu user mở Cài đặt hệ thống. |

### 2.3 UI/UX Tips cho STT
1. **Visualizer**: Khi đang nghe (`isListening`), nên hiện một sóng âm thanh nhẹ hoặc icon Micro đổi màu đỏ nhấp nháy.
2. **Auto-Focus**: Khi bấm dùng Mic, hãy tự động focus vào ô nhập liệu để bàn phím không che mất phần văn bản đang hiển thị.
3. **Double Confirmation**: Cho phép người dùng chỉnh sửa văn bản đã nhận diện trước khi bấm "Gửi".

---

## 3. Chuyển văn bản thành giọng nói (TTS)
Hệ thống Torii hỗ trợ 2 nguồn giọng đọc:
1. **Native TTS**: Giọng đọc mặc định của điện thoại (không tốn phí, latency thấp).
2. **Server Neural Voice**: Giọng đọc chất lượng cao (Nanami, Keita) từ Server (âm thanh tự nhiên hơn).

### 3.1 Sử dụng Server TTS (Khuyên dùng cho chất lượng cao)
Gọi API Backend để lấy URL file âm thanh:
**Endpoint:** `POST /api/agents/tts`
**Body:**
```json
{
  "text": "こんにちは、お元気ですか？",
  "voice": "ja-JP-NanamiNeural" 
}
```
*(Các voice khả dụng: `ja-JP-NanamiNeural` (Nữ), `ja-JP-KeitaNeural` (Nam))*

**Xử lý trên Mobile:**
Dùng thư viện chơi nhạc (ví dụ `react-native-video` hoặc `expo-av`) để phát `data.url` nhận được từ API.

---

## 4. Giao diện Cài đặt (Settings)
Để giống Web Learner, màn hình Mobile cần một Modal cài đặt bao gồm:

### Các thông số cần quản lý:
- **Show Translation**: `boolean` (Ẩn/Hiện Romaji & Tiếng Việt).
- **Auto-play**: `boolean` (Tự động phát âm thanh khi AI trả lời).
- **Voice Selection**: 
  - `Server: Nanami (Neural)`
  - `Server: Keita (Neural)`
  - `System: Default`
- **Voice Speed**: `0.5x` đến `2.0x`.

### UI Mockup gợi ý:
- Một biểu tượng bánh răng (Settings) ở góc phải Header.
- Sử dụng `BottomSheet` để thay đổi giọng nói nhanh chóng.

---

## 5. Logic Nghiệp vụ & UX (Web Parity)
Để đạt được 100% tính năng như Web Learner, bạn cần lưu ý các logic sau:

### 5.1 Quản lý Lịch sử (Chat History Management)
Mỗi lần gửi tin nhắn, bạn phải gửi kèm toàn bộ mảng `history`.
- **User message**: `{ role: 'user', content: '...' }`
- **AI response**: `{ role: 'model', content: JSON.stringify(ai_response_obj) }`
*Lưu ý: Web Learner lưu model response dưới dạng string JSON để tiết kiệm dung lượng và giữ nguyên metadata.*

### 5.2 Điều kiện Kết thúc & Token
- **Nút Kết thúc**: Chỉ hiển thị khi `turnCount >= 5`.
- **Token Tracking**: Sau mỗi API call, cộng dồn `tokenUsage` (`prompt`, `completion`) để hiển thị cho người dùng biết mức độ tiêu thụ tài nguyên AI.

### 5.3 Hiển thị Phụ đề (Subtitle Toggle)
Trong UI, cung cấp Switch `Show Translation`. 
- Nếu `true`: Hiện `romaji` và `vietnamese`.
- Nếu `false`: Chỉ hiện tiếng Nhật nguyên bản (để người dùng tự luyện nghe/đọc).

## 6. Luồng "Kết thúc & Đánh giá" (Finish & Assessment)
Sau ít nhất 5 lượt hội thoại, hãy hiển thị nút **"Kết thúc & Đánh giá"**.

**API Call:**
Gửi yêu cầu với flag `isFinal: true`.

```typescript
const handleFinish = async () => {
  const response = await api.post('/api/agents/roleplay', {
    topic: currentTopic,
    message: "", // Message trống
    history: chatHistory,
    isFinal: true // QUAN TRỌNG: Flag để server tổng kết feedback
  });
  
  const feedback = response.data.data.feedback;
  // Hiển thị feedback vào một Card đặc biệt cuối danh sách chat
};
```

---

## 6. Checklist cho Developer
- [ ] Cấp quyền Microphone (`RECORD_AUDIO` / `NSMicrophoneUsageDescription`).
- [ ] Cài đặt thư viện STT và kiểm tra nhận diện tiếng Nhật.
- [ ] Triển khai trình phát âm thanh để nghe Server TTS.
- [ ] Lưu trữ Topic và History trong state để gửi kèm mỗi lần Chat.
- [ ] Xử lý tự động cuộn (Auto-scroll) khi có tin nhắn mới hoặc STT đang chạy.

---
*Tài liệu này được biên soạn cho dự án SEP490 - Torii Monorepo.*
