# Phase 1 report: Shell (pill nav, Say hello, theme, phone menu, footer)

**Plan:** `../active/phase-1_shell_PLAN_18-11-26.md`
**Date:** 18-11-26, on `feat/profile-site-redesign` at `52e5685` plus the
uncommitted Phase 1 tree. Nothing is committed, pushed or deployed.
**Tree:** sha256 of the sorted modified and untracked code files (39 files), excluding this report and the plan: `6ef6b7dc0a754046`.
**Harness:** `.claude/agents/`, `.claude/skills/` and `process/context/` are
missing. The phase ran alone in one worktree from the shared brief, under the
Harness-Absent Fallback.
**Status:** CODE DONE (18-11-26). Visual baselines are not rendered here (the
orchestrator batches them, see open items 1 and 2).

## 1. Research answers (the plan's "Research first")

- **Popover API:** verified in desktop Chromium and the WebKit phone project.
  Say hello and the phone menu open and close on Escape with JavaScript
  disabled (light dismiss with JavaScript off is not separately tested) (`profile-shell.spec.ts`, "with JavaScript off"). Firefox
  is not installed on this machine, so Firefox was not run.
- **Landmarks and ids:** `nav "Site"` with `id="site-menu"` keeps its name and
  id as a popover; the tests find it by role and name.
- **Focus on light dismiss:** Escape returns focus to the trigger. An outside
  click leaves focus where the reader put it (deviation 5).
- **Hide on scroll with an open popover:** the bar never hides while a popover
  is open (a script check on `:popover-open`) or while focus is inside it (CSS
  `:focus-within`). Both are tested.
- **`scrollIntoView({ block: "nearest" })` and `scroll-padding-top`:** honoured
  in Chromium and WebKit. The tap-area checks at 320 and 390 px scroll each
  target into view, and none is covered by the bar with the menu or the popover
  open.

## 2. What was built (by plan step)

| Step | Files | What |
| --- | --- | --- |
| 1a Pill nav | `components/profile/site/SiteNav.tsx`, `navAway.ts`, `scrollspy.ts`, `ThemeToggle.tsx` | `header[data-site-chrome][lang="en"]`, fixed at `--bar-top`, 48 px row, `pointer-events` on children only. Left pill: avatar, name (first name under 640 px, surname kept in the accessible name), Primary links at 810 px and up, Menu under 810. Right: theme toggle (48 px, from 810) and Say hello. Sliding `.pf-nav__active` pill (transform and width .28 s, opacity only under reduced motion). Home scrollspy with `rootMargin` `-20% 0px -60% 0px`; `aria-current="page"` elsewhere. Hide on scroll: `navAway` records a position after 6 px, hides past 24 px down, shows 6 px up; CSS handles opacity, blur and offset. |
| 1b Anchors | `src/styles/profile/shell.css` | `scroll-padding-top: 96px` and the per-target `scroll-margin-top` values of spec 4.3 (`#work`, `#about` at -128 px and -176 px from 810, `#journey`, `#ventures`, `#story`, `#ch-*`), all inside the `[data-design="profile"]` scope. No second smooth-scroll rule (smooth scrolling is set once in `globals.css`). |
| 1c Say hello | `SayHello.tsx`, `popover.ts` | Native `popover="auto"` with `popovertarget`, `role="dialog"` named "Email Kunanon Jarat", width `min(300px, 100vw - 32px)`, radius 20, `elev-pop`, dither foot. Mono label, the address from `site.email`, then Copy email (rendered after hydration only), Compose in Gmail (new tab, announced), Open your mail app (`mailto:`), Use the contact form (`/contact`). Script adds `aria-expanded`, the copy action with a polite live region, focus on the first row, and focus back on Escape. Footer instance opens above its trigger with anchor positioning where supported, else fixed at the bottom centre. |
| 1d Theme | `ThemeToggle.tsx`, `ThemeSwitch.tsx`, `themeTransition.ts` | next-themes unchanged (`.dark` on `<html>`, `localStorage["theme"]`, light default, system ignored, R20). Moon and sun cross-fade, hover and press states. Switch runs as a View Transition (type `theme`, `kj-vt` class for engines without types) fading the new theme in over .56 s, with a `theme-switching` class that stops transitions for two frames. No transition under reduced motion or without the API. The live circular reveal and the theme-color metas are untouched. |
| 1e Phone menu | `PhoneMenu.tsx` | Under 810 px: "Menu" text button (names "Open menu" and "Close menu", `aria-expanded`, `aria-controls="site-menu"`, `popovertarget`). Card `nav#site-menu[aria-label="Site"]` with six links (Work, About, Journey, Résumé, AI engineering, Contact) and the theme switch: native radios in a fieldset with a legend "Theme". Focus moves to the first link; Escape and an outside press close it; a link closes it. Enters with opacity and a 16 px drop over .22 s. |
| 1f Footer | `SiteFooter.tsx`, `PixelArt.tsx` | `footer[data-site-chrome][lang="en"]`. Sheet gradient with a dither field over the lower 60%. Mono eyebrow, `t-footer` headline and two paragraphs (drafts, section 7), Say hello, all revealed with `Reveal` (12 px rise). Card: name, "Open to roles" with the static dot, "Bangkok, GMT+7"; Pages from `siteMenu` (the 13 pages of spec 7.7, read from content); Elsewhere (X, LinkedIn, GitHub, `rel="noopener"`, "(opens in a new tab)"); For agents (`footerAgents`). Copyright from the year. Two pixel drawings (browser with cursor, phone) code-drawn from token-coloured squares, `aria-hidden`, shown from 1280 px. |
| 1g Preview Home | `components/profile/preview/PreviewHome.tsx`, `PreviewLayout.tsx` | Chrome around the page. Home keeps its h1 ("Profile preview"). Empty, labelled `#work`, `#about`, `#journey` sections, 120svh tall, so the scrollspy and the anchors can be tested. Each block has a `{/* Phase N: ... */}` comment and blank lines around it, and one import per line. |
| Structure | `src/styles/profile.css`, `src/styles/profile/{shell,home-hero,home-work-about,home-journey,case}.css`, `src/routes/preview/route.tsx` | `profile.css` opens with `@layer theme, base, components, utilities;` and imports the five partials in order. Only `shell.css` has rules; the other four are one-line headers for Phases 2 to 5. The route links `profile.css` from its head with a `?url` import. |
| Content | `lib/content/profileChrome.ts` | Base path (`PROFILE_BASE`, one value for Phase 6), `homeHref`, the nav and menu lists (AI engineering and Contact read from `siteMenu`), footer pages, brand, availability, popover and theme and menu strings, and the draft footer copy. |
| Tests | see section 3 | Unit tests for the pure helpers, the content module and every chrome component (`*.test.ts(x)`), guards in `lib/design/globals.test.ts`, browser checks in `tests/e2e/profile-shell.spec.ts`, best-practice checks extended to `/preview` in `tests/e2e/profile.spec.ts`. |
| Config | `playwright.config.ts`, `.github/workflows/ci.yml`, `tests/e2e/routes.ts` | Device-matrix `testMatch` widened to `/profile(-[a-z-]+)?\.spec\.ts$/`; the CI profile step runs `tests/e2e/profile` and uploads `tests/e2e/profile*.spec.ts-snapshots/`; `/preview` joins `PREVIEW_ROUTES` (smoke, axe with WCAG 2.2, the device matrix). |

Unchanged, as the blast radius requires: `components/ThemeToggle.tsx`,
`components/bento/SiteHeader.tsx`, `SiteMenu.tsx`, `SiteFooter.tsx`,
`components/landing/LandingLayout.tsx`, `src/routes/__root.tsx`,
`lib/content/landing.ts`, `lib/content/contact.ts`, `tests/fixtures/site-parity.json`,
and every snapshot under `tests/e2e/`.

## 3. Gates

| # | Command | Result |
| --- | --- | --- |
| 1 | `pnpm typecheck` | pass |
| 1 | `pnpm lint` (`--max-warnings=0`) | pass, 0 warnings |
| 1 | `pnpm format:check` | pass (touched files formatted with `prettier --write`) |
| 1 | `pnpm knip` | pass |
| 1 | `pnpm test` | 130 files, 1267 tests pass (Phase 0: 1209) |
| 1 | `pnpm build` | pass |
| 1 | `pnpm perf:budget` | pass: entry chunk 108.3 / 120 KB (was 108.2, deviation 14); stylesheets 20.2 / 22 KB (worst prerendered page); preloaded fonts 51.2 / 56 KB |
| 2 | `pnpm exec vitest run components/profile lib/content/profileChrome.test.ts lib/design/globals.test.ts` | pass (inside the full run above) |
| 3 | Preview budget, measured by hand (previews are not prerendered, so `perf:budget` does not see them) | `/preview` 152.2 KB JS gzip, `/preview/system` 158.1 KB, both under the 200 KB marketing budget |
| 4 | Browser gate: `PORT=4310 PLAYWRIGHT_WEB_SERVER="pnpm start" pnpm exec playwright test smoke.spec.ts a11y.spec.ts tests/e2e/profile --project=desktop --project=mobile --project=fold-closed --project=fold-open --project=tablet-landscape --project=webkit-phone --grep-invert "matches its baseline" --workers=2` | 492 passed, 152 skipped by project scope, 0 failed, run before the last browser test (row 5) was added. Includes axe with `wcag22aa` on `/preview` in both themes |
| 5 | `profile-shell.spec.ts`, repeated: `--project=desktop --project=webkit-phone --repeat-each=2` | 68 passed, 12 skipped by project scope, 0 failed |
| 6 | Parity: `GATES_PORT=4273 node scripts/start-gates.mjs --parity-only` | 137 URLs compared, 0 differences |
| 7 | Layer check (`profile-shell.spec.ts`, "layer order") | a `pf-` component rule sets a list's margin over the base reset (12 px), and the `hidden` utility beats the component's display |
| 8 | Stylesheet emission | `dist/client/assets/profile-*.css` is emitted at 13.47 KB raw, 3.30 KB gzip. No prerendered HTML links it; `/` does not, `/preview` does (checked in the browser spec) |
| 9 | Guards (`lib/design/globals.test.ts`) | motion (no animation or movement transition outside no-preference, in every profile sheet), `kj-` keyframes, no raw hex, plain CSS only, layer order and partial headers, and a fixture that the motion guard must fail on |

Browser checks in `profile-shell.spec.ts` (desktop Chromium and the WebKit phone; the device matrix, the tap areas, the layer check and the stylesheet link run in desktop Chromium only): the bar's position and row; anchors land below the bar; the scrollspy
and the sliding pill; hide on scroll down and show 6 px up; focus keeps the bar
in view; the bar stays in view while a popover is open; the phone menu opens,
puts six links in view, moves focus, closes on Escape and on a link; the phone
switch takes the arrow keys; Say hello opens its four actions by keyboard
(Tab order walked in Chromium); outside click closes it; the footer popover
opens above its trigger (Chromium); the nav toggle switches and keeps the theme;
the stylesheet is linked on `/preview` only; reduced motion (no transform or
blur, no view transition); links, Say hello and the phone menu with JavaScript
off; the device matrix at 344, 390, 820, 882, 1180 and 1440 px (no sideways
scroll, one row, the round Say hello under 370 px); tap areas at 320 and 390 px
with the bar, the menu and the popover open (no target under 24 px, none
overlapping, none covered). Best-practice checks in `profile.spec.ts` now run on
`/preview` as well as `/preview/system`: forced colours (the rings keep an edge,
pixel art hides), text spacing, 200% zoom and 500% text doubling, more contrast,
request origins, and reveal and print of blocks not yet seen.

Screenshots for review were taken in scratch space and were not committed (not
baselines). Desktop and phone, light and dark, the open popover and menu, and the
footer were checked by eye against spec 7.

## 4. Visual baselines (not rendered here)

- New: `/preview` in both themes and both viewports (plan gate 6). The orchestrator renders them in the pinned image.
- Changed: `/preview/system` (the chrome replaces the stand-in bar), in
  `visual.spec.ts` and the three `profile.spec.ts` matrix checks. Re-render
  them with the new baselines.
- Unchanged: all 96 existing baselines. No snapshot file changed in this tree.

## 5. Deviations, with reasons

1. **Browser checks in a new spec, not in `smoke.spec.ts`.** The brief directs
   `tests/e2e/profile-shell.spec.ts`. `smoke.spec.ts` is untouched; it reaches
   `/preview` through `PREVIEW_ROUTES`.
2. **Theme fade rules are unlayered.** The live site's circular reveal
   (`html:active-view-transition-type(theme)` in `globals.css`) is unlayered, so
   a layered rule would lose to it whatever its specificity. The two preview rules
   (end of `shell.css`) are more specific and match only `[data-design="profile"]`.
   Each is commented.
3. **Component folder.** `ThemeSwitch` and `ThemeToggle` sit in
   `components/profile/site/`, following the brief's folder rule. The design
   system's README names `components/ds/ThemeSwitch.tsx`.
4. **Script fallback for engines without the Popover API.** The umbrella requires
   a fallback for newer features, and Phase 0 kept the scripted fallback the design
   system names. The panel is hidden with `hidden`, and the invoker toggles it;
   Escape and an outside press close it. Older phones are not browser-tested.
5. **Outside click does not return focus to the trigger.** Spec 7.4 names both
   Escape and an outside click. Returning focus after an outside click would move
   it away from where the reader clicked. Escape does return it.
6. **`navAway(state, y)` takes `{ lastY, away }`.** The away flag must carry from
   one scroll event to the next; the thresholds are as specified.
7. **Phone menu rows are a list (`ul`).** The plan does not say; the list gives
   the six links their count and order for assistive technology.
8. **Keyboard order is walked in Chromium only.** Safari's default tab model
   skips links, so WebKit checks that the first row takes focus when the popover
   opens.
9. **Footer Pages lists "Contact me".** That is `siteMenu.cta`'s label, read from
   content. Spec 7.7 writes "Contact". The phone menu's sixth link is "Contact".
10. **`main` clears the bar with `padding-top: var(--nav-h)`** on preview pages.
    The plan does not name it; without it the first block sits under the bar.
11. **`aria-current="page"` for Work on case pages is defined now** (`/preview/portfolio/`,
    `/preview/ventures/`). No case page exists until Phase 5.
12. **Footer illustrations have no one-time reveal animation.** Spec 7.7 mentions
    one; plan step 1f does not. Not built (open item 5).
13. **`popoverTarget` renders in camelCase in the server HTML** (React passes the
    prop through, and HTML parsing lowercases the attribute). Behaviour is the same;
    the tests match case-insensitively.
14. **Entry chunk grew by about 0.1 KB** (108.2 to 108.3 KB). The cause is the
    `profile.css` URL in the preview route's head, which the brief asks for; the
    route tree is part of the entry chunk. No chrome code is in the entry (checked
    by searching the built entry for the chrome's identifiers).
15. **Preview copy is not for approval.** The placeholder lines on `/preview`
    ("Profile preview", the lead, "Phase N" labels) are preview-only and go with
    the previews in Phase 6.

## 6. Owner inputs used and their defaults

| Input | Default used | Where |
| --- | --- | --- |
| R1 nav links | Work, About, Journey, Résumé in the pill; AI engineering and Contact in the phone menu and footer | `lib/content/profileChrome.ts`, `SiteNav.tsx`, `PhoneMenu.tsx` |
| R2 share in the nav | No share button in the nav | `SiteNav.tsx` |
| R3 footer copy | Drafted (section 7), awaiting line-by-line approval | `lib/content/profileChrome.ts` |
| R15 Lenis | No; native smooth scrolling (set once in `globals.css`) | `shell.css` scroll rules |
| R20 system theme | Light stays the default; the system setting is ignored; a stored choice wins | `__root.tsx` unchanged (`enableSystem={false}`) |

## 7. Draft copy awaiting approval

Every line below is a draft (umbrella R3). Each is drafted from cleared copy
(`place.body` and `OPEN_TO_ROLES.sentence` in `lib/content`), in the first
person, with no figure or claim the content does not already carry. Each is
marked DRAFT in `lib/content/profileChrome.ts`.

- Footer eyebrow: "Get in touch"
- Footer headline: "Building something in AI or ops? Let’s talk."
- Footer paragraph 1: "I build fintech and AI operator systems from Bangkok, for Thailand and SEA: AI transformation, ERP/CRM, internal systems and tech startups."
- Footer paragraph 2 (emphasised, last line): "I’m open to Forward Deployed Engineer and AI engineering roles, based in Bangkok or remote."
- Say hello popover label: "Email" (plan step 1c; spec 15.1 lists the popover label as owner input)

Also for approval, as microcopy the plan names: "Compose in Gmail", "Open your mail app",
"Use the contact form", "Menu" and "Close". The repo's strings are used for
"Copy email", "Copied", "Say hello", "Open to roles" and "Bangkok, GMT+7".

## 8. Open items

1. **Visual baselines (orchestrator).** Render `/preview` (top and footer, light
   and dark, mobile and desktop) and re-render `/preview/system` and its three
   matrix baselines in the pinned image. Until then `visual.spec.ts` fails on
   `/preview`, and the `/preview/system` baselines differ.
2. **Owner approval of the draft copy** (section 7) before Phase 6.
3. **Firefox.** Not installed here. Popover, hide on scroll and anchors are
   unverified there.
4. **Preview stylesheet weight.** `/preview` loads 23.5 KB of CSS gzip (globals
   20.2 KB, fonts, `profile.css` 3.3 KB). The 22 KB ratchet covers prerendered
   pages only, so `perf:budget` does not see this. Phase 6 removes the split.
5. **Footer illustration reveal** (spec 7.7, deviation 12) is not built.
6. **Umbrella status.** The umbrella's phase table still reads PLANNED for
   Phase 1; the orchestrator updates it.
7. **Print.** The résumé PDF (`pnpm pdf`) was not run. No print rule changed,
   and the new chrome carries `data-site-chrome`, which the existing print rule
   hides.
