-- Migration: create lessons table

CREATE TABLE IF NOT EXISTS "lessons" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES "modules"(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('video', 'article', 'quiz', 'assignment')),
  video_url TEXT,
  video_duration INTEGER,
  article_content TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_preview BOOLEAN DEFAULT FALSE,
  is_unlocked BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  UNIQUE(module_id, order_index)
);

CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON "lessons" (module_id);
