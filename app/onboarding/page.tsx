"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { AuthGate } from "@/components/AuthGate";
import { trackEvent } from "@/lib/analytics";
import { upsertUserProfile } from "@/lib/firestore";
import { coachingStyles, primaryGoals } from "@/lib/utils";
import type { CoachingStyle, PrimaryGoal } from "@/types";

export default function OnboardingPage() {
  return (
    <AppShell showNav={false} title="Onboarding">
      <AuthGate requireOnboarding={false}>
        {({ user, profile }) => <OnboardingForm email={user.email ?? ""} userId={user.uid} initialName={profile?.name ?? ""} />}
      </AuthGate>
    </AppShell>
  );
}

function OnboardingForm({ userId, email, initialName }: { userId: string; email: string; initialName: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: initialName,
    ageRange: "22-30",
    primaryGoal: "Better sleep" as PrimaryGoal,
    biggestStruggle: "",
    coachingStyle: "Gentle" as CoachingStyle,
    reminderTime: "20:30"
  });

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    await upsertUserProfile(userId, {
      ...form,
      userId,
      email,
      onboardingCompleted: true
    });
    await trackEvent("onboarding_completed", { primaryGoal: form.primaryGoal, coachingStyle: form.coachingStyle }, userId);
    router.replace("/habits");
  }

  return (
    <section className="mx-auto grid max-w-2xl gap-5">
      <div className="card calm-surface p-6">
        <p className="text-sm font-semibold uppercase tracking-normal text-ayuva-green">60-second setup</p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight">Help Ayuva support you gently.</h1>
        <p className="mt-2 text-sm leading-6 text-ayuva-muted dark:text-white/60">This keeps the product focused on your habits, routines, stress, sleep, and consistency.</p>
      </div>
      <form className="card grid gap-5 p-5" onSubmit={submit}>
        <label className="label">
          Name
          <input className="input" onChange={(event) => setForm({ ...form, name: event.target.value })} required value={form.name} />
        </label>
        <label className="label">
          Age range
          <select className="input" onChange={(event) => setForm({ ...form, ageRange: event.target.value })} value={form.ageRange}>
            <option>18-21</option>
            <option>22-30</option>
            <option>31-40</option>
            <option>41+</option>
          </select>
        </label>
        <label className="label">
          Primary goal
          <select
            className="input"
            onChange={(event) => setForm({ ...form, primaryGoal: event.target.value as PrimaryGoal })}
            value={form.primaryGoal}
          >
            {primaryGoals.map((goal) => (
              <option key={goal}>{goal}</option>
            ))}
          </select>
        </label>
        <label className="label">
          Biggest struggle
          <textarea
            className="input min-h-28"
            onChange={(event) => setForm({ ...form, biggestStruggle: event.target.value })}
            placeholder="Example: I feel drained after work and skip my evening routine."
            required
            value={form.biggestStruggle}
          />
        </label>
        <label className="label">
          Coaching style
          <select
            className="input"
            onChange={(event) => setForm({ ...form, coachingStyle: event.target.value as CoachingStyle })}
            value={form.coachingStyle}
          >
            {coachingStyles.map((style) => (
              <option key={style}>{style}</option>
            ))}
          </select>
        </label>
        <label className="label">
          Reminder time
          <input className="input" onChange={(event) => setForm({ ...form, reminderTime: event.target.value })} type="time" value={form.reminderTime} />
        </label>
        <button className="primary-button" disabled={loading} type="submit">
          {loading ? "Saving..." : "Continue to habits"}
        </button>
      </form>
    </section>
  );
}
