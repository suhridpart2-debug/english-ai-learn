import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { InterviewService, InterviewPhase } from '@/lib/services/interviewService';

export async function POST(request: Request) {
  try {
    const { sessionId, question, answer, phase, elapsed } = await request.json();

    // 1. Get Session & Role info
    const { data: session } = await supabaseAdmin.from('interview_sessions').select('*').eq('id', sessionId).single();
    if (!session) throw new Error("Session not found");

    // 2. Evaluate answer via STRICT rubric (OpenRouter gpt-oss-120b)
    const evaluation = await InterviewService.evaluateAnswer(question, answer, session.role, session.company);

    // 3. Save response to DB
    await supabaseAdmin.from('interview_responses').insert({
      session_id: sessionId,
      user_id: session.user_id,
      question_text: question,
      user_answer: answer,
      score: evaluation.score,
      technical_score: evaluation.technicalScore,
      communication_score: evaluation.communicationScore,
      confidence_score: evaluation.confidenceScore,
      grammar_score: evaluation.grammarScore,
      feedback: evaluation.feedback,
      hinglish_explanation: evaluation.hinglishExplanation,
      ideal_answer: evaluation.idealAnswer
    });

    // 4. Session Progression & Phase Mapping
    const currentIdx = session.current_question_index + 1;
    
    // Hardening: Duration-based isLast check (~15 mins = 900s)
    const isDurationUp = elapsed >= 900 || phase === 'WRAPUP';
    const isMaxQuestions = currentIdx >= 25; // Hard limit for safety
    const isLast = isDurationUp || isMaxQuestions;

    let nextQuestion = null;
    let nextSource = "dynamic";

    if (!isLast) {
      // Update session index
      await supabaseAdmin.from('interview_sessions').update({ current_question_index: currentIdx }).eq('id', sessionId);
      
      // PRIORITY: If evaluation suggested a follow-up (due to weak/vague answer), prioritize that
      if (evaluation.suggestedFollowUp && (evaluation.judgment === 'Weak' || evaluation.judgment === 'Average')) {
          nextQuestion = evaluation.suggestedFollowUp;
          nextSource = "ai_follow_up";
      } else {
          // Normal phase-based fetching
          const qResult = await InterviewService.getNextQuestion(sessionId, phase as InterviewPhase);
          nextQuestion = qResult.question;
          nextSource = qResult.sourceType;
      }
    } else {
      // Complete session and generate final report
      const finalReport = await InterviewService.generateFinalReport(sessionId);
      await supabaseAdmin.from('interview_sessions').update({ 
        status: 'completed', 
        completed_at: new Date().toISOString(),
        final_report: finalReport
      }).eq('id', sessionId);
    }

    return NextResponse.json({
      success: true,
      evaluation,
      nextQuestion,
      nextSource,
      isLast
    });

  } catch (error: any) {
    console.error("Answer evaluation failed:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
