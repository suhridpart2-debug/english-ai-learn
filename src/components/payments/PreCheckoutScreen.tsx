"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, ShieldCheck, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { SUBSCRIPTION_CONFIG } from "@/lib/config/subscription";

export function PreCheckoutScreen({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/subscription/create', { method: 'POST' });
      const data = await res.json();

      if (data.error) throw new Error(data.error);

      const options = {
        key: data.key_id,
        subscription_id: data.id,
        name: "SpeakAI Pro",
        description: "Trial + Monthly Subscription",
        image: "/logo.png",
        handler: function (response: any) {
          // Signature verification handled by webhook
          window.location.href = `/billing?session_id=${data.id}&payment_id=${response.razorpay_payment_id}`;
        },
        prefill: {
          name: "",
          email: "",
          contact: ""
        },
        theme: {
          color: "#4f46e5"
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      alert(`Checkout failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
      <div className="bg-primary-600 p-8 text-white text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 blur-2xl" />
        <h3 className="text-2xl font-bold mb-1">Confirm Subscription</h3>
        <p className="text-primary-100 text-sm">Start your 7-day expert learning path</p>
      </div>

      <div className="p-8">
        <div className="space-y-6 mb-8">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <p className="font-bold text-slate-800 dark:text-white">Trial Period (7 Days)</p>
              <p className="text-xs text-slate-500">Full access to all Pro features</p>
            </div>
            <span className="font-black text-slate-900 dark:text-white">₹1</span>
          </div>

          <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <p className="font-bold text-slate-800 dark:text-white">Monthly Renewal</p>
              <p className="text-xs text-slate-500">Starting after 7 days</p>
            </div>
            <span className="font-bold text-slate-400">₹99/mo</span>
          </div>
        </div>

        <div className="space-y-3 mb-8">
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Auto-renewal enabled after trial
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Cancel anytime in Billing settings
          </div>
        </div>

        <div className="space-y-4">
          <Button 
            onClick={handleCheckout}
            disabled={loading}
            className="w-full h-14 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 group"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Confirm & Pay ₹1 <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>

          <button 
            onClick={onClose}
            className="w-full py-2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            Go Back
          </button>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-slate-400 uppercase tracking-widest font-black">
          <ShieldCheck className="w-3 h-3 text-emerald-500" /> Powered by Razorpay Secure
        </div>
      </div>
    </div>
  );
}
