## � Hiện Trạng Hệ Thống (Current State)
Dự án mobile hiện đang được phát triển song song tại thư mục `torii-mobile` bằng **Flutter** (Clean Architecture + Riverpod). Tuy nhiên, qua rà soát, hệ thống hiện tại mới chỉ dừng lại ở mức **Giao diện mẫu (Mock UI)**, hầu hết các logic thực tế và đồng bộ dữ liệu đều đang thiếu.

---

## 📋 0. Kiểm Tra Các Tính Năng Cơ Bản Còn Thiếu (Basic Audit)
*Đây là những mục "cốt tử" cần hoàn thiện trước khi triển khai các tính năng AI nâng cao.*

### 🛠️ Core LMS (Học tập cơ sở)
- [ ] **Live Class Participation**: Tích hợp SDK LiveKit/Jitsi vào màn hình `live_class`. Hiện tại mới chỉ xem được lịch, chưa thể vào phòng học.
- [ ] **Real-time Sync Progress**: Logic gọi API cập nhật tiến độ học tập khi học viên hoàn thành video/bài viết.
- [ ] **Certificate Viewer**: Màn hình hiển thị danh sách và cho phép xem/tải chứng chỉ (hiện tại chưa có).

### 🕹️ Gamification (Logic thực tế)
- [ ] **Leaderboard API Integration**: Kết nối trang Ranking với Backend (Hiện tại folder trống).
- [ ] **XP Reward Shop UI/UX**: Màn hình đổi điểm thưởng cho học viên.
- [ ] **Dynamic Streak Tracker**: Logic tính toán và hiển thị Streak thực tế từ server.

### 📶 Offline Mode (Dữ liệu thật)
- [ ] **Integrated Download Manager**: Thay thế dữ liệu Mock trong `DownloadsPage` bằng logic tải xuống file thực tế qua `flutter_downloader`.
- [ ] **Local Storage Persistence**: Lưu trữ bài học đã tải vào SQLite để truy cập khi không có mạng.

---

## 🏗️ 1. Nền Tảng & Hạ Tầng (Infrastructure)
- [ ] **Khởi tạo Project**: Expo (React Native) là lựa chọn tối ưu để tái sử dụng Logic và Type từ `@workspace/schemas`.
- [ ] **Shared Logic Integration**: Tích hợp các thư viện API client dùng chung từ monorepo.
- [ ] **Offline-First Architecture**: Sử dụng **SQLite** hoặc **WatermelonDB** để lưu trữ bài học và flashcard ngoại tuyến.
- [ ] **Biometric Auth**: Đăng nhập bằng FaceID / Fingerprint để tăng tính tiện dụng.

## 🔔 2. Hệ Thống Thông Báo & Giữ Chân (Retention)
- [ ] **Smart Push Notifications**: Nhắc lịch học, nhắc ôn tập Flashcard (SRS) dựa trên thời gian vàng của người dùng.
- [ ] **Lock Screen Widgets**: Hiển thị 1 từ vựng/Kanji "Từ của ngày" ngay trên màn hình khóa.
- [ ] **Daily Streak Widget**: Hiển thị ngọn lửa Streak ngay trên màn hình chính để thúc đẩy học tập.

## 🎙️ 3. Công Cụ Học Tập Đặc Thù Mobile
- [ ] **Shadowing Mode (Voice Recording)**: Tận dụng Microphone để học viên thu âm và AI chấm điểm phát âm trực tiếp.
- [ ] **Handwriting Recognition**: Luyện viết Kanji trực tiếp trên màn hình cảm ứng với phản hồi thời gian thực về thứ tự nét.
- [ ] **Scan & Translate (OCR)**: Sử dụng Camera để quét chữ tiếng Nhật trên bao bì, văn bản thực tế và dịch ngay lập tức.
- [ ] **Background Audio Player**: Trình phát Audio bài học/Podcast tối ưu (điều khiển được từ màn hình khóa và trung tâm điều khiển).

## 📶 4. Chế Độ Ngoại Tuyến (Offline Mode)
- [ ] **Download Manager**: Cho phép tải xuống toàn bộ video bài giảng hoặc audio để học khi không có internet (máy bay, tàu điện).
- [ ] **Offline Flashcard Sync**: Làm thẻ nhớ ngoại tuyến và tự động đồng bộ kết quả lên server khi có mạng lại.

## 🤝 5. Tích Hợp Hệ Sinh Thái
- [ ] **Meet Mobile Integration**: Tích hợp SDK của LiveKit/Jitsi để tham gia Live Class ngay trên điện thoại với giao diện mobile-optimized.
- [ ] **Push-to-Chat**: Thông báo tin nhắn từ phòng chat khóa học và phản hồi nhanh (Quick Reply) từ thanh thông báo.
- [ ] **Apple Watch / WearOS Support**: Nhận thông báo từ vựng và làm các bài flashcard cực ngắn (Yes/No) ngay trên đồng hồ.

## 🎨 6. Trải Nghiệm Người Dùng (UX)
- [ ] **Dark Mode / Eye Comfort**: Chế độ lọc ánh sáng xanh để bảo vệ mắt khi học ban đêm.
- [ ] **Haptic Feedback**: Sử dụng rung phản hồi khi học viên chọn đúng đáp án hoặc hoàn thành mục tiêu.
- [ ] **One-Handed Navigation**: Thiết kế giao diện tối ưu để người dùng có thể học bằng một tay khi đang di chuyển trên tàu.

## 🎙️ 7. AI Voice & Hội Thoại Thông Minh (Advanced AI)
- [ ] **Voice Command Interface**: Điều khiển ứng dụng bằng giọng nói (ví dụ: "Mở bài ôn tập N3", "Tra từ mới").
- [ ] **AI Conversation Partner (Voice)**: Luyện hội thoại 1:1 với AI bằng giọng nói tự nhiên, tích hợp nhận diện lỗi phát âm (Pitch Accent).
- [ ] **Smart Dictation**: Chế độ luyện nghe và viết lại, sử dụng bàn phím ảo kết hợp nhận diện giọng nói để kiểm tra chính tả.

## 🕶️ 8. Thực Tế Tăng Cường (AR Immersion)
- [ ] **AR Vocab Tags**: Sử dụng AR để gắn nhãn tiếng Nhật lên các đồ vật thực tế xung quanh bạn (Ví dụ: Nhìn vào tủ lạnh hiện chữ "Reizouko").
- [ ] **Virtual Sensei AR**: Hiển thị giảng viên 3D (Avatar AI) ngay trong phòng của bạn để hướng dẫn học tập sinh động hơn.

## 📍 9. Kết Nối Bạn Học & Xã Hội (Social Discovery)
- [ ] **Study Buddies Nearby**: Tìm kiếm và kết nối với những người đang học cùng trình độ trong khu vực lân cận (Location-based).
- [ ] **Quick Share Extension**: Tích hợp vào menu "Share" của điện thoại để tra từ hoặc lưu nội dung tiếng Nhật từ trình duyệt/YouTube vào Torii.
- [ ] **Flashcard Battle (Real-time)**: Chế độ thi đấu thẻ nhớ trực tuyến với bạn bè hoặc học viên ngẫu nhiên trên toàn thế giới.

## 📱 10. Tối Ưu Hóa Trải Nghiệm & Đa Bệ Phóng (Advanced UX)
- [ ] **Tablet-First Design**: Tối ưu giao diện cho iPad/Máy tính bảng với chế độ chia màn hình (xem video bài giảng và ghi chép đồng thời).
- [ ] **Japanese Custom Keyboard**: Bàn phím chuyên dụng hỗ trợ học tập (gợi ý Kanji, Furigana nhanh) tích hợp ngay trong app.
- [ ] **Shortcuts & Siri/Google Assistant**: Tích hợp Siri Shortcuts hoặc Google Assistant để bắt đầu nhanh các bài ôn tập hàng ngày qua lệnh thoại.
- [ ] **Handoff Support**: Đang xem bài giảng trên Web, mở Mobile App lên sẽ tiếp tục chính xác tại giây đó (và ngược lại).

---

## 📝 Ghi Chú Kỹ Thuật cho Mobile
- **Tech Stack đề xuất**: React Native (Expo) để tận dụng kiến thức TypeScript hiện có.
- **State Management**: React Query (TanStack Query) cho caching dữ liệu server và Zustand cho state nội bộ.
- **Navigation**: React Navigation hoặc Expo Router.
- **API**: Kết nối trực tiếp đến `apps/server/gateway` qua giao thức REST hoặc GraphQL.
