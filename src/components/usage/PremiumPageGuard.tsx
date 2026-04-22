"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { isPremium } from "@/lib/services/subscriptionService";
import { Crown, Lock, ShieldAlert, Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { Loader2 } from "lucide-react";

interface PremiumPageGuardProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function PremiumPageGuard({ 
  children, 
  title = "Premium Content", 
  description = "This specialized module is part of our Premium Pro plan."
}: PremiumPageGuardProps) {
  const [loading, setLoading] = useState(true);
  const [premium, setPremium] = useState(false);

  useEffect(() => {
    async function checkAccess() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setLoading(false);
          return;
        }
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        setPremium(isPremium(profile));
      } catch (err) {
        console.error("Guard Check Failed:", err);
      } finally {
        setLoading(false);
      }
    }
    checkAccess();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
        <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Verifying Access...</p>
      </div>
    );
  }

  if (premium) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-[2rem] bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center mx-auto shadow-2xl skew-y-3">
             <Lock className="w-10 h-10" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white shadow-lg animate-bounce">
             <Crown className="w-4 h-4" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-display font-black text-slate-900 dark:text-white">
            Access <span className="text-primary-600 italic">Restricted</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            {description} Join our Premium members today and unlock the full experience.
          </p>
        </div>

        <div className="pt-4 flex flex-col gap-4">
          <Button 
            onClick={() => window.dispatchEvent(new CustomEvent('open-subscription-modal'))}
            className="w-full h-14 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-black text-lg shadow-xl shadow-primary-500/30"
          >
            Go Premium Now
            <Sparkles className="w-5 h-5 ml-2" />
          </Button>
          
          <Link href="/learn" className="inline-flex items-center justify-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">
             <ArrowLeft className="w-4 h-4" /> Back to Learning
          </Link>
        </div>

        <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-center gap-4 text-xs font-black text-slate-400 uppercase tracking-widest">
             <div className="flex items-center gap-1.5 whitespace-nowrap">
                <ShieldAlert className="w-3.5 h-3.5" /> Secure Checkout
             </div>
             <div className="w-1 h-1 bg-slate-300 rounded-full" />
             <div className="flex items-center gap-1.5 whitespace-nowrap">
                <Sparkles className="w-3.5 h-3.5" /> 7-Day Trial
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
