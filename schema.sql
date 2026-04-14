-- schema.sql
-- Instructions: Go to https://supabase.com/dashboard, open your project, 
-- click on "SQL Editor" on the left sidebar, paste this entire file, and click "Run".

-- 1. Profiles Table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  level TEXT NOT NULL,
  goal TEXT NOT NULL,
  native_language TEXT DEFAULT 'Hindi',
  daily_time INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Streaks Table (Track user consistency)
CREATE TABLE streaks (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_active_date TIMESTAMPTZ DEFAULT NULL,
  total_sessions INT DEFAULT 0
);

-- 3. Sessions Table (Captures high-level info of a practice session)
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mode TEXT NOT NULL,          -- e.g., '60-Second Challenge'
  topic TEXT NOT NULL,         -- e.g., 'Describe a journey'
  duration_seconds INT NOT NULL,
  transcript TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Scores Table (Holds specific grades for a session)
CREATE TABLE scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  grammar INT NOT NULL,
  fluency INT NOT NULL,
  pronunciation INT NOT NULL,
  fillers_used INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Mistakes Table (Granular feedback per session)
CREATE TABLE mistakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  original TEXT NOT NULL,
  correction TEXT NOT NULL,
  explanation TEXT NOT NULL,
  hinglish_explanation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Vocabulary Table (To track words learned/targeted)
CREATE TABLE vocabulary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  status TEXT DEFAULT 'learning', -- e.g., 'learning', 'mastered'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Roadmaps Table (To save AI generated custom curriculums)
CREATE TABLE roadmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_plan JSONB NOT NULL,    -- Stores array of tasks
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SECURITY: Enable Row Level Security (RLS) on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE mistakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;

-- POLICIES: Users can only select/insert/update their own data
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own streak" ON streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own streak" ON streaks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own streak" ON streaks FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own sessions" ON sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON sessions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own scores" ON scores FOR SELECT USING (
  EXISTS (SELECT 1 FROM sessions WHERE sessions.id = scores.session_id AND sessions.user_id = auth.uid())
);
CREATE POLICY "Users can insert own scores" ON scores FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM sessions WHERE sessions.id = scores.session_id AND sessions.user_id = auth.uid())
);

CREATE POLICY "Users can view own mistakes" ON mistakes FOR SELECT USING (
  EXISTS (SELECT 1 FROM sessions WHERE sessions.id = mistakes.session_id AND sessions.user_id = auth.uid())
);
CREATE POLICY "Users can insert own mistakes" ON mistakes FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM sessions WHERE sessions.id = mistakes.session_id AND sessions.user_id = auth.uid())
);

CREATE POLICY "Users can view own vocabulary" ON vocabulary FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own vocabulary" ON vocabulary FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own vocabulary" ON vocabulary FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own roadmaps" ON roadmaps FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own roadmaps" ON roadmaps FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own roadmaps" ON roadmaps FOR UPDATE USING (auth.uid() = user_id);
