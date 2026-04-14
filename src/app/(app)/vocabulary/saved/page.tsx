"use client";

import { useEffect, useState } from "react";
import { WordCard } from "@/components/vocabulary/WordCard";
import { VOCABULARY_DATA, type VocabularyWord } from "@/lib/data/vocabularyData";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Loader2, BookmarkX } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function SavedWords() {
  const [savedWords, setSavedWords] = useState<VocabularyWord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSavedWords() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("saved_words")
        .select("word_id")
        .eq("user_id", session.user.id)
        .order("saved_at", { ascending: false });

      if (error) {
        console.error("Error loading saved words:", error);
      } else if (data) {
        const ids = data.map(d => d.word_id);
        const mappedWords = ids.map(id => VOCABULARY_DATA.find(v => v.id === id)).filter(Boolean) as VocabularyWord[];
        setSavedWords(mappedWords);
      }
      setIsLoading(false);
    }

    loadSavedWords();
  }, []);

  const handleUnsave = (wordId: string) => {
    // Optimistic UI update
    setSavedWords(current => current.filter(w => w.id !== wordId));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 pb-32 md:pb-6 animate-in fade-in duration-500">
      <header className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
        <Link href="/vocabulary">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ChevronLeft className="w-6 h-6" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
            My Wordbook
          </h1>
          <p className="text-sm text-slate-500">
            {isLoading ? "Loading..." : `${savedWords.length} words saved for revision.`}
          </p>
        </div>
      </header>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : savedWords.length === 0 ? (
        <div className="text-center p-12 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center">
          <BookmarkX className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-4" />
          <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-white">Your Wordbook is Empty</h3>
          <p className="text-slate-500 mb-6 max-w-sm">
            When you see a word you want to remember, tap the bookmark icon to save it here.
          </p>
          <Link href="/vocabulary/daily">
            <Button className="rounded-full shadow-lg border-2 border-primary-200 bg-white text-primary-700 hover:bg-primary-50">
              Explore Daily Words
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {savedWords.map((word) => (
            <WordCard 
              key={word.id} 
              word={word} 
              isSaved={true} 
              onSaveToggle={(id, isNowSaved) => {
                if (!isNowSaved) handleUnsave(id);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
