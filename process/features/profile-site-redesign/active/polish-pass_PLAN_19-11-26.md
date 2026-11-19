# Polish pass: interaction and finish (19-11-26)

Status: EXECUTE (approved by the owner 19-11-26: "Yes, build it all")
Feature: profile-site-redesign
Source: `references/premium-interactions_RESEARCH_19-11-26.md`, items F1-F8
(the "fix first" list), plus a pill bug found while planning.

## Objective

Remove what makes the site read as unfinished, without changing its mood: page
changes that double-expose, hovers that do nothing, filters that snap, overlays
that snap shut, no feedback while a page loads, dead space on Home, one muddy
dark material, and a GitHub card that looks unfinished. Calm, exact, CSS-first.

## Work

| # | Change | Touchpoints |
|---|---|---|
| F1 | Page changes start at the top: the router's scroll reset runs instant, so the 0.28 s cross-fade no longer double-exposes while the page glides up. In-page anchors keep `scroll-behavior: smooth`. | `src/router.tsx` (`scrollRestorationBehavior: "instant"`) |
| P0 | Ghost pills show their 0.97 press (the hover lift overrode it). | `src/styles/globals.css:1526` (`:hover:not(:active)`) |
| F2a | One hover and press for controls: `.ds-press` (paper-2 fill and ink text on fine-pointer hover, 0.97 press, optional 1 px lift; selected and pressed states excluded). | `globals.css` (new primitive, unlayered beside the Pill), class added in `ToggleGroup.tsx:42`, `library/parts.tsx:103`, `WorkIndexPage.tsx:130`, `SkillsCatalog.tsx:80`, `InstallTabs.tsx:81`, `ContactForm.tsx:413`, `SharePill.tsx:29`, `BlogIndexPage.tsx:183` |
| F2b | Skill cards and blog rows link by their title with the existing `ds-stretch` pattern (one link per card, card focus ring, accent ring and 1 px lift on hover, arrow nudge, 0.985 press via `:has(.ds-stretch:active)` so secondary actions don't shrink the card). Blog rows stop wrapping the whole row in one link (its name was the entire row text). | `components/landing/skills/SkillCard.tsx:22-56`, `components/landing/blog/BlogParts.tsx:48-90`, `pages-catalog.css` |
| F3 | Filters move their cards: `FILTER_NAVIGATION.viewTransition` becomes a getter giving `{ types: ["filter"] }` where view-transition types are supported and motion is allowed (else no transition, as today). Cards get explicit names (`--vt` from the slug) only during a filter transition; the pressed option morphs; the root does not cross-fade; the nav keeps its own layer. Blog search keystrokes (`q`) stay without a transition. | `src/lib/filterParam.ts`, `WorkIndexPage.tsx:142`, `SkillCard.tsx:23`, `SkillsCatalog.tsx:95`, `BlogIndexPage.tsx:334`, `src/routes/_landing/blog/index.tsx:28-41`, `globals.css` (new block after the theme fade, `kj-filter-in/out`) |
| F4 | One popover motion with exits: Say hello and the phone menu share `translateY(-6px) scale(.97)`, 0.2 s in and 0.14 s out (`overlay` + `display` `allow-discrete`, Chromium; other engines close instantly). The share panel's entrance moves from the old 0.42 s blurred `kj-pop` to the same motion via `@starting-style`; its exit stays instant (it unmounts). | `src/styles/profile/shell.css:823-842` (motion block), `globals.css:445-463`, `lib/design/globals.test.ts:242` |
| F5 | A 2 px accent hairline at the top when a navigation is pending for more than 150 ms (pure CSS delay; grows to 90% while pending; a static line under reduced motion; `Highlight` in forced colours). | `lib/router/navigation.ts` (`useNavigationPending`), `components/profile/site/NavProgress.tsx` (new), `components/landing/LandingLayout.tsx:30`, `shell.css`, `vitest.setup.ts` (mock) |
| F6 | Home closes the gap before the footer while the notebook is hidden: `.pf-journey:last-child .pf-story { padding-block-end: 48px }` (about 340-400 px down to 185-250 px). | `src/styles/profile/home-journey.css` |
| F7 | The hue-79 material stops reading olive in dark: `--material-79-a: oklch(0.28 0.04 50)` (copper, #392316), `--material-79-b: oklch(0.215 0.055 25)` (ember, #2e0d0c), both in sRGB. Light is unchanged. Contrast stays above the floors (ink 12.79/15.47, ink-60 5.54/6.11). | `globals.css:782-783`, design spec 2.4 table |
| F8 | The GitHub year fills its tile (fluid square cells, 528 px minimum, about 17-19 px cells on desktop; phones unchanged and scrollable) and fills in week by week once on reveal (motion allowed only; under reduced motion it is simply there). | `components/landing/ContributionActivity.tsx:74-99` |

Not in this pass: the share panel exit (needs a mounted closing state that the
unit tests would have to learn), the "Optional later" filter lists (/stack,
/build, /examples), anything from the research's premium list beyond F1-F8.

## Public Contracts

- No URL, content, metadata or JSON-LD changes; parity stays 137/0 against the
  current reference.
- Blog rows: the link's name becomes the post title (was the whole row's text).
- Skill cards: the whole card opens the skill page; Copy and ZIP stay separate.
- Dark hue-79 material changes colour (tokens only).

## Blast Radius

Every page's CSS (one shared bundle), the router's scroll reset on every
navigation, nine filter routes, the site shell (progress line, popovers), Home's
footer gap, /about's GitHub card, and the dark hue-79 surfaces (Home work stack,
the ai-automation and two other case covers, the Home hero's mock frame).

## Constraints

- CSS budget: every page ships the same CSS, 33.8 / 36 KB gzip today; this pass
  adds about 1.0 KB (about 1.2 KB left). JS: about +0.2 KB on public pages
  (progress line), +0.1 KB on filter routes, +0.25 KB on /about.
- All transforms and animations inside `prefers-reduced-motion: no-preference`;
  hover transforms only for `(hover: hover) and (pointer: fine)`; keyframes named
  `kj-`; guard tests in `lib/design/globals.test.ts` and
  `lib/design/sharedPrimitives.test.ts` stay green.
- One pressed route filter per page (duplicate view-transition names abort a
  transition).

## Verification

- typecheck, lint, format, knip, unit tests (new: `useNavigationPending` mock,
  filter getter, NavProgress render, guard update), build, `perf:budget`
  (CSS under 36 KB), parity 137/0.
- Browser gate (smoke, axe, profile suite) with no new failures; a new e2e check
  that a filter click on /portfolio, /skills and /blog raises no page error.
- Frame recordings of a page change (no double exposure, scrollY 0 before the
  fade) and of a filter change (cards move), as for the audit.
- Visual baselines: regenerated in CI's Playwright image for the changed still
  states only: F6 (10: `preview-story-*` x6, `home-*` x4), F7 (about 9-11: dark
  Home, work, portfolio diagrams, maybe two hero previews), F8 (2:
  `about-*-desktop`). Each reviewed by eye before committing.
- Live checks after deploy.

## Commits

1. fix(motion): ghost pills show their press
2. feat(motion): one hover and press for filters, chips, venture rows and Share
3. feat(catalog): skill cards and blog rows link by their title
4. feat(motion): filters move their cards
5. feat(chrome): one popover motion with exits
6. feat(chrome): a hairline while a page loads
7. fix(motion): page changes start at the top
8. fix(home): close the gap before the footer without the notebook
9. fix(dark): a warm, clean hue-79 material
10. feat(about): the GitHub year fills its tile, filled in on reveal
11. test(visual): refresh the changed baselines

## Verification Evidence

- typecheck, lint, format, knip, 1,560 unit tests (new: the filter getter,
  NavProgress with the real router status, title links on skill cards and blog
  rows, the GitHub fill-in, popover-motion guards), build
- `perf:budget`: CSS 34.6 / 36 KB on every page (was 33.8); entry 108.1 / 120;
  worst route 194.3 / 200 (`/skills/*`); `/about` 177.8
- parity: 137 URLs, 0 differences
- browser (local preview): smoke + axe 257 passed (the first run caught the new
  skill-name links under 24 px at 320-390 px; fixed with a 24 px box and a
  negative margin); `tests/e2e/profile` on six projects 694 passed, 0 failed
  (baselines excluded on macOS); a new smoke test runs each filter's transition
  to `ready` with no page error (a duplicated name aborts it, checked)
- frames (scratchpad `polish-plan/`): a page change from /portfolio at 700 px
  starts at `scrollY` 0 and the case page fades in in place; filters on
  /portfolio, /skills and /blog move staying cards, fade leaving ones, and slide
  the pressed pill; the GitHub year is 8 px cells at 390, 16.6 px at 1280, 19 px
  capped from 1440, filling left to right
- visual baselines (CI run 44556280680, Playwright image): 12 changed and
  re-rendered: `preview-story-*` x6 (identical to the old ones row for row,
  80 or 128 px shorter), `home-*` x4 (identical to row 7,600, then the smaller
  gap; dark also the copper hue-79 card and the hero mock frame), `about-*-desktop`
  x2 (+89 px, the GitHub card). The first attempt is kept: the retry of
  home-desktop and about-dark caught the hero DitherField drawn, while every
  baseline has it undrawn (a race between its idle draw and the screenshot;
  on main a mismatch passes on CI's one retry)
- follow-up: make the dither deterministic in screenshots (hide `.ds-dither`
  in the visual specs, or wait for its draw), so a retry cannot mask a real diff
- deviations: the skill name is the card's one link ("Details" became a cue);
  the GitHub grid's styles moved to `.pf-activity*` in `cutover.css`; there is no
  site-wide motion switch, so the filter checks reduced motion only

## Resume and Execution Handoff

Branch `feat/polish-pass` off `main` at `0add090`. One PR, gates as for #133,
baselines from CI's visual job artifacts, squash-merge, live checks, cleanup.
