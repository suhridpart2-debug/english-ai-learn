"use client";

import { useEffect, useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Crown, X, Sparkles, TrendingUp, Zap, Languages, MessageSquare } from "lucide-react";
import { SUBSCRIPTION_CONFIG } from "@/lib/config/subscription";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export function SubscriptionModal() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-subscription-modal', handleOpen);
    return () => window.removeEventListener('open-subscription-modal', handleOpen);
  }, []);

  const handleUpgrade = () => {
    setIsOpen(false);
    router.push('/billing');
  };

  const benefits = [
    { 
      icon: <Zap className="w-5 h-5 text-amber-500" />, 
      title: "Unlimited Vocabulary", 
      desc: "Save and learn without limits" 
    },
    { 
      icon: <MessageSquare className="w-5 h-5 text-indigo-500" />, 
      title: "All AI Coaches", 
      desc: "Unlock experts for every scenario" 
    },
    { 
      icon: <Languages className="w-5 h-5 text-emerald-500" />, 
      title: "Premium Lessons", 
      desc: "Deep insights and advanced modules" 
    },
    { 
      icon: <TrendingUp className="w-5 h-5 text-rose-500" />, 
      title: "Progress Analytics", 
      desc: "Detailed history and weak word tracking" 
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none bg-slate-900 rounded-[2rem]">
        {/* Header Background */}
        <div className="relative h-48 bg-gradient-to-br from-primary-600 via-indigo-600 to-purple-700 flex flex-col items-center justify-center p-6 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -ml-16 -mb-16" />
          
          <motion.div 
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            className="w-20 h-20 rounded-3xl bg-white shadow-2xl flex items-center justify-center mb-4 relative z-10"
          >
            <Crown className="w-12 h-12 text-primary-600 fill-primary-600" />
          </motion.div>
          
          <DialogTitle className="text-2xl font-display font-bold text-white relative z-10">
            Upgrade to Premium
          </DialogTitle>
          <p className="text-white/80 text-sm font-medium relative z-10">You're missing out on 80% of our potential</p>
        </div>

        <div className="p-8 bg-slate-900 text-white">
          <div className="grid grid-cols-1 gap-4 mb-8">
            {benefits.map((b, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-4 p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  {b.icon}
                </div>
                <div>
                  <h4 className="font-bold text-sm">{b.title}</h4>
                  <p className="text-xs text-white/50">{b.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-primary-600/10 border border-primary-500/20 text-center">
              <span className="text-xs font-bold text-primary-400 uppercase tracking-widest block mb-1">Limited Time Trial</span>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-3xl font-display font-bold text-white">₹1</span>
                <span className="text-white/60 text-sm">for 7 days</span>
              </div>
              <p className="text-xs text-white/40 mt-1 italic">Then ₹99/month. Cancel anytime.</p>
            </div>

            <Button 
              onClick={handleUpgrade}
              className="w-full h-14 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-lg shadow-xl shadow-primary-500/10 group transition-all"
            >
              Start Trial Now
              <Sparkles className="w-5 h-5 ml-2 text-primary-600 animate-pulse" />
            </Button>
            
            <button 
              onClick={() => setIsOpen(false)}
              className="w-full py-2 text-xs font-medium text-white/40 hover:text-white/60 transition-colors"
            >
              Maybe later, I'll stick to limited free access
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
