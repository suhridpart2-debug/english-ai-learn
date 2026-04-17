import { supabaseAdmin } from "../supabase/admin";

/**
 * PRODUCTION-GRADE INTERVIEW SERVICE
 * Focuses on strict evaluation, phased progression, and system reliability.
 */

export type InterviewPhase = 'INTRO' | 'WARMUP' | 'TECHNICAL_CORE' | 'TECHNICAL_DEPTH' | 'SITUATIONAL' | 'WRAPUP';

export interface PhaseConfig {
  minSeconds: number;
  bridge: string;
}

/**
 * CORRECTED 15-MINUTE ROADMAP
 * Ensures professional session pacing.
 */
export const PHASE_ROADMAP: Record<InterviewPhase, PhaseConfig> = {
  INTRO: { minSeconds: 0, bridge: "Welcome. Let's begin the evaluation session." },
  WARMUP: { minSeconds: 60, bridge: "Let's discuss your professional background and previous projects." },
  TECHNICAL_CORE: { minSeconds: 180, bridge: "Alright, let's dive into some core technical concepts for this role." },
  TECHNICAL_DEPTH: { minSeconds: 480, bridge: "I want to go much deeper into your implementation and architectural logic." },
  SITUATIONAL: { minSeconds: 780, bridge: "Let's switch to some behavioral and situational scenarios." },
  WRAPUP: { minSeconds: 900, bridge: "We're nearing the end of our time. Let's wrap things up." }
};

export interface InterviewEvaluation {
  score: number;
  technicalScore: number;
  communicationScore: number;
  judgment: 'Strong' | 'Average' | 'Weak';
  feedback: {
    critical: string; 
    missingPoints: string[];
  };
  suggestedFollowUp?: string;
  idealAnswer: string;
}

export class InterviewService {
  /**
   * CORE AI ENGINE: OpenRouter Migration (openai/gpt-oss-120b)
   */
  private static async callAI(prompt: string, model: string = "openai/gpt-oss-120b:free"): Promise<any> {
    const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("Missing AI API Key");

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "X-Title": "SpeakAI Practice"
      },
      body: JSON.stringify({
        model,
        response_format: { type: "json_object" },
        messages: [
          { 
            role: "system", 
            content: `You are a Senior Silicon Valley Engineering Lead. 
            STRICT INTERVIEWER PROTOCOL:
            - NEVER give hollow praise. If an answer is okay, call it 'Average'.
            - SEARCH FOR TECHNICAL GAPS. If they miss edge cases, point them out.
            - BE HONEST & SLIGHTLY STRICT.
            - ALWAYS return valid JSON.` 
          },
          { role: "user", content: prompt }
        ]
      })
    });

    if (!res.ok) throw new Error(`AI Request failed: ${res.statusText}`);
    const data = await res.json();
    return JSON.parse(data.choices[0].message.content);
  }

  /**
   * HARDENED SESSION LOOKUP
   * Prevents "Session not found" hard-crash.
   */
  private static async getSafeSession(sessionId: string) {
    const { data: session, error } = await supabaseAdmin.from('interview_sessions').select('*').eq('id', sessionId).single();
    if (error || !session) {
      console.warn(`[InterviewService] Session ${sessionId} not found. Returning fallback session context.`);
      return null;
    }
    return session;
  }

  static async getNextQuestion(sessionId: string, phase: InterviewPhase): Promise<{ question: string; isAI: boolean }> {
    const session = await this.getSafeSession(sessionId);
    
    // PRODUCTION HARDENING: Fallback if session lookup fails
    if (!session) {
      return { 
        question: "Can you tell me about a technical project you're particularly proud of?", 
        isAI: false 
      };
    }

    const { data: asked } = await supabaseAdmin.from('interview_responses').select('question_text').eq('session_id', sessionId);
    const askedTexts = asked?.map(a => a.question_text) || [];

    // TIER 1: Phase-matched Database Question
    const { data: pool } = await supabaseAdmin
      .from('interview_question_bank')
      .select('*')
      .eq('role', session.role)
      .eq('is_active', true)
      .limit(50);

    const match = pool?.filter(q => !askedTexts.includes(q.question))
                       .find(q => q.topic?.toLowerCase().includes(phase.toLowerCase().replace('_', ' ')));
    
    if (match) return { question: match.question, isAI: false };

    // TIER 2: AI Generation for Specific Phase
    try {
      const prompt = `Generate a ${phase} phase interview question for a ${session.role} position at ${session.company || 'a tech startup'}. 
      Make it specific and high-signal. Return JSON: { "question": "..." }`;
      const result = await this.callAI(prompt);
      return { question: result.question, isAI: true };
    } catch (err) {
      return { question: "Can you explain the most challenging bug you've encountered recently?", isAI: false };
    }
  }

  static async evaluateAnswer(question: string, answer: string, role: string): Promise<InterviewEvaluation> {
    const prompt = `Evaluate the following answer strictly. Role: ${role}. 
    Question: "${question}"
    User Answer: "${answer}"

    RUBRIC:
    - Judgment: 'Strong' (Complete), 'Average' (Partial), 'Weak' (Vague/Wrong).
    - Feedback: Focus ONLY on technical missing points or clarity issues.
    
    Return JSON: 
    { 
      "score": 0-10, 
      "technicalScore": 0-10,
      "communicationScore": 0-10,
      "judgment": "...", 
      "feedback": { "critical": "STRICT_CRITIQUE", "missingPoints": ["..."] },
      "suggestedFollowUp": "Optional question if judgment is Average/Weak",
      "idealAnswer": "Complete technical explanation"
    }`;
    return await this.callAI(prompt);
  }
}
