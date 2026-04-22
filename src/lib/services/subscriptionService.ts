/**
 * Subscription Service
 * 
 * Handles premium status checks and subscription states.
 */

export interface Profile {
  id: string;
  plan?: string;
  subscription_status?: string;
  subscription_end_date?: string;
  razorpay_subscription_id?: string;
  razorpay_plan_id?: string;
  cancel_at_period_end?: boolean;
}

/**
 * Checks if a user profile has active premium status.
 */
export function isPremium(profile: Profile | null | undefined): boolean {
  if (!profile) return false;
  
  // Basic plan check
  if (profile.plan !== 'premium') return false;
  
  // Subscription status check
  // 'active' means paid/trialing, 'authenticated' might mean trial started but not yet charged
  const activeStatuses = ['active', 'trialing', 'authenticated'];
  if (!activeStatuses.includes(profile.subscription_status || '')) return false;

  // Expiry check (Safety buffer)
  if (profile.subscription_end_date) {
    const expiryDate = new Date(profile.subscription_end_date);
    const now = new Date();
    
    // Allow 24h grace period for webhook delays on monthly renewals
    expiryDate.setHours(expiryDate.getHours() + 24);
    
    if (now > expiryDate) {
      return false;
    }
  }

  return true;
}

/**
 * Returns formatted status for UI.
 */
export function getSubscriptionLabel(profile: Profile | null | undefined): string {
  if (!profile) return 'Free';
  if (!isPremium(profile)) return 'Free';
  
  if (profile.subscription_status === 'trialing' || profile.subscription_status === 'authenticated') {
    return 'Trial';
  }
  
  return 'Pro';
}

/**
 * Formats the subscription end date for display.
 */
export function getExpiryLabel(profile: Profile | null | undefined): string {
  if (!profile?.subscription_end_date) return '';
  
  const expiryDate = new Date(profile.subscription_end_date);
  return expiryDate.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
