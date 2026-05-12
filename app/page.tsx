import Link from "next/link";
import { ArrowRight, CheckCircle2, Moon, ShieldCheck, Sparkles, Target } from "lucide-react";

const features = [
  {
    icon: Target,
    title: "Build tiny routines",
    body: "Choose up to three habits so consistency feels possible."
  },
  {
    icon: Moon,
    title: "Understand patterns",
    body: "Track mood, stress, sleep, and energy without a long journal."
  },
  {
    icon: ShieldCheck,
    title: "Stay safely focused",
    body: "Ayuva redirects emergencies and avoids medical claims."
  }
];

export default function LandingPage() {
  return (
    <main className="min-h-screen px-4 py-6 md:px-8">
      <section className="mx-auto grid max-w-6xl gap-10">
        <nav className="flex items-center justify-between rounded-[1.375rem] border border-black/5 bg-white/80 px-4 py-3 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-ayuva-mint text-ayuva-greenDark shadow-sm">
              <Sparkles size={20} aria-hidden />
            </span>
            <span>
              <strong className="block">Ayuva</strong>
              <span className="text-xs text-ayuva-muted">7-day habit reset</span>
            </span>
          </Link>
          <Link className="secondary-button hidden md:inline-flex" href="/login">
            Log in
          </Link>
        </nav>

        <section className="grid items-center gap-8 py-8 md:grid-cols-[1.1fr_0.9fr] md:py-16">
          <div>
            <p className="text-sm font-semibold uppercase tracking-normal text-ayuva-green">Personal wellbeing companion</p>
            <h1 className="mt-4 max-w-3xl text-5xl font-semibold leading-[1.02] tracking-normal md:text-7xl">
              Ayuva is your personal AI companion for habits, mood, stress, sleep, and daily wellbeing.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-ayuva-muted">
              Build small habits, understand your patterns, and improve consistency one day at a time.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link className="primary-button" href="/login">
                Start your 7-day reset <ArrowRight size={18} aria-hidden />
              </Link>
              <a className="secondary-button" href="#how-it-works">
                See how it works
              </a>
            </div>
            <p className="mt-5 max-w-2xl rounded-xl border border-ayuva-rose/15 bg-white/70 p-3 text-sm leading-6 text-ayuva-muted">
              Ayuva is not medical advice and does not replace doctors, therapists, or emergency services.
            </p>
          </div>

          <div className="card calm-surface lift-card grid gap-4 overflow-hidden p-5">
            <div className="rounded-3xl bg-white/75 p-5 shadow-sm dark:bg-white/10">
              <p className="text-sm font-semibold text-ayuva-greenDark dark:text-emerald-100">Today, focus on recovery.</p>
              <p className="mt-2 text-sm leading-6 text-ayuva-muted">
                Your sleep is low and stress is high. Take a 10-minute walk and avoid scrolling before bed.
              </p>
            </div>
            {[
              ["Mood check-in", "60 seconds"],
              ["Active habits", "1-3 only"],
              ["AI next action", "Small and practical"]
            ].map(([label, value]) => (
              <div className="flex items-center justify-between rounded-2xl bg-white/80 p-4 shadow-sm dark:bg-white/10" key={label}>
                <span className="font-semibold">{label}</span>
                <span className="text-sm text-ayuva-muted">{value}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="grid gap-4 md:grid-cols-3">
          {features.map(({ icon: Icon, title, body }) => {
            return (
              <article className="card lift-card p-6" key={title}>
                <Icon className="text-ayuva-green" size={24} aria-hidden />
                <h2 className="mt-5 text-xl font-semibold">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-ayuva-muted">{body}</p>
                <CheckCircle2 className="mt-5 text-ayuva-amber" size={18} aria-hidden />
              </article>
            );
          })}
        </section>
      </section>
    </main>
  );
}
