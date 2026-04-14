"use client";

import { Card } from "@/components/ui/card";
import { BookOpen, Languages, ArrowRight, GraduationCap, Star, Play } from "lucide-react";
import Link from "next/link";
import { VOCABULARY_DATA, VOCABULARY_TOPICS } from "@/lib/data/vocabularyData";
import { GRAMMAR_TOPICS } from "@/lib/data/grammarData";

export default function LearnHub() {
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
        <Link href="/learn/videos" className="block group">
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
              <div className="flex gap-4 overflow-hidden mask-fade-right md:w-1/2">
                 <div className="flex gap-3 animate-marquee">
                    {[1,2,3].map(i => (
                       <div key={i} className="w-40 aspect-video bg-white/10 rounded-xl border border-white/20 flex items-center justify-center shrink-0">
                          <Play className="w-6 h-6 text-white/40" />
                       </div>
                    ))}
                 </div>
              </div>
            </div>
          </Card>
        </Link>
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {GRAMMAR_TOPICS.slice(0, 8).map(topic => (
            <Link key={topic.slug} href={`/grammar/topic/${topic.slug}`}>
              <Card className="p-4 hover:border-emerald-300 dark:hover:border-emerald-800 transition-all cursor-pointer group">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full 
                    ${topic.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' : 
                      topic.difficulty === 'Intermediate' ? 'bg-amber-100 text-amber-700' : 
                      'bg-red-100 text-red-700'}`}>
                    {topic.difficulty}
                  </span>
                  <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-2">{topic.title}</p>
              </Card>
            </Link>
          ))}
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {VOCABULARY_TOPICS.map(topic => {
            const count = VOCABULARY_DATA.filter(w => w.topic === topic.slug).length;
            return (
              <Link key={topic.slug} href={`/vocabulary/topic/${topic.slug}`}>
                <Card className="p-4 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all cursor-pointer group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400 font-medium">{count} words</span>
                    <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                  </div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{topic.name}</p>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">{topic.description}</p>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
