# Checklist - Tính năng và Nghiệp vụ E-learning Còn Thiếu

> Phân tích dựa trên code trong `torii-monorepo/`. Cập nhật: Feb 2026.

---

## 1. Đa ngôn ngữ (i18n) - E-learning tiếng Nhật

- [ ] Thêm locale `ja` (tiếng Nhật) vào `packages/i18n/src/config.ts`
- [ ] Tạo `packages/i18n/src/locales/ja/admin.json`
- [ ] Tạo `packages/i18n/src/locales/ja/learner.json`
- [ ] Tạo `packages/i18n/src/locales/ja/common.json`
- [ ] Tạo `packages/i18n/src/locales/ja/translation.json`
- [ ] Tạo `packages/i18n/src/locales/ja/meet.ts` cho Live Class

---

## 2. Assignments (Bài tập) & Submissions (Bài nộp)

### Web-learner
- [ ] Tạo `apis/services/assignment-api.ts` - API client gọi `/api/assignments`, `/api/submissions`
- [ ] Trang danh sách bài tập trong khóa học: `/courses/[slug]/assignments`
- [ ] Trang nộp bài (text + upload file)
- [ ] Trang xem kết quả/chấm điểm (score, feedback)
- [ ] Xử lý lesson `contentType=assignment` trong `learn/lessons/[lessonId]/page.tsx`

### Web-admin
- [ ] Thêm menu Quản lý Assignments vào navigation
- [ ] CRUD Assignments (tạo, sửa, xóa, publish)
- [ ] UI chấm điểm Submissions (grade, feedback)
- [ ] Liên kết Assignment với Lesson/Module trong course detail

---

## 3. Quizzes (Bài kiểm tra trong khóa học)

- [ ] Thêm `courseId` vào ExamQueryDTO hoặc tạo endpoint `/api/courses/:courseId/quizzes`
- [ ] Trang `/courses/[slug]/quizzes` - thay mock data bằng API thật
- [ ] Trang `/courses/[slug]/quizzes/[quizId]` - làm bài thật (fetch quiz, start session, save answers, submit)
- [ ] Xử lý lesson `contentType=quiz` - điều hướng sang quiz tương ứng
- [ ] Trang Progress - dùng dữ liệu quiz thật thay vì mock

---

## 4. Comments trên Lesson

- [ ] Mở rộng `comment-api.ts` hỗ trợ `targetType=LESSON` và `lessonId`
- [ ] Tích hợp `CommentSection` vào tab "Thảo luận" trong `LessonContent` với `lessonId`

---

## 5. Lesson Materials & Resources

- [ ] Tạo `lesson-material-api.ts` hoặc mở rộng `lesson-api`
- [ ] Tab "Tài liệu" trong LessonContent - fetch và hiển thị `LessonMaterial` từ API
- [ ] Nút "Tải tài liệu" - link đến file thật (fileUrl từ FileAsset)

---

## 6. Notes (Ghi chú)

- [ ] Quyết định model: dùng `LessonProgress.notes` hoặc tạo model Notes riêng
- [ ] API lưu/sửa/xóa ghi chú
- [ ] Trang Notes dùng API thay vì mock data
- [ ] UI lưu ghi chú từ lesson (trong LessonContent hoặc trang lesson)

---

## 7. Feed & Cộng đồng

- [ ] Implement nút "Báo cáo" bài viết trong `feed-post-card.tsx`
- [ ] API/Handler báo cáo bài viết (report)
- [ ] Web-admin: Moderation Feed (ẩn/xóa bài vi phạm)

---

## 8. Refund & Coin (Số dư trong hệ thống)

> **Coin** ≠ Point. Coin = đơn vị thanh toán chính. **Mô hình**: User nạp tiền (1:1 VND→coin) → dùng coin mua khóa. Không mua khóa trực tiếp bằng thẻ/ngân hàng.

### Phân vai bảng – Ghi chú chi tiết

| Bảng | Vai trò | Khi nào dùng | Ghi chú |
|------|---------|--------------|---------|
| **UserCoin** | Số dư coin của user | Mỗi user 1 dòng | `userId`, `balance`, `updatedAt`. Là nguồn duy nhất cho balance hiện tại. |
| **CoinLedger** | Sổ cái biến động coin | Mọi thay đổi balance | `userId`, `amount` (+/-), `type` (top_up \| refund \| spend \| bonus…), `referenceOrderId?`, `metadata`, `createdAt`. Dùng audit, đối chiếu, lịch sử, tranh chấp. **Không gộp vào Order** vì Order = thương mại; refund/bonus không phải đơn hàng. |
| **Order** | Đơn thương mại | Mua/bán, nạp tiền | `top_up`: user nạp tiền thật. `course_purchase`: mua khóa (trả bằng coin). `gift`: tặng khóa. **Không** dùng Order cho refund – refund là event cộng coin, không phải đơn mới. |
| **Payment** | Tiền thật qua gateway | Chỉ khi có chuyển tiền thật | Gắn Order(top_up). Ghi `amount`, `gateway`, `transactionId`, `status`. Dùng đối soát ngân hàng/gateway. **Không** có Payment khi mua khóa bằng coin hay refund. |

### Luồng – Chi tiết

1. **Top-up (nạp tiền)**
   - User chọn số tiền → tạo Order(top_up, amount=VND)
   - Redirect qua gateway (VNPay, Momo…) → user thanh toán
   - Webhook/callback → tạo Payment (amount, gateway, status) gắn Order
   - Nếu success: CoinLedger(type=top_up, amount=coin, referenceOrderId) + cộng UserCoin (1:1 VND→coin)

2. **Mua khóa (spend)**
   - User chọn khóa → kiểm tra UserCoin đủ
   - Trừ UserCoin → CoinLedger(type=spend, amount, referenceOrderId) → tạo Order(course_purchase, paymentMethod=coin) + Enrollment
   - **Không** tạo Payment

3. **Refund (hoàn khóa)**
   - Admin duyệt ticket refund → xóa Enrollment
   - CoinLedger(type=refund, amount, metadata={ originalOrderId, courseId }) + cộng UserCoin
   - **Không** tạo Order, **không** Payment

### Tại sao cần CoinLedger riêng

- Order: amount có thể là VND (top-up) hoặc coin (spend) → dễ nhầm
- Refund không phải đơn hàng mới → ghi Order(orderType=coin_refund) làm rối nghĩa Order
- Cần sổ cái thuần coin: mỗi dòng = 1 biến động, dễ tổng hợp và đối chiếu
- Dễ mở rộng: bonus, referral, admin cộng… chỉ cần thêm `type` mới

### Phân biệt Coin vs Point
- **Coin**: UserCoin – từ nạp + refund, dùng mua khóa
- **Point**: UserGamification – từ gamification, dùng đổi mã giảm giá (mục 13)

### Backend – Schema
- [ ] Tạo bảng `UserCoin` (userId, balance, updatedAt) – số dư coin
- [ ] Tạo bảng `CoinLedger` – log mọi biến động: userId, amount, type (refund | top_up | spend), referenceOrderId?, metadata, createdAt
- [ ] Order: giữ cho thương mại – top_up (nạp tiền), course_purchase (mua khóa = trừ coin)
- [ ] Payment: chỉ khi có tiền thật qua gateway (top_up)
- [ ] Bỏ `coins` khỏi `UserGamification`

### Backend – Logic
- [ ] **Top-up**: User nạp tiền → Order(top_up) + Payment → tỷ lệ 1:1 (VD: 100k VND = 100 coin) → CoinLedger(top_up) + cộng UserCoin
- [ ] **Mua khóa**: User dùng coin → trừ UserCoin → Order(course_purchase, paymentMethod=coin) + Enrollment → CoinLedger(spend)
- [ ] **Refund**: Hoàn khóa → CoinLedger(refund) + cộng UserCoin (theo giá khóa đã mua)

### Web-learner
- [ ] Checkout mua khóa: chỉ thanh toán bằng coin (không còn thẻ/ngân hàng trực tiếp)
- [ ] Flow nạp coin (top-up) – nạp tiền → nhận coin 1:1 qua payment gateway
- [ ] Hiển thị số dư coin (ví)
- [ ] Lịch sử giao dịch coin (CoinLedger)
- [ ] Flow tạo ticket REFUND – hoàn khóa → nhận coin
- [ ] Thông báo refund/nạp thành công

### Web-admin
- [ ] Xem lịch sử giao dịch coin (CoinLedger) – audit

---

## 9. TODO trong Code Backend

- [ ] `course.controller.ts`: Kiểm tra lecturer được gán khóa học trước khi cho phép update
- [ ] `mcp.controller.ts`: Implement full MCP SSE Transport (hiện là placeholder)
- [ ] `learning-progress.service.ts`: Tính `currentStreak` thật thay vì placeholder 0
- [ ] `exam.service.ts`: Track time per question trong attempt

---

## 10. Nghiệp vụ E-learning tiếng Nhật

- [ ] JLPT Mock Exam - UI dedicated cho thi thử JLPT (quizType=jlpt_mock)
- [ ] Module luyện Hiragana/Katakana
- [ ] Kanji practice/drill (tách hoặc bổ sung ngoài flashcard)
- [ ] Listening section: UI audio player khi làm câu hỏi (Question metadata có audio)
- [ ] Component hiển thị Furigana cho kanji
- [ ] Xác nhận hỗ trợ Japanese IME / input
- [ ] Subscription model - flow mua gói subscription (OrderType.subscription)

---

## 11. Web-admin còn thiếu

- [ ] Quản lý Assignments (đã liệt kê ở mục 2)
- [ ] Chấm điểm Submissions (đã liệt kê ở mục 2)
- [ ] Xác minh quản lý Quiz gắn với Course (Question Pools đã có)
- [ ] Moderation Feed/Blog comments (đã liệt kê ở mục 7)
- [ ] Xử lý refund → cộng coin (đã liệt kê ở mục 8)

---

## 12. Meet (Live Class)

- [ ] i18n Meet - locale ja (đã liệt kê ở mục 1)
- [ ] Xác minh Recording playback cho học viên sau buổi học
- [ ] Cơ chế báo lỗi chất lượng video/network khi live

---

## 13. Points (Point) - Đổi mã giảm giá

> **Point** ≠ Coin. Point lấy từ **Gamification** – user kiếm point khi tương tác trên web (lesson, quiz, streak, flashcard, ...). Dùng point để đổi mã giảm giá (coupon). Log giao dịch đổi qua **Order** (tận dụng bảng có sẵn).

### Phân biệt Point vs Coin
- **Point**: từ gamification → đổi coupon
- **Coin**: từ refund + nạp → ví/số dư (mục 8)

### Backend – Schema
- [ ] Thêm field `points` vào `UserGamification` (tách khỏi coins – coins dùng cho refund/nạp)
- [ ] Thêm `pointCost` (Int) vào Coupon – coupon có thể đổi bằng point
- [ ] Thêm `OrderType.point_redemption` vào enum Order

### Backend – Flow đổi coupon (tận dụng Order)
- [ ] API đổi point → coupon: tạo `Order` với orderType=`point_redemption`, amount=0, couponId, metadata=`{ pointsSpent }` – **không tạo Payment**
- [ ] Validate: user đủ point, coupon còn slot, còn hiệu lực
- [ ] Trừ `UserGamification.points`, tăng Coupon.usageCount
- [ ] Gán coupon cho user (hoặc trả về mã để nhập lúc checkout)

### Cân bằng flow (balance)
- [ ] Định mức tích point: lesson X pt, quiz Y pt, streak Z pt/ngày, flashcard W pt, …
- [ ] pointCost của coupon tương ứng giá trị (VD: 10% giảm ≈ 100 point)
- [ ] Giới hạn point đổi/ngày hoặc limit coupon đổi bằng point

### Web-learner
- [ ] Hiển thị số dư point (header, profile)
- [ ] Trang "Đổi mã giảm giá" – danh sách coupon có pointCost, lọc theo point user có
- [ ] Flow đổi: chọn coupon → xác nhận → nhận mã (hiển thị code hoặc auto-apply lúc checkout)

### Web-admin
- [ ] Cấu hình coupon: set pointCost (0 = không đổi bằng point)

---

---

## 14. Luồng còn thiếu / Cần bổ sung

> Các luồng nghiệp vụ e-learning có thể cần thêm hoặc làm rõ.

### Thanh toán & Commerce
- [ ] **Coupon flow trong mô hình coin** (cần điều chỉnh):
  - **Checkout mua khóa**: Coupon giảm **coin** (không còn giảm VND). VD: khóa 100 coin + coupon 10% = 90 coin. Flow: chọn course → nhập/apply coupon → hiển thị coin còn phải trả → trừ coin
  - **Schema Coupon**: `discountValue` áp dụng cho coin (1:1 với VND nếu tỷ lệ nạp 1:1). Hoặc thêm field `appliesTo`: `course_price` (giảm giá khóa = giảm coin)
  - **Point đổi coupon**: Coupon nhận từ point vẫn dùng được khi checkout bằng coin (giảm coin tương ứng)
- [ ] **Coupon khi nạp** (optional): Nạp tiền + coupon tặng thêm coin? (VD: nạp 100k + coupon BONUS10 = 110 coin thay vì 100)
- [ ] **Gift course trong mô hình coin**: User dùng coin mua khóa tặng người khác. Order(gift) + trừ coin, gửi link/email cho người nhận
- [ ] **Subscription flow**: Gói tháng/năm – trừ coin định kỳ hoặc nạp tiền định kỳ → nhận quyền truy cập nhiều khóa. OrderType.subscription có trong schema, chưa có logic

### Học tập & Tiến độ
- [ ] **Enrollment expiry**: Khóa có thời hạn truy cập (VD: 6 tháng). Schema Enrollment cần `expiresAt`?
- [ ] **Course prerequisite**: Khóa B yêu cầu hoàn thành khóa A. Cần model/quan hệ
- [ ] **Lesson unlock theo thứ tự**: Bài sau chỉ mở khi hoàn thành bài trước (Lesson.isUnlocked – kiểm tra logic)
- [ ] **Re-enrollment**: User drop khóa rồi mua lại. Xử lý Enrollment unique(userId, courseId) + completionStatus=dropped

### Khuyến mãi & Growth
- [ ] **Referral / Invite learner**: User mời bạn đăng ký → cả hai nhận thưởng (coin? point?). Hiện invite chỉ dùng cho admin→lecturer/staff
- [ ] **Trial / Demo**: Dùng thử miễn phí X ngày hoặc X bài đầu
- [ ] **Course bundle**: Mua nhiều khóa cùng lúc (giảm giá)
- [ ] **Waitlist**: Khóa full → user đăng ký chờ. Schema?

### Tài khoản & Privacy
- [ ] **Delete account / GDPR**: User yêu cầu xóa tài khoản, xuất dữ liệu cá nhân
- [ ] **Notification preferences**: Cài đặt nhận email/push theo từng loại thông báo

### Khác
- [ ] **Instructor payout**: Chia doanh thu với giảng viên (nếu có)
- [ ] **Content download / Offline**: Tải bài học xuống xem offline (ít gặp trên web)

---

## Ưu tiên đề xuất

**Cao:** i18n Japanese, Quiz trong khóa học (API + UI), Lesson Comments, Lesson Materials

**Trung bình:** Assignment flow (learner + admin), Notes, Points - Đổi mã giảm giá

**Thấp:** Report Feed, Subscription model, JLPT Mock UI, Kanji/Hiragana drill
