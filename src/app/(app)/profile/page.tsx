"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Settings, LogOut, Award, Zap, Globe, Target, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      setSessionUser(session.user);
      
      const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      if (data) {
        setProfile(data);
      }
      setIsLoading(false);
    }
    loadProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32 md:pb-6">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Profile</h1>
        <Button variant="ghost" size="icon" className="rounded-full">
           <Settings className="w-6 h-6" />
        </Button>
      </header>

      {/* Profile Header */}
      <Card className="p-8 flex flex-col md:flex-row items-center gap-6 text-center md:text-left overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -z-10" />
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30 text-white shrink-0">
          <span className="text-4xl font-display font-bold uppercase">{profile?.name?.charAt(0) || "U"}</span>
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">{profile?.name || "User"}</h2>
          <p className="text-slate-500 mb-4">{sessionUser?.email || "user@example.com"}</p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 text-xs font-bold uppercase tracking-wide">
               {profile?.level || "Beginner"}
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 text-xs font-bold uppercase tracking-wide">
               {profile?.goal || "General Fluency"}
            </span>
          </div>
        </div>
      </Card>

      {/* Gamification / Awards */}
      <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white pt-4">Your Trophies</h3>
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 flex flex-col items-center justify-center text-center border-amber-200 dark:border-amber-900/50 bg-gradient-to-b from-amber-50 to-white dark:from-amber-950/20 dark:to-slate-950 shadow-amber-500/5 cursor-pointer">
           <Award className="w-8 h-8 text-amber-500 mb-2" />
           <p className="font-bold text-slate-900 dark:text-white text-sm">Active Learner</p>
        </Card>
        <Card className="p-4 flex flex-col items-center justify-center text-center opacity-50 grayscale hover:grayscale-0 transition-all cursor-pointer">
           <Zap className="w-8 h-8 text-blue-500 mb-2" />
           <p className="font-bold text-slate-900 dark:text-white text-sm">Fast Talker</p>
        </Card>
        <Card className="p-4 flex flex-col items-center justify-center text-center opacity-50 grayscale hover:grayscale-0 transition-all cursor-pointer">
           <Globe className="w-8 h-8 text-emerald-500 mb-2" />
           <p className="font-bold text-slate-900 dark:text-white text-sm">Vocab Master</p>
        </Card>
      </div>

      {/* Settings List */}
      <Card className="overflow-hidden">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Target className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </div>
              <span className="font-medium text-slate-900 dark:text-white">Change Goal</span>
            </div>
          </div>
          <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Globe className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <span className="font-medium text-slate-900 dark:text-white block">Native Language</span>
                <span className="text-sm text-slate-500">{profile?.native_language || "English"}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Button variant="ghost" className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 font-bold h-12" onClick={handleLogout}>
        <LogOut className="w-5 h-5 mr-3" /> Log Out
      </Button>
    </div>
  );
}
