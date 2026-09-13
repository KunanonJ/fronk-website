# Editorial calendar — 12 cornerstone posts

Map: 4 posts × 3 pillars (+ product/fintech). Publish via Sanity when available; fallbacks ship in `lib/content/blog.ts` and always merge into the public index by slug.

| # | Slug | Pillar | Type | Status |
|---|------|--------|------|--------|
| 1 | `ai-transformation-thailand-smes` | AI transformation | local market | fallback live |
| 2 | `erp-crm-internal-systems-startups` | ERP/CRM | how-to | fallback live |
| 3 | `building-tech-startups-bangkok-sea` | Tech startup | operator note | fallback live |
| 4 | `manut-ai-erp-crm-automotive` | Product / ERP | case | fallback live |
| 5 | `ai-vs-traditional-erp-sea` | AI + ERP | comparison | fallback live |
| 6 | `crm-habits-for-automotive-dealers` | ERP/CRM | how-to | fallback live |
| 7 | `sea-founder-ops-stack-2026` | Tech startup | how-to | fallback live |
| 8 | `digital-transformation-budget-sme-thailand` | AI transformation | local market | fallback live |
| 9 | `internal-tools-vs-saas-sprawl` | Internal systems | comparison | fallback live |
| 10 | `gogocash-retention-loops` | Product / fintech | case | fallback live |
| 11 | `hiring-builders-in-bangkok` | Tech startup | operator note | fallback live |
| 12 | `intelligence-ai-inside-erp` | AI + ERP | how-to | fallback live |

Also live (extra stock): `shipping-from-bangkok`, `cashback-loops`, `ai-workspace-for-smes`.

## Template rules

- Title ≤ 60 chars preferred; SEO title/description required in Sanity
- First paragraph answers the query intent
- Link to parent hub + one venture hub + contact CTA
- No fabricated metrics
- `resolveBlogCards` merges Sanity over fallbacks by slug (Sanity wins)
