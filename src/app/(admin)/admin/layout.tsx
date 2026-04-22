import {
  Users,
  BarChart3,
  ShieldCheck,
  LayoutDashboard,
  LogOut,
  Mic,
} from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 transition-colors dark:bg-slate-950 md:pl-64">
      {/* Admin Sidebar */}
      <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 md:flex">
        <div className="flex items-center justify-between p-6">
          <Link
            href="/admin"
            className="flex items-center gap-2 font-display text-xl font-bold text-slate-900 transition-opacity hover:opacity-80 dark:text-white"
          >
            <div className="rounded-lg bg-orange-600 p-1.5 text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            Admin Panel
          </Link>
          <ThemeToggle />
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {[
            {
              href: "/admin",
              icon: BarChart3,
              label: "Stats Overview",
            },
            {
              href: "/admin/users",
              icon: Users,
              label: "Manage Users",
            },
            {
              href: "/dashboard",
              icon: LayoutDashboard,
              label: "Back to App",
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

        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
           {/* Add a logout button or something if needed */}
           <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
             SpeakAI v2.0 Admin
           </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="min-h-screen p-8">
        <div className="mx-auto max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  );
}
