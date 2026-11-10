# Fronk Kunanon Jarat — Personal Website

[![CI](https://github.com/KunanonJ/fronk-website/actions/workflows/ci.yml/badge.svg)](https://github.com/KunanonJ/fronk-website/actions/workflows/ci.yml)
[![Live site](https://img.shields.io/badge/live-kunanonj.com-111?style=flat&labelColor=111&color=34d399)](https://kunanonj.com)
[![Cloudflare Workers](https://img.shields.io/badge/runtime-Cloudflare%20Workers-f38020)](https://workers.cloudflare.com/)
[![Node](https://img.shields.io/badge/node-%3E%3D22.22-339933)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

Personal site of **Kunanon Jarat (Fronk)** — Bangkok founder building fintech
and AI workspaces (GoGoCash, Manut AI). The public UI uses the
visual-redesign system (09-11-26): light by default with a dark toggle, the
Signal/Glaze/Ink palette and Geist; resume and Sanity Studio remain as system
surfaces. Built with TanStack Start and deployed on Cloudflare Workers.

```
Tech:      TanStack Start + Router + Query + Form · React 19.3 · Vite 8 · TypeScript · Tailwind v4 (CSS-only motion)
Content:   Static landing copy (`lib/content/landing.ts`); Sanity for studio/resume
Tooling:   ESLint 10 · Vitest 5 · Playwright · pnpm 10
Runtime:   Node.js ≥22.22 · Cloudflare Workers (static assets, Worker cache, cron, rate limiting)
Style:     Light by default; Signal/Glaze/Ink palette, Geist + Geist Mono (visual-redesign)
```

## Useful links

- Live site: https://kunanonj.com
- GitHub repo: https://github.com/KunanonJ/fronk-website
- Sanity Studio launcher: https://kunanonj.com/studio
- Sitemap: https://kunanonj.com/sitemap.xml · https://kunanonj.com/sitemap.md
- Agents / LLMs: https://kunanonj.com/agents.md · https://kunanonj.com/llms.txt · https://kunanonj.com/skills.md
- RSS feed: https://kunanonj.com/rss.xml (alias of `/feed.xml`)

## Highlights

- Public marketing cutover: Home (`/`) with an Apple-style multilingual intro
  (“Welcome to KunanonJ”). `/showcase` (06-11-26) and `/stock/velorah` (09-11-26)
  were retired and redirect to `/`.
- TanStack Start on Cloudflare Workers: content pages prerendered at deploy, Sanity pages
  rendered on request and cached at the edge, purged by tag when Sanity publishes.
- Landing content is static and owner-editable in `lib/content/landing.ts`.
- Sanity retained for Studio launcher and `/resume` (with static fallbacks).
- Primary nav routes: `/`, `/about`, `/ventures` → `/#ventures`, `/press`,
  `/blog`, `/contact`. Legacy `/stock/asme` and `/writing` redirect into them.
- SEO surfaces: metadata, sitemap, robots, JSON-LD, Open Graph, `rel="me"`.
- Optional analytics: Cloudflare Web Analytics, Umami, GA4, Web Vitals.
- CI: typecheck, lint, unit tests, production build, first-load perf budget,
  Playwright smoke.

## Architecture

```txt
Visitor / crawler
      |
      v
Cloudflare Worker (fronk-website, custom domains)
  - Static assets: prerendered pages, hashed JS/CSS, fonts
  - Worker cache: Sanity-backed pages, Cache-Tag purge (webhook + hourly cron)
  - TanStack Start: SSR, server functions, server routes (src/server.ts entry)
      |
      +--> Static landing content (lib/content/landing.ts)
      +--> Sanity Content Lake (studio / resume)
      +--> Optional analytics providers

Sanity webhook ----> /api/revalidate
Hourly cron -------> scheduled() purge of every content tag
```

## Routes

| Path                                       | Source                         | Notes                                              |
| ------------------------------------------ | ------------------------------ | -------------------------------------------------- |
| `/`                                        | Static landing                 | Intro loader, Hero, About, Ventures, contact       |
| `/resume`                                  | Sanity + fallback (edge cached) | CV; noindex                                       |
| `/studio`                                  | Sanity Studio launcher         | External Studio URL                                |
| `/about`                                   | About page                     | “Built for the curious” (ex-`/stock/asme`)         |
| `/ventures`, `/work`                       | 308 redirect                   | Into `/#ventures`                                  |
| `/contact`                                 | Forma contact landing          | Video + contact form (nav Contact target)          |
| `/press`                                   | Press card index               | Banner + title + blurb + DD/MM/YYYY + View CTA     |
| `/blog`, `/blog/[slug]`                    | Sanity-backed blog             | Banner cards, tags, search/filter; edit in Studio  |
| `/now`, `/writing`, `/writing/[slug]`      | 308 redirect                   | Into `/`                                           |
| `/work`                                    | 308 redirect                   | Into `/#ventures`                                  |
| `/api/revalidate`                          | POST (src/server.ts)           | Sanity webhook → purge Worker cache tags           |
| `/sitemap.xml`, `/robots.txt`, `/feed.xml`, `/rss.xml` | generated / redirect | XML sitemap + RSS (`/rss.xml` → `/feed.xml`)        |
| `/agents.md`, `/sitemap.md`, `/skills.md`, `/llms.txt` | static / route         | Agent & LLM discovery surfaces (linked in footer)  |

## Local development

**Requirements:** Node.js **≥22.22.2** (see `.node-version`), pnpm **10.34+**.

```bash
# 1. Install dependencies
pnpm install

# 2. Copy env template and fill in values
cp .env.example .env.local

# 3. Run the dev server
pnpm dev
```

App boots at http://localhost:3000.

## Scripts

| Command                        | Purpose                                                     |
| ------------------------------ | ----------------------------------------------------------- |
| `pnpm dev`                     | Vite dev server (Workers runtime via the Cloudflare plugin) |
| `pnpm build`                   | Production build: Sanity manifest, `vite build`, prerender  |
| `pnpm build:cloudflare`        | Same as `pnpm build` (the Workers Builds build command)     |
| `pnpm start`                   | Serve the production build in workerd (port 3000)           |
| `pnpm preview`                 | Build and preview the app in the Cloudflare Workers runtime |
| `pnpm run deploy`              | Build and deploy the app to Cloudflare Workers              |
| `pnpm upload`                  | Build and upload a Worker version without immediate deploy  |
| `pnpm deploy:staging`          | Build and deploy the staging Worker (`fronk-website-start`) |
| `pnpm typecheck`               | `tsc --noEmit` with TypeScript 7 (see Toolchain below)      |
| `pnpm lint`                    | ESLint, failing on any warning                              |
| `pnpm format` / `format:check` | Prettier write / verify                                     |
| `pnpm knip`                    | Unused files, exports and dependencies                      |
| `pnpm test`                    | Vitest (unit + integration)                                 |
| `pnpm test:watch`              | Vitest watch mode                                           |
| `pnpm test:coverage`           | Vitest with V8 coverage                                     |
| `pnpm test:e2e`                | Playwright (configure first; see `tests/e2e/`)              |
| `pnpm perf:budget`             | First-load JS gzip budget (route-aware)                     |

> Note: use `pnpm run deploy` — bare `pnpm deploy` is a pnpm CLI command, not
> this repo’s script.

## Editing content

### Public landing (primary)

Edit static copy in:

- [`lib/content/landing.ts`](./lib/content/landing.ts) — wordmark, hero, about,
  ventures (GoGoCash / Manut AI), socials, contact
- [`lib/content/introGreetings.ts`](./lib/content/introGreetings.ts) — intro
  greetings and timing (ends on **Welcome to KunanonJ**; whole intro capped at
  1.5 s by a unit test, skippable)

UI lives under `components/landing/`; each page's metadata and data live in its route file under `src/routes/`.

### Sanity (system surfaces)

Sanity Studio remains available for resume (and legacy CMS documents). The
Cloudflare Worker keeps the public runtime small by making `/studio` a launcher
to an external Studio (`NEXT_PUBLIC_SANITY_STUDIO_URL`). When Sanity is
unconfigured, `/resume` falls back to static defaults in `lib/content/`.

| Content                   | Studio document | Fallback module                          |
| ------------------------- | --------------- | ---------------------------------------- |
| Resume header + timeline  | `resumeProfile` | `lib/content/resumeTimeline.fallback.ts` |
| Site settings (legacy)    | `siteSettings`  | `lib/content/siteSettings.ts`            |

### Seed Sanity from static defaults

```bash
pnpm seed
```

Requires Sanity write credentials in `.env.local`. The script is idempotent —
it creates missing documents without overwriting edited content.

### Studio setup (first time)

1. Create a Sanity project at https://www.sanity.io/manage.
2. Populate `.env.local` with `NEXT_PUBLIC_SANITY_*` and secrets (see
   [`.env.example`](./.env.example)).
3. Run `pnpm studio:dev` locally, or `pnpm studio:deploy` for a hosted Studio.
4. Point `NEXT_PUBLIC_SANITY_STUDIO_URL` at the hosted Studio URL.

## Deploying to Cloudflare Workers

Production is a TanStack Start Worker (`fronk-website`, config in
`wrangler.jsonc`). `pnpm build` writes `.wrangler/deploy/config.json`, so a
plain `wrangler deploy` ships the built Worker in `dist/`.

```bash
pnpm run deploy          # build + wrangler deploy (production)
pnpm run deploy:staging  # build + deploy fronk-website-start (wrangler.start.jsonc)
```

**Workers Builds** (CI/CD):

| Trigger | Branches | Build | Deploy |
| ------- | -------- | ----- | ------ |
| Deploy default branch | `main` | `pnpm run build:cloudflare` | `npx wrangler deploy` |
| Deploy non-production branches | all except `main` | `pnpm run build:cloudflare` | `npx wrangler versions upload` |

A PR that adds a Durable Object migration fails the non-production build by
design: Cloudflare will not upload a version that carries an unapplied
migration. The check is not required; `wrangler deploy` on `main` applies the
migration, and later previews upload again (as in #99, migration `v2`).

How the Worker is put together (`src/server.ts`, `wrangler.jsonc`):

- **Static assets:** prerendered content pages, hashed JS/CSS and fonts are served
  before the Worker runs. Paths ending in `/` reach the Worker (`run_worker_first`)
  so they get a 308 like the old site.
- **Worker cache** (`cache.enabled`): Sanity-backed pages and text files send
  `Cache-Tag` and `CDN-Cache-Control`; `POST /api/revalidate` (Sanity webhook,
  signature checked with `@sanity/webhook`) purges the document's tags, and the
  hourly cron (`scheduled()`) purges everything as a safety net. Webhooks signed
  more than 5 minutes ago are rejected (replay window).
- **Security headers:** HSTS, `nosniff`, `X-Frame-Options: SAMEORIGIN`,
  `Referrer-Policy` and `Permissions-Policy` on every response: Worker responses
  get them from `src/server/http.ts`, static files from `public/_headers`. Keep
  the two lists the same.
- **Forms:** `/api/contact` accepts only same-site JSON POSTs under 20 KB, with
  `FORM_RATE_LIMIT` (5 per minute per IP);
  Turnstile once `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` are set.
- **Migrations:** the old Next.js build's two Durable Object classes were created
  in migration `v1` and deleted in `v2`. Migrations are append-only: add a new tag,
  never edit an old one.
- `/studio` launches an external Studio via `NEXT_PUBLIC_SANITY_STUDIO_URL`.
- Copy `.dev.vars.example` to `.dev.vars` for local Worker-specific values.
  Never commit real secrets.

### Production environment variables

| Variable                                     | Required | Public? | Notes                                                   |
| -------------------------------------------- | -------- | ------- | ------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                       | yes      | yes     | `https://kunanonj.com` (no trailing slash)              |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`              | yes\*    | yes     | [sanity.io/manage](https://www.sanity.io/manage)        |
| `NEXT_PUBLIC_SANITY_DATASET`                 | yes\*    | yes     | Usually `production`                                    |
| `NEXT_PUBLIC_SANITY_API_VERSION`             | yes\*    | yes     | e.g. `2025-01-01`                                       |
| `NEXT_PUBLIC_SANITY_STUDIO_URL`              | yes\*    | yes     | Hosted Sanity Studio URL used by `/studio`              |
| `SANITY_REVALIDATE_SECRET`                   | yes\*    | no      | Webhook HMAC secret                                     |
| `SANITY_AUTH_TOKEN`                          | optional | no      | Schema deploy on build                                  |
| `TURNSTILE_SECRET_KEY`                       | optional | no      | Turnstile siteverify (contact form)                      |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`             | optional | yes     | Turnstile widget (build-time)                           |
| `NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN` | optional | yes     | Cloudflare Web Analytics token                          |
| `NEXT_PUBLIC_UMAMI_WEBSITE_ID`               | optional | yes     | Umami                                                   |
| `NEXT_PUBLIC_UMAMI_HOST`                     | optional | yes     | Defaults to `https://cloud.umami.is`                    |

\*Required if you use Studio, the resume CMS or the Sanity webhook. The
`NEXT_PUBLIC_` names are kept from the Next era; Vite inlines them at build.

Redeploy after setting `NEXT_PUBLIC_SITE_URL` so sitemap and OG URLs are correct.

### Verify deployment

```bash
curl -sS "https://kunanonj.com/" -o /dev/null -w "%{http_code}\n"            # 200
curl -sS "https://kunanonj.com/contact" -o /dev/null -w "%{http_code}\n"    # 200
curl -sS "https://kunanonj.com/studio" -o /dev/null -w "%{http_code}\n"     # 200
```

## Analytics

Analytics are optional, cookieless and off unless their public environment
variables are present. There is no Google Analytics or Tag Manager.

| Adapter                  | Component                 | Env var                                                           |
| ------------------------ | ------------------------- | ----------------------------------------------------------------- |
| Cloudflare Web Analytics | `<CloudflareAnalytics />` | `NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN`                      |
| Umami                    | `<Analytics />`           | `NEXT_PUBLIC_UMAMI_WEBSITE_ID`, optional `NEXT_PUBLIC_UMAMI_HOST` |

Custom events go through `track()` in `lib/analytics/track.ts` (a no-op until
the Umami script has loaded): theme changes and the conversion clicks in
`ConversionEvents` (contact CTA, venture outbound, topic hub CTA).

## Project structure

```
src/
  server.ts              # Worker entry: redirects, Sanity webhook purge, cron, then Start
  router.tsx             # Router + per-request QueryClient (SSR query integration)
  routes/                # File routes: each page owns its metadata, loader and component
    _landing/            # Public site (layout: nav + footer)
    _system/             # /resume, /design (minimal chrome)
    api/, *.ts           # Server routes: APIs, feeds, robots, sitemap, OG images
  server/                # Server-only code: API handlers, text endpoints, OG renderers,
                         #   server functions (Sanity reads), cache purge, form guard
  queries/               # TanStack Query options for Sanity content
  lib/                   # head() from metadata, cache headers, redirects, OG helpers
  styles/                # globals.css (design tokens), fonts.css (self-hosted fonts)
components/              # React components (landing, ui, navigation, studio, resume)
lib/                     # Framework-free content, SEO, Sanity client, utilities
tests/e2e/               # Playwright smoke, axe and Linux visual baselines
wrangler.jsonc           # Production Worker; wrangler.start.jsonc = staging
```

## Testing

```bash
pnpm typecheck
pnpm lint
pnpm format:check
pnpm knip
pnpm test
pnpm build
pnpm perf:budget
node scripts/start-gates.mjs   # parity crawl + Playwright smoke and axe on the build
```

CI pins Node **22.23.4** (`.node-version`) and runs typecheck, lint (no
warnings), Prettier, knip, unit tests, the production build, the first-load JS
budget (165 KB gzip by default, 200 KB on marketing routes, 120 KB for the shared entry chunk), Playwright smoke
and axe checks, the visual baselines (in the Playwright container) and the
parity crawl.

### Parity reference

`node scripts/start-gates.mjs` crawls the build and compares status, titles,
meta tags, JSON-LD and text endpoints with `tests/fixtures/site-parity.json`
(the routes come from `src/ported-routes.json`). When a change to those is
intended, re-crawl the reference from a fresh build:

```bash
pnpm build && pnpm exec vite preview --port 4374 --host 127.0.0.1 &
PARITY_SEEDS=$(node -e "console.log(require('./src/ported-routes.json').filter(r=>r.seed!==false).map(r=>r.path).join(','))") \
  node scripts/parity-crawl.mjs http://127.0.0.1:4374 tests/fixtures/site-parity.json
```

Review the diff of the JSON before committing it.

### Toolchain and dependency policy

- **TypeScript:** `typescript` is TypeScript 6 (`@typescript/typescript6`), the
  JavaScript API that typescript-eslint and editors load; `typescript-7` provides
  the `tsc` that `pnpm typecheck` runs. `pnpm typecheck:tsc6` checks with 6.
- **Pins:** test and build tooling is pinned to exact versions. `@playwright/test`
  must match the Playwright container image in `.github/workflows/ci.yml`; bump
  both together (Dependabot skips it).
- **Overrides:** `pnpm.overrides` holds exact pins for transitive security fixes.
  After any upgrade, run `pnpm audit` and drop overrides the parents no longer need.
- **Updates:** Dependabot opens grouped weekly PRs after a 7-day cooldown
  (`.github/dependabot.yml`). Every merge to `main` deploys production, so merge
  them only on a green CI.
- **Build guard:** `vite build` fails when `NEXT_PUBLIC_SITE_URL` or the Sanity
  project/dataset are missing (they come from the wrangler `vars`).

## License

Code is MIT-licensed — see [LICENSE](./LICENSE). Personal content (bio, resume,
brand assets) is © Kunanon Jarat, all rights reserved.
