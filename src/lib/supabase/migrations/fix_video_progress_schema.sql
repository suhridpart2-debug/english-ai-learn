-- Fix video progress schema
-- Drop the foreign key constraint that is causing saves to fail
-- because daily_videos table might not be seeded (app uses static dailyVideos.ts)

ALTER TABLE IF EXISTS public.user_video_progress
  DROP CONSTRAINT IF EXISTS user_video_progress_video_id_fkey;

-- If video_id was UUID, we can alter it to TEXT to be safer, though UUID is fine.
-- Let's just leave it as UUID or change to TEXT. 
-- Wait, actually changing to TEXT requires drop/recreate or using cast.
ALTER TABLE IF EXISTS public.user_video_progress
  ALTER COLUMN video_id TYPE text USING video_id::text;

-- Ensure unique constraint exists
ALTER TABLE IF EXISTS public.user_video_progress
  DROP CONSTRAINT IF EXISTS user_video_progress_user_id_video_id_key;

ALTER TABLE IF EXISTS public.user_video_progress
  ADD CONSTRAINT user_video_progress_user_id_video_id_key UNIQUE (user_id, video_id);
