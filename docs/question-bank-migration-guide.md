# Question Bank Migration Guide
## Từ MVP → Production AI-Optimized Design

---

## Tổng quan thay đổi

### Tables mới:
1. ✅ `question_pools` - Nhóm câu hỏi theo course/lesson
2. ✅ `question_statistics` - Performance metrics cho AI
3. ✅ `user_question_progress` - Track user level và weaknesses
4. ✅ `ai_question_recommendations` - AI recommendations

### Fields mới trong `question_bank`:
1. ✅ `pool_id` - Link to question pool
2. ✅ `metadata` (JSONB) - Rich content (audio, images, reading passages)
3. ✅ `ai_metadata` (JSONB) - AI-specific context (grammar points, vocab, semantic tags)

---

## Migration Steps

### Step 1: Create Migration

```bash
cd apps/server
npx prisma migrate dev --name add_question_bank_ai_support
```

### Step 2: Update Existing Data (Optional)

```sql
-- Add default metadata for existing questions
UPDATE question_bank 
SET 
    metadata = '{}'::jsonb,
    ai_metadata = '{}'::jsonb
WHERE metadata IS NULL OR ai_metadata IS NULL;

-- Initialize statistics for existing questions
INSERT INTO question_statistics (question_id, total_attempts, correct_attempts, success_rate)
SELECT 
    id,
    usage_count,
    0, -- Will be updated from quiz_attempt_details
    0.00
FROM question_bank
WHERE id NOT IN (SELECT question_id FROM question_statistics);
```

### Step 3: Update Code

1. Update Prisma Client:
```bash
npx prisma generate
```

2. Update Service layer để support:
   - Question Pools
   - AI Metadata
   - Statistics tracking
   - User Progress

---

## AI Metadata Structure

### Example ai_metadata:

```json
{
  "semantic_tags": ["restaurant", "daily_conversation", "food"],
  "grammar_points": ["て-form", "passive voice", "particles"],
  "vocabulary_words": ["食べる", "飲む", "行く", "レストラン"],
  "kanji_levels": ["N5", "N4"],
  "topic": "food_and_dining",
  "context": "restaurant_ordering",
  "complexity_score": 0.65,
  "prerequisite_skills": ["basic_verbs", "particles_を_に"],
  "learning_objectives": [
    "understand_て-form_usage",
    "restaurant_vocabulary",
    "ordering_food"
  ],
  "estimated_time_seconds": 45,
  "cognitive_load": "medium"
}
```

### Example metadata (Rich content):

```json
{
  "audio_url": "https://...",
  "image_url": "https://...",
  "reading_passage": "長い文章...",
  "reading_passage_romaji": "Nagai bunshou...",
  "audio_transcript": "...",
  "audio_transcript_romaji": "...",
  "hint": "Hint text"
}
```

---

## AI Agent Integration

### 1. AI đọc questions với context:

```typescript
// Get questions with AI metadata
const questions = await prisma.questionBank.findMany({
  where: {
    jlptLevel: userLevel,
    status: 'active',
  },
  include: {
    statistics: true,
  },
});

// AI processes ai_metadata to understand question context
questions.forEach(q => {
  const grammarPoints = q.aiMetadata?.grammar_points || [];
  const vocab = q.aiMetadata?.vocabulary_words || [];
  // AI uses this to match with user weaknesses
});
```

### 2. AI tạo quiz tự động:

```typescript
async function generateQuizForUser(userId: string) {
  // Get user progress
  const userProgress = await prisma.userQuestionProgress.findUnique({
    where: { userId },
  });

  // AI selects questions based on:
  // - User's estimated level
  // - User's weaknesses
  // - Question statistics (success rate, difficulty)
  // - AI metadata (grammar points, vocab)
  
  const questions = await prisma.questionBank.findMany({
    where: {
      jlptLevel: userProgress.estimatedJlptLevel,
      status: 'active',
      id: { notIn: userProgress.attemptedQuestionIds },
      // Match weaknesses
      aiMetadata: {
        path: ['grammar_points'],
        array_contains: userProgress.weaknesses.grammar_points,
      },
    },
    include: {
      statistics: true,
    },
    orderBy: {
      statistics: {
        difficultyRating: 'asc', // Start with easier
      },
    },
    take: 20,
  });

  return questions;
}
```

### 3. AI update statistics sau quiz:

```typescript
async function updateQuestionStatistics(
  questionId: string,
  isCorrect: boolean,
  timeSpent: number
) {
  await prisma.questionStatistics.upsert({
    where: { questionId },
    create: {
      questionId,
      totalAttempts: 1,
      correctAttempts: isCorrect ? 1 : 0,
      successRate: isCorrect ? 100 : 0,
      averageTimeSeconds: timeSpent,
      difficultyRating: isCorrect ? 0.3 : 0.9, // AI calculates
    },
    update: {
      totalAttempts: { increment: 1 },
      correctAttempts: { increment: isCorrect ? 1 : 0 },
      successRate: {
        // Recalculate
        set: (prev.correctAttempts + (isCorrect ? 1 : 0)) / (prev.totalAttempts + 1) * 100,
      },
      averageTimeSeconds: {
        // Moving average
        set: (prev.averageTimeSeconds * prev.totalAttempts + timeSpent) / (prev.totalAttempts + 1),
      },
      difficultyRating: {
        // AI recalculates based on success rate
        set: calculateDifficultyFromSuccessRate(newSuccessRate),
      },
      lastUsedAt: new Date(),
    },
  });
}
```

---

## Next Steps

1. ✅ Run migration
2. ✅ Update service layer
3. ✅ Update DTOs để support ai_metadata
4. ✅ Implement AI agent integration
5. ✅ Add statistics tracking
6. ✅ Add user progress tracking

---

## Benefits

✅ **AI Agent có thể:**
- Đọc và hiểu questions qua ai_metadata
- Filter questions theo user level và weaknesses  
- Tạo quiz tự động với balanced difficulty
- Recommend questions phù hợp
- Track và update statistics

✅ **Performance:**
- GIN indexes cho JSONB queries
- Fast filtering với proper indexes
- Statistics pre-calculated

✅ **Scalability:**
- Question Pools cho organization
- Statistics tracking cho analytics
- User Progress cho personalization

