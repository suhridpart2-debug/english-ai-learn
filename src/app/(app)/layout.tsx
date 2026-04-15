import { MobileNav } from "@/components/layout/MobileNav";
import { Mic, LayoutDashboard, BookOpen, MessageSquareText, Dumbbell, User, Clock } from "lucide-react";
import { AuthGuard } from "@/components/layout/AuthGuard";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-transparent pb-24 md:pb-0 md:pl-64">
        {/* Desktop Sidebar (Hidden on mobile) */}
        <aside className="hidden md:flex w-64 h-screen fixed left-0 top-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex-col">
          <div className="p-6 flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2 font-display font-bold text-xl hover:opacity-80 transition-opacity">
              <div className="bg-primary-600 text-white p-1.5 rounded-lg">
                <Mic className="w-5 h-5" />
              </div>
              SpeakAI
            </Link>
            <ThemeToggle />
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {[
              { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
              { href: "/learn", icon: BookOpen, label: "Learn" },
              { href: "/practice", icon: Dumbbell, label: "Practice" },
              { href: "/practice/conversation", icon: MessageSquareText, label: "AI Conversation" },
              { href: "/history", icon: Clock, label: "History" },
              { href: "/profile", icon: User, label: "Profile" },
            ].map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white transition-all group"
              >
                <Icon className="w-5 h-5 shrink-0" />
                {label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="w-full h-full">
          {children}
        </main>

        {/* Mobile Bottom Nav */}
        <MobileNav />
      </div>
    </AuthGuard>
  );
}
