"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Timer, Play } from "lucide-react";
import Link from "next/link";
import { VideoService } from "@/lib/services/videoService";
import { VideoLearningObject } from "@/lib/data/dailyVideos";
import { VideoCard } from "./VideoCard";

export function DailyVideoWidget() {
  const [videos, setVideos] = useState<VideoLearningObject[]>([]);
  const [progress, setProgress] = useState<Record<string, any>>({});
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    async function init() {
      // 1. Fetch Rotated Videos
      const daily = await VideoService.getDailyVideosAsync();
      setVideos(daily);

      // 2. Load Progress
      if (daily.length > 0) {
        VideoService.getUserProgress(daily.map(v => v.id)).then(setProgress);
      }
    }

    init();

    // Refresh Timer
    const timer = setInterval(() => {
      const now = new Date();
      // Calculate next 4-hour slot (0, 4, 8, 12, 16, 20)
      const currentHour = now.getHours();
      const nextRefreshHour = Math.ceil((currentHour + 0.1) / 4) * 4;
      
      const next = new Date(now);
      next.setHours(nextRefreshHour % 24, 0, 0, 0);
      if (nextRefreshHour >= 24) next.setDate(now.getDate() + 1);

      const diff = next.getTime() - now.getTime();
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft(`${hours}h ${mins}m ${secs}s`);
      
      // Auto-refresh if timer hits zero
      if (diff <= 1000) {
        init();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (videos.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary-100 dark:bg-primary-900/30 text-primary-600 p-1.5 rounded-lg">
             <Sparkles className="w-4 h-4" />
          </div>
          <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white">Daily English Videos</h2>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-900 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-wider">
           <Timer className="w-3 h-3" />
           Next refresh: <span className="text-primary-600 dark:text-primary-400 tabular-nums">{timeLeft}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {videos.map((video) => (
          <VideoCard 
            key={video.id} 
            video={video} 
            isWatched={progress[video.id]?.watched}
            isSaved={progress[video.id]?.saved}
            progress={progress[video.id]?.progress_seconds}
          />
        ))}
      </div>

      <div className="flex justify-center pt-2">
        <Link href="/learn/videos">
          <Button variant="ghost" className="text-primary-600 font-bold hover:bg-primary-50 dark:hover:bg-primary-950/30">
            View Video Hub <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
