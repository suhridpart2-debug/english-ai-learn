export interface RoleplayScenario {
  id: string;
  title: string;
  description: string;
  category: "Professional" | "Daily Life" | "Travel";
  icon: string;
  systemPrompt: string;
  initialMessage: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
}

export const ROLEPLAY_SCENARIOS: RoleplayScenario[] = [
  {
    id: "job-interview",
    title: "Job Interview",
    description: "Practice common interview questions and behavioral answers.",
    category: "Professional",
    icon: "Briefcase",
    systemPrompt: "You are a professional HR manager. Conduct a semi-formal job interview. Ask about experience, strengths, and handling challenges.",
    initialMessage: "Welcome to the interview. To start, could you tell me a bit about your professional background?",
    difficulty: "Advanced"
  },
  {
    id: "restaurant-ordering",
    title: "Ordering at a Restaurant",
    description: "Learn how to order food, ask about the menu, and handle the bill.",
    category: "Daily Life",
    icon: "Utensils",
    systemPrompt: "You are a friendly waiter at a high-end restaurant. Help the customer with their order and handle their requests politely.",
    initialMessage: "Good evening! I'll be your waiter tonight. Have you had a chance to look at our specials, or can I get you started with some drinks?",
    difficulty: "Beginner"
  },
  {
    id: "airport-checkin",
    title: "Airport Check-in",
    description: "Navigate travel procedures, baggage queries, and boarding calls.",
    category: "Travel",
    icon: "Plane",
    systemPrompt: "You are an airport check-in agent. Be professional and efficient. Check passport, baggage, and seat preferences.",
    initialMessage: "Good morning. Can I please have your passport and booking reference?",
    difficulty: "Intermediate"
  },
  {
    id: "office-meeting",
    title: "Office Team Meeting",
    description: "Practice giving updates, disagreeing politely, and suggesting ideas.",
    category: "Professional",
    icon: "Users",
    systemPrompt: "You are a team lead. You are chairing a weekly update meeting. Ask for updates and encourage collaboration.",
    initialMessage: "Thanks for coming, everyone. Let's start with project updates. Who would like to go first?",
    difficulty: "Intermediate"
  },
  {
    id: "classroom-discussion",
    title: "Classroom Discussion",
    description: "Share opinions on a topic and respond to a teacher's questions.",
    category: "Daily Life",
    icon: "GraduationCap",
    systemPrompt: "You are a teacher leading a classroom discussion. Ask the student for their opinion on a specific topic and provide feedback.",
    initialMessage: "Today we're discussing the impact of technology on social skills. What do you think is the biggest change brought by smartphones?",
    difficulty: "Intermediate"
  },
  {
    id: "customer-care",
    title: "Customer Support Call",
    description: "Practice explaining a problem and asking for a solution/refund.",
    category: "Daily Life",
    icon: "Headphones",
    systemPrompt: "You are a customer service representative. You are helpful but need specific details to solve the issue.",
    initialMessage: "Thank you for calling support. How can I help you today?",
    difficulty: "Advanced"
  }
];
