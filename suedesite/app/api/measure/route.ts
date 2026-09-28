import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* Server-side measurement estimator for the AI measurement quiz.
   -----------------------------------------------------------------
   The quiz (components/screens/QuizScreen.tsx) builds a detailed prompt from a
   member's answers and posts it here. We call Claude to estimate the four core
   measurements and return them as JSON. This MUST run server-side: the API key
   is a secret that can never reach the browser.

   The model is asked for JSON only; we parse it and re-emit exactly the six
   measurement fields, so the endpoint can't be repurposed as a general LLM
   proxy no matter what is posted. Input size is capped too. */

const SYSTEM = `You are a garment-fit expert estimating a person's body measurements from an intake questionnaire. Estimate realistic, tailor-measured values in inches for bust, waist, hips, and inseam, plus a confidence level and one short sentence of reasoning. Base every estimate strictly on the details provided — never return generic or placeholder numbers, and let the stated body type drive the relative proportions between bust, waist, and hips. Respond with ONLY a JSON object in exactly this form and nothing else: {"bust": <number>, "waist": <number>, "hips": <number>, "inseam": <number>, "confidence": "high"|"medium"|"low", "reasoning": "<one short sentence>"}`;

const MAX_PROMPT_CHARS = 6000;
const MODEL = 'claude-opus-5';

const num = (n: any) => (n == null || Number.isNaN(Number(n)) ? null : Math.round(Number(n)));

// Health check: lets us confirm the key is present in an environment WITHOUT
// exposing it. GET /api/measure → { ok, configured }.
export function GET() {
  return NextResponse.json(
    { ok: true, configured: !!process.env.ANTHROPIC_API_KEY, model: MODEL },
    { headers: { 'cache-control': 'no-store' } },
  );
}

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Fail loudly rather than fabricating measurements.
    return NextResponse.json(
      { error: 'Measurement estimation is not configured (missing ANTHROPIC_API_KEY).', code: 'not_configured' },
      { status: 503 },
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.', code: 'bad_body' }, { status: 400 });
  }

  const messages = Array.isArray(body?.messages) ? body.messages : [];
  const prompt = messages
    .filter((m: any) => m && m.role === 'user' && typeof m.content === 'string')
    .map((m: any) => m.content)
    .join('\n\n')
    .trim();

  if (!prompt) return NextResponse.json({ error: 'No prompt provided.', code: 'no_prompt' }, { status: 400 });
  if (prompt.length > MAX_PROMPT_CHARS) {
    return NextResponse.json({ error: 'Prompt too long.', code: 'too_long' }, { status: 413 });
  }

  const client = new Anthropic({ apiKey });

  try {
    // Thinking disabled so the small JSON answer isn't crowded out by reasoning
    // tokens (Opus 5 thinks by default); modest max_tokens is plenty for 6 fields.
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: SYSTEM,
      thinking: { type: 'disabled' },
      messages: [{ role: 'user', content: prompt }],
    });

    if (response.stop_reason === 'refusal') {
      return NextResponse.json({ error: 'Could not estimate from those answers.', code: 'refusal' }, { status: 422 });
    }

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('')
      .trim();

    const match = text.match(/\{[\s\S]*\}/);
    let parsed: any = null;
    try { parsed = JSON.parse(match ? match[0] : text); } catch { /* handled below */ }

    if (!parsed || num(parsed.bust) == null || num(parsed.waist) == null || num(parsed.hips) == null) {
      console.error('[measure] unparseable model output:', text.slice(0, 300));
      return NextResponse.json({ error: 'Could not read an estimate.', code: 'unparseable' }, { status: 502 });
    }

    // Re-emit ONLY the measurement fields (abuse-safe + guaranteed shape).
    const out = {
      bust: num(parsed.bust),
      waist: num(parsed.waist),
      hips: num(parsed.hips),
      inseam: num(parsed.inseam),
      confidence: ['high', 'medium', 'low'].includes(parsed.confidence) ? parsed.confidence : 'medium',
      reasoning: typeof parsed.reasoning === 'string' ? parsed.reasoning.slice(0, 300) : '',
    };
    return NextResponse.json({ content: JSON.stringify(out) }, { headers: { 'cache-control': 'no-store' } });
  } catch (err: any) {
    // Log the real provider error for the server logs; return a safe code the
    // client can surface so we can tell config vs. auth vs. billing apart.
    const status = err?.status ?? err?.statusCode;
    console.error('[measure] anthropic error', status, err?.name, err?.message);
    if (err instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: 'Estimation service error.', code: 'api_error', status: status ?? null },
        { status: 502 },
      );
    }
    return NextResponse.json({ error: 'Unexpected error.', code: 'unexpected' }, { status: 500 });
  }
}
