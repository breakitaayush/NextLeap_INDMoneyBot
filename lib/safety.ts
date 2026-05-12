export type SafetyResult = {
  riskLevel: "low" | "high";
  category?: string;
  response?: string;
};

const highRiskPatterns = [
  /self[-\s]?harm/i,
  /suicid(e|al)/i,
  /want to die/i,
  /kill myself/i,
  /hurt myself/i,
  /do not want to live/i,
  /don't want to live/i,
  /dont want to live/i,
  /overdose/i,
  /too many pills/i,
  /severe chest pain/i,
  /chest pain/i,
  /breathing difficulty/i,
  /can't breathe/i,
  /cant breathe/i,
  /immediate danger/i,
  /feel unsafe/i,
  /medical emergency/i
];

export const emergencyResponse =
  "I'm really sorry you're feeling this. I'm not the right support for an emergency. Please contact someone you trust right now or local emergency services.\n\nIf you are in India, you can call 112 for emergency help. If you may hurt yourself, please reach out to a trusted person immediately and do not stay alone.";

export function evaluateInputSafety(input: string): SafetyResult {
  const matched = highRiskPatterns.find((pattern) => pattern.test(input));
  if (!matched) return { riskLevel: "low" };
  return {
    riskLevel: "high",
    category: "emergency_or_self_harm",
    response: emergencyResponse
  };
}

export function classifyIntent(input: string) {
  if (evaluateInputSafety(input).riskLevel === "high") return "safety_escalation";
  if (/(sleep|bed|tired|insomnia|wake up)/i.test(input)) return "sleep";
  if (/(habit|discipline|routine|skipped|consistent|procrastinat)/i.test(input)) return "habit_coaching";
  if (/(stress|burnout|overwhelm|anxious|low|sad|mood)/i.test(input)) return "emotional_support";
  if (/(focus|deep work|productivity|work)/i.test(input)) return "focus_productivity";
  return "wellbeing_general";
}
