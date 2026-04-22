"use client";

import { Lock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface LockedCardProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export function LockedCard({ 
  children, 
  title = "Premium Content", 
  description = "Upgrade to unlock this feature",
  className 
}: LockedCardProps) {
  const router = useRouter();

  const handleUpgrade = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push('/billing');
  };

  return (
    <div 
      className={cn(
        "relative group rounded-[2.5rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col h-full transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/10", 
        className
      )}
      onClick={handleUpgrade}
    >
      {/* Blurred Content Container */}
      <div className="flex-1 blur-[10px] pointer-events-none select-none opacity-[0.08] transition-all duration-700 group-hover:blur-[12px] relative overflow-hidden rounded-[2.5rem]">
        {children}
      </div>

      {/* Premium Lock Overlay - Systematic & Balanced Composition */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center bg-white/40 dark:bg-slate-900/40 backdrop-blur-[6px] cursor-pointer group-hover:bg-white/50 dark:group-hover:bg-slate-900/50 transition-all duration-500 rounded-[2.5rem]">
        
        <div className="flex flex-col items-center gap-6 max-w-[280px]">
          {/* Lock Badge */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl shadow-slate-950/20 dark:shadow-white/10 transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3">
              <Lock className="w-5 h-5" />
            </div>
          </motion.div>
          
          {/* Text content */}
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {title}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed px-4">
              {description}
            </p>
          </div>

          {/* Action Button */}
          <button 
            onClick={handleUpgrade}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:shadow-2xl hover:shadow-indigo-500/40 transition-all duration-300 transform group-hover:scale-[1.02] flex items-center justify-center gap-2 active:scale-95"
          >
            Upgrade Now
            <Sparkles className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
