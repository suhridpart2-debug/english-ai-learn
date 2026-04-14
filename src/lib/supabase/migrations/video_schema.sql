-- Daily English Videos Feature Schema

-- 1. Library of all available videos
CREATE TABLE daily_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  youtube_id TEXT NOT NULL,
  category TEXT NOT NULL, -- e.g., 'Conversation', 'Pronunciation', 'Business'
  difficulty TEXT NOT NULL, -- 'Beginner', 'Intermediate', 'Advanced'
  summary TEXT,
  vocabulary JSONB DEFAULT '[]', -- Array of {word, meaning, example}
  key_phrases JSONB DEFAULT '[]', -- Array of {phrase, context}
  transcript JSONB DEFAULT '[]', -- Array of {start, end, text}
  thumbnail_url TEXT,
  duration_seconds INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Current active videos for rotation
-- Refreshes every 6 hours (calculated via window_index: 0, 1, 2, 3)
CREATE TABLE active_video_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  window_index INT NOT NULL, -- 0-3 for 6-hour slots
  video_ids UUID[] NOT NULL, -- Array of 3 video IDs from daily_videos
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, window_index)
);

-- 3. User Progress Tracking
CREATE TABLE user_video_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES daily_videos(id) ON DELETE CASCADE,
  watched BOOLEAN DEFAULT FALSE,
  saved BOOLEAN DEFAULT FALSE,
  last_watched_at TIMESTAMPTZ,
  progress_seconds INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

-- RLS Policies
ALTER TABLE daily_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_video_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_video_progress ENABLE ROW LEVEL SECURITY;

-- Everyone can view videos and active sessions
CREATE POLICY "Public videos are viewable by everyone" ON daily_videos FOR SELECT USING (true);
CREATE POLICY "Active sessions are viewable by everyone" ON active_video_sessions FOR SELECT USING (true);

-- Authenticated users can manage their own progress
CREATE POLICY "Users can manage own video progress" ON user_video_progress
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Seed initial videos (Example logic - I will add actual seed data in types/lib)
