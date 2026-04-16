import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Admin Client
 * 
 * WARNING: This client uses the SERVICE_ROLE_KEY and bypasses RLS.
 * It must ONLY be used in server-side code (API routes, cron jobs) and
 * NEVER exposed to the client or used in browser components.
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
