# Fronk Kunanon Jarat — Personal Website

[![CI](https://github.com/KunanonJ/fronk-website/actions/workflows/ci.yml/badge.svg)](https://github.com/KunanonJ/fronk-website/actions/workflows/ci.yml)
[![Live site](https://img.shields.io/badge/live-kunanonj.com-111?style=flat&labelColor=111&color=34d399)](https://kunanonj.com)
[![Cloudflare Workers](https://img.shields.io/badge/runtime-Cloudflare%20Workers-f38020)](https://workers.cloudflare.com/)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

Personal site of Fronk Kunanon Jarat. Portfolio of ventures, resume, and
long-form writing. Built with Next.js + Sanity and deployed on Cloudflare
Workers through OpenNext.

```
Tech:      Next.js 16 · React 19 · TypeScript · Tailwind v4
Content:   Sanity CMS (site + blog) with static fallbacks
Style:     Minimal, dark mode default
Hosting:   Cloudflare Workers + OpenNext + Sanity Cloud (CMS API)
```

## Useful links

- Live site: https://kunanonj.com
- GitHub repo: https://github.com/KunanonJ/fronk-website
- Sanity Studio launcher: https://kunanonj.com/studio
- RSS feed: https://kunanonj.com/feed.xml
- Sitemap: https://kunanonj.com/sitemap.xml

## Highlights

- Full-stack Next.js App Router site running on Cloudflare Workers via OpenNext.
- Sanity CMS-backed pages, writing, resume, and venture content with static
  fallbacks so the site still renders without CMS data.
- Sanity webhook revalidation plus a separate Cloudflare Cron Worker for
  scheduled cache refresh.
- External Sanity Studio launcher that keeps the public Worker runtime smaller.
- SEO surfaces: metadata, sitemap, robots, RSS, JSON-LD, Open Graph image, and
  identity `rel="me"` links.
- Optional analytics adapters for Cloudflare Web Analytics, Umami, GA4, and Web
  Vitals.
- CI runs typecheck, lint, unit/integration tests, production build, performance
  budget, and Playwright smoke checks.

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
      +--> Sanity Content Lake and CDN
      +--> Resend newsletter audience
      +--> Optional analytics providers

Sanity webhook ----> /api/revalidate
Cloudflare Cron ---> /api/cron/revalidate
```

## Routes

| Path                                       | Source                  | Notes                                   |
| ------------------------------------------ | ----------------------- | --------------------------------------- |
| `/`                                        | Sanity + fallback (ISR) | Hero, featured ventures, writing teaser |
| `/about`, `/now`, `/contact`               | Sanity + fallback (ISR) | Standard pages                          |
| `/ventures`                                | Sanity + fallback (ISR) | Venture listing                         |
| `/writing`                                 | Sanity (ISR)            | Blog index                              |
| `/writing/[slug]`                          | Sanity (ISR)            | Blog post                               |
| `/resume`                                  | Sanity + fallback (ISR) | CV header + timeline; noindex           |
| `/studio/[[...tool]]`                      | Sanity Studio           | External Studio launcher                |
| `/api/revalidate`                          | POST                    | Sanity webhook → cache tags             |
| `/api/draft`, `/api/draft/disable`         | GET                     | Draft preview mode                      |
| `/api/cron/revalidate`                     | GET                     | Scheduled revalidation (Bearer auth)    |
| `/sitemap.xml`, `/robots.txt`, `/feed.xml` | generated               |                                         |

## Local development

```bash
# 1. Install dependencies
pnpm install

# 2. Copy env template and fill in values
cp .env.example .env.local

# 3. Run the dev server
pnpm dev
```

App boots at http://localhost:3000. The blog (`/writing`) will display an
empty state until Sanity is configured (see below).

## Scripts

| Command                        | Purpose                                                     |
| ------------------------------ | ----------------------------------------------------------- |
| `pnpm dev`                     | Dev server with Turbopack                                   |
| `pnpm build`                   | Production build                                            |
| `pnpm start`                   | Run the production build locally (port 3000 by default)     |
| `pnpm preview`                 | Build and preview the app in the Cloudflare Workers runtime |
| `pnpm deploy`                  | Build and deploy the app to Cloudflare Workers              |
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

## Editing content

Most public copy is editable in **Sanity Studio**. The Cloudflare Worker keeps
the public site runtime small by making `/studio` a launcher to an external
Studio deployment configured with `NEXT_PUBLIC_SANITY_STUDIO_URL`. When Sanity
is unconfigured or a document is missing, the site falls back to static defaults
in `lib/content/`.

| Content                             | Studio document | Fallback module                          |
| ----------------------------------- | --------------- | ---------------------------------------- |
| Site nav, footer, socials           | `siteSettings`  | `lib/content/siteSettings.ts`            |
| Home hero + CTAs                    | `homePage`      | `lib/content/homePage.ts`                |
| About, Now, Contact, Ventures intro | `standardPage`  | `lib/content/standardPage.ts`            |
| Venture cards                       | `venture`       | `lib/content/ventures.ts`                |
| Resume header + timeline            | `resumeProfile` | `lib/content/resumeTimeline.fallback.ts` |
| Writing index copy                  | `writingPage`   | `lib/content/writingPage.ts`             |
| Blog posts                          | `post`          | empty state on `/writing`                |

Venture detail pages are not currently routed; `/ventures` links out to the
live products.

### Seed Sanity from static defaults

```bash
pnpm seed
```

Requires Sanity write credentials in `.env.local`. The script is idempotent —
it creates missing documents without overwriting edited content.

### Blog setup (first time)

1. Create a Sanity project at https://www.sanity.io/manage. Note the
   project ID and dataset name (default `production`).
2. Populate `.env.local`:

   ```
   NEXT_PUBLIC_SANITY_PROJECT_ID=<your-project-id>
   NEXT_PUBLIC_SANITY_DATASET=production
   NEXT_PUBLIC_SANITY_STUDIO_URL=https://<your-studio-host>
   SANITY_REVALIDATE_SECRET=<openssl rand -hex 32>
   ```

3. Run `pnpm studio:dev` to edit locally. To publish a hosted Studio through
   Sanity, run `pnpm exec sanity login` first, then `pnpm studio:deploy`. Add
   the hosted Studio URL to `NEXT_PUBLIC_SANITY_STUDIO_URL`.
4. Run `pnpm dev` and open http://localhost:3000/studio to verify the launcher.
   Add `http://localhost:3000` and your hosted Studio origin to the project's
   CORS origins.
5. Create an `author` document for yourself, then publish a first `post`.

## Deploying to Cloudflare Workers

Cloudflare Workers with OpenNext is the current migration target for the
full-stack app. The Worker config lives in `wrangler.jsonc`; OpenNext config
lives in `open-next.config.ts`.

```bash
pnpm build
pnpm preview
```

`pnpm preview` uses Wrangler's default local port. If `127.0.0.1:8787` is
already occupied, run:

```bash
pnpm exec opennextjs-cloudflare build
CI=1 pnpm exec wrangler dev --port 8788
```

Production uses Cloudflare Worker custom domains for `kunanonj.com` and
`www.kunanonj.com`, R2-backed OpenNext cache, and a separate Cron Worker for
scheduled revalidation.

Cloudflare deployment requirements:

- `wrangler.jsonc` uses `.open-next/worker.js`, Workers static assets, and
  `nodejs_compat`.
- `wrangler.jsonc` binds R2 as `NEXT_INC_CACHE_R2_BUCKET` for OpenNext
  incremental cache. Create `fronk-website-opennext-cache` in the target
  Cloudflare account before deploying.
- `wrangler.revalidate-cron.jsonc` defines the separate scheduled Worker that
  calls `/api/cron/revalidate` hourly.
- `.open-next/` and local Wrangler state are ignored.
- `public/_headers` applies long-lived cache headers to Next static assets and
  cache headers to Sanity Studio manifest files.
- `public/studio/static/*` is generated by `pnpm sanity:manifest` during build
  and served through a Cloudflare `ASSETS` proxy route; it is not served through
  a runtime filesystem route.
- `/studio` intentionally does not embed `next-sanity/studio` in the app Worker.
  Set `NEXT_PUBLIC_SANITY_STUDIO_URL` to the hosted Studio URL so the route can
  open the editor.
- Copy `.dev.vars.example` to `.dev.vars` for local Worker-specific values.
  Never commit real secrets.

Cloudflare secrets and deploy-time values:

```bash
# App Worker secrets
pnpm exec wrangler secret put SANITY_REVALIDATE_SECRET
pnpm exec wrangler secret put SANITY_PREVIEW_SECRET
pnpm exec wrangler secret put SANITY_API_READ_TOKEN
pnpm exec wrangler secret put SANITY_AUTH_TOKEN
pnpm exec wrangler secret put RESEND_API_KEY
pnpm exec wrangler secret put RESEND_AUDIENCE_ID
pnpm exec wrangler secret put CRON_SECRET

# Cron Worker values
pnpm exec wrangler secret put CRON_SECRET --config wrangler.revalidate-cron.jsonc
```

Local Cron Worker test:

```bash
pnpm exec opennextjs-cloudflare build
CI=1 pnpm exec wrangler dev --port 8788
pnpm cron:preview
curl "http://localhost:8789/cdn-cgi/handler/scheduled?format=json"
```

### Production environment variables

Set these values for the app Worker:

| Variable                                     | Required | Public? | Notes                                                   |
| -------------------------------------------- | -------- | ------- | ------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                       | yes      | yes     | `https://kunanonj.com` (no trailing slash)              |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`              | yes      | yes     | [sanity.io/manage](https://www.sanity.io/manage)        |
| `NEXT_PUBLIC_SANITY_DATASET`                 | yes      | yes     | Usually `production`                                    |
| `NEXT_PUBLIC_SANITY_API_VERSION`             | yes      | yes     | e.g. `2025-01-01`                                       |
| `NEXT_PUBLIC_SANITY_STUDIO_URL`              | yes\*    | yes     | Hosted Sanity Studio URL used by `/studio`              |
| `SANITY_REVALIDATE_SECRET`                   | yes      | no      | `openssl rand -hex 32` — webhook HMAC secret            |
| `SANITY_PREVIEW_SECRET`                      | yes\*    | no      | `openssl rand -hex 32` — draft preview links            |
| `SANITY_API_READ_TOKEN`                      | yes\*    | no      | Sanity → API → Tokens (Viewer) — draft previews         |
| `SANITY_AUTH_TOKEN`                          | no       | no      | Sanity → API → Tokens (Deploy) — schema deploy on build |
| `CRON_SECRET`                                | optional | no      | `openssl rand -hex 32` — scheduled revalidation         |
| `NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN` | optional | yes     | Cloudflare Web Analytics token                          |
| `NEXT_PUBLIC_UMAMI_WEBSITE_ID`               | optional | yes     | Analytics (see below)                                   |
| `NEXT_PUBLIC_UMAMI_HOST`                     | optional | yes     | Defaults to `https://cloud.umami.is`                    |
| `NEXT_PUBLIC_GA_ID`                          | optional | yes     | GA4 measurement ID, for example `G-XXXXXXXXXX`          |

\*Required if you use draft preview (`/api/draft`), unpublished content, or the
Studio launcher.

Redeploy after setting `NEXT_PUBLIC_SITE_URL` so sitemap, RSS, and OG URLs are
correct.

### Sanity project setup

In [sanity.io/manage](https://www.sanity.io/manage) → your project:

**CORS origins** (API → CORS origins):

- `https://kunanonj.com`
- `https://www.kunanonj.com`
- `http://localhost:3000` (local dev)

**API token** (API → Tokens): create a **Viewer** token → `SANITY_API_READ_TOKEN`.

**Deploy token** (API → Tokens → **Deploy**): → `SANITY_AUTH_TOKEN`.
Used during `pnpm build` to run `sanity schema deploy` so the Sanity Dashboard
shows studio compatibility for the external Studio launcher.

**Dashboard studio URL:** In [sanity.io/manage](https://www.sanity.io/manage) →
project → **Setup**, add `https://<your-domain>/studio` (full path, not just the
apex domain). After deploy with `SANITY_AUTH_TOKEN` set, version/schema columns
should populate and compatibility moves off **Unknown**.

**Webhook** (API → Webhooks → Create):

| Field       | Value                                                     |
| ----------- | --------------------------------------------------------- |
| Name        | `Cloudflare revalidate`                                   |
| URL         | `https://kunanonj.com/api/revalidate`                     |
| Dataset     | `production`                                              |
| Trigger on  | Create, Update, Delete                                    |
| Filter      | leave empty (all document types) or restrict to CMS types |
| Projection  | `{ _type, "slug": slug.current }`                         |
| HTTP method | `POST`                                                    |
| Secret      | same string as `SANITY_REVALIDATE_SECRET`                 |

Documents that invalidate cache tags:

| Sanity type                    | Pages affected                                    |
| ------------------------------ | ------------------------------------------------- |
| `post`                         | `/writing`, `/writing/[slug]`                     |
| `writingPage`                  | `/writing`                                        |
| `homePage`                     | `/`                                               |
| `siteSettings`, `standardPage` | layout, `/about`, `/now`, `/contact`, `/ventures` |
| `venture`                      | `/`, `/ventures`                                  |
| `resumeProfile`                | `/resume`                                         |

Publishing in Studio should update the live site within seconds.

### Draft preview (optional)

Preview URL pattern (bookmark or Sanity “Open preview”):

```
https://kunanonj.com/api/draft?secret=<SANITY_PREVIEW_SECRET>&slug=/writing/hello-world
```

Exit preview: `/api/draft/disable?slug=/writing/hello-world` (or use the banner in the UI).

Requires `SANITY_API_READ_TOKEN` and `SANITY_PREVIEW_SECRET`.

### Scheduled revalidation

Webhook revalidation runs on publish. Scheduled revalidation is handled by the
separate Cloudflare Worker in `wrangler.revalidate-cron.jsonc`.

#### App Worker

Add the same secret to the app Worker:

```bash
openssl rand -hex 32   # paste into CRON_SECRET
```

Deploy the app Worker after changing secrets so `/api/cron/revalidate` accepts
the value.

#### Cron Worker

Deploy the scheduled Worker:

```bash
pnpm cron:deploy
```

The cron Worker calls `https://kunanonj.com/api/cron/revalidate` hourly with
`Authorization: Bearer <CRON_SECRET>`.

#### Verify cron manually

```bash
curl -sS -H "Authorization: Bearer <CRON_SECRET>" \
  "https://kunanonj.com/api/cron/revalidate"
# → {"revalidated":true,"tags":["posts","writing","pages","ventures"],...}
```

### Seed production content

From your machine with env vars pointing at production:

```bash
pnpm seed
```

Requires `NEXT_PUBLIC_SANITY_*` and a Sanity token with write access in
`.env.local` (see `scripts/seed-content.mjs`).

### Verify deployment

```bash
curl -sS "https://kunanonj.com/" -o /dev/null -w "%{http_code}\n"          # 200
curl -sS "https://kunanonj.com/studio" -o /dev/null -w "%{http_code}\n"   # 200
curl -sS -X POST "https://kunanonj.com/api/revalidate" -w "\n%{http_code}\n"  # 401 without signature
```

After publishing a post in Studio, `/writing` should show the new content without
a manual redeploy.

## Analytics

Analytics are optional and disabled by default unless their public environment
variables are present. Localhost and preview traffic is intentionally filtered
where the adapter supports it.

Available adapters in `app/layout.tsx`:

| Adapter                  | Component                 | Env var                                                           |
| ------------------------ | ------------------------- | ----------------------------------------------------------------- |
| Cloudflare Web Analytics | `<CloudflareAnalytics />` | `NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN`                      |
| Umami                    | `<Analytics />`           | `NEXT_PUBLIC_UMAMI_WEBSITE_ID`, optional `NEXT_PUBLIC_UMAMI_HOST` |
| Google Analytics 4       | `<GoogleAnalytics />`     | `NEXT_PUBLIC_GA_ID`                                               |
| Web Vitals               | `<WebVitals />`           | Uses the active client analytics bridge                           |

To turn Umami on:

1. Create a website in Umami → copy its **Website ID** (UUID).
2. Add to the app Worker environment:
   - `NEXT_PUBLIC_UMAMI_WEBSITE_ID` — the UUID
   - `NEXT_PUBLIC_UMAMI_HOST` — defaults to `https://cloud.umami.is`; override
     if self-hosted.
3. Redeploy. The script now loads with `defer` + `lazyOnload`, so it never
   blocks first paint.

The `UMAMI_API_KEY` env var is separately reserved for _reading_ analytics data
(REST API) — not used by the tracker itself.

## Project structure

```
app/                     # Next.js App Router routes
  api/revalidate/        # Sanity webhook
  writing/[slug]/        # Blog post (Sanity-driven)
  studio/[[...tool]]/    # External Sanity Studio launcher
  studio/static/          # Sanity manifest asset proxy
components/              # UI + layout components
  layout/                # Header, Footer, SiteShell
  ui/                    # Container, Button, Prose
lib/
  content/ventures.ts    # Static venture data + accessors
  sanity/                # Client, queries, fetchers, types
  utils/                 # Date + reading-time helpers
sanity/
  env.ts                 # Env var validation
  schemas/               # post, author
sanity.config.ts         # External Studio config
wrangler.jsonc           # Cloudflare app Worker config
wrangler.revalidate-cron.jsonc # Cloudflare Cron Worker config
```

## Testing

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm exec opennextjs-cloudflare build
```

Test surface includes unit/integration tests for content, analytics, route
handlers, Open Graph helpers, and Worker helpers. CI also runs a production
build, performance budget check, and Playwright smoke suite.

## License

Code is MIT-licensed — see [LICENSE](./LICENSE). Personal content (bio, resume,
blog posts, brand assets) is © Kunanon Jarat, all rights reserved.
