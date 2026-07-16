# UCP Implementation Reference for Suede Tier 2 On-Site Checkout

> Grounded in the official Universal Commerce Protocol spec (the `ucp-main` repo).
> All section references point at the UCP spec files. This is the authoritative
> build reference for Phases 1–4; the original Tier 2 plan's Shopify-specific
> names (`@shopify/ucp-cli`, `SHOPIFY_CATALOG_ENDPOINT`, "embeddable checkout
> library") are **directional and largely not real spec terms** — see §6.

**Suede's role in UCP terms:** Suede is the **Host** (the browser embedding the
business's checkout — the spec's explicit "web-based host" path) and the
**Platform** (the API caller identified by the `UCP-Agent` header). The pilot
brand is the **Business**. UCP is **discovery-driven**: endpoints and signing
keys are read from each party's `/.well-known/ucp` profile — nothing is
hardcoded per vendor.

---

## 1. Web-host embedded checkout (Phase 3) — ECP over the Embedded Protocol

- ECP embeds a **checkout, not a cart** — so a Create Checkout call must happen
  first (§3). The embedded URL is the checkout's `continue_url` plus `ec_*` query
  params.
- **Availability is negotiated twice:** (a) the business's `/.well-known/ucp`
  must advertise a service binding with `"transport": "embedded"`; (b) the
  **checkout response** must include an embedded service binding with
  `config.delegate`. If either is absent, only redirect-based `continue_url`
  continuation is supported (no inline embed).
- **Embedded URL params** (query string, URL-encoded):
  - `ec_version` **REQUIRED** — UCP version `YYYY-MM-DD`; must match the checkout
    response's version and stay constant for the session.
  - `ec_auth` optional — business-defined token (JWT/OAuth/API-key/session id).
  - `ec_delegate` optional — comma-list of actions the host handles natively;
    subset of `config.delegate`.
  - `ec_color_scheme` optional — `light` | `dark`.
- **For Suede's card-free model: request ZERO delegations.** The business's iframe
  collects payment itself; do **not** delegate `payment.credential`. Delegation is
  optional.
- **Handshake (JSON-RPC 2.0 over `postMessage`):**
  1. Embedded checkout → host: `ec.ready` (request, has `id`) with accepted
     `delegate[]` and optional `auth`.
  2. Host → embedded: response with `ucp:{version,status:"success"}` (required);
     optional `upgrade:{port}` to switch to a `MessageChannel` (transfer the
     port); optional `credential`.
  3. On failure (e.g. bad origin): respond `ucp.status:"error"` + `security_error`,
     tear down the iframe, optionally redirect to `continue_url`.
- **Lifecycle notifications** (embedded → host, no `id`, do not reply):
  `ec.start`, `ec.complete` (success; `checkout.order = {id, permalink_url}` —
  Suede's in-frame "order exists" signal, still reconcile via webhook),
  `ec.line_items.change` / `ec.buyer.change` / `ec.payment.change` /
  `ec.totals.change` / `ec.messages.change`, and `ec.error` (fatal → tear down).
- **Required web-host security controls:**
  - Business sets CSP `frame-ancestors <suede_origin>`; Suede sets `frame-src`.
    Because listing every business origin doesn't scale, use an **intermediate
    iframe** on a Suede-controlled subdomain whose `frame-src` is set to **only**
    the current session's merchant origin.
  - `sandbox="allow-scripts allow-forms allow-same-origin"` on the business iframe.
  - `credentialless` iframe attribute (ephemeral context).
  - **Strict `postMessage` origin validation** against the `continue_url` origin.
  - (If you ever delegate payment) host is sole initiator + explicit user
    confirmation; silent tokenization is prohibited.

## 2. Catalog (Phase 1) — query the brand's products

- Capabilities `dev.ucp.shopping.catalog.search` + `dev.ucp.shopping.catalog.lookup`,
  advertised in the brand's profile. Base URL is the service `endpoint` from the
  profile; append:
  - `POST /catalog/search` — free-text + filtered search.
  - `POST /catalog/lookup` — batch retrieve by ID.
  - `POST /catalog/product` — full single-product detail.
- **Product shape** (for cards): `id`, `handle`, `title`, `description.plain`,
  `url`, `categories[]`, `price_range.{min,max}.{amount,currency}`, `media[]`
  (`{type:"image",url,alt_text}`), `options[]`, `variants[]`, `rating`.
  **Variant:** `id`, `sku`, `title`, `price.{amount,currency}`,
  `availability.available`, `options[]`.
- **Prices are integer minor units (cents) + explicit currency.**
- Catalog IDs feed checkout directly as `line_items[].item.id`.
- **Freshness:** responses are current terms but **not transactional — checkout is
  authoritative**; may be session-specific; SHOULD NOT be reused across sessions
  without re-validation. Cursor pagination, default limit 10.
- Every request MUST send `UCP-Agent: profile="https://<suede>/profile"`.

## 3. Cart (Phase 2) — hold state, keep totals authoritative, hand off

- Capability `dev.ucp.shopping.cart`. REST: `POST /carts`, `GET /carts/{id}`,
  `PUT /carts/{id}` (**full replacement**), `POST /carts/{id}/cancel`.
- **Cart totals are ESTIMATES; checkout computes final pricing.** Suede keeps a
  local mirror in Supabase but the brand's response is the money source of truth.
- **Cart → checkout handoff:** `POST /checkout-sessions` with `{cart_id}`; the
  business uses cart contents and ignores overlapping checkout fields. Idempotent
  per `cart_id`.
- **Checkout REST:** `POST /checkout-sessions`, `GET /checkout-sessions/{id}`,
  `PUT` (full replacement), `POST .../complete`, `POST .../cancel`. Checkout
  totals are render-authoritative (don't recompute). For Suede's inline model the
  **embedded UI finalizes the order in-frame** (`ec.complete`) rather than Suede
  calling Complete Checkout.

## 4. Order + webhooks (Phase 4) — events, attribution, verification

- Capability `dev.ucp.shopping.order`. Two channels: **Order Event Webhook**
  (primary; business POSTs the **full current-state order snapshot** — not
  deltas) and **Get Order** (`GET /orders/{id}` / MCP `get_order`) for reconcile.
- **Lifecycle is inside the snapshot**, not separate event types:
  - created → full order entity.
  - fulfilled/delivered/shipped → `fulfillment.events[]` (append-only; `type`
    open string: `processing`,`shipped`,`in_transit`,`delivered`,…).
  - refunded/cancelled/returned → `adjustments[]` (open `type`: `refund`,`return`,
    `cancellation`,…; **amounts signed — negative for reductions**). This is what
    Suede reverses/adjusts in `commission_ledger`.
- **Webhook wiring:** Suede advertises its receiver URL in its **own** profile
  under the order capability's `config.webhook_url`. Standard-Webhooks headers,
  **RFC 9421 signing**.
- **Attribution:** `order.checkout_id` links order → originating checkout;
  `order.attribution` echoes the checkout's attribution snapshot (Suede sets
  campaign/click/source markers on the checkout). Commission-attribution hook.
- **Inbound verification (mandatory for webhooks):** parse `Signature-Input`
  (`keyid`), fetch the business's profile, find the JWK by `kid`, verify
  `Content-Digest` (SHA-256 raw body) + the RFC 9421 signature base, **and**
  authorize: confirm the signer's profile matches the order's business (reject
  foreign signers spoofing another brand's orders). Respond 2xx fast, process
  async.

## 5. Auth & signatures (security §8)

- `/.well-known/ucp` = discovery + identity: `version`, `services`
  (transports+endpoints), `capabilities`, `payment_handlers`, and public
  **`keys[]`** (JWK Set). Businesses host it; **platforms advertise their own
  profile URL per-request via `UCP-Agent`**. Enables permissionless onboarding.
  HTTPS, no redirects, cacheable (`max-age ≥ 60`).
- **Signatures:** RFC 9421 HTTP Message Signatures; body digest RFC 9530
  `Content-Digest` (SHA-256 raw bytes, no JSON canonicalization); JWK keys.
  **Baseline algorithm all must verify: `ES256` (ECDSA P-256), raw `r||s`
  (64 bytes), not DER.**
- **Outbound signing (Suede → brand):** `Signature-Input`/`Signature`/
  `Content-Digest`; signed components include `@method`,`@authority`,`@path`
  (+`@query`,`ucp-agent`,`content-digest`,`content-type` as applicable);
  **`idempotency-key` required for POST/PUT/DELETE/PATCH**.
- **Replay protection = `Idempotency-Key`** (≥128-bit, stored ≥24h; dup+same
  payload → cached response; dup+different → 409). Fresh key whenever payload
  changes.
- **When signing applies:** requests SHOULD be signed (or use API-key/OAuth/mTLS);
  **webhooks MUST be signed**; payment-auth/checkout-completion responses
  RECOMMENDED. So Suede's MVP can call catalog/cart with an API key or bearer, but
  **must verify inbound order webhooks**.

## 6. Plan-vs-spec: directional references audited

| Plan term | Verdict | Correct spec term |
|---|---|---|
| `@shopify/ucp-cli` | not in open spec | no such CLI/package; implement the protocol directly |
| `SHOPIFY_CATALOG_ENDPOINT` env | not a spec thing | discover base URL from the brand's `/.well-known/ucp` `services[].endpoint` |
| "Storefront Catalog scoped to a brand" | renamed | `dev.ucp.shopping.catalog.search`/`.lookup`, called at the brand's own endpoint |
| "UCP order webhooks" | real (renamed) | **Order Event Webhook** (`dev.ucp.shopping.order`), full-snapshot |
| "embeddable checkout library" | it's a protocol, not a lib | **Embedded Checkout Protocol (ECP)** — implement postMessage/JSON-RPC yourself |
| "get_order lookup" | real | MCP tool `get_order` / REST `GET /orders/{id}` |

## 7. Still Shopify-/brand-specific (NOT in the open spec — get from Shopify/brand)

1. The **pilot brand's live profile URL** + confirmation it advertises the
   `embedded` transport (required for inline checkout) **and** the `catalog.*`,
   `cart`, `checkout`, `order` capabilities.
2. Any **Shopify merchant enablement** (no "Universal Commerce Agent" app or
   "Agentic Checkout" toggle name exists in the open spec — it's Shopify-side
   config that makes the store expose UCP endpoints).
3. **Shopify SDK/package names** ("Checkout Kit", etc.) — not in the open spec.
4. The **`ec_auth` token format** — "entirely business-defined"; the brand must
   document what to put there.
5. **Payment-handler specifics** (e.g. Shop Pay) — vendor-namespaced, at
   shopify.dev; stays inside the brand iframe for Suede's model.
6. The **REST auth mechanism** the brand mandates (open / API-key / OAuth / mTLS)
   and any credentials.
7. The **partner/webhook onboarding** process with Shopify.

**Bottom line:** every phase is implementable against the open spec. The only true
unknowns are the brand's live profile + advertised capabilities, the
brand-defined `ec_auth`/REST credentials, and Shopify-side merchant enablement —
all obtained from Shopify docs or brand onboarding.

## Config implications (revises the plan's §5 env vars)

The plan's `SHOPIFY_*` env vars don't map to the discovery-driven spec. What Suede
actually needs (server-side only), for the pilot brand:

```
PILOT_BRAND_UCP_PROFILE_URL=   # the brand's https .../.well-known/ucp
SUEDE_UCP_PROFILE_URL=         # Suede's own published profile (UCP-Agent header)
SUEDE_UCP_SIGNING_KEY=         # Suede's ES256 private key (JWK) for outbound signing
PILOT_BRAND_REST_AUTH=         # API key / bearer if the brand requires one (TBD by brand)
PILOT_BRAND_COMMISSION_RATE=   # e.g. 0.10 (unchanged)
```
Fail loud (clear error, no silent fallback) if any required value is absent.
