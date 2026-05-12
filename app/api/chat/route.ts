import { NextResponse } from "next/server";
import { generateAIResponse } from "@/lib/ai";
import { classifyIntent, evaluateInputSafety } from "@/lib/safety";
import type { ChatMessage, GenerateAIResponseArgs } from "@/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateAIResponseArgs & { userId: string };
    if (!body.userId || !body.userMessage) {
      return NextResponse.json({ error: "Missing userId or userMessage" }, { status: 400 });
    }

    const intent = classifyIntent(body.userMessage);
    const safety = evaluateInputSafety(body.userMessage);

    const ai = await generateAIResponse({
      mode: "chat",
      userMessage: body.userMessage,
      userContext: body.userContext,
      recentMessages: body.recentMessages
    });

    const now = new Date();
    const messages = [
      {
        messageId: crypto.randomUUID(),
        userId: body.userId,
        role: "user",
        content: body.userMessage,
        intent,
        riskLevel: safety.riskLevel,
        createdAt: now
      },
      {
        messageId: crypto.randomUUID(),
        userId: body.userId,
        role: "assistant",
        content: ai.content,
        intent,
        riskLevel: ai.riskLevel,
        createdAt: now
      }
    ] satisfies Array<Omit<ChatMessage, "createdAt"> & { createdAt: Date }>;

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Chat API failed", error);
    return NextResponse.json({ error: "Ayuva could not respond right now." }, { status: 500 });
  }
}
