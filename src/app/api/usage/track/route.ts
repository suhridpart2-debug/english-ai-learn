import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { UsageService, UsageType } from '@/lib/services/usageService';

export async function POST(req: NextRequest) {
  try {
    const { type } = await req.json();
    
    if (!type || !['vocab_adds', 'ai_messages'].includes(type)) {
      return NextResponse.json({ error: 'Invalid usage type' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get profile to check premium
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Check if within limits before incrementing
    const check = await UsageService.canPerformAction(type as UsageType, profile);
    
    if (!check.can) {
      return NextResponse.json({ 
        success: false, 
        limitReached: true, 
        current: check.current, 
        limit: check.limit 
      });
    }

    // Increment
    await UsageService.incrementUsage(type as UsageType, user.id);

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Usage tracking failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
  
      if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
  
      const usage = await UsageService.getTodayUsage(profile);
      return NextResponse.json(usage);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
