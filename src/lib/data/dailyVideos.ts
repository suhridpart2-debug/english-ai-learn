export interface VideoLearningObject {
  id: string; // MUST be a UUID for Supabase compatibility
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
    id: "e1a1b2c3-d4e5-4f6a-8b9c-1d2e3f4a5b6c",
    title: "10 Simple Ways to Improve English Fluency",
    youtubeId: "LDkvRFCm8No",
    category: "Conversation",
    difficulty: "Intermediate",
    summary: "BBC Learning English provides practical tips to move from hesitant speaking to natural fluency.",
    vocabulary: [
      { word: "Hesitant", meaning: "Tentative, unsure, or slow in acting or speaking.", example: "He gave a hesitant smile." },
      { word: "Fluency", meaning: "The ability to speak or write a language easily and accurately.", example: "She achieved fluency in just six months." }
    ],
    keyPhrases: [
      { phrase: "Practice makes perfect.", context: "The golden rule of learning any skill." },
      { phrase: "Immerse yourself.", context: "Surrounding yourself with the language." }
    ],
    transcript: [
      { start: 0, text: "Do you want to speak English more naturally?" }
    ],
    duration: 385
  },
  {
    id: "f2b2c3d4-e5f6-4a7b-8c9d-1e2f3a4b5c6d",
    title: "English for School: Classroom Objects",
    youtubeId: "Xbv4IIqwW-4",
    category: "Vocabulary",
    difficulty: "Beginner",
    summary: "Basic vocabulary for items you find in a classroom, perfect for beginner learners.",
    vocabulary: [
      { word: "Blackboard", meaning: "A large surface for writing on with chalk.", example: "The teacher wrote the homework on the blackboard." }
    ],
    keyPhrases: [
      { phrase: "Open your books to page...", context: "A common classroom instruction." }
    ],
    transcript: [
      { start: 0, text: "Let's look at things you find at school." }
    ],
    duration: 240
  },
  {
    id: "a3c3d4e5-f6a1-4b2c-8d3e-1f4a5b6c7d8e",
    title: "10 Best TV Series to Learn English",
    youtubeId: "4K9zbx-W8U4",
    category: "Storytelling",
    difficulty: "Intermediate",
    summary: "Discover which TV shows are actually helpful for learning natural, spoken English expressions.",
    vocabulary: [
      { word: "Binge-watch", meaning: "Watch multiple episodes of a show in rapid succession.", example: "I binge-watched 'Friends' last weekend." }
    ],
    keyPhrases: [
      { phrase: "Highly recommended.", context: "Suggesting something with strong approval." }
    ],
    transcript: [
      { start: 0, text: "Which TV shows should you watch to learn English?" }
    ],
    duration: 620
  },
  {
    id: "b4d4e5f6-a1b2-4c3d-8e4f-1a5b6c7d8e4f",
    title: "Learn English with Pirates of the Caribbean",
    youtubeId: "UUAENx1NANg",
    category: "Conversation",
    difficulty: "Intermediate",
    summary: "Analyze Jack Sparrow's unique dialect and common nautical metaphors.",
    vocabulary: [
      { word: "Metaphor", meaning: "A figure of speech where a word is applied to an object not literally applicable.", example: "The world is a stage is a famous metaphor." }
    ],
    keyPhrases: [
      { phrase: "savvy?", context: "A pirate way of saying 'Do you understand?'" }
    ],
    transcript: [
      { start: 0, text: "Welcome to Learn English with TV Series!" }
    ],
    duration: 750
  },
  {
    id: "c5e5f6a1-b2c3-4d4e-8f5a-1b6c7d8e4f5a",
    title: "British English vs American English Vocabulary",
    youtubeId: "F30R0tDIXP0",
    category: "Vocabulary",
    difficulty: "Advanced",
    summary: "Lucy explains the subtle and major differences between UK and US terminology.",
    vocabulary: [
      { word: "Terminology", meaning: "The set of technical terms or expressions used in a field.", example: "Medical terminology is very complex." }
    ],
    keyPhrases: [
      { phrase: "Fancy a cuppa?", context: "British way to ask if someone wants tea." }
    ],
    transcript: [
      { start: 0, text: "Today we are looking at the differences between UK and US English." }
    ],
    duration: 540
  },
  {
    id: "d6f6a1b2-c3d4-4e5f-8a6b-1c7d8e4f5a6b",
    title: "10 British Expressions You Need to Know",
    youtubeId: "dcOGNwiqjP0",
    category: "Conversation",
    difficulty: "Intermediate",
    summary: "Master common idioms and slang used by people in the UK today.",
    vocabulary: [
      { word: "Slang", meaning: "Very informal language common in speech rather than writing.", example: "Teenagers use a lot of slang." }
    ],
    keyPhrases: [
      { phrase: "I'm chuffed!", context: "Used when you are very pleased or happy." }
    ],
    transcript: [
      { start: 0, text: "Hello everyone! Lucy here with some British expressions." }
    ],
    duration: 490
  },
  {
    id: "e7a1b2c3-d4e5-4f6a-8b7c-1d8e4f5a6b7c",
    title: "Daily Routine in English",
    youtubeId: "sMkzwmMs0jM",
    category: "Vocabulary",
    difficulty: "Beginner",
    summary: "Follow Bob through his day and learn verbs for every action from dawn to dusk.",
    vocabulary: [
      { word: "Dawn", meaning: "The first appearance of light in the sky before sunrise.", example: "I wake up at dawn every day." }
    ],
    keyPhrases: [
      { phrase: "First things first.", context: "Starting with the most important task." }
    ],
    transcript: [
      { start: 0, text: "Let's learn how to talk about your daily routine." }
    ],
    duration: 410
  },
  {
    id: "f8b2c3d4-e5f6-4a7b-8c8d-1e9f4a5b6c7d",
    title: "Furniture & Bedroom Vocabulary",
    youtubeId: "0Yq-5M8XW40",
    category: "Vocabulary",
    difficulty: "Beginner",
    summary: "Learn the names of everything in your bedroom with Bob the Canadian.",
    vocabulary: [
      { word: "Dresser", meaning: "A piece of furniture with drawers for clothes.", example: "My socks are in the top drawer of the dresser." }
    ],
    keyPhrases: [
      { phrase: "Make your bed.", context: "The classic morning chore." }
    ],
    transcript: [
      { start: 0, text: "Hi! Today we are looking at furniture." }
    ],
    duration: 330
  },
  {
    id: "a9c3d4e5-f6a1-4b2c-8d9e-1f0a4b5c6d7e",
    title: "English Conversation for Beginner Levels",
    youtubeId: "y3v-9Y4XW_U",
    category: "Conversation",
    difficulty: "Beginner",
    summary: "Simple dialogues for greetings, introductions, and basic questions.",
    vocabulary: [
      { word: "Dialogue", meaning: "A conversation between two or more people.", example: "We practiced a short dialogue in class." }
    ],
    keyPhrases: [
      { phrase: "Pleased to meet you.", context: "A polite way to say hello to someone new." }
    ],
    transcript: [
      { start: 0, text: "Hello! My name is Anna. What's your name?" }
    ],
    duration: 2150
  },
  {
    id: "b0d4e5f6-a1b2-4c3d-8e0f-1a1b4c5d6e7f",
    title: "Morning Routine: Wake Up & Get Ready",
    youtubeId: "8w7k5e9Z_hI",
    category: "Vocabulary",
    difficulty: "Beginner",
    summary: "Speak English with Vanessa and learn the phrasal verbs used during the morning rush.",
    vocabulary: [
      { word: "Wake up", meaning: "To stop sleeping.", example: "I wake up at 7 AM." },
      { word: "Get ready", meaning: "To prepare yourself for something.", example: "It takes me 20 minutes to get ready." }
    ],
    keyPhrases: [
      { phrase: "Hold on a second.", context: "Asking someone to wait briefly." }
    ],
    transcript: [
      { start: 0, text: "Hi! I'm Vanessa. Today we're waking up together!" }
    ],
    duration: 1060
  }
];
