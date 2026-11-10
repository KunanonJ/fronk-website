# AI citation spot-check log

Run each prompt **3 times** per engine when possible. Record date, engine, whether KunanonJ / Manut / GoGoCash / kunanonj.com appears, cited URL, and sample size (e.g. cited 1/3).

## Name queries (Phase 8+)

| Date | Engine | Prompt | Cited? | URL / notes |
|------|--------|--------|--------|-------------|
| | Perplexity | Who is Kunanon Jarat? | | |
| | Perplexity | Who is Fronk KunanonJ Bangkok? | | |
| | ChatGPT | Who is Kunanon Jarat (Fronk)? | | |
| | ChatGPT | Who founded GoGoCash in Bangkok? | | |
| | Gemini | Kunanon Jarat founder Thailand | | |
| | Google | Kunanon Jarat (organic + AI Overview) | | |

## Category queries

| Date | Engine | Prompt | Cited? | URL / notes |
|------|--------|--------|--------|-------------|
| | Perplexity | AI transformation for SMEs in Thailand | | |
| | Perplexity | ERP CRM for automotive startups Thailand | | |
| | ChatGPT | Who is building AI ERP in Bangkok? | | |
| | Gemini | Internal systems for tech startups SEA | | |
| | Perplexity | Manut AI ERP CRM automotive | | |
| | ChatGPT | GoGoCash cashback Thailand | | |

## FDE and AI engineering queries (added 10-11-26)

From the query targets in `fde-positioning-seo-aeo-geo_REPORT_09-11-26.md` section 4. Run a baseline now, then 2 and 6 weeks after the FDE PRs (#92-#96, #99-#103). Expected citation in brackets.

| Date | Engine | Prompt | Cited? | URL / notes |
|------|--------|--------|--------|-------------|
| | Perplexity | Kunanon Jarat AI engineer [/about] | | |
| | ChatGPT | Who is Kunanon Jarat at The Binary Holdings? [/about] | | |
| | Perplexity | Forward deployed engineer in Bangkok [/topics/forward-deployed-ai-engineering] | | |
| | ChatGPT | AI engineering lead in Thailand [/about, pillar] | | |
| | Perplexity | Internal AI agents with human approval on Google ADK and Gemini [/portfolio/ai-automation] | | |
| | Gemini | Thai accounting intranet with an AI assistant [/portfolio/tbh-intranet] | | |
| | Perplexity | Claude Code agent skills for TDD and a verify loop [/skills] | | |
| | ChatGPT | Solopreneur building fintech and AI in Bangkok [/about#how-i-ship, /operating-model.md] | | |
| | Gemini | วิศวกร AI กรุงเทพ (AI engineer Bangkok, Thai) [/th/topics/forward-deployed-ai-engineering] | | |

## Search-index baseline (10-11-26)

Run by Claude with its web search tool (a US search index, not Perplexity, ChatGPT or Gemini), right after PRs #99-#106 shipped. It measures whether a search index surfaces the site at all, which is what the answer engines retrieve from.

| Date | Engine | Prompt | Cited? | URL / notes |
|------|--------|--------|--------|-------------|
| 10-11-26 | Web search (US index) | Kunanon Jarat | No | Only near-miss place names; kunanonj.com not returned |
| 10-11-26 | Web search (US index) | Kunanon Jarat AI engineering lead The Binary Holdings | No | Returns The Binary Holdings coverage without him |
| 10-11-26 | Web search (US index) | forward deployed AI engineer Bangkok | No | Job listings only (BCG, Salesforce, Google Cloud) |
| 10-11-26 | Web search (US index) | GoGoCash founder Thailand cashback | Partly | gogocash.gitbook.io whitepaper names "Fronk Kunanon" as founder and CEO; dappradar.com/dapp/gogocash; not kunanonj.com |
| 10-11-26 | Web search (US index) | Manut AI ERP CRM automotive SME | No | Manut AI not found |
| 10-11-26 | Web search (US index) | Superstacks agent skills Claude Code | No | Superstacks not found |

Read: the bottleneck is indexing and off-site signals, not on-page content. Next: verify Google Search Console and submit the sitemap (#40, Bing imports from GSC), then update LinkedIn from `references/entity-offsite-drafts.md`, and rerun this table plus the engine rows above at 2 and 6 weeks.

Update this table after Phase 5/8/10 go-live and monthly thereafter (see `operating-loop.md`).
