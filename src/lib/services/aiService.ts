import { VideoLearningObject } from "../data/dailyVideos";

interface VideoExtraction {
  summary: string;
  category: "Conversation" | "Pronunciation" | "Grammar" | "Vocabulary" | "Interview" | "Storytelling";
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  vocabulary: { word: string; meaning: string; example: string }[];
  keyPhrases: { phrase: string; context: string }[];
}

export interface VideoExtractionResult {
  data: VideoExtraction;
  provider: "OpenAI" | "Groq" | "LocalFallback";
  errors: any[];
}

export class AIService {
  /**
   * Evaluates video context and extracts educational JSON payload using OpenAI or Groq.
   */
  static async extractVideoLearningData(title: string, description: string): Promise<VideoExtractionResult> {
    const prompt = `
      You are an expert English teacher. 
      Analyze this YouTube video based on its title and description:
      Title: "${title}"
      Description: "${description}"

      Extract and generate the following educational data in strict JSON format. 
      Do NOT wrap it in markdown block quotes. Return RAW JSON.
      {
        "summary": "A 2-sentence summary of what this video teaches.",
        "category": "Conversation" | "Pronunciation" | "Grammar" | "Vocabulary" | "Interview" | "Storytelling",
        "difficulty": "Beginner" | "Intermediate" | "Advanced",
        "vocabulary": [
          { "word": "word1", "meaning": "meaning1", "example": "example1" }, // exactly 3 words
          { "word": "word2", "meaning": "meaning2", "example": "example2" },
          { "word": "word3", "meaning": "meaning3", "example": "example3" }
        ],
        "keyPhrases": [
           { "phrase": "phrase1", "context": "context1" }, // exactly 3 phrases
           { "phrase": "phrase2", "context": "context2" },
           { "phrase": "phrase3", "context": "context3" }
        ]
      }
    `;

    // Strategy: Prefer OPENAI, fallback to GROQ, fallback to LOCAL
    const openaiKey = process.env.OPENAI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;

    let aiErrors: any[] = [];

    // 1. OPENAI
    if (openaiKey) {
      try {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${openaiKey}`
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            response_format: { type: "json_object" },
            messages: [{ role: "user", content: prompt }]
          })
        });

        if (res.ok) {
          const data = await res.json();
          return {
             data: JSON.parse(data.choices[0].message.content) as VideoExtraction,
             provider: "OpenAI",
             errors: aiErrors
          };
        } else {
          const errText = await res.text();
          aiErrors.push({ provider: "OpenAI", status: res.status, message: errText });
        }
      } catch (err: any) {
        aiErrors.push({ provider: "OpenAI", status: "network_error", message: err.message });
      }
    }

    // 2. GROQ
    if (groqKey) {
      try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${groqKey}`
          },
          body: JSON.stringify({
            model: "llama3-8b-8192", // Fast and capable for this simple JSON task
            response_format: { type: "json_object" },
            messages: [{ role: "user", content: prompt }]
          })
        });

        if (res.ok) {
          const data = await res.json();
          return {
             data: JSON.parse(data.choices[0].message.content) as VideoExtraction,
             provider: "Groq",
             errors: aiErrors
          };
        } else {
          const errText = await res.text();
          aiErrors.push({ provider: "Groq", status: res.status, message: errText });
        }
      } catch (err: any) {
        aiErrors.push({ provider: "Groq", status: "network_error", message: err.message });
      }
    }

    // 3. Fallback logic: Deterministic Local Extractor
    return {
       provider: "LocalFallback",
       errors: aiErrors,
       data: {
         summary: description ? (description.substring(0, 100) + "...") : "A daily educational video about English.",
         category: "Conversation",
         difficulty: "Intermediate",
         vocabulary: [
            { word: "English", meaning: "The language being taught", example: "I am learning English." },
            { word: "Video", meaning: "Visual medium", example: "This is a great video." },
            { word: "Learn", meaning: "To acquire knowledge", example: "We learn new words." } 
         ],
         keyPhrases: [
            { phrase: "Welcome back", context: "Used at the start" },
            { phrase: "For example", context: "Used when explaining" },
            { phrase: "In conclusion", context: "Used at the end" }
         ]
       }
    };
  }

  /**
   * Pronunciation evaluation
   */
  static async evaluatePronunciationScore(targetWord: string, transcript: string): Promise<{ score: number, feedback: string, correct: boolean }> {
      const prompt = `
        You are a pronunciation coach.
        The user was trying to say the word: "${targetWord}"
        The speech-to-text algorithm heard: "${transcript}"

        Evaluate their pronunciation. Give a score between 0 and 100.
        If the transcript indicates they said something very different, score is low.
        If it's phonetically identical, score is high.
        Provide a helpful 1-sentence tip.

        Return Raw JSON only: 
        { "score": 85, "feedback": "Good attempt, but focus on the 'th' sound.", "correct": true/false (true if > 75) }
      `;

      const openaiKey = process.env.OPENAI_API_KEY;
      if (!openaiKey) throw new Error("OpenAI key required for Speech processing");

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          response_format: { type: "json_object" },
          messages: [{ role: "user", content: prompt }]
        })
      });

      if (!res.ok) throw new Error("AI evaluation failed");
      const data = await res.json();
      return JSON.parse(data.choices[0].message.content);
  }
}
