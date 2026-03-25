-- Add streak toast gating field for GV2
ALTER TABLE IF EXISTS game_profiles
ADD COLUMN IF NOT EXISTS last_toast_shown_date VARCHAR(10);

