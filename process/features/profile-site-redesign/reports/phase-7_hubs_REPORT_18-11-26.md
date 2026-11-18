# Phase 7 report, lane D1: topic hubs, Thai typography, reading pages

**Plan:** `../active/phase-7_remaining-pages_PLAN_18-11-26.md`, steps 7a
(`/topics/$slug` and `/th/topics/$slug`, four each), 7b (Thai typography)
and 7d (`/learn`, `/examples`, `/stack`, `/proof`, `/build`), and this lane's
share of 7i (tests and gates). Lane D2 runs 7c, 7e, 7f, 7g and 7h.
**Date:** 18-11-26, in the worktree `t3-8e28336e-8c52ff2e516be201` on the
local branch `feat/profile-topic-hubs-thai-typography`, from `09ee95b` (the
Phase 6 cutover's tip, under review and not on `main`, plus the commit that
added this lane's partial). Local commits only; nothing pushed, merged,
rebased or deployed.
**Lane settings:** `PORT=3107`, `GATES_PORT=4307`, Playwright `--workers=2`.
**Harness:** `.claude/agents/`, `.claude/skills/` and `process/context/` are
missing; the lane ran from the shared brief under the Harness-Absent
Fallback.
**Status:** CODE DONE for this lane (18-11-26). The plan's Status is the
orchestrator's to set once both lanes are merged. Linux baselines are not
rendered here (section 8).

## 1. What was built (by plan step)

| Step | Files | What |
| --- | --- | --- |
| Scope | `lib/design/scope.ts` and test, `tests/e2e/routes.ts` | Seven route ids join `PROFILE_ROUTE_IDS` (the two hub routes and the five reading pages), so `<html>` carries `data-design="profile"` and the pages preload Onest and Instrument Serif instead of Geist. The ten route names of these pages join `PROFILE_ROUTE_NAMES`, so `a11y.spec.ts` runs axe with WCAG 2.2 on them and `profile.spec.ts` holds them to its fit check in every project, both themes |
| 7a Topic hubs | `components/profile/pages/TopicHubPage.tsx` and test, `components/profile/pages/ReadingHero.tsx`, both hub routes, `src/styles/profile/pages-hubs.css` | The hub template from the case-study parts, in English and Thai. Hero: Phase 6's page hero (`.pf-page-hero*`, the case pages' pixel sky), the eyebrow ("Topic", "หัวข้อ") after a status dot beside the language switch ("English", "ไทย": route links, the current one marked with `aria-current="page"`, each naming its language with `lang` and `hreflang`), the `t-display` h1 drawn from the pillar's own segments (connector words muted, the last line the accent; no space added, so the Thai h1s keep their text exactly), the lead, the FDE hubs' availability (the accent badge, a drawn dot, the detail) and buttons (the dark Contact pill to `/contact?topic=hiring`, the ghost Résumé pill), and the existing Share pill. Body, one column of blocks with the case template's rhythm (`.pf-case-step`, hairlines, `Reveal`): each section a chapter (the kicker's pixel mark and number, the heading as a `t-h3` h2, the body as `t-prose`); the operator proof as a numbered fact strip (`article "Operator proof"`); the FAQ as native disclosures, the first open, every answer in the HTML (`section#topic-faq`, named "FAQ"); then "Keep exploring" (ruled link rows, 52 px, the blog filtered out) beside the contact panel (the case Hiring panel's style: the pitch, the call to action, the email address). From 1024 px every block sets its kicker and heading beside its content (5 to 7 columns). Article, FAQPage and BreadcrumbList JSON-LD, hreflang, titles and `<main lang="th">` are untouched (routes unchanged but for the import) |
| 7b Thai typography | `src/styles/globals.css` (the Thai rules), `components/landing/LandingLayout.tsx` (one attribute), `pages-hubs.css` | Thai text falls back to Noto Sans Thai through the stacks Phase 0 set (`--font-sans`, `--font-display`, `--font-mono`); a browser test confirms which face draws it. Added: body text at 1.75 for `t-body`, `t-prose`, `t-lead` and `t-small` under `:lang(th)`, with no tracking; headings at 1.4 with no tracking for every display class plus `t-h3`, `t-card-title` and `t-lift-title`; Thai display text set smaller than the serif (`clamp(2.25rem, 4vw + 0.5rem, 4.5rem)`, 36 to 72 px); `font-synthesis-style: none` under `:lang(th)`, so Noto Sans Thai, which has no italic, keeps the accent lines upright instead of a faux oblique. The hub's own Thai text: fact items at 1.75, FAQ questions at 1.6. Mono labels in Thai: no capitals or tracking (Phase 0's rule), and their Thai glyphs fall back to Noto Sans Thai (tested). `lang="th"` stays on `<html>` and `<main>`; the English chrome carries `lang="en"`: the nav and the footer already did, the skip link now does too, as do the hub's language switch on a Thai page, the Share label and the email address. Noto Serif Thai: evaluated, not shipped (section 6) |
| 7d Reading pages | `components/profile/pages/library/{LearnPage,ExamplesPage,StackPage,ProofPage,BuildPage,parts}.tsx` and `library.test.tsx`, the five routes | Reading layouts from the same hero, the kicker header, tiles, chips and the portfolio index's filter (`.pf-work__filter`, pressed pills with counts, a polite result line). `/learn`: chips that say what the page holds; "Read the hubs in" with the "Hub language" switch and "Showing N hubs in …"; the first hub leads full width with its path and the other language, the others as tiles; the operator notes as tiles. `/examples`: the persona filter, then that persona's examples as tiles (title, body, path, link). `/stack`: the group filter, then a tile per group and the Through-line tile; each tool wears its pixel badge from the Home's Journey orbit (Phase 4, `PixelBadge`, in the same colour it has in the orbit), with its use and domain, and says it opens a new tab. `/proof`: "Delivery" first (four outcome tiles, the label read before the figure, "As stated in the résumé →"), then "Venture metrics" (a tile per figure, the running totals dated "As of October 2026", picking one shows its source sentence), then the two venture cases. `/build`: the venture filter, then the board's three columns as tiles of tickets, an emptied column saying so. Every `?param=` keeps the prerendered default and applies after hydration (the routes' `usePrerenderedParam` and search schemas are unchanged) |
| Deletions | | `components/landing/discovery/` (`TopicHubPage`, `hubLayout`, `LinkRows` and their tests) and `components/landing/library/` (the five pages and `parts`); `library.test.tsx` moved with its pages. knip finds nothing left behind |
| 7i Tests | section 4 | Unit tests for both templates, the scope and every page's h1; `tests/e2e/profile-pages-hubs.spec.ts`; smoke and routes updated |

## 2. Gates

On the final tree (`5c2803c`; this report is the next commit, which also
reflows one source comment and changes no built file), the production build
of that tree:

| # | Gate | Command | Result |
| --- | --- | --- | --- |
| 1 | Types | `pnpm typecheck` | pass |
| 2 | Lint | `pnpm lint` (`--max-warnings=0`) | pass, no issues |
| 3 | Format | `pnpm exec prettier --write` on touched files, then `pnpm format:check` | pass |
| 4 | Dead code | `pnpm knip` | pass |
| 5 | Unit | `pnpm test` | 159 files, 1,483 tests pass |
| 6 | Build | `pnpm build` | pass (the Sanity schema deploy skips without `SANITY_AUTH_TOKEN`) |
| 7 | Budgets | `pnpm perf:budget` | pass: entry 111.1 / 120 KB; hubs 160.0 / 165 KB (were 160.7); `/proof` 159.5, `/stack` 159.2, `/build` and `/examples` 153.0 / 200 KB; stylesheets 35.0 / 37 KB (Phase 6: 34.2; this lane's partial, net of the old pages' utilities it removed); preloaded fonts 51.2 / 56 KB (`design.html`, Geist; the scoped pages preload 48.8 KB) |
| 8 | Browser | `PORT=3107 PLAYWRIGHT_WEB_SERVER="pnpm start" pnpm exec playwright test smoke.spec.ts a11y.spec.ts tests/e2e/profile --project=desktop --project=mobile --project=fold-closed --project=fold-open --project=tablet-landscape --project=webkit-phone --grep-invert "matches its baseline" --workers=2` | 2,184 tests: 990 passed, 1,193 skipped by project scope, 1 failed, in 12.2 minutes. The failure is the known flake "Contact leaves no empty cell beside the recruiter card" on mobile (its two cards measured 64 px apart in width while one column holds both, so a read during the resize). This lane changes no Contact file or rule. Re-run alone: 3 of 4 passed at two workers, 6 of 6 at one worker |
| 9 | Parity | `GATES_PORT=4307 node scripts/start-gates.mjs --parity-only` | 137 URLs compared, 0 with differences; the crawl reached 138 URLs (66 HTML pages), as in Phase 6. `tests/fixtures/site-parity.json` is unchanged |
| | Prerender | sorted `dist/client/**/*.html` | 46 files, the same list as Phase 6 (the eight hubs, `build`, `examples`, `proof`, `stack` among them; `/learn` renders on request, as before) |

## 3. Parity: no intended difference

The parity reference (`tests/fixtures/site-parity.json`) is not changed. The
lane's spec also reads each page's server HTML the way
`scripts/parity-crawl.mjs` does (its own `extractPage`) and compares the h1,
title, `<html lang>`, `<main lang>` and JSON-LD with the reference for all
13 pages; the unit tests compare every hub's h1 text character for
character (`TopicHubPage.test.tsx`) and the reading pages' h1s with the
reference (`library.test.tsx`).

## 4. Changed tests and why (umbrella input R17)

| Test | Change | Why |
| --- | --- | --- |
| `components/profile/pages/TopicHubPage.test.tsx` (replaces `components/landing/discovery/TopicHubPage.test.tsx`) | Same intents on the new layout | The h1 in lines with muted words and the accent last (now exact, for every hub in both languages); the language switch; every section with its number and body (as chapters, not bento cards); the proof, the FAQ (now disclosures: every answer in the HTML, the first open), the related links and the contact block; both calls to action; Thai marked as Thai and English as English; the FDE hubs' availability, hiring buttons and résumé link. The bento grid's span assertions ("FAQ full width, proof beside s3", "two by two") are replaced by the chapter and row checks |
| `components/landing/discovery/hubLayout.test.ts` | Deleted | Its grid function is gone with the bento hub |
| `components/profile/pages/library/library.test.tsx` (moved) | Same intents; three additions | Link names lose the drawn arrow ("Open hub", "อ่านภาษาไทย"; spec 12 item 18); the `hubLayout` test goes with its function; added: each page's h1 against the parity reference, the Stack's pixel badges in their orbit colours, new-tab notices |
| `lib/design/scope.test.ts` | The lane's seven ids move from "leaves the pages Phase 7 restyles on the old tokens" to a new test | They are in the scope now |
| `tests/e2e/smoke.spec.ts`: "the FDE hub leaves no section card mostly empty at desktop width" | Rewritten: "the FDE hub sets its four sections as chapters, each body beside its heading at desktop width" | The intent (no section left mostly empty) on the chapter layout: at 1440 px each body starts level with its kicker, beside its heading |
| `tests/e2e/smoke.spec.ts`: tap areas | Four pages added: the English FDE hub, a Thai hub, `/stack` and `/proof` | Plan gate 5 and the device matrix: 24 px targets, apart and uncovered, at 320, 344 and 390 px |
| `tests/e2e/routes.ts` | Ten names join `PROFILE_ROUTE_NAMES` | Axe with WCAG 2.2 and the fit check on the lane's pages |
| `tests/e2e/profile-pages-hubs.spec.ts` (new) | | The content contract for the 13 pages; the device matrix (344, 390, 820, 882, 1180, 1440); forced colors, text spacing and zoom on the English and Thai FDE hubs, the one-section Thai hub, `/stack` and `/proof`; request origins on all 13; Thai: languages on the page and the chrome, line heights, labels, upright accents, and Noto Sans Thai drawing the Thai glyphs (Chromium's DevTools protocol); the FAQ and the language switch by keyboard; the FDE hub's hiring links |

Unchanged and still passing: the smoke tests that read the hubs' proof list
(`article[aria-labelledby="card-proof"] li`: its numbers are drawn in CSS, so
each item's text is the fact alone), the Thai FDE pill and buttons, the
hiring button, `/proof`'s order and figures at 320 and 375 px, and the four
filter tests.

## 5. Deviations, with reasons

1. **Hub blocks side by side from 1024 px.** The case template's single
   column sits beside a contents rail; the hubs have no rail, and one 64ch
   column left half of a 1440 px page empty. From 1024 px each block puts
   its kicker and heading in the left 5 of 12 columns and its content in the
   right 7 (CSS only; the markup order is unchanged).
2. **"Their big numbers become fact strips."** Read as: the cards' big
   decorative numbers become the chapters' kicker numbers, and the operator
   proof, short facts and outcomes, takes the numbered fact strip (spec 9.8).
   The strip numbers its items in CSS (`content: counter(...) / ""`), so the
   numbers are not read and each item's text stays the fact alone. It runs
   one column, two from 600 px (spec 4.2 says three from 640 for short
   facts; these are sentences, and on the hub row the strip has 7 of 12
   columns).
3. **The FAQ is a set of disclosures**, as the plan asks (the bento hub's
   comment cited its own spec, "topic FAQs are not disclosures"). The first
   is open and every answer stays in the HTML, so the FAQPage JSON-LD's text
   is on the page.
4. **Arrows are drawn, not read** (spec 12 item 18): link names lose "→"
   ("Open hub", "Read the GoGoCash case", "GoGoCash case"); "As stated in
   the résumé →" keeps it, because a test pins that name. The related links'
   decorative numbers are gone; the visible words are unchanged.
5. **The FDE availability:** the badge, a dot hidden from screen readers,
   then the detail. The text is unchanged (the smoke test's "เปิดรับตำแหน่ง ·
   Forward Deployed Engineer" still matches); the dot is no longer read
   aloud, which closes the backlog's "availability pill middle dots" item
   for this pill.
6. **The Share pill stays the existing `SharePill`** (56 px round under
   640 px), opened through the layout's share panel, as on the case pages
   (spec 13 item 27).
7. **A file outside the lane's list:** `components/landing/LandingLayout.tsx`
   gains `lang="en"` on the skip link, the last English chrome label without
   it on the Thai pages (plan 7b). One attribute.
8. **Thai display size** (not in the spec): `.t-display:lang(th)` is
   `clamp(2.25rem, 4vw + 0.5rem, 4.5rem)`. Noto Sans Thai is larger on the
   same body than the narrow serif, and at the serif's 96 px with Thai's 1.4
   line height a three-line h1 stood about 400 px tall. The bounds keep the
   zoom rule (2 times, under 2.5).
9. **No faux italic in Thai:** `font-synthesis-style: none` under
   `:lang(th)`. The accent lines keep their colour; Latin words in them keep
   the serif's real italic.
10. **The filters reuse the portfolio index's classes** (`.pf-work__filter`,
    `.pf-work__option`, `.pf-work__count` in `cutover.css`) instead of new
    ones, to keep the stylesheet budget; Phase 8 can rename them to a
    neutral `pf-filter`.
11. **`/learn`'s language card:** the big "EN"/"TH" letters (decoration,
    hidden from screen readers) are gone; the kicker "Read the hubs in", the
    "Hub language" switch and the polite count stay. Only the first hub
    shows its path and the other language, as the canvas drew it; it now
    leads full width.
12. **New files under `components/profile/pages/`** (and `library/`), with
    the old `components/landing/discovery/` and `components/landing/library/`
    deleted, as Phase 6 did for About, Contact and the portfolio index.
13. **Duplicated browser helpers:** the lane's spec carries its own copies
    of `profile.spec.ts`'s layout, forced-colors, text-spacing and zoom
    checks (spec files cannot import each other). Phase 8 can move them into
    one helper module.

## 6. Noto Serif Thai for Thai headings (plan 7b: evaluated for the owner, not shipped)

Shipped: **Noto Sans Thai** (the default), which the Thai pages already load
for body text.

| | Noto Sans Thai (shipped) | Noto Serif Thai 400 | Noto Serif Thai 500 |
| --- | --- | --- | --- |
| Thai subset, woff2 (Google Fonts CSS2 API, 18-11-26, Chrome agent) | 26.3 KB variable 100 to 900, already loaded on Thai pages | 9.6 KB static (32.0 KB as the variable 100 to 900 file) | 10.3 KB static |
| Added per Thai page if adopted for headings | 0 | 9.6 KB, on demand (no preload) | 10.3 KB |
| Beside Instrument Serif (one weight, narrow, high stroke contrast) | Loopless, even strokes, wider: reads modern and matches the body, but the h1 mixes a sans with the serif's Latin words ("AI", "Forward Deployed", "SEA") | Looped, with stroke contrast: sits closest to the Latin serif's tone; a little wider and darker than it | Heavier than the Latin serif; the Thai words outweigh the Latin ones |

Comparison image (not committed, like earlier phases' screenshots): the
Thai FDE and AI-transformation h1s in each face at display size, beside the
Latin serif, rendered from the self-hosted files:
`/private/tmp/claude-501/-Users-kunanonjarat--t3-worktrees-fronk-website-t3-8e28336e-8c52ff2e516be201/f5cf5a55-2336-425a-8efd-bb7f505ce871/scratchpad/noto-serif-thai-comparison.png`.

Recommendation: keep Noto Sans Thai unless the owner wants the Thai
headings to echo the Latin serif; then ship Noto Serif Thai **400**, Thai
subset only (9.6 KB), as `--font-thai-serif` inside `--font-display`'s
fallback, applied under `:lang(th)` to the display classes. That is far
under the plan's 100 KB blocker. Nothing waits on the answer.

## 7. Owner inputs used and their defaults

| Input | Default used | Where |
| --- | --- | --- |
| Plan 7b, Thai heading face | Noto Sans Thai; Noto Serif Thai evaluated (section 6) | all Thai pages |
| R2, Share | The hero Share pill stays on the hubs | hub hero |
| R17, pinned tests | Rewritten to the same intent; the list in section 4 is for the owner's approval | tests |
| R18, tool icons | Our own pixel badges from each tool's two-letter badge, never brand marks; the same component and colours as the Journey orbit | `/stack` |
| R12, R13 | Not touched: h1s and content modules are read as they are | hubs, reading pages |

## 8. Visual baselines (for the orchestrator)

None to delete: Phase 6 already removed every live baseline these pages had
(only `/design`'s four remain, lane D2's). CI renders the missing ones for
the hubs, the Thai hubs and the five reading pages (`visual.spec.ts`
through `ROUTES`), and each needs a review against spec sections 9, 10 and
11 and the Thai rules above; the plan asks the owner to review the Thai
hubs.

## 9. Device matrix and the folded-flat posture

Every page holds at 344, 390, 820, 882, 1180 and 1440 px (the lane's spec)
and passes the fit check in the fold-closed, fold-open, tablet-landscape and
WebKit phone projects (`profile.spec.ts`). Reviewed by eye in scratch
screenshots at 1440, 820 and 390 px, light and dark (not committed).

Folded flat, hinge across the screen (`vertical-viewport-segments: 2`; spec
10.1 leaves it to Phase 7): **no special layout for this lane's pages.**
They are documents that scroll; nothing but the nav is pinned to the
viewport, so content passes the hinge as the reader scrolls, as on any
phone in landscape. The open question in spec 10.1 is about the Home hero
and the notebook, which neither Phase 7 lane owns (section 11, item 3).

## 10. Draft copy awaiting approval

None. Every visible line comes from `lib/content` or was on the pages
before (the hub labels, "Topic hub", "Read the hubs in", "Through-line",
"Delivery", "Nothing here for this filter.", and so on). Added text is for
screen readers only: "(opens in a new tab)" on new-tab links, and names
such as "Open: Four operating principles" for the notes' repeated "Open"
links.

## 11. Open items

1. **Visual baselines (orchestrator):** render and review the 13 pages'
   baselines in CI (section 8); the owner reviews the Thai hubs.
2. **Noto Serif Thai (owner):** section 6. Default kept.
3. **Folded-flat posture for the Home hero and the notebook (orchestrator):**
   not this lane's pages. Suggested default: no change; the phone hero is
   content height and the notebook is hidden until three quotes are cleared.
4. **Merging with lane D2 (orchestrator):** shared edits in
   `lib/design/scope.ts` and its test, `tests/e2e/routes.ts` and
   `tests/e2e/smoke.spec.ts` (the tap-area list); keep both sides. After
   both lanes, run knip on the combined tree: the bento exports this lane
   stopped using (`PageMain`, `BentoCard`, `BentoPair`, `bentoSpan`,
   `Kicker`, `CARD_SURFACE`, `MONO_LABEL`, `PageTitle`, `HeroLead`,
   `EyebrowChip`, `CtaLink`, `ctaClasses`, `TechChip`, `AvailabilityPill`)
   are still used by D2's page families, and `BentoCard` and `ctaClasses`
   also by `ContributionActivity` and `RouteError`, so some may fall unused
   only once D2 lands. The stylesheet budget has 2.0 KB of headroom left for
   D2's partial.
5. **Rebase (orchestrator):** the branch starts from `09ee95b` (Phase 6, not
   on `main` yet); rerun the gates after the rebase.
6. **By hand (owner):** a screen reader pass on a topic hub (plan gate 7);
   the keyboard paths are tested.
7. **Firefox** is not installed here and was not run.
8. **The Contact flake (not this lane's page):** "Contact leaves no empty
   cell beside the recruiter card" still reads the two widths once after
   the resize; under two workers it failed 2 of 5 times here. Polling the
   width check as the row checks already are (#121) would settle it.
9. **Phase 8:** rename the reused `.pf-work__*` filter classes; move the
   duplicated browser helpers into one module (section 5, items 10 and 13).

