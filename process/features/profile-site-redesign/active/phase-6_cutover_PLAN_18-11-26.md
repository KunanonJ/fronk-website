# Phase 6: Cutover

**Status:** CODE DONE (18-11-26). Steps 6a to 6i done in the lane
`feat/profile-redesign-phase-6-cutover` (local commits). The owner's go of
18-11-26 ("please continue working until done then deploy to production for
me") covers the merge; step 6j (merge, deploy, live check) is the
orchestrator's, after the Linux baselines and gate 8 on the preview URL.
**Evidence:** `../reports/phase-6_cutover_REPORT_18-11-26.md`
**Created:** 18-11-26, at `563b2a3`.
**Umbrella:** `profile-site-redesign_UMBRELLA_PLAN_18-11-26.md`
**Spec:** the whole of `../references/design-spec_18-11-26.md`, especially
section 14 (component-to-phase map).
**Inventory:** sections 2 (routes and SEO surfaces), 3.11 and 3.12 (theme and
guards), 4 (chrome), 8 (every guard) and 10 (risks R2 to R8, R12, R13).
**Report target:** `../reports/phase-6_cutover_REPORT_{dd-mm-yy}.md`
**Owner inputs:** R14 (Bangkok card), R16 (`/work` target), R17 (pinned
tests).

## Objective

Make the new design live. The real routes for Home, the portfolio index, the
case studies, About and Contact render the new components; every other page
gets the new chrome around its old body until Phase 7; the preview routes go away.
SEO surfaces keep their content, and every guard is green before the merge.

## Work

| Step | Scope |
| --- | --- |
| 6a | **Pre-flight.** Recruiter-fit Phase 4 merged or deferred (R13). The owner reviews `/preview/*` on the latest preview URL and says go. Take R14, R16, R17 and R22; show the owner the list of tests that change and why. Record the "before" numbers for R22: 28 days of contact form sends, `/resume` and case-study page views, and Core Web Vitals from Cloudflare Web Analytics where its token is set |
| 6b | **Opt the core pages in.** `__root.tsx` sets `data-design="profile"` on `<html>` for `/`, `/portfolio`, `/portfolio/*`, `/ventures/*`, `/about` and `/contact` (spec section 2.13). Every other page keeps its old tokens and fonts under the new chrome, with a `var(--nav-h)` top offset, until Phase 7. Preload the Onest and Instrument Serif latin files on the opted-in pages. Theme-color metas become `#f7f3ff` and `#0f0c18` (`lib/seo/rootMetadata.ts` and its test) and the manifest colours move to the palette; the brand mirror `lib/brand/tokens.ts` waits for Phase 8. The guards that pin theme-color, the view-transition lines and the header geometry change with the decision recorded (spec section 13 item 23) |
| 6c | **Chrome.** `LandingLayout` renders the new nav and footer on every `_landing` page, keeping the skip link, `landing-root`, `data-site-chrome` and the print rules; the theme toggle switches with the .56 s fade. Delete `SiteHeader`, `SiteMenu`, `SiteFooter` and the header share panel (knip); keep `SharePill` and `ShareRows` for the heroes that use them. The 404 page and error page use the new chrome |
| 6d | **Routes.** `/` renders the new Home (the intro kept; `id="ventures"` on the GoGoCash card). `/portfolio/$slug` and `/ventures/$slug` render the case-study template; their JSON-LD, titles, canonicals, share images and Markdown twins stay. `/portfolio` becomes the "All work" page: the hero in the new style and the projects as lift cards, keeping the `?category=` filter (the prerendered default plus the filter after hydration) and the CollectionPage JSON-LD. `/about` becomes a page built from the new parts (hero, About bento, story and records, FAQ, the "Next" card with the recruiter links); its h1 still restates the page title. `/contact` keeps its form, Email card, "Who should write" and "For recruiters", restyled, with the Say hello actions; the Bangkok card goes (R14). The form keeps its visible labels, `autocomplete`, `aria-invalid` and `aria-describedby`; its inputs stay at 16 px or more so iOS does not zoom on focus; a failed submit moves focus to the first invalid field; while sending, the button reads "Sending" and the form is `aria-busy`. Delete the `/preview/*` routes, the robots line can stay |
| 6e | **Crawl path and prerender.** The footer's "Pages" list is on every page. Compare the list of prerendered files before and after the build: every page prerendered today is still prerendered |
| 6f | **Redirects and anchors.** `/work` keeps `/#ventures` unless R16 says `/#work`; `/ventures` keeps `/#ventures`; the venture breadcrumbs, the 404 recovery links and the old menu's targets resolve |
| 6g | **Tests rewritten to the same intent (R17).** The "recruiter path" block: the h1, "Open to roles", "Contact me" and "Résumé" above the fold at 1440 x 900 and 375 x 812; "Résumé" in the Primary nav on every page but `/design`; the phone menu ("Menu", `#mobile-menu`) holds Résumé in view; the nav fits one row from 1024 px. The "case-study evidence" block: outcome and owner's part within 1.5 screens at 1440 x 900, stacking at 800, 375 and 320 px without sideways scroll, the "Hiring" article on project pages, Home's work stack showing the first outcome, `/proof` order unchanged. The share pill sizes where `SharePill` remains. Component tests for removed components are replaced by the new ones |
| 6h | **Baselines and parity.** Regenerate all baselines in the pinned image and review each one against the spec. Re-crawl parity with `PARITY_SEEDS`; count added and removed URLs; the intended differences are head tags (theme-color metas, font preloads) and the manifest; anything else is a defect |
| 6i | **Print and résumé.** `pnpm pdf` from the production build; the PDF stays two pages and plain; read its text layer back |
| 6j | **Merge and live check, when the owner asks.** After the merge, run `PLAYWRIGHT_BASE_URL=https://kunanonj.com pnpm exec playwright test smoke.spec.ts --project=desktop --grep "recruiter path"` and `BASE=https://kunanonj.com pnpm probe / /about /portfolio/tbh-intranet`; record both |

## Touchpoints

`src/styles/globals.css`, `src/styles/fonts.css`,
`src/routes/__root.tsx`, `src/routes/_landing/{index,about,contact}.tsx`,
`src/routes/_landing/portfolio/{index,$slug}.tsx`,
`src/routes/_landing/ventures/$slug.tsx`, `src/routes/preview/*` (removed),
`components/landing/LandingLayout.tsx`, `components/bento/{SiteHeader,SiteMenu,SiteFooter,SharePanel}.tsx`
(removed), `components/landing/home/*`, `about/*`, `ContactPage.tsx`,
`portfolio/*`, `discovery/VentureHubPage.tsx`, `components/NotFound.tsx`,
`lib/brand/tokens.ts`, `lib/seo/rootMetadata.ts`, `lib/seo/manifest.ts`,
`lib/design/*.test.ts`, `tests/e2e/*`, all baselines,
`tests/fixtures/site-parity.json`, `src/ported-routes.json` (intended fields).

## Public Contracts

- Every public page gets the new chrome; Home, the portfolio index, case
  pages, About and Contact also get the new design. URLs, h1s, titles,
  canonicals, JSON-LD, Markdown twins, `llms.txt`, the sitemap and robots
  rules keep their content.
- Intended parity changes: head tags only (theme-color metas, font preloads)
  and the manifest colours (spec section 13 item 35).
- Home's h1 text, `id="ventures"`, the skip link and `aria-current` on
  navigation stay.

## Blast Radius

The whole public site, all baselines, the parity reference, the smoke tests
named in 6g, and the first-load budgets.

## Validation gates

1. The CI gates as in Phase 0 gate 1, plus smoke and axe on all 26 routes in
   both themes.
2. All baselines regenerated and reviewed; the report lists each page with a
   one-line verdict.
3. Parity re-crawled; only the intended differences remain; URL counts match.
4. Tap areas at 320 and 390 px on `/`, `/about`, `/skills`, `/portfolio`,
   `/portfolio/tbh-intranet`, `/contact`, `/resume` and the open phone menu.
5. First-load budgets: entry at most 120 KB, default 165 KB, marketing 200 KB.
6. Prerendered file list unchanged; `/#ventures` resolves.
7. `pnpm pdf` passes and its text layer reads back in order.
8. `pnpm probe` on the preview URL: LCP element on Home is the h1, CLS under
   0.1, no text under 12 px, no target under 24 px; LCP 2.5 s or less and
   TBT 200 ms or less (the lab stand-in for INP) on Home, `/about` and
   `/portfolio/tbh-intranet`.
9. Axe with `wcag22aa` on every opted-in page in both themes.
10. Forced colors, text spacing, 200% zoom and request-origin checks on Home,
    `/portfolio/tbh-intranet`, `/about` and `/contact`, and the WebKit phone
    project on the same pages.
11. By hand on the preview URL, recorded in the report: keyboard only through
    Home, a case page, About and Contact; VoiceOver on macOS and iOS, TalkBack
    and NVDA through the nav, Say hello, the work stack, a case page and the
    contact form; an iPhone, an Android phone, an iPad and, if one is at
    hand, a foldable.

Device matrix (spec section 10.1): every opted-in page holds at 344, 390, 820,
882, 1180 and 1440 px wide, baselines exist at those anchors for Home and
`/portfolio/tbh-intranet`, and the tap-area test also runs at 344.

## Blockers that justify BLOCKED

- The owner has not said go on the preview.
- Parity shows differences outside the intended list.
- A page drops out of the prerender.

## Resume and Execution Handoff

- **Execute anchor:** this file. Phases 2 to 5 must be merged.
- **Pull request shape:** one pull request for the cutover, so the live site
  changes in one deploy; commits split into tokens and fonts, chrome, routes,
  tests and baselines, parity.
- **Rollback:** reverting the cutover pull request restores the old design,
  because Phases 0 to 5 only added files.
