"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, BookOpen, Layers, Filter } from "lucide-react";
import Link from "next/link";
import { SPEAKING_TOPICS, SpeakingTopic } from "@/lib/data/topicData";

const CATEGORIES = ["All", "General", "Technology", "Education", "Travel", "Social", "Work", "Hobbies"];
const DIFFICULTIES = ["All", "Beginner", "Intermediate", "Advanced"];

export default function TopicCatalogPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");

  const filteredTopics = SPEAKING_TOPICS.filter((t) => {
    const matchesSearch = t.topic.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" || t.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === "All" || t.difficulty === selectedDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 pb-32 md:pb-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/practice">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ChevronLeft className="w-6 h-6" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Topic Catalog</h1>
            <p className="text-slate-500">Choose from {SPEAKING_TOPICS.length}+ speaking topics to practice.</p>
          </div>
        </div>
      </header>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search topics..." 
            className="pl-9 rounded-xl border-slate-200"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-500 text-sm whitespace-nowrap">
            <Layers className="w-4 h-4" /> Category:
          </div>
          {CATEGORIES.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              className="rounded-full whitespace-nowrap"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 items-center">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-500 text-sm whitespace-nowrap">
          <Filter className="w-4 h-4" /> Difficulty:
        </div>
        {DIFFICULTIES.map((diff) => (
          <Button
            key={diff}
            variant={selectedDifficulty === diff ? "secondary" : "ghost"}
            size="sm"
            className="rounded-full"
            onClick={() => setSelectedDifficulty(diff)}
          >
            {diff}
          </Button>
        ))}
      </div>

      {/* Topics Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTopics.length > 0 ? (
          filteredTopics.map((topic) => (
            <Link key={topic.id} href={`/practice/topic/${topic.id}`}>
              <Card className="p-6 h-full border-slate-200 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-800 transition-all hover:shadow-lg group cursor-pointer flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                      topic.difficulty === 'Beginner' ? 'bg-emerald-100 text-emerald-700' :
                      topic.difficulty === 'Intermediate' ? 'bg-blue-100 text-blue-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {topic.difficulty}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{topic.category}</span>
                  </div>
                  <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white mb-4 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    "{topic.topic}"
                  </h3>
                </div>
                <Button className="w-full rounded-full gap-2 group-hover:bg-primary-700 transition-all">
                  <BookOpen className="w-4 h-4" /> Start Speaking
                </Button>
              </Card>
            </Link>
          ))
        ) : (
          <div className="col-span-full py-12 text-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
            <p className="text-slate-500">No topics match your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
