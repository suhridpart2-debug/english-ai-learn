"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Mic, ArrowRight, CheckCircle2, Volume2, Loader2 } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { supabase } from "@/lib/supabaseClient";

const LEVELS = [
  { id: "beginner", title: "Beginner", desc: "Just starting to learn English." },
  { id: "intermediate", title: "Intermediate", desc: "Can understand but struggle to speak." },
  { id: "advanced", title: "Advanced", desc: "Speak well but want to master fluency." },
];

const GOALS = [
  { id: "ielts", title: "IELTS/TOEFL", desc: "Preparing for an exam." },
  { id: "job", title: "Job Interview", desc: "Need to crack an interview." },
  { id: "fluency", title: "Daily Fluency", desc: "Smooth daily conversations." },
  { id: "college", title: "College/Study", desc: "Presentations and campus life." },
];

export default function OnboardingFlow() {
  const router = useRouter();
  const { completeOnboarding } = useAppStore();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const [name, setName] = useState("");
  const [level, setLevel] = useState("");
  const [goal, setGoal] = useState("");
  const [dailyTime, setDailyTime] = useState(15);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Check if user is already authenticated (Google/OAuth case)
  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsAuthenticated(true);
        const metadata = session.user.user_metadata;
        setName(metadata.full_name || metadata.name || "");
        setEmail(session.user.email || "");
      }
      setIsCheckingAuth(false);
    }
    checkAuth();
  }, []);

  const isNextDisabled = () => {
    if (step === 1) return name.trim().length === 0;
    if (step === 2) return !level;
    if (step === 3) return !goal;
    if (step === 4) {
      if (isAuthenticated) return false; // Authenticated users don't need to fill email/pass
      return (
        !email.trim() ||
        !password.trim() ||
        password.trim().length < 6
      );
    }
    return false;
  };

  const handleNext = async () => {
    // If authenticated, we skip the final login step if it was purely for account creation
    if (step < 3 || (!isAuthenticated && step === 3)) {
      setStep((prev) => prev + 1);
      return;
    }

    // Validation for authenticated flow
    if (isAuthenticated) {
      if (!name.trim() || !level || !goal) {
        alert("Please fill all required fields.");
        return;
      }
    } else {
      // Validation for signup flow
      if (!name.trim() || !level || !goal || !email.trim() || !password.trim()) {
        alert("Please fill all required fields.");
        return;
      }
    }

    setIsLoading(true);

    try {
      if (isAuthenticated) {
        // FLOW A: Finish setup for Google/Existing users
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Update database profile
          await supabase.from('profiles').upsert({
            id: user.id,
            name: name.trim(), // Legacy field
            full_name: name.trim(), // New field
            level: level, // Legacy field
            english_level: level, // New field
            goal,
            onboarding_completed: true, 
            email: user.email,
            provider: user.app_metadata.provider,
            daily_time: dailyTime,
            updated_at: new Date().toISOString()
          });

          // UPDATE AUTH METADATA for middleware efficiency
          await supabase.auth.updateUser({
            data: { onboarding_completed: true }
          });

          // Initialize streaks if needed
          await supabase.from('streaks').upsert({
            user_id: user.id,
            current_streak: 0,
            longest_streak: 0,
            total_sessions: 0
          }, { onConflict: 'user_id' });
        }
      } else {
        // FLOW B: Create new email account
        const cleanEmail = email.trim().toLowerCase();
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: password.trim(),
          options: {
            data: {
              name: name.trim(),
              full_name: name.trim(),
              level,
              english_level: level,
              goal,
              onboarding_completed: true,
              dailyTime,
            },
          },
        });

        if (error) throw error;

        if (data.user) {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            name: name.trim(), // Legacy field
            full_name: name.trim(), // New field
            level: level, // Legacy field
            english_level: level, // New field
            goal,
            onboarding_completed: true,
            email: cleanEmail,
            provider: 'email',
            daily_time: dailyTime
          });

          await supabase.from('streaks').upsert({
            user_id: data.user.id,
            current_streak: 0,
            longest_streak: 0,
            total_sessions: 0
          });
        }
      }

      completeOnboarding();
      router.refresh(); // Force a refresh to update session metadata for middleware
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Setup error:", err);
      alert(err.message || "Something went wrong while setting up your profile.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="fixed top-0 left-0 w-full h-[300px] bg-gradient-to-b from-indigo-500/10 to-transparent -z-10" />

      <div className="w-full max-w-xl">
        <div className="flex items-center justify-center mb-8">
          <div className="bg-primary-600 text-white p-2 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Mic className="w-6 h-6" />
          </div>
        </div>

        <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mb-8 overflow-hidden flex">
          <motion.div
            className="bg-primary-500 h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(step / (isAuthenticated ? 3 : 4)) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card glass className="p-8">
                <h2 className="text-3xl font-display font-bold mb-2">Welcome to SpeakAI 👋</h2>
                <p className="text-slate-500 mb-8">
                  Let&apos;s personalize your learning experience. What should we call you?
                </p>

                <input
                  autoFocus
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full text-2xl bg-transparent border-b-2 border-slate-200 dark:border-slate-800 focus:border-primary-500 pb-2 outline-none font-medium mb-8"
                  onKeyDown={(e) => e.key === "Enter" && !isNextDisabled() && handleNext()}
                />
              </Card>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card glass className="p-8">
                <h2 className="text-3xl font-display font-bold mb-2">What is your current level?</h2>
                <p className="text-slate-500 mb-6">
                  Be honest, this helps AI craft the right plan for you.
                </p>

                <div className="space-y-4">
                  {LEVELS.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => setLevel(l.id)}
                      className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                        level === l.id
                          ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-lg">{l.title}</span>
                        {level === l.id && <CheckCircle2 className="w-5 h-5 text-primary-500" />}
                      </div>
                      <p className="text-slate-500 text-sm mt-1">{l.desc}</p>
                    </button>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card glass className="p-8">
                <h2 className="text-3xl font-display font-bold mb-2">What is your main goal? 🎯</h2>
                <p className="text-slate-500 mb-6">Why do you want to speak better English?</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {GOALS.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setGoal(g.id)}
                      className={`text-left p-4 rounded-xl border-2 transition-all ${
                        goal === g.id
                          ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                      }`}
                    >
                      <span className="font-semibold block mb-1">{g.title}</span>
                      <span className="text-slate-500 text-xs block">{g.desc}</span>
                    </button>
                  ))}
                </div>
                
                {isAuthenticated && (
                  <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                       Daily Practice Time
                    </label>
                    <select
                      value={dailyTime}
                      onChange={(e) => setDailyTime(Number(e.target.value))}
                      className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 outline-none"
                    >
                      <option value={10}>10 minutes/day</option>
                      <option value={15}>15 minutes/day</option>
                      <option value={30}>30 minutes/day</option>
                      <option value={45}>45 minutes/day</option>
                    </select>
                  </div>
                )}
              </Card>
            </motion.div>
          )}

          {step === 4 && !isAuthenticated && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card glass className="p-8">
                <div className="text-center flex flex-col items-center mb-8">
                  <div className="w-20 h-20 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-6">
                    <Volume2 className="w-10 h-10" />
                  </div>

                  <h2 className="text-3xl font-display font-bold mb-3 text-gradient">
                    Your AI Roadmap is Ready!
                  </h2>

                  <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-sm">
                    We&apos;ve prepared a custom curriculum for {name || "you"}.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Email
                    </label>
                    <Input
                      type="email"
                      placeholder="you@example.com"
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
                      placeholder="Minimum 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <p className="text-center text-sm text-slate-500 mt-6">
                  Already have an account?{" "}
                  <Link href="/auth/login" className="text-primary-600 font-medium hover:underline">
                    Sign in
                  </Link>
                </p>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 flex justify-end">
          <Button
            size="lg"
            className="rounded-full shadow-lg hover:shadow-xl transition-all min-w-[160px]"
            onClick={handleNext}
            disabled={isNextDisabled() || isLoading || isCheckingAuth}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {((step === 3 && isAuthenticated) || (step === 4 && !isAuthenticated)) ? "Complete Setup" : "Continue"}
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}