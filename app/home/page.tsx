"use client";

import { collection, getDocs, query, where } from "firebase/firestore";
import Link from "next/link";
import { BarChart3, Leaf, MessageCircle, PenLine } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { AuthGate } from "@/components/AuthGate";
import { HabitCard } from "@/components/HabitCard";
import { InsightCard } from "@/components/InsightCard";
import { WellbeingScore } from "@/components/WellbeingScore";
import { CalmReveal } from "@/components/ui/Motion";
import { trackEvent } from "@/lib/analytics";
import { db } from "@/lib/firebase";
import { getStreak, todayKey, wellbeingScore } from "@/lib/utils";
import type { CheckIn, Habit, HabitLog, UserProfile } from "@/types";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

export default function HomePage() {
  return (
    <AppShell title="Dashboard" subtitle="One small action today">
      <AuthGate>{({ user, profile }) => <HomeClient profile={profile} userId={user.uid} />}</AuthGate>
    </AppShell>
  );
}

function HomeClient({ userId, profile }: { userId: string; profile: UserProfile | null }) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [checkin, setCheckin] = useState<CheckIn | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [habitSnapshot, logSnapshot, checkinSnapshot] = await Promise.all([
        getDocs(query(collection(db, "habits"), where("userId", "==", userId), where("active", "==", true))),
        getDocs(query(collection(db, "habit_logs"), where("userId", "==", userId), where("date", "==", todayKey()))),
        getDocs(query(collection(db, "checkins"), where("userId", "==", userId), where("date", "==", todayKey())))
      ]);
      setHabits(habitSnapshot.docs.map((item) => item.data() as Habit));
      setLogs(logSnapshot.docs.map((item) => item.data() as HabitLog));
      setCheckin((checkinSnapshot.docs[0]?.data() as CheckIn | undefined) ?? null);
      setLoading(false);
    }
    void load();
  }, [userId]);

  const score = useMemo(() => wellbeingScore(checkin), [checkin]);
  const streakSummary = habits.length ? `${Math.max(...habits.map((habit) => getStreak(habit.habitId, logs)))} day rhythm` : "No active habits yet";
  const suggestedAction = checkin?.aiInsight ?? "Complete today's check-in so Ayuva can suggest one gentle action.";

  async function toggleHabit(habit: Habit) {
    const logId = `${userId}_${habit.habitId}_${todayKey()}`;
    const existing = logs.find((log) => log.habitId === habit.habitId);
    const completed = !existing?.completed;
    await setDoc(
      doc(db, "habit_logs", logId),
      {
        logId,
        habitId: habit.habitId,
        userId,
        date: todayKey(),
        completed,
        completedAt: completed ? serverTimestamp() : null
      },
      { merge: true }
    );
    if (completed) await trackEvent("habit_completed", { habitId: habit.habitId, habitName: habit.name }, userId);
    setLogs((current) => {
      const rest = current.filter((log) => log.habitId !== habit.habitId);
      return [
        ...rest,
        {
          logId,
          habitId: habit.habitId,
          userId,
          date: todayKey(),
          completed,
          completedAt: existing?.completedAt
        } as HabitLog
      ];
    });
  }

  if (loading) {
    return <div className="card p-6 text-sm font-bold text-ayuva-muted">Loading your dashboard...</div>;
  }

  return (
    <CalmReveal className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
      <div className="grid gap-5">
        <div className="card calm-surface lift-card relative overflow-hidden p-6">
          <div className="absolute right-5 top-5 grid size-14 place-items-center rounded-3xl bg-white/70 shadow-sm floaty dark:bg-white/10">
            <Leaf className="text-ayuva-greenDark dark:text-emerald-100" size={24} aria-hidden />
          </div>
          <p className="text-sm font-semibold uppercase tracking-normal text-ayuva-greenDark dark:text-emerald-100">Today</p>
          <h1 className="mt-3 max-w-[17rem] text-4xl font-semibold leading-tight md:max-w-none md:text-5xl">
            Hi{profile?.name ? `, ${profile.name}` : ""}. Take a slow start.
          </h1>
          <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/75 px-4 py-2 text-sm font-semibold text-ayuva-greenDark shadow-sm dark:bg-white/10 dark:text-white">
            {streakSummary}
          </p>
        </div>
        <WellbeingScore score={score} />
        <InsightCard title="Suggested action">{suggestedAction}</InsightCard>
        <div className="grid gap-3 sm:grid-cols-3">
          <ActionTile href="/checkin" icon={<PenLine size={20} aria-hidden />} label={checkin ? "Update check-in" : "Check in"} tone="green" />
          <ActionTile href="/chat" icon={<MessageCircle size={20} aria-hidden />} label="Talk gently" tone="plum" />
          <ActionTile href="/insights" icon={<BarChart3 size={20} aria-hidden />} label="Reflect" tone="sky" />
        </div>
      </div>
      <section className="grid content-start gap-3">
        <div className="card bg-white/70 p-5 dark:bg-white/5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-normal text-ayuva-green">Today’s focus</p>
              <h2 className="mt-1 text-2xl font-semibold">One thing at a time</h2>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <MiniMetric label="Score" value={score === null ? "-" : String(score)} />
            <MiniMetric label="Habits" value={`${logs.filter((log) => log.completed).length}/${habits.length || 0}`} />
            <MiniMetric label="Check-in" value={checkin ? "Yes" : "No"} />
          </div>
        </div>
        <div className="flex items-end justify-between px-1">
          <div>
            <h2 className="text-2xl font-black">Active habits</h2>
            <p className="text-sm text-ayuva-muted dark:text-white/60">Tap to complete today's habit.</p>
          </div>
          <Link className="text-sm font-bold text-ayuva-green" href="/habits">
            Edit
          </Link>
        </div>
        {habits.map((habit) => {
          const completed = logs.some((log) => log.habitId === habit.habitId && log.completed);
          return (
            <HabitCard completed={completed} habit={habit} key={habit.habitId} onToggle={() => void toggleHabit(habit)} streak={getStreak(habit.habitId, logs)} />
          );
        })}
        {!habits.length ? (
          <Link className="secondary-button" href="/habits">
            Set up habits
          </Link>
        ) : null}
      </section>
    </CalmReveal>
  );
}

function ActionTile({ href, icon, label, tone }: { href: string; icon: ReactNode; label: string; tone: "green" | "plum" | "sky" }) {
  const tones = {
    green: "bg-ayuva-mint text-ayuva-greenDark dark:bg-emerald-500/10 dark:text-emerald-100",
    plum: "bg-[#f0edf7] text-[#5a4f74] dark:bg-ayuva-plum/10 dark:text-[#d9d0ec]",
    sky: "bg-ayuva-sky text-ayuva-greenDark dark:bg-white/10 dark:text-white"
  };
  return (
    <Link className={`lift-card flex min-h-28 flex-col justify-between rounded-[1.375rem] p-4 font-semibold shadow-soft ${tones[tone]}`} href={href}>
      <span className="grid size-11 place-items-center rounded-2xl bg-white/45 dark:bg-white/10">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-ayuva-cream p-3 dark:bg-white/10">
      <p className="text-lg font-semibold">{value}</p>
      <p className="text-[0.68rem] font-semibold uppercase tracking-normal text-ayuva-muted dark:text-white/60">{label}</p>
    </div>
  );
}
