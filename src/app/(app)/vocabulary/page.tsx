"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, BookmarkCheck, ArrowRight, Play, LayoutGrid, Search, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import {
  VOCABULARY_TOPICS,
  VOCABULARY_DATA,
  getFilteredWords,
  type Difficulty,
  type TopicSlug,
} from "@/lib/data/vocabularyData";
import { WordCard } from "@/components/vocabulary/WordCard";

const DIFFICULTIES: (Difficulty | "All")[] = ["All", "Beginner", "Intermediate", "Advanced"];

export default function VocabularyHub() {
  const [activeTab, setActiveTab] = useState<"explore" | "browse">("explore");
  const [search, setSearch] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | "All">("All");
  const [selectedTopic, setSelectedTopic] = useState<TopicSlug | "all">("all");

  const filteredWords = useMemo(
    () => getFilteredWords(selectedDifficulty, selectedTopic, search),
    [selectedDifficulty, selectedTopic, search]
  );

  const hasActiveFilters = selectedDifficulty !== "All" || selectedTopic !== "all" || search !== "";

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

      {/* Daily Challenge Banner */}
      <Card className="overflow-hidden bg-gradient-to-br from-primary-600 to-indigo-700 text-white relative border-none shadow-xl shadow-primary-900/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px]" />
        <div className="p-6 md:p-8 relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-sm font-medium mb-4">
              <BookOpen className="w-4 h-4" />
              Today's Recommended Set
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">5 Words of the Day</h2>
            <p className="text-primary-100 max-w-md">
              Start with today's curated set — then browse the full library at your own pace!
            </p>
          </div>
          <Link href="/vocabulary/daily">
            <Button size="lg" className="bg-white text-primary-700 hover:bg-slate-100 rounded-full font-bold shadow-lg">
              <Play className="w-4 h-4 mr-2 fill-current" /> Start Daily Set
            </Button>
          </Link>
        </div>
      </Card>

      {/* Wordbook / Saved */}
      <Card className="p-4 hover:border-primary-300 dark:hover:border-primary-800 transition-colors cursor-pointer group">
        <Link href="/vocabulary/saved" className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center group-hover:bg-primary-100 group-hover:text-primary-600 transition-colors">
              <BookmarkCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">My Wordbook</h3>
              <p className="text-sm text-slate-500">Review your saved and weak words</p>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center group-hover:bg-primary-50 dark:group-hover:bg-primary-950/50 transition-colors">
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-primary-500" />
          </div>
        </Link>
      </Card>

      {/* ── EXPLORE TAB ── */}
      {activeTab === "explore" && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <LayoutGrid className="w-5 h-5 text-slate-500" />
            <h3 className="text-xl font-bold font-display">Browse by Topic</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {VOCABULARY_TOPICS.map(topic => {
              const count = VOCABULARY_DATA.filter(w => w.topic === topic.slug).length;
              return (
                <Link key={topic.slug} href={`/vocabulary/topic/${topic.slug}`}>
                  <Card className="p-5 hover:border-primary-300 dark:hover:border-primary-800 transition-all hover:shadow-md cursor-pointer h-full border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg">
                        {topic.name.charAt(0)}
                      </div>
                      <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full font-medium">{count} words</span>
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-1">{topic.name}</h4>
                    <p className="text-sm text-slate-500 line-clamp-2">{topic.description}</p>
                    <div className="mt-3 flex items-center text-xs text-primary-600 dark:text-primary-400 font-semibold group-hover:gap-2 transition-all gap-1">
                      Start learning <ArrowRight className="w-3 h-3" />
                    </div>
                  </Card>
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
                className="pl-10 h-12 rounded-xl"
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
              {filteredWords.map(word => (
                <WordCard key={word.id} word={word} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
