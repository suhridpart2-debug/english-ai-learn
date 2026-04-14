import { createClient } from './supabase/client'

// This file is kept for backward compatibility with existing components
// It now uses the @supabase/ssr browser client to ensure session consistency
export const supabase = createClient()