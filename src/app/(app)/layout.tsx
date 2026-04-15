import { MobileNav } from "@/components/layout/MobileNav";
import {
  Mic,
  LayoutDashboard,
  BookOpen,
  MessageSquareText,
  Dumbbell,
  User,
  Clock,
} from "lucide-react";
import { AuthGuard } from "@/components/layout/AuthGuard";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50 pb-24 transition-colors dark:bg-slate-950 md:pb-0 md:pl-64">
        {/* Desktop Sidebar (Hidden on mobile) */}
        <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 md:flex">
          <div className="flex items-center justify-between p-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 font-display text-xl font-bold text-slate-900 transition-opacity hover:opacity-80 dark:text-white"
            >
              <div className="rounded-lg bg-primary-600 p-1.5 text-white">
                <Mic className="h-5 w-5" />
              </div>
              SpeakAI
            </Link>
            <ThemeToggle />
          </div>

          <nav className="flex-1 space-y-1 p-4">
            {[
              {
                href: "/dashboard",
                icon: LayoutDashboard,
                label: "Dashboard",
              },
              {
                href: "/learn",
                icon: BookOpen,
                label: "Learn",
              },
              {
                href: "/practice",
                icon: Dumbbell,
                label: "Practice",
              },
              {
                href: "/practice/conversation",
                icon: MessageSquareText,
                label: "AI Conversation",
              },
              {
                href: "/history",
                icon: Clock,
                label: "History",
              },
              {
                href: "/profile",
                icon: User,
                label: "Profile",
              },
            ].map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
              >
                <Icon className="h-5 w-5 shrink-0" />
                {label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="h-full w-full bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
          {children}
        </main>

        {/* Mobile Bottom Nav */}
        <MobileNav />
      </div>
    </AuthGuard>
  );
}