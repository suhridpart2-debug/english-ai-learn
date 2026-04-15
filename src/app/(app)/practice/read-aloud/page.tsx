"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, Square, RotateCcw, Play, CheckCircle2, AlertCircle, Loader2, Volume2, Sparkles, History, ChevronRight, Turtle, CheckCircle, XCircle } from "lucide-react";
import { READ_ALOUD_PASSAGES, ReadAloudPassage } from "@/lib/data/readAloudData";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

// --- TYPES ---
interface Mistake {
  word: string;
  type: "missing" | "wrong" | "weak";
  expected: string;
  spoken: string;
}

interface Result {
  score: number;
  transcript: string;
  mistakes: Mistake[];
  aiFeedback: {
    good: string;
    improvement: string;
  };
}

export default function ReadAloudPage() {
  const [selectedPassage, setSelectedPassage] = useState<ReadAloudPassage | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSlowMode, setIsSlowMode] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const supabase = createClient();

  // --- TTS Helper ---
  const speak = (text: string, rate = 0.85) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setError("Text-to-speech is not supported in this browser.");
      return;
    }
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = rate;
    
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    // Cleanup speech on unmount
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
         window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = "en-US";

        recognitionRef.current.onresult = (event: any) => {
          let currentTranscript = "";
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setError("Microphone error: " + event.error);
          setIsRecording(false);
        };
      } else {
        setError("Your browser does not support Speech Recognition. Please try Chrome or Edge.");
      }
    }
  }, []);

  const startRecording = () => {
    setTranscript("");
    setResult(null);
    setError(null);
    setIsRecording(true);
    recognitionRef.current?.start();
  };

  const stopRecording = () => {
    setIsRecording(false);
    recognitionRef.current?.stop();
    analyzePronunciation();
  };

  const analyzePronunciation = async () => {
    if (!selectedPassage || !transcript) return;
    setIsAnalyzing(true);

    try {
      // 1. Logic for word-level comparison
      const expectedWords = selectedPassage.content.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").split(" ");
      const spokenWords = transcript.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").split(" ");
      
      const mistakes: Mistake[] = [];
      let matchCount = 0;

      expectedWords.forEach((word, idx) => {
        const spoken = spokenWords[idx] || "";
        if (spoken === word) {
          matchCount++;
        } else if (!spoken) {
          mistakes.push({ word, type: "missing", expected: word, spoken: "" });
        } else {
          mistakes.push({ word, type: "wrong", expected: word, spoken: spoken });
        }
      });

      const score = Math.round((matchCount / expectedWords.length) * 100);

      // 2. Fetch AI Feedback
      const feedbackRes = await fetch("/api/feedback/pronunciation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passage: selectedPassage.content,
          transcript: transcript,
          mistakes: mistakes.slice(0, 5) // Send only first few mistakes to AI
        })
      });
      const feedbackData = await feedbackRes.json();

      const finalResult: Result = {
        score,
        transcript,
        mistakes,
        aiFeedback: feedbackData
      };

      setResult(finalResult);

      // 3. Save to Supabase (Analysis only)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('read_aloud_sessions').insert({
          user_id: user.id,
          passage_id: selectedPassage.id,
          recognized_text: transcript,
          score_accuracy: score,
          mistakes: mistakes,
          ai_feedback: JSON.stringify(feedbackData)
        });

        // Also track weak words
        if (mistakes.length > 0) {
          const weakWordsEntries = mistakes.map(m => ({
             user_id: user.id,
             word: m.expected,
             mistake_count: 1
          }));
          await supabase.from('weak_pronunciation_words').upsert(weakWordsEntries, { onConflict: 'user_id,word' });
        }
      }
    } catch (err) {
      console.error("Analysis failed:", err);
      setError("Failed to analyze pronunciation. Try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRetry = () => {
    setResult(null);
    setTranscript("");
    startRecording();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 pb-32">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-1">
            Pronunciation Coach
          </h1>
          <p className="text-slate-500">Read aloud to improve your clarity and fluency.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="rounded-full">
              <History className="w-4 h-4 mr-2" /> History
           </Button>
        </div>
      </header>

      {!selectedPassage ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {READ_ALOUD_PASSAGES.map((p) => (
            <Card 
              key={p.id} 
              className="p-6 hover:border-primary-500 transition-all cursor-pointer group flex flex-col justify-between"
              onClick={() => setSelectedPassage(p)}
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${
                    p.difficulty === 'Beginner' ? 'bg-emerald-100 text-emerald-600' : 
                    p.difficulty === 'Intermediate' ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'
                  }`}>
                    {p.difficulty}
                  </span>
                  <Volume2 className="w-4 h-4 text-slate-300 group-hover:text-primary-500 transition-colors" />
                </div>
                <h3 className="font-bold text-lg mb-2">{p.title}</h3>
                <p className="text-sm text-slate-500 line-clamp-2 italic">"{p.content}"</p>
              </div>
              <Button variant="ghost" className="mt-6 w-full group-hover:bg-primary-50 group-hover:text-primary-600 rounded-xl justify-between">
                 Start Practice <ChevronRight className="w-4 h-4" />
              </Button>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <Button 
            variant="ghost" 
            onClick={() => { setSelectedPassage(null); setResult(null); setTranscript(""); }}
            className="text-slate-500 mb-2"
          >
            ← Back to Passages
          </Button>

          <Card className="p-8 relative overflow-hidden">
            {/* Design accents */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl" />
            
            <div className="relative z-10 space-y-6">
               <div className="flex items-center gap-3 mb-2">
                  <span className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center font-bold">1</span>
                  <h2 className="text-xl font-bold font-display">Read this passage:</h2>
               </div>
               
               <p className="text-2xl md:text-3xl font-display leading-relaxed text-slate-700 dark:text-slate-300">
                  {selectedPassage.content.split(" ").map((word, i) => {
                    const cleanWord = word.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").toLowerCase();
                    const spokenWords = result?.transcript.toLowerCase().split(" ") || [];
                    const isMistake = result?.mistakes.some(m => m.expected === cleanWord);
                    
                    return (
                      <span 
                        key={i} 
                        onClick={() => speak(cleanWord, isSlowMode ? 0.6 : 0.85)}
                        className={`cursor-pointer transition-colors hover:text-primary-500 ${isMistake ? "text-red-500 underline decoration-red-300 decoration-2 underline-offset-4" : ""}`}
                        title="Tap to hear"
                      >
                        {word}{" "}
                      </span>
                    );
                  })}
               </p>

               {/* Full Sentence Audio Controls */}
               <div className="flex gap-4 pt-4">
                  <Button 
                    variant="secondary" 
                    className="font-bold rounded-xl"
                    onClick={() => speak(selectedPassage.content, isSlowMode ? 0.6 : 0.9)}
                    disabled={isPlaying}
                  >
                    <Volume2 className="w-4 h-4 mr-2" /> Listen to Model
                  </Button>
                  <Button 
                    variant={isSlowMode ? "default" : "outline"} 
                    className="font-bold rounded-xl"
                    onClick={() => setIsSlowMode(!isSlowMode)}
                  >
                    <Turtle className="w-4 h-4 mr-2" /> Slow Mode
                  </Button>
               </div>

               <div className="pt-8 flex flex-col items-center gap-4">
                  {error && (
                    <div className="flex items-center gap-2 text-red-500 bg-red-50 px-4 py-2 rounded-lg text-sm border border-red-100">
                       <AlertCircle className="w-4 h-4" /> {error}
                    </div>
                  )}

                  {!result && (
                    <div className="flex flex-col items-center gap-6">
                      <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 shadow-lg shadow-red-500/30 scale-110 animate-pulse' : 'bg-primary-600'}`}>
                        <Button 
                          onClick={isRecording ? stopRecording : startRecording}
                          size="lg"
                          className="w-full h-full rounded-full bg-transparent hover:bg-transparent border-none"
                        >
                          {isRecording ? <Square className="w-8 h-8 fill-current" /> : <Mic className="w-8 h-8" />}
                        </Button>
                      </div>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {isRecording ? "Listening... Click to stop" : "Click the mic to start reading"}
                      </p>
                      {transcript && (
                        <Card className="p-4 bg-slate-50 dark:bg-slate-900 border-dashed border-slate-300 max-w-md w-full">
                           <p className="text-sm text-slate-500 italic">"{transcript}"</p>
                        </Card>
                      )}
                    </div>
                  )}
               </div>
            </div>
          </Card>

          <AnimatePresence>
            {isAnalyzing && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center p-12"
              >
                <div className="text-center space-y-4">
                  <div className="relative">
                    <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto" />
                    <Sparkles className="w-6 h-6 text-amber-500 absolute -top-2 -right-2 animate-bounce" />
                  </div>
                  <p className="font-bold text-lg text-slate-700 dark:text-slate-300">AI is analyzing your pronunciation...</p>
                  
                  {/* Skeleton for Feedback */}
                  <div className="mt-8 space-y-4 max-w-md mx-auto opacity-50">
                     <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-3/4 mx-auto" />
                     <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-full mx-auto" />
                     <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-5/6 mx-auto" />
                  </div>
                </div>
              </motion.div>
            )}

            {result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Score Card */}
                  <Card className="p-6 bg-gradient-to-br from-primary-600 to-indigo-700 text-white border-none shadow-xl">
                    <div className="flex flex-col items-center justify-center py-4">
                       <div className="relative w-24 h-24 mb-4">
                          <svg className="w-full h-full" viewBox="0 0 36 36">
                            <path className="text-white/20" stroke="currentColor" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <path className="text-white" stroke="currentColor" strokeLinecap="round" strokeWidth="3" fill="none" strokeDasharray={`${result.score}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center font-bold text-2xl">
                            {result.score}%
                          </div>
                       </div>
                       <p className="font-bold uppercase tracking-wider text-primary-100 text-xs text-center">Accuracy Score</p>
                    </div>
                  </Card>

                  {/* AI Feedback Card */}
                  <Card className="md:col-span-2 p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800/50">
                       <Sparkles className="w-5 h-5 text-indigo-500" />
                       <h3 className="font-bold text-slate-900 dark:text-white">AI Coaching Feedback</h3>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Good Component */}
                      <div className="flex gap-3 items-start">
                         <div className="mt-0.5"><CheckCircle className="w-5 h-5 text-emerald-500" /></div>
                         <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-slate-200">What you did well</p>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm mt-1">{result.aiFeedback.good}</p>
                         </div>
                      </div>

                      {/* Improvement Component */}
                      <div className="flex gap-3 items-start">
                         <div className="mt-0.5"><XCircle className="w-5 h-5 text-rose-500" /></div>
                         <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-slate-200">Needs improvement</p>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm mt-1">{result.aiFeedback.improvement}</p>
                         </div>
                      </div>
                    </div>

                    {result.mistakes.length > 0 && (
                      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/50">
                         <p className="text-sm font-bold text-slate-900 dark:text-slate-300 mb-3">Target Focus Words:</p>
                         <p className="text-xs text-slate-500 dark:text-slate-500 mb-3 block">Tap a word to hear correct pronunciation</p>
                         <div className="flex flex-wrap gap-2">
                            {result.mistakes.slice(0, 5).map((m, i) => (
                              <button 
                                key={i}
                                onClick={() => speak(m.expected, isSlowMode ? 0.6 : 0.85)}
                                className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                title="Tap to hear"
                              >
                                {m.expected}
                                <Volume2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500" />
                              </button>
                            ))}
                         </div>
                      </div>
                    )}
                  </Card>
                </div>

                <div className="flex gap-4">
                  <Button onClick={handleRetry} variant="outline" className="flex-1 h-12 rounded-xl text-md font-bold">
                    <RotateCcw className="w-4 h-4 mr-2" /> One more try
                  </Button>
                  <Button onClick={() => setSelectedPassage(null)} className="flex-1 h-12 rounded-xl text-md font-bold">
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Finish Module
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
