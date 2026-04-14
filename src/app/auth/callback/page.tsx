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
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (session) {
        // Init profile for Google users if needed
        const { data: profile } = await supabase.from('profiles').select('id').eq('id', session.user.id).single();
        
        if (!profile) {
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
        
        router.replace(redirectParams);
      } else {
        console.error("Auth error", error);
        router.replace("/auth/login");
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
