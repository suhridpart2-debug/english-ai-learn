export interface SpeechResult {
  text: string;
  confidence: number;
}

export const mockSpeechToText = async (
  audioBlob: Blob
): Promise<SpeechResult> => {
  try {
    if (!audioBlob || audioBlob.size === 0) {
      return {
        text: "No audio detected.",
        confidence: 0,
      };
    }

    const formData = new FormData();
    formData.append("file", audioBlob, "recording.webm");

    const res = await fetch("/api/speech", {
      method: "POST",
      body: formData,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error("Speech API error:", data);

      const message =
        typeof data?.error === "string"
          ? data.error
          : "Failed to transcribe audio";

      throw new Error(message);
    }

    return {
      text: typeof data?.text === "string"
        ? data.text
        : "Could not transcribe audio.",
      confidence:
        typeof data?.confidence === "number" ? data.confidence : 0.95,
    };
  } catch (error) {
    console.error("Transcription error:", error);

    return {
      text: "Could not transcribe audio right now.",
      confidence: 0,
    };
  }
};

export const startRecordingStream = async (): Promise<MediaRecorder | null> => {
  try {
    if (typeof window === "undefined") {
      return null;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      console.error("getUserMedia is not supported in this browser.");
      return null;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    return new MediaRecorder(stream);
  } catch (error) {
    console.error("Microphone access denied:", error);
    return null;
  }
};