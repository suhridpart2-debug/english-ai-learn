"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mic, BookOpen, User, LayoutDashboard, Clock, MessageSquareText, ShieldAlert } from "lucide-react";

export function MobileNav({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
    { href: "/learn", icon: BookOpen, label: "Learn" },
    { href: "/practice", icon: Mic, label: "Practice", isMain: true },
    { href: "/practice/conversation", icon: MessageSquareText, label: "AI Chat" },
    { href: isAdmin ? "/admin" : "/profile", icon: isAdmin ? ShieldAlert : User, label: isAdmin ? "Admin" : "Profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full z-[60] p-4 pb-8 md:hidden safe-area-bottom">
      <div className="glass-card rounded-3xl mx-auto flex items-center justify-between px-6 py-3 shadow-[0_8px_40px_rgba(0,0,0,0.15)] dark:shadow-primary-950/20">
        {links.map((link) => {
          const isActive = pathname.startsWith(link.href);
          const Icon = link.icon;

          if (link.isMain) {
            return (
              <Link key={link.href} href={link.href} className="relative -top-6">
                <div className="w-16 h-16 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-lg shadow-primary-600/40 border-4 border-slate-50 dark:border-slate-950 hover:scale-105 transition-transform">
                  <Icon className="w-7 h-7" />
                </div>
              </Link>
            );
          }

          return (
            <Link key={link.href} href={link.href} className="flex flex-col items-center gap-1 group">
              <Icon className={`w-6 h-6 transition-colors ${isActive ? "text-primary-600 dark:text-primary-400" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"}`} />
              <span className={`text-[10px] font-medium transition-colors ${isActive ? "text-primary-600 dark:text-primary-400" : "text-slate-400 group-hover:text-slate-600"}`}>
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
