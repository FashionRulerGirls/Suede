/* Pre-launch site gate. A single shared password (SITE_GATE_PASSWORD) lets
   invited people through; the cookie stores a hash of the password, never the
   password itself, so it can't be reverse-engineered from the browser. When
   SITE_GATE_PASSWORD is unset the gate is disabled and the site is public. */

export const GATE_COOKIE = 'suede_gate';

// SHA-256 of the password. Runs in both the edge (middleware) and node (API)
// runtimes via Web Crypto. Whoever holds a matching cookie proves they knew
// the password, without the plaintext ever living in the cookie.
export async function gateToken(password: string): Promise<string> {
  const data = new TextEncoder().encode('suede-gate::v1::' + password);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Constant-time comparison of two equal-length hex strings (SHA-256 tokens).
// Works in both the edge and node runtimes (no Buffer / node:crypto needed).
// A length mismatch returns false immediately, which only leaks the expected
// digest length (a fixed, public 64) — never a secret.
export function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
