"use client";

import React, { ReactNode } from "react";
import { Lock, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { UpgradeButton } from "@/components/payments/UpgradeButton";
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
  description = "Upgrade to unlock 30 days of full access to all AI practice tools, unlimited mock interviews, and advanced learning modules.",
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
    <Card className="relative overflow-hidden border-2 border-dashed border-indigo-200 bg-indigo-50/30 p-8 dark:border-indigo-900/30 dark:bg-indigo-950/20">
      <div className="absolute right-0 top-0 p-4">
        <Lock className="h-6 w-6 text-indigo-300 dark:text-indigo-800" />
      </div>

      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
          <Sparkles className="h-8 w-8" />
        </div>

        <h3 className="mb-2 font-display text-xl font-bold text-slate-900 dark:text-white">
          {title}
        </h3>
        
        <p className="mb-6 max-w-sm text-slate-600 dark:text-slate-400">
          {description}
        </p>

        <div className="flex flex-col items-center gap-3">
          <UpgradeButton size="lg" className="shadow-lg shadow-indigo-200 dark:shadow-none" />
          <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            One-time payment of only ₹{SUBSCRIPTION_CONFIG.AMOUNT / 100}
          </p>
        </div>
      </div>
    </Card>
  );
}
