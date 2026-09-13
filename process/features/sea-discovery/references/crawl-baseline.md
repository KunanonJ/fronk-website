# Crawl baseline checklist

Run after each phase that touches routes/metadata.

## Indexed (should appear in `/sitemap.xml`)

- `/`
- `/about`
- `/showcase`
- `/contact`
- `/press`
- `/blog` + published `/blog/[slug]` (Sanity **and** cornerstone fallbacks, merged by slug)
- `/topics/ai-transformation-thailand`
- `/topics/erp-crm-internal-systems`
- `/topics/tech-startup-thailand-sea`
- `/th/topics/*` (same three slugs)
- `/ventures/manut`
- `/ventures/gogocash`

## Noindex

- `/resume`
- `/studio/**`

## Redirects (keep)

- `/ventures` → `/#ventures` (index only)
- `/stock/asme` → `/about`
- `/writing` → `/blog`
- `/now` → `/`
- `/work` → `/#ventures`

## Must NOT redirect

- `/ventures/manut`, `/ventures/gogocash`
- `/about`, `/blog`, `/contact`, `/press`, `/topics/*`

## Agent surfaces

- `/llms.txt`, `/sitemap.md`, `/agents.md`, `/feed.xml`

## App robots (`app/robots.ts`)

| User-agent | Policy |
|------------|--------|
| `*` | Allow `/`; Disallow `/studio`, `/api` |
| `Googlebot`, `ChatGPT-User`, `OAI-SearchBot`, `PerplexityBot`, `Claude-User`, `Claude-SearchBot` | Allow `/` (same path disallow) |
| `CCBot`, `Bytespider` | Disallow `/` |

`Host` and `Sitemap` always resolve to `https://kunanonj.com` (never `fronk.example.com`).

## Cloudflare AI Crawl Control (owner)

Production currently prepends **Cloudflare Managed** rules that may `Disallow` `GPTBot`, `ClaudeBot`, `Google-Extended`, etc.

**Chosen citation matrix (wave 2):**

| Bot | Desired | Notes |
|-----|---------|-------|
| Googlebot | Allow | Core Search + AI Overviews retrieval |
| GPTBot / ChatGPT-User / OAI-SearchBot | Allow | ChatGPT citation |
| ClaudeBot / Claude-User / Claude-SearchBot | Allow | Claude citation |
| PerplexityBot | Allow | Perplexity citation |
| Google-Extended | Allow (preferred) or leave CF default | Does **not** gate AI Overviews; gates Gemini training-style use |
| CCBot, Bytespider, Amazonbot | Block | Training / low-value scrapers |
| Content-Signal `ai-train` | `no` OK | Refuse training while allowing search/citation if CF supports split signals |

**Owner action:** In Cloudflare dashboard → AI Crawl Control / managed robots for `kunanonj.com`, stop blanket-blocking GPTBot and ClaudeBot. Re-check `curl https://kunanonj.com/robots.txt` after change.

## Google Search Console (owner)

1. Set Workers var `NEXT_PUBLIC_GSC_VERIFICATION` to the HTML-tag token (see `.env.example`).
2. Redeploy so `metadata.verification.google` is present.
3. Confirm property for `https://kunanonj.com`.
4. Submit sitemap `https://kunanonj.com/sitemap.xml` (not the old example.com URL).
5. Request indexing for `/`, `/about`, three EN topic hubs, `/ventures/manut`, `/ventures/gogocash`.
