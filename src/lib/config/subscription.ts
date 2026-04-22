/**
 * Subscription Configuration
 * 
 * Centralized constants for the premium plan.
 * Currently set for Live Validation Mode (₹1).
 */

export const SUBSCRIPTION_CONFIG = {
  PLAN_NAME: 'premium',
  
  // Trial: ₹1 for 7 days
  TRIAL_AMOUNT: 100, 
  TRIAL_DAYS: 7,

  // Subscription: ₹99/month
  MONTHLY_AMOUNT: 9900,
  MONTHLY_PLAN_ID: process.env.RAZORPAY_MONTHLY_PLAN_ID || '', // Must be set in .env.local
  
  CURRENCY: 'INR',
  
  // Usage-based Limits for Free Users
  LIMITS: {
    VOCAB_PER_DAY: 3,
    AI_MESSAGES_PER_DAY: 5,
    INTERVIEW_SESSIONS: 1, // Lifetime free limit
  },

  IS_LIVE_VALIDATION: true,
};
