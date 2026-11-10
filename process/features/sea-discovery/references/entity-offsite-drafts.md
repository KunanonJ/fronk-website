# Entity off-site drafts (Phase 8)

Paste-ready copy so third-party bios match kunanonj.com. Owner applies clicks; do not invent metrics.

Updated 10-11-26 to the FDE positioning (`lib/content/identity.ts`, PRs #92-#96): lead with the AI engineering role, then the solopreneur ventures, then availability. If `identity.ts` changes, update this file in the same PR.

Canonical who-is (same as `PERSON_SUMMARY`, shown on `/about`):

> Kunanon Jarat (Fronk / KunanonJ) is a Bangkok-based AI engineering lead and solopreneur. As IT Manager & AI Engineering Lead at The Binary Holdings since November 2025, he leads internal AI agents, automations and the intranet's AI assistant. He founded GoGoCash, a shopping-to-earn cashback platform, in 2023 and builds Manut AI, an ERP/CRM workspace with Intelligence AI for automotive SMEs.

## GitHub (https://github.com/KunanonJ)

| Field | Value |
|-------|-------|
| Name | Kunanon Jarat |
| Bio | AI Engineering Lead and solopreneur in Bangkok · GoGoCash · Manut AI · Superstacks agent skills |
| Company | The Binary Holdings |
| Location | Bangkok, Thailand |
| Website | **https://kunanonj.com** (pending: needs `gh auth refresh -h github.com -s user`, then Claude can set it) |
| Social (optional) | linkedin.com/in/kunanonj |

Done 10-11-26: the Superstacks repo homepage points to https://kunanonj.com/skills.

## LinkedIn (https://www.linkedin.com/in/kunanonj)

**Headline (≤220 chars):**  
AI Engineering Lead at The Binary Holdings · Solopreneur: GoGoCash and Manut AI (ERP/CRM + Intelligence AI) · Open to Forward Deployed Engineer and AI engineering roles · Bangkok or remote

**About (paste):**

I'm Kunanon Jarat (Fronk), an AI engineering lead and solopreneur in Bangkok. As IT Manager & AI Engineering Lead at The Binary Holdings since November 2025, I lead internal AI agents, automations and the intranet's AI assistant, with a person in the loop where the call matters.

I founded GoGoCash, a shopping-to-earn cashback platform, in 2023, and I design and build Manut AI, an ERP/CRM workspace with Intelligence AI for automotive SMEs. I work directly with the people who use what I build: Manut AI customers, GoGoCash merchant partners, and the companies I have run client projects and workshops for.

Background: electrical engineering (Kasetsart University), smart contracts at Bitkub, blockchain systems at FICO, then project management across fintech and Web3 products.

Open to Forward Deployed Engineer and AI engineering roles, based in Bangkok or remote.

Site: https://kunanonj.com  
About: https://kunanonj.com/about  
AI engineering: https://kunanonj.com/topics/forward-deployed-ai-engineering

**Featured links:** kunanonj.com · /about · /topics/forward-deployed-ai-engineering · /portfolio · /skills

## Wikidata (create item — not Wikipedia)

Suggested statements (source each with the official URL):

| Property | Value |
|----------|--------|
| instance of | human |
| given name | Kunanon |
| family name | Jarat |
| also known as | Fronk, KunanonJ |
| occupation | software engineer / entrepreneur |
| employer | The Binary Holdings (IT Manager & AI Engineering Lead, since November 2025) |
| country of citizenship | Thailand |
| residence | Bangkok |
| official website | https://kunanonj.com |
| LinkedIn personal profile | https://www.linkedin.com/in/kunanonj |
| GitHub username | KunanonJ |
| founder of | GoGoCash (after org item exists), Manut AI (optional) |

Add the Wikidata item URL to Person `sameAs` in `lib/seo/jsonLd.ts` only after the item is live.

## Crunchbase (person)

| Field | Value |
|-------|-------|
| Full name | Kunanon Jarat |
| Also known as | Fronk, KunanonJ |
| Primary location | Bangkok, Thailand |
| Primary organization | The Binary Holdings (founder of GoGoCash) |
| Website | https://kunanonj.com |
| Biography | Use the LinkedIn About block (shorten to ~500 chars if required) |

## Optional later sameAs

After they exist: Wikidata QID URL, Crunchbase person URL, https://bento.me/fronk98 — append to `sameAs()` in `lib/seo/jsonLd.ts`.
