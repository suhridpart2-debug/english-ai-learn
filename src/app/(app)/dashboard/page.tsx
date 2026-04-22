"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Flame,
  Clock,
  CalendarDays,
  ArrowRight,
  Play,
  TrendingUp,
  AlertCircle,
  Mic,
  Loader2,
  BookOpen,
  MessageSquareText,
  Users,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { DailyVideoWidget } from "@/components/video/DailyVideoWidget";
import { triggerRefreshIfNeeded } from "@/lib/services/refreshContent";
import { DailyVocabWidget } from "@/components/vocabulary/DailyVocabWidget";
import { SavedContentWidget } from "@/components/dashboard/SavedContentWidget";
import { isPremium } from "@/lib/services/subscriptionService";

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
    vocab_count: 0,
  });
  const [focusAreas, setFocusAreas] = useState<FocusArea[]>([]);
  const [recentActivity, setRecentActivity] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        await triggerRefreshIfNeeded();

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          setIsLoading(false);
          return;
        }

        const userId = session.user.id;
        const userMetadata = session.user.user_metadata;

        // 1. Fetch Profile and handle Name Sync if needed
        let { data: profileData } = await supabase.from("profiles").select("*").eq("id", userId).single();
        
        if (profileData) {
          // If name is default/missing but we have it in Google Metadata, sync it
          const isDefaultName = !profileData.name || profileData.name === 'User' || profileData.name === 'Student';
          if (isDefaultName && userMetadata?.full_name) {
            const { data: updatedProfile } = await supabase
              .from('profiles')
              .update({ name: userMetadata.full_name })
              .eq('id', userId)
              .select()
              .single();
            if (updatedProfile) profileData = updatedProfile;
          }
        }

        const [streakRes, vocabRes, savedVideosRes] = await Promise.all([
          supabase.from("streaks").select("*").eq("user_id", userId).single(),
          supabase
            .from("saved_words")
            .select("id", { count: "exact", head: true })
            .eq("user_id", userId),
          supabase.from("user_video_progress").select("video_id").eq("user_id", userId).eq("saved", true)
        ]);

        const [challengeSessions, aiSessions] = await Promise.all([
          supabase
            .from("sessions")
            .select("*, scores(*)")
            .eq("user_id", userId)
            .order("created_at", { ascending: false }),
          supabase
            .from("conversation_sessions")
            .select("*, conversation_feedback(*)")
            .eq("user_id", userId)
            .order("created_at", { ascending: false }),
        ]);

        const { data: recentMistakes } = await supabase
          .from("mistakes")
          .select("*, sessions!inner(user_id)")
          .eq("sessions.user_id", userId)
          .order("id", { ascending: false })
          .limit(3);

        const totalSecs =
          (challengeSessions.data?.reduce(
            (acc, s) => acc + (s.duration_seconds || 0),
            0
          ) || 0) + (aiSessions.data?.length || 0) * 30;

        const mins = Math.floor(totalSecs / 60);
        const hours = Math.floor(mins / 60);
        const timeStr = hours > 0 ? `${hours}h ${mins % 60}m` : `${mins}m`;

        const challengeFluency =
          challengeSessions.data
            ?.map((s) => s.scores?.[0]?.fluency)
            .filter(Boolean) || [];

        const aiFluency =
          aiSessions.data
            ?.map((s) => s.conversation_feedback?.[0]?.fluency_score)
            .filter(Boolean) || [];

        const allFluency = [...challengeFluency, ...aiFluency];
        const avgFluency =
          allFluency.length > 0
            ? Math.round(
                allFluency.reduce((a: number, b: number) => a + b, 0) /
                  allFluency.length
              )
            : 0;

        const processedFocus: FocusArea[] = (recentMistakes || []).map((m) => ({
          title: "Grammar Fix",
          original: m.original,
          correction: m.correction,
          status: "Needs Work",
        }));

        if (processedFocus.length === 0) {
          processedFocus.push({
            title: "Get Started",
            original: "Practice your first session",
            correction: "to see focus areas here!",
            status: "Strong",
          });
        }

        const lastChallenge = challengeSessions.data?.[0];
        const lastAI = aiSessions.data?.[0];
        let last: any = null;

        if (lastChallenge && lastAI) {
          last =
            new Date(lastChallenge.created_at) > new Date(lastAI.created_at)
              ? lastChallenge
              : lastAI;
        } else {
          last = lastChallenge || lastAI;
        }

        setStats({
          current_streak: streakRes.data?.current_streak || 0,
          total_sessions: streakRes.data?.total_sessions || 0,
          speaking_time: timeStr,
          avg_fluency: avgFluency,
          vocab_count: vocabRes.count || 0,
        });

        setProfile(profileData);
        setFocusAreas(processedFocus);
        setRecentActivity(last);

        setIsLoading(false);

        const mockChart = [
          { day: "Mon", fluency: 65, grammar: 70 },
          { day: "Tue", fluency: 68, grammar: 72 },
          { day: "Wed", fluency: 72, grammar: 75 },
          { day: "Thu", fluency: 70, grammar: 78 },
          { day: "Fri", fluency: 78, grammar: 82 },
          { day: "Sat", fluency: 82, grammar: 85 },
          { day: "Sun", fluency: 85, grammar: 88 },
        ];

        if (avgFluency > 0) {
          mockChart[6].fluency = avgFluency;
        }

        setChartData(mockChart);
      } catch (error) {
        console.error("Dashboard load error:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6 text-slate-900 animate-in fade-in slide-in-from-bottom-4 duration-500 dark:text-white">
      <header className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">
              Hi, {profile?.name || "Student"} 👋
            </h1>
            {isPremium(profile) && (
              <Link href="/billing">
                <span className="inline-flex items-center rounded-full bg-indigo-600 px-2.5 py-0.5 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                  PRO
                </span>
              </Link>
            )}
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            You've reached{" "}
            <span className="font-bold text-indigo-600 dark:text-indigo-400">
              {stats.avg_fluency}%
            </span>{" "}
            fluency. Keep going!
          </p>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <Card className="relative overflow-hidden p-4">
          <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-orange-500/5" />
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <p className="mb-0.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Streak
            </p>
            <p className="font-display text-2xl font-bold text-slate-900 dark:text-white">
              {stats.current_streak} Days
            </p>
          </div>
        </Card>

        <Card className="relative overflow-hidden p-4">
          <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-blue-500/5" />
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div>
            <p className="mb-0.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Sessions
            </p>
            <p className="font-display text-2xl font-bold text-slate-900 dark:text-white">
              {stats.total_sessions}
            </p>
          </div>
        </Card>

        <Card className="relative overflow-hidden p-4">
          <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-emerald-500/5" />
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="mb-0.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Talk
            </p>
            <p className="font-display text-2xl font-bold text-slate-900 dark:text-white">
              {stats.speaking_time}
            </p>
          </div>
        </Card>

        <Card className="relative overflow-hidden p-4">
          <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-purple-500/5" />
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <p className="mb-0.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Avg Fluency
            </p>
            <p className="font-display text-2xl font-bold text-slate-900 dark:text-white">
              {stats.avg_fluency}%
            </p>
          </div>
        </Card>



        <Card className="relative overflow-hidden p-4">
          <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-cyan-500/5" />
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-cyan-100 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <p className="mb-0.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Vocabulary
            </p>
            <p className="font-display text-2xl font-bold text-slate-900 dark:text-white">
              {stats.vocab_count}
            </p>
          </div>
        </Card>
      </div>

      <DailyVocabWidget isPremium={isPremium(profile)} />

      <DailyVideoWidget isPremium={isPremium(profile)} />

      <SavedContentWidget />

      <div className="grid gap-8 md:grid-cols-3">
        <div className="space-y-8 md:col-span-2">
          <Card className="relative overflow-hidden border border-slate-200 bg-gradient-to-br from-indigo-50 via-white to-slate-50 text-slate-900 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950 dark:text-white">
            <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-indigo-500/10 blur-[80px] dark:bg-indigo-500/20" />
            <div className="relative z-10 p-6 md:p-8">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700 dark:bg-white/10 dark:text-slate-200">
                <AlertCircle className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                Quick Action
              </div>

              <h2 className="mb-3 font-display text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">
                60-Second Challenge
              </h2>

              <p className="mb-8 max-w-sm text-slate-600 dark:text-slate-300">
                Speak on a random topic for 60 seconds. Instant feedback on
                filler words & pauses.
              </p>

              <Link href="/practice/sixty-seconds">
                <Button
                  size="lg"
                  className="rounded-full bg-indigo-600 font-bold text-white hover:bg-indigo-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Start Challenge
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-6 font-display text-lg font-bold text-slate-900 dark:text-white">
              Performance Trend
            </h3>

            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                  />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    dx={-10}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                      backgroundColor: "#ffffff",
                      color: "#0f172a",
                    }}
                    itemStyle={{ fontWeight: "bold", color: "#0f172a" }}
                    labelStyle={{ color: "#0f172a" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="fluency"
                    stroke="#4F46E5"
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="grammar"
                    stroke="#10B981"
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="p-6">
            <h3 className="mb-4 font-display text-lg font-bold text-slate-900 dark:text-white">
              Focus Areas
            </h3>

            <div className="space-y-4">
              {focusAreas.map((area, idx) => (
                <div
                  key={idx}
                  className={`rounded-xl border p-3 ${
                    area.status === "Needs Work"
                      ? "border-red-100 bg-red-50 dark:border-red-900/30 dark:bg-red-950/20"
                      : "border-emerald-100 bg-emerald-50 dark:border-emerald-900/30 dark:bg-emerald-950/20"
                  }`}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span
                      className={`font-semibold ${
                        area.status === "Needs Work"
                          ? "text-red-900 dark:text-red-400"
                          : "text-emerald-900 dark:text-emerald-400"
                      }`}
                    >
                      {area.title}
                    </span>

                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                        area.status === "Needs Work"
                          ? "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400"
                          : "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
                      }`}
                    >
                      {area.status}
                    </span>
                  </div>

                  <p className="mb-1 text-xs text-slate-500 line-through dark:text-slate-400">
                    "{area.original}"
                  </p>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    → {area.correction}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-4 font-display text-lg font-bold text-slate-900 dark:text-white">
              Jump Back In
            </h3>

            <div className="space-y-3">
              {recentActivity && (
                <Link
                  href={
                    recentActivity.mode === "Topic Practice"
                      ? "/practice/topic"
                      : recentActivity.persona
                      ? "/practice/conversation"
                      : "/practice/sixty-seconds"
                  }
                  className="group block"
                >
                  <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-3 transition-all hover:border-indigo-200 dark:border-slate-800 dark:bg-slate-800/50 dark:hover:border-indigo-700">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                      {recentActivity.persona ? (
                        <MessageSquareText className="h-5 w-5" />
                      ) : (
                        <Mic className="h-5 w-5" />
                      )}
                    </div>

                    <div className="flex-1">
                      <p className="line-clamp-1 font-bold text-slate-900 dark:text-slate-100">
                        {recentActivity.topic ||
                          recentActivity.persona ||
                          "Last Session"}
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                        Continue Practice
                      </p>
                    </div>

                    <ArrowRight className="h-4 w-4 text-slate-400 transition-all group-hover:translate-x-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                  </div>
                </Link>
              )}

              <Link href="/learn" className="group block">
                <div className="flex items-center gap-4 rounded-xl border border-transparent p-3 transition-colors hover:border-slate-200 hover:bg-slate-50 dark:hover:border-slate-800 dark:hover:bg-slate-800">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 dark:bg-indigo-900/40 dark:text-indigo-400">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      Learning Hub
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Grammar & Vocabulary
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 transition-all group-hover:translate-x-1 group-hover:text-indigo-500" />
                </div>
              </Link>

              <Link href="/practice/roleplay" className="group block">
                <div className="flex items-center gap-4 rounded-xl border border-transparent p-3 transition-colors hover:border-slate-200 hover:bg-slate-50 dark:hover:border-slate-800 dark:hover:bg-slate-800">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600 group-hover:bg-rose-100 dark:bg-rose-900/40 dark:text-rose-400">
                    <Users className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      Real-life Roleplay
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Interview, Restaurant & more
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 transition-all group-hover:translate-x-1 group-hover:text-rose-500" />
                </div>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}