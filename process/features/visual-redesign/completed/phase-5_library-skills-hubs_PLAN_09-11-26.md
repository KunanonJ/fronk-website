# Phase 5: Library, Skills, hubs and resume

**Status:** SHIPPED in #67 (09-11-26), verified live: e2e + axe 120/120 on kunanonj.com; hub head/JSON-LD/FAQ identical prod-to-prod; live phone LCP 1.46-1.72 s. Evidence: `../reports/phase-5_library-skills-hubs_REPORT_09-11-26.md`.
**Created:** 09-11-26
**Umbrella:** `visual-redesign_UMBRELLA_PLAN_09-11-26.md`
**Covers audit findings:** 12 (`/resume` company icons from `icons.duckduckgo.com`, 4 of them 404s), plus the remaining type-floor and tap-target debt on these routes (9, 10)
**Depends on:** Phases 0 and 1

## Objective

Every remaining public route is in the new system:
- the library pages (Learn, Examples, Stack, Proof, Build);
- the Skills catalog and its 20 detail pages;
- the EN and TH topic hubs and the venture hubs;
- `/resume`.

After this phase there are no third-party icon requests, and the hidden `/blog` and `/press` pages don't break visually.

## Known levers (verify at entry)

1. **Library shell** (`components/landing/LibraryPageShell.tsx`, used by Learn, Examples, Stack, Proof, Build and both portfolio pages):
   - a typography-led header (the `h1` token, `MonoLabel` eyebrow, `ink-2` description), with no imagery;
   - filter pills where a page filters;
   - replace the `text-[10px]` eyebrow.

   Pages: `components/landing/{LearnPage,ExamplesPage,StackPage,ProofPage,BuildPage}.tsx`, plus `components/landing/StackBrandIcon.tsx` (shared with About; Phase 3 recolours it first).
2. **Skills** (`components/landing/skills/{SkillsPageShell,SkillsIndexPage,SkillCard,SkillDetailPage,SkillParts,InstallTabs,CopyButton}.tsx`): cards on `Card`, install tabs and code blocks in the mono token, copy feedback through `aria-live` (keep it). The `/skills.json` and `/skills.md` outputs don't change.
3. **Hubs** (`components/landing/discovery/{TopicHubPage,VentureHubPage}.tsx`):
   - restyle only; sea-discovery owns them;
   - keep `<main lang="th">` on Thai pages, and verify the Noto Sans Thai fallback renders (Phase 0);
   - no change to canonical, hreflang, JSON-LD, FAQ text, or the related links (`withoutHiddenBlogLinks` stays).
4. **`/resume`** (`app/(system)/resume/page.tsx`, using `components/ui/Button`, `Container` and `components/CompanyLogo.tsx`):
   - self-host the company logos as SVG or PNG in `public/brand/companies/` (new), with the existing monogram fallback;
   - drop the `icons.duckduckgo.com` URL builder in `CompanyLogo.tsx` and the `dns-prefetch` in `app/layout.tsx`;
   - check the print palette, and that `pnpm pdf` (`scripts/generate-resume-pdf.mjs`) still produces a readable PDF.
5. **Hidden pages** (`components/landing/{BlogIndex,BlogPostPage,PressPage,EditorialStubPage}.tsx`): token compatibility only. Readable in both themes with no raw hex; no layout work while they're hidden.
6. **`/stock/velorah`:** untouched here; Phase 6 decides.

## Touchpoints

The component files listed above, `app/(system)/resume/page.tsx`, `components/CompanyLogo.tsx`, `public/brand/companies/` (new), and `app/layout.tsx` (the dns-prefetch line only).

## Gates

- **Hubs:** a sea-discovery parity check. Snapshot the built `<head>` and the visible FAQ text of every `/topics/*`, `/th/topics/*` and `/ventures/*` page before and after; they must be identical except for stylesheet and script hashes.
- **`/resume`:** the network log shows no third-party icon host, logos render, and `pnpm pdf` output is reviewed.
- **Accessibility and ratchets:** axe in both themes on every route in this phase; the type-floor and raw-hex ratchets are lowered.
- **Visual:** screenshots at 390 and 1440, light and dark.
- **Standard gates.**

## Out of scope

New library or skills content (the skills snapshot comes from `scripts/sync-skills.mjs`), and unhiding the blog or press.
