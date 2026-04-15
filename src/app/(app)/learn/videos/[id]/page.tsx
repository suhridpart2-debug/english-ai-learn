"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Play, Bookmark, BookmarkCheck, CheckCircle2, MessageSquareText, BookOpen, Quote, FileText, Sparkles } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { VideoService } from "@/lib/services/videoService";
import { VideoLearningObject, DAILY_VIDEOS } from "@/lib/data/dailyVideos";
import { supabase } from "@/lib/supabaseClient";

// Import for events without SSR
const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

export default function VideoPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const videoId = params?.id as string;
  const video = DAILY_VIDEOS.find(v => v.id === videoId);

  const [activeTab, setActiveTab] = useState<"summary" | "vocab" | "phrases" | "transcript">("summary");
  const [isSaved, setIsSaved] = useState(false);
  const [isWatched, setIsWatched] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isReplacing, setIsReplacing] = useState(false);

  useEffect(() => {
    if (!video) {
      router.push("/learn/videos");
      return;
    }

    // Load initial state
    VideoService.getUserProgress([videoId]).then(data => {
      const p = data[videoId];
      if (p) {
        setIsSaved(p.saved);
        setIsWatched(p.watched);
        setProgress(p.progress_seconds || 0);
      }
    });
  }, [videoId, video, router]);

  const handleError = () => {
    console.error("Video failed to load, finding fallback...");
    setIsReplacing(true);
    
    // Find a fallback video that isn't the current one
    const fallback = VideoService.getFallbackVideo([videoId]);
    
    // Smooth transition
    setTimeout(() => {
      router.replace(`/learn/videos/${fallback.id}`);
      setIsReplacing(false);
    }, 1500);
  };

  const handleProgress = (state: any) => {
    const currentSecs = Math.floor(state.playedSeconds || 0);
    // Periodically update progress every 10 seconds or near the end
    if (currentSecs > 0 && (currentSecs % 10 === 0 || currentSecs > video!.duration - 5)) {
      VideoService.updateProgress(videoId, isWatched, currentSecs);
    }
  };

  const handleEnded = () => {
    setIsWatched(true);
    VideoService.updateProgress(videoId, true, video!.duration);
  };

  const toggleSave = () => {
    const newSaved = !isSaved;
    setIsSaved(newSaved);
    VideoService.toggleSave(videoId, newSaved);
  };

  const startPractice = () => {
    // Redirect to AI conversation room with context
    const practiceUrl = `/practice/conversation/tutor?mode=guided&scenario=video_practice&topic=${encodeURIComponent(video!.title)}&context=${encodeURIComponent(video!.summary)}`;
    router.push(practiceUrl);
  };

  if (!video) return null;

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

      <div className="max-w-4xl mx-auto space-y-6 p-4 md:p-6">
        {/* Video Player Section */}
        <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl relative">
          {isReplacing ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white z-20">
              <Sparkles className="w-10 h-10 mb-4 text-primary-400 animate-pulse" />
              <p className="text-lg font-bold">Refreshing video content...</p>
              <p className="text-sm text-slate-400 mt-2">Connecting you to another lesson.</p>
            </div>
          ) : (
            <ReactPlayer
              src={`https://www.youtube.com/embed/${video.youtubeId}`}
              width="100%"
              height="100%"
              controls
              onProgress={handleProgress}
              onEnded={handleEnded}
              onError={handleError}
              config={{
                  youtube: {
                      rel: 0,
                      enablejsapi: 1
                  } as any
              }}
            />
          )}
        </div>

        {/* Metadata Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Difficulty:</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  video.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' : 
                  video.difficulty === 'Intermediate' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                }`}>
                  {video.difficulty}
                </span>
             </div>
             <div className="w-px h-4 bg-slate-200 dark:bg-slate-800" />
             <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Topic:</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{video.category}</span>
             </div>
          </div>

          <Button onClick={startPractice} className="bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-full px-6 shadow-lg shadow-primary-500/20">
            <Sparkles className="w-4 h-4 mr-2" /> Start AI Practice
          </Button>
        </div>

        {/* Tabs Section */}
        <div className="space-y-4">
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

          <Card className="p-6 min-h-[250px] animate-in fade-in slide-in-from-top-2">
            {activeTab === "summary" && (
              <div className="space-y-4">
                <h3 className="font-bold text-lg">What you'll learn</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{video.summary}</p>
                {isWatched && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 rounded-xl flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400 text-sm">Completed! You can now start practice.</span>
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
                         <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400"><Bookmark className="w-3.5 h-3.5" /></Button>
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
                <div className="space-y-4">
                  {video.transcript.map((line, i) => (
                    <div key={i} className="flex gap-4 group">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-600 tabular-nums w-8 pt-0.5">
                        {Math.floor(line.start / 60)}:{(line.start % 60).toString().padStart(2, '0')}
                      </span>
                      <p className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors cursor-pointer">
                        {line.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
