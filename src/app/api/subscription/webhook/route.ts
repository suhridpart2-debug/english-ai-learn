import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!secret || !signature) {
      return NextResponse.json({ error: 'Webhook secret or signature missing' }, { status: 400 });
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);
    const { event: eventType, payload } = event;

    console.log(`[Razorpay Webhook] Received event: ${eventType}`);

    if (eventType === 'subscription.authenticated' || eventType === 'subscription.charged') {
      const subscription = payload.subscription.entity;
      const userId = subscription.notes?.userId;

      if (userId) {
        // Update user to premium
        const expiryDate = new Date(subscription.current_end * 1000);
        
        await supabaseAdmin
          .from('profiles')
          .update({
            plan: 'premium',
            subscription_status: 'active',
            subscription_end_date: expiryDate.toISOString(),
            razorpay_subscription_id: subscription.id,
            razorpay_customer_id: subscription.customer_id,
            razorpay_plan_id: subscription.plan_id,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);
        
        console.log(`[Razorpay Webhook] Premium activated for user: ${userId}`);
      }
    }

    if (eventType === 'subscription.cancelled' || eventType === 'subscription.halted') {
      const subscription = payload.subscription.entity;
      const userId = subscription.notes?.userId;

      if (userId) {
        await supabaseAdmin
          .from('profiles')
          .update({
            subscription_status: 'inactive',
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);
        
        console.log(`[Razorpay Webhook] Premium deactivated for user: ${userId}`);
      }
    }

    return NextResponse.json({ status: 'ok' });

  } catch (error: any) {
    console.error("Webhook processing failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
