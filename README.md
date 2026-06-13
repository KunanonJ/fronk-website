# Fronk Kunanon Jarat — Personal Website

Personal site of Fronk Kunanon Jarat. Portfolio of ventures, resume, and
long-form writing. Built with Next.js + Sanity, deployed to Railway.

```
Tech:      Next.js 16 · React 19 · TypeScript · Tailwind v4
Content:   Sanity CMS (site + blog) with static fallbacks
Style:     Minimal, dark mode default
Hosting:   Railway (app) + Sanity Cloud (CMS API)
```

## Routes

| Path | Source | Notes |
|---|---|---|
| `/` | Sanity + fallback (ISR) | Hero, featured ventures, writing teaser |
| `/about`, `/now`, `/contact` | Sanity + fallback (ISR) | Standard pages |
| `/ventures` | Sanity + fallback (ISR) | Venture listing |
| `/ventures/[slug]` | static (SSG) | Case study pages |
| `/writing` | Sanity (ISR) | Blog index |
| `/writing/[slug]` | Sanity (ISR) | Blog post |
| `/resume` | Sanity + fallback (ISR) | CV header + timeline; noindex |
| `/studio/[[...tool]]` | Sanity Studio | Editor (no header/footer) |
| `/api/revalidate` | POST | Sanity webhook → cache tags |
| `/api/draft`, `/api/draft/disable` | GET | Draft preview mode |
| `/api/cron/revalidate` | GET | Scheduled revalidation (Bearer auth) |
| `/sitemap.xml`, `/robots.txt`, `/feed.xml` | generated | |

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

| Command | Purpose |
|---|---|
| `pnpm dev` | Dev server with Turbopack |
| `pnpm build` | Production build |
| `pnpm start` | Run the production build locally (port 3000 by default) |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint |
| `pnpm format` / `format:check` | Prettier write / verify |
| `pnpm test` | Vitest (unit + integration) |
| `pnpm test:watch` | Vitest watch mode |
| `pnpm test:e2e` | Playwright (configure first; see `tests/e2e/`) |

## Editing content

Most public copy is editable in **Sanity Studio** at `/studio`. When Sanity is
unconfigured or a document is missing, the site falls back to static defaults in
`lib/content/`.

| Content | Studio document | Fallback module |
|---|---|---|
| Site nav, footer, socials | `siteSettings` | `lib/content/siteSettings.ts` |
| Home hero + CTAs | `homePage` | `lib/content/homePage.ts` |
| About, Now, Contact, Ventures intro | `standardPage` | `lib/content/standardPage.ts` |
| Venture cards | `venture` | `lib/content/ventures.ts` |
| Resume header + timeline | `resumeProfile` | `lib/content/resumeTimeline.fallback.ts` |
| Writing index copy | `writingPage` | `lib/content/writingPage.ts` |
| Blog posts | `post` | empty state on `/writing` |

Venture **case study** pages (`/ventures/[slug]`) remain static TSX for now.

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
   SANITY_REVALIDATE_SECRET=<openssl rand -hex 32>
   ```

3. Run `pnpm dev` and open http://localhost:3000/studio. Log in with the
   account that owns the Sanity project. Add `http://localhost:3000` to the
   project's CORS origins.
4. Create an `author` document for yourself, then publish a first `post`.

## Deploying to Railway

Architecture: **Railway hosts the Next.js app only.** Sanity Cloud hosts content,
the API, and asset CDN. Studio is embedded at `/studio` on your Railway URL.

```
┌─────────────────┐     HTTPS      ┌──────────────────────┐
│  Sanity Cloud   │◄──────────────►│  Railway (Next.js)   │
│  content + API  │   fetch +      │  site + /studio      │
└────────┬────────┘   webhooks     └──────────┬───────────┘
         │                                    │
         │ POST /api/revalidate               │ optional cron service
         └────────────────────────────────────► GET /api/cron/revalidate
```

### 1. Create the web service

1. Push this repo to GitHub.
2. In [Railway](https://railway.com), **New Project → Deploy from GitHub repo**.
3. Railway uses `nixpacks.toml` + `railway.toml` (Node 20, pnpm, `pnpm build`,
   `pnpm start`). No Dockerfile required.
4. Generate a public domain: **Settings → Networking → Generate domain**
   (e.g. `fronk-website-production.up.railway.app`).

### 2. Environment variables

Set these on the **web service** under **Variables**:

| Variable | Required | Public? | Notes |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | yes | yes | `https://<your-railway-domain>` (no trailing slash) |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | yes | yes | [sanity.io/manage](https://www.sanity.io/manage) |
| `NEXT_PUBLIC_SANITY_DATASET` | yes | yes | Usually `production` |
| `NEXT_PUBLIC_SANITY_API_VERSION` | yes | yes | e.g. `2025-01-01` |
| `SANITY_REVALIDATE_SECRET` | yes | no | `openssl rand -hex 32` — webhook HMAC secret |
| `SANITY_PREVIEW_SECRET` | yes* | no | `openssl rand -hex 32` — draft preview links |
| `SANITY_API_READ_TOKEN` | yes* | no | Sanity → API → Tokens (Viewer) — draft previews |
| `SANITY_AUTH_TOKEN` | no | yes | Sanity → API → Tokens (Deploy) — schema deploy on build |
| `CRON_SECRET` | optional | no | `openssl rand -hex 32` — scheduled revalidation |
| `NEXT_PUBLIC_UMAMI_WEBSITE_ID` | optional | yes | Analytics (see below) |
| `NEXT_PUBLIC_UMAMI_HOST` | optional | yes | Defaults to `https://cloud.umami.is` |

\*Required if you use draft preview (`/api/draft`) or unpublished content in Studio.

Redeploy after setting `NEXT_PUBLIC_SITE_URL` so sitemap, RSS, and OG URLs are correct.

### 3. Sanity project setup

In [sanity.io/manage](https://www.sanity.io/manage) → your project:

**CORS origins** (API → CORS origins):

- `https://<your-railway-domain>`
- `http://localhost:3000` (local dev)

**API token** (API → Tokens): create a **Viewer** token → `SANITY_API_READ_TOKEN`.

**Deploy token** (API → Tokens → **Deploy**): → `SANITY_AUTH_TOKEN` on Railway.
Used during `pnpm build` to run `sanity schema deploy` so the Sanity Dashboard
shows studio compatibility for your self-hosted `/studio`.

**Dashboard studio URL:** In [sanity.io/manage](https://www.sanity.io/manage) →
project → **Setup**, add `https://<your-domain>/studio` (full path, not just the
apex domain). After deploy with `SANITY_AUTH_TOKEN` set, version/schema columns
should populate and compatibility moves off **Unknown**.

**Webhook** (API → Webhooks → Create):

| Field | Value |
|---|---|
| Name | `Railway revalidate` |
| URL | `https://<your-railway-domain>/api/revalidate` |
| Dataset | `production` |
| Trigger on | Create, Update, Delete |
| Filter | leave empty (all document types) or restrict to CMS types |
| Projection | `{ _type, "slug": slug.current }` |
| HTTP method | `POST` |
| Secret | same string as `SANITY_REVALIDATE_SECRET` |

Documents that invalidate cache tags:

| Sanity type | Pages affected |
|---|---|
| `post` | `/writing`, `/writing/[slug]` |
| `writingPage` | `/writing` |
| `homePage` | `/` |
| `siteSettings`, `standardPage` | layout, `/about`, `/now`, `/contact`, `/ventures` |
| `venture` | `/`, `/ventures` |
| `resumeProfile` | `/resume` |

Publishing in Studio should update the live site within seconds.

### 4. Draft preview (optional)

Preview URL pattern (bookmark or Sanity “Open preview”):

```
https://<your-railway-domain>/api/draft?secret=<SANITY_PREVIEW_SECRET>&slug=/writing/hello-world
```

Exit preview: `/api/draft/disable?slug=/writing/hello-world` (or use the banner in the UI).

Requires `SANITY_API_READ_TOKEN` and `SANITY_PREVIEW_SECRET` on Railway.

### 5. Scheduled revalidation (cron service)

Webhook revalidation runs on publish. The cron service is a **second Railway
service** in the same project that pings `/api/cron/revalidate` on a schedule.

#### 5a. Web service — add `CRON_SECRET`

On **fronk-website** (the main app), add:

```bash
openssl rand -hex 32   # paste into CRON_SECRET
```

Redeploy the web service so `/api/cron/revalidate` accepts the secret.

#### 5b. Create the cron service

1. Same Railway project → **Add service → GitHub repo** → select this repo.
2. Rename the service to `cron-revalidate` (optional).
3. **Settings → Config-as-code → Config file path:** `railway.cron.toml`
4. **Settings → Cron schedule:** `0 * * * *` (hourly, UTC) or `*/15 * * * *`
5. **Do not** add a public domain or healthcheck to this service.
6. **Variables** on the cron service only:

   | Variable | Value |
   |---|---|
   | `NIXPACKS_CONFIG_FILE` | `nixpacks.cron.toml` |
   | `CRON_SECRET` | same value as the web service |
   | `CRON_ENDPOINT_URL` | `https://<your-domain>/api/cron/revalidate` |

7. Deploy. Each run should log `cron-revalidate: 200 {"revalidated":true,...}` and exit.

Repo files used by the cron service:

| File | Purpose |
|---|---|
| `railway.cron.toml` | Start command, no healthcheck |
| `nixpacks.cron.toml` | Skips `pnpm build` (fast cron-only deploys) |
| `scripts/cron-revalidate.mjs` | Calls the web app and exits |

**Do not** put a Cron schedule on **fronk-website** — that would restart the
site instead of calling the API.

#### 5c. Verify cron manually

```bash
curl -sS -H "Authorization: Bearer <CRON_SECRET>" \
  "https://<your-domain>/api/cron/revalidate"
# → {"revalidated":true,"tags":["posts","writing","pages","ventures"],...}
```

**Option B — external cron**

Any scheduler can `GET` the endpoint with header
`Authorization: Bearer <CRON_SECRET>`.

### 6. Seed production content (first deploy)

From your machine with env vars pointing at production:

```bash
pnpm seed
```

Requires `NEXT_PUBLIC_SANITY_*` and a Sanity token with write access in
`.env.local` (see `scripts/seed-content.mjs`).

### 7. Custom domain

1. Railway → **Settings → Networking → Custom domain**.
2. Update `NEXT_PUBLIC_SITE_URL` to `https://yourdomain.com`.
3. Add the custom domain to Sanity CORS origins.
4. Update the Sanity webhook URL to use the custom domain.

### 8. Verify deployment

```bash
curl -sS "https://<domain>/" -o /dev/null -w "%{http_code}\n"          # 200
curl -sS "https://<domain>/studio" -o /dev/null -w "%{http_code}\n"   # 200
curl -sS -X POST "https://<domain>/api/revalidate" -w "\n%{http_code}\n"  # 401 without signature
```

After publishing a post in Studio, `/writing` should show the new content without
a manual redeploy.

## Analytics (Umami)

Optional. `<Analytics />` in `app/layout.tsx` injects the Umami tracker
when `NEXT_PUBLIC_UMAMI_WEBSITE_ID` is set **and** `NODE_ENV === "production"`.
Localhost / preview traffic is never tracked.

To turn it on:

1. Create a website in Umami → copy its **Website ID** (UUID).
2. Add to Railway:
   - `NEXT_PUBLIC_UMAMI_WEBSITE_ID` — the UUID
   - `NEXT_PUBLIC_UMAMI_HOST` — defaults to `https://cloud.umami.is`; override
     if self-hosted.
3. Redeploy. The script now loads with `defer` + `lazyOnload`, so it never
   blocks first paint.

The `UMAMI_API_KEY` env var is separately reserved for *reading* analytics
data (REST API) — not used by the tracker itself.

## Project structure

```
app/                     # Next.js App Router routes
  api/revalidate/        # Sanity webhook
  ventures/[slug]/       # Case-study page
  writing/[slug]/        # Blog post (Sanity-driven)
  studio/[[...tool]]/    # Embedded Sanity Studio
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
sanity.config.ts         # Studio config
nixpacks.toml            # Railway web service build
nixpacks.cron.toml       # Railway cron service build (no Next build)
railway.toml             # Railway web service deploy
railway.cron.toml        # Railway cron service deploy
```

## Testing

```bash
pnpm test         # unit + integration via Vitest
pnpm typecheck    # tsc --noEmit
pnpm lint         # ESLint
```

Test surface focuses on logic (`lib/`) and the revalidate API route. UI is
exercised via dev-server smoke checks.

## License

Code is MIT-licensed — see [LICENSE](./LICENSE). Personal content (bio, resume,
blog posts, brand assets) is © Kunanon Jarat, all rights reserved.
