# Target architecture: kunanonj.com on TanStack Start and Cloudflare

**Created:** 09-11-26
**Status:** Approved by the owner on 09-11-26 ("go" on all recommendations). Visual version: https://claude.ai/artifact/H5yujJtBTpMSnYuRoHhpBj (private to the owner).
**Verified against:** installed `@tanstack/react-start` 1.169.5 / `@tanstack/react-router` 1.170.46 (types and bundled `skills/*/SKILL.md`), the npm registry, the installed Wrangler 4.156.1 config schema, and Cloudflare docs via Context7, on 09-11-26. Re-check versions and anything marked "unverified" at each phase entry.

## Shape

- **One Worker** (`fronk-website`) serves everything. `src/server.ts` is the wrangler `main` and Start's server entry. It handles the Sanity webhook and `scheduled()` itself, because both need `env` and `ctx`, and hands every other request to `handler.fetch` from `@tanstack/react-start/server-entry`.
- **Static assets:** prerendered pages, hashed JS/CSS and fonts are served before the Worker runs (the `assets` config is filled in by the Vite plugin, with `not_found_handling: "none"`).
- **Worker cache:** `cache: { enabled: true }`. Sanity-backed responses carry a `Cache-Tag` and a CDN lifetime. The webhook and the hourly cron purge by tag with `ctx.cache.purge({ tags })`.
- **External services:** Sanity (GROQ through server functions), Resend (contact mail and the newsletter audience), the GitHub GraphQL API (contribution calendar), Turnstile siteverify.

## Rendering per route

| Mode | Routes | Mechanism |
|---|---|---|
| Built at deploy (17 page routes) | `/`, `/about`, `/contact`, `/portfolio` + projects, `/ventures/*`, `/skills` + 20 skills, `/stack`, `/proof`, `/build`, `/examples`, `/topics/*`, `/th/topics/*`, `/press`, `/design`, `/stock/asme`, 404 | `tanstackStart({ prerender: { enabled: true, crawlLinks: true } })`; slugs come from `lib/content` |
| Rendered on request, cached at the edge and purged by tag | `/resume`, `/learn`, `/blog`, `/blog/$slug`, `/feed.xml`, `/llms.txt`, `/sitemap.xml` | Loader `queryClient.ensureQueryData()` on a Sanity server function; route `headers()` sets `Cache-Tag` and the CDN lifetime; browser `max-age=0` |
| Cached by time | `/api/github/contributions`, OG images | `public, max-age=3600, stale-while-revalidate=86400`; OG URLs are hashed and immutable |
| Always live | `/api/contact`, `/api/subscribe`, `/api/revalidate` | Server functions (forms); `src/server.ts` (webhook); `no-store` |
| Client app | `/studio` | Studio shell + static files through the assets binding; frame-ancestors CSP |
| Removed | `/api/draft`, `/api/draft/disable` | Draft mode dropped (owner decision) |

Cache rules from the docs: the Worker cache skips responses with `s-maxage`, `private`, `no-store` or `Set-Cookie`; `s-maxage` turns off stale-while-revalidate; header precedence is `cloudflare-cdn-cache-control` > `cdn-cache-control` > `Cache-Control`. **Unverified:** whether stale-while-revalidate works inside `CDN-Cache-Control`. Phase 4 tests it on staging.

## TanStack suite

| Package (version on 09-11-26) | Call | Use |
|---|---|---|
| `@tanstack/react-start` 1.169.5 | Adopt | SSR, prerender, `createServerFn(...).validator().handler()`, server routes via `createFileRoute(path)({ server: { handlers } })`, `createMiddleware`, `createCsrfMiddleware`, `createStart` in `src/start.ts` |
| `@tanstack/react-router` 1.170.46 | Adopt | File routes, `head()`, `headers()`, loaders, `defaultPreload: "intent"`, `scrollRestoration`, `defaultViewTransition` (Phase 7), `validateSearch` with Standard Schema, `notFound()` |
| `@tanstack/react-query` 5.107.1 + `@tanstack/react-router-ssr-query` 1.167.3 | Adopt (Phase 4) | `queryOptions` per content type; `ensureQueryData` in loaders; `setupRouterSsrQueryIntegration`; one `QueryClient` per request, created in `getRouter()` |
| `@tanstack/react-form-start` 1.33.5 | Adopt (Phase 3) | Contact and newsletter forms; one schema client and server; `createServerValidate` |
| `@tanstack/react-devtools` 0.10.14 + router/query/form panels | Dev only (Phase 4) | Never in the production bundle |
| `@tanstack/react-pacer` 0.24.1 (beta) | Later | Blog search debounce once the blog is public |
| `@tanstack/react-table` 9.3.1 | Later | Only if the skills catalog outgrows plain filters |
| `@tanstack/ai` 1.2.0 | Later | Possible "ask this site" feature; not part of the migration |
| Virtual 3.14.26, Store 0.11.2 (alpha), DB 1.0.0-rc | Skip | No long lists, no client-side state or data sync |

Validation library: **Valibot 1** (owner decision), passed as Standard Schema to Router, Form and server functions.

## Cloudflare

| Product | Call | Config / API (Wrangler 4.156.1 schema) |
|---|---|---|
| Workers + static assets | Keep | `assets` from the Vite plugin; `env.ASSETS.fetch()` only for Studio static and OG fonts |
| Worker cache | Adopt | `cache: { enabled: true, cross_version_cache? }`; `Cache-Tag`; `ctx.cache.purge({ tags \| pathPrefixes \| purgeEverything })` |
| Cron Triggers | Adopt | `triggers.crons: ["0 * * * *"]`; `scheduled(controller, env, ctx)` in `src/server.ts` |
| Rate limiting | Adopt | `ratelimits: [{ name, namespace_id, simple: { limit, period: 10 \| 60 } }]`; `await env.RL.limit({ key })` → `{ success }`; approximate, per data centre |
| Turnstile | Adopt | Client `https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit`; server POST `/turnstile/v0/siteverify` with `secret`, `response`, `remoteip`; tokens last 300 s and work once |
| Observability | Keep | `observability: { enabled, logs, traces }` |
| Web Analytics | Keep | Beacon token in `vars` |
| Workers Builds | Keep | `wrangler deploy` on `main`; versions with preview URLs on PRs |
| Secrets | Tidy | `wrangler secret put`; `secrets.required` so a deploy without one fails |
| KV, R2, D1, Queues, Durable Objects, Images, Email sending, Smart Placement | Skip | Nothing to store; Sanity's CDN resizes images; Email sending is beta and needs Paid for arbitrary recipients |

Bindings are read with `import { env } from "cloudflare:workers"` inside server functions and routes, never through `process.env` at module scope.

Billing notes: with the Worker cache on, every request counts as a Worker request (static files included; hits use no CPU). Free gives SSR 10 ms of CPU per request and 100k requests a day.

## Contact form flow

1. TanStack Form validates in the browser with the shared Valibot schema.
2. Turnstile gives a one-time token.
3. A POST server function runs `createCsrfMiddleware` and `.validator(schema)`.
4. `env.RL.limit({ key: ip + ":contact" })` returns 429 on floods.
5. `siteverify` checks the token, hostname and action.
6. `sendContactMessage` (kept) sends one email through Resend.
7. `createServerValidate` returns field errors to the form.

## Gotchas (from the installed packages)

- The server-function validator method is `.validator()`. There is no `.inputValidator()` in 1.169; some Cloudflare examples are wrong.
- `createServerEntry` only accepts `{ fetch }`, so `scheduled` must come from `src/server.ts`, with wrangler `main` pointing there.
- Loaders run on the server and the client. Secrets and bindings belong in server functions and server routes; never fetch the site's own `/api/*` from a loader during SSR.
- Create one `QueryClient` per request, inside `getRouter()`.
- SSR options only get stricter down the route tree.
