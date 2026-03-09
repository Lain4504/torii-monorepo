# Spec: Nâng cấp hệ thống thi để hỗ trợ đề thi theo từng phần (JLPT-style)

## 1. Mục tiêu

Nâng cấp hệ thống thi cử hiện tại để hỗ trợ các kỳ thi được chia thành nhiều phần (section), trong đó mỗi phần có quỹ thời gian làm bài độc lập. Mục tiêu là để mô phỏng chính xác các kỳ thi chuẩn hóa như JLPT, nơi các phần thi Ngữ pháp, Đọc hiểu, Nghe hiểu có thời gian tính riêng.

## 2. Phân tích Yêu cầu

### 2.1. Hiện trạng

- **Tính giờ toàn cục:** Hệ thống đang sử dụng trường `totalTimeLimitMinutes` trên model `Exam` để đặt một mốc thời gian kết thúc (`deadlineAt`) duy nhất cho toàn bộ bài thi.
- **Chuyển phần ngay lập tức:** Khi người dùng hoàn thành một phần, hệ thống sẽ chuyển ngay sang phần tiếp theo mà không có bước đệm.
- **Schema đã có sẵn:** Model `ExamSection` đã có trường `timeLimitSeconds`, nhưng nó chưa được sử dụng trong logic tính giờ.

### 2.2. Yêu cầu mới

1.  **Tính giờ theo từng phần:**
    - Logic phải chuyển từ việc sử dụng `Exam.totalTimeLimitMinutes` sang `ExamSection.timeLimitSeconds`.
    - Mỗi phần thi phải có một đồng hồ đếm ngược riêng. Khi hết giờ của một phần, hệ thống cần tự động chuyển người dùng sang phần tiếp theo hoặc kết thúc bài thi nếu đó là phần cuối cùng.
2.  **Thông báo nghỉ giữa các phần (UI/UX):**
    - **Không yêu cầu thay đổi schema** (`breakAfterSeconds` là không cần thiết).
    - Thay vì một khoảng nghỉ bị ép buộc, sau khi hoàn thành một phần, giao diện người dùng sẽ hiển thị một màn hình thông báo đơn giản.
    - Nội dung thông báo: "Bạn đã hoàn thành Phần X. Bạn có thể nghỉ ngơi một chút hoặc bắt đầu làm Phần Y ngay bây giờ."
    - Giao diện này sẽ có một nút "Bắt đầu phần tiếp theo" để người dùng chủ động chuyển sang phần mới.

## 3. Thay đổi cần thực hiện

### 3.1. Backend (`apps/server/services/academy`)

#### File: `src/modules/assessment/exam-attempt/exam-attempt.service.ts`

1.  **Phương thức `start()`:**
    - Ngừng việc tính toán và gán giá trị cho `deadlineAt` trên `ExamAttempt`. Trường này sẽ không còn được sử dụng để kiểm soát thời gian toàn bài thi nữa.
    - `deadlineAt` có thể được giữ lại để set một giới hạn cứng cuối cùng (ví dụ sau 24h phải nộp), nhưng không dùng cho việc đếm ngược trực tiếp.
    - Logic hiện tại:
      ```typescript
      const deadlineAt = exam.totalTimeLimitMinutes
        ? new Date(now.getTime() + exam.totalTimeLimitMinutes * 60000)
        : null;
      ```
    - **Thay đổi:** Gỡ bỏ hoặc thay đổi logic này. `deadlineAt` nên được set thành `null`.

2.  **Phương thức `nextSection()`:**
    - Đây là phương thức cần thay đổi nhiều nhất.
    - Khi chuyển từ `currentSection` sang `nextSection`, logic cần ghi nhận `startedAt: new Date()` cho `ExamAttemptSectionState` của `nextSection`.
    - Phương thức này sẽ được gọi bởi client khi người dùng nhấn nút "Bắt đầu phần tiếp theo" từ màn hình nghỉ.

3.  **Cần bổ sung logic kiểm tra thời gian hợp lệ (Validation):**
    - Khi client gửi yêu cầu chuyển phần (`nextSection`) hoặc nộp bài (`submit`), backend cần xác thực rằng thời gian làm bài của section hiện tại chưa bị vượt quá.
    - Ví dụ, khi gọi `nextSection`, backend cần lấy `ExamAttemptSectionState` của `currentSection`, so sánh `endedAt` (thời điểm gọi) với `startedAt` và `ExamSection.timeLimitSeconds` để đảm bảo hợp lệ. Nếu người dùng cố tình "hack" ở client-side để có thêm thời gian, backend sẽ phát hiện được.

### 3.2. Frontend (`apps/web-learner`)

#### File: `/app/(learning)/exams/[examId]/take/page.tsx`

1.  **Quản lý State (State Management):**
    - Cần bổ sung các state mới để quản lý trạng thái của từng phần thi:
      - `currentSection`: Thông tin chi tiết về section đang làm (bao gồm `id`, `title`, `timeLimitSeconds`).
      - `sectionTimeRemaining`: Thời gian còn lại của section hiện tại (tính bằng giây).
      - `isBreakScreenVisible`: State để kiểm soát việc hiển thị màn hình nghỉ giữa các phần.

2.  **Logic tải dữ liệu (`loadExam` trong `useEffect`):**
    - Khi bắt đầu hoặc tiếp tục bài thi, ngoài việc lấy thông tin chung, cần xác định `currentSection` đang hoạt động (`status: 'IN_PROGRESS'`) từ `attempt.sections`.
    - Dựa vào `currentSection.startedAt` và `currentSection.timeLimitSeconds`, tính toán `sectionTimeRemaining` ban đầu.

3.  **Xử lý chuyển phần:**
    - Khi người dùng nhấn nút "Next" ở câu hỏi cuối cùng của một phần, hoặc khi `ExamTimer` báo hết giờ, thay đổi state `isBreakScreenVisible` thành `true`.
    - Hiển thị một component màn hình nghỉ.

#### Component mới: `BreakScreen.tsx` (hoặc logic tương tự trong `take/page.tsx`)

- Component này sẽ hiển thị khi `isBreakScreenVisible` là `true`.
- Giao diện gồm:
    - Tiêu đề: "Đã hoàn thành Phần X".
    - Mô tả: "Bạn có thể nghỉ ngơi một chút trước khi bắt đầu phần tiếp theo."
    - Nút "Bắt đầu Phần Y": Khi nhấn, nút này sẽ:
        1.  Gọi API để backend thực hiện `nextSection()`.
        2.  Sau khi API thành công, cập nhật state của `TakeExamPage`:
            - `isBreakScreenVisible = false`.
            - Cập nhật `currentSection` thành thông tin của phần mới.
            - Reset `sectionTimeRemaining` với giá trị `timeLimitSeconds` của phần mới.
            - `setCurrentQuestionIndex` về câu hỏi đầu tiên của phần mới.

#### Component: `@/components/exams/take/exam-timer.tsx`

1.  **Props:**
    - Component này không nên nhận `durationMinutes` từ toàn bộ `Exam` nữa.
    - Nên nhận `key={currentSection.id}` và `initialSeconds={sectionTimeRemaining}`. Việc truyền `key` sẽ giúp React tự động reset component khi section thay đổi.
2.  **Logic `onTimeUp`:**
    - Khi hết giờ, `onTimeUp` sẽ được gọi.
    - Handler của `onTimeUp` trong `TakeExamPage` cần thực hiện logic tự động chuyển sang màn hình nghỉ (set `isBreakScreenVisible = true`), tương tự như khi người dùng nhấn nút "Next" ở câu cuối.

### 3.3. Cơ sở dữ liệu (Database)

- **Không yêu cầu thay đổi schema.**
- Toàn bộ logic mới sẽ tận dụng các trường đã có sẵn là `ExamSection.timeLimitSeconds` và các trường trong `ExamAttemptSectionState`.
