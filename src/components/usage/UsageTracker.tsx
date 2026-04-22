"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Zap, Crown, AlertTriangle } from "lucide-react";
import { UsageState, fetchUsage } from "@/lib/services/usageService";
import { supabase } from "@/lib/supabaseClient";
import { isPremium } from "@/lib/services/subscriptionService";
import { useRouter } from "next/navigation";

export function UsageTracker() {
  const [usage, setUsage] = useState<UsageState | null>(null);
  const [premium, setPremium] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      setPremium(isPremium(profile));
      
      const currentUsage = await fetchUsage();
      setUsage(currentUsage);
    }

    init();

    // Listen for usage updates from other components
    const handleUpdate = () => init();
    window.addEventListener('usage-updated', handleUpdate);
    return () => window.removeEventListener('usage-updated', handleUpdate);
  }, []);

  if (premium || !usage) return null;

  // Static limits for UI context
  const VOCAB_LIMIT = 3;
  const CHAT_LIMIT = 5;

  const vocabProgress = (usage.vocab_adds / VOCAB_LIMIT) * 100;
  const chatProgress = (usage.ai_messages / CHAT_LIMIT) * 100;

  const isVocabFull = usage.vocab_adds >= VOCAB_LIMIT;
  const isChatFull = usage.ai_messages >= CHAT_LIMIT;

  const handleUpgrade = () => {
    router.push('/billing');
  };

  return (
    <div className="fixed bottom-20 right-6 md:bottom-6 z-40 animate-in slide-in-from-right-10 duration-500">
      <div className="w-72 bg-slate-900 border border-white/10 rounded-3xl shadow-2xl p-5 backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-indigo-500" />
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500 animate-pulse" />
            <span className="text-xs font-black text-white uppercase tracking-widest">Free Plan Usage</span>
          </div>
          <button 
             onClick={handleUpgrade}
             className="text-[10px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors bg-amber-500/10 px-2 py-1 rounded-md"
          >
            Upgrade <Crown className="w-3 h-3 fill-current" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Vocab Progress */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10px] font-bold text-slate-400">Wordbook Saves</span>
              <span className={`text-[10px] font-bold ${isVocabFull ? 'text-rose-500' : 'text-slate-200'}`}>
                {usage.vocab_adds}/{VOCAB_LIMIT}
              </span>
            </div>
            <Progress value={vocabProgress} className="h-1.5 bg-slate-800" />
          </div>

          {/* AI Chat Progress */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10px] font-bold text-slate-400">AI Chat Messages</span>
              <span className={`text-[10px] font-bold ${isChatFull ? 'text-rose-500' : 'text-slate-200'}`}>
                {usage.ai_messages}/{CHAT_LIMIT}
              </span>
            </div>
            <Progress value={chatProgress} className="h-1.5 bg-slate-800" />
          </div>
        </div>

        {(isVocabFull || isChatFull) && (
          <div className="mt-4 flex flex-col gap-3">
            <div className="flex items-start gap-2 p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <AlertTriangle className="w-3 h-3 text-rose-500 mt-0.5 shrink-0" />
              <p className="text-[10px] font-medium text-rose-200/80 leading-tight">
                Daily limit reached. Upgrade to continue practicing without interruptions.
              </p>
            </div>
            <button 
              onClick={handleUpgrade}
              className="w-full py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[11px] font-medium hover:opacity-90 transition shadow-lg shadow-indigo-500/20"
            >
              Upgrade Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

