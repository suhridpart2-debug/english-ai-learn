import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { InterviewService } from '@/lib/services/interviewService';

export async function POST(request: Request) {
  try {
    const { role, company, difficulty, roundType } = await request.json();

    // 1. Auth check
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 });
    }

    // 2. CREATE SESSION FIRST (Production Requirement: Session must exist before any AI/Question calls)
    const { data: session, error: sessError } = await supabaseAdmin
      .from('interview_sessions')
      .insert({
        user_id: user.id,
        role: role || "Software Engineer",
        company: company || "Generic",
        difficulty: difficulty || "Medium",
        round_type: roundType || "Technical",
        status: 'active',
        total_questions: 5
      })
      .select()
      .single();

    if (sessError) {
      console.error("[Start API] Session creation failed:", sessError);
      return NextResponse.json({ success: false, error: "Failed to initialize session." }, { status: 500 });
    }

    // 3. FETCH QUESTION SECOND (Failsafe: logic inside service handles all fallbacks including AI failures)
    let questionData = { question: "Tell me about your background.", sourceType: "seeded", isAI: false };
    try {
      questionData = await InterviewService.getNextQuestion(session.id);
    } catch (qErr) {
      console.error("[Start API] Question selection failed, using internal safety default:", qErr);
      // We don't return 500 here because the session is already active.
    }

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      question: questionData.question,
      sourceType: questionData.sourceType,
      isAI: questionData.isAI,
      interviewerGreeting: `Hello! I'm your interviewer today for the ${role} position at ${company}. Let's get started.`
    });
  } catch (error: any) {
    console.error("[Start API] Critical Failure:", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
