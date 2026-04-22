"use client";

import { useEffect, useState } from "react";
import { 
  CreditCard, 
  Calendar, 
  ShieldCheck, 
  History, 
  AlertCircle,
  Loader2,
  CheckCircle2,
  Lock,
  Star,
  Zap,
  Users,
  Timer,
  Crown,
  Sparkles,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  Award
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { isPremium, getExpiryLabel } from "@/lib/services/subscriptionService";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Script from "next/script";
import Link from "next/link";
import { cn } from "@/lib/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as any }
  }
};

export default function BillingPage() {
  const [profile, setProfile] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const premium = isPremium(profile);
  const expiryDate = getExpiryLabel(profile);

  useEffect(() => {
    async function loadBillingData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/login');
          return;
        }

        const [profileRes, paymentsRes] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", session.user.id).single(),
          supabase.from("payment_history").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false })
        ]);

        setProfile(profileRes.data);
        setPayments(paymentsRes.data || []);
      } catch (error) {
        console.error("Error loading billing data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadBillingData();
  }, [router]);

  useEffect(() => {
    if (isLoading || premium) return;

    const initWidget = () => {
      if ((window as any).RazorpaySyncAffordability) {
        (window as any).RazorpaySyncAffordability.init({
          keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: 9900,
          containerId: 'razorpay-affordability-widget',
        });
      }
    };

    setTimeout(initWidget, 1000); // Small delay to ensure script is ready
    
    return () => {
      const container = document.getElementById('razorpay-affordability-widget');
      if (container) container.innerHTML = '';
    };
  }, [isLoading, premium]);

  const handleStartTrial = async () => {
    if (!profile) {
      router.push('/login');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const res = await fetch('/api/subscription/create', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        const errorText = await res.text();
        let errorMessage = `Server error (${res.status})`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = res.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const options = {
        key: data.key_id,
        subscription_id: data.id,
        name: "SpeakAI Premium Pro",
        description: "7-Day Trial for ₹1 (then ₹99/mo)",
        image: "/logo.png",
        handler: function (response: any) {
          window.location.href = `/billing?success=true&payment_id=${response.razorpay_payment_id}&subscription_id=${response.razorpay_subscription_id}`;
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: profile.full_name || "",
          email: profile.email || "",
          contact: profile.phone || "",
        },
        config: {
          display: {
            sidebar: {
              title: "SpeakAI Premium Pro",
              show_summary: true,
              price_summary: true,
              description: "Trial fee: ₹1 • Renewal: ₹99/mo"
            },
            layout: 'sidebar'
          }
        },
        theme: {
          color: "#4f46e5"
        }
      };

      const Razorpay = (window as any).Razorpay;
      if (!Razorpay) {
        throw new Error("Razorpay SDK failed to load. Please refresh the page.");
      }

      const rzp = new Razorpay(options);
      rzp.open();

    } catch (err: any) {
      console.error("[Billing] Start trial error:", err);
      setError(err.message || "Failed to start trial. Please try again.");
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
            <div className="absolute inset-0 animate-ping h-12 w-12 rounded-full bg-primary-500/20" />
          </div>
          <p className="text-slate-500 font-medium animate-pulse">Syncing your billing records...</p>
        </motion.div>
      </div>
    );
  }

  const benefits = [
    { icon: <Zap className="w-5 h-5" />, text: "Unlimited AI Conversations", color: "text-amber-500", bg: "bg-amber-500/10" },
    { icon: <TrendingUp className="w-5 h-5" />, text: "Real-time IELTS/TOEFL Feedback", color: "text-blue-500", bg: "bg-blue-500/10" },
    { icon: <Award className="w-5 h-5" />, text: "Professional Pronunciation Audit", color: "text-purple-500", bg: "bg-purple-500/10" },
    { icon: <Users className="w-5 h-5" />, text: "Access All 20+ Regional Coaches", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  ];

  return (
    <div className="min-h-screen pb-32 bg-slate-50 dark:bg-slate-950 font-sans selection:bg-primary-500/30">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <Script src="https://cdn.razorpay.com/widgets/affordability/affordability.js" strategy="afterInteractive" />
      
      {/* Premium Hero - Matching Website font (Outfit) */}
      <section className="relative pt-20 pb-40 overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/20 via-slate-950 to-slate-950" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center max-w-3xl mx-auto"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-8">
              <Crown className="w-4 h-4 text-amber-400" /> Premium Membership
            </span>
            
            <h1 className="text-4xl md:text-7xl font-display font-bold text-white mb-6 leading-[1.1] tracking-tight">
              Invest in your <br/> <span className="text-indigo-400">English fluency.</span>
            </h1>
            
            <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed mb-12">
              Join thousands of professionals mastering English with SpeakAI. Personalized coaching, zero limits, unlimited growth.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content Area */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-6 -mt-20 relative z-20"
      >
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Status & Benefits Card */}
          <Card className="lg:col-span-8 overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-[3rem]">
            <div className="p-8 md:p-12">
               <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 pb-12 border-b border-slate-100 dark:border-slate-800">
                  <div className="space-y-4">
                    <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                       <CreditCard className="w-4 h-4" /> ACTIVE PLAN STATUS
                    </p>
                    <div className="flex items-center gap-4">
                       <h3 className="text-4xl md:text-5xl font-display font-bold text-slate-950 dark:text-white">
                          {premium ? "Premium Pro" : "Free Explorer"}
                       </h3>
                       <div className={cn(
                         "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg",
                         premium ? "bg-emerald-500 text-white shadow-emerald-500/30" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                       )}>
                          {premium ? 'Lifetime Access' : 'Limited Tier'}
                       </div>
                    </div>
                  </div>
                  
                  {premium && (
                    <div className="p-6 rounded-3xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-left md:text-right">
                       <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest mb-1 flex items-center md:justify-end gap-1.5">
                          <Timer className="w-3.5 h-3.5" /> Next Billing Cycle
                       </p>
                       <p className="text-slate-950 dark:text-white font-bold text-2xl tabular-nums">{expiryDate}</p>
                    </div>
                  )}
               </motion.div>

               {!premium ? (
                 <div className="grid md:grid-cols-2 gap-12 items-start">
                    <motion.div variants={itemVariants} className="space-y-10">
                       <div className="space-y-3">
                          <h4 className="text-2xl font-display font-bold text-slate-950 dark:text-white">Unlock Everything</h4>
                          <p className="text-base text-slate-500 font-medium">Break the 10-minute daily limit and access pro features.</p>
                       </div>
                       <div className="grid gap-6">
                          {benefits.map((b, i) => (
                            <div key={i} className="flex gap-5 group cursor-default">
                               <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110", b.bg, b.color)}>
                                  {b.icon}
                                </div>
                               <div className="flex flex-col justify-center">
                                  <p className="text-sm font-bold text-slate-900 dark:text-white leading-snug">{b.text}</p>
                                </div>
                            </div>
                          ))}
                       </div>
                    </motion.div>

                    {/* Premium Ticket Style Pass */}
                    <motion.div 
                      variants={itemVariants}
                      whileHover={{ y: -5 }}
                      className="bg-slate-950 text-white p-10 rounded-[3rem] relative group border border-white/10 shadow-3xl overflow-hidden"
                    >
                       <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-[80px] -mr-16 -mt-16" />
                       <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-[80px]" />
                       
                       <div className="relative z-10 flex flex-col items-center text-center">
                          <div className="mb-8">
                             <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.4em] mb-4">Limited Mission Offer</p>
                             <div className="flex items-center justify-center gap-4">
                                <span className="text-6xl md:text-7xl font-display font-bold text-white tracking-tighter">₹1</span>
                                <div className="flex flex-col items-start gap-1">
                                   <span className="text-slate-500 text-lg font-medium line-through decoration-indigo-500/50">₹299</span>
                                   <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">99% OFF</span>
                                </div>
                             </div>
                             <p className="text-sm text-slate-400 mt-4 font-medium italic">7 days of unlimited practice</p>
                          </div>
                          
                          <div className="w-full space-y-4 mb-10">
                             {[
                               "Risk-free trial. Pay ₹1 only.",
                               "No hidden recurring charges.",
                               "Cancel easily from Dashboard."
                             ].map((text, i) => (
                               <div key={i} className="flex items-center gap-4 text-slate-300">
                                  <div className="h-2 w-2 rounded-full bg-indigo-500" />
                                  <span className="text-sm font-medium">{text}</span>
                               </div>
                             ))}
                          </div>

                          {error && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="mb-8 w-full p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-medium flex items-start gap-3"
                            >
                              <AlertCircle className="w-4 h-4 shrink-0" />
                              {error}
                            </motion.div>
                          )}

                          <Button 
                            onClick={handleStartTrial}
                            disabled={isProcessing}
                            className="w-full h-16 rounded-[1.25rem] bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xl shadow-[0_20px_40px_-10px_rgba(79,70,229,0.3)] transition-all hover:scale-[1.03] active:scale-[0.97] group flex items-center justify-center gap-4"
                          >
                             {isProcessing ? (
                               <Loader2 className="w-6 h-6 animate-spin" />
                             ) : (
                               <>
                                 Start 7-Day Trial
                                 <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                               </>
                             )}
                          </Button>

                          <div className="mt-10 w-full pt-8 border-t border-white/5 space-y-4">
                               <div className="flex items-center justify-between">
                                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Available Offers</p>
                                  <div className="flex gap-2">
                                     <div className="w-8 h-5 bg-white/5 rounded" />
                                     <div className="w-8 h-5 bg-white/5 rounded" />
                                  </div>
                               </div>
                               <div id="razorpay-affordability-widget" className="min-h-[50px] opacity-80" />
                          </div>
                       </div>
                    </motion.div>
                 </div>
               ) : (
                 <motion.div variants={itemVariants} className="p-10 md:p-14 rounded-[3rem] bg-emerald-500/5 border border-emerald-500/20 flex flex-col md:flex-row items-center gap-10">
                    <div className="w-24 h-24 rounded-[2rem] bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-2xl shadow-emerald-500/20">
                       <Crown className="w-12 h-12" />
                    </div>
                    <div className="text-center md:text-left flex-1 space-y-4">
                       <h4 className="text-3xl font-display font-bold text-slate-950 dark:text-white">Professional Access Granted</h4>
                       <p className="text-lg text-slate-500 font-medium leading-relaxed">No more limits. Start your transformation today with all 20+ specialized AI coaches.</p>
                       <Button size="lg" className="rounded-2xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 h-14 font-bold px-12 text-lg shadow-xl shadow-slate-950/20" asChild>
                          <Link href="/learn">Start Learning Now</Link>
                       </Button>
                    </div>
                 </motion.div>
               )}
            </div>
          </Card>

          {/* Sidebar - Trust & Community */}
          <div className="lg:col-span-4 space-y-8">
             <motion.div variants={itemVariants}>
               <Card className="p-10 bg-indigo-600 text-white border-none shadow-[0_32px_64px_-16px_rgba(79,70,229,0.4)] rounded-[3rem] relative overflow-hidden group">
                  <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-[100px] group-hover:bg-white/20 transition-all duration-700" />
                  <div className="relative z-10 space-y-10">
                     <div className="space-y-4">
                        <Sparkles className="w-10 h-10 text-amber-300" />
                        <h3 className="text-2xl font-display font-bold leading-tight">Student Community</h3>
                        <p className="text-sm font-medium text-indigo-100/80 leading-relaxed">Join 50,000+ members who have improved their spoken English scores.</p>
                     </div>
                     
                     <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 rounded-3xl bg-white/10 backdrop-blur-md border border-white/10">
                           <TrendingUp className="w-6 h-6 text-amber-400 mb-3" />
                           <div className="text-3xl font-bold font-display tracking-tight">98%</div>
                           <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-100/60 mt-1">Satisfaction</p>
                        </div>
                        <div className="p-5 rounded-3xl bg-white/10 backdrop-blur-md border border-white/10">
                           <Users className="w-6 h-6 text-sky-300 mb-3" />
                           <div className="text-3xl font-bold font-display tracking-tight">50k+</div>
                           <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-100/60 mt-1">Users</p>
                        </div>
                     </div>
                  </div>
               </Card>
             </motion.div>

             <motion.div variants={itemVariants}>
               <Card className="p-8 rounded-[2.5rem] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between group cursor-pointer hover:border-emerald-500/20 transition-all">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-2xl bg-emerald-500/5 flex items-center justify-center shrink-0 border border-emerald-500/10">
                        <ShieldCheck className="w-6 h-6 text-emerald-500" />
                     </div>
                     <div className="space-y-1">
                        <h3 className="font-bold text-slate-950 dark:text-white text-sm">Secured by Razorpay</h3>
                        <p className="text-[11px] text-slate-500 font-medium">SSL Encrypted Transactions</p>
                     </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
               </Card>
             </motion.div>
          </div>
        </div>

        {/* Improved FAQ */}
        <motion.section variants={itemVariants} className="mt-40 mb-20 max-w-5xl mx-auto px-6">
           <div className="text-center mb-20 space-y-4">
              <h2 className="text-4xl md:text-6xl font-display font-bold text-slate-950 dark:text-white">Common Questions</h2>
              <p className="text-slate-500 text-lg font-medium">Everything you need to know about the Premium experience.</p>
           </div>
           
           <div className="grid md:grid-cols-2 gap-x-16 gap-y-12">
              {[
                { q: "Is it really ₹1 for the trial?", a: "Yes, we charge ₹1 to authorize your payment method. This entitles you to 7 days of full premium access." },
                { q: "When will I be charged ₹99?", a: "Your regular subscription only starts after 7 days if you choose to continue. You can cancel any time before day 7." },
                { q: "Can I use multiple devices?", a: "Yes, your premium account is synced across all browsers and devices where you log in." },
                { q: "How do refunds work?", a: "If you're unsatisifed, contact support for a no-questions-asked refund within 24 hours of any charge." }
              ].map((faq, i) => (
                <div key={i} className="space-y-4 group">
                   <h4 className="text-lg font-bold text-slate-950 dark:text-white flex gap-4 transition-colors group-hover:text-indigo-600">
                      <span className="text-indigo-600/30 font-display">0{i+1}</span> {faq.q}
                   </h4>
                   <p className="text-[15px] text-slate-500 leading-relaxed pl-11 font-medium italic border-l-2 border-slate-100 dark:border-slate-800 ml-3">
                      {faq.a}
                   </p>
                </div>
              ))}
           </div>
        </motion.section>

        {/* History Log - Modernized */}
        <motion.section variants={itemVariants} className="mt-32">
            <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-200 dark:border-slate-800">
               <h2 className="text-3xl font-display font-bold flex items-center gap-4 text-slate-950 dark:text-white">
                  <History className="w-10 h-10 text-indigo-600/30" /> Transaction History
               </h2>
               <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                 {payments.length} Payments Recorded
               </div>
            </div>
            
            <Card className="overflow-hidden rounded-[3rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl relative">
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead>
                     <tr className="bg-slate-50/50 dark:bg-slate-950/20">
                       <th className="px-10 py-8 font-bold uppercase text-[10px] tracking-widest text-slate-400">Transaction Date</th>
                       <th className="px-10 py-8 font-bold uppercase text-[10px] tracking-widest text-slate-400">Payment Description</th>
                       <th className="px-10 py-8 font-bold uppercase text-[10px] tracking-widest text-slate-400 text-right">Amount</th>
                       <th className="px-10 py-8 font-bold uppercase text-[10px] tracking-widest text-slate-400 text-center">Receipt</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                     {payments.length > 0 ? payments.map((p) => (
                       <tr key={p.id} className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/10 transition-all">
                         <td className="px-10 py-8">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                  <Calendar className="w-4 h-4 text-slate-500" />
                               </div>
                               <span className="text-sm text-slate-600 dark:text-slate-400 font-bold tabular-nums">
                                  {new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                               </span>
                            </div>
                         </td>
                         <td className="px-10 py-8">
                            <span className="text-sm font-bold text-slate-950 dark:text-white">SpeakAI Premium Subscription</span>
                         </td>
                         <td className="px-10 py-8 text-right">
                            <span className="text-xl font-display font-bold text-slate-950 dark:text-white tabular-nums">₹{p.amount / 100}</span>
                         </td>
                         <td className="px-10 py-8 text-center text-emerald-500">
                            <CheckCircle2 className="w-5 h-5 mx-auto" />
                         </td>
                       </tr>
                     )) : (
                        <tr>
                          <td colSpan={4} className="px-10 py-24 text-center">
                            <div className="flex flex-col items-center gap-4">
                               <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                                  <History className="w-8 h-8 text-slate-200" />
                               </div>
                               <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">No transactions recorded yet</p>
                            </div>
                          </td>
                        </tr>
                     )}
                   </tbody>
                 </table>
               </div>
            </Card>
        </motion.section>
      </motion.div>
    </div>
  );
}
