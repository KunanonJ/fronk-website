# Phase 2: Home

**Status:** SHIPPED in #64 (09-11-26), verified live: LCP on `/` 1.6 s on the real network with a throttled phone (was 13.1 s); e2e + axe 100/100 live. Evidence: `../reports/phase-2_home_REPORT_09-11-26.md`.
**Created:** 09-11-26
**Umbrella:** `visual-redesign_UMBRELLA_PLAN_09-11-26.md`
**Covers audit findings:** 6 (LCP 10.7 s on `/`, video hero), 7 (JS on `/`), 11 (six identical "Learn more"), 13 (home doesn't surface the work; the writing part is deferred while the blog is hidden), 16 (two vs three ventures), 17 (photo card), 18 (clipped "3")
**Depends on:** Phases 0 and 1

## Objective

`/` reads as one confident statement: who Kunanon is and what he's building, with one primary action, then the ventures, real numbers and the portfolio. There's no third-party video, and mobile LCP is under 2.5 s.

## Owner decisions (at entry)

1. **The intro** (`components/landing/IntroLoader.tsx`, 1.45 s since #55): keep it, restyled to the new type, or drop it. The research suggests dropping it so the hero is the first impression. Dropping it also removes `lib/content/introGreetings.ts` and its tests.
2. **Hero statement copy:** two lines, the second in `ink-2`. A draft goes to the owner at entry, for example "Building fintech and AI from Bangkok." / "Founder of GoGoCash and Manut AI."
3. **The ventures count wording** (finding 16): "Founder of GoGoCash and Manut AI" vs three ventures including Airplusauto (`lib/content/landing.ts` `hero`, `about`, `ventures`). Update everything that quotes it (FAQ in `lib/content/faq.ts`, JSON-LD descriptions in `lib/seo/jsonLd.ts`). sea-discovery owns the venture hubs, so an Airplusauto page isn't created here.

## Known levers (verify at entry)

1. **Hero** (`components/landing/Hero.tsx`):
   - remove the CloudFront video and the `WordsPullUp` wordmark;
   - left-aligned statement in the `display` token;
   - a status chip such as `Chip state="live"` "Building GoGoCash / Manut AI". Ember is allowed here: the chip carries a label and sits on Paper;
   - a Signal primary pill (Contact) and a ghost pill (See my work, `/portfolio`);
   - a `PixelGrid` tile on the right (stacked below on phones).

   The hero must be the LCP element: text, not media.
2. **Home about** (`components/landing/About.tsx`): restyle; replace the `WordsPullUpMultiStyle` (framer-motion) reveal with a CSS fade, or none.
3. **Ventures** (`components/landing/Features.tsx`; data in `lib/content/landing.ts` `ventures`):
   - remove both `<video>` cards (the CloudFront sources) and the decorative photo card (finding 17);
   - one card per venture, rendered once in the accessibility tree (finding 11), with unique link names ("GoGoCash case study");
   - a Glaze or Paper card, logo from `public/brand/`, one metric, mono tags.
4. **Proof strip:** stat tiles from `lib/content/proof.ts` `getProofMetrics()`, with tabular numerals and mono labels. Real numbers only.
5. **Portfolio strip:** the 4 projects from `lib/content/portfolio.ts` `getAllPortfolioProjects()` as compact numbered cards linking to `/portfolio/[slug]`, plus an "All work" link. If `/skills` is worth surfacing, add a one-line teaser.
6. **framer-motion on `/`:**
   - it's used by `Hero.tsx`, `Features.tsx`, `WordsPullUp*` and `AnimatedLetter`;
   - after this phase, `/` should not need it;
   - record the JS drop in `pnpm perf:budget`. `LandingTopNav` still imports it, so Phase 6 decides whether to remove it entirely.

## Touchpoints

`app/(landing)/page.tsx`, `components/landing/{Hero,About,Features,IntroLoader}.tsx`, `components/landing/{WordsPullUp,WordsPullUpMultiStyle,AnimatedLetter}.tsx` (when unused here, Phase 6 confirms deletion), `lib/content/landing.ts`, possibly `lib/content/faq.ts` and `lib/seo/jsonLd.ts` (copy only, coordinated with sea-discovery), and the tests for each.

## Gates

- **Speed:** probe on `/` (phone profile): LCP under 2.5 s (baseline 10.7 s); no requests to `d8j0ntlcm91z4.cloudfront.net`; JS for `/` below the Phase 0 measurement.
- **Accessibility:** axe in both themes; link names on `/` unique per destination (probe check); type-floor and raw-hex ratchets lowered.
- **Visual:** screenshots of `/` at 390, 768, 1024, 1280 and 1440, light and dark. The #51 overlap must not regress at 1024 to 1279.
- **Standard gates.**
- If the intro is kept, the Phase 1 timings are re-measured.

## Out of scope

New venture pages, the "latest writing" strip (blog hidden), and new case-study content.
