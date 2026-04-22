# 🏛 Torii System Architecture (Detailed Design)

Tài liệu này mô tả chi tiết về kiến trúc tổng thể của hệ sinh thái Torii, dựa trên mô hình **Hub-and-Spoke Microservices (Event-Driven)** tích hợp khả năng xử lý thời gian thực và Trí tuệ nhân tạo (AI).

## 1. 🌐 Client Side (Tầng Giao Diện)

Hệ thống được thiết kế đa nền tảng, bao gồm các ứng dụng phân tán phục vụ người dùng cuối:

- **Web Learner (Next.js):** Ứng dụng chính dành cho học viên. Sử dụng Next.js để tận dụng SSR/SSG giúp tối ưu hóa SEO và cung cấp trải nghiệm tải trang (FCP) nhanh chóng.
- **Web Admin (Vite + React):** Bảng điều khiển quản trị (Dashboard) dành cho Quản trị viên (Staff) và Giáo viên (Instructor). Tổ chức theo dạng SPA (Single Page Application) giúp thao tác nội bộ mượt mà.
- **Tomi Mobile (Flutter):** Ứng dụng di động (iOS/Android). Giao tiếp với Backend thông qua REST API truyền thống và nhận các sự kiện thời gian thực (Push notification / WebSocket).
- **Meet SPA (Vite + LiveKit):** Một ứng dụng Client độc lập chuyên trách cho phòng học trực tuyến (WebRTC). Việc tách riêng giúp ứng dụng tập trung tải các thư viện WebRTC nặng và kết nối trực tiếp đến LiveKit Server để stream âm thanh/hình ảnh.

---

## 2. 🗼 Main Backend & Data Layer (Tầng Xử Lý Tầm Trung & Cốt Lõi)

Được viết trên nền tảng **NestJS** (chế độ Monorepo), tầng Backend chia thành 2 lớp rõ rệt nhằm cân bằng tải và tách biệt Logic nghiệp vụ:

### A. API Gateway Layer (Proxy & Guard)
- **Cổng giao tiếp duy nhất (Port 8080):** Toàn bộ Request HTTP từ Client đều phải truy cập qua điểm vào (Entry Point) này. Gateway ẩn đi kiến trúc nội bộ phức tạp bên dưới.
- **Chức năng chính:**
  - **Authentication Guard:** Xác thực JWT Token đa nền tảng. Chỉ các Request hợp lệ mới được phép đi sâu vào hệ thống.
  - **Translation to NATS:** Gateway đóng vai trò là một **NATS Client**. Nó đóng gói HTTP Request thành các NATS Messages (`Request-Reply` pattern) và định tuyến (Route) xuống đúng Microservice đang đợi.
- **Cache Access:** Kết nối trực tiếp tới **Redis Cache** để phản hồi dữ liệu ít thay đổi (Ví dụ: Thông tin cơ bản khóa học) ngay tại mức Gateway, giảm độ trễ tối đa.

### B. NATS Services Layer (Hệ sinh thái Microservices)
Đây là tập hợp các Worker thực sự xử lý Business Logic. Chúng hoàn toàn không mở port HTTP mà đóng vai trò như các Listener (Queue) trên nền NATS:

1. **Identity Service (`identity_queue`):** 
   - Quản lý định danh tài khoản, phân quyền (RBAC: Admin, Staff, Student...).
   - Xác thực đăng nhập qua Email/Mật khẩu và OAuth (Google, Facebook).
   - Cung cấp xác thực 2 bước (2FA).
2. **Academy Service (`academy_queue`):** 
   - Đóng vai trò là linh hồn của hệ thống quản lý đào tạo (LMS Engine).
   - Tổ chức nội dung học: Chương trình, Khóa học (Course Profile, Cohort), Bài giảng, Tài liệu.
   - Nhánh Đánh giá: Chấm điểm bài thi thử (JLPT Mock Exams).
   - Nhánh Trí nhớ: Ứng dụng thuật toán Spaced Repetition System (SRS) cho Study Set, Flashcard.
   - Nhánh Thương mại: Quản lý đăng ký học, Đơn hàng, Coupon.
3. **Meet Service (`meet_queue`):** 
   - Quản lý dữ liệu tĩnh và Logic của phòng học Live (Cấu hình quyền Chat, Giơ tay...).
   - Xin cấp phát Token an toàn từ LiveKit API cho Client kết nối.
   - Quản lý lịch trun (Live Schedule Request).
4. **Agents Service (`agents_queue`):** 
   - Đóng vai trò quản lý Logic tương tác AI dạng văn bản.
   - Thiết kế tích hợp luồng **FastMCP** (Model Context Protocol): AI có khả năng truy vấn CSDL thông qua Service này để đọc hồ sơ, trình độ hiện tại, bài sai gần nhất của người dùng, từ đó mới ra quyết định phản hồi chính xác (Personalized AI Tutor).

### C. Data Layer (Tầng Lưu Trữ)
- **PostgreSQL (`Source of Truth`):** Hệ quản trị CSDL quan hệ chính thông qua Prisma ORM, lưu toàn bộ trạng thái bền vững của bài học, hóa đơn... và đồng bộ thiết kế schema chia sẻ chung cho các services.
- **Redis (`Fast Storage`):** Dùng để lưu trữ Session, Cache Request từ Gateway.

---

## 3. 📡 Infrastructure (Hạ Tầng Giao Tiếp Tốc Độ Cao)

- **NATS + JetStream:** Làm xương sống trung tâm.
  - NATS thông thường: Xử lý Request-Reply cho các lệnh lấy dữ liệu trực tiếp (Đăng nhập, Lấy danh sách khóa học).
  - JetStream: Xử lý Event-Driven Pub/Sub. Các event như `UserCreated` được phát ra để hệ thống email bắt lấy và thực hiện một cách bất đồng bộ (Asynchronous) mà không khóa luồng đi của người dùng.
- **LiveKit Server / Nút WebRTC:** 
  - Máy chủ SFU xử lý bắt cặp và định tuyến hàng ngàn luồng stream audio/video độ trễ dưới <100ms.
- **LiveKit Ingress:** 
  - Công cụ thu nhận luồng phát bên ngoài qua (RTMP/WHIP), dành cho Giáo viên phát video quay dựng sẵn hoặc livestream qua OBS qua hệ thống phòng Live class.

---

## 4. 🧠 AI Microservice (Trợ lý Voice AI Độc Lập)

- **Voice-Agent Service:**
  - Microservice này tách biệt hoàn toàn vì nó không đáp ứng theo Request HTTP thông thường mà "Tham gia" trực tiếp bằng WebRTC (Listen trực tiếp âm thanh từ LiveKit stream).
  - SDK **LiveKit Agents** lấy âm thanh của người dùng đẩy trực tiếp lên nền tảng **Google AI Gemini Live**, từ đó LLM tính toán và chuyển ngữ phản hồi Voice ngược lại.
  - Tách kiến trúc này đảm bảo tính năng Voice cực kỳ nặng về I/O Audio processing không làm sập server quản lý database LMS chính.

---

## 5. 🔌 External Services (Tích Hợp Giao Diện Bên Ngoài)

Hệ thống tận dụng chuyên môn của bên thứ ba ở các thành tố không cốt lõi nhưng đòi hỏi bền vững cao:
- **AWS S3:** Lưu trữ Object Cloud cho ảnh đại diện, file Media bài giảng, và hứng luồng Cloud Recording (video phòng học đã kết thúc).
- **PayOS:** Cổng thanh toán chuyển khoản VietQR tự động hóa.
- **Firebase Admin/FCM:** Đảm nhận việc phiễu và Push Notification đa nền tảng xuống màn hình học viên.
- **Google AI Gemini:** Nền tảng Large Language Model cốt lõi cung cấp Engine sinh trí tuệ từ dịch chuỗi đến xử lý phản hồi thoại.
