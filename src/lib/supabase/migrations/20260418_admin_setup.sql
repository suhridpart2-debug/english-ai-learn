-- Step 1: Add is_admin column to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Step 2: Enable RLS remains active, but we add Admin policies

-- Profiles: Admins can do everything
CREATE POLICY "Admins can view all profiles" ON profiles
FOR SELECT USING (
  (SELECT is_admin FROM profiles WHERE id = auth.uid()) = TRUE
);

CREATE POLICY "Admins can update all profiles" ON profiles
FOR UPDATE USING (
  (SELECT is_admin FROM profiles WHERE id = auth.uid()) = TRUE
);

-- Daily Usage: Admins can view all usage
CREATE POLICY "Admins can view all daily usage" ON daily_usage
FOR SELECT USING (
  (SELECT is_admin FROM profiles WHERE id = auth.uid()) = TRUE
);

-- Payment History: Admins can view all payments
CREATE POLICY "Admins can view all payment history" ON payment_history
FOR SELECT USING (
  (SELECT is_admin FROM profiles WHERE id = auth.uid()) = TRUE
);

-- Sessions: Admins can view all sessions
CREATE POLICY "Admins can view all sessions" ON sessions
FOR SELECT USING (
  (SELECT is_admin FROM profiles WHERE id = auth.uid()) = TRUE
);

-- Scores: Admins can view all scores
CREATE POLICY "Admins can view all scores" ON scores
FOR SELECT USING (
  (SELECT is_admin FROM profiles WHERE id = auth.uid()) = TRUE
);

-- Mistakes: Admins can view all mistakes
CREATE POLICY "Admins can view all mistakes" ON mistakes
FOR SELECT USING (
  (SELECT is_admin FROM profiles WHERE id = auth.uid()) = TRUE
);

-- Vocabulary: Admins can view all vocabulary
CREATE POLICY "Admins can view all vocabulary" ON vocabulary
FOR SELECT USING (
  (SELECT is_admin FROM profiles WHERE id = auth.uid()) = TRUE
);

-- Admin View for users
-- This makes it easier to fetch all users without complex joins for stats
CREATE OR REPLACE VIEW admin_users_view AS
SELECT 
  p.id,
  p.name,
  p.level,
  p.goal,
  p.native_language,
  p.daily_time,
  p.plan,
  p.subscription_status,
  p.subscription_start_date,
  p.subscription_end_date,
  p.is_admin,
  p.created_at,
  p.updated_at,
  u.email,
  u.last_sign_in_at
FROM profiles p
JOIN auth.users u ON p.id = u.id;

-- Grant access to the view
GRANT SELECT ON admin_users_view TO authenticated;
GRANT SELECT ON admin_users_view TO service_role;
