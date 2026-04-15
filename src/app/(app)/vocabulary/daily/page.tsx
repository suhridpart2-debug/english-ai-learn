"use client";

import { useState, useEffect } from "react";
import { WordCard } from "@/components/vocabulary/WordCard";
import { getTodayRotatedWordsAsync, type VocabularyWord } from "@/lib/data/vocabularyData";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Trophy } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { createClient } from "@/lib/supabase/client";

export default function DailyVocabulary() {
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function loadWords() {
      const daily = await getTodayRotatedWordsAsync(supabase);
      setWords(daily);
    }
    loadWords();
  }, []);

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(c => c + 1);
    } else {
      setIsFinished(true);
      triggerConfetti();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(c => c - 1);
    }
  };

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  if (words.length === 0) return null;

  if (isFinished) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/20">
          <Trophy className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-display font-black mb-4">Awesome Work!</h1>
        <p className="text-lg text-slate-500 max-w-sm mb-8">
          You've completed your 5 daily words. Consistency is the key to building a strong vocabulary.
        </p>
        <div className="flex gap-4">
          <Link href="/vocabulary">
            <Button variant="outline" size="lg" className="rounded-full">Back to Hub</Button>
          </Link>
          <Link href="/vocabulary/saved">
             <Button size="lg" className="rounded-full bg-primary-600">View Wordbook</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentWord = words[currentIndex];

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6 pb-32 md:pb-6">
      {/* Header / Progress */}
      <header className="flex items-center justify-between mb-8">
        <Link href="/vocabulary">
          <Button variant="ghost" size="icon" className="rounded-full text-slate-500">
            <ChevronLeft className="w-6 h-6" />
          </Button>
        </Link>
        <div className="flex gap-2">
          {words.map((_, i) => (
            <div 
              key={i} 
              className={`h-2 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-8 bg-primary-600' : i < currentIndex ? 'w-2 bg-emerald-500' : 'w-2 bg-slate-200 dark:bg-slate-800'}`}
            />
          ))}
        </div>
        <div className="w-10" /> {/* Spacer for centering */}
      </header>

      {/* Main Card Area with Animation Validation Check */}
      <div className="relative min-h-[500px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <WordCard 
               word={currentWord} 
               onMarkLearned={() => handleNext()} 
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Manual Navigation */}
      <div className="flex justify-between items-center pt-8 border-t border-slate-100 dark:border-slate-800/50 mt-12 relative z-10">
        <Button variant="ghost" onClick={handlePrev} disabled={currentIndex === 0} className="rounded-full">
          Previous
        </Button>
        <span className="text-sm font-bold text-slate-400">
          {currentIndex + 1} of {words.length}
        </span>
        <Button onClick={handleNext} className="rounded-full px-6">
          {currentIndex === words.length - 1 ? 'Finish' : 'Next Word'} <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
