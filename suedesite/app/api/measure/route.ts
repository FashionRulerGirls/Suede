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

   Hardening: the response is constrained with structured outputs to exactly the
   six measurement fields, so this endpoint can't be repurposed as a general
   free-form LLM proxy no matter what prompt is posted. Input size is capped too. */

// Only ever emit these fields — this is what makes the endpoint safe to expose.
const MEASUREMENT_SCHEMA = {
  type: 'object',
  properties: {
    bust: { type: 'number' },
    waist: { type: 'number' },
    hips: { type: 'number' },
    inseam: { type: 'number' },
    confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
    reasoning: { type: 'string' },
  },
  required: ['bust', 'waist', 'hips', 'inseam', 'confidence', 'reasoning'],
  additionalProperties: false,
} as const;

const SYSTEM = `You are a garment-fit expert estimating a person's body measurements from an intake questionnaire. Return realistic tailor-measured values in inches for bust, waist, hips, and inseam, plus a confidence level and one short sentence of reasoning. Base every estimate strictly on the details provided — never return generic or placeholder numbers, and let the stated body type drive the relative proportions between bust, waist, and hips. Respond only with the requested measurement fields.`;

// Guard against someone POSTing a giant payload to burn tokens.
const MAX_PROMPT_CHARS = 6000;

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Fail loudly rather than fabricating measurements — the whole point of
    // this change is that the quiz must produce real, per-person estimates.
    return NextResponse.json(
      { error: 'Measurement estimation is not configured (missing ANTHROPIC_API_KEY).' },
      { status: 503 },
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  // Accept the quiz's { messages: [{ role, content }] } shape; we only use the
  // user content and always supply our own system prompt + schema.
  const messages = Array.isArray(body?.messages) ? body.messages : [];
  const prompt = messages
    .filter((m: any) => m && m.role === 'user' && typeof m.content === 'string')
    .map((m: any) => m.content)
    .join('\n\n')
    .trim();

  if (!prompt) return NextResponse.json({ error: 'No prompt provided.' }, { status: 400 });
  if (prompt.length > MAX_PROMPT_CHARS) {
    return NextResponse.json({ error: 'Prompt too long.' }, { status: 413 });
  }

  const client = new Anthropic({ apiKey });

  try {
    const response = await client.messages.create({
      model: 'claude-opus-5',
      max_tokens: 3000,
      system: SYSTEM,
      thinking: { type: 'adaptive' },
      output_config: {
        effort: 'medium',
        format: { type: 'json_schema', schema: MEASUREMENT_SCHEMA },
      },
      messages: [{ role: 'user', content: prompt }],
    });

    if (response.stop_reason === 'refusal') {
      return NextResponse.json({ error: 'Could not estimate from those answers.' }, { status: 422 });
    }

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('')
      .trim();

    if (!text) return NextResponse.json({ error: 'Empty estimate.' }, { status: 502 });

    // Return the JSON string; the quiz already parses this shape.
    return NextResponse.json({ content: text }, { headers: { 'cache-control': 'no-store' } });
  } catch (err) {
    if (err instanceof Anthropic.APIError) {
      // Don't leak provider internals to the client.
      return NextResponse.json({ error: 'Estimation service error.' }, { status: 502 });
    }
    return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 });
  }
}
