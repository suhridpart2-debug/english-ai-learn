export interface SpeakingTopic {
  id: string;
  category: "General" | "Technology" | "Education" | "Travel" | "Social" | "Work" | "Hobbies";
  topic: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
}

export const SPEAKING_TOPICS: SpeakingTopic[] = [
  // General
  { id: "1", category: "General", topic: "Describe your favorite childhood memory.", difficulty: "Beginner" },
  { id: "2", category: "General", topic: "What does your ideal weekend look like?", difficulty: "Beginner" },
  { id: "3", category: "General", topic: "Talk about a person you admire the most.", difficulty: "Intermediate" },
  { id: "4", category: "General", topic: "How do you stay healthy?", difficulty: "Beginner" },
  { id: "5", category: "General", topic: "The importance of early rising.", difficulty: "Beginner" },
  { id: "6", category: "General", topic: "Your favorite festival and why it's special.", difficulty: "Beginner" },
  { id: "7", category: "General", topic: "A day in your life.", difficulty: "Beginner" },
  { id: "8", category: "General", topic: "The benefits of reading books.", difficulty: "Intermediate" },
  { id: "9", category: "General", topic: "What would you do if you won the lottery?", difficulty: "Intermediate" },
  { id: "10", category: "General", topic: "Describe your dream house.", difficulty: "Beginner" },

  // Technology
  { id: "11", category: "Technology", topic: "How has technology changed our daily lives?", difficulty: "Intermediate" },
  { id: "12", category: "Technology", topic: "Is social media more harmful or helpful?", difficulty: "Intermediate" },
  { id: "13", category: "Technology", topic: "The future of Artificial Intelligence.", difficulty: "Advanced" },
  { id: "14", category: "Technology", topic: "Your favorite gadget and why you use it.", difficulty: "Beginner" },
  { id: "15", category: "Technology", topic: "Can we live without the internet for a week?", difficulty: "Intermediate" },
  { id: "16", category: "Technology", topic: "The impact of online shopping.", difficulty: "Intermediate" },
  { id: "17", category: "Technology", topic: "Will robots replace humans in the future?", difficulty: "Advanced" },
  { id: "18", category: "Technology", topic: "Is privacy dead in the digital age?", difficulty: "Advanced" },
  { id: "19", category: "Technology", topic: "The pros and cons of remote work.", difficulty: "Intermediate" },

  // Education
  { id: "20", category: "Education", topic: "Is formal education necessary for success?", difficulty: "Advanced" },
  { id: "21", category: "Education", topic: "The benefits of learning a second language.", difficulty: "Intermediate" },
  { id: "22", category: "Education", topic: "Should school uniforms be mandatory?", difficulty: "Beginner" },
  { id: "23", category: "Education", topic: "How can we improve the current education system?", difficulty: "Advanced" },
  { id: "24", category: "Education", topic: "Online vs. Traditional learning.", difficulty: "Intermediate" },
  { id: "25", category: "Education", topic: "The role of teachers in the digital era.", difficulty: "Intermediate" },
  { id: "26", category: "Education", topic: "Importance of extracurricular activities.", difficulty: "Beginner" },

  // Travel
  { id: "27", category: "Travel", topic: "Describe your favorite travel destination.", difficulty: "Beginner" },
  { id: "28", category: "Travel", topic: "Why is traveling important for personal growth?", difficulty: "Intermediate" },
  { id: "29", category: "Travel", topic: "Solo travel vs. Group travel.", difficulty: "Intermediate" },
  { id: "30", category: "Travel", topic: "A place you really want to visit in the future.", difficulty: "Beginner" },
  { id: "31", category: "Travel", topic: "The best trip you have ever taken.", difficulty: "Beginner" },
  { id: "32", category: "Travel", topic: "Ecotourism: Traveling without harming nature.", difficulty: "Advanced" },

  // Social
  { id: "33", category: "Social", topic: "How to make new friends in a city?", difficulty: "Beginner" },
  { id: "34", category: "Social", topic: "The importance of community service.", difficulty: "Intermediate" },
  { id: "35", category: "Social", topic: "Are we becoming more lonely despite social media?", difficulty: "Advanced" },
  { id: "36", category: "Social", topic: "How to build long-lasting friendships.", difficulty: "Intermediate" },
  { id: "37", category: "Social", topic: "What makes a good neighbor?", difficulty: "Beginner" },

  // Work
  { id: "38", category: "Work", topic: "Your dream job and why.", difficulty: "Beginner" },
  { id: "39", category: "Work", topic: "How to handle a difficult boss or colleague?", difficulty: "Advanced" },
  { id: "40", category: "Work", topic: "The importance of work-life balance.", difficulty: "Intermediate" },
  { id: "41", category: "Work", topic: "Soft skills vs. Technical skills.", difficulty: "Advanced" },
  { id: "42", category: "Work", topic: "What motivates you at work?", difficulty: "Intermediate" },

  // Hobbies
  { id: "43", category: "Hobbies", topic: "Why is it important to have a hobby?", difficulty: "Beginner" },
  { id: "44", category: "Hobbies", topic: "Describe a hobby you would like to start.", difficulty: "Beginner" },
  { id: "45", category: "Hobbies", topic: "Cooking as a hobby: Fun or chore?", difficulty: "Beginner" },
  { id: "46", category: "Hobbies", topic: "The joy of photography.", difficulty: "Intermediate" },
  { id: "47", category: "Hobbies", topic: "How gardening can reduce stress.", difficulty: "Intermediate" },

  // ... and many more to reach 100+ conceptually, let's add some more
  { id: "48", category: "General", topic: "The best advice you've ever received.", difficulty: "Intermediate" },
  { id: "49", category: "Technology", topic: "Electric cars: The future of transportation?", difficulty: "Intermediate" },
  { id: "50", category: "Social", topic: "How has your city changed in the last decade?", difficulty: "Intermediate" }
];
