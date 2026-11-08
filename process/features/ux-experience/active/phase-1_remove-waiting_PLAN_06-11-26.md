# Phase 1: Remove waiting

**Status:** PLANNED (re-research at phase entry). Waiting for EXECUTE approval.
**Created:** 06-11-26
**Umbrella:** `ux-experience_UMBRELLA_PLAN_06-11-26.md`
**Covers audit findings:** 4 (8.1 s intro), 5 (1.8 s route wipe), 8 (cursor rAF never idles)
**Depends on:** none. It can run in parallel with Phase 0 on a separate branch.

## Objective

A first-time visitor sees the hero within 1.5 s, and any key, click, tap, scroll or a visible Skip control ends the intro at once. Route changes show the new page within about 300 ms. The custom cursor stops costing frames when the pointer is still.

## Decision (owner, 06-11-26)

Shorten both: intro within 1.5 s and skippable; route wipe becomes a fade of about 250 ms.

## Design

### Intro (`components/landing/IntroLoader.tsx`)

- Greetings: `Hello`, `สวัสดี`, `Welcome to KunanonJ`. Three words keep the multilingual idea without the wait. Exact words are the owner's call at the checkpoint; total time is the fixed constraint.
- Timing: 360 ms per word, 250 ms hold on the last word, and a 300 ms exit, about 1.4 s in total. Put the constants in `lib/content/introGreetings.ts` and enforce `total <= 1500` with a unit test.
- Skip: listen for `keydown`, `pointerdown`, `wheel` and `touchstart` (passive, once) and jump straight to exit. Add a visible, focusable "Skip intro" button for keyboard and screen-reader users.
- Semantics: drop `role="status"` and `aria-label="Loading"`, because the page isn't loading. Mark the overlay `aria-hidden` and make sure focus is never trapped behind it.
- Keep the existing rules: session-once and reduced-motion skip.
- Delete the unused duplicate `components/home/IntroLoader.tsx` and its test. Re-check that nothing imports it.

### Route transition (`components/landing/RouteSplash.tsx`, mounted in `app/layout.tsx:121`)

- Replace the 5-panel cover/hold/reveal (`SPLASH_MS = 1800`) with a 250 ms opacity fade-in of the incoming page. Content must never be fully covered.
- At phase entry, check via Context7 whether Next 16.4 App Router view transitions (React `ViewTransition`, or `experimental.viewTransition`) are stable enough. If yes, prefer them over a custom overlay; if not, use a CSS fade keyed on the pathname.
- Keep the skips: reduced motion, `/studio`, and hash-only jumps.
- Update `public/skills.md` §1.3, which tells agents to keep `RouteSplash`.

### Cursor (`components/landing/SmoothCursor.tsx`)

- Stop the rAF loop once the cursor has converged (`|target - pos| < 0.1px`) and restart it on `pointermove`.
- Throttle the `elementFromPoint` hand-cursor check to one per frame inside `tick`, not one per pointer event.
- No visual change.

## Touchpoints

`components/landing/IntroLoader.tsx`, `lib/content/introGreetings.ts` (+ test), `components/landing/RouteSplash.tsx`, `app/layout.tsx` (only if the mount changes), `components/landing/SmoothCursor.tsx`, `components/home/IntroLoader.tsx` and its test (delete), `public/skills.md`.

## Public Contracts

None (no routes, APIs or env vars change). The `fronk-intro-seen` session key stays.

## Blast Radius

Every landing route, because the splash and cursor are global. Visual baselines are already stale (backlog P2) and get refreshed in Phase 5.

## Verification Evidence (to fill in)

| Gate | Expected | Result |
|---|---|---|
| Unit | Intro total under 1500 ms; skip handler ends the intro; cursor loop stops after convergence (fake timers) | |
| Probe (first visit, phone) | Hero visible under 1.5 s (baseline 8.1 s) | |
| Probe (navigation) | New page's h1 visible under 300 ms after the click | |
| Keyboard | Tab reaches "Skip intro"; Enter skips | |
| Reduced motion | No intro, no fade | |
| Idle cursor (desktop, Performance panel) | No rAF callbacks after 1 s still | |
| typecheck / lint / test / build:cloudflare / perf:budget / e2e smoke+a11y | green | |

## Blockers that justify BLOCKED

The owner wants the intro longer than 1.5 s, which conflicts with the program north star. Re-decide before executing.

## Resume and Execution Handoff

Execute anchor: this file. Branch suggestion: `perf/shorter-intro-and-transitions`. Report target: `../reports/phase-1_remove-waiting_REPORT_<dd-mm-yy>.md`.
