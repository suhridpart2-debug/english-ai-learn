"use client";

import { LockedCard } from "@/components/usage/LockedCard";
import { supabase } from "@/lib/supabaseClient";
import { isPremium } from "@/lib/services/subscriptionService";
import { useEffect, useState } from "react";
import { Mic, Timer, GraduationCap, Users, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import Link from "next/link";

const practiceModes = [
  {
    id: "read-aloud",
    title: "Pronunciation Coach",
    desc: "Read passages aloud and get word-level accuracy feedback.",
    icon: Mic,
    color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
    link: "/practice/read-aloud",
    premium: false
  },
  {
    id: "conversation-buddy",
    title: "AI Conversation Buddy",
    desc: "Practice real conversations with AI Personas. Get live feedback.",
    icon: Users,
    color: "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400",
    link: "/practice/conversation",
    premium: false // Gated internally
  },
  {
    id: "sixty-seconds",
    title: "60-Second Challenge",
    desc: "Speak on a random topic for 1 minute. Instant analysis.",
    icon: Timer,
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    link: "/practice/sixty-seconds",
    premium: false
  },
  {
    id: "ielts",
    title: "IELTS Mock Test",
    desc: "Full speaking section simulation with band scoring.",
    icon: GraduationCap,
    color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
    link: "/practice/ielts",
    premium: true
  },
  {
    id: "topics",
    title: "Topic Catalog (100+)",
    desc: "Choose from specific topics to build vocabulary.",
    icon: BookOpen,
    color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
    link: "/practice/topic",
    premium: true
  }
];

export default function PracticeHubPage() {
  const [premium, setPremium] = useState(false);

  useEffect(() => {
    async function checkPremium() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      setPremium(isPremium(profile));
    }
    checkPremium();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <header className="space-y-2">
        <h1 className="text-4xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
          Practice Hub
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg">Choose a specialized mode to start improving your English skills.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

        {practiceModes.map((mode) => {
          const Icon = mode.icon;
          const isLocked = mode.premium && !premium;

          const content = (
            <Card className={`p-8 h-full flex flex-col hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 group relative overflow-hidden ring-1 ring-slate-900/5 dark:ring-white/5 ${isLocked ? 'opacity-40 grayscale border-none' : ''}`}>
              <div className="flex items-start gap-6 h-full">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ${mode.color}`}>
                  <Icon className="w-8 h-8" />
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="text-2xl font-bold font-display text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {mode.title}
                  </h3>
                  <p className="text-base leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
                    {mode.desc}
                  </p>
                </div>
              </div>
            </Card>
          );

          if (isLocked) {
            return (
              <div key={mode.id} className="h-full">
                <LockedCard 
                  title={`${mode.title}`} 
                  description="Premium Feature"
                >
                  {content}
                </LockedCard>
              </div>
            );
          }

          return (
            <Link key={mode.id} href={mode.link} className="h-full">
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

