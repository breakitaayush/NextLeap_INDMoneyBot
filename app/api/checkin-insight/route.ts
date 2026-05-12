import { NextResponse } from "next/server";
import { generateAIResponse } from "@/lib/ai";
import { trackEvent } from "@/lib/analytics";
import type { GenerateAIResponseArgs } from "@/types";

export async function POST(request: Request) {
  try {
    if (process.env.ENABLE_AI_CHECKIN_INSIGHTS !== "true") {
      return NextResponse.json({
        content: "Notice what your body is asking for today. Keep the next step small and choose the gentlest useful action."
      });
    }
    const body = (await request.json()) as Partial<GenerateAIResponseArgs> & { userId?: string };
    const result = await generateAIResponse({
      mode: "checkin_insight",
      userMessage: body.userMessage || "Generate a daily check-in insight.",
      userContext: body.userContext ?? {},
      recentMessages: []
    });
    if (body.userId) {
      await trackEvent("ai_response_generated", { mode: "checkin_insight", source: result.source }, body.userId);
    }
    return NextResponse.json({ content: result.content });
  } catch (error) {
    console.error("Check-in insight failed", error);
    return NextResponse.json({
      content: "For today, keep it small: drink water, take a 5-minute walk, or write one sentence about how you feel."
    });
  }
}
