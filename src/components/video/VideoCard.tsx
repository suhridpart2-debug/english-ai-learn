"use client";

import { Card } from "@/components/ui/card";
import { Play, Clock, CheckCircle2, Bookmark, BookmarkCheck } from "lucide-react";
import Link from "next/link";
import { VideoLearningObject } from "@/lib/data/dailyVideos";

interface VideoCardProps {
  video: VideoLearningObject;
  isWatched?: boolean;
  isSaved?: boolean;
  progress?: number;
}

export function VideoCard({ video, isWatched, isSaved, progress }: VideoCardProps) {
  return (
    <Link href={`/learn/videos/${video.id}`} className="block group">
      <Card className="overflow-hidden border-slate-200 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-800 transition-all hover:shadow-lg h-full flex flex-col">
        {/* Thumbnail Placeholder / Image */}
        <div className="aspect-video bg-slate-100 dark:bg-slate-900 relative">
          <img 
            src={`https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`} 
            alt={video.title}
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop'; // Educational fallback image
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-black/10 dark:bg-black/40 group-hover:bg-black/5 dark:group-hover:bg-black/20 transition-colors" />
          
          <div className="absolute top-2 right-2 flex gap-2">
            {isSaved && (
              <div className="bg-primary-600 text-white p-1.5 rounded-full shadow-lg">
                <BookmarkCheck className="w-3.5 h-3.5" />
              </div>
            )}
            {isWatched && (
              <div className="bg-emerald-500 text-white p-1.5 rounded-full shadow-lg">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            )}
          </div>

          <div className="absolute bottom-2 right-2 bg-slate-900/80 dark:bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded">
            {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
          </div>

          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-12 h-12 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-xl">
              <Play className="w-6 h-6 fill-current" />
            </div>
          </div>
          
          {/* Progress Bar */}
          {progress && progress > 0 && (
            <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-200 dark:bg-slate-800">
               <div 
                 className="h-full bg-primary-500" 
                 style={{ width: `${(progress / video.duration) * 100}%` }}
               />
            </div>
          )}
        </div>

        <div className="p-4 flex-1 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full 
              ${video.difficulty === 'Beginner' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 
                video.difficulty === 'Intermediate' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' : 
                'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'}`}>
              {video.difficulty}
            </span>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              {video.category}
            </span>
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-primary-600 transition-colors">
            {video.title}
          </h3>
          <p className="text-xs text-slate-500 mt-2 line-clamp-2">
            {video.summary}
          </p>
        </div>
      </Card>
    </Link>
  );
}
