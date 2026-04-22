import { supabase } from "../supabaseClient";
import { SUBSCRIPTION_CONFIG } from "../config/subscription";
import { isPremium } from "./subscriptionService";

export type UsageType = 'vocab_adds' | 'ai_messages';

export interface UsageState {
  vocab_adds: number;
  ai_messages: number;
  limits: typeof SUBSCRIPTION_CONFIG.LIMITS;
  is_premium: boolean;
}

/**
 * Usage Service
 * 
 * Handles daily tracking and limit enforcement for free users.
 */
export const UsageService = {
  /**
   * Fetches the current usage for the logged-in user for today.
   */
  async getTodayUsage(profile: any): Promise<UsageState> {
    const premium = isPremium(profile);
    
    // For premium users, we still track but limits don't apply
    const { data: usage, error } = await supabase
      .from('daily_usage')
      .select('*')
      .eq('user_id', profile.id)
      .eq('usage_date', new Date().toISOString().split('T')[0])
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error("Error fetching usage:", error);
    }

    return {
      vocab_adds: usage?.vocab_adds || 0,
      ai_messages: usage?.ai_messages || 0,
      limits: SUBSCRIPTION_CONFIG.LIMITS,
      is_premium: premium
    };
  },

  /**
   * Checks if a specific action is within limits.
   */
  async canPerformAction(type: UsageType, profile: any): Promise<{ can: boolean; current: number; limit: number }> {
    const usage = await this.getTodayUsage(profile);
    
    if (usage.is_premium) return { can: true, current: 0, limit: Infinity };

    const current = usage[type] || 0;
    let limit = 0;

    switch (type) {
      case 'vocab_adds': limit = usage.limits.VOCAB_PER_DAY; break;
      case 'ai_messages': limit = usage.limits.AI_MESSAGES_PER_DAY; break;
    }

    return {
      can: current < limit,
      current,
      limit
    };
  },

  /**
   * Increments the usage count for today.
   */
  async incrementUsage(type: UsageType, userId: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    // Attempt to upsert usage count atomically via RPC
    const { error } = await supabase.rpc('increment_usage_v2', {
      u_id: userId,
      u_date: today,
      u_col: type
    });

    if (error) {
      console.error("RPC Error:", error);
      // Fallback manual upsert (not atomic, but safer than failing)
      const { data: existing } = await supabase
        .from('daily_usage')
        .select('*')
        .eq('user_id', userId)
        .eq('usage_date', today)
        .single();

      if (existing) {
        await supabase
          .from('daily_usage')
          .update({ [type]: (existing[type] || 0) + 1, updated_at: new Date().toISOString() })
          .eq('user_id', userId)
          .eq('usage_date', today);
      } else {
        await supabase
          .from('daily_usage')
          .insert({ user_id: userId, usage_date: today, [type]: 1 });
      }
    }
  }
};

/**
 * Client-side helper to fetch current usage from the API
 */
export async function fetchUsage(): Promise<UsageState> {
  const res = await fetch('/api/usage/track');
  if (!res.ok) throw new Error("Failed to fetch usage");
  return res.json();
}
