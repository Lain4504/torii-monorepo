# Đánh Giá Schema Flashcard - Tích Hợp Anki-like SRS và AI Agents

## 📋 Tổng Quan

Tài liệu này đánh giá schema flashcard hiện tại và đề xuất cải thiện để:
1. Triển khai logic SRS (Spaced Repetition System) giống Anki
2. Tối ưu cho học tiếng Nhật (JLPT)
3. Dễ dàng tích hợp với AI agents để tự động tạo flashcard từ tài liệu

---

## 🔍 Phân Tích Schema Hiện Tại

### FlashcardDeck (Bộ Thẻ)
**Ưu điểm:**
- ✅ Có JLPT level tracking
- ✅ Có tags cho phân loại
- ✅ Có card count tracking
- ✅ Hỗ trợ public/private decks

**Thiếu sót:**
- ❌ Không có schedule settings (cards per day, max reviews per day)
- ❌ Không track overall progress metrics
- ❌ Không có deck settings cho SRS algorithm

### Flashcard (Thẻ)
**Ưu điểm:**
- ✅ Có basic SRS fields (intervalDays, easeFactor, reviewCount, correctCount, nextReviewDate)
- ✅ Hỗ trợ multimedia (imageUrl, audioUrl)
- ✅ Có example sentence
- ✅ Có pronunciation

**Vấn đề quan trọng:**
- ❌ **Không có card state** (new, learning, review, relearning) - quan trọng cho Anki
- ❌ **Không track last review date** - chỉ có nextReviewDate
- ❌ **Thiếu fields cho tiếng Nhật**: furigana, kanji breakdown, part of speech
- ❌ **Không có user progress tracking** - SRS nên track per user, không phải per card global
- ❌ **Thiếu metadata cho AI generation**: source document, generation method, confidence score
- ❌ **Không có review session tracking** - cần track mỗi lần user review card
- ❌ **Ease factor chỉ là default** - không được update theo performance

---

## 🎯 Đề Xuất Cải Thiện

### 1. Thêm FlashcardReviewSession Table
**Mục đích:** Track từng session học của user, analytics chi tiết

```prisma
model FlashcardReviewSession {
  id            String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId        String   @map("user_id") @db.Uuid
  deckId        String   @map("deck_id") @db.Uuid
  startedAt     DateTime @default(now()) @map("started_at")
  completedAt   DateTime? @map("completed_at")
  totalCards    Int      @default(0) @map("total_cards")
  correctCount  Int      @default(0) @map("correct_count")
  incorrectCount Int     @default(0) @map("incorrect_count")
  // ... more fields
}
```

### 2. Thêm FlashcardUserProgress Table
**Mục đích:** Track progress của mỗi user cho mỗi card (quan trọng cho SRS)

**Vấn đề hiện tại:** Một card có thể được nhiều user học, nhưng hiện tại chỉ track global stats.

**Giải pháp:** Tách progress tracking thành per-user:
- Card state (new/learning/review/relearning)
- Last review date
- Current interval
- Ease factor (cá nhân hóa)
- Times reviewed today
- Times correct/incorrect

### 3. Cải Thiện Flashcard Model
**Thêm fields:**
- `furigana` - Phiên âm kanji
- `kanji` - Kanji riêng (nếu từ là hiragana/katakana)
- `partOfSpeech` - Loại từ (noun, verb, adjective, etc.)
- `jlptLevel` - JLPT level của từ này
- `meaning` (structured) - Nghĩa chi tiết với examples
- `aiGenerated` - Boolean flag
- `sourceDocumentId` - Reference đến document tạo ra card này
- `generationMethod` - "manual", "ai_auto", "ai_assisted"
- `generationMetadata` - JSON chứa AI prompt, confidence, etc.

### 4. Thêm FlashcardReview Table
**Mục đích:** Track mỗi lần review một card (lịch sử đầy đủ)

```prisma
model FlashcardReview {
  id                String   @id
  userId            String
  flashcardId       String
  sessionId         String?  // Optional: link to session
  quality           Int      // 0-5 (Anki rating: again, hard, good, easy)
  timeSpent         Int      // milliseconds
  reviewDate        DateTime
  previousInterval  Int?
  newInterval       Int?
  previousEase      Decimal?
  newEase           Decimal?
  // ... more fields
}
```

### 5. Cải Thiện FlashcardDeck
**Thêm fields:**
- `srsSettings` - JSON chứa SRS configuration (new cards per day, max reviews, etc.)
- `aiEnabled` - Cho phép AI tự động thêm cards
- `sourceType` - "manual", "ai_generated", "imported"
- `lastStudiedAt` - Track activity
- `totalStudyTime` - Tổng thời gian học

---

## 🔗 Tích Hợp AI Agents

### Flow Tự Động Gen Flashcard từ Tài Liệu

```
Document Upload
    ↓
Sensei Agent (extract vocabulary/kanji)
    ↓
Generate Flashcards (batch)
    ↓
User Review & Approval
    ↓
Add to Deck
```

### Schema Changes để Support AI Integration:

1. **Flashcard.sourceDocumentId** - Reference đến FileAsset hoặc Document
2. **Flashcard.generationMethod** - Enum: "manual", "ai_auto", "ai_assisted", "import"
3. **Flashcard.generationMetadata** - JSON:
   ```json
   {
     "agent": "sensei-agent",
     "prompt": "...",
     "confidence": 0.95,
     "extractedContext": "...",
     "generatedAt": "2024-01-01T00:00:00Z"
   }
   ```

3. **FlashcardDeck.aiSettings** - JSON config:
   ```json
   {
     "autoGenerate": true,
     "requireApproval": true,
     "minConfidence": 0.8,
     "filters": ["jlptLevel", "partOfSpeech"]
   }
   ```

---

## 📊 So Sánh: Hiện Tại vs Đề Xuất

| Feature | Hiện Tại | Đề Xuất |
|---------|----------|---------|
| **Card States** | ❌ Không có | ✅ New/Learning/Review/Relearning |
| **Per-User Progress** | ❌ Global only | ✅ FlashcardUserProgress table |
| **Review History** | ❌ Không có | ✅ FlashcardReview table |
| **Session Tracking** | ❌ Không có | ✅ FlashcardReviewSession table |
| **Japanese Fields** | ⚠️ Cơ bản | ✅ Furigana, Kanji, PartOfSpeech |
| **AI Integration** | ❌ Không có | ✅ Full metadata & workflow |
| **SRS Algorithm** | ⚠️ Fields có nhưng không dùng | ✅ SM-2 implementation ready |

---

## 🚀 Implementation Plan

### Phase 1: Core SRS Schema
1. ✅ Tạo `FlashcardUserProgress` table
2. ✅ Tạo `FlashcardReview` table
3. ✅ Tạo `FlashcardReviewSession` table
4. ✅ Thêm card state enum và fields

### Phase 2: Japanese Learning Optimization
1. ✅ Thêm furigana, kanji, partOfSpeech fields
2. ✅ Cải thiện pronunciation và audio handling
3. ✅ Structured meaning field

### Phase 3: AI Integration
1. ✅ Thêm AI generation metadata fields
2. ✅ Tạo document-to-flashcard workflow
3. ✅ Integration với Sensei Agent

### Phase 4: SRS Algorithm Implementation
1. ✅ Implement SM-2 algorithm service
2. ✅ Review endpoint với quality rating
3. ✅ Calculate next review date
4. ✅ Get cards due for review

---

## 📝 Notes

- **Migration Strategy:** Cần migration script để:
  - Migrate existing cards to new schema
  - Initialize FlashcardUserProgress cho existing users
  - Preserve existing review data nếu có

- **Performance:** Index cần thiết:
  - `FlashcardUserProgress(userId, flashcardId)`
  - `FlashcardReviewSession(userId, deckId, startedAt)`
  - `Flashcard(nextReviewDate)` - cho query cards due

- **Privacy:** AI metadata có thể chứa sensitive info, cần xử lý phù hợp

