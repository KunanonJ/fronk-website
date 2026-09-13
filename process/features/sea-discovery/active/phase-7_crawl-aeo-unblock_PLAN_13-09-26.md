# Phase 7 — Unblock crawl and AEO

**Parent**: `sea-discovery_UMBRELLA_PLAN_19-07-26.md`  
**Status**: DONE (code) · Cloudflare/GSC owner actions remain  
**Date**: 13-09-26

## Goal

Make crawlers and Search Console trust kunanonj.com: correct robots Host/Sitemap, citation-bot allowlist, documented Cloudflare AI crawl matrix, GSC verification hook.

## Acceptance

- [x] `robots()` never emits `fronk.example.com` in production
- [x] Citation user-agents explicitly Allowed; training scrapers (CCBot, Bytespider) Disallowed
- [x] Unit test asserts robots sitemap host is never the example fallback
- [x] Crawl baseline documents Cloudflare AI Crawl Control matrix + GSC submit checklist
- [ ] Owner: Cloudflare dashboard — stop blanket-blocking GPTBot / ClaudeBot (keep ai-train=no if desired)
- [ ] Owner: set `NEXT_PUBLIC_GSC_VERIFICATION` in Workers vars; submit sitemap in GSC; request index for `/`, `/about`, topic hubs, venture hubs

## Green check

Local/unit: robots host is `https://kunanonj.com` under production NODE_ENV.  
Production (after deploy + CF): `curl https://kunanonj.com/robots.txt` shows `Sitemap: https://kunanonj.com/sitemap.xml` and does not Disallow citation bots at the app layer.
