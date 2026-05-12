"use client";

import { addDoc, collection, getDocs, limit, orderBy, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { Bot, Send, Sparkles } from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { AuthGate } from "@/components/AuthGate";
import { ChatBubble } from "@/components/ChatBubble";
import { PromptChips } from "@/components/PromptChips";
import { trackEvent } from "@/lib/analytics";
import { db } from "@/lib/firebase";
import type { ChatMessage, CheckIn, Habit, UserProfile } from "@/types";

export default function ChatPage() {
  return (
    <AppShell title="AI companion" subtitle="Habits, stress, sleep, routines">
      <AuthGate>{({ user, profile }) => <ChatClient profile={profile} userId={user.uid} />}</AuthGate>
    </AppShell>
  );
}

function ChatClient({ userId, profile }: { userId: string; profile: UserProfile | null }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [latestCheckin, setLatestCheckin] = useState<CheckIn | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      const [messageSnapshot, habitSnapshot, checkinSnapshot] = await Promise.all([
        getDocs(query(collection(db, "chat_messages"), where("userId", "==", userId), orderBy("createdAt", "desc"), limit(20))),
        getDocs(query(collection(db, "habits"), where("userId", "==", userId), where("active", "==", true))),
        getDocs(query(collection(db, "checkins"), where("userId", "==", userId), orderBy("date", "desc"), limit(1)))
      ]);
      setMessages(messageSnapshot.docs.map((item) => item.data() as ChatMessage).reverse());
      setHabits(habitSnapshot.docs.map((item) => item.data() as Habit));
      setLatestCheckin((checkinSnapshot.docs[0]?.data() as CheckIn | undefined) ?? null);
    }
    void load();
  }, [userId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(event?: FormEvent) {
    event?.preventDefault();
    const content = input.trim();
    if (!content || loading) return;
    setInput("");
    setError("");
    setLoading(true);
    await trackEvent("chat_started", {}, userId);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          userMessage: content,
          userContext: {
            user: profile,
            activeHabits: habits,
            latestCheckin
          },
          recentMessages: messages.slice(-3).map((message) => ({ role: message.role, content: message.content.slice(0, 220) }))
        })
      });
      const result = (await response.json()) as { messages?: ChatMessage[]; error?: string };
      if (!response.ok) throw new Error(result.error || "Ayuva could not respond.");
      if (result.messages) {
        setMessages((current) => [...current, ...result.messages!]);
        await Promise.all(result.messages.map((message) => persistChatMessage(message)));
        const assistant = result.messages.find((message) => message.role === "assistant");
        if (assistant?.riskLevel === "high") {
          await trackEvent("safety_escalation_triggered", { source: "chat" }, userId);
        }
        await trackEvent("ai_response_generated", { mode: "chat", riskLevel: assistant?.riskLevel ?? "low" }, userId);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto grid h-[calc(100vh-9rem)] max-w-3xl grid-rows-[auto_auto_1fr_auto] gap-3">
      <div className="card calm-surface relative overflow-hidden p-5">
        <div className="absolute right-4 top-4 grid size-12 place-items-center rounded-2xl bg-white/70 dark:bg-white/10">
          <Bot className="text-ayuva-greenDark dark:text-emerald-100" size={24} aria-hidden />
        </div>
        <p className="text-sm font-semibold uppercase tracking-normal text-ayuva-green">Ayuva chat</p>
        <h1 className="mt-2 max-w-[15rem] text-3xl font-semibold leading-tight">Talk through what feels heavy.</h1>
      </div>
      <PromptChips onSelect={setInput} />
      <div className="grid content-start gap-3 overflow-y-auto rounded-2xl bg-white/50 p-3 dark:bg-white/5">
        {messages.length ? null : (
          <div className="card p-5 text-sm leading-6 text-ayuva-muted dark:text-white/60">
            <Sparkles className="mb-3 text-ayuva-amber" size={22} aria-hidden />
            Share what is happening with your mood, stress, sleep, habits, focus, or routine. Ayuva will keep the next step small.
          </div>
        )}
        {messages.map((message) => (
          <ChatBubble key={message.messageId} message={message} />
        ))}
        {loading ? <div className="text-sm font-bold text-ayuva-muted">Ayuva is thinking...</div> : null}
        <div ref={scrollRef} />
      </div>
      <form className="grid grid-cols-[1fr_auto] gap-2" onSubmit={sendMessage}>
        <input
          className="input"
          onChange={(event) => setInput(event.target.value)}
          placeholder="Talk about habits, mood, sleep, stress, or focus..."
          value={input}
        />
        <button className="primary-button min-w-14 px-4" disabled={loading} type="submit">
          <Send size={18} aria-hidden />
        </button>
      </form>
      {error ? <p className="rounded-xl bg-red-50 p-3 text-sm text-ayuva-rose">{error}</p> : null}
    </section>
  );
}

async function persistChatMessage(message: ChatMessage) {
  const ref = await addDoc(collection(db, "chat_messages"), {
    userId: message.userId,
    role: message.role,
    content: message.content,
    intent: message.intent,
    riskLevel: message.riskLevel,
    createdAt: serverTimestamp()
  });
  await updateDoc(ref, { messageId: ref.id });
}
