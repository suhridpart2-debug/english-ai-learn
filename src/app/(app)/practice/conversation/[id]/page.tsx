"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { PERSONAS, PersonaId } from "@/lib/data/personas";
import { CONVERSATION_SCENARIOS } from "@/lib/data/conversationScenarios";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Mic, Square, Loader2, Sparkles, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
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
  };
}

export default function ConversationRoom() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const personaId = params?.id as PersonaId;
  const persona = PERSONAS[personaId];

  // Config from URL
  const mode = searchParams.get("mode") || "free";
  const duration = parseInt(searchParams.get("duration") || "5");
  const scenarioId = searchParams.get("scenario");
  const scenario = scenarioId ? CONVERSATION_SCENARIOS.find(s => s.id === scenarioId) : null;

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
    if (!persona) {
      router.push("/practice/conversation");
      return;
    }

    const initSession = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Create new session with metadata
        const { data: sessionData, error: sessionError } = await supabase
          .from("conversation_sessions")
          .insert({ 
            user_id: user.id, 
            persona: persona.id,
            mode: mode,
            target_duration_minutes: duration,
            scenario_id: scenarioId,
            scenario_title: scenario?.title
          })
          .select()
          .single();

        if (sessionError) throw sessionError;
        setSessionDbId(sessionData.id);

        // Handle initial message
        if (mode === "guided" && scenario) {
          // In guided mode, AI starts
          const { data: dbMsg } = await supabase.from("conversation_messages")
            .insert({ 
              session_id: sessionData.id, 
              role: "agent", 
              content: scenario.initialMessage 
            })
            .select().single();
          
          setMessages([
            { id: dbMsg?.id || "initial", role: "agent", content: scenario.initialMessage }
          ]);
        } else {
          // In free mode, standard persona greeting
          setMessages([
            { id: "greeting", role: "agent", content: persona.greeting }
          ]);
        }

      } catch (err) {
        console.error("Failed to init session:", err);
      }
    };
    initSession();
  }, [persona, router]);

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
      recorder.start(100); // Trigger dataavailable every 100ms
      setIsRecording(true);
      setRecordingDuration(0);
      
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 100);
      }, 100);
    } catch (err) {
      console.error("Mic access denied", err);
      alert("Please allow microphone access to talk to the AI.");
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
    
    // Minimum duration check (0.5s)
    if (recordingDuration < 500) {
      console.warn("Recording too short");
      return;
    }

    processAudio(finalBlob);
  };

  const validateTranscript = (text: string): boolean => {
    const junkPhrases = ["you", "thank you", "thanks", "bye", "subtitles by", "thank you for watching"];
    const lowercaseText = text.toLowerCase().trim().replace(/[.,!]/g, "");
    
    // If it's just one of these junk phrases and the recording was short, it's likely a hallucination
    if (junkPhrases.includes(lowercaseText) && recordingDuration < 2000) {
      return false;
    }
    
    // Also check for empty or very short noise
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

      // Quality Check
      if (!validateTranscript(userText)) {
        alert("We couldn't hear you clearly. Please try speaking again.");
        return;
      }

      // Add user message to UI
      const tempUserMsgId = Date.now().toString();
      setMessages(prev => [...prev, { id: tempUserMsgId, role: "user", content: userText }]);

      // Add to DB
      if (sessionDbId) {
        await supabase.from("conversation_messages").insert({
          session_id: sessionDbId,
          role: "user",
          content: userText
        });
      }

      // 2. Get AI Reply & Feedback
      const aiRes = await fetch("/api/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          history: messages.map(m => ({ role: m.role, content: m.content })),
          personaId: persona.id,
          mode: mode,
          durationMinutes: duration,
          scenarioDescription: mode === "guided" ? scenario?.systemPrompt : ""
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

  if (!persona) return null;

  return (
    <div className="max-w-4xl mx-auto h-[100dvh] md:h-[calc(100vh-2rem)] md:my-4 flex flex-col bg-white dark:bg-slate-950 border-x border-slate-200 dark:border-slate-800 md:border md:rounded-3xl overflow-hidden shadow-2xl relative">
       {/* Header */}
       <header className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md z-10 relative">
          <div className="flex items-center gap-4">
             <Link href="/practice/conversation">
                <Button variant="ghost" size="icon" className="rounded-full shrink-0">
                   <ChevronLeft className="w-5 h-5" />
                </Button>
             </Link>
             <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${mode === 'guided' ? 'bg-indigo-100 text-indigo-600' : persona.color}`}>
                   <span className="font-bold text-lg">{mode === 'guided' ? scenario?.title[0] : persona.name[0]}</span>
                </div>
                <div>
                   <h2 className="font-bold text-slate-900 dark:text-white leading-tight">
                      {mode === 'guided' ? scenario?.title : persona.name}
                   </h2>
                   <p className="text-xs text-slate-500 font-medium">
                      {mode === 'guided' ? scenario?.aiRole : persona.role} • {duration}m session
                   </p>
                </div>
             </div>
          </div>
       </header>

       {/* Chat Area */}
       <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 pb-40 scroll-smooth">
          {messages.map((msg, i) => (
             <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                
                <div className={`max-w-[85%] rounded-2xl p-4 ${
                  msg.role === 'user' 
                    ? 'bg-primary-600 text-white rounded-br-none shadow-md shadow-primary-600/20' 
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200 dark:border-slate-800'
                }`}>
                   <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>

                {/* Inline Feedback Card (only shown for user messages if feedback exists) */}
                {msg.feedback && (
                  <div className="mt-2 w-full max-w-[85%] animate-in fade-in slide-in-from-top-2">
                    <Card className="p-4 bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/30">
                       <h4 className="flex items-center gap-1.5 text-sm font-bold text-amber-700 dark:text-amber-400 mb-3">
                         <Sparkles className="w-4 h-4" /> AI Feedback
                       </h4>
                       
                       {msg.feedback.grammar_correction && (
                          <div className="mb-3 space-y-1">
                            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Grammar Fix</span>
                            <div className="flex gap-2 text-sm">
                               <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                               <span className="font-medium text-slate-700 dark:text-slate-300">{msg.feedback.grammar_correction}</span>
                            </div>
                          </div>
                       )}

                       {msg.feedback.better_sentence && (
                          <div className="mb-3 space-y-1">
                            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Better way to say it</span>
                            <div className="p-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg text-sm text-slate-700 dark:text-slate-200 font-medium">
                               "{msg.feedback.better_sentence}"
                            </div>
                          </div>
                       )}

                       {msg.feedback.hinglish_explanation && (
                          <div className="space-y-1 pt-2 border-t border-amber-100 dark:border-amber-900/20">
                            <span className="text-xs uppercase font-bold text-amber-600/60 dark:text-amber-400/60 tracking-wider flex items-center gap-1">
                               <AlertCircle className="w-3 h-3" /> Teacher's Note
                            </span>
                            <p className="text-sm italic text-amber-900 dark:text-amber-200">{msg.feedback.hinglish_explanation}</p>
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
                   <Loader2 className="w-4 h-4 animate-spin" /> {persona.name} is typing...
                </div>
             </div>
          )}
       </div>

       {/* Floating Mic Bottom Bar */}
       <div className="absolute bottom-6 left-0 w-full px-4">
          <div className="max-w-md mx-auto bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-2xl p-4 rounded-full flex items-center justify-between gap-4">
            
            <div className="text-sm font-medium text-slate-500 pl-4 w-1/3">
              {isRecording ? <span className="text-red-500 flex items-center gap-2 animate-pulse"><div className="w-2 h-2 bg-red-500 rounded-full" /> Recording...</span> : "Tap to speak"}
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
              <Button variant="ghost" size="icon" className="rounded-full text-slate-400" onClick={() => setMessages(messages.slice(0,1))}>
                <RefreshCw className="w-5 h-5" />
              </Button>
            </div>
          </div>
       </div>

    </div>
  );
}
