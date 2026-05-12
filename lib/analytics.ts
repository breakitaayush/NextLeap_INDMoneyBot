import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function trackEvent(eventName: string, properties: Record<string, unknown> = {}, userId = "anonymous") {
  try {
    await addDoc(collection(db, "analytics_events"), {
      eventName,
      userId,
      properties,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.warn("Analytics event failed", eventName, error);
  }
}
