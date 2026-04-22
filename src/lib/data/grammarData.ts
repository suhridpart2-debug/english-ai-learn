export type DifficultyLevel = "Beginner" | "Intermediate" | "Advanced";
export type PracticeType = "mcq" | "fill-in-the-blank" | "sentence-correction" | "choose-correct";

export interface GrammarQuizQuestion {
  id: string;
  type: PracticeType;
  question: string;
  options?: string[]; // For MCQ / choose-correct
  correctAnswer: string;
  explanation: string;
  hinglishExplanation: string;
}

export interface GrammarTopic {
  slug: string;
  title: string;
  description: string;
  icon: string;
  difficulty: DifficultyLevel;
  content: {
    concept: string;
    simpleEnglish: string;
    hinglish: string;
    quickTips: string[];
    commonMistakes: string[];
    correctExamples: { correct: string; incorrect: string; reason: string }[];
  };
  quizzes: GrammarQuizQuestion[];
}

export const GRAMMAR_TOPICS: GrammarTopic[] = [
  {
    slug: "tenses",
    title: "Tenses (Time & Action)",
    description: "Master Past, Present, and Future. Crucial for telling stories and reporting updates.",
    icon: "Clock",
    difficulty: "Intermediate",
    content: {
      concept: "Tenses indicate the time when an action happened. English has three main periods (Past, Present, Future), each broken into Simple, Continuous, Perfect, and Perfect Continuous forms.",
      simpleEnglish: "Use right verbs to show WHEN something happened. Don't mix yesterday's action with today's verb.",
      hinglish: "Tenses batate hain ki kaam kab hua tha (kal, aaj, ya kal hoga). Agar kal ki baat hai, to Past Tense lagao.",
      quickTips: [
        "Use Simple Present for daily routines ('I wake up at 7').",
        "Use Simple Past for finished actions ('I sent the email').",
        "Use Present Perfect for past actions mapped to the present ('I have finished my work')."
      ],
      commonMistakes: [
        "Mixing up 'did' with past tense verbs.",
        "Using simple past instead of present perfect for recent news.",
        "Forgetting the 's' in he/she/it present tense verbs."
      ],
      correctExamples: [
        {
          incorrect: "I didn't went there.",
          correct: "I didn't go there.",
          reason: "'Did' is already in the past tense, so the main verb must be in its base form."
        },
        {
          incorrect: "I have passed my graduation in 2020.",
          correct: "I passed my graduation in 2020.",
          reason: "When a specific past time (2020) is mentioned, use Simple Past, not Present Perfect."
        }
      ]
    },
    quizzes: [
      {
        id: "q1_tenses",
        type: "mcq",
        question: "Yesterday, I _____ to the market and bought some apples.",
        options: ["go", "gone", "went", "going"],
        correctAnswer: "went",
        explanation: "The action happened 'Yesterday', which requires the simple past tense of 'go', which is 'went'.",
        hinglishExplanation: "'Yesterday' ka matlab beeta hua kal, isliye past tense 'went' lagega."
      },
      {
        id: "q2_tenses",
        type: "sentence-correction",
        question: "Select the correct sentence.",
        options: ["He do not like coffee.", "He does not like coffee.", "He did not likes coffee."],
        correctAnswer: "He does not like coffee.",
        explanation: "For third-person singular (he, she, it) in the present tense, we use 'does'.",
        hinglishExplanation: "'He', 'She', 'It' ke saath hamesha 'does' aata hai, 'do' nahi."
      },
      {
        id: "q3_tenses",
        type: "fill-in-the-blank",
        question: "She _____ (work) in this company since 2018.",
        options: ["worked", "has been working", "is working", "works"],
        correctAnswer: "has been working",
        explanation: "For an action that started in the past and is still continuing ('since 2018'), use Present Perfect Continuous.",
        hinglishExplanation: "Jab koi kaam past se shuru hoke ab tak chal raha ho (since 2018), tab 'has been + V1+ing' lagate hain."
      }
    ]
  },
  {
    slug: "subject-verb-agreement",
    title: "Subject-Verb Agreement",
    description: "Ensure your subjects and verbs match perfectly. The foundation of clear speech.",
    icon: "Link",
    difficulty: "Beginner",
    content: {
      concept: "A singular subject takes a singular verb, and a plural subject takes a plural verb.",
      simpleEnglish: "If you talk about one thing, use 'is', 'was', or add 's' to the verb. If many, use 'are', 'were', or no 's'.",
      hinglish: "Agar ek insaan (ya cheez) hai, to verb singular lagao (jaise 'goes', 'is'). Agar bahut log hain, to plural lagao ('go', 'are').",
      quickTips: [
        "'Every', 'Everybody', 'Everyone', 'Anything' always take singular verbs.",
        "Two subjects connected by 'and' take a plural verb.",
        "Words between the subject and verb don't change the agreement."
      ],
      commonMistakes: [
        "Confusing the verb when a prepositional phrase separates the subject and verb.",
        "Thinking words like 'everyone' are plural."
      ],
      correctExamples: [
        {
          incorrect: "The list of items are on the desk.",
          correct: "The list of items is on the desk.",
          reason: "The subject is 'list' (singular), not 'items'."
        },
        {
          incorrect: "Everyone know the answer.",
          correct: "Everyone knows the answer.",
          reason: "'Everyone' is a singular pronoun and takes a singular verb."
        }
      ]
    },
    quizzes: [
      {
        id: "q1_sva",
        type: "mcq",
        question: "My team of talented engineers _____ working hard.",
        options: ["is", "are", "am", "were"],
        correctAnswer: "is",
        explanation: "The subject is 'team' (singular), not engineers. A collective noun usually takes a singular verb.",
        hinglishExplanation: "Subject wahan 'team' hai jo ek group (singular) hai, engineers nahi. Isliye 'is' lagega."
      },
      {
        id: "q2_sva",
        type: "choose-correct",
        question: "Which of these is grammatically correct?",
        options: ["Neither of the boys were there.", "Neither of the boys was there."],
        correctAnswer: "Neither of the boys was there.",
        explanation: "'Neither' is a singular pronoun and requires a singular verb ('was').",
        hinglishExplanation: "'Neither' matlab dono me se koi ek nahi (singular), to wahan 'was' ayega."
      }
    ]
  },
  {
    slug: "articles",
    title: "Articles (A, An, The)",
    description: "Know when to use definite vs indefinite articles.",
    icon: "Feather",
    difficulty: "Beginner",
    content: {
      concept: "Articles define a noun as specific or unspecific. 'The' is definite. 'A/An' is indefinite.",
      simpleEnglish: "Use 'A/An' when talking about any one thing in general. Use 'The' for a specific thing everyone knows about.",
      hinglish: "Jab kisi specific cheez ki baat ho jise aap dono jaante hain, 'The' lagao. General baaton ke liye 'A' ya 'An' (vowel sound ke aage).",
      quickTips: [
        "Use 'an' before vowel sounds, not just vowel letters (e.g., 'An hour').",
        "Don't use articles before plural general nouns ('I love dogs' - not 'I love the dogs').",
        "Use 'the' for unique things ('the sun', 'the internet')."
      ],
      commonMistakes: [
        "Putting 'the' before people's names or specific countries (mostly incorrect).",
        "Saying 'I am working in an University' (wrong sound)."
      ],
      correctExamples: [
        {
          incorrect: "I saw an unicorn.",
          correct: "I saw a unicorn.",
          reason: "'Unicorn' starts with a 'Y' consonant sound ('you-ni-corn')."
        },
        {
          incorrect: "I am going to the bed.",
          correct: "I am going to bed.",
          reason: "When referring to the primary purpose of a place (sleeping), no article is used."
        }
      ]
    },
    quizzes: [
      {
        id: "q1_art",
        type: "mcq",
        question: "It is an honor to meet such _____ honest person.",
        options: ["a", "an", "the", "no article"],
        correctAnswer: "an",
        explanation: "'Honest' starts with a vowel sound (o-nest) because the 'h' is silent.",
        hinglishExplanation: "'Honest' me Pheli awaz 'o' ki aati hai (h silent hai), isliye 'an' lagega."
      },
      {
        id: "q2_art",
        type: "fill-in-the-blank",
        question: "She is _____ best developer in our team.",
        options: ["a", "an", "the"],
        correctAnswer: "the",
        explanation: "Superlatives (best, tallest, fastest) always take the definite article 'the'.",
        hinglishExplanation: "Sabse best ki jab baat hoti hai (superlative degree), tab hamesha 'the' aata hai."
      }
    ]
  },
  {
    slug: "prepositions",
    title: "Prepositions (In, On, At)",
    description: "Fix those small words that show time, place, and direction.",
    icon: "MapPin",
    difficulty: "Intermediate",
    content: {
      concept: "Prepositions show the relationship between a noun and another word. Time and place use IN, ON, AT.",
      simpleEnglish: "IN is for large spaces/time (in 2020), ON is for surfaces/days (on Monday), AT is for specific points (at 5 PM).",
      hinglish: "IN matlab andar/bade times ke liye, ON matlab upar/dino ke liye, AT matlab exact location/times ke liye.",
      quickTips: ["In the morning, In the afternoon, BUT At night.", "On a bus (you can walk on), In a car (you sit in)."],
      commonMistakes: ["I'll meet you in Monday. (Wrong)", "I agree with you. (Correct - not 'I agree to you')"],
      correctExamples: [
        { incorrect: "My birthday is in 5th October.", correct: "My birthday is on 5th October.", reason: "Use 'on' for specific dates." }
      ]
    },
    quizzes: [
      {
        id: "q1_prep", type: "mcq", question: "Let's meet _____ the cafe _____ 6 PM.", options: ["in, on", "at, at", "on, in", "at, in"],
        correctAnswer: "at, at", explanation: "'At' is used for a specific place (the cafe) and a specific time (6 PM).", hinglishExplanation: "Exact time aur jagah ke liye 'at' use hota hai."
      }
    ]
  },
  {
    slug: "sentence-structure",
    title: "Sentence Structure",
    description: "Construct clear and logical English sentences.",
    icon: "AlignLeft",
    difficulty: "Beginner",
    content: {
      concept: "English follows a strict S-V-O (Subject - Verb - Object) structure.",
      simpleEnglish: "Who did it? (Subject) What did they do? (Verb) To what? (Object).",
      hinglish: "English me pehle batate hain KISNE kiya, fir KYA KIYA, aur aakhir me KIS PART PAR.",
      quickTips: ["Don't put the verb near the end of the sentence like in Hindi."],
      commonMistakes: ["I the email sent. (Wrong) -> I sent the email. (Correct)"],
      correctExamples: [{ incorrect: "Yesterday finished I my work.", correct: "Yesterday, I finished my work.", reason: "Maintain S-V-O order." }]
    },
    quizzes: [
      {
        id: "q1_ss", type: "choose-correct", question: "Choose the correct format.", options: ["I have booked the tickets.", "I the tickets have booked."],
        correctAnswer: "I have booked the tickets.", explanation: "Subject (I) Verb (have booked) Object (the tickets).", hinglishExplanation: "Pehle Subject, fir Verb, fir Object wali layout."
      }
    ]
  },
  {
    slug: "active-passive-voice",
    title: "Active vs Passive Voice",
    description: "Learn when to highlight the doer vs the action.",
    icon: "Repeat",
    difficulty: "Advanced",
    content: {
      concept: "Active voice puts the subject doing the action first. Passive voice puts the receiver of the action first.",
      simpleEnglish: "Use active for power. Use passive when the action is more important than who did it.",
      hinglish: "Active me direct bolte hai 'Maine mail bheji'. Passive me ghumakar 'Mail mere dwara bheji gayi'.",
      quickTips: ["For business emails, mostly use Active voice to sound confident.", "Use passive when you don't want to blame someone directly."],
      commonMistakes: ["The code pushed by me. (Missing 'was') -> The code was pushed by me."],
      correctExamples: [{ incorrect: "A bug was made by me.", correct: "I made a bug.", reason: "Active voice is clearer and less awkward here." }]
    },
    quizzes: [
      {
        id: "q1_pass", type: "choose-correct", question: "Which is Active Voice?", options: ["The car was washed by John.", "John washed the car."],
        correctAnswer: "John washed the car.", explanation: "John (subject) is doing the washing (action).", hinglishExplanation: "John (subject) aage hai jo kaam kar raha hai, to ye Active hai."
      }
    ]
  },
  {
    slug: "direct-indirect-speech",
    title: "Direct & Indirect Speech",
    description: "Reporting what others said effectively.",
    icon: "MessageSquareText",
    difficulty: "Advanced",
    content: {
      concept: "Direct speech quotes exact words. Indirect reports them without quotes, shifting tenses backward.",
      simpleEnglish: "When telling someone a story, you change 'I' to 'he/she' and past tenses to even older past tenses.",
      hinglish: "Jab aap kisi ki baatein report karte ho, to 'mai' ko 'woh' bana do aur present tense ko past me daal do.",
      quickTips: ["Present becomes Past. Past becomes Past Perfect.", "'Tomorrow' becomes 'the next day'."],
      commonMistakes: ["She said that she is coming. -> She said that she was coming."],
      correctExamples: [{ incorrect: "He asked me where are you going.", correct: "He asked me where I was going.", reason: "Indirect speech uses statement order, not question order." }]
    },
    quizzes: [
      {
        id: "q1_dis", type: "mcq", question: "Change to indirect: He said, 'I am busy.'", options: ["He said that he is busy.", "He said that he was busy."],
        correctAnswer: "He said that he was busy.", explanation: "The present tense 'am' changes to past 'was' in indirect speech.", hinglishExplanation: "Report karte time present tense past me change ho jata hai."
      }
    ]
  },
  {
    slug: "question-formation",
    title: "Question Formation",
    description: "Ask polite, grammatically correct questions.",
    icon: "HelpCircle",
    difficulty: "Intermediate",
    content: {
      concept: "Most questions require an auxiliary verb (do, does, did) BEFORE the subject.",
      simpleEnglish: "Remember the Q-A-S-V rule: Question word, Auxiliary verb, Subject, Verb.",
      hinglish: "Question puchte waqt helping verb hamesha Subject se pehle aayega. Jaise 'where are you?' - 'you' se pehle 'are'.",
      quickTips: ["Do/Does = Present. Did = Past. Will = Future.", "Don't say 'You are coming?' Say 'Are you coming?'"],
      commonMistakes: ["Where you went? (Wrong) -> Where did you go?"],
      correctExamples: [{ incorrect: "Why he is crying?", correct: "Why is he crying?", reason: "Auxiliary verb 'is' must hop in front of the subject 'he'." }]
    },
    quizzes: [
      {
        id: "q1_qf", type: "mcq", question: "_____ you completely understand the feature?", options: ["Are", "Did", "Do", "Have"],
        correctAnswer: "Do", explanation: "For a simple present states/actions, we use 'Do' with 'you'.", hinglishExplanation: "Present tense aur 'you' ke saath 'Do' lagta hai."
      }
    ]
  },
  {
    slug: "modals",
    title: "Modals (Can, Could, Should, Would)",
    description: "Expressing possibility, ability, and polite requests.",
    icon: "Wand2",
    difficulty: "Intermediate",
    content: {
      concept: "Modals are helper verbs that change the tone of the sentence. They are never followed by 'to'.",
      simpleEnglish: "Use these to ask politely or give advice. Always use a raw verb after them.",
      hinglish: "Modals respect aur possibility dikhate hain. Inke baad hamesha sidhi verb aati hai, 'to' nahi lagta.",
      quickTips: ["Could and Would are very polite in writing.", "Must = Strong obligation. Should = Advice."],
      commonMistakes: ["I can to do this. (Wrong) -> I can do this.", "You should went there. (Wrong) -> You should go there."],
      correctExamples: [{ incorrect: "Would you likes some tea?", correct: "Would you like some tea?", reason: "Verbs following a modal are strictly in base form without 's'." }]
    },
    quizzes: [
      {
        id: "q1_mod", type: "mcq", question: "_____ you please send me the report?", options: ["Must", "Should", "Could", "May"],
        correctAnswer: "Could", explanation: "'Could' makes a polite request.", hinglishExplanation: "Polite request ke liye 'Could' ya 'Would' ka use karte hain."
      }
    ]
  },
  {
    slug: "spoken-english-mistakes",
    title: "Common Spoken English Mistakes",
    description: "Iron out errors that are extremely common in daily verbal chats.",
    icon: "MessageCircle",
    difficulty: "Intermediate",
    content: {
      concept: "We often literally translate from our mother tongue leading to funny errors.",
      simpleEnglish: "Stop translating your local language word-for-word into English.",
      hinglish: "Hindi phrase ko exactly English me word-to-word mat convert karo.",
      quickTips: ["Don't say 'revert back' (revert means reply).", "Don't say 'discuss about IT' (discuss means to talk about)."],
      commonMistakes: ["I am having a brother. (Wrong) -> I have a brother."],
      correctExamples: [{ incorrect: "Please revert back soon.", correct: "Please revert soon. / Please reply soon.", reason: "Back is redundant." }]
    },
    quizzes: [
      {
        id: "q1_se", type: "choose-correct", question: "Which is correct to say?", options: ["I will discuss about the issue.", "I will discuss the issue."],
        correctAnswer: "I will discuss the issue.", explanation: "The verb 'discuss' takes a direct object. 'About' is built-in.", hinglishExplanation: "Discuss ka matlab hi 'us baare me baat karna' hai, to 'about' nahi aayega."
      }
    ]
  },
  {
    slug: "interview-grammar",
    title: "Interview Grammar Mistakes",
    description: "Polish your speech to leave a lasting professional impression.",
    icon: "Briefcase",
    difficulty: "Advanced",
    content: {
      concept: "Professional speech requires accurate tenses and avoiding overly casual reductions.",
      simpleEnglish: "Sound professional by using perfect tenses correctly for your past achievements.",
      hinglish: "Apni pichli jobs aur achievements banate waqt past tense ki galtiyan na karein.",
      quickTips: ["Don't say 'Myself John.' Say 'I am John.'", "Instead of 'I am working here since 2019', say 'I have been working here since 2019.'"],
      commonMistakes: ["I was graduated in 2021. (Wrong) -> I graduated in 2021."],
      correctExamples: [{ incorrect: "I am having 3 years of experience.", correct: "I have 3 years of experience.", reason: "Possession uses simple present." }]
    },
    quizzes: [
      {
        id: "q1_ig", type: "choose-correct", question: "How should you introduce yourself?", options: ["Myself Rahul.", "I am Rahul."],
        correctAnswer: "I am Rahul.", explanation: "Starting a sentence with a reflexive pronoun 'Myself' is grammatically incorrect.", hinglishExplanation: "'Myself' se sentence shuru karna grammatical error hai."
      }
    ]
  }
];

// Helper to get a featured grammar topic of the day deterministically
export const getDailyGrammarTopic = (): GrammarTopic => {
  const today = new Date();
  let offset = 0;
  
  if (typeof window !== "undefined") {
    offset = Number(localStorage.getItem("routine_offset_grammar") || "0");
  }
  
  const baseIndex = today.getDate() + today.getMonth();
  const index = (baseIndex + offset) % GRAMMAR_TOPICS.length;
  return GRAMMAR_TOPICS[index];
};
