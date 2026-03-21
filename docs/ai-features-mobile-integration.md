# Mobile Integration Guide - Text-based AI Features

Tài liệu này hướng dẫn cách tích hợp các tính năng AI dạng văn bản (Chatbot, Roleplay, Drill, Translation) từ hệ thống Torii vào ứng dụng Mobile.

## 1. Tổng quan các Endpoint
Tất cả các yêu cầu đều được gửi đến Gateway (`apps/server`). Trên Mobile, thay vì dùng Cookie (Session), khuyến khích sử dụng **JWT (Bearer Token)** để đồng bộ và bảo mật tốt hơn.

### 1.1 Cấu hình Axios Client (Ví dụ React Native)
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.yourtorii.com', // Gateway URL
  timeout: 30000, // AI có thể phản hồi chậm, nên để > 30s
});

// Thêm Interceptor để đính kèm Token
api.interceptors.request.use(async (config) => {
  const token = await storage.getToken(); // Lấy từ SecureStore/AsyncStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## 2. Danh sách các Endpoint
| :--- | :--- | :--- | :--- |
| **AI Chatbot** | `/api/agents/chat` | `POST` | Trò chuyện tự do với Sensei. |
| **AI Roleplay** | `/api/agents/roleplay` | `POST` | Hội thoại theo tình huống (Text-based). |
| **AI Drill** | `/api/agents/drill/generate` | `POST` | Tạo bài tập tiếng Nhật (N5-N1). |
| **Dịch thuật** | `/api/agents/translate` | `POST` | Dịch giữa Nhật - Việt - Anh. |
| **Sửa lỗi ngữ pháp** | `/api/agents/grammar-check` | `POST` | Kiểm tra và giải thích lỗi ngữ pháp. |

---

## 2. Chi tiết từng tính năng

### 2.1 AI Chatbot
Dùng để xây dựng màn hình chat thông minh.

**Request Body:**
```json
{
  "message": "Chào Sakura-san!",
  "history": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

**Response Data:**
```json
{
  "message": "こんにちは！お元気ですか？",
  "suggestions": ["Tôi khỏe", "Hôm nay thời tiết thế nào?"],
  "action": null 
}
```
*Lưu ý: Trường `action` có thể chứa gợi ý để chuyển sang tính năng khác (ví dụ: `generate_drill`).*

### 2.2 AI Roleplay (Text-based)
Khác với Voice Agent, đây là dạng hội thoại văn bản có phản hồi về Romaji và tiếng Việt.

**Request Body:**
```json
{
  "topic": "Mua sắm ở siêu thị",
  "message": "Cái này bao nhiêu tiền?",
  "history": []
}
```

**Response Data:**
```json
{
  "response": "これは三千円です。",
  "romaji": "Kore wa sanzen-en desu.",
  "vietnamese": "Cái này là 3000 Yên.",
  "feedback": "Bạn nên dùng 'ikura' để hỏi giá chuẩn hơn.",
  "isFinished": false
}
```

### 2.3 AI Drill (Tạo bài tập)
Tạo danh sách các câu hỏi trắc nghiệm tự động.

**Request Body:**
```json
{
  "type": "grammar", 
  "topic": "Trợ từ",
  "level": "N4",
  "count": 5
}
```
*(Types: `grammar`, `vocabulary`, `kanji`, `listening`, `reading`)*

**Response Data:**
```json
{
  "topic": "Trợ từ",
  "drills": [
    {
      "question": "___は日本に行きますか？",
      "options": ["誰", "何", "どこ", "いつ"],
      "correctAnswer": "誰",
      "explanation": "Câu hỏi về người thực hiện hành động."
    }
  ]
}
```

### 2.4 Dịch thuật & Ngữ pháp
**Dịch thuật Request:**
```json
{
  "text": "Tôi đang học tiếng Nhật",
  "sourceLanguage": "vi",
  "targetLanguage": "ja"
}
```

**Ngữ pháp Request:**
```json
{
  "text": "私は日本語を勉強しているです"
}
```

```

---

## 3. Code mẫu giao diện Chat/Roleplay hoàn chỉnh
Dưới đây là ví dụ triển khai một màn hình Chat AI cơ bản sử dụng thư viện phổ biến.

```tsx
import React, { useState, useRef } from 'react';
import { View, FlatList, TextInput, Button, Text } from 'react-native';
import Markdown from 'react-native-markdown-display';

const RoleplayScreen = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.post('/api/agents/roleplay', {
        topic: 'Daily Life',
        message: input,
        history: messages // Gửi kèm history để AI nhớ ngữ cảnh
      });

      const aiData = response.data.data;
      const aiMsg = {
        role: 'assistant',
        content: aiData.response,
        romaji: aiData.romaji,
        vietnamese: aiData.vietnamese,
        feedback: aiData.feedback
      };
      
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setLoading(false);
      // Tự động scroll xuống cuối khi có tin nhắn mới
      flatListRef.current?.scrollToEnd();
    }
  };

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={{ marginVertical: 8, alignSelf: item.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
            <View style={{ backgroundColor: item.role === 'user' ? '#007AFF' : '#E5E5EA', padding: 12, borderRadius: 12 }}>
               <Markdown style={{ body: { color: item.role === 'user' ? 'white' : 'black' } }}>
                 {item.content}
               </Markdown>
            </View>
            {item.romaji && <Text style={{ fontSize: 12, color: 'gray', marginTop: 4 }}>{item.romaji}</Text>}
            {item.feedback && <Text style={{ fontSize: 11, color: '#D9534F', fontStyle: 'italic' }}>Tip: {item.feedback}</Text>}
          </View>
        )}
      />
      <View style={{ flexDirection: 'row', padding: 10 }}>
        <TextInput value={input} onChangeText={setInput} style={{ flex: 1, borderBottomWidth: 1 }} placeholder="Nói gì đó..." />
        <Button title={loading ? "..." : "Gửi"} onPress={sendMessage} disabled={loading} />
      </View>
    </View>
  );
};
```

---

## 4. Lưu ý triển khai Mobile (Nâng cao)

1. **Hiển thị Markdown & LaTeX**: Phản hồi từ AI (đặc biệt là AI Drill/Giải thích) thường chứa Markdown. Mobile app nên dùng `react-native-markdown-display` (RN) hoặc `flutter_markdown` (Flutter). Nếu có công thức toán học/ngôn ngữ học phức tạp, cần thêm hỗ trợ MathView.
2. **Xử lý Timeout & Retry**: AI đôi khi mất hơn 10s để "suy nghĩ". Đảm bảo cấu hình `timeout` của Axios trên Mobile đủ lớn (>30s) và có cơ chế thông báo "Vui lòng đợi giây lát, AI đang soạn phản hồi".
3. **Optimistic UI & Scrolling**: Khi user bấm gửi, tin nhắn của user nên được hiện ngay lập tức (`setMessages`) trước khi API trả về để tạo cảm giác app phản hồi nhanh. Luôn dùng `scrollToEnd()` sau mỗi tin nhắn mới.
4. **Haptics (Rung)**: Sử dụng Haptic Feedback (rung nhẹ) khi AI bắt đầu trả về tin nhắn hoặc có thông báo lỗi để tăng trải nghiệm người dùng mobile.

---
*Tài liệu này được biên soạn cho dự án SEP490 - Torii Monorepo.*
