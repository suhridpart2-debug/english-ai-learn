"use client";

import { useParams, useRouter } from "next/navigation";
import { GRAMMAR_TOPICS } from "@/lib/data/grammarData";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Info, CheckCircle2, XCircle, Lightbulb, PenTool, BookOpen, Loader2, Lock, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import { isPremium } from "@/lib/services/subscriptionService";
import { PremiumPageGuard } from "@/components/usage/PremiumPageGuard";

export default function SpellingGrammarTopic() {
  const params = useParams();
  const router = useRouter();
  const rawSlug = params?.slug as string;
  const slug = rawSlug;

  const [premium, setPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkPremium() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        setPremium(isPremium(profile));
      }
      setLoading(false);
    }
    checkPremium();
  }, []);

  const topicData = GRAMMAR_TOPICS.find(t => t.slug === slug);
  const topicIndex = GRAMMAR_TOPICS.findIndex(t => t.slug === slug);
  const isPremiumTopic = topicIndex >= 2;

  const [activeQuizIndex, setActiveQuizIndex] = useState(-1); // -1 means no quiz active
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleUpgrade = () => {
    router.push('/billing');
  };

  if (loading) {
     return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>;
  }

  if (!topicData) {
    return <div className="p-10 text-center">Grammar Topic not found</div>;
  }

  const content = (
    <div className="p-6 max-w-4xl mx-auto space-y-8 pb-32 md:pb-6 animate-in fade-in duration-500">
      <header className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
        <Link href="/grammar">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ChevronLeft className="w-6 h-6" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-2 mb-1">
             <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full 
                      ${topicData.difficulty === 'Beginner' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                        topicData.difficulty === 'Intermediate' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 
                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                       {topicData.difficulty}
             </span>
             {isPremiumTopic && !premium && <Lock className="w-4 h-4 text-slate-400" />}
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-900 dark:text-white capitalize">
            {topicData.title}
          </h1>
        </div>
      </header>

      {/* Concept Section */}
      <section className="space-y-4">
        <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2 mb-3">
            <Info className="w-5 h-5" /> Core Concept
          </h2>
          <p className="text-slate-700 dark:text-slate-300 md:text-lg mb-4">{topicData.content.concept}</p>
          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm">
            <p className="text-slate-600 dark:text-slate-400 font-medium">{topicData.content.simpleEnglish}</p>
          </div>
        </div>
      </section>

      {/* Examples & Quizzes */}
      <section className="space-y-4">
        <h3 className="font-bold flex items-center gap-2 text-lg text-slate-900 dark:text-white">
          <BookOpen className="w-5 h-5 text-emerald-500" /> Lesson Preview
        </h3>
        <div className="grid gap-4 opacity-75 grayscale blur-[1px]">
          {topicData.content.correctExamples.slice(0, 1).map((ex, i) => (
            <Card key={i} className="p-4 border-slate-200 dark:border-slate-800">
               <p className="text-sm font-bold text-emerald-600 mb-1">Correct Case</p>
               <p className="text-slate-800 dark:text-slate-100 font-medium">{ex.correct}</p>
            </Card>
          ))}
        </div>
      </section>
      
      <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 text-center shadow-inner">
         <div className="w-14 h-14 rounded-full bg-slate-800 dark:bg-white text-white dark:text-slate-950 mx-auto flex items-center justify-center mb-5 shadow-xl">
            <Lock className="w-6 h-6" />
         </div>
         <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Quiz & Deep Analysis Locked</h3>
         <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-8 font-medium">Master this concept with interactive exercises and detailed explanations found in Premium Pro.</p>
         <button 
           onClick={handleUpgrade}
           className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium hover:opacity-90 transition shadow-xl shadow-indigo-500/25 flex items-center gap-2 mx-auto"
         >
           Upgrade Now
           <Sparkles className="w-4 h-4" />
         </button>
      </div>
    </div>
  );


  const fullContent = (
    <div className="p-6 max-w-4xl mx-auto space-y-8 pb-32 md:pb-6 animate-in fade-in duration-500">
      <header className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
        <Link href="/grammar">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ChevronLeft className="w-6 h-6" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-2 mb-1">
             <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full 
                      ${topicData.difficulty === 'Beginner' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                        topicData.difficulty === 'Intermediate' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 
                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                      {topicData.difficulty}
             </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-900 dark:text-white capitalize">
            {topicData.title}
          </h1>
        </div>
      </header>

      {/* Concept Section */}
      <section className="space-y-4">
        <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2 mb-3">
            <Info className="w-5 h-5" /> Core Concept
          </h2>
          <p className="text-slate-700 dark:text-slate-300 md:text-lg mb-4">{topicData.content.concept}</p>
          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm">
            <p className="text-slate-600 dark:text-slate-400 font-medium">{topicData.content.simpleEnglish}</p>
          </div>
        </div>

        {/* Hinglish Explanation */}
        <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl p-6">
           <h2 className="text-sm font-bold text-indigo-800 dark:text-indigo-400 uppercase tracking-widest mb-3">
            Local Translation
          </h2>
          <p className="text-indigo-900 dark:text-indigo-200 font-medium italic">"{topicData.content.hinglish}"</p>
        </div>
      </section>

      {/* Quick Tips & Common Mistakes */}
      <div className="grid md:grid-cols-2 gap-6">
        <section className="space-y-4">
           <h3 className="font-bold flex items-center gap-2 text-amber-600 dark:text-amber-400 text-lg">
             <Lightbulb className="w-5 h-5" /> Quick Tips
           </h3>
           <ul className="space-y-3">
             {topicData.content.quickTips.map((tip, i) => (
                <li key={i} className="flex gap-3 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                  <div className="mt-1 flex-shrink-0 w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-sm">{tip}</span>
                </li>
             ))}
           </ul>
        </section>
        
        <section className="space-y-4">
           <h3 className="font-bold flex items-center gap-2 text-red-500 dark:text-red-400 text-lg">
             <XCircle className="w-5 h-5" /> Common Mistakes
           </h3>
           <ul className="space-y-3">
             {topicData.content.commonMistakes.map((mistake, i) => (
                <li key={i} className="flex gap-3 text-slate-700 dark:text-slate-300 bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-100 dark:border-red-900/20">
                  <span className="text-sm">{mistake}</span>
                </li>
             ))}
           </ul>
        </section>
      </div>

      {/* Examples Grid */}
      <section className="space-y-4">
        <h3 className="font-bold flex items-center gap-2 text-lg">
          <BookOpen className="w-5 h-5 text-emerald-500" /> Examples
        </h3>
        <div className="grid gap-4">
          {topicData.content.correctExamples.map((ex, i) => (
            <Card key={i} className="p-0 overflow-hidden border-slate-200 dark:border-slate-800">
              <div className="grid md:grid-cols-2">
                <div className="bg-red-50 dark:bg-red-900/5 p-4 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800">
                  <div className="text-xs font-bold text-red-500 uppercase flex items-center gap-1 mb-2">
                    <XCircle className="w-3 h-3" /> Incorrect
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 line-through decoration-red-300">{ex.incorrect}</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/5 p-4 relative">
                  <div className="text-xs font-bold text-green-600 uppercase flex items-center gap-1 mb-2">
                    <CheckCircle2 className="w-3 h-3" /> Correct
                  </div>
                  <p className="text-slate-800 dark:text-slate-200 font-medium mb-3">{ex.correct}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 p-2 rounded-md border border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">Why?</span> {ex.reason}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Practice Quizzes Section */}
      <section className="pt-8 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold font-display flex items-center gap-2 text-slate-900 dark:text-white">
              <PenTool className="w-6 h-6 text-primary-500" /> Practice Now
            </h2>
            <p className="text-slate-500 text-sm mt-1">Test your understanding with these questions.</p>
          </div>
          <span className="bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 px-3 py-1 rounded-full text-sm font-bold">
            {topicData.quizzes.length} Questions
          </span>
        </div>

        {activeQuizIndex === -1 ? (
          <Button 
            className="w-full text-lg py-8 rounded-2xl font-bold shadow-lg shadow-primary-500/20"
            onClick={() => setActiveQuizIndex(0)}>
            Start Practice Quiz
          </Button>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
             <div className="flex justify-between items-center mb-6">
                <span className="text-sm font-medium text-slate-500">Question {activeQuizIndex + 1} of {topicData.quizzes.length}</span>
             </div>
             
             <div className="space-y-6">
                <h3 className="text-xl font-medium">{topicData.quizzes[activeQuizIndex].question}</h3>
                
                <div className="space-y-3">
                  {topicData.quizzes[activeQuizIndex].options?.map((opt, i) => {
                    const isCorrectOption = opt === topicData.quizzes[activeQuizIndex].correctAnswer;
                    const isSelectedAndWrong = selectedAnswer === opt && !isCorrectOption;
                    const isSelectedAndCorrect = selectedAnswer === opt && isCorrectOption;
                    
                    let buttonClass = "w-full text-left p-4 rounded-xl border transition-all font-medium ";
                    if (!selectedAnswer) {
                      buttonClass += "border-slate-200 dark:border-slate-800 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20";
                    } else if (isCorrectOption) {
                      buttonClass += "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300";
                    } else if (isSelectedAndWrong) {
                      buttonClass += "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300";
                    } else {
                      buttonClass += "border-slate-200 dark:border-slate-800 opacity-50";
                    }

                    return (
                      <button 
                        key={i} 
                        className={buttonClass}
                        disabled={selectedAnswer !== null}
                        onClick={() => {
                          setSelectedAnswer(opt);
                          setShowExplanation(true);
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <span>{opt}</span>
                          {selectedAnswer && isCorrectOption && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                          {selectedAnswer && isSelectedAndWrong && <XCircle className="w-5 h-5 text-red-500" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {showExplanation && (
                  <div className="mt-6 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl p-5 animate-in fade-in slide-in-from-bottom-2">
                    <h4 className="font-bold text-blue-800 dark:text-blue-300 flex items-center gap-2 mb-2">
                      <Lightbulb className="w-4 h-4" /> Why is this correct?
                    </h4>
                    <p className="text-blue-900 dark:text-blue-200 text-sm mb-3">{topicData.quizzes[activeQuizIndex].explanation}</p>
                    <div className="bg-white dark:bg-slate-900 rounded-lg p-3">
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Local Meaning</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 italic">"{topicData.quizzes[activeQuizIndex].hinglishExplanation}"</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 justify-end mt-8">
                   {activeQuizIndex > 0 && (
                      <Button variant="outline" onClick={() => {
                        setActiveQuizIndex(prev => prev - 1);
                        setSelectedAnswer(null);
                        setShowExplanation(false);
                      }}>Previous</Button>
                   )}
                   {activeQuizIndex < topicData.quizzes.length - 1 ? (
                      <Button 
                        onClick={() => {
                          setActiveQuizIndex(prev => prev + 1);
                          setSelectedAnswer(null);
                          setShowExplanation(false);
                        }}
                        disabled={!selectedAnswer}
                      >
                        Next Question
                      </Button>
                   ) : (
                      <Button variant="default" onClick={() => {
                        setActiveQuizIndex(-1);
                        setSelectedAnswer(null);
                        setShowExplanation(false);
                      }}>Finish Practice</Button>
                   )}
                </div>
             </div>
          </div>
        )}
      </section>
    </div>
  );

  if (isPremiumTopic && !premium) {
    return content; // Actually content here is the restricted preview
  }

  if (isPremiumTopic && premium) {
    return (
      <PremiumPageGuard title="Pro Grammar Module" description="Deep concepts, practice quizzes, and common mistake analyses are reserved for Pro members.">
        {fullContent}
      </PremiumPageGuard>
    );
  }

  return fullContent;
}
