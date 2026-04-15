-- SpeakAI Production Polish Migration
-- Run this in the Supabase SQL Editor

-- 1. VOCABULARY PROGRESS & BOOKMARKS
CREATE TABLE IF NOT EXISTS public.saved_words (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    word_id TEXT NOT NULL, -- References the ID in VOCABULARY_DATA
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, word_id)
);

CREATE TABLE IF NOT EXISTS public.user_word_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    word_id TEXT NOT NULL,
    status TEXT DEFAULT 'familiar', -- 'familiar', 'learned', 'weak'
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    learned_at TIMESTAMPTZ,
    UNIQUE(user_id, word_id)
);

-- 2. VIDEO PROGRESS ENHANCEMENT (Ensuring columns exist)
-- Note: Table user_video_progress already exists from video_schema.sql
-- We just ensure it's utilized properly.

-- 3. CONTENT ROTATION TRACKING (Personalized)
CREATE TABLE IF NOT EXISTS public.user_rotation_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    last_vocab_rotation_at TIMESTAMPTZ DEFAULT NOW(),
    last_video_rotation_at TIMESTAMPTZ DEFAULT NOW(),
    current_vocab_ids TEXT[] DEFAULT '{}',
    current_video_ids UUID[] DEFAULT '{}',
    UNIQUE(user_id)
);

-- 4. SECURITY & RLS
ALTER TABLE public.saved_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_word_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_rotation_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their saved words" ON public.saved_words
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their word progress" ON public.user_word_progress
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their rotation state" ON public.user_rotation_state
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
