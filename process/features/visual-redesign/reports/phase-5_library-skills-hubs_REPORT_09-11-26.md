# Phase 5 report: Library, Skills, hubs and resume (09-11-26)

**Plan:** `../completed/phase-5_library-skills-hubs_PLAN_09-11-26.md`
**Branch:** `feat/redesign-library`
**Mode:** EXECUTE under the owner's standing approval (Phases 3-6).

## What changed

- **Library pages** (Learn, Examples, Stack, Proof, Build):
  - a shared `LibraryLinkCard` (the same Paper card and hover lift as the portfolio cards) and a section heading row with a mono count;
  - **Stack:** tables in Paper cards, with a 12 px mono `<thead>` and `<th scope="row">` names;
  - **Proof:** metrics are a `<dl>` stat grid whose column count always fills each row;
  - **Build:** columns on the Mist well with decorative status squares (Next outline, In progress Signal, Shipped Ink);
  - **Examples:** the persona switch was a tablist without arrow keys; it's now a group of `aria-pressed` toggles with a polite result-count announcement.

  Stack, Proof and Build no longer ship as client components.
- **Skills** (index and 20 detail pages):
  - the shell, badges (now `Chip`, which gains an optional `title`), command blocks on the well, install tabs (Ink active pill) and the CSS-only filter are all on tokens;
  - component focus rings are removed, so the site-wide ring applies; the filter labels draw it via `has-[:focus-visible]`;
  - `CopyButton` gains a visible failed state: an Ember square plus the word "Failed", in a fixed-width slot.

  `/skills.json` and `/skills.md` are untouched.
- **Topic hubs (EN and TH) and venture hubs:**
  - restyle only: tokens, Signal square bullets, hairline FAQ rows (still `<dl>`), link rows with 48 px targets, a Signal CTA, and a `<dl>` metric strip on venture pages;
  - Thai pages relax the display line-height and tracking for Thai marks, and use the sans stack for the eyebrow (Geist Mono has no Thai);
  - `<main lang="th">`, canonical, hreflang, JSON-LD, FAQ text, related links and analytics `data-*` attributes are unchanged.
- **`/resume`:**
  - on tokens: a Geist h1 with a Signal full stop, numbered Geist section headings (`aria-labelledby`), the org on its own line, and mono periods;
  - the hairline under the header is dropped, because the first section draws one;
  - `CompanyLogo` is now a Server Component reading self-hosted logos (`lib/content/companyLogos.ts`, `public/brand/companies/`): 12 company favicons, plus the GoGoCash and Manut marks from `public/brand/`;
  - companies with no usable icon get an initials tile: 5 whose favicon 404'd on DuckDuckGo, and bsa.or.th, whose only icon is 16 px. A replacement wasn't trusted: for aidenlabs.ai, Google's favicon service returns GoDaddy's parking icon;
  - the `icons.duckduckgo.com` dns-prefetch is gone;
  - the print stylesheet also forces the new role tokens light;
  - the PDF script loads the lazy logos before printing.
- **Hidden pages** (blog, post, press, editorial stub): token compatibility only. 12 px labels, `dark:prose-invert` (`prose-invert` made headings unreadable in light mode), a readable placeholder, and the active filter pill on Ink.
- **Ratchets:** sub-12 px text 19 → 3 (the remainder is `TelemetryHUD`, `LocationPill`, `Badge`: legacy components for Phase 6). The portfolio workflow step label (10 px) is fixed too.

## Verification Evidence

| Gate | Result |
|---|---|
| Hub parity (all 8: `/topics/*`, `/th/topics/*`, `/ventures/*`) | Production (before) vs. preview (after): the head tag set (framework asset tags excluded, OG hash normalised), JSON-LD and FAQ text are identical, and `<main lang="th">` is kept. **PASS.** Tag *order* differs between production and the local preview on unchanged routes too (`/contact`), so it is environmental; it is re-checked prod-to-prod after deploy |
| `/resume` network | New e2e test: logos render (`naturalWidth > 0`) and no image request leaves the origin. Preview: 20 logo images, 8 initials tiles |
| e2e smoke + a11y (desktop + mobile, axe in both themes) | 120/120. The three hub routes were added to the suite: EN topic, TH topic, venture |
| Scripted review (20 routes × 2 viewports × 2 themes) | Clean |
| LCP (phone, throttled, cold) | `/skills` 1.09 s, `/skills/verify-loop` 1.11 s, `/learn` 1.00 s, `/stack` 1.00 s, `/resume` 1.02 s, EN topic 1.02 s, TH topic 1.12 s (Noto Sans Thai loaded), venture 0.97 s. CLS 0 and no text under 12 px on all of them |
| `perf:budget` | Pass. Hubs 183.9 KB (205 KB budget), `/resume` 182.5 KB, `/skills` 235.7 KB (300 KB) |
| Print / PDF | Print media in both themes renders light: Paper, Ink, Geist and Geist Mono (no Menlo fallback), Download button hidden. The PDF was rendered to a scratch file for review; the committed `public/resume.pdf` is unchanged |
| `pnpm typecheck` / `lint` / `test` | Pass; 0 errors; 517 tests (new: `lib/content/companyLogos.test.ts`) |
| Visual | Screenshots at 1440 and 390, light and dark, for all Phase 5 routes. Reviewed; two fixes came from the review (the Proof grid's empty cell, the doubled hairline on `/resume`) |

## Decisions and notes

- **Hubs keep no top nav.** Adding the landing nav cost about 51 KB of first-load JS (234.6 KB against the hubs' 205 KB budget). The plan says "restyle only", so the nav was taken back out. Giving the hubs the nav (and the 300 KB marketing budget) is an owner call. It may become cheaper once Phase 6 settles framer-motion.
- **`public/resume.pdf` isn't regenerated here.** The local preview has no Sanity config, so the PDF would carry fallback content, not the CMS résumé. After deploy, regenerate it against production (`RESUME_URL=https://kunanonj.com/resume pnpm pdf`) and review it before committing.
- **Small targets left on `/skills`:** inline links inside sentences, visually hidden filter radios (their labels are the 40 px targets) and the skip link, all exempt under WCAG 2.5.8. The four credit-card title links now have a 24 px minimum.
