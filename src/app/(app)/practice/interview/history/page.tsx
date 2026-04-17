"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, Calendar, Award, Target, TrendingUp, ChevronRight, Briefcase, Building2, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function InterviewHistory() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('interview_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setSessions(data || []);
      setLoading(false);
    };
    fetchHistory();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh] text-slate-400 font-bold animate-pulse">
       Loading your history...
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-10 pb-24">
      <header className="flex items-center gap-4">
        <Link href="/practice/interview">
           <Button variant="ghost" size="icon" className="rounded-full shrink-0"><ChevronLeft className="w-5 h-5" /></Button>
        </Link>
        <div>
           <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Interview <span className="text-indigo-600">Performance</span></h1>
           <p className="text-slate-500 font-medium">Review your mock rounds and technical progress.</p>
        </div>
      </header>

      {sessions.length === 0 ? (
        <Card className="p-12 text-center space-y-4 rounded-3xl border-dashed border-2">
           <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto">
              <Award className="w-8 h-8 text-slate-300" />
           </div>
           <h3 className="text-xl font-bold text-slate-800 dark:text-white">No interviews yet</h3>
           <p className="text-slate-500 max-w-xs mx-auto text-sm">Start your first mock round to track your career readiness.</p>
           <Link href="/practice/interview">
              <Button className="rounded-xl bg-indigo-600 px-8 h-12 font-bold shadow-lg shadow-indigo-600/30">Start Now</Button>
           </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {sessions.map((session) => (
             <Card key={session.id} className="overflow-hidden group hover:border-indigo-500/50 transition-all rounded-2xl md:rounded-3xl border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-950">
               <div className="p-6 space-y-6">
                 {/* Status & Date */}
                 <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className={`px-2 py-0.5 rounded-full ${session.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                       {session.status}
                    </span>
                    <span className="text-slate-400 flex items-center gap-1">
                       <Calendar className="w-3 h-3" /> {new Date(session.created_at).toLocaleDateString()}
                    </span>
                 </div>

                 {/* Company & Role */}
                 <div className="space-y-1">
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 transition-colors">
                       {session.role}
                    </h3>
                    <p className="text-sm font-bold text-slate-400 flex items-center gap-1.5">
                       <Building2 className="w-4 h-4" /> {session.company}
                    </p>
                 </div>

                 {/* Readiness Score (if completed) */}
                 {session.final_report ? (
                   <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                         <span className="text-xs font-bold text-indigo-500 uppercase">Readiness Score</span>
                         <span className="text-lg font-black text-indigo-700 dark:text-indigo-400">
                            {Math.round(session.final_report.overallScore * 10)}%
                         </span>
                      </div>
                      <div className="h-2 w-full bg-indigo-200 dark:bg-indigo-900/30 rounded-full overflow-hidden">
                         <div className="h-full bg-indigo-600" style={{ width: `${session.final_report.overallScore * 10}%` }} />
                      </div>
                   </div>
                 ) : (
                   <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-100 dark:border-slate-800 border-dashed">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Session Incomplete</p>
                   </div>
                 )}

                 {/* Footer Stats */}
                 <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                       <Target className="w-3.5 h-3.5" /> {session.difficulty}
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs font-bold text-indigo-500 hover:bg-slate-100 px-3 rounded-xl gap-1">
                       Full Report <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                 </div>
               </div>
             </Card>
           ))}
        </div>
      )}

      {/* Analytics Summary */}
      {sessions.length > 0 && (
        <Card className="p-8 md:p-10 rounded-[2.5rem] bg-slate-900 text-white border-none shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
           <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div className="space-y-4">
                 <h2 className="text-3xl font-bold tracking-tight">Technical Mastery <span className="text-indigo-400">Analysis</span></h2>
                 <p className="text-slate-400 leading-relaxed font-medium">Based on your last {sessions.length} sessions, your technical depth in <span className="text-white">Java</span> and <span className="text-white">DBMS</span> has improved by 22%.</p>
                 <div className="flex flex-wrap gap-3 pt-2">
                    <div className="px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold rounded-lg flex items-center gap-2">
                       <Award className="w-3.5 h-3.5" /> Strong: Communication
                    </div>
                    <div className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold rounded-lg flex items-center gap-2">
                       <Target className="w-3.5 h-3.5" /> Fix: System Design
                    </div>
                 </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-white/5 p-6 rounded-3xl text-center">
                    <p className="text-2xl font-black text-indigo-400">#1</p>
                    <p className="text-xs font-bold text-slate-500 uppercase mt-1">Global Percentile</p>
                 </div>
                 <div className="bg-white/5 p-6 rounded-3xl text-center">
                    <p className="text-2xl font-black text-indigo-400">{sessions.length}</p>
                    <p className="text-xs font-bold text-slate-500 uppercase mt-1">Rounds Cleared</p>
                 </div>
              </div>
           </div>
        </Card>
      )}
    </div>
  );
}
