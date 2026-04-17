"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronRight, Briefcase, Building2, Target, Sparkles, History as HistoryIcon, TrendingUp } from "lucide-react";
import Link from "next/link";

const ROLES = [
  "Frontend Developer", "Backend Developer", "Full Stack Developer", 
  "Java Developer", "Python Developer", "Software Engineer", 
  "Data Analyst", "BTech CSE Campus Placement"
];

const COMPANIES = [
  "TCS", "Infosys", "Wipro", "Accenture", "Cognizant", 
  "Capgemini", "Deloitte", "Amazon", "Google", "Microsoft", "Startups"
];

export default function InterviewLanding() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [role, setRole] = useState(ROLES[0]);
  const [company, setCompany] = useState(COMPANIES[0]);
  const [difficulty, setDifficulty] = useState("Medium");
  const [roundType, setRoundType] = useState("Technical");

  const startInterview = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, company, difficulty, roundType })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to start interview");
      }

      if (data.sessionId) {
        router.push(`/practice/interview/${data.sessionId}`);
      }
    } catch (err: any) {
      console.error("Interview start failed", err);
      // Show proper user-facing message instead of infinite loading
      alert(err.message || "An unexpected error occurred. Please try logging in again.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-10 pb-24">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> AI Powered Prep
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            AI Mock <span className="text-indigo-600">Interview</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
            Practice realistic interviews tailored for CSE students. Get deep feedback on your technical accuracy and communication.
          </p>
        </div>
        <Link href="/practice/interview/history">
          <Button variant="outline" className="rounded-xl gap-2 h-12">
            <HistoryIcon className="w-5 h-5" /> View History
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Setup Form */}
        <Card className="lg:col-span-2 p-6 md:p-8 space-y-8 rounded-3xl border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Role Selection */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-wide">
                <Briefcase className="w-4 h-4" /> Target Role
              </label>
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
                className="w-full h-14 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-4 font-bold text-slate-800 dark:text-white focus:border-indigo-500 outline-none transition-all"
              >
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            {/* Company Selection */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-wide">
                <Building2 className="w-4 h-4" /> Target Company
              </label>
              <select 
                value={company} 
                onChange={(e) => setCompany(e.target.value)}
                className="w-full h-14 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-4 font-bold text-slate-800 dark:text-white focus:border-indigo-500 outline-none transition-all"
              >
                {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Difficulty */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-wide">
                <Target className="w-4 h-4" /> Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['Easy', 'Medium', 'Hard'].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`h-12 rounded-xl font-bold transition-all ${
                      difficulty === d 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Round Type */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-wide">
                <Sparkles className="w-4 h-4" /> Round Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                {['Technical', 'HR', 'Mixed'].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRoundType(r)}
                    className={`h-12 rounded-xl font-bold transition-all ${
                      roundType === r 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button 
            onClick={startInterview}
            disabled={loading}
            className="w-full h-16 rounded-2xl text-lg font-bold bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-600/30 gap-3"
          >
            {loading ? "Initializing..." : "Start Mock Interview"}
            <ChevronRight className="w-6 h-6" />
          </Button>
        </Card>

        {/* Info/Trends Pane */}
        <div className="space-y-6">
          <Card className="p-6 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white rounded-3xl border-none shadow-xl">
             <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-6 h-6" />
                <h3 className="text-xl font-bold">Today's Trends</h3>
             </div>
             <div className="space-y-4">
                <div className="bg-white/10 p-3 rounded-xl">
                   <p className="text-xs uppercase font-bold opacity-70">Most Prepared Role</p>
                   <p className="font-bold">Full Stack Developer</p>
                </div>
                <div className="bg-white/10 p-3 rounded-xl">
                   <p className="text-xs uppercase font-bold opacity-70">Hot Topic</p>
                   <p className="font-bold">Microservices & System Design</p>
                </div>
                <div className="bg-white/10 p-3 rounded-xl">
                   <p className="text-xs uppercase font-bold opacity-70">Top Hiring</p>
                   <p className="font-bold">TCS, Amazon, Accenture</p>
                </div>
             </div>
          </Card>

          <Card className="p-6 rounded-3xl border-slate-200 dark:border-slate-800 border-dashed">
             <h3 className="font-bold text-slate-900 dark:text-white mb-2">Pro Tips</h3>
             <ul className="text-sm text-slate-500 space-y-3">
                <li className="flex gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                   Speak slowly and clearly for better AI analysis.
                </li>
                <li className="flex gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                   Try the "Mixed" round for a full interview experience.
                </li>
                <li className="flex gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                   Review your technical scores to identify weak topics.
                </li>
             </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
