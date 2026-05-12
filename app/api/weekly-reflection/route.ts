import { NextResponse } from "next/server";
import { generateAIResponse } from "@/lib/ai";
import { saveWeeklyInsight } from "@/lib/firestore";
import type { GenerateAIResponseArgs } from "@/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<GenerateAIResponseArgs> & {
      userId: string;
      weekStartDate: string;
      weekEndDate: string;
    };

    const result = await generateAIResponse({
      mode: "weekly_reflection",
      userMessage: "Generate this user's weekly reflection.",
      userContext: body.userContext ?? {},
      recentMessages: []
    });

    const metrics = body.userContext?.metrics as
      | {
          moodAverage?: number;
          stressAverage?: number;
          sleepAverage?: number;
          energyAverage?: number;
          habitCompletionRate?: number;
        }
      | undefined;

    await saveWeeklyInsight({
      userId: body.userId,
      weekStartDate: body.weekStartDate,
      weekEndDate: body.weekEndDate,
      moodAverage: metrics?.moodAverage ?? 0,
      stressAverage: metrics?.stressAverage ?? 0,
      sleepAverage: metrics?.sleepAverage ?? 0,
      energyAverage: metrics?.energyAverage ?? 0,
      habitCompletionRate: metrics?.habitCompletionRate ?? 0,
      aiSummary: result.content,
      recommendation: "Keep the next week focused on one or two repeatable habits."
    });

    return NextResponse.json({ content: result.content });
  } catch (error) {
    console.error("Weekly reflection failed", error);
    return NextResponse.json({ error: "Could not generate weekly reflection." }, { status: 500 });
  }
}
