"use client";

import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { AuthGate } from "@/components/AuthGate";
import { CheckInForm } from "@/components/CheckInForm";
import { InsightCard } from "@/components/InsightCard";
import { trackEvent } from "@/lib/analytics";
import { db } from "@/lib/firebase";
import { deterministicCheckinInsight, todayKey } from "@/lib/utils";

export default function CheckinPage() {
  return (
    <AppShell title="Daily check-in" subtitle="Under 60 seconds">
      <AuthGate>{({ user, profile }) => <CheckinClient profile={profile} userId={user.uid} />}</AuthGate>
    </AppShell>
  );
}

function CheckinClient({ userId }: { userId: string; profile: unknown }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState("");

  async function submit(data: { moodScore: number; stressScore: number; sleepHours: number; energyScore: number; note: string }) {
    setLoading(true);
    const deterministic = deterministicCheckinInsight(data);
    const aiInsight = deterministic;

    const checkinId = `${userId}_${todayKey()}`;
    await setDoc(doc(db, "checkins", checkinId), {
      checkinId,
      userId,
      date: todayKey(),
      ...data,
      aiInsight,
      createdAt: serverTimestamp()
    });
    await trackEvent("checkin_completed", { date: todayKey() }, userId);
    setInsight(aiInsight);
    setLoading(false);
    window.setTimeout(() => router.replace("/home"), 1200);
  }

  return (
    <section className="mx-auto grid max-w-2xl gap-5">
      <div className="card calm-surface relative overflow-hidden p-6">
        <p className="text-sm font-semibold uppercase tracking-normal text-ayuva-green">Daily check-in</p>
        <h1 className="mt-3 max-w-xs text-4xl font-semibold leading-tight">How are you today?</h1>
        <p className="mt-2 text-sm leading-6 text-ayuva-muted dark:text-white/60">Four gentle questions and one honest note.</p>
      </div>
      {insight ? <InsightCard>{insight}</InsightCard> : null}
      <section className="card p-5">
        <CheckInForm loading={loading} onSubmit={submit} />
      </section>
    </section>
  );
}
