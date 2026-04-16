"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, CheckCircle2, Bookmark, BookmarkCheck, MessageSquareText, BookOpen, Quote, FileText, Sparkles, Loader2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { VideoService } from "@/lib/services/videoService";
import { VideoLearningObject, DAILY_VIDEOS } from "@/lib/data/dailyVideos";

export default function VideoPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const videoId = params?.id as string;

  const [video, setVideo] = useState<VideoLearningObject | null>(null);
  const [activeTab, setActiveTab] = useState<"summary" | "vocab" | "phrases" | "transcript">("summary");
  const [isSaved, setIsSaved] = useState(false);
  const [isWatched, setIsWatched] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isReplacing, setIsReplacing] = useState(false);

  useEffect(() => {
    async function loadVideo() {
      if (!videoId) return;
      setLoading(true);
      
      try {
        // 1. Try static array first (for legacy/demo support)
        let foundVideo = DAILY_VIDEOS.find(v => v.id === videoId);
        
        // 2. If not found, fetch from Supabase
        if (!foundVideo) {
          foundVideo = await VideoService.getVideoByIdAsync(videoId) || undefined;
        }

        if (!foundVideo) {
          console.error("Video not found:", videoId);
          router.push("/learn/videos");
          return;
        }

        setVideo(foundVideo);

        // 3. Load user progress
        const progressData = await VideoService.getUserProgress([videoId]);
        const p = progressData[videoId];
        if (p) {
          setIsSaved(p.saved);
          setIsWatched(p.watched);
        }
      } catch (err) {
        console.error("Error loading video details:", err);
        router.push("/learn/videos");
      } finally {
        setLoading(false);
      }
    }

    loadVideo();
  }, [videoId, router]);

  const toggleSave = () => {
    const newSaved = !isSaved;
    setIsSaved(newSaved);
    VideoService.toggleSave(videoId, newSaved);
  };

  const startPractice = () => {
    if (!video) return;
    const practiceUrl = `/practice/conversation/tutor?mode=guided&scenario=video_practice&topic=${encodeURIComponent(video.title)}&context=${encodeURIComponent(video.summary)}`;
    router.push(practiceUrl);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        <p className="text-slate-500 font-medium">Loading video content...</p>
      </div>
    );
  }

  if (!video) return null;

  const youtubeWatchUrl = `https://www.youtube.com/watch?v=${video.youtubeId}`;
  const youtubeEmbedUrl = `https://www.youtube.com/embed/${video.youtubeId}?rel=0&autoplay=0&enablejsapi=1`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-32">
      <header className="p-4 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link href="/learn/videos">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="font-bold text-slate-900 dark:text-white line-clamp-1 max-w-[200px] md:max-w-none">{video.title}</h1>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={toggleSave}
          className={`rounded-full gap-2 ${isSaved ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : ''}`}
        >
          {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          {isSaved ? "Saved" : "Save"}
        </Button>
      </header>

      <div className="max-w-4xl mx-auto space-y-6 p-4 md:p-6 text-slate-900 dark:text-white">
        {/* Responsive Video Player Section */}
        <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl relative">
          {isReplacing ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white z-20">
              <Sparkles className="w-10 h-10 mb-4 text-primary-400 animate-pulse" />
              <p className="text-lg font-bold">Refreshing video content...</p>
            </div>
          ) : (
            <iframe
              src={youtubeEmbedUrl}
              className="absolute inset-0 w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              title={video.title}
            ></iframe>
          )}
        </div>

        {/* Playback Fallback & Meta Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
             <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Difficulty:</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  video.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' : 
                  video.difficulty === 'Intermediate' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                }`}>
                  {video.difficulty}
                </span>
             </div>
             <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 hidden md:block" />
             <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Topic:</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{video.category}</span>
             </div>
             
             {/* New Fallback Button */}
             <a href={youtubeWatchUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm" className="text-[10px] font-bold h-7 px-3 flex gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
                   <ExternalLink className="w-3 h-3" />
                   WATCH ON YOUTUBE
                </Button>
             </a>
          </div>

          <Button onClick={startPractice} className="bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-full px-6 shadow-lg shadow-primary-500/20">
            <Sparkles className="w-4 h-4 mr-2" /> Start AI Practice
          </Button>
        </div>

        {/* Tabs Section */}
        <div className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-6">
          <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar gap-6">
            {[
              { id: "summary", label: "Summary", icon: FileText },
              { id: "vocab", label: "Vocabulary", icon: BookOpen },
              { id: "phrases", label: "Key Phrases", icon: Quote },
              { id: "transcript", label: "Transcript", icon: MessageSquareText },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 border-b-2 transition-all shrink-0 font-bold text-sm ${
                  activeTab === tab.id 
                    ? 'border-primary-600 text-primary-600' 
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <Card className="p-6 min-h-[250px] animate-in fade-in slide-in-from-top-2 border-slate-100 dark:border-slate-900 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm">
            {activeTab === "summary" && (
              <div className="space-y-4">
                <h3 className="font-bold text-lg">What you'll learn</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{video.summary}</p>
                {isWatched && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 rounded-xl flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Completed! You can now start practice.</span>
                  </div>
                )}
              </div>
            )}

            {activeTab === "vocab" && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {video.vocabulary.map((item, i) => (
                    <div key={i} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-primary-200 transition-colors">
                      <div className="flex justify-between items-start mb-1">
                         <span className="font-bold text-slate-900 dark:text-white">{item.word}</span>
                      </div>
                      <p className="text-sm text-slate-500 mb-2">{item.meaning}</p>
                      <p className="text-xs italic text-slate-400 dark:text-slate-600">e.g. "{item.example}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "phrases" && (
              <div className="space-y-4">
                {video.keyPhrases.map((item, i) => (
                  <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <p className="font-bold text-slate-900 dark:text-white mb-2 leading-tight">"{item.phrase}"</p>
                    <p className="text-sm text-slate-500">{item.context}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "transcript" && (
              <div className="space-y-4">
                {video.transcript.length > 0 ? (
                  <div className="space-y-4">
                    {video.transcript.map((line, i) => (
                      <div key={i} className="flex gap-4 group">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-600 tabular-nums w-8 pt-0.5">
                          {Math.floor(line.start / 60)}:{(line.start % 60).toString().padStart(2, '0')}
                        </span>
                        <p className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">
                          {line.text}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 italic text-center py-12">No transcript available for this video.</p>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
