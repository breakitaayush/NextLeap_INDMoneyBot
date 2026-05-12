import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { ChatMessage, CheckIn, Habit, HabitLog, UserProfile, WeeklyInsight } from "@/types";

export async function getUserProfile(userId: string) {
  const snapshot = await getDoc(doc(db, "users", userId));
  return snapshot.exists() ? (snapshot.data() as UserProfile) : null;
}

export async function upsertUserProfile(userId: string, data: Partial<UserProfile>) {
  await setDoc(
    doc(db, "users", userId),
    {
      ...data,
      userId,
      updatedAt: serverTimestamp(),
      createdAt: data.createdAt ?? serverTimestamp()
    },
    { merge: true }
  );
}

export async function createHabit(userId: string, name: string, goalCategory: string, targetTime = "Flexible") {
  const ref = await addDoc(collection(db, "habits"), {
    userId,
    name,
    goalCategory,
    targetFrequency: "daily",
    targetTime,
    active: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  await updateDoc(ref, { habitId: ref.id });
  return ref.id;
}

export async function getActiveHabits(userId: string) {
  const snapshot = await getDocs(query(collection(db, "habits"), where("userId", "==", userId), where("active", "==", true)));
  return snapshot.docs.map((item) => item.data() as Habit);
}

export async function saveHabitLog(userId: string, habitId: string, date: string, completed: boolean) {
  const logId = `${userId}_${habitId}_${date}`;
  await setDoc(
    doc(db, "habit_logs", logId),
    {
      logId,
      habitId,
      userId,
      date,
      completed,
      completedAt: completed ? serverTimestamp() : null
    },
    { merge: true }
  );
}

export async function getHabitLogs(userId: string, startDate?: string) {
  const constraints = [where("userId", "==", userId)];
  if (startDate) constraints.push(where("date", ">=", startDate));
  const snapshot = await getDocs(query(collection(db, "habit_logs"), ...constraints));
  return snapshot.docs.map((item) => item.data() as HabitLog);
}

export async function saveCheckin(userId: string, data: Omit<Partial<CheckIn>, "userId">) {
  const checkinId = `${userId}_${data.date}`;
  await setDoc(
    doc(db, "checkins", checkinId),
    {
      ...data,
      checkinId,
      userId,
      createdAt: serverTimestamp()
    },
    { merge: true }
  );
}

export async function getLatestCheckin(userId: string) {
  const snapshot = await getDocs(
    query(collection(db, "checkins"), where("userId", "==", userId), orderBy("date", "desc"), limit(1))
  );
  return snapshot.docs[0]?.data() as CheckIn | undefined;
}

export async function getCheckinsSince(userId: string, startDate: string) {
  const snapshot = await getDocs(query(collection(db, "checkins"), where("userId", "==", userId), where("date", ">=", startDate)));
  return snapshot.docs.map((item) => item.data() as CheckIn);
}

export async function saveChatMessage(message: Omit<ChatMessage, "messageId" | "createdAt">) {
  const ref = await addDoc(collection(db, "chat_messages"), {
    ...message,
    createdAt: serverTimestamp()
  });
  await updateDoc(ref, { messageId: ref.id });
  return ref.id;
}

export async function getRecentChatMessages(userId: string, count = 5) {
  const snapshot = await getDocs(
    query(collection(db, "chat_messages"), where("userId", "==", userId), orderBy("createdAt", "desc"), limit(count))
  );
  return snapshot.docs.map((item) => item.data() as ChatMessage).reverse();
}

export async function saveWeeklyInsight(insight: Omit<WeeklyInsight, "insightId" | "createdAt">) {
  const ref = await addDoc(collection(db, "weekly_insights"), {
    ...insight,
    createdAt: serverTimestamp()
  });
  await updateDoc(ref, { insightId: ref.id });
  return ref.id;
}
