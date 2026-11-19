# Venture brand logos, continued (19-11-26)

Status: done (#140 merged and live 19-11-26; owner picked all four items)

Continues `7c23247` (feat(landing): use brand logos on venture cards, 19-07-26),
which is in `main`. GoGoCash and Manut AI marks already show on the home stack
cards, the case-study hero and media, /proof and the blog's venture rows.

## Work

1. **Logos in JSON-LD.** The founded `Organization` nodes (GoGoCash, Manut AI)
   get `logo`: the 256 px PNGs in `public/brand/` (Google's Organization logo
   needs 112 px or more, crawlable). The parity reference is re-crawled for the
   intended JSON-LD change and diffed to show nothing else moved.
2. **Logos on share cards.** `/ventures/{gogocash,manut}/opengraph-image` shows
   the venture's mark beside the name and tagline. `OgCard` takes an optional
   `mark`; cards without one keep their exact layout (every other share image
   hashes the same).
3. **Remove the Airplusauto files.** `public/brand/airplusauto.{png,svg}`: the
   venture was dropped on 09-11-26 and nothing references them.
4. **Dark-mode check.** Every place a venture logo shows, in light and dark;
   fix any mark that loses contrast.

## Touchpoints

`lib/content/ventures.ts` (a PNG mark per venture), `lib/seo/jsonLd.ts`,
`lib/og/card.tsx`, `lib/og/ventureMarks.ts` (new), `src/server/og/ventureOg.tsx`,
`public/brand/`, `tests/fixtures/site-parity.json`, tests beside each.

## Public Contracts

- JSON-LD: two `logo` fields added; nothing else changes.
- `/brand/airplusauto.png` and `.svg` answer 404.
- The two venture share images change; every other image is byte-identical.

## Blast Radius

Every page carrying the site graph (the founded organizations), two share images.

## Verification Evidence

- typecheck, lint, format, knip; 1,543 unit tests (4 new: the logo per founded
  Organization, the mark only when given, each bundled mark equal to its
  `logoPng` byte for byte, none for an unknown slug); build; `perf:budget`
  (worst page 194.2 KB)
- parity: 137 URLs, 0 differences after the reference took the two `logo`
  fields on 66 pages (a fresh crawl, compared per JSON-LD entry: nothing else moved)
- full capture of 197 requests against `main`: with the two `logo` fields
  stripped, only `/ventures/{gogocash,manut}/opengraph-image` differ; every other
  share image and icon hashes the same
- the two cards rendered and reviewed: the mark sits at the measure's right edge,
  in line with the rule's end, and the text keeps its spacing
- dark-mode check (Playwright, light and dark, reduced motion for the home stack):
  the home stack cards, the case hero, /proof and the blog's venture rows. Every
  mark sits on its own tile (GoGoCash green, Manut navy with a visible edge), so
  none loses contrast; no change needed

## Resume and Execution Handoff

Branch `feat/venture-brand-logos` off `main` at `0119650`. Gates as for #133;
PR, CI, squash-merge, live checks, cleanup.
