# FDE positioning: SEO, AEO and GEO pass (report, 10-11-26)

**Plan:** `../completed/fde-positioning-eo_PLAN_10-11-26.md`.
**Research:** `fde-positioning-seo-aeo-geo_REPORT_09-11-26.md`.
**Goal:** make Kunanon Jarat stand out to recruiters, search engines and AI
answer engines for Forward Deployed Engineer and AI engineering roles, and
publish a reusable solopreneur operating model.

## Owner answers used

- **Availability:** open to FDE and AI engineering roles, in Bangkok or
  remote.
- **Manut AI:** described as an ERP/CRM workspace with Intelligence AI.
- **Label:** "Solopreneur".
- **Customer-facing work** (Manut AI customers, GoGoCash merchants, client
  projects and workshops): stated in general terms only.

## Shipped

| PR  | Scope |
| --- | --- |
| #89 | Crawlable navigation: the site menu is server-rendered on every page |
| #92 | **EO-1, identity:** `lib/content/identity.ts` leads with the AI Engineering Lead role and feeds the JSON-LD (Person with `alumniOf`, `memberOf` and evidenced `knowsAbout`), `/about`, the FAQ, the meta descriptions and llms.txt (with a Roles timeline). `/agents.md` and `/sitemap.md` are generated from content; sitemap `lastmod` is truthful; Manut's wording is consistent; Home links its venture and project pages |
| #93 | **EO-2, answer surface:** `/topics/forward-deployed-ai-engineering` in English and Thai, built only from quoted portfolio facts; FAQ answers on the AI systems shipped and on Superstacks; Superstacks pack JSON-LD; `/llms-full.txt`. Loaders are split out of the entry chunk |
| #95 | Portfolio byline "By Kunanon Jarat · role" on every project (in 7e) |
| #96 | **EO-3:** the solopreneur operating model on `/about#how-i-ship` and as `/operating-model.md`; portfolio CreativeWork and CollectionPage JSON-LD; the venture's Organization as SoftwareApplication provider; the invalid Manut hreflang removed; meta descriptions clamped to 158 characters; `/about` share card; robots names the search, citation and model crawlers. Parity now uses `tests/fixtures/site-parity.json` |

## Open, for the owner

- **#40:** verify Google Search Console and Bing, submit the sitemap and turn
  on Crawler Hints. Bing's index feeds Copilot and ChatGPT search.
- **#41:** `www` to apex, 301.
- **Off-site profiles:** set the GitHub profile website to kunanonj.com,
  point the Superstacks repo homepage at `/skills`, and update the LinkedIn
  headline and About to match `identity.ts`. Add Wikidata and Crunchbase when
  ready, then add their URLs to `sameAs`.
- **Specifics for later passes** (not invented now):
  - names, counts or dates for customer work;
  - evaluation or production numbers for ARIA and Fando;
  - an as-of date for the GoGoCash metrics.
- **Measurement:** run the citation spot-check (research report section 8) now,
  then again 2 and 6 weeks after these PRs.
