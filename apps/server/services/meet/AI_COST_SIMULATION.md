# Mô Phỏng Luồng Tính Tiền Dịch Vụ AI trong Meet Service

Tài liệu này mô phỏng chi tiết cách hệ thống `meet-service` tính toán và ghi nhận chi phí sử dụng cho các tính năng AI sau khi một phòng họp kết thúc.

## 1. Bối Cảnh Mô Phỏng

- **Phòng họp:** `room-123`
- **Người dùng:**
  - Alice (`user-alice`)
  - Bob (`user-bob`)
- **Cấu hình `config.yaml` (Ví dụ):**
  ```yaml
  insights:
    services:
      ai_text_chat:
        provider: google
        id: "gemini-account-1"
        pricing:
          "default": # Model mặc định
            inputPricePerMillionTokens: 0.5
            outputPricePerMillionTokens: 1.5
          "gemini-pro": # Model dùng cho chat
            inputPricePerMillionTokens: 0.5
            outputPricePerMillionTokens: 1.5
      translation:
        provider: azure
        id: "azure-account-1"
        pricing:
          "default":
            pricePerMillionCharacters: 20 # $20 cho mỗi 1 triệu ký tự
  ```

---

## 2. Hoạt Động Diễn Ra Trong Phòng Họp

Trong suốt phiên họp, các hoạt động sau được ghi nhận vào Redis:

1.  **Alice sử dụng AI Chat:**
    - **Lượt 1:** Alice hỏi một câu (50 prompt tokens), Gemini trả lời (150 completion tokens).
      - `Redis` ghi nhận: `user-alice:chat:prompt` += 50, `user-alice:chat:completion` += 150.
    - **Lượt 2:** Alice hỏi tiếp (100 prompt tokens), Gemini trả lời (300 completion tokens).
      - `Redis` ghi nhận: `user-alice:chat:prompt` += 100, `user-alice:chat:completion` += 300.

2.  **Bob sử dụng Dịch Thuật:**
    - Bob dịch một tin nhắn dài 200 ký tự.
      - `Redis` ghi nhận: usage của `user-bob` += 200 ký tự.

---

## 3. Quy Trình Tính Tiền (Khi Phòng Họp Kết Thúc)

Khi phòng họp `room-123` kết thúc, hàm `artifactsService.createAllRoomUsageArtifacts` được kích hoạt.

### 3.1. Tính tiền AI Text Chat (`createAITextChatUsageArtifacts`)

#### **Bước 1: Lấy dữ liệu từ Redis**

- Dịch vụ đọc toàn bộ dữ liệu usage của `ai_text_chat` cho `room-123`.
- Hệ thống tổng hợp lại như sau:
  - **Task 'chat':**
    - `total_chat_prompt_tokens`: 150 (50 + 100)
    - `total_chat_completion_tokens`: 450 (150 + 300)
    - `total_chat_tokens`: 600
  - (Giả sử không có task 'summarize' trong ví dụ này)

#### **Bước 2: Tính toán chi phí**

- Hàm `getServicePricing` được gọi với `serviceType: 'ai_text_chat'` và `modelName: 'gemini-pro'`.
- Dựa vào `config.yaml`, hàm lấy ra các đơn giá:
  - `inputPricePerMillionTokens`: 0.5
  - `outputPricePerMillionTokens`: 1.5
- **Tính chi phí Prompt:**
  - `(150 / 1,000,000) * $0.5 = $0.000075`
- **Tính chi phí Completion:**
  - `(450 / 1,000,000) * $1.5 = $0.000675`
- **Tổng chi phí:**
  - `$0.000075 + $0.000675 = $0.00075`

#### **Bước 3: Tạo và Lưu Trữ Artifact**

- Một bản ghi (artifact) loại `AI_TEXT_CHAT_INTERACTION_USAGE` được tạo ra.
- Metadata của artifact này sẽ chứa cấu trúc dữ liệu tương tự như sau:
  ```json
  {
    "usageDetails": {
      "tokenUsage": {
        "promptTokens": 150,
        "completionTokens": 450,
        "totalTokens": 600,
        "promptTokensEstimatedCost": 0.000075,
        "completionTokensEstimatedCost": 0.000675,
        "totalTokensEstimatedCost": 0.00075,
        "breakdown": {
          "user-alice:chat:prompt": "150",
          "user-alice:chat:completion": "450",
          "total_chat_prompt_tokens": "150",
          "total_chat_completion_tokens": "450",
          "total_chat_tokens": "600"
        }
      }
    }
  }
  ```
- Bản ghi này được lưu vào cơ sở dữ liệu (PostgreSQL).
- Toàn bộ dữ liệu AI Chat của `room-123` trong Redis được **xóa** để dọn dẹp.

### 3.2. Tính tiền Dịch Thuật (`createChatTranslationUsageArtifact`)

#### **Bước 1: Lấy dữ liệu từ Redis**

- Dịch vụ đọc dữ liệu usage của `translation` cho `room-123`.
- Kết quả: `user-bob`: 200, `total_usage`: 200.

#### **Bước 2: Tính toán chi phí**

- Hàm `getServicePricing` được gọi với `serviceType: 'translation'` và `modelName: 'default'`.
- Dựa vào `config.yaml`, hàm lấy ra đơn giá:
  - `pricePerMillionCharacters`: 20
- **Tổng chi phí:**
  - `(200 / 1,000,000) * $20 = $0.004`

#### **Bước 3: Tạo và Lưu Trữ Artifact**

- Một artifact loại `CHAT_TRANSLATION_USAGE` được tạo.
- Metadata của artifact chứa:
  ```json
  {
    "usageDetails": {
      "characterCountUsage": {
        "totalCharacters": 200,
        "totalCharactersEstimatedCost": 0.004,
        "breakdown": {
          "user-bob": "200",
          "total_usage": "200"
        }
      }
    }
  }
  ```
- Bản ghi này được lưu vào cơ sở dữ liệu.
- Dữ liệu dịch thuật của `room-123` trong Redis được **xóa**.

---

## 5. Cơ Chế Bảo Vệ & Chống Nợ Đọng (Khuyến Nghị)

Để đảm bảo người dùng không sử dụng quá hạn mức dẫn đến nợ xấu, hệ thống cần bổ sung các chốt chặn sau:

### 5.1. Chốt chặn trước yêu cầu (Pre-request Check)
- **Logic:** Trước khi gửi request tới AI Provider, `InsightsService` sẽ gọi tới `WalletService` để kiểm tra số dư.
- **Hành động:** Nếu số dư < $0.01 (ngưỡng tối thiểu), trả về lỗi ngay lập tức mà không gọi AI. Điều này ngăn chặn việc tiêu tốn tài nguyên khi ví đã cạn.

### 5.2. Quản lý Quota tạm thời trong Redis
- **Logic:** Khi bắt đầu phòng họp, nạp số dư khả dụng vào Redis (ví dụ: `room:123:budget`).
- **Hành động:** Sau mỗi response từ AI, tính toán nhanh chi phí và dùng lệnh `DECRBY` trong Redis để trừ vào `budget` này.
- **Ưu điểm:** Tốc độ cực nhanh, không gây tải cho Database chính. Khi `budget` chạm mức 0, hệ thống tự động ngắt tính năng AI trong phòng đó.

### 5.3. Cơ chế Phanh khẩn cấp (Circuit Breaker)
- **Logic:** Thiết lập mức chi tiêu tối đa cho mỗi phòng họp trong `config.yaml` (ví dụ: tối đa $5/phòng).
- **Hành động:** Nếu tổng usage trong Redis vượt quá ngưỡng này, hệ thống tạm dừng dịch vụ AI của phòng đó cho đến khi được admin phê duyệt hoặc Host nạp thêm tiền.

### 5.4. Xử lý Nợ xấu (Post-billing Enforcement)
- **Logic:** Sau khi chốt Artifact và trừ tiền vào ví, nếu số dư bị âm (do các request song song cuối cùng).
- **Hành động:** Đánh dấu tài khoản người dùng là "Nợ đọng". Chặn quyền tạo phòng họp mới hoặc tham gia các tính năng trả phí cho đến khi khoản nợ được thanh toán.

---

## 4. Kết Quả Cuối Cùng

Khi quy trình kết thúc, cơ sở dữ liệu sẽ chứa 2 bản ghi artifacts cho `room-123`, ghi lại một cách minh bạch và chi tiết toàn bộ chi phí sử dụng dịch vụ AI:

1.  **Artifact AI Chat:** Tổng chi phí là **$0.00075**.
2.  **Artifact Dịch thuật:** Tổng chi phí là **$0.004**.

Các artifact này có thể được truy vấn thông qua API để phục vụ cho các mục đích báo cáo, thanh toán và phân tích.
