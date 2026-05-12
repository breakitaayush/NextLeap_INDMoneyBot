import type { AIMode, AIMessage, UserContext } from "@/types";

export const AYUVA_SYSTEM_PROMPT =
  "You are Ayuva, a calm wellbeing companion for habits, mood, stress, sleep, focus, and routines. Be warm, practical, non-judgmental, and brief. Give one small next step and at most one question. No markdown, labels, bullets, diagnosis, medicine advice, therapy claims, romance, dependency, or unrelated help. Redirect coding, trivia, politics, homework, and general knowledge back to wellbeing. If self-harm, overdose, chest pain, breathing difficulty, or immediate danger appears, recommend urgent human/emergency support.";

export function buildPrompt(mode: AIMode, userMessage: string, userContext: UserContext, recentMessages: AIMessage[] = []) {
  const context = compactContext(userContext, recentMessages);

  const modeInstruction: Record<AIMode, string> = {
    chat: "Reply in 2-4 short sentences. Plain text only.",
    checkin_insight: "Daily insight in <=35 words. Plain text only.",
    weekly_reflection:
      "Weekly reflection in <=90 words. Include one pattern and one focus. Plain text only."
  };

  return `${modeInstruction[mode]}\nContext: ${context}\nUser: ${userMessage}`;
}

export function tokenLimitForMode(mode: AIMode) {
  return {
    chat: 180,
    checkin_insight: 80,
    weekly_reflection: 260
  }[mode];
}

function compactContext(userContext: UserContext, recentMessages: AIMessage[]) {
  const latest = userContext.latestCheckin;
  const metrics = userContext.metrics;
  return [
    userContext.user?.name ? `name=${userContext.user.name}` : "",
    userContext.user?.primaryGoal ? `goal=${userContext.user.primaryGoal}` : "",
    userContext.user?.coachingStyle ? `style=${userContext.user.coachingStyle}` : "",
    userContext.user?.biggestStruggle ? `struggle=${String(userContext.user.biggestStruggle).slice(0, 90)}` : "",
    userContext.activeHabits?.length ? `habits=${userContext.activeHabits.map((habit) => habit.name).slice(0, 3).join(", ")}` : "",
    latest ? `checkin=mood ${latest.moodScore ?? "-"}, stress ${latest.stressScore ?? "-"}, sleep ${latest.sleepHours ?? "-"}h, energy ${latest.energyScore ?? "-"}` : "",
    metrics ? `metrics=${JSON.stringify(metrics).slice(0, 420)}` : "",
    recentMessages.length
      ? `recent=${recentMessages
          .slice(-3)
          .map((message) => `${message.role[0]}:${message.content.slice(0, 80)}`)
          .join(" | ")}`
      : ""
  ]
    .filter(Boolean)
    .join("; ");
}
