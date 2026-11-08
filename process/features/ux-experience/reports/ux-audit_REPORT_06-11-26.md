# UX audit: kunanonj.com (06-11-26)

**Mode:** RESEARCH (run under the Harness-Absent Fallback: `.claude/` and `process/context/` are missing in this clone).
**Scope:** the live site at https://kunanonj.com plus the code at `main` @ `2e878d4`.
**Goal from owner:** "improve my website for better experience".

## Method

- Manual walk-through in Chrome at desktop width (home, about, ventures, contact, showcase).
- Playwright probe (system Chrome, headless) over 19 routes at 390x844 (touch, DPR 2) and 1440x900: horizontal overflow, console errors, failed requests, tap targets under 24x24, text under 12px, h1 count, unlabeled controls.
- Perf pass on 5 routes at phone size: 4x CPU throttle, ~1.6 Mbps down, 150 ms RTT, cold cache, intro skipped. One run each, so treat numbers as lab indicators, not field data.
- Code reading for each finding (paths below).

Probe script: kept outside the repo (session scratchpad). Re-create it in `scripts/` if the phases below need a repeatable gate.

## Baseline (local, Node 26.13, pnpm 10.34.9)

| Gate | Result |
|---|---|
| `pnpm typecheck` | pass, 0 errors |
| `pnpm lint` | 0 errors, 5 known warnings (listed in backlog) |
| `pnpm test` | 323/323 pass |
| Build / e2e | not run in this pass |

Probe: no horizontal scroll on any route at either width; exactly one h1 per page; no images missing `alt`; no unlabeled buttons.

## Findings

### P0: broken or trust-damaging

1. **The contact form never sends.** `components/landing/FormaContactPage.tsx:147-153`: `onSubmit` waits 1 s, then shows the success state. Nothing is posted anywhere. Every message sent through `/contact` was lost while the visitor saw "sent".
2. **Contact copy is from an agency template.** "We craft bold ideas and ship them as products", "Drop us a line", "Tell us about your vision", and a service picker (Website, Mobile App, E-Commerce, Visual Identity, 3D & Motion, Digital Marketing...). The route description repeats it (`app/(landing)/contact/page.tsx:7`). It contradicts the founder positioning everywhere else.
3. **`/showcase` is an unrelated wellness landing page.** It shows "Live Better, Feel Whole Every Day", "Start Today" and "Discover How", is listed in `sitemap.xml`, and has no framing. It muddies who the site is about, for visitors and for search engines.

### P1: waiting and speed

4. **First-visit intro blocks the site for about 8 s.** Measured 8.1 s on a phone before the hero is visible. `components/landing/IntroLoader.tsx`: 8 greetings x 720 ms, plus 900 ms hold and 700 ms exit. It can't be skipped. It shows once per browser session, so every new visit from LinkedIn or Google pays the full cost.
5. **Every internal click shows a 1.8 s full-screen wipe.** `components/landing/RouteSplash.tsx:8` (`SPLASH_MS = 1800`), mounted for all routes in `app/layout.tsx:121`. A five-page visit spends about 7 s looking at panels.
6. **Mobile LCP is slow.**

   | Route | LCP | LCP element | Notes |
   |---|---|---|---|
   | `/` | 10.7 s | hero `<video>` | 3 `<video>` elements, 2 with the same source |
   | `/blog` | 7.6 s | card image | 982 KB of images on the index |
   | `/about` | 4.3 s | hero `<video>` | |
   | `/blog/cashback-loops` | 4.0 s | cover image | |
   | `/portfolio` | 1.9 s | SVG text | good |

   Target is under 2.5 s. CLS was 0 everywhere and TBT stayed under 50 ms, so the problem is bytes and video, not main-thread work.
7. **About 240-310 KB of compressed JS on every route.** The biggest chunks on `/`: react-dom (223 KB raw), framer-motion (147 KB raw), and three chunks containing Sanity code (about 165 KB raw combined), even though the home page renders static fallback content.
8. **The custom cursor never idles.** `components/landing/SmoothCursor.tsx` runs `requestAnimationFrame` forever and calls `elementFromPoint` on every pointer move. That is constant CPU and battery cost on desktop, and it replaces the native cursor.

### P1: readability and accessibility

9. **10 px text on every page:** eyebrows, dates, tags, footer group headings. There are 58-60 instances on `/blog` alone.
10. **Tap targets under WCAG 2.2 AA (24x24) on phones**, 14-31 per page. Examples: footer X link 9x16, LinkedIn 52x16, GitHub 43x16, the footer Library links (16 px tall), and "Back to Blog" (78x14).
11. **Six identical "Learn more" links on home.** Each venture card is in the DOM twice, and every link has the same text, so screen-reader link lists can't tell them apart.
12. **`/resume` loads company icons from `icons.duckduckgo.com`.** Four of them return 404 (aidenlabs.ai, thebinaryholdings.com, coins.co.th, cattelecom.com), which logs console errors. The third-party request also sends each visitor's IP to DuckDuckGo.

### P2: information architecture and content

13. **Home doesn't surface the portfolio or the blog.** The flow is hero, about, ventures, footer (about 4 screens). There's no "selected work" or "latest writing" entry point.
14. **`/about` starts with the newsletter signup**, before any profile content, and runs 9.4 phone screens with no in-page navigation.
15. **`/blog` on a phone shows 20 tag chips (5 rows) before the first post.**
16. **Copy disagrees with itself.** The hero says "Founder of GoGoCash and Manut", while About and the ventures section say three ventures (with Airplusauto). Airplusauto links off-site; the other two have pages.
17. **A decorative photo card takes a full phone screen** inside the ventures grid, before the first venture card.
18. **The leading "3" in "3 ventures" is clipped** at its left edge by the reveal mask.

### Hygiene (makes later work safer)

19. **Likely leftovers from earlier redesigns** (HUD, FogLAMP, old home): about 40 modules that look unreferenced, two `IntroLoader` implementations, and unused dependencies (`three`, `gsap` and `lenis` are reachable only through modules nothing imports). The module scan was alias-only, so it has false positives; confirm with `knip` before deleting.
20. **Related backlog items:** stale visual baselines (P2), the 5 lint warnings, the reduced-motion hydration warning, and Turnstile for forms.

## Not checked

Light theme, WebKit/Safari, a real screen-reader pass, field data (Cloudflare Web Analytics / `WebVitals`), and the production build plus e2e suites.

## Recommended program shape

Proposed feature folder: `process/features/ux-experience/`. Each phase is one PR, run as research, approval, execute, validate, report.

| Phase | Theme | Covers | Exit check |
|---|---|---|---|
| 0 | Fix what's broken | 1, 2, 3 | A real message reaches the inbox; no template copy left; `/showcase` decision applied |
| 1 | Remove waiting | 4, 5, 8 | Hero visible under 1.5 s on first visit; navigation shows content immediately |
| 2 | Speed | 6, 7 | Mobile LCP under 2.5 s on `/`, `/about`, `/blog`; JS budget lowered and enforced by `perf:budget` |
| 3 | Readability and a11y | 9, 10, 11, 12 | No text under 12 px; no tap target under 24x24; axe clean on all routes |
| 4 | IA and content | 13-18 | Home links to work and writing; About reordered; blog filter fits in one row |
| 5 | Cleanup and guardrails | 19, 20 | Dead code and dependencies removed; visual baselines refreshed and reviewed |

Phase 0 is small and urgent: every day the form stays fake, messages are lost.

## Owner decisions (06-11-26)

1. **Contact form:** keep the form and send it as email through Resend (the same provider as `app/api/subscribe/route.ts`).
2. **Intro loader and route splash:** shorten both. The intro must finish within 1.5 s and be skippable; the route wipe becomes a fade of about 250 ms.
3. **`/showcase`:** remove the page, permanently redirect it to `/`, and drop it from the sitemap.

Program plans: `process/features/ux-experience/active/ux-experience_UMBRELLA_PLAN_06-11-26.md`.
