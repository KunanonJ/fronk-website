# Phase 3b report: Forms

**Date:** 09-11-26
**Plan:** `../active/phase-3_server-surface_PLAN_09-11-26.md`
**Branch:** `feat/start-forms`

## Result

The contact form runs on TanStack Form with a shared Valibot schema, Turnstile is ready to switch on, and Start's form endpoints are rate-limited. With no Turnstile keys configured (today), the site behaves and renders exactly as before: parity and screenshots are unchanged.

## What landed

- **Form:** `components/landing/FormaContactPage.tsx` on `@tanstack/react-form` 1.33.5; values, topics and the honeypot live in the form; the Valibot 1.5.0 schema (`lib/contact/schema.ts`) checks them with the server's wording before sending. Markup, classes and native validation attributes are unchanged.
- **Turnstile (client):** `lib/turnstile/client.ts` loads the script on submit only, renders an invisible widget in execute mode, and sends the one-time token with the message. Off until `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is set.
- **Server guard (Start):** `src/server/formGuard.ts` runs before the shared handlers of `/api/contact` and `/api/subscribe`: the `FORM_RATE_LIMIT` binding (5 per minute per IP, 429) and Turnstile siteverify once `TURNSTILE_SECRET_KEY` is set (403 without a valid token).

## Evidence (local, 09-11-26)

| Check | Result |
|---|---|
| Schema and guard unit tests | 10 passed (wording, 429, 403, siteverify call) |
| Rate limit in the local Worker | requests 1-5 pass, 6-7 get 429 |
| Browser run with Cloudflare's invisible test site key | no Turnstile request before submit; the POST carries the token |
| Parity, all 120 reference URLs | 0 differences |
| Smoke + axe | 118 passed |
| `pnpm test` | 458 passed |

## Owner actions

1. Create a Turnstile widget (invisible) for kunanonj.com in the Cloudflare dashboard.
2. Set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (build variable) and `wrangler secret put TURNSTILE_SECRET_KEY` on the Start Worker. Until both exist, the form works without Turnstile.

## Deviation

Server functions with `createServerValidate` move to Phase 6: the form is shared with production Next until then.
