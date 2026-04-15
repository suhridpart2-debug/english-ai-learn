import { NextResponse } from 'next/server';

const STATIC_FALLBACKS = [
  "Bohot badhiya koshish thi! Bas kuch words par thoda aur dhyan dein.",
  "Aapki pronunciation kaafi acchi hai, bas fluency par focus karein.",
  "Kuch words clear nahi the. Word-by-word practice aapki madad karegi.",
  "Great job! Har word ko saaf bolne ki koshish karein.",
];

export async function POST(req: Request) {
  try {
    const { passage, transcript, mistakes } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ feedback: STATIC_FALLBACKS[0] });
    }

    const mistakeList = mistakes.map((m: any) => m.word).join(", ");
    
    const prompt = `
      Passage: "${passage}"
      User's Spoken Text: "${transcript}"
      Specific Mistakes: "${mistakeList}"
      
      You are an English Pronunciation Coach for Indian learners. 
      Analyze the mistakes and provide a short, encouraging feedback in Hinglish (Hindi + English).
      Focus on specific sounds or the speed of speaking. 
      Keep it under 3 sentences.
      Make it feel personal and helpful.
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
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      throw new Error("Groq API error");
    }

    const data = await response.json();
    const feedback = data.choices[0]?.message?.content || STATIC_FALLBACKS[1];

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error("Feedback API error:", error);
    // Return a random static fallback
    const fallback = STATIC_FALLBACKS[Math.floor(Math.random() * STATIC_FALLBACKS.length)];
    return NextResponse.json({ feedback: fallback });
  }
}
