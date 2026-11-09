# FDE positioning: SEO, AEO and GEO pass

**Status:** READY. Runs after Phase 7 (bento) lands.
**Created:** 10-11-26
**Research:** `../reports/fde-positioning-seo-aeo-geo_REPORT_09-11-26.md`. It
holds the fact inventory, the claims to avoid, the query targets and the full
item list (P0-x, P1-x, P2-x) that this plan schedules.
**Owner goal:** make kunanonj.com stand out to recruiters, search engines and
AI answer engines for **Forward Deployed Engineer** and AI engineering roles,
and present a reusable **solopreneur** operating model for other projects.

## Owner answers (10-11-26)

- **Roles:** the site may say he is open to FDE and AI engineering roles,
  based in **Bangkok or remote**. Relocation and travel are not offered.
- **Manut AI:** "an ERP/CRM workspace with Intelligence AI for automotive
  SMEs". The `/resume` wording "self-hosted knowledge workspace" is stale; fix
  it (P0-4).
- **Label:** "**Solopreneur**". It describes how he works, never Manut's market.
- **Customer-facing work:** may be stated publicly, in general terms only:
  - Manut AI customers;
  - GoGoCash merchant partners;
  - client projects and workshops.

  No names, counts or dates were given, so none may appear.
- **Already done:** crawlable site navigation (P0-1, report Q14). #89
  server-renders the menu on every page.

## Defaults (no owner answer needed)

- **Name:** `Person.name` "Kunanon Jarat", with alternate names "Fronk" and
  "KunanonJ".
- **Wording:** keep "embedding search" and "deployable to Vertex AI Agent
  Engine". Do not use "RAG", "evals" or "guardrails" (report 3.3).
- **Résumé:** `/resume` stays noindex. The career timeline reaches engines
  through `/about`, llms.txt and llms-full.txt.
- **Dates:** no invented metric dates. Venture metrics get an `asOf` only once
  the owner gives one; until then, use the content's own date or none.

## PRs

| PR    | Items (report numbering) | Notes |
| ----- | ------------------------ | ----- |
| EO-1  | **Identity and facts.** P0-3: `lib/content/identity.ts`, with the summary leading with the AI Engineering Lead role, the open-to-roles line and solopreneur framing. P0-4: Manut wording. P0-5: Roles section and an `Updated:` line in llms.txt. P1-2: `alumniOf`, `memberOf` and evidenced `knowsAbout` on Person, plus `dateModified`. P1-6: `lib/content/freshness.ts` and a truthful sitemap `lastmod`. P1-7: generated `agents.md`/`sitemap.md`, `skills.md` and the stale stack wording updated. P0-1 rest: Home cards link venture and project pages, and an orphan check in the parity crawl | Any JSON-LD or meta change counts as an intended parity difference |
| EO-2  | **FDE answer surface.** P1-1: `/about` AI-work block, three FAQ answers and links. P1-3: portfolio CreativeWork JSON-LD (byline already in 7e). P1-4: skills pack JSON-LD. P1-5: an AI engineering pillar with FDE framing (EN; TH optional). P1-8: `llms-full.txt` and markdown twins | Customer-facing work stated generally (owner answer) |
| EO-3  | **Solopreneur model and polish.** P2-1: `lib/content/operatingModel.ts` rendered on `/about` or `/build`, plus `/operating-model.md`. P2-3: venture schema. P2-5: meta description lengths. P2-8: `/about` OG card. P2-9: explicit AI bots in robots. P2-4: stale copy | |
| Owner | P0-2: GSC and Bing verification, Crawler Hints, www 301 (#40, #41). P1-9: LinkedIn, GitHub and Superstacks homepage. Wikidata and Crunchbase when ready | Drafts refreshed by EO-1 |

## Gates (every PR)

- typecheck, lint (0 warnings), format, knip and unit tests pass. Every new
  content field gets a test proving it is drawn from repo facts (for example,
  the summary matches identity.ts).
- build, first-load budgets, visual baselines (regenerated for pages whose
  visible content changes), smoke and axe in both themes, and a clean
  production console sweep.
- Parity: titles, meta and JSON-LD change by design. Record every change in
  `src/ported-routes.json` `intended`. Status codes, canonicals and hreflang
  stay unchanged unless the item says otherwise.
- **Live checks after merge:**
  - `curl` `/llms.txt`, `/llms-full.txt`, `/agents.md` and `/sitemap.xml`;
  - parse the JSON-LD on `/`, `/about` and a portfolio page;
  - run the Rich Results Test on `/about`.
