# Phase 1 report: Remove waiting (09-11-26)

**Plan:** `../completed/phase-1_remove-waiting_PLAN_06-11-26.md`
**Branch:** `perf/shorter-intro-and-transitions`
**Mode:** EXECUTE under the Harness-Absent Fallback (main session). The owner said "continue the ux-experience plan" after Phase 0 shipped in #53.
**Covers audit findings:** 4 (8.1 s intro), 5 (1.8 s route wipe), 8 (cursor rAF never idles)

## What changed

### Intro (finding 4)
- `lib/content/introGreetings.ts`:
  - greetings cut from 8 to 3: `Hello`, `สวัสดี`, `Welcome to KunanonJ`;
  - adds `INTRO_MAX_MS = 1500`, `INTRO_TIMING` (350 ms per word, 450 ms on the last, 300 ms exit) and the `introExitStartMs` and `introTotalMs` helpers. The total is 1450 ms.
- `components/landing/IntroLoader.tsx`, rewritten:
  - CSS-only motion; framer-motion is no longer used;
  - any `keydown`, `pointerdown`, `wheel` or `touchstart`, or the visible "Skip intro" button, ends the intro at once;
  - `role="status"` and `aria-label="Loading"` are removed (the page isn't loading), and the greeting words are `aria-hidden`;
  - keeps session-once (`fronk-intro-seen`) and the reduced-motion skip.
- `app/globals.css`: adds the `.intro-overlay` and `.intro-word` styles.
- Deleted the unused duplicate `components/home/IntroLoader.tsx` and its test (nothing imported it).

### Route transition (finding 5)
- `components/landing/RouteSplash.tsx` is deleted, along with its ~110 lines of panel-wipe CSS.
- New `components/landing/RouteFade.tsx`, mounted in `app/layout.tsx`:
  - after a client navigation it fades the new page's `<main id="main">` from opacity 0 to 1 over 250 ms, using the Web Animations API;
  - opacity only, so fixed-position children are unaffected; no overlay; the nav and footer are untouched;
  - runs in a layout effect, so the new page never paints at full opacity first;
  - skipped on first paint, same-path updates (query or hash), `/studio`, and reduced motion.
- `public/skills.md` §1.3 now tells agents: `RouteFade`, never a full-screen wipe; intro at most 1.5 s and skippable.

### Cursor (finding 8)
- `components/landing/SmoothCursor.tsx`:
  - the rAF loop starts on `pointermove` and stops once the cursor is within 0.1 px of the pointer;
  - `elementFromPoint` runs at most once per frame (it ran on every pointer event before), and `setIsHand` fires only when the value changes;
  - the cursor is parked off-screen until the first move. No visual change.

## Deviations from the plan

1. **Timing constants.** The plan's 360/250/300 ms with 3 words adds up to about 1.63 s, over the ceiling. Used 350 ms per word, 450 ms for the last word and a 300 ms exit (1.45 s). A unit test enforces the 1.5 s ceiling.
2. **Greeting words.** Used the plan's proposed set; the owner can change them in `lib/content/introGreetings.ts`, and the test keeps the total under 1.5 s.
3. **The overlay isn't `aria-hidden` as a whole.** It contains the focusable Skip button, and `aria-hidden` on a focusable container is an axe violation. Only the decorative words are hidden.
4. **Any key skips, Tab included,** so "Tab reaches Skip intro" became "any key ends the intro". The button stays for pointer and screen-reader users.
5. **Route fade uses the Web Animations API, not React `<ViewTransition>`.** Context7 confirms view transitions need no flag in Next 16.4 with React 19.3. But they snapshot the whole viewport, which would freeze the custom cursor and nav for the transition, and Safari behaves differently. Renamed `RouteSplash` to `RouteFade` because the name no longer described it.
6. **Idle-cursor check.** Instead of the DevTools Performance panel, the probe wraps `requestAnimationFrame` and counts calls.

## Verification Evidence

Probe: Playwright with system Chrome against the local Workers preview (`opennextjs-cloudflare preview --port 8795`). The phone profile is 390x844, touch, DPR 2; "throttled" adds 4x CPU, ~1.6 Mbps and 150 ms RTT. Timings come from in-page `performance.now()` and a MutationObserver. Script kept in the session scratchpad; Phase 2 commits a repeatable probe.

| Gate | Expected | Result |
|---|---|---|
| Unit: `introGreetings.test.ts` | Total under 1500 ms | 3/3 pass (total 1450 ms) |
| Unit: `IntroLoader.test.tsx` | Cycles and is gone within 1.5 s; session-once; reduced-motion skip; key, pointer, wheel and touch skip; Skip button; words `aria-hidden` | 8/8 pass |
| Unit: `RouteFade.test.tsx` | Fade only on a real path change; 250 ms opacity keyframes on `#main`; none under reduced motion or Studio | 6/6 pass |
| Unit: `SmoothCursor.test.tsx` | No frames until a move; loop stops after settling; at most 1 hit-test per frame; restarts on the next move | 4/4 pass |
| Intro on screen, first visit (unthrottled) | under 1.5 s (baseline 8.1 s) | 1454 ms (cold server: 1465 ms) |
| Intro on screen, throttled phone | under 1.5 s | 1468 ms |
| Skip by key / tap / button | Ends at once | Exit starts within 0-1 ms; overlay gone after 302 ms in all three |
| Navigation, new h1 at full opacity after the click (desktop) | under 300 ms (baseline: 1.8 s wipe) | 199-232 ms unthrottled; 199-282 ms with 4x CPU and slow network |
| Reduced motion | No intro, no fade | Intro not shown; 0 animations on `#main`; h1 visible 66-100 ms after the click |
| Idle cursor (desktop `/portfolio`) | No rAF callbacks after 1 s still | 0 calls in a 1 s idle window (4 in 100 ms after a move); settles exactly on the pointer |
| axe on the intro overlay while visible (phone, dark and light) | No serious or critical | 0 violations |
| `pnpm typecheck` | pass | pass (after clearing stale `.next/types` left over from the `/showcase` removal) |
| `pnpm lint` | 0 errors | 0 errors, the same 5 baseline warnings |
| `pnpm test` | green | 82 files, 409/409 pass |
| `pnpm build:cloudflare` | pass | pass |
| `pnpm perf:budget` | pass | pass, worst 291.6 KB / 300 KB (`/blog/*`) |
| e2e `smoke.spec.ts` + `a11y.spec.ts`, desktop and mobile, against the preview | green | 100/100 pass |

### JS bytes (gzip, first load), `main` and this branch built the same way

| Routes | main | branch | Change |
|---|---|---|---|
| Non-marketing (`/resume`, `/topics/*`, `/th/topics/*`, `/ventures/*`, `/stock/*`) | 182.9-185.3 KB | 0.7-0.8 KB less | framer-motion no longer reaches the root layout |
| Marketing (`/`, `/about`, `/blog*`, `/portfolio*`, `/skills*`, library) | 235.8-288.3 KB | +3.3-3.4 KB | Bundler artifact, see below |

Cause of the marketing increase (module-level diff of `/about` chunks):
- On `main`, Turbopack scope-hoisted framer-motion into one 130 KB raw module, because the root layout (`RouteSplash` importing `useReducedMotion`) and the landing pages imported it together.
- With the root import gone, it emits about 20 separate framer-motion module factories. That adds about 8 KB raw of wrapper code (374 to 382 KB raw on `/about`), or about 3.3 KB gzip.
- No new feature code is in those bytes: the cursor chunk grew 0.1 KB and the intro code is only on `/`.
- Phase 2's framer-motion work (`LazyMotion`, or CSS for the simple reveals) replaces this chunk anyway, so it isn't worked around here.

## Production check (after #55 deployed, 09-11-26)

The same probe was run against https://kunanonj.com. The live home bundle contains the new intro ("Skip intro") and no `route-splash` code.

| Check | Result |
|---|---|
| Intro on screen (unthrottled / throttled phone) | 1457 ms / 1484 ms |
| Skip by key / tap / button | Exit starts within 0-1 ms; gone after 302 ms |
| Navigation, h1 at full opacity (unthrottled) | 199-249 ms |
| Navigation, h1 at full opacity (4x CPU, ~1.6 Mbps, 150 ms RTT) | 234 ms back to `/portfolio`. 461 ms on the first visit to `/portfolio/tbh-intranet`: the route payload arrived at 320 ms over the throttled network, then the 250 ms fade ran. Network-bound, not fade-bound; Phase 2 (payload size) is where to improve it |
| Reduced motion | No intro; no fade (h1 visible 66-123 ms) |
| Idle cursor | 0 rAF calls in 1 s |

## Not checked

- WebKit/Safari and a real screen-reader pass (unchanged from the audit's gaps).
- Visual baselines: still stale; Phase 5 refreshes them.

## Hand-off to Phase 2

- Re-measure LCP with the intro gone. The audit's 10.7 s LCP on `/` was measured with the intro skipped, so it's still the true baseline.
- Start with framer-motion: that one chunk is the largest marketing-only cost, and the bundler now splits it into many modules.
