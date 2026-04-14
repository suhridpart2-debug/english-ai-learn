"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, Globe, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParams = searchParams.get("redirect") || "/dashboard";

  const [checkingSession, setCheckingSession] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("LoginPage: Checking for active session...");
        const { data, error } = await supabase.auth.getSession();

        if (!error && data.session) {
          console.log("LoginPage: Active session found for", data.session.user.email, "- Redirecting to", redirectParams);
          router.replace(redirectParams);
          return;
        }
        
        console.log("LoginPage: No active session found, showing login form.");
      } catch (err) {
        console.error("LoginPage: Session check error:", err);
      } finally {
        setCheckingSession(false);
      }
    };

    checkSession();
  }, [router, redirectParams]);

  const handleEmailLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter email and password.");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        if (
          error.message?.toLowerCase().includes("supabaseurl is required") ||
          error.message?.toLowerCase().includes("url is required")
        ) {
          alert("Supabase environment variables are missing. Please check your .env.local file.");
          return;
        }

        alert(error.message);
        return;
      }

      router.push(redirectParams);
    } catch (err) {
      console.error("Login error:", err);
      alert("Something went wrong while logging in.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);

    try {
      // Use window.location.origin to ensure the state remains valid for the current domain (localhost vs production)
      const callbackUrl = `${window.location.origin}/auth/callback`;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${callbackUrl}?redirect=${encodeURIComponent(redirectParams)}`,
        },
      });

      if (error) {
        if (
          error.message?.toLowerCase().includes("supabaseurl is required") ||
          error.message?.toLowerCase().includes("url is required")
        ) {
          alert("Supabase environment variables are missing. Please check your .env.local file.");
          return;
        }

        alert(error.message);
      }
    } catch (err) {
      console.error("Google login error:", err);
      alert("Something went wrong with Google sign in.");
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="w-full max-w-md z-10 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md z-10"
    >
      <div className="text-center mb-8">
        <div className="inline-flex bg-primary-600 p-2 rounded-xl text-white shadow-lg shadow-primary-500/30 mb-4">
          <Mic className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">
          Welcome Back
        </h1>
        <p className="text-slate-500">Log in to continue your speaking practice.</p>
      </div>

      <Card glass className="p-8">
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Email
            </label>
            <Input
              type="email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Password
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <Button type="submit" className="w-full h-12 text-md mt-2" disabled={isLoading}>
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In with Email"}
          </Button>
        </form>

        <div className="my-6 flex items-center">
          <div className="border-t border-slate-200 dark:border-slate-800 flex-1" />
          <span className="px-3 text-sm text-slate-400">OR</span>
          <div className="border-t border-slate-200 dark:border-slate-800 flex-1" />
        </div>

        <Button
          variant="outline"
          type="button"
          className="w-full h-12 bg-white dark:bg-slate-900"
          onClick={handleGoogleLogin}
          disabled={isLoading}
        >
          <Globe className="w-5 h-5 mr-2" />
          Continue with Google
        </Button>

        <p className="text-center text-sm text-slate-500 mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/onboarding" className="text-primary-600 font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </Card>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-500/20 rounded-full blur-[100px]" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px]" />

      <Suspense fallback={<Loader2 className="w-8 h-8 animate-spin text-primary-500" />}>
        <LoginContent />
      </Suspense>
    </div>
  );
}