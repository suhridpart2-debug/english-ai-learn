"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Volume2, Sparkles, RefreshCw } from "lucide-react";
import Link from "next/link";
import { VocabService } from "@/lib/services/vocabService";
import { VocabularyWord } from "@/lib/data/vocabularyData";

import { cn } from "@/lib/utils";
import { LockedCard } from "@/components/usage/LockedCard";

export function DailyVocabWidget({ isPremium }: { isPremium: boolean }) {
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [learnedIds, setLearnedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadWords = async () => {
    setIsLoading(true);
    try {
      const daily = await VocabService.getDailyWordsAsync();
      const learned = await VocabService.getLearnedWordIds();
      setWords(daily);
      setLearnedIds(learned);
    } catch (err) {
      console.error("DailyVocabWidget: Error loading words", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWords();
  }, []);

  if (isLoading) return (
    <div className="h-48 flex items-center justify-center">
       <RefreshCw className="w-6 h-6 animate-spin text-primary-500" />
    </div>
  );

  if (words.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 p-1.5 rounded-lg">
             <BookOpen className="w-4 h-4" />
          </div>
          <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white">Vocabulary of the Day</h2>
        </div>
        {!isPremium && (
          <span className="text-[10px] font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-600 px-2 py-1 rounded-full uppercase tracking-widest">
            Free Preview
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {words.map((word, index) => {
          const isLearned = learnedIds.includes(word.id);
          const isLocked = !isPremium && index >= 2;

          const card = (
            <Card className={cn(
              "p-4 h-full flex flex-col items-center text-center transition-all border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:shadow-md cursor-pointer relative group",
              isLearned && "bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/30",
              isLocked && "opacity-40 grayscale"
            )}>
              {isLearned && !isLocked && (
                 <div className="absolute top-2 right-2">
                   <Sparkles className="w-3 h-3 text-emerald-500" />
                 </div>
              )}
              <span className="text-lg font-black text-slate-900 dark:text-white mb-1 group-hover:text-primary-600">
                {word.word}
              </span>
              <span className="text-[10px] font-medium text-slate-400 mb-2 italic">
                /{word.pronunciation}/
              </span>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {word.meaning}
              </p>
              <div className={`mt-auto pt-3 text-[9px] font-bold uppercase tracking-widest ${
                word.difficulty === 'Beginner' ? 'text-green-500' : 
                word.difficulty === 'Intermediate' ? 'text-amber-500' : 'text-purple-500'
              }`}>
                {word.difficulty}
              </div>
            </Card>
          );

          if (isLocked) {
            return (
              <LockedCard 
                key={word.id} 
                title="Expert Vocab" 
                description="Unlock full daily 5-word set"
              >
                {card}
              </LockedCard>
            );
          }

          return (
            <Link key={word.id} href={`/vocabulary?word=${word.id}`}>
              {card}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
