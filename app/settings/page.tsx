"use client";

import { collection, getDocs, query, where } from "firebase/firestore";
import { signOut } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { AuthGate } from "@/components/AuthGate";
import { getFirebaseAuth } from "@/lib/firebase-auth";
import { db } from "@/lib/firebase";
import { applyTheme, getStoredTheme, type Theme } from "@/lib/theme";
import type { Habit, UserProfile } from "@/types";

export default function SettingsPage() {
  const router = useRouter();
  return (
    <AppShell title="Settings" subtitle="Profile and boundaries">
      <AuthGate>
        {({ user, profile }) => <SettingsClient profile={profile} userId={user.uid} />}
      </AuthGate>
    </AppShell>
  );
}

function SettingsClient({ userId, profile }: { userId: string; profile: UserProfile | null }) {
  const router = useRouter();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    setTheme(getStoredTheme());
    async function load() {
      const snapshot = await getDocs(query(collection(db, "habits"), where("userId", "==", userId), where("active", "==", true)));
      setHabits(snapshot.docs.map((item) => item.data() as Habit));
    }
    void load();
  }, [userId]);

  return (
    <section className="mx-auto grid max-w-2xl gap-5">
      <div className="card calm-surface p-6">
        <p className="text-sm font-semibold uppercase tracking-normal text-ayuva-green">Settings</p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight">Make Ayuva feel yours.</h1>
      </div>
      <section className="card grid gap-3 p-5 text-sm">
        <Row label="Name" value={profile?.name ?? "-"} />
        <Row label="Selected goal" value={profile?.primaryGoal ?? "-"} />
        <Row label="Coaching style" value={profile?.coachingStyle ?? "-"} />
        <Row label="Reminder time" value={profile?.reminderTime ?? "-"} />
        <div className="rounded-2xl border border-black/5 bg-white/75 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.07]">
          <p className="font-semibold text-ayuva-muted dark:text-white/65">Active habits</p>
          <p className="mt-2 text-sm font-semibold text-ayuva-ink dark:text-white">
            {habits.length ? habits.map((habit) => habit.name).join(", ") : "No active habits yet"}
          </p>
        </div>
        <Link className="secondary-button mt-2" href="/habits">
          Edit active habits
        </Link>
      </section>
      <section className="card grid gap-4 p-5">
        <div>
          <h2 className="text-lg font-black">Appearance</h2>
          <p className="mt-1 text-sm text-ayuva-muted dark:text-white/60">Choose the theme that feels easier on your eyes.</p>
        </div>
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-black/5 p-1 dark:bg-black/20">
          {(["light", "dark"] as const).map((option) => (
            <button
              className={`focus-ring rounded-xl px-4 py-3 text-sm font-semibold capitalize transition ${
                theme === option
                  ? "bg-white text-ayuva-greenDark shadow-sm dark:bg-white/15 dark:text-white"
                  : "text-ayuva-muted hover:bg-white/60 dark:text-white/70 dark:hover:bg-white/10"
              }`}
              key={option}
              onClick={() => {
                setTheme(option);
                applyTheme(option);
              }}
              type="button"
            >
              {option}
            </button>
          ))}
        </div>
      </section>
      <section className="card border-ayuva-rose/15 bg-red-50/70 p-5 dark:border-white/10 dark:bg-white/[0.06]">
        <h2 className="text-lg font-semibold text-ayuva-ink dark:text-white">Disclaimer</h2>
        <p className="mt-2 text-sm leading-6 text-ayuva-muted dark:text-white/72">
          Ayuva supports reflection, habits, stress management, sleep routines, focus, and daily wellbeing. It is not medical advice, a
          diagnosis app, a therapy replacement, or an emergency service.
        </p>
      </section>
      <button
        className="secondary-button"
        onClick={async () => {
          const auth = getFirebaseAuth();
          await signOut(auth);
          router.replace("/");
        }}
        type="button"
      >
        Logout
      </button>
      <button className="text-left text-sm font-semibold text-ayuva-rose dark:text-[#f0b6b6]" type="button">
        Delete my data
      </button>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-black/5 bg-white/75 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.07]">
      <span className="font-semibold text-ayuva-muted dark:text-white/65">{label}</span>
      <span className="text-right font-semibold text-ayuva-ink dark:text-white">{value}</span>
    </div>
  );
}
