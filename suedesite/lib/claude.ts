// Stub for the design-tool's window.claude.complete. Returns a plausible
// measurement estimate as a JSON string so the quiz flow works offline.
export async function claudeComplete(_opts: { messages: { role: string; content: string }[] }): Promise<string> {
  await new Promise((r) => setTimeout(r, 700));
  return JSON.stringify({
    bust: 35, waist: 28, hips: 39, inseam: 30,
    confidence: 'medium',
    reasoning: 'Estimated from your height, weight, body type, and usual sizes.',
  });
}
