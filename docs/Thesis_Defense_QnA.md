# 🏯 Torii Nihongo - Full Thesis Defense Q&A

Tài liệu này chứa toàn bộ câu trả lời cho các câu hỏi giả định từ Hội đồng bảo vệ đồ án.

---

## 🏗 Nhóm 1: Kiến trúc & Hệ thống (Architecture)

### 1. Tại sao em chọn mô hình Microservices thay vì Monolith cho một dự án học tập?
- **Trả lời:** Em chọn Microservices vì 3 tính chất:
    - **Khả năng mở rộng (Scalability):** Dịch vụ Academy (học thuật) chắc chắn sẽ gánh tải nặng hơn service Meet (video call). Với Microservices, ta có thể scale riêng lẻ service Academy mà không cần tốn tài nguyên cho các phần khác.
    - **Cô lập lỗi (Fault Isolation):** Nếu service Meet bị sập do quá tải WebRTC, hệ thống vẫn duy trì hoạt động cho học viên vào làm Flashcards hay ôn tập bài học ở Academy bình thường.
    - **Sự linh hoạt về công nghệ (Technology Agnostic):** Cho phép các nhóm phát triển dùng ngôn ngữ khác nhau (Python cho AI agent, NestJS cho Core Backend).

### 2. Vai trò của Turborepo trong dự án này là gì? Nó giúp ích gì cho quá trình phát triển (Development Workflow)?
- **Trả lời:** Turborepo quản lý dự án monorepo này. Nó giúp:
    - **Caching:** Không cần build lại những package chưa thay đổi (ví dụ: schemas, protocol).
    - **Parallelism:** Chạy song song lệnh test/build của tất cả apps cùng lúc, tối ưu thời gian CI/CD.
    - **Shared Packages:** Dễ dàng chia sẻ DTOs/Schemas (Zod) hoặc Protobuf definitions giữa Backend và Frontend mà không cần copy code, đảm bảo type-safety từ đầu đến cuối.

### 3. Em hãy giải thích mô hình giao tiếp giữa các Microservices. Tại sao lại dùng NATS thay vì gọi REST API trực tiếp giữa các service?
- **Trả lời:** REST API là giao tiếp đồng bộ (Sync), nếu Service B xử lý chậm, Service A sẽ bị treo theo. NATS hỗ trợ:
    - **Độ trễ thấp (Low Latency):** Giao tiếp TCP cực nhanh, phù hợp cho hệ thống real-time.
    - **Mô hình Request-Response & Pub/Sub:** Linh hoạt giữa việc đợi kết quả và chỉ bắn sự kiện rồi quên (Fire-and-forget).
    - **Service Discovery tự nhiên:** Các service không cần rườm rà cấu hình IP của nhau, chỉ cần đăng ký qua tên "Subject" trên NATS.

### 4. NATS JetStream giúp gì cho hệ thống của em trong trường hợp một service bị sập (down)?
- **Trả lời:** JetStream cung cấp tính năng **Message Persistence** (Lưu trữ tin nhắn). Ví dụ: Nếu service thông báo (Notification) bị sập, tin nhắn vẫn nằm trên "Stream". Khi service Notification khởi động lại, nó sẽ "Replay" (đọc lại) những event chưa được xử lý và gửi thông báo tới người dùng, đảm bảo không có dữ liệu nào bị mất (Eventual Consistency).

### 5. Dự án của em có 5 microservices, nếu Gateway bị sập thì toàn bộ hệ thống sẽ thế nào? Em có giải pháp nào để xử lý Single Point of Failure (SPOF) ở Gateway không?
- **Trả lời:** Nếu Gateway sập, hệ thống sẽ ngừng nhận request từ Client (web/mobile). Giải pháp xử lý:
    - Triển khai **nhiều instance Gateway** cùng lúc và đặt đằng sau một **Load Balancer** (như Nginx, HAProxy, hoặc Kubernetes Ingress).
    - Sử dụng **Health Check** để Load Balancer tự động phát hiện instance Gateway chết và điều hướng traffic sang instance khác đang sống.

### 6. Sự khác biệt giữa việc sử dụng Protobuf và JSON trong giao tiếp nội bộ dự án của em là gì?
- **Trả lời:**
    - **Về hiệu năng:** Protobuf mã hóa dữ liệu thành dạng binary (nhị phân), giúp dung lượng gói tin nhỏ hơn (giảm tới 60-80% so với JSON) và parse/decode cực kỳ nhanh.
    - **Tính nhất quán (Type-safe):** Protobuf bắt buộc các service tuân thủ cấu trúc dữ liệu đã khai báo trong file `.proto`. Điều này loại bỏ hoàn toàn các lỗi "thiếu field" hay "sai kiểu dữ liệu" trong giao tiếp nội bộ.

---

## 🎙 Nhóm 2: Thời gian thực & Video Call (WebRTC/LiveKit)

### 7. Tại sao em chọn LiveKit để xây dựng tính năng lớp học trực tuyến? Nó có ưu thế gì so với Zoom SDK hay Agora?
- **Trả lời:** 
    - **Làm chủ hạ tầng & Chi phí:** LiveKit là mã nguồn mở (Open-source), cho phép tự host trên server của mình thay vì trả phí tính theo phút rất cao như Agora/Twilio.
    - **Tích hợp sâu:** LiveKit có hệ sinh thái SDK tuyệt vời cho cả Flutter, Web và Node.js, đồng thời thiết kế theo chuẩn Go microservices nên rất dễ tích hợp với NATS.
    - **AI Tích hợp:** Hỗ trợ tính năng LiveKit Agents - cực kỳ cần thiết cho phần trình trợ lý AI Tutor trong dự án.

### 8. Cơ chế WebRTC hoạt động như thế nào trong dự án của em? Vai trò của SFU (Selective Forwarding Unit) là gì?
- **Trả lời:** WebRTC trong dự án sử dụng cấu trúc **SFU (Selective Forwarding Unit)**. Thay vì mỗi học viên gọi P2P (Mesh) cho tất cả mọi người trong lớp (gây cạn kiệt băng thông thiết bị), thiết bị của học viên chỉ gửi **một luồng duy nhất** lên server SFU (LiveKit). Sau đó, LiveKit sẽ xử lý và chuyển phát tuần tự luồng video đó tới những ngời nhận cần xem, giúp thiết bị di động tiết kiệm tối đa pin và CPU.

### 9. Làm sao để em quản lý Token và quyền truy cập (Room Permissions) khi một học viên tham gia vào lớp học trực tuyến?
- **Trả lời:** Em sử dụng `livekit-server-sdk` đặt ở Identity Service/Meet Service. Khi học viên mở lớp:
    1. Gateway/Backend nhận request, kiểm tra DB xem người học đã mua khóa học đó chưa.
    2. Nếu hợp lệ, backend sử dụng AccessKey/SecretKey của LiveKit để sinh ra một JWT **Access Token**.
    3. Trong token cài đặt sẵn các permissions (`canPublish`, `canSubscribe`, tên `room`).
    4. Client nhận token này và dùng nó để join trực tiếp vào LiveKit server.

### 10. Nếu kết nối internet của học viên bị yếu, hệ thống LiveKit của em sẽ xử lý như thế nào để đảm bảo lớp học không bị gián đoạn?
- **Trả lời:** LiveKit hỗ trợ mạnh mẽ **Simulcast**. Phía người gửi (ví dụ: màn hình giáo viên) sẽ đẩy lên hệ thống 3 chất lượng cùng lúc (High, Medium, Low). Server giả định thấy mạng của một em học viên bị rớt/độ trễ cao (packet loss), server sẽ chủ động **chỉ chuyển luồng chất lượng Low** hoặc chỉ gửi âm thanh (audio-only) tới thiết bị đó để duy trì kết nối cho đến khi mạng khỏe lại.

### 11. Tính năng ghi hình (Recording) buổi học được thực hiện ở phía Server hay Client? Em quản lý tài nguyên lưu trữ video như thế nào?
- **Trả lời:** Việc ghi âm/ghi hình thực hiện ở **Server-side (LiveKit Egress)**, không lưu trên trình duyệt client để đồng bộ chất lượng tốt nhất, không gặp lỗi tab treo. Video xuất ra sẽ được cấu hình tự động đẩy (upload) lên các AWS S3 hoặc Object Storage, giúp dễ dàng share lại cho học viên học sau này theo dạng VOD (Video on Demand).

---

## 🤖 Nhóm 3: AI & Trình trợ lý (AI Tutor/FastMCP)

### 12. Kiến trúc FastMCP là gì? Tại sao em cần nó để AI có thể trả lời chính xác về tiến độ học tập của người dùng?
- **Trả lời:** FastMCP (Dựa trên Model Context Protocol) là một giao thức cho phép AI gọi các công cụ (tools) vào hệ thống cục bộ. Thông thường AI (Gemini) bị cô lập trên Cloud, không thể truy cập DB của trung tâm. Với FastMCP, khi người dùng hỏi "Tiến độ của tôi", AI sẽ gọi FastMCP Tool lấy đúng profile `userId` đó rồi dùng dữ liệu thực từ Prisma Database để kết luận cá nhân hóa chứ không phải tư vấn chung chung.

### 13. Làm sao để đảm bảo AI (Gemini) không trả lời sai (hallucination) dữ liệu từ Database?
- **Trả lời:** Em áp dụng cách tiếp cận **RAG (Retrieval-Augmented Generation)** kết hợp FastMCP. Prompt không chỉ đưa câu hỏi, mà FastMCP Tools sẽ lấy chính xác Context "Sự thật" (ví dụ chi tiết từ vựng bài 2) và chèn luôn Context đó vào Prompt với yêu cầu: "Chỉ được trả lời bằng kiến thức được liệt kê sau đây, tuyệt đối không bịa đặt." 

### 14. Em sử dụng Prompt Engineering như thế nào để "ép" AI đóng vai một Sensei (giáo viên)?
- **Trả lời:** Bằng System Prompt cực kỳ chi tiết (Role-playing). Trong đó em định nghĩa rõ: 
    - Persona: Bạn là "Sensei Torii" - Giáo viên tiếng Nhật nghiêm khắc nhưng dễ thương.
    - Cấu trúc: Cứ giải thích phải có **Kanji**, **Hiragana** và **Nghĩa tiếng Việt**, sau đó ghép vào câu ví dụ ngữ cảnh (Contextual Example).
    - Tông giọng: Lịch sự.

### 15. Tính năng Voice Agent (Gemini Live) hoạt động như thế nào? Quy trình từ lúc người dùng nói -> AI xử lý -> AI trả lời bằng giọng nói diễn ra qua những bước nào?
- **Trả lời:** Quy trình gồm 4 bước kết nối qua WebRTC:
    1. **Audio Input**: Mic người dùng thu âm truyền lên server LiveKit.
    2. **VAD (Voice Activity Detection) / STT**: Detect khi người dùng ngắt câu -> Chuyển Audio thành Text (hoặc stream audio thẳng lên LLM Gemini).
    3. **LLM Inference**: Gemini nhận text ngữ cảnh và đưa ra câu trả lời text.
    4. **TTS (Text-to-Speech)**: Azure TTS/Edge TTS hoặc tích hợp sẵn của Gemini Voice chuyển đổi đoạn trả lời thành byte audio -> Đẩy qua LiveKit phát ở loa học viên.

### 16. Em xử lý độ trễ (latency) khi giao tiếp bằng giọng nói với AI như thế nào để người dùng không cảm thấy "ngượng"?
- **Trả lời:** Thay vì đợi AI suy nghĩ viết cả đoạn văn dài mới đọc TTS, em sử dụng kỹ thuật **Streaming Processing** (Pipeline). AI nhả ra token/từ nào, hệ thống lập tức thực hiện TTS từ đó và phát trực tiếp (WebRTC byte stream) chứ không đợi kết quả cuối (Wait until end). Điều này gọt dũa độ trễ cảm nhận xuống dưới ~800ms.

---

## 🗄 Nhóm 4: Dữ liệu & Persistence (Prisma/Redis/Drift)

### 17. Tại sao em lại kết hợp cả PostgreSQL và Redis? Redis đóng vai trò gì ngoài việc làm Cache?
- **Trả lời:** PostgreSQL xử lý dữ liệu chuẩn ACID, phức tạp và bền vững (Users, Courses). Còn Redis hoạt động trên RAM có tốc độ cực lớn, em dùng cho:
    - **Database Cache**: Bộ từ vựng flashcard truy xuất siêu nhiều và giống nhau.
    - **Rate Limiting**: Giới hạn số lần thử 2FA sai (Block tạm thời).
    - **Trạng thái Real-time**: Ai đang Online/Offline, phòng nào đang bật cờ Raise-hand. 

### 18. Em hãy giải thích cách Prisma xử lý quan hệ giữa các bảng trong một hệ thống Microservices (vốn có Database riêng biệt).
- **Trả lời:** Microservices nguyên tắc không được `JOIN` database của service khác. Em sử dụng **Data Replication / Data Redundancy** (ví dụ lưu thêm tên giáo viên vào DB Academy) hoặc triển khai **API Composition** - Dùng NATS request sang ID Service lấy Object thông tin người dùng, sau đó ở cấp Logic Code gộp (merge) lại với thông tin Academy trước khi trả về REST API Gateway.

### 19. Làm sao để em đồng bộ dữ liệu giữa Database của Mobile (Drift - SQLite) và Backend (PostgreSQL)?
- **Trả lời:** Em sử dụng chiến lược **Timestamp-based Syncing** và Event.
    - Mỗi khi có mạng, mobile app bắn lên server 1 mảng DTO thay đổi Offline (chứa `updatedAt`). Server check tính hợp lệ, sau đó áp dụng Last Write Wins.
    - Em sử dụng **Idempotency Key** trên request để đảm bảo network lag sinh ra double request không áp trùng lặp progress.

### 20. Chiến lược định danh (ID) cho các bản ghi của em là gì? Em có dùng UUID không, tại sao?
- **Trả lời:** Mọi định danh của em là **UUID (v4)** hoặc nanoid. Lý do:
    - Chống dò tìm tài nguyên hệ thống từ người dùng (không đoán được ID=105 là tài liệu bí mật).
    - **Global Uniqueness**: Với Microservices, ta có thể tự tin tạo ID ngay từ Frontend hay các hệ thống Data khác gửi vào mà không sợ xung đột Primary Key.

### 21. Em hãy giải thích thuật toán SRS (Spaced Repetition System) mà em đã cài đặt. Các tham số như quality, interval, easiness factor ảnh hưởng thế nào đến thời gian hiển thị lại thẻ card?
- **Trả lời:** Thuật toán SRS rút gọn của em dựa trên cơ chế đánh giá (Quality) của học viên (như trong hàm `calculateSrsInterval`):
    - `Quality = 0` (Quên): Reset thẻ về `LEARNING`, hiện lại ngay sau **60 giây** (1 phút).
    - `Quality = 1` (Thuộc): Thẻ lên mức `MASTERED`. Lần đầu giãn ra 1 ngày. Lần review đúng tiếp theo sẽ lấy **(Interval cũ x 2.5 lần multiplier)**, tức 2.5 ngày rồi 6.25 ngày. 
    - Thẻ nào học viên dở, hệ thống ép học lại ngay lập tức -> Rất sát thực tế trí nhớ não người (Ebbinghaus Forgetting Curve).

---

## 📱 Nhóm 5: Mobile App (Flutter/Riverpod)

### 22. Tại sao em chọn Riverpod làm State Management? Nó giải quyết vấn đề gì mà Provider hay Bloc không làm tốt bằng?
- **Trả lời:** BLoC quá cồng kềnh cho các màn hình nhỏ, còn thư viện `Provider` gốc hay dính lỗi runtime `ProviderNotFoundException`. **Riverpod** sinh ra Provider là Global (khai báo ngoài scope tree), do đó em bắt được compile-safe bugs, và dùng được ref logic từ Service không cần chuyền theo biến `BuildContext` UI lằng nhằng. Tính năng `AsyncValue` tự động cover loading/error/data rất mượt.

### 23. App Mobile của em có hỗ trợ chế độ Offline không? Nếu có, em xử lý xung đột dữ liệu (Conflict Resolution) như thế nào khi app có mạng trở lại?
- **Trả lời:** Có, các kho dữ liệu cá nhân như user profile, JWT token và tiến trình khóa học tạm lưu tại Mobile nhờ thư viện **Drift**. Xung đột được xử lý theo "Last Write Wins" timestamp-based, mobile gửi dữ liệu dồn (batch) kèm datetime. Server PostgreSQL xử chèn.

### 24. Cơ chế Refresh Token trên Mobile được em cài đặt như thế nào để người dùng không phải đăng nhập lại liên tục?
- **Trả lời:** Em sử dụng tính năng **Interceptor của package `Dio`**. Mỗi request tới API nếu bị gateway ném lỗi `401 Unauthorized`. Interceptor tự động bắt lỗi lại, chặn toàn bộ luồng, "âm thầm" tự động gọi API `/auth/refresh` bằng `refreshToken` ở SecureStorage. Thành công thì lưu AccessToken mới, và lặp lại chính lệnh call bị lỗi đó.

### 25. Em làm thế nào để tối ưu hiệu năng hiển thị (Rendering Performance) khi danh sách học liệu (Course/Lesson) lên tới hàng nghìn mục?
- **Trả lời:** 
    - Em chỉ dùng widget **ListView.builder / CustomScrollView (Slivers)**, cơ chế này chỉ dựng hình (render) những item đang chiếu trong mắt camera màn hình, scroll qua thì hủy.
    - Kết hợp plugin thư viện ảnh Network kèm cơ chế Caching Image siêu cấp.
    - Với data pagination, sử dụng Load More (Infinite scroll).

---

## 🛡 Nhóm 6: Bảo mật & Giao diện (Security & UI/UX)

### 26. Cơ chế bảo mật 2 lớp (2FA) của em hoạt động như thế nào? Nếu người dùng mất điện thoại cài app TOTP, làm sao để họ lấy lại tài khoản?
- **Trả lời:** Hệ thống em sinh ra Shared Secret, người dùng quét QR vào Google Authenticator. App sinh mã ngẫu nhiên 30s. Nếu họ mất điện thoại, khi cấu hình chuẩn lúc đầu, backend sẽ cho họ **10 mã dự phòng (Backup Codes)** đã mã hóa hàm Hash (argon2) cất vào DB. Họ có thể dùng các mã này để truy cập và tắt tính năng 2FA.

### 27. Em quản lý phân quyền (RBAC) như thế nào? Làm sao đảm bảo một học viên không thể gọi API của Admin để sửa điểm?
- **Trả lời:** Toàn bộ API Gateway sử dụng các Guard. Em phân quyền mạnh ở lõi JWT Token lưu thông tin Roles (ex: `LEARNER`, `ADMIN`). Nếu ai cố tấn công sửa điểm (hành động yêu cầu Decorator `@Roles('ADMIN')`), Auth Guard ở Gateway hay Service lập tức chặn request vì ko match Roles, throw Status 403 Forbidden.

### 28. Vai trò của Auth Guard ở phía Gateway là gì? Nó có thay thế hoàn toàn việc kiểm tra quyền ở các service bên trong không?
- **Trả lời:** Chức năng là cái màng lọc sơ đẳng nhanh nhất: Kiểm tra Token còn hạn không, giải nén token thành User ID.
    Tuy nhiên, nó **KHÔNG** làm thế quyền của Service được do Security in Depth: Nhiều logic Service Academy cần check "Tôi biết bạn là Learner, nhưng bạn đã trả tiền khóa học ID 432 này chưa?". Việc này Service học thuật giữ DB mới quyết định được.

### 29. Em đã áp dụng những chuẩn UI/UX nào để người học cảm thấy hứng thú (Gamification)? XP và Badge được tính toán ở đâu?
- **Trả lời:** 
    - UX: Sử dụng Snackbar báo khi trả lời flashcard/thảo luận hay, áp dụng Streak (chuỗi ngày học).
    - Tính toán Gamification: Xử lý ngầm dưới Backend. Dùng NATS bắn event `user.activity`. `GamificationActivityListener` gom các hành động đó, cộng dồn XP và khi đủ Rule thì unlock Badge (huy hiệu).

---

## 🚀 Nhóm 7: Câu hỏi "Mở" & Thực tế (Product & Scale)

### 30. Nếu dự án này có 10,000 học viên truy cập cùng lúc, hệ thống của em sẽ bị nghẽn ở đâu đầu tiên? Em sẽ scale nó như thế nào?
- **Trả lời:** Ở LiveKit và Prisma/PostgreSQL. 
    - 10k người Video call thì server đơn sẽ OOM (Out of Memory). Giải pháp: Triển khai thành Cụm (Cluster) Redis Distributed LiveKit.
    - Về Database: Chia tách Primary-Replica (1 máy Postgres chuyên ghi, 3 máy Postgres chuyên đọc load data lên).
    - Caching API Academy lên Redis mạnh mẽ hơn.

### 31. Chi phí vận hành AI (API Gemini) và LiveKit rất đắt, em có giải pháp nào để tối ưu chi phí cho chủ trung tâm không?
- **Trả lời:** 
    - AI: Chia luồng model, những câu chat hỏi bài học nhỏ em nhúng Gemini Flash (siêu rẻ, nhanh). Các yêu cầu luận ngữ ngữ pháp thì mới gọi mô hình Gemini Pro nặng tiền. Cache kết quả thường gặp bằng Redis.
    - Xử lý Voice Egress (livekit): Nếu User chỉ nghe chứ ko phát cam, em tắt subscribe video stream để bớt tiền băng thông AWS.

### 32. Điểm yếu lớn nhất của hệ thống này hiện tại là gì? Nếu có thêm 1 tháng nữa, em sẽ cải thiện phần nào?
- **Trả lời:** Khối hệ sinh thái đã chạy ổn, nhưng còn hụt điểm: Flow test Mock JLPT chưa áp dụng AI Auto-Grading (AI chấm tự luận) một cách hoàn hảo. 1 tháng đó em sẽ xây agent chuyên làm Examiner (Giám thị) chạy độc lập qua NATS queue để xử lý song song các bài tự luận của học sinh thay vì chấm bằng tay.

### 33. Trong quá trình làm đồ án, khó khăn kỹ thuật lớn nhất em gặp phải là gì và em đã giải quyết nó như thế nào?
- **Trả lời:** Việc kết hợp **NATS Request-response cross-service** với Timeout do gọi nhiều service móc xích nhau. Ví dụ Buy Course -> API gọi Academy -> Academy gọi Identity lấy thông tin User -> Gây ra Chain Reaction tốn ms rác.
Em đã giải quyết bằng việc đổi các bước xác thực sang Token based độc lập, thiết kế DB Replicate (ID sync), hạn chế call Request nội bộ cho các API Public. Hệ thống mới thật sự Event-driven.

---

## 💼 Nhóm 8: Nghiệp vụ Giáo dục & Quản lý đào tạo (LMS Business)

### 34. Quy trình đăng ký khóa học tự học (VOD) khác gì so với lớp học trực tiếp (Live Class) trong hệ thống Torii?
- **Trả lời:** 
    - **Khóa VOD:** Học viên mua xong có thể học ngay bất cứ lúc nào, tiến độ tính trên % bài giảng đã hoàn thành. 
    - **Live Class:** Khi mua thành công, học viên sẽ được ghi danh vào một lớp cụ thể (Class Instance) có lịch trình học chặt chẽ. Hệ thống quản lý giáo dục phải xử lý logic phức tạp hơn: cấm đăng ký (Disable Enrollment) nếu lớp Live Class đã đủ sĩ số (Max Students) hoặc đã diễn ra qua 1/3 chặng đường (quá thời hạn đăng ký quy định).

### 35. Hệ thống đánh giá học viên "hoàn thành" bài học (Lesson Completion) dựa vào tiêu chí gì? Ngăn chặn học viên tua video ra sao?
- **Trả lời:** Hệ thống có tính ràng buộc để đảm bảo chất lượng thật:
    - **Client-side tracking:** Ghi nhận thời gian xem (watch time) bằng Event Listener trên trình độ Video Player, và tự động gọi API `Heartbeat` (ping) về server mỗi 30 giây để ngăn chặn việc tua tay trực tiếp đến cuối rồi bấm "Hoàn thành".
    - **Gate Rule (Điều kiện bắt buộc):** Dù xem video 100%, bài học chỉ đánh dấu hoàn tất nếu học viên vượt qua bài Quiz theo sau đó với mức điểm sàn (Passing score) cấu hình bởi giáo viên.

### 36. Kỳ thi thử JLPT (Mock Exam) được mô phỏng nghiệp vụ thế nào? Xử lý sự cố nếu đang thi mà học viên rớt mạng?
- **Trả lời:** Bài thi JLPT trong Torii chia làm nhiều Sections (Từ vựng, Ngữ pháp, Nghe hiểu) tương tự thi thực tế ở Nhật Bản, có đồng hồ Limit Time đếm lùi cho riêng từng phần.
    - **Trường hợp Offline / Rớt mạng:** Khi User bắt đầu thi, Server chốt một biến `startTime`. Khi ấn nộp bài, Client truyền cả Data kèm timestamp. Kể cả rớt mạng giữa chừng, học viên vẫn có thể tick đáp án lưu tạm ở Local Storage. Khi mạng phục hồi, dữ liệu submit lên kèm `submitTime`. Backend đối chiếu `(submitTime - startTime)` kèm thêm vùng đệm bù trừ mạng lag (buffer ~ 30 giây). Nếu quá tổng limit, server từ chối các kết quả bị điền thêm, chỉ lưu các câu đã tick trong vùng thời gian an toàn.

---

## 💰 Nhóm 9: Nghiệp vụ Thương mại & Thanh toán (Commerce & Payment)

### 37. Xử lý trường hợp Webhook của hệ thống cổng thanh toán (PayOS) trả về trễ, hoặc rớt kết nối? Làm sao để tránh bị complain "trừ tiền rồi mà chưa mở khóa"?
- **Trả lời:** Đặt quá nhiều niềm tin vào Webhook là rủi ro kinh điển. Ngoài Webhook tự động từ PayOS dội về cổng Gateway, em thêm tính năng **Sync Payment (Cấp cứu kiểm tra)** phía Client.
    Phía UX có hiển thị nút "Tôi đã chuyển khoản nhưng chưa được mở khóa". Bấm nút đó, Backend của em sẽ **chủ động Polling** dùng API Key REST gọi tới trung tâm máy chủ PayOS để hỏi trực tiếp `Order_Code` đó xong chưa. Nếu Payload trả về `PAID`, em chủ động mở khóa ghi log ngay thay vì chịu chết ngồi chờ Webhook trả về.

### 38. Lớp Live Class chỉ nhận tối đa 20 sinh viên. Em xử lý bài toán Race-Condition khi có nhiều người cùng mua slot cuối cùng ở cùng 1 giây như thế nào?
- **Trả lời:** Em sử dụng cơ chế **Redis Lock** hoặc **Database Row-level Lock (Pessimistic Lock)** khi sinh mã Payment Link. 
    Giả sử 2 người cùng nhấn mua slot thứ 20. DB sẽ khóa dòng record quy mô Class đó. Ai chọc vào DB trước (dù chỉ vài mili-giây) sẽ được cấp slot số 20 (status "đang chờ thanh toán" khóa chỗ trong 15 phút). Phía NATS trả về API cho người thứ 2 kết quả là Error 400 "Lớp học đã điền đầy".
    Nếu sau 15 phút người giữ chỗ ko thanh toán, cronjob (Schedule service) sẽ chọc mở Unlock seat để người khác được mua.

---

## 🎮 Nhóm 10: Gamification & Chống gian lận XP (Anti-cheating)

### 39. Làm sao em chống gian lận khi học viên thuộc hệ thống IT dùng Postman/BurpSuite để gọi API cộng XP ảo, spam lên Top 1 BXH?
- **Trả lời:** Vì em tách Gamification Service ra một microservice độc lập không Public IP. 
    Không tồn tại một API dạng lộ thiên `POST /api/gamification/add-xp` cho client. Client báo cho Academy Service việc nộp bài (`POST /api/study/quiz/submit`). Academy chấm nội bộ trong backend thấy điểm > 8, liền quăng một JetStream Event tên là `user.activity.achieved`. Gamification nghe được Event này từ "chính người nhà Server phát ra", mới dám cộng điểm. Tool ngoài không thế nhét message vào NATS Broker được do bị block ở Gateway / Cấu hình Firewall.

### 40. Cơ chế "Streak" (chuỗi ngày học) có thiết kế Business lỏng không? Sẽ ra sao nếu quên học 1 ngày do bệnh?
- **Trả lời:** Streak áp dụng nguyên lý tâm lý FOMO (Sợ mất) để gia tăng Retention rate (Tỉ lệ quay lại app).
    Tuy nhiên, nếu user xui xẻo mất điện/bệnh 1 ngày và rớt thẳng Streak từ ngày 100 về 0, họ sẽ rất oán giận và bỏ nền tảng. Nghiệp vụ hệ thống em cung cấp cơ chế mua đồ ảo (Ví dụ: **Streak Freeze - Khiên ngưng đóng băng thời gian**). Dùng Torii Coin (cày được hàng ngày) để mua trước cái khiên đó cất tủ. Hôm sau quên học, Cronjob Service kiểm tra và thấy có Khiên, nó sẽ tiêu hao khiên và giữ lại chuỗi Streak cho user.

---

## 👨‍🏫 Nhóm 11: Nghiệp vụ AI Tutor & Đạo đức Data

### 41. AI Sensei hoạt động có khuôn phép không? Hay học sinh có thể lôi kéo AI bàn luận chủ đề chính trị, nhờ viết code hay phá Server? Trách nhiệm về nội dung thuộc về ai?
- **Trả lời:** Trách nhiệm học thuật cuối cùng thuộc về nền tảng. Hệ thống ràng buộc AI:
    - **Prompt Alignment:** Các System Params được hard-coded kĩ "Ngươi không được thoát vai Sensei Tiếng Nhật. Nếu bị hỏi về chủ đề ngoại vi (viết C code, y tế, chính trị quân sự), ngươi phải đáp lễ phép: 'Gomenasai, Sensei chỉ có kiến thức về văn hóa và Nhật ngữ'".
    - **Audit Log:** Mọi phiên chat giữa AI - Learner được Data Log về Service Audit dưới PostgreSQL. Admin Dashboard có Tool Alert quét từ khóa tục tĩu (Profanity Check), để có thể Ban nick những User dùng AI phá hoại.

### 42. Hệ thống tạo đề thi đánh giá năng lực AI dựa vào yếu tố nào? Có bị lỗi "quá khó" hay "hên xui" làm học sinh nản không?
- **Trả lời:** Không để AI Random tự do. Em ứng dụng **Knowledge Tracing (Dò vết kiến thức)** kết hợp Tags.
    Mỗi bài Quiz học sinh làm đều gắn Tag Mức độ (N5, N4) và Kiểu Ngữ pháp. Hệ thống Analytics chấm tag nào Học sinh đang fail > 60%. Khi yêu cầu AI sinh đề ôn tập, Prompt Backend ép tham số vào API LLM với tỷ lệ vàng: "Tạo đề 20% các câu hỏi thuộc Tag cũ đã vững (để củng cố tự tin) và 80% xoáy vào các Tag học sinh đang yếu (để fix lổ hỏng)". Nhờ vậy đề sẽ sát sườn 100% với năng lực của sinh viên đó, và không bao giờ quá sức (Out of bounds).

---

## 🎟 Nhóm 12: Nghiệp vụ Mã giảm giá (Coupon Business Logic)

### 43. Hệ thống Coupon của em có bao nhiêu loại? Giải thích sự khác biệt giữa Coupon hệ thống và Coupon phần thưởng Gamification?
- **Trả lời:** Em chia Coupon thành **2 loại hoàn toàn độc lập**:
    - **Coupon hệ thống (System Coupon):** Admin tạo thủ công từ Dashboard. Không có `ownerId`, `source = 'MANUAL'`. Ai cũng nhập được code nếu còn hạn và chưa hết limit.
    - **Coupon Gamification Reward (Coupon cá nhân):** Sinh ra tự động khi học viên đổi điểm XP lấy quà. Có `ownerId = userId` và `source = 'GAMIFICATION_REWARD'`. Chỉ tài khoản đó mới dùng được. 
    - Khi Admin xem danh sách coupon trên Dashboard, em **lọc bỏ** (filter out) coupon loại cá nhân để tránh nhầm lẫn, vì chúng không được quản lý bởi admin.

### 44. Khi xác thực mã giảm giá (validateCoupon), em kiểm tra những điều kiện nào? Điều gì xảy ra nếu một mã coupon đã hết lượt dùng toàn hệ thống nhưng user vẫn gửi lên?
- **Trả lời:** Hàm `validateCoupon` kiểm tra theo thứ tự từng tầng guard:
    1. **Ownership check:** Coupon có `ownerId` thì chỉ chủ của nó mới dùng được.
    2. **Status check:** Coupon phải ở trạng thái `ACTIVE`, không phải `INACTIVE`.
    3. **Time validity:** `startDate ≤ now ≤ endDate`.
    4. **Global usage limit:** `usageCount >= usageLimit` → ném 400 "Coupon usage limit reached".
    5. **Min order value:** Giá trị đơn hàng phải vượt ngưỡng tối thiểu.
    6. **Per-user limit:** Đếm `CouponUsage` table xem user đã dùng coupon này bao nhiêu lần.
    - Đặc biệt, trong `recordUsage()`, sau khi cộng dồn `usageCount`, hệ thống **tự động deactivate** coupon nếu đã đạt limit, ngăn race condition tiếp theo.

### 45. Khi Admin "Xóa" một mã coupon đã từng được học viên dùng để thanh toán, hệ thống xử lý thế nào? Dữ liệu lịch sử có bị mất không?
- **Trả lời:** Em bảo vệ tính toàn vẹn dữ liệu bằng cách **KHÔNG hard-delete** coupon đã từng dùng. Trong hàm `admin_delete()`:
    - Trước tiên đếm `couponUsage` và `order` liên quan. Nếu `hasBeenUsed = true`, hệ thống chuyển sang `INACTIVE` (Soft Deactivate) thay vì xóa.
    - Ghi `audit log` action `coupon.deactivate` với chú thích "preserved for order history".
    - Chỉ xóa thật sự `coupon.delete()` nếu coupon chưa từng được ai dùng. Nhờ vậy, dữ liệu lịch sử đơn hàng cũ không bị NULL reference.

---

## 📦 Nhóm 13: Nghiệp vụ Đơn hàng & Ghi danh (Order → Enrollment Flow)

### 46. Sau khi PayOS xác nhận thanh toán thành công, hệ thống tự động mở khóa khóa học cho học viên qua cơ chế nào? Liệt kê toàn bộ chuỗi sự kiện.
- **Trả lời:** Đây là chuỗi **Event-driven** hoàn toàn qua NATS:
    1. **PayOS Webhook** → gọi vào Gateway của backend, cập nhật `Order.status = 'PAID'` trong DB.
    2. Backend **bắn NATS Event** `order.paid` kèm `{ orderId }`.
    3. **`OrderListener`** trong Academy Service lắng nghe event này (pattern `@EventPattern('order.paid')`).
    4. OrderListener tra DB lấy `order.items`, phân tích từng item: `isVod`, `isCohort`, hay `isLiveClass`.
    5. Với từng item hợp lệ, gọi `enrollments.enroll()` tạo bản ghi `Enrollment` với `status: 'ACTIVE'`.
    6. Học viên mở app lên thấy khóa học đã được mở khóa tự động.

### 47. Nếu học viên mua một gói "Cohort" (nhóm lớp theo lịch), làm sao hệ thống biết để ghi danh vào đúng lớp cụ thể nào?
- **Trả lời:** Khi thanh toán, frontend lưu thông tin lựa chọn lớp vào `item.deliverySnapshot.selectedLiveClassId`. Trong `OrderListener.handleOrderPaid()`, em xử lý:
    ```
    if (isCohort && !targetLiveClassId) {
        targetLiveClassId = snapshot?.selectedLiveClassId;
    }
    ```
    Nhờ đó, dù học viên mua cùng một Cohort nhưng chọn lớp sáng hay lớp chiều, hệ thống vẫn ghi danh đúng LiveClass đã chọn tại thời điểm checkout.

### 48. Nếu học viên hoàn tiền (Refund) một đơn hàng, hệ thống tự động thu hồi quyền truy cập không? Cơ chế nào đảm bảo điều này?
- **Trả lời:** Có, em xây dựng `OrderListener.handleOrderRefunded()` lắng nghe event `order.refunded`:
    - Tìm tất cả `Enrollment` có `sourceOrderId = orderId` và `status = 'ACTIVE'`.
    - Tự động cập nhật từng enrollment sang `status = 'CANCELLED'`.
    - Ghi `audit log` action `enrollment.refund_revocation` để lưu vết truy xuất.
    - Học viên sẽ không còn thấy khóa học trong danh sách "Khóa học của tôi" nữa.

### 49. Form ghi danh thủ công (Enrollment Form) ở Admin Dashboard cho phép Admin làm những gì? Tại sao em lại dùng Debounce khi tìm kiếm học viên?
- **Trả lời:** Form `EnrollmentForm` cho Admin 2 chức năng:
    - **Create mode:** Chọn học viên (tìm theo email/tên), chọn LiveClass hoặc Gói VOD, đặt trạng thái và ngày hết hạn. Form tự điền sẵn nếu được gọi từ trang chi tiết lớp cụ thể (`defaultLiveClassId`).
    - **Edit mode:** Chỉ chỉnh được `status` (Active/Completed/Cancelled/Expired) và `expiresAt`.
    - **Debounce 400ms** khi tìm kiếm user: Tránh việc mỗi ký tự gõ vào đều fire 1 HTTP request tới API users. Chỉ gọi API sau khi người dùng ngừng gõ 400ms, giảm tải Backend đáng kể.

---

## 🏫 Nhóm 14: Nghiệp vụ Lộ trình học (Curriculum & Lesson Lock)

### 50. Cơ chế "khóa bài học theo thứ tự" (Sequential Lock) trong ứng dụng Mobile hoạt động như thế nào? Em tính toán điều này ở Client hay Server?
- **Trả lời:** Em tính **hoàn toàn ở Client-side (Flutter)** để tiết kiệm round-trip lên server. Logic nằm trong hàm `_effectiveLessonUnlocked()` ở `curriculum_screen.dart`:
    - Lấy list `completedLessonIds` từ API một lần.
    - Sắp xếp các bài học "có thể tính tiến độ" (`trackableOrdered`): chỉ gồm `VIDEO`, `READING`, `ARTICLE`, `QUIZ`.
    - Bài thứ N được mở khi bài thứ N-1 đã `completed`. Nếu bài trước là `QUIZ`, phải `isPassed = true` mới được mở tiếp.
    - Nếu ở chế độ `LIVE`, toàn bộ bài học được mở khoá không giới hạn.

### 51. Trong lộ trình học, có 3 loại Milestone (bài kiểm tra chặn): LESSON_CHECKPOINT, MODULE_CHECKPOINT và FINAL_EXAM. Chúng khác nhau thế nào và được render ra UI như nào?
- **Trả lời:** Ba loại có ngưỡng kiểm tra khác nhau:
    - **LESSON_CHECKPOINT:** Xuất hiện **ngay sau một bài học cụ thể**. Nếu là `isRequired = true` và chưa pass, bài tiếp theo trong module đó bị khóa. Hiển thị như một sub-item thụt vào dưới bài học cha.
    - **MODULE_CHECKPOINT:** Xuất hiện **cuối một Module**. Phải hoàn thành tất cả bài trackable trong module thì mới có thể làm bài này. Hiển thị cùng cấp với các lesson trong module.
    - **FINAL_EXAM:** Xuất hiện **cuối cùng của toàn khóa học** (sau tất cả modules). Bị khóa cho đến khi `completedTrackable >= trackableOrdered.length`. Được render thành khối riêng "Thử thách cuối khóa" nổi bật nhất.

### 52. Màn hình Lộ trình (CurriculumScreen) nhận vào tham số `progressDisabled = true`. Khi nào thì Admin/Giáo viên cần bật flag này?
- **Trả lời:** Khi `progressDisabled = true`:
    - Hệ thống không gọi API lấy `completedLessonIds` (tránh gọi thừa).
    - Tắt toàn bộ cơ chế sequential lock → **mọi bài đều được mở**.
    - Không tính tiến độ % hoàn thành.
    - **Trường hợp dùng:** Khi Admin/Giáo viên preview lộ trình khóa học để kiểm tra nội dung, hoặc khi học viên xem preview demo khóa học chưa mua. Đảm bảo họ thấy được toàn bộ cấu trúc mà không bị chặn.

---

## 🔀 Nhóm 15: Nghiệp vụ Lớp học nhóm Live (Breakout Rooms)

### 53. Tính năng "Phòng nhóm" (Breakout Room) trong lớp học trực tiếp hoạt động như thế nào? Dữ liệu phòng nhóm được lưu ở đâu và tại sao?
- **Trả lời:** Breakout Room là sub-rooms chia ra từ phòng học chính (Parent Room). Luồng tạo:
    1. Giáo viên bấm "Chia nhóm" → Frontend gửi `CreateBreakoutRoomsReq`.
    2. `BreakoutService` lấy metadata phòng cha, clone metadata sang, **tắt các feature nhạy cảm** (recording, breakout lồng nhau, RTMP).
    3. Tạo sub-room trên LiveKit với ID dạng `{parentRoomId}-{groupId}`.
    4. Lưu trạng thái phòng nhóm vào **Redis** (không phải NATS KV như ban đầu). Lý do: Redis có TTL linh hoạt, tra cứu O(1), phù hợp với dữ liệu ephemeral (thoáng qua theo phiên học).
    5. Bắn NATS system event `JOIN_BREAKOUT_ROOM` tới từng học viên được phân công.

### 54. Tại sao khi một học viên join Breakout Room, backend kiểm tra xem họ có nằm trong danh sách `room.users` không? Admin có được bypass không?
- **Trả lời:** Đây là cơ chế **Authorization Enforcement** theo thiết kế phòng nhóm: Giáo viên phân công ai vào nhóm nào trước khi tạo. Học viên không được phép tự ý nhảy vào nhóm khác.
    - `if (!req.isAdmin) { const canJoin = room.users.some(u => u.id === req.userId) }`
    - Admin/Giáo viên (`isAdmin = true`) được **bypass** hoàn toàn, có thể theo dõi bất kỳ nhóm nào để hỗ trợ.

### 55. Khi giáo viên kết thúc phòng học chính (Parent Room), điều gì xảy ra với tất cả các phòng nhóm đang hoạt động?
- **Trả lời:** Hệ thống tự động dọn dẹp cascading qua `postTaskAfterRoomEndWebhook()`:
    - LiveKit phát Webhook `room.ended` → Meet Service nhận.
    - Kiểm tra metadata: Nếu không phải breakout room → gọi `endAllBreakoutRooms(parentRoomId)`.
    - Lặp qua tất cả sub-room IDs từ Redis, gọi `roomEndService.endRoom()` cho từng cái, xóa khỏi Redis.
    - Sau khi cleanup xong, cập nhật metadata phòng cha: `breakoutRoomFeatures.isActive = false`.
    - Bắn event `BREAKOUT_ROOM_ENDED` về client để UI cập nhật trạng thái.

---

## 📋 Nhóm 16: Nghiệp vụ Quản lý Admin & Nhân bản Lớp học

### 56. Tính năng "Nhân bản lớp học" (Duplicate Class) trong Admin Dashboard dùng để làm gì? Lớp nhân bản có trạng thái gì ngay khi tạo?
- **Trả lời:** Tính năng này giải quyết bài toán thực tế: Trung tâm thường tổ chức cùng một khóa tiếng Nhật N5 nhưng nhiều lần/nhiều mùa học. Thay vì Admin phải tạo lại từ đầu (nhập lại toàn bộ Module, Bài học, Quiz), chỉ cần "Nhân bản" từ lớp cũ.
    - Lớp mới được sinh ra với `status = 'DRAFT'` (nháp), không ai thấy hay mua được.
    - Admin chỉ cần cập nhật: Mã lớp mới (`code`), Tên lớp (`name`), và tùy chọn đổi Giáo viên (`instructorId`).
    - Sau khi chỉnh sửa lịch học, Admin publish lớp lên `ACTIVE` để học viên đăng ký.

### 57. Trong EnrollmentForm, tại sao trường "Học viên" chỉ hiển thị Popover tìm kiếm khi Popover đang mở (`enabled: openUserPopover`)? Thiết kế này có lợi gì?
- **Trả lời:** Đây là kỹ thuật **Lazy Loading** kết hợp **Conditional Fetching**:
    ```
    enabled: openUserPopover
    ```
    - Khi form load lần đầu, KHÔNG gọi API `/users` ngay. Chỉ gọi khi Admin bấm mở Popover.
    - Lý do: Danh sách user có thể lên tới hàng ngàn người → Nếu gọi API ngay khi form mount sẽ gây lag. 
    - Kết hợp thêm `debounce 400ms` khi gõ search, tổng cộng tối thiểu 400ms trước khi có API call, tránh spam request và giảm tải server đáng kể.

### 58. Hệ thống "Assessment Plan" (Kế hoạch kiểm tra) trong Academy Service là gì? Nó liên quan thế nào đến việc unlock bài học?
- **Trả lời:** `AssessmentPlan` là một cấu hình "Milestone" được Admin thiết lập cho một khóa học, bao gồm:
    - **Loại** (Kind): `LESSON_CHECKPOINT`, `MODULE_CHECKPOINT`, hoặc `FINAL_EXAM`.
    - **Điểm sàn** (Passing score): ví dụ 70%.
    - **isRequired**: Nếu `true`, học viên BẮT BUỘC phải pass mới được học tiếp.
    - Khi học viên làm bài quiz, hệ thống tạo ra `AssessmentMilestone` (instance thực tế). Mobile app lấy danh sách `AssessmentMilestone` và dùng nó để render trạng thái khóa/mở của từng bài học trong `CurriculumScreen`.

---

## 🌐 Nhóm 17: Luồng WebRTC Meet - Từ tạo phòng đến học viên vào lớp (End-to-End Flow)

> 💡 **Đây là nhóm hội đồng rất hay hỏi vì tích hợp nhiều công nghệ phức tạp: LiveKit + NATS + Redis + WebRTC cùng phối hợp.**

### 59. Giải thích toàn bộ luồng (Flow) từ khi Giáo viên bấm "Tạo phòng học" đến khi phòng thực sự sẵn sàng. Có bao nhiêu bước?
- **Trả lời:** Luồng tạo phòng trong `RoomCreateService.createRoom()` gồm **9 bước tuần tự** có cơ chế phòng thủ chắc chắn:
    1. **Validate roomId** - Kiểm tra ID không chứa pattern hệ thống dành riêng (`-FIELD_`, `user_`).
    2. **Acquire Redis Lock** - Dùng `RedisLockService` khóa roomId lại, chặn mọi request tạo phòng trùng lặp (chống double-click, Race Condition).
    3. **Check DB** - Tra `RoomInfoService` xem phòng đã tồn tại chưa. Nếu rồi, kiểm tra NATS xem phòng còn live không (Idempotency).
    4. **Set Defaults** - Áp mọi config mặc định: maxParticipants, duration, lock settings, copyright, E2EE disable/enable features.
    5. **Prepare DB Model** - Sinh `SID` mới (UUID v4), tạo object roomInfo.
    6. **Upsert vào PostgreSQL** - Lưu thông tin phòng bền vững.
    7. **Add vào NATS KV** - Đẩy metadata phòng lên NATS Key-Value store cho real-time state.
    8. **Preload Whiteboard** (async, không block) - Nếu giáo viên đính kèm file PDF làm whiteboard, tải trước lên cloud.
    9. **Release Redis Lock + Gửi Webhook** - Mở khóa và thông báo webhook tới hệ thống bên ngoài.

### 60. Sau khi phòng được tạo, học viên bấm "Tham gia lớp học". Luồng tạo JWT Token để Join LiveKit diễn ra như thế nào?
- **Trả lời:** Hàm `getWajlcJoinToken()` trong `RoomUserService` thực hiện **10 bước kiểm tra nghiêm ngặt**:
    1. **Chờ Room Creation Lock** - Nếu giáo viên vừa tạo phòng, học viên phải đợi lock được giải phóng (tránh join vào phòng chưa init xong).
    2. **Validate username** - Cấm user đặt tên `WAJLC_RECORDER_AUTH` (tên dành cho system bot ghi hình).
    3. **Check Internal userId** - Reject userId bắt đầu bằng `ingres_`, `wajlc_agent-`, `sip_`... (Reserved for bots/agents).
    4. **Lấy Room Metadata từ NATS** - Đọc state thực tế của phòng (không phải DB) để đảm bảo mới nhất.
    5. **Check Room Status** - Nếu room `status = 'ended'` → throw lỗi "Phòng đã kết thúc".
    6. **Handle Duplicate User** - Nếu cùng userId đang `online`, kick phiên cũ ra trước, poll 200ms/lần đến khi offline (max 5 giây).
    7. **Validate userId format** - Chỉ cho phép `[a-zA-Z0-9-_]`, không chứa `field_`.
    8. **Gán quyền (Permissions)** - Admin: `isAdmin=true`, không lock, tự động thành Presenter. Student: áp `defaultLockSettings` của phòng, nếu có Waiting Room thì `waitForApproval=true`.
    9. **Lưu User Info vào NATS KV** - Ghi trạng thái user vào key-value store của NATS để tracking online/offline.
    10. **Generate Wajlc JWT Token** - Tạo token bằng `WajlcAuthService`, client dùng token này để connect trực tiếp vào LiveKit server qua WebRTC.

### 61. Token mà học viên nhận về là loại token gì? Nó chứa thông tin gì và được verify ở đâu?
- **Trả lời:** Token là **JWT (Wajlc Join Token)** - không phải LiveKit Access Token thông thường mà là token nội bộ của hệ thống Meet (tên Wajlc là alias nội bộ của LiveKit trong project). Token chứa:
    - `name` (tên hiển thị), `userId`, `roomId`
    - `isAdmin` (giáo viên hay học viên)
    - `isHidden` (bot ẩn danh hay không)
    - Token này được Client gửi lên WebSocket handshake khi connect vào LiveKit Media Server. LiveKit server verify token bằng **shared AccessKey/SecretKey** được cấu hình trong `AppConfigService`.

### 62. Nếu cùng một học viên mở lớp học trên 2 tab trình duyệt cùng lúc, hệ thống xử lý thế nào?
- **Trả lời:** Hệ thống xử lý theo logic **"Single Session Enforcement"** trong `getWajlcJoinToken()`:
    - Bước 6: Check `natsUserInfo.getRoomUserStatus(roomId, userId) === 'online'`.
    - Nếu đúng, gọi `handleRemoveParticipant()` kick session cũ ra, gửi thông báo cho tab cũ: `"Phiên cũ bị ngắt vì cùng tài khoản đã tham gia từ nơi khác."`.
    - Poll 200ms/lần (tối đa 5 giây) cho đến khi user offline.
    - Sau đó mới cấp token mới cho tab thứ 2.
    - **Kết quả:** Tab cũ bị đuổi ra, tab mới được vào - không bao giờ có 2 session song song.

### 63. Khi Giáo viên tắt mic của Học viên, hành động đó đi qua những tầng nào?
- **Trả lời:** Luồng mute trong `handleMuteUnMuteTrack()` gồm 4 bước rõ ràng:
    1. **Load Participant từ LiveKit** - Hỏi LiveKit server xem user đó có đang `ACTIVE` không.
    2. **Tìm Track** - Nếu không có `trackSid` cụ thể, tự động tìm `TrackSource.MICROPHONE` trong danh sách track của participant.
    3. **Gọi LiveKit API** - `livekitService.muteUnMuteTrack(roomId, userId, trackSid, muted=true)` → LiveKit SFU tắt track ngay lập tức phía server.
    4. **Kết quả real-time** - LiveKit tự phát event `TrackMuted` qua WebRTC DataChannel đến tất cả participant trong phòng, UI update ngay.
    - Nếu mute `userId = 'all'`, hệ thống lặp qua tất cả active participant và mute từng người một.

### 64. Giáo viên có thể kiểm soát những loại quyền (Lock) nào trong phòng? Cơ chế "Lock toàn phòng" hoạt động thế nào?
- **Trả lời:** Hệ thống có **9 loại Lock** có thể bật/tắt per-user hoặc toàn phòng:
    - `mic`, `webcam`, `screenShare`, `chat`, `sendChatMsg`, `chatFile`, `privateChat`, `whiteboard`, `sharedNotepad`
    - Khi Lock `userId = 'all'`:
        1. **Cập nhật `defaultLockSettings` của phòng** (trong NATS KV) → Học viên join sau cũng bị lock luôn.
        2. **Lặp qua tất cả userIds online** → Cập nhật `lockSettings` trong metadata từng user → Broadcast update qua NATS.
    - **Admin không bị lock** (ngoại trừ `whiteboard` thì theo rule phòng). Đây là thiết kế an toàn: giáo viên không thể tự lock mình.

### 65. LiveKit Webhook được dùng trong hệ thống Meet như thế nào? Kể tên các event quan trọng nhất.
- **Trả lời:** LiveKit khi có sự kiện xảy ra trên media server sẽ gửi HTTP POST về endpoint `/webhook` của Meet Service. Các event quan trọng:
    - **`room_started`**: Phòng LiveKit thực sự khởi chạy (sau khi participant đầu tiên join) → Trigger cập nhật `isRunning` trong DB.
    - **`room_finished`**: Phòng kết thúc → Trigger cleanup, gọi `endAllBreakoutRooms`, cập nhật DB.
    - **`participant_joined`**: Học viên join thành công → Cập nhật `joinedParticipants` counter, trigger Analytics.
    - **`participant_left`**: Học viên rời → Giảm counter, kiểm tra phòng có còn ai không.
    - **`track_published`**: Học viên bật cam/mic → Có thể trigger recording nếu được cấu hình.
    - Sau khi xử lý, Meet Service **forward lại event** này tới `webhookUrl` đã đăng ký của khóa học (Academy Service) qua `WebhookNotifierService`.

### 66. Waiting Room (Phòng chờ) hoạt động như thế nào? Ai có quyền duyệt học viên vào?
- **Trả lời:** Khi `waitingRoomFeatures.isActive = true` trên metadata phòng:
    - Mỗi học viên join được cấp token có `waitForApproval = true` trong metadata.
    - LiveKit nhận token, học viên được đặt vào trạng thái **"Waiting"** — connect WebRTC nhưng chưa được publish track (chưa thấy/nghe được ai).
    - **Giáo viên (Admin)** thấy notification "X xin vào phòng" trên UI.
    - Admin bấm "Chấp nhận" → Backend gọi `livekitService.updateParticipantMetadata()` bỏ flag `waitForApproval` → LiveKit cấp quyền publish → Học viên "vào phòng" thật sự.
    - Admin bấm "Từ chối" → Backend gọi `handleRemoveParticipant()`.

### 67. Nếu phòng học đang hoạt động mà Meet Service bị restart (crash), khi service khởi động lại thì các phòng đang chạy có bị mất không?
- **Trả lời:** Không bị mất, vì hệ thống được thiết kế **Stateless về logic phòng**:
    - Trạng thái phòng (`metadata`, `users online`) được lưu trong **NATS Key-Value Store** (persistent, không phụ thuộc process Meet Service).
    - Thông tin phòng bền vững (roomId, SID, webhook URL) lưu trong **PostgreSQL**.
    - Khi Meet Service restart, nó reconnect NATS và đọc lại state từ KV Store.
    - LiveKit Media Server chạy độc lập, không bị ảnh hưởng bởi Meet Service crash.
    - Học viên đang trong phòng chỉ thấy latency tăng nhẹ vài giây, sau đó kết nối phục hồi bình thường.

### 68. Tóm tắt kiến trúc Meet Service theo dạng sơ đồ luồng (Architecture Summary). Có bao nhiêu tầng xử lý?
- **Trả lời:** Meet Service có **4 tầng rõ ràng**:

    ```
    [Client Web/Mobile]
        ↓ HTTP/WebSocket
    [Gateway Service] ─── JWT Validate ───→ [Meet Service]
                                                  │
                        ┌─────────────────────────┼─────────────────────────┐
                        ↓                         ↓                         ↓
              [RoomCreateService]       [RoomUserService]         [BreakoutService]
              ┌──────────────────┐      ┌──────────────────┐      ┌──────────────┐
              │ Redis Lock       │      │ NATS KV (Users)  │      │ Redis State  │
              │ PostgreSQL (DB)  │      │ LiveKit SDK      │      │ LiveKit SDK  │
              │ NATS KV (Rooms)  │      │ WajlcAuth (JWT)  │      │ NATS Events  │
              └──────────────────┘      └──────────────────┘      └──────────────┘
                        │
                        ↓
              [LiveKit Media Server] ←──── WebRTC ────→ [Clients]
                   (SFU Engine)
                        │
                        ↓ Webhook
              [WebhookService] ──→ [Academy Service / External]
    ```

    - **Tầng 1 (Transport):** Gateway → NATS → Meet Service handlers
    - **Tầng 2 (Business Logic):** RoomCreate / RoomUser / Breakout Services
    - **Tầng 3 (Infrastructure):** Redis (Lock/State), NATS KV (Real-time metadata), PostgreSQL (Persistence), LiveKit SDK
    - **Tầng 4 (Media):** LiveKit SFU Server ↔ Client qua WebRTC P2P tunnel

---

## 🤖 Nhóm 18: Kiến trúc AI Agent (SenseiService & FastMCP)

> 💡 **Tính năng AI Sensei là một trong những điểm khác biệt cốt lõi. Hãy nhấn mạnh vào cách em kiểm soát AI để nó không bị "ảo giác" (Hallucination) và bám sát tiến độ học của từng user.**

### 69. Kiến trúc tổng thể của AI Sensei trong dự án được xây dựng như thế nào?
- **Trả lời:** Em xây dựng AI Agent theo pattern **Tool Calling** (tương tự chuẩn MCP - Model Context Protocol), được đóng gói trong `FastMcpService`:
    - **Core Model:** Dùng `gemini-2.5-flash` qua Google Generative AI SDK để tối ưu chi phí và tốc độ phản hồi.
    - **Prompt Management:** Không hard-code prompt vào file TS mà quản lý bằng file Markdown (Handlebars templates) trong thư mục `assets/prompts`.
    - **Tool Registry:** Định nghĩa các chức năng độc lập như `sensei_check_grammar`, `sensei_translate`, `sensei_create_flashcard`, `sensei_simulate_conversation`. Mỗi tool nhận Input Schema rõ ràng qua Zod.
    - **Validation:** Kết quả AI trả về bắt buộc phải qua Zod schema validation. Nếu lỗi format, hệ thống tự động retry hoặc xử lý lỗi an toàn.

### 70. Khi học viên chat với AI, làm sao AI biết được trình độ, điểm mạnh, điểm yếu của họ để tư vấn chính xác?
- **Trả lời:** Em sử dụng kỹ thuật **Context Injection (RAG - Retrieval-Augmented Generation)**. Trước khi gọi Gemini, `FastMcpService.getUserContext(userId)` sẽ tự động thu thập:
    - **Hồ sơ:** Các khóa học đang đăng ký, mục tiêu JLPT (từ Onboarding).
    - **Gamification:** Cấp độ hiện tại, số ngày học liên tiếp (Streak), tổng điểm XP.
    - **Hoạt động gần đây:** Thống kê bài học/quiz trong 14 ngày qua (số lượng bài, điểm trung bình).
    - **Tài nguyên học:** 10 Flashcard (từ vựng) mới nhất học viên vừa lưu.
    - Dữ liệu này được tiêm vào Handlebars template. Nhờ vậy, AI Sensei có thể chào hỏi: *"Sensei thấy em vừa học N4 bài 5 và lưu flashcard chữ Kanji này, em có muốn thực hành luôn không?"*

### 71. Tại sao em lại dùng thư viện Handlebars để quản lý Prompt thay vì nối chuỗi (String Interpolation) trực tiếp trong TypeScript?
- **Trả lời:** 
    - **Tách biệt Logic và Content:** Prompt AI thường rất dài (chứa hướng dẫn, rules, system prompt). Đưa vào file `.md` giúp dễ đọc, dễ chỉnh sửa mà không cần recompile code TS.
    - **Điều khiển Logic linh hoạt:** Handlebars hỗ trợ các cú pháp như `{{#if context.streak > 5}} Khích lệ học viên {{/if}}` hoặc lặp qua mảng `{{#each commonErrors}}`, giúp sinh prompt động theo từng hoàn cảnh mà code TS vẫn cực kỳ sạch sẽ.
    - **Quản lý phiên bản:** Các chuyên gia Prompt Engineering có thể vào tinh chỉnh file `.md` độc lập mà không sợ làm hỏng logic server.

### 72. LLM thỉnh thoảng trả về JSON bị lỗi format (ví dụ kẹp thêm markdown \`\`\`json). Hệ thống của em xử lý vấn đề này thế nào?
- **Trả lời:** Hàm `callGeminiWithSchema` của em có cơ chế phòng vệ 2 lớp:
    - **Lớp 1 (Regex Cleaning):** Hàm `cleanJsonResponse` tự động dùng Regex bóc tách rác, tìm kiếm block `{ ... }` hoặc `[ ... ]` đầu tiên và cuối cùng để cắt bỏ markdown ticks (` ```json `) hoặc text rào trước đón sau của AI.
    - **Lớp 2 (Zod Validation & Retry):** Parse JSON sạch vào Zod Schema. Nếu Zod báo lỗi sai cấu trúc dữ liệu, hệ thống bắt catch lỗi, log warning và **tự động gọi lại (Retry) API Gemini 1 lần nữa** với hy vọng AI sẽ trả đúng format. Nếu retry vẫn thất bại thì mới throw Error.

### 73. Khi làm tính năng "Gợi ý tài liệu học" (Recommend Resources), em làm sao để AI chỉ gợi ý các tài liệu CÓ SẴN trong ứng dụng thay vìa bịa ra link ngoài Internet?
- **Trả lời:** Em sử dụng mô hình **Hybrid Retrieval**.
    1. Đầu tiên, nhận keyword chủ đề từ User, Backend sẽ truy vấn (Query) vào PostgreSQL để lấy ra top 5 Khóa học (`CourseProfile`) và 5 Bài học (`Lesson`) khớp với keyword bằng `contains: topic`.
    2. Đóng gói kết quả query này thành một danh sách JSON (Candidates) chứa: Tên bài, Mức độ, URL chuyển hướng nội bộ (`/learning/...`).
    3. Đẩy Candidates này vào Prompt của AI với lệnh rõ ràng: *"Mày là Sensei, hãy phân tích yêu cầu của học viên và CHỈ được khuyên họ học các tài liệu trong danh sách Candidates sau"*.
    - Nhờ vậy, AI sẽ trả về kết quả mượt mà như con người, nhưng các đường link đều là hàng "chính chủ" trỏ vào App, chặn đứng hiện tượng Hallucination.

### 74. Tính năng phát âm giọng nói (Text-to-Speech / TTS) của AI dùng công nghệ gì? Nếu API bị sập thì em có phương án dự phòng (Fallback) không?
- **Trả lời:** Em xây dựng `TTSService` với cơ chế đa luồng có Fallback cực kỳ an toàn:
    - **Mặc định (High Quality):** Nếu chọn các giọng "Microsoft Neural" cao cấp, hệ thống sẽ dùng CLI Python `edge-tts` (được bọc qua `execAsync`) chạy dưới local để tải file âm thanh chất lượng phòng thu từ Azure Edge.
    - **Cơ chế Fallback:** Nếu lệnh `edge-tts` bị lỗi mạng, quá tải, hoặc server không chạy được Python, khối `catch` sẽ kích hoạt ngay và chuyển hướng sang dùng `google-tts-api` (Google Translate TTS).
    - Giọng Google tuy không hay bằng Azure Neural nhưng đảm bảo học viên luôn có âm thanh nghe để học, hệ thống **không bao giờ bị chết chức năng**.

### 75. Hệ thống tracking số lượng Token sử dụng của học viên (AI Usage Tracking) hoạt động như thế nào? Có làm chậm thời gian phản hồi tin nhắn không?
- **Trả lời:** Không hề làm chậm. Sau khi nhận được phản hồi từ Gemini API, em không await việc ghi vào DB ngay.
    - Em ném dữ liệu Token (`promptTokenCount`, `candidatesTokenCount`) vào `AIUsageTrackingService`.
    - Tracking này được đẩy vào **NATS Messaging** hoặc tích lũy theo Session (ví dụ trong màn Roleplay, cộng dồn token trong biến tạm `roomId` ở Redis).
    - Khi kết thúc phiên chat (hoặc khi `isFinal = true`), Backend mới delay 1 giây và tổng hợp toàn bộ Token để ghi xuống Database thành `AI Usage Artifacts`. Thiết kế này giúp Async hóa việc tính cước, mang lại độ trễ thấp nhất cho người dùng.

---
**Torii Nihongo Project - Prepared for Thesis Defense 2026**
