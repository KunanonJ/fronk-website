# Phase 1: Shell (pill nav, Say hello, theme, phone menu, footer)

**Status:** VERIFIED (18-11-26). Reviewed and fixed; see the report
**Evidence:** `../reports/phase-1_shell_REPORT_18-11-26.md` (gates, deviations, draft copy; visual baselines pending, see its open items 1 and 2).
**Created:** 18-11-26, at `563b2a3`.
**Umbrella:** `profile-site-redesign_UMBRELLA_PLAN_18-11-26.md`
**Spec:** `../references/design-spec_18-11-26.md` section 7 (chrome), 10
(phone rules), 11 (dark) and 12 (accessibility fixes).
**Inventory:** sections 2.4 (crawl path), 3.11 (theme), 4 (site chrome), 8.3
(smoke tests) and 10 (risks R4, R5, R8, R13).
**Report target:** `../reports/phase-1_shell_REPORT_{dd-mm-yy}.md`
**Owner inputs:** R1 (nav links), R2 (share), R3 (footer copy), R15 (Lenis).

## Objective

Build the new site chrome on the preview layout: the fixed pill nav, the Say
hello email popover, the theme toggle and the phone theme switch, the phone
menu, and the large footer. The live header, menu and footer stay as they are
until Phase 6.

## Work

| Step | Scope |
| --- | --- |
| 1a | **Pill nav** (`components/profile/site/SiteNav.tsx`). Fixed, `--bar-top` 32 px, `--bar-row` 48 px, padding `var(--pad)`, pointer events on its children only. Left pill: 32 px round avatar (`/profile-portrait.webp`), the name in the serif with an accent full stop (first name only under 640 px; the surname stays in the link's accessible name, visually hidden), links per R1 as 36 px `.nav-link` pills. A sliding `.nav-active` pill follows the current link (transform and width .28 s; opacity only under reduced motion). On Home a scrollspy (IntersectionObserver) picks the current section; elsewhere the current page gets `aria-current="page"`. Right: the theme toggle (48 px round, hidden under 810 px) and the dark "Say hello" pill with the swap arrow. Hide on scroll: a pure helper `navAway(lastY, y)` records a new position only after 6 px, hides when moving down past 24 px, shows on 6 px up; the nav never hides while focus is inside it or the menu or popover is open (`.away:not(:focus-within)`: opacity 0, blur 6 px, up 12 px, .15 s). Mark it `data-site-chrome` and `lang="en"` for print and Thai pages |
| 1b | **Anchors and focus.** `scroll-padding-top: 96px` on `html` inside the preview scope and the per-target `scroll-margin-top` values of spec 4.3, so anchored sections, focused elements and the tap-area test's scrolled targets are never under the nav (WCAG 2.4.11). Native `scroll-behavior: smooth` inside no-preference only (R15 keeps Lenis out); jumps under reduced motion |
| 1c | **Say hello popover** (`components/profile/site/SayHello.tsx`), spec 7.4 and the design system's SayHello. Built on the native `popover` attribute: the trigger is a button with `popovertarget`, so the panel opens, light-dismisses and closes on Escape before hydration and without JavaScript; script then adds `aria-haspopup="dialog"` and a mirrored `aria-expanded`, Copy email, and focus on the first row. Panel `role="dialog"` named "Email Kunanon Jarat", width `min(300px, 100vw - 32px)`, radius 20, the violet under-glow shadow, a dither strip in its foot. Content: a mono label "Email", the address from `site.email` as selectable text, then the rows of spec 7.4 with the repo's strings (`lib/content/contact.ts`): "Copy email" (dark full-width pill; Clipboard API; "Copied" with a check, announced by a polite live region; hidden until hydration, because it needs script), "Compose in Gmail" (compose URL, new tab, announced as such), "Open your mail app" (`mailto:`) and "Use the contact form" (`/contact`). Escape and an outside click close it and return focus to the trigger. Motion .2 s from 6 px up and scale .97; opacity only under reduced motion. The nav instance sits fixed under the bar; the footer instance opens above its trigger with CSS anchor positioning where supported, else fixed at the bottom centre of the viewport |
| 1d | **Theme.** A new toggle (`components/profile/site/ThemeToggle.tsx`; the old `components/ThemeToggle.tsx` stays for live pages until Phase 6) on next-themes as today (`.dark` on `<html>`, `localStorage["theme"]`, light default, system preference ignored unless R20 says to follow it on a first visit). Moon and sun cross-fade (.2 s, rotate .32 s ease-back), hover background paper-2 and icon -14 deg, `:active` scale .94. The switch runs as a View Transition: the new theme fades in over .56 s (`::view-transition-new(root)`), with a `theme-switching` class that suppresses transitions for two frames; no View Transition under reduced motion or where unsupported. The old circular reveal stays on live pages until Phase 6, and so do the theme-color metas |
| 1e | **Phone menu** (under 810 px). The nav pill shows the avatar, first name and a text button "Menu" / "Close" whose accessible names stay "Open menu" and "Close menu" (`aria-expanded`, `aria-controls="site-menu"`; the menu stays `nav` "Site" with `id="site-menu"`, as today's tests expect, spec section 13 item 26). The menu is a card under the nav (paper, radius 24, ring, padding 12): links Work, About, Journey, Résumé, AI engineering and Contact as 48 px rows (19 px, weight 500), a divider, then the theme switch (native radio inputs "Light" and "Dark" in a `fieldset` with a visually hidden legend "Theme", as spec 7.5 says, so arrow keys and announcements come from the browser; a sliding thumb, .26 s). The menu uses the native `popover` attribute like Say hello: server-rendered, closed until its button (`popovertarget`) opens it, so it works before hydration; script sets the visible "Close" and the names "Open menu" and "Close menu". Focus moves to the first link on open; Escape and an outside click close it; it enters with opacity and a 16 px drop over .22 s |
| 1f | **Footer** (`components/profile/site/SiteFooter.tsx`). The sheet gradient with a dither field over its lower 60 %; two pixel illustrations of our own (a browser window with a cursor, a phone), code-drawn, `aria-hidden`, shown from 1280 px; a mono eyebrow, the `.t-footer` headline and two short paragraphs (R3, approved line by line), and a 52 px "Say hello" pill that opens the popover upward. The footer card (paper at 88 % with a 10 px blur, radius 24, ring, padding `clamp(24px, 3vw, 40px)`, grid 1.2fr 1fr 1fr): the name in the serif with "Open to roles" and a static accent dot, and "Bangkok, GMT+7"; "Pages", listing every public page the old site menu links, read from `siteMenu` in `lib/content/landing.ts` and never retyped (spec 7.7: Home, About, Ventures, Portfolio, Résumé, Agent skills, AI engineering, Learn, Examples, Stack, Proof, Build, Contact), which keeps the crawl path for crawlers that run no JavaScript; "Elsewhere" (X, LinkedIn, GitHub; Telegram stays off) and "For agents" (agents.md, llms.txt, sitemap.md, skills.md). Every link at least 24 px tall. A mono copyright line |
| 1g | **Preview Home shell.** `/preview` renders the nav and footer around empty, labelled `#work`, `#about` and `#journey` sections, so the scrollspy, anchors and hide-on-scroll can be tested before Phases 2 to 4 fill them |
| 1h | **Tests and gates** (below) |

## Touchpoints

New `components/profile/site/*` (SiteNav, SayHello, ThemeToggle,
ThemeSwitch, PhoneMenu, SiteFooter, pixel illustrations) and their tests;
`src/routes/preview/route.tsx` and `index.tsx`; the scoped block in `src/styles/globals.css`;
`lib/content/landing.ts` or the new Home content module for nav, menu and
footer link lists; `tests/e2e/routes.ts`, `smoke.spec.ts` (a new "preview
chrome" block), `a11y.spec.ts`, `visual.spec.ts`.

## Public Contracts

None on live pages. `/preview` gains the new chrome. The footer's "Pages"
list becomes the crawl-path contract that Phase 6 must ship on every page.

## Blast Radius

The preview routes only. `components/ThemeToggle.tsx`, `SiteHeader`,
`SiteMenu` and `SiteFooter` are not edited.

## Validation gates

1. The CI gates as in Phase 0 gate 1.
2. Unit: `navAway()` thresholds (0 to 22 to 24 to 26 stays shown, 26 to 28
   hides, 6 px up shows); the scrollspy picker; the popover's copy state and
   Escape handling; the menu's open and close and focus; the theme radios.
3. Smoke on `/preview` at 1440 x 900 and 390 x 844: the nav is visible at the
   top; it hides after scrolling down 200 px and shows after 10 px up; focus
   inside keeps it visible; `#work`, `#about` and `#journey` land with their
   tops below the nav; the menu opens, its rows are in view, Escape closes it;
   the popover's four actions are reachable by keyboard.
4. Tap areas at 320 and 390 px on `/preview` with the menu and the popover
   open: every target at least 24 px, none overlapping, none covered,
   including targets scrolled to the top edge under the fixed nav.
5. Axe on `/preview` in both themes: no serious or critical violations.
6. Visual: new baselines for `/preview` (top and footer, light and dark,
   mobile and desktop), reviewed against the spec. All 96 existing baselines
   and the parity gate unchanged.
7. Budgets: the entry chunk is unchanged (the chrome is imported by the
   preview layout, not the root); the preview route stays under the marketing
   budget.
8. Reduced motion: no transform or blur on the nav, no View Transition, no
   popover or menu movement.
9. JavaScript off (a Playwright context with JavaScript disabled, on the
   production build): every nav and footer link works, Say hello opens and
   shows the address with its mail and contact-form links, the phone menu
   opens and closes.
10. The Phase 0 best-practice checks on `/preview`: axe with `wcag22aa`,
    forced colors (nav pill, popover and menu keep visible edges; the current
    link is underlined), text spacing, 200% zoom, request origins, and the
    WebKit phone project.

Device matrix (spec section 10.1): at 344, 390, 820, 882, 1180 and 1440 px
wide nothing overlaps and nothing scrolls sideways, the nav fits on one row
(Say hello as a round icon under 370), and the tap-area test passes at 344.

## Blockers that justify BLOCKED

- The fixed nav cannot pass the covered-target test without changing the
  test. Then ask the owner (R17) before changing it.
- The footer link list cannot carry every page the old menu links without
  breaking the layout at 390 px. Then ask whether a second footer group or a
  collapsed list is acceptable.

## Resume and Execution Handoff

- **Execute anchor:** this file. Phase 0 must be merged.
- **Before code:** take R1, R2, R3, R15 and R20 (each has a default). Show
  the owner the footer copy lines, not a summary.
- **Research first, popover:** confirm the Popover API in the three test
  browsers (Chromium, WebKit, Firefox) and the WebKit phone project; that a
  `nav` with the `popover` attribute keeps its `nav "Site"` landmark and
  `id="site-menu"` for the tests; how focus returns to the invoker on light
  dismiss; and how the fixed nav's hide-on-scroll treats an open top-layer
  popover.
- **Research first:** read `tests/e2e/smoke.spec.ts` lines 1236 to 1428 (tap
  areas) and confirm that `scrollIntoView({ block: "nearest" })` honours
  `scroll-padding-top` in the test browsers.
