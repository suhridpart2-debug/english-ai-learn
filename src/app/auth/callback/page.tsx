"use client";
import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get("code");
        const next = searchParams.get("next") || "/dashboard";

        if (!code) {
          console.error("No code found in callback URL");
          router.replace("/auth/login?error=missing_code");
          return;
        }

        const { data: { session }, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError || !session) {
          console.error("OAuth callback exchange error:", exchangeError?.message);
          router.replace("/auth/login?error=oauth_callback_failed");
          return;
        }

        const user = session.user;
        const metadata = user.user_metadata;

        // Check if profile exists and onboarding is completed
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single();

        // REDIRECTION LOGIC:
        // 1. If profile doesn't exist OR onboarding_completed is false => Go to /onboarding
        // 2. Otherwise => Go to /dashboard (or 'next' param)
        
        if (profileError || !profile || !profile.onboarding_completed) {
          console.log("[AuthCallback] Onboarding incomplete, redirecting to /onboarding");
          
          // Optionally sync basic data to profiles if it doesn't exist yet
          if (profileError && profileError.code === 'PGRST116') { // Profile not found
            const displayName = metadata.full_name || metadata.name || "Student";
            await supabase.from('profiles').insert({
              id: user.id,
              name: displayName, // Legacy field
              full_name: displayName, // New required field
              email: user.email,
              provider: user.app_metadata.provider,
              level: 'beginner', // Legacy field
              english_level: 'beginner', // New required field
              goal: 'fluency',
              daily_time: 15,
              onboarding_completed: false
            });
          }

          router.replace("/onboarding");
          return;
        }

        console.log("[AuthCallback] Returning user, redirecting to:", next);
        router.replace(next);
      } catch (err) {
        console.error("Unexpected callback error:", err);
        router.replace("/auth/login?error=unexpected_callback_error");
      }
    };

    handleCallback();
  }, [router, searchParams, supabase]);

  return (
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Completing secure sign-in...
      </p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <Suspense fallback={
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-sm text-slate-600">Loading secure tunnel...</p>
        </div>
      }>
        <CallbackHandler />
      </Suspense>
    </div>
  );
}