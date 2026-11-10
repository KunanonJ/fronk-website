# Crawl baseline checklist

Run after each phase that touches routes/metadata.

Updated 10-11-26 against the live `/sitemap.xml` (TanStack Start; the source of truth is `lib/seo/sitemap.ts`).

## Indexed (should appear in `/sitemap.xml`)

- `/`, `/about`, `/contact`
- `/portfolio` + `/portfolio/[slug]` (4 projects)
- `/skills` + `/skills/[slug]`
- `/learn`, `/examples`, `/proof`, `/stack`, `/build`
- `/topics/[slug]` and `/th/topics/[slug]`: ai-transformation-thailand, erp-crm-internal-systems, tech-startup-thailand-sea, forward-deployed-ai-engineering
- `/ventures/gogocash`, `/ventures/manut`

## Hidden or noindex

- `/blog`, `/blog/[slug]` and `/press`: hidden while `BLOG_PUBLIC = false` (noindex, out of the sitemap, llms.txt and RSS) until the posts are expanded (issue #43)
- `/resume` (and `/resume.pdf`, `X-Robots-Tag: noindex`)
- `/studio` (noindex, self-canonical), `/design`

## Redirects (keep; `src/lib/redirects.ts`)

- `/ventures` → `/#ventures`; `/work` → `/#ventures`
- `/stock/asme` → `/about`
- `/writing` → `/blog`; `/now` → `/`
- `/showcase` → `/` (retired in #53); `/stock/velorah` → `/`
- `/rss.xml` → `/feed.xml`

## Must NOT redirect

- `/ventures/manut`, `/ventures/gogocash`
- `/about`, `/contact`, `/portfolio/*`, `/skills/*`, `/topics/*`, `/th/topics/*`
- `/blog` and `/press` (hidden, but the URLs stay)

## Agent surfaces

- `/llms.txt`, `/llms-full.txt`, `/agents.md`, `/sitemap.md`, `/skills.md`, `/skills.json`, `/operating-model.md`
- Markdown twins: `/about.md`, `/portfolio/[slug].md` (each page links its twin as `rel="alternate" type="text/markdown"`)
- `/feed.xml` (empty while the blog is hidden)

## Robots (`lib/seo/robots.ts`)

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

1. Easiest: verify with a DNS TXT record in Cloudflare (no code or deploy).
   Or, for the HTML tag: `NEXT_PUBLIC_GSC_VERIFICATION` is inlined at **build** time
   (`vite.config.mts` reads `wrangler.jsonc` vars and the build shell), so a runtime
   Worker variable set only in the dashboard never reaches the page. Either add the
   token to `vars` in `wrangler.jsonc` (it is public; Claude can do this) or set it as
   a Workers Builds **build variable**.
2. Redeploy (merge to `main`) and check that `<meta name="google-site-verification">` is on `/`.
3. Confirm property for `https://kunanonj.com`.
4. Submit sitemap `https://kunanonj.com/sitemap.xml` (not the old example.com URL).
5. Request indexing for `/`, `/about`, the four EN topic hubs, `/portfolio`, `/ventures/manut`, `/ventures/gogocash`.
