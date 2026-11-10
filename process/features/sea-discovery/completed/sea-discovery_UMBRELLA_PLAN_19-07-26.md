# SEA Discovery Growth — Umbrella

**Date**: 19-07-26  
**Complexity**: Phase program  
**Status**: COMPLETE (closed 10-11-26; the remaining steps are the owner's)  
**Feature**: `sea-discovery`  
**Locks**: **1C** full growth stack (SEO + AEO/GEO + SEM + LinkedIn) · **2C** dual entity (personal + product/category hubs)

## Goal

Make kunanonj.com the primary discoverable authority for AI transformation, ERP/CRM, internal systems, and tech startups in Thailand/SEA — across Google, AI answer engines, paid search, and LinkedIn.

**Wave 2 (13-09-26):** name-first then category — fix crawl/AEO blockers, align Person entity off-site, merge cornerstone blog into the index graph, then distribute via LinkedIn Articles + selective directories.

## IA reconciliation with landing-cutover

Cinematic marketing shell stays `/` + `/showcase`.  
**Indexed authority surfaces stay (do not redirect away):**

| Path | Role |
|------|------|
| `/about` | Person entity |
| `/blog`, `/blog/[slug]` | Content cluster engine |
| `/contact` | Conversion. (`/press` hidden 04-11-26 at owner request: unlinked, noindex, out of sitemap/llms. Its items linked to own sites, not real coverage.) |
| `/topics/*` | Category pillars (EN) |
| `/th/topics/*` | Thai pillar mirrors |
| `/ventures/[slug]` | Product case hubs (Manut, GoGoCash) |

`/ventures` (index) may still redirect to `/#ventures`. System routes `/resume`, `/studio` remain noindex.

## Phases

| Phase | Plan | Proves |
|-------|------|--------|
| 0 Measurement | `phase-0_measurement_PLAN_19-07-26.md` | Keyword map, GSC/GA4/GTM, crawl baseline |
| 1 Technical + AEO | `phase-1_technical-aeo_PLAN_19-07-26.md` | OG, JSON-LD, route shells, hreflang, sitemap/llms |
| 2 Content hubs | `phase-2_content-hubs_PLAN_19-07-26.md` | 3 pillars + 2 venture hubs + copy alignment |
| 3 Blog engine | `phase-3_blog-engine_PLAN_19-07-26.md` | Calendar + cornerstone fallback posts |
| 4 SEM | `phase-4_sem_PLAN_19-07-26.md` | Ads/LinkedIn via GTM, conversions, SEM brief |
| 5 Distribution | `phase-5_distribution_PLAN_19-07-26.md` | llms enrichment + LinkedIn playbook |
| 6 Operate | `phase-6_operate_PLAN_19-07-26.md` | Monthly operating loop |
| 7 Crawl + AEO unblock | `phase-7_crawl-aeo-unblock_PLAN_13-09-26.md` | Robots host, citation bots, GSC/CF matrix |
| 8 Entity pack | `phase-8_entity-pack_PLAN_13-09-26.md` | Person aliases, who-is, off-site drafts |
| 9 Content merge | `phase-9_content-merge_PLAN_13-09-26.md` | Merge fallbacks + calendar posts 5–12 |
| 10 Presence | `phase-10_presence_PLAN_13-09-26.md` | LinkedIn Articles + selective directories |
| 11 Audit fixes (DONE, #35) | `../completed/phase-11_audit-fixes_PLAN_04-11-26.md` | 04-11-26 audit P1 code fixes: Manut copy, /about h1, Thai lang/locale, RSS feed + discovery, blog hub links |

## Closeout (10-11-26)

Audited against the repo on 10-11-26. Every code item shipped; what remains needs the owner's accounts.

| Phase | Outcome | Plan now in |
|-------|---------|-------------|
| 0 Measurement | Done. The GA4 and GTM parts are superseded: analytics are Umami plus Cloudflare Web Analytics only since #99. | `completed/` |
| 1 Technical + AEO | Done, ported to TanStack Start (#72-#78). | `completed/` |
| 2 Content hubs | Done. A fourth pillar, forward-deployed-ai-engineering, was added in #93. | `completed/` |
| 3 Blog engine | Code done. The blog is hidden (`BLOG_PUBLIC = false`, #56) until the posts are expanded (#43). | `completed/` |
| 4 SEM | Superseded: the GTM, Ads and LinkedIn tags were removed in #99. The conversion events still go to Umami (`lib/analytics/track.ts`). | `completed/` |
| 5 Distribution | Done (llms.txt "Cite these canonical URLs", LinkedIn playbook). | `completed/` |
| 6 Operate | Done (`references/operating-loop.md`). | `completed/` |
| 7 Crawl + AEO unblock | Done, except GSC, Bing and Crawler Hints (#40) and AI Labyrinth (#39). | `completed/` |
| 8 Entity pack | Code done. Off-site profiles are the owner's job; drafts were refreshed 10-11-26 in `references/entity-offsite-drafts.md`. | `backlog/` |
| 9 Content merge | Code done. Blog hidden as above. | `completed/` |
| 10 Presence | Briefs ready. LinkedIn Articles, directories and the monthly spot-check are the owner's job. | `backlog/` |

The IA table above is historical: `/blog` and `/press` are hidden, `/showcase` redirects to `/` (#53), and the indexed set is now in `references/crawl-baseline.md`. The SEM part of the lock (1C) was dropped with GTM. The follow-on FDE pass is in `reports/fde-positioning-eo_REPORT_10-11-26.md`.

## Out of scope

- Ranking guarantees / black-hat SEO
- Separate agency domain
- Full Thai localization of cinematic landing
- Production deploy without explicit approval
