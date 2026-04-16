-- Migration: Add Featured Rotation Columns to daily_videos
-- Date: 2026-04-16

-- 1. Add columns for daily featured rotation
ALTER TABLE daily_videos 
ADD COLUMN IF NOT EXISTS is_featured_today BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS featured_date DATE;

-- 2. Add index for fast lookup of featured videos
CREATE INDEX IF NOT EXISTS idx_daily_videos_featured_date 
ON daily_videos (featured_date) 
WHERE is_featured_today = TRUE;

-- 3. Add index on created_at for efficient candidate selection
CREATE INDEX IF NOT EXISTS idx_daily_videos_created_at 
ON daily_videos (created_at DESC);

-- SQL Verification Query (to be run manually if needed):
-- SELECT id, title, is_featured_today, featured_date FROM daily_videos WHERE is_featured_today = TRUE;
