import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";

export function InsightCard({ title = "Ayuva insight", children }: { title?: string; children: ReactNode }) {
  return (
    <section className="card lift-card border-ayuva-green/10 bg-ayuva-mint/60 p-5 dark:bg-emerald-500/10">
      <div className="mb-3 flex items-center gap-2 text-ayuva-greenDark dark:text-emerald-100">
        <Sparkles size={18} aria-hidden />
        <h3 className="text-sm font-semibold uppercase tracking-normal">{title}</h3>
      </div>
      <div className="text-sm leading-6 text-ayuva-ink dark:text-white">{children}</div>
    </section>
  );
}
