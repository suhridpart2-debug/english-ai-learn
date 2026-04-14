"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Lock, Play } from "lucide-react";
import Link from "next/link";

export default function IELTSModePage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 animate-in fade-in pb-32 md:pb-6">
      <header>
        <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
          <GraduationCap className="w-8 h-8 text-primary-600" /> IELTS Mock Speaking
        </h1>
        <p className="text-slate-500">Practice full IELTS Speaking sections under timed conditions.</p>
      </header>

      <div className="grid gap-6">
        <Card className="p-6 border-primary-200 dark:border-primary-900 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
             <GraduationCap className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300 rounded-full text-sm font-bold mb-4">Part 1: Introduction</span>
            <h3 className="text-2xl font-bold font-display mb-2">Hometown & Family</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md">4-5 minutes of general questions about familiar topics. The examiner will introduce themselves and ask you to confirm your identity.</p>
            <Link href="/practice/ielts/mock">
              <Button size="lg" className="rounded-full bg-primary-600 hover:bg-primary-700 text-white">
                <Play className="w-4 h-4 mr-2" /> Start Mock Test
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="p-6 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-white/50 dark:bg-slate-950/50 backdrop-blur-[2px] z-20 flex items-center justify-center flex-col gap-3">
             <Lock className="w-8 h-8 text-slate-400" />
             <p className="font-bold text-slate-700 dark:text-slate-300">Complete Part 1 to Unlock</p>
          </div>
          <div className="relative z-10 opacity-50 blur-sm">
            <span className="inline-block px-3 py-1 bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-full text-sm font-bold mb-4">Part 2: Long Turn</span>
            <h3 className="text-2xl font-bold font-display mb-2">Cue Card Practice</h3>
            <p className="text-slate-600 mb-6">1 minute to prepare, 2 minutes to speak on a specific topic.</p>
            <Button size="lg" disabled>Locked</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
