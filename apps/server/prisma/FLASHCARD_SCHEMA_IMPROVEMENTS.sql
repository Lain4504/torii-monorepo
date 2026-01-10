-- ============================================
-- FLASHCARD SCHEMA IMPROVEMENTS
-- Anki-like SRS System + AI Integration
-- ============================================

-- ============================================
-- 1. ENUMS
-- ============================================

-- Card State: Anki-like states
CREATE TYPE FlashcardState AS ENUM ('new', 'learning', 'review', 'relearning');
COMMENT ON TYPE FlashcardState IS 'Card state trong Anki SRS algorithm';

-- Generation Method: Cách flashcard được tạo
CREATE TYPE FlashcardGenerationMethod AS ENUM ('manual', 'ai_auto', 'ai_assisted', 'import');
COMMENT ON TYPE FlashcardGenerationMethod IS 'Method tạo flashcard - cho AI integration';

-- Part of Speech: Loại từ tiếng Nhật
CREATE TYPE JapanesePartOfSpeech AS ENUM (
  'noun', 'verb_ichidan', 'verb_godan', 'verb_suru', 'verb_kuru',
  'adjective_i', 'adjective_na', 'adverb', 'particle', 'conjunction',
  'interjection', 'pronoun', 'number', 'other'
);
COMMENT ON TYPE JapanesePartOfSpeech IS 'Loại từ tiếng Nhật - cho JLPT learning';

-- Review Quality: Anki rating system (0-5)
-- 0: Again (incorrect), 1: Hard, 2: Good, 3: Easy (hiếm khi dùng), 4: Easy+ (rất hiếm)
-- Note: Anki thường dùng 0, 1, 2, 4
CREATE TYPE ReviewQuality AS ENUM ('0', '1', '2', '3', '4');
COMMENT ON TYPE ReviewQuality IS 'Anki rating: 0=Again, 1=Hard, 2=Good, 3-4=Easy';


-- ============================================
-- 2. IMPROVED FLASHCARD DECK
-- ============================================

ALTER TABLE flashcard_decks
ADD COLUMN IF NOT EXISTS srs_settings JSONB DEFAULT '{
  "newCardsPerDay": 20,
  "maxReviewsPerDay": 200,
  "easyBonus": 1.3,
  "intervalModifier": 1.0,
  "maximumInterval": 36500
}'::jsonb,
ADD COLUMN IF NOT EXISTS ai_settings JSONB DEFAULT '{
  "autoGenerate": false,
  "requireApproval": true,
  "minConfidence": 0.8,
  "filters": []
}'::jsonb,
ADD COLUMN IF NOT EXISTS source_type VARCHAR(20) DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS last_studied_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS total_study_time INTEGER DEFAULT 0, -- seconds
ADD COLUMN IF NOT EXISTS mastery_percentage DECIMAL(5,2) DEFAULT 0.00;

COMMENT ON COLUMN flashcard_decks.srs_settings IS 'SRS algorithm settings (Anki-like)';
COMMENT ON COLUMN flashcard_decks.ai_settings IS 'AI generation settings cho deck';
COMMENT ON COLUMN flashcard_decks.source_type IS 'manual, ai_generated, imported, mixed';
COMMENT ON COLUMN flashcard_decks.total_study_time IS 'Tổng thời gian học (seconds)';
COMMENT ON COLUMN flashcard_decks.mastery_percentage IS 'Tỷ lệ thành thạo (0-100)';


-- ============================================
-- 3. IMPROVED FLASHCARD
-- ============================================

ALTER TABLE flashcards
-- Japanese-specific fields
ADD COLUMN IF NOT EXISTS furigana TEXT,
ADD COLUMN IF NOT EXISTS kanji TEXT, -- Separate kanji nếu có
ADD COLUMN IF NOT EXISTS part_of_speech JapanesePartOfSpeech,
ADD COLUMN IF NOT EXISTS word_jlpt_level VARCHAR(5), -- JLPT level của từ này
ADD COLUMN IF NOT EXISTS meanings JSONB DEFAULT '[]'::jsonb, -- Structured meanings với examples

-- AI Integration fields
ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS source_document_id UUID REFERENCES file_assets(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS generation_method FlashcardGenerationMethod DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS generation_metadata JSONB DEFAULT '{}'::jsonb,

-- Improved SRS tracking
ADD COLUMN IF NOT EXISTS last_review_date DATE, -- Last time ANY user reviewed
ADD COLUMN IF NOT EXISTS times_studied INTEGER DEFAULT 0, -- Global study count

-- Card metadata
ADD COLUMN IF NOT EXISTS notes TEXT, -- User notes
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;

COMMENT ON COLUMN flashcards.furigana IS 'Phiên âm kanji (ひらがな)';
COMMENT ON COLUMN flashcards.kanji IS 'Kanji riêng (nếu từ có kanji)';
COMMENT ON COLUMN flashcards.part_of_speech IS 'Loại từ tiếng Nhật';
COMMENT ON COLUMN flashcards.word_jlpt_level IS 'JLPT level của từ này (N5-N1)';
COMMENT ON COLUMN flashcards.meanings IS 'Structured meanings: [{"meaning": "...", "examples": [...]}]';
COMMENT ON COLUMN flashcards.ai_generated IS 'Flag: card được AI tạo';
COMMENT ON COLUMN flashcards.source_document_id IS 'Reference đến document tạo ra card';
COMMENT ON COLUMN flashcards.generation_method IS 'Cách card được tạo';
COMMENT ON COLUMN flashcards.generation_metadata IS 'AI metadata: prompt, confidence, context, etc.';

-- Indexes cho performance
CREATE INDEX IF NOT EXISTS idx_flashcards_next_review_date ON flashcards(next_review_date) WHERE next_review_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_flashcards_ai_generated ON flashcards(ai_generated) WHERE ai_generated = true;
CREATE INDEX IF NOT EXISTS idx_flashcards_word_jlpt_level ON flashcards(word_jlpt_level) WHERE word_jlpt_level IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_flashcards_source_document ON flashcards(source_document_id) WHERE source_document_id IS NOT NULL;


-- ============================================
-- 4. FLASHCARD USER PROGRESS (NEW)
-- ============================================
-- Track progress của mỗi user cho mỗi card
-- Quan trọng: SRS algorithm cần track per-user, không phải global

CREATE TABLE IF NOT EXISTS flashcard_user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  flashcard_id UUID NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
  
  -- Card State (Anki-like)
  state FlashcardState DEFAULT 'new',
  
  -- SRS Algorithm fields (per-user)
  current_interval INTEGER DEFAULT 0, -- Days until next review
  ease_factor DECIMAL(4,2) DEFAULT 2.50, -- Personal ease factor
  last_reviewed_at TIMESTAMP, -- Last time THIS user reviewed
  next_review_date DATE, -- Next review date for THIS user
  
  -- Review statistics (per-user)
  times_reviewed INTEGER DEFAULT 0,
  times_correct INTEGER DEFAULT 0,
  times_incorrect INTEGER DEFAULT 0,
  consecutive_correct INTEGER DEFAULT 0, -- Streak
  
  -- Daily limits
  reviewed_today INTEGER DEFAULT 0, -- Count reviews today
  last_review_date DATE, -- Track which day
  
  -- Performance metrics
  average_response_time INTEGER DEFAULT 0, -- milliseconds
  last_response_time INTEGER, -- Last review time
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id, flashcard_id)
);

COMMENT ON TABLE flashcard_user_progress IS 'Per-user progress tracking cho mỗi flashcard - cần thiết cho SRS';
COMMENT ON COLUMN flashcard_user_progress.state IS 'Card state: new, learning, review, relearning';
COMMENT ON COLUMN flashcard_user_progress.current_interval IS 'Số ngày đến review tiếp theo';
COMMENT ON COLUMN flashcard_user_progress.ease_factor IS 'Ease factor cá nhân (SM-2 algorithm)';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_flashcard_user_progress_user ON flashcard_user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_user_progress_card ON flashcard_user_progress(flashcard_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_user_progress_next_review ON flashcard_user_progress(user_id, next_review_date) WHERE next_review_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_flashcard_user_progress_state ON flashcard_user_progress(user_id, state) WHERE state != 'new';


-- ============================================
-- 5. FLASHCARD REVIEW (NEW)
-- ============================================
-- Track mỗi lần review một card - lịch sử đầy đủ

CREATE TABLE IF NOT EXISTS flashcard_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  flashcard_id UUID NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
  session_id UUID, -- Optional: link to review session
  deck_id UUID NOT NULL REFERENCES flashcard_decks(id) ON DELETE CASCADE,
  
  -- Review result
  quality ReviewQuality NOT NULL, -- 0=Again, 1=Hard, 2=Good, 3-4=Easy
  time_spent INTEGER DEFAULT 0, -- milliseconds
  
  -- SRS calculation (before review)
  previous_interval INTEGER,
  previous_ease_factor DECIMAL(4,2),
  previous_state FlashcardState,
  
  -- SRS calculation (after review)
  new_interval INTEGER,
  new_ease_factor DECIMAL(4,2),
  new_state FlashcardState,
  new_next_review_date DATE,
  
  -- Review metadata
  review_date TIMESTAMP DEFAULT NOW(),
  user_answer TEXT, -- Optional: user's answer (nếu có)
  was_correct BOOLEAN GENERATED ALWAYS AS (quality != '0') STORED,
  
  -- Analytics
  device_type VARCHAR(50), -- web, mobile, etc.
  review_duration INTEGER, -- seconds
  
  created_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE flashcard_reviews IS 'Lịch sử review của mỗi card - cho analytics và SRS tracking';
COMMENT ON COLUMN flashcard_reviews.quality IS 'Anki rating: 0=Again, 1=Hard, 2=Good, 3-4=Easy';
COMMENT ON COLUMN flashcard_reviews.session_id IS 'Link to FlashcardReviewSession (optional)';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_flashcard_reviews_user ON flashcard_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_reviews_card ON flashcard_reviews(flashcard_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_reviews_session ON flashcard_reviews(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_flashcard_reviews_deck ON flashcard_reviews(deck_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_reviews_date ON flashcard_reviews(review_date);


-- ============================================
-- 6. FLASHCARD REVIEW SESSION (NEW)
-- ============================================
-- Track mỗi session học của user

CREATE TABLE IF NOT EXISTS flashcard_review_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  deck_id UUID NOT NULL REFERENCES flashcard_decks(id) ON DELETE CASCADE,
  
  -- Session tracking
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  duration_seconds INTEGER DEFAULT 0,
  
  -- Statistics
  total_cards INTEGER DEFAULT 0,
  new_cards INTEGER DEFAULT 0,
  learning_cards INTEGER DEFAULT 0,
  review_cards INTEGER DEFAULT 0,
  
  correct_count INTEGER DEFAULT 0,
  incorrect_count INTEGER DEFAULT 0,
  hard_count INTEGER DEFAULT 0,
  easy_count INTEGER DEFAULT 0,
  
  -- Performance
  average_response_time INTEGER DEFAULT 0, -- milliseconds
  mastery_score DECIMAL(5,2), -- Percentage correct
  
  -- Metadata
  device_type VARCHAR(50),
  study_mode VARCHAR(50), -- normal, cram, etc.
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE flashcard_review_sessions IS 'Track mỗi session học flashcard - cho analytics';
COMMENT ON COLUMN flashcard_review_sessions.total_cards IS 'Tổng số cards reviewed trong session';
COMMENT ON COLUMN flashcard_review_sessions.mastery_score IS 'Tỷ lệ đúng (0-100)';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_flashcard_review_sessions_user ON flashcard_review_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_review_sessions_deck ON flashcard_review_sessions(deck_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_review_sessions_started ON flashcard_review_sessions(started_at);


-- ============================================
-- 7. UPDATE EXISTING FLASHCARD RELATIONS
-- ============================================

-- Add relations from User
ALTER TABLE users
ADD COLUMN IF NOT EXISTS flashcard_user_progress_count INTEGER DEFAULT 0;

-- Note: Prisma sẽ tự động tạo relations khi generate client


-- ============================================
-- 8. HELPER FUNCTIONS & TRIGGERS
-- ============================================

-- Function: Update deck stats khi review
CREATE OR REPLACE FUNCTION update_flashcard_deck_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update deck's last_studied_at
  UPDATE flashcard_decks
  SET last_studied_at = NOW(),
      total_study_time = total_study_time + COALESCE(NEW.duration_seconds, 0)
  WHERE id = NEW.deck_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_deck_stats_on_session
AFTER INSERT OR UPDATE ON flashcard_review_sessions
FOR EACH ROW
EXECUTE FUNCTION update_flashcard_deck_stats();

-- Function: Reset daily review count
CREATE OR REPLACE FUNCTION reset_daily_review_counts()
RETURNS void AS $$
BEGIN
  UPDATE flashcard_user_progress
  SET reviewed_today = 0,
      last_review_date = CURRENT_DATE
  WHERE last_review_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Schedule: Reset daily counts (chạy mỗi ngày lúc 0h)
-- Note: Cần setup cron job hoặc scheduled task
-- SELECT cron.schedule('reset-flashcard-daily-counts', '0 0 * * *', 'SELECT reset_daily_review_counts()');


-- ============================================
-- 9. MIGRATION NOTES
-- ============================================

-- Khi migrate:
-- 1. Tạo FlashcardUserProgress cho tất cả existing users và cards
-- 2. Initialize state = 'new' cho cards chưa được review
-- 3. Set next_review_date = NULL cho new cards
-- 4. Migrate existing review data nếu có sang FlashcardReview table
-- 5. Update FlashcardDeck stats từ existing data

-- Migration script example:
/*
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
*/


-- ============================================
-- 10. INDEXES SUMMARY
-- ============================================

-- Performance-critical indexes:
-- ✅ flashcard_user_progress(user_id, next_review_date) - Get cards due
-- ✅ flashcard_user_progress(user_id, state) - Filter by state
-- ✅ flashcard_reviews(user_id, review_date) - Analytics queries
-- ✅ flashcard_review_sessions(user_id, started_at) - Recent sessions
-- ✅ flashcards(next_review_date) - Due cards query (global)

