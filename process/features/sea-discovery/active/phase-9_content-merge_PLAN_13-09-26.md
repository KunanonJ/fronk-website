# Phase 9 — Publish category content that can rank

**Parent**: `sea-discovery_UMBRELLA_PLAN_19-07-26.md`  
**Status**: DONE (code)  
**Date**: 13-09-26

## Goal

Stop Sanity from hiding cornerstone posts; merge fallbacks by slug into blog index, sitemap, and llms.txt; ship editorial calendar posts 5–12 as first-person fallback notes with real hub links (no fabricated metrics).

## Acceptance

- [x] `resolveBlogCards` merges Sanity + fallbacks by slug (Sanity wins on collision)
- [x] Posts 5–12 added to fallback stock with body paragraphs
- [x] Editorial calendar statuses updated
- [x] Topic hub ledes already answer-first (no thin pSEO URL families)

## Green check

Unit tests cover merge behavior; sitemap/llms consumers use `resolveBlogCards` so cluster slugs appear alongside CMS posts after deploy.
