/**
 * Subscription Service
 * 
 * Handles premium status checks and expiry logic.
 */

export interface Profile {
  plan?: string;
  subscription_status?: string;
  subscription_end_date?: string;
}

/**
 * Checks if a user profile has active premium status.
 * Handles both the plan field and the runtime expiry check.
 */
export function isPremium(profile: Profile | null | undefined): boolean {
  if (!profile) return false;
  
  // Basic plan check
  if (profile.plan !== 'premium') return false;
  
  // Expiry check
  if (profile.subscription_end_date) {
    const expiryDate = new Date(profile.subscription_end_date);
    const now = new Date();
    
    // If current time is past expiry, treat as free
    if (now > expiryDate) {
      return false;
    }
  }

  return profile.subscription_status === 'active';
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
