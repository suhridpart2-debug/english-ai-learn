import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { SUBSCRIPTION_CONFIG } from '@/lib/config/subscription';

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 });
    }

    // Verify authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Signature Verification
    const secret = process.env.RAZORPAY_KEY_SECRET!;
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Payment is verified. Now update user subscription.
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + SUBSCRIPTION_CONFIG.DURATION_DAYS); 

    // Use Admin client to bypass RLS and securely update plan
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        plan: SUBSCRIPTION_CONFIG.PLAN_NAME,
        subscription_status: 'active',
        subscription_start_date: startDate.toISOString(),
        subscription_end_date: endDate.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (profileError) {
      console.error('Error updating profile:', profileError);
      return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
    }

    // Record in payment history
    const { error: historyError } = await supabaseAdmin
      .from('payment_history')
      .insert({
        user_id: user.id,
        gateway_order_id: razorpay_order_id,
        gateway_payment_id: razorpay_payment_id,
        amount: SUBSCRIPTION_CONFIG.AMOUNT, 
        status: 'success',
        plan_name: SUBSCRIPTION_CONFIG.PLAN_NAME,
        paid_at: new Date().toISOString(),
      });

    if (historyError) {
      console.error('Error recording payment history:', historyError);
      // We don't fail the whole request because the user is already premium now
    }

    return NextResponse.json({ success: true, message: 'Premium activated' });
  } catch (error: any) {
    console.error('Verification Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
