# Fronk Kunanon Jarat — Personal Website

Personal site of Fronk Kunanon Jarat. Portfolio of ventures, resume, and
long-form writing. Built with Next.js + Sanity, deployed to Railway.

```
Tech:      Next.js 16 · React 19 · TypeScript · Tailwind v4
Content:   Static (ventures, resume) + Sanity CMS (blog)
Style:     Minimal, dark mode default
Hosting:   Railway
```

## Routes

| Path | Source | Notes |
|---|---|---|
| `/` | static | Hero + featured ventures + journal teaser |
| `/about` | static | Bio |
| `/ventures` | static | All ventures |
| `/ventures/[slug]` | static (SSG) | Case study |
| `/writing` | Sanity (ISR) | Blog index |
| `/writing/[slug]` | Sanity (ISR) | Blog post |
| `/resume` | static | CV + PDF download |
| `/contact` | static | Email + socials |
| `/studio/[[...tool]]` | Sanity Studio | Editor (no header/footer) |
| `/api/revalidate` | POST | Sanity webhook → revalidates `posts` tag |
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

### Ventures (static)

Edit `lib/content/ventures.ts`. Each entry feeds:

- the landing-page "Selected ventures" grid (those with `featured: true`)
- the full `/ventures` listing
- the `/ventures/[slug]` case study page

Slug values become URLs. Tests in `lib/content/ventures.test.ts` guard the
contract (sort order, lookup by slug, uniqueness).

### Bio / resume / contact

Plain TSX under `app/about/page.tsx`, `app/resume/page.tsx`,
`app/contact/page.tsx`. Replace placeholders directly.

### Blog (Sanity)

The blog is sourced from Sanity. To start using it:

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

> **R1**: introduces a production surface with secrets. Verify env vars before
> pushing.

1. Push the repo to GitHub.
2. In Railway, create a new project from the GitHub repo. Nixpacks will
   auto-detect Next.js + pnpm (config in `nixpacks.toml` + `railway.toml`).
3. Add the following env vars under **Variables**:

   | Variable | Where to get it | Public? |
   |---|---|---|
   | `NEXT_PUBLIC_SITE_URL` | Your final Railway URL (or custom domain) | yes |
   | `NEXT_PUBLIC_SANITY_PROJECT_ID` | sanity.io/manage | yes |
   | `NEXT_PUBLIC_SANITY_DATASET` | usually `production` | yes |
   | `NEXT_PUBLIC_SANITY_API_VERSION` | e.g. `2025-01-01` | yes |
   | `SANITY_API_READ_TOKEN` | sanity.io/manage → API → Tokens (Viewer) | no |
   | `SANITY_REVALIDATE_SECRET` | `openssl rand -hex 32` | no |

4. After the first deploy completes, copy the Railway-provided URL and:
   - Update `NEXT_PUBLIC_SITE_URL` to that URL.
   - Add the URL to Sanity's CORS origins (sanity.io/manage → API → CORS).
   - Configure a Sanity webhook (sanity.io/manage → API → Webhooks):
     - URL: `https://<your-railway-url>/api/revalidate`
     - Trigger: `Create`, `Update`, `Delete` on `post` documents
     - HTTP method: `POST`
     - Secret: paste the same `SANITY_REVALIDATE_SECRET` value

Publishing a post in Studio will now revalidate `/writing` and the affected
post page within seconds.

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
nixpacks.toml            # Railway build config
railway.toml             # Railway deploy config
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
