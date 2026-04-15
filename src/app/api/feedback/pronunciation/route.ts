import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const STATIC_FALLBACKS = [
  { good: "Bohot badhiya koshish thi!", improvement: "Bas kuch words par thoda aur dhyan dein." },
  { good: "Aapki fluency kaafi acchi hai.", improvement: "Pronunciation पर थोड़ा फोकस करें।" }
];

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { passage, transcript, mistakes } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    // Use default fallback structure
    const defaultFallback = STATIC_FALLBACKS[0];

    if (!apiKey) {
      return NextResponse.json(defaultFallback);
    }

    const mistakeList = mistakes.map((m: any) => m.word).join(", ");
    
    const prompt = `
      Passage: "${passage}"
      User's Spoken Text: "${transcript}"
      Specific Mistakes: "${mistakeList}"
      
      You are an English Pronunciation Coach for Indian learners. 
      Analyze the mistakes and provide encouraging feedback in Hinglish (Hindi + English).
      Focus on specific sounds or the speed of speaking. 
      Make it feel personal and helpful.
      
      IMPORTANT: You MUST return the response ONLY as a valid JSON object with the following structure. Do NOT include any markdown formatting, code blocks, or extra text.
      {
        "good": "1 sentence highlighting what they did well in Hinglish",
        "improvement": "1-2 sentences explaining what to improve and how in Hinglish"
      }
    `;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 300,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      throw new Error("Groq API error");
    }

    const data = await response.json();
    let structuredFeedback = defaultFallback;

    try {
      if (data.choices && data.choices[0]?.message?.content) {
        const parsed = JSON.parse(data.choices[0].message.content);
        if (parsed.good && parsed.improvement) {
          structuredFeedback = parsed;
        }
      }
    } catch (parseError) {
      console.error("Failed to parse Groq JSON response", parseError);
    }

    return NextResponse.json(structuredFeedback);
  } catch (error) {
    console.error("Feedback API error:", error);
    // Return a random static fallback
    const fallback = STATIC_FALLBACKS[Math.floor(Math.random() * STATIC_FALLBACKS.length)];
    return NextResponse.json(fallback);
  }
}

