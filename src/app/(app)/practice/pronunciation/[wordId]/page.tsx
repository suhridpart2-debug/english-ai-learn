"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { VOCABULARY_DATA, VocabularyWord } from "@/lib/data/vocabularyData";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Mic,
  Square,
  Play,
  Sparkles,
  ChevronLeft,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type PronunciationResult = {
  score: number;
  feedback: string;
  correct: boolean;
  transcript: string;
};

export default function PronunciationCoach() {
  const params = useParams();
  const router = useRouter();
  const wordId = params?.wordId as string;

  const [word, setWord] = useState<VocabularyWord | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [result, setResult] = useState<PronunciationResult | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const foundWord = VOCABULARY_DATA.find((w) => w.id === wordId);

    if (!foundWord) {
      router.push("/vocabulary");
      return;
    }

    setWord(foundWord);
  }, [wordId, router]);

  const startRecording = async () => {
    setResult(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        await evaluateAudio(audioBlob);
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied or error:", err);
      alert("Microphone access is required for pronunciation practice.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const evaluateAudio = async (blob: Blob) => {
    if (!word) return;

    setIsEvaluating(true);

    const formData = new FormData();
    formData.append("audio", blob);
    formData.append("word", word.word);

    try {
      const res = await fetch("/api/speech/evaluate", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Evaluation failed");
      }

      const data: PronunciationResult = await res.json();
      setResult(data);

      if (data.correct && data.score >= 80) {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          await supabase.from("user_word_progress").upsert(
            {
              user_id: session.user.id,
              word_id: word.id,
              status: "learned",
              last_practiced_at: new Date().toISOString(),
            },
            { onConflict: "user_id,word_id" }
          );
        }
      }
    } catch (err) {
      console.error(err);
      alert(
        "Something went wrong while evaluating your pronunciation. Please try again."
      );
    } finally {
      setIsEvaluating(false);
    }
  };

  const playCorrectPronunciation = () => {
    if (!word) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word.word);
    utterance.lang = "en-US";
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  if (!word) return null;

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col bg-slate-50 p-6 pb-32 animate-in fade-in duration-500 dark:bg-slate-950">
      <header className="mb-12 flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="rounded-full"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        <h1 className="font-display text-xl font-bold text-slate-900 dark:text-white">
          Pronunciation Coach
        </h1>
      </header>

      <main className="flex w-full max-w-lg flex-1 place-content-center items-center self-center">
        <div className="w-full text-center">
          <div className="mb-12 text-center">
            <span className="mb-2 block text-sm font-bold uppercase tracking-widest text-slate-400">
              {word.difficulty} • target word
            </span>

            <h2 className="mb-4 font-display text-6xl font-black tracking-tight text-slate-900 dark:text-white">
              {word.word}
            </h2>

            <p className="text-xl font-medium italic text-slate-500 dark:text-slate-400">
              /{word.pronunciation}/
            </p>
          </div>

          {/* Coach Feedback Area */}
          <div className="mb-12 flex h-48 w-full flex-col items-center justify-center">
            {isEvaluating ? (
              <div className="flex animate-pulse flex-col items-center text-primary-500">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
                <p className="font-bold tracking-wide">
                  AI is analyzing your accent...
                </p>
              </div>
            ) : result ? (
              <Card
                className={`w-full border-2 p-6 text-center ${
                  result.correct
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20"
                    : "border-amber-500 bg-amber-50 dark:bg-amber-950/20"
                }`}
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {result.correct ? (
                      <Sparkles className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <RotateCcw className="h-5 w-5 text-amber-500" />
                    )}

                    <span
                      className={`text-2xl font-black ${
                        result.correct
                          ? "text-emerald-700 dark:text-emerald-400"
                          : "text-amber-700 dark:text-amber-400"
                      }`}
                    >
                      {result.score}/100
                    </span>
                  </div>

                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    AI Heard: "{result.transcript}"
                  </span>
                </div>

                <p className="font-medium leading-relaxed text-slate-700 dark:text-slate-300">
                  {result.feedback}
                </p>
              </Card>
            ) : (
              <div className="flex flex-col items-center gap-3 text-slate-400">
                <p className="max-w-sm text-center">
                  Tap the microphone and read the word clearly into your device.
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-6">
            <Button
              variant="outline"
              size="icon"
              className="h-16 w-16 rounded-full border-2 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
              onClick={playCorrectPronunciation}
              disabled={isRecording}
            >
              <Play className="ml-1 h-6 w-6" />
            </Button>

            <div className="relative">
              {isRecording && (
                <>
                  <div className="absolute inset-0 scale-150 animate-ping rounded-full bg-red-500 opacity-20"></div>
                  <div className="absolute inset-0 scale-125 animate-pulse rounded-full border-4 border-red-500/50"></div>
                </>
              )}

              <Button
                size="icon"
                className={`h-24 w-24 rounded-full shadow-2xl transition-all duration-300 ${
                  isRecording
                    ? "bg-red-500 shadow-red-500/50 hover:bg-red-600"
                    : "bg-primary-600 shadow-primary-600/40 hover:scale-105 hover:bg-primary-700"
                }`}
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isEvaluating}
              >
                {isRecording ? (
                  <Square className="h-8 w-8 fill-current" />
                ) : (
                  <Mic className="h-10 w-10" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}