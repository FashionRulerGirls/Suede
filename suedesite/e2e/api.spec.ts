import { test, expect } from '@playwright/test';

/* SSRF guard on the product-fetch endpoint: user-supplied URLs that resolve to
   internal / loopback / link-local / metadata addresses must be refused before
   any request is made to them. */

const BLOCKED = [
  'http://169.254.169.254/latest/meta-data/', // cloud metadata
  'http://127.0.0.1/',                         // loopback
  'http://10.0.0.1/',                          // RFC1918
  'http://192.168.0.1/',                       // RFC1918
  'http://172.16.0.1/',                        // RFC1918
  'http://[::1]/',                             // IPv6 loopback
  'http://localhost/',                         // resolves to loopback
  'ftp://example.com/',                        // non-http(s) scheme
];

test('fetch-product blocks SSRF targets', async ({ request }) => {
  for (const url of BLOCKED) {
    const res = await request.post('/api/fetch-product', { data: { url } });
    expect(res.status(), `${url} should be rejected`).toBe(400);
    const body = await res.json();
    expect(body.ok, `${url} should not succeed`).toBe(false);
  }
});
