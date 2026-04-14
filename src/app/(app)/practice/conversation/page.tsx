"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, GraduationCap, Briefcase, MessageSquare, ClipboardCheck, MicVocal } from "lucide-react";
import Link from "next/link";
import { PERSONAS, PersonaId, Persona } from "@/lib/data/personas";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { CONVERSATION_SCENARIOS, getRotatedScenarios } from "@/lib/data/conversationScenarios";

export default function PersonaSelectionPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'buddy' | 'scenario'>('buddy');
  const [duration, setDuration] = useState<number>(5);
  const [isStarting, setIsStarting] = useState(false);
  const [rotatedScenarios] = useState(() => getRotatedScenarios(6));

  const icons: Record<string, React.ReactNode> = {
    GraduationCap: <GraduationCap className="w-6 h-6" />,
    Briefcase: <Briefcase className="w-6 h-6" />,
    ClipboardCheck: <ClipboardCheck className="w-6 h-6" />,
    MicVocal: <MicVocal className="w-6 h-6" />
  };

  const handleStartBuddy = (personaId: string) => {
    setIsStarting(true);
    router.push(`/practice/conversation/${personaId}?duration=${duration}&mode=free`);
  };

  const handleStartScenario = (scenarioId: string) => {
    setIsStarting(true);
    // For guided mode, we use the 'buddy' room but with scenario overrides
    router.push(`/practice/conversation/buddy?duration=${duration}&mode=guided&scenario=${scenarioId}`);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-32 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link href="/practice">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ChevronLeft className="w-6 h-6" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">AI Conversation</h1>
            <p className="text-slate-500">Practice speaking in real-world situations.</p>
          </div>
        </div>

        {/* Duration Selection */}
        <div className="bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl flex items-center gap-1 self-start md:self-center">
            {[5, 10, 15].map((d) => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  duration === d 
                    ? 'bg-white dark:bg-slate-800 text-primary-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {d} min
              </button>
            ))}
        </div>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button 
            onClick={() => setActiveTab('buddy')}
            className={`px-6 py-3 font-bold text-sm tracking-wide transition-all relative ${
              activeTab === 'buddy' ? 'text-primary-600' : 'text-slate-400'
            }`}
          >
            AI Buddies
            {activeTab === 'buddy' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600" />}
          </button>
          <button 
            onClick={() => setActiveTab('scenario')}
            className={`px-6 py-3 font-bold text-sm tracking-wide transition-all relative ${
              activeTab === 'scenario' ? 'text-primary-600' : 'text-slate-400'
            }`}
          >
            Guided Scenarios
            {activeTab === 'scenario' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600" />}
          </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'buddy' ? (
          <motion.div 
            key="buddy"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {Object.values(PERSONAS).map((persona) => (
              <Card 
                key={persona.id} 
                className="group p-6 border-slate-200 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-800 
                           transition-all hover:shadow-xl cursor-pointer flex flex-col justify-between overflow-hidden relative"
                onClick={() => handleStartBuddy(persona.id)}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-150" />
                
                <div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${persona.color}`}>
                    {icons[persona.icon] || <MessageSquare className="w-6 h-6" />}
                  </div>
                  <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white mb-1">
                    {persona.name}
                  </h3>
                  <p className="text-xs font-bold text-primary-600 dark:text-primary-400 mb-3 uppercase tracking-widest">
                    {persona.role}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
                    {persona.description}
                  </p>
                </div>
                
                <Button className="w-full font-bold shadow-md group-hover:bg-primary-700" disabled={isStarting}>
                   Chat with {persona.name}
                </Button>
              </Card>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            key="scenario"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" /> 
                Fresh Daily Scenarios
              </h2>
              <p className="text-xs text-slate-400 font-medium">Refreshes every 6 hours</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
               {rotatedScenarios.map((scenario) => (
                 <Card 
                   key={scenario.id} 
                   className="p-5 border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-900 transition-all hover:shadow-lg cursor-pointer flex flex-col group"
                   onClick={() => handleStartScenario(scenario.id)}
                 >
                    <div className="flex items-center justify-between mb-4">
                       <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-md">
                          {scenario.category}
                       </span>
                       <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                         scenario.suggestedLevel === 'Beginner' ? 'bg-emerald-50 text-emerald-600' :
                         scenario.suggestedLevel === 'Intermediate' ? 'bg-amber-50 text-amber-600' :
                         'bg-rose-50 text-rose-600'
                       }`}>
                         {scenario.suggestedLevel}
                       </span>
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 transition-colors">
                       {scenario.title}
                    </h4>
                    <p className="text-xs text-slate-500 mb-6 flex-1">
                       {scenario.description}
                    </p>
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-tighter pt-4 border-t border-slate-50 dark:border-slate-900/50">
                       <div className="flex flex-col">
                          <span>AI: {scenario.aiRole}</span>
                       </div>
                       <Button size="sm" variant="ghost" className="h-7 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-2 rounded-lg">
                          Start <ArrowRight className="w-3 h-3 ml-1" />
                       </Button>
                    </div>
                 </Card>
               ))}
            </div>

            <div className="pt-8 border-t border-slate-100 dark:border-slate-900">
               <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">All Categories</h3>
               <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {["Daily Life", "Work & Office", "Travel", "Social", "Education"].map(cat => (
                    <button key={cat} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-sm font-bold text-slate-600 dark:text-slate-400 hover:border-primary-300 transition-all">
                       {cat}
                    </button>
                  ))}
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
