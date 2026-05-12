import { generateClaudeResponse } from "@/lib/ai/claude";
import { generateOllamaResponse } from "@/lib/ai/ollama";
import { evaluateInputSafety } from "@/lib/safety";
import { enforceProductBoundary, validateAIOutput } from "@/lib/validators";
import type { GenerateAIResponseArgs } from "@/types";

export const aiFallbackResponse =
  "I'm having trouble responding right now. For today, pick one small action: drink water, take a 5-minute walk, or write one sentence about how you feel.";

export async function generateAIResponse(args: GenerateAIResponseArgs) {
  const safety = evaluateInputSafety(args.userMessage);
  if (safety.riskLevel === "high") {
    return {
      content: safety.response ?? aiFallbackResponse,
      riskLevel: "high" as const,
      source: "safety_filter"
    };
  }

  if (args.mode === "chat") {
    const boundary = enforceProductBoundary(args.userMessage);
    if (boundary) {
      return {
        content: boundary,
        riskLevel: "low" as const,
        source: "boundary"
      };
    }
  }

  try {
    const provider = process.env.AI_PROVIDER || "claude";
    const raw = provider === "ollama" ? await generateOllamaResponse(args) : await generateClaudeResponse(args);
    const validated = validateAIOutput(raw);
    return {
      content: validated.output || aiFallbackResponse,
      riskLevel: "low" as const,
      source: provider,
      replacedUnsafeOutput: !validated.safe
    };
  } catch (error) {
    console.error("AI response failed", error);
    return {
      content: aiFallbackResponse,
      riskLevel: "low" as const,
      source: "fallback"
    };
  }
}
