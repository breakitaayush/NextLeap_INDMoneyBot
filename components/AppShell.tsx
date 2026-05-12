import Link from "next/link";
import type { ReactNode } from "react";
import { Leaf } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";

type AppShellProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showNav?: boolean;
};

export function AppShell({ children, title, subtitle, showNav = true }: AppShellProps) {
  return (
    <main className="min-h-screen px-4 pb-24 pt-4 md:px-8 md:pb-10">
      <div className="mx-auto grid max-w-6xl gap-6">
        <header className="flex items-center justify-between rounded-[1.375rem] border border-black/5 bg-white/75 px-4 py-3 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
          <Link href="/home" className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-ayuva-mint text-ayuva-greenDark shadow-sm dark:bg-white/10 dark:text-emerald-100">
              <Leaf size={20} aria-hidden />
            </span>
            <span>
              <strong className="block text-base">Ayuva</strong>
              <span className="block text-xs text-ayuva-muted dark:text-white/60">A quiet daily reset</span>
            </span>
          </Link>
          {title ? (
            <div className="hidden text-right md:block">
              <p className="text-sm font-bold">{title}</p>
              {subtitle ? <p className="text-xs text-ayuva-muted dark:text-white/60">{subtitle}</p> : null}
            </div>
          ) : null}
        </header>
        {children}
      </div>
      {showNav ? <BottomNav /> : null}
    </main>
  );
}
