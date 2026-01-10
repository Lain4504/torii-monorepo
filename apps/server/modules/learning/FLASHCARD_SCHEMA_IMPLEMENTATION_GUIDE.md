# Hướng Dẫn Triển Khai Flashcard Schema - Anki-like SRS

## 📋 Tổng Quan

Schema flashcard đã được cải thiện để:
1. ✅ Triển khai logic SRS (Spaced Repetition System) giống Anki
2. ✅ Tối ưu cho học tiếng Nhật (JLPT) với các field đặc thù
3. ✅ Dễ dàng tích hợp với AI agents để tự động tạo flashcard từ tài liệu

---

## 🆕 Các Thay Đổi Chính

### 1. **FlashcardDeck** - Cải Thiện
**Thêm fields:**
- `srsSettings` (JSON): Cấu hình SRS algorithm (new cards per day, max reviews, etc.)
- `aiSettings` (JSON): Cấu hình AI generation
- `sourceType`: manual, ai_generated, imported, mixed
- `lastStudiedAt`: Track activity
- `totalStudyTime`: Tổng thời gian học (seconds)
- `masteryPercentage`: Tỷ lệ thành thạo (0-100)

### 2. **Flashcard** - Cải Thiện
**Japanese-specific fields:**
- `furigana`: Phiên âm kanji (ひらがな)
- `kanji`: Kanji riêng
- `partOfSpeech`: Loại từ (noun, verb, adjective, etc.)
- `wordJlptLevel`: JLPT level của từ này (N5-N1)
- `meanings`: Structured meanings với examples

**AI Integration fields:**
- `aiGenerated`: Boolean flag
- `sourceDocumentId`: Reference đến document tạo ra card
- `generationMethod`: manual, ai_auto, ai_assisted, import
- `generationMetadata`: JSON chứa AI prompt, confidence, context

**SRS fields (giữ lại cho compatibility):**
- `lastReviewDate`: Last time ANY user reviewed
- `timesStudied`: Global study count

### 3. **FlashcardUserProgress** (NEW) ⭐
**Quan trọng nhất:** Track progress của mỗi user cho mỗi card.

**Fields:**
- `state`: new, learning, review, relearning (Anki states)
- `currentInterval`: Số ngày đến review tiếp theo
- `easeFactor`: Ease factor cá nhân (SM-2 algorithm)
- `lastReviewedAt`: Last time THIS user reviewed
- `nextReviewDate`: Next review date for THIS user
- `timesReviewed`, `timesCorrect`, `timesIncorrect`: Statistics
- `consecutiveCorrect`: Streak counter
- `reviewedToday`: Daily review limit
- Performance metrics: `averageResponseTime`, `lastResponseTime`

### 4. **FlashcardReview** (NEW)
**Lịch sử review:** Track mỗi lần review một card.

**Fields:**
- `quality`: 0=Again, 1=Hard, 2=Good, 3-4=Easy (Anki rating)
- `timeSpent`: Milliseconds
- `previousInterval`, `previousEaseFactor`, `previousState`: Before review
- `newInterval`, `newEaseFactor`, `newState`, `newNextReviewDate`: After review
- `sessionId`: Link to review session (optional)
- `userAnswer`: User's answer (optional)
- Analytics: `deviceType`, `reviewDuration`

### 5. **FlashcardReviewSession** (NEW)
**Session tracking:** Track mỗi session học của user.

**Fields:**
- `startedAt`, `completedAt`, `durationSeconds`
- Statistics: `totalCards`, `newCards`, `learningCards`, `reviewCards`
- Performance: `correctCount`, `incorrectCount`, `hardCount`, `easyCount`
- `masteryScore`: Percentage correct (0-100)
- Metadata: `deviceType`, `studyMode`

### 6. **New Enums**
- `FlashcardState`: new, learning, review, relearning
- `FlashcardGenerationMethod`: manual, ai_auto, ai_assisted, import
- `JapanesePartOfSpeech`: noun, verb_ichidan, verb_godan, etc.
- `ReviewQuality`: 0, 1, 2, 3, 4 (Anki rating)

---

## 🔧 Các Bước Triển Khai

### Step 1: Chạy Migration
```bash
# 1. Review SQL migration file
apps/server/prisma/FLASHCARD_SCHEMA_IMPROVEMENTS.sql

# 2. Apply Prisma schema changes
cd apps/server
npx prisma generate
npx prisma migrate dev --name add_anki_srs_schema
```

### Step 2: Migration Data Hiện Tại
Cần migration script để:
1. Tạo `FlashcardUserProgress` cho tất cả existing users và cards
2. Initialize state = 'new' cho cards chưa được review
3. Set `nextReviewDate` = NULL cho new cards
4. Migrate existing review data (nếu có) sang `FlashcardReview` table

**Example migration script:**
```sql
-- Tạo FlashcardUserProgress cho tất cả users và cards
INSERT INTO flashcard_user_progress (user_id, flashcard_id, state, current_interval, ease_factor)
SELECT DISTINCT 
  fd.user_id,
  f.id,
  'new',
  0,
  2.50
FROM flashcards f
JOIN flashcard_decks fd ON f.deck_id = fd.id
WHERE NOT EXISTS (
  SELECT 1 FROM flashcard_user_progress fup
  WHERE fup.user_id = fd.user_id AND fup.flashcard_id = f.id
);
```

### Step 3: Cập Nhật Services
Cần update các services:

#### 3.1 FlashcardService
**Thêm methods:**
- `getCardsDueForReview(userId, deckId?)`: Lấy cards cần review
- `submitReview(userId, flashcardId, quality)`: Submit review với quality rating
- `startReviewSession(userId, deckId)`: Bắt đầu session
- `completeReviewSession(sessionId, stats)`: Hoàn thành session
- `getUserProgress(userId, flashcardId)`: Lấy progress của user

#### 3.2 SRS Service (NEW)
**Tạo service mới:** `SrsAlgorithmService`
- `calculateNextReview(currentInterval, easeFactor, quality)`: Tính next review date
- `updateEaseFactor(currentEase, quality)`: Update ease factor
- `updateCardState(currentState, quality)`: Update card state
- `getCardsDue(userId, deckId?)`: Query cards due for review

**SM-2 Algorithm implementation:**
```typescript
// Pseudo-code
function calculateNextReview(currentInterval: number, easeFactor: number, quality: ReviewQuality): {
  newInterval: number;
  newEaseFactor: number;
  newState: FlashcardState;
  newNextReviewDate: Date;
} {
  // Anki SM-2 algorithm logic
  // quality: 0=Again, 1=Hard, 2=Good, 3-4=Easy
  // ...
}
```

### Step 4: Tích Hợp AI Agents
**Workflow: Tự động gen flashcard từ document**

#### 4.1 Update Sensei Agent Service
```typescript
// apps/server/modules/agents/src/sensei-agent/sensei-agent.service.ts

async generateFlashcardsFromDocument(
  documentId: string,
  userId: string,
  deckId: string,
  options?: {
    jlptLevel?: string;
    minConfidence?: number;
  }
): Promise<FlashcardResponseDTO[]> {
  // 1. Read document
  // 2. Extract vocabulary/kanji using AI
  // 3. Generate flashcards
  // 4. Save với generationMethod = 'ai_auto' hoặc 'ai_assisted'
  // 5. Return flashcards
}
```

#### 4.2 Tạo Endpoint
```typescript
// POST /api/flashcards/generate-from-document
{
  "documentId": "uuid",
  "deckId": "uuid",
  "options": {
    "jlptLevel": "N5",
    "minConfidence": 0.8
  }
}
```

### Step 5: Update Controllers
**Thêm endpoints:**

1. **Review Endpoints:**
   - `POST /api/flashcards/:id/review` - Submit review
   - `GET /api/flashcards/due` - Get cards due for review
   - `POST /api/flashcards/review-sessions` - Start review session
   - `PATCH /api/flashcards/review-sessions/:id/complete` - Complete session

2. **Progress Endpoints:**
   - `GET /api/flashcards/:id/progress` - Get user progress
   - `GET /api/flashcard-decks/:id/stats` - Get deck statistics

3. **AI Generation Endpoints:**
   - `POST /api/flashcards/generate-from-document` - Generate from document
   - `POST /api/flashcards/generate-from-text` - Generate from text

---

## 📊 Queries Quan Trọng

### 1. Get Cards Due for Review
```sql
SELECT f.*, fup.*
FROM flashcards f
JOIN flashcard_user_progress fup ON f.id = fup.flashcard_id
WHERE fup.user_id = $1
  AND fup.next_review_date <= CURRENT_DATE
  AND f.deck_id = $2  -- Optional: filter by deck
ORDER BY fup.next_review_date ASC;
```

### 2. Get Cards by State
```sql
SELECT f.*, fup.*
FROM flashcards f
JOIN flashcard_user_progress fup ON f.id = fup.flashcard_id
WHERE fup.user_id = $1
  AND fup.state = $2  -- 'new', 'learning', 'review', 'relearning'
ORDER BY fup.created_at ASC;
```

### 3. Get Review Statistics
```sql
SELECT 
  COUNT(*) as total_reviews,
  COUNT(*) FILTER (WHERE quality = '0') as again_count,
  COUNT(*) FILTER (WHERE quality = '1') as hard_count,
  COUNT(*) FILTER (WHERE quality = '2') as good_count,
  COUNT(*) FILTER (WHERE quality IN ('3', '4')) as easy_count,
  AVG(time_spent) as avg_time_spent
FROM flashcard_reviews
WHERE user_id = $1
  AND review_date >= CURRENT_DATE - INTERVAL '30 days';
```

---

## 🎯 Use Cases

### Use Case 1: User Review Flashcard
```
1. GET /api/flashcards/due?deckId=xxx
   → Returns cards due for review

2. User reviews card → POST /api/flashcards/:id/review
   {
     "quality": 2,  // Good
     "timeSpent": 3000,  // 3 seconds
     "sessionId": "optional"
   }
   
3. Backend:
   - Calculate new interval & ease factor (SM-2)
   - Update FlashcardUserProgress
   - Create FlashcardReview record
   - Update FlashcardReviewSession stats
   
4. Return updated card with new nextReviewDate
```

### Use Case 2: AI Generate Flashcards từ Document
```
1. User uploads document → FileAsset created

2. POST /api/flashcards/generate-from-document
   {
     "documentId": "uuid",
     "deckId": "uuid",
     "options": {
       "jlptLevel": "N5",
       "autoApprove": false
     }
   }

3. Sensei Agent:
   - Read document
   - Extract vocabulary/kanji
   - Generate flashcards với AI
   - Save với:
     - generationMethod = 'ai_auto'
     - generationMetadata = { prompt, confidence, context }
     - sourceDocumentId = documentId
     
4. Return generated flashcards
   - If autoApprove = false: cards trong trạng thái pending
   - If autoApprove = true: cards được add vào deck
```

### Use Case 3: Start Review Session
```
1. POST /api/flashcards/review-sessions
   {
     "deckId": "uuid",
     "studyMode": "normal"  // or "cram"
   }
   → Returns sessionId

2. Get cards due → GET /api/flashcards/due?sessionId=xxx

3. User reviews cards → POST /api/flashcards/:id/review
   (include sessionId in request)

4. Complete session → PATCH /api/flashcards/review-sessions/:id/complete
   → Returns session statistics
```

---

## 🔍 Performance Considerations

### Indexes (đã tạo trong schema):
- ✅ `flashcard_user_progress(user_id, next_review_date)` - Get cards due
- ✅ `flashcard_user_progress(user_id, state)` - Filter by state
- ✅ `flashcard_reviews(user_id, review_date)` - Analytics queries
- ✅ `flashcard_review_sessions(user_id, started_at)` - Recent sessions
- ✅ `flashcards(next_review_date)` - Due cards query (global)

### Optimization Tips:
1. **Batch queries:** Khi get cards due, use pagination
2. **Caching:** Cache deck stats, user progress summary
3. **Async processing:** AI generation nên chạy async
4. **Database triggers:** Auto-update deck stats khi review

---

## 📝 Next Steps

1. ✅ **Schema Changes:** Đã hoàn thành
2. ⏳ **Migration Script:** Cần tạo script migration data
3. ⏳ **SRS Algorithm Service:** Implement SM-2 algorithm
4. ⏳ **Review Endpoints:** Implement review API
5. ⏳ **AI Integration:** Connect với Sensei Agent
6. ⏳ **Frontend Updates:** Update UI để sử dụng new schema
7. ⏳ **Testing:** Test SRS algorithm với real data

---

## 📚 Resources

- **Anki Algorithm:** https://apps.ankiweb.net/docs/manual.html#what-algorithm
- **SM-2 Algorithm:** https://www.supermemo.com/en/archives1990-2015/english/ol/sm2
- **Prisma Docs:** https://www.prisma.io/docs
- **Review Document:** `FLASHCARD_SCHEMA_REVIEW.md`
- **SQL Migration:** `FLASHCARD_SCHEMA_IMPROVEMENTS.sql`

---

## ❓ Questions?

Nếu có câu hỏi về implementation, hãy tham khảo:
- Schema review document
- Prisma schema file
- Example queries trong document này

