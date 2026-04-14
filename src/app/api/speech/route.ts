import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing GROQ_API_KEY" },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file =
      (formData.get("file") as File | null) ||
      (formData.get("audio") as File | null);

    if (!file) {
      return NextResponse.json(
        { error: "No audio file received" },
        { status: 400 }
      );
    }

    // Prepare the form data for Groq API (OpenAI compatible)
    const groqFormData = new FormData();
    groqFormData.append("file", file);
    groqFormData.append("model", "whisper-large-v3");

    const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: groqFormData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Groq API error:", errorData);
      return NextResponse.json(
        { error: errorData.error?.message || "Transcription failed" },
        { status: 500 }
      );
    }

    const transcript = await response.json();

    return NextResponse.json({
      text: transcript.text || "Could not transcribe audio.",
      confidence: 0.95,
      provider: "groq",
      speechModelUsed: "whisper-large-v3",
    });
  } catch (error) {
    console.error("Groq speech error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unknown server error",
      },
      { status: 500 }
    );
  }
}