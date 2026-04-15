import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Mic,
  ArrowRight,
  Sparkles,
  Brain,
  Target,
  Star,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
      {/* Navbar */}
      <nav className="absolute top-0 z-50 w-full">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6">
          <div className="flex items-center gap-2 font-display text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            <div className="rounded-lg bg-primary-600 p-1.5 text-white">
              <Mic className="h-5 w-5" />
            </div>
            SpeakAI
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />

            <Link href="/auth/login" className="block">
              <Button
                variant="ghost"
                className="px-3 text-sm font-semibold text-slate-700 dark:text-slate-300 sm:px-4 sm:text-base"
              >
                Log in
              </Button>
            </Link>

            <Link href="/onboarding" className="hidden sm:block">
              <Button className="rounded-full bg-primary-600 px-6 text-white shadow-lg shadow-primary-500/20 hover:bg-primary-700">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative mx-auto flex max-w-7xl flex-col items-center bg-transparent px-6 pb-20 pt-32 text-center lg:pb-32 lg:pt-48">
        {/* Abstract Background Blur */}
        <div className="absolute left-1/2 top-1/3 -z-10 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary-500/20 blur-[120px] dark:bg-primary-600/20" />

        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300">
          <Sparkles className="h-4 w-4" />
          <span>Voted #1 AI Speaking Coach 2026</span>
        </div>

        <h1 className="mb-6 font-display text-4xl font-bold leading-[1.1] tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-7xl">
          Master Fluent English <br className="hidden md:block" />
          with your <span className="text-gradient">AI Coach</span>
        </h1>

        <p className="mb-12 max-w-2xl text-base text-slate-600 dark:text-slate-400 sm:text-lg lg:text-xl">
          Practice speaking confident English for interviews, IELTS, and daily
          life. Get instant pronunciation feedback, grammar corrections, and
          fluency scores.
        </p>

        <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
          <Link href="/onboarding" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full rounded-full bg-primary-600 text-lg text-white shadow-xl shadow-primary-600/20 hover:bg-primary-700"
            >
              Start Practicing Free
              <ArrowRight className="ml-2 h-5 w-5 text-white" />
            </Button>
          </Link>

          <Link href="#features" className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="outline"
              className="w-full rounded-full border-slate-200 bg-white/50 text-lg text-slate-900 backdrop-blur-sm hover:bg-white dark:border-slate-800 dark:bg-slate-900/40 dark:text-white dark:hover:bg-slate-800"
            >
              See How It Works
            </Button>
          </Link>
        </div>

        {/* Mock App UI Preview */}
        <div className="relative mt-20 w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-200 transition-colors dark:border-slate-800 dark:bg-slate-900 dark:shadow-primary-900/5">
          <div className="flex h-12 items-center gap-2 border-b border-slate-200 bg-slate-50/50 px-4 dark:border-slate-800 dark:bg-slate-950/50">
            <div className="h-3 w-3 rounded-full bg-red-400" />
            <div className="h-3 w-3 rounded-full bg-amber-400" />
            <div className="h-3 w-3 rounded-full bg-green-400" />
          </div>

          <div className="relative flex aspect-[16/9] items-center justify-center overflow-hidden bg-slate-50 p-8 dark:bg-slate-950">
            {/* Fake Waveform */}
            <div className="flex items-center justify-center gap-1">
              {[40, 60, 30, 80, 50, 90, 70, 40, 100, 60, 40, 20].map(
                (h, i) => (
                  <div
                    key={i}
                    className="w-3 rounded-full bg-primary-500 transition-all animate-pulse"
                    style={{
                      height: `${h}%`,
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section
        id="features"
        className="bg-white/70 px-6 py-24 transition-colors dark:bg-slate-900/40"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-display text-3xl font-bold text-slate-900 dark:text-white lg:text-5xl">
              Everything you need to be fluent
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Powered by advanced AI models that listen, understand, and guide
              you.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: Brain,
                title: "Smart Grammar Check",
                desc: "Instantly fixes your grammar mistakes and explains in simple Hinglish.",
              },
              {
                icon: Target,
                title: "Pronunciation Scoring",
                desc: "Get word-by-word feedback on your accent and pronunciation.",
              },
              {
                icon: Star,
                title: "Roleplay Scenarios",
                desc: "Practice real-life situations like job interviews and visa meetings.",
              },
            ].map((f, i) => (
              <div
                key={i}
                className="rounded-3xl border border-slate-200 bg-white p-8 transition-all hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-3 font-display text-xl font-bold text-slate-900 dark:text-white">
                  {f.title}
                </h3>
                <p className="leading-relaxed text-slate-600 dark:text-slate-400">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}