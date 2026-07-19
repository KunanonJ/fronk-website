# Fronk Kunanon Jarat — Personal Website

[![CI](https://github.com/KunanonJ/fronk-website/actions/workflows/ci.yml/badge.svg)](https://github.com/KunanonJ/fronk-website/actions/workflows/ci.yml)
[![Live site](https://img.shields.io/badge/live-kunanonj.com-111?style=flat&labelColor=111&color=34d399)](https://kunanonj.com)
[![Cloudflare Workers](https://img.shields.io/badge/runtime-Cloudflare%20Workers-f38020)](https://workers.cloudflare.com/)
[![Node](https://img.shields.io/badge/node-%3E%3D22.12-339933)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

Personal site of **Kunanon Jarat (Fronk)** — Bangkok founder building fintech
and AI workspaces (GoGoCash, Manut, Airplusauto). Public marketing UI is a
cinematic landing + showcase shell; resume and Sanity Studio remain as system
surfaces. Built with Next.js and deployed on Cloudflare Workers via OpenNext.

```
Tech:      Next.js 16.2 · React 19.2 · TypeScript 6 · Tailwind v4 · framer-motion
Content:   Static landing copy (`lib/content/landing.ts`); Sanity for studio/resume
Tooling:   ESLint 10 · Vitest 4 · Playwright · pnpm 10
Runtime:   Node.js ≥22.12 · Cloudflare Workers + OpenNext + R2 cache
Style:     Dark cinematic landing (Almarai + Instrument Serif, cream `#DEDBC8`)
```

## Useful links

- Live site: https://kunanonj.com
- Showcase: https://kunanonj.com/showcase
- GitHub repo: https://github.com/KunanonJ/fronk-website
- Sanity Studio launcher: https://kunanonj.com/studio
- Sitemap: https://kunanonj.com/sitemap.xml
- RSS feed: https://kunanonj.com/feed.xml (legacy writing feed)

## Highlights

- Public marketing cutover: Home (`/`) + Showcase (`/showcase`) with Apple-style
  multilingual intro (“Welcome to KunanonJ”).
- Full-stack Next.js App Router on Cloudflare Workers via OpenNext.
- Landing content is static and owner-editable in `lib/content/landing.ts`.
- Sanity retained for Studio launcher and `/resume` (with static fallbacks).
- Retired FogLAMP multi-page routes redirect into the landing (`/#about`,
  `/#ventures`, `/#contact`, or `/`).
- SEO surfaces: metadata, sitemap, robots, JSON-LD, Open Graph, `rel="me"`.
- Optional analytics: Cloudflare Web Analytics, Umami, GA4, Web Vitals.
- CI: typecheck, lint, unit tests, production build, first-load perf budget,
  Playwright smoke.

## Architecture

```txt
Visitor / crawler
      |
      v
Cloudflare Worker custom domains
  - Next.js app via OpenNext
  - Static assets through Workers Assets
  - R2-backed incremental cache
      |
      +--> Static landing content (lib/content/landing.ts)
      +--> Sanity Content Lake (studio / resume)
      +--> Optional analytics providers

Sanity webhook ----> /api/revalidate
Cloudflare Cron ---> /api/cron/revalidate
```

## Routes

| Path                                       | Source                         | Notes                                              |
| ------------------------------------------ | ------------------------------ | -------------------------------------------------- |
| `/`                                        | Static landing                 | Intro loader, Hero, About, Ventures, contact       |
| `/showcase`                                | Static landing                 | Creative studio showcase (spotlight reveal)        |
| `/resume`                                  | Sanity + fallback (ISR)        | CV; noindex                                        |
| `/studio/[[...tool]]`                      | Sanity Studio launcher         | External Studio URL                                |
| `/about`, `/ventures`, `/contact`          | 308 redirect                   | Into `/#about`, `/#ventures`, `/#contact`          |
| `/now`, `/writing`, `/writing/[slug]`      | 308 redirect                   | Into `/`                                           |
| `/work`                                    | 308 redirect                   | Into `/#ventures`                                  |
| `/api/revalidate`                          | POST                           | Sanity webhook → cache tags                        |
| `/api/draft`, `/api/draft/disable`         | GET                            | Draft preview mode                                 |
| `/api/cron/revalidate`                     | GET                            | Scheduled revalidation (Bearer auth)               |
| `/sitemap.xml`, `/robots.txt`, `/feed.xml` | generated                      | Sitemap lists `/` and `/showcase`                  |

## Local development

**Requirements:** Node.js **≥22.12.0** (see `.node-version`), pnpm **10.28+**.

```bash
# 1. Install dependencies
pnpm install

# 2. Copy env template and fill in values
cp .env.example .env.local

# 3. Run the dev server
pnpm run ensure:local-env   # optional helper if present
pnpm dev
```

App boots at http://localhost:3000.

## Scripts

| Command                        | Purpose                                                     |
| ------------------------------ | ----------------------------------------------------------- |
| `pnpm dev`                     | Dev server with Turbopack                                   |
| `pnpm build`                   | Production Next.js build (CI, `pnpm start`)                 |
| `pnpm build:cloudflare`        | OpenNext Worker build (Workers Builds / deploy)             |
| `pnpm start`                   | Run the production build locally (port 3000 by default)     |
| `pnpm preview`                 | Build and preview the app in the Cloudflare Workers runtime |
| `pnpm run deploy`              | Build and deploy the app to Cloudflare Workers              |
| `pnpm upload`                  | Build and upload a Worker version without immediate deploy  |
| `pnpm cf-typegen`              | Generate Cloudflare binding types from `wrangler.jsonc`     |
| `pnpm cron:preview`            | Preview the separate Cloudflare Cron Worker locally         |
| `pnpm cron:deploy`             | Deploy the separate Cloudflare Cron Worker                  |
| `pnpm typecheck`               | `tsc --noEmit`                                              |
| `pnpm lint`                    | ESLint                                                      |
| `pnpm format` / `format:check` | Prettier write / verify                                     |
| `pnpm test`                    | Vitest (unit + integration)                                 |
| `pnpm test:watch`              | Vitest watch mode                                           |
| `pnpm test:e2e`                | Playwright (configure first; see `tests/e2e/`)              |
| `pnpm perf:budget`             | First-load JS gzip budget (route-aware)                     |

> Note: use `pnpm run deploy` — bare `pnpm deploy` is a pnpm CLI command, not
> this repo’s script.

## Editing content

### Public landing (primary)

Edit static copy in:

- [`lib/content/landing.ts`](./lib/content/landing.ts) — wordmark, hero, about,
  ventures (GoGoCash / Manut / Airplusauto), socials, contact
- [`lib/content/introGreetings.ts`](./lib/content/introGreetings.ts) — intro
  loader greetings (ends on **Welcome to KunanonJ**)

UI lives under `components/landing/` and `app/(landing)/`.

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

Cloudflare Workers with OpenNext is the production runtime. Worker config lives
in `wrangler.jsonc`; OpenNext config lives in `open-next.config.ts`.

```bash
pnpm build:cloudflare
pnpm run deploy
```

`pnpm preview` builds with OpenNext and runs the app in Wrangler's local Worker
runtime (default port **8787**).

Production uses Cloudflare Worker custom domains for `kunanonj.com` and
`www.kunanonj.com`, R2-backed OpenNext cache, and a separate Cron Worker for
scheduled revalidation.

**Workers Builds** (CI/CD on push to `main`):

| Step   | Command                       |
| ------ | ----------------------------- |
| Build  | `pnpm run build:cloudflare`   |
| Deploy | `npx wrangler deploy`         |

`pnpm build` runs Next.js only (used by GitHub Actions and `pnpm start`).
OpenNext output lives under `.open-next/` and is produced by `build:cloudflare`
or `pnpm run deploy` / `pnpm preview`. Do **not** use `pnpm build` as the
Workers Builds build command.

Cloudflare deployment requirements:

- `wrangler.jsonc` uses `.open-next/worker.js`, Workers static assets, and
  `nodejs_compat`.
- R2 binding `NEXT_INC_CACHE_R2_BUCKET` → bucket `fronk-website-opennext-cache`.
- `wrangler.revalidate-cron.jsonc` defines the hourly revalidation Worker.
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
| `SANITY_PREVIEW_SECRET`                      | optional | no      | Draft preview links                                     |
| `SANITY_API_READ_TOKEN`                      | optional | no      | Draft previews                                          |
| `SANITY_AUTH_TOKEN`                          | optional | no      | Schema deploy on build                                  |
| `CRON_SECRET`                                | optional | no      | Scheduled revalidation                                  |
| `NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN` | optional | yes     | Cloudflare Web Analytics token                          |
| `NEXT_PUBLIC_UMAMI_WEBSITE_ID`               | optional | yes     | Umami                                                   |
| `NEXT_PUBLIC_UMAMI_HOST`                     | optional | yes     | Defaults to `https://cloud.umami.is`                    |
| `NEXT_PUBLIC_GA_ID`                          | optional | yes     | GA4 measurement ID                                      |

\*Required if you use Studio, resume CMS, webhooks, or draft preview.

Redeploy after setting `NEXT_PUBLIC_SITE_URL` so sitemap and OG URLs are correct.

### Verify deployment

```bash
curl -sS "https://kunanonj.com/" -o /dev/null -w "%{http_code}\n"            # 200
curl -sS "https://kunanonj.com/showcase" -o /dev/null -w "%{http_code}\n"   # 200
curl -sS "https://kunanonj.com/studio" -o /dev/null -w "%{http_code}\n"     # 200
```

## Analytics

Analytics are optional and disabled by default unless their public environment
variables are present.

| Adapter                  | Component                 | Env var                                                           |
| ------------------------ | ------------------------- | ----------------------------------------------------------------- |
| Cloudflare Web Analytics | `<CloudflareAnalytics />` | `NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN`                      |
| Umami                    | `<Analytics />`           | `NEXT_PUBLIC_UMAMI_WEBSITE_ID`, optional `NEXT_PUBLIC_UMAMI_HOST` |
| Google Analytics 4       | `<GoogleAnalytics />`     | `NEXT_PUBLIC_GA_ID`                                               |
| Web Vitals               | `<WebVitals />`           | Uses the active client analytics bridge                           |

## Project structure

```
app/
  (landing)/             # Public marketing shell (/ and /showcase)
  (system)/resume/       # CV utility route
  api/                   # revalidate, draft, cron, subscribe
  studio/                # External Sanity Studio launcher
components/
  landing/               # IntroLoader, Hero, About, Features, Showcase
  layout/                # Legacy FogLAMP chrome (unused on landing)
  ui/                    # Shared primitives
lib/
  content/landing.ts     # Primary public copy
  content/introGreetings.ts
  sanity/                # Client, queries, fetchers
process/features/
  landing-cutover/       # Active program plans
wrangler.jsonc           # Cloudflare app Worker
wrangler.revalidate-cron.jsonc
```

## Testing

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm perf:budget
pnpm preview   # optional: smoke-test the Cloudflare Worker runtime locally
```

CI pins Node **22.12.0** (`.node-version`) and runs typecheck, lint, unit tests,
production build, performance budget (260 KB gzip on `/` and `/showcase`;
205 KB elsewhere), and Playwright smoke checks.

## License

Code is MIT-licensed — see [LICENSE](./LICENSE). Personal content (bio, resume,
brand assets) is © Kunanon Jarat, all rights reserved.
