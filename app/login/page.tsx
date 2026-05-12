"use client";

import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { getFirebaseAuth } from "@/lib/firebase-auth";
import { getUserProfile, upsertUserProfile } from "@/lib/firestore";
import { trackEvent } from "@/lib/analytics";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const auth = getFirebaseAuth();
      const credential =
        mode === "signup"
          ? await createUserWithEmailAndPassword(auth, email, password)
          : await signInWithEmailAndPassword(auth, email, password);

      if (mode === "signup") {
        await upsertUserProfile(credential.user.uid, {
          userId: credential.user.uid,
          email: credential.user.email ?? email,
          onboardingCompleted: false
        });
        await trackEvent("signup_completed", {}, credential.user.uid);
        router.replace("/onboarding");
        return;
      }

      await trackEvent("login_completed", {}, credential.user.uid);
      const profile = await getUserProfile(credential.user.uid);
      router.replace(profile?.onboardingCompleted ? "/home" : "/onboarding");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not continue. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell showNav={false} title="Login">
      <section className="mx-auto grid max-w-md gap-5">
        <div className="card calm-surface p-6">
          <p className="text-sm font-semibold uppercase tracking-normal text-ayuva-green">Welcome to Ayuva</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight">{mode === "signup" ? "Start your reset" : "Welcome back"}</h1>
          <p className="mt-2 text-sm leading-6 text-ayuva-muted dark:text-white/60">Email/password only for the first beta.</p>
        </div>
        <form className="card grid gap-4 p-5" onSubmit={handleSubmit}>
          <label className="label">
            Email
            <input className="input" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
          </label>
          <label className="label">
            Password
            <input className="input" minLength={6} onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
          </label>
          {error ? <p className="rounded-xl bg-red-50 p-3 text-sm text-ayuva-rose">{error}</p> : null}
          <button className="primary-button" disabled={loading} type="submit">
            {loading ? "Please wait..." : mode === "signup" ? "Create account" : "Log in"}
          </button>
          <button
            className="text-sm font-bold text-ayuva-green"
            onClick={() => setMode(mode === "signup" ? "login" : "signup")}
            type="button"
          >
            {mode === "signup" ? "Already have an account? Log in" : "New here? Create account"}
          </button>
        </form>
      </section>
    </AppShell>
  );
}
