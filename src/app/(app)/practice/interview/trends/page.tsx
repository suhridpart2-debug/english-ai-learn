"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, TrendingUp, Search, Building2, MapPin, Calendar, CheckCircle2, AlertCircle, Info } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const TOP_COMPANIES = [
  { name: "TCS", questions: 742, difficulty: "Easy-Medium", trend: "+12%" },
  { name: "Amazon", questions: 521, difficulty: "Hard", trend: "+5%" },
  { name: "Accenture", questions: 430, difficulty: "Medium", trend: "+18%" },
  { name: "Infosys", questions: 388, difficulty: "Easy", trend: "-2%" },
];

const RECENTLY_ASKED = [
  { 
    q: "Explain how a HashMap works internally in Java.", 
    company: "TCS", 
    role: "Java Developer",
    type: "Curated", 
    conf: "95%",
    description: "High occurrence in Ninja & Digital rounds."
  },
  { 
    q: "How would you handle a sudden spike in traffic for a web app?", 
    company: "Amazon", 
    role: "Backend Developer",
    type: "Trend-based", 
    conf: "82%",
    description: "Common theme in system design interviews recently."
  },
  { 
    q: "Tell me about a project where you failed. What was your learning?", 
    company: "Generic", 
    role: "HR Round",
    type: "Verified", 
    conf: "99%",
    description: "Standard behavioral question across almost all firms."
  }
];

export default function CompanyTrends() {
  const [search, setSearch] = useState("");

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-10 pb-24">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
           <Link href="/practice/interview" className="flex items-center gap-1 text-xs font-bold text-indigo-500 uppercase tracking-widest hover:gap-2 transition-all">
              <ChevronLeft className="w-4 h-4" /> Back to Setup
           </Link>
           <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Company <span className="text-indigo-600">Trends</span>
           </h1>
           <p className="text-slate-500 font-medium">Real questions reported by students and AI-inferred patterns.</p>
        </div>
        
        <div className="relative w-full md:w-80">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
           <input 
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             placeholder="Search company (e.g. Google)..." 
             className="w-full h-12 pl-12 pr-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
           />
        </div>
      </header>

      {/* Accuracy Warning */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 flex gap-4 items-start">
         <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
         <div className="space-y-1">
            <p className="text-sm font-bold text-amber-900 dark:text-amber-200 leading-none">Transparency Note</p>
            <p className="text-xs text-amber-800 dark:text-amber-300 opacity-80 leading-relaxed font-medium">
               Questions marked as <span className="font-bold">Verified</span> are reported by actual students. 
               <span className="font-bold ml-1">Trend-based</span> questions are predicted by our AI based on current company hiring focus.
            </p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         {/* Questions Feed */}
         <div className="lg:col-span-3 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
               <TrendingUp className="w-5 h-5 text-indigo-500" /> Most Reported Questions
            </h2>
            
            {RECENTLY_ASKED.map((item, i) => (
              <Card key={i} className="p-6 rounded-3xl border-slate-200 dark:border-slate-800 hover:shadow-xl transition-shadow bg-white dark:bg-slate-950">
                 <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1 space-y-4">
                       <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest ${
                             item.type === 'Verified' ? 'bg-green-100 text-green-700' : 'bg-indigo-100 text-indigo-700'
                          }`}>
                             {item.type}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                             <CheckCircle2 className="w-3 h-3" /> {item.conf} Conf.
                          </span>
                       </div>
                       <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight underline decoration-indigo-500/30 decoration-2 underline-offset-4">
                          {item.q}
                       </h3>
                       <p className="text-sm text-slate-500 font-medium">{item.description}</p>
                    </div>
                    
                    <div className="md:w-48 space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                           <Building2 className="w-5 h-5 text-indigo-500" />
                           <div className="leading-none">
                              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Company</p>
                              <p className="text-sm font-bold">{item.company}</p>
                           </div>
                        </div>
                        <Link href="/practice/interview">
                           <Button className="w-full h-10 rounded-xl bg-slate-900 dark:bg-white dark:text-black text-xs font-bold gap-2">
                              Practice Now
                           </Button>
                        </Link>
                    </div>
                 </div>
              </Card>
            ))}
         </div>

         {/* Sidebar Stats */}
         <div className="space-y-6">
            <h2 className="text-xl font-bold">Top Hiring Firms</h2>
            <div className="space-y-3">
               {TOP_COMPANIES.map((c) => (
                 <Card key={c.name} className="p-4 rounded-2xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center font-bold">
                          {c.name[0]}
                       </div>
                       <div>
                          <p className="text-sm font-bold">{c.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">{c.difficulty}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-xs font-black text-green-500">{c.trend}</p>
                       <p className="text-[9px] font-bold text-slate-400 uppercase">{c.questions} Qs</p>
                    </div>
                 </Card>
               ))}
            </div>

            <Card className="p-6 rounded-[2rem] bg-indigo-600 text-white border-none shadow-xl shadow-indigo-600/20">
               <Info className="w-6 h-6 mb-4" />
               <h3 className="font-bold mb-2">Want to contribute?</h3>
               <p className="text-xs opacity-80 leading-relaxed mb-4">Report questions you were asked in real interviews and help thousands of other students.</p>
               <Button className="w-full bg-white text-indigo-600 hover:bg-indigo-50 rounded-xl font-bold text-xs h-10">
                  Submit Question
               </Button>
            </Card>
         </div>
      </div>
    </div>
  );
}
