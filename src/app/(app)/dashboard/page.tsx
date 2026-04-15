"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame, Clock, CalendarDays, ArrowRight, Play, TrendingUp, AlertCircle, Mic, Loader2, BookOpen, MessageSquareText, GraduationCap, Users } from "lucide-react";
import Link from "next/link";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from "@/lib/supabaseClient";
import { DailyVideoWidget } from "@/components/video/DailyVideoWidget";
import { triggerRefreshIfNeeded } from "@/lib/services/refreshContent";

interface StatData {
  current_streak: number;
  total_sessions: number;
  speaking_time: string;
  avg_fluency: number;
  vocab_count: number;
}

interface FocusArea {
  title: string;
  original: string;
  correction: string;
  status: "Needs Work" | "Improving" | "Strong";
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<StatData>({
    current_streak: 0,
    total_sessions: 0,
    speaking_time: "0m",
    avg_fluency: 0,
    vocab_count: 0
  });
  const [focusAreas, setFocusAreas] = useState<FocusArea[]>([]);
  const [recentActivity, setRecentActivity] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      // Trigger lazy content refresh
      await triggerRefreshIfNeeded();

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const userId = session.user.id;

      // 1. Fetch Basic Profile & Streak
      const [profileRes, streakRes, vocabRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('streaks').select('*').eq('user_id', userId).single(),
        supabase.from('saved_words').select('id', { count: 'exact' }).eq('user_id', userId)
      ]);

      // 2. Fetch Sessions for Speaking Time & Fluency
      const [challengeSessions, aiSessions] = await Promise.all([
        supabase.from('sessions').select('*, scores(*)').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('conversation_sessions').select('*, conversation_feedback(*)').eq('user_id', userId).order('created_at', { ascending: false })
      ]);

      // 3. Fetch Recent Mistakes for Focus Areas
      const { data: recentMistakes } = await supabase.from('mistakes')
        .select('*, sessions!inner(user_id)')
        .eq('sessions.user_id', userId)
        .order('id', { ascending: false })
        .limit(3);

      // Processing Speaking Time
      const totalSecs = (challengeSessions.data?.reduce((acc, s) => acc + (s.duration_seconds || 0), 0) || 0) +
                       (aiSessions.data?.length || 0) * 30; // Approx 30s per AI session message exchange
      const mins = Math.floor(totalSecs / 60);
      const hours = Math.floor(mins / 60);
      const timeStr = hours > 0 ? `${hours}h ${mins % 60}m` : `${mins}m`;

      // Processing Avg Fluency
      const challengeFluency = challengeSessions.data?.map(s => s.scores?.[0]?.fluency).filter(Boolean) || [];
      const aiFluency = aiSessions.data?.map(s => s.conversation_feedback?.[0]?.fluency_score).filter(Boolean) || [];
      const allFluency = [...challengeFluency, ...aiFluency];
      const avgFluency = allFluency.length > 0 ? Math.round(allFluency.reduce((a, b) => a + b, 0) / allFluency.length) : 0;

      // Processing Focus Areas
      const processedFocus: FocusArea[] = (recentMistakes || []).map(m => ({
        title: "Grammar Fix",
        original: m.original,
        correction: m.correction,
        status: "Needs Work"
      }));

      // Fallback if no mistakes yet
      if (processedFocus.length === 0) {
        processedFocus.push({
          title: "Get Started",
          original: "Practice your first session",
          correction: "to see focus areas here!",
          status: "Strong"
        });
      }

      // Processing Recent Activity for "Jump Back In"
      const lastChallenge = challengeSessions.data?.[0];
      const lastAI = aiSessions.data?.[0];
      let last: any = null;
      if (lastChallenge && lastAI) {
        last = new Date(lastChallenge.created_at) > new Date(lastAI.created_at) ? lastChallenge : lastAI;
      } else {
        last = lastChallenge || lastAI;
      }

      setStats({
        current_streak: streakRes.data?.current_streak || 0,
        total_sessions: streakRes.data?.total_sessions || 0,
        speaking_time: timeStr,
        avg_fluency: avgFluency,
        vocab_count: vocabRes.count || 0
      });
      setProfile(profileRes.data);
      setFocusAreas(processedFocus);
      setRecentActivity(last);

      // Generate Chart Data (Last 7 Sessions or days)
      const mockChart = [
        { day: 'Mon', fluency: 65, grammar: 70 },
        { day: 'Tue', fluency: 68, grammar: 72 },
        { day: 'Wed', fluency: 72, grammar: 75 },
        { day: 'Thu', fluency: 70, grammar: 78 },
        { day: 'Fri', fluency: 78, grammar: 82 },
        { day: 'Sat', fluency: 82, grammar: 85 },
        { day: 'Sun', fluency: 85, grammar: 88 },
      ];
      // If we had real daily aggregation, we'd use it. For now, we'll keep the trend mock but set the last point to real avg.
      if (avgFluency > 0) {
        mockChart[6].fluency = avgFluency;
      }
      setChartData(mockChart);

      setIsLoading(false);
    }
    loadDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">
            Hi, {profile?.name || "Student"} 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400">You've reached <span className="text-primary-600 dark:text-primary-400 font-bold">{stats.avg_fluency}%</span> fluency. Keep going!</p>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4 flex flex-col justify-between bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/5 rounded-full -mr-8 -mt-8 group-hover:bg-orange-500/10 transition-colors" />
          <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-3">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-0.5">Streak</p>
            <p className="text-2xl font-bold font-display text-slate-900 dark:text-white">{stats.current_streak} Days</p>
          </div>
        </Card>

        <Card className="p-4 flex flex-col justify-between bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-full -mr-8 -mt-8 group-hover:bg-blue-500/10 transition-colors" />
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-0.5">Sessions</p>
            <p className="text-2xl font-bold font-display text-slate-900 dark:text-white">{stats.total_sessions}</p>
          </div>
        </Card>

        <Card className="p-4 flex flex-col justify-between bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full -mr-8 -mt-8 group-hover:bg-emerald-500/10 transition-colors" />
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-0.5">Total Talk</p>
            <p className="text-2xl font-bold font-display text-slate-900 dark:text-white">{stats.speaking_time}</p>
          </div>
        </Card>
        
        <Card className="p-4 flex flex-col justify-between bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/5 rounded-full -mr-8 -mt-8 group-hover:bg-purple-500/10 transition-colors" />
          <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-0.5">Avg Fluency</p>
            <p className="text-2xl font-bold font-display text-slate-900 dark:text-white">{stats.avg_fluency}%</p>
          </div>
        </Card>

        <Card className="p-4 flex flex-col justify-between bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/5 rounded-full -mr-8 -mt-8 group-hover:bg-cyan-500/10 transition-colors" />
          <div className="w-10 h-10 rounded-full bg-cyan-100 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-3">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-0.5">Vocabulary</p>
            <p className="text-2xl font-bold font-display text-slate-900 dark:text-white">{stats.vocab_count}</p>
          </div>
        </Card>
      </div>

      {/* Daily English Videos Section */}
      <DailyVideoWidget />

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <Card className="overflow-hidden bg-slate-900 border-slate-800 text-white relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/30 rounded-full blur-[80px]" />
            <div className="p-6 md:p-8 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-slate-200 text-sm font-medium mb-6">
                <AlertCircle className="w-4 h-4 text-emerald-400" />
                Quick Action
              </div>
              <h2 className="text-2xl md:text-3xl font-display font-bold mb-3">60-Second Challenge</h2>
              <p className="text-slate-300 max-w-sm mb-8">Speak on a random topic for 60 seconds. Instant feedback on filler words & pauses.</p>
              
              <Link href="/practice/sixty-seconds">
                <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 rounded-full font-bold">
                  <Play className="w-4 h-4 mr-2" /> Start Challenge
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold font-display mb-6 dark:text-white">Performance Trend</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      backgroundColor: 'var(--tw-background-opacity, #ffffff)',
                    }}
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                  <Line type="monotone" dataKey="fluency" stroke="#4F46E5" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                  <Line type="monotone" dataKey="grammar" stroke="#10B981" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div className="space-y-8">
          {/* Real Dynamic Focus Areas */}
          <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold font-display mb-4 dark:text-white">Focus Areas</h3>
            <div className="space-y-4">
              {focusAreas.map((area, idx) => (
                <div key={idx} className={`p-3 rounded-xl border ${
                  area.status === 'Needs Work' ? 'bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30' : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30'
                }`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className={`font-semibold ${area.status === 'Needs Work' ? 'text-red-900 dark:text-red-400' : 'text-emerald-900 dark:text-emerald-400'}`}>{area.title}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      area.status === 'Needs Work' ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                    }`}>{area.status}</span>
                  </div>
                  <p className="text-xs text-slate-500 line-through mb-1">"{area.original}"</p>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">→ {area.correction}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Real Dynamic Jump Back In */}
          <Card className="p-6">
            <h3 className="text-lg font-bold font-display mb-4">Jump Back In</h3>
            <div className="space-y-3">
              {recentActivity && (
                <Link href={recentActivity.mode === 'Topic Practice' ? `/practice/topic` : recentActivity.persona ? `/practice/conversation` : `/practice/sixty-seconds`} className="block group">
                   <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-primary-200 transition-all">
                      <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600">
                         {recentActivity.persona ? <MessageSquareText className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                         <p className="font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{recentActivity.topic || recentActivity.persona || "Last Session"}</p>
                         <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Continue Practice</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                   </div>
                </Link>
              )}
              
              <Link href="/learn" className="block group">
                <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/40 flex items-center justify-center group-hover:bg-indigo-100 text-indigo-600">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">Learning Hub</p>
                    <p className="text-sm text-slate-500">Grammar & Vocabulary</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>

              <Link href="/practice/roleplay" className="block group">
                <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200">
                  <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-900/40 flex items-center justify-center group-hover:bg-rose-100 text-rose-600">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">Real-life Roleplay</p>
                    <p className="text-sm text-slate-500">Interview, Restaurant & more</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-rose-500 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
