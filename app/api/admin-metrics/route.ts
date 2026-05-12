import { collection, getDocs, query, where } from "firebase/firestore";
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";

export async function POST(request: Request) {
  const { password } = (await request.json()) as { password?: string };
  if (!process.env.ADMIN_METRICS_PASSWORD || password !== process.env.ADMIN_METRICS_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const dateKey = sevenDaysAgo.toISOString().slice(0, 10);

  const [users, checkins, completions, chatMessages, weeklyInsights, safetyEvents] = await Promise.all([
    getDocs(collection(db, "users")),
    getDocs(collection(db, "checkins")),
    getDocs(query(collection(db, "habit_logs"), where("completed", "==", true))),
    getDocs(collection(db, "chat_messages")),
    getDocs(collection(db, "weekly_insights")),
    getDocs(query(collection(db, "analytics_events"), where("eventName", "==", "safety_escalation_triggered")))
  ]);

  const userDocs = users.docs.map((item) => item.data());
  const activeUserIds = new Set(
    checkins.docs
      .map((item) => item.data())
      .filter((item) => item.date >= dateKey)
      .map((item) => item.userId)
  );

  const totalUsers = users.size;
  const totalCheckins = checkins.size;
  const totalHabitCompletions = completions.size;

  return NextResponse.json({
    totalUsers,
    onboardedUsers: userDocs.filter((user) => user.onboardingCompleted).length,
    activeUsersLast7Days: activeUserIds.size,
    totalCheckins,
    totalHabitCompletions,
    totalChatMessages: chatMessages.size,
    averageCheckinsPerUser: totalUsers ? Math.round((totalCheckins / totalUsers) * 10) / 10 : 0,
    habitCompletionRate: totalUsers ? Math.round((totalHabitCompletions / Math.max(totalUsers * 7 * 3, 1)) * 100) : 0,
    weeklyInsightsGenerated: weeklyInsights.size,
    safetyEscalationsTriggered: safetyEvents.size
  });
}
