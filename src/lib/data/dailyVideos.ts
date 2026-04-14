export interface VideoLearningObject {
  id: string;
  title: string;
  youtubeId: string;
  category: "Conversation" | "Pronunciation" | "Grammar" | "Vocabulary" | "Interview" | "Storytelling";
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  summary: string;
  vocabulary: { word: string; meaning: string; example: string }[];
  keyPhrases: { phrase: string; context: string }[];
  transcript: { start: number; text: string }[];
  duration: number; // seconds
}

export const DAILY_VIDEOS: VideoLearningObject[] = [
  {
    id: "v1",
    title: "Ordering Coffee in English",
    youtubeId: "vH-4B7Uu7W8",
    category: "Conversation",
    difficulty: "Beginner",
    summary: "Learn how to confidently order coffee, ask for milk alternatives, and handle small talk at a cafe.",
    vocabulary: [
      { word: "Caffeine", meaning: "A stimulant found in coffee and tea.", example: "I need some caffeine to wake up." },
      { word: "Decaf", meaning: "Short for decaffeinated coffee.", example: "I'll have a medium decaf latte." }
    ],
    keyPhrases: [
      { phrase: "I'd like to get a...", context: "Used to politely order something." },
      { phrase: "Could I have that to go?", context: "Asking for a take-away cup." }
    ],
    transcript: [
      { start: 0, text: "Good morning! Welcome to the Coffee House." },
      { start: 5, text: "Hi! I'd like to get a medium latte, please." },
      { start: 10, text: "Sure thing. Would you like any syrup or extra shots?" }
    ],
    duration: 320
  },
  {
    id: "v2",
    title: "10 Common Job Interview Questions",
    youtubeId: "1mHjMNZZvFo",
    category: "Interview",
    difficulty: "Intermediate",
    summary: "A guide to the most frequent interview questions and how to structure your answers using the STAR method.",
    vocabulary: [
      { word: "Strengths", meaning: "Tasks or skills you are good at.", example: "One of my greatest strengths is problem-solving." },
      { word: "Weaknesses", meaning: "Areas where you need improvement.", example: "I'm working on my public speaking weaknesses." }
    ],
    keyPhrases: [
      { phrase: "Tell me about yourself.", context: "The most common opening question." },
      { phrase: "I thrive in fast-paced environments.", context: "Showing you can handle pressure." }
    ],
    transcript: [
      { start: 0, text: "Today we are looking at how to ace your job interview." },
      { start: 8, text: "The first question is often 'Tell me about yourself'." }
    ],
    duration: 650
  },
  {
    id: "v3",
    title: "The Magic of English Pronunciation",
    youtubeId: "7O75w95X9Gk",
    category: "Pronunciation",
    difficulty: "Beginner",
    summary: "Focus on the 'Th' sound and vowel clarity in everyday sentences.",
    vocabulary: [
      { word: "Articulation", meaning: "The clear and distinct formation of sounds.", example: "Good articulation makes you easier to understand." }
    ],
    keyPhrases: [
      { phrase: "Think through the problem.", context: "Practicing the soft 'th' sound." }
    ],
    transcript: [
      { start: 0, text: "Welcome back! Today we are mastering the difficult 'TH' sound." }
    ],
    duration: 480
  },
  {
    id: "v4",
    title: "English Small Talk for Parties",
    youtubeId: "q6fRE0qE_Y4",
    category: "Conversation",
    difficulty: "Intermediate",
    summary: "Socializing can be tricky. Here are some 'ice breakers' and topics for casual party conversations.",
    vocabulary: [
      { word: "Ice breaker", meaning: "Something that starts a conversation in a social setting.", example: "Talking about the weather is a classic ice breaker." }
    ],
    keyPhrases: [
      { phrase: "How do you know the host?", context: "A great way to start a conversation at a party." },
      { phrase: "What's keeping you busy these days?", context: "Instead of asking 'What do you do?'" }
    ],
    transcript: [
      { start: 0, text: "Are you nervous about going to an English-speaking party?" }
    ],
    duration: 520
  },
  {
    id: "v5",
    title: "Describing Your Daily Routine",
    youtubeId: "K6ZInTCH71c",
    category: "Vocabulary",
    difficulty: "Beginner",
    summary: "Expand your vocabulary for common daily activities from waking up to going to bed.",
    vocabulary: [
      { word: "Commute", meaning: "The journey to and from work.", example: "My daily commute takes 45 minutes." }
    ],
    keyPhrases: [
      { phrase: "I usually wake up at...", context: "Starting your routine description." },
      { phrase: "I wind down by...", context: "Explaining how you relax at night." }
    ],
    transcript: [
      { start: 0, text: "Let's talk about what you do every day." }
    ],
    duration: 380
  }
];
