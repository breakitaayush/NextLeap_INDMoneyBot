"use client";

import { Check } from "lucide-react";
import type { Habit } from "@/types";

type HabitCardProps = {
  habit: Habit;
  completed?: boolean;
  streak?: number;
  onToggle?: () => void;
};

export function HabitCard({ habit, completed = false, streak = 0, onToggle }: HabitCardProps) {
  return (
    <article className={`card lift-card flex items-center gap-3 p-4 ${completed ? "bg-ayuva-mint/80 dark:bg-emerald-500/10" : ""}`}>
      <button
        className={`focus-ring grid size-12 shrink-0 place-items-center rounded-2xl border text-sm font-black transition active:scale-95 ${
          completed ? "border-ayuva-green bg-ayuva-green text-white" : "border-black/10 bg-white text-ayuva-muted dark:border-white/10 dark:bg-white/10 dark:text-white/60"
        }`}
        onClick={onToggle}
        type="button"
        aria-label={`Toggle ${habit.name}`}
      >
        {completed ? <Check size={20} aria-hidden /> : null}
      </button>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-black">{habit.name}</h3>
        <p className="mt-1 text-xs text-ayuva-muted dark:text-white/60">
          {habit.targetTime} · {streak} day streak
        </p>
      </div>
      <span className="rounded-full bg-ayuva-mint px-3 py-1 text-xs font-semibold text-ayuva-greenDark dark:bg-white/10 dark:text-white">
        {completed ? "Complete" : "Reset"}
      </span>
    </article>
  );
}
