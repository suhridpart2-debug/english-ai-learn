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
      // Profile creation logic moved from client-side callback page
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', session.user.id)
        .single()
      
      if (!profile) {
        console.log("AuthCallback: Creating new profile for", session.user.id)
        
        // Create profile
        await supabase.from('profiles').upsert({
          id: session.user.id,
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || "Student",
          level: "Beginner",
          goal: "General Fluency",
          native_language: "English",
          daily_time: 15
        })

        // Initialize streaks
        await supabase.from('streaks').upsert({
          user_id: session.user.id,
          current_streak: 0,
          longest_streak: 0,
          total_sessions: 0
        })
      }

      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalDevice = origin.includes('localhost')
      
      if (isLocalDevice) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    } else {
      console.error("AuthCallback: Error exchanging code for session:", error)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`)
}
