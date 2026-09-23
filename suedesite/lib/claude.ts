// Bridge from the AI measurement quiz to the server-side estimator.
// The quiz builds a prompt from the member's answers and calls this; we POST it
// to /api/measure, which runs the real Claude model (the API key stays on the
// server) and returns a JSON measurement estimate as a string.
//
// This used to be a stub that returned the SAME hardcoded measurements for
// everyone (35/28/39) — which is why every quiz-taker ended up identical. It now
// returns each person's real, per-answer estimate, and throws on failure so the
// quiz surfaces an error instead of silently saving placeholder numbers.
export async function claudeComplete(opts: { messages: { role: string; content: string }[] }): Promise<string> {
  const res = await fetch('/api/measure', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ messages: opts.messages }),
    cache: 'no-store',
  });
  if (!res.ok) {
    let detail = '';
    try { detail = (await res.json())?.error || ''; } catch { /* ignore */ }
    throw new Error(detail || `Measurement estimate failed (${res.status})`);
  }
  const data = await res.json();
  const content = data?.content;
  if (typeof content !== 'string' || !content) throw new Error('Empty measurement estimate.');
  return content;
}
