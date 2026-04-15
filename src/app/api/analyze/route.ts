import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { text } = await req.json();

    if (!text || text.trim() === "") {
      return NextResponse.json(
        { error: "No text provided for analysis" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      // Fallback
      return NextResponse.json(
        { error: "Missing GROQ_API_KEY" },
        { status: 500 }
      );
    }

    const systemPrompt = `You are an expert English language coach.
Analyze the following speech transcript.
Please evaluate the grammar, fluency, and count filler words (um, ah, like, you know) used.
Identify grammatical mistakes or unnatural phrasing, and provide a correction along with a simple English explanation and a Hinglish explanation for each mistake.
Respond ONLY with a valid JSON object matching this structure exactly (no markdown wrapping, just the raw JSON):
{
  "grammarScore": <number 0-100>,
  "fluencyScore": <number 0-100>,
  "pronunciationScore": 0,
  "fillersUsed": <integer>,
  "pausesCount": 0,
  "mistakes": [
    {
      "original": "<part that is incorrect>",
      "correction": "<corrected part>",
      "explanation": "<explain the grammar rule simply>",
      "hinglishExplanation": "<explain the mistake in Hinglish>"
    }
  ]
}

If no mistakes are found, leave the mistakes array empty and give high scores.
For pronunciation and pauses, we cannot evaluate it from text alone, so leave them as 0.`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Transcript: ${text}` },
        ],
        temperature: 0.2, // Low temperature for more deterministic output
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Groq API error:", errorData);
      throw new Error(errorData.error?.message || "Failed to fetch analysis");
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    let cleanContent = content.trim();
    if (cleanContent.startsWith("\`\`\`json")) {
      cleanContent = cleanContent.replace(/^\`\`\`json/, "").replace(/\`\`\`$/, "").trim();
    } else if (cleanContent.startsWith("\`\`\`")) {
      cleanContent = cleanContent.replace(/^\`\`\`/, "").replace(/\`\`\`$/, "").trim();
    }

    const result = JSON.parse(cleanContent);
    
    // Provide a placeholder value since true pronunciation is not measurable purely from text here
    result.pronunciationScore = 75; 

    return NextResponse.json(result);
  } catch (error) {
    console.error("Analysis generation error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
