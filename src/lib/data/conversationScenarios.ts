export type ScenarioCategory = 
  | "Daily Life" 
  | "Work & Office" 
  | "Travel & Airport" 
  | "Social & Friends" 
  | "Education" 
  | "Professional";

export interface ConversationScenario {
  id: string;
  title: string;
  description: string;
  category: ScenarioCategory;
  aiRole: string;
  userRole: string;
  initialMessage: string;
  systemPrompt: string;
  suggestedLevel: "Beginner" | "Intermediate" | "Advanced";
}

export const CONVERSATION_SCENARIOS: ConversationScenario[] = [
  {
    id: "self-intro",
    title: "Self-Introduction",
    description: "Practice introducing yourself to a new neighbor or colleague.",
    category: "Daily Life",
    aiRole: "New Neighbor",
    userRole: "Yourself",
    initialMessage: "Hi there! I just moved in next door. I'm Alex. How long have you been living in this neighborhood?",
    systemPrompt: "You are a friendly new neighbor who just moved in. Your goal is to get to know the user. Keep it casual and welcoming. Ask about their hobbies, work, or local recommendations.",
    suggestedLevel: "Beginner"
  },
  {
    id: "making-friend",
    title: "Meeting a New Friend",
    description: "Start a conversation with someone at a coffee shop or a park.",
    category: "Social & Friends",
    aiRole: "Person at Coffee Shop",
    userRole: "Yourself",
    initialMessage: "Hey, excuse me! I couldn't help but notice you're reading that book. I've heard it's great—what do you think of it so far?",
    systemPrompt: "You are a social and approachable person at a coffee shop. You noticed the user reading a book. Try to build a natural connection, talk about interests, and keep the vibe relaxed.",
    suggestedLevel: "Intermediate"
  },
  {
    id: "airport-travel",
    title: "Airport Check-in",
    description: "Check in for your flight and handle common travel questions.",
    category: "Travel & Airport",
    aiRole: "Check-in Agent",
    userRole: "Traveler",
    initialMessage: "Good morning! Can I see your passport and booking reference, please? Where are you flying to today?",
    systemPrompt: "You are a professional airport check-in agent. Be polite but efficient. Ask the user about their destination, check their bags, and mention security protocols.",
    suggestedLevel: "Beginner"
  },
  {
    id: "restaurant-order",
    title: "Ordering at a Restaurant",
    description: "Order a meal and handle special requests or dietary needs.",
    category: "Daily Life",
    aiRole: "Waiter",
    userRole: "Customer",
    initialMessage: "Good evening! Welcome to The Grill. Are you ready to order, or do you need another minute with the menu?",
    systemPrompt: "You are a polite waiter at a nice restaurant. Take the user's order, suggest a special, and handle any questions about the menu professionally.",
    suggestedLevel: "Beginner"
  },
  {
    id: "job-interview",
    title: "Job Interview",
    description: "Practice common interview questions for a new role.",
    category: "Professional",
    aiRole: "Hiring Manager",
    userRole: "Job Applicant",
    initialMessage: "Thank you for coming in today. To start, could you walk me through your background and why you're interested in this position?",
    systemPrompt: "You are a professional hiring manager. Ask behavioral and technical questions. Probe into the user's experience and how they handle challenges. Maintain a formal yet encouraging tone.",
    suggestedLevel: "Advanced"
  },
  {
    id: "office-meeting",
    title: "Office Meeting Update",
    description: "Give a quick update on your project in a team meeting.",
    category: "Work & Office",
    aiRole: "Team Lead",
    userRole: "Team Member",
    initialMessage: "Hi team. Let's get started. Could you give us a quick update on your progress with the current project?",
    systemPrompt: "You are a supportive but result-oriented team lead. Listen to the user's project update, ask clarifying questions about timelines and blockers, and offer help if needed.",
    suggestedLevel: "Advanced"
  },
  {
    id: "customer-care",
    title: "Customer Support Call",
    description: "Call support to resolve an issue with a product or service.",
    category: "Professional",
    aiRole: "Customer Service Agent",
    userRole: "Customer",
    initialMessage: "Thank you for calling support. My name is Sam. How can I help you with your account today?",
    systemPrompt: "You are a helpful and patient customer service representative. Listen to the user's problem, apologize for any inconvenience, and guide them through a resolution process.",
    suggestedLevel: "Intermediate"
  },
  {
    id: "presentation-practice",
    title: "Presentation Prep",
    description: "Pitch your idea to a manager or a small group.",
    category: "Work & Office",
    aiRole: "Manager",
    userRole: "Presenter",
    initialMessage: "Thanks for setting this up. I'm curious to hear your ideas for the new campaign. Whenever you're ready, the floor is yours.",
    systemPrompt: "You are an attentive manager observing a pitch. Listen to the user's presentation, ask challenging but fair questions, and provide feedback on their clarity and impact.",
    suggestedLevel: "Advanced"
  },
  {
    id: "school-talk",
    title: "College Group Project",
    description: "Discuss a group assignment with a classmate.",
    category: "Education",
    aiRole: "Classmate",
    userRole: "Group Member",
    initialMessage: "Hey! Glad we could catch up. Our presentation is due next week, and we still haven't decided on the final topics. What were you thinking?",
    systemPrompt: "You are a focused classmate. You want to make sure the project gets done well. Discuss workload, share ideas, and try to reach a decision on how to split the tasks.",
    suggestedLevel: "Intermediate"
  }
];

export const getRotatedScenarios = (count: number = 4) => {
  // Simple rotation based on the hour (every 6 hours)
  const hour = new Date().getHours();
  const rotationIndex = Math.floor(hour / 6);
  
  // Pivot the list based on rotation index
  const startIdx = (rotationIndex * count) % CONVERSATION_SCENARIOS.length;
  const scenarios = [...CONVERSATION_SCENARIOS];
  
  // Return a slice, wrapping around if needed
  const selected = [];
  for (let i = 0; i < count; i++) {
    selected.push(scenarios[(startIdx + i) % scenarios.length]);
  }
  return selected;
};
