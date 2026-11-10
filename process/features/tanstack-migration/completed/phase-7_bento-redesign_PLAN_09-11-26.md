# Phase 7: Bento redesign

**Status:** COMPLETE (10-11-26). Report: `../reports/phase-7_bento-redesign_REPORT_10-11-26.md`.
**Created:** 09-11-26
**Umbrella:** `tanstack-migration_UMBRELLA_PLAN_09-11-26.md`
**Design source:** the approved canvas (https://claude.ai/artifact/X9f4PqkFMM4sxCw3pnDeNu).
**Build spec:** `../references/phase-7_design-spec_09-11-26.md`. It holds the
tokens, the motion CSS (verbatim), the shared components, all 20 pages with
their route mapping, the responsive rules and the gaps. Read it before each
sub-phase.

## Owner decisions (09-11-26)

1. **Intro:** keep the first-visit intro ("Hello" → "Welcome to KunanonJ").
   - End it with a celebratory burst that makes the arrival exciting:
     confetti, sparkles and a champagne-pop feel.
   - CSS only, in palette tokens, and none of it under reduced motion.
   - Retire the custom cursor (`SmoothCursor`) and the keyword tooltips.
2. **Buttons:** primary buttons are ink, as in the canvas: `--cta`/`--oncta`,
   ink on day and Glaze on night. Signal stays for links, accents and markers.
3. **Ventures:** the Home ventures bento card carries `id="ventures"`, so
   `/#ventures` and the `/ventures` 308 keep working. The menu, Home "See both
   ventures" and the 404 page link there.
4. **Footer:** the canvas footer, plus a compact mono "For agents" row that
   links `/agents.md`, `/llms.txt`, `/sitemap.md` and `/skills.md`.

## Defaults taken (canvas is the approved source; engineering calls)

- **Copy:** follow the canvas, including the Home "Hi, I'm" greeting and its
  "Selected work" order: TBH Intranet, AI Automation, Node Validator. Add a
  `featured` order to `lib/content/portfolio.ts`; never invent content.
- **Resume:** moves into `_landing`, with full chrome, Share and a Detailed /
  Compact toggle. Compact is screen only; `pnpm pdf` output is unchanged.
- **Accent:** add an `--accent` token (Signal by day, `#8e97ff` by night) for
  markers. Fix the University-era card at 641-1023px.
- **Search params (Valibot `validateSearch`):** every list filter becomes URL
  state:
  - Portfolio category, Stack group, Build venture, Examples persona, Learn
    language and Skills origin/invocation;
  - Press type, Blog tag/query and Resume detail.

  Install tabs, steppers, FAQ, metric tiles and related-tag tabs stay local
  state.
- **Bangkok card:**
  - the sky follows the site theme, as in the canvas;
  - the GMT+7 clock renders on the client after load, because edge-cached
    HTML would freeze it;
  - scene colours are tokens in `globals.css`, so the raw-hex ratchet stays at 0;
  - the repeated temple shapes use `<use href>`.
- **Motion:** use the canvas entrance stagger, hover lift and panel pop.
  - The LCP element (the hero h1) never starts invisible or blurred; only
    the cards below it animate in.
  - Router `defaultViewTransition` uses view-transition **types**, so the
    theme switch's circular reveal does not play on page changes.
  - Reduced motion turns every animation off.
  - Playwright freezes the clock and forces reduced motion.
- **Not in the canvas:**
  - `/design` is restyled with the new tokens;
  - `RouteError` reuses the 404 layout;
  - OG images keep their current art;
  - `/studio` is out of scope.
- **Variants the canvas does not draw:** the Manut venture page, other
  projects and skills, other topics, Portable Text styles and contact error
  states. Derive them from the drawn template and the repo's data, and omit
  any block with no data (for example, venture loops and skill "How it runs"
  steps where none exist).
- **Retired:** `SmoothCursor`, keyword tooltips, the floating pill nav, the
  Home About/Features/Proof strips and `RouteFade` (view transitions replace
  it), together with the tests that cover them.
- **Press and Blog:** stay hidden (`BLOG_PUBLIC` is unchanged), with no links
  to them from public pages. Their banners keep the current images until the
  owner supplies new ones.

## Sub-phases (one PR each, merged on green, verified live)

| PR  | Scope |
| --- | --- |
| 7a  | **Foundation and Home:** tokens (spec 1), motion and view transitions (spec 2), header (share panel, theme toggle with circular reveal, site menu), footer with the agents row, bento card, chip, share pill, Bangkok card, buttons; the intro's celebratory finish; retire the old chrome; Home (spec 4.1) |
| 7b  | **About, Contact, Resume** (spec 4.2-4.4); Resume moves to `_landing` |
| 7c  | **Hubs:** Venture, Topic EN and TH (spec 4.7, 4.15, 4.16) |
| 7d  | **Skills and Skill** (spec 4.8, 4.9), with typed search params |
| 7e  | **Portfolio and Project** (spec 4.5, 4.6), with typed search params |
| 7f  | **Library:** Learn, Examples, Stack, Proof, Build (spec 4.10-4.14), with typed search params |
| 7g  | **404 and RouteError, `/design`, hidden Blog, Post and Press** (spec 4.17-4.20) |

## Gates (every sub-phase)

- typecheck, lint (0 warnings), format, knip and unit tests pass, and the
  ratchets stay at 0 (raw hex, type floor). Contrast tests cover the new
  pairs: `--cta`/`--oncta`, `--muted`, `--accent` and the photo scrim.
- `pnpm build` passes; the 200/255 KB first-load budgets hold.
- Linux visual baselines regenerated in the Playwright image for every page
  the PR changes, and every image reviewed. 7a re-baselines all pages, because
  the header and footer change everywhere.
- smoke and axe pass in both themes; the production console sweep is clean.
- Parity: titles, meta, canonical, JSON-LD and status codes are unchanged
  (page bodies change by design). Record any intended difference in
  `src/ported-routes.json` (`intended`).
- No `/blog` or `/press` links on public pages.
- Report at the end in `../reports/phase-7_bento-redesign_REPORT_*.md`.
