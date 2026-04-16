-- Migration: Add Trusted Source Metadata to daily_videos
-- Date: 2026-04-16

-- 1. Add columns for channel metadata and trusted source tracking
ALTER TABLE daily_videos 
ADD COLUMN IF NOT EXISTS channel_name TEXT,
ADD COLUMN IF NOT EXISTS is_from_trusted_source BOOLEAN DEFAULT FALSE;

-- 2. Add index for trusted source filtering
CREATE INDEX IF NOT EXISTS idx_daily_videos_trusted_source 
ON daily_videos (is_from_trusted_source) 
WHERE is_from_trusted_source = TRUE;

-- 3. Update existing records with a default value if needed (optional)
-- UPDATE daily_videos SET channel_name = 'Educational Channel' WHERE channel_name IS NULL;
