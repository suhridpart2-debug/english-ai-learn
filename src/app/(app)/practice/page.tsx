import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Mic, Timer, GraduationCap, Users, BookOpen } from "lucide-react";

export default function PracticeHubPage() {
    {
      id: "read-aloud",
      title: "Pronunciation Coach",
      desc: "Read passages aloud and get word-level accuracy feedback.",
      icon: Mic,
      color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
      link: "/practice/read-aloud"
    },
    {
      id: "conversation-buddy",
      title: "AI Conversation Buddy",
      desc: "Practice real conversations with AI Personas. Get live feedback.",
      icon: Users,
      color: "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400",
      link: "/practice/conversation"
    },
    {
      id: "sixty-seconds",
      title: "60-Second Challenge",
      desc: "Speak on a random topic for 1 minute. Instant analysis.",
      icon: Timer,
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
      link: "/practice/sixty-seconds"
    },
    {
      id: "roleplay",
      title: "Real-life Roleplay",
      desc: "Practice interviews, restaurant orders, and more.",
      icon: Users,
      color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
      link: "/practice/roleplay"
    },
    {
      id: "ielts",
      title: "IELTS Mock Test",
      desc: "Full speaking section simulation with band scoring.",
      icon: GraduationCap,
      color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
      link: "/practice/ielts"
    },
    {
      id: "topics",
      title: "Topic Catalog (100+)",
      desc: "Choose from specific topics to build vocabulary.",
      icon: BookOpen,
      color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
      link: "/practice/topic"
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">
          Practice Hub
        </h1>
        <p className="text-slate-500">Choose a mode to start improving your English.</p>
      </header>

      <div className="grid md:grid-cols-2 gap-6 relative">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-500/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

        {modes.map((mode) => {
          const Icon = mode.icon;
          return (
            <Link key={mode.id} href={mode.link}>
              <Card className="p-6 h-full hover:shadow-xl hover:-translate-y-1 transition-all border-slate-200 dark:border-slate-800 hover:border-primary-200 dark:hover:border-primary-800 group">
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${mode.color}`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {mode.title}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                      {mode.desc}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
