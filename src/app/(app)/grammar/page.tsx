"use client";

import { Card } from "@/components/ui/card";
import { BookOpen, ArrowRight, LayoutGrid, Clock, Link as LinkIcon, Feather, MapPin, AlignLeft, Repeat, MessageSquareText, HelpCircle, Wand2, MessageCircle, Briefcase } from "lucide-react";
import Link from "next/link";
import { GRAMMAR_TOPICS } from "@/lib/data/grammarData";

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
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 pb-32 md:pb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">
          Grammar Coach
        </h1>
        <p className="text-slate-500 dark:text-slate-400">Master English rules, avoid common mistakes, and speak confidently.</p>
      </header>

      {/* Main Action - Start Learning */}
      <Card className="overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-700 text-white relative border-none shadow-xl shadow-emerald-900/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px]" />
        <div className="p-6 md:p-8 relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-sm font-medium mb-4">
              <BookOpen className="w-4 h-4" />
              Structured Path
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">Master the Basics</h2>
            <p className="text-emerald-100 max-w-md">
              Start with Tenses, the foundational building blocks of the English language.
            </p>
          </div>
          <Link href="/grammar/topic/tenses">
            <button className="bg-white text-emerald-700 hover:bg-slate-100 rounded-full font-bold shadow-lg px-8 py-4 flex items-center transition-transform hover:scale-105">
              Start Module <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </Link>
        </div>
      </Card>

      {/* Explore Topics */}
      <div>
        <div className="flex items-center gap-2 mb-6 mt-10">
          <LayoutGrid className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          <h3 className="text-xl font-bold font-display dark:text-white">Grammar Topics</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {GRAMMAR_TOPICS.map(topic => (
            <Link key={topic.slug} href={`/grammar/topic/${topic.slug}`}>
              <Card className="p-6 hover:border-emerald-300 dark:hover:border-emerald-800 transition-all hover:shadow-md cursor-pointer h-full border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 group relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg mb-2 group-hover:scale-110 transition-transform">
                    {iconMap[topic.icon] || <BookOpen className="w-6 h-6" />}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full 
                      ${topic.difficulty === 'Beginner' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                        topic.difficulty === 'Intermediate' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 
                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                      {topic.difficulty}
                    </span>
                  </div>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-2 text-lg">{topic.title}</h4>
                <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{topic.description}</p>
                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
