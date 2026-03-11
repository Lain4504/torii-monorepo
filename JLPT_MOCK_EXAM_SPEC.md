# Spec: Unified Exam & JLPT Module (N5–N1, Lesson Quiz, Format 2024)
Lưu ý: - Remove toàn bộ code legacy của luồng Exam cũ hiện tại trong dự án, thay thế hoàn toàn bằng code mới của spec này nhé 
## 1. Mục tiêu & Phạm vi

- **Mục đích**:
  - Xây một **module Exam/Quiz thống nhất**, với:
    - **Thi thử JLPT** (N5 → N1, format 2024).
    - **Quiz từ Lesson / Class content** (các bài kiểm tra nhỏ trong khóa học).
  - UI làm bài & trải nghiệm thi sẽ đi theo hướng trong `JLPT_EXAM_SPEC.md` từ mục **3.2** trở đi (multi-section, timer per section, break screen, cuộn dọc + lưới câu hỏi).  
    Phần WYSIWYG A4 Builder (mục 5 của `JLPT_EXAM_SPEC.md`) chỉ triển khai sau khi engine & flow đã ổn định.
- **Phạm vi**:
  - Thiết kế **schema mới, rõ ràng**, không tái sử dụng schema Exam cũ.
  - Schema đủ tổng quát để phục vụ:
    - JLPT mock (đa phần thi, Mondai, chấm 3 mảng).
    - Quiz/Exam trong lesson (thường 1 section, ít câu, chấm đơn giản).
- **Đối tượng dùng**:
  - Học viên: làm quiz lesson, thi thử JLPT, xem kết quả, review đáp án.
  - Giáo viên / Academic staff: tạo, chỉnh sửa, publish đề.
  - Admin: cấu hình loại exam, quyền truy cập, lịch mở/đóng, cách chấm điểm.

---

## 2. Mô hình khái niệm (Domain Model)

### 2.1. Thực thể chính

- `ExamTemplate`: Khung đề thi/quiz dùng để generate attempt.
- `ExamSection`: Phần thi con (section) trong một template.
- `ExamQuestionGroup`: Nhóm câu theo dạng bài (Mondai JLPT, hoặc group logic trong lesson quiz).
- `Question`: Câu hỏi đơn, có thể tái sử dụng.
- `QuestionOption`: Các phương án A/B/C/D.
- `ExamTemplateQuestion`: Liên kết giữa ExamTemplate và Question (gồm order, weight, group, section).
- `ExamAttempt`: Một lần làm bài cụ thể của học viên.
- `ExamAnswer`: Đáp án học viên chọn cho từng câu.
- `JlptLevel`: Cấu hình N5–N1 (thời lượng, mô tả).
- `ScoringProfile` + `ScoringMapping`: Quy tắc mapping raw → scaled từng mảng (dùng cho JLPT mock, optional cho loại khác).

### 2.2. Phân loại exam / quiz

- `ExamTemplate.exam_type` (enum):
  - `JLPT_MOCK`: Thi thử JLPT theo format 2024.
  - `LESSON_QUIZ`: Quiz gắn với Lesson / Class content.
  - `GENERIC_EXAM`: Kỳ thi khác (nếu muốn xài chung engine sau này).
- Các field chuyên biệt:
  - `ExamTemplate.jlpt_level_code` (nullable, chỉ dùng khi `exam_type = JLPT_MOCK`).
  - `ExamTemplate.scoring_profile_id` (nullable, bắt buộc cho JLPT_MOCK).

### 2.3. Liên kết với Lesson / Class

- Để support quiz từ lesson:
  - `ExamTemplate.context_type` (enum):
    - `NONE` – exam độc lập (JLPT mock, placement test…).
    - `LESSON` – gắn với 1 lesson trong course.
    - `CLASS_CONTENT_ITEM` – gắn với 1 item trong syllabus lớp (nếu cần).
  - `ExamTemplate.context_id` (UUID, nullable): ID thực thể tương ứng (`lesson_id`, `class_content_item_id`…).

> JLPT mock chỉ là một **loại ExamTemplate đặc biệt**, còn lesson quiz cũng dùng cùng schema, khác `exam_type` + `context_type`.

---

## 3. Cấp độ JLPT & Cấu trúc thời gian

### 3.1. Cấp độ hỗ trợ

- Các cấp độ: **N5, N4, N3, N2, N1**.
- Với mỗi cấp độ JLPT, hệ thống lưu cấu hình:
  - `total_duration_minutes`
  - Danh sách `sections[]`:
    - `code`: `LANGUAGE_VOCAB`, `GRAMMAR_READING`, `LANGUAGE_GRAMMAR_READING`, `LISTENING`...
    - `name_vi`, `name_ja`
    - `duration_minutes`
    - `order_index`
    - `is_listening_section` (bool) – để xử lý audio đặc biệt.

### 3.2. Thời lượng mô phỏng theo JLPT 2024

| Cấp độ | Section 1                                      | Section 2                                          | Section 3        | Tổng      |
|--------|-----------------------------------------------|----------------------------------------------------|-----------------|-----------|
| N5     | Kiến thức ngôn ngữ (Từ vựng) – 25’           | Kiến thức ngôn ngữ (Ngữ pháp) + Đọc hiểu – 50’    | Nghe hiểu – 30’ | 105 phút |
| N4     | Kiến thức ngôn ngữ (Từ vựng) – 30’           | Kiến thức ngôn ngữ (Ngữ pháp) + Đọc hiểu – 60’    | Nghe hiểu – 35’ | 125 phút |
| N3     | Kiến thức ngôn ngữ (Từ vựng) – 30’           | Kiến thức ngôn ngữ (Ngữ pháp) + Đọc hiểu – 70’    | Nghe hiểu – 40’ | 140 phút |
| N2     | Ngôn ngữ (Từ vựng, Ngữ pháp) + Đọc hiểu – 105’ | Nghe hiểu – 50’                                  | —               | 155 phút |
| N1     | Ngôn ngữ (Từ vựng, Ngữ pháp) + Đọc hiểu – 110’ | Nghe hiểu – 60’                                  | —               | 170 phút |

---

## 4. Cấu trúc phần thi & Mondai (áp dụng chung)

### 4.1. Khái niệm Mondai

- Nếu coi **Section** là “phần thi”, thì **Mondai** là “nhóm dạng bài” bên trong Section đó.
- Mỗi Mondai:
  - Có **mã code** ổn định (máy đọc): `KANJI_READING`, `ORTHOGRAPHY`, `BUNMYAKU_KITEI`, `IIKAE_RUIGI`, `YOUHOU`, `READING_SHORT`, `READING_MID`, `READING_LONG`, `INFO_SEARCH`, `LISTEN_TASK`, `LISTEN_POINT`, `LISTEN_SUMMARY`, `LISTEN_INSTANT`, `LISTEN_INTEGRATED`, v.v.
  - Có tên JP + VI, mô tả mục tiêu kỹ năng.
  - Có số lượng câu khuyến nghị (gần giống đề thật), dùng để validate khi soạn đề.

### 4.2. Ví dụ mapping theo cấp độ (rút gọn)

#### N5

- **Section 1 – 言語知識 (25’)**
  - `KANJI_READING` (漢字読み): đọc từ viết bằng Kanji.
  - `ORTHOGRAPHY` (表記): chuyển từ hiragana sang Kanji/Katakana.
  - `BUNMYAKU_KITEI` (文脈規定): chọn từ theo mạch văn.
  - `IIKAE_RUIGI` (言い換え類義): cách diễn đạt / từ gần nghĩa.

- **Section 2 – 文法 + 読解 (50’)**
  - `GRAMMAR_SENTENCE_1` (文の文法1): chọn mẫu ngữ pháp phù hợp câu.
  - `GRAMMAR_SENTENCE_2` (文の文法2): tạo câu mạch lạc đúng cú pháp.
  - `GRAMMAR_PARAGRAPH` (文章の文法): chọn câu phù hợp dòng chảy đoạn văn.
  - `READING_SHORT`, `READING_MID`, `INFO_SEARCH`: đọc hiểu văn bản ngắn, trung bình, và tìm thông tin.

- **Section 3 – 聴解 (30’)**
  - `LISTEN_TASK` (課題理解)
  - `LISTEN_POINT` (ポイント理解)
  - `LISTEN_PICTURE_DIALOG` (発表現話)
  - `LISTEN_INSTANT_REPLY` (即時応答)

#### N4, N3, N2, N1

- Giữ pattern tương tự N5, nhưng:
  - Tăng thêm Mondai về **từ ghép, từ phát sinh**, **đọc hiểu dài**, **chủ trương tác giả**, **tổng hợp nhiều văn bản**, **nghe hội thoại dài**.
  - Mỗi cấp độ có bảng config Mondai riêng (không hard-code trong code, mà là data cấu hình).

> Đối với **Lesson Quiz**, có thể vẫn sử dụng `ExamQuestionGroup` để gom nhóm (vd: “Check từ vựng bài 1”, “Ngữ pháp bài 1”) nhưng không bắt buộc phải bám theo cấu trúc JLPT.

---

## 5. Luồng người dùng – Học viên

### 5.1. Thi thử JLPT mock

1. Học viên vào mục **“Thi thử JLPT”**.
2. Chọn:
   - Cấp độ: N5–N1.
   - Đề: `JLPT N3 Mock 01`, `JLPT N3 Mock 02`, …
3. Hệ thống kiểm tra:
   - Điều kiện quyền truy cập (enrollment/gói học JLPT).
   - Giới hạn số lượt làm / đề (`max_attempts_per_user`).
4. Hiển thị màn hình **hướng dẫn trước khi thi**:
   - Giải thích cấu trúc đề, số phần, tổng thời gian.
   - Quy tắc: không pause, không quay lại section trước, cách chấm điểm là mock.

### 5.2. Quiz từ Lesson

1. Học viên mở một Lesson / Class content.
2. Trong lesson có các quiz:
   - Ví dụ: `Lesson 1 – Vocab Quiz`, `Lesson 1 – Grammar Quiz`.
3. Khi bấm vào quiz:
   - Hệ thống tìm `ExamTemplate` với `exam_type = 'LESSON_QUIZ'`, `context_type = 'LESSON'`, `context_id = lesson_id`.
   - Khởi tạo `ExamAttempt` nếu chưa có, hoặc tiếp tục attempt `IN_PROGRESS`.
4. Flow làm bài có thể đơn giản hơn (1 section, ít câu), nhưng vẫn reuse UI:
   - Timer 1 section (hoặc không có timer).
   - Cuộn dọc, lưới câu hỏi.

### 5.3. Bắt đầu thi / quiz

- Khi bấm “Bắt đầu”:
  - Tạo `ExamAttempt` với trạng thái `IN_PROGRESS`.
  - Lưu: `user_id`, `exam_template_id`, `exam_type`, `jlpt_level_code` (nếu có), `started_at`, `current_section_index = 0`.
  - Khởi động timer Section 1 (nếu có cấu hình).

- UI khi thi (theo hướng `JLPT_EXAM_SPEC.md`):
  - Header: tên đề, type (JLPT / Quiz), section hiện tại, đồng hồ đếm ngược.
  - Body: danh sách câu, cuộn dọc.
  - Sidebar: lưới câu hỏi (bubble), trạng thái từng câu, nút nộp section / nộp bài.

### 5.4. Chuyển Section & Timer

- **Timer Section**:
  - Hết thời gian -> auto-save, khóa section hiện tại, chuyển sang màn hình chuẩn bị Section tiếp theo (break screen).
  - Không cho quay lại section trước (đặc biệt với JLPT mock).
- Có thể cho phép “Kết thúc Section” sớm (config per exam), nhưng **không được quay lại** nếu muốn sát JLPT.
- Khi hết tất cả Section:
  - Đánh dấu `submitted_at`, chuyển trạng thái `SUBMITTED`, thực hiện chấm điểm.

### 5.5. Nghe hiểu (Listening)

- Câu thuộc Section Listening gắn:
  - `audio_id` (tham chiếu kho media), optional `image_assets` (cho 発表現話).
  - Quy tắc phát:
    - Tối thiểu config cho mỗi đề: `play_limit_per_audio` (1/2/unlimited).
    - Không cho tua/rê tiến độ nếu có thể.
  - Học viên chỉ có thể chọn đáp án sau khi audio đã (bắt đầu) phát.

---

## 6. Luồng soạn đề – Giáo viên / Admin

### 6.1. Tạo ExamTemplate

- Với JLPT mock:
  - Chọn cấp độ JLPT (N5–N1).
  - Nhập:
    - Tên đề: `JLPT N2 Mock Test 01`.
    - `exam_type = 'JLPT_MOCK'`, `jlpt_level_code = 'N2'`.
  - Hệ thống tự sinh:
    - Danh sách `ExamSection` theo cấu hình `jlpt_sections`.
    - Danh sách Mondai (`ExamQuestionGroup`) theo `jlpt_question_groups`, kèm số câu khuyến nghị.

- Với Lesson Quiz:
  - Chọn lesson / class content làm context.
  - Nhập:
    - Tên quiz, `exam_type = 'LESSON_QUIZ'`, `context_type = 'LESSON'`, `context_id = lesson_id`.
  - Tạo 1 hoặc vài `ExamSection` đơn giản (vd: chỉ 1 section).

### 6.2. Nhập câu hỏi

- `Question`:
  - Có thể:
    - Tạo câu hỏi **chỉ dùng trong 1 template** (`is_bank_question = false`).
    - Hoặc đưa vào **question bank** (`is_bank_question = true`) để reuse.
  - Trường chính:
    - `stem_text`, `context_text`, `difficulty`, `default_weight`.

- `ExamTemplateQuestion`:
  - Map câu hỏi vào:
    - `exam_template`, `exam_section`, `exam_question_group`.
  - Cấu hình:
    - `weight` (nếu muốn override `default_weight`).
    - `order_index` (thứ tự trong section).

### 6.3. Publish đề

- Trạng thái `ExamTemplate`:
  - `DRAFT` → đang soạn.
  - `READY` → hoàn tất, chờ cấu hình lịch mở.
  - `PUBLISHED` → hiển thị cho học viên (thoả điều kiện quyền).
- Cấu hình bổ sung:
  - `available_from`, `available_to`.
  - `max_attempts_per_user`.
  - `show_detailed_review` (true/false).
  - `show_correct_answer_immediately` (true/false).

---

## 7. Chấm điểm & Kết quả

### 7.1. Nguyên tắc chấm điểm

- Do công thức JLPT chính thức không public, hệ thống dùng **mô hình mô phỏng**:
  - Mỗi câu có **trọng số** (thường 1 điểm thô), có thể tinh chỉnh theo Mondai.
  - Với `exam_type = JLPT_MOCK`:
    - Tính **raw score** cho từng mảng:
      - `language_score_raw` (từ vựng + ngữ pháp).
      - `reading_score_raw`.
      - `listening_score_raw`.
    - Mapping raw → scaled (0–60 mỗi mảng, tổng 0–180) qua bảng `scoring_mappings` theo cấp độ.
    - Áp dụng **điểm sàn** từng mảng + điểm tổng để quyết định Pass/Fail mock.
  - Với `exam_type = LESSON_QUIZ`:
    - Có thể:
      - Chỉ dùng **raw score** + phần trăm đúng.
      - Hoặc tham chiếu `scoring_profile` đơn giản (optional).

### 7.2. Màn hình kết quả học viên

- Thông tin hiển thị:
  - JLPT mock:
    - Điểm scaled từng mảng (Ngôn ngữ / Đọc / Nghe).
    - Điểm tổng scaled (0–180).
    - Trạng thái: Đạt / Không đạt (mang tính tham khảo).
    - Thông điệp: “Đây là kỳ thi thử mô phỏng, không phải kỳ thi JLPT chính thức”.
  - Lesson quiz:
    - Điểm số, % đúng, trạng thái pass/fail (nếu có ngưỡng).
- Nếu `show_detailed_review = true`:
  - Cho xem:
    - Danh sách câu, phân nhóm theo Section / Mondai.
    - Mỗi câu: câu hỏi, đáp án chọn, đáp án đúng, giải thích.
    - Với đọc hiểu: hiển thị đoạn văn + highlight phần liên quan.
    - Với nghe: tùy config cho phép/ngăn replay audio.

### 7.3. Báo cáo cho giáo viên / admin

- Theo đề:
  - Số lượt thi, tỉ lệ pass mock / pass quiz.
  - Phân bố điểm.
- Theo Mondai:
  - % đúng theo từng Mondai để biết kỹ năng nào yếu (Kanji, Listening 即時応答, v.v.).
- Theo học viên:
  - Lịch sử các lần thi JLPT mock và quiz, biểu đồ tiến bộ theo thời gian.

---

## 8. Trải nghiệm người dùng & Quy tắc hành vi

### 8.1. Timer & xử lý mất kết nối

- Timer dựa trên **server time** (để tránh gian lận bằng đổi giờ client).
- Khi reload / thoát trình duyệt:
  - `ExamAttempt` vẫn giữ trạng thái `IN_PROGRESS` kèm thông tin section hiện tại.
  - Khi vào lại, hệ thống tính **thời gian còn lại theo server**, nếu hết → auto close section.
- Frontend có thể lưu local draft, backend lưu answer incremental (auto-save định kỳ).

### 8.2. Chống gian lận cơ bản

- Có thể log:
  - Thời điểm focus/blur tab (ở mức tham khảo).
  - Số lần reload.
- Không dừng timer nếu học viên chuyển tab hoặc rời khỏi trình duyệt.

---

## 9. Thiết kế Schema (Khái niệm + DDL gợi ý)

> Đây là thiết kế schema **ở mức spec** cho module Exam/Quiz thống nhất, trong đó JLPT mock chỉ là một cấu hình chuyên biệt.

### 9.1. Bảng cấp độ JLPT & cấu hình chung

```sql
CREATE TABLE jlpt_levels (
    id UUID PRIMARY KEY,
    code VARCHAR(4) UNIQUE NOT NULL,   -- 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
    name_vi VARCHAR(50),
    description_vi TEXT,
    total_duration_minutes INT NOT NULL
);

CREATE TABLE jlpt_sections (
    id UUID PRIMARY KEY,
    level_id UUID REFERENCES jlpt_levels(id) ON DELETE CASCADE,
    code VARCHAR(64) NOT NULL,         -- 'LANGUAGE_VOCAB', 'GRAMMAR_READING', 'LISTENING', ...
    name_vi VARCHAR(255),
    name_ja VARCHAR(255),
    duration_minutes INT NOT NULL,
    order_index INT NOT NULL,
    is_listening_section BOOLEAN DEFAULT FALSE
);
```

### 9.2. Mondai (QuestionGroup) theo cấp độ & section (khung JLPT)

```sql
CREATE TABLE jlpt_question_groups (
    id UUID PRIMARY KEY,
    section_id UUID REFERENCES jlpt_sections(id) ON DELETE CASCADE,
    code VARCHAR(64) NOT NULL,       -- 'KANJI_READING', 'ORTHOGRAPHY', ...
    title_vi VARCHAR(255),
    title_ja VARCHAR(255),
    description_vi TEXT,
    order_index INT NOT NULL,
    recommended_question_count INT,  -- để validate khi soạn đề
    UNIQUE (section_id, code)
);
```

> Các bảng trên mang tính “khung cấu trúc JLPT theo cấp độ”. Hệ thống có thể seed dữ liệu ban đầu cho N5–N1. Exam/quiz thường không bắt buộc phải tham chiếu các bảng này.

### 9.3. Exam Template (dùng chung cho JLPT + Lesson Quiz)

```sql
CREATE TABLE exam_templates (
    id UUID PRIMARY KEY,
    code VARCHAR(64),                     -- 'N3_MOCK_01', 'LESSON_123_QUIZ'
    title VARCHAR(255) NOT NULL,
    description TEXT,

    exam_type VARCHAR(32) NOT NULL,      -- 'JLPT_MOCK', 'LESSON_QUIZ', 'GENERIC_EXAM'
    jlpt_level_code VARCHAR(4),          -- nullable, chỉ dùng cho JLPT_MOCK

    context_type VARCHAR(32) NOT NULL DEFAULT 'NONE', -- 'NONE', 'LESSON', 'CLASS_CONTENT_ITEM'
    context_id UUID,                     -- id lesson hoặc class_content_item

    status VARCHAR(20) NOT NULL,         -- 'DRAFT', 'READY', 'PUBLISHED', 'ARCHIVED'
    available_from TIMESTAMP,
    available_to TIMESTAMP,
    max_attempts_per_user INT,
    show_detailed_review BOOLEAN DEFAULT TRUE,
    show_correct_answer_immediately BOOLEAN DEFAULT TRUE,

    scoring_profile_id UUID,             -- bắt buộc cho JLPT_MOCK

    created_by UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE exam_sections (
    id UUID PRIMARY KEY,
    exam_template_id UUID REFERENCES exam_templates(id) ON DELETE CASCADE,

    jlpt_section_id UUID REFERENCES jlpt_sections(id), -- nếu là JLPT_MOCK có thể map sang jlpt_sections

    code VARCHAR(64),                    -- 'LANGUAGE_VOCAB', 'LISTENING', ... (optional)
    title VARCHAR(255),
    description TEXT,

    duration_minutes INT NOT NULL,
    order_index INT NOT NULL,
    is_listening_section BOOLEAN DEFAULT FALSE
);

CREATE TABLE exam_question_groups (
    id UUID PRIMARY KEY,
    exam_section_id UUID REFERENCES exam_sections(id) ON DELETE CASCADE,

    jlpt_question_group_id UUID REFERENCES jlpt_question_groups(id), -- optional cho JLPT_MOCK

    code VARCHAR(64),                    -- 'KANJI_READING', 'READING_SHORT', hoặc code tuỳ biến
    title_vi VARCHAR(255),
    title_ja VARCHAR(255),
    description_vi TEXT,

    recommended_question_count INT,
    order_index INT NOT NULL
);
```

### 9.4. Câu hỏi & phương án

```sql
CREATE TABLE questions (
    id UUID PRIMARY KEY,
    is_bank_question BOOLEAN DEFAULT FALSE,  -- true nếu là câu trong bank dùng chung

    stem_text TEXT NOT NULL,                 -- nội dung câu hỏi
    context_text TEXT,                       -- context thêm (nếu có)
    difficulty VARCHAR(16),                  -- 'EASY', 'MEDIUM', 'HARD'
    default_weight DECIMAL(5,2) DEFAULT 1.0, -- trọng số mặc định

    created_by UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE question_options (
    id UUID PRIMARY KEY,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    option_key VARCHAR(4) NOT NULL,          -- 'A', 'B', 'C', 'D'
    content_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    order_index INT NOT NULL
);

-- Gắn câu hỏi vào exam template + group + section

CREATE TABLE exam_template_questions (
    id UUID PRIMARY KEY,
    exam_template_id UUID REFERENCES exam_templates(id) ON DELETE CASCADE,
    exam_section_id UUID REFERENCES exam_sections(id) ON DELETE CASCADE,
    exam_question_group_id UUID REFERENCES exam_question_groups(id),

    question_id UUID REFERENCES questions(id),

    weight DECIMAL(5,2),                     -- override default_weight nếu cần
    order_index INT NOT NULL
);
```

> Nếu cần tối ưu storage cho đọc hiểu dài, có thể thêm bảng riêng:

```sql
CREATE TABLE jlpt_reading_passages (
    id UUID PRIMARY KEY,
    level_id UUID REFERENCES jlpt_levels(id),
    title TEXT,
    content TEXT NOT NULL,
    source_info TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 9.5. Attempt (Lần thi) & Answer

```sql
CREATE TABLE exam_attempts (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    exam_template_id UUID REFERENCES exam_templates(id),

    exam_type VARCHAR(32) NOT NULL,      -- copy từ template để dễ query
    jlpt_level_code VARCHAR(4),

    status VARCHAR(20) NOT NULL,         -- 'IN_PROGRESS', 'SUBMITTED', 'CANCELLED'

    started_at TIMESTAMP NOT NULL,
    submitted_at TIMESTAMP,

    current_section_index INT DEFAULT 0,

    -- điểm raw tổng (cho loại quiz đơn giản)
    total_score_raw DECIMAL(6,2),

    -- điểm raw theo mảng (dùng cho JLPT)
    language_score_raw DECIMAL(6,2),
    reading_score_raw DECIMAL(6,2),
    listening_score_raw DECIMAL(6,2),

    -- điểm scaled (dùng cho JLPT)
    language_score_scaled INT,
    reading_score_scaled INT,
    listening_score_scaled INT,
    total_score_scaled INT,

    pass_mock BOOLEAN,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE exam_answers (
    id UUID PRIMARY KEY,
    exam_attempt_id UUID REFERENCES exam_attempts(id) ON DELETE CASCADE,
    exam_template_question_id UUID REFERENCES exam_template_questions(id),
    question_option_id UUID REFERENCES question_options(id),

    answered_at TIMESTAMP DEFAULT NOW(),

    is_correct BOOLEAN,
    score_awarded DECIMAL(5,2),

    UNIQUE (exam_attempt_id, exam_template_question_id)
);
```

### 9.6. Mapping raw → scaled (Scoring Profile)

```sql
CREATE TABLE scoring_profiles (
    id UUID PRIMARY KEY,
    name VARCHAR(100),
    description TEXT,
    exam_type VARCHAR(32) NOT NULL,       -- 'JLPT_MOCK', 'LESSON_QUIZ', ...
    jlpt_level_code VARCHAR(4),           -- nếu là profile JLPT
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE scoring_mappings (
    id UUID PRIMARY KEY,
    scoring_profile_id UUID REFERENCES scoring_profiles(id) ON DELETE CASCADE,

    domain VARCHAR(20) NOT NULL,          -- 'LANGUAGE', 'READING', 'LISTENING', hoặc 'TOTAL'
    raw_score INT NOT NULL,
    scaled_score INT NOT NULL,

    UNIQUE (scoring_profile_id, domain, raw_score)
);
```

---

## 10. Gợi ý triển khai (Implementation Notes – không bắt buộc)

- JLPT mock:
  - `exam_type = 'JLPT_MOCK'`, `jlpt_level_code` bắt buộc.
  - Sections + groups map sang `jlpt_sections` và `jlpt_question_groups` để đảm bảo đúng format.
  - Bắt buộc có `scoring_profile` để convert raw → scaled 0–180.
- Lesson quiz:
  - `exam_type = 'LESSON_QUIZ'`, `context_type = 'LESSON'`, `context_id = lesson_id`.
  - Có thể chỉ dùng 1 section, không cần map JLPT, scoring dùng raw hoặc profile đơn giản.
- UI làm bài:
  - Theo hướng trong `JLPT_EXAM_SPEC.md` từ mục **3.2** trở đi: multi-section, timer per section, break screen, cuộn dọc + lưới câu hỏi.
- UI A4 Builder cho admin (mục 5 trong `JLPT_EXAM_SPEC.md`):
  - Chỉ triển khai **sau khi** engine & flow đã chạy ổn định.

Spec này tập trung vào **schema rõ ràng** và **phân loại logic theo `exam_type`**, để dễ maintain và tái sử dụng cho cả JLPT mock và quiz từ lesson.

# Spec: JLPT Mock Exam Module (N5–N1, Format 2024)

## 1. Mục tiêu & Phạm vi

- **Mục đích**: Xây một **luồng thi thử JLPT mô phỏng sát kỳ thi thật** (N5 → N1) cho học viên trung tâm Nhật ngữ.
- **Phạm vi**:
  - Module **tách biệt** với các module Exam hiện có (schema riêng, API riêng).
  - Bám theo **format JLPT mới 2024**: cấu trúc phần thi, nhóm Mondai, thời lượng, cách chấm điểm theo 3 mảng (Ngôn ngữ, Đọc, Nghe).
  - Không can thiệp vào logic chấm điểm / flow hiện tại của Exam thường.
- **Đối tượng dùng**:
  - Học viên: làm đề JLPT mock, xem kết quả, review đáp án, theo dõi tiến bộ.
  - Giáo viên / Academic staff: tạo, chỉnh sửa, publish/ẩn đề JLPT mock.
  - Admin: cấu hình quyền truy cập, giới hạn số lần thi, lịch mở/đóng, cách scaling điểm.

---

## 2. Phân biệt JLPT Mock với Exam thường

### 2.1. Mô hình khái niệm

- `JlptMockExamTemplate`: Khung đề JLPT cho một cấp độ (N5–N1), có thể có nhiều đề mock / cấp độ.
- `JlptMockSection`: Phần thi con theo cấu trúc đề (Ngôn ngữ/Từ vựng, Ngữ pháp+Đọc hiểu, Nghe).
- `JlptMockQuestionGroup` (Mondai): Nhóm câu theo dạng bài (漢字読み, 文脈規定, 内容理解…).
- `JlptMockQuestion`: Câu hỏi đơn lẻ.
- `JlptMockQuestionOption`: Các phương án lựa chọn A/B/C/D.
- `JlptMockExamInstance`: Một lần thi cụ thể của học viên (attempt).
- `JlptMockAnswer`: Câu trả lời của học viên cho từng câu hỏi.

> Lưu ý: JLPT Mock **không phụ thuộc** vào `Exam` / `Assignment` hiện có. Nếu sau này cần reuse question bank, sẽ thiết kế cơ chế mapping riêng (không nằm trong phạm vi spec này).

### 2.2. Đặc trưng khác biệt

- Flow thi: chia theo **Section** (giống JLPT), có timer riêng từng phần, **không được quay lại Section trước**.
- Kết quả: chia 3 mảng điểm (Ngôn ngữ, Đọc, Nghe), có **điểm sàn từng mảng + điểm tổng** để quyết định Pass/Fail (mock).
- Đề thi: cấu hình theo **Mondai** giống JLPT (ví dụ N5: 漢字読み, 表記, 文脈規定, 言い換え類義…).

---

## 3. Cấp độ & Cấu trúc thời gian

### 3.1. Cấp độ hỗ trợ

- Các cấp độ: **N5, N4, N3, N2, N1**.
- Với mỗi cấp độ, hệ thống lưu cấu hình:
  - `total_duration_minutes`
  - Danh sách `sections[]`:
    - `code`: `LANGUAGE_VOCAB`, `GRAMMAR_READING`, `LANGUAGE_GRAMMAR_READING`, `LISTENING`...
    - `name_vi`, `name_ja`
    - `duration_minutes`
    - `order_index`
    - `is_listening_section` (bool) – để xử lý audio đặc biệt.

### 3.2. Thời lượng mô phỏng theo JLPT 2024

| Cấp độ | Section 1                                      | Section 2                                          | Section 3      | Tổng      |
|--------|-----------------------------------------------|----------------------------------------------------|---------------|-----------|
| N5     | Kiến thức ngôn ngữ (Từ vựng) – 25’           | Kiến thức ngôn ngữ (Ngữ pháp) + Đọc hiểu – 50’    | Nghe hiểu – 30’ | 105 phút |
| N4     | Kiến thức ngôn ngữ (Từ vựng) – 30’           | Kiến thức ngôn ngữ (Ngữ pháp) + Đọc hiểu – 60’    | Nghe hiểu – 35’ | 125 phút |
| N3     | Kiến thức ngôn ngữ (Từ vựng) – 30’           | Kiến thức ngôn ngữ (Ngữ pháp) + Đọc hiểu – 70’    | Nghe hiểu – 40’ | 140 phút |
| N2     | Ngôn ngữ (Từ vựng, Ngữ pháp) + Đọc hiểu – 105’ | Nghe hiểu – 50’                                  | —             | 155 phút |
| N1     | Ngôn ngữ (Từ vựng, Ngữ pháp) + Đọc hiểu – 110’ | Nghe hiểu – 60’                                  | —             | 170 phút |

---

## 4. Cấu trúc phần thi & Mondai

### 4.1. Khái niệm Mondai

- Nếu coi **Section** là “phần thi”, thì **Mondai** là “nhóm dạng bài” bên trong Section đó.
- Mỗi Mondai:
  - Có **mã code** ổn định (máy đọc): `KANJI_READING`, `ORTHOGRAPHY`, `BUNMYAKU_KITEI`, `IIKAE_RUIGI`, `YOUHOU`, `READING_SHORT`, `READING_MID`, `READING_LONG`, `INFO_SEARCH`, `LISTEN_TASK`, `LISTEN_POINT`, `LISTEN_SUMMARY`, `LISTEN_INSTANT`, `LISTEN_INTEGRATED`, v.v.
  - Có tên JP + VI, mô tả mục tiêu kỹ năng.
  - Có số lượng câu khuyến nghị ( gần giống đề thật ), dùng để validate khi soạn đề.

### 4.2. Ví dụ mapping theo cấp độ (rút gọn)

#### N5

- **Section 1 – 言語知識 (25’)**
  - `KANJI_READING` (漢字読み): đọc từ viết bằng Kanji.
  - `ORTHOGRAPHY` (表記): chuyển từ hiragana sang Kanji/Katakana.
  - `BUNMYAKU_KITEI` (文脈規定): chọn từ theo mạch văn.
  - `IIKAE_RUIGI` (言い換え類義): cách diễn đạt / từ gần nghĩa.

- **Section 2 – 文法 + 読解 (50’)**
  - `GRAMMAR_SENTENCE_1` (文の文法1): chọn mẫu ngữ pháp phù hợp câu.
  - `GRAMMAR_SENTENCE_2` (文の文法2): tạo câu mạch lạc đúng cú pháp.
  - `GRAMMAR_PARAGRAPH` (文章の文法): chọn câu phù hợp dòng chảy đoạn văn.
  - `READING_SHORT`, `READING_MID`, `INFO_SEARCH`: đọc hiểu văn bản ngắn, trung bình, và tìm thông tin.

- **Section 3 – 聴解 (30’)**
  - `LISTEN_TASK` (課題理解)
  - `LISTEN_POINT` (ポイント理解)
  - `LISTEN_PICTURE_DIALOG` (発表現話)
  - `LISTEN_INSTANT_REPLY` (即時応答)

#### N4, N3, N2, N1

- Giữ pattern tương tự N5, nhưng:
  - Tăng thêm Mondai về **từ ghép, từ phát sinh**, **đọc hiểu dài**, **chủ trương tác giả**, **tổng hợp nhiều văn bản**, **nghe hội thoại dài**.
  - Mỗi cấp độ có bảng config Mondai riêng (không hard-code trong code, mà là data cấu hình).

---

## 5. Luồng người dùng – Học viên

### 5.1. Chọn đề JLPT mock

1. Học viên vào mục **“Thi thử JLPT”**.
2. Chọn:
   - Cấp độ: N5–N1.
   - Đề: `JLPT N3 Mock 01`, `JLPT N3 Mock 02`, …
3. Hệ thống kiểm tra:
   - Điều kiện quyền truy cập (enrollment/gói học JLPT).
   - Giới hạn số lượt làm / đề (`max_attempts_per_user`).
4. Hiển thị màn hình **hướng dẫn trước khi thi**:
   - Giải thích cấu trúc đề, số phần, tổng thời gian.
   - Quy tắc: không pause, không quay lại section trước, cách chấm điểm là mock.

### 5.2. Bắt đầu thi

- Khi bấm “Bắt đầu thi”:
  - Tạo `JlptMockExamInstance` với trạng thái `IN_PROGRESS`.
  - Lưu: `user_id`, `exam_template_id`, `level`, `started_at`, `current_section_index = 0`.
  - Khởi động timer Section 1.

- UI khi thi:
  - Header: cấp độ, tên đề, section hiện tại, đồng hồ đếm ngược.
  - Body: danh sách câu, có navigation câu (sidebar hoặc pagination).
  - Cho phép **đánh dấu câu để xem lại trong cùng Section**.

### 5.3. Chuyển Section & Timer

- **Timer Section**:
  - Hết thời gian -> auto-save, khóa section hiện tại, chuyển sang màn hình chuẩn bị Section tiếp theo.
  - Không cho quay lại section trước.
- Cho phép “Kết thúc Section” sớm (optional), nhưng **không được quay lại**.
- Khi hết tất cả Section:
  - Đánh dấu `ENDED_AT`, chuyển trạng thái `SUBMITTED`, thực hiện chấm điểm.

### 5.4. Nghe hiểu (Listening)

- Câu thuộc Section Listening gắn:
  - `audio_id` (tham chiếu kho media), optional `image_assets` (cho 発表現話).
  - Quy tắc phát:
    - Tối thiểu config cho mỗi đề: `play_limit_per_audio` (1/2/unlimited).
    - Không cho tua/rê tiến độ nếu có thể.
  - Học viên chỉ có thể chọn đáp án sau khi audio đã (bắt đầu) phát.

---

## 6. Luồng soạn đề – Giáo viên / Admin

### 6.1. Tạo khung đề

1. Chọn cấp độ JLPT (N5–N1).
2. Nhập:
   - Tên đề: `JLPT N2 Mock Test 01`.
   - Mô tả, ghi chú nội bộ.
3. Hệ thống tự sinh:
   - Danh sách Section theo cấp độ (thời lượng default).
   - Danh sách Mondai (QuestionGroup) theo cấp độ, kèm số câu khuyến nghị.
4. Giáo viên có thể:
   - Điều chỉnh số câu từng Mondai (trong min/max hợp lý).
   - Bật/tắt một số Mondai (nếu muốn đề ngắn hơn) – có cảnh báo “Đề này không theo đủ cấu trúc JLPT thật”.

### 6.2. Nhập câu hỏi

- Với mỗi Mondai, giáo viên tạo nhiều `JlptMockQuestion`:
  - Trường chung:
    - `stem_text` (nội dung câu), `stem_rich` (nếu cần định dạng).
    - `context_text` / `passage_id` (cho đọc hiểu).
    - `options[]` (A/B/C/D), `correct_option_key`.
    - `explanation_vi` (giải thích sau thi).
    - `difficulty` (E/M/H).
  - Trường đặc thù:
    - Kanji reading: `surface_kanji`, đáp án đúng là hiragana.
    - 文脈規定: có đoạn văn context riêng.
    - 読解: câu hỏi gắn với `reading_passage_id` (một đoạn văn có nhiều câu).
    - Listening: `audio_id`, optional `image_id`, `play_order`.

### 6.3. Publish đề

- Trạng thái `JlptMockExamTemplate`:
  - `DRAFT` → đang soạn.
  - `READY` → hoàn tất, chờ cấu hình lịch mở.
  - `PUBLISHED` → hiển thị cho học viên (thoả điều kiện quyền).
- Cấu hình bổ sung:
  - `available_from`, `available_to`.
  - `max_attempts_per_user`.
  - `show_detailed_review` (true/false).
  - `show_correct_answer_immediately` (true/false).

---

## 7. Chấm điểm & Kết quả

### 7.1. Nguyên tắc chấm điểm

- Do công thức JLPT chính thức không public, hệ thống dùng **mô hình mô phỏng**:
  - Mỗi câu có **trọng số** (thường 1 điểm thô), có thể tinh chỉnh theo Mondai.
  - Tính **raw score** cho từng mảng:
    - `language_score_raw` (từ vựng + ngữ pháp).
    - `reading_score_raw`.
    - `listening_score_raw`.
  - Mapping raw → scaled (0–60 mỗi mảng, tổng 0–180) qua bảng `raw_to_scaled_mapping` theo cấp độ.

- Cấu hình:
  - `min_language_scaled`, `min_reading_scaled`, `min_listening_scaled`.
  - `min_total_scaled`.
  - Nếu một mảng dưới điểm sàn hoặc tổng dưới sàn → trạng thái `FAIL_MOCK`, ngược lại `PASS_MOCK`.

### 7.2. Màn hình kết quả học viên

- Thông tin hiển thị:
  - Điểm scaled từng mảng (Ngôn ngữ / Đọc / Nghe).
  - Điểm tổng scaled.
  - Trạng thái: Đạt / Không đạt (mang tính tham khảo).
  - Thông điệp: “Đây là kỳ thi thử mô phỏng, không phải kỳ thi JLPT chính thức”.
- Nếu `show_detailed_review = true`:
  - Cho xem:
    - Danh sách câu, phân nhóm theo Section / Mondai.
    - Mỗi câu: câu hỏi, đáp án chọn, đáp án đúng, giải thích.
    - Với đọc hiểu: hiển thị đoạn văn + highlight phần liên quan.
    - Với nghe: tùy config cho phép/ngăn replay audio.

### 7.3. Báo cáo cho giáo viên / admin

- Theo đề:
  - Số lượt thi, tỉ lệ pass mock.
  - Phân bố điểm.
- Theo Mondai:
  - % đúng theo từng Mondai để biết kỹ năng nào yếu (Kanji, Listening 即時応答, v.v.).
- Theo học viên:
  - Lịch sử các lần thi JLPT mock, biểu đồ tiến bộ theo thời gian.

---

## 8. Trải nghiệm người dùng & Quy tắc hành vi

### 8.1. Timer & xử lý mất kết nối

- Timer dựa trên **server time** (để tránh gian lận bằng đổi giờ client).
- Khi reload / thoát trình duyệt:
  - `JlptMockExamInstance` vẫn giữ trạng thái `IN_PROGRESS` kèm thời điểm bắt đầu section.
  - Khi vào lại, hệ thống tính **thời gian còn lại theo server**, nếu hết → auto close section.
- Frontend có thể lưu local draft, backend lưu answer incremental (auto-save định kỳ).

### 8.2. Chống gian lận cơ bản

- Có thể log:
  - Thời điểm focus/blur tab (ở mức tham khảo).
  - Số lần reload.
- Không dừng timer nếu học viên chuyển tab hoặc rời khỏi trình duyệt.

---

## 9. Thiết kế Schema (Khái niệm + DDL gợi ý)

> Đây là thiết kế schema **ở mức spec** cho module JLPT Mock, dùng phong cách SQL giống các spec khác. Implementation thực tế (Prisma, migration…) sẽ dựa trên schema này và kiến trúc sẵn có.

### 9.1. Bảng cấp độ & cấu hình chung

```sql
CREATE TABLE jlpt_levels (
    id UUID PRIMARY KEY,
    code VARCHAR(4) UNIQUE NOT NULL,   -- 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
    name_vi VARCHAR(50),
    description_vi TEXT,
    total_duration_minutes INT NOT NULL
);

CREATE TABLE jlpt_sections (
    id UUID PRIMARY KEY,
    level_id UUID REFERENCES jlpt_levels(id) ON DELETE CASCADE,
    code VARCHAR(64) NOT NULL,         -- 'LANGUAGE_VOCAB', 'GRAMMAR_READING', 'LISTENING', ...
    name_vi VARCHAR(255),
    name_ja VARCHAR(255),
    duration_minutes INT NOT NULL,
    order_index INT NOT NULL,
    is_listening_section BOOLEAN DEFAULT FALSE
);
```

### 9.2. Mondai (QuestionGroup) theo cấp độ & section

```sql
CREATE TABLE jlpt_question_groups (
    id UUID PRIMARY KEY,
    section_id UUID REFERENCES jlpt_sections(id) ON DELETE CASCADE,
    code VARCHAR(64) NOT NULL,       -- 'KANJI_READING', 'ORTHOGRAPHY', ...
    title_vi VARCHAR(255),
    title_ja VARCHAR(255),
    description_vi TEXT,
    order_index INT NOT NULL,
    recommended_question_count INT,  -- để validate khi soạn đề
    UNIQUE (section_id, code)
);
```

> Các bảng trên mang tính “khung cấu trúc JLPT theo cấp độ”. Hệ thống có thể seed dữ liệu ban đầu cho N5–N1.

### 9.3. Đề JLPT Mock & mapping với cấu trúc

```sql
CREATE TABLE jlpt_mock_exam_templates (
    id UUID PRIMARY KEY,
    level_id UUID REFERENCES jlpt_levels(id),
    code VARCHAR(64),               -- 'N3_MOCK_01'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL,    -- 'DRAFT', 'READY', 'PUBLISHED', 'ARCHIVED'
    available_from TIMESTAMP,
    available_to TIMESTAMP,
    max_attempts_per_user INT,
    show_detailed_review BOOLEAN DEFAULT TRUE,
    show_correct_answer_immediately BOOLEAN DEFAULT TRUE,
    created_by UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE jlpt_mock_exam_template_sections (
    id UUID PRIMARY KEY,
    exam_template_id UUID REFERENCES jlpt_mock_exam_templates(id) ON DELETE CASCADE,
    jlpt_section_id UUID REFERENCES jlpt_sections(id), -- tham chiếu cấu trúc cấp độ
    custom_duration_minutes INT,                      -- optional override
    order_index INT NOT NULL
);

CREATE TABLE jlpt_mock_exam_template_groups (
    id UUID PRIMARY KEY,
    exam_template_id UUID REFERENCES jlpt_mock_exam_templates(id) ON DELETE CASCADE,
    jlpt_question_group_id UUID REFERENCES jlpt_question_groups(id),
    is_enabled BOOLEAN DEFAULT TRUE,
    custom_question_count INT,      -- nếu muốn dùng số câu khác recommended
    order_index INT NOT NULL
);
```

### 9.4. Câu hỏi & phương án

```sql
CREATE TABLE jlpt_mock_questions (
    id UUID PRIMARY KEY,
    exam_template_id UUID REFERENCES jlpt_mock_exam_templates(id) ON DELETE CASCADE,
    question_group_id UUID REFERENCES jlpt_question_groups(id),
    section_id UUID REFERENCES jlpt_sections(id),

    stem_text TEXT NOT NULL,          -- nội dung câu hỏi
    context_text TEXT,                -- context thêm (nếu có)
    reading_passage_id UUID,          -- tham chiếu bảng passage (đọc hiểu), nếu dùng
    audio_id UUID,                    -- tham chiếu bảng media (nghe hiểu), nếu dùng
    image_id UUID,                    -- hình minh họa (cho 発表現話), nếu có

    difficulty VARCHAR(16),           -- 'EASY', 'MEDIUM', 'HARD'
    weight DECIMAL(5,2) DEFAULT 1.0,  -- trọng số câu

    order_index INT NOT NULL,
    created_by UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE jlpt_mock_question_options (
    id UUID PRIMARY KEY,
    question_id UUID REFERENCES jlpt_mock_questions(id) ON DELETE CASCADE,
    option_key VARCHAR(4) NOT NULL,  -- 'A', 'B', 'C', 'D'
    content_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    order_index INT NOT NULL
);
```

> Nếu cần tối ưu storage cho đọc hiểu dài, có thể thêm bảng riêng:

```sql
CREATE TABLE jlpt_reading_passages (
    id UUID PRIMARY KEY,
    level_id UUID REFERENCES jlpt_levels(id),
    title TEXT,
    content TEXT NOT NULL,
    source_info TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 9.5. Attempt (Lần thi) & Answer

```sql
CREATE TABLE jlpt_mock_exam_instances (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    exam_template_id UUID REFERENCES jlpt_mock_exam_templates(id),

    level_id UUID REFERENCES jlpt_levels(id),
    status VARCHAR(20) NOT NULL,    -- 'IN_PROGRESS', 'SUBMITTED', 'CANCELLED'

    started_at TIMESTAMP NOT NULL,
    submitted_at TIMESTAMP,

    current_section_index INT DEFAULT 0,

    -- điểm raw
    language_score_raw DECIMAL(6,2),
    reading_score_raw DECIMAL(6,2),
    listening_score_raw DECIMAL(6,2),

    -- điểm scaled
    language_score_scaled INT,
    reading_score_scaled INT,
    listening_score_scaled INT,
    total_score_scaled INT,

    pass_mock BOOLEAN,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE jlpt_mock_exam_answers (
    id UUID PRIMARY KEY,
    exam_instance_id UUID REFERENCES jlpt_mock_exam_instances(id) ON DELETE CASCADE,
    question_id UUID REFERENCES jlpt_mock_questions(id),
    question_option_id UUID REFERENCES jlpt_mock_question_options(id),

    answered_at TIMESTAMP DEFAULT NOW(),

    is_correct BOOLEAN,
    score_awarded DECIMAL(5,2),

    UNIQUE (exam_instance_id, question_id)
);
```

### 9.6. Mapping raw → scaled

```sql
CREATE TABLE jlpt_scoring_profiles (
    id UUID PRIMARY KEY,
    level_id UUID REFERENCES jlpt_levels(id),
    name VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE jlpt_scoring_mappings (
    id UUID PRIMARY KEY,
    scoring_profile_id UUID REFERENCES jlpt_scoring_profiles(id) ON DELETE CASCADE,

    domain VARCHAR(20) NOT NULL,    -- 'LANGUAGE', 'READING', 'LISTENING'
    raw_score INT NOT NULL,
    scaled_score INT NOT NULL,

    UNIQUE (scoring_profile_id, domain, raw_score)
);
```

---

## 10. Gợi ý triển khai (Implementation Notes – không bắt buộc)

- Prefer implement module theo **service riêng** (vd: `JlptMockExamService`) để tách biệt với `ExamService` hiện có.
- Seed dữ liệu ban đầu:
  - `jlpt_levels`, `jlpt_sections`, `jlpt_question_groups` theo bảng cấu trúc JLPT 2024.
- Flow API chính:
  - `GET /jlpt/mock-exams` – danh sách đề học viên được phép thi.
  - `POST /jlpt/mock-exams/:id/instances` – bắt đầu attempt.
  - `GET /jlpt/mock-exams/instances/:id` – lấy trạng thái khi thi.
  - `POST /jlpt/mock-exams/instances/:id/answers` – lưu answer (auto-save).
  - `POST /jlpt/mock-exams/instances/:id/submit` – nộp bài, chấm điểm.
  - `GET /jlpt/mock-exams/instances/:id/result` – xem kết quả + review (tùy cấu hình).

Spec này chỉ định nghĩa **luồng và schema** cho module JLPT Mock. Việc tích hợp chi tiết với kiến trúc hiện tại (Prisma, NestJS module, permission, logging…) sẽ thực hiện sau khi spec được duyệt.

