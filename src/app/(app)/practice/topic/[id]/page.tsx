"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, StopCircle, RefreshCw, ChevronLeft, Volume2, Sparkles, Loader2, CheckCircle2, X } from "lucide-react";
import Link from "next/link";
import { mockSpeechToText } from "@/lib/ai/speechToText";
import { analyzeSpeech, type AnalysisReport } from "@/lib/ai/analysisEngine";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import { SPEAKING_TOPICS } from "@/lib/data/topicData";

export default function TopicPracticeRoom() {
  const params = useParams();
  const router = useRouter();
  const topicId = params?.id as string;
  const topicObj = SPEAKING_TOPICS.find(t => t.id === topicId);

  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [userText, setUserText] = useState("");

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  useEffect(() => {
    if (!topicObj) {
      router.push("/practice/topic");
    }
  }, [topicObj, router]);

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
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Mic access denied:", err);
      alert("Microphone access is required.");
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setIsAnalyzing(true);
    
    try {
      const blob = await new Promise<Blob>((resolve) => {
        if (!mediaRecorderRef.current || mediaRecorderRef.current.state === "inactive") {
          resolve(new Blob());
          return;
        }
        
        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
          resolve(audioBlob);
        };
        
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
      });

      const stt = await mockSpeechToText(blob);
      setUserText(stt.text);

      const analysis = await analyzeSpeech(stt.text);
      setReport(analysis);

      // Save to Supabase
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: sessionData } = await supabase.from('sessions').insert({
          user_id: session.user.id,
          mode: 'Topic Practice',
          topic: topicObj?.topic,
          duration_seconds: 60 - timeLeft,
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
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!topicObj) return null;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 pb-32 md:pb-6 animate-in fade-in duration-500">
      <header className="flex items-center gap-4">
        <Link href="/practice/topic">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ChevronLeft className="w-6 h-6" />
          </Button>
        </Link>
        <div>
           <span className="text-[10px] font-bold text-primary-600 uppercase tracking-widest">{topicObj.category}</span>
           <h1 className="text-xl font-display font-bold text-slate-900 dark:text-white">Topic Practice</h1>
        </div>
      </header>

      <Card className="p-8 text-center bg-gradient-to-br from-indigo-50 to-primary-50 dark:from-indigo-950/20 dark:to-primary-950/20 border-primary-100 dark:border-primary-900/50">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-900 dark:text-white leading-tight">
          "{topicObj.topic}"
        </h2>
      </Card>

      {!report && !isAnalyzing && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-6xl font-display font-black text-slate-800 dark:text-slate-100 tabular-nums mb-12">
            00:{timeLeft.toString().padStart(2, "0")}
          </div>

          {!isRecording ? (
            <div className="flex flex-col items-center">
              <button 
                onClick={startRecording}
                className="w-24 h-24 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-2xl hover:scale-105 transition-all shadow-primary-500/50"
              >
                <Mic className="w-10 h-10" />
              </button>
              <p className="mt-6 text-slate-500 font-medium font-display uppercase tracking-widest text-sm">Tap to record</p>
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
            </div>
          )}
        </div>
      )}

      {isAnalyzing && (
        <div className="flex flex-col items-center justify-center py-20 space-y-6">
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
          <div className="text-center">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Analyzing performance...</h3>
            <p className="text-slate-500">Evaluating grammar & core metrics</p>
          </div>
        </div>
      )}

      {report && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {[
               { label: "Grammar", val: report.grammarScore, col: "text-blue-600" },
               { label: "Fluency", val: report.fluencyScore, col: "text-emerald-600" },
               { label: "Pronunciation", val: report.pronunciationScore, col: "text-purple-600" },
               { label: "Fillers", val: report.fillersUsed, col: "text-amber-600" }
             ].map(s => (
               <Card key={s.label} className="p-4 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{s.label}</p>
                  <p className={`text-2xl font-bold font-display ${s.col}`}>{s.val}{s.label === 'Fillers' ? '' : '%'}</p>
               </Card>
             ))}
           </div>

           <Card className="p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                 <Sparkles className="w-4 h-4 text-primary-500" /> Key Mistakes
              </h3>
              <div className="space-y-4">
                 {report.mistakes.map((m, i) => (
                   <div key={i} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-2 border border-slate-100 dark:border-slate-800">
                      <div className="flex gap-4">
                         <span className="text-red-500 line-through text-sm">{m.original}</span>
                         <span className="text-emerald-600 font-bold text-sm">{m.correction}</span>
                      </div>
                      <p className="text-xs text-slate-500">{m.explanation}</p>
                      <div className="text-[10px] bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 p-2 rounded-lg italic font-medium">
                         Tip: {m.hinglishExplanation}
                      </div>
                   </div>
                 ))}
                 {report.mistakes.length === 0 && <p className="text-slate-500 text-sm">Perfect! No major mistakes found.</p>}
              </div>
           </Card>

           <div className="flex justify-center flex-col sm:flex-row gap-4">
              <Button onClick={() => window.location.reload()} variant="outline" className="rounded-full">
                 <RefreshCw className="w-4 h-4 mr-2" /> Try Again
              </Button>
              <Link href="/practice/topic">
                 <Button className="rounded-full bg-primary-600 hover:bg-primary-700">Explore More Topics</Button>
              </Link>
           </div>
        </motion.div>
      )}
    </div>
  );
}
