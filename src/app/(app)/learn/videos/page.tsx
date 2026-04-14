"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, History, Bookmark, Sparkles, Timer, PlayCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { VideoService } from "@/lib/services/videoService";
import { VideoLearningObject, DAILY_VIDEOS } from "@/lib/data/dailyVideos";
import { VideoCard } from "@/components/video/VideoCard";
import { Card } from "@/components/ui/card";

export default function VideoHubPage() {
  const [dailyVideos, setDailyVideos] = useState<VideoLearningObject[]>([]);
  const [progress, setProgress] = useState<Record<string, any>>({});
  const [allVideos, setAllVideos] = useState<VideoLearningObject[]>(DAILY_VIDEOS);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const daily = VideoService.getDailyVideos();
    setDailyVideos(daily);
    
    // Load progress for all videos to categorize them
    VideoService.getUserProgress(DAILY_VIDEOS.map(v => v.id)).then(setProgress);

    const timer = setInterval(() => {
        const next = VideoService.getNextRefreshTime();
        const diff = next.getTime() - new Date().getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${hours}h ${mins}m ${secs}s`);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const savedVideos = allVideos.filter(v => progress[v.id]?.saved);
  const watchedVideos = allVideos.filter(v => progress[v.id]?.watched && !dailyVideos.find(d => d.id === v.id));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-10 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/learn">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Video Hub</h1>
            <p className="text-slate-500">Daily learning content tailored for your level.</p>
          </div>
        </div>
      </header>

      {/* Featured Daily Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-display flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary-500" /> Today's Featured
          </h2>
          <div className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-full flex items-center gap-1.5">
            <Timer className="w-3 h-3" /> NEXT REFRESH: <span className="text-primary-600 tabular-nums">{timeLeft}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {dailyVideos.map(video => (
            <VideoCard 
              key={video.id} 
              video={video} 
              isWatched={progress[video.id]?.watched}
              isSaved={progress[video.id]?.saved}
              progress={progress[video.id]?.progress_seconds}
            />
          ))}
        </div>
      </section>

      {/* Saved for Later */}
      {savedVideos.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-xl font-bold font-display flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-indigo-500" /> Saved for Later
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {savedVideos.map(video => (
              <VideoCard 
                key={video.id} 
                video={video} 
                isWatched={progress[video.id]?.watched}
                isSaved={true}
                progress={progress[video.id]?.progress_seconds}
              />
            ))}
          </div>
        </section>
      )}

      {/* Recently Watched */}
      {watchedVideos.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-xl font-bold font-display flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-500" /> Recently Watched
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {watchedVideos.slice(0, 4).map(video => (
              <VideoCard 
                key={video.id} 
                video={video} 
                isWatched={true}
                isSaved={progress[video.id]?.saved}
                progress={progress[video.id]?.progress_seconds}
              />
            ))}
          </div>
        </section>
      )}

      {/* Explore All (Optional/Categories) */}
      <section className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-800">
         <h2 className="text-xl font-bold font-display">Explore Categories</h2>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["Conversation", "Interview", "Pronunciation", "Vocabulary"].map(cat => (
              <Card key={cat} className="p-6 flex flex-col items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer transition-colors border-dashed">
                 <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                    <PlayCircle className="w-6 h-6 text-slate-400" />
                 </div>
                 <p className="font-bold text-slate-700 dark:text-slate-300">{cat}</p>
                 <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">Browse All</p>
              </Card>
            ))}
         </div>
      </section>
    </div>
  );
}
