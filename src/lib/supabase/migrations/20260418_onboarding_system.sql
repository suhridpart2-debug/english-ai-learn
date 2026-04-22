-- Migration: Add onboarding and profile sync fields
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS provider TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS english_level TEXT;

-- Update existing profiles to mark onboarding as completed (assumption for existing users)
UPDATE profiles SET onboarding_completed = TRUE WHERE onboarding_completed IS NULL;

-- Ensure RLS is updated for new columns
-- (Standard RLS on profiles usually covers all columns)
