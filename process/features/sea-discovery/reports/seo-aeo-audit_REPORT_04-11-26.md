# SEO / AEO audit: kunanonj.com - Report

**Date**: 04-11-26
**Scope**: live site (about 75 polite GETs) plus source. Search engines (Google, Bing), answer engines (ChatGPT search, Perplexity, Gemini/AI Overviews, Claude) and AI crawlers.
**Method**: labels compare each finding with the existing `sea-discovery` program: DONE (live and correct), PLANNED (in a phase plan, not complete), NEW (not covered).

## Verdict

The technical base is solid. Crawlers that don't run JS get real text and a single h1 on `/`, `/about` and `/blog`. robots.txt is clean, and AI crawlers receive 200. Canonical and OG tags are unique per route, the Person/WebSite/Organization graph is linked, and llms.txt is accurate. The weak points were search-engine verification (none visible), thin blog content, and contradictory facts on `/about`. Those hurt answer-engine citation more than any remaining markup gap.

## Status after 04-11-26

### Fixed the same day

| Finding | Fix |
|---|---|
| `/about` and FAQ JSON-LD described Manut as "workspace for solo entrepreneurs", contradicting every other surface | #35 |
| `/about` h1 was "Built for the curious" with template newsletter copy | #35 (h1 "Kunanon Jarat") |
| Thai pillars rendered `lang="en"` and `og:locale` `en_US` | #35 (`<main lang="th">`, `th_TH`) |
| `/feed.xml` empty (Sanity-only), no RSS `<link>` in any `<head>`, self link and site links pointed at the `/rss.xml` 308 | #35 |
| Hub paths in fallback blog posts were plain text, not links | #35 |
| Cloudflare: no `security.txt` | #34 (RFC 9116, expires 2027-11-01) |
| Colour contrast (WCAG AA) on all landing routes; light-mode cards dark-on-dark | #36 |

### Owner actions (need dashboards; not code)

1. **P0, search-engine verification.** No `google-site-verification` or `msvalidate.01` tag, no TXT record and no verification file. Verify a GSC Domain property by DNS TXT, submit `/sitemap.xml`, then import into Bing Webmaster Tools (Bing's index feeds Copilot and ChatGPT search). Enable Cloudflare Crawler Hints (IndexNow). GSC: PLANNED (Phase 7 owner item). Bing and IndexNow: NEW.
2. **P0, placeholder post.** `/blog/hello-world` is live (200, `index, follow`), with the description "Read the full note." and the fallback body. Unpublish it in Sanity. NEW.
3. **P0, thin blog content.** All 15 posts have 24 to 108 words of body and reuse 5 banners. Expand to 600+ words of first-hand detail, or noindex until then. NEW (Phase 9 shipped the posts without a length target).
4. **P1, `www` not redirected.** `https://www.kunanonj.com/about` returns 200 (canonical tags point to the apex). Add a Cloudflare 301 to the apex that keeps the path. NEW.
5. **Cloudflare Security Overview.** "Unproxied CNAME Record detected" (Moderate): record unidentified; public DNS probes of about 80 names found only the proxied apex/www. Check in the dashboard before proxying, since email, verification and self-TLS records break when proxied. "AI Labyrinth": recommended to archive, because the site's goal is AI-engine citation.

### P2 backlog (code, not yet scheduled)

- Remove the reverse-less Thai alternate on `/ventures/manut` (it points at `/th/topics/erp-crm-internal-systems`, which doesn't link back).
- Long titles and descriptions: `/ventures/manut` (title 92 characters, description 173), `/about` (title 79 characters with the name twice; use `title.absolute`), and Portfolio descriptions (161 to 202 characters).
- Venture SoftwareApplication JSON-LD: credit the Organization rather than the Person; no `offers` or rating, so it can't get a rich result; breadcrumb points at `/#ventures`.
- Sitemap `lastmod` is a fixed 2026-07-19 for every static route, and `dateModified` always equals `datePublished`.
- ~~`rel="me"` lists gogocash.co (a product, not a profile), against the Phase 8 rule.~~ Done 04-11-26: `IDENTITY_LINKS` in `lib/seo/identity.ts` lists profiles only, with a test.
- Root-layout canonical leaks onto `/studio` and the 404 page (which also carries both `noindex` and `index, follow`). Remove the root canonical.
- Portfolio: add CreativeWork JSON-LD (creator: Person). *(The Binary Holdings in `Person.worksFor`: done 04-11-26, added as an employer Organization without `founder`. `jobTitle` lists Founder, IT Manager and AI Engineering Lead.)*
- Home weight: about 244 KB gzip JS across 11 scripts, 9 font preloads, and a 73 KB `manut.png` preloaded for a 40px logo.
- Inferred, unverified: during ISR the sitemap and `/blog` omitted hello-world while llms.txt (force-dynamic) listed it. Sanity fetches during background revalidation may be returning empty. Check revalidation.

## Already good (DONE)

- robots.txt: sitemap and host point at the apex. Search and citation bots are allowed explicitly, GPTBot/ClaudeBot/Google-Extended/Applebot-Extended under `*`, and CCBot and Bytespider are blocked. No Cloudflare managed block in front.
- Bot access: 12 crawler user agents received 200 with the full `/about` (from a normal IP; confirm verified-bot handling in AI Crawl Control).
- No-JS rendering: one h1 and real text in the raw HTML on `/` (221 words), `/about` (915) and `/blog`.
- Metadata: unique canonical, OG and Twitter tags on all routes checked. OG images return 200 as 1200x630.
- JSON-LD: Person (3 alternate names, 5 sameAs), WebSite and 2 Organizations site-wide; ProfilePage and FAQPage on `/about`; FAQPage and BreadcrumbList on topics; BlogPosting on posts. All parse.
- hreflang EN/TH/x-default reciprocal on topic hubs; HTTPS 301, trailing-slash 308, legacy redirects match the crawl baseline, unknown paths 404, `/resume` and `/studio` noindex.
- llms.txt, agents.md, sitemap.md and skills.md return 200 and are linked from the footer.

## Still PLANNED in sea-discovery

Off-site profile alignment (Phase 8), and filling `reports/ai-citation-spotcheck.md` (empty; Phases 8 and 10).
