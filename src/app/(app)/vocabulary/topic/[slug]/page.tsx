"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { WordCard } from "@/components/vocabulary/WordCard";
import { VOCABULARY_DATA, VOCABULARY_TOPICS, getDailyShuffledWords, type VocabularyWord } from "@/lib/data/vocabularyData";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Lock, Crown, Sparkles, Clock } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { isPremium } from "@/lib/services/subscriptionService";
import { LockedCard } from "@/components/usage/LockedCard";

export default function TopicVocabulary() {
  const params = useParams();
  const rawSlug = params?.slug as string;
  const slug = rawSlug;

  const [premium, setPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    async function checkPremium() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      setPremium(isPremium(profile));
      setLoading(false);
    }
    checkPremium();

    // Timer logic matching the hub
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

  const topicData = VOCABULARY_TOPICS.find(t => t.slug === slug);
  
  // Deterministically shuffle the pool of words for this topic based on the date
  const allWords = useMemo(() => {
    const baseWords = VOCABULARY_DATA.filter(w => w.topic === slug);
    return getDailyShuffledWords(baseWords);
  }, [slug]);
  
  // Strict Slicing for Free Users - now showing a DIFFERENT subset every day!
  const visibleWords = premium ? allWords : allWords.slice(0, 3);
  const hasLockedWords = !premium && allWords.length > 3;

  if (!topicData) {
    return <div className="p-10 text-center">Topic not found</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 pb-32 md:pb-6 animate-in fade-in duration-500">
      <header className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
        <Link href="/vocabulary">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ChevronLeft className="w-6 h-6" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-2 mb-1">
             <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white capitalize">
               {topicData.name} Vocabulary
             </h1>
             {!premium && <Lock className="w-4 h-4 text-slate-400" />}
          </div>
          <div className="flex items-center gap-3">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {premium ? `${allWords.length} words available` : `Preview: 3 of ${allWords.length} words`}
            </p>
            <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded-md">
              <Clock className="w-3 h-3" />
              Rotates in {timeLeft}
            </div>
          </div>
        </div>
      </header>

      {/* Daily Routine Badge */}
      <div className="bg-gradient-to-r from-indigo-50 to-indigo-100/50 dark:from-indigo-900/10 dark:to-indigo-900/5 p-4 rounded-2xl flex items-center justify-between border border-indigo-100 dark:border-indigo-900/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-100">Daily Routine Active</h3>
            <p className="text-xs text-indigo-700 dark:text-indigo-300 opacity-80">We've picked these words for you today.</p>
          </div>
        </div>
        <Link href="/vocabulary">
          <Button variant="ghost" size="sm" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30">
            Switch Topic
          </Button>
        </Link>
      </div>

      {allWords.length === 0 ? (
        <div className="text-center p-12 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <p className="text-slate-500 dark:text-slate-400">More words coming soon to this topic.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {visibleWords.map((word, index) => (
            <div key={word.id} className="relative">
              <div className="absolute -left-2 md:-left-4 top-8 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-bold flex items-center justify-center text-xs z-10 border-2 border-white dark:border-slate-950 shadow-sm">
                {index + 1}
              </div>
              <div className="pl-4 md:pl-8">
                <WordCard word={word} />
              </div>
            </div>
          ))}

          {hasLockedWords && (
            <div className="pt-8">
              <LockedCard 
                title="Unlock the Full List" 
                description={`You've reached the free limit. There are ${allWords.length - 3} more professional terms waiting for you in this topic.`}
              >
                <div className="space-y-4 opacity-20 pointer-events-none blur-sm">
                   {allWords.slice(3, 5).map(w => <WordCard key={w.id} word={w} />)}
                </div>
              </LockedCard>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
