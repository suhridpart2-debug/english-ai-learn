"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Clock, Star, Mic, Quote, TrendingUp, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function HistoryPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('sessions')
        .select('*, scores(*)')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (data) {
        // Map Supabase rows to the UI format
        const mapped = data.map((s: any) => ({
          id: s.id,
          date: new Date(s.created_at).toLocaleDateString() + ", " + new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          mode: s.mode,
          topic: s.topic,
          score: s.scores?.[0] ? Math.round((s.scores[0].grammar + s.scores[0].fluency + s.scores[0].pronunciation) / 3) : 0,
          duration: `${Math.floor(s.duration_seconds / 60)}m ${s.duration_seconds % 60}s`,
          color: s.mode.includes("IELTS") 
            ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" 
            : s.mode.includes("Roleplay") 
            ? "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
            : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
        }));
        setSessions(mapped);
      }
      setIsLoading(false);
    }
    loadHistory();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32 md:pb-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Past Sessions</h1>
          <p className="text-slate-500">Review your speaking history and progress.</p>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
         <Card className="p-4 flex flex-col items-center justify-center text-center">
            <TrendingUp className="w-6 h-6 text-emerald-500 mb-2" />
            <p className="text-2xl font-display font-bold">+12%</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Avg Score (Week)</p>
         </Card>
         <Card className="p-4 flex flex-col items-center justify-center text-center">
            <Mic className="w-6 h-6 text-primary-500 mb-2" />
            <p className="text-2xl font-display font-bold">{sessions.length}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Total Uses</p>
         </Card>
      </div>

      <div className="space-y-4 relative">
        <div className="absolute left-6 top-8 bottom-8 w-px bg-slate-200 dark:bg-slate-800 hidden md:block" />
        
        {sessions.length === 0 ? (
          <div className="text-center py-12 text-slate-500">No sessions recorded yet. Start practicing!</div>
        ) : (
          sessions.map((session) => (
            <Card key={session.id} className="p-0 overflow-hidden relative group">
              <div className="flex flex-col md:flex-row">
                <div className="hidden md:flex flex-col items-center justify-center w-12 shrink-0 z-10 py-6 pl-4">
                   <div className="w-4 h-4 rounded-full bg-primary-100 border-2 border-primary-500 dark:bg-primary-900 shadow-[0_0_0_4px_white] dark:shadow-[0_0_0_4px_#020617]" />
                </div>
                
                <div className="flex-1 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${session.color}`}>
                         {session.mode.includes("IELTS") ? <Star className="w-5 h-5"/> : session.mode.includes("Roleplay") ? <Quote className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white leading-none mb-1">{session.mode}</h3>
                        <p className="text-sm text-slate-500">{session.date} • {session.duration}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 font-display font-bold text-lg">
                        {session.score}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Topic</p>
                    <p className="text-slate-900 dark:text-white font-medium">"{session.topic}"</p>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
