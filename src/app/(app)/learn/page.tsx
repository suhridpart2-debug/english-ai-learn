"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { BookOpen, Languages, ArrowRight, GraduationCap, Star, Play } from "lucide-react";
import Link from "next/link";
import { VOCABULARY_DATA, VOCABULARY_TOPICS } from "@/lib/data/vocabularyData";
import { GRAMMAR_TOPICS } from "@/lib/data/grammarData";
import { createClient } from "@/lib/supabase/client";
import { isPremium } from "@/lib/services/subscriptionService";
import { LockedCard } from "@/components/usage/LockedCard";

export default function LearnHub() {
  const [premium, setPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPremium = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setPremium(isPremium(profile));
      }
      setLoading(false);
    };
    checkPremium();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 pb-32 md:pb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">
          Learning Hub
        </h1>
        <p className="text-slate-500">Master vocabulary and grammar — your foundation for fluent English.</p>
      </header>

      {/* Two Main Feature Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Vocabulary Box */}
        <Link href="/vocabulary" className="block group">
          <Card className="overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-700 text-white relative border-none shadow-xl shadow-indigo-900/20 h-full p-6 md:p-8 hover:scale-[1.02] transition-transform">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px]" />
            <div className="relative z-10">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                <Languages className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-display font-bold mb-2">Vocabulary Library</h2>
              <p className="text-indigo-100 mb-3 max-w-sm">
                {VOCABULARY_DATA.length}+ words across {VOCABULARY_TOPICS.length} topics — Beginner to Advanced.
              </p>
              <div className="flex gap-2 flex-wrap mb-6">
                {["Beginner", "Intermediate", "Advanced"].map(d => (
                  <span key={d} className="text-xs bg-white/20 px-3 py-1 rounded-full font-medium">{d}</span>
                ))}
              </div>
              <div className="flex items-center text-sm font-bold bg-white/20 w-fit px-4 py-2 rounded-full backdrop-blur-sm group-hover:bg-white group-hover:text-indigo-700 transition-colors">
                Open Vocabulary <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </div>
          </Card>
        </Link>

        {/* Grammar Box */}
        <Link href="/grammar" className="block group">
          <Card className="overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-700 text-white relative border-none shadow-xl shadow-emerald-900/20 h-full p-6 md:p-8 hover:scale-[1.02] transition-transform">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px]" />
            <div className="relative z-10">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-display font-bold mb-2">Grammar Coach</h2>
              <p className="text-emerald-100 mb-3 max-w-sm">
                {GRAMMAR_TOPICS.length} grammar modules with concepts, examples, and interactive quizzes.
              </p>
              <div className="flex gap-2 flex-wrap mb-6">
                {["Tenses", "Articles", "Modals"].map(t => (
                  <span key={t} className="text-xs bg-white/20 px-3 py-1 rounded-full font-medium">{t}</span>
                ))}
              </div>
              <div className="flex items-center text-sm font-bold bg-white/20 w-fit px-4 py-2 rounded-full backdrop-blur-sm group-hover:bg-white group-hover:text-emerald-700 transition-colors">
                Open Grammar <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Daily Video Section */}
      <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
        <div className="block group relative">
          {!premium ? (
            <LockedCard title="Pro English Videos" description="Watch unlimited curated daily videos">
              <Card className="overflow-hidden bg-gradient-to-br from-orange-500 to-red-600 text-white relative border-none p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex-1">
                    <h2 className="text-2xl font-display font-bold mb-2">Daily English Videos</h2>
                    <p className="text-orange-50 mb-3 max-w-xl">Improve listening and vocabulary with real-world content.</p>
                  </div>
                </div>
              </Card>
            </LockedCard>
          ) : (
            <Link href="/learn/videos">
              <Card className="overflow-hidden bg-gradient-to-br from-orange-500 to-red-600 text-white relative border-none shadow-xl shadow-orange-900/20 p-6 md:p-8 hover:scale-[1.01] transition-transform">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px]" />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                  <div className="flex-1">
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                      <Play className="w-7 h-7 text-white" />
                    </div>
                    <h2 className="text-2xl font-display font-bold mb-2">Daily English Videos</h2>
                    <p className="text-orange-50 mb-3 max-w-xl">
                      New curated content every 6 hours. Improve listening, learn real-world vocabulary, and start speaking practice immediately.
                    </p>
                    <div className="flex items-center text-sm font-bold bg-white/20 w-fit px-4 py-2 rounded-full backdrop-blur-sm group-hover:bg-white group-hover:text-orange-700 transition-colors">
                      Watch Daily Videos <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          )}
        </div>
      </section>

      {/* Quick access: Grammar Topics */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold font-display flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-emerald-500" /> Grammar Topics
          </h3>
          <Link href="/grammar" className="text-sm text-primary-600 dark:text-primary-400 font-bold hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {GRAMMAR_TOPICS.slice(0, 8).map((topic, i) => {
            const isLocked = !premium && i >= 2; 

            const content = (
              <Card className={`p-4 h-[160px] flex flex-col justify-between transition-all border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm ${isLocked ? 'opacity-40 grayscale' : 'hover:border-emerald-300 dark:hover:border-emerald-800 cursor-pointer group'}`}>
                <div>
                   <div className="flex items-center justify-between mb-2">
                     <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md 
                       ${topic.difficulty === 'Beginner' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                         topic.difficulty === 'Intermediate' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 
                         'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                       {topic.difficulty}
                     </span>
                     {!isLocked && <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />}
                   </div>
                   <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">{topic.title}</p>
                </div>
              </Card>
            );

            if (isLocked) {
              return (
                <LockedCard 
                  key={topic.slug} 
                  title="Pro Module" 
                  description="Unlock full grammar coach"
                  className="h-[160px]"
                >
                  {content}
                </LockedCard>
              );
            }

            return (
              <Link key={topic.slug} href={`/grammar/topic/${topic.slug}`}>
                {content}
              </Link>
            );
          })}
        </div>
      </section>

      {/* Quick access: Vocabulary Categories */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold font-display flex items-center gap-2">
            <Star className="w-5 h-5 text-indigo-500" /> Vocabulary Topics
          </h3>
          <Link href="/vocabulary" className="text-sm text-primary-600 dark:text-primary-400 font-bold hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {VOCABULARY_TOPICS.slice(0, 8).map((topic, i) => {
            const isLocked = !premium && i >= 4; 

            const content = (
              <Card className={`p-4 h-[160px] flex flex-col justify-between transition-all border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm ${isLocked ? 'opacity-40 grayscale' : 'hover:border-indigo-300 dark:hover:border-indigo-800 cursor-pointer group'}`}>
                 <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vocabulary</span>
                      {!isLocked && <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-indigo-500 transition-colors" />}
                    </div>
                    <p className="text-sm font-black text-slate-900 dark:text-white line-clamp-1">{topic.name}</p>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-tight">{topic.description}</p>
                 </div>
              </Card>
            );

            if (isLocked) {
              return (
                <LockedCard 
                  key={topic.slug} 
                  title="Expert Set" 
                  description="Unlock 20+ specialized topics"
                  className="h-[160px]"
                >
                  {content}
                </LockedCard>
              );
            }

            return (
              <Link key={topic.slug} href={`/vocabulary/topic/${topic.slug}`}>
                {content}
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
