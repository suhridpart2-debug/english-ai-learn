"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, BookmarkCheck, ArrowRight, Play, LayoutGrid, Search, SlidersHorizontal, X, Star, Zap, Repeat, Clock } from "lucide-react";
import Link from "next/link";
import {
  VOCABULARY_TOPICS,
  VOCABULARY_DATA,
  getFilteredWords,
  getDailyTopic,
  type Difficulty,
  type TopicSlug,
} from "@/lib/data/vocabularyData";
import { WordCard } from "@/components/vocabulary/WordCard";
import { LockedCard } from "@/components/usage/LockedCard";
import { supabase } from "@/lib/supabaseClient";
import { isPremium } from "@/lib/services/subscriptionService";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

const DIFFICULTIES: (Difficulty | "All")[] = ["All", "Beginner", "Intermediate", "Advanced"];

export default function VocabularyHub() {
  const [activeTab, setActiveTab] = useState<"explore" | "browse">("explore");
  const [search, setSearch] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | "All">("All");
  const [selectedTopic, setSelectedTopic] = useState<TopicSlug | "all">("all");
  const [premium, setPremium] = useState(false);
  
  const [dailyTopic, setDailyTopic] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    // Initial load
    setDailyTopic(getDailyTopic());

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
    const currentOffset = Number(localStorage.getItem("routine_offset_vocab") || "0");
    localStorage.setItem("routine_offset_vocab", (currentOffset + 1).toString());
    setDailyTopic(getDailyTopic());
  };

  useEffect(() => {
    async function checkPremium() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      setPremium(isPremium(profile));
    }
    checkPremium();
  }, []);

  const filteredWords = useMemo(
    () => getFilteredWords(selectedDifficulty, selectedTopic, search),
    [selectedDifficulty, selectedTopic, search]
  );
  
  const hasActiveFilters = selectedDifficulty !== "All" || selectedTopic !== "all" || search !== "";

  if (!dailyTopic) return null;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 pb-32 md:pb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-1">
            Vocabulary Library
          </h1>
          <p className="text-slate-500">{VOCABULARY_DATA.length} words across {VOCABULARY_TOPICS.length} topics</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={activeTab === "explore" ? "default" : "outline"}
            className="rounded-full"
            onClick={() => setActiveTab("explore")}
          >
            Explore Topics
          </Button>
          <Button
            variant={activeTab === "browse" ? "default" : "outline"}
            className="rounded-full"
            onClick={() => setActiveTab("browse")}
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Browse All
          </Button>
        </div>
      </header>

      {/* Daily Challenge Banner - DYNAMIC */}
      <Card className="overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-primary-800 text-white relative border-none shadow-xl shadow-indigo-900/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        
        <div className="p-6 md:p-10 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-widest">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                TOPIC OF THE DAY
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
              {dailyTopic.name}
            </h2>
            <p className="text-indigo-100 text-lg max-w-md font-medium leading-relaxed">
              {dailyTopic.description}
            </p>
            <div className="flex items-center gap-4 justify-center md:justify-start pt-2">
               <div className="flex -space-x-2">
                 {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-indigo-600 bg-indigo-400" />)}
               </div>
               <p className="text-xs text-indigo-200 font-semibold">Join 400+ students practicing this today</p>
            </div>
          </div>
          
          <div className="shrink-0 flex flex-col items-center gap-3">
            <Link href={`/vocabulary/topic/${dailyTopic.slug}`}>
              <Button size="lg" className="bg-white text-indigo-700 hover:bg-slate-100 rounded-2xl h-16 px-10 font-bold shadow-2xl transition-transform hover:scale-105 active:scale-95 text-lg">
                <Play className="w-5 h-5 mr-3 fill-current" /> Start Routine
              </Button>
            </Link>
            <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest tabular-nums flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" /> Next refresh in {timeLeft}
            </p>
          </div>
        </div>
      </Card>

      {/* Wordbook / Saved */}
      <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-800 transition-colors cursor-pointer group shadow-sm">
        <Link href="/vocabulary/saved" className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center group-hover:bg-primary-100 group-hover:text-primary-600 dark:group-hover:bg-primary-900/30 dark:group-hover:text-primary-400 transition-colors">
              <BookmarkCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg dark:text-white">My Wordbook</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Review your saved and weak words</p>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-primary-50 dark:group-hover:bg-primary-950/50 transition-colors">
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-primary-500" />
          </div>
        </Link>
      </Card>

      {/* ── EXPLORE TAB ── */}
      {activeTab === "explore" && (
        <div>
          <div className="flex items-center gap-2 mb-6">
            <LayoutGrid className="w-5 h-5 text-slate-500" />
            <h3 className="text-xl font-bold font-display dark:text-white">Learn by Topic</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {VOCABULARY_TOPICS.map((topic, i) => {
              const count = VOCABULARY_DATA.filter(w => w.topic === topic.slug).length;
              const isLocked = !premium && i >= 4;
              const isDaily = dailyTopic.slug === topic.slug;

              const content = (
                <Card className={cn(
                  "p-6 transition-all h-full border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 group shadow-sm relative overflow-hidden",
                  isLocked ? 'opacity-40 grayscale' : 'hover:border-primary-500 dark:hover:border-primary-500 hover:shadow-xl cursor-pointer',
                  isDaily && "ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-950 shadow-indigo-500/10"
                )}>
                  {isDaily && (
                    <div className="absolute top-0 right-0">
                      <div className="bg-indigo-600 text-white text-[9px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-widest flex items-center gap-1 shadow-lg">
                        <Zap className="w-3 h-3 fill-current" /> DAILY
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-start mb-6">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl shadow-sm transition-transform group-hover:scale-110",
                      isDaily ? "bg-indigo-600 text-white" : "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                    )}>
                      {topic.name.charAt(0)}
                    </div>
                    <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full font-bold uppercase tracking-wider">{count} words</span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-2 text-lg group-hover:text-indigo-600 transition-colors">{topic.name}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 font-medium leading-relaxed">{topic.description}</p>
                  
                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center text-xs text-primary-600 dark:text-primary-400 font-bold group-hover:gap-2 transition-all gap-1">
                      Explore {topic.name} <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </Card>
              );

              if (isLocked) {
                return (
                  <LockedCard 
                    key={topic.slug} 
                    title="Expert Vocabulary" 
                    description="Unlock specialized topics for professional fluency"
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
        </div>
      )}

      {/* ── BROWSE ALL TAB ── */}
      {activeTab === "browse" && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search words, meanings..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10 h-12 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Difficulty Filter */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Difficulty</p>
              <div className="flex flex-wrap gap-2">
                {DIFFICULTIES.map(d => (
                  <button
                    key={d}
                    onClick={() => setSelectedDifficulty(d)}
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                      selectedDifficulty === d
                        ? "bg-primary-600 text-white shadow-md"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Topic Filter */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Topic</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedTopic("all")}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                    selectedTopic === "all"
                      ? "bg-indigo-600 text-white shadow-md"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                  }`}
                >
                  All Topics
                </button>
                {VOCABULARY_TOPICS.map(t => (
                  <button
                    key={t.slug}
                    onClick={() => setSelectedTopic(t.slug as TopicSlug)}
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                      selectedTopic === t.slug
                        ? "bg-indigo-600 text-white shadow-md"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Filters Reset */}
            {hasActiveFilters && (
              <div className="flex items-center justify-between bg-primary-50 dark:bg-primary-900/10 rounded-xl px-4 py-2">
                <span className="text-sm text-primary-700 dark:text-primary-400 font-medium">
                  Showing {filteredWords.length} words
                </span>
                <button
                  onClick={() => { setSearch(""); setSelectedDifficulty("All"); setSelectedTopic("all"); }}
                  className="text-sm text-primary-600 hover:text-primary-800 font-bold flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Clear filters
                </button>
              </div>
            )}
          </div>

          {/* Word Grid */}
          {filteredWords.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 dark:bg-slate-900 rounded-3xl">
              <p className="text-slate-500">No words matched your search. Try different filters.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredWords.map((word, index) => {
                const isLocked = !premium && index >= 3;
                if (isLocked) {
                  return (
                    <LockedCard 
                      key={word.id} 
                      title="Pro Vocabulary" 
                      description="Upgrade to access all 500+ premium words"
                    >
                      <WordCard word={word} />
                    </LockedCard>
                  );
                }
                return <WordCard key={word.id} word={word} />;
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
