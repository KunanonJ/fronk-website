# Phase 0: Parity harness

**Status:** EXECUTED 09-11-26. Reference: 120 URLs; local Next and production diff clean. Report: `../reports/phase-0_parity-harness_REPORT_09-11-26.md`.
**Created:** 09-11-26
**Umbrella:** `tanstack-migration_UMBRELLA_PLAN_09-11-26.md`

## Objective

A single, framework-agnostic record of everything a crawler or user can observe on each URL, taken from the current Next build. It is the reference that Start must match.

## Steps

1. **`scripts/parity-crawl.mjs <base> <out.json>`**:
   - the route list is the sitemap at `<base>/sitemap.xml` plus a fixed list: hidden and system pages, text endpoints (`/robots.txt`, `/sitemap.xml`, `/feed.xml`, `/llms.txt`, `/skills.json`, `/skills.md`, `/sitemap.md`, `/agents.md`, `/.well-known/security.txt`, `/manifest.webmanifest`), the 9 config redirects, a trailing-slash case and two known 404s;
   - fetched with `redirect: "manual"`;
   - recorded per URL:
     - status and `location`;
     - the headers `content-type`, `x-robots-tag`, `cache-control`, `content-security-policy`;
     - for HTML: `<html lang>`, the `<main lang>` attribute, title, the normalised `meta`/`link` tags (framework asset tags dropped, hashed OG URLs normalised), JSON-LD (parsed) and the visible `h1`;
     - for text endpoints: the body (or a hash, for files over 64 KB).
2. **`scripts/parity-diff.mjs <a.json> <b.json>`:** per-URL differences grouped by kind (status, redirect, head, JSON-LD, body). Exits 1 when they differ. An `--ignore` list covers known, intended differences (e.g. the OG image URL scheme, documented in the plan that introduces it).
3. **Reference:** crawl the local Next Workers preview (`pnpm build:cloudflare && opennextjs-cloudflare preview`) into `../references/next-parity_09-11-26.json`, using `NEXT_PUBLIC_SITE_URL=https://kunanonj.com` so absolute URLs match production.
4. **Unit tests** for the normaliser and the diff (`lib/parity/*.test.ts` with the shared helpers in `lib/parity/`).

## Gates

- The crawl covers every sitemap URL plus the fixed list (count in the report).
- Diffing the reference against itself is clean. Diffing it against a production crawl shows only expected differences: none, or listed in the report.
- Standard gates.
