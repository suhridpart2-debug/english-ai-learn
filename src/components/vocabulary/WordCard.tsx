"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Volume2, BookmarkPlus, BookmarkCheck, CheckCircle2, Languages, ListTree, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { VocabularyWord } from "@/lib/data/vocabularyData";
import { supabase } from "@/lib/supabaseClient";

interface WordCardProps {
  word: VocabularyWord;
  isSaved?: boolean;
  onSaveToggle?: (wordId: string, isNowSaved: boolean) => void;
  onMarkLearned?: (wordId: string) => void;
  onReviseLater?: (wordId: string) => void;
}

export function WordCard({ word, isSaved = false, onSaveToggle, onMarkLearned, onReviseLater }: WordCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [saved, setSaved] = useState(isSaved);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleSaveToggle = async () => {
    const newState = !saved;
    setSaved(newState);
    if (onSaveToggle) onSaveToggle(word.id, newState);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      if (newState) {
        await supabase.from('saved_words').insert({ user_id: session.user.id, word_id: word.id });
      } else {
        await supabase.from('saved_words').delete().match({ user_id: session.user.id, word_id: word.id });
      }
    } catch (e) {
      console.error("Save word error:", e);
    }
  };

  const playTTS = () => {
    if (!window.speechSynthesis) return;
    setIsPlaying(true);
    const utterance = new SpeechSynthesisUtterance(word.word);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    utterance.onend = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
  };

  const difficultyColors = {
    Beginner: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    Intermediate: "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    Advanced: "bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400 border-purple-200 dark:border-purple-800",
  };

  return (
    <Card className="overflow-hidden border-2 border-slate-100 dark:border-slate-800 shadow-sm relative group bg-white dark:bg-slate-900">
      <div className="absolute top-4 right-4 flex gap-2">
        <button 
          onClick={handleSaveToggle}
          className={`p-2 rounded-full transition-colors ${saved ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30' : 'bg-slate-50 text-slate-400 hover:bg-slate-100 dark:bg-slate-800'}`}
        >
          {saved ? <BookmarkCheck className="w-5 h-5 fill-current" /> : <BookmarkPlus className="w-5 h-5" />}
        </button>
      </div>

      <div className="p-6 md:p-8 flex flex-col items-center text-center">
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border mb-4 ${difficultyColors[word.difficulty]}`}>
          {word.difficulty}
        </span>
        
        <h2 className="text-4xl font-display font-black text-slate-900 dark:text-white mb-2">
          {word.word}
        </h2>
        
        <div className="flex items-center gap-2 text-slate-500 font-medium mb-6">
          <span>/{word.pronunciation}/</span>
          <button onClick={playTTS} className={`p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${isPlaying ? 'text-primary-500' : ''}`}>
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        <p className="text-lg text-slate-700 dark:text-slate-300 mb-6 font-medium max-w-sm">
          {word.meaning}
        </p>

        {!showDetails ? (
           <Button variant="outline" onClick={() => setShowDetails(true)} className="rounded-full w-full max-w-xs border-slate-200 dark:border-slate-700">
             Show Full Details
           </Button>
        ) : (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="w-full space-y-5 text-left pt-4 border-t border-slate-100 dark:border-slate-800 mt-2"
          >
            {/* Example Section */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
              <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                <Languages className="w-4 h-4 text-primary-500" /> English Usage
              </p>
              <p className="text-slate-600 dark:text-slate-300 italic">"{word.example}"</p>
              <p className="text-sm mt-3 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-3 rounded-lg shadow-sm border border-slate-100 dark:border-slate-800">
                <strong>💡 Tip:</strong> {word.simpleExplanation}
              </p>
            </div>

            {/* Hinglish Section */}
            <div className="bg-indigo-50 dark:bg-indigo-950/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/40">
              <p className="text-sm font-bold text-indigo-900 dark:text-indigo-400 mb-2">Hinglish Meaning</p>
              <p className="text-indigo-700 dark:text-indigo-300">{word.hinglishExplanation}</p>
            </div>

            {/* Synonyms/Antonyms */}
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <ListTree className="w-3 h-3" /> Synonyms
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {word.synonyms.map(s => (
                      <span key={s} className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-1 rounded-md">{s}</span>
                    ))}
                  </div>
               </div>
               {word.antonyms.length > 0 && (
                 <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Antonyms</p>
                    <div className="flex flex-wrap gap-1">
                      {word.antonyms.map(a => (
                        <span key={a} className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-1 rounded-md">{a}</span>
                      ))}
                    </div>
                 </div>
               )}
            </div>

            {/* Actions */}
            {(onMarkLearned || onReviseLater) && (
              <div className="flex justify-center gap-3 pt-6">
                {onReviseLater && (
                  <Button variant="outline" className="rounded-full px-6 border-orange-200 text-orange-600 hover:bg-orange-50 hover:text-orange-700" onClick={() => onReviseLater(word.id)}>
                    <RefreshCw className="w-4 h-4 mr-2" /> Needs Revise
                  </Button>
                )}
                {onMarkLearned && (
                  <Button className="rounded-full px-8 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30" onClick={() => onMarkLearned(word.id)}>
                    <CheckCircle2 className="w-4 h-4 mr-2" /> I Know This
                  </Button>
                )}
              </div>
            )}
           </motion.div>
        )}
      </div>
    </Card>
  );
}
