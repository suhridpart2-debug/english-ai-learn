-- Run this SQL in your Supabase SQL Editor to set up the Grammar Learning module.

-- 1. Create table for grammar_progress (To track topic completion)
CREATE TABLE IF NOT EXISTS public.grammar_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    topic_slug TEXT NOT NULL,
    status TEXT DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed'
    last_studied TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    
    UNIQUE(user_id, topic_slug)
);

-- 2. Create table for grammar_attempts (To track user quiz attempts for analytics & history)
CREATE TABLE IF NOT EXISTS public.grammar_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    topic_slug TEXT NOT NULL,
    score NUMERIC NOT NULL,
    total_questions INTEGER NOT NULL,
    attempt_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 3. Create table for weak_grammar_areas (To track recommendations and mistake frequencies)
CREATE TABLE IF NOT EXISTS public.weak_grammar_areas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    topic_slug TEXT NOT NULL,
    mistake_count INTEGER DEFAULT 1,
    last_mistake_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    
    UNIQUE(user_id, topic_slug)
);

-- Enable RLS
ALTER TABLE public.grammar_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grammar_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weak_grammar_areas ENABLE ROW LEVEL SECURITY;

-- Policies for grammar_progress
CREATE POLICY "Users can view their own grammar progress" 
ON public.grammar_progress FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own grammar progress" 
ON public.grammar_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own grammar progress" 
ON public.grammar_progress FOR UPDATE USING (auth.uid() = user_id);

-- Policies for grammar_attempts
CREATE POLICY "Users can view their own grammar attempts" 
ON public.grammar_attempts FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own grammar attempts" 
ON public.grammar_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for weak_grammar_areas
CREATE POLICY "Users can view their own weak grammar areas" 
ON public.weak_grammar_areas FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own weak grammar areas" 
ON public.weak_grammar_areas FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weak grammar areas" 
ON public.weak_grammar_areas FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own weak grammar areas" 
ON public.weak_grammar_areas FOR DELETE USING (auth.uid() = user_id);
