# Profile site redesign: umbrella plan

**Status:** PLANNED (18-11-26). The owner approved the program shape and four
design choices in the planning session. No phase is approved for execution:
Phase 0 needs its own "ENTER EXECUTE MODE".
**Created:** 18-11-26, at `563b2a3` on `feat/profile-site-redesign` (the same
commit as `main`).
**Owner goal:** "learn about this profile website https://www.tanvirux.com/
please plan to upgrade to this design and format in every details". The site
takes the reference's design language and page format, with the owner's own
content, facts and recruiter path.
**Research:** `../references/design-spec_18-11-26.md` (the target design,
written from the planning session's teardown of the reference) and
`../references/codebase-inventory_18-11-26.md` (the repo before the redesign).
**Design system:** https://claude.ai/artifact/3KT7Wet8Goh1q8MF2sqaQG (private
to the owner): tokens, type, 27 components with guidelines, icons, and the
Layout, Motion, Accessibility and Engineering rules. It leads until Phase 0
lands; then the repo's CSS leads and the artifact is re-synced from it.
**Best practices:** `../references/best-practices-audit_18-11-26.md` maps
every practice to the phase that covers it; the fixes it lists are in these
plans.
**Protocol:** `process/development-protocols/phase-programs.md`. One phase at
a time, each through the 10-step loop.

## Program Goal Charter

North star:

- kunanonj.com looks, reads and moves like the reference portfolio: serif
  headlines over a clean grotesk, violet and coral on pastel washes, pixel
  dither fields, pill-shaped chrome, one long Home and a case-study template.
  Every fact, link and recruiter path the site has today still works.

Definition of done:

- Home is one long page in the reference's format: a fixed pill nav, a hero
  with a rotating serif headline and a Figma-style canvas of selected work, a
  logo strip, stacked case cards, an About bento, a Journey with a tool orbit
  and career records, a testimonial notebook (shown only with 3 or more
  cleared quotes) and the large footer.
- Every project at `/portfolio/<slug>` and venture at `/ventures/<slug>` uses
  the case-study template: pixel-sky hero, cover, meta row, chapters with a
  sticky contents rail, showcase tiles with a viewer, More work.
- Every other public page (About, Contact, the portfolio index, topic hubs in
  English and Thai, skills, learn, examples, stack, proof, build, résumé, 404,
  `/design`) uses the same tokens, type, chrome and primitives.
- Light and dark themes use the reference palette. Reduced motion turns every
  animation off. Thai text renders in Noto Sans Thai.
- Every page works across the device matrix of spec section 10.1: the Galaxy
  Z Fold closed (344) and open (882), phones from 360 to 430, tablets at 768,
  820 and 1024 in portrait and 1180 and 1366 in landscape, desktop, and
  dual-screen devices spanned across a hinge.
- The site meets WCAG 2.2 AA, holds up in forced-colors mode, with
  `prefers-contrast: more` and `prefers-reduced-transparency`, at 200% zoom
  and with WCAG text spacing, and meets the Core Web Vitals targets at the
  75th percentile: LCP 2.5 s or less, INP 200 ms or less, CLS 0.1 or less.
- No page makes a request to a new third party.
- The old bento design system (Geist, the owner palette of 09-11-26, the
  bento primitives) is gone, and the design guards pin the new system.

What "verified" means (program level):

- The CI gates pass on the local production build: typecheck, lint with 0
  warnings, format, knip, unit tests, build, first-load budgets, and smoke and
  axe in both themes.
- Linux visual baselines are regenerated in the pinned Playwright image
  (`mcr.microsoft.com/playwright:v1.64.1-noble`) for every page a phase
  changes, and each changed image is reviewed against the design spec.
- Phases 0 to 5 leave all 96 existing baselines and the parity reference
  unchanged: the live site does not move before Phase 6.
- The parity reference is re-crawled with `PARITY_SEEDS` whenever titles,
  h1s, meta, JSON-LD or text endpoints change by design, and added or removed
  URLs are counted.
- Tap areas, the 12 px text floor, the contrast pairs and the reduced-motion
  contract pass on every new surface.
- The best-practices checks pass on every new surface: axe with the
  `wcag22aa` tag, forced colors, text spacing, 200% zoom, `prefers-contrast`,
  request origins, and the WebKit phone project (audit sections 6, 10, 13
  and 14).
- Every new surface holds at the device matrix (no sideways scroll, nothing
  overlapping), with baselines at its anchors (344, 390, 820, 882, 1180 and
  1440 px wide) for Home and one case page, and the spanned dual-screen
  layout checked through Chromium's display-feature override.
- The phase report records commands, results, the tree's hash, and
  screenshots of each new surface beside the spec section it implements.
  "Verified" covers the local production build and the pull request's
  Cloudflare preview. The live site is checked after the owner merges, and
  that check is recorded separately.

Scope tiers to phase mapping:

- Tier 1, the design system and the chrome: Phases 0 and 1.
- Tier 2, the new Home: Phases 2, 3 and 4.
- Tier 3, the case-study template: Phase 5.
- Tier 4, go-live of the core pages: Phase 6.
- Tier 5, every remaining page: Phase 7.
- Tier 6, cleanup, guards and speed: Phase 8.
- This program retires Tiers 1 to 6.

Explicitly out of scope (deferred tier):

- Moving case studies to `/work/<slug>` or any other URL change. The blog and
  press stay hidden.
- New case studies, figures or claims beyond `lib/content/` and the owner's
  recorded answers.
- framer-motion, GSAP, Lenis and Rive. The reference uses them; the repo's
  rules and tests forbid them, and this program rebuilds their effects in CSS
  and small scripts (R15 can lift the Lenis ban).
- The printed résumé and `public/resume.pdf` layout. They stay plain.
- Sanity schema changes and off-site profiles.

Hard safety constraints (non-negotiable, per phase):

- **No copying.** Rebuild the reference's look from the design spec. Never
  copy its text, images, logos, icons, illustrations, animations or code.
  Never commit its screenshots or its owner's personal data: this repository
  is public.
- **Honesty and clearance.** No invented testimonial, figure, client, outcome
  or quote. A new figure or claim needs the owner's answer and an entry in the
  claim audits (`lib/content/portfolioOutcomes.test.ts`,
  `lib/content/ventureCase.test.ts`, `lib/content/resumeFacts.test.ts`).
  Code-drawn screens carry a visible "Illustration" label.
- **The live site moves only at Phase 6.** Phases 0 to 5 add code that only
  the `/preview/*` routes render: noindex and nofollow, disallowed in
  `robots.txt`, unlinked, out of the sitemap and the prerender. Existing
  routes, their HTML and their baselines stay the same.
- **No outward action without the owner asking:** no deploy, push or pull
  request. Every merge to `main` deploys production.
- **URLs stay.** No route is removed or redirected (`/portfolio/*`,
  `/ventures/*`, `/about`, `/contact`, `/skills/*`, `/topics/*`,
  `/th/topics/*`, `/blog`, `/press`). `/resume` stays noindex, `BLOG_PUBLIC`
  stays false, no page links `/blog` or `/press`, and the agent surfaces stay.
- **Accessibility floor:** WCAG 2.2 AA in both themes; tap areas of 24 px or
  more at 320, 344 and 390 px; no text under 12 px; the hero h1 never fades or
  hides; every animation off under reduced motion; a pause control on
  anything that moves for more than 5 s; focus never hidden under the fixed
  nav.
- **Privacy.** No phone number, CV file or local path enters the repo. No new
  third-party request: the only outside origins stay the analytics beacon and
  Turnstile on `/contact`, and a test enforces it from Phase 0.

## Owner decisions (18-11-26)

1. **Program shape.** "Answering approves this shape": the 9-phase program
   below, with Phases 0 to 5 behind `/preview/*` and the cutover in Phase 6.
   Approved by answering decisions 2 to 5.
2. **Palette.** "Reference violet + coral": the reference palette exactly,
   violet `#6e3cff` and coral `#ff7a3d` with their lavender and peach tints.
   It replaces the owner palette of 09-11-26 (Signal, Glaze, Paper, Ink,
   Clay, Ember).
3. **Hero mock.** "Figma-style canvas": the right half of the hero is a
   design-tool canvas showing the selected work, as in the reference.
4. **Case-study visuals.** "Mix (Recommended)": real screenshots where they
   can be shared, and code-drawn screens labelled as illustrations for
   internal tools.
5. **Testimonials.** "Build it, hide until real (Recommended)": the notebook
   is built and stays off until 3 or more real, owner-cleared recommendations
   exist.
6. **Intro.** Kept by default, stated with the plan shape and not objected
   to: the greeting intro of 12-11-26 plays first and hands over to the hero.
7. **Foldables and tablets.** "please make to support mobile responsive for
   fold mobile and tablet as well": every page works on foldable phones closed
   and open, on tablets in both orientations, and on dual-screen devices
   spanned across a hinge (spec section 10.1).
8. **Design canvas.** The owner reviewed the design canvas, private to the
   owner, and approved its direction ("this look awesome"):
   https://claude.ai/artifact/4i6ZJKTtsFXjbv5Lo2ihL3. Its frames cover desktop,
   phone, dark, Fold closed and open, and tablet portrait and landscape. The
   build follows the design spec; the canvas is the visual reference.
9. **Design system and best practices.** "also please prepare the design
   system and according to best practices as well. and make sure that our
   plan cover all things in best practices": the design system artifact
   (header) and the best-practices audit, whose fixes are written into these
   plans. Its rules bind every phase the way the spec does.

What these reverse, recorded so the guards can change with a reason:

- The floating pill nav retired on 09-11-26 (the phase 7 bento redesign)
  comes back, because the reference's chrome is a fixed pill nav.
- The font pin in `lib/design/globals.test.ts`, which bans Instrument Serif,
  gives way to Instrument Serif, Onest, JetBrains Mono and Patrick Hand,
  with Noto Sans Thai kept for Thai.
- The owner palette pinned in `lib/design/globals.test.ts` and mirrored in
  `lib/brand/tokens.ts` gives way to the reference palette.

## Open owner inputs

Each has a default, so no phase waits on a reply unless the table says so.
Ask at the phase's approval checkpoint and quote the lines that would ship.

| ID | Question | Default until answered | Needed before |
| --- | --- | --- | --- |
| R1 | Links in the nav pill | Work (`/#work`), About (`/#about`), Journey (`/#journey`), Résumé (`/resume`). AI engineering moves to the phone menu and the footer | Phase 1 |
| R2 | Share in the nav | No share button in the nav. The hero `SharePill` stays on case-study and hub pages | Phase 1 |
| R3 | Footer headline and its two short paragraphs | Drafted from cleared copy in Phase 1 and approved line by line | Phase 1 |
| R4 | Hero chips and buttons | Accent chip "Open to roles", plain chip "Bangkok or remote"; buttons "Contact me" (`/contact`) and "Résumé" (`/resume`) in the reference's pill styles | Phase 2 |
| R5 | Two alternate lines for the rotating headline | Drafted from cleared copy, such as an operating principle. None ships without approval; until then the line holds still | Phase 2 |
| R6 | Organisations in the logo strip | Employers in the résumé plus GoGoCash and Manut AI, set as typographic wordmarks. The owner may supply SVG wordmarks | Phase 2 |
| R7 | Cards in the work stack | TBH Intranet, AI Automation, Node Validator Automation, GoGoCash, Manut AI. The GoGoCash card carries `id="ventures"` | Phase 3 |
| R8 | Three figures for the stats tile | Only figures already cleared, such as "1,000 registered users". The tile shows fewer numbers rather than an uncleared one | Phase 3 |
| R9 | About, Journey and story copy: mess chips, closing line, Journey headline, story paragraphs, "Roles I'm open to" | Drafted from `lib/content/aboutPage.ts`, `availability.ts` and the résumé, approved line by line | Phases 3 and 4 |
| R10 | Real screenshots per project | Code-drawn illustrations, labelled. The owner adds redacted screenshots when ready (issue #44) | Any time |
| R11 | Testimonials | Hidden. The owner supplies 3 or more cleared quotes when ready | Any time |
| R12 | Case-study h1 | Today's text stays, "{name}. {tagline}", styled as the reference's title (the name as the display line, the tagline as a smaller line inside the h1), so parity holds (spec section 13, item 35). Option: the reference's name-only h1, which needs a deliberate parity re-crawl | Phase 5 |
| R13 | Recruiter-fit Phase 4 (the CV framing) | Execute it before Phase 3 starts, so the About copy, the venture pages and JSON-LD change once. **18-11-26: the default could not run.** That plan needs its own "ENTER EXECUTE MODE" and the owner's approval of its exact wording, so it stays in `process/features/recruiter-fit/active/`. The redesign renders the same content modules, so the CV framing can land before or after the cutover with no layout change | Phase 3 |
| R14 | The Bangkok card and live clock on Home | Retired with the old Home. The footer card carries "Bangkok, GMT+7" | Phase 6 |
| R15 | Lenis smooth scrolling | No: the test ban stays, and native smooth scrolling is used | Phase 1 |
| R16 | Target of the `/work` redirect | Keeps `/#ventures` (the SEO record). May move to `/#work` after Phase 6 | Phase 6 |
| R17 | Tests pinned to today's layout: recruiter path, case-study evidence, header geometry, share pill, menu names | Rewritten in Phase 6 to the same intent. The owner approves the list | Phase 6 |
| R18 | Icons in the Journey tool orbit | Our own pixel badges built from each tool's mono badge on `/stack`. Option: brand glyphs from the CC0 `simple-icons` data, rasterised to pixels, used only to name the tool | Phase 4 |
| R19 | Phone layouts: the reference's compact phone cards (chips and summaries hidden) differ from the owner preference "mobile as a miniature desktop" (AGENTS.md) | The reference's phone layouts, because the owner chose its format; confirm at the Phase 2 review | Phase 2 |
| R20 | Follow the reader's system theme on a first visit (`prefers-color-scheme`), the common practice, instead of always starting light | Light stays the default and the system setting stays ignored, as today's tests pin; a stored choice always wins | Phase 1 |
| R21 | A Content Security Policy for public pages (none today) | Phase 8 ships it report-only, with hashes for the inline theme and intro scripts and a test that fails on violations; enforcing it is a later decision | Phase 8 |
| R22 | How the redesign's success is measured | Compare 28 days before cutover with 28 days after: contact form sends, `/resume` views, case-study page views and Core Web Vitals. No click tracking is added | Phase 6 |

## Approach decisions

INNOVATE was folded into the planning session's recommendation and the
owner's answers. These are the choices it produced.

| Decision | Chosen | Rejected, and why |
| --- | --- | --- |
| How the work ships | Phases 0 to 5 merge to `main` behind hidden `/preview/*` routes; Phase 6 switches the real routes | A long-lived integration branch: CI runs only on pull requests to `main`, so its phases would merge unchecked, and the branch would drift. Shipping each phase live: the site would be half old and half new for weeks while recruiters visit |
| Where the new tokens live before cutover | One scoped block in `globals.css`, `[data-design="profile"]` and its dark form, which `__root.tsx` sets on `<html>` for the routes that have moved (spec section 2.13); the contrast test is extended to read it | New global names: the old and new sets collide on `--ink`, `--accent` and `--muted`. Changing `:root` early: every live page would move in Phase 0. A stylesheet per layout: two token sources to keep in step |
| Old pages at cutover | Pages opt in one family at a time: Home, the portfolio index, case pages, About and Contact at Phase 6, the rest in Phase 7. The new header and footer carry the attribute themselves, so every page gets the new chrome at Phase 6, and old bodies keep their old tokens (with a `var(--nav-h)` top offset) until Phase 7. Phase 8 folds the block into `:root` | Pointing the old role tokens at the new values at cutover: old 600-weight headings would turn into faux-bold Instrument Serif, and every long-tail baseline would change twice |
| Motion runtime | CSS keyframes and transitions, CSS `@property`, IntersectionObserver and small pointer handlers; code-drawn illustrations | framer-motion, GSAP, Lenis, Rive: banned by owner rules and tests, and the entry chunk has about 6 KB of headroom |
| Case-study URLs | Keep `/portfolio/<slug>` and `/ventures/<slug>` | `/work/<slug>`: about 184 code lines in 40 files and 25 test files change, and the SEO record says these URLs must not redirect |
| Hero headline | The owner's sentence stays the h1 text; its second half becomes the first phrase of the rotating line | The reference's headline pattern with new words: it fails the parity gate and the recruiter test, and drops owner decision O9 of 10-11-26 |
| Logo strip | Typographic wordmarks of real employers and ventures, labelled "Where I've worked" | The favicons in `public/brand/companies/` (32 to 128 px squares) read as blobs at 24 px in monochrome. A "clients" label: they are employers |
| Accessibility gaps in the reference | Fix them: meta text at 4.5:1, 12 px floor, 24 px tap areas, pause controls, a custom 404 | Copying them: the repo's tests fail on each |
| Component folders | `components/ds/` for primitives, `components/profile/{site,home,case}/` for the chrome and sections, the names the design system uses | `components/v2/`: a version name outlives the version and costs a rename of every import in Phase 8 |
| Say hello and the phone menu | The native `popover` attribute with `popovertarget`, so both work before hydration and without JavaScript; script adds copy, focus and `aria-expanded` | A script-only dialog: dead until hydration, which the 5.2 s intro and slow phones make visible |
| Type units | rem sizes; fluid sizes clamp between rem bounds with the largest at most 2.5 times the smallest, so 200% zoom doubles text | px sizes and a viewport-height cap without a floor: they ignore the reader's font size and barely grow with zoom |
| Browser support | Baseline widely available features without fallbacks; newer ones (popover, `@property`, view transition types, anchor positioning, viewport segments) only with a fallback | Requiring the newest features: older iPhones and Android phones would lose the chrome |
| Token source | `globals.css` holds the tokens; the design system mirrors them; `lib/brand/tokens.ts` is tested against them | A JSON token build: one consumer does not repay a build step and a generated stylesheet |

## Phases

| Phase | Plan | Depends on | Green proves | Status |
| --- | --- | --- | --- | --- |
| 0. Foundation | `phase-0_foundation_PLAN_18-11-26.md` | Owner decisions 2 and 6 | The new fonts, tokens and primitives render in both themes at `/preview/system`, pass contrast and axe, and every existing baseline stays the same | VERIFIED (18-11-26; report in `../reports/`) |
| 1. Shell | `phase-1_shell_PLAN_18-11-26.md` | Phase 0; R1, R2, R3, R15 | The fixed pill nav, Say hello popover, theme switch, phone menu and footer work by keyboard and touch in both themes, with tap areas and the entry-chunk budget intact | VERIFIED (18-11-26; reviewed and fixed; report in `../reports/`) |
| 2. Home hero | `phase-2_home-hero_PLAN_18-11-26.md` | Phase 1; R4, R5, R6, R19 | The hero and logo strip match the spec at 1280 and 390 in both themes; the recruiter facts stay above the fold and the h1 never fades | VERIFIED (18-11-26; parallel lane, reviewed and fixed; report in `../reports/`) |
| 3. Work and About | `phase-3_home-work-about_PLAN_18-11-26.md` | Phase 2; R7, R8, R9, R13 | The stacked case cards and the About bento work with motion on and off; `id="ventures"` and every case link resolve; the claim audits pass | VERIFIED (18-11-26; parallel lane, reviewed and fixed; report in `../reports/`) |
| 4. Journey and notes | `phase-4_home-journey-notes_PLAN_18-11-26.md` | Phase 3; R9, R11, R18 | The Journey orbit, story and records card render from content modules; the notebook works by keyboard and pointer and stays hidden below 3 cleared quotes | VERIFIED (18-11-26; parallel lane, reviewed and fixed; report in `../reports/`) |
| 5. Case-study template | `phase-5_case-study_PLAN_18-11-26.md` | Phase 1; R10, R12, R13 | All 5 projects and 2 ventures render in the template from today's content with nothing dropped; the rail, the viewer and the Hiring block work by keyboard | VERIFIED (18-11-26; parallel lane, reviewed and fixed; report in `../reports/`) |
| 6. Cutover | `phase-6_cutover_PLAN_18-11-26.md` | Phases 2 to 5; R14, R16, R17; the owner's go on the preview URL | Production serves the new Home, case studies, portfolio index, About and Contact; every other page gets the new chrome around its old body until Phase 7; parity, smoke, axe, budgets and all baselines are green | PLANNED |
| 7. Remaining pages | `phase-7_remaining-pages_PLAN_18-11-26.md` | Phase 6 | Topic hubs in English and Thai, skills, learn, examples, stack, proof, build, résumé, 404 and `/design` use the new layouts, and the Thai pages pass | PLANNED |
| 8. Cleanup and guards | `phase-8_cleanup_PLAN_18-11-26.md` | Phase 7 | No old design code or font remains; the guards pin the new system; share images and icons use it; the speed budget is met | PLANNED |

Phase 5 depends only on Phase 1, so it may run before or beside Phases 2 to 4
if the owner wants the case studies first.

## Touchpoints

Program level. Each phase plan lists its files.

- Styles and fonts: `src/styles/globals.css` (the scoped
  `[data-design="profile"]` token block, spec section 2.13),
  `src/styles/fonts.css`, `src/fonts/`.
- Routes: new `src/routes/preview/*` (Phases 0 to 5, deleted in Phase 6),
  `src/routes/__root.tsx`, `src/routes/_landing/*`,
  `src/routes/_system/design.tsx`, `lib/seo/robots.ts`, `vite.config.mts`
  (prerender exclusions).
- Components: new `components/ds/` (primitives) and `components/profile/`
  (site chrome, home, case), then
  `components/landing/*`, `components/bento/*`, `components/resume/*` and
  `components/system/*` as pages move.
- Content: `lib/content/landing.ts`, `portfolio.ts`, `ventures.ts`,
  `aboutPage.ts`, `availability.ts`, `contact.ts`, `stack.ts`,
  `stackIcons.ts`, `resumeTimeline.fallback.ts`, and new modules for the Home
  (working name `lib/content/home.ts`) and the testimonials
  (`lib/content/testimonials.ts`).
- Brand mirrors and SEO: `lib/brand/tokens.ts`, `lib/seo/rootMetadata.ts`
  (theme-color), `lib/og/*`, `src/server/og/*`, `lib/seo/manifest.ts`.
- Guards and tests: `lib/design/*.test.ts`,
  `tests/e2e/{routes.ts,smoke.spec.ts,a11y.spec.ts,visual.spec.ts}`, the
  Linux baselines, `tests/fixtures/site-parity.json`,
  `src/ported-routes.json`, `scripts/check-first-load-budget.mjs`.

## Public Contracts

- Phases 0 to 5 add `/preview`, `/preview/system`,
  `/preview/portfolio/<slug>` and `/preview/ventures/<slug>`: noindex and
  nofollow, disallowed in `robots.txt`, out of the sitemap, unlinked. Phase 6
  deletes them.
- No public URL is removed or redirected. `/work` keeps its 308 unless R16
  changes its target.
- Home's h1 text and accessible name stay "Hi, I'm Kunanon Jarat. Forward
  deployed AI engineering from Bangkok.", and `id="ventures"` stays on Home.
- h1s, titles, descriptions, canonicals, JSON-LD and the Markdown twins keep
  their content (R12 default). The intended parity changes at Phase 6 are
  head tags only (the theme-color metas, now `#f7f3ff` and `#0f0c18`, and
  font preloads) and the manifest colours. Share images change style in
  Phase 8.
- The theme stays in `localStorage["theme"]` with the `.dark` class on
  `<html>`, and light stays the default.

## Blast Radius

- Phases 0 to 5: new files and the preview routes. Shared files they touch
  (`globals.css`, `fonts.css`, the design guards, `robots.txt`, the prerender
  exclusions) must leave existing pages unchanged, proven by unchanged
  baselines and parity.
- Phase 6: the chrome on every page; tokens, fonts and layouts on Home, the
  portfolio index, case pages, About and Contact; all 96 baselines (the
  chrome changes everywhere); the parity reference (head tags, manifest); the
  smoke tests pinned to the old layout; the first-load budgets.
- Phase 7: hub, skills, library, résumé, 404 and `/design` pages and their
  baselines, including the Thai pages.
- Phase 8: deleted components and fonts (knip), share images and icons, the
  guards, the docs.

## Verification Evidence

Each phase writes `../reports/phase-N_{topic}_REPORT_{dd-mm-yy}.md` with its
commands, results, the tree's hash, regression checks, screenshots of each
new surface beside the spec section it implements, and deviations. None yet.

## Resume and Execution Handoff

- **Current state:** planned 18-11-26 at `563b2a3`. No code is written. The
  branch `feat/profile-site-redesign` holds only these process files. The
  design system artifact and the best-practices audit were added the same
  day; the audit's fixes are already in the phase plans and the spec.
- **Execute anchor:**
  `process/features/profile-site-redesign/active/phase-0_foundation_PLAN_18-11-26.md`.
- **Before EXECUTE of Phase 0:** re-read that plan, the design spec sections
  it names, and sections 1.3, 1.4, 3 and 8 of the inventory. Check drift
  since `563b2a3`; recruiter-fit Phase 4 may have merged.
- **Per phase:** the 10-step loop of `phase-programs.md`: research, approval,
  execute, validate, regression check, durable capture, commit, UPDATE
  PROCESS, move on.
- **Regression checks to carry forward:** the full baseline set and the
  parity gate (unchanged until Phase 6); the "recruiter path" and "case-study
  evidence" blocks of `tests/e2e/smoke.spec.ts`; the claim audits;
  `lib/design/*.test.ts`; the first-load budgets; `pnpm pdf` and its text
  read-back after anything that touches print styles; from Phase 0, the
  best-practices checks (axe `wcag22aa` on moved pages, forced colors, text
  spacing, 200% zoom, request origins, the CSS and font ratchets).
- **Merging deploys.** Cloudflare Workers Builds deploys `main` to
  production, and each pull request gets a preview URL in a bot comment.
  Review `/preview/*` there.
- **Reference material outside the repo.** The planning session's raw notes
  and screenshots of the reference are not committed (public repo,
  third-party content). The design spec carries what the phases need; look at
  the live reference again when a detail is unclear.
- **Harness:** `.claude/agents/`, `.claude/skills/` and `process/context/`
  were missing when this plan was written. Follow the Harness-Absent Fallback
  in `process/development-protocols/orchestration.md`, or reinstall the
  harness and run `vc-generate-context` first.
