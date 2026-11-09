# Phase 0 report: Fix what's broken (06-11-26)

**Plan:** `../completed/phase-0_fix-broken_PLAN_06-11-26.md`
**Branch:** `fix/contact-delivery-and-showcase` (uncommitted; the owner hasn't asked for commits yet)
**Mode:** EXECUTE under the Harness-Absent Fallback. Run in the main session, while the Skills hub was built in parallel in an agent worktree (owner chose parallel).

## What changed

### Contact delivery (finding 1)
- `lib/content/contact.ts` (new): copy, topic whitelist and limits, shared by client and server.
- `lib/contact/sendContactMessage.ts` (new), a pure helper that never throws:
  - validates input, then silently drops bots (honeypot, or under 3 s fill time);
  - returns 503 when Resend isn't configured and 502 on a send failure;
  - sends one plain-text email to `CONTACT_TO_EMAIL` from `CONTACT_FROM_EMAIL` with `reply_to` set to the visitor;
  - strips control characters from the subject to block header injection.
- `app/api/contact/route.ts` (new): rejects bodies over 20 KB with 413, parses JSON, and returns `{ ok, message }` only, never echoing input.
- `components/landing/FormaContactPage.tsx`:
  - replaced the fake 1 s `setTimeout` "success" with a real POST; success shows only after the server confirms;
  - on failure, keeps the visitor's text and shows the error with a mailto fallback in an `aria-live` region;
  - adds a honeypot field;
  - topic chips are `aria-pressed` toggles inside a `fieldset`/`legend`;
  - name, email and message now have real (visually hidden) labels; before, they had placeholders only.
- `.env.example`, `.dev.vars.example`: `CONTACT_TO_EMAIL` and `CONTACT_FROM_EMAIL` (names only).

### Contact copy (finding 2)
- The headline, card, labels, topics, success, error and meta description now come from `lib/content/contact.ts`, using the draft in the plan's copy table. No agency template copy remains (asserted in the component test).
- "Expect a reply within 24 hours" was removed (no reply-time promise).

### `/showcase` retirement (finding 3)
- Deleted:
  - `app/(landing)/showcase/{page,layout}.tsx`
  - `components/landing/ShowcasePage.tsx`
  - `components/landing/showcase/SpotlightReveal.tsx`
  - `public/previews/creative-studio-showcase.html`
- `next.config.ts`: `/showcase` permanently redirects to `/`.
- References removed or retargeted:
  - `app/sitemap.ts`, `app/llms.txt/route.ts`, `public/sitemap.md`
  - `components/landing/stock/README.md`, `scripts/check-first-load-budget.mjs`
  - `tests/e2e/routes.ts`; `app/not-found.tsx` (now links Portfolio)
  - `lib/content/examples.ts` (card now points to `/portfolio`)
  - `README.md` (5 spots)
- Kept the `--color-showcase-*` tokens and liquid-glass utility, which `/stock/velorah` uses.

## Deviations from the plan

0. **Phone layout fixes on the contact card** (small, visual): the social icons stack under the email below `sm` so the address isn't truncated, and the headline has a stronger text shadow for contrast over the bright sky video.

1. **Bot timing uses `elapsedMs`, not `startedAt`.** The client measures time-to-submit on its own clock (`performance.now()`). Comparing a browser timestamp with the server clock breaks under clock skew: a fast client clock would have silently dropped real messages.
2. **Inputs got real labels**, which weren't in the plan. Placeholder-only fields fail WCAG; this was found while rewriting the form.
3. **`.claude` excluded in `tsconfig.json` and `vitest.config.mts`** (not in plan). The agent harness puts git worktrees in `.claude/worktrees/`, inside the repo folder. `tsc`, `next build` and `vitest` were picking up a second full copy of the repo, including another branch's in-progress code. `.claude/` is already gitignored. This goes in a separate commit.
4. **`AGENTS.md` still says `/showcase` is live** (line 730). It's left for UPDATE PROCESS, per the process/code commit split.

## Verification Evidence

| Gate | Result |
|---|---|
| `lib/contact/sendContactMessage.test.ts` | 25/25 pass |
| `app/api/contact/route.test.ts` | 6/6 pass |
| `components/landing/FormaContactPage.test.tsx` | 5/5 pass |
| `pnpm typecheck` | pass |
| `pnpm lint` | 0 errors, 5 warnings (the same 5 as baseline) |
| `pnpm test` | 77 files, 359/359 pass (baseline 323 + 36 new) |
| `pnpm build:cloudflare` | pass (run twice; second after the phone layout fix). `/api/contact` is dynamic, `/contact` static |
| `pnpm perf:budget` | pass. `/contact` 238.9 KB / 300 KB; worst route `/blog/ai-transformation-thailand-smes` 288.3 KB |
| Local Workers preview (port 8795; 8787 is used by an unrelated local process): `/api/contact` | valid body with no secrets returns 503 "isn't connected yet"; bad email 400; bad JSON 400; 30 KB body 413; GET 405. Responses never echo input |
| Browser, phone and desktop (Playwright, after a human-paced 3.2 s fill) | API 503; error plus mailto fallback shown in the live region; no success state; message text kept; chip `aria-pressed=true`; no horizontal scroll |
| `/showcase` | 308 to `/`; 0 matches in `sitemap.xml` and `llms.txt`; the 404 page links `/portfolio`; old template copy gone from `/contact` HTML |
| e2e `smoke.spec.ts` + `a11y.spec.ts`, `--project=desktop --project=mobile`, against the preview | 88/88 pass (axe dark and light, every route in `tests/e2e/routes.ts`) |
| Phone visual check | the email shows in full (previously truncated to "fronk.kunanon@..."); headline readable over the sky after a stronger text shadow |
| Real email delivered (needs owner's Resend secrets) | NOT RUN: owner action. Quick check once secrets are in `.dev.vars`: submit the form on the local preview, or send to Resend's test inbox `delivered@resend.dev` |

## Owner actions still needed

1. Verify `kunanonj.com` as a sending domain in Resend, if it isn't already.
2. `wrangler secret put CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`, and `RESEND_API_KEY` (if not already set for the newsletter).
3. Review the new contact copy and the rewritten examples card in `lib/content/examples.ts`.
4. Approve commits, PR and deploy.
