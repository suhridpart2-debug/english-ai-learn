"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, Globe, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParams = searchParams.get("redirect") || "/dashboard";
  const errorParam = searchParams.get("error");
  const supabase = createClient();

  const [checkingSession, setCheckingSession] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (!error && data.session) {
          router.replace(redirectParams);
          return;
        }
      } catch (err) {
        console.error("LoginPage: Session check error:", err);
      } finally {
        setCheckingSession(false);
      }
    };

    checkSession();
  }, [router, redirectParams, supabase]);

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
        alert(error.message);
        return;
      }

      router.replace(redirectParams);
    } catch (err) {
      console.error("Login error:", err);
      alert("Something went wrong while logging in.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const redirectUrl =
        process.env.NODE_ENV === "development" || typeof window === "undefined" || !window.location.host.includes("vercel.app")
          ? "http://localhost:3000/auth/callback"
          : "https://english-ai-learn.vercel.app/auth/callback";

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        console.error("Google login error:", error.message);
        alert(error.message);
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Google login error:", err);
      alert("Something went wrong with Google sign in.");
      setIsLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="z-10 flex w-full max-w-md items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full max-w-md"
    >
      <div className="absolute right-0 top-0 z-20 -translate-y-16">
        <ThemeToggle />
      </div>

      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex rounded-xl bg-primary-600 p-2 text-white shadow-lg shadow-primary-500/30">
          <Mic className="h-6 w-6" />
        </div>
        <h1 className="mb-2 font-display text-3xl font-bold text-slate-900 dark:text-white">
          Welcome Back
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Log in to continue your speaking practice.
        </p>
      </div>

      {errorParam && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
          Login failed. Please try again.
        </div>
      )}

      <Card
        glass
        className="border-slate-200 bg-white/80 p-8 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80"
      >
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
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
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
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

          <Button type="submit" className="mt-2 h-12 w-full text-md" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Sign In with Email"
            )}
          </Button>
        </form>

        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-slate-200 dark:border-slate-800" />
          <span className="px-3 text-sm text-slate-400">OR</span>
          <div className="flex-1 border-t border-slate-200 dark:border-slate-800" />
        </div>

        <Button
          variant="outline"
          type="button"
          className="h-12 w-full bg-white dark:bg-slate-900"
          onClick={handleGoogleLogin}
          disabled={isLoading}
        >
          <Globe className="mr-2 h-5 w-5" />
          Continue with Google
        </Button>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Don&apos;t have an account?{" "}
          <Link
            href="/onboarding"
            className="font-medium text-primary-600 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </Card>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 p-4 dark:bg-slate-950">
      <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-primary-500/20 blur-[100px]" />
      <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-indigo-500/20 blur-[100px]" />

      <Suspense
        fallback={<Loader2 className="h-8 w-8 animate-spin text-primary-500" />}
      >
        <LoginContent />
      </Suspense>
    </div>
  );
}