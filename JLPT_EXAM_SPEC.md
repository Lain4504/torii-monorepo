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

## 4. Xử lý các nhóm câu hỏi nhỏ (Mondai) bên trong Section

### 4.1. Vấn đề
Trong một phần thi (ví dụ: N5 - Kiến thức ngôn ngữ: 25 phút), lại được chia thành nhiều mục nhỏ (Mondai 1: Đọc Kanji, Mondai 2: Điền từ). Các mục nhỏ này dùng chung quỹ thời gian 25 phút của phần thi đó và thường có chung một câu chỉ dẫn.

### 4.2. Giải pháp với Schema hiện tại
Schema hiện tại **HOÀN TOÀN ĐÁP ỨNG ĐƯỢC** yêu cầu này thông qua 2 cách tiếp cận mà không cần thêm bảng mới:

**Cách 1: Sử dụng trường `metadata` trên bảng `ExamQuestion` (Khuyên dùng cho Từ vựng/Ngữ pháp)**
- Bảng `ExamQuestion` có trường `metadata` (kiểu JSONB).
- Khi ghép câu hỏi vào đề (`ExamSection`), ta thêm thông tin gom nhóm vào `metadata` của câu hỏi ĐẦU TIÊN thuộc nhóm đó.
- Ví dụ: Trong mảng 15 câu hỏi của Section 1.
    - Câu số 1 có `metadata`: `{ "mondaiTitle": "Mondai 1", "instruction": "Chọn cách đọc đúng của Kanji" }`
    - Câu số 6 có `metadata`: `{ "mondaiTitle": "Mondai 2", "instruction": "Chọn từ thích hợp điền vào chỗ trống" }`
- **Phía Frontend:** Khi render danh sách câu hỏi của Section, chỉ cần check nếu `examQuestion.metadata.mondaiTitle` tồn tại thì render một khối Tiêu đề (Heading) trước khi render câu hỏi.
- **Ưu điểm:** Giữ các câu hỏi trong Pool hoàn toàn độc lập, dễ dàng tái sử dụng và trộn đề ngẫu nhiên.

**Cách 2: Sử dụng loại câu hỏi `GROUP_PARENT` (Khuyên dùng cho Đọc Hiểu/Nghe Hiểu)**
- Bảng `Question` có thiết kế đệ quy (`parentId`) và loại câu hỏi `GROUP_PARENT`.
- Ta tạo 1 câu hỏi cha (`GROUP_PARENT`) chứa nội dung là đoạn văn đọc hiểu hoặc audio. Các câu hỏi thực tế là `subQuestions` trỏ `parentId` về câu cha này.
- **Ưu điểm:** Phù hợp với các bài có ngữ cảnh chung (1 đoạn văn dài, 3 câu hỏi liên quan).
- **Nhược điểm:** Các câu hỏi con bị dính chặt vào câu cha, khó tách riêng.

---

## 5. Đề xuất UI/UX: Trình tạo đề thi trực quan (WYSIWYG A4 Builder)

Bạn đã đưa ra một ý tưởng **cực kỳ xuất sắc** về mặt trải nghiệm người dùng (UX). Thay vì bắt người dùng (Giảng viên/Admin) điền form một cách máy móc và phải hình dung cấu trúc đề thi, việc cung cấp một giao diện mô phỏng tờ giấy A4 (WYSIWYG - What You See Is What You Get) sẽ mang lại cảm giác tự nhiên và thân thiện nhất, giống hệt như đang dùng Notion hay Google Docs.

**Schema hiện tại (Prisma) HOÀN TOÀN ĐÁP ỨNG ĐƯỢC thiết kế UI này.** Bảng dữ liệu chỉ là nơi lưu trữ, còn UI là cách ta hiển thị và cho phép người dùng tương tác.

### 5.1. Thiết kế Giao diện (Mockup/Layout)
- **Khu vực trung tâm (Canvas):** Một khung hình chữ nhật có tỷ lệ chuẩn A4, viền xám nhạt, có đổ bóng (`box-shadow`), nền trắng. Nằm giữa màn hình (centered).
- **Cấu trúc "Trang giấy":**
    - **Header:** Click vào có thể gõ trực tiếp Tên đề thi (Exam Title), Tổng thời gian.
    - **Section (Phần thi):** Có một đường kẻ nét đứt màu đỏ/xanh phân cách. Tiêu đề "Phần 1: Kiến thức ngôn ngữ".
    - **Mondai (Nhóm câu hỏi):** Dấu hiệu nhận biết là chữ in đậm, ví dụ: **問題 1**.
    - **Câu hỏi (Question Blocks):** Dạng danh sách từ 1 đến N.
- **Tương tác (Interaction):**
    - **Dấu cộng ảo (Floating Add Button):** Khi di chuột (hover) vào khoảng trống giữa các câu hỏi hoặc cuối trang, hiện ra icon `+`. Nhấn vào sẽ có menu thả xuống:
        - Thêm câu hỏi Trắc nghiệm (Tạo mới)
        - Thêm câu hỏi Đọc đoạn văn (Tạo `GROUP_PARENT`)
        - Thêm Nhóm mới (Mondai - Tự động ghi vào `metadata` của câu tiếp theo)
        - Chọn từ Ngân hàng (Mở sidebar trượt ra bên phải để kéo thả câu hỏi từ `QuestionPool` vào tờ A4).
    - **Nhập liệu trực tiếp (Inline Editing):** Không mở Dialog mới. Nhấn vào nội dung câu hỏi là khung text biến thành ô `Input`/`Textarea` (giống Notion).

### 5.2. Luồng xử lý ngầm và Auto-save (Bản nháp)

Để mang lại trải nghiệm không bao giờ mất dữ liệu (như CV Builder), hệ thống cần xử lý như sau:

**1. Trạng thái bản nháp (Drafting)**
- `Exam` ngay khi được tạo (hoặc khi người dùng mới nhấn nút "Tạo đề thi mới") sẽ có `status = "DRAFT"`.
- Mọi câu hỏi được *gõ trực tiếp trên tờ A4* sẽ được lưu vào bảng `Question` với trạng thái nháp (chưa thuộc Pool chính thức nào) và nối lập tức vào `ExamQuestion`.

**2. Cơ chế Auto-save (Lưu tự động)**
- **Client-side State:** Frontend sẽ giữ một cây dữ liệu JSON khổng lồ (Zustand hoặc React Context) mô phỏng chính xác tờ A4.
- **Debounce / Timeout:** Bất cứ khi nào người dùng gõ một chữ, hệ thống đếm ngược 1 giây (debounce). Nếu ngừng gõ quá 1 giây, Frontend gọi API `PATCH /api/academy/exams/auto-save` gửi cây JSON này lên.
- **Local Storage:** Song song đó, lưu cây JSON này vào `localStorage` của trình duyệt phòng trường hợp rớt mạng đột ngột.
- **UI Indicator:** Góc trên cùng bên phải của tờ A4 có dòng chữ mờ nhỏ: "Đang lưu..." -> "Đã lưu nháp lúc 10:45 AM".

### 5.3. Mapping UI Builder vào Schema
Khi người dùng tương tác trên tờ A4, dưới backend sẽ chạy các thao tác Database tương ứng:

| Hành động trên UI (Tờ A4) | Xử lý Database tương ứng (Schema hiện tại) |
| :--- | :--- |
| Gõ đổi Tên đề thi ở Header | `UPDATE Exam SET title = ...` |
| Bấm `+` chọn "Thêm Phần thi mới" | `INSERT INTO ExamSection (examId, title...)` |
| Bấm `+` gõ "Mondai 1: ..." | Cập nhật state Frontend. Đợi đến khi add câu hỏi đầu tiên bên dưới Mondai này, sẽ gán chuỗi đó vào trường `ExamQuestion.metadata.mondaiTitle`. |
| Gõ nội dung câu hỏi 1, 2, 3... | `INSERT INTO Question` sau đó `INSERT INTO ExamQuestion (examId, sectionId, questionId, orderIndex)`. |
| Kéo thả (Drag & Drop) đảo vị trí câu hỏi 1 và 2 | Cập nhật đồng loạt cột `orderIndex` trong bảng `ExamQuestion` của các câu đó. |

**Kết luận:** Ý tưởng "A4 Builder" kết hợp tính năng Auto-save là một tiêu chuẩn của các hệ thống LMS hiện đại (EdTech). Schema của hệ thống hoàn toàn tương thích 100% với kiến trúc này mà không cần sửa đổi dù chỉ 1 dòng ở Backend DB. Cốt lõi nằm ở việc xây dựng giao diện kéo thả (ví dụ sử dụng `dnd-kit`) và xử lý state management phức tạp ở phía Frontend (React).

---

## 6. Đề xuất UI/UX: Trải nghiệm làm bài thi JLPT (Test Taker View)

Để mô phỏng cảm giác làm bài thi JLPT sát thực tế nhất (giống như đang làm trên một tờ giấy thi thật), giao diện làm bài (Take Exam View) cần được thiết kế lại theo dạng **Continuous Scroll (Cuộn dọc liên tục)** thay vì Pagination (Mỗi trang 1 câu) như hiện tại.

### 6.1. Bố cục màn hình (Layout)
Màn hình được chia làm 2 phần (Split View):

**1. Khung bên trái (Bài làm - 70-75% width):**
- **Hiển thị dạng List dài:** Tất cả các câu hỏi của `currentSection` (Phần thi hiện tại) được in ra liên tục từ trên xuống dưới trên một "tờ giấy trắng".
- **Gom nhóm Mondai (Dựa theo `metadata.mondaiTitle`):**
    - Trình bày rõ ràng các khối Tiêu đề Mondai (Ví dụ: in đậm, có viền bao quanh).
    - Ngay dưới Tiêu đề Mondai là toàn bộ các câu hỏi thuộc Mondai đó.
- **Xử lý Đọc hiểu (Reading):** Bài đọc dài sẽ nằm bên trái (chiếm 50% khung này), các câu hỏi trắc nghiệm liên quan nằm bên phải để học viên không phải cuộn lên cuộn xuống quá nhiều.
- **Tương tác trực tiếp:** Học viên click trực tiếp vào các Radio button (hoặc ô A, B, C, D) ngay trên tờ giấy này để chọn đáp án.

**2. Khung bên phải (Bảng điều khiển - 25-30% width, Sticky):**
Khung này được ghim (sticky) cố định trên màn hình dù học viên có cuộn tờ giấy bên trái xuống đến đâu.
- **Đồng hồ đếm ngược (Timer):** Rất to và rõ ràng, hiển thị thời gian còn lại của **Section hiện tại** (Ví dụ: 25:00 cho Phần Kiến thức ngôn ngữ).
- **Lưới câu hỏi (Question Navigator / Bubble Sheet):**
    - Mô phỏng "Phiếu tô đáp án" (Omark sheet).
    - Hiển thị danh sách các ô số từ 1 đến N (số lượng câu hỏi trong Section).
    - **Trạng thái ô số:**
        - Màu trắng (hoặc xám viền nét đứt): Chưa làm.
        - Màu xanh/đậm: Đã chọn đáp án.
        - Icon Cờ (Flag): Đánh dấu để xem lại (Review later).
    - **Tương tác:** Click vào ô số "15" sẽ cuộn nhanh (Smooth scroll) khung bên trái đến chính xác vị trí câu 15 trên tờ giấy.
- **Nút Hành động:**
    - Nút "Nộp phần thi này" (Nổi bật, nằm dưới cùng).

### 6.2. Luồng thao tác của Học viên (Learner Flow)
1. **Bắt đầu Section:** Khung bên trái in ra toàn bộ câu hỏi (Ví dụ 35 câu của phần Từ vựng N5).
2. **Làm bài:** Học viên cuộn từ trên xuống, vừa đọc vừa click chọn đáp án.
3. **Đánh dấu:** Gặp câu khó (câu số 8), học viên bấm nút "Cắm cờ" kế bên câu hỏi. Ô số 8 trên Lưới câu hỏi bên phải hiện lên màu cam/đỏ.
4. **Kiểm tra lướt:** Nhìn sang Lưới câu hỏi bên phải, học viên dễ dàng thấy mình đã bỏ trống câu 12, 14 và đang cắm cờ câu 8. Click vào số 12 để cuộn nhanh đến đó làm bù.
5. **Nộp bài / Hết giờ:**
    - Nhấn "Nộp phần thi này" -> Cảnh báo nếu còn câu chưa làm -> Xác nhận.
    - Chuyển sang **Màn hình nghỉ (Break Screen)** như đã đề cập ở Phần 3.
    - Nhấn "Bắt đầu phần tiếp theo" -> Lặp lại bước 1 cho Section tiếp theo.

### 6.3. Xử lý Logic Auto-save (Draft Answers)
Dù giao diện hiển thị List dài, cơ chế lưu nháp vẫn phải hoạt động liên tục:
- Mỗi khi học viên click chọn một đáp án, Frontend sẽ lưu trạng thái đó vào Redux/Context.
- Kích hoạt Debounce (khoảng 2-3 giây) để gửi API `PATCH /api/academy/exam-attempts/:id/draft-answers` lưu đáp án nháp lên Backend.
- Nếu lỡ F5 hoặc mất mạng, khi vào lại, tờ giấy bên trái và Lưới câu hỏi bên phải vẫn sáng đèn những câu đã làm.

**Kết luận:** Việc đổi UI từ "Từng câu một" sang "Tờ giấy cuộn dọc + Lưới đáp án Sticky" là chuẩn mực của các bài thi chứng chỉ quốc tế (như TOEIC, JLPT trên máy tính). Nó giúp học viên có cái nhìn bao quát toàn bộ đề, dễ dàng phân bổ thời gian (nhìn đồng hồ) và dễ dàng kiểm tra chéo các câu hỏi (dùng Lưới câu hỏi). Schema hiện tại hoàn toàn hỗ trợ được cấu trúc hiển thị này.

---

## 7. Đánh giá độ khó triển khai và Mức độ Ưu tiên

### 7.1. Đánh giá độ khó (Feasibility)

**Về phía Backend (Database & API): Dễ (Easy)**
- Schema Database hiện tại đã bao phủ **100%** nhu cầu lưu trữ (câu hỏi, phần thi, kết quả, thời gian, bài nháp). KHÔNG cần sửa database.
- Các API hiện tại (lấy câu hỏi, lưu nháp, nộp bài) phần lớn đã có sẵn, chỉ cần điều chỉnh nhẹ (như bỏ tính giờ toàn bộ mà chuyển sang tính giờ từng section).

**Về phía Frontend (React/UI): Khá (Medium to Hard)**
- Cả ý tưởng **"A4 Builder"** (cho Admin) và **"Cuộn dọc + Lưới câu hỏi"** (cho Learner) đều yêu cầu kỹ năng Frontend tốt, đặc biệt là việc quản lý State Management (Redux/Zustand) và thao tác DOM (cuộn mượt, kéo thả).
- **"Cuộn dọc + Lưới câu hỏi" (Learner):** Độ khó ở mức **Khá (Medium)**. Chủ yếu là việc đồng bộ State giữa danh sách câu hỏi đang cuộn bên trái và màu sắc của lưới câu hỏi bên phải. Xử lý logic Debounce để gọi API lưu nháp.
- **"A4 Builder" (Admin):** Độ khó ở mức **Khó (Hard)**. Làm giao diện kéo thả (Drag and Drop), cho phép sửa nội dung trực tiếp (Inline Editing) giống Google Docs tốn rất nhiều thời gian xử lý các edge-cases (trường hợp ngoại lệ) về UI/UX.

### 7.2. Mức độ ưu tiên thực hiện (Action Plan)

Dựa trên nguyên tắc ưu tiên giá trị cho người dùng cuối (Học viên) trước:

**ƯU TIÊN 1: Triển khai UI Làm bài cho Học viên (Phần 6) - CẦN LÀM NGAY**
- *Lý do:* Đây là trải nghiệm cốt lõi quyết định chất lượng khóa học. Nếu trải nghiệm làm bài tệ, học viên sẽ nản. Mô hình cuộn dọc và lưới câu hỏi là bắt buộc đối với một bài thi dài như JLPT.
- *Hành động:* Tập trung resources thiết kế lại trang `/exams/:id/take`. Làm tốt phần lưới câu hỏi (Bubble Sheet), đếm ngược theo Section, và lưu nháp.

**ƯU TIÊN 2: Nâng cấp luồng chuyển Section & Màn hình nghỉ (Phần 3) - CẦN LÀM KẾ TIẾP**
- *Lý do:* Nối tiếp Ưu tiên 1, xử lý hoàn thiện cảm giác làm bài thi thật với các đoạn nghỉ ngơi giữa giờ.

**ƯU TIÊN 3: Giao diện A4 Builder cho Admin/Lecturer (Phần 5) - CHỈ LÀ ĐỀ XUẤT TƯƠNG LAI**
- *Lý do:* Tính năng này rất "xịn", nhưng tốn nhiều effort. Hiện tại Admin vẫn có thể tạo được đề thi thông qua các form nhập liệu cơ bản (dù hơi rườm rà).
- *Hành động:* Tạm gác lại. Coi đây là một Feature Request nâng cao (Phase 2 hoặc Phase 3) sau khi nền tảng đã ổn định và có lượng người dùng nhất định. Cứ dùng các form truyền thống hiện tại để tạo dữ liệu.
