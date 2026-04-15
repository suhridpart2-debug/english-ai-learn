export interface ReadAloudPassage {
  id: string;
  title: string;
  content: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  topic: string;
}

export const READ_ALOUD_PASSAGES: ReadAloudPassage[] = [
  {
    id: "ra_1",
    title: "The Coffee Shop",
    content: "I would like to order a large latte with oat milk, please. Do you have any fresh muffins today? I also need a receipt for my purchase.",
    difficulty: "Beginner",
    topic: "Daily Life"
  },
  {
    id: "ra_2",
    title: "Job Interview Intro",
    content: "I have over five years of experience in project management. My primary focus is on team collaboration and delivering results on time. I am excited about the opportunity to contribute to your company.",
    difficulty: "Intermediate",
    topic: "Professional"
  },
  {
    id: "ra_3",
    title: "Climate Change",
    content: "Scientific evidence shows that the global temperature has risen significantly over the last century. Reducing carbon emissions is critical to preserving our ecosystems and ensuring a sustainable future for the next generation.",
    difficulty: "Advanced",
    topic: "Environment"
  }
];
