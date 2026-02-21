# Phân Tích Nghiệp Vụ và Lỗ Hổng Logic Backend - torii-monorepo/@apps/server

Tài liệu này liệt kê các case flow nghiệp vụ còn thiếu và các lỗ hổng logic được tìm thấy sau khi phân tích mã nguồn tại `apps/server`.

## 1. Module Identity (Xác thực & Người dùng)

### 🚩 Lỗ hổng Logic & Bảo mật
*   **Thiếu Rate Limiting cho Login/Register**: Hiện tại chỉ có `resendVerification` và `forgotPassword` là có giới hạn tần suất (3 requests/hour). Các endpoint `login` và `register` không có rate limiting, dẫn đến rủi ro bị tấn công Brute Force mật khẩu hoặc Spam đăng ký hàng loạt (Account Enumeration/Resource Exhaustion).
*   **Brute Force OTP**: Mã OTP cho Mobile (6 chữ số) chỉ có thời gian hết hạn (10 phút) nhưng không giới hạn số lần thử sai. Kẻ tấn công có thể thử tất cả các tổ hợp trong vòng 10 phút để bypass xác thực email hoặc reset mật khẩu.
*   **Race Condition khi Đăng ký**: Trong `AuthService.register`, việc kiểm tra email tồn tại (`findByEmail`) và tạo người dùng mới (`create`) diễn ra không nguyên tử (non-atomic). Trong môi trường concurrent cao, hai request cùng đăng ký 1 email có thể lọt qua bước check và gây lỗi database không đáng có nếu không được xử lý try-catch cụ thể.
*   **Bypass 2FA (Reuse Temp Token)**: Trong `verify2FA`, `tempToken` chỉ bị xóa khi xác thực thành công. Nếu người dùng nhập sai OTP, token vẫn còn hiệu lực trong Redis (5 phút), cho phép thử lại nhiều lần mà không bị revoke token tạm.
*   **Admin Login quá lỏng lẻo**: `adminLogin` chỉ kiểm tra xem người dùng có bất kỳ quyền (permission) nào không. Nó nên kiểm tra các quyền cụ thể hoặc Role (ADMIN/STAFF) thay vì chỉ kiểm tra sự tồn tại của mảng permissions.

### 🔄 Case Flow còn thiếu
*   **Lockout Policy**: Chưa có cơ chế khóa tài khoản tạm thời sau N lần đăng nhập sai (ví dụ: khóa 15 phút sau 5 lần sai).
*   **Session Management**: Thiếu cơ chế tự động revoke các session cũ khi thay đổi mật khẩu quan trọng (mặc dù có `revokeAllUserSessions` nhưng cần đảm bảo nó được gọi ở mọi nơi cần thiết như update email/password).

---

## 2. Module Learning (Học tập)

### 🚩 Lỗ hổng Logic & Nghiệp vụ
*   **⚠️ Enrollment không kiểm tra thanh toán (Critical)**: Trong `EnrollmentService.create`, hệ thống tạo bản ghi enrollment ngay lập tức sau khi check course tồn tại. Không thấy có bước kiểm tra xem người dùng đã thanh toán thành công thông qua Order/Payment Service chưa (đối với các khóa học có phí).
*   **Inconsistent Curriculum Unlocking**: Tại `CourseService.getCurriculum`, việc quyết định có hiện `videoUrl` hay không dựa trên `lesson.isPreview || isEnrolled`. Tuy nhiên, DTO vẫn trả về `isUnlocked` trực tiếp từ database. Nếu database set `isUnlocked: true` nhưng `isEnrolled: false`, user có thể thấy trạng thái là đã mở khóa nhưng không xem được video, gây mâu thuẫn UI.

### 🔄 Case Flow còn thiếu
*   **Trạng thái thanh toán trong Enrollment**: Enrollment nên có trạng thái `PENDING_PAYMENT` và chỉ chuyển thành `ACTIVE` (hoặc `IN_PROGRESS`) sau khi có sự kiện thanh toán thành công từ hệ thống Payment.
*   **Hỗ trợ Course Bundle/Subscription**: Hiện tại hệ thống chỉ hỗ trợ mua lẻ từng khóa học. Thiếu nghiệp vụ cho việc mua theo gói hoặc đăng ký thành viên (Subscription).
*   **Gia hạn khóa học**: Nếu khóa học có thời hạn (ví dụ: `durationWeeks`), hệ thống chưa có logic xử lý khi hết hạn (expire enrollment).

---

## 3. Module Meet (Họp trực tuyến)

### 🚩 Lỗ hổng Logic
*   **Quyền tạo phòng họp (Room Creation)**: `RoomCreateService.createRoom` cho phép tạo phòng với bất kỳ `roomId` nào mà không kiểm tra xem người dùng (Lecturer) đó có thực sự được phép tạo phòng cho khóa học/buổi học đó không. Bất kỳ ai gọi được NATS cmd `meet.createRoom` đều có thể tạo vô số phòng ảo.
*   **SSRF qua WebhookUrl**: `webhookUrl` trong metadata được nhận trực tiếp từ user request. Nếu không được validate, hệ thống có thể bị lợi dụng để thực hiện Server-Side Request Forgery khi gửi thông báo sự kiện đến các IP nội bộ.

### 🔄 Case Flow còn thiếu
*   **Giới hạn số phòng active**: Thiếu logic giới hạn một Lecturer chỉ được phép có tối đa N phòng họp đang diễn ra đồng thời.
*   **Tự động kết thúc phòng**: Cần flow kiểm tra và kết thúc các phòng họp bị "treo" hoặc quá thời gian quy định một cách chủ động hơn (mặc dù đã có `room-duration.service.ts` nhưng cần đảm bảo tích hợp chặt chẽ với lịch dạy).

---

## 4. Module Billing (Thanh toán)

### 📊 Phân biệt Order vs Payment
Hệ thống hiện tại đang tách biệt hai thực thể này để đảm bảo tính chính xác về kế toán:
*   **Order (Đơn hàng/Hóa đơn)**: Đại diện cho **ý định mua hàng**. Nó xác định người dùng muốn mua gì (khóa học, gói coin) và tổng tiền cần thanh toán. Đây là thực thể quản lý trạng thái (Pending -> Completed).
*   **Payment (Giao dịch/Biên lai)**: Đại diện cho **dòng tiền thực tế**. Khi Gateway (SePay, PayOS) thông báo nhận được tiền, một bản ghi Payment sẽ được tạo và liên kết tới Order. Một Order có thể liên kết với nhiều Payment (trường hợp thanh toán lỗi/thử lại).

### 🚩 Lỗ hổng Logic & Nghiệp vụ
*   **Thiếu Lịch sử Số dư (Balance History)**: Hệ thống có bảng `UserBalance` để lưu số dư coin, nhưng chưa có lịch sử log lại chi tiết.
    *   **💡 Gợi ý**: Không nên gộp chung vào bảng `Order`/`Payment` vì `Order` chỉ nên dùng cho giao dịch tiền thật (VND). Các biến động Coin nội bộ (được thưởng, hoàn tiền từ ticket, dùng coin mua khóa học) nên được quản lý ở một bảng riêng như `BalanceTransaction`. Bảng này có thể liên kết tới `OrderId` nếu đó là giao dịch nạp coin.

### 🔄 Case Flow còn thiếu
*   **Quy trình hoàn tiền (Refund Flow)**:
    *   **Hiện trạng**: Đã có logic cơ bản trong `TicketService.updateTicketStatus` khi duyệt ticket loại `REFUND`. Logic này thực hiện: (1) Xóa enrollment, (2) Cộng lại coin vào `UserBalance`, (3) Log Audit, (4) Gửi In-app notification.
    *   **Thiếu sót**: 
        *   **Email Notification**: Chưa có logic gửi email thông báo khi refund được duyệt (trong `EmailService` chưa có template và `TicketService` chưa gọi lệnh gửi email).
        *   **Tự động hóa**: Refund hiện tại phụ thuộc hoàn toàn vào việc Admin duyệt Ticket thủ công. Chưa có cơ chế refund tự động (ví dụ: tự hoàn tiền nếu hủy khóa học trong 24h đầu).

## 5. Đề xuất: Hệ thống Báo cáo Tài chính (Financial Reporting)

Việc bổ sung tính năng **Export báo cáo tài chính ra file Excel** là hoàn toàn hợp lý và cần thiết cho một nền tảng E-learning có giao dịch tiền tệ/coin.

### 🚩 Tại sao cần thiết?
*   **Minh bạch (Transparency)**: Giúp Admin dễ dàng đối soát giữa doanh thu thực tế (vnb) và lượng coin đang lưu thông trong hệ thống.
*   **Quản lý vận hành**: Theo dõi hiệu suất bán hàng của từng khóa học, doanh thu theo thời gian (tháng/quý).
*   **Hỗ trợ Kế toán/Thuế**: Cung cấp dữ liệu thô để xử lý các báo cáo thuế và tài chính định kỳ.

### 🔄 Các dữ liệu cần Export:
*   **Báo cáo Đơn hàng (Orders Report)**: Mã đơn hàng, Người mua, Số tiền, Trạng thái, Phương thức thanh toán, Thời gian.
*   **Báo cáo Biến động số dư (Balance History Report)**: Người dùng, Loại biến động (Nạp/Trừ/Hoàn), Số lượng coin, Lý do, Thời gian.
*   **Báo cáo Doanh thu Khóa học**: Tên khóa học, Số lượng enrollment, Tổng doanh thu coin/tiền mặt của khóa đó.

### 🛠️ Gợi ý triển khai:
*   **Thư viện**: Sử dụng `exceljs` hoặc `xlsx-populate` ở phía backend (NestJS) để generate file buffer.
*   **Service**: Tạo một `ReportService` riêng để aggregate dữ liệu từ các module Billing, Learning, và Identity.
*   **Workflow**: Admin chọn khoảng thời gian -> Backend query DB -> Generate Excel -> Download trực tiếp từ Admin Dashboard.

## 6. Kiến trúc: Quản lý Đa tiền tệ (Coin vs. Point)

Với câu hỏi về việc dùng chung hay tách riêng log cho **Coin (từ Refund/Nạp tiền)** và **Point (từ Gamification)**, đây là lời khuyên về mặt kiến trúc:

### 🚩 Tại sao nên TÁCH RIÊNG (Recommended)?

Mặc dù có vẻ giống nhau là "biến động số dư", nhưng mục đích và dữ liệu đặc thù của chúng rất khác nhau:

1.  **Tính chất dữ liệu (Audit Requirement)**:
    *   **Coin**: Đây là tiền tệ có giá trị tương đương tiền thật (được quy đổi từ đơn hàng hoặc hoàn tiền). Cần độ chính xác tuyệt đối, log cực kỳ chặt chẽ vì liên quan đến tài chính, thuế và quyền lợi pháp lý của người dùng.
    *   **Point**: Đây là tiền tệ trung thành (Loyalty/Gamification). Tần suất biến động cực kỳ lớn (mỗi khi trả lời quiz, học bài, streak...). Log này mang tính chất thống kê hiệu suất học tập hơn là tài chính.
2.  **Hiệu suất (Scalability)**:
    *   Số lượng bản ghi log Point sẽ lớn hơn gấp nhiều lần so với Coin. Nếu gộp chung, bảng `BalanceTransaction` sẽ bị phình to rất nhanh, làm chậm các truy vấn liên quan đến đối soát tài chính quan trọng.
3.  **Metadata đi kèm**:
    *   Coin cần: `orderId`, `ticketId`, `paymentGateway`.
    *   Point cần: `activityType`, `achievementId`, `streakDays`.

### 🛠️ Gợi ý cấu trúc:

*   **Bảng `CoinTransaction`**: Chuyên log cho `UserBalance`. Dùng để báo cáo tài chính, export Excel cho kế toán.
*   **Bảng `GamificationHistory`: Chuyên log cho `points`. Dùng để hiển thị bảng xếp hạng, lịch sử hoạt động cá nhân.

**💡 Kết luận**: Bạn nên tách làm 2 bảng riêng để đảm bảo: **"Financial Ledger" (Coin) luôn sạch sẽ, chính xác** và **"Engagement Log" (Point) linh hoạt, chịu tải cao**.

## 7. Tính năng: Đổi Coupon từ Point (Redeem Coupon)

### 🚩 Cách đơn giản và tối ưu nhất (Simple & Optimal)

Để giải quyết vấn đề **bảo mật (tặng/bán mã)** và **quản lý sự kiện hệ thống**, luồng "Đổi điểm sinh mã" sẽ được tinh chỉnh như sau:

**1. Phân loại Coupon:**
*   **Coupon Công khai (Event Coupons)**: Do hệ thống tạo cho các chiến dịch (Vd: `TET2026`). 
    - `userId: null`. Ai cũng có thể dùng mã này (theo `usageLimit` chung).
*   **Coupon Cá nhân (Redeemed Coupons)**: Sinh ra khi đổi điểm.
    - `userId: {ID của người đổi}`. **Chỉ duy nhất người này** mới có quyền sử dụng mã này. Nếu người khác Copy mã dán vào, hệ thống sẽ báo lỗi *"Mã giảm giá không thuộc về bạn"*.

**2. Luồng nghiệp vụ bảo mật:**
*   **Bước 1**: Người dùng đổi 100 điểm.
*   **Bước 2**: Backend tạo một bản ghi Coupon mới:
    - `code`: Một chuỗi ngẫu nhiên (Vd: `ABC-XYZ`).
    - `userId`: Gán cứng ID của người đổi.
    - `userUsageLimit: 1`.
*   **Bước 3**: Khi Checkout, `CouponService` kiểm tra: `if (coupon.userId && coupon.userId !== currentUserId) throw Error`.

**3. Tại sao cách này tối ưu?**
*   **Tính hợp lý (Logical Clarity)**: Dùng `null` để đại diện cho "không thuộc về ai cụ thể" là chuẩn thiết kế Cơ sở dữ liệu quan hệ. Nó tách biệt rõ ràng giữa mã Public (ai cũng dùng được) và mã Private (chỉ đích danh).
*   **Hiệu suất (Performance)**: 
    - Các DB hiện đại (PostgreSQL) xử lý cột `nullable` rất tốt, không tốn tài nguyên lưu trữ nếu giá trị là `null`.
    - Bạn có thể đánh Index trên cột `userId`. Truy vấn `where userId = '...' OR userId IS NULL` sẽ cực kỳ nhanh.
*   **Linh hoạt**: Bạn không cần tạo thêm bảng phụ hay các ID hệ thống giả, giữ cho Schema đơn giản và dễ bảo trì.
*   **Refund/Cancel Order**: Thiếu quy trình xử lý hoàn tiền hoặc hủy đơn hàng và đồng bộ việc thu hồi quyền truy cập (un-enroll) khóa học.
## 8. Phân tích các luồng nghiệp vụ E-learning còn thiếu

Sau khi rà soát toàn bộ các module core (`Learning`, `Billing`, `Communication`, `Gamification`), đây là những lỗ hổng nghiệp vụ quan trọng cần bổ sung để hệ thống vận hành chuyên nghiệp:

### 💰 8.1. Tài chính & Doanh thu (Monetization)
*   **Instructor Revenue Sharing (Chia sẻ doanh thu)**: 
    - Hiện tại chỉ có `billing` cho người học mua khóa học, chưa có logic tính toán hoa hồng (Commission) cho giảng viên.
    - Thiếu bảng `InstructorWallet` hoặc `EarningsLedger` để quản lý số dư của giảng viên.
*   **Payout Workflow (Quy trình thanh toán)**: Chưa có logic cho giảng viên yêu cầu rút tiền (Withdrawal Request) và Admin phê duyệt.
*   **Affiliate/Referral**: Thiếu cơ chế thưởng cho người dùng khi giới thiệu khóa học mới.

### 🎓 8.2. Nghiệp vụ Học tập nâng cao (Advanced Learning)
*   **Chỉnh sửa Review**: `ReviewService.create` hiện cho phép bất kỳ ai cũng có thể review khóa học mà **không kiểm tra đã đăng ký (Enrollment) hay chưa**. Đây là lỗi logic lớn dễ dẫn đến "spam review".
*   **Assignment Peer-Review**: Module `assignment` mới chỉ hỗ trợ Giảng viên chấm điểm (`grade`), chưa có luồng Học viên chấm chéo lẫn nhau.
*   **Exam Retake Cooling Period**: Đã có `maxAttempts` nhưng thiếu thời gian chờ giữa các lần thi (Vd: Phải đợi 24h mới được thi lại) để đảm bảo chất lượng học tập.

### 📢 8.3. Tương tác & Thông báo (Engagement)
*   **Communication Channels**: 
    - Thiếu kênh chat riêng (Private Message) giữa Mentors và Học viên.
    - Thiếu thông báo đẩy (Push/Email) khi có bài học mới trong khóa học đã tham gia (`Course Announcements`).
*   **Study Reminders**: Chưa có logic tự động nhắc nhở học tập nếu học viên "lười" không vào app quá X ngày.

### 📊 8.4. Analytics & Roadmap
*   **Admin Dashboard**: Thiếu logic tổng hợp báo cáo doanh thu theo tháng, thống kê khóa học bán chạy nhất (Best-sellers).
*   **Personalized Roadmap**: Hệ thống chưa có logic gợi ý khóa học tiếp theo dựa trên tiến độ học tập (Progress) hiện tại của user.

**💡 Lời khuyên ưu tiên**: Bạn nên ưu tiên xử lý **Enrollment check trong Review** (vì dễ làm nhưng ảnh hưởng lớn đến uy tín nội dung) và **Revenue Sharing** (nếu bạn định làm nền tảng cho nhiều giảng viên khác nhau).

### 9. Phân tích chuyên sâu: Các luồng nội dung và Marketing còn thiếu
Dựa trên rà soát kiến trúc Prisma và Service logic, đây là các lỗ hổng cấp cao hơn:

#### 9.1. Kiểm soát truy cập nội dung (Drip Content & Prerequisites)
*   **Drip Content (Mở khóa theo lộ trình)**: Hiện tại `Lesson.isUnlocked` chỉ là một giá trị tĩnh. Hệ thống thiếu logic mở khóa tự động theo thời gian (Vd: Mỗi ngày mở 1 bài) hoặc theo tiến độ (Vd: Phải xong bài 1 mới hiện bài 2).
*   **Học phần tiên quyết (Prerequisites)**: `Course.requirements` hiện chỉ là thông tin hiển thị. Thiếu logic chặn đăng ký hoặc chặn học nếu học viên chưa hoàn thành khóa học tiên quyết (`Prerequisite Enforcement`).

#### 9.2. Công cụ Marketing & Bán hàng (Sales Strategy)
*   **Course Bundles (Combo khóa học)**: Chưa có mô hình `Bundle` để bán gộp nhiều khóa học với một mức giá ưu đãi.
*   **Phiên bản nội dung (Versioning)**: Giảng viên chưa có cơ chế lưu bản nháp (Draft) cho toàn bộ khóa học để chỉnh sửa mà không ảnh hưởng đến phiên bản đang chạy.

#### 9.3. Hệ sinh thái xã hội (Social Learning)
*   **Hành lang học tập (Lesson Forum/QA)**: Comment hiện tại chỉ là luồng tuyến tính. Thiếu diễn đàn thảo luận chuyên biệt cho từng khóa học hoặc tính năng "Hỏi riêng giảng viên".
*   **Hồ sơ năng lực (Student Portfolio)**: Thiếu trang cá nhân công khai để học viên khoe các chứng chỉ và thành tựu đã đạt được (gamification badges).

#### 9.4. Quản lý thời hạn (Access Expiration)
*   **Hết hạn khóa học**: `Enrollment` hiện tại là vĩnh viễn (không có `expiresAt`). Hệ thống thiếu cơ chế quản lý gói học theo tháng/năm hoặc thu hồi quyền truy cập sau một khoảng thời gian nhất định.

### 10. Đề xuất lộ trình cập nhật kiến trúc (Strategic Roadmap)

| Hạng mục | Giải pháp đề xuất | Độ quan trọng |
| :--- | :--- | :--- |
| **Bảo mật Review** | Thêm check `Enrollment` trong `ReviewService`. | 🔴 Khẩn cấp |
| **Doanh thu** | Hiện thực hóa module `revenue` (Commission Logic). | 🟠 Cao |
| **Drip Access** | Thêm bảng `CourseSequence` hoặc field `unlockAfterDays`. | 🟡 Trung bình |
| **Marketing** | Thêm model `CourseBundle` và `ReferralService`. | 🟡 Trung bình |
| **Portfolio** | Xây dựng API và giao diện `PublicProfile`. | 🔵 Thấp |

### 11. Phân tích luồng đặc thù cho Trung tâm Nhật ngữ (Japanese Center)
Để vận hành như một Trung tâm Nhật ngữ chuyên nghiệp, hệ thống hiện có các lỗ hổng chuyên sâu sau:

#### 11.1. Hệ thống thi thử JLPT Mock Test (Chuyên nghiệp)
*   **Phân bổ thời gian theo Section**: JLPT thật chia thời gian rất nghiêm ngặt (Vd: N2 có 105p cho [Goi-Bunpou-Dokkai] và 50p cho [Choukai]). Hiện tại hệ thống chỉ có một bộ đếm giờ tổng (`totalTime`). Thiếu logic chặn chuyển section hoặc kết thúc section khi hết giờ phần đó.
*   **Choukai (Nghe hiểu) Play-once**: Trong kỳ thi JLPT, file nghe chỉ được phát 1 lần duy nhất. Hiện tại, `audioUrl` truyền về client như một file media thông thường, học viên có thể tua/nghe lại —> không phản ánh đúng năng lực thi cử.
*   **Scaled Scoring**: Điểm JLPT không tính bằng tổng điểm thô mà tính theo "điểm chuẩn hóa". Hệ thống thiếu thuật toán trọng số để đánh giá độ khó của câu hỏi và đưa ra điểm số ước lượng thực tế.

#### 11.2. Kỹ năng Nói (Kaiwa) và Viết (Kanji Writing)
*   **Kaiwa & Shadowing**: Hoàn toàn thiếu tính năng ghi âm và chấm điểm phát âm (AI Speech-to-Text) hoặc giáo viên nhận xét bài nói.
*   **Stroke Order (Thứ tự nét vẽ)**: Flashcard đã có Kanji/Furigana nhưng thiếu hướng dẫn thứ tự nét vẽ và tính năng "Tập viết" trên Canvas.

#### 11.3. Hệ thống kiểm tra đầu vào (Placement Test)
*   **Chẩn đoán cấp độ**: Thiếu luồng thi đầu vào để tự động gợi ý lộ trình học (Vd: Thi 30 câu tổng hợp -> Gợi ý học N3). Hiện tại user phải tự chọn cấp độ.

#### 11.4. Tăng cường Từ vựng & Kanji
*   **Dictionary Integration**: Học viên không thể tra cứu nhanh từ vựng từ bài học/bài đọc (Search-on-page) kết nối với database từ điển nội bộ.
*   **Audio Drilling**: Flashcard chưa có chế độ "Rảnh tay" (Auto-play audio bài học khi đang đi tàu/xe) - một nhu cầu cực lớn của người học ngoại ngữ.

### 🎯 Tổng kết đề xuất cho Trung tâm Nhật ngữ:
1.  **Ưu tiên 1**: Hiện thực hóa **Section Timer** và **Listening Player (No-rewind)** trong Mock Test.
2.  **Ưu tiên 2**: Thêm tính năng **Ghi âm bài tập** (Submission Audio) cho các lớp Kaiwa.
3.  **Ưu tiên 3**: Tích hợp **Canvas tập viết Kanji** vào module Flashcard.

### 12. Phân tích Chuyên sâu: Lõi Hệ thống Khóa học (Course Core Module)
Sau khi dive-deep vào `CourseService`, `LessonService` và kiến trúc `Prisma`, tôi phát hiện các vấn đề nghiêm trọng về logic cốt lõi:

#### 12.1. Lỗ hổng Bảo mật Nội dung (Content Protection Leak)
*   **Chỉ bảo vệ Video**: `LessonService.findOne` chỉ chặn `videoUrl` nếu chưa enrollment. 
*   **Leak Article & Materials**: Toàn bộ nội dung `articleContent` (bài viết chuyên sâu) và `LessonMaterial` (file PDF, slides, tài liệu đính kèm) **KHÔNG được kiểm tra quyền truy cập**. Chỉ cần có ID bài học, user chưa mua khóa học vẫn có thể đọc toàn bộ tài liệu và bài giảng văn bản.

#### 12.2. Bug Logic Thống kê (Stats Recalculation Bug)
*   **Bỏ sót Quiz**: Hàm `recalculateStats` trong `CourseService` chỉ đếm `totalLessons`. Mặc dù model `Course` có trường `totalQuizzes`, hệ thống hiện đang bỏ sót hoàn toàn việc cập nhật số lượng bài kiểm tra, dẫn đến thông tin hiển thị ở trang Landing Page bị sai lệch.
*   **Chỉ đếm Published**: Hệ thống chỉ đếm các bài học ở trạng thái `published`. Điều này đúng cho học viên, nhưng Admin thiếu một bộ đếm tổng thể (bao gồm cả Draft) để quản lý khối lượng công việc.

#### 12.3. Hạn chế về Quản lý và Phân loại (Taxonomy & Management)
*   **Thiếu Category Model**: Khóa học chỉ phân loại dựa trên `JlptLevel` và `tags` (mảng string). Thiếu một hệ thống `Category` phân cấp (Vd: Tiếng Nhật Giao tiếp -> Sơ cấp -> Kaiwa thực dụng). Điều này sẽ gây khó khăn khi số lượng khóa học tăng lên hàng trăm.
*   **Permanent Enrollment**: `Enrollment` không có ngày hết hạn (`expiresAt`). Điều này ngăn cản việc bán khóa học theo thời hạn (Vd: Gói 6 tháng) hoặc mô hình Subscription.
*   **Hạn chế của mô hình hiện tại (Live Editing)**: Hiện tại, mọi thay đổi qua `CourseService.update`, `ModuleService.update` hay `LessonService.update` đều tác động trực tiếp vào Database bản "Live". 
*   **Vấn đề phát sinh**: 
    *   **Trải nghiệm học viên**: Nếu giảng viên đang cập nhật giáo trình (thêm 5 bài mới, xóa 2 bài cũ), học viên đang học sẽ thấy nội dung nhảy bậc, thiếu đồng nhất trong quá trình giảng viên thao tác.
    *   **Không có bản Draft tổng thể**: Không thể thay đổi toàn bộ Curriculum trong một không gian riêng (Staging) để review/duyệt trước khi "Publish" tất cả thay đổi cùng lúc.
    *   **Ảnh hưởng dữ liệu cũ**: Không có snapshot phiên bản (V1, V2). Nếu học viên đã hoàn thành khóa học ở V1, khi giảng viên thay đổi cấu trúc ở V2, tiến độ học tập (`LessonProgress`) có thể bị lỗi hoặc không còn chính xác.

#### 12.4. Live Course Automation
*   **Schedule & Session**: Kết nối giữa `TeachingSchedule` (Lịch dạy cố định) và `LiveSession` (Phòng học trực tuyến) còn lỏng lẻo. Thiếu logic tự động tạo phòng họp hoặc thông báo trước giờ học dựa trên lịch dạy đã đăng ký.

### 🎯 Đề xuất bổ sung cho Hệ thống Lõi:
1.  **Sửa lỗi bảo mật**: Áp dụng Enrollment Check cho cả `articleContent` và `LessonMaterial`.
2.  **Fix Stats**: Cập nhật `recalculateStats` để đếm cả `Quiz` thuộc khóa học.
3.  **Nâng cấp Taxonomy**: Chuyển từ `tags` sang model `Category` chuyên nghiệp.

### 14. Đề xuất Hướng triển khai Hoàn chỉnh (Comprehensive Implementation Plan)
Để đảm bảo tính chuyên nghiệp và ổn định lâu dài, hệ thống cần triển khai phương án hoàn chỉnh ngay từ đầu:

#### 14.1. Hệ thống Course Versioning Snapshot (Bản sao phiên bản)
Thay vì sửa trực tiếp, hệ thống sẽ hoạt động theo mô hình **Snapshot**:
*   **Cấu trúc Database mới**:
    *   `CourseVersion { id, courseId, versionTag, curriculumSnapshot (JSON), publishedAt }`.
    *   `Enrollment` sẽ tham chiếu đến `versionId` thay vì chỉ `courseId`.
*   **Luồng hoạt động**:
    1.  **Drafting**: Giảng viên có một không gian soạn thảo riêng (Staging) lưu trong các bảng Module/Lesson hiện tại nhưng ở trạng thái `isDraft`.
    2.  **Versioning**: Khi nhấn "Publish", hệ thống thực hiện:
        *   Tạo một bản ghi `CourseVersion`.
        *   Serialize toàn bộ cấu trúc Module -> Lesson -> Quiz thành một bản snapshot JSON (không phụ thuộc vào việc xóa/sửa ID sau này).
        *   Cập nhật `versionTag` (V1.0, V1.1...).
    3.  **Delivery**: Khi học viên vào học, hệ thống dựa vào `Enrollment.versionId` để render đúng nội dung bài dạy tại thời điểm họ đăng ký. Nếu khóa học có bản cập nhật mới (V2), học viên sẽ nhận được thông báo: "Có phiên bản bài giảng mới, bạn có muốn cập nhật không?".
*   **Lợi ích**: Bảo vệ tuyệt đối tiến độ học tập (Progress) của học viên cũ và cho phép giảng viên "Đại tu" giáo trình mà không lo làm hỏng dữ liệu.

#### 14.2. Cơ chế Bảo mật Nội dung Đa lớp (Multi-layer Protection)
*   **Content Guard Service**: Xây dựng một service tập trung kiểm tra quyền truy cập khóa học.
*   **Triển khai**:
    *   Chặn toàn bộ `articleContent`, `videoUrl` và `LessonMaterial` ở cấp độ DTO nếu user chưa mua khóa học.
    *   Chỉ mở khóa nội dung nếu (`isFree = true`) HOẶC (`isPreview = true`) HOẶC (`isEnrolled = true`).
    *   Dùng **Signed URLs** (URL có thời hạn) cho toàn bộ tài liệu PDF/S3 để tránh việc copy link chia sẻ ra ngoài.

#### 14.3. Taxonomy & Analytics Core
*   **Category System**: Triển khai model `Category` phân cấp (Nested Set hoặc ParentId) ngay lập tức. Gắn UUID cho Category để đảm bảo link SEO bền vững.
*   **Stats Engine**: Thay vì đếm trực tiếp trong Service, hãy dùng **Prisma Middleware** hoặc **Database Triggers** để tự động cập nhật `totalLessons`, `totalQuizzes` vào bảng `Course` mỗi khi có thay đổi nội dung. Điều này giúp tăng tốc độ truy vấn Landing Page.

#### 14.4. Subscription & Access Control
*   **Access Expiration**: Thêm trường `validUntil` vào `Enrollment`. 
*   **Automation**: Viết một Background Job (Worker) kiểm tra hàng ngày để tự động thu hồi quyền truy cập (set status `expired`) khi hết hạn gói học.

### 15. Chi tiết Kỹ thuật: Schema & Logic Structure
Dưới đây là thiết kế chi tiết để bạn có thể bắt tay vào triển khai ngay:

#### 15.1. Cấu trúc Prisma Schema (Đề xuất)
```prisma
// 1. Model Danh mục mới
model Category {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name      String   @db.VarChar(100)
  slug      String   @unique @db.VarChar(100)
  parentId  String?  @map("parent_id") @db.Uuid
  icon      String?  @db.VarChar(255)
  order     Int      @default(0)
  
  parent    Category?  @relation("SubCategories", fields: [parentId], references: [id])
  children  Category[] @relation("SubCategories")
  courses   Course[]

  @@map("categories")
}

// 2. Model Versioning mới
model CourseVersion {
  id                 String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  courseId           String   @map("course_id") @db.Uuid
  versionTag         String   @map("version_tag") @db.VarChar(20) // v1.0, v1.1
  curriculumSnapshot Json     @map("curriculum_snapshot") @db.JsonB // Lưu mảng Module + Lesson
  changelog          String?  @db.Text
  publishedAt        DateTime @default(now()) @map("published_at")

  course             Course       @relation(fields: [courseId], references: [id])
  enrollments        Enrollment[]

  @@map("course_versions")
}

// 3. Cập nhật Enrollment
model Enrollment {
  // ... các trường cũ
  versionId    String?   @map("version_id") @db.Uuid
  validUntil   DateTime? @map("valid_until")
  
  version      CourseVersion? @relation(fields: [versionId], references: [id])
}
```

#### 15.2. Cấu trúc Logic (Application Flow)

**A. Luồng Soạn thảo & Xuất bản (Admin Side):**
1.  **`CourseService.saveStaging`**: Lưu các thay đổi vào bảng `Module`/`Lesson` gốc với flag `status = 'draft'`.
2.  **`CourseService.publishVersion`**:
    *   BƯỚC 1: Thu thập toàn bộ `Modules` -> `Lessons` -> `Materials` -> `Quizzes` của Course đó.
    *   BƯỚC 2: Chuyển đổi (Serialize) chúng thành một cấu trúc lồng nhau (Nested JSON).
    *   BƯỚC 3: Lưu vào `CourseVersion`.
    *   BƯỚC 4: Cập nhật `Course.currentVersionId` để các học viên mới đăng ký sẽ nhận version này.

**B. Luồng Học tập (Student Side):**
1.  **`LearningService.getCurriculum`**:
    *   Nếu `Enrollment.versionId` tồn tại -> Parse dữ liệu từ `curriculumSnapshot` của Version đó để hiển thị.
    *   **Lợi ích**: Dù Admin có xóa bài học A trên database chính, bài học A vẫn nằm trong Snapshot JSON của học viên cũ -> **Không bao giờ bị lỗi 404 giáo trình**.

**C. Luồng Bảo mật (Content Guard):**
```typescript
async canAccessLesson(userId: string, lessonId: string) {
  const lesson = await this.lessonRepository.findById(lessonId);
  if (lesson.isFree || lesson.isPreview) return true;

  const enrollment = await this.enrollmentRepository.findActive(userId, lesson.courseId);
  if (!enrollment) throw new ForbiddenException('Bạn cần mua khóa học');
  
  if (enrollment.validUntil && enrollment.validUntil < new Date()) {
     throw new ForbiddenException('Khóa học đã hết hạn');
  }
  return true;
}
```

### 13. Lưu ý Kỹ thuật: Kiến trúc Tài liệu bài học (LessonMaterial vs FileAsset)
Dựa trên rà soát kiến trúc Prisma, đây là các ghi chú quan trọng về tính toàn vẹn dữ liệu:

#### 13.1. Tại sao cần tách riêng?
*   **Phân tách trách nhiệm**: `FileAsset` quản lý file vật lý (S3 URL, size, mime-type). `LessonMaterial` quản lý ngữ cảnh sư phạm (bài học nào sử dụng, thứ tự hiển thị, tiêu đề).
*   **Tái sử dụng (Reusability)**: Một file trong `FileAsset` có thể được gắn vào nhiều bài học khác nhau thông qua bảng trung gian `LessonMaterial` mà không gây dư thừa dữ liệu.
*   **Tránh "phình" bảng**: Giữ cho bảng `FileAsset` sạch sẽ, không phải chứa các cột `NULL` liên quan đến logic bài học cho các file khác (avatar, logo...).

#### 13.2. Cơ chế bảo vệ dữ liệu khi Xóa (Deletion Integrity)
*   **Xóa Lesson**: Áp dụng `onDelete: Cascade`. Khi xóa một Bài học, hệ thống chỉ xóa "mối liên kết" trong bảng `LessonMaterial`. **File gốc trong `FileAsset` vẫn được giữ lại**, đảm bảo các bài học khác đang dùng chung file đó không bị lỗi.
*   **Xóa FileAsset**: Áp dụng `onDelete: Restrict`. Hệ thống **chặn việc xóa file** nếu vẫn còn ít nhất một bài học đang liên kết đến nó. Đây là chốt chặn an toàn cực kỳ quan trọng để giảng viên không lỡ tay làm hỏng bài giảng của người khác.

#### 13.3. Đề xuất cải thiện
*   **Orphan Files Cleanup**: Cần một Job định kỳ (Cron job) để quét các `FileAsset` không còn được trỏ bởi bất kỳ module nào (Orphaned assets) và xóa chúng khỏi S3/DB để tiết kiệm chi phí.
