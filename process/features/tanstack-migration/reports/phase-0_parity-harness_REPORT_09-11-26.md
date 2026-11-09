# Phase 0 report: parity harness (09-11-26)

**Plan:** `../active/phase-0_parity-harness_PLAN_09-11-26.md`
**Branch:** `feat/start-plan` (shipped with the program plans)

## What changed

- `lib/parity/parity.mjs`, plain ESM shared by the scripts and the tests:
  - an attribute parser;
  - head-tag normalisation (framework asset tags dropped, hashed OG/icon URLs normalised, attribute order and case ignored);
  - JSON-LD and page-fact extraction (`<html lang>`, `<main lang>`, title, h1);
  - timestamp masking for text bodies;
  - a link finder and a per-URL diff with an ignore list. Unit tests: `lib/parity/parity.test.ts` (7).
- `scripts/parity-crawl.mjs <base> <out>` crawls:
  - the sitemap, discovered links, hidden and system pages;
  - 10 text endpoints, 10 redirect cases (9 config redirects plus a trailing slash), 4 known 404s and the contributions API;
  - every OG image and icon referenced in a head.

  It runs against any base URL.
- `scripts/parity-diff.mjs <a> <b> [--ignore path:field] [--only paths]` exits 1 on any unlisted difference.
- **Reference:** `../references/next-parity_09-11-26.json`, crawled from the local Next Workers preview built with production URLs. It covers 120 URLs: 63 HTML pages, 30 OG images and 2 icons (fetched by their real hashed URL, keyed by the normalised path), 10 redirects (all 308), 4 real 404s and the text bodies.

## Verification Evidence

| Check | Result |
|---|---|
| Reference vs itself | 0 differences |
| Reference (local Next) vs production crawl | 0 differences across 120 URLs, after masking the RSS `lastBuildDate`, the only per-request value |
| Unit tests | 7/7 |

## Notes for Phase 1+

- The Thai topic pages carry `<html lang="en">` with `<main lang="th">` (a known Next debt). Fixing it in Start is an intended difference: `--ignore /th/topics/...:htmlLang`, or update the reference once both agree.
- OG image URLs will change scheme in Start (Phase 3). The normaliser already strips the Next hash, so only the path matters.
