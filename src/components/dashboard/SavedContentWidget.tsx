"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Bookmark, Video, Book, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { VideoService } from "@/lib/services/videoService";
import { VocabService } from "@/lib/services/vocabService";
import { VideoLearningObject } from "@/lib/data/dailyVideos";
import { VocabularyWord } from "@/lib/data/vocabularyData";
import { VideoCard } from "../video/VideoCard";
import { Button } from "@/components/ui/button";

export function SavedContentWidget() {
  const [savedVideos, setSavedVideos] = useState<VideoLearningObject[]>([]);
  const [savedWords, setSavedWords] = useState<VocabularyWord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState<Record<string, any>>({});

  const loadSaved = async () => {
    setIsLoading(true);
    try {
      const [videos, words] = await Promise.all([
        VideoService.getSavedVideosAsync(),
        VocabService.getSavedWordsAsync()
      ]);
      setSavedVideos(videos);
      setSavedWords(words);
      
      if (videos.length > 0) {
        const prog = await VideoService.getUserProgress(videos.map(v => v.id));
        setProgress(prog);
      }
    } catch (err) {
      console.error("SavedContentWidget: Error loading", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSaved();
  }, []);

  if (isLoading) return (
    <div className="flex justify-center p-8">
      <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
    </div>
  );

  if (savedVideos.length === 0 && savedWords.length === 0) return null;

  return (
    <section className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 p-1.5 rounded-lg">
             <Bookmark className="w-4 h-4 fill-current" />
          </div>
          <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white">Saved for Later</h2>
        </div>
        <Link href="/vocabulary/saved">
           <Button variant="ghost" size="sm" className="text-slate-500 font-bold hover:text-primary-600">
              Full Library <ArrowRight className="w-4 h-4 ml-1" />
           </Button>
        </Link>
      </div>

      <div className="space-y-8">
        {savedVideos.length > 0 && (
          <div className="space-y-3">
             <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
               <Video className="w-3.5 h-3.5" /> Saved Videos
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {savedVideos.slice(0, 3).map(video => (
                  <VideoCard 
                    key={video.id} 
                    video={video} 
                    isSaved={true}
                    isWatched={progress[video.id]?.watched}
                    progress={progress[video.id]?.progress_seconds}
                    onStateChange={loadSaved}
                  />
                ))}
             </div>
          </div>
        )}

        {savedWords.length > 0 && (
          <div className="space-y-3">
             <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
               <Book className="w-3.5 h-3.5" /> Bookmarked Words
             </h3>
             <div className="flex flex-wrap gap-2">
                {savedWords.slice(0, 10).map(word => (
                  <Link key={word.id} href={`/vocabulary?word=${word.id}`}>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl shadow-sm hover:border-primary-300 dark:hover:border-primary-800 transition-all group flex items-center gap-2">
                       <span className="font-bold text-slate-900 dark:text-white group-hover:text-primary-600">{word.word}</span>
                       <span className="text-xs text-slate-400 group-hover:text-primary-400">/{word.pronunciation}/</span>
                    </div>
                  </Link>
                ))}
                {savedWords.length > 10 && (
                  <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                    + {savedWords.length - 10} more
                  </div>
                )}
             </div>
          </div>
        )}
      </div>
    </section>
  );
}
