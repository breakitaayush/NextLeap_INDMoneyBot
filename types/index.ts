import type { Timestamp } from "firebase/firestore";

export type CoachingStyle = "Gentle" | "Direct" | "Motivational";

export type PrimaryGoal =
  | "Better sleep"
  | "Less stress"
  | "More discipline"
  | "Fitness consistency"
  | "Better mood"
  | "Reduce overthinking"
  | "More energy";

export type UserProfile = {
  userId: string;
  name: string;
  email: string;
  ageRange: string;
  primaryGoal: PrimaryGoal;
  biggestStruggle: string;
  coachingStyle: CoachingStyle;
  reminderTime: string;
  onboardingCompleted: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type Habit = {
  habitId: string;
  userId: string;
  name: string;
  goalCategory: string;
  targetFrequency: "daily" | "weekly";
  targetTime: string;
  active: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type HabitLog = {
  logId: string;
  habitId: string;
  userId: string;
  date: string;
  completed: boolean;
  completedAt: Timestamp;
};

export type CheckIn = {
  checkinId: string;
  userId: string;
  date: string;
  moodScore: number;
  stressScore: number;
  sleepHours: number;
  energyScore: number;
  note?: string;
  aiInsight?: string;
  createdAt: Timestamp;
};

export type ChatMessage = {
  messageId: string;
  userId: string;
  role: "user" | "assistant";
  content: string;
  intent: string;
  riskLevel: RiskLevel;
  createdAt: Timestamp;
};

export type WeeklyInsight = {
  insightId: string;
  userId: string;
  weekStartDate: string;
  weekEndDate: string;
  moodAverage: number;
  stressAverage: number;
  sleepAverage: number;
  energyAverage: number;
  habitCompletionRate: number;
  aiSummary: string;
  recommendation: string;
  createdAt: Timestamp;
};

export type AnalyticsEvent = {
  eventId: string;
  userId: string;
  eventName: string;
  properties: Record<string, unknown>;
  createdAt: Timestamp;
};

export type RiskLevel = "low" | "high";

export type UserContext = {
  user?: Partial<UserProfile> | null;
  activeHabits?: Array<Pick<Habit, "habitId" | "name" | "targetTime" | "goalCategory">>;
  latestCheckin?: Partial<CheckIn> | null;
  metrics?: Record<string, unknown>;
};

export type AIMessage = {
  role: "user" | "assistant";
  content: string;
};

export type AIMode = "chat" | "checkin_insight" | "weekly_reflection";

export type GenerateAIResponseArgs = {
  mode: AIMode;
  userMessage: string;
  userContext: UserContext;
  recentMessages?: AIMessage[];
};
