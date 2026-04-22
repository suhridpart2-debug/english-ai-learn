"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, StopCircle, RefreshCw, ChevronLeft, Volume2, Sparkles } from "lucide-react";
import Link from "next/link";
import { mockSpeechToText } from "@/lib/ai/speechToText";
import { analyzeSpeech, type AnalysisReport } from "@/lib/ai/analysisEngine";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import { SPEAKING_TOPICS } from "@/lib/data/topicData";

export default function SixtySecondChallenge() {
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [userText, setUserText] = useState("");
  const [currentTopic, setCurrentTopic] = useState(SPEAKING_TOPICS[0]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  
  const refreshTopic = () => {
    const randomIndex = Math.floor(Math.random() * SPEAKING_TOPICS.length);
    setCurrentTopic(SPEAKING_TOPICS[randomIndex]);
    setReport(null);
    setUserText("");
    setTimeLeft(60);
  };

  // Pick a random topic on mount
  useEffect(() => {
    refreshTopic();
  }, []);

  // Handle timer
  useEffect(() => {
    if (isRecording && timeLeft > 0) {
      timerRef.current = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0 && isRecording) {
      stopRecording();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording, timeLeft]);

  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    setReport(null);
    setUserText("");
    setTimeLeft(60);
    chunksRef.current = [];
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      
      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordingDuration(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 100);
      }, 100);
    } catch (err) {
      console.error("Mic access denied:", err);
      alert("Microphone access is required. Please check your browser permissions.");
    }
  };

  const stopRecording = async () => {
    if (!mediaRecorderRef.current || !isRecording) return;

    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    setIsRecording(false);
    setIsAnalyzing(true);
    
    try {
      const blob = await new Promise<Blob>((resolve) => {
        mediaRecorderRef.current!.onstop = () => {
          const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
          resolve(audioBlob);
        };
        
        mediaRecorderRef.current!.stop();
        mediaRecorderRef.current!.stream.getTracks().forEach(t => t.stop());
      });

      if (recordingDuration < 500) {
        setIsAnalyzing(false);
        return;
      }

      const stt = await mockSpeechToText(blob);
      
      // Hallucination Guard
      const junkPhrases = ["you", "thank you", "thanks", "bye", "subtitles by", "thank you for watching"];
      const lowercaseText = stt.text.toLowerCase().trim().replace(/[.,!]/g, "");
      
      if (junkPhrases.includes(lowercaseText) && recordingDuration < 2000) {
        alert("We couldn't hear you clearly. Please try speaking again.");
        setIsAnalyzing(false);
        return;
      }

      setUserText(stt.text);

      // Analyze the text
      const analysis = await analyzeSpeech(stt.text);
      setReport(analysis);

      // Save to Supabase real persistence
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: sessionData } = await supabase.from('sessions').insert({
          user_id: session.user.id,
          mode: '60-Second Challenge',
          topic: currentTopic.topic,
          duration_seconds: 60 - Math.max(0, timeLeft),
          transcript: stt.text
        }).select('id').single();

        if (sessionData) {
          await supabase.from('scores').insert({
            session_id: sessionData.id,
            grammar: analysis.grammarScore,
            fluency: analysis.fluencyScore,
            pronunciation: analysis.pronunciationScore,
            fillers_used: analysis.fillersUsed
          });
          
          if (analysis.mistakes.length > 0) {
             const mistakesToInsert = analysis.mistakes.map(m => ({
                session_id: sessionData.id,
                original: m.original,
                correction: m.correction,
                explanation: m.explanation,
                hinglish_explanation: m.hinglishExplanation
             }));
             await supabase.from('mistakes').insert(mistakesToInsert);
          }

          const { data: streakData } = await supabase.from('streaks').select('*').eq('user_id', session.user.id).single();
          if (streakData) {
            await supabase.from('streaks').update({
              total_sessions: streakData.total_sessions + 1,
              current_streak: streakData.current_streak === 0 ? 1 : streakData.current_streak,
              last_active_date: new Date().toISOString()
            }).eq('user_id', session.user.id);
          }
        }
      }
    } catch (e) {
      console.error(e);
      alert("Something went wrong with the transcription. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 pb-32 md:pb-6">
      {/* Header */}
      <header className="flex items-center gap-4">
        <Link href="/practice">
          <Button variant="ghost" size="icon" className="rounded-full">
             <ChevronLeft className="w-6 h-6" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">60-Second Challenge</h1>
        </div>
        <div className="ml-auto">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshTopic}
            className="rounded-full bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            New Topic
          </Button>
        </div>
      </header>

      {/* Main Topic Area */}
      <Card className="p-8 text-center bg-gradient-to-br from-indigo-50 to-primary-50 dark:from-indigo-950/20 dark:to-primary-950/20 border-primary-100 dark:border-primary-900/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3 opacity-10">
          <Sparkles className="w-12 h-12 text-primary-600" />
        </div>
        <p className="text-sm font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest mb-4 flex items-center justify-center gap-2">
          <small className="px-2 py-0.5 rounded bg-primary-100 dark:bg-primary-900/30 text-[10px] font-black uppercase tracking-tighter">AI Curated</small>
          {currentTopic.category}
        </p>
        <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-900 dark:text-white leading-tight">
          "{currentTopic.topic}"
        </h2>
      </Card>

      {/* Recording Interface */}
      {!report && !isAnalyzing && (
        <div className="flex flex-col items-center justify-center py-12">
          {/* Animated Timer */}
          <div className="text-6xl font-display font-black text-slate-800 dark:text-slate-100 tabular-nums mb-12">
            00:{timeLeft.toString().padStart(2, "0")}
          </div>

          {!isRecording ? (
            <div className="flex flex-col items-center">
              <button 
                onClick={startRecording}
                className="w-24 h-24 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all shadow-primary-500/50 relative group"
              >
                <div className="absolute inset-0 rounded-full bg-primary-600 opacity-0 group-hover:animate-ping" />
                <Mic className="w-10 h-10 relative z-10" />
              </button>
              <p className="mt-6 text-slate-500 font-medium">Tap to start speaking</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              {/* Fake Waveform */}
              <div className="flex items-center gap-1 mb-8 h-12">
                {Array.from({length: 15}).map((_, i) => (
                  <motion.div 
                    key={i}
                    className="w-2 bg-primary-500 rounded-full"
                    animate={{ height: ["20%", "100%", "20%"] }}
                    transition={{
                      duration: 0.5 + Math.random() * 0.5,
                      repeat: Infinity,
                      delay: Math.random(),
                    }}
                  />
                ))}
              </div>

              <button 
                onClick={stopRecording}
                className="w-20 h-20 rounded-full bg-red-500 text-white flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all shadow-red-500/40 animate-pulse"
              >
                <StopCircle className="w-10 h-10" />
              </button>
              <p className="mt-4 text-slate-500 font-medium">Recording... Tap to stop</p>
            </div>
          )}
        </div>
      )}

      {/* Analyzing Loader */}
      {isAnalyzing && (
        <div className="flex flex-col items-center justify-center py-20 space-y-6">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-4 border-slate-200 dark:border-slate-800 rounded-full" />
            <div className="absolute inset-0 border-4 border-primary-500 rounded-full animate-spin border-t-transparent" />
            <Mic className="absolute inset-0 m-auto w-8 h-8 text-primary-500" />
          </div>
          <div className="text-center">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">AI is evaluating your speech</h3>
            <p className="text-slate-500">Checking grammar, fluency, and pronunciation...</p>
          </div>
        </div>
      )}

      {/* Analysis Report */}
      <AnimatePresence>
        {report && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h3 className="text-2xl font-display font-bold">Your Performance</h3>
            
            {/* Transcript */}
            <Card className="p-6 bg-slate-50 dark:bg-slate-900 shadow-inner">
              <div className="flex items-center gap-2 mb-3 text-slate-500">
                <Volume2 className="w-5 h-5" /> Transcript
              </div>
              <p className="text-lg text-slate-800 dark:text-slate-200 indent-4 font-medium leading-relaxed italic border-l-4 border-primary-300 dark:border-primary-700 pl-4">
                "{userText}"
              </p>
            </Card>

            {/* Scores Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
               {[
                 { label: "Grammar", score: report.grammarScore, color: "text-blue-500" },
                 { label: "Fluency", score: report.fluencyScore, color: "text-emerald-500" },
                 { label: "Pronunciation", score: report.pronunciationScore, color: "text-purple-500" },
               ].map(s => (
                 <Card key={s.label} className="p-4 text-center">
                   <p className="text-sm font-medium text-slate-500 mb-1">{s.label}</p>
                   <p className={`text-3xl font-bold font-display ${s.color}`}>{s.score}%</p>
                 </Card>
               ))}
               <Card className="p-4 text-center">
                 <p className="text-sm font-medium text-slate-500 mb-1">Fillers Used</p>
                 <p className="text-3xl font-bold font-display text-amber-500">{report.fillersUsed}</p>
               </Card>
            </div>

            {/* Mistakes & Feedback */}
            <Card className="overflow-hidden">
               <div className="bg-slate-100 dark:bg-slate-900 p-4 border-b border-slate-200 dark:border-slate-800 font-semibold flex items-center justify-between">
                 <span>Corrections & Guidance</span>
                 <span className="text-xs bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300 px-2 py-1 rounded">Hinglish Supported</span>
               </div>
               <div className="p-6 space-y-6">
                 {report.mistakes.map((m, i) => (
                   <div key={i} className="space-y-3 pb-6 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0">
                     <div className="flex gap-4">
                       <div className="w-1/2 p-3 bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-300 rounded-xl line-through decoration-red-400">
                         {m.original}
                       </div>
                       <div className="w-1/2 p-3 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 rounded-xl font-medium">
                         {m.correction}
                       </div>
                     </div>
                     <p className="text-slate-600 dark:text-slate-400 text-sm">
                       <strong className="text-slate-900 dark:text-white">Why?</strong> {m.explanation}
                     </p>
                     <p className="text-indigo-600 dark:text-indigo-400 text-sm italic bg-indigo-50 dark:bg-indigo-950/30 p-2 rounded-lg">
                       💡 <strong>Tip:</strong> {m.hinglishExplanation}
                     </p>
                   </div>
                 ))}
               </div>
            </Card>

            <div className="flex justify-center pt-8">
               <Button size="lg" className="rounded-full shadow-lg" onClick={refreshTopic}>
                 <RefreshCw className="w-5 h-5 mr-2" /> Next Challenge
               </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
