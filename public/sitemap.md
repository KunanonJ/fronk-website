# Sitemap (Markdown) — KunanonJ

Semantic site map for **Kunanon Jarat (Fronk)**.  
AI agents and indexes can use this directory to understand layout and routing.

Canonical site: https://kunanonj.com

---

## Page index

| Route | Name | Notes |
|---|---|---|
| `/` | Home | Intro loader, hero, about, ventures, contact footer |
| `/about` | About | “Built for the curious” about surface |
| `/ventures` | Ventures | Named URL → home `#ventures` (GoGoCash, Manut, Airplusauto) |
| `/press` | Press | Press card grid (banner, date, CTA) |
| `/blog` | Blog | Searchable post index (Sanity + fallbacks) |
| `/blog/[slug]` | Blog post | Long-form article |
| `/contact` | Contact | Forma-style video contact + form |
| `/showcase` | Showcase | Creative studio showcase (liquid-glass) |
| `/resume` | Resume | CV (Sanity + fallback); noindex |
| `/studio` | Sanity Studio | CMS launcher — not for public content scraping |

### Legacy redirects

| From | To |
|---|---|
| `/stock/asme` | `/about` |
| `/ventures`, `/ventures/:slug`, `/work` | `/#ventures` |
| `/now` | `/` |
| `/writing`, `/writing/[slug]` | `/blog`, `/blog/[slug]` |

---

## Supporting resources

* **Agents index:** [/agents.md](/agents.md)
* **Plain text for LLMs:** [/llms.txt](/llms.txt)
* **Coding skills / prompts:** [/skills.md](/skills.md)
* **RSS:** [/rss.xml](/rss.xml) (alias of [/feed.xml](/feed.xml))
* **XML sitemap:** [/sitemap.xml](/sitemap.xml)
* **Robots:** [/robots.txt](/robots.txt)

---

*Last updated: 2026-07-19*
