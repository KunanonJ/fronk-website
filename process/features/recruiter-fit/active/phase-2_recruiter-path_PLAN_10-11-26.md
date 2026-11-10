# Phase 2: Recruiter path

**Status:** EXECUTED AND VERIFIED on the local production build (10-11-26).
In pull request #109 with Phase 1. UPDATE PROCESS has not run yet, so this
plan is still in `active/`. Report:
`../reports/phase-2_recruiter-path_REPORT_10-11-26.md`
**Created:** 10-11-26, at `6d31e16`
**Umbrella:** `recruiter-fit_UMBRELLA_PLAN_10-11-26.md`
**Research:** `../references/recruiter-ux-review_10-11-26.md` (findings 3, 4,
6, 8, 9, 11, 12 and 14)
**Design reference:** `process/features/tanstack-migration/references/phase-7_design-spec_09-11-26.md`
(sections 3.2 header, 3.6 chips, 4.1 Home, 4.3 Contact, 4.15 Topic)
**Report target:** `../reports/phase-2_recruiter-path_REPORT_{dd-mm-yy}.md`

## Objective

A recruiter who lands on Home, the FDE hub or a case study sees the role and
the availability at once, and reaches the résumé or a hiring contact in one
click.

## Dependencies

- **Phase 1 verified:** the résumé headline, the PDF and `/resume` are the
  targets of every new button.
- **Owner inputs:** O2 (ventures wording in the hero lead), O6 (recruiter
  facts), O8 (header) and O9 (hero wording). Each has a default.

## Owner answers (10-11-26)

- **Execution:** "ENTER EXECUTE MODE".
- **O9, hero:** Option B, "Forward deployed AI engineering from Bangkok."
- **O8, header:** yes, inline links at 1024 px and wider.
- **O6, recruiter facts:** not answered. Notice period and work authorization
  stay off the site.
- **O2, hero lead:** the lead shown with the chosen option names both
  ventures: "Also building GoGoCash and Manut AI."

## Lessons from Phase 1 that change this phase

- **Both languages.** The FDE hub has a Thai page,
  `/th/topics/forward-deployed-ai-engineering` (two sections, one FAQ, two
  related links). Phase 1's English-only search missed a stale date there.
  Every hub change in step 2d applies to it too, and every search for a
  string covers Thai.
- **Dates come from one place.** `lib/content/resumeFacts.test.ts` fails if a
  topic hub states a month and year that is not the current role's start.
- **Passing visual tests do not mean current baselines.** The suite tolerates
  1% of pixels. Re-render with `--update-snapshots=all`, compare bytes with
  the committed files, and copy back only the pages this phase changes. At
  `6d31e16`, 28 baselines already differed from a fresh render; this phase's
  header change re-renders every desktop baseline, which also clears that
  older drift on desktop.
- **The baseline container.** The host's `node_modules` are macOS builds. Copy
  the repo into `mcr.microsoft.com/playwright:v1.64.1-noble`, install and
  build there, and copy the changed PNGs back. Docker Desktop must be
  started first.
- **The résumé page** states the availability as a marked sentence. Step 2a's
  pill can replace it there.
- **An independent review before the commit** found seven issues the gates
  did not. Do the same for this phase.

## Owner decisions this phase revisits

Both were approved as canvas copy on 09-11-26, before the FDE positioning
decision of 10-11-26. This phase changes them only with the owner's approval
at the execution checkpoint.

- The Home h1 and its single "Contact me" button.
- The header: the K mark, the email and three icon buttons.

The footer and the intro overlay are not touched.

## Hero copy (O9): Option B chosen

Every phrase is already approved wording from `lib/content/identity.ts` or the
FDE hub. The owner may still edit the line in `lib/content/landing.ts`.

| Part | Option A (default) | Option B |
| --- | --- | --- |
| Line 1 | Hi, I'm [photo] Kunanon Jarat. | Hi, I'm [photo] Kunanon Jarat. |
| Line 2 | I build AI tools inside | Forward deployed AI engineering |
| Line 3, accent | the businesses that use them. | from Bangkok. |

Shared by both options:

- **Pill:** "Open to roles", then "Forward Deployed Engineer and AI
  engineering, Bangkok or remote", built from `OPEN_TO_ROLES`.
- **Lead:** "IT Manager & AI Engineering Lead at The Binary Holdings. Also
  building GoGoCash and Manut AI." (O2 default).
- **Buttons:** "Contact me" stays primary; "Résumé" is added as the secondary
  button.

## Work

| Step | Scope |
| --- | --- |
| 2a | **Home hero.** Role-first h1, the availability pill (give `LivePill` a label so it can say "Open to roles"), the new lead and the second button |
| 2b | **Header and menu.** Add a Résumé row to the site menu. Rename the "Skills" row to "Agent skills". At 1024 px and wider, show inline links (Work, Résumé, AI engineering) before the icon buttons, in a `nav` with its own label; the menu stays the full, crawlable navigation (O8) |
| 2c | **Home weighting.** Selected work takes the two-column slot and shows each project's category beside its tagline; Experience, Ventures, the Bangkok card and How I work take one column each. Point "See both ventures" at `/proof`, so it no longer links to its own card |
| 2d | **FDE hub, English and Thai.** Availability chip in the hero, a Résumé button beside Contact, and Résumé in "Keep exploring". For a four-section hub (the English one), lay the sections out as two equal pairs so no card is stretched by a longer neighbour |
| 2e | **Contact hiring path.** A typed `topic` search parameter, so `/contact?topic=hiring` opens with the Hiring chip pressed and a role-oriented prompt. Move "Hiring" to the front of the topic list. Add a "For recruiters" card with the availability line, time zone, the résumé and PDF links and LinkedIn. Point every recruiter button at `/contact?topic=hiring` |
| 2f | **Case studies and About.** A closing card on each portfolio project page with Résumé and Contact, above the previous and next links. On About, the availability chip in the hero, and the recruiter facts fill the empty "Let's talk" card |

## Touchpoints

Content:

- `lib/content/landing.ts` (`hero`, `primaryNav`, `siteMenu`)
- `lib/content/topics/pillars.ts` (FDE hub related links and button)
- `lib/content/contact.ts` (`CONTACT_TOPICS` order, prompt, recruiter card)
- `lib/content/aboutPage.ts` (hero chip, "Let's talk" card)
- `lib/content/freshness.ts`

Components and routes:

- `components/landing/home/HomeHero.tsx`, `HomeCards.tsx`
- `src/routes/_landing/index.tsx` (card order and spans)
- `components/bento/Chips.tsx` (`LivePill` label), `SiteHeader.tsx`,
  `SiteMenu.tsx`
- `components/landing/discovery/TopicHubPage.tsx`, `hubLayout.ts`
- `components/landing/contact/ContactForm.tsx`, `ContactCards.tsx`,
  `components/landing/ContactPage.tsx`, `src/routes/_landing/contact.tsx`
- `components/landing/portfolio/PortfolioProjectPage.tsx`
- `components/landing/about/AboutHero.tsx`, `AboutCards.tsx`

Tests:

- Update: `components/bento/SiteHeader.test.tsx`, `primitives.test.tsx`,
  `PlaceCard.test.tsx`, `components/landing/home/home.test.tsx`,
  `ContactPage.test.tsx`, `discovery/TopicHubPage.test.tsx`,
  `discovery/hubLayout.test.ts`, `portfolio/portfolio.test.tsx`,
  `about/AboutHero.test.tsx`, `AboutPageContent.test.tsx`,
  `tests/e2e/smoke.spec.ts` and `tests/e2e/routes.ts` where a heading
  pattern changes.
- References: `tests/fixtures/site-parity.json`, `src/ported-routes.json`,
  and the Linux baselines listed under the gates.

## Public Contracts

- **Menu labels:** a "Résumé" row is added and "Skills" becomes "Agent
  skills". The `/skills` URL does not change.
- **`/contact?topic=`** is a new optional search parameter. An unknown value
  falls back to no selection, without an error.
- **`CONTACT_TOPICS`** keeps its members; only the order changes. The API
  whitelist in `src/server/api/contact.ts` reads the same list.
- **Home h1** changes, so the smoke heading pattern and the parity reference
  change by design. The page title and meta description do not change.
- **Header DOM:** one more `nav` landmark at desktop width.

## Blast Radius

- **Every page** at desktop width, through the header. All desktop baselines
  change, in both themes.
- **Pages with content changes:** Home, About, Contact, the FDE hub and the
  four portfolio project pages, at both viewports.
- **Only the FDE hub** has four sections, so the pair layout changes no other
  hub. A test must prove the other hubs' spans are unchanged.
- **Accessibility:** two `nav` landmarks need distinct labels; the pill's
  label change must still be read; focus order in the header.
- **First-load budget:** a few links and one search schema. Expected to stay
  under the 200 KB and 255 KB limits.

## Validation gates

1. `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, `pnpm knip`, `pnpm test`.
2. `pnpm build`, then `pnpm perf:budget`.
3. Smoke and axe at desktop in both themes, and the full `smoke.spec.ts` once
   before any push (a lesson from the Phase 7 report: the local gates filter
   smoke tests by route name).
4. **Visual.** Re-render every baseline in the pinned Playwright image with
   `--update-snapshots=all`. Copy back every desktop baseline, and the mobile
   baselines for Home, About, Contact, the FDE hub and the portfolio project
   pages. Review the images for the changed pages, and report any other
   mobile baseline whose bytes differ.
5. **Parity.** Re-crawl the reference and get 0 differences from
   `node scripts/start-gates.mjs --parity-only`.
6. **Acceptance checks**, as Playwright assertions where they can be:
   - at 375 x 812 and at 1440 x 900, Home shows the role line, the pill and
     both buttons without scrolling;
   - from every route in `tests/e2e/routes.ts`, `/resume` is one click away
     at desktop width, and two (menu, then row) on mobile;
   - `/contact?topic=hiring` renders the Hiring chip pressed;
   - on the FDE hub at 1440 px, no section card has more than 120 px between
     its kicker and its number;
   - the Thai FDE hub shows the availability chip and the Résumé button;
   - "See both ventures" does not link to an element on the same card.

## Verification Evidence

Final run, after the pre-merge review fixes (10-11-26), on Node 26 and on
Node 22.23.4. Details and deviations are in the report.

| Gate | Command or check | Result |
| --- | --- | --- |
| 1 | typecheck, lint, format, knip, unit tests | Pass: 102 files, 847 tests |
| 2 | build, first-load budget | Pass: worst route 186.5 KB of 200 KB; entry chunk 107.5 KB of 120 KB |
| 3 | smoke and axe; full smoke once | Pass: 153 tests, desktop project, both themes; also in CI mode |
| 4 | Linux baselines regenerated and reviewed | Pass: 62 differ from `main` (54 refreshed, 8 added for the résumé and the Thai FDE hub). A compare-only run passes 96 of 96. Nine other mobile baselines differ in bytes; all predate this phase |
| 5 | parity re-crawl and 0 differences | Pass: 132 URLs, 0 differences; three reference fields changed (the Home h1, the `/resume` share tags, the About FAQ JSON-LD) |
| 6 | acceptance checks | Pass: all six, as tests in `tests/e2e/smoke.spec.ts`; the mobile check covers all 24 routes with a header |
| Regression | Phase 1: the PDF text-layer read-back (recipe in the Phase 1 report) and `lib/content/resumeFacts.test.ts` | Pass: a fresh PDF matches the committed one (2 pages, 844 words, 6 links); fact tests in the unit run |
| Review | One reviewer before the commit; then six lenses and three skeptics on the whole branch before the pull request | No blocker stood once the CV was read. 58 findings on the branch: 46 confirmed, 23 of them older than it. Fifteen fixed here, the rest recorded in the report. Eighteen deliberate breaks each failed a unit test |

## Blockers that justify BLOCKED

- The owner declines both hero options and gives no replacement.
- The inline header links cannot fit beside the email at 1024 px without
  wrapping. Fall back to the menu row and record it.
- An axe failure in either theme that needs a design-system change.

## Out of scope and follow-ups

- The principle texts in "How I work" (shared with About and the operating
  model). Candidate for `../backlog/`.
- The third-person voice of the hub and the FAQ, and the doubled introduction
  on About: they serve answer engines and stay.
- Notice period and work authorization appear only once the owner supplies
  them (O6).

## Resume and Execution Handoff

- **Execute anchor:** this file. Supporting context: the umbrella plan, the
  research file, the design spec sections above and the Phase 1 report.
- **Order:** 2a and 2b first, because every other step links to what they
  add. 2c to 2f are independent of each other.
- **At the execution checkpoint,** show the owner the hero options and the
  header change, and take O6, O8 and O9.
- **Close out** with the report, a commit recommendation, then UPDATE PROCESS
  before Phase 3.
