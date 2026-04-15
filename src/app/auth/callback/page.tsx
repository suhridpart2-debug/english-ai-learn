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
        // We simplified the logic to always go to dashboard for production stability
        // but we can still check for a 'next' param if provided.
        const next = searchParams.get("next") || "/dashboard";

        if (!code) {
          console.error("No code found in callback URL");
          router.replace("/auth/login?error=missing_code");
          return;
        }

        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          console.error("OAuth callback exchange error:", error.message);
          router.replace("/auth/login?error=oauth_callback_failed");
          return;
        }

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