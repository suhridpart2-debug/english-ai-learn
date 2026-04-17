-- Migration: Add Dynamic Question Engine Support
ALTER TABLE interview_question_bank
ADD COLUMN IF NOT EXISTS is_dynamic BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS last_refreshed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update source_type categorization
-- Values: 'seeded', 'trend_based', 'ai_generated', 'reported_pattern'
-- We keep any existing data as 'seeded' if not already set.
UPDATE interview_question_bank 
SET source_type = 'seeded' 
WHERE source_type IS NULL OR source_type = 'Curated';

UPDATE interview_question_bank 
SET source_type = 'trend_based' 
WHERE source_type = 'Trend-based';

UPDATE interview_question_bank 
SET source_type = 'ai_generated' 
WHERE source_type = 'AI-generated';
