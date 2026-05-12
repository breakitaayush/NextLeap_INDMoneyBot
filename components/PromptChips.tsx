"use client";

import { suggestedPrompts } from "@/lib/utils";

export function PromptChips({ onSelect }: { onSelect: (prompt: string) => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {suggestedPrompts.map((prompt) => (
        <button
          className="focus-ring shrink-0 rounded-full border border-black/10 bg-white/80 px-4 py-2 text-xs font-semibold text-ayuva-greenDark shadow-sm transition hover:bg-ayuva-mint dark:border-white/10 dark:bg-white/10 dark:text-emerald-100"
          key={prompt}
          onClick={() => onSelect(prompt)}
          type="button"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}
