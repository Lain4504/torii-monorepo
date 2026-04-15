# Hướng dẫn tích hợp tính năng tạo `note` (hint) với AI — Mobile

Mục tiêu: mô tả chi tiết cách mobile client gọi API AI để sinh nội dung `note` cho flashcard, map kết quả và lưu card về server.

---

## Tổng quan

Kiến trúc (tóm tắt):

- Mobile app → Gateway API (`/api/agents/flashcard/autofill`) → Agents service (Sensei) → AI model
- Mobile nhận kết quả (term, phonetic, definition, note, type) → gọi API tạo card `/api/academy/study-sets/{setId}/cards`

Dòng dữ liệu chính:
- Gọi autofill: gửi `term` → nhận `{ term, phonetic, definition, note, type }`
- Tạo card: gửi payload theo `AcademySetCardCreateDTO` (xem phần Schema)

---

## Endpoints chính

1) AI autofill

- URL: `POST /api/agents/flashcard/autofill`
- Request body: `{ "term": "<term>" }`
- Response success: `{ success: true, data: { term, phonetic, definition, note, type } }`

Ví dụ response.data.data:

```json
{
  "term": "食べる",
  "phonetic": "たべる",
  "definition": "to eat",
  "note": "Dùng trong ngữ cảnh ăn thức ăn; thể ます: 食べます",
  "type": "Từ vựng"
}
```

2) Tạo card

- URL: `POST /api/academy/study-sets/{setId}/cards`
- Payload (AcademySetCardCreateDTO):

```json
{
  "term": "...",
  "definition": "...",
  "hint": "...",           // mapped từ AI.note
  "mediaUrl": "...",
  "tags": ["..."],
  "languageDetails": {"phonetic":"...","type":"..."}
}
```

3) Quota (tùy chọn, kiểm tra trước khi bulk)

- URL: `GET /api/agents/sensei/quota-status`
- Response: `{ success:true, data: { limit, used, remaining, tier, resetAt } }`

---

## Schema & mapping dữ liệu

- `aiResponse.note` → `card.hint`
- `aiResponse.term` → `card.term`
- `aiResponse.definition` → `card.definition`
- `aiResponse.phonetic` → `card.languageDetails.phonetic`
- `aiResponse.type` → `card.languageDetails.type` (hoặc thêm vào `tags` nếu muốn)

Lưu ý: API server chấp nhận `hint` optional; nếu AI trả `note` rỗng, mobile nên cho phép user chỉnh trước khi lưu.

---

## Authentication / Header

- Web client hiện dùng cookie (apiClient `withCredentials: true`) — mobile thường dùng token:
  - Dùng `Authorization: Bearer <access_token>` header cho mobile.
  - Luôn thêm header `x-platform: mobile` để phân biệt client.

- Nếu team muốn dùng cookie trên mobile, cần một cookie-jar hoặc WebView để đồng bộ cookies.

---

## Best practices cho Bulk (hiệu năng & ổn định)

1) Deduplicate & sanitize: loại bỏ dòng trống, trim, loại trùng thuật ngữ trước khi xử lý.
2) Concurrency: không gọi tất cả cùng lúc. Khuyến nghị `concurrency = 2..4`.
3) Chunking: chia terms thành chunk size = concurrency, xử lý từng chunk bằng `Promise.all(chunk.map(...))`.
4) Retry/backoff: retry 2-3 lần với exponential backoff cho lỗi mạng/5xx/429.
5) Quota check: nếu API có giới hạn, gọi `GET /api/agents/sensei/quota-status` và báo cho người dùng nếu `remaining < n`.
6) Cancel/Abort: hỗ trợ hủy thao tác (AbortController) khi người dùng huỷ.
7) Preview: hiển thị preview cho từng thuật ngữ trước khi lưu để user kiểm tra/chỉnh sửa.

---

## Ví dụ: React Native (axios) — Bulk autofill + create (mẫu)

> Đây là ví dụ tham khảo, có thể copy vào hook hoặc module network của app.

```javascript
// utils/mobileAiBulk.js
import axios from 'axios'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function retry(fn, attempts = 3, baseDelay = 150) {
  let attempt = 0
  while (true) {
    try {
      return await fn()
    } catch (err) {
      attempt++
      if (attempt >= attempts) throw err
      await sleep(baseDelay * Math.pow(2, attempt))
    }
  }
}

function chunkArray(arr, size) {
  const res = []
  for (let i = 0; i < arr.length; i += size) res.push(arr.slice(i, i + size))
  return res
}

export async function processTermsBulk({ terms, setId, apiBaseUrl, token, onProgress, abortSignal }) {
  const client = axios.create({ baseURL: apiBaseUrl, headers: { Authorization: `Bearer ${token}`, 'x-platform': 'mobile' } })

  // sanitize, unique
  const clean = Array.from(new Set(terms.map(t => (t || '').trim()).filter(Boolean)))
  const concurrency = 3
  const chunks = chunkArray(clean, concurrency)

  const results = []

  for (let i = 0; i < chunks.length; i++) {
    if (abortSignal?.aborted) throw new Error('cancelled')

    const chunk = chunks[i]
    const promises = chunk.map(async (term) => {
      try {
        // Call autofill (with retry)
        const generated = await retry(() => client.post('/api/agents/flashcard/autofill', { term }).then(r => r.data.data), 3)

        // Validate minimal fields
        if (!generated || !generated.definition) {
          return { term, status: 'no-definition', generated }
        }

        const payload = {
          term: generated.term || term,
          definition: generated.definition || '',
          hint: generated.note || undefined,
          languageDetails: { phonetic: generated.phonetic, type: generated.type }
        }

        // Create card (with retry)
        const created = await retry(() => client.post(`/api/academy/study-sets/${setId}/cards`, payload).then(r => r.data.data.item), 3)
        return { term, status: 'created', created }
      } catch (err) {
        return { term, status: 'error', error: (err && err.message) || err }
      }
    })

    const settled = await Promise.all(promises)
    results.push(...settled)

    // progress callback
    onProgress?.({ processed: results.length, total: clean.length, lastChunk: settled })

    // small pause to avoid bursting
    await sleep(200)
  }

  return results
}
```

Sử dụng (ví dụ):

```javascript
// gọi từ component
const res = await processTermsBulk({ terms: ['食べる','見る','行く'], setId: 'abc123', apiBaseUrl: 'https://api.example.com', token: 'xxx', onProgress: console.log })
```

---

## Ví dụ cURL

Autofill:

```bash
curl -X POST "$API_URL/api/agents/flashcard/autofill" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-platform: mobile" \
  -d '{"term":"食べる"}'
```

Tạo card:

```bash
curl -X POST "$API_URL/api/academy/study-sets/$SET_ID/cards" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"term":"食べる","definition":"to eat","hint":"note","languageDetails":{"phonetic":"たべる","type":"Từ vựng"}}'
```

---

## UX đề xuất cho mobile

- Modal nhập: textarea (mỗi dòng 1 term) hoặc CSV upload
- Preview screen: hiển thị từng term với `definition` và `note` (editable)
- Progress bar: `x / n` và status per-item (pending/success/failed)
- Retry per-item: cho phép retry riêng nếu AI lỗi
- Cancel: hỗ trợ hủy toàn bộ tiến trình

---

## Xử lý lỗi & fallback

- 401: redirect về màn login
- 429: retry với backoff; nếu vẫn 429 → dừng và hiển thị message về quota
- 5xx / network: retry với backoff, cho user tuỳ chọn retry thủ công
- AI trả `note` rỗng: buộc user edit trước khi lưu hoặc lưu card tắt hint

---

## Kiểm thử (checklist)

- [ ] Gọi 1 thuật ngữ → nhận definition/note đúng → card xuất hiện trên web
- [ ] Bulk 20 thuật ngữ → đảm bảo không quá tải server và tiến độ hiển thị đúng
- [ ] Kiểm tra token hết hạn → UX redirect login
- [ ] Kiểm tra quota limit (simulate 429) → hiển thị thông báo phù hợp
- [ ] Thử hủy thao tác giữa chừng → không tạo thêm card
- [ ] Edge: term trùng lặp → dedupe trước khi gọi

---

## Các bước triển khai (ngắn gọn)

1. Chọn chiến lược auth cho mobile (token recommended).
2. Implement network client với `x-platform: mobile` và header Authorization.
3. Tạo UI modal/textarea + preview screen.
4. Implement `processTermsBulk` (hoặc tương tự), xử lý concurrency + retry.
5. Test từng bước với cURL và staging server.
6. Triển khai và giám sát usage/quota.

---

## Muốn tôi làm gì tiếp theo?
- Tôi có thể: (A) tạo sẵn component React Native hoàn chỉnh, (B) thêm snippet Kotlin/Swift, hoặc (C) commit file này vào Git và mở PR. Hãy chọn một.

---

*File này tham khảo các API client hiện có trong dự án:*
- `apps/web-learner/lib/api/services/agent-api.ts` — gọi `autofillFlashcard`
- `apps/web-learner/lib/api/services/academy-study-set-api.ts` — `createCard`
- DTOs ở: `packages/schemas/src/dtos/academy-study-set.dto.ts`


---

© Guidance generated — cập nhật nếu backend schema thay đổi.
