# Phase 0: Fix what's broken

**Status:** SHIPPED in #53 (merged 08-11-26). One check is still open: a real message sent in production with the owner's Resend secrets. Evidence: `../reports/phase-0_fix-broken_REPORT_06-11-26.md`.
**Created:** 06-11-26
**Umbrella:** `ux-experience_UMBRELLA_PLAN_06-11-26.md`
**Covers audit findings:** 1 (fake contact submit), 2 (agency template copy), 3 (`/showcase` wellness page)
**Harness note:** runs under the Harness-Absent Fallback (no `.claude/`, no `process/context/`).

## Objective

Every valid message sent from `/contact` reaches the owner's inbox. The page speaks in the founder's voice, and `/showcase` no longer exists.

## Decisions (owner, 06-11-26)

- Keep the form and deliver it as email through Resend.
- Remove `/showcase`, permanently redirect it to `/`, and drop it from the sitemap.

## Design

### Delivery path

1. The browser POSTs JSON to `/api/contact`: `{ name, email, message, topics[], company (honeypot), startedAt }`.
2. `app/api/contact/route.ts` parses the body and calls `sendContactMessage(input, config)`, then maps the result to `{ ok, message }` plus a status. This mirrors `app/api/subscribe/route.ts`.
3. `lib/contact/sendContactMessage.ts` is pure and never throws, with an injectable `fetchImpl` (same pattern as `lib/newsletter/subscribe.ts`). It:
   - validates `name` (1-100 chars), `email` (the shared `isValidEmail`, at most 254 chars), `message` (10-5000 chars), and `topics` (whitelist only, at most 8);
   - drops bots silently: a filled honeypot, or under 3 s between `startedAt` and submit, returns `200 ok` without sending, so bots learn nothing;
   - returns `503` with a friendly message when `RESEND_API_KEY`, `CONTACT_TO_EMAIL` or `CONTACT_FROM_EMAIL` is missing;
   - sends `POST https://api.resend.com/emails` with `from: CONTACT_FROM_EMAIL`, `to: CONTACT_TO_EMAIL`, `reply_to: <visitor email>`, and subject `[kunanonj.com] <topics or "Message"> from <name>`. Newlines are stripped from the subject and length is capped. The body is plain `text` only, with no HTML, so visitor input can't inject markup;
   - maps a Resend error or network failure to `502` with "That didn't send."

### Client behaviour (`components/landing/FormaContactPage.tsx`)

- Replace the fake `setTimeout` with a real `fetch`. Show the success state only on `ok: true`.
- On failure: keep every field filled, show the error in an `aria-live="polite"` region, and offer a `mailto:` link with the subject prefilled.
- Hidden honeypot input `company`: visually hidden, `tabIndex={-1}`, `autoComplete="off"`, `aria-hidden`.
- Topic chips become toggle buttons with `aria-pressed`.
- Disable submit while sending, and lock against double submits.

### Copy (draft; the owner approves or edits at the execution checkpoint)

| Slot | Today | Proposed |
|---|---|---|
| Headline over video | "We craft bold ideas / and ship them as *products*" | "Building in fintech, AI or ops? / Let's *talk*." |
| Card title (h1) | "Say hello! 👋" | "Say hello" |
| Direct line label | "Drop us a line" | "Email me directly" |
| Form label | "Tell us about your vision" | "Or send a message" |
| Message placeholder | "What are you looking to build or improve..." | "What are you working on, and how can I help?" |
| Chips label | "I need help with..." | "What's it about?" |
| Chips | Website, Mobile App, Web App, E-Commerce, Visual Identity, 3D & Motion, Digital Marketing, Growth & Consulting, Other | GoGoCash, Manut AI, Partnership, Investment, AI / ERP advice, Speaking or press, Hiring, Something else |
| Success | "You're all set! Expect a reply within 24 hours." | "Thanks, it's in my inbox. I'll reply by email." (no reply-time promise unless the owner wants one) |
| Error | none | "That didn't send. Email me at fronk.kunanon@gmail.com instead." |
| Meta description | "Say hello — craft bold ideas and ship them as products." | "Email Kunanon Jarat (Fronk) or send a message about fintech, AI, ERP/CRM or startups in Bangkok and SEA." |

Copy lives in `lib/content/contact.ts` rather than JSX, following the repo convention that marketing copy lives in `lib/content/`.

### `/showcase` retirement

- Delete `app/(landing)/showcase/page.tsx`, `app/(landing)/showcase/layout.tsx`, `components/landing/ShowcasePage.tsx`, `components/landing/showcase/SpotlightReveal.tsx` (used only by the showcase), and `public/previews/creative-studio-showcase.html` (unreferenced preview of the removed page).
- `next.config.ts`: add `{ source: "/showcase", destination: "/", permanent: true }` beside the existing retirement redirects.
- Remove `/showcase` references from `app/sitemap.ts:18`, `app/not-found.tsx:6` (replace with Portfolio), `app/llms.txt/route.ts:77`, `public/sitemap.md:36`, `components/landing/stock/README.md:10`, `scripts/check-first-load-budget.mjs:36` and `tests/e2e/routes.ts:21`.
- `lib/content/examples.ts:61-65`: rewrite the card to point at `/portfolio`.
- Keep `--color-showcase-*` tokens and the liquid-glass utility in `app/globals.css`, because `/stock/velorah` and the stock heroes use them.
- Leave the dated log line in `lib/content/buildBoard.ts:66` as history.

## Touchpoints

New:
- `lib/contact/sendContactMessage.ts`, `lib/contact/sendContactMessage.test.ts`
- `app/api/contact/route.ts`, `app/api/contact/route.test.ts`
- `lib/content/contact.ts` (copy and topic whitelist, shared by client and server)
- `components/landing/FormaContactPage.test.tsx`

Changed:
- `components/landing/FormaContactPage.tsx`, `app/(landing)/contact/page.tsx`
- `.env.example`, `.dev.vars.example`: add `CONTACT_TO_EMAIL` and `CONTACT_FROM_EMAIL` (names only)
- The `/showcase` files listed above

## Public Contracts

- New endpoint `POST /api/contact`. It returns JSON `{ ok: boolean, message: string }` with status 200, 400, 503 or 502, and never echoes visitor input back.
- New Worker secrets or vars: `CONTACT_TO_EMAIL` and `CONTACT_FROM_EMAIL`. It reuses `RESEND_API_KEY`.
- `/showcase` changes from 200 to 308 pointing at `/`.

## Blast Radius

- Contact page only, plus one new API route. Newsletter code is untouched apart from a shared import.
- Removing `/showcase` affects the sitemap, `llms.txt`, the 404 page, the examples card, and the e2e route list. All are listed above.
- Risk: Resend refuses `from` addresses on unverified domains. If `kunanonj.com` isn't verified in Resend, sending fails with a 502 and the visitor sees the error with the mailto fallback. That's honest, but no message is delivered until the owner fixes it.

## Owner actions (outside the code)

1. Confirm the Resend account has `kunanonj.com` verified, or verify it (DNS records in Cloudflare). Pick the sender, for example `KunanonJ <contact@kunanonj.com>`.
2. Set `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` and `RESEND_API_KEY` as Worker secrets (`wrangler secret put ...`), and in `.dev.vars` for local testing. Claude does not set secrets without approval.
3. Approve the contact copy above or supply edits.
4. Approve the production deploy once the PR is green.

## Verification Evidence (filled 06-11-26; full detail in the report)

| Gate | Expected | Result |
|---|---|---|
| Unit: `sendContactMessage` | Invalid input returns 400; honeypot and too-fast submits return 200 without a fetch; missing config returns 503; Resend 4xx/5xx or a throw returns 502; success sends one fetch with the correct `reply_to`, a plain-text body and a newline-free subject | 25/25 pass |
| Unit: route | Body parsing, bad JSON returns 400, and the response shape | 6/6 pass (plus 413 oversize) |
| Component | Success state only after `ok: true`; on error, fields kept and mailto shown; chips expose `aria-pressed` | 5/5 pass |
| `pnpm typecheck` / `lint` / `test` | green, 0 lint errors | pass; 5 baseline warnings; 359/359 |
| `pnpm build:cloudflare`, `pnpm perf:budget` | green | pass; `/contact` 238.9 KB / 300 KB |
| Local `pnpm preview` without secrets | Submitting shows the 503 message and the mailto fallback | pass (phone and desktop) |
| Local `pnpm preview` with owner's test secrets | A real email arrives, and Reply goes to the visitor's address | NOT RUN (owner secrets) |
| `/showcase` | 308 to `/` locally; absent from `sitemap.xml`, `llms.txt` and `public/sitemap.md` | pass |
| e2e smoke + a11y (`pnpm test:e2e --project=desktop smoke a11y`) | green with the updated route list | 88/88 pass (desktop + mobile) |
| Production (after approved deploy) | The owner sends one test message and confirms receipt | pending deploy approval |

## Blockers that justify BLOCKED

- Resend domain or secrets unavailable, and the owner doesn't want to ship the honest-error version first.
- Copy not approved. In that case, ship delivery plus neutral copy, and log the copy as follow-up.

## Out of scope

- Turnstile and per-IP rate limiting (general backlog item). The honeypot and timing check are the interim defence. Revisit if spam arrives.
- Changing the contact page's visual design or video (Phase 2 handles the video's speed).

## Resume and Execution Handoff

- Execute anchor: this file.
- Branch suggestion: `fix/contact-delivery-and-showcase` from `main`.
- Order: (1) `lib/contact` with tests, red then green; (2) API route with tests; (3) client wiring with component test; (4) copy module; (5) `/showcase` retirement; (6) gates; (7) phase report at `../reports/phase-0_fix-broken_REPORT_<dd-mm-yy>.md`.
- Commit only when the owner asks. Suggested split: `feat(contact): deliver messages via Resend`, `content(contact): founder-voice copy`, `chore(routes): retire /showcase`.
