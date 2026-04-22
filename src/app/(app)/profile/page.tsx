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
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function loadProfile() {
    setIsLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    
    setSessionUser(session.user);
    
    const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
    if (data) {
      setProfile(data);
      setNewName(data.name || "");
    }
    setIsLoading(false);
  }

  useEffect(() => {
    loadProfile();
  }, []);

  const handleUpdateProfile = async () => {
    if (!profile?.id || !newName.trim()) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ name: newName.trim() })
        .eq('id', profile.id);

      if (error) throw error;
      
      setProfile({ ...profile, name: newName.trim() });
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update name. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

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
        <Button 
          variant={isEditing ? "default" : "ghost"} 
          size="icon" 
          className="rounded-full"
          onClick={() => setIsEditing(!isEditing)}
        >
           <Settings className="w-6 h-6" />
        </Button>
      </header>

      {/* Profile Header */}
      <Card className="p-8 flex flex-col md:flex-row items-center gap-8 text-center md:text-left overflow-hidden relative shadow-xl border-none bg-white dark:bg-slate-900">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -z-10" />
        <div className="w-28 h-28 rounded-[2rem] bg-gradient-to-tr from-primary-500 to-primary-600 flex items-center justify-center shadow-2xl shadow-primary-500/30 text-white shrink-0 group hover:rotate-3 transition-transform">
          <span className="text-5xl font-display font-black uppercase">
            {profile?.name?.charAt(0) || "U"}
          </span>
        </div>
        
        <div className="flex-1 space-y-4">
          {isEditing ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-left-2">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Display Name</label>
                <input 
                  type="text" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                  placeholder="Enter your name"
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  className="rounded-lg font-bold" 
                  onClick={handleUpdateProfile}
                  disabled={isSaving}
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                  Save Changes
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="rounded-lg font-bold"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div>
                <h2 className="text-3xl font-display font-black text-slate-900 dark:text-white mb-1">
                  {profile?.name || "User"}
                </h2>
                <p className="text-slate-500 font-medium">{sessionUser?.email || "user@example.com"}</p>
              </div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 text-[10px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-900/30">
                   {profile?.level || "Beginner"}
                </span>
                <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 text-[10px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-900/30">
                   {profile?.goal || "General Fluency"}
                   <Zap className="w-3 h-3 ml-2 fill-emerald-500 text-emerald-500" />
                </span>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Gamification / Awards */}
      <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] pt-4">Your Milestones</h3>
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-6 flex flex-col items-center justify-center text-center border-amber-200 dark:border-amber-900/50 bg-gradient-to-b from-amber-50 to-white dark:from-amber-950/20 dark:to-slate-950 shadow-xl shadow-amber-500/5 cursor-pointer hover:scale-105 transition-transform group">
           <Award className="w-10 h-10 text-amber-500 mb-3 group-hover:animate-bounce" />
           <p className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-tight">Active Learner</p>
        </Card>
        <Card className="p-6 flex flex-col items-center justify-center text-center opacity-50 grayscale hover:grayscale-0 transition-all cursor-pointer hover:scale-105 group border-slate-100 dark:border-slate-800">
           <Zap className="w-10 h-10 text-blue-500 mb-3 group-hover:scale-110 transition-transform" />
           <p className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-tight">Fast Talker</p>
        </Card>
        <Card className="p-6 flex flex-col items-center justify-center text-center opacity-50 grayscale hover:grayscale-0 transition-all cursor-pointer hover:scale-105 group border-slate-100 dark:border-slate-800">
           <Globe className="w-10 h-10 text-emerald-500 mb-3 group-hover:scale-110 transition-transform" />
           <p className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-tight">Vocab Master</p>
        </Card>
      </div>

      {/* Settings List */}
      <Card className="overflow-hidden border-none shadow-xl bg-white dark:bg-slate-900 rounded-[2rem]">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          <div className="p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer group transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-50 dark:border-slate-700 group-hover:scale-110 transition-transform">
                <Target className="w-6 h-6 text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <span className="font-black text-slate-900 dark:text-white uppercase tracking-tight block">Update Goal</span>
                <span className="text-xs text-slate-500 font-medium">Currently: {profile?.goal || "Default"}</span>
              </div>
            </div>
          </div>
          <div className="p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer group transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-50 dark:border-slate-700 group-hover:scale-110 transition-transform">
                <Globe className="w-6 h-6 text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <span className="font-black text-slate-900 dark:text-white uppercase tracking-tight block">Native Language</span>
                <span className="text-xs text-slate-500 font-medium">{profile?.native_language || "English"}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Button 
        variant="ghost" 
        className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 font-black h-16 rounded-2xl border border-transparent hover:border-red-100 transition-all" 
        onClick={handleLogout}
      >
        <LogOut className="w-5 h-5 mr-3" /> Log Out From App
      </Button>
    </div>
  );
}
