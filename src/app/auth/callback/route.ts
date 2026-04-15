import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in search params, use it as the redirect URL
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && session) {
      // Profile creation logic
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', session.user.id)
        .single()
      
      if (!profile) {
        console.log("AuthCallback: Creating new profile for", session.user.id)
        
        // Create profile - use UPSERT to avoid race conditions
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: session.user.id,
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || "Student",
          level: "Beginner",
          goal: "General Fluency",
          native_language: "English",
          daily_time: 15,
          updated_at: new Date().toISOString()
        })

        if (profileError) {
          console.error("AuthCallback: Profile creation error:", profileError)
        }

        // Initialize streaks
        const { error: streakError } = await supabase.from('streaks').upsert({
          user_id: session.user.id,
          current_streak: 0,
          longest_streak: 0,
          total_sessions: 0,
          last_active_date: new Date().toISOString()
        })

        if (streakError) {
          console.error("AuthCallback: Streak initialization error:", streakError)
        }
      }

      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalDevice = origin.includes('localhost')
      
      // Build final redirect URL
      let redirectUrl = `${origin}${next}`
      if (!isLocalDevice && forwardedHost) {
        redirectUrl = `https://${forwardedHost}${next}`
      }

      // Re-create a fresh response to ensure cookies are carrying through correctly
      const response = NextResponse.redirect(redirectUrl)
      
      // IMPORTANT: In Next.js App Router, the middleware handles cookie syncing, 
      // but sometimes a direct redirect is faster. We just need to make sure the response object is clean.
      
      return response
    } else {
      console.error("AuthCallback: Error exchanging code for session:", error)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`)
}
