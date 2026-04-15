"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Play, CheckCircle2, Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import Link from "next/link";
import { VideoLearningObject } from "@/lib/data/dailyVideos";
import { supabase } from "@/lib/supabaseClient";

import { VideoService } from "@/lib/services/videoService";

interface VideoCardProps {
  video: VideoLearningObject;
  isWatched?: boolean;
  isSaved?: boolean;
  progress?: number;
  onStateChange?: () => void;
}

export function VideoCard({ video, isWatched, isSaved, progress, onStateChange }: VideoCardProps) {
  const [saved, setSaved] = useState(isSaved);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isUpdating) return;
    setIsUpdating(true);
    
    const newState = !saved;
    setSaved(newState);

    try {
      const { saved: finalState } = await VideoService.toggleSave(video.id, newState);
      setSaved(finalState);
      if (onStateChange) onStateChange();
    } catch (err: any) {
      console.error("VideoCard: Error toggling save", err);
      // Fallback UI error indication
      alert(err.message || "Failed to save video.");
      setSaved(!newState); // Revert
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Link href={`/learn/videos/${video.id}`} className="block group">
      <Card className={`overflow-hidden border-slate-200 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-800 transition-all hover:shadow-lg h-full flex flex-col ${isWatched ? 'opacity-80' : ''}`}>
        {/* Thumbnail Placeholder / Image */}
        <div className="aspect-video bg-slate-100 dark:bg-slate-900 relative">
          <img 
            src={`https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`} 
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-black/10 dark:bg-black/40 group-hover:bg-black/5 dark:group-hover:bg-black/20 transition-colors" />
          
          {/* Status Badges */}
          <div className="absolute top-2 left-2 flex gap-2">
            {isWatched && (
              <div className="bg-emerald-500 text-white px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span className="text-[10px] font-bold">Watched</span>
              </div>
            )}
          </div>

          <div className="absolute top-2 right-2 flex gap-2">
            <button 
              onClick={handleSaveToggle}
              disabled={isUpdating}
              className={`p-1.5 rounded-full shadow-lg transition-all ${saved ? 'bg-primary-600 text-white' : 'bg-white/90 text-slate-600 hover:bg-white dark:bg-slate-800/90 dark:text-slate-300'}`}
            >
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : (saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />)}
            </button>
          </div>

          <div className="absolute bottom-2 right-2 bg-slate-900/80 dark:bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded">
            {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
          </div>

          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-12 h-12 rounded-full bg-primary-600/90 text-white flex items-center justify-center shadow-xl backdrop-blur-sm">
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
          <p className="text-xs text-slate-500 mt-2 line-clamp-2 italic">
            {video.summary}
          </p>
        </div>
      </Card>
    </Link>
  );
}
