# FDE positioning: SEO, AEO and GEO pass for kunanonj.com - Report

**Date**: 09-11-26
**Feature**: `sea-discovery` (follows `seo-aeo-audit_REPORT_04-11-26.md`; does not redo it)
**Mode**: research and plan only. No code, content or config was changed.
**Scope**: live site (about 45 polite GETs on 09-11-26, Bangkok edge) plus source on branch `feat/phase-7b-about-contact-resume` (HEAD `32fb6b1`, Phase 7a bento live).
**Goal (owner)**: make Kunanon "Fronk" Jarat stand out for Forward Deployed Engineer (FDE) and other AI engineering roles across search engines, answer engines and generative engines, and present a reusable "solopreneur" concept (one person shipping products end to end).
**Hard rule applied**: every claim proposed here already exists in the repo or on the live site, with its file path. Anything that needs a new fact is an owner question (section 5).

---

## Verdict

The crawl and markup base from the 04-11-26 audit still holds: robots, canonicals, OG, Person/WebSite/Organization graph, FAQPage, hreflang on topic hubs, llms.txt and `skills.json` all work. The two things holding back the FDE goal are new:

1. **The Phase 7a bento chrome removed every crawlable navigation link.** The site menu renders only after a click (`components/bento/SiteHeader.tsx` line 102: `{menuOpen ? <SiteMenu .../> : null}`) and the canvas footer keeps only socials and the agents row. In server HTML, no page links to `/about`, `/learn`, `/proof`, `/build` or `/examples`, and only one page links to `/skills`. Crawlers that don't run JavaScript (GPTBot, ClaudeBot, PerplexityBot) and Google's link graph now reach these pages only through the sitemap and llms.txt.
2. **The entity says "fintech founder", not "AI engineer".** Person.description, the site description, llms.txt's opening, the `/about` who-is block and the FAQ "Who is" answer all describe a founder "building fintech and adjacent infrastructure". The strongest FDE evidence in the repo (IT Manager & AI Engineering Lead at The Binary Holdings since Nov 2025; ARIA, the Fando agents, the recruitment agent; the Superstacks skills) appears only on portfolio and skills pages that carry no name byline and few inbound links.

Both are fixable in `lib/content` and `lib/seo` with small chrome changes, and fit the remaining Phase 7 sub-phases (7b to 7g).

---

## 1. Current state

### 1.1 Already good (keep)

| Area | Evidence (09-11-26) |
|---|---|
| robots.txt | `*` allowed with `/studio` and `/api` disallowed; Googlebot, ChatGPT-User, OAI-SearchBot, PerplexityBot, Claude-User, Claude-SearchBot allowed explicitly; CCBot and Bytespider blocked; Host and Sitemap on the apex (`lib/seo/robots.ts`). GPTBot, ClaudeBot, PerplexityBot and OAI-SearchBot user agents got 200 on `/about` (from a normal IP, so Cloudflare verified-bot rules are not proven). |
| No-JS text | Server HTML carries real text and one h1 on every page fetched (`/about` 940 words, `/skills` 1,348, portfolio projects 433 to 451). |
| Head tags | Unique title, description, canonical, OG and Twitter on all 20 pages fetched; per-route OG images on portfolio, skills, topics and ventures. |
| JSON-LD | Site graph on every page (Person, WebSite, 3 Organizations with `@id` cross-links); ProfilePage + FAQPage on `/about`; FAQPage + BreadcrumbList on topics (EN and TH); SoftwareApplication on ventures; BreadcrumbList on portfolio and skills; SoftwareSourceCode on skill pages that credits adapted skills with `isBasedOn` and the person as `maintainer`, not author (`lib/seo/skillsJsonLd.ts`). All parse. |
| hreflang | EN/TH/x-default reciprocal on the three topic hubs; Thai pages render `lang="th"` and `og:locale` `th_TH`. |
| Agent surfaces | `/llms.txt` (11.5 KB, includes portfolio and all 20 skills), `/skills.json`, `/agents.md`, `/sitemap.md`, `/skills.md`, `/.well-known/security.txt` (expires 2027-11-01) all return 200; footer "For agents" row links them. |
| Honesty rules | Written into `lib/content/ventures.ts`, `portfolio.ts`, `skills.ts`, `faq.ts`; metrics only where corroborated. This is an asset for AI citation: nothing on the site needs retracting. |
| Blog | Hidden and `noindex, follow` (`BLOG_PUBLIC = false`); `/blog/hello-world` now noindex. |

### 1.2 Gaps found today

| # | Finding | Evidence | Severity |
|---|---|---|---|
| G1 | No crawlable nav. Menu renders only when opened; footer has no site links. | Server HTML of 20 pages: `href="/about"` appears 0 times; `/learn`, `/proof`, `/build`, `/examples` 0 inbound; `/skills` only from `/skills/verify-loop`. Home links only `/resume`, `/#ventures`, `/portfolio`, `/contact`. | P0 |
| G2 | Home cards don't link to the pages they describe. "See both ventures" points at `/#ventures` (the same page); Selected work items are not links. | `components/landing/home/HomeCards.tsx` lines 43, 90, 118 (only `/resume`, `/#ventures`, `/portfolio`). | P0 |
| G3 | Entity summary omits the AI engineering role. | Person.description and WebSite.description = `siteConfig.description` ("founder of GoGoCash, building fintech and adjacent infrastructure", `lib/site.ts`); `aboutPage.story.whoIs` and `entity-offsite-drafts.md` mention GoGoCash, Manut, EE, smart contracts, but not The Binary Holdings role; llms.txt opens with the same text. | P0 |
| G4 | Manut is described two ways. | `/resume` (live, from `lib/content/resumeTimeline.fallback.ts`): "Building an AI-augmented, self-hosted knowledge workspace." Everywhere else (`ventures.ts`, `faq.ts`, `landing.ts`, pillars, JSON-LD): "ERP/CRM workspace with Intelligence AI for automotive SMEs". The 04-11-26 audit fixed a similar contradiction on `/about`. | P0 |
| G5 | Search engines still unverified; `www` not redirected. | `dig +short TXT kunanonj.com @1.1.1.1` returns nothing; no `google-site-verification` or `msvalidate.01` meta on any page; `https://www.kunanonj.com/about` returns 200. Issues #40 and #41 open. | P0 (owner) |
| G6 | llms.txt has no career timeline. | `src/server/text/llms.ts` lists ventures, portfolio, skills, topics; roles appear only as portfolio "Role" lines. `/resume` is `noindex, nofollow`, so the timeline is invisible to engines. | P0 |
| G7 | Portfolio and skills pages don't name the person in visible text. | "Kunanon" appears once on `/portfolio/ai-automation` (the footer copyright); no byline or link to `/about`. Portfolio has only BreadcrumbList JSON-LD. | P1 |
| G8 | Person node is thin for an AI engineering profile. | `knowsAbout` = 5 market topics (AI transformation Thailand, ERP CRM, startups SEA, fintech, automotive SME software); no `alumniOf` although Kasetsart University is in resume data; no `memberOf`; Person.name is "Fronk Kunanon Jarat" while the h1, resume, GitHub and the Wikidata draft use "Kunanon Jarat". | P1 |
| G9 | No freshness signals. | Sitemap: 42 URLs, every `lastmod` = 2026-07-19 (portfolio is Nov 2026, Superstacks v6.1.1 was published 2026-10-06); ProfilePage has no `dateModified`; GoGoCash metrics (1,000+ users, 220+ merchants) carry no as-of date; `public/resume.pdf` was generated 2026-06-13 (PDF metadata) and has no Title. | P1 |
| G10 | Agent-facing docs are stale after the TanStack migration. | `/agents.md` and `/skills.md` say "Next.js 16" and OpenNext, `/agents.md` "Last updated: 2026-07-19"; `aboutPage.stack` lists "OpenNext / Cloudflare: kunanonj.com on Workers"; the public repo `KunanonJ/fronk-website` description says "Next.js 16 / Cloudflare Workers (OpenNext)". | P1 |
| G11 | No `llms-full.txt` and no markdown twins. | `/llms-full.txt` and `/about.md` return 404. | P1 |
| G12 | Off-site profiles point away from the site. | GitHub API: `blog` = LinkedIn URL (not kunanonj.com), bio "Builder of @mygogocash"; `KunanonJ/superstacks` has no homepage URL. Phase 8 owner items still unchecked. | P1 (owner) |
| G13 | Stale claims while the blog is hidden. | `pillars.ts` tech-startup proof "Public writing on shipping from Bangkok" and FAQ "the blog cluster posts"; `faq.ts` "founder, builder, and writer"; `buildBoard.ts` shipped cards KJ-21 (cinematic shell), KJ-23 ("Press + blog surfaces"), in-progress KJ-29 (pill nav, keyword tips), all retired or hidden. | P2 |
| G14 | 04-11-26 P2 items still live. | `/ventures/manut` hreflang `th` points to `/th/topics/erp-crm-internal-systems`, which does not link back; venture SoftwareApplication uses the Person as `provider`; long descriptions (portfolio 182 to 202 chars, skill pages about 191, Manut 173). | P2 |
| G15 | Core Web Vitals unmeasured. | No GSC, so no field data. Home transfers about 215 KiB gzip of JS+CSS across 15 script tags (measured 09-11-26; CI budget 200/255 KB first load exists); first-visit intro overlay plus the new celebratory finish. | P2 |

### 1.3 Earlier owner actions, still open (do not re-plan)

Issues #38 (unproxied CNAME), #39 (AI Labyrinth off, check AI Crawl Control), #40 (GSC + Bing + Crawler Hints), #41 (`www` 301), #42 (hello-world), #43 (expand 15 posts), #44 (portfolio screenshots), #45 (silent Sanity fetch failures), tracker #46. Phase 8 off-site clicks and the empty `reports/ai-citation-spotcheck.md` remain open.

---

## 2. Entity consistency matrix

| Field | JSON-LD (`lib/seo/jsonLd.ts`) | `/about` (`aboutPage.ts`, `faq.ts`) | llms.txt (`src/server/text/llms.ts`) | agents.md (`public/agents.md`) | Resume (`resumeProfile.ts`) | GitHub (live API) |
|---|---|---|---|---|---|---|
| Name | "Fronk Kunanon Jarat" (alt: KunanonJ, Kunanon Jarat, Fronk) | h1 "Kunanon Jarat", nickname "Fronk" | H1 "Fronk Kunanon Jarat"; body "Kunanon Jarat (Fronk / KunanonJ)" | "Kunanon Jarat (Fronk)" | "Kunanon Jarat" | "Kunanon Jarat" |
| Role line | jobTitle Founder, IT Manager, AI Engineering Lead; description = fintech founder | hero.role has all three; whoIs omits TBH role | fintech founder; roles only in portfolio entries | none | "Founder. IT Manager & AI Engineering Lead. Based in Bangkok." | "Builder of @mygogocash" |
| worksFor | Manut AI, GoGoCash, The Binary Holdings | same three | ventures + "Portfolio (internal tools built at The Binary Holdings)" | none | same + history | company "@gogocash" |
| Manut | ERP/CRM + Intelligence AI | same | same | "ERP/CRM + Intelligence AI" | "AI-augmented, self-hosted knowledge workspace" | n/a |
| Location | Bangkok, TH | Bangkok, Thailand | Bangkok, Thailand | Bangkok, Thailand | Bangkok | Bangkok |
| alumniOf | missing | FAQ: Kasetsart University | missing | missing | B.Eng. Electrical Engineering, Kasetsart University, Aug 2017 to Apr 2021 | n/a |
| sameAs / rel=me | X, LinkedIn, GitHub, Telegram, Farcaster | same links via footer (X, LinkedIn, GitHub) | same 5 + Discord handle | none | n/a | website field = LinkedIn |

Recommendation: one identity constant (P0-3) feeds every column; Person.name becomes "Kunanon Jarat" with "Fronk Kunanon Jarat" moved to `alternateName` (owner question Q2).

---

## 3. Fact inventory for positioning

### 3.1 FDE signals mapped to repo facts

What hiring guides describe as the FDE profile: embedding with the team that uses the system, writing production code against live systems, integrating messy existing tools, LLM work (agents, retrieval, evaluation, guardrails), owning adoption end to end, translating vague business problems into implementations, and explaining tradeoffs to non-technical stakeholders (Paraform guides, see Sources). Mapping to what the repo already proves:

| FDE signal | Repo facts (verbatim or near-verbatim) | Source file | Where on the site today |
|---|---|---|---|
| Builds inside a business, for its users | TBH Intranet "built to replace Zoho at The Binary Holdings, bringing HR, approvals, Thai accounting, expenses, CRMs and an AI assistant into one login-only web app"; "built around how the group works: several legal entities, Thai accounting requirements and multi-step approvals" | `lib/content/portfolio.ts` (tbh-intranet) | `/portfolio/tbh-intranet` (no byline) |
| Production AI assistant | "ARIA combines Gemini and Claude models with embedding search over internal knowledge"; "reads attachments and searches internal knowledge" | `portfolio.ts` (tbh-intranet) | same |
| Agents with a human in the loop | Fando: "Python agents on Google's Agent Development Kit with Gemini models, deployable to Vertex AI Agent Engine"; "Gemini checks that each clip is real match content and writes its title and caption"; "A Google Sheet as the human approval queue"; recruitment agent "scores resumes, grades take-home cases and sends interview invites, with human review for borderline candidates". Role: "AI Engineering Lead (team project)" | `portfolio.ts` (ai-automation) | `/portfolio/ai-automation` |
| Current AI leadership | "IT Manager & AI Engineering Lead", The Binary Holdings, Nov 2025 to present: "Owning IT infrastructure and operations across the group"; "Leading AI engineering: internal AI agents, automations and the intranet's AI assistant" | `lib/content/resumeTimeline.fallback.ts` | `/resume` (noindex), Home Experience card, `/about` hero.role |
| Integrations with existing systems | Gmail, Google Sheets, Bank of Thailand FX rates, PostHog (intranet); YouTube Data API, Apify, yt-dlp, Playwright publishing to a CMS (Fando); Avalanche P-Chain JSON-RPC and Resend (validator job); Gmail signature constraints (signature tool) | `portfolio.ts` | portfolio pages |
| Reliability and ops ownership | Validator job: four alert rules, "exit codes that hand off to a fallback when sending fails", daily snapshots "committed to the repo as an audit trail"; signature tool: "a deploy check blocks renames and a daily job confirms every image is still live" | `portfolio.ts` | portfolio pages |
| Quality gates (closest to evals) | Fando CI "runs ruff, mypy and pytest"; intranet CI "Vitest and Playwright"; Gemini acts as the relevance check before human approval. Superstacks skills `verify-loop` ("Define a deterministic check for the acceptance criteria, run it red, then iterate until green"), `verification-before-completion`, `test-driven-development`, `interrogate` (multi-model review) | `portfolio.ts`, `lib/content/skills.generated.json` | portfolio pages, `/skills/*` |
| Full-stack range | TypeScript, React/Next.js, Expo, NestJS on Cloud Run, MongoDB, Firebase (GoGoCash); Cloudflare Workers, Hono, Postgres + Prisma, R2 + Queues, Durable Objects (Manut); Python, FastAPI (agents); resume skills "AI / LLM integration", "Full-stack TypeScript" | `aboutPage.ts` stack, `stack.ts`, resume fallback | `/about#stack`, `/stack` |
| Agentic engineering practice | Superstacks v6.1.1 (published 2026-10-06), 20 MIT skills for Claude Code, Codex and Cursor; 8 original (gardening, intake-triage, mistake-to-constraint, sample-review, steer-miner, ticket-pipeline, verify-loop, workflow-profile), 12 adapted with credit (mattpocock/skills, obra/superpowers, cursor/plugins pstack) | `skills.generated.json`, `lib/content/skills.ts` | `/skills`, `/skills/*`, `/skills.json`, llms.txt |
| Requirements and translation | FICO Business System Analyst: "Gathered and validated business requirements; authored functional specs"; Playbux PM: "Liaised between engineering, stakeholders, and business units" | resume fallback | `/resume` only (noindex) |
| Stakeholder and vendor delivery | TBH Technical PM: "Owned vendor relationships and project documentation end-to-end"; Coins.co.th IT PM: "Collaborated with tech teams and external vendors; reported progress to stakeholders" | resume fallback | `/resume` only |
| Security background | Bitkub intern: "Conducted hands-on audits and contributed to security education"; Moralis "Ethereum Smart Contract Security" (Dec 2021) | resume fallback | `/resume` only |
| Working principles | "Stay close to the work... I review code, sit in support, and ship something most weeks"; "Ship the smallest thing that proves the bet"; "Optimise for reversibility"; "Document as you go" | `aboutPage.ts` principles | `/about#principles`, Home "How I work" |
| Method statement | "Start from the internal system of record (ERP/CRM), add Intelligence AI where judgment repeats, and prove value on one vertical first" | `lib/content/topics/pillars.ts` | `/topics/ai-transformation-thailand` |

Supported framing: "works the way a forward deployed engineer does: builds AI tools inside the business that uses them, integrates with the systems already there, and keeps a person on the judgement calls", backed by the TBH Intranet, AI Automation and validator rows above.

### 3.2 Solopreneur facts

| Fact | Source |
|---|---|
| GoGoCash, founded 2023: "I own the product end to end: merchant partnerships, the cashback engine, and the member experience, from first commit in 2023 to today." 1,000+ users, 220+ merchants, up to 30% cashback | `lib/content/ventures.ts` |
| Manut AI, started 2025: "I design and build the product: ERP/CRM structure, Intelligence AI workflows, and the operator experience from Bangkok." | `ventures.ts` |
| "The work that makes a small team feel like a much larger one." | `aboutPage.ts` story |
| Four operating principles (above) and a public build board (Next, In progress, Shipped) | `aboutPage.ts`, `buildBoard.ts` |
| Small, dependency-light tools: validator job "using only built-in modules"; signature tool "One HTML file with no framework and no build step" | `portfolio.ts` |
| The skills used to ship, grouped Plan, Build, Verify and ship, Operate | `skills.ts` `SKILL_STAGES` |
| kunanonj.com itself: TanStack Start on Cloudflare Workers, prerendered pages, edge cache purged by tag, CI with typecheck, lint, unit tests, build, first-load budget and Playwright smoke; public repo | `README.md`; repo visibility PUBLIC (`gh repo view`) |

Caution: the 04-11-26 fix removed "workspace for solo entrepreneurs" as Manut's audience. The solopreneur concept must describe how Kunanon works, never Manut's market.

### 3.3 Claims to avoid (not supported in the repo)

- "RAG", "evals", "guardrails", "observability", "fine-tuning" as named practices (the repo says "embedding search", CI checks and a Gemini relevance check; Q5).
- "Deployed on Vertex AI Agent Engine" (the repo says "deployable to"; Q4).
- Any user count, time saved or volume for the intranet, Fando or the recruitment agent (none in repo; Q5, Q6).
- External customer deployments, on-site client work, travel (none in repo; Q7).
- "Solo-built" for GoGoCash or the intranet (the repo says "Founded and lead the company" and gives a role, not team size; Q4, Q8).
- AI work at Aiden Labs beyond the title "AI Project Manager" (its bullets are roadmaps, ICO process and tokenomics).
- GitHub star counts or install numbers (`skills.ts` honesty rule).

---

## 4. Query targets

Expectation: a personal site rarely ranks on head terms; the realistic win is being the cited source when an engine answers "who in Bangkok/Thailand does X" or "who is Kunanon Jarat", and owning long-tail project queries.

| Query (EN unless noted) | Intent | Target page | Answer block that should satisfy it | Status |
|---|---|---|---|---|
| Kunanon Jarat; Fronk Kunanon Jarat; KunanonJ; Fronk Bangkok | Navigational / who-is | `/about` | Identity summary (P0-3) as first paragraph and FAQ Q1 | Exists, needs the AI role |
| Kunanon Jarat AI engineer; Kunanon Jarat The Binary Holdings | Who-is + role | `/about` | "AI engineering work" block (P1-1) | New block |
| forward deployed engineer Bangkok / Thailand | Talent discovery | New AI engineering pillar (P1-5) + `/about` | Definition paragraph, "How I work this way" list with portfolio links | New (Q1, Q11) |
| AI engineer Bangkok; AI engineering lead Thailand | Talent discovery | `/about`, pillar | Identity summary + evidence list | New |
| internal AI agents with human approval; Google ADK Gemini agents | Long tail / how-to | `/portfolio/ai-automation` | Existing "What it does" and "How it is built", plus byline | Exists, needs byline |
| replace Zoho with a custom intranet; Thai accounting intranet AI assistant | Long tail | `/portfolio/tbh-intranet` | Existing problem and build sections, plus byline | Exists |
| Avalanche L1 validator balance monitoring | Long tail | `/portfolio/node-validator-automation` | Existing | Exists |
| agent skills Claude Code; Claude Code skills TDD verify loop; Superstacks skills | Tool discovery | `/skills`, `/skills/verify-loop` | Skills page intro + pack JSON-LD (P1-4) | Exists |
| AI transformation Thailand (and Thai variant) | Category | `/topics/ai-transformation-thailand`, `/th/...` | Existing lede + FAQ | Exists |
| ERP CRM AI Thailand; AI ERP automotive SME | Category / product | `/topics/erp-crm-internal-systems`, `/ventures/manut` | Existing | Exists (resolve Q3) |
| GoGoCash founder; GoGoCash cashback Thailand | Product | `/ventures/gogocash` | Existing, add as-of date to metrics (P1-6) | Exists |
| Manut AI | Product | `/ventures/manut` | Existing | Exists |
| solopreneur Bangkok; solo founder fintech AI Thailand | Concept | Operating model section (P2-1) | Stages with evidence | New (Q8) |
| วิศวกร AI กรุงเทพ (AI engineer Bangkok, Thai) | Thai talent | TH mirror of the pillar | Thai summary | Optional (Q12) |

Add each target to `reports/ai-citation-spotcheck.md` (P1-10) and run a baseline before any change ships.

---

## 5. Owner questions

1. **Public intent.** May the site say you are open to FDE or AI engineering roles, given your current role at The Binary Holdings? If yes: location (Bangkok, remote, relocation), travel to customer sites, and the exact wording you accept.
2. **Name.** Should Person.name be "Kunanon Jarat" (matches h1, resume, GitHub, Wikidata draft) with "Fronk Kunanon Jarat" as an alternate name? Do you want a Thai-script name listed?
3. **Manut.** `/resume` says "AI-augmented, self-hosted knowledge workspace"; every other surface says "ERP/CRM workspace with Intelligence AI for automotive SMEs". Which is current? (Also fix the Sanity resume document if one exists.)
4. **AI Automation.** Team size and your own part (design, agent code, review)? Is Fando running in production? Was it deployed to Vertex AI Agent Engine or only deployable? Is the recruitment agent in use?
5. **ARIA.** May it be called retrieval-augmented (RAG)? Are there evaluation sets, guardrails or monitoring (PostHog is listed as an integration)? Any publishable numbers with a source and date (staff users, entities, modules live, requests, time saved)?
6. **TBH Intranet.** Is it live and has it fully replaced Zoho? Did you build it alone or lead a team?
7. **Customer-facing work.** Any delivery for external clients (Manut customers, GoGoCash merchant or affiliate integrations), on-site work, workshops or trainings? This is the biggest FDE gap; nothing in the repo covers it.
8. **Solopreneur.** Which products did you build alone? Preferred label: "solopreneur", "solo founder", "one-person product studio" or other? Should the model be exportable for other projects (for example `/operating-model.md`)?
9. **Resume.** Make `/resume` indexable (it holds the full career timeline), or keep it `noindex, nofollow` and expose the timeline through `/about` and llms.txt only?
10. **This repo as a portfolio item.** May the public `KunanonJ/fronk-website` (Next.js to TanStack Start migration proven by a parity crawl, CI gates) be listed as a public portfolio project?
11. **Home copy.** The Home h1 and lead are owner-approved canvas copy. Open to adding an AI engineering line (for example in `hero.homeLead`)? And may the new pillar use "forward deployed" in its slug or h1?
12. **Languages and Thai.** Languages to list (`knowsLanguage`)? Is a Thai mirror of the AI engineering pillar worth it?
13. **Metrics date.** As of which month are GoGoCash's 1,000+ users and 220+ merchants?
14. **Footer.** Phase 7 owner decision 4 kept only the agents row in the footer. Approve a second compact "Site" row (or always-rendered menu links) to restore crawlable navigation?
15. **Off-site.** Approve refreshed LinkedIn headline and About, GitHub bio and website, Superstacks repo homepage; timing for Wikidata and Crunchbase.

---

## 6. Implementation plan

Rules for every item: content in `lib/content/*`, structured data in `lib/seo/*`, text endpoints in `src/server/text/*`; route files only wire `head()` scripts; chrome components only render arrays from `lib/content`. Each item keeps the Phase 7 gates (typecheck, lint 0 warnings, knip, unit tests, budgets, visual baselines, parity with intended diffs recorded in `src/ported-routes.json`).

### P0: unblock crawl and fix the identity

**P0-1 Crawlable site links on every page** (G1, G2; needs Q14)
- Files: `lib/content/landing.ts` (new `footerSite` array: About, Portfolio, Skills, Ventures, Learn, Contact; derive from `primaryNav` so it can't drift), `components/bento/SiteFooter.tsx` (render it as a second mono row next to "For agents"), `lib/content/landing.ts` `ventures.cards[].href` already holds `/ventures/gogocash` and `/ventures/manut`: render them in `components/landing/home/HomeCards.tsx` instead of only `/#ventures`; make each Selected work item link `/portfolio/<slug>`.
- Effect: `/about`, `/skills`, venture and Library pages get inbound links in server HTML; non-JS AI crawlers can walk the site; Google's link graph stops relying on the sitemap alone.
- Verify: `curl -s https://kunanonj.com/ | grep -c 'href="/about"'` is at least 1 on every page; add a unit test on `footerSite`; extend `scripts/parity-crawl.mjs` (it already collects `internalLinks`) with an orphan report: every sitemap URL needs at least one inbound link from another crawled page; fail CI when one has none.

**P0-2 Search-engine verification and host** (G5; owner, issues #40, #41)
- Steps already written in #40: GSC Domain property by DNS TXT, submit `/sitemap.xml`, import into Bing Webmaster Tools, turn on Cloudflare Crawler Hints (IndexNow); #41: 301 `www` to the apex keeping the path.
- Effect: indexing and CWV data; Bing's index feeds Copilot and ChatGPT search.
- Verify: `dig +short TXT kunanonj.com @1.1.1.1` shows the token; GSC sitemap "Success"; `curl -sI https://www.kunanonj.com/about` returns 301 to `https://kunanonj.com/about`.

**P0-3 One identity summary that leads with the AI role** (G3, G8 name; needs Q2, Q3)
- Files: new `lib/content/identity.ts` exporting `PERSON_NAME`, `PERSON_ALTERNATE_NAMES`, `PERSON_SUMMARY`, `PERSON_HEADLINE`. Consumers: `lib/seo/jsonLd.ts` (Person.name, Person.description, WebSite.description), `lib/site.ts` (`description`), `lib/content/landing.ts` (`site.description` for the Home meta), `lib/content/aboutPage.ts` (`story.whoIs`, `meta.description`), `lib/content/faq.ts` (Q1 answer), `src/server/text/llms.ts` (opening paragraph), `process/features/sea-discovery/references/entity-offsite-drafts.md` (canonical who-is).
- Proposed `PERSON_SUMMARY` (every fact from `resumeTimeline.fallback.ts` and `ventures.ts`; Manut wording pending Q3): "Kunanon Jarat (Fronk / KunanonJ) is a Bangkok-based AI engineering lead and founder. As IT Manager & AI Engineering Lead at The Binary Holdings since November 2025, he leads internal AI agents, automations and the intranet's AI assistant. He founded GoGoCash, a shopping-to-earn cashback platform, in 2023 and builds Manut AI, an ERP/CRM workspace with Intelligence AI for automotive SMEs."
- Effect: the first sentence any engine extracts (JSON-LD, who-is, FAQ, llms.txt) names the AI role and employer; one source removes drift.
- Verify: a test in `lib/content/aboutPage.test.ts` / `faq.test.ts` that whoIs, FAQ Q1 and Person.description all equal or start with `PERSON_SUMMARY`; `curl /llms.txt | head`; JSON-LD parse on `/` and `/about`.

**P0-4 Resolve the Manut contradiction** (G4; needs Q3)
- Files: `lib/content/resumeTimeline.fallback.ts` (Manut bullet) or, if the resume wording is right, `ventures.ts`, `faq.ts`, `landing.ts`, `pillars.ts`, `buildBoard.ts`, `examples.ts`; plus the Sanity resume document.
- Effect: engines stop seeing two products under one name.
- Verify: `grep -rn "self-hosted knowledge workspace\|ERP/CRM workspace" lib/content` returns one wording; live `/resume` text matches.

**P0-5 Career timeline and AI work in llms.txt** (G6)
- Files: `src/server/text/llms.ts`: add `## Roles` (title, organisation, period only, from the resolved resume sections "Currently" and "Experience"), move the portfolio section above topics and rename it "AI engineering and internal tools (The Binary Holdings)", add `Updated: <date>` from P1-6.
- Effect: answer engines get the career timeline although `/resume` stays noindex.
- Verify: unit test on the generated text (roles present, no bullets beyond the source); `curl https://kunanonj.com/llms.txt | grep -A12 '## Roles'`.

### P1: build the FDE answer surface

**P1-1 `/about`: AI engineering block, FAQ additions, outbound links** (lands with 7b)
- Files: `lib/content/aboutPage.ts` (new `aiWork` block: heading, 3 items referencing portfolio slugs plus `/skills`; `meta.title` e.g. "Kunanon Jarat: AI engineering lead and founder, Bangkok", 54 chars), `lib/content/faq.ts` (new Q&As below), `cta.links` adds Portfolio and Skills.
- Proposed FAQ answers, wording from `portfolio.ts` and `skills.generated.json`:
  - "What AI systems has Kunanon Jarat worked on?" Projects from his role at The Binary Holdings include ARIA, the intranet's AI assistant, which combines Gemini and Claude models with embedding search over internal knowledge; and a team-built set of agents on Google's Agent Development Kit: Fando checks and captions sports clips with Gemini and queues them for human approval, and a recruitment agent scores resumes and grades take-home cases, with human review for borderline candidates.
  - "What is Superstacks?" Kunanon Jarat's MIT-licensed pack of 20 agent skills for Claude Code, Codex and Cursor (v6.1.1) covering planning, TDD, verify loops, code review and draft PRs; 8 are original and 12 are adapted from credited upstream packs.
  - "How does he approach AI work in a business?" He starts from the system the team already runs on and adds AI where the same judgement repeats, keeping a person on the final call: the TBH Intranet replaced Zoho around the group's entities, Thai accounting and approval chains, and the agents queue their output for human approval. (Sources: `pillars.ts` method, `portfolio.ts`.)
- Effect: `/about` answers "AI engineer" and FDE-style questions with citable sentences; FAQPage stays in parity with the visible FAQ. (Google shows FAQ rich results only for a few authoritative sites since 2023; the value here is AEO parity, not a SERP feature.)
- Verify: `faq.test.ts` parity; `curl /about` contains the new answers and links to `/portfolio/*` and `/skills`.

**P1-2 Person and ProfilePage enrichment** (G8, G9)
- Files: `lib/seo/jsonLd.ts` + `jsonLd.test.ts`; source lists in `lib/content/identity.ts`.
- Changes: `alumniOf` CollegeOrUniversity "Kasetsart University" (url from resume `logoDomain` ku.ac.th); `memberOf` Organization "Bangkok Startup Association" (bsa.or.th, Feb 2025 to present); `knowsAbout` adds only evidenced terms: AI agents, LLM integration, Google Agent Development Kit, Gemini, Claude API, human-in-the-loop automation, internal tools, full-stack TypeScript, Cloudflare Workers, agent skills for coding agents; `ProfilePage.dateModified` from P1-6; optional `og:type` `profile` with first name, last name and username on `/about` (`lib/seo/routeMeta.ts` gains a `profile` type).
- Effect: richer entity for knowledge panels and LLM grounding; freshness on the profile page.
- Verify: unit tests; Schema.org validator and Google Rich Results Test (ProfilePage) on `/about`.

**P1-3 Portfolio byline and structured data** (G7; lands with 7e; Q4, Q6)
- Files: `lib/content/portfolio.ts` (`portfolioPage.byline`, e.g. "Built by Kunanon Jarat (Fronk), IT Manager & AI Engineering Lead at The Binary Holdings", linking `/about`; optional per-project `contribution: "lead" | "team"` once Q4/Q6 answer), `lib/seo/jsonLd.ts` (`buildPortfolioProjectJsonLd`: CreativeWork with name, description, `creator` Person for own work or `contributor` Person for team projects, `sourceOrganization` The Binary Holdings `@id`, `keywords` from `stack`; `buildCollectionJsonLd` for `/portfolio` as CollectionPage + ItemList), `src/routes/_landing/portfolio/$slug.tsx` and `index.tsx` (head scripts only).
- Effect: engines can answer "who built X" from both text and schema; the AI work is tied to the person entity.
- Verify: unit tests (team project uses `contributor`); JSON-LD parse on the four project pages; byline present in server HTML.

**P1-4 Skills pack structured data and byline** (lands with 7d)
- Files: `lib/seo/skillsJsonLd.ts` (pack-level SoftwareSourceCode for Superstacks: `codeRepository` `SKILLS_REPO_URL`, `version`, MIT, `author` Person; CollectionPage + ItemList of skill `@id`s), `src/routes/_landing/skills/index.tsx`, `lib/content/skills.ts` (`skillsPage.byline` "Maintained by Kunanon Jarat").
- Effect: "agent skills Claude Code" answers can cite the pack and its author.
- Verify: unit tests; JSON-LD parse on `/skills`.

**P1-5 AI engineering pillar with FDE framing** (lands after 7c; needs Q1, Q11)
- Files: `lib/content/topics/pillars.ts` (new EN entry; slug options `forward-deployed-ai-engineering` or `ai-engineering-inside-the-business`; add to `TOPIC_SLUGS`), TH entry or make `topicHreflang` return only `en` + `x-default` when no TH pillar exists, `lib/content/learn.ts` picks it up automatically.
- Content outline (facts from section 3.1 only): lede defining the practice in general terms; "How I work this way" with three evidence items linking the portfolio pages; "Stack I ship with" from portfolio stacks; proof bullets (AI Engineering Lead since Nov 2025, ARIA, Fando with human approval, Superstacks); FAQ of three; related links to `/about`, `/portfolio`, `/skills`, `/topics/ai-transformation-thailand`.
- Effect: one indexable page for "forward deployed engineer Bangkok/Thailand" and "AI engineer Bangkok" with FAQPage, BreadcrumbList, OG image, sitemap and llms.txt entries for free.
- Verify: `pillars.test.ts`; `/topics/<slug>` 200 with FAQPage; listed in `/sitemap.xml` and `/llms.txt`.

**P1-6 Freshness signals** (G9; Q13)
- Files: new `lib/content/freshness.ts` (owner-maintained `updated` ISO date per route group and per venture metric `asOf`), `lib/seo/sitemap.ts` (use it instead of the fixed 2026-07-19), `lib/seo/jsonLd.ts` (ProfilePage `dateModified`), `src/server/text/llms.ts` (`Updated:` line), `lib/content/ventures.ts` (`metrics[].asOf`, rendered "as of <month year>" and repeated in llms.txt and FAQ). Regenerate `public/resume.pdf` with `pnpm pdf` after P0-4 (generator `scripts/generate-resume-pdf.mjs`; also set a PDF title if the generator allows).
- Effect: engines prefer dated stats and fresh pages; sitemap `lastmod` becomes truthful.
- Verify: test that no date is in the future and every sitemap route has one; `curl /sitemap.xml | grep lastmod | sort | uniq -c` shows more than one date.

**P1-7 Correct and generate the agent docs** (G10)
- Files: replace `public/agents.md` and `public/sitemap.md` with server routes following the `src/routes/llms[.]txt.ts` pattern, built in `src/server/text/` from `lib/content` (routes, owner summary from `identity.ts`, `Last updated` from P1-6); update `public/skills.md` from Next.js App Router guidance to TanStack Start; `lib/content/aboutPage.ts` stack item "OpenNext / Cloudflare" becomes "TanStack Start on Cloudflare Workers" (README states this). Owner: update the `KunanonJ/fronk-website` repo description.
- Effect: agents read accurate, current facts; no manual drift.
- Verify: `curl /agents.md` shows the current stack and date; unit test that every route in the generated sitemap.md exists in `getRouter` or the sitemap.

**P1-8 `llms-full.txt` and markdown twins** (G11)
- Files: `src/server/text/llmsFull.ts` + route for `/llms-full.txt` (identity summary, roles, every portfolio project with highlights and sections, venture case studies, topic FAQs, skills list); markdown twins for `/about`, `/portfolio/<slug>`, `/ventures/<slug>` generated from the same content; skill pages can serve the snapshot's SKILL.md (`skill.content`). Confirm the escaped-dot syntax for dynamic segments in the TanStack Router docs before naming the routes. Optional `<link rel="alternate" type="text/markdown">` in each page head.
- Effect: one fetch gives an engine the whole fact base; clean text for agents that prefer markdown.
- Verify: 200 with `text/plain` or `text/markdown`; unit test that the full file contains every portfolio slug and no blog content while `BLOG_PUBLIC` is false.

**P1-9 Off-site alignment** (G12; owner; Q15)
- Agent work: refresh `references/entity-offsite-drafts.md` with `PERSON_SUMMARY`; the LinkedIn headline draft ("Founder @ GoGoCash · Building Manut AI...") and GitHub draft ("Company: GoGoCash") omit the AI Engineering Lead role.
- Owner clicks: GitHub profile website to `https://kunanonj.com` (currently the LinkedIn URL) and bio; `KunanonJ/superstacks` homepage to `https://kunanonj.com/skills`; LinkedIn headline and About; Wikidata and Crunchbase when ready (then add their URLs to `sameAs`).
- Effect: consistent entity across the sources engines cross-check.
- Verify: `gh api users/KunanonJ --jq .blog`; `gh repo view KunanonJ/superstacks --json homepageUrl`.

**P1-10 Citation baseline and tracking**
- Files: `reports/ai-citation-spotcheck.md` (add rows for every query in section 4; 3 runs per engine), `references/operating-loop.md` (monthly check).
- Effect: evidence of whether the pass worked.
- Verify: baseline rows dated before P0 ships; re-run 2 and 6 weeks after.

### P2: polish and the solopreneur model

**P2-1 Solopreneur operating model** (Q8)
- Files: new `lib/content/operatingModel.ts`: stages reuse `SKILL_STAGES` ids (Plan, Build, Verify and ship, Operate); each stage lists the matching principle from `aboutPage.principles`, the skills from `getSkillsByStage`, and evidence links (GoGoCash end to end, Manut design and build, validator ops, signature tool, this site). Render as an `/about#how-i-ship` section (7b) or on `/build` (7f); export `/operating-model.md` (Q8) so other projects can reuse it.
- Effect: a citable, reusable "one person ships end to end" concept grounded in shipped work.
- Verify: test that every evidence link resolves to a known slug and every skill exists in the snapshot.

**P2-2 Resume exposure** (Q9): either index `/resume` (`src/routes/_system/resume.tsx` robots; it moves to `_landing` in 7b) without a second ProfilePage, or publish `/resume.json` in the JSON Resume format generated from the resolved resume sections.

**P2-3 Venture schema and hreflang** (G14): `buildSoftwareApplicationJsonLd` `provider` = the venture Organization `@id`; drop the one-way Thai alternate in `src/routes/_landing/ventures/$slug.tsx`.

**P2-4 Stale copy while the blog is hidden** (G13): `pillars.ts` (tech-startup proof and FAQ), `faq.ts` ("writer"), `buildBoard.ts` (KJ-21, KJ-23, KJ-29; already flagged in the Phase 7 design spec).

**P2-5 Description lengths** (G14): add `metaDescription` fields (about 150 characters) to `portfolio.ts` projects, the skill page builder in `skills.ts`, and `ventures.ts` Manut.

**P2-6 Thai coverage** (Q12): Thai pillar mirror and Thai-script `alternateName` only if the owner wants them.

**P2-7 Core Web Vitals** (G15): after GSC is verified, read the CWV report; run PageSpeed Insights on `/` and `/about` after each 7x PR; confirm the intro overlay never becomes the LCP element (Phase 7 plan rule: the hero h1 never starts invisible).

**P2-8 `/about` share card**: a dedicated OG image for `/about` (portrait + name + role) using the existing OG pipeline in `src/server/og/`.

**P2-9 Robots (optional)**: list `GPTBot`, `ClaudeBot`, `Perplexity-User` explicitly for auditability; behaviour is already "allowed" under `*`. Confirm Cloudflare AI Crawl Control does not block verified AI bots (#39).

**P2-10 Blog return**: when #43 is done, case write-ups of the portfolio projects are the best FDE content; flip `BLOG_PUBLIC` only then.

---

## 7. Sequencing with Phase 7

| When | Items |
|---|---|
| Now, independent of the redesign (lib and text only) | P0-3, P0-4, P0-5, P1-6, P1-7, P1-8, P1-10; owner P0-2, P1-9 |
| With 7b (About, Contact, Resume; current branch) | P0-1 footer row (shared chrome, re-baselines every page), P1-1, P1-2, P2-2, P2-1 if placed on `/about` |
| With 7c (Hubs) | P1-5, P2-3 |
| With 7d (Skills) | P1-4 |
| With 7e (Portfolio) | P1-3, P0-1 Selected work links if not done earlier |
| With 7f (Library) | P2-1 if placed on `/build`, P2-4 build board |

Parity note: the Phase 7 gate holds titles, meta, canonical and JSON-LD unchanged. Every JSON-LD and meta change above is an intended difference and must be recorded in `src/ported-routes.json`.

## 8. Measurement

- Baseline: citation spot-check (P1-10) and, once verified, GSC impressions for name and target queries.
- Crawl health: orphan report from `scripts/parity-crawl.mjs` (P0-1) on every PR.
- Entity: Rich Results Test on `/about`; manual check that `/about`, `/llms.txt`, `/agents.md`, LinkedIn and GitHub show the same summary.

## Sources

- Live checks, 09-11-26: `curl` of robots.txt, sitemap.xml, llms.txt, llms-full.txt, agents.md, sitemap.md, skills.md, skills.json, security.txt, feed.xml and 20 HTML routes; `dig` TXT; `gh issue list`, `gh repo view`, `gh api users/KunanonJ`. Scratch copies under the session scratchpad (not committed).
- FDE role expectations: [What Is a Forward Deployed AI Engineer? (Paraform)](https://www.paraform.com/insights/forward-deployed-ai-engineer) and [What is a forward deployed engineer? A complete guide (Paraform)](https://www.paraform.com/insights/what-is-a-forward-deployed-engineer). Paraform is a recruiting platform; treat its list as one framing of the role.
