# Phase 6 report: Cutover

**Plan:** `../active/phase-6_cutover_PLAN_18-11-26.md` (steps 6a to 6i; 6j,
the merge and the live check, is the orchestrator's).
**Date:** 18-11-26, in the worktree `t3-0ed2720f-c910a1f09459c1a1` on the
local branch `feat/profile-redesign-phase-6-cutover`, from `02de7bf` (Phases
0 to 3 as they merge to `main`, Phases 4 and 5, and one test fix), with the
Phase 4 and 5 review fixes (`f80138a`) cherry-picked in as `7f5a208` before
the final gates. Local commits only; nothing pushed, merged or deployed.
**Lane settings:** `PORT=3109`, `GATES_PORT=4309`, Playwright `--workers=2`.
**Harness:** `.claude/agents/`, `.claude/skills/` and `process/context/` are
missing; the phase ran from the shared brief under the Harness-Absent
Fallback.
**Status:** CODE DONE (18-11-26). Linux baselines are not rendered here (the
orchestrator renders them; section 9). Gate 11 (screen readers, real
devices) is for the owner after the deploy (section 12).

## 1. The go (plan step 6a, the "owner has not said go" blocker)

- **The owner's go, 18-11-26:** "please continue working until done then
  deploy to production for me". It is the go that step 6a and the blocker
  "the owner has not said go on the preview" wait for, recorded here as
  given. It approves the cutover and the deploy; the orchestrator opens,
  merges and deploys the pull request (step 6j).
- **Recruiter-fit Phase 4 (R13):** deferred (umbrella default). Not merged;
  the cutover renders today's content modules, so the CV framing can land
  later with no layout change.
- **R14:** the Bangkok card is retired with the old Home and the old Contact
  bento; the footer card carries "Bangkok, GMT+7". `PlaceCard`,
  `BangkokClock` and `BangkokScene` are deleted (their keyframes stay in
  `globals.css` until Phase 8).
- **R16:** `/work` keeps its 308 to `/#ventures` (parity: unchanged).
- **R17:** the pinned tests are rewritten to the same intent; section 4
  lists every changed test and why, for the owner's approval.
- **R22:** see section 7. Cloudflare Web Analytics has no token: the live
  site sends no beacon (its Home, fetched on 18-11-26, carries no
  `cloudflareinsights` script) and `wrangler.jsonc` sets no
  `NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN`, so no 28-day "before" numbers
  exist for page views or Core Web Vitals. Contact form sends are counted
  only in Resend, which this lane cannot read.

## 2. What was built (by plan step)

| Step | Files | What |
| --- | --- | --- |
| 6b Scope, fonts, colours | `lib/design/scope.ts` and test, `src/routes/__root.tsx`, `lib/seo/rootMetadata.ts`, `lib/seo/manifest.ts` and test, `src/styles/globals.css`, `lib/design/globals.test.ts` | `data-design="profile"` on `<html>` for `/`, `/portfolio`, `/portfolio/<slug>`, `/ventures/<slug>`, `/about` and `/contact` (route ids, read from the matches on screen; a match that ended in a 404 or an error does not count, so a missing case shows the old 404 body). The root head preloads Onest and Instrument Serif (Latin) on those pages and Geist and Geist Mono elsewhere, and links `src/styles/profile.css` on every page after `globals.css`. Theme-color metas `#f7f3ff` (light) and `#0f0c18` (dark); manifest `background_color` `#ffffff` (the light paper) and `theme_color` `#f7f3ff`. The theme switch fades (.56 s, `kj-theme-fade`) on every page instead of the circular reveal: the `kj-reveal` keyframes and their two rules are gone, and the fade sits inside `prefers-reduced-motion: no-preference`. The guards change with the decision recorded (spec 13 items 6 and 23): the theme-color pins, the motion guard's exception list, the view-transition test, the scope test and the partial list. `lib/brand/tokens.ts` waits for Phase 8, as planned |
| 6c Chrome | `components/landing/LandingLayout.tsx`, `components/profile/site/{SiteNav,SiteFooter}.tsx`, `components/bento/SharePanelHost.tsx`, `lib/content/profileChrome.ts`, `src/styles/profile/cutover.css` | Every public page and the 404: the skip link (`ds-skip`, above the bar), the pill nav, the page, the footer. The nav and the footer carry `data-design="profile"` themselves, so they look the same around the pages Phase 7 has not restyled; those keep their old tokens and fonts and get `var(--nav-h, 92px)` of top padding on `.landing-root`, and `html:has(.pf-nav)` takes the bar's `scroll-padding-top` (96 px) so focus and anchors land below it. `landing-root`, the skip link to `#main` and `data-site-chrome` on the header and the footer stay; print drops the chrome and, since `4c375a9`, the skip link (`data-print-hide`). `PROFILE_BASE` is "" (the root); Work is marked on `/portfolio` and the cases, About on `/about`. Deleted: `components/bento/{SiteHeader,SiteMenu,SiteFooter}.tsx` and the header's Share button. The hero Share pills of the pages Phase 7 restyles (skills, topics, résumé) keep their panel: `SharePanelHost` draws the existing `SharePanel` under the bar's right end, in the chrome's scope, with Escape (focus back to the pill) and outside-press closing, as the old header did. `SharePill`, `ShareRows` and `SharePanel` stay. 404 and the route error state render the new chrome around the old `StatusPage` (Phase 7f restyles it) |
| 6d Routes | `src/routes/_landing/{index,about,contact}.tsx`, `src/routes/_landing/portfolio/{index,$slug}.tsx`, `src/routes/_landing/ventures/$slug.tsx`, `components/profile/home/HomePage.tsx`, `components/profile/site/ProfileMain.tsx`, `components/profile/pages/*`, `lib/content/corePages.ts` | `/`: the intro, the hero, the work stack (GoGoCash with `id="ventures"`), the About bento, the Journey and the notebook (hidden below three quotes), in `main#main.pf-main`; head unchanged. `/portfolio/<slug>` and `/ventures/<slug>`: `<CasePage key={slug} …/>` under the same JSON-LD (the same builders, the same order), titles, canonicals, share images and Markdown twins; since `2db9a14` their loaders build the head with `src/lib/caseHead.ts` (from the review fixes; it builds exactly what the loaders built, and parity holds). `/portfolio`, "All work": the new hero, the `?category=` filter (prerendered default, the filter after hydration), the count, and every project as a lift card (the case pages' "More projects" card with its access and its first cleared outcome); breadcrumb and CollectionPage JSON-LD unchanged. `/about`: the hero beside the portrait and the social links; the About bento (under `#principles`, the anchor `/learn` links); the story and the career records (`#story`); Now (`#now`), the tech stack (`#stack`) and the operating model (`#how-i-ship`) in the new tiles; the GitHub year; the FAQ as native disclosures (`#faq`, every answer in the HTML) beside the "Next" card with the recruiter links. `/contact`: the form beside "Email me directly" (the address, Copy email, Compose in Gmail, Open your mail app: the Say hello actions) and "Elsewhere", then "Who should write" beside "For recruiters"; no Bangkok card (R14). The form keeps its visible labels, `autocomplete`, `aria-invalid` and `aria-describedby`, 16 px inputs, focus on the first invalid field, and reads "Sending..." while sending; it is now `aria-busy` while sending too. Every h1 keeps its text word for word (`lib/content/corePages.test.ts` checks the three new ones against the parity reference). Deleted: `src/routes/preview/*` and `components/profile/preview/{PreviewLayout,SystemPreview}.tsx`; `PreviewHome` became `components/profile/home/HomePage.tsx`. The `Disallow: /preview` robots line stays, as the plan allows |
| 6d Deletions | | The replaced bento components and their tests: the old Home (`HomeHero`, `HomeCards`), About (`AboutHero`, `AboutCards`, `AboutPageContent`), Contact (`ContactPage`, `ContactCards`, `RecruiterFacts`), portfolio (`PortfolioIndexPage`, `PortfolioProjectPage`, `ProjectCards`, `VisualIcon`, `portfolioLayout`), ventures (`VentureHubPage`, `VentureCards`), `PlaceCard`, `BangkokClock`, `BangkokScene`, six unused icons, `headerLinks`. `PortfolioParts.tsx` keeps only `accessDetail`, which `lib/content/caseStudy.test.ts` compares with the template's wording |
| 6e Crawl path, prerender | | The footer's Pages list (the 13 pages of the old menu) is on every page. The prerendered file lists before and after are identical (section 6) |
| 6f Redirects, anchors | | `/work` and `/ventures` keep their 308s to `/#ventures`; `/#ventures` is the GoGoCash card; the venture case's back link and breadcrumb point there; the 404's four recovery links and the old menu's targets resolve (parity: 0 differences, 0 URLs removed) |
| 6g Tests | section 4 | Every pinned test rewritten to the same intent; component tests for removed components replaced by the new ones; the profile specs moved from `/preview` to the live pages |
| 6h Baselines, parity | `tests/fixtures/site-parity.json`, baselines | The parity reference takes exactly the two intended changes (section 5). 102 baselines deleted for CI to render again (section 9) |
| 6i Print, résumé | | `pnpm pdf` (section 8) |

## 3. Gates

On the final tree (`ffff248`, after the cherry-pick of the Phase 4 and 5 review fixes; this report is the next commit), the production build of that
tree:

| # | Gate | Command | Result |
| --- | --- | --- | --- |
| 1 | Types | `pnpm typecheck` | pass |
| 1 | Lint | `pnpm lint` (`--max-warnings=0`) | pass, 0 warnings |
| 1 | Format | `pnpm exec prettier --write` on touched files, then `pnpm format:check` | pass |
| 1 | Dead code | `pnpm knip` | pass (it also confirms the deleted components left nothing behind) |
| 1 | Unit | `pnpm test` | 160 files, 1,488 tests pass |
| 1 | Build | `pnpm build` | pass (the Sanity schema deploy skips without `SANITY_AUTH_TOKEN`); `src/routeTree.gen.ts` regenerated without the previews |
| 5 | Budgets | `pnpm perf:budget` | pass: entry 111.0 / 120 KB, worst route 196.9 / 200 KB, stylesheets 34.2 / 37 KB, fonts 51.2 / 56 KB (section 7) |
| 1, 4, 9, 10 | Browser gate | `PORT=3109 PLAYWRIGHT_WEB_SERVER="pnpm start" pnpm exec playwright test smoke.spec.ts a11y.spec.ts tests/e2e/profile --project=desktop --project=mobile --project=fold-closed --project=fold-open --project=tablet-landscape --project=webkit-phone --grep-invert "matches its baseline" --workers=2` | 1,752 tests: 789 passed, 958 skipped by project scope, 5 failed in 24.4 minutes on a loaded machine (load average about 11). Four were 30 s timeouts in the review fixes' new case-page checks; run alone, 4 of 4 passed. The fifth was a review-fixes test that read the old header (section 4); rewritten, it and its two neighbours passed 18 of 18 over three repeats on desktop and the WebKit phone |
| 3 | Parity | `GATES_PORT=4309 node scripts/start-gates.mjs --parity-only` | 137 URLs compared, 0 with differences; the crawl reached 138 URLs, 0 removed (section 5) |
| 6 | Prerender | sorted `dist/client/**/*.html`, base against final | identical, 46 files (section 6) |
| 7 | Print | `RESUME_URL=http://127.0.0.1:3109/resume OUTPUT=<scratch> pnpm pdf`, text read back | 2 pages, text identical to `public/resume.pdf` (section 8) |
| 8 | Probe | `BASE=http://127.0.0.1:3109 pnpm probe / /about /portfolio/tbh-intranet /contact /portfolio`, and the base build the same way | CLS 0, TBT under 30 ms, nothing under 12 px or 24 px; lab LCP +112 to +200 ms against the base; the absolute targets wait for the preview URL (section 7) |
| 11 | By hand | | not done: the owner's, after the deploy (section 12) |

Earlier runs, for the record: the first full browser run (before the last
test fixes) had 736 passed, 806 skipped by project scope and 8 failed; all
8 were tests this phase had already rewritten, run by workers that had
loaded the files before the edits (the open menu's tap areas at 320 and
390 px and the worker-cache visit to Learn, on desktop and mobile; two
notebook layout checks). With the fixed files, `--last-failed` ran 6 passed
and 2 skipped (the parked notebook checks), and the new checks (the tap
areas at 344 px, the three rebuilt pages across the matrix) ran 19 passed
and 3 skipped by project. A second full run, after the print fix, was
stopped at 1,153 of 1,584 tests with no failure when the review fixes
arrived; the final run above followed the cherry-pick. The known WebKit
flake ("the bar hides on the way down") did not occur in any full run.
`pnpm pdf` ran again on the final build: 2 pages, text identical.

## 4. Changed tests and why (umbrella input R17)

Unit tests:

| Test | Change | Why |
| --- | --- | --- |
| `lib/design/scope.test.ts` | Rewritten | The scope covers the six live route ids, not `/preview`; a 404 or error match does not count |
| `lib/design/globals.test.ts` | Four guards changed | Theme-color pins move to `#0f0c18` and `#f7f3ff` (and reject the old pair); the motion guard's exception list drops `kj-reveal`; "scopes the circular reveal…" becomes "fades theme switches on every page, only with no-preference…"; the scope guard reads the live route ids; the partial list gains `cutover.css` (Phase 6) |
| `lib/seo/manifest.test.ts` | Colours | `#ffffff` and `#f7f3ff`, not `#000000` |
| `lib/seo/metadataToHead.test.ts`, `lib/seo/metadataRoutes.test.ts` | Code unchanged | They read the parity reference, which takes the two intended changes |
| `lib/content/profileChrome.test.ts` | Addresses | The base is ""; Home links are `/#work` and so on; Work is current on `/portfolio` too, About on `/about` |
| `lib/landing/stackCards.test.ts`, `lib/content/home.test.ts`, `components/profile/home/CanvasMock.test.tsx`, `lib/content/caseStudy.test.ts` | Addresses | Case links are `/portfolio/<slug>` and `/ventures/<slug>`; the venture back link is `/#ventures` |
| `components/profile/site/{SiteNav,PhoneMenu,ProfileLink}.test.tsx` | Addresses, one new check | Live addresses; the header carries the token scope itself |
| `components/profile/home/Notes.test.tsx` (fix agent's file) | One import and one title | It rendered `PreviewHome`; it renders the live `HomePage` |
| `components/profile/home/HomePage.test.tsx` (was `preview/PreviewHome.test.tsx`) | Moved, two checks added | The Home is the page's `main#main`; its case links are live |
| `components/landing/StatusPage.test.tsx` | One test rewritten | "brings the site header and footer, on the canvas column" checked the old 1000 px column; it now checks the pill nav and the footer, both carrying the scope, and the skip link with its `data-print-hide` |
| `components/bento/primitives.test.tsx` | The old footer's block removed | The component is deleted; `components/profile/site/SiteFooter.test.tsx` already checks the socials, the agent files and no hidden page |
| `components/profile/pages/ContactPage.test.tsx` (was `components/landing/ContactPage.test.tsx`) | Moved; three checks adapted | The h1 class (`t-display`, the accent); the Say hello actions and no Bangkok card added; link names without arrows (spec 12 item 18); the row checked by structure instead of bento column classes. The form's own tests are unchanged |
| `components/profile/pages/AboutPage.test.tsx` (new) | Replaces `about/AboutHero.test.tsx` and `AboutPageContent.test.tsx` | Same intents: the h1, the availability between the role and the buttons, the portrait first, the buttons, the socials, the section ids other pages link, every FAQ answer, the Next card's links and recruiter lines |
| `components/landing/ContributionActivity.test.tsx` (new) | Moved out of `AboutPageContent.test.tsx`, unchanged | The GitHub year stays on `/about` |
| `components/profile/pages/WorkIndexPage.test.tsx` (new) | Replaces the index half of `portfolio/portfolio.test.tsx` | Same intents on lift cards: the h1, one card per project named by it in list order, its link, the access, the first outcome under the tagline, the filter |
| `lib/content/corePages.test.ts` (new) | | The three rebuilt pages' h1s equal the parity reference |
| `src/lib/caseHead.test.ts` (from the review fixes) | The preview half removed | It compared the previews' heads with the live routes'; the previews are gone, so it checks each live loader returns `caseHead.ts`'s head, indexable, with the canonical, `og:url` and `og:image` of the live page |
| Deleted | `bento/SiteHeader.test.tsx`, `bento/PlaceCard.test.tsx`, `landing/home/home.test.tsx`, the project half of `portfolio/portfolio.test.tsx`, `portfolio/portfolioLayout.test.ts`, `discovery/VentureHubPage.test.tsx` | Their components are deleted; the chrome's tests (Phase 1), the Home sections' tests (Phases 2 to 4) and `CasePage.test.tsx` and `caseStudy.test.ts` (Phase 5) cover what replaced them |

Browser tests:

| Test | Change | Why |
| --- | --- | --- |
| `tests/e2e/routes.ts` | `PREVIEW_ROUTES` removed; `PROFILE_ROUTES` (the nine routes in the scope) added | The previews are gone |
| `smoke.spec.ts`: "the header links appear at 1024 px, on one row, and not below it" | Rewritten: "the nav's links appear from 810 px, on one row, and not below it" | Spec 13 item 23: the pill nav shows its links from 810 px. Checked at 809 (hidden), 810, 1024 and 1440: links between the name and the buttons, one row under 60 px, no sideways scroll; no email link and no Share button in the bar; Work marked with its tint |
| `smoke.spec.ts`: "worker cache > a server function's answer is kept nowhere" | The way to Learn | It opened the old header's menu at 1440 px; the footer's Pages list holds Learn now. Same in-app navigation, same assertions |
| `smoke.spec.ts`: tap areas | 344 px added; the helper accepts a hit on the control's own label | Plan: the tap-area test also runs at 344. The phone menu's theme radios let their labels take the tap (the radio has `pointer-events: none` and covers its label), which the old menu, with no radios, never met |
| `smoke.spec.ts`: render loop, share pill | Previews out; a comment | |
| `a11y.spec.ts` | WCAG 2.2 on the nine routes in the scope (was the previews) | Plan gate 9 |
| `visual.spec.ts` | Previews out; a stale comment about the Bangkok card | |
| `profile.spec.ts` | The fit check runs on `PROFILE_ROUTES`; the best-practice checks on Home, `/portfolio/tbh-intranet`, `/about` and `/contact` (was `/preview/system` and `/preview`); a new matrix check of the three rebuilt pages at 344, 390, 820, 882, 1180 and 1440 px; the `/preview/system` baseline test removed | Plan gate 10 and the device matrix; the page is gone |
| `profile-shell.spec.ts` | Home is `/`; "the preview's stylesheet is linked on /preview only" becomes "every page links the profile stylesheet once, and preloads the fonts of its own design" | Plan step 6b |
| `profile-hero.spec.ts` | Home is `/`; the in-app first visit starts from `/skills` (was `/preview/system`) | |
| `profile-work-about.spec.ts` | Home is `/`, `/#ventures`, live card links | |
| `profile-journey.spec.ts` | Home is `/`; the notebook's checks on its sample page (two describes and one matrix baseline) are skipped with a reason | `/preview/system` held the only notebook with samples. No live page renders the notebook until three quotes are cleared (R11); Phase 7g brings the samples back on `/design`. `Notebook.test.tsx` and `Notes.test.tsx` still run |
| `profile-case.spec.ts` | Live case paths; "noindex" becomes "no noindex"; Home's case links; the JSON-LD compared with the parity reference (was preview against live). Merged with the review fixes' version: their outcome-count loop over the four cases, with live paths | The cases are live |
| The review fixes' new browser tests | Paths, and one test adapted | `profile-shell.spec.ts`'s deep link (`/portfolio/tbh-intranet#ch-03`, was under `/preview`); `profile.spec.ts` keeps their SVG text-floor check beside this phase's matrix and best-practice checks. "A scroll made before hydration survives hydration on a live page" waited for the old header's theme button on `/about`; the pill nav hides its toggle on phones, so it failed on the WebKit phone. It is now "survives hydration on About" and waits for the nav's Say hello copy row, the hydration mark its Home twin uses (`/skills` was tried first: it holds a parser-blocking script, so it never finishes parsing while scripts are held) |

## 5. Parity differences, each with a verdict

`GATES_PORT=4309 node scripts/start-gates.mjs --parity-only` on the final
build: **137 URLs compared, 0 with differences**, against the reference
updated in the first commit. The reference changed in exactly two ways
(266 lines of `tests/fixtures/site-parity.json`):

| Difference | Where | Verdict |
| --- | --- | --- |
| Theme-color metas: `#0b0d17` (dark) to `#0f0c18`, `#f5f6fa` (light) to `#f7f3ff` | the `tags` of all 66 HTML pages | Intended (plan 6b, umbrella Public Contracts) |
| Manifest body: `background_color` and `theme_color` from `#000000` to `#ffffff` and `#f7f3ff` | `/manifest.webmanifest` | Intended (spec 13 item 37) |
| Font preloads | every page | Not recorded: the crawler drops `rel="preload"` and stylesheet links by design, so the font change shows nowhere in parity |

Nothing else differs: titles, h1s, descriptions, canonicals, JSON-LD,
Markdown twins, text endpoints, redirects and 404s are unchanged. The crawl
reached 138 URLs: 0 removed, and one "added", `/assets/icons-*.js`, a script
chunk whose name matches the crawler's icon pattern (Phase 5 recorded the
same; it is not a page). 66 HTML pages answer 200, as before.

## 6. Prerender

The prerendered file lists of the base build (`02de7bf`) and the final build
are identical: 46 HTML files each (`index.html`, `about.html`,
`contact.html`, `portfolio.html` and the five projects, the two ventures,
`skills.html` and the twenty skills, the eight topic hubs, `build.html`,
`design.html`, `examples.html`, `press.html`, `proof.html`, `stack.html`).
`diff` of the two sorted lists is empty.

## 7. Budgets, before and after (R22 stand-in)

`pnpm perf:budget`, first-load JavaScript gzip, the base build (`02de7bf`)
against the final build, and the stylesheet and font ratchets:

| Page or budget | Before | After | Budget |
| --- | --- | --- | --- |
| Entry chunk | 106.4 KB | 111.0 KB | 120 KB (unchanged) |
| `/` | 165.5 KB | 185.4 KB | 200 KB (marketing) |
| `/about` | 155.9 KB | 177.6 KB | 200 KB |
| `/contact` | 170.3 KB | 177.9 KB | 200 KB |
| `/portfolio` | 158.7 KB | 170.3 KB | 200 KB |
| `/portfolio/<slug>` (5) | 165.5 KB | 176.6 KB | 200 KB |
| `/ventures/<slug>` (2) | 150.5 KB | 176.6 KB | 165 KB default, now 200 KB marketing (deviation 4) |
| Topic hubs, EN and TH (8) | 156.2 KB | 160.7 KB | 165 KB |
| `/skills` | 191.0 KB | 196.1 KB | 200 KB |
| `/skills/<slug>` (20), worst | 192.0 KB | 196.9 KB | 200 KB |
| `/proof` | 154.7 KB | 159.7 KB | 200 KB |
| `/design` | 149.1 KB | 154.7 KB | 165 KB |
| `/press` | 147.1 KB | 152.1 KB | 200 KB |
| Stylesheets, worst page (`about.html`) | 20.2 KB | 34.2 KB | 22 KB raised to 37 KB |
| Preloaded fonts, worst page | 51.2 KB (`about.html`) | 51.2 KB (`build.html`, Geist); the scoped pages preload 48.8 KB | 56 KB (unchanged) |

Every page gains about 4.6 KB of JavaScript (the new chrome, in the entry
chunk) and 14 KB of stylesheet (`profile.css`, 15.2 KB gzip, beside a
`globals.css` that still holds the old design). **The stylesheet budget was
raised from 22 KB to 37 KB** (the measurement plus 10%, the script's own
rule), with the reason in `scripts/check-first-load-budget.mjs`; Phase 8
deletes the old design and lowers it. Phase 7's page partials will need
some of the 3 KB of headroom, and `/skills/<slug>` sits 3.1 KB under its
200 KB budget. (The "after" column is the final build, with the Phase 4 and
5 review fixes; before them it read 0.1 to 0.4 KB lower.)

Lab probe (`pnpm probe`: 390 x 844, 4x CPU, about 1.6 Mbps, 150 ms RTT, cold
cache), the base and the cutover build (before the cherry-pick of the Phase
4 and 5 review fixes) served locally and probed back to back on 18-11-26. This local server sends CSS and JavaScript uncompressed (the
`profile.css` file is 78 KB raw, about 15 KB gzip at the edge), so the
absolute LCP overstates what the edge serves; the comparison is the point.

| Page | LCP before | LCP after | LCP element | CLS | TBT before / after | Text under 12 px before / after | Targets under 24 px |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | 2,440 ms | 2,636 ms | `span` (the h1's line) | 0.000 | 21 / 9 ms | 0 / 0 | 0 |
| `/about` | 2,480 ms | 2,592 ms | `img` (the portrait) | 0.000 | 1 / 26 ms | 0 / 0 | 0 |
| `/portfolio/tbh-intranet` | 2,324 ms | 2,480 ms | `p` (the lead) | 0.000 | 2 / 23 ms | 1 / 0 | 0 |
| `/contact` | 2,160 ms | 2,360 ms | `p` (the lead) | 0.000 | 0 / 12 ms | 0 / 0 | 0 |
| `/portfolio` | 2,260 ms | 2,400 ms | `p` (the lead) | 0.000 | 0 / 11 ms | 29 / 0 | 0 |

Lab LCP rises 112 to 200 ms on these pages: the stylesheets (99 KB to
169 KB as served here) and the web fonts (2 files to 4 to 6) the new design
loads. CLS stays 0, TBT stays far under 200 ms, and the text under 12 px
on the old pages is gone. Plan gate 8's absolute targets (LCP 2.5 s or less
on Home, `/about` and the intranet case) are measured on the pull request's
preview URL, where the edge compresses; an earlier probe of the same build
in this session read 2,816, 2,600 and 2,532 ms, so a run on a busy machine
varies by about 200 ms. The LCP element on Home is the h1 (the browser
reports its larger line span, as on the live Home and in Phase 2).

**R22, the "before" numbers:** none exist from real visitors (section 1).
The table above and the budgets are the recorded "before" and "after"; the
28-day comparison needs Cloudflare Web Analytics switched on first (set
`NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN`), and the contact-form count
needs the owner's Resend dashboard.

## 8. Print and résumé (step 6i)

`RESUME_URL=http://127.0.0.1:3109/resume OUTPUT=<scratch>/resume.pdf pnpm pdf`
on the final production build (Sanity answered, so the script accepted the
page): **2 pages**. Its text layer, read back with pypdf, is **identical** to
the committed `public/resume.pdf` (5,902 characters, words whole, in reading
order, from "Kunanon Jarat" to the last course line). `public/resume.pdf` is
not rewritten.

The first print found a regression, fixed in `4c375a9`: the redesign's skip
link is `position: fixed` and only moved off screen, so print drew "Skip to
content" at the end of the résumé, and the old bodies' 92 px bar offset also
applied in print. The skip link now carries `data-print-hide` (the print
rule in `globals.css` drops it; `StatusPage.test.tsx` checks the attribute),
and the offset is inside `@media screen`. In print media the résumé page
now measures 0 px of top padding, a hidden skip link and hidden chrome.

## 9. Visual baselines (for the orchestrator)

Deleted so CI renders them again (the chrome changes on every public page):

- `tests/e2e/visual.spec.ts-snapshots/`: 92 of the 96 live baselines, all
  but `/design`'s 4 (no site chrome there, and no rule the cutover added
  reaches it), and the 4 `preview-system-*` (the page is gone).
- `tests/e2e/profile.spec.ts-snapshots/`: the 6 `preview-system-*` matrix
  baselines (the page is gone, and the test with it).

102 files. The section baselines of `profile-hero`, `profile-work-about`,
`profile-journey` and `profile-case` were never committed (the orchestrator
batches them); they keep their `preview-*` file names, which Phase 8 may
rename. Every baseline needs a review against the spec once rendered.

## 10. Deviations, with reasons

1. **The theme fade is site-wide.** Plan 6c says the toggle switches with
   the .56 s fade; the scoped rule in `shell.css` covered only pages in the
   token scope, so the pages Phase 7 restyles would still have shown the
   circular reveal. `globals.css` now runs the fade for every theme switch
   (`kj-reveal` is deleted), inside no-preference; `/design`'s old toggle
   fades too. The keyframes stay in `shell.css`, which every page links.
2. **The share panel stays, drawn by a host.** Plan 6c deletes "the header
   share panel" and keeps `SharePill` for the heroes. The pill opens the
   panel the old header drew, so without the header the pills on `/skills`,
   the topic hubs and `/resume` would open nothing. The header's Share
   button is gone; `SharePanel` stays, drawn by `SharePanelHost` under the
   bar's right end in the chrome's scope (spec 13 item 27: Phase 7 pages
   keep their pills).
3. **`profile.css` is linked on every page, `/design` included.** The root
   head links it; a head that follows the matched routes would not be
   re-read reliably on a client navigation, and a page that gains the chrome
   on navigation must not render it unstyled. `/design` (no site chrome)
   carries it unused until Phase 7g restyles that page.
4. **Stylesheet budget 22 to 37 KB, and the venture pages in the marketing
   class** (section 7). The entry (120 KB) and route budgets (165 and
   200 KB) are unchanged.
5. **About keeps all of today's content.** Plan 6d names the hero, the About
   bento, story and records, the FAQ and the Next card. Learn links
   `/about#principles`, `#now` and `#faq`, and the operating model's Markdown
   cites `#how-i-ship`, so Now, the tech stack, the operating model and the
   GitHub year stay too, in the new tiles. The About bento sits under
   `id="principles"` on `/about` (an `id` prop on `AboutBento`, "about" by
   default), where its four principle tiles are. The old "Selected path"
   card (`#path`, linked nowhere) is replaced by the career records card,
   which states the same arc from the résumé; the story's "who is" answer is
   the FAQ's first answer on the same page, and its paragraphs are the
   bento's "In short" tile.
6. **All work uses lift cards.** The bento index's tech chips ("+N more"),
   list numbers, canvas grid spans and "View project" label go; each card
   keeps the category, period, access ("Internal tool (no public link)" or
   "Public", the case template's wording), the tagline, the first cleared
   outcome and one link, "Read the case study: {name}".
7. **Contact.** The envelope drawing and the numbered "Elsewhere" rows are
   not carried over; the Say hello actions join "Email me directly". The
   form's card became a `ds-tile` article with an h2 "Say hello"; its labels
   use `t-meta` (the frozen `font-mono` utility would set Geist Mono inside
   the scope); the submit is the dark `lg` pill and still reads "Sending..."
   while sending (the plan's "Sending"), and the form is now `aria-busy`.
8. **About is marked in the nav on `/about`**, as Work is on `/portfolio`
   and the cases. Spec 7.2 names only Work and Résumé.
9. **The skip link is the redesign's `ds-skip`** (fixed, above the bar,
   z 110); the old one sat at z 60, under the new bar.
10. **The notebook's browser checks are skipped** (section 4): their page,
    `/preview/system`, went with the previews. `sampleNotes.ts` stays in
    `components/profile/preview/` because `Notebook.test.tsx` and
    `testimonials.test.ts` import it.
11. **Entry chunk 106.4 to 111.0 KB.** The root's 404 component imports the
    layout, so the chrome sits in the entry chunk, as the old chrome did;
    the new one is about 4.4 KB heavier. Under the 120 KB budget.
12. **Manifest colours** (spec 13 item 37 names no values): the light paper
    `#ffffff` as `background_color` and the light theme-color `#f7f3ff` as
    `theme_color`, since light is the default theme.
13. **Files outside this lane's list, smallest edits** (the fix agent's
    area): `components/profile/home/Notes.test.tsx` (one import and one
    title), `components/profile/home/AboutBento.tsx` (the `id` prop; Phase
    3's file, not on the fix list), `lib/content/caseStudy.test.ts` (one
    expectation), and the six `tests/e2e/profile*.spec.ts` (paths, section
    4), and, from the review fixes, `src/lib/caseHead.ts` and its test
    (deviation 15).
14. **The section baselines' names keep "preview".** The section specs' snapshot
    names (`preview-hero-*`, `preview-case-*` and so on) are unchanged, to
    keep merge conflicts with the fix agent small; Phase 8 can rename them.
15. **The review fixes' merge** (`f80138a`, cherry-picked as `7f5a208`).
    The two preview case routes it edited stay deleted; their two fixes are
    on the live routes (the page keyed on its slug, already here; the head
    from `caseHead.ts`, `2db9a14`, whose preview-only `hidden` option went
    with the previews). The two spec conflicts kept both sides' checks on
    live paths. Everything else applied cleanly and is kept: the component,
    CSS and test fixes, `src/router.tsx` with `src/lib/scrollRestoration.ts`,
    `SectionHeader`'s title-size option and actions slot, and both reports.
16. **The commit split.** The plan's handoff orders tokens and fonts,
    chrome, routes, tests and baselines, parity. The parity reference's
    update sits in the first commit, with the theme-color and manifest
    change it records, because three unit tests read the reference and
    fail without it; the rest follows the order, with two fixes found by the
    gates (the share panel's gutter and About's mark, then print).

## 11. Owner inputs used and their defaults

| Input | Default used | Where |
| --- | --- | --- |
| R13 recruiter-fit Phase 4 | Deferred: today's content, nothing dropped | every page reads the content modules |
| R14 Bangkok card | Retired; the footer carries "Bangkok, GMT+7" | Home, Contact |
| R16 `/work` | Keeps `/#ventures` | redirects unchanged |
| R17 pinned tests | Rewritten to the same intent; the list in section 4 is for the owner's approval | tests |
| R22 success measure | No Cloudflare Web Analytics token, so no 28-day numbers; the budgets and lab probes are recorded (sections 3 and 7) | this report |

## 12. Deferred manual checks (gate 11, for the owner after the deploy)

Not done: an agent cannot run them. On the live site (or the pull request's
preview URL):

- Keyboard only through Home, a case page, About and Contact.
- VoiceOver on macOS and iOS, TalkBack and NVDA through the nav, Say hello,
  the work stack, a case page and the contact form.
- An iPhone, an Android phone, an iPad and, if one is at hand, a foldable;
  including `/#ventures` and the `/work` redirect on a real iPhone (Phase 3
  open item 5) and the orbit and notebook drags on a touch screen (Phase 4
  open item 5).

## 13. Draft copy that now ships

The cutover makes every Phase 1 to 5 draft live. None is a figure or a claim;
each is marked `// DRAFT` in its module and waits for the owner's line-by-line
approval (umbrella R3, R5 to R9). Phase 6 adds no new copy: the rebuilt
pages reuse the live pages' strings and labels.

- **Footer and Say hello** (`lib/content/profileChrome.ts`): "Get in touch";
  "Building something in AI or ops? Let’s talk."; "I build fintech and AI
  operator systems from Bangkok, for Thailand and SEA: AI transformation,
  ERP/CRM, internal systems and tech startups."; "I’m open to Forward
  Deployed Engineer and AI engineering roles, based in Bangkok or remote.";
  the popover's label "Email", and "Compose in Gmail", "Open your mail app",
  "Use the contact form", "Menu", "Close".
- **Hero and logo strip** (`lib/content/home.ts`): "Where I’ve worked" and the
  nine names; the canvas mock's labels "Featured projects", "Share",
  "Layers", "Assets", "Design", "Prototype", "Area", "Period", "Open
  project", "Kunanon · just now", the cursor "Kunanon", "Kunanon / Selected
  work"; the comment "Optimise for reversibility."; the names "{name}: open
  the case study", "Show {name}", "{name}, n of 3".
- **Work and About** (`lib/content/homeWorkAbout.ts`): "Projects and
  ventures, from problem to outcome."; "Internal tools and AI agents at The
  Binary Holdings, and two ventures of my own."; "Read the case study";
  "Venture", "Since 2023", "Since 2025"; "About", "AI engineering, close to
  the work.", "How I work, and the results so far."; "In short"; "What one
  system has to hold" and the five mess chips; "Then one system holds it.";
  "Results so far" and the stats labels and footnote; "The mess, then the
  system".
- **Journey** (`lib/content/homeJourney.ts`): "From smart contracts to AI
  engineering."; "Engineering first, then the delivery around it."; "Read
  the story"; the two story paragraphs drafted from the résumé; "Roles I’m
  open to"; "Career records", "Employment", "Full résumé"; "Tools I use",
  "Turn the tools left", "Turn the tools right", "Pause the orbit", "Play the
  orbit".
- **Case pages** (`lib/content/caseStudy.ts`): "Illustration, not real
  data."; "On this page"; "Enlarge" (named "Enlarge: {title}"), "Close"; the
  unused status words "Acquired", "Shut down", "Paused".
- **Notebook** (`lib/content/testimonials.ts`): shipped but hidden until
  three quotes are cleared.

## 14. Open items

1. **Visual baselines (orchestrator):** render the 92 deleted live ones
   (section 9) and the never-committed section baselines of Phases 2 to 5,
   then review each against the spec.
2. **Gate 11 by hand (owner, after the deploy):** section 12.
3. **Gate 8 on the preview URL (orchestrator):** `BASE=<preview> pnpm probe
   / /about /portfolio/tbh-intranet` for the absolute LCP and TBT targets
   (section 7 has the local, uncompressed numbers).
4. **Owner approvals:** the R17 test list (section 4) and the drafts that
   now ship (section 13).
5. **Rebase onto `main` (orchestrator):** Phases 0 to 3 are on `main`
   (`e7df826`); Phases 4 and 5 are in PR #124, and the review fixes are
   already cherry-picked here (deviation 15). After #124 merges, the
   rebase should drop the Phase 4 and 5 commits and the cherry-pick as
   already applied; rerun the gates on the rebased tree.
6. **The notebook's browser checks** wait for Phase 7g, which brings the
   sample notebook back on `/design` (section 4).
7. **The theme-color metas do not follow the site theme** on a switch (spec
   7.5 describes it; plan step 6b only changes their values). Small, for
   Phase 7 or 8.
8. **About's GitHub year is still the bento card** (`ContributionActivity`,
   with the frozen `font-mono` utility, so Geist Mono inside the scope);
   Phase 7 or 8 can redraw it as a tile.
9. **This site's case cover** still shows the old Home (Phase 5 open item
   3): re-shoot it now that the new Home is live.
10. **Firefox** is not installed here and was not run.
11. **Phase 8:** the old design in `globals.css` (the stylesheet budget
    comes back down), `lib/brand/tokens.ts`, OG images and fonts, the
    `preview-*` snapshot names, `PortfolioParts.tsx`'s last function, the
    unused `match` fields of `siteMenu`, the duplicated theme-fade rules in
    `shell.css`, and `sampleNotes.ts`'s folder name.

## 15. Code review and fixes (19-11-26)

A fix pass on this phase's code review, in the worktree
`t3-268f9754-e247d69a7c3c73f3` on the local branch
`fix/profile-cutover-review-findings`, from `09ee95b` (this phase's tip
`13089bd` plus the two empty Phase 7 partials). Settings: `PORT=3106`,
`GATES_PORT=4306`, Playwright `--workers=1` (two Phase 7 lanes were
building on the machine). One local commit; nothing pushed, merged or
deployed. Not in this pass: the two early commits of the phase that do not
compile on their own (the pull request is squash-merged), and the final
one-run green browser gate, which CI runs.

| # | Finding | Fix | Test |
| --- | --- | --- | --- |
| 1 | Medium. On the pages Phase 7 restyles, the hero pill's share panel (`SharePanelHost`, fixed at z 85 and last in the page) stayed open after keyboard focus left it, and could cover what took focus: the skip link, the nav, or a target scrolled to the 96 px padding (WCAG 2.4.11). Escape always sent focus to the pill, and the panel printed | Focus that moves to a place outside the panel and the pill closes it and stays there: `focusout` with a `relatedTarget` outside both, as `CaseActions` does, and also `focusin` outside both. The second is needed because the panel is last in the page: Tab past its last row hands focus to the browser's own UI (`relatedTarget` null, `document.hasFocus()` false, measured in Chromium), which keeps the panel open as focus going nowhere should (another window, the share sheet), and the next Tab lands on the skip link. Escape returns focus to the pill only when focus was in the panel or on the pill. The fixed wrapper carries `data-print-hide` | Unit, `components/bento/SharePanelHost.test.tsx` (9): a row blurred with an outside `relatedTarget`, and a real focus move, close it and leave focus there; moves between rows, to the pill, or to nowhere keep it; `focusin` at the skip link after focus left the page closes it; Escape from a row and from the pill returns focus to the pill, Escape with focus on the body leaves it there; an outside press closes it, a press in it or on the pill does not; the wrapper has `data-print-hide`, `lang="en"` and the scope. Browser, `smoke.spec.ts` (desktop and mobile Chromium, `/skills` at 390 x 844): the pill by Enter, Tab through the rows and once past, then the next Tab: the skip link has focus and is drawn at its centre, the region is gone, `aria-expanded` is false; Escape from a row returns focus to the pill |
| 2 | Medium, test. The share panel kept at the cutover had no tests: the old header's (`SiteHeader.test.tsx`, deleted) went with it | `components/bento/SharePanel.test.tsx` (8), with the clipboard and `navigator.share` stubbed and the address bar set to `/portfolio?category=ai-agents#work`, unlike the canonical | `readShareTarget` reads the title and the canonical, and the address only without a canonical; an outside press closes the panel; opening the nav's Menu or Say hello (the real `SiteNav`) closes it, one panel at a time; a pill drives it (`aria-expanded`, `aria-controls="share-panel"`); the rows share the canonical and the title (the copy row's label, X, LinkedIn, mailto) and the copy writes the canonical, then "Link copied"; a Thai title keeps `lang="th"` inside the English chrome; "More options" only with `navigator.share`, which gets the canonical. Mutation checks: with `readShareTarget` returning `location.href`, 3 of these fail; without the host's focus listeners, its print marker and its Escape rule, 5 host tests fail |
| 3 | Low. `aria-current` lost on the topic hubs: the Thai FDE hub marked no link, and the other hubs did not mark Learn | `isCurrentLink` reads `/th/topics/...` as its English twin, as the old `isCurrentRow` did; other `/th` paths are not-found pages and mark nothing. Decision on Learn, by spec 7.2's section-parent rule: no. The rule marks a chrome link whose page or section parent is the current page, and the chrome has no Learn link (spec 7.1 and 7.6, umbrella R1); the footer lists Learn but is the same on every page (spec 7.7), and the router marks only the exact page there. So the FDE hubs (both languages) mark AI engineering, and the other hubs mark nothing. Recorded in `profileChrome.ts` | `lib/content/profileChrome.test.ts` (3): `currentOf(aiEngineering, undefined, "/th/topics/forward-deployed-ai-engineering")` is `"page"` (and with a trailing slash); the menu marks only AI engineering on both FDE hubs; nothing on `/topics/tech-startup-thailand-sea`, its Thai twin or `/learn`; nothing on `/th`, `/th/resume`, `/th/portfolio/tbh-intranet` or `/thumbnails/topics/x` |
| 4 | Low, test. The case head check compared each page with itself (the previews it compared are gone) | Rewritten: all seven cases, the head after hydration (what Share reads) normalised with `extractPage` from `lib/parity/parity.mjs`, against `tests/fixtures/site-parity.json`; title "every case keeps the head the parity reference holds, indexable, so Share copies the live address" | Per case: the title and every canonical, `og:*`, `twitter:*`, description and robots tag equal the reference's; one canonical, the live address; no `noindex` in a tag or in `X-Robots-Tag`; `index, follow` present. Then Share on the intranet case prints `kunanonj.com/portfolio/tbh-intranet` |
| 5 | Low. The parked notebook checks had no named owner | Not re-enabled. Phase 7 plan row 7g now names the three (the groups "the notebook, with sample notes on /preview/system" and "the notebook's layout (desktop Chromium)", and "the sample notebook matches its baseline at this width") and gives them to lane D2 with `/design`; the spec's comment names the owner too | `lib/content/testimonials.test.ts` (3): a tripwire that fails when `notebookEntries()` returns three quotes while a check in `profile-journey.spec.ts` is still skipped with `NOTEBOOK_PAGE_GONE` (with a fixture it must fail); every use of that reason in the spec counts as a parked check, so one parked another way cannot slip past; the real tree passes |
| 6 | Low. `globals.css` ran `kj-theme-fade`, which only `shell.css` defined, and nothing guarded it | The `@keyframes` moved into `globals.css`, inside the no-preference block beside its rule, and out of `shell.css`, whose comment now says its rules repeat the global fade until Phase 8 | `lib/design/globals.test.ts`: a new guard, with a fixture it must fail: every keyframe a sheet animates is defined, `globals.css` its own and the profile sheets theirs or `globals.css`'s, each name once. The stale title is now "keeps the scope's copy of the theme fade behind no-preference, on globals.css's keyframes", and it checks `shell.css` defines no `kj-theme-fade`. The build's `globals-*.css` holds the one definition, inside the no-preference block |
| 7 | Low, test. The footer test was weaker than the bento footer's it replaced | Tests only | `SiteFooter.test.tsx` (3, rendered): X, LinkedIn and GitHub by name with their addresses, a new tab and `noopener`; the four agent files in order (`/agents.md`, `/llms.txt`, `/sitemap.md`, `/skills.md`); no address under `/blog` or `/press` among the footer's 20 or more links |
| 8 | Low, tests: the nav mark, two cases missing from the fit and tap loops, the work index cover, the Visit link, About's regions, the tap helper's label pass | Tests only | `smoke.spec.ts`: the nav's current mark is drawn, not only coloured: its `::before` has `content: ""`, is not `display: none`, and has a box the link's size. `profile-case.spec.ts`: the fit and tap-area loops also run `/portfolio/node-validator-automation` and `/portfolio/email-signature-generator`. `WorkIndexPage.test.tsx`: the cover is the registered screenshot (source, size, empty alt in the `aria-hidden` mat, lazy), else the drawn picture. `CasePage.test.tsx`: only the public project (this site) has a link out; the internal tools have no Visit or source link and no new-tab link in the hero. `AboutPage.test.tsx`: each section is a region named by its own header (deviation 1 below). The tap-area helper's label pass is limited to `#site-menu input.pf-theme__input[type=radio]` |
| 9 | Low. "Read my story" on `/about` landed under the story's heading | `#story` is on the About story section, heading included (its id from `aboutPage.hero.storyHref`); `Story` takes `anchor` (default on, so Home's `#story` is unchanged) | Unit: one `#story`, a section, its h2 before the story. Browser, `profile.spec.ts` (desktop and the WebKit phone): after the jump the URL ends `#story`, the h2's top is at 80 px (the bar's bottom) or lower and its bottom on screen |
| 10 | Low. The FAQ's open and closed marks vanished in forced colours (bars drawn as backgrounds) | `.pf-faq__mark::before, ::after { forced-color-adjust: none; background: CanvasText }` in the forced-colours block of `cutover.css` | `profile.spec.ts` (desktop, forced colours): a fixture it must fail, then on `/about` every bar is CanvasText with `forced-color-adjust: none`; the open mark is turned 45 degrees, the closed ones not |
| 11 | Low. Stale notes | `AGENTS.md`: the program line says the cutover is live for Home, the portfolio, the cases, About and Contact, and Phase 7 restyles the rest; the `visual-redesign` line says it still styles those other page bodies. `ci.yml`: the step is "Profile pages (device matrix, WebKit phone, best practices)", with a comment naming the pages. `playwright.config.ts`, `NotFound.tsx`, `SharePanel.tsx`: comments | None (notes) |

Deviations and decisions:

1. **About's bento keeps its eyebrow name.** The About bento reused under
   `#principles` is named "About" by its eyebrow, as on Home, where
   `AboutBento.test.tsx` and `profile-work-about.spec.ts` pin it. The regions
   test checks it as such; every other section is named by its h1 or h2.
2. **The share panel stays open while focus is in the browser's own UI**
   (finding 1). Nothing on the page has focus then, so nothing is covered;
   it closes the moment focus comes back to the page outside it.
3. **Learn is not current on the hubs** (finding 3, reasons above).

No rendering changes for the baselines: the fixes change markup ids,
focus behaviour, forced colours and print only. The Thai FDE hub's
`aria-current` shows only in the phone menu, which no baseline opens.

### Gates of the fix pass (final tree)

On the final tree (this commit, the fix pass on `09ee95b`), its production
build, with `--workers=1` throughout:

| # | Command | Result |
| --- | --- | --- |
| 1 | `pnpm typecheck` | pass |
| 2 | `pnpm lint` | pass, 0 warnings |
| 3 | `pnpm exec prettier --write` (touched files), `pnpm format:check` | pass |
| 4 | `pnpm knip` | pass |
| 5 | `pnpm test` | 162 files, 1,519 tests pass (31 new in this pass, 2 new files; section 3 had 160 and 1,488) |
| 6 | `pnpm build` | pass, once; the built `globals-*.css` holds the one `@keyframes kj-theme-fade`, inside the no-preference block |
| 7 | `pnpm perf:budget` | pass: entry 111.1 / 120 KB; worst route 197.0 / 200 KB (`/skills/code-review`); stylesheets 34.2 / 37 KB (`about.html`); preloaded fonts 51.2 / 56 KB (`build.html`) |
| 8 | `PORT=3106 PLAYWRIGHT_WEB_SERVER="pnpm start" pnpm exec playwright test smoke.spec.ts --project=desktop --project=mobile --grep-invert "matches its baseline" --workers=1` | 324 passed, 0 failed (5.1 min) |
| 8 | The same server, `profile-case.spec.ts` on desktop, mobile and the WebKit phone | 90 passed, 132 skipped by project scope, 0 failed (3.2 min); the head check, the fit loop at 6 widths and the tap loop at 3 widths ran on desktop |
| 8 | The same server, `profile.spec.ts` on all six profile projects | 143 passed, 169 skipped by project scope, 0 failed (3.1 min); "Read my story" ran on desktop and the WebKit phone, the FAQ in forced colours on desktop |
| 8 | The same server, `profile-journey.spec.ts -g "story\|Story\|notebook"` on desktop and the WebKit phone (`Story` changed) | 10 passed, 20 skipped (project scope, and the parked notebook checks, unchanged), 0 failed |
| 9 | `GATES_PORT=4306 node scripts/start-gates.mjs --parity-only` | 137 URLs compared, 0 with differences (138 crawled) |

Checks that the new tests catch the old bugs, without a second build: on
`/about` in forced colours, the fixed bars read `rgb(0, 0, 0)` with
`forced-color-adjust: none` (CanvasText), and with the old rule put back by
a style tag `rgba(255, 255, 255, 0.6)` with `auto` (Canvas, the token's
alpha kept: invisible on the page). With `#story` moved back onto the story
div, "Read my story" leaves the h2's top at -177 px; with the section
anchor, at 256 px. In Chromium, Tab past the panel's last row gives
`focusout` with no related target and `document.hasFocus()` false; the next
Tab gives `focusin` on the skip link, where the panel now closes.

Not run here: `a11y.spec.ts` and the other profile specs (only the specs
these fixes touch, as the lane's settings asked), the fold and tablet
projects of `profile-case.spec.ts` (they run its baselines only), Firefox
(not installed), and the Linux baselines (none change). The final one-run
green browser gate is CI's.

## 16. Visible text against production (19-11-26)

The parity gate compares head tags, JSON-LD, the `lang` attributes, the
title and the first h1, never the body text. So before the deploy, the
`<main>` text of the 11 rebuilt pages in this branch's build was compared with
production, which still served the old design. Every text node of 3 or more
words on the live page that does not appear in the new page's `<main>` text
was listed (script kept outside the repo). There were 43 such phrases. None
is lost content:

| Phrase on production | Pages | Verdict |
| --- | --- | --- |
| "Local time in Bangkok:" and "Building fintech and AI operator systems from Bangkok, for Thailand and SEA: ..." | Home, Contact | R14: the Bangkok card is retired. The footer (outside `<main>`, on every page) carries "Bangkok, GMT+7" and the same sentence ("I build fintech and AI operator systems from Bangkok, ...") |
| The Experience card's lines ("The Binary Holdings · Sep 2025 – Present", "AI Project Manager, Aiden Labs", "Hybrid · Jan – Oct 2025", "Advisor, Aiden Labs", "Remote · Nov – Dec 2024", "The Binary Holdings · Sep – Dec 2024") | Home | Reformatted: the career records card lists the same four roles as organisation, period ("Sep 2025 to now") and role rows. Spec 8.6's rows take the organisation before the résumé's first " · ", so "Hybrid" and "Remote" are not on Home; `/resume` still shows them ("Aiden Labs · Full-time · Hybrid") |
| "Forward Deployed Engineer and AI engineering · Bangkok or remote" | Home | Reworded: the hero's "Open to roles, Bangkok or remote" and the records card's "Open to Forward Deployed Engineer and AI engineering roles, based in Bangkok or remote." |
| "All work →", "See both ventures →" | Home | Link labels. Home still links `/portfolio`, `/ventures/gogocash`, `/ventures/manut` and `/#ventures` |
| "A short arc." and the path card's steps ("Coins / Playbux", "AI + tokenomics", GoGoCash's "Founder" since 2023, the "AI Engineering Lead" role since 2025) | About | Deviation 5: the "Selected path" card is replaced by the career records card |
| "Four operating principles." | About | A heading only; the four principles are the About bento's tiles under `id="principles"` |
| "View project →", "Tailwind CSS 4", "Avalanche P-Chain RPC" | All work | Deviation 6: the lift cards drop the tech chips and the "View project" label. Each stack is still on its case page |
| "Illustrative mockup, not real data." | All work, four case pages | Phase 5 wording: the case covers' caption reads "Illustration, not real data." and the All work cards carry an "Illustration" chip |
| "Top to bottom" | Five case pages | The architecture section's small label; the section now opens with its layers in order ("Users · Web app · API · Services · Build + hosting") |
| The next case's name and tagline (for example "Email Signature Generator", "Branded Gmail signatures, self-serve.") | Five case pages | Navigation: the old "Next" link becomes the More projects cards (spec 9.12); every tagline stays on its own page and on All work |
| "Case study →", and the share card's preview of the page title | Both venture pages | A link label, and the share panel, which now opens from the bar (`SharePanelHost`, outside `<main>`) |

Every other old node of 3 or more words, the outcomes, principles, FAQ
answers, stories and case sections among them, is on the new pages. The
shorter nodes that hold a figure were checked too: "220+ merchants" is
Home's stat tile ("220+", "Merchants on GoGoCash"), "GMT+7" is the footer,
and "Next.js 16", "React 19" and "+4" are All work's chips (deviation 6).
