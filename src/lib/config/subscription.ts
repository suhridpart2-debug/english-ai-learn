/**
 * Subscription Configuration
 * 
 * Centralized constants for the premium plan.
 * Currently set for Live Validation Mode (₹1).
 */

export const SUBSCRIPTION_CONFIG = {
  PLAN_NAME: 'premium',
  
  // Amount in Paise (e.g., 100 paise = ₹1)
  // CHANGE THIS TO 2000 FOR ₹20 (Original Plan Price)
  AMOUNT: 100, 
  
  CURRENCY: 'INR',
  
  // Duration in days
  DURATION_DAYS: 30,
  
  // Label for UI
  IS_LIVE_VALIDATION: true,
};
