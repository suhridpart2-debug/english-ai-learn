export type Difficulty = "Beginner" | "Intermediate" | "Advanced";
export type TopicSlug = "daily-life" | "interview" | "travel" | "technology" | "office" | "academic" | "conversation" | "presentation";

export interface VocabularyWord {
  id: string;
  word: string;
  meaning: string;
  simpleExplanation: string;
  hinglishExplanation: string;
  example: string;
  pronunciation: string;
  synonyms: string[];
  antonyms: string[];
  difficulty: Difficulty;
  topic: TopicSlug;
}

export const VOCABULARY_TOPICS = [
  { slug: "daily-life", name: "Daily Life", icon: "Coffee", description: "Words for everyday conversations." },
  { slug: "interview", name: "Job Interview", icon: "Briefcase", description: "Professional vocabulary for jobs." },
  { slug: "travel", name: "Travel", icon: "Plane", description: "Words to help you get around." },
  { slug: "technology", name: "Technology", icon: "Cpu", description: "Tech and digital terminology." },
  { slug: "office", name: "Office", icon: "Building", description: "Workplace communication terms." },
  { slug: "academic", name: "Academic", icon: "BookOpen", description: "Words for studying & research." },
  { slug: "conversation", name: "Conversation", icon: "MessageCircle", description: "Phrases for natural spoken English." },
  { slug: "presentation", name: "Presentation", icon: "PresentationChart", description: "Words to impress in meetings & talks." },
] as const;

export const VOCABULARY_DATA: VocabularyWord[] = [
  // ── INTERVIEW ──────────────────────────────────────────────────────
  { id: "v_1", word: "Proactive", meaning: "Creating or controlling a situation rather than just responding to it.", simpleExplanation: "Taking action before problems happen.", hinglishExplanation: "Pehle se aage badhkar action lena, problem ka intezaar nahi karna.", example: "A proactive employee solves problems before they become big issues.", pronunciation: "pro-AK-tiv", synonyms: ["Enterprising", "Driven", "Energetic"], antonyms: ["Reactive", "Passive"], difficulty: "Intermediate", topic: "interview" },
  { id: "v_2", word: "Collaborate", meaning: "Work jointly on an activity or project.", simpleExplanation: "Working together with others as a team.", hinglishExplanation: "Dusron ke saath mil kar kaam karna.", example: "Our teams will collaborate on the new project.", pronunciation: "kuh-LAB-uh-rayt", synonyms: ["Cooperate", "Unite", "Team up"], antonyms: ["Compete", "Work alone"], difficulty: "Beginner", topic: "interview" },
  { id: "v_3", word: "Meticulous", meaning: "Showing great attention to detail; very careful and precise.", simpleExplanation: "Being very careful about small details.", hinglishExplanation: "Bahut dhyan se aur baariqiyon par focus karke kaam karna.", example: "He is always meticulous about his bug reports.", pronunciation: "muh-TIK-yuh-lus", synonyms: ["Careful", "Diligent", "Detailed"], antonyms: ["Careless", "Sloppy"], difficulty: "Advanced", topic: "interview" },
  { id: "v_4", word: "Initiative", meaning: "The ability to assess and take action independently.", simpleExplanation: "Starting things yourself without waiting to be told.", hinglishExplanation: "Khud se kaam shuru karna, kisi ke kehne ka intezaar na karna.", example: "She took the initiative to train the new team members.", pronunciation: "ih-NISH-ee-uh-tiv", synonyms: ["Drive", "Ambition", "Leadership"], antonyms: ["Passivity", "Lethargy"], difficulty: "Intermediate", topic: "interview" },
  { id: "v_5", word: "Leverage", meaning: "Use something to maximum advantage.", simpleExplanation: "Using a tool or skill to get the best result.", hinglishExplanation: "Kisi cheez ka faayda uthaana apni taraf se.", example: "We can leverage our existing customer base for growth.", pronunciation: "LEV-er-ij", synonyms: ["Utilise", "Exploit", "Harness"], antonyms: ["Ignore", "Waste"], difficulty: "Advanced", topic: "interview" },
  { id: "v_6", word: "Articulate", meaning: "Having or showing the ability to speak fluently and coherently.", simpleExplanation: "Speaking clearly and expressing ideas well.", hinglishExplanation: "Saaf taur par aur sundar tarike se baat karna.", example: "An articulate speaker can explain complex topics simply.", pronunciation: "ahr-TIK-yuh-lit", synonyms: ["Eloquent", "Fluent", "Clear"], antonyms: ["Inarticulate", "Mumbling"], difficulty: "Advanced", topic: "interview" },
  { id: "v_7", word: "Adaptable", meaning: "Able to adjust to new conditions.", simpleExplanation: "Easily changing to fit new situations.", hinglishExplanation: "Nayi situations mein khud ko jaldi fit kar lena.", example: "Being adaptable is essential in a fast-changing workplace.", pronunciation: "uh-DAP-tuh-bul", synonyms: ["Flexible", "Versatile", "Resilient"], antonyms: ["Rigid", "Inflexible"], difficulty: "Intermediate", topic: "interview" },

  // ── DAILY LIFE ─────────────────────────────────────────────────────
  { id: "v_10", word: "Exhausted", meaning: "Drained of one's physical or mental resources; very tired.", simpleExplanation: "Feeling extremely tired with no energy left.", hinglishExplanation: "Bahut zyada thak jana, jaise bilkul energy na bachi ho.", example: "After working for 10 hours straight, I felt completely exhausted.", pronunciation: "ig-ZAW-stid", synonyms: ["Tired", "Drained", "Fatigued"], antonyms: ["Energetic", "Refreshed"], difficulty: "Beginner", topic: "daily-life" },
  { id: "v_11", word: "Brief", meaning: "Of short duration.", simpleExplanation: "Something that is very short and quick.", hinglishExplanation: "Kuch chhota ya jaldi khatam hone wala.", example: "Let's have a brief meeting before lunch.", pronunciation: "breef", synonyms: ["Short", "Quick", "Concise"], antonyms: ["Long", "Lengthy"], difficulty: "Beginner", topic: "daily-life" },
  { id: "v_12", word: "Accomplish", meaning: "Achieve or complete successfully.", simpleExplanation: "Finishing something you set out to do.", hinglishExplanation: "Koi kaam ya lakshya poora karna.", example: "She accomplished her goal of running 5km without stopping.", pronunciation: "uh-KOM-plish", synonyms: ["Achieve", "Complete", "Fulfill"], antonyms: ["Fail", "Abandon"], difficulty: "Beginner", topic: "daily-life" },
  { id: "v_13", word: "Persistent", meaning: "Continuing firmly in spite of difficulty.", simpleExplanation: "Keep trying even when things are hard.", hinglishExplanation: "Mushkilon ke baawajood koshish karte rehna.", example: "A persistent student practices every single day.", pronunciation: "per-SIS-tent", synonyms: ["Determined", "Consistent", "Stubborn"], antonyms: ["Giving up", "Inconsistent"], difficulty: "Intermediate", topic: "daily-life" },
  { id: "v_14", word: "Overwhelmed", meaning: "Completely overcome with a feeling or situation.", simpleExplanation: "Feeling like you have too much to handle.", hinglishExplanation: "Jab itna kaam ho ki samajh na aaye kahan se shuru karein.", example: "She felt overwhelmed by the number of tasks on her list.", pronunciation: "oh-ver-WELMD", synonyms: ["Swamped", "Inundated", "Buried"], antonyms: ["Calm", "Unburdened"], difficulty: "Intermediate", topic: "daily-life" },
  { id: "v_15", word: "Grateful", meaning: "Feeling or showing thankfulness.", simpleExplanation: "Being thankful for what you have.", hinglishExplanation: "Kisi ke liye shukriya mahsoos karna.", example: "I am grateful for the opportunity you gave me.", pronunciation: "GRAYT-ful", synonyms: ["Thankful", "Appreciative", "Obliged"], antonyms: ["Ungrateful", "Unappreciative"], difficulty: "Beginner", topic: "daily-life" },

  // ── OFFICE ─────────────────────────────────────────────────────────
  { id: "v_20", word: "Agenda", meaning: "A list of items to be discussed at a formal meeting.", simpleExplanation: "A list of things to discuss during a meeting.", hinglishExplanation: "Meeting mein jin topics par baat hogi, uski list.", example: "What is the agenda for today's team call?", pronunciation: "uh-JEN-duh", synonyms: ["Schedule", "Plan", "Program"], antonyms: [], difficulty: "Beginner", topic: "office" },
  { id: "v_21", word: "Deadline", meaning: "The latest time by which something should be completed.", simpleExplanation: "The final time when a task must be finished.", hinglishExplanation: "Wo aakhiri waqt jab tak kaam poora hona zaroori hai.", example: "We need to finish this report before Friday's deadline.", pronunciation: "DED-line", synonyms: ["Cutoff point", "Target date", "Time limit"], antonyms: ["Start date"], difficulty: "Beginner", topic: "office" },
  { id: "v_22", word: "Delegate", meaning: "Give a task or responsibility to someone else.", simpleExplanation: "Assigning your work to others in the team.", hinglishExplanation: "Apna kaam doosron ko dena taki sab smoothly ho sake.", example: "A good manager knows when to delegate tasks.", pronunciation: "DEL-ih-gayt", synonyms: ["Assign", "Entrust", "Hand off"], antonyms: ["Micromanage", "Hoard"], difficulty: "Intermediate", topic: "office" },
  { id: "v_23", word: "Escalate", meaning: "Increase in intensity or pass to a higher level.", simpleExplanation: "Making something more urgent or bigger.", hinglishExplanation: "Kisi issue ko upar ke level tak le jaana.", example: "If the bug isn't fixed, please escalate it to the team lead.", pronunciation: "ES-kuh-layt", synonyms: ["Intensify", "Raise", "Elevate"], antonyms: ["Resolve", "Downgrade"], difficulty: "Intermediate", topic: "office" },
  { id: "v_24", word: "Synergy", meaning: "Cooperation of two or more elements to produce a combined effect greater than the sum.", simpleExplanation: "When teamwork creates results better than working alone.", hinglishExplanation: "Jab sab mil ke kaam karein aur result zyada acha aaye.", example: "The partnership created real synergy between the two teams.", pronunciation: "SIN-er-jee", synonyms: ["Cooperation", "Collaboration", "Harmony"], antonyms: ["Discord", "Conflict"], difficulty: "Advanced", topic: "office" },

  // ── TECHNOLOGY ─────────────────────────────────────────────────────
  { id: "v_30", word: "Iterate", meaning: "Repeat a process to improve a result.", simpleExplanation: "Doing something again and again to make it better.", hinglishExplanation: "Kisi kaam ko baar baar karna jab tak result achha na ho.", example: "Great software is built through iterating on user feedback.", pronunciation: "IT-er-ayt", synonyms: ["Repeat", "Refine", "Revise"], antonyms: ["Complete", "Finalize"], difficulty: "Intermediate", topic: "technology" },
  { id: "v_31", word: "Deploy", meaning: "Release or install a software application for use.", simpleExplanation: "Sending your code live so users can access it.", hinglishExplanation: "Apna code ya app release karna taki log use kar sakein.", example: "We will deploy the new update tonight.", pronunciation: "dih-PLOY", synonyms: ["Release", "Launch", "Ship"], antonyms: ["Rollback", "Revert"], difficulty: "Intermediate", topic: "technology" },
  { id: "v_32", word: "Scalable", meaning: "Able to be changed in size or scale to meet demand.", simpleExplanation: "Your system can grow when more users join.", hinglishExplanation: "Jab system bade ho sake bina toot ke jab zyada log use karein.", example: "We need to build a scalable architecture from day one.", pronunciation: "SKAY-luh-bul", synonyms: ["Flexible", "Extensible", "Adaptable"], antonyms: ["Rigid", "Limited"], difficulty: "Advanced", topic: "technology" },
  { id: "v_33", word: "Latency", meaning: "The delay before a transfer of data begins.", simpleExplanation: "The time it takes for data to travel from one place to another.", hinglishExplanation: "Data ek jagah se doosri jagah jaane mein jo time lagta hai.", example: "Reducing latency improves the user experience significantly.", pronunciation: "LAY-ten-see", synonyms: ["Lag", "Delay", "Response time"], antonyms: ["Speed", "Throughput"], difficulty: "Advanced", topic: "technology" },

  // ── TRAVEL ─────────────────────────────────────────────────────────
  { id: "v_40", word: "Itinerary", meaning: "A planned route or journey.", simpleExplanation: "Your travel schedule or plan.", hinglishExplanation: "Safar ke liye ek plan jo batata hai kab kahan jaana hai.", example: "Let me check our itinerary to see our next destination.", pronunciation: "eye-TIN-er-er-ee", synonyms: ["Schedule", "Route", "Plan"], antonyms: [], difficulty: "Intermediate", topic: "travel" },
  { id: "v_41", word: "Layover", meaning: "A period of rest between two parts of a journey.", simpleExplanation: "Waiting time at a connecting airport.", hinglishExplanation: "Jab ek flight change karne ke liye airport par ruk jaate hain.", example: "We have a three-hour layover in Dubai.", pronunciation: "LAY-oh-ver", synonyms: ["Stopover", "Connection", "Break"], antonyms: ["Direct flight"], difficulty: "Beginner", topic: "travel" },
  { id: "v_42", word: "Excursion", meaning: "A short journey or trip.", simpleExplanation: "A small fun trip from your main location.", hinglishExplanation: "Main jagah se thodi door ki ek chhoti si trip.", example: "We booked a day excursion to the nearby village.", pronunciation: "ex-KUR-zhun", synonyms: ["Trip", "Outing", "Jaunt"], antonyms: ["Stay"], difficulty: "Beginner", topic: "travel" },

  // ── ACADEMIC ───────────────────────────────────────────────────────
  { id: "v_50", word: "Hypothesis", meaning: "A proposed explanation to be tested.", simpleExplanation: "Your educated guess which you then test.", hinglishExplanation: "Ek aandaz jo aap test karke sahi ya galat prove karte hain.", example: "The scientist formed a hypothesis before running her experiments.", pronunciation: "hye-POTH-uh-sis", synonyms: ["Theory", "Postulate", "Assumption"], antonyms: ["Proof", "Fact"], difficulty: "Advanced", topic: "academic" },
  { id: "v_51", word: "Empirical", meaning: "Based on observation and experience rather than theory.", simpleExplanation: "Evidence gathered by actually testing, not just guessing.", hinglishExplanation: "Jo proof actually dekh ke ya karke milta ho, sirf theory nahi.", example: "We need empirical evidence before drawing conclusions.", pronunciation: "em-PIR-ih-kul", synonyms: ["Experimental", "Observed", "Practical"], antonyms: ["Theoretical", "Speculative"], difficulty: "Advanced", topic: "academic" },
  { id: "v_52", word: "Coherent", meaning: "Logical and consistent.", simpleExplanation: "When ideas fit well together and make sense.", hinglishExplanation: "Jab saari baatein logical order mein hon aur sense banayein.", example: "Please make sure your essay is coherent and easy to follow.", pronunciation: "koh-HEER-ent", synonyms: ["Logical", "Consistent", "Clear"], antonyms: ["Inconsistent", "Jumbled"], difficulty: "Intermediate", topic: "academic" },
  { id: "v_53", word: "Concise", meaning: "Giving a lot of information clearly in a few words.", simpleExplanation: "Short and clear—saying what's needed without extra words.", hinglishExplanation: "Thode words mein poori baat karna bina bakwas ke.", example: "Keep your answers concise during the exam.", pronunciation: "kon-SISE", synonyms: ["Brief", "Succinct", "Compact"], antonyms: ["Verbose", "Wordy", "Rambling"], difficulty: "Intermediate", topic: "academic" },

  // ── CONVERSATION ───────────────────────────────────────────────────
  { id: "v_60", word: "Elaborate", meaning: "Develop or present in detail.", simpleExplanation: "Explain more — give extra details.", hinglishExplanation: "Aur details mein batao, thoda aur explain karo.", example: "Could you elaborate on that point you just made?", pronunciation: "ih-LAB-uh-rayt", synonyms: ["Explain", "Expand", "Detail"], antonyms: ["Summarize", "Simplify"], difficulty: "Intermediate", topic: "conversation" },
  { id: "v_61", word: "Clarify", meaning: "Make a statement less confusing.", simpleExplanation: "Explain something more clearly.", hinglishExplanation: "Kisi baat ko aur saaf karna taaki samajh aaye.", example: "Could you clarify what you meant by that?", pronunciation: "KLAR-ih-fye", synonyms: ["Explain", "Clear up", "Simplify"], antonyms: ["Confuse", "Obscure"], difficulty: "Beginner", topic: "conversation" },
  { id: "v_62", word: "Reiterate", meaning: "Say something again or a number of times for emphasis.", simpleExplanation: "Repeat something to make sure it's understood.", hinglishExplanation: "Kisi baat ko baar bolna taki acchi tarah samajh aaye.", example: "Let me reiterate my main point before we move on.", pronunciation: "ree-IT-er-ayt", synonyms: ["Repeat", "Restate", "Emphasize"], antonyms: ["Summarize", "Omit"], difficulty: "Intermediate", topic: "conversation" },
  { id: "v_63", word: "Paraphrase", meaning: "Express meaning using different words.", simpleExplanation: "Say the same thing but in your own words.", hinglishExplanation: "Kisi ki baat ko apne words mein bolna, same matlab lekin alag words.", example: "Can you paraphrase what the author said in your own words?", pronunciation: "PAIR-uh-frayz", synonyms: ["Restate", "Reword", "Interpret"], antonyms: ["Quote", "Copy"], difficulty: "Intermediate", topic: "conversation" },
  { id: "v_64", word: "Empathize", meaning: "Understand and share feelings of another.", simpleExplanation: "Feeling what someone else is feeling.", hinglishExplanation: "Dusre ki feelings samajhna aur unse connect karna.", example: "A good leader knows how to empathize with their team.", pronunciation: "EM-puh-thize", synonyms: ["Relate", "Connect", "Sympathize"], antonyms: ["Ignore", "Dismiss"], difficulty: "Intermediate", topic: "conversation" },

  // ── PRESENTATION ───────────────────────────────────────────────────
  { id: "v_70", word: "Compelling", meaning: "Evoking interest or attention in a powerful way.", simpleExplanation: "So interesting that people just have to pay attention.", hinglishExplanation: "Itna interesting ki log sun ne par majboor ho jayein.", example: "She gave a compelling argument that changed everyone's opinion.", pronunciation: "kum-PEL-ing", synonyms: ["Persuasive", "Convincing", "Powerful"], antonyms: ["Boring", "Weak", "Unconvincing"], difficulty: "Advanced", topic: "presentation" },
  { id: "v_71", word: "Succinct", meaning: "Briefly and clearly expressed.", simpleExplanation: "Short and to the point—zero wasted words.", hinglishExplanation: "Seedha point par aana bina extra words waste kiye.", example: "Your presentation was succinct and very easy to follow.", pronunciation: "suk-SINKT", synonyms: ["Concise", "Brief", "Pithy"], antonyms: ["Verbose", "Lengthy", "Rambling"], difficulty: "Advanced", topic: "presentation" },
  { id: "v_72", word: "Engross", meaning: "Absorb all the attention of someone.", simpleExplanation: "Keep your audience so interested they can't look away.", hinglishExplanation: "Audience ka poora dhyan khींch lena.", example: "The story was so well told that it engrossed everyone in the room.", pronunciation: "en-GROSS", synonyms: ["Captivate", "Absorb", "Immerse"], antonyms: ["Bore", "Distract"], difficulty: "Advanced", topic: "presentation" },
  { id: "v_73", word: "Credibility", meaning: "The quality of being trusted and believed in.", simpleExplanation: "People trust and believe what you say.", hinglishExplanation: "Log tumhari baaton par trust karte hain.", example: "Using real data adds credibility to your presentation.", pronunciation: "cred-ih-BIL-ih-tee", synonyms: ["Trustworthiness", "Reliability", "Integrity"], antonyms: ["Distrust", "Doubt"], difficulty: "Intermediate", topic: "presentation" },
  { id: "v_74", word: "Narrative", meaning: "A spoken or written account of events; a story.", simpleExplanation: "The story or storyline that connects your ideas.", hinglishExplanation: "Woh kahani jo tumhare ideas ko ek dore mein piroti hai.", example: "Build a strong narrative so the audience stays engaged.", pronunciation: "NAR-uh-tiv", synonyms: ["Story", "Account", "Thread"], antonyms: ["Facts alone", "Data-dump"], difficulty: "Intermediate", topic: "presentation" },
];

// Helper to get 5 daily words deterministically based on date (LEGACY)
export const getDailyWords = (seed: number = 0): VocabularyWord[] => {
  const today = new Date();
  const indexKey = today.getDate() + today.getMonth() + seed;
  const copy = [...VOCABULARY_DATA];
  const startIndex = indexKey % VOCABULARY_DATA.length;
  const daily: VocabularyWord[] = [];
  for (let i = 0; i < 5; i++) {
    const idx = (startIndex + i) % VOCABULARY_DATA.length;
    daily.push(copy[idx]);
  }
  return daily;
};

// NEW: Fetch rotated words from Supabase for the 4-hour cycle
export const getTodayRotatedWordsAsync = async (supabase: any): Promise<VocabularyWord[]> => {
  try {
    const { data: cycle } = await supabase
      .from('content_refresh_cycles')
      .select('cycle_index')
      .order('last_refresh_at', { ascending: false })
      .limit(1)
      .single();

    if (!cycle) return getDailyWords();

    const { data: rotated } = await supabase
      .from('rotated_vocabulary_sets')
      .select('word_ids')
      .eq('cycle_index', cycle.cycle_index)
      .single();

    if (!rotated || !rotated.word_ids) return getDailyWords();

    return rotated.word_ids
      .map((id: string) => VOCABULARY_DATA.find(w => w.id === id))
      .filter(Boolean) as VocabularyWord[];
  } catch (err) {
    console.error("VocabData: Error fetching rotated words", err);
    return getDailyWords();
  }
};

// Get all words filtered by difficulty and/or topic
export const getFilteredWords = (
  difficulty?: Difficulty | "All",
  topic?: TopicSlug | "all",
  search?: string
): VocabularyWord[] => {
  let result = [...VOCABULARY_DATA];

  if (difficulty && difficulty !== "All") {
    result = result.filter(w => w.difficulty === difficulty);
  }
  if (topic && topic !== "all") {
    result = result.filter(w => w.topic === topic);
  }
  if (search && search.trim() !== "") {
    const q = search.toLowerCase();
    result = result.filter(w =>
      w.word.toLowerCase().includes(q) ||
      w.meaning.toLowerCase().includes(q) ||
      w.synonyms.some(s => s.toLowerCase().includes(q))
    );
  }

  return result;
};
