import type { CheckIn, Habit, HabitLog } from "@/types";

export const primaryGoals = [
  "Better sleep",
  "Less stress",
  "More discipline",
  "Fitness consistency",
  "Better mood",
  "Reduce overthinking",
  "More energy"
] as const;

export const coachingStyles = ["Gentle", "Direct", "Motivational"] as const;

export const defaultHabits = [
  "Walk 15 minutes",
  "Sleep before 12",
  "Drink 2L water",
  "Journal 2 minutes",
  "Stretch 5 minutes",
  "No phone after 11:30 PM",
  "Meditate 5 minutes",
  "Protein breakfast",
  "Read 10 pages",
  "Plan tomorrow"
];

export const suggestedPrompts = [
  "I feel stressed",
  "I skipped my habit",
  "Help me sleep better",
  "I feel low today",
  "Plan my evening routine",
  "Give me a 5-minute reset"
];

export function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function startOfWeek(date = new Date()) {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = copy.getDate() - day + (day === 0 ? -6 : 1);
  copy.setDate(diff);
  return todayKey(copy);
}

export function endOfWeek(date = new Date()) {
  const start = new Date(`${startOfWeek(date)}T00:00:00`);
  start.setDate(start.getDate() + 6);
  return todayKey(start);
}

export function average(values: number[]) {
  const clean = values.filter((value) => Number.isFinite(value));
  if (!clean.length) return 0;
  return Math.round((clean.reduce((sum, value) => sum + value, 0) / clean.length) * 10) / 10;
}

export function wellbeingScore(checkin?: Partial<CheckIn> | null) {
  if (!checkin) return null;
  const mood = ((checkin.moodScore ?? 0) / 10) * 25;
  const stress = ((10 - (checkin.stressScore ?? 10)) / 10) * 25;
  const sleep = Math.min((checkin.sleepHours ?? 0) / 8, 1) * 25;
  const energy = ((checkin.energyScore ?? 0) / 10) * 25;
  return Math.round(mood + stress + sleep + energy);
}

export function recommendHabits(primaryGoal: string) {
  const map: Record<string, string[]> = {
    "Better sleep": ["Sleep before 12", "No phone after 11:30 PM", "Journal 2 minutes"],
    "Less stress": ["Meditate 5 minutes", "Walk 15 minutes", "Journal 2 minutes"],
    "More discipline": ["Plan tomorrow", "Walk 15 minutes", "Read 10 pages"],
    "Fitness consistency": ["Walk 15 minutes", "Stretch 5 minutes", "Protein breakfast"],
    "Better mood": ["Walk 15 minutes", "Journal 2 minutes", "Meditate 5 minutes"],
    "Reduce overthinking": ["Journal 2 minutes", "No phone after 11:30 PM", "Meditate 5 minutes"],
    "More energy": ["Drink 2L water", "Stretch 5 minutes", "Protein breakfast"]
  };
  return map[primaryGoal] ?? defaultHabits.slice(0, 3);
}

export function habitCompletionRate(habits: Habit[], logs: HabitLog[]) {
  if (!habits.length) return 0;
  const completed = logs.filter((log) => log.completed).length;
  return Math.round((completed / habits.length) * 100);
}

export function getStreak(habitId: string, logs: HabitLog[]) {
  let streak = 0;
  const cursor = new Date();
  for (let index = 0; index < 90; index += 1) {
    const date = todayKey(cursor);
    const completed = logs.some((log) => log.habitId === habitId && log.date === date && log.completed);
    if (!completed) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function deterministicCheckinInsight(checkin: Partial<CheckIn>) {
  if ((checkin.sleepHours ?? 8) < 6 && (checkin.stressScore ?? 0) >= 7) {
    return "Your sleep was low and stress is high today. Keep today light: take a 10-minute walk and avoid scrolling before bed.";
  }
  if ((checkin.energyScore ?? 10) < 5) {
    return "Your energy is low today. Choose recovery over intensity: drink water, move for five minutes, and make your next task smaller.";
  }
  if ((checkin.moodScore ?? 10) < 5) {
    return "Your mood is lower today. Try one grounding action: step outside, write one honest sentence, or message someone you trust.";
  }
  return "You have enough capacity for a steady day. Complete one habit early and keep the evening simple.";
}
