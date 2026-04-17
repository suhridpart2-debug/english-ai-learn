"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { MeetingLayout } from "@/components/meeting/MeetingLayout";
import { VideoInterviewer } from "@/components/interview/VideoInterviewer";
import { useVoiceEngine } from "@/lib/hooks/useVoiceEngine";
import { useAttentionMonitor } from "@/lib/hooks/useAttentionMonitor";
import { InterviewService, PHASE_ROADMAP, InterviewPhase } from "@/lib/services/interviewService";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function InterviewRoom() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params?.id as string;

  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [interviewerState, setInterviewerState] = useState<'SPEAKING' | 'LISTENING' | 'THINKING' | 'IDLE'>('IDLE');
  const [currentPhase, setCurrentPhase] = useState<InterviewPhase>('INTRO');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  // 1. Voice Engine Hook (Hardened for state synchronization)
  const voice = useVoiceEngine(
    // Barge-in callback
    () => {
      if (voice.cancelSpeech()) {
          console.log("[Barge-in] User speech detected. Canceling AI TTS.");
          setInterviewerState('LISTENING');
          // Note: VoiceEngine.cancelSpeech() handles the TTS side.
          // The recognition is already running if this is calling.
      }
    },
    // Auto-submission callback
    (transcript) => {
        if (!isProcessing && transcript.length > 5) {
            handleUserResponse(transcript);
        }
    }
  );

  // 2. Attention Monitor Hook (Heuristic Focus)
  const { isDistracted } = useAttentionMonitor(videoRef);

  // 3. HARDENED INITIALIZATION (Wait for session record)
  useEffect(() => {
    let active = true;
    let retryCount = 0;
    const maxRetries = 5;

    const init = async () => {
      try {
        setLoading(true);
        setInterviewerState('THINKING');

        const fetchSess = async (): Promise<any> => {
           if (!active) return null;
           const { data: sess } = await supabase.from('interview_sessions').select('*').eq('id', sessionId).single();
           if (sess) return sess;
           if (retryCount < maxRetries) {
             retryCount++;
             await new Promise(r => setTimeout(r, 1000));
             return fetchSess();
           }
           return null;
        };

        const sess = await fetchSess();
        if (!active) return;
        if (!sess) {
            setError("Session initialization failed. Room record not found.");
            setLoading(false);
            return;
        }

        setSession(sess);
        setLoading(false);

        // Fetch First Question Safely
        const { question } = await InterviewService.getNextQuestion(sessionId, 'INTRO');
        if (!active) return;
        setCurrentQuestion(question);
        
        // SYNCED STARTUP SEQUENCE: Speak greeting -> Wait -> Speak question -> Start listening
        const greeting = `Welcome. I am the lead technical evaluator for the ${sess.role} position. We will begin now.`;
        voice.speak(greeting, () => {
            if (!active) return;
            setTimeout(() => {
               if (!active) return;
               voice.speak(question, () => {
                   if (!active) return;
                   voice.startListening(); // <--- Only start listening AFTER all intro TTS is done
               });
            }, 800);
        });

      } catch (err: any) {
        if (!active) return;
        console.error("Initialization failed:", err);
        setError("Failed to establish interview connection.");
        setLoading(false);
      }
    };

    if (sessionId) init();
    return () => { active = false; };
  }, [sessionId, router]);

  // 4. TIMER & PHASE PROGRESSION (15-min Roadmap)
  useEffect(() => {
    if (loading || !!error) return;
    const timerInterval = setInterval(() => {
        setTimeLeft(prev => {
            const next = prev + 1;
            return next;
        });
    }, 1000);
    return () => clearInterval(timerInterval);
  }, [loading, error]);

  const handleUserResponse = async (text: string) => {
    if (isProcessing) return; // Guard against duplicate submissions
    setIsProcessing(true);
    setInterviewerState('THINKING');
    
    // Stop mic BEFORE processing to ensure a clean state
    voice.stopListening();

    try {
      const res = await fetch("/api/interview/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, question: currentQuestion, answer: text, phase: currentPhase, elapsed: timeLeft })
      });
      const data = await res.json();
      
      if (data.isLast) {
        voice.speak("This concludes our evaluation. Thank you for participating.", () => {
             router.push(`/practice/interview/history`);
        });
      } else if (data.nextQuestion) {
        let bridge = "Understood. Reaching deeper now.";
        
        // Transition logic (Core 15-min Roadmap)
        let nextP = currentPhase;
        const phases: InterviewPhase[] = ['WARMUP', 'TECHNICAL_CORE', 'TECHNICAL_DEPTH', 'SITUATIONAL', 'WRAPUP'];
        for (const p of [...phases].reverse()) {
            if (timeLeft >= PHASE_ROADMAP[p].minSeconds) {
                nextP = p;
                break;
            }
        }
        if (nextP !== currentPhase) {
            setCurrentPhase(nextP);
            bridge = PHASE_ROADMAP[nextP].bridge;
        }

        // SYNCED TRANSITION: Speak bridge -> Speak next question -> Start listening
        voice.speak(bridge, () => {
            setCurrentQuestion(data.nextQuestion);
            setTimeout(() => {
                 voice.speak(data.nextQuestion, () => {
                    voice.startListening(); // <--- Restart only after TTS completion
                 });
            }, 800);
        });
      }
    } catch (err: any) { 
        voice.startListening(); // Fallback to listening on failure
    } finally { 
        setIsProcessing(false); 
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const rs = s % 60;
    return `${m}:${rs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
        <div className="h-screen w-screen bg-neutral-950 flex flex-col items-center justify-center gap-6">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
            <p className="text-white/60 font-black uppercase tracking-[0.2em] animate-pulse">Initializing Interview Stream...</p>
        </div>
    );
  }

  if (error) {
    return (
        <div className="h-screen w-screen bg-neutral-900 flex flex-col items-center justify-center p-8 text-center uppercase tracking-tight">
            <AlertCircle className="w-16 h-16 text-red-500 mb-6" />
            <h3 className="text-white font-black text-2xl mb-2">Startup Error</h3>
            <p className="text-white/60 text-sm mb-8 max-w-xs">{error}</p>
            <Button onClick={() => router.push("/practice/interview")} variant="destructive" className="rounded-2xl px-12 h-14 font-black">
                Return
            </Button>
        </div>
    );
  }

  return (
    <MeetingLayout
        interviewerName={session?.company ? `Evaluator @ ${session.company}` : "Senior Lead"}
        interviewerState={interviewerState}
        currentQuestion={currentQuestion}
        timeLeft={formatTime(timeLeft)}
        phase={currentPhase.replace('_', ' ')}
        videoRef={videoRef}
        isMicOn={voice.isListening}
        onMicToggle={() => voice.isListening ? voice.stopListening() : voice.startListening()}
        isDistracted={isDistracted}
    >
        <VideoInterviewer 
            name={session?.company ? `Product Lead @ ${session.company}` : "Principal Lead"}
            role={session?.role || "Host"}
            state={interviewerState}
            text="" 
        />
    </MeetingLayout>
  );
}
