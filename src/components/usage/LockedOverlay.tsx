"use client";

import { Lock, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface LockedOverlayProps {
  title?: string;
  className?: string;
}

export function LockedOverlay({ title = "Premium Feature", className = "" }: LockedOverlayProps) {
  const router = useRouter();

  const handleUpgrade = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push('/billing');
  };

  return (
    <div 
      onClick={handleUpgrade}
      className={`absolute inset-0 z-20 flex flex-col items-center justify-center p-10 text-center backdrop-blur-[8px] bg-white/50 dark:bg-slate-900/50 rounded-2xl border border-white/20 shadow-2xl transition-all duration-500 cursor-pointer group hover:bg-white/60 dark:hover:bg-slate-900/60 ${className}`}
    >
      {/* Lock Badge */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mb-8"
      >
        <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-slate-800 dark:bg-white text-white dark:text-slate-900 shadow-2xl shadow-slate-950/20 dark:shadow-white/10 transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3">
          <Lock className="w-6 h-6" />
        </div>
      </motion.div>
      
      {/* Text block with spacious rhythm */}
      <div className="space-y-3 mb-8 max-w-[260px]">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Upgrade to unlock this feature and master your skills</p>
      </div>
      
      {/* Centered CTA */}
      <button 
        onClick={handleUpgrade}
        className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-bold hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-300 transform group-hover:scale-105 flex items-center gap-2.5"
      >
        Upgrade Now
        <Sparkles className="w-4 h-4" />
      </button>
    </div>
  );
}


