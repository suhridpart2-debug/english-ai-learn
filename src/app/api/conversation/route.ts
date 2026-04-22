import { createClient } from "@/lib/supabase/server";
import { isPremium } from "@/lib/services/subscriptionService";
import { SUBSCRIPTION_CONFIG } from "@/lib/config/subscription";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // --- STRIDE PREMIUM CHECK ---
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    const premium = isPremium(profile);

    if (!premium) {
      const { data: usage } = await supabase
        .from('daily_usage')
        .select('*')
        .eq('user_id', user.id)
        .eq('usage_date', new Date().toISOString().split('T')[0])
        .single();

      const hits = usage?.ai_messages || 0;
      if (hits >= SUBSCRIPTION_CONFIG.LIMITS.AI_MESSAGES_PER_DAY) {
        return NextResponse.json({ 
          error: "Daily limit reached", 
          code: "LIMIT_REACHED",
          current: hits,
          limit: SUBSCRIPTION_CONFIG.LIMITS.AI_MESSAGES_PER_DAY
        }, { status: 403 });
      }
    }
    // ----------------------------

    const { 
      message, 
      history = [], 
      personaId, 
      customSystemPrompt: dynamicPrompt,
      durationMinutes = 5,
      mode = "free",
      scenarioDescription = ""
    } = await req.json();

    if (!message || message.trim() === "") {
      return NextResponse.json(
        { error: "No message provided" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing GROQ_API_KEY" },
        { status: 500 }
      );
    }

    let basePrompt = "";
    if (mode === "guided" && scenarioDescription) {
      basePrompt = scenarioDescription;
    } else if (dynamicPrompt) {
      basePrompt = dynamicPrompt;
    } else {
      const persona = PERSONAS[personaId as PersonaId];
      if (!persona) {
        return NextResponse.json({ error: "Invalid persona" }, { status: 400 });
      }
      basePrompt = persona.systemPrompt;
    }

    const systemPrompt = `
      ${basePrompt}

      DURATION CONTEXT: This conversation is intended to last approximately ${durationMinutes} minutes. 
      - If we are near the start, keep the topics exploratory. 
      - If we have reached many turns, start to naturally wrap up the conversation in a human-like way.
      - Adjust the depth and complexity of your language based on the target duration.

      COMMUNICATION RULES:
      1. ALWAYS follow up your reply with a natural question or a related comment that invites the user to keep speaking.
      2. BE CONVERSATIONAL: Do not just give feedback. Act as a real speaking partner.
      3. KEEP IT NATURAL: Use contractions (I'm, don't, etc.) and conversational fillers if appropriate for the persona.
      
      EVALUATION:
      You are also evaluating the user's latest response for English language learning.
      You MUST respond ONLY with a valid JSON object matching this structure exactly:
      {
        "reply": "<Your conversational response. Keep it natural, usually 1-3 sentences. ALWAYS include a follow-up question or thought.>",
        "feedback": {
          "grammar_correction": "<Point out grammatical mistakes in their latest message. If none, leave empty string>",
          "better_sentence": "<Suggest a more natural or advanced way to say what they meant.>",
          "vocabulary_improvement": "<Suggest 1-2 advanced synonyms for words they used.>",
          "hinglish_explanation": "<A short Hinglish sentence explaining the improvement or mistake.>",
          "fluency_score": <number 0-100 indicating fluency of the text>,
          "confidence_score": <number 0-100 indicating confidence level>
        }
      }
      Do not wrap the JSON in markdown blocks. Just return the raw JSON object.
    `;

    // Map history to OpenAI format
    const mappedHistory = history.map((msg: any) => ({
      role: msg.role === "agent" ? "assistant" : "user",
      content: msg.content
    }));

    const messages = [
      { role: "system", content: systemPrompt },
      ...mappedHistory,
      { role: "user", content: message }
    ];

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" },
        messages: messages,
        temperature: 0.6,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Groq API error:", errorData);
      throw new Error(errorData.error?.message || "Failed to fetch response from Groq");
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    let cleanContent = content.trim();
    if (cleanContent.startsWith("\`\`\`json")) {
      cleanContent = cleanContent.replace(/^\`\`\`json/, "").replace(/\`\`\`$/, "").trim();
    } else if (cleanContent.startsWith("\`\`\`")) {
      cleanContent = cleanContent.replace(/^\`\`\`/, "").replace(/\`\`\`$/, "").trim();
    }

    let parsed;
    try {
      parsed = JSON.parse(cleanContent);
    } catch (err) {
      console.error("Failed to parse JSON from AI", cleanContent);
      return NextResponse.json({ error: "AI returned invalid JSON" }, { status: 500 });
    }

    // Increment usage atomically
    await supabase.rpc('increment_usage_v2', {
      u_id: user.id,
      u_date: new Date().toISOString().split('T')[0],
      u_col: 'ai_messages'
    });

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Conversation generation error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
