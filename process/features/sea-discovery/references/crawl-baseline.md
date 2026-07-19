# Crawl baseline checklist

Run after each phase that touches routes/metadata.

## Indexed (should appear in `/sitemap.xml`)

- `/`
- `/about`
- `/showcase`
- `/contact`
- `/press`
- `/blog` + published `/blog/[slug]`
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
