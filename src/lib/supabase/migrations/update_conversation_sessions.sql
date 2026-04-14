-- SQL Migration: Add columns for Guided Mode and Duration Support
-- Run this in the Supabase SQL Editor

ALTER TABLE conversation_sessions 
ADD COLUMN IF NOT EXISTS mode VARCHAR(20) DEFAULT 'free' CHECK (mode IN ('free', 'guided')),
ADD COLUMN IF NOT EXISTS target_duration_minutes INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS scenario_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS scenario_title TEXT;

-- Index for searching scenario sessions
CREATE INDEX IF NOT EXISTS idx_conversation_sessions_mode ON conversation_sessions(mode);
