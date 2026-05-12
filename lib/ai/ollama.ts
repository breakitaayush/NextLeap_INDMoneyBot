import { AYUVA_SYSTEM_PROMPT, buildPrompt } from "@/lib/prompts";
import type { GenerateAIResponseArgs } from "@/types";

type OllamaResponse = {
  message?: {
    content?: string;
  };
};

export async function generateOllamaResponse(args: GenerateAIResponseArgs) {
  const baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  const response = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: controller.signal,
    body: JSON.stringify({
      model: process.env.OLLAMA_MODEL || "qwen2.5:7b-instruct",
      stream: false,
      messages: [
        { role: "system", content: AYUVA_SYSTEM_PROMPT },
        { role: "user", content: buildPrompt(args.mode, args.userMessage, args.userContext, args.recentMessages) }
      ]
    })
  }).finally(() => clearTimeout(timeout));

  if (!response.ok) throw new Error(`Ollama failed: ${response.status}`);
  const data = (await response.json()) as OllamaResponse;
  return data.message?.content?.trim() ?? "";
}
