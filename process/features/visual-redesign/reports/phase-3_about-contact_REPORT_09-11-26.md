# Phase 3 report: About and Contact (09-11-26)

**Plan:** `../active/phase-3_about-contact_PLAN_09-11-26.md`
**Branch:** `feat/redesign-about-contact`
**Mode:** EXECUTE under the owner's standing approval (09-11-26) to run Phases 3-6 and merge each on green checks.

## What changed

### About
- **Hero** (`components/landing/about/AboutHero.tsx`): the same centered-portrait layout, now on tokens.
  - Geist display h1 (the Instrument Serif inline style is removed);
  - a mono "Fronk · Bangkok, Thailand" line;
  - a Signal "Contact me" pill and a hairline "See my work" pill;
  - token socials and a Glaze glow.
- **Sections** (`components/landing/AboutPageContent.tsx`), rewritten on tokens:
  - Geist h2s, 12 px mono eyebrows, body text in `ink-2`;
  - principles as Paper cards; stack and path as hairline chips;
  - CTA pills (Signal primary, hairline secondary).
- **Jump list** (finding 14): an "On this page" nav (Story, How I work, Now, Stack, Path, FAQ). Plain anchors to the existing section ids; it scrolls sideways on phones.
- **FAQ:** a no-JS `<details>` accordion with the first item open. Question and answer text are identical to `FAQ_ITEMS`, so the FAQPage JSON-LD still matches (unit-tested).
- **Inline links:** they get `py-0.5`, lifting them to a 24 px+ hit area without changing the layout.
- **GitHub activity** (`components/landing/ContributionActivity.tsx`):
  - heatmap levels use the link colour (Signal in light, the lighter blue in dark) through `activityLevelClass` in `lib/github/contributions.ts`. The old cream fill was nearly invisible on the light page.
  - Headings use tokens.

### Contact (`components/landing/FormaContactPage.tsx`)
- **Gone:** the CloudFront sky video, the text-shadow workaround and the Inter inline font.
- **Layout:** the headline column ("Building in fintech, AI or ops? Let's talk." with the accent word in the link colour), plus one Paper form card (`rounded-panel`, `shadow-card`) on a Glaze-to-Clay wash.
- **Fields:** 12 px mono labels are now visible (they were screen-reader-only). Inputs use tokens, topic chips are 36 px toggles, and submit is a 48 px Signal pill.
- **Error state:** an Ember square beside the error text (`--error-text`) on Paper, with the mailto fallback in the `aria-live` region.
- **Success:** a token success state.
- **Unchanged behaviour:** the honeypot, `elapsedMs` timing, `aria-pressed` chips in a `fieldset`/`legend`, the 20 KB limit and the API contract (the existing tests pass, plus a new Ember assertion).

### Ratchet
- Sub-12 px text: 27 → 24.

## Verification Evidence

| Gate | Result |
|---|---|
| LCP (phone, 4x CPU, ~1.6 Mbps, 150 ms RTT, cold) | `/about` 0.97-1.08 s (portrait); `/contact` 0.98-0.99 s (text; was 8.0-8.7 s with the video) |
| Sub-12 px text / sub-24 px targets (probe, 390 px) | `/about` 12 → 0 / 14 → 1; `/contact` 0 / 1 (the 1 is the visually hidden skip link) |
| JS (`perf:budget`) | `/about` 239.4 KB, `/contact` 237.6 KB (within budget) |
| Contact error state (local preview, no email secrets, so a 503) | The Ember marker and error text show, the text is kept, and the mailto link works; screenshots reviewed in both themes |
| FAQ parity | `AboutPageContent.test.tsx`: 5 `<details>`, text identical to `FAQ_ITEMS`, the first open |
| `pnpm typecheck` / `lint` / `test` | Pass; 0 errors; 93 files, all pass |
| `pnpm build:cloudflare` / `perf:budget` | Pass |
| e2e smoke + a11y (desktop + mobile, both themes) | 100/100 |
| Scripted review (20 routes × 2 viewports × 2 themes) | Clean |

## Notes

- **GitHub year grid:** it reads "0 contributions" on the local preview because it can't reach GitHub there. Production's `/api/github/contributions` returns data (16,565 contributions).
