"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";

type Metrics = {
  totalUsers: number;
  onboardedUsers: number;
  activeUsersLast7Days: number;
  totalCheckins: number;
  totalHabitCompletions: number;
  totalChatMessages: number;
  averageCheckinsPerUser: number;
  habitCompletionRate: number;
  weeklyInsightsGenerated: number;
  safetyEscalationsTriggered: number;
};

export default function AdminMetricsPage() {
  const [password, setPassword] = useState("");
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function unlock(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const response = await fetch("/api/admin-metrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error ?? "Could not load metrics.");
      setLoading(false);
      return;
    }
    setMetrics(result as Metrics);
    setLoading(false);
  }

  return (
    <AppShell showNav={false} title="Admin metrics">
      <section className="mx-auto grid max-w-5xl gap-5">
        <div>
          <p className="text-sm font-black uppercase tracking-normal text-ayuva-green">Beta analytics</p>
          <h1 className="mt-3 text-4xl font-black leading-tight">Admin metrics dashboard.</h1>
        </div>
        {!metrics ? (
          <form className="card grid max-w-md gap-4 p-5" onSubmit={unlock}>
            <label className="label">
              Admin password
              <input className="input" onChange={(event) => setPassword(event.target.value)} type="password" value={password} />
            </label>
            {error ? <p className="text-sm font-bold text-ayuva-rose">{error}</p> : null}
            <button className="primary-button" disabled={loading} type="submit">
              {loading ? "Loading..." : "View metrics"}
            </button>
          </form>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(metrics).map(([key, value]) => (
              <article className="card p-5" key={key}>
                <p className="text-3xl font-black">{value}</p>
                <p className="mt-2 text-xs font-bold uppercase tracking-normal text-ayuva-muted">{labelize(key)}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}

function labelize(value: string) {
  return value.replace(/([A-Z])/g, " $1").trim();
}
