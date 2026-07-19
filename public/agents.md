# Agents — KunanonJ / Fronk

Public index of AI agent surfaces for this site and the repository workflow used to build it.

Site: https://kunanonj.com  
Owner: Kunanon Jarat (Fronk) — Bangkok, Thailand

---

## Site resources (for crawlers & LLM tools)

| Resource | URL | Purpose |
|---|---|---|
| Plain-text site brief | [/llms.txt](/llms.txt) | Identity, topic hubs, ventures, blog for LLM context |
| Topic hubs (EN) | [/topics/ai-transformation-thailand](/topics/ai-transformation-thailand) | AI transformation · ERP/CRM · startups TH/SEA |
| Venture hubs | [/ventures/manut](/ventures/manut), [/ventures/gogocash](/ventures/gogocash) | Product case pages |
| Markdown sitemap | [/sitemap.md](/sitemap.md) | Human/agent-readable route map |
| XML sitemap | [/sitemap.xml](/sitemap.xml) | Search-engine sitemap |
| Skills & coding guidelines | [/skills.md](/skills.md) | Prompts and standards for coding agents |
| RSS feed | [/rss.xml](/rss.xml) | Blog/writing syndication (`/feed.xml` alias) |
| Robots | [/robots.txt](/robots.txt) | Crawler rules |

---

## Repository agent roster (RIPER-5)

These agents live in the private repo harness (`.claude/agents/`, `.codex/agents/`). They are listed here so external agents know how this project is orchestrated.

### Mode agents

| Agent | Purpose |
|---|---|
| `vc-research-agent` | Read-only information gathering |
| `vc-innovate-agent` | Brainstorm approaches (discussion only) |
| `vc-plan-agent` | Write detailed implementation plans |
| `vc-execute-agent` | Implement against an approved plan |
| `vc-fast-mode-agent` | Compressed RESEARCH → … → EXECUTE with a safety pause |
| `vc-update-process-agent` | Capture learnings; update process docs |

### Specialist agents

| Agent | Purpose |
|---|---|
| `vc-tester` | Diff-aware test verification |
| `vc-debugger` | Evidence-first root-cause analysis |
| `vc-code-reviewer` | Production-readiness review |
| `vc-code-simplifier` | Clarity refactor without behavior change |
| `vc-ui-ux-designer` | Design-aware frontend work |
| `vc-git-manager` | Conventional commits / git ops |

---

## How to use this site as an agent

1. Start with [/llms.txt](/llms.txt) for identity and current content.
2. Use [/sitemap.md](/sitemap.md) for the public route map.
3. Follow [/skills.md](/skills.md) when generating code against this stack (Next.js 16, React 19, TypeScript, Tailwind v4).
4. Prefer `/about` (not `/stock/asme`) and `/blog` (not `/writing`).
5. Do not scrape `/studio` or `/api/*` for content.

---

*Last updated: 2026-07-19*
