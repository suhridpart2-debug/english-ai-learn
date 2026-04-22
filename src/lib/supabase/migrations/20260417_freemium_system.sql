-- SQL Migration for Freemium & Subscription System

-- 1. Update Profiles with Razorpay Subscription fields
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS razorpay_customer_id TEXT,
ADD COLUMN IF NOT EXISTS razorpay_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS razorpay_plan_id TEXT,
ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT FALSE;

-- 2. Daily Usage Tracking Table
CREATE TABLE IF NOT EXISTS daily_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    usage_date DATE DEFAULT CURRENT_DATE,
    vocab_adds INT DEFAULT 0,
    ai_messages INT DEFAULT 0,
    interviews_done INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, usage_date)
);

-- 3. RLS for daily_usage
ALTER TABLE daily_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage" ON daily_usage 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own usage" ON daily_usage 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can modify own usage" ON daily_usage 
FOR UPDATE USING (auth.uid() = user_id);

-- 4. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_usage_user_date ON daily_usage(user_id, usage_date);

-- 5. Atomic Increment Function (RPC)
CREATE OR REPLACE FUNCTION increment_usage(u_id UUID, u_date DATE, u_column TEXT)
RETURNS VOID AS $$
BEGIN
    EXECUTE format('INSERT INTO daily_usage (user_id, usage_date, %I) 
                    VALUES ($1, $2, 1) 
                    ON CONFLICT (user_id, usage_date) 
                    DO UPDATE SET %I = daily_usage.%I + 1, updated_at = NOW()', 
                    u_column, u_column, u_column)
    USING u_id, u_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
