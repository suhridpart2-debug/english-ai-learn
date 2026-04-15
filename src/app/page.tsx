import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mic, ArrowRight, Sparkles, Brain, Target, Star } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export default function LandingPage() {
  return (
    <main className="flex-1 bg-white dark:bg-slate-950 overflow-hidden min-h-screen">
      {/* Navbar */}
      <nav className="absolute top-0 w-full flex items-center justify-between p-6 z-50">
        <div className="flex items-center gap-2 font-display font-bold text-xl tracking-tight text-slate-900 dark:text-white">
          <div className="bg-primary-600 text-white p-1.5 rounded-lg">
            <Mic className="w-5 h-5" />
          </div>
          SpeakAI
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="hidden sm:flex gap-4">
            <Link href="/auth/login">
              <Button variant="ghost" className="font-semibold text-slate-700 dark:text-slate-300">Log in</Button>
            </Link>
            <Link href="/onboarding">
              <Button className="rounded-full shadow-lg shadow-primary-500/20 px-6">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Abstract Background Blur */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -z-10 w-[600px] h-[600px] bg-primary-500/20 rounded-full blur-[120px] dark:bg-primary-600/20" />
        
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300 text-sm font-medium mb-8 border border-indigo-100 dark:border-indigo-500/20">
          <Sparkles className="w-4 h-4" />
          <span>Voted #1 AI Speaking Coach 2026</span>
        </div>

        <h1 className="text-5xl lg:text-7xl font-display font-bold tracking-tight text-slate-900 dark:text-white mb-6 leading-[1.1]">
          Master Fluent English <br className="hidden md:block" />
          with your <span className="text-gradient">AI Coach</span>
        </h1>
        
        <p className="text-lg lg:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mb-12">
          Practice speaking confident English for interviews, IELTS, and daily life. 
          Get instant pronunciation feedback, grammar corrections, and fluency scores.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link href="/onboarding" className="w-full sm:w-auto">
            <Button size="lg" className="w-full rounded-full text-lg shadow-xl shadow-primary-600/20">
              Start Practicing Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <Link href="#features" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full rounded-full text-lg bg-white/50 backdrop-blur-sm dark:bg-slate-950/50 hover:bg-slate-50 dark:hover:bg-slate-900 border-slate-200 dark:border-slate-800">
              See How It Works
            </Button>
          </Link>
        </div>

        {/* Mock App UI Preview */}
        <div className="mt-20 w-full max-w-4xl rounded-2xl glass-card overflow-hidden border-t border-x border-white/40 dark:border-slate-700/50 shadow-2xl relative shadow-primary-900/5">
          <div className="h-12 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 gap-2 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="aspect-[16/9] bg-slate-100 dark:bg-slate-900 p-8 flex items-center justify-center relative overflow-hidden">
            {/* Fake Waveform */}
            <div className="flex items-center justify-center gap-1">
              {[40, 60, 30, 80, 50, 90, 70, 40, 100, 60, 40, 20].map((h, i) => (
                <div key={i} className="w-3 bg-primary-500 rounded-full animate-pulse transition-all" style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-slate-50 dark:bg-slate-950 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-display font-bold text-slate-900 dark:text-white mb-4">
              Everything you need to be fluent
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg">Powered by advanced AI models that listen, understand, and guide you.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Brain, title: "Smart Grammar Check", desc: "Instantly fixes your grammar mistakes and explains in simple Hinglish." },
              { icon: Target, title: "Pronunciation Scoring", desc: "Get word-by-word feedback on your accent and pronunciation." },
              { icon: Star, title: "Roleplay Scenarios", desc: "Practice real-life situations like job interviews and visa meetings." }
            ].map((f, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-6">
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 font-display">{f.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
