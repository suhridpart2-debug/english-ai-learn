"use client";

import React, { ReactNode } from "react";
import { Lock, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { isPremium } from "@/lib/services/subscriptionService";
import { SUBSCRIPTION_CONFIG } from "@/lib/config/subscription";

interface PremiumShieldProps {
  children: ReactNode;
  profile: any;
  fallback?: ReactNode;
  title?: string;
  description?: string;
}

/**
 * PremiumShield component to gate premium features.
 */
export function PremiumShield({
  children,
  profile,
  fallback,
  title = "Premium Feature",
  description = "Join 10,000+ learners and boost your English fluency with our expert tools.",
}: PremiumShieldProps) {
  const hasAccess = isPremium(profile);

  if (hasAccess) {
    return <>{children}</>;
  }

  // If a custom fallback is provided, use it
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default "Locked" UI
  return (
    <Card className="relative overflow-hidden border-2 border-primary-100 bg-primary-50/10 p-8 dark:border-primary-900/10 dark:bg-primary-950/20">
      <div className="absolute right-0 top-0 p-4">
        <Lock className="h-6 w-6 text-primary-300 dark:text-primary-800" />
      </div>

      <div className="flex flex-col items-center text-center text-slate-900 dark:text-white">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400">
          <Sparkles className="h-8 w-8" />
        </div>

        <h3 className="mb-2 font-display text-xl font-bold">
          {title}
        </h3>
        
        <p className="mb-6 max-w-sm text-slate-600 dark:text-slate-400 text-sm">
          {description}
        </p>

        <div className="flex flex-col items-center gap-3">
          <Button 
            onClick={() => window.dispatchEvent(new CustomEvent('open-subscription-modal'))}
            className="rounded-full bg-primary-600 hover:bg-primary-700 text-white font-bold h-12 px-8 shadow-xl shadow-primary-500/30"
          >
            Start Free Trial
          </Button>
          <p className="text-xs font-semibold text-primary-600 dark:text-primary-400">
            ₹{SUBSCRIPTION_CONFIG.TRIAL_AMOUNT / 100} for {SUBSCRIPTION_CONFIG.TRIAL_DAYS} days trial
          </p>
        </div>
      </div>
    </Card>
  );
}
