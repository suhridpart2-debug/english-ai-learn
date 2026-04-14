export interface AnalysisReport {
  grammarScore: number;
  fluencyScore: number;
  pronunciationScore: number;
  fillersUsed: number;
  pausesCount: number;
  mistakes: Array<{
    original: string;
    correction: string;
    explanation: string;
    hinglishExplanation: string;
  }>;
}

export const analyzeSpeech = async (text: string): Promise<AnalysisReport> => {
  try {
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) {
      throw new Error("Failed to fetch analysis");
    }

    const data = await res.json();
    return data as AnalysisReport;
  } catch (error) {
    console.error("Analysis generation error:", error);
    // Safe fallback if API key is missing or request fails
    return {
      grammarScore: 70,
      fluencyScore: 70,
      pronunciationScore: 70, // Placeholder
      fillersUsed: 0,
      pausesCount: 0,
      mistakes: [
        {
          original: "Could not analyze the speech right now.",
          correction: "Please try again later.",
          explanation: "The AI analysis service is temporarily unavailable or missing API keys.",
          hinglishExplanation: "AI analysis service abhi uplabdh nahi hai ya API keys missing hain.",
        },
      ],
    };
  }
};
