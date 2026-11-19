# Phase 7 report, lane D1: topic hubs, Thai typography, reading pages

**Plan:** `../active/phase-7_remaining-pages_PLAN_18-11-26.md`, steps 7a
(`/topics/$slug` and `/th/topics/$slug`, four each), 7b (Thai typography)
and 7d (`/learn`, `/examples`, `/stack`, `/proof`, `/build`), and this lane's
share of 7i (tests and gates). Lane D2 runs 7c, 7e, 7f, 7g and 7h.
**Date:** 18-11-26, in the worktree `t3-8e28336e-8c52ff2e516be201` on the
local branch `feat/profile-topic-hubs-thai-typography`, from `09ee95b` (the
Phase 6 cutover's tip, under review and not on `main`, plus the commit that
added this lane's partial). Code review fixes on 19-11-26 (section 12).
Local commits only; nothing pushed, merged, rebased or deployed.
**Lane settings:** `PORT=3107`, `GATES_PORT=4307`, Playwright `--workers=2`.
**Harness:** `.claude/agents/`, `.claude/skills/` and `process/context/` are
missing; the lane ran from the shared brief under the Harness-Absent
Fallback.
**Status:** CODE DONE for this lane, review findings fixed (19-11-26). The
plan's Status is the orchestrator's to set once both lanes are merged.
Linux baselines are not rendered here (section 8).

## 1. What was built (by plan step)

| Step | Files | What |
| --- | --- | --- |
| Scope | `lib/design/scope.ts` and test, `tests/e2e/routes.ts` | Seven route ids join `PROFILE_ROUTE_IDS` (the two hub routes and the five reading pages), so `<html>` carries `data-design="profile"` and the pages preload Onest and Instrument Serif instead of Geist. The ten route names of these pages join `PROFILE_ROUTE_NAMES`, so `a11y.spec.ts` runs axe with WCAG 2.2 on them and `profile.spec.ts` holds them to its fit check in every project, both themes |
| 7a Topic hubs | `components/profile/pages/TopicHubPage.tsx` and test, `ReadingHero.tsx`, `FaqList.tsx` and test, both hub routes, `src/styles/profile/pages-hubs.css` | The hub template from the case-study parts, in English and Thai. Hero: Phase 6's page hero (`.pf-page-hero*`, the case pages' pixel sky), the eyebrow ("Topic", "หัวข้อ") after a status dot beside the language switch ("English", "ไทย": route links, the current one marked with `aria-current="page"`, each naming its language with `lang` and `hreflang`), the `t-display` h1 drawn from the pillar's own segments (connector words muted, the last line the accent; no space added, so the Thai h1s keep their text exactly), the lead, the FDE hubs' availability (the accent badge, a drawn dot, the detail) and buttons (the dark Contact pill to `/contact?topic=hiring`, the ghost Résumé pill), and the existing Share pill. Body, one column of blocks with the case template's rhythm (`.pf-case-step`, hairlines, `Reveal`): each section a chapter (the kicker's pixel mark and number, the heading as a `t-h3` h2, the body as `t-prose`); the operator proof as a numbered fact strip (`article "Operator proof"`); the FAQ as numbered native disclosures from the shared `FaqList` (the first open, every answer in the HTML, all opened for printing; `section#topic-faq`, named "FAQ"); then "Keep exploring" (numbered, ruled link rows, 52 px, the blog filtered out) beside the contact panel (the case Hiring panel's style: the pitch, the call to action, the email address). From 1024 px every block sets its kicker and heading beside its content (5 to 7 columns). Article, FAQPage and BreadcrumbList JSON-LD, hreflang, titles and `<main lang="th">` are untouched (routes unchanged but for the import). About's FAQ uses the same `FaqList` (section 12) |
| 7b Thai typography | `src/styles/globals.css` (the Thai rules), `components/landing/LandingLayout.tsx` (one attribute), `pages-hubs.css` | Thai text falls back to Noto Sans Thai through the stacks Phase 0 set (`--font-sans`, `--font-display`, `--font-mono`); a browser test confirms which face draws it. Added: body text at 1.75 for `t-body`, `t-prose`, `t-lead` and `t-small` under `:lang(th)`, with no tracking; headings at 1.4 with no tracking for every display class plus `t-h3`, `t-card-title` and `t-lift-title`; Thai display text set smaller than the serif (`clamp(2.25rem, 4vw + 0.5rem, 4.5rem)`, 36 to 72 px); `font-synthesis-style: none` under `:lang(th)`, so Noto Sans Thai, which has no italic, keeps the accent lines upright instead of a faux oblique. The hub's own Thai text: fact items and the availability line at 1.75, FAQ questions at 1.6. Mono labels in Thai: no capitals or tracking (Phase 0's rule), and their Thai glyphs fall back to Noto Sans Thai (tested). `lang="th"` stays on `<html>` and `<main>`; the English chrome carries `lang="en"`: the nav and the footer already did, the skip link now does too, as do the hub's language switch on a Thai page, the Share label and the email address. Noto Serif Thai: evaluated, not shipped (section 6) |
| 7d Reading pages | `components/profile/pages/library/{LearnPage,ExamplesPage,StackPage,ProofPage,BuildPage,parts}.tsx` and `library.test.tsx`, the five routes | Reading layouts from the same hero, the kicker header, tiles, chips and the portfolio index's filter (`.pf-work__filter`, pressed pills with counts, a polite result line). `/learn`: chips that say what the page holds; "Read the hubs in" (h2, the chosen language's code beside it) with the "Hub language" switch (its pills carry the "EN" and "TH" codes, drawn, not read) and "Showing N hubs in …"; the hub titles as h3 under it; the first hub leads full width with its path and the other language, the others as tiles; the operator notes as tiles. `/examples`: "Show examples for" (h2) naming a tile per persona, each with its number and count ("01 · 3 examples") and name, the polite result line, then that persona's examples as tiles (title, body, path, link). `/stack`: the group filter, then a tile per group and the Through-line tile; each tool wears its pixel badge from the Home's Journey orbit (Phase 4, `PixelBadge`, in the same colour it has in the orbit), with its use and domain, and says it opens a new tab. `/proof`: "Delivery" first (four outcome tiles, the label read before the figure, "As stated in the résumé →"), then "Venture metrics" (a tile per figure, the running totals dated "As of October 2026", picking one shows its source sentence), then the two venture cases. `/build`: the venture filter, then the board's three columns as tiles of tickets, an emptied column saying so. Every `?param=` keeps the prerendered default and applies after hydration (the routes' `usePrerenderedParam` and search schemas are unchanged) |
| Deletions | | `components/landing/discovery/` (`TopicHubPage`, `hubLayout`, `LinkRows` and their tests) and `components/landing/library/` (the five pages and `parts`); `library.test.tsx` moved with its pages. knip finds nothing left behind |
| 7i Tests | section 4 | Unit tests for both templates, the FAQ list, the scope, the partial's guards and every page's h1; `tests/e2e/profile-pages-hubs.spec.ts`; smoke and routes updated |

## 2. Gates

On the final tree (`fb452f8`, the review fixes; this report is the next
commit and changes no built file), the production build of that tree:

| # | Gate | Command | Result |
| --- | --- | --- | --- |
| 1 | Types | `pnpm typecheck` | pass |
| 2 | Lint | `pnpm lint` (`--max-warnings=0`) | pass, no issues |
| 3 | Format | `pnpm exec prettier --write` on touched files, then `pnpm format:check` | pass |
| 4 | Dead code | `pnpm knip` | pass |
| 5 | Unit | `pnpm test` | 161 files, 1,492 tests pass. One earlier run on the same tree, while the other lane's browsers loaded the machine (load average about 8), ended in 3 worker setup errors after 16 minutes (setup took 73% of it) with no failed test; run again, it passed clean |
| 6 | Build | `pnpm build` | pass (the Sanity schema deploy skips without `SANITY_AUTH_TOKEN`). The built stylesheet keeps `@media (37.5rem<=width<64rem)` and the print `::details-content` rule |
| 7 | Budgets | `pnpm perf:budget` | pass: entry 111.1 / 120 KB; hubs 160.5 / 165 KB (Phase 6: 160.7); `/about` 178.3, `/proof` 159.5, `/stack` 159.2, `/build` and `/examples` 153.1 / 200 KB; stylesheets 35.1 / 37 KB (Phase 6: 34.2; this lane's partial, net of the old pages' utilities it removed); preloaded fonts 51.2 / 56 KB (`design.html`, Geist; the scoped pages preload 48.8 KB) |
| 8 | Browser | `PORT=3107 PLAYWRIGHT_WEB_SERVER="pnpm start" pnpm exec playwright test smoke.spec.ts a11y.spec.ts tests/e2e/profile --project=desktop --project=mobile --project=fold-closed --project=fold-open --project=tablet-landscape --project=webkit-phone --grep-invert "matches its baseline" --workers=2` | 2,208 tests: 994 passed, 1,213 skipped by project scope, 1 failed, in 12.3 minutes. The failure is on Home, which this lane does not touch: "with motion allowed the ring turns while in view, and holds by its button, with focus inside and on hover" (`profile-journey.spec.ts`, WebKit phone), where the orbit had not paused 5 s after focus moved into it. It is flaky on the base build too: alone, on one worker, under the other lane's load, it failed 4 of 6 runs against `09ee95b`'s build and 3 of 6 against this one (open item 10) |
| 9 | Parity | `GATES_PORT=4307 node scripts/start-gates.mjs --parity-only` | 137 URLs compared, 0 with differences; the crawl reached 138 URLs (66 HTML pages), as in Phase 6. `tests/fixtures/site-parity.json` is unchanged |
| | Prerender | sorted `dist/client/**/*.html` | 46 files, the same list as Phase 6 (the eight hubs, `build`, `examples`, `proof`, `stack` among them; `/learn` renders on request, as before) |
| | Page text | `<main>` text of the base build (`09ee95b`) against this build, section 10 | no content dropped or reworded; one intended change (`/stack`'s badge letters, now drawn) |

Before the review (`5c2803c`): the same gates passed but the browser run,
2,184 tests with 990 passed, 1,193 skipped by project scope and 1 failed:
the known flake "Contact leaves no empty cell beside the recruiter card" on
mobile (re-run alone, 3 of 4 passed at two workers, 6 of 6 at one; this
lane changes no Contact file or rule).

## 3. Parity: no intended difference

The parity reference (`tests/fixtures/site-parity.json`) is not changed. The
crawl compares head tags, JSON-LD, the html and main languages, the title
and the first h1, never body text, so section 10 diffs the pages' text
separately. The lane's spec also reads each page's server HTML the way
`scripts/parity-crawl.mjs` does (its own `extractPage`) and compares the h1,
title, `<html lang>`, `<main lang>` and JSON-LD with the reference for all
13 pages; the unit tests compare every hub's h1 text character for
character (`TopicHubPage.test.tsx`) and the reading pages' h1s with the
reference (`library.test.tsx`).

## 4. Changed tests and why (umbrella input R17)

| Test | Change | Why |
| --- | --- | --- |
| `components/profile/pages/TopicHubPage.test.tsx` (replaces `components/landing/discovery/TopicHubPage.test.tsx`) | Same intents on the new layout | The h1 in lines with muted words and the accent last (now exact, for every hub in both languages); the language switch; every section with its number and body (as chapters, not bento cards); the proof, the FAQ (now disclosures: every answer in the HTML, the first open, the numbers drawn), the related links (numbered, named by their words) and the contact block; both calls to action; Thai marked as Thai and English as English; the FDE hubs' availability, hiring buttons and résumé link. The bento grid's span assertions ("FAQ full width, proof beside s3", "two by two") are replaced by the chapter and row checks |
| `components/profile/pages/FaqList.test.tsx` (new) | | The disclosures, the drawn numbers, printing opening every answer and closing only those it opened, and no listener left after unmount |
| `components/landing/discovery/hubLayout.test.ts` | Deleted | Its grid function is gone with the bento hub |
| `components/profile/pages/library/library.test.tsx` (moved) | Same intents; additions | Link names lose the drawn arrow ("Open hub", "อ่านภาษาไทย"; spec 12 item 18); the `hubLayout` test goes with its function; added: each page's h1 against the parity reference, `/learn`'s h3 hub titles and drawn codes, `/examples`' "Show examples for" heading naming its persona tiles with their numbers and counts, every `/stack` badge in its orbit colour, new-tab notices |
| `lib/design/pagesHubs.test.ts` (new) | | The partial uses no `max-width` media feature and sets no `cursor`, each guard proved on a fixture first |
| `lib/design/scope.test.ts` | The lane's seven ids move from "leaves the pages Phase 7 restyles on the old tokens" to a new test | They are in the scope now |
| `tests/e2e/smoke.spec.ts`: "the FDE hub leaves no section card mostly empty at desktop width" | Rewritten: "the FDE hub sets its four sections as chapters, each body beside its heading at desktop width" | The intent (no section left mostly empty) on the chapter layout: at 1440 px each body starts level with its kicker, beside its heading |
| `tests/e2e/smoke.spec.ts`: "/learn?lang=th renders the Thai hubs on the server" | `h2[lang="th"]` becomes `h3[lang="th"]` | The hub titles are h3 under "Read the hubs in" |
| `tests/e2e/smoke.spec.ts`: tap areas | Four pages added: the English FDE hub, a Thai hub, `/stack` and `/proof` | Plan gate 5 and the device matrix: 24 px targets, apart and uncovered, at 320, 344 and 390 px |
| `tests/e2e/routes.ts` | Ten names join `PROFILE_ROUTE_NAMES` | Axe with WCAG 2.2 and the fit check on the lane's pages |
| `tests/e2e/profile-pages-hubs.spec.ts` (new) | | The content contract for the 13 pages; the device matrix (344, 390, 820, 882, 1180, 1440); forced colors, text spacing and zoom on the English and Thai FDE hubs, the one-section Thai hub, `/stack` and `/proof`; request origins on all 13; Thai: languages on the page and the chrome, line heights (the availability line included), labels, upright accents, and Noto Sans Thai drawing the Thai glyphs (Chromium's DevTools protocol); the keyboard, with real keys from a known start (Tab, Option+Tab in WebKit, to the FAQ's questions, then Space and Enter; Tab to "ไทย", then Enter, then the Thai URL); printing opening every FAQ answer on two hubs and About; the pickable tiles' hand cursor; the FDE hub's hiring links |

Unchanged and still passing: the smoke tests that read the hubs' proof list
(`article[aria-labelledby="card-proof"] li`: its numbers are drawn in CSS, so
each item's text is the fact alone), the Thai FDE pill and buttons, the
hiring button, `/proof`'s order and figures at 320 and 375 px, the four
filter tests and About's own tests.

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
   is open, every answer stays in the HTML (the FAQPage JSON-LD's text), the
   numbers 01 to 03 stay, drawn and not read, and printing opens every
   answer.
4. **Arrows and numbers are drawn, not read** (spec 12 item 18): link names
   lose "→" ("Open hub", "Read the GoGoCash case", "Manut case") and the
   related links' numbers ("02 Manut case" is named "Manut case"); both stay
   on the page. "As stated in the résumé →" keeps its arrow in its name,
   because a test pins that name.
5. **The FDE availability:** the badge, a dot hidden from screen readers,
   then the detail. The text is unchanged (the smoke test's "เปิดรับตำแหน่ง ·
   Forward Deployed Engineer" still matches); the dot is no longer read
   aloud, which closes the backlog's "availability pill middle dots" item
   for this pill.
6. **The Share pill stays the existing `SharePill`** (56 px round under
   640 px), as on the case pages, but it opens the layout's share panel
   (`SharePanelHost`, Phase 6), drawn under the bar's right end, not a panel
   of its own under the pill as the case pages' `CaseActions` draws (spec 13
   item 27).
7. **Files outside the lane's list:** `components/landing/LandingLayout.tsx`
   gains `lang="en"` on the skip link, the last English chrome label without
   it on the Thai pages (plan 7b; one attribute); and, for the review's print
   fix, `components/profile/pages/AboutPage.tsx` renders its FAQ with the
   shared `FaqList` (the same markup, 16 lines out, 4 in).
8. **Thai display size** (not in the spec): `.t-display:lang(th)` is
   `clamp(2.25rem, 4vw + 0.5rem, 4.5rem)`. Noto Sans Thai is larger on the
   same body than the narrow serif, and at the serif's 96 px with Thai's 1.4
   line height a three-line h1 stood about 400 px tall. The bounds keep the
   zoom rule (2 times, under 2.5).
9. **No faux italic in Thai:** `font-synthesis-style: none` under
   `:lang(th)`. The accent lines keep their colour; Latin words in them keep
   the serif's real italic.
10. **The filters reuse the portfolio index's classes** (`.pf-work__filter`,
    `.pf-work__option`, `.pf-work__count` in `cutover.css`) on `/learn`,
    `/stack` and `/build` instead of new ones, to keep the stylesheet budget;
    Phase 8 can rename them to a neutral `pf-filter`. `/examples` keeps a
    tile per persona, as before; those tiles and `/proof`'s metric tiles are
    one "pick" tile (`.pf-read-pick`).
11. **`/learn`'s language card:** its "EN" or "TH" no longer stands 64 px
    tall; the code sits beside "Read the hubs in" and on each pill, drawn
    and not read, as before. Only the first hub shows its path and the other
    language, as the canvas drew it; it now leads full width.
12. **`/stack`'s badges are drawn:** each tool's two letters ("NS", "TS" and
    the rest; hidden from screen readers before and now) are Phase 4's pixel
    badges instead of mono text, as plan 7d asks ("reuses the pixel tool
    icons from Phase 4") under umbrella input R18. The only words of the 13
    pages that are no longer text (section 10).
13. **New files under `components/profile/pages/`** (and `library/`), with
    the old `components/landing/discovery/` and `components/landing/library/`
    deleted, as Phase 6 did for About, Contact and the portfolio index.
14. **Duplicated browser helpers:** the lane's spec carries its own copies
    of `profile.spec.ts`'s layout, forced-colors, text-spacing and zoom
    checks and `profile-journey.spec.ts`'s Tab helpers (spec files cannot
    import each other). Phase 8 can move them into one helper module.

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
Latin serif, rendered from the self-hosted files; it stayed in the lane's
scratch folder, outside the repo.

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
hubs. About's baselines are unaffected by the shared FAQ list (the same
markup).

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

## 10. Copy: what the pages' text gained, lost and kept

No new visible copy: every line comes from `lib/content` or was on the
pages before, so nothing awaits the owner's approval.

The page text was checked word for word, not only through parity (which
never reads body text). For each of the 13 pages, the rendered `<main>` text
(1440 px, every `details` opened) of the base build (`09ee95b`) against this
build, compared as a case-folded multiset of words, so a layout that moves a
block does not count but a dropped or reworded word does. The same for the
four filter states `/learn?lang=th`, `/examples?persona=founders`,
`/stack?group=ship` and `/build?venture=manut`.

| Page | Only in the base | Only in this build |
| --- | --- | --- |
| `/build`, `/examples`, `/learn` (and their filter states) | nothing | nothing |
| `/proof` | nothing | "(opens in a new tab)" twice, screen-reader text on the two "Live" links |
| `/stack` (and `?group=ship`) | the 17 badge codes ("NS", "MD", "TS" twice and the rest), now drawn as pixel badges (section 5, item 12) | "(opens in a new tab)" on its 18 new-tab links, screen-reader text |
| The 8 hubs | nothing | "→" on each related link (2 to 5), drawn and hidden from screen readers where the base drew an arrow icon |

The first comparison, before the review fixes, found what the restyle had
dropped, all restored now (section 12): the hubs' FAQ numbers (01 to 03)
and related-link numbers (01 to 05); `/examples`' "Show examples for" and
its "01 · 3 examples" lines; `/learn`'s "EN" and "TH"; and `/stack`'s "→"
on its 18 new-tab links, which had turned into "↗".

Screen-reader text added: "(opens in a new tab)" on new-tab links, and names
such as "Open: Four operating principles" for the notes' repeated "Open"
links. Accessible names that lost a drawn character: section 5, item 4.

## 11. Open items

1. **Visual baselines (orchestrator):** render and review the 13 pages'
   baselines in CI (section 8); the owner reviews the Thai hubs.
2. **Noto Serif Thai (owner):** section 6. Default kept.
3. **Folded-flat posture for the Home hero and the notebook (orchestrator):**
   not this lane's pages. Suggested default: no change; the phone hero is
   content height and the notebook is hidden until three quotes are cleared.
4. **Merging with lane D2 (orchestrator):** shared edits in
   `lib/design/scope.ts` and its test, `tests/e2e/routes.ts` and
   `tests/e2e/smoke.spec.ts` (the tap-area list and the Learn check); keep
   both sides. After both lanes, run knip on the combined tree: the bento
   exports this lane stopped using (`PageMain`, `BentoCard`, `BentoPair`,
   `bentoSpan`, `Kicker`, `CARD_SURFACE`, `MONO_LABEL`, `PageTitle`,
   `HeroLead`, `EyebrowChip`, `CtaLink`, `ctaClasses`, `TechChip`,
   `AvailabilityPill`) are still used by D2's page families, and `BentoCard`
   and `ctaClasses` also by `ContributionActivity` and `RouteError`, so some
   may fall unused only once D2 lands. The stylesheet budget has 1.9 KB of
   headroom left for D2's partial.
5. **Rebase (orchestrator):** the branch starts from `09ee95b` (Phase 6, not
   on `main` yet); rerun the gates after the rebase. The rebase brings Phase
   6's forced-colors fix for the FAQ's plus marks (`cutover.css`), which
   this lane does not duplicate; a hub check for it would fail before the
   rebase, so none is added here (section 12, item 5).
6. **By hand (owner):** a screen reader pass on a topic hub (plan gate 7).
7. **Firefox** is not installed here and was not run.
8. **The Contact flake (not this lane's page):** "Contact leaves no empty
   cell beside the recruiter card" still reads the two widths once after
   the resize; under two workers it failed 2 of 5 times here. Polling the
   width check as the row checks already are (#121) would settle it.
9. **Phase 8:** rename the reused `.pf-work__*` filter classes; move the
   duplicated browser helpers into one module (section 5, items 10 and 14);
   remove `--shadow-logo` and `--elev-logo` from `globals.css`, unused since
   `/proof`'s case tiles stopped drawing the old logo shadow (left in place
   as the review asks).
10. **The Journey orbit flake (Home, Phase 4; not this lane's page):** on
    the WebKit phone, "the ring turns while in view, and holds by its button,
    with focus inside and on hover" fails about half its runs under load, on
    the base build as on this one (gate 8). Its wait for the orbit to pause
    after focus enters the stage is 5 s; the cause wants a look by whoever
    owns Phase 4's checks.

## 12. Code review and fixes (19-11-26)

The review of `5c2803c` found these; each fix is in `fb452f8`.

| # | Finding | Fix | Test |
| --- | --- | --- | --- |
| 0 | Parity never compares body text, so "0 differences" did not prove the text survived | Diffed every page's `<main>` text against the base build (section 10) and restored every drop | the diff, before and after, in section 10 |
| 1 | `/examples` lost "Show examples for" and the "01 · 3 examples" lines; the hubs lost their FAQ numbers (and, the diff showed, their related-link numbers) | `BlockHead` "Show examples for" (h2) names the persona group, whose tiles carry "01 · 3 examples" and the name; the shared `FaqList` draws the hubs' numbers; the related links draw theirs; `/learn`'s codes and `/stack`'s "→" are back too | unit: the heading by role and level, the tiles' text, the numbers drawn and hidden; the page-text diff |
| 2 | `.pf-read-avail` inherited 1.5 on Thai pages | `.pf-read-avail:lang(th)` at 1.75 | "Thai text sets loose and upright" includes `.pf-read-avail` |
| 3 | "The hubs by keyboard" used `focus()` and `click()` | Real keys from a known start: `startAt` on the FAQ's heading, then Tab (Option+Tab in WebKit) to each question, polled with `toBeFocused()`, then Space and Enter; from the eyebrow, Tab to "ไทย", Enter, then the Thai URL | desktop Chromium and the WebKit phone |
| 4 | Printing a hub, or About, dropped the closed FAQ answers | `FaqList` (new, shared by the hubs and About) opens every closed answer on `beforeprint` and closes only those on `afterprint`; `::details-content { content-visibility: visible }` in print where the engine has it; `cutover.css` untouched | unit (`FaqList.test.tsx`); browser: `beforeprint` then every answer open, `afterprint` then as before, on two hubs and About |
| 5 | The FAQ's marks in forced colors | Not duplicated: Phase 6's review fixes carry it and arrive with the rebase. A check here would fail until then, so none was added | none (open item 5) |
| 6 | The `/stack` badge test passed on broken code | Every tool's badge is checked against `orbitRing()`, plus two that are not the violet fallback (Next.js ink, Expo coral) | unit |
| 7 | `/build`'s two-column span left a gap at 63.9375 to 64rem | `@media (37.5rem <= width < 64rem)`; the built CSS keeps the range | `lib/design/pagesHubs.test.ts` rejects `max-width` media features in the partial |
| 8 | `/learn`'s hub titles were h2 inside the h2 section "Read the hubs in" | h3, classes kept; smoke reads `h3[lang="th"]` | unit and smoke |
| 9 | `/proof`'s metric tiles lost the site's hand cursor (`cursor: pointer`) | The declaration is gone; the partial sets no cursor | browser: the metric and persona tiles' computed cursor holds `hand.svg`; `pagesHubs.test.ts` rejects any `cursor` |
| 10 | `--shadow-logo` and `--elev-logo` are now unused | Left in `globals.css`, as asked | open item 9 |
| 11 | The report: keyboard coverage, deviation 6, section 10 | The keyboard claim held only after fix 3 (section 4 now says how it is driven); deviation 6 names the layout's share panel; section 10 accounts for what was removed and restored, not only what was added | |

## 13. Brought onto `main` (19-11-26, the orchestrator)

The lane's eight commits were cherry-picked onto the cutover's tip, then
rebased onto `main` once PR #125 merged as `7d9b4b4`. They applied cleanly.

- **The filter classes (deviation 10, open item 9).** The cutover's last fix
  renamed the borrowed classes: `.pf-work__bar` is `.pf-filter-bar`,
  `.pf-work__filter` is `.pf-filter`, `.pf-work__option` is
  `.pf-filter__option` and `.pf-work__count` is `.pf-filter-bar__count`.
  The hub language switch, the library pages' filters, the reading header's
  spacing rule and the hubs' contrast check now use those names (`3c836a1`);
  with the old ones they matched no rule.
- **The Journey orbit flake (open item 10): a Safari bug, fixed.** An event
  log in the failing runs showed that no `pointerout` or `pointerleave`
  reached the orbit's stage after Play was pressed. The motion toggle swaps
  its icon (`Pause` for `Play`), so the hovered `<svg>` is removed, and macOS
  WebKit then loses the hover chain. The stage's Play flag (`data-play`) stuck,
  and neither hover nor keyboard focus held the ring again. The notebook's
  pause button swaps its icon the same way, and its hover hold would stick.
  Both icons are now `pointer-events: none` (`b0667a3`). The check failed
  5 of 6 runs alone on the WebKit phone before the fix and passed 8 of 8
  after; the Journey and shell specs pass on desktop, mobile and the WebKit
  phone (76 passed).
- **Gates on the combined tree** (the cutover's tip plus this lane, before the
  Safari fix): types, lint, format and knip clean; 163 files, 1,525 unit tests
  pass; build; budgets (entry 111.3 / 120 KB, stylesheets 35.2 / 37 KB,
  preloaded fonts 51.2 / 56 KB, worst route 197.1 / 200 KB); the browser gate
  on six projects, 1,002 passed with the one orbit failure above; parity, 137
  URLs with 0 differences.
- **Baselines.** The 40 interim baselines of these ten pages, rendered at the
  cutover with the new chrome around the old bodies, were removed, so CI
  writes them again in this PR.

## 14. CI on PR #126: one overflow at 344 px, fixed (19-11-26)

The first CI run wrote the 40 baselines and passed every live screenshot,
but one device-matrix check failed on both tries:
`/topics/erp-crm-internal-systems at 344px: 352px of content in a 344px
viewport`.

- **Cause.** The contact panel's pill ("Discuss your internal system") keeps
  one line (`white-space: nowrap`). On a 344 px phone it is wider than the
  panel. The closing grid (`.pf-hub-close`) had an implicit `auto` column,
  which took the pill's width as its minimum and pushed the panel and the
  links list beside it into the right gutter: 19 px on a Mac, still inside
  the screen, and 8 px past it in CI, whose Linux text is a little wider.
  The Thai AI hub had the same fault on a Mac (8.5 px into the gutter).
- **Fix (`9c56bd2`).** The hiring panel's pills may now wrap (`case.css`);
  a pill that fits keeps its single 44 px line. On a case page the pills
  measure the same as production (same position, width and height; the
  label's centre moves 0.005 px). The closing grid's column is
  `minmax(0, 1fr)`.
- **The check now sees this on any machine.** The hubs' device matrix flags a
  part that crosses its `.ds-wrap` padding into the side gutter (4 px allowed
  for a rotated mark's box). It failed on both pages against the old build on
  a Mac and passes after the fix. A run of 78 then showed 4 failures at
  344 px, all straight after the resize: Chromium can resolve `vw` units at
  the old width until its next frame (`--pad` read 72 px at 344 px). The check
  now waits two frames after each resize; 130 runs of 130 passed.
- **Second CI run (`9c56bd2`).** Only the 40 `writing actual` failures; the
  device matrix passed (539), the case pages' baselines among them. The 40
  renders were reviewed on contact sheets (all ten pages, both themes,
  desktop and mobile) and committed (`8d99d1c`).

## 15. Merged, deployed and checked live (19-11-26)

- **Merge.** Every GitHub check passed on `2e85313` (typecheck, lint, test
  and build; e2e-smoke; visual; parity; AccessLint). Cloudflare's Workers
  Builds check still failed at its start (0 s, the outage since 18-11-26),
  so PR #126 was admin-merged as `660af3e` and deployed by hand from a clean
  checkout of `main` (`fronk-ship-pr` section 7).
- **Production:** version `3a539856-6bb6-4afb-bb7c-cfff2122df73`. Rollback
  target: `26188e19-0161-4b3a-b759-024bedba0ca6` (the cutover,
  `wrangler rollback 26188e19-0161-4b3a-b759-024bedba0ca6`).
- **Live checks** on https://kunanonj.com:
  - The ten pages and `/`, `/about` answer 200, with `data-design="profile"`
    on the hubs and reading pages and the closing grid's new class
    (`pf-hub-close`) in the served HTML.
  - Smoke "recruiter path" (desktop): 62 passed.
  - The hubs' device matrix, gutter check included, against production:
    13 passed.
  - Speed probe (390 x 844, 4x CPU, about 1.6 Mbps, 150 ms RTT, cold cache),
    taken while the D2 browser gate ran on the same Mac, so total blocking
    time reads high on every page:

    | Page | LCP | CLS | TBT |
    |---|---|---|---|
    | `/topics/erp-crm-internal-systems` | 1,676 ms | 0 | 286 ms |
    | `/th/topics/ai-transformation-thailand` | 1,964 ms | 0.001 | 477 ms |
    | `/learn` | 1,716 ms | 0 | 410 ms |
    | `/stack` | 1,688 ms | 0 | 285 ms |
    | `/proof` | 1,564 ms | 0 | 304 ms |
    | `/` (for comparison, same run) | 1,820 ms | 0 | 273 ms |
    | `/about` (same run) | 1,740 ms | 0 | 260 ms |

    Under the same load a hub costs what the core pages cost. Phase 8
    (step 8d) measures again on an idle machine.
