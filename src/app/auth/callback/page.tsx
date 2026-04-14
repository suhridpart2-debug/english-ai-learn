"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Loader2 } from "lucide-react";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParams = searchParams.get("redirect") || "/dashboard";

  useEffect(() => {
    const handleAuthCallback = async () => {
      console.log("AuthCallback: Checking initial session...");
      
      // 1. Check current session immediately
      const { data: { session }, error: initialError } = await supabase.auth.getSession();
      
      if (session) {
        console.log("AuthCallback: Session found immediately for", session.user.email);
        await processAuthenticatedSession(session);
        return;
      }

      if (initialError) {
        console.error("AuthCallback: Initial session check error", initialError);
      }

      // 2. Setup listener for fragment-based login (OAuth)
      // Some browsers/environments take a moment to parse the fragment
      console.log("AuthCallback: No immediate session, setting up listener...");
      
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log("AuthCallback: Auth state change event:", event);
        
        if (event === 'SIGNED_IN' && session) {
          console.log("AuthCallback: SIGNED_IN event received for", session.user.email);
          subscription.unsubscribe();
          await processAuthenticatedSession(session);
        } else if (event === 'INITIAL_SESSION' && !session) {
          // If we still have no session after initial check and fragment would have been processed
          console.log("AuthCallback: INITIAL_SESSION event with no session. Fallback to timeout.");
        }
      });

      // 3. Fallback timeout to prevent infinite loading if auth truly failed
      const timeoutToken = setTimeout(() => {
        console.log("AuthCallback: Auth timeout reached, redirecting to login.");
        subscription.unsubscribe();
        router.replace("/auth/login");
      }, 5000);

      return () => {
        subscription.unsubscribe();
        clearTimeout(timeoutToken);
      };
    };

    const processAuthenticatedSession = async (session: any) => {
      try {
        console.log("AuthCallback: Processing profile for", session.user.id);
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', session.user.id)
          .single();
        
        if (!profile) {
          console.log("AuthCallback: Creating new profile...");
          await supabase.from('profiles').upsert({
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || "Student",
            level: "Beginner",
            goal: "General Fluency",
            native_language: "English",
            daily_time: 15
          });

          await supabase.from('streaks').upsert({
            user_id: session.user.id,
            current_streak: 0,
            longest_streak: 0,
            total_sessions: 0
          });
        }
        
        console.log("AuthCallback: Redirecting to", redirectParams);
        router.replace(redirectParams);
      } catch (err) {
        console.error("AuthCallback: Error processing profile", err);
        router.replace(redirectParams); // Proceed anyway to dashboard as session is valid
      }
    };

    handleAuthCallback();
  }, [router, redirectParams]);

  return (
    <div className="text-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-4" />
      <p className="text-slate-500">Signing you in...</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <Suspense fallback={<Loader2 className="w-8 h-8 animate-spin text-primary-500" />}>
        <AuthCallbackContent />
      </Suspense>
    </div>
  );
}
