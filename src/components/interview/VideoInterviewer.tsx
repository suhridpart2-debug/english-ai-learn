"use client";

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Sparkles, Mic, Loader2, Volume2, ShieldCheck, Wifi } from 'lucide-react';

export type InterviewState = 'SPEAKING' | 'LISTENING' | 'THINKING' | 'IDLE';

interface VideoInterviewerProps {
  name: string;
  role: string;
  state: InterviewState;
  text: string;
}

export const VideoInterviewer: React.FC<VideoInterviewerProps> = ({ name, role, state, text }) => {
  const [showSubtitle, setShowSubtitle] = useState(false);

  useEffect(() => {
    if (text) {
      setShowSubtitle(true);
      const timer = setTimeout(() => setShowSubtitle(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [text]);

  return (
    <div className="relative h-full w-full bg-slate-950 overflow-hidden flex items-center justify-center">
      {/* 1. IMMERSIVE VIDEO BACKDROP (Human Simulator) */}
      <div className="absolute inset-0 transition-all duration-1000">
          {/* Subtle Video-like noise/grain overlay */}
          <div className="absolute inset-0 z-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
          
          {/* Main Persona Stage */}
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
               {/* Background Glow (Conversational State) */}
               <div className={`absolute w-[100vw] h-[100vh] rounded-full blur-[120px] transition-all duration-[3000ms] ${
                   state === 'SPEAKING' ? 'bg-indigo-500/10' : 
                   state === 'LISTENING' ? 'bg-emerald-500/10' : 
                   'bg-white/5'
               }`} />

               {/* PERSONA: High-End Avatar Simulator */}
               <div className={`relative flex flex-col items-center transition-all duration-1000 ${
                   state === 'LISTENING' ? 'scale-[1.02] translate-y-[-10px]' : 'scale-100'
               }`}>
                   {/* Breathing Animation Wrapper */}
                   <div className="relative animate-breathing">
                        <div className="w-56 h-56 rounded-[3rem] bg-gradient-to-br from-slate-800 to-slate-900 border-4 border-slate-700/50 flex items-center justify-center shadow-[0_0_80px_rgba(0,0,0,0.5)] overflow-hidden">
                             {/* Human Avatar Placeholder */}
                             <div className="w-full h-full bg-slate-800 flex items-center justify-center text-white font-black text-6xl opacity-40">
                                {name[0]}
                             </div>
                             
                             {/* "Live" Scanline Effect */}
                             <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent h-1/2 w-full animate-scanline pointer-events-none" />
                        </div>
                        
                        {/* Status Halo */}
                        {state === 'SPEAKING' && (
                           <div className="absolute -inset-4 border-2 border-indigo-500/30 rounded-[4rem] animate-ping opacity-30" />
                        )}
                   </div>

                   {/* Title Card */}
                   <div className="mt-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        <div className="flex items-center gap-2 justify-center mb-1">
                             <h2 className="text-2xl font-black text-white/90 tracking-tight">{name}</h2>
                             <ShieldCheck className="w-4 h-4 text-indigo-400" />
                        </div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{role}</p>
                   </div>
               </div>
          </div>
      </div>

      {/* 2. HUD OVERLAYS (Meet Style) */}
      <div className="absolute top-10 left-10 z-20 flex items-center gap-3">
           <div className="flex items-center gap-2 px-3 py-1 bg-black/40 backdrop-blur-md rounded-lg border border-white/5">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Live • 1080p</span>
           </div>
           <div className="flex items-center gap-2 px-3 py-1 bg-black/40 backdrop-blur-md rounded-lg border border-white/5">
                <Wifi className="w-3 h-3 text-emerald-500" />
                <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Stable</span>
           </div>
      </div>

      {/* 3. SUBTITLES / TRANSCRIPT (Dynamic Fade) */}
      {showSubtitle && text && (
        <div className="absolute bottom-40 left-1/2 -translate-x-1/2 z-20 w-full max-w-3xl text-center px-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
           <div className="bg-black/40 backdrop-blur-3xl px-8 py-4 rounded-[2rem] border border-white/5 shadow-2xl">
                <p className="text-white text-xl font-bold leading-relaxed drop-shadow-lg">
                    {text}
                </p>
           </div>
        </div>
      )}

      {/* 4. STATE INDICATOR (BOTTOM CORNER) */}
      <div className="absolute bottom-10 left-10 z-20">
           <div className="p-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    state === 'SPEAKING' ? 'bg-indigo-600 text-white' : 
                    state === 'LISTENING' ? 'bg-emerald-600 text-white' : 
                    'bg-slate-800 text-slate-400'
                }`}>
                    {state === 'THINKING' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mic className="w-5 h-5" />}
                </div>
                <div>
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Status</p>
                     <p className="text-sm font-bold text-white uppercase tracking-tight">
                        {state === 'SPEAKING' ? 'Interviewer Speaking' : state === 'LISTENING' ? 'Listening...' : 'Thinking'}
                     </p>
                </div>
           </div>
      </div>

      <style jsx global>{`
        @keyframes breathing {
          0%, 100% { transform: scale(1); opacity: 0.95; }
          50% { transform: scale(1.02); opacity: 1; }
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(200%); }
        }
        .animate-breathing {
          animation: breathing 4s ease-in-out infinite;
        }
        .animate-scanline {
          animation: scanline 8s linear infinite;
        }
      `}</style>
    </div>
  );
};
