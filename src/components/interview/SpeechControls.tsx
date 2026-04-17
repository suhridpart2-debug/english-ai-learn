"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Send, MessageSquare, Loader2, Volume2, Settings, Monitor, PhoneOff } from 'lucide-react';
import Link from 'next/link';

interface SpeechControlsProps {
  onResponse: (text: string) => void;
  isProcessing: boolean;
  disabled: boolean;
  interviewerState: 'SPEAKING' | 'LISTENING' | 'THINKING' | 'IDLE';
}

export const SpeechControls: React.FC<SpeechControlsProps> = ({ 
  onResponse, 
  isProcessing, 
  disabled,
  interviewerState 
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [recognition, setRecognition] = useState<any>(null);
  const [textInput, setTextInput] = useState("");

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';
      rec.onresult = (event: any) => {
        let current = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          current += event.results[i][0].transcript;
        }
        setTranscript(current);
        setTextInput(current);
      };
      rec.onerror = () => setIsRecording(false);
      setRecognition(rec);
    }
  }, []);

  useEffect(() => {
    if (interviewerState === 'LISTENING' && !disabled) {
       startListening();
    } else if (interviewerState !== 'LISTENING' && isRecording) {
       stopListening();
    }
  }, [interviewerState]);

  const startListening = () => {
    if (recognition && !isRecording && !disabled) {
      try {
        setTranscript("");
        recognition.start();
        setIsRecording(true);
      } catch (e) {}
    }
  };

  const stopListening = () => {
    if (recognition && isRecording) {
      recognition.stop();
      setIsRecording(false);
    }
  };

  const handleSubmit = () => {
    const final = textInput || transcript;
    if (final.trim().length > 2) {
      stopListening();
      onResponse(final.trim());
      setTranscript("");
      setTextInput("");
    }
  };

  return (
    <div className="bg-black/40 backdrop-blur-3xl px-8 py-5 rounded-[2.5rem] border border-white/5 shadow-2xl flex items-center gap-8 transition-all duration-500 animate-in slide-in-from-bottom-10">
      
      {/* 1. Meeting Utility Buttons (Left) */}
      <div className="flex items-center gap-4 border-r border-white/10 pr-8">
           <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-white/40 hover:text-white hover:bg-white/10">
                <Monitor className="w-5 h-5" />
           </Button>
           <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-white/40 hover:text-white hover:bg-white/10">
                <MessageSquare className="w-5 h-5" />
           </Button>
      </div>

      {/* 2. Main Input Engine (Center) */}
      <div className="flex-1 flex items-center gap-4 min-w-[300px]">
          <div className="relative flex-1">
              <input 
                type="text"
                value={textInput}
                disabled={disabled || isProcessing}
                onChange={(e) => { setTextInput(e.target.value); if (isRecording) stopListening(); }}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder={isRecording ? (transcript || "Voice capturing...") : "Respond via speech or text..."}
                className="w-full h-12 bg-white/5 border border-white/5 rounded-xl px-5 text-sm font-bold text-white placeholder:text-white/20 outline-none focus:ring-1 focus:ring-white/20 transition-all"
              />
              {!isRecording && !isProcessing && textInput.length > 0 && (
                <Button 
                  onClick={handleSubmit} size="icon" 
                  className="absolute right-1.5 top-1.5 h-9 w-9 rounded-lg bg-indigo-600 hover:bg-indigo-700"
                >
                  <Send className="w-4 h-4 text-white" />
                </Button>
              )}
          </div>

          <Button
            size="icon"
            className={`w-14 h-14 rounded-full shrink-0 shadow-2xl transition-all duration-500 ${
              isRecording 
                ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30' 
                : 'bg-white/10 hover:bg-white text-white hover:text-black'
            }`}
            onClick={isRecording ? handleSubmit : startListening}
            disabled={disabled || isProcessing}
          >
            {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : isRecording ? <Square className="w-6 h-6 fill-current" /> : <Mic className="w-6 h-6" />}
          </Button>
      </div>

      {/* 3. Session Controls (Right) */}
      <div className="flex items-center gap-4 border-l border-white/10 pl-8">
           <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-white/40 hover:text-white hover:bg-white/10">
                <Volume2 className="w-5 h-5" />
           </Button>
           <Link href="/practice/interview">
             <Button variant="destructive" size="icon" className="h-12 w-12 rounded-2xl bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/30">
                  <PhoneOff className="w-5 h-5" />
             </Button>
           </Link>
      </div>

    </div>
  );
};
