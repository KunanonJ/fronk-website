# Phase 8 report: cleanup, guards and speed

**Plan:** `../completed/phase-8_cleanup_PLAN_18-11-26.md`, steps 8a to 8g.
**Date:** 19-11-26, run by the orchestrator in this session (the delegated
lanes were rate-limited), on the branch `feat/profile-phase8-cleanup`, from
`main` at `cb1dd6c` (Phase 7 group D2).
**Status:** VERIFIED (19-11-26). PR #128 merged as `f50d573` and deployed
by hand as version `fcd8f2fd` (rollback target `a9b74b54`); live checks in
section 8.

## 1. What was done, by step

| Step | Commits | What |
| --- | --- | --- |
| 8a | `9eca251`, `02740f2` | The `data-design="profile"` scope folded into `:root` and `.dark` (the same specificity on `<html>`, so every computed value stays): the old declarations of the twenty role tokens the scope redefined, and the old tokens nothing read, are gone; the attribute left the root route, the nav, the footer and the share panel with `lib/design/scope.ts`. Deleted: Geist and Geist Mono (13 faces, 11 files, the preloads), the old `ThemeToggle`, `ui/Button`, the bento `Buttons`, `Chips`, `Segmented`, grid wrappers, `CardLink`, `Well` and `ICON_BUTTON`, `PortfolioParts`, `lib/landing/experience`, the bento canvas's surface and motion CSS and keyframes, the shell's copy of the theme fade, and the Tailwind colours, shadows and curves no class used. The font utilities now set the redesign's stacks. |
| 8b | `27988f3`, with 8a and 8c | `globals.test.ts` pins the new palette in both themes, retires Geist, and checks the font utilities match the tokens' stacks; `contrast.test.ts` reads `:root` and `.dark` and evaluates every pair, the old role pairs included, with the colour mixes; `sharedPrimitives.test.ts` keeps the `ds-` and `t-` blocks in `globals.css` and every pill's classes in `pillClass()`; the raw-hex ratchet scans every component and route with no allowlist; `lib/brand/tokens.test.ts` pins the brand mirror to its tokens; axe runs WCAG 2.2 on every route. `typeFloor.test.ts` stays at 12 px. |
| 8c | `a3527ee`, `b098585`, `f4b244d` | Share cards: a paper field, the site's dither band at the foot, the title in Instrument Serif, the rest in Onest, the eyebrow in the accent's text colour; a long summary is cut at a word to about two lines. Icons: a paper K in Instrument Serif on an ink tile with one accent pixel. Fonts are static TrueType cuts of the site's own woff2 files (Onest instantiated at 400 and 500) with their OFL texts. `lib/brand/tokens.ts` mirrors the new palette. The kunanonj.com project's cover is re-shot from the new Home, with new alt text. |
| 8d | `354f8a6`, `13c8ac7`, `68ee1cc` | Each route's loader now shares its component's chunk: a loader in a chunk of its own was preloaded on every server-rendered page and never imported there (Safari: "preloaded but not used", 65 warnings on 41 pages). Dither fields draw at an idle moment (first draw and resizes; theme flips still on the next frame). Budgets lowered: stylesheets 37 to 36 KB, preloaded fonts 56 to 52 KB. |
| 8e | (tests, below) | The audit list mapped to the tests that hold it; nothing new was needed but WCAG 2.2 on every route (8b). |
| 8f | `821796c` and this report | README, AGENTS.md, the feature list, the design spec (marked live) and the earlier design documents (marked superseded). |
| 8g | `7b16a18` | A report-only Content Security Policy on every page but Sanity Studio's (section 4). |

## 2. Proof that the fold changed nothing else

Every HTML route (79, the 404 included) was captured full-page in Chromium at
1440 px light and 390 px dark, with motion off and the clock fixed, from the
production build (`cb1dd6c`) and from this branch, then compared pixel by
pixel.

- **After 8a** (the fold and the deletions): 149 of 158 identical. The nine
  others: About's contributions line and the résumé's company initials, now
  JetBrains Mono instead of Geist Mono (8 images, intended), and `/press`,
  where the second run's Unsplash banner had not loaded (a third-party image).
- **After 8a to 8g:** 144 of 158 identical. The 14 others: the same font
  change, and the kunanonj.com cover on `/portfolio`, on its own page and in
  two pages' More projects (intended).

So the 16 visual baselines of `/about`, `/portfolio`,
`/portfolio/ai-automation` and `/portfolio/kunanonj-com` are removed for CI
to write again; no other baseline should change.

## 3. Gates

| Gate | Result |
| --- | --- |
| Types, lint, format, knip | pass |
| Unit | 161 files, 1,501 tests pass |
| Build | pass; no Geist file in the output |
| Budgets | entry 107.4 / 120 KB (was 108.7); worst route 194.0 / 200 KB (`/skills/code-review`, was 195.1); stylesheets 33.8 / 36 KB (was 36.96 of 37); preloaded fonts 47.7 / 52 KB |
| Smoke and axe | `smoke.spec.ts` and `a11y.spec.ts`, desktop and mobile: 506 passed (WCAG 2.2 on every route in both themes, the CSP check included) |
| Parity | 137 URLs compared, 0 with differences |
| Console | Chromium, 79 routes in two passes: no warning, uncaught error or failed request; the only errors are the browser's own "Failed to load resource: 404" lines on the six 404 probes, which must answer 404. WebKit: 65 "preloaded but not used" warnings on 41 pages before 8d, none after on the pages that had them |
| Share images | rendered for Home, About, a project, a skill, a topic and a venture, and reviewed; the icons too |

The full browser gate (every project) and the Linux baselines run in CI.

## 4. The Content Security Policy (8g)

`Content-Security-Policy-Report-Only`, one string in `src/server/http.ts`
(Worker responses) and `public/_headers` (prerendered pages), kept identical
by a test; Sanity Studio is left out in both. `default-src 'self'`; scripts
from the site plus Cloudflare Web Analytics and Turnstile; images from the
site, `data:`, Sanity's CDN and Unsplash; fonts and connections from the site
(plus the analytics beacon); Turnstile's frame; `object-src 'none'`;
`base-uri`, `form-action` and `frame-ancestors` kept to the site.

- **Deviation from the plan:** no script hashes. TanStack Start streams
  per-page hydration scripts into the HTML (their contents differ on every
  page), the prerendered pages cannot carry a per-response nonce, and a single
  hash would switch `'unsafe-inline'` off, so every page would report. The
  policy keeps `'unsafe-inline'` for scripts; enforcing it with nonces (every
  page rendered on request) is the owner's later decision.
- **Parity:** the crawl reads the enforced `Content-Security-Policy` header
  only, so the report-only header changes nothing there.
- **Test:** a smoke test visits every route, scrolls it, and fails on any
  `securitypolicyviolation` event; an injected off-policy image is caught
  (`img-src https://example.org/probe.png`), and every route passes.
- **Reports (added in review, `df49992`):** CI's WebKit run failed the case
  pages on a console error. Safari says a report-only policy that names no
  report destination "will have no effect". The policy now ends with
  `report-uri /api/csp-report; report-to csp`, every response carries
  `Reporting-Endpoints: csp="/api/csp-report"`, and the Worker answers that
  path (`src/server/cspReport.ts`): it logs each violation as one JSON line
  (page path, directive, the blocked URL without its query; no referrer or
  user agent), stores nothing, and answers 204. Checked in Chromium, WebKit
  and Firefox 157: no console message about the policy, and each engine's
  report shape parses.

## 5. Accessibility audit (8e)

| Item | Held by |
| --- | --- |
| Reduced motion stops every animation and view transition | `globals.test.ts` (every animation behind no-preference; the theme fade once, in `globals.css`); smoke "reduced-motion users get a static, usable page"; `profile-shell.spec.ts` |
| A pause control on anything that moves for more than 5 s | the marquee, motion tile, orbit, notebook and showcase checks in `profile-hero`, `profile-work-about`, `profile-journey` and `profile-case` specs |
| Focus never hidden under the nav | the scroll-padding and "uncovered" checks in the shell, hero, work-about, journey, case and smoke specs |
| Keyboard paths (popover, menu, viewer, notebook, orbit) | `profile-shell`, `profile-case`, `profile-journey` specs |
| axe WCAG 2.2 in both themes on every route | `a11y.spec.ts` (every route since 8b) |
| Forced colours, more contrast, reduced transparency, text spacing, 200% zoom, per page family | `profile.spec.ts` and the hub and catalog specs; `globals.test.ts` keeps the reader-preference blocks |
| Screen readers (VoiceOver, TalkBack, NVDA) | the owner's manual pass (carried) |

## 6. Speed

The live probe (plan gate 4) runs after the deploy, on an idle machine, for
`/`, `/about`, `/portfolio/tbh-intranet`, `/topics/forward-deployed-ai-engineering`
and a Thai hub; section 8 of this report records it. The 28-day field Core
Web Vitals comparison needs 28 days of data after the cutover: carried.

## 7. Open items

1. **Screen-reader passes** (VoiceOver, TalkBack, NVDA): the owner.
2. **28-day field Core Web Vitals** against the numbers from before Phase 6:
   after 17-12-26.
3. **Enforcing the CSP** with nonces: the owner's decision.
4. **The press and blog banners** load from Unsplash (hidden pages):
   self-host or drop them before the blog goes public (the owner).
5. **Workers Builds** still fails at its start on every commit (since
   18-11-26); production is deployed by hand. The owner's Cloudflare
   dashboard.
6. **The design system artifact** (outside the repo) is re-synced from the
   repo when the owner next opens it; the repo leads.
7. **Refactor follow-ups** (no behaviour change): `CatalogHero` folds into
   Phase 6's `PageHero`; `.pf-cat-count` and `.pf-read-count` are one rule;
   the device-matrix helpers repeated in the hub and catalog specs move to one
   module; content helpers kept only for tests (`caseHeading`,
   `findProjectCase`, `findVentureCase`, `allCaseStudies`, `headlineText`)
   are reviewed. In the follow-up cleanup pull request.
8. **Cloudflare's script monitor** (Page Shield) adds its own report-only
   policy to about 1 in 12 live responses. It reports every script and
   connection, so those page views log `[Report Only] Refused to load ...`
   errors in every browser, and a live run of the CSP smoke test or the
   WebKit case pages fails at random. It is not the site's policy. Turning
   the monitor off is the owner's choice in the Cloudflare dashboard.
9. **Lazy images in full-page captures:** a capture never loads a lazy image
   far below the first screen, so the AI Automation baselines show a blank
   box where the kunanonj.com cover sits in More projects. The follow-up
   cleanup pull request makes `visual.spec.ts` load every image first.
10. **Dependabot:** `satori` before 0.33.5 (SVG escaping; the share images;
    `@cf-wasm/satori` pins 0.32.0) and `minimatch` before 11.0.1 (a DoS in
    dev tooling, through eslint and the Sanity CLI). The follow-up cleanup
    pull request updates both.
11. **A WebKit flake** in `profile-shell.spec.ts`: the footer's Say hello
    test focused a link while the panel was still opening and failed about
    once in 40 runs. The follow-up cleanup pull request waits for the
    opening transition (80 of 80 passed).

## 8. Merge, deploy and live checks

- **Merge:** every GitHub check passed on `11c9bd5` (typecheck, lint, unit,
  build, e2e-smoke, visual, parity, AccessLint). Workers Builds failed at its
  start, as on every commit since 18-11-26 (open item 5), so the pull
  request was admin-merged as `f50d573`.
- **Deploy:** `pnpm run deploy` from a clean checkout of `main`: version
  `fcd8f2fd-ef2c-4d6a-8acd-cd9effe19e99`. Rollback target: `a9b74b54`
  (Phase 7 D2).
- **Live:** `/`, `/about`, `/portfolio`, `/portfolio/tbh-intranet`, the
  forward-deployed hub in English and the Thai AI transformation hub,
  `/skills`, `/resume`, `/contact`, both share images, both icons and
  `/llms.txt` answer 200. Every page sends the policy and
  `Reporting-Endpoints: csp="/api/csp-report"`; `POST /api/csp-report`
  answers 204 and `GET` answers 405.
- **Smoke against production** (desktop, the recruiter path and the CSP
  check on every route): 87 of 88 passed. The one failure, on `/stack`, was
  Cloudflare's script monitor (open item 8); it passed when run again.
- **WebKit case pages against production:** 21 of 21 over three repeats.
  A run right after the deploy failed 2 of 7 on the same monitor.
- **Speed (plan gate 4).** `pnpm probe` (390 x 844, 4x CPU, about 1.6 Mbps,
  150 ms RTT, cold cache). Like for like, on this Mac: the Phase 7 D2 build
  (`cb1dd6c`) against this phase's, each server warmed, four runs each,
  interleaved. The local server sends files uncompressed, so only the
  difference counts:

  | Page | LCP median, Phase 7 | LCP median, Phase 8 | TBT median, 7 to 8 |
  | --- | --- | --- | --- |
  | `/` | 3,532 ms | 3,458 ms | 72 to 56 ms |
  | `/about` | 3,312 ms | 3,206 ms | 69 to 54 ms |
  | `/portfolio/tbh-intranet` | 2,966 ms | 2,964 ms | 46 to 43 ms |

  The live site, two runs on an idle Mac after the deploy: `/` 2,036 to
  2,168 ms, `/about` 1,916 to 1,996 ms, `/portfolio/tbh-intranet` 2,004 to
  2,204 ms, the forward-deployed hub 1,848 to 2,196 ms and the Thai AI
  transformation hub 1,832 to 1,968 ms; CLS 0.001 or less; no text under
  12 px and no target under 24 px. The bytes match the cutover's (JS
  204 KB, CSS 39 KB, fonts 122 KB on Home), whose live LCP read 1.6 to
  1.7 s on another day: single lab runs over the real network vary by a few
  hundred milliseconds, which is why the A/B above is the comparison. An
  earlier, unwarmed A/B read Phase 8 slower; it did not hold up once each
  server was warmed and the runs repeated.
