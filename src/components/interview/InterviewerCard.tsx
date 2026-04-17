"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { Sparkles, Mic, Loader2, Volume2 } from 'lucide-react';

export type InterviewState = 'SPEAKING' | 'LISTENING' | 'THINKING' | 'IDLE';

interface InterviewerCardProps {
  name: string;
  role: string;
  state: InterviewState;
  text: string;
}

export const InterviewerCard: React.FC<InterviewerCardProps> = ({ name, role, state, text }) => {
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Visual Persona / "Camera" Card */}
      <Card className="aspect-video bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl relative group border-4 border-white dark:border-slate-800 transition-all duration-500">
        {/* Placeholder Avatar / Video Loop Simulator */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-900 to-black flex items-center justify-center">
            {/* Animated Glow behind persona */}
            <div className={`absolute w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl transition-opacity duration-1000 ${state === 'SPEAKING' ? 'opacity-100' : 'opacity-30'}`} />
            
            <div className="relative text-center">
                <div className="w-24 h-24 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white shadow-2xl font-black text-4xl mb-4 mx-auto group-hover:scale-105 transition-transform duration-500">
                    {name[0] || "I"}
                </div>
                <div>
                   <h3 className="text-xl font-black text-white tracking-tight">{name}</h3>
                   <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{role}</p>
                </div>
            </div>
        </div>

        {/* Status HUD Overlay */}
        <div className="absolute top-6 left-6 flex items-center gap-3">
             <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
                <div className={`w-2 h-2 rounded-full ${state === 'SPEAKING' ? 'bg-indigo-500 animate-pulse' : state === 'LISTENING' ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`} />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">
                    {state === 'SPEAKING' ? 'Interviewer Speaking' : state === 'LISTENING' ? 'Host Listening' : state === 'THINKING' ? 'Interviewer Thinking' : 'Live Connection'}
                </span>
             </div>
        </div>

        {/* Speech Visualizers (Bottom Overlay) */}
        {state === 'SPEAKING' && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-end gap-1 h-8 animate-in fade-in zoom-in duration-500">
             {[0.5, 0.8, 0.4, 0.9, 0.6, 0.3, 0.7].map((h, i) => (
                <div 
                  key={i} 
                  className="w-1.5 bg-indigo-400 rounded-full animate-bounce"
                  style={{ height: `${h * 100}%`, animationDelay: `${i * 0.1}s` }}
                />
             ))}
          </div>
        )}
      </Card>

      {/* Synchronized Subtitles / Speech Bubble */}
      <div className="mt-8 transition-all duration-500">
         <div className="relative group">
            <div className="p-6 bg-white dark:bg-slate-900 rounded-[2.5rem] rounded-tl-none border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none min-h-[120px] flex items-center">
                <div className="absolute top-4 right-6 flex items-center gap-2 opacity-30 group-hover:opacity-100 transition-opacity">
                    {state === 'SPEAKING' ? <Volume2 className="w-4 h-4 text-indigo-500" /> : state === 'THINKING' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                </div>
                <p className="text-slate-800 dark:text-slate-200 font-bold text-2xl leading-tight">
                    {text || "Connecting to secure interview room..."}
                </p>
            </div>
            {/* Shadow decoration */}
            <div className="absolute -z-10 bottom-0 left-4 w-[90%] h-4 bg-slate-200/50 dark:bg-slate-800/50 blur-xl translate-y-2 rounded-full" />
         </div>
      </div>
    </div>
  );
};
