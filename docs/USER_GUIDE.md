# CAPSTONE PROJECT REPORT – Software User Guides
## Torii Nihongo – Nền tảng Học tiếng Nhật Trực tuyến
### PHẦN 1: Tổng quan · Xác thực · Trang công khai · Khóa học

> **Phiên bản**: 1.0 | **Ngày**: 02/2026 | **Nhóm**: Torii Nihongo Team

---

## I. Tổng quan hệ thống

**Torii Nihongo** là nền tảng học tiếng Nhật trực tuyến tích hợp LMS, Live Class WebRTC và AI Tutor, được xây dựng theo kiến trúc **Microservices** với 8 service độc lập.

### Địa chỉ truy cập

| Ứng dụng | URL | Dành cho |
|---|---|---|
| Nền tảng học tập | https://app.torii.sbs | Học viên |
| Lớp học trực tuyến | https://meet.torii.sbs | Học viên & Giảng viên |
| Hệ thống quản trị | https://admin.torii.sbs | Admin & Giảng viên |
| Backend API Gateway | https://api.torii.sbs | Hệ thống nội bộ |

### Các vai trò (Role)

| Vai trò | Mô tả |
|---|---|
| **Admin** | Toàn quyền hệ thống |
| **Staff** | Quản lý nội dung, hỗ trợ học viên |
| **Lecturer** | Tạo và quản lý khóa học được phân công |
| **Learner** | Học tập, mua khóa học |

### Kiến trúc microservices

| Service | Port | Chức năng |
|---|---|---|
| Gateway | 8080 | Entry point, Auth Guard, Routing |
| Identity | 8081 | Đăng nhập, OAuth, 2FA, Thanh toán |
| Learning | 8082 | LMS, Thi cử, Flashcard, Blog |
| Communication | 8083 | Email, Push Notification |
| Storage | 8085 | S3/R2 File Upload |
| Gamification | NATS | Streak, XP, Huy hiệu |
| Agents | 8090 | AI Sensei, Analytics |
| Meet | 8091 | WebRTC Live Class (LiveKit) |

---

## II. Yêu cầu hệ thống

| Yêu cầu | Tối thiểu | Khuyến nghị |
|---|---|---|
| Trình duyệt | Chrome 90+, Firefox 88+ | Chrome mới nhất |
| Kết nối | 5 Mbps | 10+ Mbps (cho Live Class) |
| Camera & Micro | — | Bắt buộc khi dùng Meet |

### Cổng mạng cần mở (cho Meet trong môi trường doanh nghiệp)

| Giao thức | Cổng | Mục đích |
|---|---|---|
| TCP | 80, 443, 7881, 5349 | HTTP/HTTPS, LiveKit, TURN/TLS |
| UDP | 443, 7882, 50000–50100 | TURN/UDP, WebRTC Media |

---

## III. Hướng dẫn sử dụng

---

### 3.1 Luồng Xác thực (Authentication Flow)

#### 3.1.1 Đăng ký tài khoản mới

Người dùng chưa có tài khoản thực hiện đăng ký tại https://app.torii.sbs.

- **Bước 1**: Người dùng truy cập trang chủ, nhấn nút **"Đăng ký"** ở góc trên bên phải.

> Figure 3.1.1.1 Trang chủ – Nút Đăng nhập / Đăng ký

- **Bước 2**: Hệ thống điều hướng đến trang `/register`. Form đăng ký hiển thị với các trường:
  - **Họ và tên**
  - **Địa chỉ Email**
  - **Mật khẩu** (tối thiểu 8 ký tự)
  - **Xác nhận mật khẩu**

  Người dùng điền đầy đủ và nhấn **"Đăng ký"**.

> Figure 3.1.1.2 Form đăng ký tài khoản (`/register`)

- **Bước 3**: Hệ thống gửi email xác nhận. Trang `/verify-request` hiển thị thông báo yêu cầu kiểm tra hộp thư.

> Figure 3.1.1.3 Trang thông báo xác nhận email (`/verify-request`)

- **Bước 4**: Người dùng mở email, nhấn **"Xác nhận tài khoản"** trong email để hoàn tất (`/verify`).

> Figure 3.1.1.4 Email xác nhận tài khoản

- **Bước 5**: Sau khi xác nhận thành công, hệ thống chuyển đến trang hoàn thiện hồ sơ. Người dùng điền **Tên hiển thị**, chọn **Trình độ tiếng Nhật**, tải **ảnh đại diện**, nhấn **"Hoàn tất"**.

> Figure 3.1.1.5 Form hoàn thiện hồ sơ cá nhân

---

#### 3.1.2 Đăng nhập

- **Bước 1**: Nhấn **"Đăng nhập"** trên trang chủ, hệ thống chuyển đến `/login`.

> Figure 3.1.2.1 Trang đăng nhập (`/login`)

- **Bước 2**: Điền **Email** và **Mật khẩu**, nhấn **"Đăng nhập"**.

  > Hoặc nhấn **"Tiếp tục với Google"** để đăng nhập qua Google OAuth.

> Figure 3.1.2.2 Form đăng nhập – Email/Password và Google OAuth

- **Bước 3 (nếu bật 2FA)**: Hệ thống chuyển đến trang `/verify-2fa`. Người dùng nhập mã OTP 6 chữ số từ ứng dụng Authenticator, nhấn **"Xác nhận"**.

> Figure 3.1.2.3 Trang xác minh 2FA (`/verify-2fa`)

- **Bước 4**: Đăng nhập thành công → hệ thống chuyển đến Dashboard (`/dashboard`).

> Figure 3.1.2.4 Dashboard học viên sau khi đăng nhập

---

#### 3.1.3 Bật xác thực 2 lớp (2FA - TOTP)

- **Bước 1**: Vào **Dashboard → Cài đặt → Bảo mật**, nhấn **"Bật xác thực 2 lớp"**.

> Figure 3.1.3.1 Màn hình Cài đặt bảo mật

- **Bước 2**: Hệ thống hiển thị mã QR. Dùng **Google Authenticator** hoặc **Authy** quét mã.

> Figure 3.1.3.2 Mã QR kích hoạt TOTP

- **Bước 3**: Nhập mã OTP 6 chữ số vào ô xác nhận, nhấn **"Xác nhận"** để hoàn tất kích hoạt.

> Figure 3.1.3.3 Ô nhập mã OTP xác nhận kích hoạt

---

#### 3.1.4 Quên mật khẩu

- **Bước 1**: Tại trang đăng nhập, nhấn **"Quên mật khẩu?"** → chuyển đến `/forgot-password`.

> Figure 3.1.4.1 Liên kết Quên mật khẩu trên trang đăng nhập

- **Bước 2**: Nhập **Email** đã đăng ký, nhấn **"Gửi"**.

> Figure 3.1.4.2 Form nhập email khôi phục mật khẩu

- **Bước 3**: Kiểm tra email, nhấn link **"Đặt lại mật khẩu"** (hiệu lực 15 phút) → chuyển đến `/reset-password`.

> Figure 3.1.4.3 Email chứa link đặt lại mật khẩu

- **Bước 4**: Nhập **mật khẩu mới** và **xác nhận mật khẩu mới**, nhấn **"Cập nhật"**.

> Figure 3.1.4.4 Form đặt mật khẩu mới

- **Bước 5**: Sau khi cập nhật thành công, hệ thống tự động chuyển về trang đăng nhập.

---

#### 3.1.5 Gửi lại email xác nhận

Nếu không nhận được email xác nhận:

- **Bước 1**: Truy cập `/resend-verification`.
- **Bước 2**: Nhập **Email**, nhấn **"Gửi lại"**. Hệ thống gửi lại email xác nhận mới.

> Figure 3.1.5.1 Trang gửi lại email xác nhận

---

### 3.2 Trang công khai (Marketing Pages)

#### 3.2.1 Trang chủ

- Người dùng truy cập https://app.torii.sbs và thấy trang giới thiệu nền tảng.
- Hiển thị: Slogan, danh sách khóa học nổi bật, giảng viên, thống kê hệ thống.
- Có thể nhấn **"Xem tất cả khóa học"** hoặc **"Đăng ký ngay"** mà không cần đăng nhập.

> Figure 3.2.1.1 Trang chủ (Landing Page) Torii Nihongo

---

#### 3.2.2 Trang danh sách khóa học (Công khai)

- **Bước 1**: Nhấn **"Khóa học"** trên navigation bar → chuyển đến `/courses`.

> Figure 3.2.2.1 Navigation bar – Mục Khóa học

- **Bước 2**: Trang hiển thị danh sách toàn bộ khóa học đã xuất bản. Người dùng lọc theo:
  - **Cấp độ**: N5, N4, N3, N2, N1
  - **Giá**: Miễn phí / Trả phí
  - **Từ khóa**: Tìm theo tên khóa học

> Figure 3.2.2.2 Trang danh sách khóa học công khai (`/courses`) với bộ lọc

- **Bước 3**: Nhấn vào khóa học để xem trang chi tiết `/courses/[slug]`.

> Figure 3.2.2.3 Card khóa học – Thumbnail, tên, giảng viên, giá

##### Trang chi tiết khóa học

- **Bước 4**: Trang chi tiết hiển thị:
  - Thumbnail và video giới thiệu
  - Mô tả đầy đủ và mục tiêu học tập
  - Cấu trúc nội dung (Module → Bài học – có thể xem preview)
  - Thông tin giảng viên
  - Đánh giá và nhận xét từ học viên
  - Nút **"Đăng ký miễn phí"** hoặc **"Mua khóa – X Coin"**

> Figure 3.2.2.4 Trang chi tiết khóa học – Tab Tổng quan

> Figure 3.2.2.5 Trang chi tiết khóa học – Tab Nội dung (Module list)

> Figure 3.2.2.6 Trang chi tiết khóa học – Tab Giảng viên

> Figure 3.2.2.7 Trang chi tiết khóa học – Tab Đánh giá

---

#### 3.2.3 Trang Lớp học trực tuyến (Marketing)

- **Bước 1**: Nhấn **"Live Classes"** trên navigation → `/live-classes`.

> Figure 3.2.3.1 Trang danh sách Live Classes công khai

- **Bước 2**: Xem các buổi học sắp diễn ra: tên buổi học, giảng viên, thời gian, số chỗ còn lại.
- **Bước 3**: Nhấn vào buổi học để xem chi tiết `/live-classes/[slug]`.

> Figure 3.2.3.2 Trang chi tiết Live Class – Thông tin và nút Đăng ký

---

#### 3.2.4 Trang Blog (Công khai)

- **Bước 1**: Nhấn **"Blog"** trên navigation → `/blog`.

> Figure 3.2.4.1 Trang danh sách Blog

- **Bước 2**: Xem danh sách bài viết từ giảng viên và cộng đồng. Lọc theo tag, chủ đề.
- **Bước 3**: Nhấn vào bài viết để đọc nội dung đầy đủ, có thể bình luận (cần đăng nhập).

> Figure 3.2.4.2 Trang đọc bài Blog chi tiết

---

#### 3.2.5 Trang Giảng viên & Học viên (Công khai)

- `/lecturers`: Danh sách giảng viên của nền tảng – ảnh, tên, chuyên môn, số khóa học.
- `/learners`: Cộng đồng học viên tiêu biểu.
- `/exams`: Danh sách đề thi tổng hợp công khai (JLPT Mock) – người dùng có thể xem trước khi đăng nhập.

> Figure 3.2.5.1 Trang danh sách Giảng viên (`/lecturers`)

---

### 3.3 Luồng Đăng ký Khóa học (Learner)

Đăng nhập bằng tài khoản Học viên tại https://app.torii.sbs.

#### Đăng ký khóa học miễn phí

- **Bước 1**: Vào trang chi tiết khóa học miễn phí, nhấn **"Đăng ký miễn phí"**.

> Figure 3.3.1 Nút Đăng ký miễn phí trên trang chi tiết khóa học

- **Bước 2**: Hệ thống tạo Enrollment, hiển thị thông báo **"Đăng ký thành công"**, chuyển sang trang học.

> Figure 3.3.2 Thông báo đăng ký thành công

#### Mua khóa học trả phí bằng Coin

- **Bước 1**: Vào trang chi tiết khóa học trả phí, nhấn **"Mua khóa – X Coin"**.

> Figure 3.3.3 Nút Mua khóa (hiển thị giá Coin)

- **Bước 2**: Hệ thống kiểm tra số dư Coin:
  - Nếu **đủ Coin**: Chuyển đến trang Checkout `/checkout`
  - Nếu **không đủ**: Hiện cảnh báo, gợi ý nạp thêm Coin

> Figure 3.3.4 Trang Checkout – Thông tin đơn hàng và số dư Coin

- **Bước 3**: Trang Checkout hiển thị: tên khóa học, giá gốc, ô nhập **Mã giảm giá (Coupon)**. Nếu có coupon, nhấn **"Áp dụng"** để trừ giá.

> Figure 3.3.5 Ô nhập và áp dụng mã giảm giá Coupon

- **Bước 4**: Nhấn **"Xác nhận mua"**. Hệ thống trừ Coin, tạo Enrollment, hiển thị thông báo thành công.

> Figure 3.3.6 Thông báo mua khóa thành công – Chuyển vào học ngay

#### Tặng khóa học (Gift Course)

- **Bước 1**: Tại trang chi tiết khóa học, nhấn **"Tặng khóa học"**.
- **Bước 2**: Nhập **email người nhận**, xác nhận thông tin, nhấn **"Tặng"**.
- **Bước 3**: Hệ thống trừ Coin từ ví người tặng, gửi email thông báo cho người nhận.

> Figure 3.3.7 Form tặng khóa học cho người dùng khác

---

### 3.4 Luồng Học tập trong Khóa học (Learning Flow)

#### 3.4.1 Vai trò Học viên (Learner)

Đăng nhập bằng tài khoản Học viên tại https://app.torii.sbs.

##### Truy cập khóa học đang học

- **Bước 1**: Học viên nhấn **"Khóa học của tôi"** (`/dashboard/my-courses`) trong sidebar.

> Figure 3.4.1.1 Sidebar học viên – Mục "Khóa học của tôi"

- **Bước 2**: Danh sách khóa học đang học hiển thị kèm **thanh tiến độ (%)**, ngày đăng ký, trạng thái. Học viên nhấn vào khóa học muốn tiếp tục.

> Figure 3.4.1.2 Danh sách khóa học đang học với tiến độ phần trăm

##### Trang nội dung khóa học (`/courses/[slug]/modules`)

- **Bước 3**: Trang khóa học (modules view) hiển thị toàn bộ **Module** và **Bài học** bên trong. Mỗi bài học hiển thị: biểu tượng loại (video/text/quiz/assignment), thời lượng, trạng thái (Đã học / Chưa học). Học viên nhấn vào bài học để bắt đầu.

> Figure 3.4.1.3 Trang Module – Danh sách bài học theo chương

##### Học bài học dạng Video (`/courses/[slug]/learn`)

- **Bước 4.1**: Trình phát video hiển thị. Học viên:
  - Nhấn **Play** để phát
  - Chỉnh **tốc độ phát**: 0.5x, 1x, 1.5x, 2x
  - Bật/tắt **phụ đề** (nếu có)
  - Tua timeline để xem lại đoạn cụ thể

> Figure 3.4.1.4 Trình phát video bài học với thanh điều khiển

##### Học bài học dạng Text

- **Bước 4.2**: Nội dung văn bản hiển thị. Các từ **Kanji** được kèm **Furigana** (chú âm Hiragana phía trên). Học viên cuộn xuống đọc toàn bộ nội dung.

> Figure 3.4.1.5 Bài học dạng Text với Furigana cho Kanji

##### Đánh dấu hoàn thành bài học

- **Bước 5**: Sau khi xem xong nội dung, học viên nhấn nút **"Đánh dấu hoàn thành"** ở cuối trang. Hệ thống cập nhật tiến độ, cộng XP, và mở khóa bài học tiếp theo.

> Figure 3.4.1.6 Nút "Đánh dấu hoàn thành" cuối bài học

##### Các tab trong trang bài học

**Tab Thảo luận:**

- **Bước 1**: Nhấn tab **"Thảo luận"**. Hệ thống hiển thị danh sách bình luận của học viên khác.
- **Bước 2**: Gõ câu hỏi hoặc nhận xét vào ô bình luận ở cuối trang, nhấn **"Gửi"**.
- **Bước 3**: Bình luận xuất hiện ngay. Học viên khác có thể **Reply** (trả lời) bình luận.

> Figure 3.4.1.7 Tab Thảo luận – Bình luận trong bài học

**Tab Ghi chú:**

- **Bước 1**: Nhấn tab **"Ghi chú"**. Vùng soạn thảo văn bản hiển thị.
- **Bước 2**: Học viên nhập ghi chú cá nhân. Nhấn **"Lưu"** để lưu ghi chú.
- **Bước 3**: Ghi chú được liên kết với bài học này, có thể xem lại tại **Dashboard → Ghi chú**.

> Figure 3.4.1.8 Tab Ghi chú – Soạn và lưu ghi chú

**Tab Tài liệu:**

- **Bước 1**: Nhấn tab **"Tài liệu"**. Danh sách file đính kèm hiển thị (PDF, slide, v.v.).
- **Bước 2**: Nhấn **"Tải xuống"** bên cạnh tên file để lưu về máy.

> Figure 3.4.1.9 Tab Tài liệu – Danh sách file đính kèm có thể tải xuống

---

##### Trang Tiến độ khóa học (`/courses/[slug]/progress`)

- **Bước 1**: Từ trang khóa học, nhấn tab hoặc nút **"Tiến độ"**.
- **Bước 2**: Hệ thống hiển thị biểu đồ tiến độ tổng thể (% bài học đã hoàn thành), danh sách từng bài với trạng thái, thời gian học tích lũy.

> Figure 3.4.1.10 Trang Tiến độ khóa học – Biểu đồ và danh sách bài học

---

##### Trang Tài nguyên khóa học (`/courses/[slug]/resources`)

- **Bước 1**: Nhấn **"Tài nguyên"** trong menu khóa học.
- **Bước 2**: Hệ thống liệt kê tất cả tài liệu của toàn bộ khóa học (không phân theo bài học), học viên tải về theo nhu cầu.

> Figure 3.4.1.11 Trang Tài nguyên – Toàn bộ file của khóa học

---

##### Trang Hoàn thành khóa học (`/courses/[slug]/completion`)

Khi học viên đã hoàn thành 100% bài học:

- **Bước 1**: Hệ thống tự động hiển thị trang chúc mừng hoàn thành khóa học.
- **Bước 2**: Học viên nhấn **"Xem chứng chỉ"** để truy cập trang certificate.

> Figure 3.4.1.12 Trang chúc mừng hoàn thành khóa học

---

##### Trang Chứng chỉ (`/courses/[slug]/certificate`)

- **Bước 1**: Trang hiển thị chứng chỉ điện tử với: Tên học viên, Tên khóa học, Ngày hoàn thành, Chữ ký giảng viên.
- **Bước 2**: Học viên nhấn **"Tải xuống PDF"** để lưu chứng chỉ về máy.
- **Bước 3**: Học viên có thể **chia sẻ** link chứng chỉ để xác minh.

> Figure 3.4.1.13 Trang Chứng chỉ hoàn thành khóa học

---

### 3.5 Luồng Thi cử (Exam Flow)

#### 3.5.1 Danh sách bài thi (`/dashboard/exams`)

Đăng nhập bằng tài khoản Học viên.

- **Bước 1**: Học viên nhấn **"Thi cử"** trong sidebar → trang danh sách bài thi.

> Figure 3.5.1.1 Sidebar – Mục Thi cử

- **Bước 2**: Danh sách bài thi hiển thị gồm: Tên bài thi, Cấp độ JLPT, Thời gian làm bài, Số câu hỏi, Điểm qua môn, Số lần đã thi. Học viên nhấn vào bài thi muốn tham gia.

> Figure 3.5.1.2 Danh sách bài thi – JLPT Mock N5/N4/N3 và bài thi tổng hợp

#### 3.5.2 Xem chi tiết bài thi (`/dashboard/exams/[examId]`)

- **Bước 3**: Trang chi tiết bài thi hiển thị: mô tả, số lần làm lại tối đa, điểm cao nhất đã đạt, lịch sử các lần thi trước. Học viên nhấn **"Bắt đầu thi"**.

> Figure 3.5.2.1 Trang chi tiết bài thi và lịch sử các lần thi

#### 3.5.3 Làm bài thi (`/dashboard/exams/[examId]/take`)

- **Bước 4**: Hệ thống khởi tạo phiên thi. Màn hình gồm: **Đồng hồ đếm ngược**, **số câu hỏi**, **thanh điều hướng câu hỏi**.

> Figure 3.5.3.1 Giao diện làm bài thi – Đồng hồ đếm ngược

- **Bước 5**: Học viên đọc câu hỏi, chọn đáp án. Có thể nhấn **"Đánh dấu"** để đánh dấu câu cần xem lại, nhấn **"Tiếp theo"** để sang câu kế.

> Figure 3.5.3.2 Câu hỏi thi trắc nghiệm với đáp án A/B/C/D

- **Bước 6**: Sau câu hỏi cuối, học viên nhấn **"Nộp bài"**. Hệ thống hiển thị xác nhận nộp bài (kể cả khi còn câu chưa trả lời).

> Figure 3.5.3.3 Hộp xác nhận nộp bài thi

- **Bước 7 (Khi hết giờ)**: Hệ thống tự động nộp bài khi đồng hồ về 0.

#### 3.5.4 Xem kết quả bài thi (`/dashboard/exams/[examId]/review`)

- **Bước 8**: Sau khi nộp bài, hệ thống chấm và hiển thị trang kết quả:
  - **Điểm số** (ví dụ: 75/100)
  - **Đạt / Không đạt** so với điểm qua môn
  - **Phân tích** điểm theo từng chủ đề/kỹ năng
  - Danh sách từng câu: câu đúng (✅), câu sai (❌), đáp án đúng và giải thích

> Figure 3.5.4.1 Trang kết quả bài thi – Điểm và phân tích

> Figure 3.5.4.2 Chi tiết từng câu hỏi – Đáp án đúng/sai và giải thích

#### 3.5.5 Lịch sử thi (`/dashboard/exams/[examId]/history`)

- **Bước 9**: Học viên nhấn tab **"Lịch sử"** để xem tất cả lần đã thi: ngày thi, điểm số, thời gian làm bài, xếp loại. Nhấn vào từng lần để xem lại kết quả chi tiết.

> Figure 3.5.5.1 Lịch sử các lần thi của học viên

---

#### 3.5.6 Bài kiểm tra xếp lớp (Placement Test)

Dành cho học viên mới muốn xác định trình độ ban đầu.

- **Bước 1**: Từ Dashboard, nhấn **"Kiểm tra xếp lớp"** (`/dashboard/placement-test`).

> Figure 3.5.6.1 Dashboard – Nút Kiểm tra xếp lớp

- **Bước 2**: Hệ thống giới thiệu: format bài test (từ vựng → ngữ pháp → đọc hiểu, tăng dần độ khó). Nhấn **"Bắt đầu"**.

> Figure 3.5.6.2 Màn hình giới thiệu Placement Test

- **Bước 3**: Làm bài test adaptive (AI tự điều chỉnh độ khó theo câu trả lời).

> Figure 3.5.6.3 Câu hỏi Placement Test dạng trắc nghiệm

- **Bước 4**: AI phân tích và trả kết quả: **Trình độ ước tính** (N5/N4/N3...) kèm phân tích chi tiết từng kỹ năng và **gợi ý khóa học phù hợp**.

> Figure 3.5.6.4 Kết quả Placement Test – Trình độ và gợi ý khóa học

---

#### 3.5.7 Quiz trong bài học (`/courses/[slug]/quizzes`)

- **Bước 1**: Trong bài học loại **Quiz**, học viên nhấn **"Bắt đầu Quiz"**.

> Figure 3.5.7.1 Bài học loại Quiz – Nút Bắt đầu

- **Bước 2**: Làm bài quiz (tương tự Exam nhưng không có đồng hồ đếm ngược nếu không cấu hình).
- **Bước 3**: Xem kết quả ngay sau khi nộp bài, có giải thích từng câu.

> Figure 3.5.7.2 Kết quả Quiz trong khóa học – Đáp án và giải thích

---

### 3.6 Luồng Flashcard – Ôn từ vựng SRS (`/dashboard/flashcards`)

Đăng nhập bằng tài khoản Học viên.

#### 3.6.1 Trang danh sách Flashcard

- **Bước 1**: Học viên nhấn **"Flashcard"** trong sidebar.

> Figure 3.6.1.1 Sidebar – Mục Flashcard

- **Bước 2**: Trang hiển thị danh sách **bộ thẻ (Deck)**: theo chủ đề, theo JLPT level (N5→N1), theo cấu trúc ngữ pháp. Thống kê: tổng số thẻ, số thẻ cần ôn hôm nay (due).

> Figure 3.6.1.2 Danh sách bộ Flashcard – Số thẻ và thẻ cần ôn hôm nay

- **Bước 3**: Học viên có thể:
  - Nhấn **"Ôn tập"** để bắt đầu phiên ôn bộ thẻ hiện có
  - Nhấn **"+ Tạo bộ thẻ mới"** để tạo bộ cá nhân
  - Nhấn **"+ Thêm thẻ"** vào bộ đang có

> Figure 3.6.1.3 Nút Ôn tập và Tạo bộ thẻ mới

#### 3.6.2 Tạo bộ thẻ cá nhân

- **Bước 1**: Nhấn **"+ Tạo bộ thẻ mới"**.
- **Bước 2**: Nhập **tên bộ thẻ**, **mô tả**, chọn **màu nhận dạng**. Nhấn **"Tạo"**.

> Figure 3.6.2.1 Form tạo bộ thẻ Flashcard mới

- **Bước 3**: Nhấn **"+ Thêm thẻ"** để thêm từ vựng: mặt trước (tiếng Nhật), mặt sau (nghĩa tiếng Việt/Anh), ghi chú, ví dụ câu. Nhấn **"Lưu"**.

> Figure 3.6.2.2 Form thêm thẻ từ vựng mới

#### 3.6.3 Phiên ôn tập Flashcard (`/dashboard/flashcards/[deckId]`)

- **Bước 1**: Nhấn **"Ôn tập"** trong bộ thẻ.
- **Bước 2**: Thẻ nhớ hiển thị **mặt trước**: từ tiếng Nhật kèm **Furigana** (chú âm Hiragana phía trên Kanji). Học viên nhớ nghĩa.

> Figure 3.6.3.1 Flashcard mặt trước – Từ tiếng Nhật với Furigana

- **Bước 3**: Nhấn **"Lật thẻ"** để xem mặt sau: nghĩa tiếng Việt, ví dụ câu, ghi chú.

> Figure 3.6.3.2 Flashcard mặt sau – Nghĩa và ví dụ câu

- **Bước 4**: Học viên đánh giá mức độ nhớ bằng 1 trong 3 nút:
  - **"Nhớ tốt"** → Thẻ lần sau xuất hiện sau nhiều ngày
  - **"Nhớ ít"** → Thẻ xuất hiện lại 1-2 ngày sau
  - **"Quên"** → Thẻ xuất hiện lại trong phiên này

> Figure 3.6.3.3 Nút đánh giá mức độ nhớ (Nhớ tốt / Nhớ ít / Quên)

- **Bước 5**: Kết thúc phiên, hệ thống hiển thị thống kê: số thẻ đã ôn, tỉ lệ nhớ đúng, lịch ôn tiếp theo theo thuật toán SRS.

> Figure 3.6.3.4 Thống kê sau phiên ôn Flashcard

---

### 3.7 Luồng Bài tập & Nộp bài (Assignments)

#### 3.7.1 Học viên xem danh sách bài tập (`/dashboard/assignments`)

- **Bước 1**: Học viên nhấn **"Bài tập"** trong sidebar.

> Figure 3.7.1.1 Sidebar – Mục Bài tập

- **Bước 2**: Danh sách bài tập của tất cả các khóa học đang học, hiển thị: tên bài tập, khóa học, hạn nộp, trạng thái (Chưa nộp / Đã nộp / Đã chấm). Học viên lọc theo trạng thái hoặc khóa học.

> Figure 3.7.1.2 Danh sách bài tập theo hạn nộp và trạng thái

#### 3.7.2 Xem và nộp bài tập

- **Bước 3**: Học viên nhấn vào bài tập cần nộp.
- **Bước 4**: Trang chi tiết bài tập hiển thị: đề bài, hướng dẫn, hạn nộp, yêu cầu định dạng file.

> Figure 3.7.2.1 Trang chi tiết bài tập – Đề bài và hướng dẫn

- **Bước 5**: Học viên có thể:
  - **Nhập văn bản**: Soạn bài trực tiếp trong ô text
  - **Upload file**: Nhấn **"Chọn file"** để tải file lên (PDF, DOCX, v.v.)

> Figure 3.7.2.2 Form nộp bài – Ô nhập văn bản và upload file

- **Bước 6**: Nhấn **"Nộp bài"**. Hệ thống xác nhận, hiển thị thông báo nộp bài thành công và thời gian nộp.

> Figure 3.7.2.3 Thông báo nộp bài thành công – Timestamp

#### 3.7.3 Xem kết quả và nhận xét

- **Bước 7**: Khi giảng viên đã chấm điểm, trạng thái bài tập chuyển sang **"Đã chấm"**. Học viên nhấn vào bài tập.
- **Bước 8**: Trang kết quả hiển thị: **Điểm số**, **Nhận xét** của giảng viên, file có thể được tải lại với ghi chú.

> Figure 3.7.3.1 Trang kết quả bài tập – Điểm và nhận xét giảng viên

---

### 3.8 Luồng Ghi chú hệ thống (`/dashboard/notes`)

- **Bước 1**: Học viên nhấn **"Ghi chú"** trong sidebar.
- **Bước 2**: Trang hiển thị toàn bộ ghi chú đã lưu, sắp xếp theo thời gian hoặc theo khóa học.
- **Bước 3**: Nhấn vào ghi chú để chỉnh sửa. Nhấn **"Xóa"** để xóa ghi chú không cần thiết.

> Figure 3.8.1 Trang Ghi chú – Danh sách ghi chú theo bài học/khóa học

---

### 3.9 Thống kê học tập (`/dashboard/statistics` và `/analytics`)

#### 3.9.1 Trang thống kê cá nhân

- **Bước 1**: Học viên nhấn **"Thống kê"** trong sidebar.
- **Bước 2**: Dashboard thống kê hiển thị:
  - **Tổng thời gian học** (giờ)
  - **Tổng số bài đã hoàn thành**
  - **Streak hiện tại** và lịch sử streak
  - **Biểu đồ học tập**: theo tuần / tháng
  - **Phân bổ theo kỹ năng**: từ vựng, ngữ pháp, đọc hiểu

> Figure 3.9.1.1 Trang Thống kê học tập – Overview Dashboard

> Figure 3.9.1.2 Biểu đồ học tập theo tuần/tháng

#### 3.9.2 Trang phân tích AI (`/analytics`)

- **Bước 1**: Học viên nhấn **"AI Analytics"** trong menu.
- **Bước 2**: AI Sensei phân tích toàn bộ lịch sử học tập và hiển thị:
  - Điểm mạnh và điểm yếu theo từng kỹ năng
  - Xu hướng tiến bộ (tăng/giảm theo thời gian)
  - Gợi ý cụ thể: "Bạn cần ôn lại ngữ pháp て-form"

> Figure 3.9.2.1 Trang AI Analytics – Phân tích điểm mạnh/yếu theo kỹ năng

---

### 3.10 Luồng Ví Coin & Thanh toán (`/dashboard/wallet`)

#### 3.10.1 Vai trò Học viên (Learner)

Đăng nhập tài khoản Học viên tại https://app.torii.sbs.

##### Xem ví Coin

- **Bước 1**: Học viên nhấn vào **biểu tượng ví** 💰 trên header hoặc vào **Dashboard → Ví**.

> Figure 3.10.1.1 Biểu tượng ví Coin trên header – Hiển thị số dư

- **Bước 2**: Trang Ví hiển thị:
  - **Số dư Coin hiện tại** (nổi bật ở giữa)
  - **Lịch sử giao dịch** (CoinLedger): loại giao dịch, số Coin, thời gian
  - Nút **"Nạp Coin"**

> Figure 3.10.1.2 Trang Ví – Số dư Coin và lịch sử giao dịch

---

##### Nạp Coin (Top-up)

- **Bước 3**: Nhấn **"Nạp Coin"**.

> Figure 3.10.1.3 Nút Nạp Coin trên trang Ví

- **Bước 4**: Hệ thống hiển thị các gói nạp tiền:

  | Gói | Số tiền (VND) | Coin nhận |
  |---|---|---|
  | Gói nhỏ | 50.000đ | 50 Coin |
  | Gói thường | 100.000đ | 100 Coin |
  | Gói lớn | 200.000đ | 200 Coin |
  | Gói VIP | 500.000đ | 550 Coin (+50 bonus) |

  Học viên chọn gói, chọn phương thức thanh toán (**VNPay** hoặc **Momo**).

> Figure 3.10.1.4 Trang chọn gói nạp Coin và phương thức thanh toán

- **Bước 5**: Nhấn **"Thanh toán"** → Hệ thống tạo Order và chuyển sang cổng thanh toán.

> Figure 3.10.1.5 Cổng thanh toán VNPay/Momo – Quét mã hoặc nhập thẻ

- **Bước 6**: Sau khi thanh toán thành công, hệ thống webhook nhận xác nhận, tự động cộng Coin vào ví, hiển thị thông báo: **"Nạp thành công X Coin"**.

> Figure 3.10.1.6 Thông báo nạp Coin thành công – Số dư mới

---

##### Xem lịch sử giao dịch Coin (CoinLedger)

- **Bước 7**: Trong trang Ví, cuộn xuống phần **"Lịch sử"**. Mỗi dòng ghi:
  - Loại giao dịch: 🔼 Nạp / 🔽 Mua khóa / 🔄 Hoàn tiền
  - Số Coin (+/-)
  - Tham chiếu đơn hàng
  - Thời gian

> Figure 3.10.1.7 Danh sách lịch sử giao dịch Coin

---

##### Mua khóa học bằng Coin (qua trang Checkout)

- **Bước 1**: Vào trang chi tiết khóa học, nhấn **"Mua khóa – X Coin"**.
- **Bước 2**: Trang `/checkout` hiển thị thông tin đơn hàng.

> Figure 3.10.1.8 Trang Checkout – Thông tin đơn hàng

- **Bước 3**: Học viên nhập **Mã giảm giá (Coupon)** vào ô, nhấn **"Áp dụng"**. Nếu hợp lệ, giá Coin được giảm ngay.

> Figure 3.10.1.9 Áp dụng mã Coupon – Giá sau giảm

- **Bước 4**: Nhấn **"Xác nhận mua"**. Hệ thống trừ Coin, tạo Enrollment, chuyển học viên vào trang học.

> Figure 3.10.1.10 Thông báo mua thành công – Truy cập khóa học ngay

---

##### Yêu cầu hoàn tiền (Refund)

- **Bước 1**: Học viên vào **Dashboard → Hỗ trợ → Tạo yêu cầu** (`/dashboard/support`).
- **Bước 2**: Chọn **loại yêu cầu: Hoàn tiền**, chọn **khóa học** muốn hoàn, nhập **lý do**, nhấn **"Gửi yêu cầu"**.

> Figure 3.10.1.11 Form tạo yêu cầu hoàn tiền

- **Bước 3**: Hệ thống tạo ticket. Học viên có thể theo dõi trạng thái tại **Dashboard → Lịch sử** (`/dashboard/history`).
- **Bước 4**: Khi Admin duyệt, Coin được hoàn tự động vào ví, học viên nhận thông báo **"Hoàn X Coin thành công"**.

> Figure 3.10.1.12 Thông báo hoàn tiền thành công – Số Coin được cộng lại

---

##### Lịch sử đơn hàng (`/dashboard/payment`)

- **Bước 1**: Học viên vào **Dashboard → Lịch sử thanh toán**.
- **Bước 2**: Danh sách tất cả đơn hàng: nạp Coin, mua khóa, tặng khóa, đổi coupon. Xem chi tiết từng đơn, tải hóa đơn PDF.

> Figure 3.10.1.13 Lịch sử đơn hàng – Bộ lọc theo loại và trạng thái

---

### 3.11 Luồng AI Sensei

Đăng nhập tài khoản Học viên. Truy cập **AI Sensei** từ menu chính.

#### 3.11.1 Trang chủ AI Sensei

- **Bước 1**: Nhấn **"AI Sensei"** trên navigation. Trang chủ AI Sensei hiển thị 7 chế độ học tập.

> Figure 3.11.1.1 Trang chủ AI Sensei – 7 chế độ học tập

| Chế độ | Mô tả |
|---|---|
| **Chat** | Trợ lý hội thoại học tiếng Nhật |
| **Drill** | Luyện tập câu hỏi nhanh theo chủ đề |
| **Flashcards AI** | Tạo thẻ nhớ tự động từ AI |
| **Grammar** | Tra cứu và giải thích ngữ pháp |
| **Translate** | Dịch Nhật ↔ Việt ↔ Anh |
| **Roleplay** | Hội thoại tình huống thực tế |
| **Resources** | Tài nguyên học tập do AI gợi ý |

---

#### 3.11.2 Chế độ Chat (`/ai-sensei/chat`)

- **Bước 1**: Nhấn **"Chat"** → Giao diện chat giống ChatGPT hiển thị.

> Figure 3.11.2.1 Giao diện Chat AI Sensei

- **Bước 2**: Học viên gõ câu hỏi bằng tiếng Việt, tiếng Anh hoặc tiếng Nhật. Ví dụ:
  - "Sự khác biệt giữa は và が là gì?"
  - "て-form dùng khi nào? Cho ví dụ"
  - "日本語でよく使う敬語を教えてください"

  Nhấn **Enter** hoặc nút **Gửi**.

> Figure 3.11.2.2 Học viên nhập câu hỏi về ngữ pháp tiếng Nhật

- **Bước 3**: AI Sensei phản hồi streaming (chữ hiện dần), kèm ví dụ câu, giải thích, bảng so sánh nếu cần.

> Figure 3.11.2.3 Phản hồi AI Sensei – Giải thích chi tiết với ví dụ

- **Bước 4**: Học viên tiếp tục hỏi để đào sâu. Lịch sử hội thoại được lưu trong phiên.

> Figure 3.11.2.4 Cuộc hội thoại nhiều lượt – Theo dõi ngữ cảnh

---

#### 3.11.3 Chế độ Luyện tập nhanh – Drill (`/ai-sensei/drill`)

- **Bước 1**: Nhấn **"Drill"**. Học viên chọn chủ đề luyện (từ vựng N5, ngữ pháp N4...).

> Figure 3.11.3.1 Trang Drill – Chọn chủ đề luyện tập

- **Bước 2**: AI ra câu hỏi nhanh liên tiếp. Học viên trả lời (nhập text hoặc chọn đáp án).
- **Bước 3**: AI đánh giá và giải thích ngay sau mỗi câu.

> Figure 3.11.3.2 Giao diện Drill – Câu hỏi và nhận xét tức thì

---

#### 3.11.4 Chế độ Ngữ pháp – Grammar (`/ai-sensei/grammar`)

- **Bước 1**: Nhấn **"Grammar"**. Học viên tra cứu một điểm ngữ pháp (ví dụ: "〜ている", "〜たら").

> Figure 3.11.4.1 Trang Grammar – Ô tra cứu điểm ngữ pháp

- **Bước 2**: AI hiển thị: Định nghĩa, Công thức, Ý nghĩa, Ví dụ câu, So sánh với cấu trúc tương tự.

> Figure 3.11.4.2 Giải thích ngữ pháp chi tiết – Công thức và ví dụ

---

#### 3.11.5 Chế độ Dịch thuật – Translate (`/ai-sensei/translate`)

- **Bước 1**: Nhấn **"Translate"**. Học viên nhập văn bản cần dịch.

> Figure 3.11.5.1 Trang Dịch thuật AI

- **Bước 2**: Chọn chiều dịch (Nhật→Việt, Việt→Nhật, Nhật→Anh...), nhấn **"Dịch"**.
- **Bước 3**: AI trả về bản dịch kèm giải thích từng từ/cụm từ quan trọng.

> Figure 3.11.5.2 Kết quả dịch thuật – Bản dịch và giải thích từ vựng

---

#### 3.11.6 Chế độ Nhập vai – Roleplay (`/ai-sensei/roleplay`)

- **Bước 1**: Nhấn **"Roleplay"**. Chọn tình huống: mua sắm, ở nhà hàng, phỏng vấn xin việc...

> Figure 3.11.6.1 Trang Roleplay – Danh sách tình huống

- **Bước 2**: AI đóng vai (nhân viên bán hàng, phỏng vấn viên...) và bắt đầu hội thoại bằng tiếng Nhật.
- **Bước 3**: Học viên phản hồi bằng tiếng Nhật. AI sửa lỗi và tiếp tục hội thoại tự nhiên.

> Figure 3.11.6.2 Hội thoại Roleplay – AI đóng vai nhân viên nhà hàng

- **Bước 4**: Kết thúc tình huống, AI tổng kết: lỗi hay gặp, từ vựng cần nhớ.

> Figure 3.11.6.3 Tổng kết phiên Roleplay – Nhận xét và cải thiện

---

#### 3.11.7 Tài nguyên AI (`/ai-sensei/resources`)

- **Bước 1**: Nhấn **"Resources"**. Hệ thống hiển thị tài nguyên học tiếng Nhật do AI tổng hợp và gợi ý dựa trên trình độ học viên.

> Figure 3.11.7.1 Trang Tài nguyên học tập AI – Gợi ý theo trình độ

---

### 3.12 Luồng Lớp học Trực tuyến (Meet WebRTC)

Truy cập riêng tại https://meet.torii.sbs (ứng dụng độc lập).

#### 3.12.1 Vai trò Học viên – Tham gia buổi học

- **Bước 1**: Học viên nhận **link phòng học** từ giảng viên qua email hoặc thông báo trên Dashboard.

> Figure 3.12.1.1 Thông báo buổi học trực tuyến trên Dashboard

- **Bước 2**: Học viên truy cập https://meet.torii.sbs. Trang tham gia hiển thị. Nhập **mã phòng** vào ô (hoặc click link trực tiếp), nhấn **"Tham gia"**.

> Figure 3.12.1.2 Trang tham gia Meet – Ô nhập mã phòng

- **Bước 3**: Trình duyệt yêu cầu quyền **Camera** và **Microphone**. Học viên chọn **"Cho phép"**.

> Figure 3.12.1.3 Hộp thoại yêu cầu quyền Camera/Micro của trình duyệt

- **Bước 4**: Màn hình **lobby** hiển thị để kiểm tra thiết bị: xem trước camera, kiểm tra micro. Học viên có thể chọn thiết bị audio/video từ dropdown, sau đó nhấn **"Vào lớp học"**.

> Figure 3.12.1.4 Màn hình Lobby – Kiểm tra Camera và Microphone

- **Bước 5**: Học viên vào phòng học. Giao diện chính hiển thị:
  - Video các thành viên (grid layout hoặc spotlight)
  - Thanh công cụ phía dưới

> Figure 3.12.1.5 Giao diện phòng học Meet – Video grid các thành viên

##### Sử dụng các tính năng trong phòng học

| Tính năng | Mô tả | Cách dùng |
|---|---|---|
| 📷 Camera | Bật/tắt video | Nhấn nút Camera |
| 🎙 Microphone | Bật/tắt âm thanh | Nhấn nút Mic |
| 💬 Chat | Nhắn tin văn bản | Nhấn Chat → gõ → Gửi |
| 🖥 Share Screen | Chia sẻ màn hình | Nhấn Share → chọn cửa sổ |
| ✋ Raise Hand | Xin phát biểu | Nhấn biểu tượng tay |
| 👥 Participants | Danh sách người | Nhấn biểu tượng người |
| 🚪 Leave | Rời phòng | Nhấn Leave → xác nhận |

> Figure 3.12.1.6 Thanh công cụ điều khiển Meet (Camera, Mic, Chat, Share...)

> Figure 3.12.1.7 Tính năng Chat văn bản trong phòng học

> Figure 3.12.1.8 Tính năng Chia sẻ màn hình (Screen Share)

> Figure 3.12.1.9 Tính năng Giơ tay xin phát biểu (Raise Hand)

---

#### 3.12.2 Vai trò Giảng viên – Tạo và điều hành phòng học

Đăng nhập tài khoản Lecturer tại https://admin.torii.sbs.

##### Tạo phòng học mới

- **Bước 1**: Giảng viên vào **"Lớp học"** (`/rooms`) trong sidebar Admin.

> Figure 3.12.2.1 Sidebar Admin – Mục Lớp học (Rooms)

- **Bước 2**: Trang danh sách phòng học hiển thị (sắp diễn ra, đang diễn ra, đã kết thúc). Nhấn **"+ Tạo phòng học"**.

> Figure 3.12.2.2 Danh sách phòng học trong Admin

- **Bước 3**: Form tạo phòng hiển thị. Giảng viên điền:
  - **Tên buổi học**
  - **Mô tả** (nội dung sẽ học)
  - **Thời gian bắt đầu** và **kết thúc**
  - **Số học viên tối đa**
  - **Khóa học liên kết** (tùy chọn)

  Nhấn **"Tạo phòng"**.

> Figure 3.12.2.3 Form tạo phòng học mới

- **Bước 4**: Hệ thống tạo phòng và cung cấp **Link tham gia** và **Mã phòng**. Giảng viên copy và chia sẻ cho học viên qua email hoặc thông báo.

> Figure 3.12.2.4 Thông tin phòng học – Link và mã phòng để chia sẻ

##### Điều hành buổi học

- **Bước 5**: Giảng viên nhấn **"Vào phòng"** để bắt đầu buổi học. Quyền giảng viên bổ sung:
  - **Tắt mic/camera học viên**
  - **Kick** học viên vi phạm
  - **Bật ghi hình** toàn buổi học (Recording)
  - **Pin** video của một người lên spotlight
  - **Chia phòng nhỏ** (Breakout rooms, nếu có)

> Figure 3.12.2.5 Giao diện phòng học của Giảng viên – Thanh quản lý

> Figure 3.12.2.6 Panel Participants – Quản lý quyền từng học viên

##### Kết thúc buổi học

- **Bước 6**: Giảng viên nhấn **"Kết thúc buổi học"** (End for All). Tất cả thành viên bị đưa ra khỏi phòng.
- **Bước 7**: Nếu đã bật Recording, giảng viên có thể vào **Admin → Lớp học → Buổi đã qua** để xem và tải video ghi hình.

> Figure 3.12.2.7 Trang lịch sử buổi học – Video ghi hình

---

#### 3.12.3 Xử lý sự cố kết nối Meet

| Sự cố | Nguyên nhân | Giải pháp |
|---|---|---|
| Không nghe/thấy | Trình duyệt chặn micro | Cho phép quyền mic trong cài đặt trình duyệt |
| Video bị giật | Mạng yếu | Tắt camera; hệ thống tự dùng TURN/UDP cho 4G |
| Không kết nối được | VPN/firewall | Chờ 15 giây; hệ thống fallback sang TURN/TLS (port 5349) |
| Bị đẩy ra phòng | Mạng ngắt kết nối | Làm mới trang và nhấn lại link tham gia |

##### Kiểm tra kết nối WebRTC

Nếu liên tục gặp sự cố:
1. Truy cập [LiveKit Connection Tester](https://livekit.io/connection-test)
2. Nhập: `wss://api.torii.sbs/socket-b`
3. Chạy test và xem kết quả

> Figure 3.12.3.1 Công cụ kiểm tra kết nối LiveKit

---

### 3.13 Luồng Gamification & Thành tích

#### 3.13.1 Streak học tập hàng ngày

Đăng nhập tài khoản Học viên.

- Streak (chuỗi ngày học liên tiếp) hiển thị biểu tượng 🔥 trên Header và Dashboard.
- Để duy trì Streak: hoàn thành **ít nhất 1 bài học** mỗi ngày.
- Nếu bỏ **1 ngày** không học, Streak bị reset về **0**.
- Hệ thống tính theo **múi giờ tài khoản** (cài đặt trong Hồ sơ).

> Figure 3.13.1.1 Biểu tượng Streak 🔥 trên header – Số ngày liên tiếp

> Figure 3.13.1.2 Trang Dashboard – Streak calendar tháng hiện tại

---

#### 3.13.2 XP & Level

Mỗi hành động cộng **XP (điểm kinh nghiệm)**:

| Hành động | XP nhận |
|---|---|
| Hoàn thành bài học video/text | +10 XP |
| Hoàn thành quiz trong khóa | +20 XP |
| Nộp bài tập | +15 XP |
| Hoàn thành bài thi Exam | +30 XP |
| Hoàn thành khóa học | +100 XP |
| Duy trì Streak mỗi ngày | +5 XP |
| Ôn Flashcard (≥10 thẻ) | +5 XP |
| Đăng bài trên Feed | +3 XP |

- Đạt đủ XP → **Level tăng** tự động, hiển thị thông báo "Level Up!" và huy hiệu mới.

> Figure 3.13.2.1 Thanh XP và Level trên Dashboard

---

#### 3.13.3 Huy hiệu (Achievements – `/dashboard/achievements`)

- **Bước 1**: Học viên nhấn **"Thành tích"** trong sidebar.
- **Bước 2**: Trang hiển thị 2 mục:
  - **Huy hiệu đã đạt**: Hiển thị đầy đủ với màu sắc, kèm ngày đạt được
  - **Huy hiệu chưa đạt**: Mờ, hiển thị điều kiện để đạt được

> Figure 3.13.3.1 Trang Thành tích – Huy hiệu đã đạt (màu) và chưa đạt (mờ)

Danh sách một số huy hiệu:

| Huy hiệu | Điều kiện |
|---|---|
| 🌟 Người mới bắt đầu | Hoàn thành bài học đầu tiên |
| 🔥 Tuần lễ kiên trì | Streak 7 ngày |
| 🔥🔥 Tháng học chăm | Streak 30 ngày |
| 📚 Học giả N5 | Hoàn thành 1 khóa học N5 |
| 🎓 Tốt nghiệp N5 | Hoàn thành tất cả khóa N5 |
| 💎 Thám tử Kanji | Làm đúng 100 câu Kanji liên tiếp |
| 🏆 Thống trị bảng xếp hạng | Đứng #1 leaderboard trong 1 tuần |

> Figure 3.13.3.2 Chi tiết huy hiệu – Điều kiện và tiến độ đang đạt

---

#### 3.13.4 Bảng xếp hạng (Leaderboard – `/dashboard/leaderboard`)

- **Bước 1**: Học viên nhấn **"Bảng xếp hạng"** trong sidebar.
- **Bước 2**: Leaderboard hiển thị xếp hạng theo **XP tích lũy**. Học viên chuyển đổi tab:
  - **Tuần này**: XP kiếm được trong 7 ngày qua
  - **Tháng này**: XP kiếm được trong 30 ngày qua
  - **Tất cả thời gian**: XP tổng cộng từ khi tạo tài khoản
- **Bước 3**: Vị trí của học viên đăng nhập được tô nổi bật trong bảng.

> Figure 3.13.4.1 Bảng xếp hạng – Top 10 học viên theo XP tuần này

---

#### 3.13.5 Phần thưởng – Đổi Point lấy Coupon (`/dashboard/rewards`)

- **Bước 1**: Học viên nhấn **"Phần thưởng"** trong sidebar. Hệ thống hiển thị **số Point** hiện có và danh sách coupon có thể đổi.

> Figure 3.13.5.1 Trang Phần thưởng – Số Point và danh sách Coupon

- **Bước 2**: Mỗi coupon hiển thị: giá trị giảm giá, số Point cần dùng, thời hạn. Học viên nhấn **"Đổi"** bên cạnh coupon muốn lấy.

> Figure 3.13.5.2 Card Coupon – Thông tin và nút Đổi Point

- **Bước 3**: Hộp xác nhận hiện ra. Học viên nhấn **"Xác nhận đổi"**. Hệ thống trừ Point, cấp mã coupon.

> Figure 3.13.5.3 Hộp xác nhận đổi Point lấy Coupon

- **Bước 4**: Coupon được hiển thị với mã đầy đủ. Học viên sao chép mã để dùng khi Checkout mua khóa.

> Figure 3.13.5.4 Mã Coupon sau khi đổi thành công – Nút sao chép mã

---

#### 3.13.6 Thành tích tổng hợp (`/dashboard/statistics`)

- **Bước 1**: Vào **Dashboard → Thống kê**. Trang hiển thị tổng hợp toàn bộ hành trình học tập:
  - **Tổng thời gian học**
  - **Số khóa hoàn thành**
  - **Tổng XP tích lũy**
  - **Streak dài nhất từ trước đến nay**
  - **Số huy hiệu đạt được / tổng**
  - **Biểu đồ học tập theo tháng**

> Figure 3.13.6.1 Trang Thống kê cá nhân – Overview tổng hợp

---

### 3.14 Luồng Cộng đồng – Feed (`/dashboard/feed`)

Đăng nhập tài khoản Học viên.

#### 3.14.1 Xem Feed cộng đồng

- **Bước 1**: Học viên nhấn **"Feed"** trong sidebar.
- **Bước 2**: Newsfeed hiển thị bài đăng từ cộng đồng học viên và giảng viên, sắp xếp theo thời gian mới nhất.

> Figure 3.14.1.1 Feed cộng đồng học tiếng Nhật – Bài đăng và tương tác

#### 3.14.2 Tương tác với bài đăng

- **Bước 3**: Học viên có thể:
  - **Like** ❤️: Nhấn biểu tượng tim bên dưới bài
  - **Bình luận** 💬: Nhấn "Bình luận", gõ nội dung, nhấn "Gửi"
  - **Chia sẻ** 🔗: Nhấn "Chia sẻ" để copy link bài đăng

> Figure 3.14.2.1 Bài đăng Feed – Nút Like, Bình luận, Chia sẻ

#### 3.14.3 Đăng bài mới

- **Bước 4**: Học viên nhấn **"+ Đăng bài"** ở đầu trang Feed.
- **Bước 5**: Hộp soạn thảo hiển thị. Nhập nội dung, có thể đính kèm ảnh. Nhấn **"Đăng"**.

> Figure 3.14.3.1 Hộp soạn thảo bài đăng mới trên Feed

---

### 3.15 Hồ sơ & Cài đặt cá nhân

#### 3.15.1 Cập nhật hồ sơ (`/dashboard/profile`)

- **Bước 1**: Nhấn vào **ảnh đại diện** hoặc tên trên header → **"Hồ sơ"**.
- **Bước 2**: Trang hồ sơ hiển thị. Nhấn **"Chỉnh sửa"**.
- **Bước 3**: Cập nhật: **Tên hiển thị**, **Tiểu sử**, **Trình độ tiếng Nhật**, **Ảnh đại diện** (upload file mới). Nhấn **"Lưu thay đổi"**.

> Figure 3.15.1.1 Trang Hồ sơ cá nhân – Thông tin và nút Chỉnh sửa

> Figure 3.15.1.2 Form chỉnh sửa hồ sơ – Tất cả trường thông tin

#### 3.15.2 Cài đặt hệ thống (`/dashboard/settings`)

- **Bước 1**: Vào **Dashboard → Cài đặt**.
- **Bước 2**: Các tab cài đặt:
  - **Tài khoản**: Đổi email, mật khẩu
  - **Bảo mật**: Bật/tắt 2FA, xem lịch sử đăng nhập
  - **Thông báo**: Cài đặt loại thông báo nhận
  - **Ngôn ngữ**: Giao diện (Tiếng Việt / English / 日本語)
  - **Múi giờ**: Quan trọng cho tính Streak chính xác

> Figure 3.15.2.1 Trang Cài đặt – Các tab: Tài khoản, Bảo mật, Thông báo

#### 3.15.3 Cài đặt thông báo

- **Bước 1**: Trong Cài đặt → Tab **"Thông báo"**.
- **Bước 2**: Học viên bật/tắt từng loại:
  - ✅/❌ **Email nhắc học hàng ngày** (giờ nhắc)
  - ✅/❌ **Thông báo khi có Reply bình luận**
  - ✅/❌ **Thông báo cập nhật khóa học đang học**
  - ✅/❌ **Thông báo khi đạt huy hiệu mới**
  - ✅/❌ **Thông báo từ giảng viên**

> Figure 3.15.3.1 Tab Thông báo – Các loại thông báo có thể bật/tắt

---

#### 3.15.4 Thông báo hệ thống (`/dashboard/notifications`)

- **Bước 1**: Nhấn biểu tượng **chuông** 🔔 trên header.
- **Bước 2**: Panel thông báo thả xuống, hiển thị các thông báo chưa đọc: nhắc học, reply bình luận, huy hiệu mới, cập nhật khóa học.
- **Bước 3**: Nhấn vào thông báo để xem chi tiết và đánh dấu đã đọc.
- **Bước 4**: Nhấn **"Xem tất cả"** để vào trang `/dashboard/notifications` xem toàn bộ lịch sử.

> Figure 3.15.4.1 Panel thông báo – Danh sách thông báo mới

> Figure 3.15.4.2 Trang Tất cả thông báo – Lịch sử, bộ lọc đã đọc/chưa đọc

---

### 3.16 Wishlist, Review, Members

#### 3.16.1 Danh sách yêu thích (`/dashboard/wishlist`)

- **Bước 1**: Tại trang chi tiết khóa học chưa đăng ký, nhấn **biểu tượng tim** 🤍 để thêm vào Wishlist.
- **Bước 2**: Xem danh sách khóa học yêu thích tại **Dashboard → Yêu thích**.

> Figure 3.16.1.1 Biểu tượng Wishlist trên trang khóa học

> Figure 3.16.1.2 Trang Wishlist – Danh sách khóa học đã lưu

#### 3.16.2 Gửi đánh giá khóa học (`/dashboard/reviews`)

- **Bước 1**: Sau khi hoàn thành ≥50% khóa học, học viên có thể đánh giá.
- **Bước 2**: Vào trang chi tiết khóa học đã đăng ký → Tab **"Đánh giá"** → **"Viết đánh giá"**.
- **Bước 3**: Chọn **số sao** (1-5), nhập **nhận xét**, nhấn **"Gửi đánh giá"**.

> Figure 3.16.2.1 Form viết đánh giá khóa học – Số sao và nhận xét

#### 3.16.3 Cộng đồng học viên (`/dashboard/members`)

- **Bước 1**: Vào **Dashboard → Thành viên**.
- **Bước 2**: Xem danh sách học viên trong cộng đồng, xem hồ sơ công khai (tên, huy hiệu, khóa học đang học). Tìm kiếm theo tên.

> Figure 3.16.3.1 Trang Thành viên cộng đồng – Grid học viên

---

### 3.17 Lịch học trực tuyến của học viên (`/learning/sessions`)

- **Bước 1**: Vào **Lịch học** trong menu.
- **Bước 2**: Trang hiển thị lịch các buổi Live Class sắp diễn ra có học viên đăng ký: tên buổi, giảng viên, thời gian, link tham gia.
- **Bước 3**: Nhấn **"Tham gia"** khi đến giờ học để truy cập thẳng vào phòng Meet.

> Figure 3.17.1 Trang lịch học – Các buổi Live Class sắp diễn ra

---

### 3.18 Chứng chỉ (`/dashboard/certificates`)

- **Bước 1**: Vào **Dashboard → Chứng chỉ**.
- **Bước 2**: Danh sách tất cả chứng chỉ đã nhận từ các khóa học hoàn thành.
- **Bước 3**: Nhấn vào chứng chỉ cụ thể → Xem preview → **"Tải xuống PDF"** hoặc copy **link xác minh** để chia sẻ.

> Figure 3.18.1 Trang Chứng chỉ – Danh sách chứng chỉ đã đạt

> Figure 3.18.2 Chứng chỉ điện tử – Tên học viên, khóa học, ngày hoàn thành

---

### 3.19 Luồng Quản lý Khóa học (Admin)

#### 3.19.1 Dashboard Admin

- **Bước 1**: Đăng nhập tại https://admin.torii.sbs → hệ thống hiển thị **Dashboard tổng quan**.
- **Bước 2**: Dashboard hiển thị: Tổng học viên, Tổng khóa học, Doanh thu tháng, Buổi học hôm nay, Biểu đồ đăng ký mới theo tuần.

> Figure 3.19.1.1 Admin Dashboard – Tổng quan hệ thống

---

#### 3.19.2 Danh sách khóa học (`/courses`)

- **Bước 1**: Admin nhấn **"Khóa học"** trong sidebar.

> Figure 3.19.2.1 Sidebar Admin – Mục Khóa học

- **Bước 2**: Trang danh sách khóa học hiển thị gồm: Tên, Giảng viên, Cấp độ, Số học viên, Doanh thu, Trạng thái (Draft/Published/Archived). Có thể lọc theo trạng thái, cấp độ.

> Figure 3.19.2.2 Danh sách khóa học – Bảng với thông tin tổng hợp

##### Tạo khóa học mới

- **Bước 3**: Nhấn **"+ Tạo khóa học"**.

> Figure 3.19.2.3 Nút Tạo khóa học mới

- **Bước 4**: Form tạo khóa điền các thông tin:
  - **Tên khóa học** (bắt buộc)
  - **Mô tả ngắn** và **Mô tả đầy đủ**
  - **Cấp độ**: N5, N4, N3, N2, N1
  - **Giá (Coin)**: 0 = Miễn phí
  - **Thumbnail**: Upload ảnh đại diện
  - **Video giới thiệu**: Upload hoặc nhập URL

  Nhấn **"Lưu bản nháp"**.

> Figure 3.19.2.4 Form tạo khóa học mới – Các trường thông tin

---

#### 3.19.3 Quản lý nội dung khóa học (Chi tiết – `/courses/[id]`)

- **Bước 5**: Nhấn vào tên khóa để vào trang chi tiết. Trang có các tab: **Thông tin**, **Nội dung**, **Học viên**, **Đánh giá**, **Live Sessions**.

> Figure 3.19.3.1 Trang chi tiết khóa học – Các tab quản lý

##### Tab Nội dung – Thêm Module

- **Bước 6**: Chuyển sang tab **"Nội dung"**. Nhấn **"+ Thêm Module"**.

> Figure 3.19.3.2 Tab Nội dung – Danh sách Module và nút Thêm

- **Bước 7**: Nhập **tên Module**, **thứ tự**, nhấn **"Lưu"**. Module xuất hiện trong danh sách.

> Figure 3.19.3.3 Form thêm Module mới

##### Tab Nội dung – Thêm Bài học vào Module

- **Bước 8**: Trong Module vừa tạo, nhấn **"+ Thêm bài học"**.
- **Bước 9**: Chọn **loại bài học**:
  - **Video**: Upload file video lên S3/R2
  - **Text**: Soạn nội dung Markdown
  - **Quiz**: Liên kết đề thi từ ngân hàng câu hỏi
  - **Assignment**: Tạo đề bài tập nộp file
- **Bước 10**: Điền đầy đủ nội dung, đặt **thứ tự**, nhấn **"Lưu"**. Bài học được tạo ở trạng thái **Draft**.

> Figure 3.19.3.4 Form thêm bài học – Chọn loại và nhập nội dung

##### Tab Nội dung – Publish bài học

- **Bước 11**: Nhấn vào toggle **"Draft → Published"** bên cạnh bài học để xuất bản.

> Figure 3.19.3.5 Toggle trạng thái bài học Draft/Published

- **Bước 12**: Kéo thả để sắp xếp lại thứ tự Module và Bài học.

> Figure 3.19.3.6 Kéo thả sắp xếp thứ tự bài học trong Module

##### Xuất bản khóa học

- **Bước 13**: Khi nội dung hoàn thiện, nhấn **"Xuất bản"** trên trang chi tiết khóa học.
- **Bước 14**: Hệ thống tạo **Snapshot phiên bản** (chỉ bao gồm các bài học đã Published), chuyển trạng thái khóa học sang **Published**. Học viên mới có thể tìm thấy và đăng ký.

> Figure 3.19.3.7 Nút Xuất bản khóa học và thông tin phiên bản

---

#### 3.19.4 Quản lý học viên trong khóa học

- **Bước 1**: Trong chi tiết khóa học → Tab **"Học viên"**.
- **Bước 2**: Danh sách học viên đã đăng ký: tên, email, ngày đăng ký, tiến độ, trạng thái Enrollment.
- **Bước 3**: Admin có thể xem chi tiết tiến độ học của từng học viên, hoặc thu hồi quyền truy cập.

> Figure 3.19.4.1 Tab Học viên – Danh sách và tiến độ từng học viên

---

#### 3.19.5 Quản lý Live Sessions của khóa học

- **Bước 1**: Trong chi tiết khóa học → Tab **"Live Sessions"**.
- **Bước 2**: Danh sách buổi học trực tuyến của khóa: tên, thời gian, giảng viên, số học viên tham gia.
- **Bước 3**: Nhấn **"+ Thêm buổi học"** để lên lịch buổi mới cho khóa.

> Figure 3.19.5.1 Tab Live Sessions trong quản lý khóa học

---

#### 3.19.6 Quản lý đánh giá khóa học

- **Bước 1**: Trong chi tiết khóa học → Tab **"Đánh giá"**.
- **Bước 2**: Danh sách đánh giá từ học viên: số sao, nhận xét, ngày đăng. Admin có thể **xóa** đánh giá vi phạm nội quy.

> Figure 3.19.6.1 Tab Đánh giá – Danh sách review từ học viên

---

#### 3.19.7 Lịch học của Admin (`/courses/schedule-requests`)

- **Bước 1**: Nhấn **"Yêu cầu lịch học"** trong sidebar.
- **Bước 2**: Danh sách yêu cầu mở lớp từ học viên hoặc lịch học cần phê duyệt.

> Figure 3.19.7.1 Trang Quản lý yêu cầu lịch học

---

### 3.20 Luồng Quản lý Người dùng (Admin/Staff)

#### 3.20.1 Quản lý học viên (`/users/learners`)

- **Bước 1**: Nhấn **"Người dùng → Học viên"** trong sidebar.
- **Bước 2**: Danh sách học viên: email, họ tên, ngày đăng ký, số khóa đã mua, tổng Coin đã nạp, trạng thái tài khoản. Tìm kiếm theo email/tên.

> Figure 3.20.1.1 Danh sách học viên trong Admin

- **Bước 3**: Nhấn vào học viên để xem chi tiết: lịch sử đơn hàng, tiến độ khóa học, giao dịch Coin, lịch sử thi cử.
- **Bước 4**: Admin có thể **Khóa tài khoản** hoặc **Mở khóa** nếu vi phạm.

> Figure 3.20.1.2 Chi tiết học viên – Thông tin và lịch sử hoạt động

#### 3.20.2 Quản lý nhân sự – Giảng viên & Staff (`/users/personnel`)

- **Bước 1**: Nhấn **"Người dùng → Nhân sự"**.
- **Bước 2**: Danh sách Giảng viên và Staff: tên, email, vai trò, số khóa phụ trách, ngày tham gia.
- **Bước 3**: Nhấn **"+ Mời thành viên"**.

> Figure 3.20.2.1 Danh sách nhân sự – Lecturers và Staff

- **Bước 4**: Form mời: nhập **Email**, chọn **Vai trò** (Lecturer / Staff), tùy chọn thêm vào nhóm khóa học cụ thể. Nhấn **"Gửi lời mời"**.

> Figure 3.20.2.2 Form mời Giảng viên/Staff mới

- **Bước 5**: Hệ thống gửi email mời. Người nhận click link trong email → thiết lập tài khoản → đăng nhập với quyền đã được gán.

---

### 3.21 Luồng Quản lý Blog & Cộng đồng (Admin)

#### 3.21.1 Quản lý bài Blog (`/blog`)

- **Bước 1**: Admin nhấn **"Blog"** trong sidebar.
- **Bước 2**: Danh sách bài viết: tiêu đề, tác giả, ngày đăng, số lượt xem, trạng thái (Draft/Published). Có thể lọc, tìm kiếm.

> Figure 3.21.1.1 Danh sách bài Blog trong Admin

- **Bước 3**: Nhấn **"+ Tạo bài viết"** → Form soạn thảo Markdown với preview live.

> Figure 3.21.1.2 Form soạn thảo bài Blog

- **Bước 4**: Admin có thể **Xóa** hoặc **Ẩn** bài viết vi phạm nội quy từ cộng đồng.

---

### 3.22 Luồng Quản lý Phòng học trực tuyến (Admin – `/rooms`)

- **Bước 1**: Nhấn **"Phòng học"** trong sidebar.
- **Bước 2**: Danh sách phòng học: tên, thời gian, giảng viên, số tham gia / tối đa, trạng thái (Sắp diễn ra / Đang diễn ra / Đã kết thúc).

> Figure 3.22.1 Danh sách phòng học trực tuyến trong Admin

- **Bước 3**: Nhấn **"+ Tạo phòng học"** → Điền thông tin → Nhận link và mã phòng → Chia sẻ.
- **Bước 4**: Với phòng đã kết thúc: xem số liệu buổi học, thời lượng, file ghi hình (Recording).

> Figure 3.22.2 Chi tiết phòng học đã kết thúc – Số liệu và Recording

---

### 3.23 Luồng Quản lý Tài chính (Admin – `/finance`)

#### 3.23.1 Quản lý Đơn hàng (`/finance/orders`)

- **Bước 1**: Nhấn **"Tài chính → Đơn hàng"**.
- **Bước 2**: Danh sách tất cả đơn hàng trong hệ thống. Lọc theo:
  - **Loại**: Nạp Coin, Mua khóa, Tặng khóa, Đổi Point
  - **Trạng thái**: Chờ xử lý, Hoàn thành, Thất bại, Đã hoàn
  - **Khoảng thời gian**

> Figure 3.23.1.1 Trang Đơn hàng – Bảng với bộ lọc đa chiều

- **Bước 3**: Nhấn vào đơn hàng để xem chi tiết: người mua, sản phẩm, giá trị, phương thức, lịch sử trạng thái.

> Figure 3.23.1.2 Chi tiết đơn hàng – Thông tin đầy đủ

#### 3.23.2 Quản lý Thanh toán (`/finance/payments`)

- **Bước 1**: Nhấn **"Tài chính → Thanh toán"**.
- **Bước 2**: Danh sách giao dịch tiền thật qua gateway (VNPay, Momo): mã giao dịch, gateway, số tiền, thời gian, trạng thái.

> Figure 3.23.2.1 Trang Thanh toán – Giao dịch qua payment gateway

- **Bước 3**: Dùng để đối chiếu ngân hàng/gateway khi có khiếu nại hoặc tranh chấp.

#### 3.23.3 Quản lý Phiếu hỗ trợ / Yêu cầu hoàn tiền (`/tickets`)

- **Bước 1**: Nhấn **"Tickets"** (Phiếu hỗ trợ) trong sidebar.
- **Bước 2**: Danh sách ticket từ học viên: yêu cầu hoàn tiền, phản ánh lỗi, câu hỏi hỗ trợ. Lọc theo loại, trạng thái (Mở / Đang xử lý / Đã đóng).

> Figure 3.23.3.1 Danh sách Ticket hỗ trợ

- **Bước 3**: Nhấn vào ticket để xem chi tiết yêu cầu.
- **Bước 4 – Duyệt hoàn tiền**: Nếu là ticket hoàn tiền, Admin nhấn **"Duyệt hoàn tiền"**. Hệ thống tự động:
  - Xóa Enrollment của học viên
  - Cộng Coin vào ví học viên (theo giá đã mua)
  - Ghi vào CoinLedger (type=refund)
  - Gửi thông báo cho học viên
  Nhấn **"Từ chối"** nếu không đủ điều kiện hoàn.

> Figure 3.23.3.2 Chi tiết Ticket hoàn tiền – Nút Duyệt và Từ chối

#### 3.23.4 Quản lý Coupon (`/coupons`)

- **Bước 1**: Nhấn **"Coupon"** trong sidebar.
- **Bước 2**: Danh sách coupon: mã, loại giảm giá (%), giá trị, hạn sử dụng, số lượt dùng / tối đa.

> Figure 3.23.4.1 Danh sách Coupon

- **Bước 3**: Nhấn **"+ Tạo Coupon"**. Form điền: **Mã coupon**, **% giảm giá**, **Hạn sử dụng**, **Số lượt tối đa**, **Point cần đổi** (0 = không đổi bằng Point, chỉ dùng trực tiếp).

> Figure 3.23.4.2 Form tạo Coupon mới

---

### 3.24 Luồng Phân quyền (Admin – `/permissions`)

- **Bước 1**: Nhấn **"Phân quyền"** trong sidebar.
- **Bước 2**: Trang hiển thị ma trận phân quyền RBAC: hàng = Vai trò (Admin/Staff/Lecturer/Learner), cột = Quyền hạn (tạo khóa, duyệt, xem doanh thu...).
- **Bước 3**: Admin bật/tắt từng quyền theo vai trò. Nhấn **"Lưu"**.

> Figure 3.24.1 Ma trận Phân quyền RBAC – Vai trò và quyền hạn

---

### 3.25 Luồng Quản lý Thi cử (Admin)

#### 3.25.1 Ngân hàng câu hỏi – Question Pools (`/question-pools`)

- **Bước 1**: Admin nhấn **"Câu hỏi → Question Pools"** trong sidebar.

> Figure 3.25.1.1 Sidebar Admin – Mục Question Pools

- **Bước 2**: Danh sách bộ câu hỏi theo nhóm chủ đề. Admin nhấn **"+ Tạo bộ câu hỏi"** để tạo nhóm mới (ví dụ: "Từ vựng N5", "Ngữ pháp N4").

> Figure 3.25.1.2 Danh sách Question Pools theo nhóm chủ đề

- **Bước 3**: Trong bộ câu hỏi, nhấn **"+ Thêm câu hỏi"** (`/questions`).

> Figure 3.25.1.3 Trang thêm câu hỏi vào Question Pool

- **Bước 4**: Form tạo câu hỏi điền:
  - **Nội dung câu hỏi** (text, có thể kèm ảnh/audio cho phần Nghe)
  - **Loại câu hỏi**: Trắc nghiệm 1 đáp án / Điền từ / Nghe chọn đáp án
  - **Đáp án A, B, C, D** (trắc nghiệm) → Đánh dấu đáp án đúng
  - **Giải thích đáp án** (hiển thị sau khi học viên nộp bài)
  - **Phân loại**: JLPT Level, Chủ đề (từ vựng, ngữ pháp, Kanji...)
  - **Độ khó**: Dễ / Trung bình / Khó

  Nhấn **"Lưu câu hỏi"**.

> Figure 3.25.1.4 Form tạo câu hỏi trắc nghiệm – Đáp án và phân loại

> Figure 3.25.1.5 Form tạo câu hỏi dạng Điền từ

> Figure 3.25.1.6 Form tạo câu hỏi dạng Nghe – Upload file audio

---

#### 3.25.2 Tạo bài thi Exam

- **Bước 1**: Admin nhấn **"Câu hỏi → Bài thi"** → **"+ Tạo bài thi"**.

> Figure 3.25.2.1 Nút Tạo bài thi mới

- **Bước 2**: Form tạo bài thi điền:
  - **Tên bài thi** (ví dụ: "JLPT N5 Mock Test #1")
  - **Mô tả**
  - **Loại**: JLPT Mock / Bài kiểm tra tổng hợp / Quiz khóa học
  - **Thời gian làm bài** (phút; 0 = không giới hạn)
  - **Điểm qua môn** (%)
  - **Số lần làm lại** tối đa (-1 = không giới hạn)
  - **Công khai** (học viên nào cũng thấy) hay **Gắn khóa học** cụ thể

> Figure 3.25.2.2 Form tạo bài thi – Cấu hình thời gian và điều kiện

- **Bước 3**: Chọn câu hỏi từ Question Pool:
  - **Chọn thủ công**: Tích chọn từng câu
  - **Tự động ngẫu nhiên**: Nhập số câu theo Level/Chủ đề, hệ thống random

> Figure 3.25.2.3 Chọn câu hỏi từ ngân hàng – Lọc theo Level và Chủ đề

- **Bước 4**: Xem preview thứ tự câu hỏi, kéo thả để sắp xếp lại. Nhấn **"Lưu và Xuất bản"**.

> Figure 3.25.2.4 Preview danh sách câu hỏi trong bài thi

---

#### 3.25.3 Xem kết quả thi của học viên

- **Bước 1**: Vào trang chi tiết bài thi → Tab **"Kết quả"**.
- **Bước 2**: Bảng liệt kê tất cả lượt thi: Học viên, Điểm, Thời gian nộp, Số lần thử, Xếp loại.

> Figure 3.25.3.1 Tab Kết quả bài thi – Danh sách lượt thi của học viên

- **Bước 3**: Nhấn vào từng lượt để xem chi tiết: đáp án của học viên, câu đúng/sai, thời gian từng câu.

> Figure 3.25.3.2 Chi tiết lượt thi – Đáp án từng câu của học viên

---

### 3.26 Luồng Phân tích & Báo cáo (Admin Analytics)

#### 3.26.1 Báo cáo học tập (`/analytics/learning`)

- **Bước 1**: Nhấn **"Analytics → Học tập"**.
- **Bước 2**: Dashboard hiển thị:
  - **Tổng số bài học đã hoàn thành** trong hệ thống (theo ngày/tuần/tháng)
  - **Tỉ lệ hoàn thành khóa học** trung bình
  - **Thời gian học trung bình** mỗi ngày
  - **Biểu đồ engagement**: Số học viên hoạt động theo thời gian
  - **Top khóa học** được học nhiều nhất
  - **Phân bổ theo cấp độ JLPT**: N5/N4/N3...

> Figure 3.26.1.1 Dashboard Phân tích học tập – Biểu đồ engagement

> Figure 3.26.1.2 Top khóa học theo số học viên hoàn thành

---

#### 3.26.2 Báo cáo doanh thu (`/analytics/revenue`)

- **Bước 1**: Nhấn **"Analytics → Doanh thu"**.
- **Bước 2**: Dashboard hiển thị:
  - **Tổng doanh thu** (VND) trong khoảng thời gian chọn
  - **Biểu đồ doanh thu** theo ngày/tuần/tháng
  - **Top khóa học** theo doanh thu
  - **Phân bổ theo loại đơn hàng**: Nạp Coin, Mua khóa, Tặng khóa
  - **So sánh kỳ trước** (tháng này vs tháng trước)

> Figure 3.26.2.1 Dashboard Doanh thu – Biểu đồ theo thời gian

> Figure 3.26.2.2 Bảng Top khóa học theo doanh thu

---

#### 3.26.3 Báo cáo người dùng (`/analytics/users`)

- **Bước 1**: Nhấn **"Analytics → Người dùng"**.
- **Bước 2**: Dashboard hiển thị:
  - **Tổng học viên đăng ký mới** theo tuần/tháng
  - **Biểu đồ retention**: Tỉ lệ học viên quay lại
  - **Phân bổ địa lý**: Học viên đến từ đâu
  - **Tỉ lệ chuyển đổi**: Xem khóa → Đăng ký → Mua
  - **Học viên hoạt động / Học viên không hoạt động**

> Figure 3.26.3.1 Dashboard Người dùng – Biểu đồ đăng ký mới và retention

---

#### 3.26.4 Báo cáo tổng hợp (`/analytics/reports`)

- **Bước 1**: Nhấn **"Analytics → Báo cáo"**.
- **Bước 2**: Chọn loại báo cáo, khoảng thời gian. Nhấn **"Tạo báo cáo"**.
- **Bước 3**: Hệ thống tạo báo cáo dạng bảng. Nhấn **"Xuất Excel"** hoặc **"Xuất PDF"** để tải về.

> Figure 3.26.4.1 Trang Báo cáo tổng hợp – Chọn loại và xuất file

---

### 3.27 Luồng Audit Log (Admin – `/audit`)

- **Bước 1**: Admin nhấn **"Audit Log"** trong sidebar.
- **Bước 2**: Trang hiển thị toàn bộ lịch sử hành động quan trọng trong hệ thống:
  - Ai thực hiện (email + vai trò)
  - Hành động gì (tạo, sửa, xóa, duyệt...)
  - Đối tượng bị tác động (khóa học, người dùng, đơn hàng...)
  - Thời gian chính xác
  - IP address

> Figure 3.27.1 Trang Audit Log – Bảng lịch sử hành động hệ thống

- **Bước 3**: Lọc theo: Người thực hiện, Loại hành động, Khoảng thời gian.
- **Bước 4**: Nhấn vào một record để xem payload chi tiết (before/after khi có thay đổi dữ liệu).

> Figure 3.27.2 Chi tiết Audit Record – Dữ liệu before/after

---

### 3.28 Luồng Cài đặt hệ thống (Admin – `/settings`)

#### 3.28.1 Cài đặt chung

- **Bước 1**: Nhấn **"Cài đặt"** trong sidebar Admin.
- **Bước 2**: Tab **"Chung"**: Tên hệ thống, Logo, Email hỗ trợ, Timezone mặc định.

> Figure 3.28.1.1 Cài đặt chung – Thông tin hệ thống

#### 3.28.2 Cài đặt thông báo hệ thống

- **Bước 1**: Tab **"Thông báo"**: Cấu hình email SMTP (host, port, username, password). Bật/tắt từng loại email tự động: chào mừng, nhắc học, xác nhận mua, thông báo hoàn tiền.

> Figure 3.28.2.1 Cài đặt SMTP – Server và template email

#### 3.28.3 Cài đặt phân quyền (`/settings/permissions`)

- **Bước 1**: Tab **"Phân quyền"**: Ma trận RBAC chi tiết.
- **Bước 2**: Tick/untick từng quyền, nhấn **"Lưu"** → Có hiệu lực ngay.

> Figure 3.28.3.1 Ma trận Phân quyền RBAC

---

## IV. Xử lý sự cố thường gặp

### 4.1 Sự cố xác thực

| Sự cố | Giải pháp |
|---|---|
| Không nhận được email xác nhận | Kiểm tra hộp thư Spam; vào `/resend-verification` để gửi lại |
| Mã OTP 2FA không đúng | Đồng bộ thời gian điện thoại; dùng mã Recovery nếu mất thiết bị |
| Đăng nhập Google thất bại | Thử xóa cookie, dùng cửa sổ ẩn danh |
| Tài khoản bị khóa | Liên hệ Admin với email và lý do |

### 4.2 Sự cố học tập

| Sự cố | Giải pháp |
|---|---|
| Bài học không đánh dấu hoàn thành | Nhấn nút **"Đánh dấu hoàn thành"** ở cuối bài; xóa cache trình duyệt |
| Video không phát | Kiểm tra kết nối mạng; thử trình duyệt khác |
| Không thấy bài học mới | Giảng viên chưa Publish; liên hệ giảng viên hoặc Admin |
| Streak bị mất dù đã học | Kiểm tra múi giờ trong Cài đặt hồ sơ |
| Không vào được khóa đã mua | Vào **Khóa học của tôi**; liên hệ hỗ trợ nếu không thấy |

### 4.3 Sự cố thanh toán

| Sự cố | Giải pháp |
|---|---|
| Đã thanh toán nhưng Coin chưa vào | Chờ tối đa 5 phút; hỗ trợ kèm mã giao dịch |
| Không đủ Coin khi mua khóa | Nạp thêm Coin trong **Dashboard → Ví** |
| Coupon không áp dụng được | Kiểm tra hạn sử dụng và điều kiện coupon |
| Yêu cầu hoàn tiền bị từ chối | Xem lý do trong ticket; liên hệ hỗ trợ trực tiếp |

### 4.4 Sự cố Meet WebRTC

| Sự cố | Giải pháp |
|---|---|
| Không nghe/thấy âm thanh | Cấp quyền Microphone trong cài đặt trình duyệt |
| Video bị giật/lag | Tắt camera; hệ thống tự dùng TURN/UDP khi mạng yếu |
| Không kết nối được (4G/VPN) | Hệ thống fallback sang TURN/TLS (port 5349) tự động |
| Bị đẩy ra khỏi phòng | Làm mới trang; click lại link tham gia |
| Không tìm thấy camera/mic | Kiểm tra driver thiết bị; thử cắm lại USB |

**Kiểm tra kết nối WebRTC:**
1. Truy cập [livekit.io/connection-test](https://livekit.io/connection-test)
2. Nhập: `wss://api.torii.sbs/socket-b`
3. Xem kết quả từng bước test

### 4.5 Liên hệ hỗ trợ

| Kênh | Thông tin |
|---|---|
| **Trong ứng dụng** | Dashboard → Hỗ trợ → Tạo ticket |
| **Email** | support@torii.sbs |
| **Yêu cầu** | Mô tả lỗi + Thời gian xảy ra + Ảnh chụp màn hình |

---

## V. Phụ lục – Danh sách đầy đủ màn hình hệ thống

### Web Learner (https://app.torii.sbs)

| Route | Màn hình |
|---|---|
| `/` | Trang chủ (Landing Page) |
| `/login` | Đăng nhập |
| `/register` | Đăng ký tài khoản |
| `/verify-request` | Thông báo chờ xác nhận email |
| `/verify` | Xác nhận tài khoản qua email |
| `/verify-2fa` | Xác minh 2FA khi đăng nhập |
| `/resend-verification` | Gửi lại email xác nhận |
| `/forgot-password` | Quên mật khẩu |
| `/reset-password` | Đặt lại mật khẩu |
| `/courses` | Danh sách khóa học công khai |
| `/courses/[slug]` | Chi tiết khóa học công khai |
| `/blog` | Danh sách Blog |
| `/blog/[slug]` | Bài Blog chi tiết |
| `/live-classes` | Danh sách Live Class công khai |
| `/live-classes/[slug]` | Chi tiết Live Class |
| `/lecturers` | Danh sách Giảng viên |
| `/learners` | Cộng đồng Học viên |
| `/exams` | Danh sách Exam công khai |
| `/checkout` | Trang thanh toán mua khóa |
| `/dashboard` | Dashboard tổng quan |
| `/dashboard/my-courses` | Khóa học của tôi |
| `/dashboard/exams` | Danh sách bài thi |
| `/dashboard/exams/[id]` | Chi tiết bài thi |
| `/dashboard/exams/[id]/take` | Làm bài thi |
| `/dashboard/exams/[id]/review` | Xem kết quả bài thi |
| `/dashboard/exams/[id]/history` | Lịch sử thi |
| `/dashboard/flashcards` | Danh sách Flashcard Deck |
| `/dashboard/flashcards/[deckId]` | Phiên ôn tập Flashcard |
| `/dashboard/assignments` | Danh sách bài tập |
| `/dashboard/feed` | Feed cộng đồng |
| `/dashboard/leaderboard` | Bảng xếp hạng |
| `/dashboard/achievements` | Thành tích và huy hiệu |
| `/dashboard/rewards` | Đổi Point lấy Coupon |
| `/dashboard/wallet` | Ví Coin |
| `/dashboard/payment` | Lịch sử thanh toán |
| `/dashboard/certificates` | Chứng chỉ |
| `/dashboard/notes` | Ghi chú cá nhân |
| `/dashboard/wishlist` | Danh sách yêu thích |
| `/dashboard/reviews` | Đánh giá khóa học |
| `/dashboard/members` | Cộng đồng thành viên |
| `/dashboard/statistics` | Thống kê học tập |
| `/dashboard/notifications` | Thông báo |
| `/dashboard/history` | Lịch sử hoạt động |
| `/dashboard/placement-test` | Kiểm tra xếp lớp |
| `/dashboard/profile` | Hồ sơ cá nhân |
| `/dashboard/settings` | Cài đặt |
| `/dashboard/support` | Hỗ trợ – Tạo ticket |
| `/courses/[slug]/modules` | Nội dung khóa học |
| `/courses/[slug]/learn` | Xem bài học |
| `/courses/[slug]/quizzes` | Quiz trong khóa |
| `/courses/[slug]/progress` | Tiến độ khóa học |
| `/courses/[slug]/resources` | Tài nguyên khóa học |
| `/courses/[slug]/completion` | Hoàn thành khóa |
| `/courses/[slug]/certificate` | Chứng chỉ khóa học |
| `/ai-sensei` | AI Sensei – Trang chủ |
| `/ai-sensei/chat` | Chat với AI Sensei |
| `/ai-sensei/drill` | Luyện tập nhanh |
| `/ai-sensei/flashcards` | Flashcard AI |
| `/ai-sensei/grammar` | Tra cứu Ngữ pháp |
| `/ai-sensei/translate` | Dịch thuật AI |
| `/ai-sensei/roleplay` | Nhập vai hội thoại |
| `/ai-sensei/resources` | Tài nguyên AI |
| `/analytics` | AI Analytics |

### Web Admin (https://admin.torii.sbs)

| Route | Màn hình |
|---|---|
| `/` | Dashboard Admin |
| `/courses` | Danh sách khóa học |
| `/courses/[id]` | Chi tiết khóa học |
| `/courses/[id]/live-sessions` | Live Sessions khóa học |
| `/courses/[id]/reviews` | Đánh giá khóa học |
| `/courses/schedule-requests` | Yêu cầu lịch học |
| `/users/learners` | Quản lý học viên |
| `/users/personnel` | Quản lý Giảng viên/Staff |
| `/question-pools` | Ngân hàng câu hỏi |
| `/questions` | Quản lý câu hỏi |
| `/blog` | Quản lý Blog |
| `/rooms` | Quản lý phòng học |
| `/finance/orders` | Đơn hàng |
| `/finance/payments` | Thanh toán |
| `/tickets` | Phiếu hỗ trợ / Hoàn tiền |
| `/coupons` | Quản lý Coupon |
| `/analytics/learning` | Analytics Học tập |
| `/analytics/revenue` | Analytics Doanh thu |
| `/analytics/users` | Analytics Người dùng |
| `/analytics/reports` | Báo cáo tổng hợp |
| `/assignments` | Quản lý bài tập |
| `/audit` | Audit Log |
| `/permissions` | Phân quyền RBAC |
| `/settings` | Cài đặt hệ thống |

### Meet App (https://meet.torii.sbs)

| Route | Màn hình |
|---|---|
| `/` | Trang nhập mã phòng |
| `/[roomId]` | Phòng học WebRTC |

---

*Tài liệu được duy trì bởi **Torii Nihongo Team**. Cập nhật lần cuối: 02/2026.*
