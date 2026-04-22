"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { BookOpen, ArrowRight, LayoutGrid, Clock, Link as LinkIcon, Feather, MapPin, AlignLeft, Repeat, MessageSquareText, HelpCircle, Wand2, MessageCircle, Briefcase, Star, Zap } from "lucide-react";
import Link from "next/link";
import { GRAMMAR_TOPICS, getDailyGrammarTopic } from "@/lib/data/grammarData";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ReactNode> = {
  Clock: <Clock className="w-6 h-6" />,
  Link: <LinkIcon className="w-6 h-6" />,
  Feather: <Feather className="w-6 h-6" />,
  MapPin: <MapPin className="w-6 h-6" />,
  AlignLeft: <AlignLeft className="w-6 h-6" />,
  Repeat: <Repeat className="w-6 h-6" />,
  MessageSquareText: <MessageSquareText className="w-6 h-6" />,
  HelpCircle: <HelpCircle className="w-6 h-6" />,
  Wand2: <Wand2 className="w-6 h-6" />,
  MessageCircle: <MessageCircle className="w-6 h-6" />,
  Briefcase: <Briefcase className="w-6 h-6" />
};

export default function GrammarHub() {
  const [dailyTopic, setDailyTopic] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    // Initial load
    setDailyTopic(getDailyGrammarTopic());

    // Timer calculation
    const timer = setInterval(() => {
      const now = new Date();
      const nextReset = new Date();
      nextReset.setHours(24, 0, 0, 0);
      const diff = nextReset.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`${hours}h ${mins}m`);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleReset = () => {
    const currentOffset = Number(localStorage.getItem("routine_offset_grammar") || "0");
    localStorage.setItem("routine_offset_grammar", (currentOffset + 1).toString());
    setDailyTopic(getDailyGrammarTopic());
  };

  if (!dailyTopic) return null;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 pb-32 md:pb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">
          Grammar Coach
        </h1>
        <p className="text-slate-500 dark:text-slate-400">Master English rules, avoid common mistakes, and speak confidently.</p>
      </header>

      {/* Main Action - Daily Featured Topic */}
      <Card className="overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white relative border-none shadow-xl shadow-emerald-900/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        
        <div className="p-6 md:p-10 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-widest">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                DAILY GRAMMAR FOCUS
              </div>
              <button 
                onClick={handleReset}
                className="text-[10px] font-bold text-white/60 hover:text-white flex items-center gap-1.5 transition-colors group px-2 py-1 rounded-lg hover:bg-white/10"
              >
                <Repeat className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
                REFRESH NOW
              </button>
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight">
              {dailyTopic.title}
            </h2>
            <p className="text-emerald-50 text-lg max-w-lg font-medium leading-relaxed opacity-90">
              {dailyTopic.description}
            </p>
            <div className="flex items-center gap-4 justify-center md:justify-start pt-2">
               <div className="flex items-center gap-2 text-emerald-200">
                 <Zap className="w-3.5 h-3.5 fill-current" />
                 <span className="text-xs font-bold uppercase tracking-wider tabular-nums">New lesson in {timeLeft}</span>
               </div>
            </div>
          </div>
          
          <div className="shrink-0">
            <Link href={`/grammar/topic/${dailyTopic.slug}`}>
              <button className="bg-white text-emerald-700 hover:bg-slate-100 rounded-2xl h-16 px-10 font-bold shadow-2xl transition-transform hover:scale-105 active:scale-95 text-lg flex items-center">
                Study Lesson <ArrowRight className="w-6 h-6 ml-3" />
              </button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Grammar Library */}
      <div>
        <div className="flex items-center gap-2 mb-6 mt-12">
          <LayoutGrid className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          <h3 className="text-xl font-bold font-display dark:text-white">Grammar Curriculum</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {GRAMMAR_TOPICS.map(topic => {
            const isDaily = dailyTopic.slug === topic.slug;
            return (
              <Link key={topic.slug} href={`/grammar/topic/${topic.slug}`}>
                <Card className={cn(
                  "p-8 transition-all h-full border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 group relative overflow-hidden",
                  "hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-xl cursor-pointer",
                  isDaily && "ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-slate-950 shadow-emerald-500/10"
                )}>
                  {isDaily && (
                    <div className="absolute top-0 right-0">
                      <div className="bg-emerald-600 text-white text-[9px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-widest flex items-center gap-1 shadow-lg">
                        <Zap className="w-3 h-3 fill-current" /> DAILY
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-6">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg mb-2 shadow-sm transition-transform group-hover:scale-110",
                      isDaily ? "bg-emerald-600 text-white" : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                    )}>
                      {iconMap[topic.icon] || <BookOpen className="w-7 h-7" />}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full",
                        topic.difficulty === 'Beginner' ? 'bg-green-100/80 text-green-700 dark:bg-green-500/10 dark:text-green-400' : 
                        topic.difficulty === 'Intermediate' ? 'bg-amber-100/80 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' : 
                        'bg-red-100/80 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                      )}>
                        {topic.difficulty}
                      </span>
                    </div>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-3 text-xl group-hover:text-emerald-600 transition-colors tracking-tight">{topic.title}</h4>
                  <p className="text-[15px] text-slate-500 line-clamp-2 leading-relaxed font-medium">{topic.description}</p>
                  
                  <div className="mt-8 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    View Module <ArrowRight className="w-4 h-4" />
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  );
}
