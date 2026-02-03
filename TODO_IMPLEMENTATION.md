# 📋 Checklist Triển Khai Flow Còn Thiếu (API & UI)

Tài liệu này liệt kê các tính năng/luồng người dùng (User Stories) đã được phân tích là còn thiếu hoặc chưa hoàn thiện (thiếu API hoặc UI) trong hệ thống Torii Nihongo.

---

## 🎮 1. Gamification & Tương Tác
*Hệ thống hiện tại đã có Schema nền tảng nhưng chưa có logic xử lý và giao diện hiển thị.*

- [ ] **Bảng Xếp Hạng (Leaderboard)**
    - **API**: Endpoint trả về bảng xếp hạng (Global/Weekly) dựa trên XP hoặc Streak (`apps/server/modules/gamification`).
    - **UI (Learner)**: Giao diện hiển thị Top học viên tại trang Dashboard hoặc trang Leaderboard riêng.
- [ ] **XP Reward Shop (Đổi thưởng)**
    - **API**: Logic trừ điểm XP và "mua" các vật phẩm ảo (Huy hiệu, khung avatar, vật phẩm đóng băng Streak).
    - **UI (Learner)**: Trang Shop để học viên sử dụng điểm XP tích lũy.
- [ ] **Hệ Thống Thành Tích (Badges/Achievements)**
    - **API**: Trigger tự động cấp Badge khi User đạt điều kiện (Ví dụ: "Học tập 7 ngày liên tiếp").
    - **UI (Learner)**: Tab "Thành tựu" trong trang Profile cá nhân.

## 📚 2. Quản Lý Học Tập (LMS) Nâng Cao
*Hoàn thiện các tính năng cốt lõi để đảm bảo quy trình học tập khép kín.*

- [ ] **Bài Tập & Nộp Bài (Assignments)**
    - **Prisma**: Cần thêm Model `Assignment` và `Submission` vào `schema.prisma`.
    - **API**: Luồng giảng viên tạo bài tập -> Học viên nộp bài (Text/File) -> Giảng viên chấm điểm & nhận xét.
    - **UI (Learner/Lecturer)**: Form nộp bài trong màn hình học tập và màn hình quản lý bài nộp cho giảng viên.
- [ ] **Chứng Chỉ Hoàn Thành (Certificates)**
    - **API**: Logic tự động tạo bản ghi `Certificate` khi khóa học đạt 100% tiến độ. Tích hợp thư viện tạo PDF (ví dụ: `pdf-lib` hoặc `canvas`).
    - **UI (Learner)**: Nút "Tải chứng chỉ" tại trang chi tiết khóa học và mục "Chứng chỉ của tôi" trên Dashboard.
- [ ] **Ghi Chú Tập Trung (Personal Notes Manager)**
    - **API**: Endpoint tổng hợp tất cả `notes` từ `LessonProgress` của 1 người dùng.
    - **UI (Learner)**: Một trang quản lý tập trung toàn bộ ghi chú đã lưu trong quá trình xem video/đọc bài.

## 🎥 3. Live Class (Hệ Thống Lớp Học Trực Tuyến)
*Đồng bộ dữ liệu giữa Gateway Learning và Server Meet.*

- [ ] **Đồng Bộ Lịch Học Thực Tế (Schedule Sync)**
    - **API**: Cập nhật API `learning-progress/stats` hoặc tạo API mới để lấy `LiveSession` từ các khóa học User đã mua.
    - **UI (Learner)**: Thay thế dữ liệu hardcode ở widget "Lịch học trực tuyến" trên Dashboard bằng dữ liệu thực.
- [ ] **Truy Cập Bản Ghi (Meeting Recordings)**
    - **API**: Liên kết dữ liệu `meeting_id` sau khi kết thúc buổi Live với các file record (thường xử lý qua Webhook của LiveKit/Recorder).
    - **UI (Learner)**: Hiển thị danh sách video xem lại cho các buổi Live đã quan tâm/đăng ký.

## 🛠 4. Quản Trị Hệ Thống (Admin)
*Công cụ hỗ trợ vận hành cho Staff và Admin.*

- [ ] **Quản Lý Tệp Tin Tập Trung (Asset Manager)**
    - **API**: Endpoint liệt kê và quản lý (xóa/xem) các file đã upload lên S3/Storage.
    - **UI (Admin)**: Giao diện File Manager để nhân viên dễ dàng quản lý tài nguyên media.
- [ ] **Kiểm Duyệt Review (Review Moderation)**
    - **API**: Thêm status `hidden` hoặc `spam` cho Review.
    - **UI (Admin)**: Giao diện duyệt các đánh giá khóa học từ học viên.

## 🔐 5. Tài Khoản & Bảo Mật
- [ ] **Quản Lý 2FA (Two-Factor Authentication)**
    - **API**: Flow bật 2FA (Tạo Secret -> Verify mã lần đầu -> Lưu status enabled).
    - **UI (Learner)**: Trang cài đặt bảo mật cho phép người dùng bật/tắt 2FA bằng Google Authenticator/Authy.

## 🚀 6. Tính Năng Nâng Cao & Cá Nhân Hóa (Phase 2)
*Tập trung vào trải nghiệm AI thông minh, cộng đồng và tăng tỷ lệ giữ chân người học.*

### AI Integration (Tích hợp AI chuyên sâu)
- [ ] **AI Contextual Flashcards**: Cho phép người học lưu từ vựng mới trực tiếp từ cửa sổ chat với AI Sensei vào bộ Flashcard cá nhân.
- [ ] **AI Daily Drill**: Hệ thống tự động sinh bài tập trắc nghiệm/sắp xếp câu hàng ngày dựa trên những nội dung người học hay làm sai.
- [ ] **AI Listening & Dictation**: Sử dụng AI sinh ra các đoạn hội thoại audio ngắn, yêu cầu người học gõ lại hoặc trả lời câu hỏi để luyện nghe.

### Social Learning (Học tập cộng đồng)
- [ ] **Course Q&A / Discussion**: Tab thảo luận dưới mỗi video bài học để học viên đặt câu hỏi cho giảng viên hoặc thảo luận cùng nhau.
- [ ] **Flashcard Marketplace**: Cho phép người dùng chia sẻ (Public) các bộ Flashcard tự tạo lên cộng đồng.
- [ ] **Study Buddies**: Tận dụng module `Meet` để tạo phòng tự học nhóm (Peer-to-peer) mà không cần giảng viên.

### Retention & Growth (Tăng trưởng & Giữ chân)
- [ ] **Daily Quests & Streak Bonus**: Hệ thống nhiệm vụ nhỏ mỗi ngày (Ví dụ: Học 15 phút, ôn 10 card) để nhận thêm XP và duy trì Streak.
- [ ] **Trial Lesson Flow**: Cho phép học viên chưa mua khóa học trải nghiệm 1-2 bài đầu, sau đó hiển thị gợi ý mua kèm coupon ưu đãi.
- [ ] **Mastery Learning Path**: Gom các khóa học đơn lẻ thành một lộ trình (Combo) từ N5 đến N3 với dashboard tiến độ tổng thể.

### Admin & Lecturer (Quản trị & Giảng dạy)
- [ ] **Student Performance Analytics**: Dashboard cho giảng viên theo dõi tỷ lệ hoàn thành, điểm trung bình và các bài học "khó" nhất đối với học viên.
- [ ] **AI Lesson Assistant**: Hỗ trợ giảng viên tự động tóm tắt nội dung video và sinh câu hỏi trắc nghiệm từ transcript.

## 🏛️ 7. Quản Trị Trung Tâm (Enterprise ERP)
*Dành cho vận hành quy mô doanh nghiệp và quản lý trung tâm Nhật ngữ.*

### Quản Lý Vận Hành
- [ ] **Class & Attendance**: Quản lý lớp học (có thời gian bắt đầu/kết thúc), điểm danh tự động dựa trên sự tham gia Live Class.
- [ ] **Financial Dashboard**: Thống kê doanh thu chi tiết, báo cáo thuế, quản lý hóa đơn (Invoices).
- [ ] **Payroll & Commission**: Tính lương cho giảng viên dựa trên số giờ dạy thực tế hoặc tỷ lệ chia sẻ doanh thu khóa học.
- [ ] **CRM & Ticket System**: Hệ thống quản lý thông tin khách hàng và chăm sóc học viên tập trung.

## 👩‍🏫 8. Công Cụ Giảng Dạy & Biên Soạn (Academic Ops)
- [ ] **JLPT Exam Bank Center**: Ngân hàng câu hỏi chuyên sâu phân loại theo kỹ năng (Đọc, Nghe, Từ vựng, Ngữ pháp) và cấp độ (N5-N1).
- [ ] **AI-Assisted Grading**: AI hỗ trợ chấm điểm sơ bộ bài viết (Sakubun) và phát âm, giúp giảng viên tối ưu thời gian chấm bài.
- [ ] **Interactive Course Builder**: Công cụ cho phép giảng viên tạo các hoạt động tương tác trong bài học (Kéo thả, điền từ vào chỗ trống).

## 🍱 9. Tiện Ích Nhật Ngữ Đặc Thù (Learning Toolkit)
- [ ] **In-App Dictionary**: Tra từ điển ngay trong trang học tập bằng cách bôi đen văn bản.
- [ ] **Kanji Stroke Recognition**: Công cụ tập viết Kanji với tính năng nhận diện nét vẽ và thứ tự nét (Stroke Order) bằng AI.
- [ ] **Shadowing & Waveform Analysis**: Công cụ luyện nói so sánh sóng âm của học viên với giáo viên để cải thiện ngữ điệu.
- [ ] **JLPT Mastery Tracker**: Dashboard theo dõi cụ thể phần trăm kiến thức đã đạt được cho từng cấp độ JLPT.

## 🤝 10. Hệ Sinh Thái & Tăng Trưởng (Ecosystem)
- [ ] **Affiliate & Referral**: Hệ thống tiếp thị liên kết cho phép học viên kiếm hoa hồng khi giới thiệu người học mới.
- [ ] **Subscription Models**: Gói thành viên (Basic/Premium) cho phép truy cập thư viện học liệu không giới hạn.
- [ ] **Blog & Resource SEO Center**: Hệ thống quản lý bài viết kiến thức, văn hóa Nhật Bản để thu hút Traffic tự nhiên.

## 🎯 11. Cá Nhân Hóa & Học Tập Thích Ứng (Personalization)
- [ ] **AI Adaptive Learning Path**: Tự động điều chỉnh lộ trình học (bỏ qua phần đã biết, tập trung phần yếu) dựa trên kết quả bài kiểm tra đầu vào.
- [ ] **Study Goal & Reminders**: Học viên tự đặt mục tiêu (Ví dụ: "Đạt N2 trong 1 năm"), hệ thống tự động nhắc nhở và phân bổ khối lượng học hàng ngày.
- [ ] **Difficulty Auto-Scaling**: Tự động tăng/giảm độ khó của bài tập căn cứ vào tốc độ và tỷ lệ trả lời đúng của học viên.

## 🏢 12. Cổng Thông Tin Đối Tác & Doanh Nghiệp (B2B/Parent Portal)
- [ ] **Corporate Dashboard**: Giao diện dành cho các công ty/tổ chức quản lý tiến độ học tập và hiệu suất của nhóm nhân viên.
- [ ] **Parental Control**: Phụ huynh nhận báo cáo định kỳ và theo dõi quá trình học tập của con qua Email.
- [ ] **Bulk Enrollment Service**: Công cụ đăng ký và quản lý tài khoản số lượng lớn cho các đối tác đào tạo.

## 📱 13. Trải Nghiệm Đa Năng & Thông Báo (Omnichannel)
- [ ] **Smart Notification System**: Tích hợp Firebase/OneSignal để gửi thông báo đẩy (Push) nhắc lịch học hoặc sự kiện mới.
- [ ] **Progress Sync Everywhere**: Đảm bảo đồng bộ tuyệt đối trạng thái học tập giữa các thiết bị.
- [ ] **Offline Practice Mode**: Hỗ trợ chuẩn bị dữ liệu (API Side) cho việc làm flashcard và luyện tập ngoại tuyến.

## 💼 14. Career Center - Kết Nối Việc Làm
- [ ] **Japanese CV Builder**: Công cụ hỗ trợ tạo CV chuẩn Nhật (Rirekisho) tự động điền các chứng chỉ đã đạt được trên nền tảng.
- [ ] **Job Matching AI**: Gợi ý các công việc phù hợp tại Nhật Bản dựa trên cấp độ JLPT và kỹ năng của người học.

## 🛡️ 15. Kiểm Soát Chất Lượng & Phản Hồi (QA & Feedback)
- [ ] **Internal Course Audit**: Luồng kiểm duyệt nội dung nhiều cấp độ trước khi xuất bản chính thức.
- [ ] **Automated Survey System**: Tự động gửi khảo sát ý kiến học viên sau khi hoàn thành khóa học.
- [ ] **Content Reporting**: Cho phép học viên báo cáo lỗi nội dung hoặc lỗi kỹ thuật trực tiếp.

## 🌐 16. Đa Ngôn Ngữ & Toàn Cầu Hóa (Globalization)
- [ ] **Multi-language UI**: Hỗ trợ đa ngôn ngữ (Tiếng Anh, Tiếng Việt, Tiếng Nhật) cho toàn bộ hệ thống Web/App.
- [ ] **Global Payments**: Tích hợp Stripe/PayPal để hỗ trợ học viên quốc tế thanh toán bằng USD/JPY.

## 🎮 17. Nội Dung Tương Tác Chuyên Sâu (Interactive Content)
- [ ] **H5P/SCORM Integration**: Hỗ trợ các định dạng bài giảng tương tác chuẩn quốc tế.
- [ ] **Interactive Stories**: Bài học dạng tình huống có nhiều nhánh kết thúc dựa trên sự lựa chọn của người học.
- [ ] **Live Quiz Battles**: Tổ chức thi đấu kiến thức trực tuyến thời gian thực giữa các học viên.

## 🤝 18. Quản Lý Đối Tác & Giảng Viên (Instructor Ops)
- [ ] **Revenue Share Automator**: Hệ thống tự động tính toán và đối soát hoa hồng cho giảng viên/đối tác.
- [ ] **Instructor Portfolio**: Mỗi giảng viên có trang cá nhân hiển thị uy tín, các khóa học và đánh giá từ học viên.

## 📊 19. Phân Tích Dữ Liệu & BI (Business Intelligence)
- [ ] **Learning Analytics Dashboard**: Phân tích sâu hành vi học tập để cải thiện chất lượng giáo trình.
- [ ] **Business BI**: Theo dõi doanh thu, chi phí vận hành và hiệu quả marketing theo thời gian thực.

## 🗾 20. Đời Sống & Văn Hóa (Cultural Hub)
- [ ] **Expats & Students Wiki**: Cổng thông tin hỗ trợ đời sống, thủ tục và văn hóa Nhật Bản.
- [ ] **Community Exchange**: Diễn đàn giao lưu, trao đổi kinh nghiệm thực tế giữa các học viên.

## 🛡️ 21. Giám Thị AI & Chính Trực Học Thuật (AI Proctoring)
- [ ] **AI Proctoring System**: Giám sát thí sinh qua Camera (phát hiện gian lận, người lạ) trong các kỳ thi JLPT quan trọng.
- [ ] **Browser Lockdown**: Chế độ thi cử ngăn chặn chuyển tab hoặc chụp ảnh màn hình.
- [ ] **Identity Verification**: Xác thực khuôn mặt học viên trước khi bắt đầu thi.

## 📽️ 22. Tính Năng Meet Nâng Cao (Live Learning Plus)
- [ ] **Educational Layouts**: Bảng trắng tương tác, chia nhóm thảo luận (Breakout rooms) và giơ tay phát biểu.
- [ ] **Zero-touch Recording**: Tự động render và đẩy video buổi học vào kho học liệu của học viên sau khi kết thúc.
- [ ] **Collaborative Docs**: Biên soạn ghi chú và bài tập trực tiếp ngay trong phòng học Live.

## ✉️ 23. Automation Tiếp Thị & Chăm Sóc (Marketing Automation)
- [ ] **Drip Campaigns**: Hệ thống email/thông báo tự động nuôi dưỡng học viên từ lúc đăng ký đến lúc mua khóa học.
- [ ] **Abandoned Cart Recovery**: Nhắc nhở và tặng coupon tự động khi học viên bỏ dở bước thanh toán.
- [ ] **Win-back Flows**: Tự động gửi ưu đãi cho học viên đã lâu không quay lại hệ thống.

## ♿ 24. Tiếp Cận Đa Đối Tượng (Accessibility & Inclusion)
- [ ] **WCAG Compliance**: Tối ưu cho trình đọc màn hình và điều hướng bằng bàn phím.
- [ ] **Auto-Captions**: Tự động tạo phụ đề cho video bài học và các buổi Live.
- [ ] **Low-bandwidth Mode**: Chế độ tiết kiệm dung lượng cho khu vực có internet yếu.

## 🔐 25. Bảo Mật & Tuân Thủ Dữ Liệu (Security & Compliance)
- [ ] **Data Privacy (GDPR)**: Công cụ quản lý quyền riêng tư, cho phép xuất dữ liệu hoặc xóa tài khoản vĩnh viễn.
- [ ] **Security Audit Logs**: Lưu trữ lịch sử tất cả các hành động nhạy cảm trên hệ thống.
- [ ] **Disaster Recovery Plan**: Hệ thống sao lưu và dự phòng server đảm bảo uptime 99.99%.

---

## 🎌 26. Tinh Hoa Benchmark (Riki, Dũng Mori, Hikari)
*Những tính năng thực tế giúp tối ưu tỷ lệ đỗ JLPT và trải nghiệm học tập đặc thù.*

### Học Thuật & Nội Dung
- [ ] **Video Interactive Timestamps**: Click vào tên ngữ pháp trong ghi chú để nhảy thẳng đến đoạn video giảng tương ứng.
- [ ] **Flashcard Sync theo Giáo Trình**: Bộ thẻ nhớ chia theo Unit của các giáo trình Minna, Soumatome, Shinkansen.
- [ ] **Exam Tips Library**: Kho lưu trữ các mưu mẹo, chiến thuật làm bài thi JLPT (Micro-learning videos).

### Tương Tác & Cộng Đồng
- [ ] **Live Mock JLPT Exam**: Kỳ thi thử quy mô lớn thời gian thực, có bảng xếp hạng tức thì.
- [ ] **Mentor-led Study Groups**: Chia nhóm học tập nhỏ có Mentor theo sát và nhắc nhở hàng ngày.
- [ ] **24/7 Support Ticket**: Hệ thống giải đáp thắc mắc chuyên môn trong bài học với cam kết thời gian phản hồi.

## 🧠 27. Khoa Học Ghi Nhớ & Đồ Thị Kiến Thức (Advanced Learning Science)
- [ ] **SRS Algorithm Customization**: Cho phép học viên nâng cao tùy chỉnh các khoảng giãn cách của thuật toán lặp lại ngắt quãng (SRS).
- [ ] **Knowledge Graph Visualization**: Bản đồ mạng lưới quan hệ giữa các Kanji và từ vựng đã học, giúp học viên hiểu được sự kết nối kiến thức.
- [ ] **Forgetting Curve Analytics**: Biểu đồ dự báo thời điểm học viên sẽ quên kiến thức để gợi ý thời điểm ôn tập vàng.

## 🕶️ 28. Thực Tế Ảo & Nhập Vai (AR/VR & Immersion)
- [ ] **AR Kanji Scanner**: Sử dụng camera điện thoại để quét và nhận diện Kanji trong đời thực, hiển thị nghĩa và cách đọc ngay lập tức.
- [ ] **360° Virtual Classroom**: Trải nghiệm lớp học trong không gian 3D, giúp học viên thực hành giao tiếp trong môi trường giả lập (Nhà hàng, Ga tàu).
- [ ] **AI Roleplay Characters**: Các nhân vật AI có cá tính riêng để học viên luyện tập hội thoại tự do theo tình huống.

## 🛒 29. Chợ Học Liệu & Đối Tác (Marketplace & Integrations)
- [ ] **Community Deck Marketplace**: Nơi các học viên ưu tú có thể bán hoặc chia sẻ bộ Flashcard/Tài liệu tự soạn.
- [ ] **Unified Textbook Store**: Tích hợp bán sách giấy đi kèm với các khóa học trực tuyến.
- [ ] **API for Developers**: Cung cấp API để các bên thứ ba có thể phát triển thêm các plugin hoặc ứng dụng bổ trợ cho hệ sinh thái Torii.

## 🚀 30. Năng Suất & Kết Nối Ngoại Vi (Productivity & Eco-Integrations)
- [ ] **Calendar Integration**: Đồng bộ lịch học, lịch thi với Google Calendar/Outlook.
- [ ] **Study Stream (Focus Mode)**: Tích hợp đồng hồ Pomodoro và nhạc nền Lofi/Ambient tập trung ngay trong giao diện học.
- [ ] **Browser Extension**: Tiện ích trình duyệt giúp tra từ và lưu từ vựng vào Torii khi học viên đang đọc báo/xem YouTube tiếng Nhật.
## 💬 31. Hệ Thống Chat & Tương Tác Thời Gian Thực (Communication Hub)
- [ ] **Course Group Chat**: Phòng chat thời gian thực cho mỗi khóa học/lớp học.
- [ ] **Instructor-Learner DM**: Nhắn tin trực tiếp giữa giảng viên và học viên.
- [ ] **Threaded Discussions**: Tổ chức cuộc hội thoại theo luồng trong chat.
- [ ] **AI Sensei Chat Bot**: Tự động trả lời câu hỏi và gợi ý học liệu trong phòng chat.

## 📚 32. Thư Viện Tài Liệu Số (Digital E-Library)
- [ ] **Centralized Repository**: Quản lý PDF, Audio và tài liệu ôn thi một cách tập trung.
- [ ] **Internal Media Player**: Trình nghe nhạc và xem tài liệu bảo mật, ngăn chặn sao chép trái phép.

## 🎓 33. Học Bổng & Tài Chính (Financial Aid)
- [ ] **Torii Wallet**: Hệ thống ví nội bộ quản lý số dư, tiền thưởng và hoàn trả.
- [ ] **Scholarship Management**: Quy trình nộp đơn, xét duyệt và cấp học bổng cho học viên.
- [ ] **Financing/Installment**: Hỗ trợ trả góp học phí cho các khóa học chuyên sâu dài hạn.

## 🏟️ 34. Sự Kiện & Ngoại Khóa (Events Management)
- [ ] **Webinar/Workshop Booking**: Quản lý đăng ký tham gia các buổi học trực tuyến chuyên đề.
- [ ] **Offline Integration**: Đăng ký tham gia các buổi offline, giao lưu tại trung tâm.

## 🤖 35. Trợ Lý AI Đồng Hành (AI Companion)
- [ ] **Proactive Study Buddy**: AI chủ động nhắc lịch học và động viên học viên hàng ngày.
- [ ] **Learning Sentiment Analysis**: Nhận diện cảm xúc học viên qua tương tác để tinh chỉnh cách hỗ trợ.
- [ ] **Weekly Progress Digest**: Báo cáo tóm tắt kiến thức và gợi ý lộ trình tuần mới qua Email/Push.

## 🔐 36. Chứng Chỉ Số & Xác Thực (Blockchain Verification)
- [ ] **Blockchain Certificate**: Cấp chứng chỉ định danh duy nhất (Hash) có thể xác thực tính chính xác trên toàn cầu.
- [ ] **Instant QR Verification**: Nhà tuyển dụng có thể quét QR trên bằng cấp để xem profile học tập thực tế của học viên.

## 🎧 37. Podcast & Học Tập Âm Thanh (Audio-first Learning)
- [ ] **Background Playback**: Cho phép nghe bài giảng/hội thoại khi tắt màn hình hoặc chuyển ứng dụng.
- [ ] **Audio-only Courseware**: Các khóa học chuyên nghe (Podcast style) cho người bận rộn.

## 🏢 38. Giải Pháp Cho Đối Tác B2B (White-labeling)
- [ ] **Multi-tenant Architecture**: Hỗ trợ chạy nhiều thương hiệu trung tâm khác nhau trên cùng một hạ tầng kỹ thuật.
- [ ] **Partner Branding**: Tùy chỉnh màu sắc, logo và tên miền riêng cho từng đơn vị đối tác.

## 🧪 39. Cá Nhân Hóa Nội Dung Bằng AI (AI Courseware)
- [ ] **Dynamic Example Generation**: AI tự động đổi các ví dụ trong ngữ pháp dựa trên sở thích cá nhân (Anime, IT, Kinh tế) của học viên.
- [ ] **AI-Generated Practice Tests**: Tự động sinh đề kiểm tra mới hoàn toàn mỗi lần làm dựa trên kho kiến thức cốt lõi.

## ☁️ 40. Đồng Bộ & Ngoại Tuyến (Reliability & Sync)
- [ ] **Intelligent Offline Sync**: Tự động tải trước (Prefetch) bài học tiếp theo và đồng bộ kết quả khi có mạng.
- [ ] **Local Cache Manager**: Quản lý dung lượng lưu trữ trên thiết bị thông minh.

---

## 📝 Ghi Chú Kỹ Thuật
- Các API mới cần được đăng ký trong `apps/server/modules/gateway` để expose ra ngoài.
- UI Learner sử dụng **TailwindCSS + ShadcnUI** (`apps/web-learner`).
- UI Admin sử dụng **Vite + React + ShadcnUI** (`apps/web-admin`).
