# Academy Gamification Specification (Coupon-Focused)

Tài liệu này mô tả thiết kế module **Gamification** phiên bản thực tế, tập trung tối đa vào việc **biến điểm thưởng thành doanh thu** thông qua cơ chế đổi Coupon.

> **Trọng tâm**: "Học -> Tích điểm -> Đổi Coupon -> Mua khóa học". Đây là vòng lặp tạo ra giá trị kinh tế rõ ràng nhất.

## 1. Core Mechanics (Cơ chế cốt lõi)

Hệ thống tập trung vào 2 yếu tố:
1.  **Streak & XP**: Giữ chân người dùng quay lại hàng ngày và tạo cảm giác tiến bộ.
2.  **Reward (Coupon Only)**: Động lực duy nhất và mạnh nhất để người dùng tích điểm là **đổi mã giảm giá**.

### 1.1. Flow Nghiệp vụ Thực tế

**Scenario: Hành trình từ Người học đến Người mua hàng**
1.  **Tích lũy**:
    - User học bài, làm quiz hàng ngày -> Tích lũy **Points**.
    - Ví dụ: Mỗi bài học 10 điểm. Cần 500 điểm để đổi voucher 50k.
2.  **Đổi thưởng (Redemption)**:
    - User vào "Kho Quà" (Rewards Store).
    - Thấy danh sách các **Voucher/Coupon** (giảm tiền mặt hoặc %).
    - Bấm "Đổi ngay" -> Hệ thống trừ điểm -> Sinh ra một **Mã Coupon Riêng**.
3.  **Sử dụng (Conversion)**:
    - User copy mã này, vào trang thanh toán khóa học mới.
    - Apply mã -> Được giảm giá -> Hoàn tất đơn hàng.

---

## 2. Schema Design (Extensible but Focused)

Schema giữ nguyên tính mở rộng (Generic) nhưng dữ liệu thực tế chỉ dùng cho Coupon.

### 2.1. User Gamification Profile (`UserGamification`)

Bảng lưu trữ trạng thái người chơi.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | PK |
| `userId` | UUID | FK -> User |
| `level` | Int | Level hiện tại (tính từ Total XP) |
| `currentXp` | Int | Tổng XP tích lũy (để hiện Rank/Level) |
| `points` | Int | **Điểm khả dụng** (Quan trọng nhất: dùng để đổi Coupon) |
| `currentStreak` | Int | Số ngày liên tục hiện tại |
| `longestStreak` | Int | Kỷ lục chuỗi ngày |
| `lastActiveDate` | Date | Ngày hoạt động cuối |

### 2.2. History Ledger (`GamificationHistory`)

Lưu lịch sử dòng tiền (Points) để user tra soát.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | PK |
| `userId` | UUID | FK |
| `actionType` | Enum | `EARN` (học), `REDEEM` (đổi quà) |
| `amount` | Int | Số lượng thay đổi (+ hoặc -) |
| `currency` | Enum | `POINT` (chính), `XP` |
| `metadata` | JSON | Context (vd: `{ lessonId: "...", couponCode: "RWD-XYZ" }`) |
| `createdAt` | DateTime | |

### 2.3. Reward Definitions (`PointReward`)

Danh mục quà tặng. **Hiện tại chỉ chứa các item loại COUPON.**

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | PK |
| `name` | String | Tên hiển thị (VD: "Voucher 50k", "Giảm 10%") |
| `costPoints` | Int | Giá điểm (VD: 500) |
| `type` | Enum | **`COUPON`** (Hiện tại chỉ support loại này), *`ITEM`, `TITLE` (Future)* |
| `config` | JSON | Cấu hình sinh Coupon. VD: `{ "discountType": "FIXED", "value": 50000, "minOrder": 200000 }` |
| `isActive` | Boolean | Ẩn/Hiện quà |

---

## 3. Chiến lược Coupon & Business Logic

Phần này định nghĩa cách hệ thống sinh ra và kiểm soát Coupon đổi thưởng.

### 3.1. Phân biệt Coupon Hệ thống vs Coupon Đổi thưởng

Để tránh việc user lạm dụng (farm nick phụ lấy mã), hệ thống áp dụng cơ chế **Private Owner**.

| Đặc điểm | Reward Coupon (Gamification) |
| :--- | :--- |
| **Nguồn gốc** | User chủ động đổi bằng Points tích lũy. |
| **Mã Code** | **Unique & Random**. VD: `RWD-8A2B-9XYZ`. Không trùng lặp. |
| **Sở hữu** | **Private**. Chỉ user đổi mới dùng được (Check `ownerId`). |
| **Giới hạn** | Dùng 1 lần duy nhất (`usageLimit = 1`). |
| **Hết hạn** | Thường ngắn hạn (VD: 30 ngày) để thôi thúc mua hàng. |

### 3.2. Quy trình Đổi Coupon (Redemption Flow)

**Step 1: User Request**
- User chọn quà: "Voucher 50k" (ID: `rew_50k`, Cost: 500 pts).
- API: `POST /gamification/redeem { rewardId: "rew_50k" }`.

**Step 2: Gamification Service Check**
- Check `user.points >= 500`.
- Check `Reward.isActive == true`.

**Step 3: Transaction (Atomic)**
- Trừ điểm: `user.points -= 500`.
- Ghi log: `GamificationHistory` (Type: `REDEEM`, Amount: -500, Metadata: `{ rewardName: "Voucher 50k" }`).

**Step 4: Generate Coupon (Call Commerce Module)**
- Gamification Service gọi nội bộ sang Commerce Service: `CouponService.createRewardCoupon(...)`.
- **Logic sinh mã**:
  - Prefix: `RWD` (hoặc config từ Reward).
  - Body: Random string (VD: `X9A2`).
  - Result: `RWD-X9A2`.
- **Lưu vào DB Commerce**:
  - Tạo record `Coupon` mới.
  - `code`: `RWD-X9A2`.
  - `discountValue`: 50000 (lấy từ config của Reward).
  - `metadata`: `{ source: "GAMIFICATION", ownerId: user.id }`.
  - `status`: `ACTIVE`.

**Step 5: Return**
- Trả về `code` cho User hiển thị ngay lập tức.
- (Optional) Gửi email thông báo mã code.

### 3.3. Quy trình Sử dụng (Validation Flow)

Khi User dùng mã `RWD-X9A2` tại bước Checkout:
1.  **Check tồn tại & hiệu lực**: (Logic cơ bản của Billing).
2.  **Check chủ sở hữu (Quan trọng)**:
    - Billing Service đọc `coupon.metadata.ownerId`.
    - So sánh với `currentUser.id`.
    - Nếu khác nhau -> **Reject**: "Mã này không dành cho tài khoản của bạn".

---

## 4. Implementation Details

### 4.1. Config Reward Data (Hardcode hoặc DB Seed)

Ban đầu có thể seed dữ liệu cứng vào DB để chạy ngay:

```json
[
  {
    "name": "Voucher 20.000đ",
    "description": "Giảm trực tiếp 20k cho đơn từ 100k",
    "costPoints": 200,
    "type": "COUPON",
    "config": {
      "discountType": "FIXED_AMOUNT",
      "discountValue": 20000,
      "minOrderValue": 100000,
      "prefix": "RWD20"
    }
  },
  {
    "name": "Giảm 10% (Tối đa 50k)",
    "description": "Giảm 10% cho mọi khóa học",
    "costPoints": 500,
    "type": "COUPON",
    "config": {
      "discountType": "PERCENTAGE",
      "discountValue": 10,
      "maxDiscountAmount": 50000,
      "prefix": "RWD10"
    }
  }
]
```

### 4.2. API Endpoints (Minimalist)

Chỉ cần 3 API để vận hành toàn bộ luồng đổi quà:

1.  `GET /gamification/me`:
    - Trả về: `points`, `currentStreak`, `level`.
    - Dùng để hiện trên Header/Dashboard.

2.  `GET /gamification/rewards`:
    - Trả về danh sách quà (Voucher) đang active.
    - User nhìn vào đây để có động lực cày điểm.

3.  `POST /gamification/redeem`:
    - Input: `{ rewardId }`.
    - Output: `{ success: true, code: "RWD20-KJ8X" }`.
    - User nhận mã và dùng ngay.

### 4.3. Future Expansion (Mở rộng sau này)

Schema `PointReward` vẫn có field `type`. Sau này nếu muốn thêm quà khác, chỉ cần:
- Thêm record mới với `type = 'STREAK_FREEZE'` hoặc `type = 'AVATAR_FRAME'`.
- Update logic xử lý ở `Step 4` (thay vì gọi CouponService thì gọi InventoryService).
- DB không cần sửa đổi gì thêm.

## 5. Kết luận

Thiết kế này đạt được sự cân bằng hoàn hảo:
- **Tập trung**: Giải quyết bài toán kinh tế (đổi điểm lấy voucher) ngay lập tức.
- **Tinh gọn**: Không có bảng thừa, không logic phức tạp (không quest, không inventory).
- **Mở rộng**: Cấu trúc Data vẫn chuẩn để scale lên các tính năng game hóa phức tạp hơn nếu cần trong tương lai.
