"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, StopCircle, RefreshCw, ChevronLeft, Volume2, Sparkles, Loader2, GraduationCap } from "lucide-react";
import Link from "next/link";
import { mockSpeechToText } from "@/lib/ai/speechToText";
import { analyzeSpeech, type AnalysisReport } from "@/lib/ai/analysisEngine";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";

export default function IELTSMockRoom() {
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes for Part 2 style
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [userText, setUserText] = useState("");

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  
  const topic = "Describe a place you visited that had a significant impact on you.";

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
    setTimeLeft(120);
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
      alert("Microphone access is required.");
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

      const analysis = await analyzeSpeech(stt.text);
      setReport(analysis);

      // Save to Supabase
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.from('sessions').insert({
          user_id: session.user.id,
          mode: 'IELTS Mock',
          topic,
          duration_seconds: 120 - Math.max(0, timeLeft),
          transcript: stt.text
        });
      }
    } catch (e) {
      console.error(e);
      alert("Something went wrong with the transcription. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 pb-32 md:pb-6 animate-in fade-in duration-500">
      <header className="flex items-center gap-4">
        <Link href="/practice/ielts">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ChevronLeft className="w-6 h-6" />
          </Button>
        </Link>
        <div>
           <div className="flex items-center gap-2 mb-0.5">
             <GraduationCap className="w-4 h-4 text-primary-600" />
             <span className="text-[10px] font-bold text-primary-600 uppercase tracking-widest">IELTS Mock Speaking</span>
           </div>
           <h1 className="text-xl font-display font-bold text-slate-900 dark:text-white">Part 2: Long Turn</h1>
        </div>
      </header>

      <Card className="p-8 bg-slate-900 border-slate-800 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl" />
        <p className="text-xs font-bold text-primary-400 uppercase tracking-widest mb-4">Cue Card Topic</p>
        <h2 className="text-2xl md:text-3xl font-display font-bold leading-tight relative z-10">
          "{topic}"
        </h2>
        <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-400">
           <span className="bg-white/5 px-3 py-1 rounded-lg">You should say:</span>
           <span className="bg-white/5 px-3 py-1 rounded-lg">Where it was</span>
           <span className="bg-white/5 px-3 py-1 rounded-lg">What you did there</span>
           <span className="bg-white/5 px-3 py-1 rounded-lg">Why it impacted you</span>
        </div>
      </Card>

      {!report && !isAnalyzing && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-6xl font-display font-black text-slate-800 dark:text-slate-100 tabular-nums mb-12">
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
          </div>

          {!isRecording ? (
            <div className="flex flex-col items-center">
              <button 
                onClick={startRecording}
                className="w-24 h-24 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-2xl hover:scale-105 transition-all shadow-primary-500/50 group"
              >
                <Mic className="w-10 h-10" />
              </button>
              <p className="mt-6 text-slate-500 font-medium font-display uppercase tracking-widest text-sm">Start Speaking (2 min)</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 mb-8 h-12">
                {Array.from({length: 12}).map((_, i) => (
                  <motion.div 
                    key={i}
                    className="w-1.5 bg-primary-500 rounded-full"
                    animate={{ height: ["20%", "100%", "20%"] }}
                    transition={{ duration: 0.5 + Math.random() * 0.5, repeat: Infinity, delay: Math.random() }}
                  />
                ))}
              </div>
              <button 
                onClick={stopRecording}
                className="w-20 h-20 rounded-full bg-red-500 text-white flex items-center justify-center shadow-xl hover:scale-105 transition-all animate-pulse"
              >
                <StopCircle className="w-10 h-10" />
              </button>
              <p className="mt-4 text-slate-500 font-medium uppercase tracking-widest text-xs">Record your response</p>
            </div>
          )}
        </div>
      )}

      {isAnalyzing && (
        <div className="flex flex-col items-center justify-center py-20 space-y-6 text-center">
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
          <div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Calculating Band Score...</h3>
            <p className="text-slate-500 text-sm">Evaluating fluency, coherence, and grammar</p>
          </div>
        </div>
      )}

      {report && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <Card className="p-6 bg-primary-600 text-white text-center flex flex-col justify-center">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Estimated Band</p>
                <p className="text-5xl font-black font-display">7.5</p>
             </Card>
             {[
               { label: "Fluency", val: report.fluencyScore, col: "text-blue-600" },
               { label: "Grammar", val: report.grammarScore, col: "text-emerald-600" },
               { label: "Vocabulary", val: 80, col: "text-purple-600" }
             ].map(s => (
               <Card key={s.label} className="p-4 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{s.label}</p>
                  <p className={`text-2xl font-bold font-display ${s.col}`}>{s.val}%</p>
               </Card>
             ))}
           </div>

           <Card className="p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                 <Sparkles className="w-4 h-4 text-primary-500" /> Improvement Tips
              </h3>
              <div className="space-y-4">
                 {report.mistakes.map((m, i) => (
                   <div key={i} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-2 border border-slate-100 dark:border-slate-800">
                      <div className="flex gap-4">
                         <span className="text-red-500 line-through text-sm">{m.original}</span>
                         <span className="text-emerald-600 font-bold text-sm">{m.correction}</span>
                      </div>
                      <p className="text-xs text-slate-500">{m.explanation}</p>
                   </div>
                 ))}
              </div>
           </Card>

           <div className="flex justify-center gap-4">
              <Button onClick={() => window.location.reload()} variant="outline" className="rounded-full">
                 <RefreshCw className="w-4 h-4 mr-2" /> Retake Test
              </Button>
              <Link href="/practice">
                 <Button className="rounded-full bg-slate-900 hover:bg-slate-800 text-white">Back to Practice</Button>
              </Link>
           </div>
        </motion.div>
      )}
    </div>
  );
}
