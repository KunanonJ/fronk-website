# TanStack Start + Cloudflare migration research (09-11-26)

**Mode:** RESEARCH. No code has changed.
**Owner ask:** move to TanStack Start, using "all related to Tanstack suite as much as possible", together with Cloudflare.
**Owner sequencing (09-11-26):** the visual redesign goes first; this migration follows and proves parity against the redesigned site.
**Sources:**
- TanStack Start docs:
  - migrate-from-next-js
  - start-vs-nextjs
  - server components, server routes and server functions
  - static prerendering
  - SEO
- Cloudflare's TanStack Start framework guide (updated 5 Nov 2026).
- A repo inventory of every Next-specific API (§3).
- The TanStack `.../hosting` page returned 404; the Cloudflare guide covers the same ground.

## 1. What TanStack Start gives and doesn't give

- **Routing:** TanStack Router with file routes (`src/routes/__root.tsx`, `posts.$slug.tsx`, `docs.$.tsx`), type-safe `Link`, and `loader` / `beforeLoad` / `head()`.
- **Server:**
  - **server routes** (`server: { handlers: { GET, POST } }`) for APIs, the sitemap, robots and RSS;
  - **server functions** (`createServerFn`) for privileged reads and writes; these are public endpoints, so each one checks its own inputs.
- **SSR is the default.** Static prerendering is opt-in (`tanstackStart({ prerender: { enabled, crawlLinks } })`). Dynamic routes prerender only when crawled or listed.
- **SEO:** `head()` returns `meta`, `links` (canonical, alternates) and `scripts` (JSON-LD). `HeadContent` and `Scripts` render in `__root`. A built-in `sitemap` option exists.
- **Not built in:**
  - an image optimizer;
  - a `next/font` equivalent (use Fontsource or `@font-face`);
  - an OG image generator (port `next/og` to `workers-og` / satori + resvg on Workers);
  - ISR (each cache layer has to be rebuilt explicitly);
  - draft mode;
  - `next.config` redirects (use a server middleware, a `_redirects`-style map, or Cloudflare rules).
- **RSC:** experimental and opt-in "into early v1". Start's normal SSR and server functions don't need it. Today's async Server Components become route `loader`s that call server functions.
- **Cloudflare:**
  - plugins in order `cloudflare({ viteEnvironment: { name: "ssr" } })`, `tanstackStart()`, `react()`; no `nitro()`;
  - `wrangler.jsonc` with `main: "@tanstack/react-start/server-entry"`;
  - bindings via `import { env } from "cloudflare:workers"`;
  - a custom `src/server.ts` that exports `fetch` and `scheduled`, which lets the hourly revalidate cron live in the same Worker;
  - scripts: `vite dev`, `vite build`, `vite preview`, `wrangler deploy`, `wrangler types`;
  - prerendering in CI needs `CLOUDFLARE_INCLUDE_PROCESS_ENV=true`.
- **TanStack suite fit:**
  - **Router + Start:** routing, SSR and server.
  - **Query:** Sanity reads cached per key with `ensureQueryData` in loaders.
  - **Form:** the contact form with schema validation.
  - **Table:** the Stack and Skills tables, if they grow.
  - **Pacer:** search debounce on any client search.
  - **DevTools.**

  Use the suite where it replaces hand-rolled code; don't force it where nothing needs it.

## 2. Mapping (Next.js to Start)

| Next.js here | Start |
|---|---|
| `app/layout.tsx` (fonts, ThemeProvider, JSON-LD, analytics) | `src/routes/__root.tsx` with `head()`, `HeadContent` and `Scripts` |
| Route groups `(landing)`, `(system)` | Pathless layout routes (`_landing.tsx`, `_system.tsx`) |
| `[slug]` and `generateStaticParams` | `$slug` and `prerender.pages` or `crawlLinks` |
| `metadata`/`generateMetadata`, plus `lib/seo/routeMeta.ts` | `head: ({ loaderData }) => routeShareHead(...)`, a port of `routeMeta` returning `meta`/`links` |
| `next/link`, `usePathname`, `notFound`, `redirect` | `Link`, `useLocation`, thrown `notFound()` and `redirect()` from `@tanstack/react-router` |
| `next/image` | Plain `<img>` with pre-sized assets (already the pattern in #57), or Cloudflare Images |
| `next/font/google` | Fontsource packages, self-hosted |
| `app/api/*/route.ts` | Server routes `src/routes/api.*.ts` |
| `sitemap.ts`, `robots.ts`, `feed.xml`, `llms.txt`, `.well-known/security.txt` | Server routes returning `Response` |
| `opengraph-image.tsx` (`next/og`) | A server route rendering with `workers-og`/satori |
| ISR `revalidate` and the `/api/revalidate` webhook | Cache-Control on server responses, plus an explicit cache (Workers Cache API or KV) keyed per document, purged by the Sanity webhook |
| `next-themes` | Keep it (framework-agnostic), or a small cookie-based theme script |
| `next.config` redirects | A server middleware redirect map, or Cloudflare Redirect Rules |

## 3. Repo inventory

See §6. It's filled from the repo inventory.

## 4. Risks

1. **SEO parity:** every URL, status code, redirect, canonical, hreflang, robots value, JSON-LD block and sitemap entry must match. The official guide's first step is an inventory of exactly these. The crawl baseline from `sea-discovery` is the reference.
2. **Caching:** ISR has no 1:1 replacement. A naive port either hits Sanity on every request or serves stale content. **Today's ISR is already broken in production (verified 09-11-26):**
   - `open-next.config.ts` sets only `incrementalCache: r2IncrementalCache`, so `queue` and `tagCache` resolve to OpenNext's `"dummy"` overrides.
   - The dummy queue's `send` throws "Dummy queue is not implemented". `revalidateIfRequired` and `cacheInterceptor` catch the error and serve the page stale.
   - The dummy tag cache's `writeTags` is a no-op and its `isStale` always returns false, so `revalidateTag` from the Sanity webhook and the hourly cron purges nothing.
   - Live probe: `/resume` (`revalidate = 60`) returned `x-nextjs-cache: STALE` on all 9 requests over 2+ minutes (05:07:37 to 05:09:55 UTC). Sanity-backed pages (`/resume`, and the blog when public) refresh only on redeploy.

   The migration must design caching explicitly. An interim fix on Next is possible: OpenNext's Durable Object queue plus a D1 or DO tag cache, or rendering `/resume` dynamically.
3. **OG images:** a different renderer, so the output must be compared visually.
4. **Sanity:** `next-sanity` helpers (and `/studio`, if it's embedded) need the framework-agnostic `@sanity/client`. Draft mode needs a custom cookie flow, or should be dropped if unused.
5. **Library maturity:** pin versions from the registry at phase entry. The docs don't state versions.

## 5. Recommended program shape (after the redesign)

| Phase | Proves |
|---|---|
| 0 Parity harness | Crawl and record every route's status, head tags, JSON-LD, sitemap and redirects on the Next site; Playwright visual baselines from the redesigned site |
| 1 Scaffold | Start, Vite and the Cloudflare plugin alongside Next on a branch; `__root`, theme and fonts; one static route deploys to a preview Worker |
| 2 Content routes | All landing routes with loaders and `head()`; Query-backed Sanity reads; prerender where static |
| 3 Server surface | API routes (contact, subscribe, revalidate, cron), sitemap, robots, RSS, llms, security.txt, OG images, redirects |
| 4 Caching and Sanity | Cache layer with webhook purge, the cron in `src/server.ts`, the Studio decision |
| 5 Parity and cutover | The parity harness diff is clean; perf budget; switch the Workers route; keep the Next deployment for rollback; then remove Next |

## 6. Repo inventory (HEAD `a052220`, read-only scan)

### Size of the Next surface

| Item | Count |
|---|---|
| `page.tsx` / `layout.tsx` / route handlers | 22 / 6 / 12 |
| Metadata-file routes | 10: 5 `opengraph-image` (4 per-segment, rendered on demand), `icon`, `apple-icon`, `manifest`, `robots`, `sitemap` |
| Files importing `next`/`next/*` (non-test) | 85, of which 27 import only types |
| `"use client"` files / Server Actions / middleware | 47 / 0 / 0 |
| Prerendered entries (last build) | 73 |
| Config redirects | 8 permanent (308), plus Next's implicit trailing-slash 308 |

### Imports to swap

| Module | Files | Replacement |
|---|---|---|
| `next/link` | 33 | Router `Link` (2 use `scroll={false}`) |
| `next/navigation` | 13 | `notFound` ×6, `redirect` ×1, `usePathname` ×6, replaced by router equivalents and `useLocation` |
| `next/server` | 8 | `NextResponse`, replaced by the standard `Response` |
| `next/image` | 7 | Plain `<img>`; the optimizer passes images through on Workers today (no `IMAGES` binding) |
| `next/font/google` | 4 layouts | 5 families in 6 instances; Fontsource. The redesign cuts this to 2 families first |
| `next/script` | 4 | GTM, GA4, Umami, CF analytics |
| `next/og` | 3 | `lib/og/render.tsx` (used by all 5 OG files), `icon`, `apple-icon` |
| `next/headers` | 3 | `draftMode` only (`/resume`, `api/draft*`) |
| `next/cache` | 2 | `revalidateTag` in the webhook and cron routes |
| `next/web-vitals`, `next/dynamic` | 1 each | `web-vitals` package; `React.lazy` for the three.js field |
| `next-sanity` | 3 | `@sanity/client` (already a dependency) plus `groq`; the webhook signature check needs a framework-free equivalent |
| `@opennextjs/cloudflare` | 3 | Removed; `getCloudflareContext` becomes `env` from `cloudflare:workers` |
| `next-themes` | 2 | Keep if its pre-paint script works under Start SSR; otherwise a small cookie and inline script |

### Things that bite

1. **`<head>` parity.** Next generates much that the code never writes:
   - title templates and `title.absolute`;
   - absolute URLs via `metadataBase`, with no trailing slash on the home canonical;
   - page-level `alternates`/`openGraph` replacing the layout's;
   - Twitter tags copied from OpenGraph;
   - hashed `og:image` URLs with `og:image:*` sizes;
   - icon and manifest links;
   - 7 hreflang URLs and 3 robots variants.

   Snapshot every route's `<head>` from a fresh build before porting, then diff.
2. **OG images:** `lib/og/fonts.ts` reads TTFs with `node:fs` and `process.cwd()`, which won't work in a Vite-built Worker. Bundle fonts as assets and render with satori plus resvg-wasm. The OG URLs change, so social caches re-scrape.
3. **404s:** `notFound()` in 6 pages, and `dynamicParams = false` on `/skills/[slug]`, must return real 404s, not soft-200s.
4. **Client env:** `BlogIndex` and `BlogPostPage` (client) import `lib/content/blog.ts`. That imports the Sanity client, which reads `process.env.NEXT_PUBLIC_*` at module level. Vite has no `process` in the browser, so move Sanity behind server functions.
5. **Tooling tied to `.next`:**
   - the perf budget script;
   - `_headers` for `/_next/static`;
   - CI (`next build`, then the budget);
   - the `tsconfig` `next` plugin;
   - 4 tests that encode Next conventions: favicon, OG `hasOwnOgImage`, the manifest build script, and the font names.
6. **Studio route:** `/studio/static/*` uses `getCloudflareContext` and `env.ASSETS`. Its CSP `frame-ancestors` header comes from `next.config`, so the Worker must set it, because `_headers` only covers static assets.
7. **Draft mode:** used only by `/resume`. Port it with a cookie flow, or drop it.
8. **`<html lang>`:** `<html lang="en">` is hardcoded, so the Thai pages ship `lang="en"` on `<html>` (`<main lang="th">` was added in #35). Fix it deliberately during the migration.
9. **Ports as-is:** the cron Worker, Vitest (already plain Vite), JSON-LD builders, content modules, `lib/contact`, and `lib/newsletter`.
