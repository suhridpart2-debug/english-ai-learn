import { NextRequest, NextResponse } from 'next/server';
import { razorpay } from '@/lib/razorpay';
import { createClient } from '@/lib/supabase/server';
import { SUBSCRIPTION_CONFIG } from '@/lib/config/subscription';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const planId = SUBSCRIPTION_CONFIG.MONTHLY_PLAN_ID;

    if (!planId) {
      return NextResponse.json({ 
        error: 'Subscription Plan ID missing. Please configure RAZORPAY_MONTHLY_PLAN_ID in env.' 
      }, { status: 500 });
    }

    // Razorpay Subscription Creation
    console.log(`[API] Creating Razorpay subscription for user: ${user.id} with plan: ${planId}`);
    
    try {
      const subscription = await razorpay.subscriptions.create({
        plan_id: planId,
        total_count: 60, // 5 years auto-renewal
        quantity: 1,
        customer_notify: 0, // App handles its own notifications
        start_at: Math.floor(Date.now() / 1000) + (SUBSCRIPTION_CONFIG.TRIAL_DAYS * 24 * 60 * 60),
        addons: [
          {
            item: {
              name: "SpeakAI Premium Trial access",
              amount: SUBSCRIPTION_CONFIG.TRIAL_AMOUNT, // ₹1 (100 paise)
              currency: "INR"
            }
          }
        ],
        notes: {
          userId: user.id,
        },
      });

      console.log(`[API] Subscription created: ${subscription.id}`);

      return NextResponse.json({
        id: subscription.id,
        key_id: process.env.RAZORPAY_KEY_ID,
        amount: SUBSCRIPTION_CONFIG.TRIAL_AMOUNT, // Display ₹1 in checkout
        currency: 'INR',
        name: 'SpeakAI Premium Trial',
        description: '₹1 for 7 days, then ₹99/month',
      });
    } catch (rzpError: any) {
      // Razorpay specific error extraction
      const errorMsg = rzpError.description || 
                       rzpError.error?.description || 
                       rzpError.message || 
                       "Razorpay API Error";
      
      console.error("[API] Razorpay Subscription Creation Detail:", {
        message: errorMsg,
        raw: rzpError
      });

      return NextResponse.json({ 
        error: errorMsg,
        details: rzpError.code || rzpError.error?.code || null
      }, { status: 400 }); // Use 400 to pass through validation errors
    }

  } catch (error: any) {
    console.error("[API] Subscription creation CRITICAL FAILURE:", error);
    return NextResponse.json({ 
      error: error.message || "Internal server error during subscription setup",
    }, { status: 500 });
  }
}
