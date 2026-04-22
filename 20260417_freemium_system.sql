-- Freemium & Subscription System Migration
-- Run this in Supabase SQL Editor

-- 1. Daily Usage tracking table
CREATE TABLE IF NOT EXISTS daily_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  vocab_adds INT DEFAULT 0,
  ai_messages INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, usage_date)
);

-- 2. RLS for Daily Usage
ALTER TABLE daily_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own daily usage" 
ON daily_usage FOR SELECT 
USING (auth.uid() = user_id);

-- 3. Atomic Increment RPC
-- This handles upserting and incrementing in one call to prevent race conditions
CREATE OR REPLACE FUNCTION increment_usage_v2(
  u_id UUID, 
  u_date DATE, 
  u_col TEXT
) RETURNS VOID AS $$
BEGIN
  INSERT INTO daily_usage (user_id, usage_date, vocab_adds, ai_messages)
  VALUES (u_id, u_date, 
    CASE WHEN u_col = 'vocab_adds' THEN 1 ELSE 0 END,
    CASE WHEN u_col = 'ai_messages' THEN 1 ELSE 0 END
  )
  ON CONFLICT (user_id, usage_date)
  DO UPDATE SET
    vocab_adds = CASE WHEN u_col = 'vocab_adds' THEN daily_usage.vocab_adds + 1 ELSE daily_usage.vocab_adds END,
    ai_messages = CASE WHEN u_col = 'ai_messages' THEN daily_usage.ai_messages + 1 ELSE daily_usage.ai_messages END,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Subscription fields in Profiles (ensuring they exist)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS razorpay_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS razorpay_customer_id TEXT;

-- 5. Index for usage lookup performance
CREATE INDEX IF NOT EXISTS idx_daily_usage_user_date ON daily_usage(user_id, usage_date);
