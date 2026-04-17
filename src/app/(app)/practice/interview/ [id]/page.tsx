"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Mic, Square, Loader2, Sparkles, CheckCircle2, AlertCircle, Timer, Camera, VideoOff, Send, MessageSquare } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";

export default function InterviewRoom() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params?.id as string;

  const [session, setSession] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [currentSource, setCurrentSource] = useState<string>("seeded");
  
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);
  
  const [showCamera, setShowCamera] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [textInput, setTextInput] = useState("");

  // Initialize
  useEffect(() => {
    const init = async () => {
      const { data: sess } = await supabase.from('interview_sessions').select('*').eq('id', sessionId).single();
      if (!sess) return router.push("/practice/interview");
      setSession(sess);

      // Fetch existing responses
      const { data: responses } = await supabase.from('interview_responses').select('*').eq('session_id', sessionId).order('created_at', { ascending: true });
      
      if (!responses || responses.length === 0) {
        // Start msg
        const res = await fetch("/api/interview/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: sess.role, company: sess.company, difficulty: sess.difficulty, roundType: sess.round_type })
        });
        const data = await res.json();
        setCurrentQuestion(data.question);
        setCurrentSource(data.sourceType || "seeded");
        setMessages([{ role: 'agent', content: data.interviewerGreeting }, { role: 'agent', content: data.question }]);
      } else {
        // Resume from last question
        const lastResp = responses[responses.length - 1];
        setMessages(responses.flatMap(r => [
          { role: 'agent', content: r.question_text },
          { role: 'user', content: r.user_answer }
        ]));
        
        // Refresh question if session is active
        const res = await fetch("/api/interview/answer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId, question: lastResp.question_text, answer: lastResp.user_answer })
        });
        const data = await res.json();
        if (data.nextQuestion) {
            setCurrentQuestion(data.nextQuestion);
            setCurrentSource(data.nextSource || "seeded");
            setMessages(prev => [...prev, { role: 'agent', content: data.nextQuestion }]);
        }
      }
    };
    init();
  }, [sessionId, router]);

  // Camera handling
  useEffect(() => {
    if (showCamera) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(stream => { if (videoRef.current) videoRef.current.srcObject = stream; })
        .catch(err => { console.warn("Camera access denied", err); setShowCamera(false); });
    } else {
      if (videoRef.current?.srcObject) {
         const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
         tracks.forEach(t => t.stop());
      }
    }
  }, [showCamera]);

  // Timer
  useEffect(() => {
    timerRef.current = setInterval(() => setTimeLeft(prev => prev + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunks.current = [];
      recorder.ondataavailable = (e) => audioChunks.current.push(e.data);
      recorder.onstop = () => processAudio(new Blob(audioChunks.current, { type: 'audio/webm' }));
      mediaRecorder.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch (err) { alert("Mic required"); }
  };

  const stopRecording = () => {
    if (mediaRecorder.current) mediaRecorder.current.stop();
    setIsRecording(false);
  };

  const processResponse = async (text: string) => {
    if (text.length < 3) return;
    setIsProcessing(true);
    setEvaluation(null);
    setMessages(prev => [...prev, { role: 'user', content: text }]);

    try {
      const res = await fetch("/api/interview/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, question: currentQuestion, answer: text })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Evaluation failed");

      setEvaluation(data.evaluation);
      if (data.isLast && !data.nextQuestion) {
        setTimeout(() => router.push(`/practice/interview/history`), 2000);
      } else if (data.nextQuestion) {
        setCurrentQuestion(data.nextQuestion);
        setCurrentSource(data.nextSource || "seeded");
        setMessages(prev => [...prev, { role: 'agent', content: data.nextQuestion }]);
      }
    } catch (err: any) { alert(err.message); }
    finally { setIsProcessing(false); setTextInput(""); }
  };

  const processAudio = async (blob: Blob) => {
    setIsProcessing(true);
    const formData = new FormData();
    formData.append("file", blob, "audio.webm");

    try {
      const sttRes = await fetch("/api/speech", { method: "POST", body: formData });
      const { text } = await sttRes.json();
      await processResponse(text);
    } catch (err: any) { alert(err.message); setIsProcessing(false); }
  };

  const getSourceBadge = (source: string) => {
    switch(source) {
        case 'trend_based': return { label: 'Fresh Trend', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' };
        case 'reported_pattern': return { label: 'Reported Pattern', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' };
        case 'ai_generated': return { label: 'AI Generated', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' };
        default: return { label: 'Stable Pool', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400' };
    }
  };

  const badge = getSourceBadge(currentSource);

  return (
    <div className="max-w-6xl mx-auto h-[100dvh] flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Top Nav */}
      <header className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-950 z-10">
        <div className="flex items-center gap-4">
          <Link href="/practice/interview">
            <Button variant="ghost" size="icon" className="rounded-full"><ChevronLeft className="w-5 h-5" /></Button>
          </Link>
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white leading-tight">
              {session?.company || "Mock Interview"} • {session?.role}
            </h2>
            <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
               <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Live Session • {session?.difficulty}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-900 rounded-lg flex items-center gap-2 font-mono text-sm font-bold text-slate-700 dark:text-slate-300">
              <Timer className="w-4 h-4 text-indigo-500" /> {formatTime(timeLeft)}
           </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Main Content (Interviewer Pane) */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 pb-40">
           <div className="max-w-2xl mx-auto space-y-8">
              {/* Interviewer Persona Card */}
              <div className="flex items-start gap-4">
                 <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xl font-bold text-2xl shrink-0 mt-2">
                    {session?.company?.[0] || "I"}
                 </div>
                 <div className="relative group flex-1">
                    <div className="p-5 bg-white dark:bg-slate-900 rounded-[2rem] rounded-tl-none border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Interviewer</span>
                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${badge.color}`}>
                                <Sparkles className="w-3 h-3" /> {badge.label}
                            </span>
                        </div>
                        <p className="text-slate-800 dark:text-slate-200 font-bold text-xl leading-relaxed">
                            {currentQuestion || "Initializing the round..."}
                        </p>
                    </div>
                    {/* Shadow decoration */}
                    <div className="absolute -z-10 bottom-0 left-4 w-[90%] h-4 bg-slate-200/50 dark:bg-slate-800/50 blur-xl translate-y-2 rounded-full" />
                 </div>
              </div>

              {/* Evaluation Feedback */}
              {evaluation && !isProcessing && (
                <Card className="p-6 bg-white dark:bg-slate-900 border-none rounded-[2rem] shadow-2xl animate-in fade-in slide-in-from-top-4 overflow-hidden relative border border-slate-100 dark:border-slate-800">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
                   
                   <div className="flex items-center justify-between mb-6 relative">
                      <h4 className="flex items-center gap-2 text-md font-black uppercase tracking-widest text-slate-400">
                        <CheckCircle2 className="w-5 h-5 text-green-500" /> AI Evaluation
                      </h4>
                      <div className="flex flex-col items-end">
                        <span className="text-3xl font-black text-indigo-600">{evaluation.score}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Overall Score</span>
                      </div>
                   </div>
                   
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                      {[
                        { label: 'Technical', val: evaluation.technicalScore, color: 'text-blue-600' },
                        { label: 'Comm.', val: evaluation.communicationScore, color: 'text-purple-600' },
                        { label: 'Grammar', val: evaluation.grammarScore, color: 'text-emerald-600' },
                        { label: 'Confidence', val: evaluation.confidenceScore, color: 'text-orange-600' }
                      ].map(s => (
                        <div key={s.label} className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl text-center border border-slate-100 dark:border-slate-800">
                           <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{s.label}</p>
                           <p className={`text-xl font-black ${s.color}`}>{s.val}</p>
                        </div>
                      ))}
                   </div>

                   <div className="space-y-6 relative">
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest pl-1">Key Feedback</p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-bold bg-indigo-50/50 dark:bg-indigo-900/10 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                            {evaluation.feedback.detailed}
                        </p>
                      </div>
                      
                      {evaluation.hinglishExplanation && (
                        <div className="p-4 bg-amber-50/50 dark:bg-amber-900/10 rounded-2xl border border-amber-100/50 dark:border-amber-900/20">
                           <p className="text-[10px] font-black text-amber-600 uppercase mb-1">Concept Helper</p>
                           <p className="text-slate-800 dark:text-amber-200 font-medium italic">"{evaluation.hinglishExplanation}"</p>
                        </div>
                      )}

                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-green-600 uppercase tracking-widest pl-1">Master Class Answer</p>
                        <div className="p-4 bg-slate-900 text-slate-200 rounded-2xl text-sm leading-relaxed font-medium">
                           {evaluation.idealAnswer}
                        </div>
                      </div>
                   </div>
                </Card>
              )}

              {isProcessing && (
                 <div className="flex items-center gap-3 text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse pl-20">
                    <Loader2 className="w-4 h-4 animate-spin" /> Interviewer is listening...
                 </div>
              )}
           </div>
        </div>

        {/* Side Pane (Camera & Perspective) */}
        <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 space-y-6 flex flex-col">
           <div className="relative aspect-video lg:aspect-square bg-slate-100 dark:bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl group border-4 border-white dark:border-slate-800">
              {showCamera ? (
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover mirror" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-3">
                   <VideoOff className="w-10 h-10" />
                   <p className="text-[10px] font-black uppercase tracking-widest">Self View Off</p>
                </div>
              )}
              <Button 
                variant="secondary" size="icon" 
                className="absolute top-4 right-4 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setShowCamera(!showCamera)}
              >
                <Camera className="w-4 h-4" />
              </Button>
              <div className="absolute bottom-4 left-4 flex items-center gap-2 px-2 py-1 bg-black/40 backdrop-blur-md rounded-lg">
                 <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                 <span className="text-[8px] font-black text-white uppercase tracking-widest">Live Monitoring</span>
              </div>
           </div>

           <div className="flex-1 space-y-4">
              <Card className="p-5 rounded-3xl border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Professional Insight</h4>
                 <div className="space-y-4">
                    <div className="space-y-1.5">
                       <div className="flex justify-between text-[10px] font-bold">
                          <span className="text-slate-500 uppercase">Fluency</span>
                          <span className="text-indigo-600">82%</span>
                       </div>
                       <div className="h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 w-[82%]" />
                       </div>
                    </div>
                    <div className="space-y-1.5">
                       <div className="flex justify-between text-[10px] font-bold">
                          <span className="text-slate-500 uppercase">Clarity</span>
                          <span className="text-green-600">90%</span>
                       </div>
                       <div className="h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 w-[90%]" />
                       </div>
                    </div>
                 </div>
              </Card>

              <div className="p-4 bg-indigo-600 rounded-3xl text-white shadow-xl shadow-indigo-600/20">
                 <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Pro Tip</p>
                 <p className="text-xs font-bold leading-relaxed">Focus on structured answers. Use the STAR method for behavioral questions.</p>
              </div>
           </div>
        </div>
      </div>

      {/* Futuristic Floating Control Bar */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 z-50">
         <div className="bg-white/80 dark:bg-slate-900/90 backdrop-blur-3xl p-5 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex flex-col gap-4 transition-all duration-300">
            
            <div className="flex items-center gap-4">
                <div className="flex-1 relative group">
                    <input 
                        type="text"
                        value={textInput}
                        disabled={isRecording || isProcessing}
                        onChange={(e) => setTextInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && processResponse(textInput)}
                        placeholder={isRecording ? "Listening..." : "Type your answer..."}
                        className="w-full h-14 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl px-6 py-2 text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors"
                    />
                    {!isRecording && !isProcessing && textInput.length > 0 && (
                        <Button 
                            onClick={() => processResponse(textInput)}
                            size="icon" 
                            className="absolute right-2 top-2 h-10 w-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20"
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    )}
                </div>

                <div className="relative">
                    <Button
                        size="icon"
                        className={`w-16 h-16 rounded-3xl shrink-0 shadow-2xl transition-all duration-500 relative ${
                            isRecording 
                            ? 'bg-red-500 scale-110 shadow-red-500/50 rounded-full' 
                            : 'bg-indigo-600 hover:bg-slate-900 dark:hover:bg-white dark:hover:text-black shadow-indigo-600/50'
                        }`}
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={isProcessing}
                    >
                        {isRecording && <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-20" />}
                        {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : isRecording ? <Square className="w-6 h-6 fill-white" /> : <Mic className="w-8 h-8" />}
                    </Button>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 border-2 border-white dark:border-slate-900 rounded-full" />
                </div>
            </div>

            <div className="flex items-center justify-center gap-6 px-4">
                <div className="flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Speech or Text</span>
                </div>
                <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800" />
                <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">AI Powered</span>
                </div>
            </div>
         </div>
      </div>
    </div>
  );
}
