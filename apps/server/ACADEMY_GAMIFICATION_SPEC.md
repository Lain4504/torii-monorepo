# Academy Gamification Specification (Lean & Practical)

Tài liệu này mô tả thiết kế module **Gamification** phiên bản tinh gọn, thực tế, tập trung vào mục tiêu duy nhất: **Tăng tỷ lệ quay lại (Retention) và chuyển đổi (Conversion)** của người dùng thông qua cơ chế Streak và Reward.

> **Triết lý**: "Đơn giản hoá, không RPG hoá". Chúng ta không làm game, chúng ta làm app học tập có yếu tố game.

## 1. Core Mechanics (Cơ chế cốt lõi)

Hệ thống chỉ tập trung vào 3 yếu tố chính:
1.  **Streak (Chuỗi ngày)**: Giữ người dùng quay lại hàng ngày.
2.  **XP & Level (Danh hiệu)**: Cho người dùng cảm giác tiến bộ.
3.  **Points & Shop (Động lực)**: Điểm thưởng có giá trị thực tế (đổi Coupon giảm giá).

### 1.1. Flow Nghiệp vụ Thực tế

**Scenario 1: Học tập hàng ngày (The Daily Loop)**
1.  User đăng nhập vào app -> Hệ thống check Streak.
    - Nếu là ngày kế tiếp: Streak +1.
    - Nếu lỡ 1 ngày và có "Streak Freeze" (Bùa): Dùng bùa, Streak giữ nguyên.
    - Nếu lỡ và không có bùa: Streak reset về 1.
2.  User hoàn thành 1 bài học (Lesson) -> Nhận **10 XP** + **10 Points**.
3.  User làm bài Quiz đạt điểm cao -> Nhận **50 XP** + **20 Points**.

**Scenario 2: Đổi thưởng (The Value Loop)**
1.  User tích lũy được 1000 Points.
2.  User vào "Cửa hàng đổi điểm".
3.  User dùng 1000 Points để đổi lấy **"Mã giảm giá 20% cho khóa học IELTS"**.
4.  Hệ thống trừ điểm -> Sinh mã Coupon (module Commerce) -> User dùng mã đi mua khóa học.
    *-> Đây là luồng quan trọng nhất để biến Gamification thành Revenue.*

---

## 2. Schema Design (Simplified)

Schema được tối giản hóa, loại bỏ các bảng phức tạp như `Inventory`, `Quest`, `QuestLog`.

### 2.1. User Gamification Profile (`UserGamification`)

Bảng duy nhất lưu trữ trạng thái người chơi.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | PK |
| `userId` | UUID | FK -> User |
| `level` | Int | Level hiện tại (1, 2, 3...) - Tính toán từ Total XP |
| `currentXp` | Int | Tổng XP tích lũy trọn đời (Dùng để tính Level và Rank) |
| `points` | Int | Điểm khả dụng (Dùng để tiêu xài đổi quà) |
| `currentStreak` | Int | Số ngày liên tục hiện tại |
| `longestStreak` | Int | Kỷ lục chuỗi ngày cao nhất |
| `lastActiveDate` | Date | Ngày cuối cùng có hoạt động (chỉ lưu ngày, bỏ giờ) |
| `streakFreeze` | Int | Số lượng "Bùa hộ mệnh" đang có (Default 0) |

### 2.2. History Ledger (`GamificationHistory`)

Lưu lịch sử để audit và hiển thị "Lịch sử điểm thưởng".

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | PK |
| `userId` | UUID | FK |
| `actionType` | Enum | `LESSON_COMPLETE`, `QUIZ_PASS`, `DAILY_LOGIN`, `REDEEM_REWARD`, `STREAK_BONUS` |
| `amount` | Int | Số lượng thay đổi (+ hoặc -) |
| `currency` | Enum | `XP` (kinh nghiệm), `POINT` (tiền tệ) |
| `metadata` | JSON | Context (vd: `{ lessonId: "...", couponCode: "..." }`) |
| `createdAt` | DateTime | |

### 2.3. Reward Definitions (`PointReward`)

Danh mục quà tặng đổi bằng điểm (Hardcode hoặc DB config đơn giản).

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | PK |
| `name` | String | Tên quà (VD: "Coupon 50k", "Bùa hộ mệnh") |
| `costPoints` | Int | Giá điểm (VD: 500) |
| `type` | Enum | `COUPON`, `STREAK_FREEZE` |
| `config` | JSON | Cấu hình (VD: `{ discountValue: 50000, minOrder: 200000 }`) |
| `isActive` | Boolean | |

---

## 3. Quy tắc tính điểm (Business Rules)

Thay vì config database phức tạp, chúng ta sẽ define **Constant** trong code (Service Layer) để dễ điều chỉnh nhanh.

### 3.1. Earning Rules (Kiếm điểm)

| Hành động | XP (Level) | Points (Tiêu xài) | Ghi chú |
| :--- | :--- | :--- | :--- |
| **Daily Login** | 0 | 5 | Chỉ cộng 1 lần/ngày |
| **Complete Lesson** | 10 | 10 | Chỉ cộng lần đầu tiên hoàn thành |
| **Pass Quiz (>80%)** | 20 | 20 | Chỉ cộng lần đầu tiên pass |
| **Perfect Quiz (100%)** | 50 | 30 | Thưởng thêm |
| **Streak Milestone** | 100 | 100 | Khi đạt mốc 7, 30, 100 ngày |

### 3.2. Leveling Formula (Công thức lên cấp)

Công thức tuyến tính đơn giản:
`Level = Floor(TotalXP / 1000) + 1`
- Level 1: 0 - 999 XP
- Level 2: 1000 - 1999 XP
...

### 3.3. Shop Items (Tiêu điểm)

1.  **Streak Freeze (Bùa hộ mệnh)**
    - Giá: 200 Points.
    - Tác dụng: Tự động dùng khi user quên học 1 ngày để không mất Streak.
    - Giới hạn: Max 2 cái trong túi (tránh việc user mua quá nhiều rồi lười học).

2.  **Discount Coupons**
    - Coupon 10%: Giá 500 Points.
    - Coupon 20%: Giá 1000 Points.
    - Coupon 50k: Giá 300 Points.
    - *Logic*: Khi redeem, gọi sang `CommerceService` để tạo coupon code gán cho user đó.

---

## 4. Technical Implementation Steps

Module `academy` sẽ chứa `GamificationService`.

### Step 1: Tracking Service (`trackActivity`)
Tạo một method chung để các module khác gọi vào khi user hoàn thành hành động.

```typescript
// GamificationService
async trackActivity(userId: string, activity: 'LESSON_COMPLETE' | 'QUIZ_PASS', metadata: any) {
  // 1. Validate (tránh spam)
  // 2. Tính XP/Point theo Rule
  // 3. Update UserGamification (Atomic Increment)
  // 4. Write Log History
  // 5. Return result (để FE hiển thị popup: "+10 XP")
}
```

### Step 2: Streak Logic (Cron & On-Demand)
Có 2 cách xử lý Streak, chọn cách **On-Demand (Lazy)** để tiết kiệm tài nguyên:

- Khi User gọi bất kỳ API nào có auth (hoặc API `checkStreak` lúc mở app):
  - Lấy `lastActiveDate`.
  - So sánh với `Today`.
  - Nếu `Today - lastActiveDate == 1 ngày`: Streak++
  - Nếu `Today - lastActiveDate > 1 ngày`:
    - Check `streakFreeze`.
    - Nếu có: `streakFreeze--`, update `lastActiveDate = Yesterday`, coi như hôm qua đã học -> Tính lại logic trên.
    - Nếu không: Reset Streak = 1.
  - Update `lastActiveDate = Today`.

### Step 3: Integration Commerce
- API `POST /gamification/redeem`:
  - Input: `rewardId`.
  - Logic:
    - Check balance Points.
    - Trừ Points.
    - Nếu reward là `COUPON` -> Gọi `CouponService.createPrivateCoupon(userId, config)`.
    - Trả về `couponCode`.

---

## 5. API Endpoints cần thiết

Chỉ cần 4 API đơn giản cho Phase 1:

1.  `GET /gamification/me`: Lấy profile (XP, Point, Streak, Level).
2.  `GET /gamification/history`: Lịch sử nhận/tiêu điểm (phân trang).
3.  `GET /gamification/rewards`: Danh sách quà đổi được.
4.  `POST /gamification/redeem`: Đổi quà.

## 6. Tại sao thiết kế này phù hợp?

1.  **Thực tế**: Không vẽ vời nhiệm vụ ảo (như "Chia sẻ Facebook", "Kết bạn") mà tập trung vào hành động cốt lõi là **Học**.
2.  **Dễ implement**: Không cần background job phức tạp quét daily quest. Logic Streak xử lý dạng Lazy khi user request.
3.  **Có doanh thu**: Việc cho đổi Coupon kích thích user tích điểm (học nhiều) và mua khóa học (dùng coupon).
