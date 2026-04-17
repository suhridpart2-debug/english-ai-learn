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
  Lock
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { isPremium, getExpiryLabel } from "@/lib/services/subscriptionService";
import { UpgradeButton } from "@/components/payments/UpgradeButton";
import { SUBSCRIPTION_CONFIG } from "@/lib/config/subscription";

export default function BillingPage() {
  const [profile, setProfile] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadBillingData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

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
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const premium = isPremium(profile);
  const expiryDate = getExpiryLabel(profile);

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6 text-slate-900 animate-in fade-in slide-in-from-bottom-4 duration-500 dark:text-white">
      <header>
        <h1 className="font-display text-3xl font-bold">Billing & Subscription</h1>
        <p className="text-slate-600 dark:text-slate-400">Manage your plan and view payment history.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Current Plan Card */}
        <Card className={`relative overflow-hidden p-6 border-2 ${premium ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20' : 'border-slate-200'}`}>
          {premium && (
            <div className="absolute right-0 top-0 bg-indigo-500 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
              PRO
            </div>
          )}
          
          <div className="mb-6 flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Current Plan</p>
              <h2 className="text-2xl font-bold">{premium ? "Premium Access" : "Free Plan"}</h2>
            </div>
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${premium ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
              {premium ? <ShieldCheck className="h-6 w-6" /> : <Lock className="h-6 w-6" />}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm dark:bg-slate-800">
                <Calendar className="h-4 w-4 text-indigo-500" />
              </div>
              <div>
                <p className="font-medium">Status</p>
                <p className="text-slate-500 dark:text-slate-400">
                  {premium ? "Expires on " + expiryDate : "Limited Access"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm dark:bg-slate-800">
                <CreditCard className="h-4 w-4 text-indigo-500" />
              </div>
              <div>
                <p className="font-medium">Pricing</p>
                <p className="text-slate-500 dark:text-slate-400">
                  ₹{SUBSCRIPTION_CONFIG.AMOUNT / 100} / {SUBSCRIPTION_CONFIG.DURATION_DAYS} Days
                </p>
              </div>
            </div>
          </div>

          {!premium && SUBSCRIPTION_CONFIG.IS_LIVE_VALIDATION && (
            <div className="mt-6 rounded-lg bg-amber-50 p-3 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/30">
              <div className="flex gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[10px] leading-tight text-amber-800 dark:text-amber-400">
                  <span className="font-bold">Live Validation Mode:</span> This is a temporary ₹1 payment to verify the gateway. Premium will activate for 30 days.
                </p>
              </div>
            </div>
          )}

          <div className="mt-8">
            {!premium ? (
              <UpgradeButton className="w-full" size="lg" onSuccess={() => window.location.reload()} />
            ) : (
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                Subscription Active
              </div>
            )}
          </div>
        </Card>

        {/* Plan Features Card */}
        <Card className="p-6">
          <h3 className="mb-4 font-bold">Premium Benefits</h3>
          <ul className="space-y-3">
            {[
              "Unlimited AI Roleplay",
              "Advanced Grammar Analysis",
              "Mock Interview Simulations",
              "Priority AI Response",
              "Detailed Performance History"
            ].map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                <span className="text-slate-700 dark:text-slate-300">{feature}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Payment History Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-indigo-500" />
          <h2 className="text-xl font-bold">Payment History</h2>
        </div>

        <Card className="overflow-hidden">
          {payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <AlertCircle className="mb-2 h-8 w-8 opacity-20" />
              <p>No transactions found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900">
                  <tr>
                    <th className="px-6 py-4 font-bold">Date</th>
                    <th className="px-6 py-4 font-bold">Description</th>
                    <th className="px-6 py-4 font-bold">Amount</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td className="px-6 py-4">{new Date(p.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4">30 Days Premium</td>
                      <td className="px-6 py-4">₹{p.amount / 100}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400">
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}
