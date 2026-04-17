"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/**
 * PRODUCTION-GRADE VOICE ENGINE (HARDENED)
 * Fixes: InvalidStateError in SpeechRecognition.
 * Implements: Highly synchronized state guards to ensure .start() is never called redundantly.
 */
export function useVoiceEngine(onSpeechStart: () => void, onSilenceEnded: (transcript: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  
  const recognitionRef = useRef<any>(null);
  const isStartedRef = useRef(false); // <--- CRITICAL STATE GUARD
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startListening = useCallback(async () => {
    // 1. Guard against redundant start calls
    if (isStartedRef.current) {
        console.warn("[VoiceEngine] Recognition is already active. Ignoring start request.");
        return;
    }

    try {
      if (!recognitionRef.current) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) return;
        
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = 'en-US';

        // SYNC INTERNAL STATE WITH BROWSER EVENTS
        rec.onstart = () => {
          console.log("[VoiceEngine] System started listening.");
          isStartedRef.current = true;
          setIsListening(true);
        };

        rec.onend = () => {
          console.log("[VoiceEngine] System stopped listening.");
          isStartedRef.current = false;
          setIsListening(false);
        };

        rec.onerror = (event: any) => {
          console.error("[VoiceEngine] Recognition error:", event.error);
          if (event.error === 'no-speech') return; // Ignore silent timeouts
          isStartedRef.current = false;
          setIsListening(false);
        };

        rec.onresult = (event: any) => {
          let current = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            current += event.results[i][0].transcript;
          }
          setTranscript(current);

          // Barge-in trigger via STT interim results
          if (current.trim().length > 2) {
             onSpeechStart();
          }

          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
             if (current.trim().length > 5) {
                onSilenceEnded(current.trim());
             }
          }, 1800); 
        };

        recognitionRef.current = rec;
      }

      // DEFENSIVE START
      if (!isStartedRef.current) {
         recognitionRef.current.start();
      }

      // VAD Initialization
      if (!audioContextRef.current) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true } });
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
          const source = audioContextRef.current.createMediaStreamSource(stream);
          const analyser = audioContextRef.current.createAnalyser();
          analyser.fftSize = 256;
          source.connect(analyser);
          analyserRef.current = analyser;

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const monitorEnergy = () => {
            if (!analyserRef.current || !isStartedRef.current) return;
            analyserRef.current.getByteFrequencyData(dataArray);
            const energy = dataArray.reduce((a, b) => a + b) / dataArray.length;
            if (energy > 45) onSpeechStart();
            requestAnimationFrame(monitorEnergy);
          };
          monitorEnergy();
        } catch (e) { console.warn("VAD Energy Monitor failed to init:", e); }
      }

    } catch (err: any) {
      console.error("[VoiceEngine] Failed to start recognition:", err);
      // Clean up state if start fails
      isStartedRef.current = false;
      setIsListening(false);
    }
  }, [onSpeechStart, onSilenceEnded]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isStartedRef.current) {
      try { 
        recognitionRef.current.stop(); 
        // Note: we don't set isStartedRef.current = false here immediately.
        // We wait for the 'onend' event from the browser to ensure synchronization.
      } catch(e) { 
        console.error("[VoiceEngine] Failed to stop recognition:", e); 
      }
    }
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
  }, []);

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!window.speechSynthesis) return onEnd?.();
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => {
        console.log("[VoiceEngine] TTS finished.");
        onEnd?.();
    };
    utterance.onerror = () => onEnd?.();

    window.speechSynthesis.speak(utterance);
  }, []);

  const cancelSpeech = useCallback(() => {
    if (window.speechSynthesis.speaking) {
       window.speechSynthesis.cancel();
       return true;
    }
    return false;
  }, []);

  useEffect(() => {
    return () => {
      if (audioContextRef.current) audioContextRef.current.close().catch(() => {});
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (recognitionRef.current) {
          try { recognitionRef.current.stop(); } catch(e) {}
      }
    };
  }, []);

  return {
    startListening,
    stopListening,
    speak,
    cancelSpeech,
    isListening,
    transcript,
    setTranscript
  };
}
