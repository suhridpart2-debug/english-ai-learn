-- Migration: Add Quality Control Column to daily_videos
-- Date: 2026-04-16

-- 1. Add is_valid column to filter out broken or irrelevant content
ALTER TABLE daily_videos 
ADD COLUMN IF NOT EXISTS is_valid BOOLEAN DEFAULT TRUE;

-- 2. Add index for fast filtering of valid records
CREATE INDEX IF NOT EXISTS idx_daily_videos_is_valid 
ON daily_videos (is_valid) 
WHERE is_valid = TRUE;

-- 3. Mark existing videos without key fields as invalid (initial cleanup)
UPDATE daily_videos 
SET is_valid = FALSE 
WHERE youtube_id IS NULL 
   OR title IS NULL 
   OR thumbnail_url IS NULL;
