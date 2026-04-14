"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { WordCard } from "@/components/vocabulary/WordCard";
import { VOCABULARY_DATA, VOCABULARY_TOPICS, type VocabularyWord } from "@/lib/data/vocabularyData";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { use } from "react";

export default function TopicVocabulary() {
  const params = useParams();
  const rawSlug = params?.slug as string;
  const slug = rawSlug;

  const topicData = VOCABULARY_TOPICS.find(t => t.slug === slug);
  const words = VOCABULARY_DATA.filter(w => w.topic === slug);

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
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white capitalize">
            {topicData.name} Vocabulary
          </h1>
          <p className="text-sm text-slate-500">{words.length} words inside this topic.</p>
        </div>
      </header>

      {words.length === 0 ? (
        <div className="text-center p-12 bg-slate-50 dark:bg-slate-900 rounded-3xl">
          <p className="text-slate-500">More words coming soon to this topic.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {words.map((word, index) => (
            <div key={word.id} className="relative">
              <div className="absolute -left-4 top-6 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold flex items-center justify-center text-xs ml-4 z-10 border border-white dark:border-slate-950">
                {index + 1}
              </div>
              <div className="pl-6">
                <WordCard word={word} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
