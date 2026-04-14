"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ROLEPLAY_SCENARIOS } from "@/lib/data/roleplayData";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Mic, Square, Loader2, Sparkles, CheckCircle2, AlertCircle, RefreshCw, Send } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";

interface Message {
  id: string;
  role: "user" | "agent";
  content: string;
  feedback?: {
    grammar_correction?: string;
    better_sentence?: string;
    vocabulary_improvement?: string;
    hinglish_explanation?: string;
    fluency_score?: number;
    confidence_score?: number;
  };
}

export default function RoleplayRoom() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const scenario = ROLEPLAY_SCENARIOS.find(s => s.id === id);

  const [sessionDbId, setSessionDbId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  // Initialize Session
  useEffect(() => {
    if (!scenario) {
      router.push("/practice/roleplay");
      return;
    }

    const initSession = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: sessionData, error: sessionError } = await supabase
          .from("conversation_sessions")
          .insert({ user_id: user.id, persona: `Roleplay: ${scenario.title}` })
          .select()
          .single();

        if (sessionError) throw sessionError;
        setSessionDbId(sessionData.id);

        // Add initial scenario message
        setMessages([
          { id: "initial", role: "agent", content: scenario.initialMessage }
        ]);

      } catch (err) {
        console.error("Failed to init roleplay session:", err);
      }
    };
    initSession();
  }, [scenario, router]);

  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    if (isProcessing) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunks.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunks.current.push(event.data);
      };

      mediaRecorder.current = recorder;
      recorder.start(100);
      setIsRecording(true);
      setRecordingDuration(0);
      
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 100);
      }, 100);
    } catch (err) {
      console.error("Mic access denied", err);
      alert("Please allow microphone access.");
    }
  };

  const stopRecording = async () => {
    if (!mediaRecorder.current || !isRecording) return;

    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    const finalBlob = await new Promise<Blob>((resolve) => {
      mediaRecorder.current!.onstop = () => {
        const blob = new Blob(audioChunks.current, { type: "audio/webm" });
        resolve(blob);
      };
      mediaRecorder.current!.stop();
      mediaRecorder.current!.stream.getTracks().forEach(t => t.stop());
    });

    setIsRecording(false);
    
    if (recordingDuration < 500) return;

    processAudio(finalBlob);
  };

  const validateTranscript = (text: string): boolean => {
    const junkPhrases = ["you", "thank you", "thanks", "bye", "subtitles by", "thank you for watching"];
    const lowercaseText = text.toLowerCase().trim().replace(/[.,!]/g, "");
    if (junkPhrases.includes(lowercaseText) && recordingDuration < 2000) return false;
    if (lowercaseText.length < 2) return false;
    return true;
  };

  const processAudio = async (blob: Blob) => {
    setIsProcessing(true);
    const formData = new FormData();
    formData.append("file", blob, "audio.webm");

    try {
      const sttRes = await fetch("/api/speech", { method: "POST", body: formData });
      const sttData = await sttRes.json();
      
      if (!sttData.text || sttData.text === "Could not transcribe audio.") {
        throw new Error("Empty transcript");
      }

      const userText = sttData.text;

      if (!validateTranscript(userText)) {
        alert("We couldn't hear you clearly. Please try speaking again.");
        return;
      }

      const tempUserMsgId = Date.now().toString();
      setMessages(prev => [...prev, { id: tempUserMsgId, role: "user", content: userText }]);

      if (sessionDbId) {
        await supabase.from("conversation_messages").insert({
          session_id: sessionDbId,
          role: "user",
          content: userText
        });
      }

      // Get AI response
      const aiRes = await fetch("/api/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          history: messages.map(m => ({ role: m.role, content: m.content })),
          personaId: "buddy", 
          customSystemPrompt: scenario?.systemPrompt
        })
      });

      const aiData = await aiRes.json();
      
      if (aiData.reply) {
        let savedMsgId = Date.now().toString() + "_agent";
        if (sessionDbId) {
          const { data: dbMsg } = await supabase.from("conversation_messages")
            .insert({ session_id: sessionDbId, role: "agent", content: aiData.reply })
            .select().single();
          if (dbMsg) savedMsgId = dbMsg.id;

          if (aiData.feedback) {
             await supabase.from("conversation_feedback").insert({
                message_id: savedMsgId,
                session_id: sessionDbId,
                grammar_correction: aiData.feedback.grammar_correction,
                better_sentence: aiData.feedback.better_sentence,
                vocabulary_improvement: aiData.feedback.vocabulary_improvement,
                hinglish_explanation: aiData.feedback.hinglish_explanation,
                fluency_score: aiData.feedback.fluency_score,
                confidence_score: aiData.feedback.confidence_score
             });
          }
        }

        setMessages(prev => {
          const updated = [...prev];
          const lastUserIdx = updated.findLastIndex(m => m.role === "user");
          if (lastUserIdx !== -1 && aiData.feedback) {
            updated[lastUserIdx] = { ...updated[lastUserIdx], feedback: aiData.feedback };
          }
          updated.push({ id: savedMsgId, role: "agent", content: aiData.reply });
          return updated;
        });
      }
    } catch (err) {
      console.error(err);
      alert("We couldn't capture that clearly. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!scenario) return null;

  return (
    <div className="max-w-4xl mx-auto h-[100dvh] md:h-[calc(100vh-2rem)] md:my-4 flex flex-col bg-white dark:bg-slate-950 border-x border-slate-200 dark:border-slate-800 md:border md:rounded-3xl overflow-hidden shadow-2xl relative">
       <header className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md z-10 relative">
          <div className="flex items-center gap-4">
             <Link href="/practice/roleplay">
                <Button variant="ghost" size="icon" className="rounded-full shrink-0">
                   <ChevronLeft className="w-5 h-5" />
                </Button>
             </Link>
             <div>
                <h2 className="font-bold text-slate-900 dark:text-white leading-tight">{scenario.title}</h2>
                <p className="text-xs text-slate-500 font-medium">Real-life Roleplay</p>
             </div>
          </div>
          <div className="flex items-center gap-2">
             <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-slate-100 dark:bg-slate-900 rounded-full text-slate-500">
               {scenario.difficulty}
             </span>
          </div>
       </header>

       <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 pb-44 scroll-smooth">
          {messages.map((msg) => (
             <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-4 ${
                  msg.role === 'user' 
                    ? 'bg-primary-600 text-white rounded-br-none shadow-md shadow-primary-600/20' 
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200 dark:border-slate-800'
                }`}>
                   <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>

                {msg.feedback && (
                  <div className="mt-2 w-full max-w-[85%] animate-in fade-in slide-in-from-top-2">
                    <Card className="p-4 bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/30">
                       <h4 className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 mb-2 uppercase tracking-widest">
                         <Sparkles className="w-3.5 h-3.5" /> AI Correction
                       </h4>
                       
                       {msg.feedback.grammar_correction && (
                          <div className="mb-2 text-sm">
                             <span className="text-slate-400 line-through mr-2">{msg.content}</span>
                             <span className="text-emerald-600 font-bold">{msg.feedback.grammar_correction}</span>
                          </div>
                       )}

                       {msg.feedback.hinglish_explanation && (
                          <div className="text-xs italic text-amber-900/70 dark:text-amber-200/70 pt-2 border-t border-amber-100 dark:border-amber-900/20">
                            Note: {msg.feedback.hinglish_explanation}
                          </div>
                       )}
                    </Card>
                  </div>
                )}
             </div>
          ))}

          {isProcessing && (
             <div className="flex items-start">
                <div className="bg-slate-100 dark:bg-slate-900 text-slate-500 rounded-2xl rounded-bl-none p-4 flex items-center gap-2">
                   <Loader2 className="w-4 h-4 animate-spin" /> AI is thinking...
                </div>
             </div>
          )}
          <div ref={messagesEndRef} className="h-4 w-full" />
       </div>

        <div className="absolute bottom-6 left-0 w-full px-4">
          <div className="max-w-md mx-auto bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-2xl p-4 rounded-full flex items-center justify-between gap-4">
            <div className="text-xs font-bold text-slate-400 pl-4 w-1/3 uppercase tracking-widest">
              {isRecording ? <span className="text-red-500 flex items-center gap-2 animate-pulse"><div className="w-2 h-2 bg-red-500 rounded-full" /> Listening</span> : "Tap to Speak"}
            </div>

            <Button 
               size="icon"
               className={`w-20 h-20 rounded-full shrink-0 shadow-2xl transition-all duration-300 relative ${
                 isRecording 
                   ? 'bg-red-500 scale-110 shadow-red-500/50' 
                   : 'bg-primary-600 hover:bg-primary-700 hover:scale-110 shadow-primary-500/50'
               }`}
               onClick={isRecording ? stopRecording : startRecording}
               disabled={isProcessing}
            >
               {isRecording && (
                 <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-20" />
               )}
               {isProcessing ? (
                 <Loader2 className="w-8 h-8 text-white animate-spin" />
               ) : isRecording ? (
                 <Square className="w-8 h-8 fill-white" />
               ) : (
                 <Mic className="w-10 h-10 text-white" />
               )}
            </Button>
            
            <div className="w-1/3 flex justify-end pr-2">
              <Button variant="ghost" size="icon" className="rounded-full text-slate-300 pointer-events-none">
                <RefreshCw className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
    </div>
  );
}
