"use client";

import { addDoc, collection, doc, getDocs, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { Plus, Target } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { AuthGate } from "@/components/AuthGate";
import { EmptyState } from "@/components/EmptyState";
import { HabitCard } from "@/components/HabitCard";
import { trackEvent } from "@/lib/analytics";
import { db } from "@/lib/firebase";
import { defaultHabits, recommendHabits } from "@/lib/utils";
import type { Habit, UserProfile } from "@/types";

export default function HabitsPage() {
  return (
    <AppShell title="Habits" subtitle="Keep active habits to 1-3">
      <AuthGate>{({ user, profile }) => <HabitsClient profile={profile} userId={user.uid} />}</AuthGate>
    </AppShell>
  );
}

function HabitsClient({ userId, profile }: { userId: string; profile: UserProfile | null }) {
  const router = useRouter();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [customHabit, setCustomHabit] = useState("");
  const [loading, setLoading] = useState(true);
  const recommendations = useMemo(() => recommendHabits(profile?.primaryGoal ?? "Better sleep"), [profile?.primaryGoal]);
  const options = Array.from(new Set([...recommendations, ...defaultHabits, ...habits.map((habit) => habit.name)]));

  useEffect(() => {
    async function load() {
      const snapshot = await getDocs(query(collection(db, "habits"), where("userId", "==", userId)));
      const loaded = snapshot.docs.map((item) => item.data() as Habit);
      setHabits(loaded);
      setSelected(loaded.filter((habit) => habit.active).map((habit) => habit.name));
      setLoading(false);
    }
    void load();
  }, [userId]);

  function toggleHabit(name: string) {
    setSelected((current) => {
      if (current.includes(name)) return current.filter((item) => item !== name);
      if (current.length >= 3) return current;
      return [...current, name];
    });
  }

  async function saveHabits() {
    const allNames = Array.from(new Set([...selected, ...habits.map((habit) => habit.name)]));
    await Promise.all(
      allNames.map(async (name) => {
        const existing = habits.find((habit) => habit.name === name);
        if (existing) {
          await updateDoc(doc(db, "habits", existing.habitId), {
            active: selected.includes(name),
            updatedAt: serverTimestamp()
          });
          return;
        }
        const ref = await addDoc(collection(db, "habits"), {
          userId,
          name,
          goalCategory: profile?.primaryGoal ?? "General wellbeing",
          targetFrequency: "daily",
          targetTime: "Flexible",
          active: selected.includes(name),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        await updateDoc(ref, { habitId: ref.id });
        await trackEvent("habit_created", { name }, userId);
      })
    );
    router.replace("/home");
  }

  if (loading) return <EmptyState title="Loading habits" body="Ayuva is checking your active routine." />;

  return (
    <section className="mx-auto grid max-w-3xl gap-5">
      <div className="card calm-surface relative overflow-hidden p-6">
        <Target className="absolute right-5 top-5 text-ayuva-amber" size={34} aria-hidden />
        <p className="text-sm font-semibold uppercase tracking-normal text-ayuva-green">Habit setup</p>
        <h1 className="mt-3 max-w-sm text-4xl font-semibold leading-tight">Choose what feels repeatable.</h1>
        <p className="mt-2 max-w-md text-sm leading-6 text-ayuva-muted dark:text-white/60">Ayuva gets better when the routine stays small enough to repeat.</p>
      </div>
      <section className="card grid gap-3 p-5">
        {options.map((name) => {
          const active = selected.includes(name);
          return (
            <button
              className={`focus-ring rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                active ? "border-ayuva-green bg-ayuva-mint text-ayuva-greenDark shadow-sm dark:bg-emerald-500/10 dark:text-emerald-100" : "border-black/10 bg-white dark:border-white/10 dark:bg-white/10"
              }`}
              key={name}
              onClick={() => toggleHabit(name)}
              type="button"
            >
              {name}
            </button>
          );
        })}
        <div className="mt-2 flex gap-2">
          <input
            className="input"
            onChange={(event) => setCustomHabit(event.target.value)}
            placeholder="Create custom habit"
            value={customHabit}
          />
          <button
            className="secondary-button shrink-0"
            onClick={() => {
              const trimmed = customHabit.trim();
              if (!trimmed || selected.length >= 3) return;
              setSelected((current) => [...current, trimmed]);
              setCustomHabit("");
            }}
            type="button"
          >
            <Plus size={18} aria-hidden />
          </button>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
          <div className="h-full rounded-full bg-ayuva-green transition-all" style={{ width: `${(selected.length / 3) * 100}%` }} />
        </div>
        <p className="text-xs font-semibold text-ayuva-muted dark:text-white/60">{selected.length}/3 active habits selected</p>
        <button className="primary-button" disabled={!selected.length} onClick={saveHabits} type="button">
          Save and go home
        </button>
      </section>
      {habits.length ? (
        <section className="grid gap-3">
          {habits
            .filter((habit) => habit.active)
            .map((habit) => (
              <HabitCard habit={habit} key={habit.habitId} />
            ))}
        </section>
      ) : null}
    </section>
  );
}
