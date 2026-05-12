"use client";

import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { AuthGate } from "@/components/AuthGate";
import { InsightCard } from "@/components/InsightCard";
import { trackEvent } from "@/lib/analytics";
import { db } from "@/lib/firebase";
import { average, endOfWeek, habitCompletionRate, startOfWeek } from "@/lib/utils";
import type { CheckIn, Habit, HabitLog, UserProfile } from "@/types";

export default function InsightsPage() {
  return (
    <AppShell title="Insights" subtitle="7-day patterns">
      <AuthGate>{({ user, profile }) => <InsightsClient profile={profile} userId={user.uid} />}</AuthGate>
    </AppShell>
  );
}

function InsightsClient({ userId, profile }: { userId: string; profile: UserProfile | null }) {
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const weekStart = startOfWeek();

  useEffect(() => {
    async function load() {
      const [checkinSnapshot, habitSnapshot, logSnapshot] = await Promise.all([
        getDocs(query(collection(db, "checkins"), where("userId", "==", userId), where("date", ">=", weekStart))),
        getDocs(query(collection(db, "habits"), where("userId", "==", userId), where("active", "==", true))),
        getDocs(query(collection(db, "habit_logs"), where("userId", "==", userId), where("date", ">=", weekStart)))
      ]);
      setCheckins(checkinSnapshot.docs.map((item) => item.data() as CheckIn));
      setHabits(habitSnapshot.docs.map((item) => item.data() as Habit));
      setLogs(logSnapshot.docs.map((item) => item.data() as HabitLog));
    }
    void load();
  }, [userId, weekStart]);

  const metrics = {
    moodAverage: average(checkins.map((item) => item.moodScore)),
    stressAverage: average(checkins.map((item) => item.stressScore)),
    sleepAverage: average(checkins.map((item) => item.sleepHours)),
    energyAverage: average(checkins.map((item) => item.energyScore)),
    habitCompletionRate: habitCompletionRate(habits, logs)
  };
  const habitCounts = habits.map((habit) => ({
    name: habit.name,
    completed: logs.filter((log) => log.habitId === habit.habitId && log.completed).length
  }));
  const best = [...habitCounts].sort((a, b) => b.completed - a.completed)[0]?.name ?? "-";
  const missed = [...habitCounts].sort((a, b) => a.completed - b.completed)[0]?.name ?? "-";
  const recommendation =
    metrics.sleepAverage && metrics.sleepAverage < 6.5
      ? "Make sleep the main focus next week."
      : metrics.habitCompletionRate < 50
        ? "Reduce habit difficulty instead of adding more goals."
        : "Keep the same habits and protect your evening routine.";

  async function generateReflection() {
    setLoading(true);
    const response = await fetch("/api/weekly-reflection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        userContext: {
          user: profile,
          activeHabits: habits,
          metrics: {
            ...metrics,
            bestCompletedHabit: best,
            mostMissedHabit: missed,
            checkins
          }
        },
        weekStartDate: weekStart,
        weekEndDate: endOfWeek()
      })
    });
    const result = (await response.json()) as { content?: string };
    setSummary(result.content ?? "Ayuva could not generate a weekly reflection right now.");
    await trackEvent("weekly_insight_generated", metrics, userId);
    setLoading(false);
  }

  return (
    <section className="mx-auto grid max-w-4xl gap-5">
      <div className="card calm-surface relative overflow-hidden p-6">
        <p className="text-sm font-semibold uppercase tracking-normal text-ayuva-green">Weekly insight</p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight">Your 7-day pattern.</h1>
        <p className="mt-2 text-sm font-semibold text-ayuva-muted dark:text-white/60">A quick look at what helped, what drained you, and what to keep simple.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Mood average" value={metrics.moodAverage ? `${metrics.moodAverage}/10` : "-"} />
        <Metric label="Stress average" value={metrics.stressAverage ? `${metrics.stressAverage}/10` : "-"} />
        <Metric label="Sleep average" value={metrics.sleepAverage ? `${metrics.sleepAverage}h` : "-"} />
        <Metric label="Energy average" value={metrics.energyAverage ? `${metrics.energyAverage}/10` : "-"} />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <Metric label="Habit completion" value={`${metrics.habitCompletionRate}%`} />
        <Metric label="Best completed habit" value={best} />
        <Metric label="Most missed habit" value={missed} />
      </div>
      <InsightCard title="Simple recommendation">{recommendation}</InsightCard>
      <section className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-black">Mood trend</h2>
          <span className="text-xs font-bold text-ayuva-muted">Last 7 days</span>
        </div>
        <div className="flex h-40 items-end gap-2 border-b border-l border-black/10 px-2 pt-2">
          {checkins.length ? (
            checkins.map((checkin) => (
              <div
                className="min-h-2 flex-1 rounded-t-xl bg-ayuva-amber"
                key={checkin.checkinId}
                style={{ height: `${Math.max(checkin.moodScore * 10, 8)}%` }}
                title={`${checkin.date}: ${checkin.moodScore}/10`}
              />
            ))
          ) : (
            <p className="self-center text-sm font-semibold text-ayuva-muted">Complete check-ins to see a chart.</p>
          )}
        </div>
      </section>
      {summary ? <InsightCard title="AI weekly reflection">{summary}</InsightCard> : null}
      <button className="primary-button" disabled={loading} onClick={generateReflection} type="button">
        {loading ? "Generating..." : "Generate AI weekly reflection"}
      </button>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article className="card lift-card p-5">
      <p className="text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-xs font-semibold text-ayuva-muted dark:text-white/60">{label}</p>
    </article>
  );
}
