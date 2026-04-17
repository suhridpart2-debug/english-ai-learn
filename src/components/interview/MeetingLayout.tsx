"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, PhoneOff, Settings, ShieldCheck, Wifi, UserPlus, Info, AlertCircle, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

interface MeetingLayoutProps {
  interviewerName: string;
  interviewerRole: string;
  interviewerState: 'SPEAKING' | 'LISTENING' | 'THINKING' | 'IDLE';
  currentQuestion: string;
  timeLeft: string;
  phase: string;
  
  videoRef: React.RefObject<HTMLVideoElement>;
  isMicOn: boolean;
  onMicToggle: () => void;
  isDistracted: boolean;
  
  children: React.ReactNode; // For the Interviewer Stage (Animated Avatar)
}

export const MeetingLayout: React.FC<MeetingLayoutProps> = ({
  interviewerName,
  interviewerRole,
  interviewerState,
  currentQuestion,
  timeLeft,
  phase,
  videoRef,
  isMicOn,
  onMicToggle,
  isDistracted,
  children
}) => {
  return (
    <div className="h-screen w-screen bg-slate-950 overflow-hidden relative flex flex-col font-sans selection:bg-indigo-500/30 text-white">
      
      {/* 1. TOP HUD - Session Metadata */}
      <header className="absolute top-0 left-0 w-full p-8 flex items-center justify-between z-30 pointer-events-none">
        <div className="flex items-center gap-6 pointer-events-auto">
          <div className="hidden md:block">
            <h2 className="font-black tracking-tight text-xl leading-tight uppercase flex items-center gap-2">
                {interviewerName} <ShieldCheck className="w-5 h-5 text-indigo-400" />
            </h2>
            <div className="flex items-center gap-3">
                 <div className="px-2 py-0.5 bg-indigo-500 rounded text-[9px] font-black uppercase tracking-tighter">
                    {phase}
                 </div>
                 <div className="flex items-center gap-2 opacity-60">
                    <Wifi className="w-3 h-3 text-emerald-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Secure Connection</span>
                 </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 pointer-events-auto">
             <div className="px-5 py-2.5 bg-black/40 backdrop-blur-2xl rounded-2xl border border-white/5 flex items-center gap-3 shadow-2xl">
                <span className="font-mono font-black text-sm">{timeLeft}</span>
            </div>
            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-black/20 hover:bg-black/40 backdrop-blur-xl border border-white/5">
                <Settings className="w-5 h-5 text-white/60" />
            </Button>
        </div>
      </header>

      {/* 2. MAIN STAGE - INTERVIEWER */}
      <main className="flex-1 relative overflow-hidden bg-slate-900 flex items-center justify-center">
            {children}

            {/* ATTENTION OVERLAY */}
            {isDistracted && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 animate-in fade-in zoom-in duration-300">
                    <div className="bg-red-600/90 backdrop-blur-2xl p-8 rounded-[3rem] border border-white/20 shadow-2xl flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-red-600">
                            <AlertCircle className="w-10 h-10" />
                        </div>
                        <div className="text-center">
                            <h4 className="font-black text-xl mb-1 uppercase tracking-tight">Focus Detected Lost</h4>
                            <p className="text-white/80 text-sm font-bold">Please stay centered and maintain eye contact.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* DYNAMIC TRANSCRIPT / SUBTITLES */}
            {currentQuestion && (
                <div className="absolute bottom-40 left-1/2 -translate-x-1/2 z-20 w-full max-w-4xl text-center px-6 transition-all duration-700">
                    <div className="bg-black/60 backdrop-blur-3xl px-12 py-6 rounded-[2.5rem] border border-white/5 shadow-2xl">
                        <p className="text-white text-2xl font-bold leading-relaxed tracking-tight drop-shadow-xl">
                            {currentQuestion}
                        </p>
                    </div>
                </div>
            )}
      </main>

      {/* 3. CONTROL PILL - MEETING BAR */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-40 w-full max-w-3xl px-6">
          <div className="bg-black/60 backdrop-blur-3xl px-8 py-5 rounded-[2.5rem] border border-white/10 shadow-2xl flex items-center justify-between gap-8 transition-all duration-500">
              
              {/* Left Group: App Info */}
              <div className="hidden md:flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${interviewerState === 'SPEAKING' ? 'bg-indigo-600' : 'bg-slate-800'} transition-colors`}>
                      <Mic className="w-5 h-5" />
                  </div>
                  <div>
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none mb-1">Status</p>
                      <p className="text-xs font-bold uppercase tracking-tight">{interviewerState}</p>
                  </div>
              </div>

              {/* Center Group: Core Actions */}
              <div className="flex items-center gap-6">
                   <Button 
                     onClick={onMicToggle}
                     className={`w-14 h-14 rounded-full transition-all duration-300 ${isMicOn ? 'bg-white/10 hover:bg-white text-white hover:text-black' : 'bg-red-500 hover:bg-red-600 text-white'}`}
                   >
                       {isMicOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                   </Button>

                   <Link href="/practice/interview">
                        <Button className="w-20 h-14 rounded-[1.5rem] bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-600/20">
                            <PhoneOff className="w-6 h-6" />
                        </Button>
                   </Link>
              </div>

              {/* Right Group: Participants/Layout */}
              <div className="flex items-center gap-4 opacity-60">
                   <UserPlus className="w-5 h-5 pointer-events-auto cursor-pointer" />
                   <Info className="w-5 h-5 pointer-events-auto cursor-pointer" />
              </div>

          </div>
      </div>

      {/* 4. SELF-VIEW - FLOATING PREVIEW */}
      <div className="absolute bottom-32 right-10 z-30 w-72 aspect-video bg-slate-900 rounded-[2rem] overflow-hidden border-2 border-white/10 shadow-3xl group">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover mirror scale-[1.05]" />
            <div className="absolute top-4 left-4 flex items-center gap-2 px-2 py-1 bg-black/60 backdrop-blur rounded-lg">
                {isDistracted ? <EyeOff className="w-3 h-3 text-red-500" /> : <Eye className="w-3 h-3 text-emerald-500" />}
                <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                    {isDistracted ? "Distracted" : "Focused"}
                </span>
            </div>
      </div>

    </div>
  );
};
