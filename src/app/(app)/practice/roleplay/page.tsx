"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Briefcase, Utensils, Plane, Users, GraduationCap, Headphones, ArrowRight, Star } from "lucide-react";
import Link from "next/link";
import { ROLEPLAY_SCENARIOS, RoleplayScenario } from "@/lib/data/roleplayData";

export default function RoleplaySelectionPage() {
  
  const iconMap: Record<string, any> = {
    Briefcase,
    Utensils,
    Plane,
    Users,
    GraduationCap,
    Headphones
  };

  const categories = ["Professional", "Daily Life", "Travel"];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 pb-32 md:pb-6 animate-in fade-in duration-500">
      <header className="flex items-center gap-4">
        <Link href="/practice">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ChevronLeft className="w-6 h-6" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Real-life Roleplay</h1>
          <p className="text-slate-500">Practice speaking in common real-world scenarios.</p>
        </div>
      </header>

      {categories.map((category) => {
        const scenarios = ROLEPLAY_SCENARIOS.filter(s => s.category === category);
        if (scenarios.length === 0) return null;

        return (
          <div key={category} className="space-y-4">
            <h2 className="text-xl font-bold font-display flex items-center gap-2">
              <span className="w-1.5 h-6 bg-primary-600 rounded-full" />
              {category}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {scenarios.map((scenario) => {
                const Icon = iconMap[scenario.icon] || Users;
                return (
                  <Link key={scenario.id} href={`/practice/roleplay/${scenario.id}`}>
                    <Card className="p-6 h-full border-slate-200 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-800 transition-all hover:shadow-lg group flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-400 group-hover:bg-primary-100 group-hover:text-primary-600 transition-colors">
                            <Icon className="w-6 h-6" />
                          </div>
                          <div className="flex flex-col items-end">
                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full mb-1 ${
                              scenario.difficulty === 'Beginner' ? 'bg-emerald-100 text-emerald-700' :
                              scenario.difficulty === 'Intermediate' ? 'bg-blue-100 text-blue-700' :
                              'bg-purple-100 text-purple-700'
                            }`}>
                              {scenario.difficulty}
                            </span>
                            <div className="flex gap-0.5">
                               {[...Array(3)].map((_, i) => (
                                 <Star key={i} className={`w-3 h-3 ${i < (scenario.difficulty === 'Beginner' ? 1 : scenario.difficulty === 'Intermediate' ? 2 : 3) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                               ))}
                            </div>
                          </div>
                        </div>
                        <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white mb-2">{scenario.title}</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
                          {scenario.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 group-hover:border-primary-100 dark:group-hover:border-primary-900 transition-colors">
                         <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Start Session</span>
                         <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
