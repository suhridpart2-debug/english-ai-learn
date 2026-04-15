-- SpeakAI v2.0 Upgrade Migration
-- Run this in the Supabase SQL Editor

-- 1. CONTENT ROTATION SYSTEM
CREATE TABLE IF NOT EXISTS public.content_refresh_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    last_refresh_at TIMESTAMPTZ DEFAULT NOW(),
    cycle_index INTEGER DEFAULT 0, -- Increments every 4 hours
    status TEXT DEFAULT 'active'
);

-- Ensure there is always exactly one record for global state
INSERT INTO public.content_refresh_cycles (cycle_index)
SELECT 0 WHERE NOT EXISTS (SELECT 1 FROM public.content_refresh_cycles);

CREATE TABLE IF NOT EXISTS public.rotated_vocabulary_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cycle_index INTEGER NOT NULL,
    word_ids TEXT[] NOT NULL, -- Array of IDs from the static VOCABULARY_DATA
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(cycle_index)
);

CREATE TABLE IF NOT EXISTS public.rotated_video_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cycle_index INTEGER NOT NULL,
    video_ids UUID[] NOT NULL, -- Array of UUIDs from the static DAILY_VIDEOS
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(cycle_index)
);

-- 2. READ ALOUD PRONUNCIATION COACH
CREATE TABLE IF NOT EXISTS public.read_aloud_passages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    difficulty TEXT DEFAULT 'Intermediate', -- Beginner, Intermediate, Advanced
    topic TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analysis-only session table (no raw audio)
CREATE TABLE IF NOT EXISTS public.read_aloud_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    passage_id UUID NOT NULL REFERENCES public.read_aloud_passages(id) ON DELETE CASCADE,
    recognized_text TEXT, -- The STT output
    score_accuracy INTEGER, -- 0-100
    mistakes JSONB DEFAULT '[]', -- Array of {word, type: 'missing'|'wrong'|'weak', expected: string, spoken: string}
    ai_feedback TEXT, -- The dynamic Hinglish feedback
    is_retry BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.weak_pronunciation_words (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    word TEXT NOT NULL,
    mistake_count INTEGER DEFAULT 1,
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, word)
);

-- 3. SECURITY & RLS

ALTER TABLE public.content_refresh_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rotated_vocabulary_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rotated_video_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.read_aloud_passages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.read_aloud_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weak_pronunciation_words ENABLE ROW LEVEL SECURITY;

-- Global/Public Reading (Accessible by all users)
CREATE POLICY "Anyone can view refresh cycles" ON public.content_refresh_cycles FOR SELECT USING (true);
CREATE POLICY "Anyone can view rotated vocab" ON public.rotated_vocabulary_sets FOR SELECT USING (true);
CREATE POLICY "Anyone can view rotated videos" ON public.rotated_video_sets FOR SELECT USING (true);
CREATE POLICY "Anyone can view passages" ON public.read_aloud_passages FOR SELECT USING (true);

-- User-Specific Writing/Reading
CREATE POLICY "Users can manage their own read aloud sessions" ON public.read_aloud_sessions
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their weak pronunciation words" ON public.weak_pronunciation_words
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- SEED DATA for initial passages
INSERT INTO public.read_aloud_passages (title, content, difficulty, topic) 
VALUES 
('The Coffee Shop', 'I would like to order a large latte with oat milk, please. Do you have any fresh muffins today? I also need a receipt for my purchase.', 'Beginner', 'Daily Life'),
('Job Interview Intro', 'I have over five years of experience in project management. My primary focus is on team collaboration and delivering results on time. I am excited about the opportunity to contribute to your company.', 'Intermediate', 'Professional'),
('Climate Change', 'Scientific evidence shows that the global temperature has risen significantly over the last century. Reducing carbon emissions is critical to preserving our ecosystems and ensuring a sustainable future for the next generation.', 'Advanced', 'Environment');
