# Best-practices audit: profile site redesign

**Date:** 18-11-26, at `563b2a3`, before any phase executes.
**Request:** "also please prepare the design system and according to best
practices as well. and make sure that our plan cover all things in best
practices" (owner, 18-11-26).
**Design system:** https://claude.ai/artifact/3KT7Wet8Goh1q8MF2sqaQG (private
to the owner). It holds the tokens (73 colours in light and dark, 23 text
styles, spacing, radii, shadows, motion, z-index, layout and breakpoints),
27 components with live previews and guidelines, the repo's 15 line icons,
and four rule sections: Layout, Motion, Accessibility and Engineering. It was
built from the design spec and the review canvas; after Phase 0 the repo's
CSS is the source and the artifact is re-synced from it.
**Method:** every practice below was checked against the umbrella plan, the
nine phase plans and the design spec. "Covered" cites where the plan already
does it. "Fixed" names the plan change made on 18-11-26. "Owner" is a new
open input with a default. "Not adopted" gives the reason.
**Checked against:** WCAG 2.2, the Core Web Vitals thresholds, axe-core 4.14
(its WCAG 2.2 rule `target-size` carries the `wcag22aa` tag and is off unless
that tag is named), Playwright 1.64 (`forcedColors: 'active'`), Tailwind 4
(native cascade layers, `@utility`), and the repo itself (`public/_headers`,
`playwright.config.ts`, `tests/e2e/a11y.spec.ts`,
`components/landing/contact/ContactForm.tsx`, `lib/content/contact.ts`).

## Summary

- The plan already covered most of the practices: the rollout behind preview routes, the
  guards, reduced motion, pause controls, tap areas, the 12 px floor,
  contrast tests, parity and SEO, budgets, Thai and the device matrix.
- Fixed in the plans: 31 practices, plus additions to 2 that were already
  covered, each listed below with its phase.
- Seven places where a phase plan disagreed with the spec, all fixed
  (section 17).
- Three new owner inputs: R20 (follow the system theme), R21 (Content
  Security Policy), R22 (how to measure success). Each has a default, so no
  phase waits.
- Not adopted, with reasons: a DTCG token build, `content-visibility` on long
  sections.

## 1. Tokens and theming

| Practice | Status | Where |
| --- | --- | --- |
| One source for every value | Covered, plus fixes | Tokens live in `globals.css` (spec 2.13). The design system mirrors them and is re-synced from the repo after Phase 0 (Phase 0 0g) and marked as following it (Phase 8 8f). `lib/brand/tokens.ts`, today kept equal by hand, gets a test against the CSS (Phase 8 8b) |
| Tiers: palette, roles, Tailwind names | Covered | Spec 2.12; design system Engineering. Rule: use a role where one exists. No test, because decorative colours (tints, peach, coral) have no role |
| Names that do not collide | Covered | Spec 2.12 and 13 item 22 |
| Both themes designed and checked | Covered | Spec 11; Phase 0 0d. The design system's contrast table is computed for both themes |
| Follow the reader's colour-scheme setting by default | Owner (R20) | Today light is the default and the system setting is ignored, by owner choice and test. Default: keep that; ask at Phase 1 |
| A token interchange format (DTCG JSON with a build step) | Not adopted | Its one consumer, the design system, reads its own list format. A build step adds a dependency and a generated stylesheet for no second consumer. Revisit if one appears |

## 2. Typography

| Practice | Status | Where |
| --- | --- | --- |
| Font sizes in rem, so the reader's default size applies | Fixed | Spec 3.3 note; Phase 0 0c (px divided by 16; the computed sizes stay the same at the default) |
| Fluid sizes that still double at 200% zoom (WCAG 1.4.4): rem bounds, largest at most 2.5 times the smallest | Fixed | Every clamp in spec 3.3 already meets the ratio (largest 96 / 42 = 2.29). The hero's `min(var(--type-display), 8.4svh + 4px)` had no floor: at 500% zoom it grew only 1.2 times. The new `clamp(2.625rem, min(5.4vw + 0.625rem, 8.4svh + 0.25rem), 6rem)` gives the same sizes at 100% zoom (42, 71.2, 79.6 px). A Phase 0 test checks every clamp. Phase 2 2b |
| No faux bold on a single-weight face | Fixed | `font-synthesis-weight: none` in the scope (Phase 0 0c); Instrument Serif has one weight |
| Self-hosted subsets, `swap`, metric-adjusted fallbacks, two preloads | Covered | Spec 3.1; Phase 0 0b |
| A font byte budget | Fixed | Phase 0 measures the Home first-view font bytes; the budget is that plus 10% and only goes down |
| Line length, `balance`, `pretty` | Covered | Spec 3.3 |
| 12 px floor | Covered | `typeFloor.test.ts` |
| Thai | Covered | Spec 3.4; Phase 7 7b |

## 3. Colour and contrast

| Practice | Status | Where |
| --- | --- | --- |
| Text 4.5:1, large text and non-text 3:1, both themes | Covered | Phase 0 0d. Computed pairs in the design system's Accessibility section (lowest small-text pair: `ink-60` on `sunset-1`, 4.64:1) |
| Colour never the only signal | Covered, plus a fix | The current nav item has colour, a fill and `aria-current`; in forced colors it also gets an underline (Phase 0 0c) |
| `prefers-contrast: more` | Fixed | Phase 0 0c: `ink-60` text moves to `ink-80`, rings to `line-strong`, chips to solid paper; Phase 0 0d tests those pairs |
| `forced-colors: active` (Windows contrast themes) | Fixed | Box-shadow rings vanish there. Ringed primitives carry a transparent 1 px border and get system-colour borders; pixel art hides; focus stays an outline. Playwright `forcedColors: 'active'` checks in Phase 0 and Phase 6 |
| `prefers-reduced-transparency` | Fixed | Phase 0 0c: translucent chips, the motion toggle and the footer card become solid paper with no blur |
| Logo-strip wordmarks readable | Fixed | Phase 2 2e said ".55 opacity" (about 4.3:1 on paper, under 4.5:1 for the 15 px mono wordmark); spec 8.3 already said `ink-60` (4.97:1). The plan now follows the spec |

## 4. Layout and responsive

| Practice | Status | Where |
| --- | --- | --- |
| Container queries and a device matrix | Covered | Spec 10.1; every phase's matrix gate |
| Reflow at 320 CSS px (WCAG 1.4.10) | Covered | No-sideways-scroll checks in Phases 3 to 7 |
| Safe areas on notched phones | Covered by default | The site does not set `viewport-fit=cover`, so browsers keep content inside the safe area. If it ever does, fixed edges add `env(safe-area-inset-*)` (design system Layout) |
| Logical properties in new CSS | Fixed | Phase 0 0c rule |
| Focus not hidden under the fixed nav | Covered | Spec 4.3 and 12 item 9 |

## 5. Components

| Practice | Status | Where |
| --- | --- | --- |
| Typed component APIs that carry accessibility (an icon-only control needs a label) | Fixed | The design system's `components/index.d.ts`; Phase 0 0e builds to it |
| Folders named by role, not by version | Fixed | `components/v2/*` would outlive the version and need a rename in Phase 8. Now `components/ds/` (primitives) and `components/profile/{site,home,case}/` in every plan |
| Native elements before ARIA | Fixed | Phase 1 1e used `role="radio"` buttons for the theme switch; now native radios in a fieldset, as spec 7.5 says. The lightbox is a native `<dialog>` (covered) |
| Every state designed and written down | Covered | The design system documents hover, focus-visible, pressed, current, open and sending, and the "no disabled look" rule |
| A living style guide | Covered | `/preview/system` (Phase 0), `/design` (Phase 7 7g), the design system |
| Unit tests per component | Covered | Every phase's gates |

## 6. Accessibility

| Practice | Status | Where |
| --- | --- | --- |
| Target WCAG 2.2 AA | Fixed | The umbrella's floor said 2.1 AA |
| axe runs the WCAG 2.2 rule | Fixed | `a11y.spec.ts` names `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`. `wcag22aa` is added for `/preview/*` in Phase 0, for the opted-in pages in Phase 6 and for every page by the end of Phase 7, so live pages are not judged by a new rule before they are rebuilt. Phase 0 proves the rule runs with a fixture that must fail |
| 2.4.11 Focus not obscured | Covered | Spec 12 item 9 |
| 2.5.7 Dragging has a single-pointer alternative | Covered | Orbit buttons (Phase 4 4b), notebook buttons (4e) |
| 2.5.8 Target size | Covered | The tap-area test at 320, 344 and 390 px |
| 3.2.6 Consistent help | Covered | Say hello in the nav on every page, and the footer |
| 3.3.7 Redundant entry, 3.3.8 Accessible authentication | Not applicable | One-step contact form; no sign-in |
| 1.4.4 Resize text | Fixed | Section 2 |
| 1.4.12 Text spacing | Fixed | Phase 0 and Phase 6 gates apply line height 1.5, paragraph spacing 2em, letter spacing .12em and word spacing .16em and fail on clipped or overlapping text |
| Text equivalents for canvas drawings | Fixed | Phase 3 3d: PixelNumber renders each figure as text for assistive technology and search; the canvas is `aria-hidden` |
| Screen reader and keyboard passes by hand | Fixed | Phase 6 gate before the merge and Phase 8 8e: VoiceOver on macOS and iOS, TalkBack, NVDA, keyboard only |
| Form practice on the restyled Contact page | Fixed | Phase 6 6d: visible labels, `autocomplete`, `aria-invalid` and `aria-describedby` stay (the form has them today); inputs at 16 px or more so iOS does not zoom; focus moves to the first invalid field; the button reads "Sending" with `aria-busy` |

## 7. Motion

| Practice | Status | Where |
| --- | --- | --- |
| Reduced motion turns everything off | Covered | Spec 5.1 and 5.7; the motion guard |
| Pause for anything over 5 s | Covered | Spec 6.11 and 12 item 7 |
| Only transform and opacity animate | Covered | Spec 5.3; design system Motion |
| Fallbacks for `@property` and view transitions | Covered | Phase 4 research; spec 7.5 |
| No loops in decorative canvases | Covered | Spec 6.8 |

## 8. Performance

| Practice | Status | Where |
| --- | --- | --- |
| Core Web Vitals at the 75th percentile: LCP 2.5 s or less, INP 200 ms or less, CLS 0.1 or less | Fixed | Umbrella definition of done. Lab: `pnpm probe` (LCP element, CLS, TBT as the INP stand-in). Field: Cloudflare Web Analytics where its token is set; a baseline before cutover (Phase 6 6a) and a comparison 28 days after (Phase 8 8d) |
| First-load JavaScript budgets | Covered | 120, 165 and 200 KB gzip |
| CSS and font budgets | Fixed | Phase 0 measures both and sets ratchets at the measurement plus 10% |
| Images: AVIF or WebP, width and height, `srcset` and `sizes`, lazy below the fold, `fetchpriority` only on the LCP image | Fixed | Phase 5 5b gave the case cover `fetchpriority="high"`, but the evidence rows put the cover near or below the fold at 1440 x 900, where the h1 is the likely LCP element. Now high priority only if the probe measures the cover as LCP; otherwise default priority and eager loading. The screenshot format rule is added to Phase 5 for R10 |
| Canvas cost | Fixed | Device pixel ratio capped at 2 (Phase 0 0e) |
| `content-visibility` on long sections | Not adopted | Estimated sizes move anchor targets (`#journey`, chapter links) and interfere with the sticky stack. Revisit only for a measured long task |

## 9. Progressive enhancement and resilience

| Practice | Status | Where |
| --- | --- | --- |
| Complete server HTML; nothing hidden without JavaScript | Covered | Reveal (spec 6.7), the static h1, prerendered filters |
| Say hello and the phone menu work before hydration | Fixed | Native `popover` with `popovertarget` (Phase 1 1c and 1e): they open, close on Escape and light-dismiss with no script. Script adds Copy email, focus placement and `aria-expanded`. The 5.2 s intro makes the time before hydration real. A JavaScript-off check joins the Phase 1 gates |
| Footer popover placement without anchor positioning | Fixed | CSS anchor positioning where supported, else fixed at the bottom centre of the viewport (the trigger is centred) |
| Error and empty states | Covered | StatusPage (Phase 7 7f), the hidden notebook, contact errors, the résumé's degraded state |

## 10. Browser support

| Practice | Status | Where |
| --- | --- | --- |
| A written support policy | Fixed | Baseline widely available features without fallbacks; newer ones only with a fallback (design system Engineering). Phase 0 research confirms each feature's status in the web-features data |
| Mobile Safari in CI | Fixed | Playwright runs WebKit only at a 1440 px desktop today. Phase 0 adds a WebKit project at 390 x 844 for the preview routes; Phase 6 extends it to the core pages |
| Real devices | Fixed | Phase 6 gate on the preview URL: an iPhone, an Android phone, an iPad, and a foldable if one is at hand |

## 11. SEO and structured data

Covered: the parity gate (titles, h1s, meta, JSON-LD), canonicals, the
sitemap, robots, the footer crawl path, noindex previews, the share images
(Phase 8 8c) and the alt-text rewrite of the old Home screenshot (8c).

## 12. Content

| Practice | Status | Where |
| --- | --- | --- |
| Written content guidelines | Fixed | The design system's content fundamentals: voice, casing, labels, figures, quotes, illustrations, link names, errors |
| Copy approved line by line | Covered | R3, R5, R9 |
| No invented claims | Covered | The claim audits |

## 13. Privacy and security

| Practice | Status | Where |
| --- | --- | --- |
| No new third parties | Fixed | Phase 0 adds a request-origin check that allows only the site, the analytics hosts that `components/CloudflareAnalytics.tsx` loads, and Turnstile's on `/contact`; Phase 6 runs it on the core pages |
| Security headers | Covered | `public/_headers` and `SECURITY_HEADERS` send HSTS, `nosniff`, frame options, referrer and permissions policies |
| Content Security Policy | Owner (R21) | Public pages send none. Default: Phase 8 adds a report-only policy with hashes for the inline theme and intro scripts and a test that fails on violations; enforcing it is a later decision. New inline scripts stay small and static |
| `rel="noopener"` on new tabs | Covered | Spec 7.7 |

## 14. Testing

Covered: unit and component tests, smoke, axe, Linux visual baselines,
parity, budgets, the ratchets and the claim audits. Added: forced colors,
text spacing, 200% zoom, `prefers-contrast`, request origins, mobile WebKit,
`wcag22aa`, hand passes with screen readers, and real devices. Each new
automated check starts with a fixture it must fail, so it is known to catch
what it claims.

## 15. Documentation and governance

| Practice | Status | Where |
| --- | --- | --- |
| A design system people and agents can read | Done | The artifact above |
| One owner of truth over time | Fixed | The repo after Phase 0; the artifact re-synced (Phase 0 0g) and marked as following the repo (Phase 8 8f) |
| Decisions and reversals recorded | Covered | The umbrella's owner decisions and reversals |
| Replaced code deleted in the same change | Covered | knip in CI |

## 16. Measuring the result

| Practice | Status | Where |
| --- | --- | --- |
| Success metrics | Owner (R22) | Default: compare 28 days before cutover with 28 days after: contact form sends (server count), `/resume` views, case-study page views and Core Web Vitals. Cloudflare Web Analytics gives page views and referrers but no custom events, so no click tracking is added |

## 17. Plan and spec disagreements, fixed

1. Phase 1 1c named the Say hello rows "Copy address", "Open in Gmail" and "Open in your mail app". Spec 7.4 and the repo (`lib/content/contact.ts`: "Copy email") say "Copy email", "Compose in Gmail", "Open your mail app", "Use the contact form". The plan follows the spec.
2. Phase 1 1e built the theme switch from `role="radio"` buttons; spec 7.5 says native radios. The plan follows the spec.
3. Phase 1 1f typed a footer Pages list with Work and Journey; spec 7.7 reads it from `siteMenu`. The plan follows the spec.
4. The phone menu: spec 7.6 and 13 item 9 had four links; the umbrella's R1 default and Phase 1 1e have six (adding AI engineering and Contact). R1 is the plan of record, so the spec and the design system now list six.
5. Phase 2 2e set wordmarks at ".55 opacity"; spec 8.3 says `ink-60`. The plan follows the spec.
6. Phase 2 2b used the hero size without a floor; it now uses the zoom-safe formula, and spec 3.3 says so.
7. `components/v2/*` and the names `HelloPopover`, `ThemeToggleV2` and `MobileMenu` became `components/ds/`, `components/profile/{site,home,case}/`, `SayHello`, `ThemeToggle` and `PhoneMenu`, matching the design system.
