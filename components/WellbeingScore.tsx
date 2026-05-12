export function WellbeingScore({ score }: { score: number | null }) {
  if (score === null) {
    return (
      <div className="card lift-card overflow-hidden p-5">
        <div className="calm-surface rounded-3xl p-5">
          <p className="text-sm font-semibold text-ayuva-greenDark dark:text-white">No check-in yet today.</p>
          <p className="mt-2 text-sm leading-6 text-ayuva-muted dark:text-white/60">Take one minute to see how you're feeling.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card lift-card relative overflow-hidden p-5">
      <div className="absolute -right-10 -top-10 size-32 rounded-full bg-ayuva-mint/70 blur-xl dark:bg-emerald-400/10" />
      <div className="absolute -bottom-12 -left-10 size-28 rounded-full bg-ayuva-sky/70 blur-xl dark:bg-ayuva-plum/10" />
      <div className="relative flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold text-ayuva-greenDark dark:text-emerald-100">Wellbeing score</p>
        <p className="mt-1 text-xs text-ayuva-muted dark:text-white/60">A reflection, not a grade.</p>
        <p className="mt-4 inline-flex rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-ayuva-greenDark shadow-sm dark:bg-white/10 dark:text-white">
          {score >= 75 ? "You seem resourced" : score >= 50 ? "A steady place" : "Go gently today"}
        </p>
      </div>
      <div className="grid size-28 place-items-center rounded-full border-8 border-white/80 border-t-ayuva-green bg-white/60 shadow-inner dark:border-white/10 dark:border-t-emerald-300 dark:bg-white/5">
        <span className="text-2xl font-black">{score}</span>
      </div>
      </div>
    </div>
  );
}
