const unsafeOutputPatterns = [
  /you have depression/i,
  /you definitely have anxiety/i,
  /stop taking your medication/i,
  /you don't need a doctor/i,
  /you dont need a doctor/i,
  /this is harmless/i,
  /diagnosed with/i
];

export const safeMedicalFallback =
  "I may not be the best source for medical conclusions. If symptoms are severe or persistent, please consult a healthcare professional.";

export function validateAIOutput(output: string) {
  const unsafe = unsafeOutputPatterns.some((pattern) => pattern.test(output));
  const cleaned = output
    .replace(/\*\*/g, "")
    .replace(/^#+\s*/gm, "")
    .replace(/^[-*]\s+/gm, "")
    .replace(/^\s*(next action|small next action|try this):\s*/gim, "")
    .trim();
  return {
    safe: !unsafe,
    output: unsafe ? safeMedicalFallback : cleaned
  };
}

export function enforceProductBoundary(message: string) {
  const unrelatedPatterns = [
    /coding|programming|javascript|python|react|sql|debug/i,
    /math homework|solve this equation|calculus|physics homework/i,
    /politics|election|trivia|random fact|essay writing/i
  ];
  if (!unrelatedPatterns.some((pattern) => pattern.test(message))) return null;
  return "I'm mainly here to help with wellbeing, habits, stress, sleep, focus, and routines. I may not be the best fit for coding or general knowledge questions.";
}
