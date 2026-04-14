-- Run this SQL in your Supabase SQL Editor to set up the Vocabulary module.

-- 1. Create table for saved words (Wordbook)
CREATE TABLE IF NOT EXISTS public.saved_words (
    id UUID DEFAULT auth.uid() PRIMARY KEY, -- We'll use a composite if we need multiple, but let's use a standard auto-incrementing ID
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    word_id TEXT NOT NULL,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    
    -- Ensure a user can only save a specific word once
    UNIQUE(user_id, word_id)
);

-- Note: Fixing the primary key to be a proper UUID instead of auth.uid() above.
DROP TABLE IF EXISTS public.saved_words;
CREATE TABLE public.saved_words (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    word_id TEXT NOT NULL,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    UNIQUE(user_id, word_id)
);

-- 2. Create table for vocabulary progress
CREATE TABLE IF NOT EXISTS public.vocabulary_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    topic_slug TEXT NOT NULL,
    words_learned TEXT[] DEFAULT '{}', -- Array of word_ids
    completed BOOLEAN DEFAULT false,
    last_studied TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    
    UNIQUE(user_id, topic_slug)
);

-- 3. Create table for weak words
CREATE TABLE IF NOT EXISTS public.weak_words (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    word_id TEXT NOT NULL,
    mistake_count INTEGER DEFAULT 1,
    last_revised TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    
    UNIQUE(user_id, word_id)
);

-- Enable RLS
ALTER TABLE public.saved_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocabulary_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weak_words ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own saved words" 
ON public.saved_words FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved words" 
ON public.saved_words FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved words" 
ON public.saved_words FOR DELETE USING (auth.uid() = user_id);

-- 
CREATE POLICY "Users can view their own progress" 
ON public.vocabulary_progress FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" 
ON public.vocabulary_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" 
ON public.vocabulary_progress FOR UPDATE USING (auth.uid() = user_id);

--
CREATE POLICY "Users can view their weak words" 
ON public.weak_words FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their weak words" 
ON public.weak_words FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their weak words" 
ON public.weak_words FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their weak words" 
ON public.weak_words FOR DELETE USING (auth.uid() = user_id);

-- Optional: Function to update vocabulary progress easily via RPC, though direct update works too.
