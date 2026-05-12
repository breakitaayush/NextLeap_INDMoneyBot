import Anthropic from "@anthropic-ai/sdk";
import { AYUVA_SYSTEM_PROMPT, buildPrompt, tokenLimitForMode } from "@/lib/prompts";
import type { GenerateAIResponseArgs } from "@/types";

export async function generateClaudeResponse(args: GenerateAIResponseArgs) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Missing ANTHROPIC_API_KEY");

  const anthropic = new Anthropic({ apiKey });
  const response = await anthropic.messages.create({
    model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
    max_tokens: tokenLimitForMode(args.mode),
    system: AYUVA_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: buildPrompt(args.mode, args.userMessage, args.userContext, args.recentMessages)
      }
    ]
  });

  return response.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("")
    .trim();
}
