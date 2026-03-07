# Placement Assessment – Specification (Final)

> Tài liệu này là **đặc tả nghiệp vụ và kỹ thuật** cho tính năng Kiểm tra đầu vào (Placement Assessment) trong hệ thống LMS. Mọi giá trị số học, ngưỡng điểm, thời gian, và cấu trúc đề thi **phải được cấu hình** (qua `Exam.settings`, metadata, hoặc config), **không hardcode** trong code. Đánh giá trình độ phải **dựa trên quy tắc chấm điểm rõ ràng và có thể kiểm chứng**, đảm bảo kết quả phản ánh tương đối chính xác năng lực người học.

---

## 1. Mục đích và phạm vi

### 1.1. Mục đích
- Xác định **trình độ tiếng Nhật hiện tại** của người dùng theo thang JLPT (N5 → N1) dựa trên kỹ năng: **Từ vựng (Moji/Goi)**, **Ngữ pháp (Bunpou)**, **Đọc hiểu (Dokkai)**.
- **Không** đánh giá kỹ năng Nghe (Choukai) và Nói do giới hạn dữ liệu và môi trường; spec giả định chỉ đánh giá qua câu hỏi trắc nghiệm đọc/viết.
- Kết quả dùng để:
  - Gợi ý **lộ trình học** và **khóa học** phù hợp (CourseProfile / Class).
  - Lưu trữ **trạng thái trình độ** của user (lưu trong bản ghi attempt và có thể sync sang profile nếu có thiết kế).

### 1.2. Nguyên tắc thiết kế
- **Cấu hình hóa**: Số câu, số section, thời gian, ngưỡng điểm, tỷ trọng từng level/category đều lấy từ cấu hình (Exam, ExamSection, Question metadata, hoặc config riêng).
- **Chấm trình độ khách quan**: Cấp độ đánh giá (assessed level) **bắt buộc** được tính bằng logic xác định từ dữ liệu câu hỏi và đáp án (metadata level/category, điểm từng câu, ngưỡng cấu hình). AI **chỉ** dùng để bổ sung nhận xét định tính và gợi ý khóa học, không dùng để quyết định level.
- **Đơn giản hóa luồng**: Không hỗ trợ resume sau khi đóng tab — tắt tab coi như mất tiến độ, user làm lại từ đầu. Đáp án chỉ gửi lên server một lần khi user bấm "Nộp bài". (Tùy cấu hình) giới hạn thời gian hoặc auto-submit vẫn có thể áp dụng.

---

## 2. Tham chiếu schema và luồng Core LMS

- Sử dụng **Academy Core** theo `core-lms.md`: `Exam`, `ExamSection`, `ExamQuestion`, `Question`, `ExamAttempt`, `ExamAttemptDetail`, `ExamAttemptSectionState`.
- Placement là một **Exam** với `examType = PLACEMENT`; không gắn với `Class` (classId nullable).
- Luồng attempt: Start (tạo attempt, trả đề) → User làm bài trên client (đáp án giữ trong bộ nhớ) → Submit (client gửi toàn bộ đáp án trong body) → Server chấm điểm → Lưu `ExamAttemptDetail` và cập nhật `ExamAttempt` (rawScore, percentage, metadata chứa kết quả placement). Không lưu trữ trung gian (autosave/resume); đóng tab = mất tiến độ.

---

## 3. Cấu hình (không hardcode)

### 3.1. Cấu hình bài thi Placement (Exam + Sections)
- Mọi tham số sau **phải** lấy từ dữ liệu (DB hoặc config), không cố định trong code.

| Tham số | Nguồn | Mô tả |
|--------|--------|--------|
| Thời gian làm bài (phút) | `Exam.totalTimeLimitMinutes` | Tổng thời gian cho toàn bài. Null = không giới hạn. |
| Số lần làm tối đa / user | `Exam.settings.maxAttemptsPerUser` (number, optional) | Null = không giới hạn. Dùng để chặn spam hoặc chính sách "chỉ làm 1 lần". |
| Chính sách làm lại sau khi đã hoàn thành | `Exam.settings.retakePolicy`: `"never"` \| `"always"` \| `"after_days"` | "after_days" kèm `retakeAfterDays` (number). |
| Id bài Placement (nếu chỉ có 1 bài chuẩn) | Query Exam với `examType = PLACEMENT`, `status = PUBLISHED`; có thể dùng `Exam.settings.placementRole = "default"` để chọn bài mặc định. | Client/backend không hardcode examId. |

### 3.2. Cấu trúc đề theo Section
- Mỗi **ExamSection** tương ứng một nhóm kỹ năng/độ khó (ví dụ: Vocab N5–N4, Grammar N5–N4, Reading N3, …).
- Số section, tên section, thứ tự, và **số câu mỗi section** được quyết định bởi dữ liệu `ExamSection` + `ExamQuestion` (số câu = số record ExamQuestion thuộc section đó).
- Mỗi **Question** (và `ExamQuestion`) có:
  - `Question.metadata` chứa ít nhất: `jlptLevel` (N5|N4|N3|N2|N1), `category` (vocabulary|grammar|reading) để phục vụ chấm theo level và kỹ năng.
  - `ExamQuestion.points`: trọng số điểm cho câu đó (mặc định 1.0); có thể dùng để làm Reading nặng hơn Vocab nếu cấu hình.

### 3.3. Cấu hình chấm điểm và xác định trình độ
- Lưu trong `Exam.settings.placementScoring` (hoặc bảng/config riêng) với cấu trúc có thể mở rộng, ví dụ:

```json
{
  "levelThresholds": [
    { "level": "N5", "minPercentage": 0 },
    { "level": "N4", "minPercentage": 55 },
    { "level": "N3", "minPercentage": 60 },
    { "level": "N2", "minPercentage": 58 },
    { "level": "N1", "minPercentage": 55 }
  ],
  "assessedLevelRule": "highest_passed",
  "categoryWeights": { "vocabulary": 1, "grammar": 1, "reading": 1.2 }
}
```

- **levelThresholds**: Ngưỡng % điểm (theo level, hoặc theo toàn bài) để coi là "đạt" level đó. Quy tắc **assessedLevelRule**:
  - `highest_passed`: Assessed level = level cao nhất mà điểm phần (hoặc điểm toàn bài theo level) ≥ minPercentage tương ứng.
  - Hoặc quy tắc khác (ví dụ: weighted average rồi map sang level) — đều phải mô tả rõ và cấu hình được.
- **categoryWeights**: Dùng khi tính điểm từng kỹ năng (radar chart) và có thể dùng trong công thức level nếu cấu hình hỗ trợ.

Tất cả giá trị cụ thể (55, 60, 1.2, …) trong ví dụ trên **là ví dụ minh họa**; giá trị thật do triển khai/admin cấu hình, không cố định trong spec.

---

## 4. Luồng nghiệp vụ (end-to-end)

### 4.1. Đối tượng sử dụng
- **User đã đăng nhập**: `userId` xác định; attempt gắn với `userId`.
- **User chưa đăng nhập (anonymous)**: Tùy chính sách sản phẩm:
  - Option A: Chỉ cho làm placement khi đã đăng nhập (redirect về login trước khi start).
  - Option B: Cho làm với session/device; khi submit hoặc khi đăng nhập sau đó, gắn attempt với `userId` (cần định nghĩa rõ: tạo attempt với userId null hay sessionId, và cơ chế merge sau khi login).

Spec giả định **có userId** khi start (đã đăng nhập); nếu hỗ trợ anonymous thì cần bổ sung rule gắn attempt với user sau khi login.

### 4.2. Bước 1: Vào trang Placement
- User truy cập route placement (ví dụ `/assessment/placement` hoặc `/placement-test`).
- Hiển thị màn giới thiệu: mục đích bài test, ước lượng thời gian (lấy từ `Exam.totalTimeLimitMinutes`), số câu (tổng từ ExamQuestion của exam đó). Có CTA "Bắt đầu".
- **Kiểm tra trước khi Start**:
  - Nếu đã có attempt `COMPLETED` và `retakePolicy === "never"`: Chỉ hiển thị kết quả lần trước (và link xem chi tiết), không cho làm lại.
  - Nếu `retakePolicy === "after_days"` và lần hoàn thành gần nhất chưa đủ `retakeAfterDays` ngày: Thông báo "Bạn có thể làm lại sau ngày X", không tạo attempt mới.
  - Nếu `maxAttemptsPerUser` đã đạt: Thông báo đã hết số lần làm, không tạo attempt mới.
  - (Tùy triển khai) Nếu còn attempt `IN_PROGRESS` từ lần trước (user đã đóng tab): có thể coi là bỏ dở và khi Start tạo attempt mới, đánh dấu attempt cũ là ABANDONED; không load lại attempt cũ.

### 4.3. Bước 2: Làm bài
- **Start attempt**:
  - Tạo `ExamAttempt` mới: `examId`, `userId`, `status = IN_PROGRESS`, `startedAt = now`, `deadlineAt = now + totalTimeLimitMinutes` (nếu có). Không lưu đáp án trung gian.
  - Lấy danh sách câu hỏi từ Exam → ExamSection (theo orderIndex) → ExamQuestion (theo orderIndex). Trả về cho client: `attemptId`, danh sách câu (id, content, options, metadata level/category **không gửi correctAnswer**), `timeLimitSeconds` (suy ra từ exam).
- **Trong lúc làm**:
  - User chọn đáp án từng câu; **client giữ toàn bộ đáp án trong bộ nhớ**, không gửi lên server cho đến khi nộp bài. Nếu user đóng tab hoặc thoát, tiến độ mất — lần sau vào lại phải bắt đầu từ đầu.
  - Nếu exam có `totalTimeLimitMinutes`: hiển thị đồng hồ đếm ngược. Khi hết giờ (client gửi submit với đáp án hiện có): coi như nộp bài (auto-submit). Server khi nhận submit kiểm tra `deadlineAt`; nếu đã quá hạn vẫn chấp nhận submit với payload gửi lên và đánh dấu (ví dụ metadata.overTime = true) nếu cần.
- **Nộp bài** (user bấm "Nộp bài" hoặc auto-submit khi hết giờ):
  - Client gửi request submit với `attemptId` và **toàn bộ đáp án** trong body: `answers: { questionId: optionId_or_index }`. Server chỉ chấp nhận khi `ExamAttempt.status === IN_PROGRESS` và attempt thuộc user hiện tại; ghi nhận đáp án từ payload để chấm (không dùng bảng/column lưu trạng thái trung gian cho resume).

### 4.4. Bước 3: Chấm điểm và xác định trình độ (server)
- **Validation**: Số câu đã trả lời (có trong payload `answers` gửi lên) ≥ giá trị tối thiểu (nếu cấu hình `Exam.settings.minAnsweredToSubmit`). Nếu không đủ → trả lỗi, không chấm.
- **Chấm từng câu**:
  - So sánh đáp án user (từ payload submit) với `Question.correctAnswer` (chỉ trên server). Ghi từng dòng `ExamAttemptDetail`: questionId, userAnswer, isCorrect, pointsEarned (theo ExamQuestion.points nếu đúng). (Tùy triển khai: có thể ghi payload vào `ExamAttempt.draftAnswers` một lần tại thời điểm submit chỉ để lưu vết, không dùng cho resume.)
  - Tính `rawScore`, `maxScore`, `percentage` cho attempt.
- **Tính Assessed Level** (bắt buộc theo cấu hình, không dùng AI):
  - Dựa trên `Exam.settings.placementScoring` (hoặc config tương đương):
    - Tính điểm theo từng `jlptLevel` (và/hoặc theo `category`) từ các ExamAttemptDetail + Question.metadata.
    - Áp dụng `levelThresholds` và `assessedLevelRule` để ra một level duy nhất (ví dụ N4). Lưu vào `ExamAttempt.metadata.placementResult.assessedLevel`.
  - Nếu thiếu cấu hình thì dùng fallback rõ ràng (ví dụ: level = N5) và log cảnh báo.
- **Gọi AI (tùy chọn)**:
  - Input: assessed level đã tính, breakdown điểm theo category/level, danh sách CourseProfile/Class đang mở đăng ký (ENROLLING/IN_PROGRESS).
  - Output: văn bản nhận xét (strengths/weaknesses), tóm tắt, và danh sách gợi ý khóa học (id + lý do). Lưu vào `ExamAttempt.metadata.placementResult` (analysis, recommendedCourseIds, …).
- **Cập nhật attempt**: `status = COMPLETED`, `submittedAt`/`completedAt`, `rawScore`, `maxScore`, `percentage`, `metadata.placementResult`.

### 4.5. Bước 4: Hiển thị kết quả
- Trả về cho client: assessed level, score (raw/max, percentage), breakdown theo category (để vẽ radar/biểu đồ), và danh sách khóa học gợi ý (từ metadata hoặc query lại theo recommendedCourseIds).
- UI: Hiển thị level, điểm, biểu đồ kỹ năng, đoạn nhận xét (nếu có), và các card khóa học với link đến trang đăng ký/thanh toán. Không hardcode text; có thể dùng i18n key hoặc nội dung từ AI.

### 4.6. Các trường hợp biên
- **Đóng tab / thoát giữa chừng**: Không lưu tiến độ. Lần sau vào lại user bấm "Bắt đầu" → tạo attempt mới; attempt IN_PROGRESS cũ (nếu có) có thể đánh dấu ABANDONED. Không có bảng hay cơ chế riêng để maintain resume.
- **Hết giờ**: Client gửi submit với đáp án hiện có khi đồng hồ hết; server chấm theo payload đó.
- **Đã hoàn thành, muốn làm lại**: Chỉ khi `retakePolicy` cho phép (always hoặc sau X ngày); khi đó tạo attempt mới, attempt cũ vẫn giữ để lịch sử.
- **Không có khóa học nào phù hợp**: Danh sách gợi ý có thể rỗng; UI hiển thị thông điệp tổng quát (ví dụ "Hiện chưa có khóa phù hợp với trình độ của bạn; vui lòng xem catalog hoặc liên hệ tư vấn.").

---

## 5. Đảm bảo đánh giá phản ánh trình độ (không "làm cho vui")

### 5.1. Chất lượng ngân hàng câu hỏi
- Mỗi câu **phải** có `metadata.jlptLevel` và `metadata.category` chính xác, được duyệt nội dung (content review) trước khi đưa vào placement exam.
- Khuyến nghị: Câu hỏi được lấy từ nguồn đã chuẩn hóa (đề thi thử JLPT, giáo trình chuẩn) hoặc được gắn nhãn bởi người có chuyên môn. Spec không quy định nguồn cụ thể nhưng yêu cầu **có quy trình gắn nhãn level/category** cho từng câu.

### 5.2. Quy tắc xác định level
- Assessed level **chỉ** phụ thuộc vào:
  - Dữ liệu đúng/sai từng câu (so với `Question.correctAnswer`),
  - Metadata level/category của từng câu,
  - Trọng số điểm (ExamQuestion.points, categoryWeights nếu có),
  - Bộ ngưỡng và quy tắc trong `placementScoring`.
- AI **không** được dùng để "đoán" level; AI chỉ dùng cho mô tả định tính và gợi ý khóa học. Như vậy kết quả có thể kiểm chứng và tái lập.

### 5.3. Hiệu lực và độ tin cậy (khuyến nghị vận hành)
- **Độ dài đề**: Cấu hình đủ số câu để mỗi level cần đánh giá có số câu tối thiểu (ví dụ ít nhất 3–5 câu per level) nhằm giảm sai số ngẫu nhiên.
- **Ngưỡng**: Nên được điều chỉnh sau khi có dữ liệu thí sinh (calibration): so sánh kết quả placement với kết quả thi thật hoặc đánh giá giáo viên để tinh chỉnh `levelThresholds`.
- **Làm lại**: Chính sách `retakePolicy` và `maxAttemptsPerUser` giúp tránh lạm dụng và giữ ý nghĩa "trình độ hiện tại".

---

## 6. API (contract)

### 6.1. Lấy thông tin bài Placement (optional)
- **GET** `/api/.../placement/info` hoặc tương đương.
- Response: `examId` (hoặc null nếu chưa có bài default), `title`, `description`, `totalQuestions`, `timeLimitMinutes`, `retakePolicy`, và trạng thái user (có attempt COMPLETED gần nhất không, có được làm lại không). Không trả về câu hỏi hay đáp án. Không có thông tin resume (không hỗ trợ resume).

### 6.2. Bắt đầu
- **POST** `/api/.../placement/start` (hoặc `placement/test`).
- Body: (optional) empty hoặc chỉ tham số cần thiết.
- Response:
  - `attemptId`, `status`, `startedAt`, `deadlineAt` (nếu có),
  - `questions`: array mỗi phần tử gồm `id` (questionId hoặc examQuestionId), `content`, `options` (mảng text), `metadata` (chỉ level, category; **không** gửi correctAnswer),
  - `timeLimitSeconds` (suy ra từ exam).
- Không trả về `draftAnswers`; không có API resume.

### 6.3. Nộp bài
- **POST** `/api/.../placement/submit` hoặc `attempts/:attemptId/submit`.
- Body: `{ "attemptId": "...", "answers": { "questionId": "optionId_or_index" } }` — toàn bộ đáp án gửi một lần trong `answers`. Server: validate → ghi đáp án (vào ExamAttemptDetail, và tùy chọn draftAnswers để lưu vết) → chấm → tính level → gọi AI (nếu bật) → lưu metadata → trả về kết quả.
- Response:
  - `assessedLevel`, `rawScore`, `maxScore`, `percentage`,
  - `breakdownByCategory` (ví dụ `{ "vocabulary": 0.8, "grammar": 0.6, "reading": 0.5 }`),
  - `analysis` (object hoặc string từ AI),
  - `recommendations`: array `{ "courseId" | "classId", "title", "reason" }` (id và title từ CourseProfile/Class, reason từ AI hoặc template).

---

## 7. Lưu trữ kết quả và đồng bộ

- **ExamAttempt**: Sau khi submit, `status = COMPLETED`; `metadata.placementResult` chứa `assessedLevel`, `analysis`, `recommendedCourseIds`, và có thể `breakdownByCategory`, `overTime`.
- **ExamAttemptDetail**: Mỗi câu một bản ghi: questionId, userAnswer, isCorrect, pointsEarned (và nếu có explanation chỉ hiển thị sau khi nộp, không gửi trước).
- **Đồng bộ sang profile user**: Nếu hệ thống có trường "current level" hoặc "placement level" trên User/Profile, spec khuyến nghị cập nhật sau khi placement COMPLETED (ghi đè hoặc chỉ cập nhật nếu mới hơn, tùy chính sách). Chi tiết field và điều kiện do triển khai quyết định, không hardcode tên field.

---

## 8. Bảo mật và toàn vẹn

- **Không gửi đáp án đúng** cho client khi giao đề; chỉ dùng server-side để chấm.
- Chỉ user sở hữu attempt (hoặc admin) mới được gọi save/submit cho attempt đó.
- Rate limit cho start/submit để tránh spam (chi tiết do triển khai).

---

## 9. Tóm tắt checklist triển khai

- [ ] Cấu hình placement (time limit, retake, max attempts) lấy từ Exam.settings / config, không hardcode. Không có cấu hình resume (không hỗ trợ resume).
- [ ] Cấu hình chấm (levelThresholds, rule, weights) lấy từ Exam.settings.placementScoring hoặc config tương đương.
- [ ] Câu hỏi có metadata jlptLevel và category; assessed level tính hoàn toàn từ dữ liệu + cấu hình.
- [ ] Luồng: Start (trả đề) → User làm trên client → Submit (body chứa full `answers`) → Chấm + tính level → AI (optional) → Lưu metadata + trả về. Không autosave, không resume; đóng tab = mất tiến độ.
- [ ] API không trả về correctAnswer khi giao đề; submit nhận full `answers` trong body; chỉ chấp nhận khi attempt IN_PROGRESS và thuộc user.
- [ ] Xử lý hết giờ (client gửi submit với đáp án hiện có), retake theo policy cấu hình.
- [ ] Gợi ý khóa học dựa trên assessed level + danh sách Class/CourseProfile thực tế (status phù hợp), không hardcode tên khóa.

Spec này đủ để triển khai placement assessment có thể cấu hình, kiểm chứng được, và phản ánh trình độ người dùng một cách có hệ thống.
