import { NextResponse } from 'next/server';
import { AIService } from '@/lib/services/aiService';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const formData = await request.formData();
    const audioBlob = formData.get('audio') as Blob;
    const targetWord = formData.get('word') as string;

    if (!audioBlob || !targetWord) {
      return NextResponse.json({ error: "Missing audio or target word" }, { status: 400 });
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      // Mock mode if key is missing in demo environments
      console.warn("Speech API: Warning - No OPENAI_API_KEY found, simulating success.");
      return NextResponse.json({ 
        score: 95, 
        feedback: "Great job! This is a simulated response since AI keys are missing.", 
        correct: true,
        transcript: targetWord 
      });
    }

    // 1. Convert Audio to File for Whisper
    const audioFile = new File([audioBlob], 'recording.webm', { type: audioBlob.type || 'audio/webm' });
    const whisperFormData = new FormData();
    whisperFormData.append('file', audioFile);
    whisperFormData.append('model', 'whisper-1');
    whisperFormData.append('language', 'en'); // Focus entirely on English decoding

    // 2. Transcribe Audio
    console.log(`Speech API: Transcribing audio for word [${targetWord}]`);
    const whisperRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiKey}`
      },
      body: whisperFormData
    });

    if (!whisperRes.ok) {
      const errorText = await whisperRes.text();
      console.error("Whisper Error:", errorText);
      throw new Error("Failed to transcribe audio");
    }

    const whisperData = await whisperRes.json();
    const transcript = whisperData.text || "";
    
    console.log(`Speech API: Transcript received: "${transcript}"`);

    // 3. Evaluate Pronunciation against Target
    const evaluation = await AIService.evaluatePronunciationScore(targetWord, transcript);

    return NextResponse.json({ 
      ...evaluation,
      transcript
    });

  } catch (error: any) {
    console.error("Speech Evaluation Error:", error);
    return NextResponse.json({ error: error.message || "Failed to process speech" }, { status: 500 });
  }
}
