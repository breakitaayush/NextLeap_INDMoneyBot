"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Home, MessageCircle, Settings, Target } from "lucide-react";

const navItems = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/chat", label: "Chat", icon: MessageCircle },
  { href: "/habits", label: "Habits", icon: Target },
  { href: "/insights", label: "Insights", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-black/5 bg-white/90 backdrop-blur-xl dark:border-white/10 dark:bg-[#0f1715]/90 md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              className={`flex min-h-14 flex-col items-center justify-center rounded-2xl text-[0.7rem] font-bold transition ${
                active ? "bg-ayuva-mint text-ayuva-greenDark dark:bg-white/10 dark:text-emerald-100" : "text-ayuva-muted dark:text-white/55"
              }`}
              href={item.href}
              key={item.href}
            >
              <Icon size={18} aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
