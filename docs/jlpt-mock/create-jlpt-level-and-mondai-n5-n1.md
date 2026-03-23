# Hướng dẫn tạo JLPT Mock: `N5` và `N1` (Level → Mondai)

Tài liệu này hướng dẫn thao tác trong `web-admin` để:

1. Tạo `JlptLevel` + `JlptSection` (global theo cấp độ)
2. Tạo `JlptMondai` theo đúng `Level` + `Section`
3. Setup để sau này vào `Questions` và tạo câu hỏi sẽ chọn được Mondai và suy ra đúng domain chấm điểm.

> Ghi chú quan trọng về “đúng chuẩn” theo logic trong repo:
>
> - Backend chấm điểm theo domain `LANGUAGE` / `READING` / `LISTENING` dựa vào `questionType`.
> - `questionType` được suy ra tự động từ `sectionCode` và thông tin `mondai` (`code/titleVi/titleJa`) bằng hàm `inferQuestionTypeFromMondai` (xem `apps/web-admin/src/lib/jlpt/infer-question-type-from-mondai.ts`).
> - Vì vậy với các section kiểu `LANGUAGE_GRAMMAR_READING`, bạn cần đặt **tên (titleJa/titleVi) có từ khóa** để hệ thống phân loại đúng `GRAMMAR` (→ `LANGUAGE`) hay `READING` (→ `READING`).

---

## Luồng chung (chạy cho cả N5/N1)

### Bước 1: Tạo `JlptLevel` + `Sections`
1. Vào trang: `http://localhost:5173/academy/jlpt/config`
2. Chọn `Level`:
   - Với phần này tài liệu hướng dẫn cho `N5` và `N1`
3. (Khuyến nghị) Điền “Tên tiếng Việt” tuỳ chọn, ví dụ: `N5`, `N1`
4. Bấm nút **`Tạo/đồng bộ Level + Sections`**

Sau khi bấm, backend sẽ seed `Sections` theo pattern chuẩn của repo.

### Bước 2 (tuỳ chọn nhưng thực tế nên làm): Tạo `Scoring profile`
- Nếu bạn định tạo `Templates` sau này, `Templates` sẽ cần `active scoring profile` theo `level`.
- Bạn có thể làm ngay ở `Step 2` của `/academy/jlpt/config`:
  - Tên profile tuỳ chọn
  - Ngưỡng pass sẽ tự điền theo `N` (UI có sẵn defaults).

### Bước 3: Tạo `Mondai` theo `Level` + `Section`
1. Vào trang: `http://localhost:5173/academy/jlpt/mondai`
2. Chọn:
   - `Cấp độ (Level)` = `N5` hoặc `N1`
   - `Phần thi (Section)` = 1 trong các mã section của repo
3. Bấm **`Thêm mondai`**
4. Nhập:
   - `Mã (code)` (duy nhất trong cùng section)
   - `Tiêu đề tiếng Việt (titleVi)` và/hoặc `Tiêu đề tiếng Nhật (titleJa)`
   - `Thứ tự (orderIndex)` tăng dần từ 1
   - `Gợi ý số câu (recommendedQuestionCount)` (tuỳ chọn)
5. Lưu, lặp lại cho tất cả mondai cần thiết của section đó.

---

## N5: tạo Level → tạo Mondai

### 1) Tạo `JlptLevel` + `Sections` cho `N5`
1. `/academy/jlpt/config`
2. Chọn `Level = N5`
3. Bấm **`Tạo/đồng bộ Level + Sections`**

Theo seed của repo, các section cho `N5` sẽ là:
- `LANGUAGE_VOCAB` (Section 1)
- `LANGUAGE_GRAMMAR_READING` (Section 2)
- `LISTENING` (Section 3)

### 2) Tạo Mondai cho `N5`

Đi vào `/academy/jlpt/mondai`:

#### A. Section `LANGUAGE_VOCAB` (N5)
Tạo lần lượt các mondai sau (đúng theo spec mẫu rút gọn cho N5):

1. `code: KANJI_READING`
   - `titleJa`: 漢字読み
   - `titleVi`: Đọc chữ Kanji
   - `orderIndex: 1`
2. `code: ORTHOGRAPHY`
   - `titleJa`: 表記
   - `titleVi`: Chính tả/viết đúng (chuyển hiragana ↔ chữ khác)
   - `orderIndex: 2`
3. `code: BUNMYAKU_KITEI`
   - `titleJa`: 文脈規定
   - `titleVi`: Xác định theo mạch văn
   - `orderIndex: 3`
4. `code: IIKAE_RUIGI`
   - `titleJa`: 言い換え類義
   - `titleVi`: Từ đồng nghĩa/diễn đạt tương đương
   - `orderIndex: 4`

#### B. Section `LANGUAGE_GRAMMAR_READING` (N5)
Tạo 6 mondai sau (spec mẫu N5):

1. `code: GRAMMAR_SENTENCE_1`
   - `titleJa`: 文の文法1
   - `titleVi`: Ngữ pháp (câu) 1
   - `orderIndex: 1`
2. `code: GRAMMAR_SENTENCE_2`
   - `titleJa`: 文の文法2
   - `titleVi`: Ngữ pháp (câu) 2
   - `orderIndex: 2`
3. `code: GRAMMAR_PARAGRAPH`
   - `titleJa`: 文章の文法
   - `titleVi`: Ngữ pháp (đoạn)
   - `orderIndex: 3`
4. `code: READING_SHORT`
   - `titleJa`: 短文読解 / 短い文章
   - `titleVi`: Đọc hiểu ngắn
   - `orderIndex: 4`
5. `code: READING_MID`
   - `titleJa`: 中文読解
   - `titleVi`: Đọc hiểu trung bình
   - `orderIndex: 5`
6. `code: INFO_SEARCH`
   - `titleJa`: 情報検索 / 情報探し
   - `titleVi`: Tìm thông tin
   - `orderIndex: 6`

> Mẹo để hệ thống tự suy ra domain đúng:
> - Với mondai đọc hiểu ở section này, cố gắng để `titleJa` có chứa các từ khóa kiểu `読解`, `内容理解`, `情報検索`, `短文`… (để `inferQuestionTypeFromMondai` trả `READING`)
> - Với mondai ngữ pháp, đảm bảo `titleJa` có `文法`/`文の文法`/`文章の文法` (để `inferQuestionTypeFromMondai` trả `GRAMMAR`)

#### C. Section `LISTENING` (N5)
Tạo 4 mondai sau (spec mẫu N5):

1. `code: LISTEN_TASK`
   - `titleJa`: 課題理解
   - `titleVi`: Hiểu yêu cầu/câu hỏi nghe
   - `orderIndex: 1`
2. `code: LISTEN_POINT`
   - `titleJa`: ポイント理解
   - `titleVi`: Hiểu ý chính
   - `orderIndex: 2`
3. `code: LISTEN_PICTURE_DIALOG`
   - `titleJa`: 発表現話 / 発表現話（đối thoại tranh）
   - `titleVi`: Đối thoại/diễn đạt theo tranh
   - `orderIndex: 3`
4. `code: LISTEN_INSTANT_REPLY`
   - `titleJa`: 即時応答
   - `titleVi`: Trả lời ngay lập tức
   - `orderIndex: 4`

---

## N1: tạo Level → tạo Mondai

### 1) Tạo `JlptLevel` + `Sections` cho `N1`
1. `/academy/jlpt/config`
2. Chọn `Level = N1`
3. Bấm **`Tạo/đồng bộ Level + Sections`**

Theo seed của repo, các section cho `N1` sẽ là:
- `LANGUAGE_GRAMMAR_READING` (Section 1)
- `LISTENING` (Section 2)

### 2) Tạo Mondai cho `N1`

Vào `/academy/jlpt/mondai` và tạo như sau:

#### A. Section `LANGUAGE_GRAMMAR_READING` (N1) — chia theo “Ngữ pháp” vs “Đọc hiểu”

Vì section này dùng chung cho cả ngữ pháp và đọc hiểu, hệ thống sẽ phân loại `questionType` theo mondai bằng từ khóa trong `titleJa/titleVi`.

Bạn làm theo nguyên tắc:
1. Mondai thuộc **NGỮ PHÁP**: titleJa nên chứa `文法` / `文の文法` / `文章の文法` (để suy ra `GRAMMAR` → điểm vào domain `LANGUAGE`)
2. Mondai thuộc **ĐỌC HIỂU**: titleJa nên chứa `読解` / `内容理解` / `情報検索` / `長文` / `統合理解` / `主張理解`… (để suy ra `READING`)

Gợi ý bộ mondai khởi tạo (đủ để tạo đề giống cấu trúc JLPT):

**(1) Ngữ pháp**
1. `code: GRAMMAR_SENTENCE_1`
   - `titleJa`: 文の文法1
   - `titleVi`: Ngữ pháp (câu) 1
   - `orderIndex: 1`
2. `code: GRAMMAR_SENTENCE_2`
   - `titleJa`: 文の文法2
   - `titleVi`: Ngữ pháp (câu) 2
   - `orderIndex: 2`
3. `code: GRAMMAR_PARAGRAPH`
   - `titleJa`: 文章の文法
   - `titleVi`: Ngữ pháp (đoạn)
   - `orderIndex: 3`

**(2) Đọc hiểu**
4. `code: READING_SHORT`
   - `titleJa`: 短文読解
   - `titleVi`: Đọc hiểu ngắn
   - `orderIndex: 4`
5. `code: READING_MID`
   - `titleJa`: 中文読解
   - `titleVi`: Đọc hiểu trung bình
   - `orderIndex: 5`
6. `code: READING_LONG`
   - `titleJa`: 長文読解
   - `titleVi`: Đọc hiểu dài
   - `orderIndex: 6`
7. `code: INFO_SEARCH`
   - `titleJa`: 情報検索
   - `titleVi`: Tìm thông tin
   - `orderIndex: 7`
8. `code: CONTENT_INFERENCE`
   - `titleJa`: 内容理解 / 主張理解
   - `titleVi`: Suy luận nội dung/quan điểm (dựa câu chữ trong title)
   - `orderIndex: 8`
9. `code: INTEGRATED_READING`
   - `titleJa`: 統合理解
   - `titleVi`: Tích hợp/giải thích tổng hợp
   - `orderIndex: 9`

> Bạn không cần “đúng tuyệt đối” 100% danh sách mã chính thức nếu repo của bạn chưa seed sẵn N1 Mondai.
> Điều quan trọng là: **title có từ khóa** để repo suy ra `questionType` đúng (GRAMMAR vs READING).

#### B. Section `LISTENING` (N1)
Section này trong repo luôn suy ra `questionType = LISTENING` (vì base theo sectionCode).

Bạn tạo các mondai nghe theo gợi ý:
1. `code: LISTEN_TASK`
   - `titleJa`: 課題理解
   - `titleVi`: Hiểu nhiệm vụ
   - `orderIndex: 1`
2. `code: LISTEN_POINT`
   - `titleJa`: ポイント理解
   - `titleVi`: Hiểu ý chính
   - `orderIndex: 2`
3. `code: LISTEN_INSTANT_REPLY`
   - `titleJa`: 即時応答
   - `titleVi`: Phản hồi tức thời
   - `orderIndex: 3`
4. `code: LISTEN_INTEGRATED`
   - `titleJa`: 総合理解 / 統合理解
   - `titleVi`: Hiểu tổng hợp
   - `orderIndex: 4`
5. `code: LISTEN_SUMMARY`
   - `titleJa`: 要約 / まとめ
   - `titleVi`: Tóm tắt
   - `orderIndex: 5`

---

## Checklist nhanh (để chắc chắn đã “đúng chuẩn theo repo”)

1. Sau khi tạo mondai xong:
   - Vào `http://localhost:5173/academy/jlpt/questions`
   - Chọn `Level = N5`/`N1`
   - Chọn `Section` tương ứng
   - Kiểm tra dropdown **Mondai (問題形式)** có đủ danh sách bạn vừa tạo
2. Khi thêm câu hỏi và chọn mondai:
   - `questionType` nên được tự suy ra đúng:
     - Ngữ pháp → `VOCAB/GRAMMAR` domain (backend cộng vào `LANGUAGE`)
     - Đọc hiểu → domain `READING`
     - Nghe → domain `LISTENING`

