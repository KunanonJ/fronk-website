<!-- Copied 18-11-26 from the planning session's read-only inventory of this repo at 563b2a3. Line numbers point at that commit; re-check them at each phase's research step. -->

# Codebase inventory: kunanonj.com (fronk-website) before the portfolio redesign

- **Repo:** fronk-website, researched in a git worktree of this branch.
- **Branch:** `feat/profile-site-redesign` at `563b2a3`, identical to `main`, worktree clean.
- **Researched:** 18-11-26, read-only. 839 tracked files.
- **Method:** read the code, configs, tests and process docs. Nothing was installed, built or run (`node_modules` is absent in this worktree), so versions come from `package.json` and `pnpm-lock.yaml`, and statements about prerender output or live caching come from code and process docs, not from a build.
- **Harness:** `.claude/` and `process/context/` are missing here, as expected (also logged as backlog P3 in `process/general-plans/backlog/backlog.md:70`).
- **Paths** are relative to the repo root; `file:line` points at the code cited.

---

## 0. Summary of the most important findings

1. **Stack.** TanStack Start 1.169.5 + TanStack Router 1.170.46 + React 19.3.1, built with Vite 8.3.6 and deployed as one Cloudflare Worker (`src/server.ts`). Tailwind CSS 4.3.3, CSS-first (`@theme inline` in `src/styles/globals.css`, no `tailwind.config`). Self-hosted Geist, Geist Mono and Noto Sans Thai. CSS-only motion: no framer-motion, GSAP, Lenis, three.js or any marquee/carousel library. `next-themes` 0.4.6 for the theme class.
2. **Light and dark themes already exist.** Class `.dark` on `<html>`, light by default, system preference ignored (`enableSystem={false}`), toggle with a circular View Transition reveal.
3. **Current look ("bento canvas", phase 7, 09/10-11-26).** A 1000 px column; every section is a 28 px-radius card in a 1/2/3-column grid; owner palette Signal `#2b3bff`, Glaze `#e8ebff`, Paper `#ffffff`, Ink `#0b0d17`, Clay `#ffe3d6`, Ember `#ff5a1f` (plus Mist `#e9eaf0`) mapped to role tokens. All tokens live in one file, `src/styles/globals.css` (1,095 lines).
4. **Header is not fixed or sticky.** K mark + email on the left; at >= 1024 px three text links (Work, Résumé, AI engineering); Share, theme and menu icon buttons. The menu is a dropdown panel that is always in the HTML (crawl path). Footer is small (copyright, 3 socials, a "For agents" row).
5. **Routes.** 21 page routes and 25 server routes (49 route files). 45 URLs in `sitemap.xml`. Case studies live at `/portfolio/[slug]` (5) and `/ventures/[slug]` (2). **`/work` is a 308 redirect to `/#ventures` today**, and the SEO records say `/portfolio/*` must not redirect.
6. **Content is local TypeScript** (`lib/content/`), not Sanity. Sanity feeds only the hidden blog and an optional résumé override that does not exist in production.
7. **Content gaps against the reference format:** no testimonials anywhere (and honesty rules forbid inventing them); "client logos" are 8 favicon-size employer marks (32 to 128 px); only 1 of 5 projects has a real screenshot (the other 4 use code-drawn mockups); the journey/timeline data is rich (résumé fallback, 24 entries in 7 sections).
8. **Guardrails a redesign will trip:** 96 Linux visual baselines (all change), a parity gate over 137 URLs that compares titles, **h1 text**, meta/link tags, JSON-LD and text bodies, about 1,450 lines of Playwright smoke tests keyed to accessible names and geometry (hero above the fold at 375 and 1440 px, header on one row at 1024 px, tap areas >= 24 px and not covered, share pill 56 px under 640 px), axe in both themes, unit ratchets (no raw hex, no text under 12 px, single-source card/hero classes, palette and fonts pinned, **Inter and Lenis banned**, every animation behind `prefers-reduced-motion: no-preference`, the LCP h1 never fades), contrast tests that parse `:root` / `.dark`, first-load JS budgets (entry 120 KB, default 165 KB, marketing 200 KB gzip), and content-claim audits that scan every source file.
9. **Open work that overlaps:** recruiter-fit phase 4 (planned, needs its own "ENTER EXECUTE MODE") rewrites the "Founder" framing on About, the venture pages, JSON-LD and their baselines. The tap-targets plan is done but still sits in `active/`.

---

## 1. Stack and build

### 1.1 Dependencies (`package.json`, resolved versions from `pnpm-lock.yaml`)

| Concern | Package and version | Notes |
| --- | --- | --- |
| App framework | `@tanstack/react-start` 1.169.5 | SSR, server functions, server routes, prerender |
| Router | `@tanstack/react-router` 1.170.46, `@tanstack/react-router-ssr-query` 1.167.3 | File routes in `src/routes/`, generated `src/routeTree.gen.ts` |
| Data | `@tanstack/react-query` 5.107.1 | One QueryClient per request (`src/router.tsx:13`, `src/lib/queryClient.ts`) |
| Forms | `@tanstack/react-form` 1.33.5 | Contact form only (`components/landing/contact/ContactForm.tsx`) |
| Validation | `valibot` 1.5.0 | Typed search params for every filter, contact schema |
| UI runtime | `react` / `react-dom` 19.3.1 | |
| Theme | `next-themes` 0.4.6 | Class strategy (section 3.11) |
| Icons | Custom SVG set `components/bento/icons.tsx` (232 lines) and `components/ui/SocialIcons.tsx`; `lucide-react` 1.66.0 in 5 files (skills pages, blog index, `components/landing/portfolio/VisualIcon.tsx`, `lib/content/visualIcons.ts`) | |
| CMS | `sanity` 6.21.0, `@sanity/client` 8.14.1, `@sanity/image-url` 2.1.1, `@sanity/code-input`, `@sanity/vision`, `@sanity/webhook` 4.0.4, `@portabletext/react` 8.0.1, `styled-components` 6.6.0 (Studio peer only, not used by the site) | |
| OG images | `@cf-wasm/og` 0.5.0 (satori in the Worker) | |
| Build | `vite` 8.3.6, `@vitejs/plugin-react` 6.2.1, `@cloudflare/vite-plugin` 1.67.0, `wrangler` 4.156.1 | `vite.config.mts` |
| CSS | `tailwindcss` 4.3.3, `@tailwindcss/postcss` 4.3.3 | `postcss.config.mjs` |
| Unit tests | `vitest` 5.0.5, `@vitest/coverage-v8` 5.0.5, `jsdom` 30.1.3, `@testing-library/react` 16.3.3, `@testing-library/jest-dom` 7 | `vitest.config.mts` |
| E2E | `@playwright/test` 1.64.1 (pinned to the CI container image), `@axe-core/playwright` 4.14.0 | `playwright.config.ts` |
| Lint/format | `eslint` 10.14.0, `typescript-eslint` 8.72.1, `eslint-plugin-react` 7.37.5 (patched, `patches/`), `eslint-plugin-react-hooks` 7.1.1, `eslint-plugin-jsx-a11y` 6.10.2, `prettier` 3.9.10, `knip` 6.43.0 | |
| TypeScript | `typescript` = `@typescript/typescript6` 6.0.2 (API for tools); `typescript-7` provides the `tsc` that `pnpm typecheck` runs | |
| Runtime | Node `>=22.22.2`, `.node-version` 22.23.4, `pnpm@10.34.9` | |

Not present (checked in the lockfile importers): framer-motion, motion, gsap, lenis, three, embla-carousel, any marquee or slider package.

### 1.2 App structure and router

- `src/routes/` file routes; `src/routeTree.gen.ts` is generated (ignored by ESLint).
- `src/router.tsx`: per-request QueryClient, `scrollRestoration: true`, `defaultPreload: "intent"`, `defaultErrorComponent: RouteError`, and `defaultViewTransition` with type `["page"]` only when the path changes (`src/router.tsx:26-28`).
- `src/routes/__root.tsx`: the document shell for every page, the 404 and errors. Sets `<html lang>` to `th` on `/th/*` (`:71-72`), `className="h-full antialiased"`, `data-scroll-behavior="smooth"` (`:74-79`), body `bg-page text-ink` (`:91`), site JSON-LD in `<body>` (`:92-95`), `ThemeProvider` (`:96-103`), `CloudflareAnalytics`, dev-only devtools. Preloads the two Latin font files and links `fonts.css` and `globals.css` (`:41-61`). Theme-color metas are written straight into `<head>` (`:82-89`).
- Layout routes: `_landing.tsx` wraps pages in `components/landing/LandingLayout.tsx` (header, footer); `_system.tsx` wraps `/design` in `components/system/SystemLayout.tsx` (10 lines, minimal chrome); `/studio` uses `components/studio/StudioLayout.tsx`.
- Folders: `src/` (routes, Worker entry, server code, query options, head/cache helpers, styles, fonts), `components/` (React), `lib/` (framework-free content, SEO, Sanity, design ratchets, utils), `sanity/` (Studio schemas), `scripts/` (build and gate scripts), `tests/` (Playwright and parity fixture), `public/`.
- Alias `@/` = repo root (`vite.config.mts:65-67`, `tsconfig.json` paths).
- Links: `components/navigation/Link.tsx` wraps the TanStack `Link` behind `next/link`-style props and renders plain `<a>` for files, `/api` and `/studio` (`:11`).

### 1.3 Styling system

- Tailwind CSS 4.3.3 via `@tailwindcss/postcss` (`postcss.config.mjs`). **No `tailwind.config.*`.** The theme is `@theme inline` in `src/styles/globals.css:13-122`; `@import "tailwindcss"` (`:9`); dark variant `@variant dark (&:where(.dark, .dark *))` (`:11`).
- Global CSS: `src/styles/globals.css` (tokens, base, intro, print, reduced motion, bento motion, keyframes, view transitions) and `src/styles/fonts.css` (`@font-face` and font variables), both linked from `__root.tsx` with `?url` imports.
- Shared class strings: `components/bento/classes.ts` (`CARD_SURFACE`, `MONO_LABEL`, `ICON_BUTTON`, `PANEL`, `ROW`). `cn()` in `lib/utils/cn.ts` joins classes without merging (comment in `lib/design/sharedPrimitives.test.ts:17-18`).
- Global hook classes for motion: `.kj` (canvas root, applied by `PageMain`, header and footer), `.kj-lines`, `.kj-row`, `.kj-icon`, `.kj-panel`, `.kj-menu`, `.kj-live`, `.kj-place*`, `.kj-glass`, `.bento`, `.bento-2`, `.bento-row`, `.btn-cta`, `.landing-root`, `.intro-*`.
- Inline styles are rare: `components/bento/BangkokScene.tsx` (7), `components/CompanyLogo.tsx` (2), OG renderers, single uses in `IntroLoader`, `IntroBurst`, `ProjectCards`, `StackPage`, `VentureCards`, `ResumePrint`.
- Hard-coded values: about 550 arbitrary Tailwind values in components (452 in `components/landing`, 65 in `components/bento`, 29 in `components/resume`). Most common: `leading-[1.55]` (26), `min-[641px]:` (21), `tracking-[-0.02em]` (20), `leading-[1.6]` (18), `text-[17px]` (11), `px-[18px]` (11), `text-[22px]` (9), `text-[40px]` (8), `rounded-[18px]` (8).

### 1.4 Fonts and how they load

| Family | Files (`src/fonts/`) | CSS variable | Tailwind |
| --- | --- | --- | --- |
| Geist (variable 100-900) | `geist-latin`, `-latin-ext`, `-cyrillic`, `-cyrillic-ext`, `-vietnamese` `.woff2` | `--font-geist-sans: "Geist", "Geist Fallback"` (`fonts.css:169-173`) | `--font-sans`, `--font-display` (`globals.css:15-21`) |
| Geist Mono (variable 100-900) | `geist-mono-latin`, `-latin-ext`, `-cyrillic`, `-cyrillic-ext`, `-vietnamese`, `-symbols` | `--font-geist-mono` | `--font-mono` |
| Noto Sans Thai (variable 100-900) | `noto-sans-thai-thai`, `-latin`, `-latin-ext` | `--font-noto-thai` | second in `--font-sans` |

- `font-display: swap`, `unicode-range` subsets, size-adjusted Arial fallback faces ("Geist Fallback", "Geist Mono Fallback", "Noto Sans Thai Fallback"). Copied from the old Next build on 09-11-26 (`fonts.css:1-7`).
- Preload: `geist-latin.woff2` and `geist-mono-latin.woff2` only (`__root.tsx:42-55`); Thai loads on demand.
- OG images bundle their own TTFs (`lib/og/fonts/Geist-Regular.ttf`, `Geist-Bold.ttf`, inlined by `lib/og/fonts.ts`).
- **Guard:** `lib/design/globals.test.ts:75-107` requires exactly these six `@font-face` families and fails on "Hanken Grotesk", "Instrument Serif", "Space Mono", "Almarai" and **"Inter"**, and on the aliases `--font-instrument-serif`, `--font-almarai`, `--font-hanken`, `--font-serif`.

### 1.5 Motion, animation and smooth scroll

- **CSS-only motion** by owner decision (AGENTS.md:730, "CSS-only motion (no framer-motion)"; AGENTS.md:720, "Prefer straightforward, minimized animation on the home shell").
- Keyframes in `globals.css`: intro (`intro-word-in`, `intro-pop`, `intro-flash`, `intro-confetti`, `intro-sparkle`, `:347-495`) and canvas (`kj-rise`, `kj-line`, `kj-drop`, `kj-pop`, `kj-in`, `kj-spin`, `kj-pulse`, `kj-drift`, `kj-clouds`, `kj-breathe`, `kj-twinkle`, `kj-boat`, `kj-shimmer`, `kj-reveal`, `:914-1048`).
- View Transitions API: page cross-fade 0.28 s (`:1058-1062`); theme circular reveal 0.8 s (`:1064-1087`); all off under reduced motion (`:1089-1095`).
- JS motion gates: `lib/hooks/useReducedMotion.ts` (server snapshot says "reduced") and `lib/motion/motionRuntime.ts` (`prefersReducedMotion()`).
- Global reduced-motion kill switch (`globals.css:563-573`).
- **Smooth scroll:** `html { scroll-behavior: smooth }` (`globals.css:287`) plus `data-scroll-behavior="smooth"` on `<html>` (`__root.tsx:77`); reduced motion sets `scroll-behavior: auto` (`:571`); router `scrollRestoration: true`. No Lenis, and `lib/design/globals.test.ts:132-134` fails if `globals.css` imports it.
- **Nothing scroll-driven exists:** no `IntersectionObserver` (only stubbed in `vitest.setup.ts`), no `animation-timeline`, no `position: sticky` or `fixed` element except the intro overlay (`components/landing/IntroLoader.tsx:88`), no marquee.

### 1.6 CMS (Sanity): what comes from it and what is local

- Project `nkspfk4b`, dataset `production`, API version `2025-01-01` (`wrangler.jsonc:14-20`). Hosted Studio `https://fronk-website.sanity.studio/`; `/studio` on the site is a launcher page only (`components/studio/StudioPage.tsx`).
- Schemas (`sanity/schemas/index.ts`): documents `post`, `author`, `homePage`, `resumeProfile`, `siteSettings`, `standardPage`, `venture`, `writingPage`; objects `cta`, `navItem`, `portableBody`, `resumeTimelineItem`, `resumeTimelineSection`, `seo`. Desk structure in `sanity/structure.ts`.
- **Read by the app** (`lib/sanity/queries.ts`: 4 GROQ queries; `src/server/content.functions.ts:74-110`; query options in `src/queries/content.ts`):
  - `post`: blog index and posts; `/learn` cards, sitemap, `llms.txt`, `index.md` and the feed only while `BLOG_PUBLIC` is true (it is false).
  - `writingPage`: the blog index eyebrow.
  - `resumeProfile`: overrides the résumé sections. **No such document exists in production**, so `/resume` renders `lib/content/resumeTimeline.fallback.ts` (AGENTS.md:737, 742).
- **Not read by any app code:** `homePage`, `siteSettings`, `standardPage`, `venture` (legacy schemas).
- Everything else (Home, About, Contact, portfolio, ventures, topics, skills, library pages, press, FAQ, résumé facts) is local TypeScript in `lib/content/` (section 7).
- Caching: Sanity-backed responses carry `Cache-Tag` and `CDN-Cache-Control: public, max-age=3600, stale-if-error=0` (`src/lib/cache.ts:25, 38-54`); the Sanity webhook `POST /api/revalidate` purges by tag (`src/server.ts:44-50`, `src/server/revalidate.ts`). No cron.
- Build: `pnpm build` = `sanity:manifest` (`scripts/sanity-manifest.mjs`) -> `vite build` -> `sanity:schema:deploy` (`scripts/sanity-schema-deploy.mjs`, skipped without `SANITY_AUTH_TOKEN`). `pnpm seed` (`scripts/seed-content.mjs`) creates missing documents.

### 1.7 Image handling

- No image optimizer on Workers. `components/ui/Image.tsx` is a `next/image`-compatible shim that renders a plain `<img>` (used by `BlogParts`, `ProjectCards`, `PortfolioIndexPage`, `PressPage`, `PortableText`); everything else is a raw `<img>` with `width`/`height`, `loading="lazy"`, `decoding="async"`.
- Blog images come from the Sanity CDN via `@sanity/image-url` (`lib/sanity/client.ts`); `cdn.sanity.io` is preconnected (`__root.tsx:58-59`).
- Static files in `public/` (section 6.10). Cache headers for static files in `public/_headers`.
- OG cards and icons are rendered in the Worker (`src/server/og/*.tsx` with `lib/og/card.tsx`, `lib/og/render.tsx`) from a hard-coded palette mirror `lib/brand/tokens.ts`; cached a day (`withImageCache`, `src/lib/cache.ts:109-111`).

### 1.8 Deploy (Cloudflare Workers)

- Production Worker `fronk-website` (`wrangler.jsonc`), staging `fronk-website-start` (`wrangler.start.jsonc`, `pnpm deploy:staging`). `main: src/server.ts`, compat date 2026-06-16, flags `nodejs_compat`, `global_fetch_strictly_public`, observability on.
- `assets.run_worker_first` (`wrangler.jsonc:30-42`, same list in the staging file): `/*/` (trailing-slash 308s), `/`, `/about`, and each of the 5 `/portfolio/<slug>` paths one by one, so the Worker can answer `Accept: text/markdown`. `lib/cloudflare/cacheConfig.test.ts` fails when the list and the portfolio slugs differ. Never use a `!` pattern there (AGENTS.md:748).
- `cache.enabled: true`, `triggers.crons: []`, rate limit `FORM_RATE_LIMIT` (5 per 60 s), Durable Object migrations `v1`/`v2` (append-only).
- Worker entry `src/server.ts:28-61`: 308 redirects -> Sanity webhook -> Markdown negotiation for `/`, `/about`, `/portfolio/<slug>` -> TanStack Start. Every response gets security headers (`src/server/http.ts`); server-function answers without `Cache-Control` get `no-store`. Static files get the same headers from `public/_headers` (keep the two lists equal).
- **Prerender** (`vite.config.mts:99-110`): `crawlLinks: true`, excludes `/resume`, `/learn`, `/blog`, `/api`, `/studio`, file-like paths and trailing slashes; extra pages `EXTRA_PRERENDER_PATHS` = the 4 Thai hubs (`scripts/prerender-pages.mjs:6-11`, kept in step with `TOPIC_SLUGS` by `scripts/prerender-pages.test.ts`). Prerendered pages are served as static assets and never reach the Worker (except the `run_worker_first` list).
- Build guard: `vite build` throws when `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SANITY_PROJECT_ID` or `NEXT_PUBLIC_SANITY_DATASET` is missing (`vite.config.mts:36-58`); they come from wrangler `vars`. `NEXT_PUBLIC_*` names are inlined at build (`:21-30, 68-73`).
- Workers Builds: `main` -> `pnpm run build:cloudflare` + `npx wrangler deploy` (**every merge to `main` deploys production**); other branches -> `wrangler versions upload` with a preview URL comment from the `cloudflare-workers-and-pages` bot (README "Deploying"; AGENTS.md:740).
- Runtime secrets/vars: `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`, `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `SANITY_REVALIDATE_SECRET`, `SANITY_AUTH_TOKEN`, `GITHUB_TOKEN`, `NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN`, `NEXT_PUBLIC_GSC_VERIFICATION` (`.env.example`, `.dev.vars.example`).

### 1.9 CI (`.github/workflows/ci.yml`)

Runs on pushes to `main` and pull requests to `main`; read-only permissions; concurrency cancels older runs.

| Job | Container | Steps |
| --- | --- | --- |
| `verify` (`:18-84`) | ubuntu | install, cache Sanity manifest, `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, `pnpm knip`, `pnpm test` (with Sanity env), `pnpm build`, `pnpm perf:budget` |
| `e2e-smoke` (`:86-151`) | ubuntu + Playwright Chromium | `pnpm build`, then `pnpm exec playwright test smoke.spec.ts a11y.spec.ts --project=desktop` with `CI=true PLAYWRIGHT_WEB_SERVER="pnpm start"` |
| `visual` (`:157-215`) | `mcr.microsoft.com/playwright:v1.64.1-noble` | `pnpm build`, `pnpm exec playwright test visual.spec.ts --project=mobile --project=desktop`, uploads snapshots and diffs (7 days) |
| `parity` (`:220-253`) | same image | `pnpm build`, `node scripts/start-gates.mjs --parity-only` |

- Dependabot: weekly grouped PRs with a 7-day cooldown; `@playwright/test` is ignored and bumped by hand with the container image (`.github/dependabot.yml`).
- Stale comment: `ci.yml:81-82` says budgets are "200 KB default; 255 KB marketing"; the script enforces 165 / 200 / 120 KB (section 8.6).

---

## 2. Every public route

Route files: 21 page routes, 3 layout routes (`__root`, `_landing`, `_system`) and 25 server routes, 49 files in all.

### 2.1 Page routes (HTML)

All `_landing` pages render inside `LandingLayout` and put their body in `PageMain` (`<main id="main" class="kj ...">`, `components/bento/Bento.tsx:18-35`), except the topic and venture hubs, whose page components render `PageMain` themselves. "Prerendered" means built at deploy from `lib/content` and served as a static file.

| URL | Route file | Renders | Data source | Render mode | Index and SEO surfaces |
| --- | --- | --- | --- | --- | --- |
| `/` | `src/routes/_landing/index.tsx` | `IntroLoader`, `HomeHero`, `Bento dense`: `SelectedWorkCard`, `ExperienceCard`, `VenturesCard` (`id="ventures"`), `HowIWorkCard`, `PlaceCard span 3` | `lib/content/landing.ts`, `portfolio.ts` (featured), `resumeTimeline.fallback.ts`, `aboutPage.ts` (principles), `availability.ts` | Prerendered; Worker-first for `Accept: text/markdown` | Indexed, sitemap 1.0; title absolute `site.title`; site JSON-LD graph (Person, WebSite, Organizations) from the root on every page; default OG `/opengraph-image`; Markdown twin `/index.md`; `Link` headers to `/index.md`, `/llms.txt`, sitemap |
| `/about` | `_landing/about.tsx` | `AboutHero`, `AboutPageContent` (8 cards) | `aboutPage.ts`, `faq.ts`, socials; the Activity card fetches `/api/github/contributions` on the client | Prerendered; Worker-first | Indexed 0.9; title absolute `PAGE_META.about.title` (the h1 restates it, `aboutPage.test.ts`); ProfilePage + FAQPage JSON-LD; OG `/about/opengraph-image`; twin `/about.md` |
| `/contact` (`?topic=hiring`) | `_landing/contact.tsx` | `ContactPage` (hero, Email, form, Elsewhere, Who should write, For recruiters, Bangkok card) | `lib/content/contact.ts`; posts to `/api/contact` | Prerendered (one file for every `?topic=`; the param applies after hydration, `src/lib/filterParam.ts:19-21`) | Indexed 0.8 |
| `/portfolio` (`?category=`) | `_landing/portfolio/index.tsx` | `PortfolioIndexPage` | `lib/content/portfolio.ts` | Prerendered | Indexed 0.8; BreadcrumbList + CollectionPage/ItemList JSON-LD |
| `/portfolio/$slug` (5) | `_landing/portfolio/$slug.tsx` | `PortfolioProjectPage` | `portfolio.ts` | Prerendered; each slug Worker-first | Indexed 0.7; title `namedPageTitle(name, tagline)`; BreadcrumbList + CreativeWork JSON-LD; OG `/portfolio/<slug>/opengraph-image`; twin `/portfolio/<slug>.md` |
| `/ventures/$slug` (2) | `_landing/ventures/$slug.tsx` | `VentureHubPage` + `VentureCards` | `lib/content/ventures.ts`; related-topic map `RELATED` in the route file (`:18-40`) | Prerendered | Indexed 0.9; SoftwareApplication (+Offer) + BreadcrumbList (Home > Ventures `/#ventures` > name); OG per slug |
| `/topics/$slug` (4) | `_landing/topics/$slug.tsx` | `TopicHubPage` | `lib/content/topics/pillars.ts` (EN) | Prerendered | Indexed 0.95; Article + FAQPage + BreadcrumbList; hreflang en/th/x-default; OG per slug |
| `/th/topics/$slug` (4) | `_landing/th/topics/$slug.tsx` | `TopicHubPage` (Thai) | `pillars.ts` (TH) | Prerendered via `EXTRA_PRERENDER_PATHS` (reachable only through hreflang) | Indexed 0.85; `<html lang="th">`, `og:locale th_TH`; same JSON-LD, image = the EN hub card |
| `/skills` (`?show=`) | `_landing/skills/index.tsx` | `SkillsIndexPage` | `lib/content/skills.ts` + `skills.generated.json` (snapshot of `KunanonJ/superstacks`) | Prerendered | Indexed 0.8; BreadcrumbList + SoftwareSourceCode pack |
| `/skills/$slug` (20) | `_landing/skills/$slug.tsx` | `SkillDetailPage` | same | Prerendered | Indexed 0.6; SoftwareSourceCode + BreadcrumbList; OG per skill |
| `/learn` (`?lang=th`) | `_landing/learn.tsx` | `LearnPage` | `lib/content/learn.ts`, pillars; Sanity posts only while the blog is public | On request, edge 1 h, tag `posts` | Indexed 0.85 |
| `/examples` (`?persona=`) | `_landing/examples.tsx` | `ExamplesPage` | `lib/content/examples.ts` | Prerendered | Indexed 0.8 |
| `/stack` (`?group=`) | `_landing/stack.tsx` | `StackPage` | `lib/content/stack.ts`, `stackIcons.ts` | Prerendered | Indexed 0.75 |
| `/proof` | `_landing/proof.tsx` | `ProofPage` | `lib/content/proof.ts` (portfolio outcomes, venture metrics) | Prerendered | Indexed 0.8 |
| `/build` (`?venture=`) | `_landing/build.tsx` | `BuildPage` | `lib/content/buildBoard.ts` | Prerendered | Indexed 0.75 |
| `/resume` (`?view=compact`) | `_landing/resume.tsx` | `ResumePage` + print-only `ResumePrint` | Sanity `resumeProfile`, else the repo fallback (`degraded`) | On request; edge 1 h, `no-store` when degraded | **noindex, nofollow**, not in sitemap; own share meta; `/resume.pdf` sends `X-Robots-Tag: noindex` |
| `/blog` (`?tag=`, `?q=`) | `_landing/blog/index.tsx` | `BlogIndexPage` | Sanity `post` + `writingPage` | On request; edge 1 h, tags `posts`, `writing` | Hidden (`BLOG_PUBLIC = false`): noindex, follow; unlinked; out of sitemap, llms.txt, feed |
| `/blog/$slug` | `_landing/blog/$slug.tsx` | `BlogPostView` / `BlogPostPage` | Sanity `post` | On request | Hidden as above; a BlogPosting builder exists (`lib/seo/jsonLd.ts:285`) |
| `/press` (`?type=`) | `_landing/press.tsx` | `PressPage` | `lib/content/press.ts` | Prerendered per `process/features/tanstack-migration/references/target-architecture_09-11-26.md:18` (not re-verified by a build here) | Hidden since 04-11-26: noindex, follow; unlinked; out of sitemap and llms |
| `/design` | `_system/design.tsx` | `DesignSystemPage` in `SystemLayout` | tokens and components | Prerendered (same source) | noindex, nofollow; unlinked; its canonical is the homepage (backlog P3) |
| `/studio` | `src/routes/studio.tsx` | `StudioLayout` + `StudioPage` | `NEXT_PUBLIC_SANITY_STUDIO_URL` | Edge a day; CSP `frame-ancestors` sanity.io | noindex; robots disallows `/studio` |
| any unknown path | root `notFoundComponent` -> `components/NotFound.tsx` | `LandingLayout` + `StatusPage` ("Nothing lives here.", 4 recovery links, report card) | static | status 404 | Test name `not-found` |
| errors | root `errorComponent` and router default -> `components/RouteError.tsx` | reuses the `StatusPage` layout | | | |

### 2.2 Server routes (text, feeds, images, APIs)

| URL | File | Built from | Cache |
| --- | --- | --- | --- |
| `/index.md` | `src/routes/index[.]md.ts` -> `src/server/text/homeMd.ts` | content modules (+posts when public) | edge, tag `posts` |
| `/about.md` | `about[.]md.ts` -> `text/aboutMd.ts` | `aboutPage.ts` etc. | edge 1 day |
| `/portfolio/<slug>.md` | `portfolio.{$slug}[.]md.ts` -> `text/portfolioMd.ts` | `portfolio.ts` | edge 1 day; unknown slug 404 |
| `/operating-model.md` | `operating-model[.]md.ts` -> `text/operatingModelMd.ts` | `operatingModel.ts` | 1 day |
| `/agents.md` | `agents[.]md.ts` -> `text/agentsMd.ts` | content modules | 1 day |
| `/sitemap.md` | `sitemap[.]md.ts` -> `text/sitemapMd.ts` | content modules | 1 day |
| `/llms.txt` | `llms[.]txt.ts` -> `text/llms.ts` | identity, ventures, skills, topics, résumé roles, portfolio groups | edge, tag `posts` |
| `/llms-full.txt` | `llms-full[.]txt.ts` -> `text/llmsFull.ts` | as above plus every résumé bullet | 1 day |
| `/skills.json` | `skills[.]json.ts` -> `text/skillsJson.ts` | skills snapshot | 1 day |
| `/.well-known/agent-skills/index.json` | `[.]well-known/agent-skills/index[.]json.ts` -> `text/agentSkillsIndex.ts` | skills snapshot (digests from `pnpm skills:sync`) | 1 day |
| `/.well-known/security.txt` | `[.]well-known/security[.]txt.ts` -> `text/securityTxt.ts` | `lib/seo/securityTxt.ts` | 1 day |
| `/sitemap.xml` | `sitemap[.]xml.ts` -> `lib/seo/sitemap.ts` | content modules | edge, tag `posts` |
| `/robots.txt` | `robots[.]txt.ts` -> `lib/seo/robots.ts` | | 1 day |
| `/manifest.webmanifest` | `manifest[.]webmanifest.ts` -> `lib/seo/manifest.ts` | note: `theme_color` and `background_color` are `#000000` (`:11-12`), not the palette | 1 day |
| `/feed.xml` | `feed[.]xml.ts` -> `text/feed.ts` | posts (empty while hidden) | tag `posts` |
| `/opengraph-image` | `opengraph-image.ts` -> `src/server/og/siteOg.tsx` | `lib/og/card.tsx` + `lib/brand/tokens.ts` | image, 1 day |
| `/about/opengraph-image` | `about.opengraph-image.ts` -> `og/aboutOg.tsx` | | |
| `/portfolio/$slug/opengraph-image` | `portfolio.$slug.opengraph-image.ts` -> `og/portfolioOg.tsx` | | |
| `/skills/$slug/opengraph-image` | `skills.$slug.opengraph-image.ts` -> `og/skillOg.tsx` | | |
| `/topics/$slug/opengraph-image` | `topics.$slug.opengraph-image.ts` -> `og/topicOg.tsx` | | |
| `/ventures/$slug/opengraph-image` | `ventures.$slug.opengraph-image.ts` -> `og/ventureOg.tsx` | | |
| `/icon`, `/apple-icon` | `icon.ts`, `apple-icon.ts` -> `og/icon.tsx`, `og/appleIcon.tsx` | brand ink, glaze, signal, monogram "K" | |
| `/api/contact` (POST; others 405) | `api/contact.ts` -> `src/server/formGuard.ts` then `src/server/api/contact.ts` | Resend | none |
| `/api/github/contributions` (GET) | `api/github/contributions.ts` -> `src/server/api/githubContributions.ts` | GitHub GraphQL with `GITHUB_TOKEN`, else the public HTML | 1 h, SWR 1 day |
| `/api/revalidate` (POST) | no route file: handled in `src/server.ts:44-50` -> `src/server/revalidate.ts` | Sanity webhook | |
| static | `public/skills.md` (coding guide for agents, not the catalog), `/resume.pdf`, `/profile.jpg`, `/profile-portrait.webp`, `/brand/*`, `/portfolio/kunanonj-com/cover.webp` | | `public/_headers` |

### 2.3 Redirects (`src/lib/redirects.ts:2-22`, served as 308 by `src/server.ts:39-43`; the query string is kept unless the target has a `#`)

| From | To |
| --- | --- |
| `/stock/asme` | `/about` |
| `/ventures` | `/#ventures` |
| `/now` | `/` |
| `/writing` | `/blog` |
| **`/work`** | **`/#ventures`** |
| `/rss.xml` | `/feed.xml` |
| `/showcase` | `/` |
| `/stock/velorah` | `/` |
| `/writing/<slug>` | `/blog/<slug>` |
| any path ending in `/` (not `/`) | the same path without it; leading slashes collapse to one |

`/#ventures` depends on `id="ventures"` on the Home Ventures card (`components/landing/home/HomeCards.tsx:68-74`); the 404 page, the site menu and the venture breadcrumbs also link there.

### 2.4 SEO surfaces and how they are produced

- **Head pipeline:** each route builds a `Metadata` object (often `routeShareMeta()` in `lib/seo/routeMeta.ts`) -> `pageHead()` (`src/lib/head.ts`) -> `metadataToHead()` (`lib/seo/metadataToHead.ts`). Root defaults in `lib/seo/rootMetadata.ts` (title template with the site-name suffix `TITLE_SUFFIX`, `lib/seo/pageTitle.ts:4`; max title 60 chars; OG/Twitter defaults; `@fkj98`). Page titles and descriptions for content pages: `lib/content/pageMeta.ts`.
- **Canonical/OG:** `routeShareMeta()` sets canonical, OG, Twitter; `fileOg()` (`src/lib/og.ts`) adds the route's own 1200 x 630 PNG.
- **JSON-LD builders:** `lib/seo/jsonLd.ts` (site graph Person/WebSite/Organizations `:81`, ProfilePage `:132`, FAQPage `:156`, SoftwareApplication `:192`, BreadcrumbList `:227`, topic Article `:259`, BlogPosting `:285`), `lib/seo/portfolioJsonLd.ts` (CreativeWork, CollectionPage/ItemList), `lib/seo/skillsJsonLd.ts` (SoftwareSourceCode). They are rendered as `<script type="application/ld+json">` **inside the page bodies** (route components), and the site graph in `<body>` from the root.
- **Sitemap** (`lib/seo/sitemap.ts`): 45 URLs: `/` (1.0), `/about` (0.9), `/contact` (0.8), `/learn` (0.85), `/examples` (0.8), `/stack` (0.75), `/proof` (0.8), `/build` (0.75), `/portfolio` (0.8) + 5 projects (0.7), `/skills` (0.8) + 20 skills (0.6), 4 `/topics/*` (0.95), 4 `/th/topics/*` (0.85), 2 `/ventures/*` (0.9). `lastModified` = `SITE_UPDATED` (`lib/content/freshness.ts`).
- **Robots** (`lib/seo/robots.ts`): `*` allowed except `/studio`, `/api`; explicit allow groups for Googlebot, Bingbot, ChatGPT-User, OAI-SearchBot, GPTBot, PerplexityBot, Perplexity-User, Claude-User, Claude-SearchBot, ClaudeBot, Google-Extended, Applebot, Applebot-Extended; `Content-Signal: search=yes, ai-input=yes, ai-train=yes` in each allowing group; CCBot and Bytespider blocked; Host and Sitemap always `https://kunanonj.com`.
- **Markdown negotiation:** `/`, `/about`, `/portfolio/<slug>` answer `Accept: text/markdown` with their twin (`src/server/negotiate.ts:14-17`), `Vary: Accept`.
- **Identity:** `rel="me"` links (`lib/seo/identity.ts`): X, LinkedIn, GitHub, Telegram, Farcaster, mailto. Theme-color metas `#0b0d17` (dark) and `#f5f6fa` (light) (`lib/seo/rootMetadata.ts:53-59`).
- **Crawl path:** the site menu is server-rendered on every page and only `hidden` while closed, "its links are the only site-wide navigation crawlers that don't run JavaScript can follow" (`components/bento/SiteHeader.tsx:141-147`). The prerender step also discovers pages by following `<a>` links (`crawlLinks: true`).

---

## 3. Design system today

### 3.1 Where tokens live and how they flow

`src/styles/globals.css` is the only source: raw palette (`:130-142`) -> role variables for light (`:148-178`) and dark (`.dark`, `:183-209`) -> Tailwind theme names in `@theme inline` (`:13-122`) -> utilities in components (`bg-page`, `text-ink`, `border-hairline`, `bg-cta text-on-cta`, `text-mark`, `rounded-bento`, `shadow-card`, `text-meta`...). Components are meant to use only role utilities and the type tokens (header comment `:1-7`). Renderers that cannot read CSS variables (OG cards, icons, theme-color) use the mirror `lib/brand/tokens.ts`, which must be kept in sync by hand.

### 3.2 Palette (`globals.css:130-142`, pinned by `lib/design/globals.test.ts:28-41`)

| Name | Value | Rule |
| --- | --- | --- |
| `--palette-signal` | `#2b3bff` | links, accents, markers (fails 3:1 on Ink, so dark mode uses `#8e97ff`) |
| `--palette-signal-hover` | `#1e2bd6` | |
| `--palette-glaze` | `#e8ebff` | tints; ink text in dark mode |
| `--palette-paper` | `#ffffff` | surfaces |
| `--palette-ink` | `#0b0d17` | text; dark page |
| `--palette-clay` | `#ffe3d6` | warm surface |
| `--palette-ember` | `#ff5a1f` | **only** live or failed states, as small squares with a text label, on Paper or Ink (fails 3:1 on Glaze, Clay, Mist) |
| `--palette-mist` | `#e9eaf0` | wells |
| `--ease` | `cubic-bezier(0.2, 0.8, 0.2, 1)` | canvas curve |
| `--spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | overshoot |

### 3.3 Role tokens (light default and `.dark`)

| CSS variable | Tailwind name (`bg-*`, `text-*`, `border-*`) | Light | Dark |
| --- | --- | --- | --- |
| `--page` | `page` | `#f5f6fa` | Ink `#0b0d17` |
| `--surface` | `surface` | Paper `#ffffff` | `#151829` |
| `--surface-tint` | `surface-tint` | Glaze `#e8ebff` | `#1d2136` |
| `--surface-warm` | `surface-warm` | Clay `#ffe3d6` | `#282837` |
| `--well` | `well` | Mist `#e9eaf0` | `#0f1220` |
| `--ink` | `ink` | `#0b0d17` | Glaze `#e8ebff` |
| `--ink-2` | `ink-2` | `#565b70` | `#a1a6bd` |
| `--muted` | `ink-3` (display connector words only, 3:1) | `#80859b` | `#7d83a0` |
| `--hairline` | `hairline` | `rgba(11,13,23,0.08)` | `rgba(232,235,255,0.08)` |
| `--hairline-strong` | `hairline-strong` | `rgba(11,13,23,0.16)` | `rgba(232,235,255,0.16)` |
| `--action` / `--action-hover` | `action`, `action-hover` | Signal / `#1e2bd6` | same |
| `--on-action` | `on-action` | Paper | Paper |
| `--accent` | `mark` | Signal `#2b3bff` | `#8e97ff` |
| `--link`, `--focus` | `link`, `focus` | = accent | = accent |
| `--cta` / `--oncta` | `cta` / `on-cta` (primary buttons are ink) | Ink / Paper | Glaze / Ink |
| `--ember` | `ember` | `#ff5a1f` | `#ff5a1f` |
| `--error-text` | `error` | `#b3360a` | `#ff7a45` |
| `--success-text` | `success` | `#137036` | `#4ade80` |
| `--onphoto`, `--onphoto2` | `on-photo`, `on-photo-2` | `#ffffff`, `rgba(255,255,255,0.74)` | same |
| `--glass`, `--glass2` | `glass`, `glass-2` | `rgba(255,255,255,0.14)`, `0.26` | same |
| `--water2` | `water` | `#232a3f` | `#070a18` |
| palette art | `signal`, `glaze`, `clay`, `paper` (art only, never text) | | |

Art-only tokens: about 30 `--scene-*` variables for the Bangkok card plus `--glowop`/`--starop` (`:217-267`, dark overrides sky, water, glow, stars); map art `--map`, `--river` (`:273-281`). Usage counts in `.tsx` (components and src): `text-mark` 31, `bg-mark` 30, `bg-cta` 18, `text-ink-3` 15, `bg-action` 1; no class-string use found for `bg-well`, `bg-surface-warm`, `text-error`, `text-success`, `text-action`.

### 3.4 Shadows

| Token | Tailwind | Light | Dark |
| --- | --- | --- | --- |
| `--elev-card` | `shadow-card` (14 uses) | `0 1px 2px rgba(11,13,23,.04), 0 16px 40px -16px rgba(11,13,23,.12)` | `none` |
| `--elev-pop` | `shadow-pop` (2 + hover lift) | `0 24px 60px -24px rgba(11,13,23,.28)` | `0 24px 60px -24px rgba(0,0,0,.6)` |
| `--elev-logo` | `shadow-logo` (3) | `0 14px 30px -12px rgba(11,13,23,.35)` | inherits light |
| `--elev-avatar` | `shadow-[var(--elev-avatar)]` | `0 8px 24px -8px rgba(11,13,23,.35)` | inherits light |
| `--sheen` | hover sheen on cards | `rgba(255,255,255,.5)` | `rgba(255,255,255,.08)` |

### 3.5 Radii (`globals.css:64-73`)

| Token | Value | Use (count of `rounded-*` in `.tsx`) |
| --- | --- | --- |
| `--radius-bento` | 28px | cards, photo panel (10) |
| `--radius-sheet` | 24px | share panel, menu (1, via `PANEL`) |
| `--radius-well` | 20px | inner wells, tiles (25) |
| `--radius-row` | 14px | menu/share rows (3) |
| `--radius-tile` | 12px | header K tile, logo tiles (7) |
| `--radius-chip` | 8px | 2 |
| `--radius-input` 12px, `--radius-card` 24px, `--radius-panel` 32px | | unused (0) |
| `rounded-full` | 999px | pills, buttons, chips (66) |
| arbitrary | `rounded-[18px]` (8), `rounded-[22px]` (3), `rounded-[26px]`, `rounded-[0.3em]` | |

### 3.6 Type

- Families: `--font-sans` = Geist, Noto Sans Thai, system; `--font-display` = the same stack; `--font-mono` = Geist Mono. Weights used: 400, 500 (`font-medium` 107), 600 (`font-semibold` 61), 700 (`font-bold` 2). `font-mono` appears 105 times (labels, numbers, the "For agents" row).
- Type tokens (`globals.css:76-115`):

| Token | Size | Line height | Tracking | Weight | Used in `.tsx` |
| --- | --- | --- | --- | --- | --- |
| `text-display` (Home h1) | `clamp(2.25rem, 5.6vw, 4rem)` | 1.14 | -0.04em | 600 | 2 |
| `text-title` (inner-page h1) | `clamp(2.25rem, 5vw, 3.5rem)` | 1.12 | -0.04em | 600 | 8 |
| `text-h1` | `clamp(2.75rem, 2.1rem + 2.6vw, 4rem)` | 1.02 | -0.04em | 700 | 0 |
| `text-h2` | `clamp(2rem, 1.6rem + 1.6vw, 2.75rem)` | 1.08 | -0.03em | 600 | 0 |
| `text-h3` | `clamp(1.375rem, 1.2rem + 0.7vw, 1.75rem)` | 1.2 | -0.02em | 600 | 0 |
| `text-lead` | `clamp(1.125rem, 1.08rem + 0.2vw, 1.25rem)` | 1.5 | -0.01em | | 0 |
| `text-body` | `clamp(1rem, 0.98rem + 0.1vw, 1.0625rem)` | 1.6 | | | 0 |
| `text-small` | 0.875rem | 1.5 | | | 0 |
| `text-card` | 0.9375rem (15px) | 1.5 | | | 73 |
| `text-meta` | 0.8125rem (13px) | 1.45 | | | 60 |
| `text-label` | 0.75rem (12px) | 1.4 | 0.06em | | 8 (+ `MONO_LABEL`) |
| `text-stat` | `clamp(2.75rem, 2.1rem + 2.6vw, 4rem)` | 1 | -0.04em | 600 | 0 |

- Much of the text bypasses the tokens: Tailwind defaults `text-xs` 61, `text-sm` 64, `text-base` 21, `text-lg` 11, `text-xl` 6, `text-2xl` 6; arbitrary `text-[17px]` 11, `text-[22px]` 9, `text-[40px]` 8, `text-[28px]` 5, `text-[64px]`, `text-[21px]`, `text-[19px]`; card titles in `Bento.tsx:159-163` (22/28/40 px).
- Hard floor: nothing below 12 px (`lib/design/typeFloor.test.ts`).
- The current spec with all canvas sizes: `process/features/tanstack-migration/references/phase-7_design-spec_09-11-26.md` section 1.5.

### 3.7 Spacing and layout

- No custom spacing tokens: Tailwind's default 0.25rem scale plus arbitrary pixels (`px-[18px]` 11, `gap-[18px]` 10, `py-[7px]` 7, `pt-[18px]` 6...).
- Page column: max 1000 px, 24 px gutters (16 px at <= 380 px) for the header and footer (`components/landing/LandingLayout.tsx:6`, header block `pt-10`, footer block `pb-24`) and for `PageMain` (`Bento.tsx:24-29`: `gap-14 pt-14 pb-14`, 44 px gap at <= 380 px).
- Bento grid (`Bento.tsx:62-80`): 1 column to 640 px, 2 from 641 px, 3 from 1024 px, gap 20 px; `BentoPair` (2 columns from 641), `BentoRow` (flex-wrap row of cards), spans via `bentoSpan()`.
- Card: `CARD_SURFACE` = 28 px radius, hairline border, surface fill, `px-5 pt-[18px] pb-5`, `shadow-card` (`components/bento/classes.ts:11-12`); default min height 290 px (`Bento.tsx:225`).
- Touch targets: interactive elements `min-h-11` (44 px), CTAs 56 px (`h-14`), icon buttons 48 px (44 px at <= 380 px).

### 3.8 Breakpoints

- Tailwind defaults (no `--breakpoint-*` overrides): `sm` 640, `md` 768, `lg` 1024, `xl` 1280.
- Arbitrary: `min-[641px]:` (21 uses), `max-[381px]:` (3), `max-[561px]:` (header email), `max-[640px]:` (1); `max-sm:` (5), `lg:` (17), `md:` (9), `sm:` (8), `xl:` (1).
- Container query: the Bangkok card stacks below 560 px of card width (`globals.css:645-699`).
- Behaviour points: header email hidden <= 560 px; header text links >= 1024 px; share pill is a 56 px round icon < 640 px (`components/bento/SharePill.tsx:29`).
- Owner targets: mobile 375, tablet 768, desktop 1440; "treat mobile as a miniature desktop layout" (AGENTS.md:719). Playwright projects use 375, 768 and 1440 widths (section 8.3).

### 3.9 Motion tokens

- Easing tokens: `--ease-smooth` `cubic-bezier(0.22, 1, 0.36, 1)` (intro), `--ease-soft` = `--ease`, `--ease-spring` = `--spring` (`globals.css:117-121`).
- Durations: links/buttons 0.3-0.35 s; menu rows 0.25-0.4 s; header drop 0.8 s; h1 lines slide 1 s (0.1 s stagger, transform only); cards rise 0.9 s (0.16 to 0.64 s stagger); panel pop 0.42 s; menu rows in 0.5 s; live pulse 2.4 s; Bangkok loops 3.4 to 70 s; card hover lift 0.55 s and sheen 1.1 s (hover-capable pointers only); press feedback `scale(0.97)`; page view transition 0.28 s; theme reveal 0.8 s; intro word 300 ms.
- Everything that animates sits inside `@media (prefers-reduced-motion: no-preference)` (`:384-429, 701-857, 861-912`), enforced by a test (section 8.2).

### 3.10 Focus, selection, print

- One focus ring: `2px solid var(--focus)`, offset 2 px (3 px inside `.kj`) (`:305-319, 596-599`); `::selection` Signal on Paper (`:321-324`).
- Print palette for `pnpm pdf` (`:507-561`): white page, ink text, darker hairlines; hides `[data-site-chrome]` and `[data-print-hide]`; no animation or shadow.

### 3.11 Dark mode and the theme toggle

- `next-themes` `ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange` (`src/routes/__root.tsx:96-103`); storage key `theme` in `localStorage` (the tests set it); `.dark` on `<html>`; `color-scheme` follows (`globals.css:283-292`).
- Toggle: `components/ThemeToggle.tsx:39-92`. 48 px icon button in the header; sun/moon chosen by CSS (`dark:hidden`) so it is right before hydration; with View Transitions and motion allowed it reveals the new theme in a circle from the click point (type `theme`, class `html.kj-vt`); otherwise it switches at once. Labels "Switch to night mode" / "Switch to day mode".
- Guards: `lib/design/globals.test.ts:109-119` requires `defaultTheme="light"`, no `forcedTheme`, and the two theme-color hex values in `lib/seo/rootMetadata.ts`.

### 3.12 How components are expected to use tokens, and what enforces it

| Rule | Enforced by |
| --- | --- |
| No raw 6-digit hex in `components/landing`, `components/bento`, `src/routes` (max 0; OG/icon/layout allowlisted) | `lib/design/rawHex.test.ts:13-37` |
| `components/ui/PixelGrid.tsx` and `Button.tsx` use tokens only | `rawHex.test.ts:39-45` |
| No text size under 12 px in `components/` and `src/` (max 0) | `lib/design/typeFloor.test.ts` |
| The card surface string, `MONO_LABEL` and the standard hero h1/lead exist only in `components/bento/classes.ts` and `PageHero.tsx` | `lib/design/sharedPrimitives.test.ts:19-41` (matches exact class strings) |
| Owner palette hex values, role mapping, no legacy aliases (`--color-primary`, `--color-accent`, `--bg:` ...), fonts, light default, skip link and `landing-root` in `LandingLayout`, no SiteShell/Header/Footer in the root, no Lenis, print and reduced-motion blocks, `--cta/--oncta/--accent/--muted` in both themes, `kj-line` transform-only, every animation behind `no-preference`, view-transition rules, no `smooth-cursor`, `.keyword`, `RouteFade` | `lib/design/globals.test.ts` |
| WCAG contrast of 26 text pairs (4.5:1), 2 display pairs (3:1) and non-text pairs (3:1) in both themes, plus Bangkok scene text | `lib/design/contrast.test.ts` (parses top-level `:root {` and `.dark {` blocks with a regex) |
| Lint | ESLint has no style or color rules (React, hooks, a jsx-a11y subset as warnings, TS); `--max-warnings=0` turns warnings into failures; Prettier default config; no stylelint |

### 3.13 Design-system review page and design history

- `/design` (`components/system/DesignSystemPage.tsx`, 353 lines): colour, type, radii, buttons, chips, filters, card anatomy, pixel art, motion cards; unlinked, noindex, has visual baselines in both themes.
- Current design spec (the "bento canvas", approved 09-11-26): `process/features/tanstack-migration/references/phase-7_design-spec_09-11-26.md` (753 lines: tokens, verbatim motion CSS, shared components, all 20 pages with route mapping, responsive rules, gaps). Plan and owner decisions: `process/features/tanstack-migration/completed/phase-7_bento-redesign_PLAN_09-11-26.md`.
- Older: `process/features/visual-redesign/completed/` (palette, role tokens, ratchets, baselines). `docs/redesign/01-05` and `docs/redesign/screens/matveyan-*.jpeg` are a **June 2026** teardown of matveyan.com for the pre-migration Next.js site; they describe code that no longer exists (Syne, `app/globals.css`, brutalist utilities) and should be treated as history.

---

## 4. Site chrome

### 4.1 Shell (`components/landing/LandingLayout.tsx`)

`ChromeProvider` > `div.landing-root` (min-height 100svh, `bg-page`, `font-sans`, `text-ink`) > skip link "Skip to content" to `#main` (`:21-26`) > header block (`data-site-chrome`, 1000 px column, `pt-10`) > page > footer block (`data-site-chrome`, `pb-24`). The 404 page brings the same layout itself.

### 4.2 Header (`components/bento/SiteHeader.tsx`)

- `<header lang="en" data-site-chrome class="kj kj-header relative z-20 flex items-center justify-between">` (`:52-60`). **In normal flow at the top of the column: not fixed, not sticky, no change on scroll.** It drops in once on load (`kj-drop`, 0.8 s).
- Left: K mark (44 px ink tile with an accent square, `aria-label="Kunanon Jarat, home"`, `:62-74`) and the email `fronk.kunanon@gmail.com` as a `mailto:` link (hidden at <= 560 px, `:75-80`).
- Right: `<nav aria-label="Primary">` (hidden below `lg` 1024 px, `:85-113`) with `headerLinks` from `lib/content/landing.ts:92-104`: **Work** (`/portfolio`, also current on `/portfolio/*`), **Résumé** (`/resume`), **AI engineering** (`/topics/forward-deployed-ai-engineering`); the current link gets `aria-current="page"`, a Glaze fill and a 5 px accent square (`.bg-mark`). Then the Share icon button ("Share this page"), `ThemeToggle`, and the menu button ("Open menu" / "Close menu", `aria-controls="site-menu"`).
- Panels (`components/bento/ChromeContext.tsx`): one panel at a time (share or menu); Escape closes and returns focus; a pointer-down outside closes; navigation closes. Panels are absolute under the header (`PANEL`: `top-[60px] right-0`, 24 px radius, `shadow-pop`).

### 4.3 Menu (`components/bento/SiteMenu.tsx`)

- `<nav id="site-menu" aria-label="Site" hidden={!open}>`, 360 px wide, always server-rendered (`:60-127`). Focus moves to the first link on open; rows animate in.
- Rows (`lib/content/landing.ts:115-144`): Home, About, Ventures (`/#ventures`), Portfolio, Résumé, Agent skills (`/skills`), AI engineering; a "LIBRARY" mono label; a 2-column group Learn, Examples, Stack, Proof, Build; then the ink "Contact me" button (`/contact`). A Blog row appears only when `BLOG_PUBLIC`; Press is never linked.
- Current-row logic `isCurrentRow()` (`:14-29`): exact page wins, then prefixes; Thai hubs count as their English twin.

### 4.4 Share

- Header share panel (`components/bento/SharePanel.tsx`): mounted only while open; reads `document.title` and the canonical URL; rows from `components/bento/ShareRows.tsx`: Copy link (shows the URL, "Link copied"), Post on X, Share on LinkedIn, Email the link, and "More options" (native share sheet) where `navigator.share` exists.
- Hero `SharePill` (`components/bento/SharePill.tsx`) sits in 7 heroes (`PortfolioProjectPage`, `VentureHubPage`, `TopicHubPage`, `SkillsIndexPage`, `SkillDetailPage`, `ResumePage`, `BlogPostPage`) and opens the same panel; 56 px round icon below 640 px (owner, 12-11-26, #119), labelled pill from 640 px.
- Résumé also has a Share card (`components/resume/ResumeCards.tsx`).

### 4.5 Footer (`components/bento/SiteFooter.tsx`)

Top hairline; "© {year} Kunanon Jarat · Bangkok"; socials X, LinkedIn, GitHub (new tab; `lib/content/landing.ts:205-209`, Telegram deliberately omitted); a mono "FOR AGENTS" row (`<nav aria-label="For agents">`) linking `agents.md`, `llms.txt`, `sitemap.md`, `skills.md` (owner decision 09-11-26, `lib/content/landing.ts:216-224`). Links widened to >= 24 x 44 px with negative-margin padding (`:4-9`).

### 4.6 Intro / greeting (`components/landing/IntroLoader.tsx`, `IntroBurst.tsx`, `lib/content/introGreetings.ts`)

- Home only (rendered inside the Home route), once per session (`sessionStorage["fronk-intro-seen"]`), never under reduced motion.
- Five greetings: "Hello", "สวัสดี", "Bonjour", "こんにちは", "Welcome to KunanonJ" (`introGreetings.ts:8-14`).
- Timing (`:21-46`): each of the first four words 720 ms, the last held 1,620 ms, exit fade 700 ms: exit starts at 4,500 ms, **total 5,200 ms**; hard cap `INTRO_MAX_MS` 5,500 ms (checked by a unit test). The arrival burst (champagne pop ring, flash, confetti, sparkles; CSS only; 740 ms) plays with the last word.
- Full-screen `bg-page` overlay at `z-[100]`; any key, pointer-down, wheel or touch, or the "Skip intro" button, ends it at once. Owner chose this length on 12-11-26 (#118). README still says it is capped at 1.5 s (stale).

### 4.7 Route transitions and entrance motion

- Path changes run as View Transitions of type `page` (0.28 s cross-fade); hash-only changes and filter changes (`FILTER_NAVIGATION`, `src/lib/filterParam.ts:7-11`) skip it; reduced motion turns it off.
- Each page: the h1 lines slide up (transform only, the h1 is the LCP element and is never hidden or blurred), bento cards rise in a stagger, cards lift with a sheen on hover (pointer devices).

### 4.8 Contact entry points

Header email (`mailto:`, >= 561 px); menu "Contact me"; Home hero "Contact me" (`/contact`) and "Résumé"; About hero "Contact me" and "See my work"; About "Next" card (Contact, Contact about a role, Portfolio, Agent skills, AI engineering, Resume); Bangkok card "Say hello" on Home (`/contact`) and Contact (jumps to the form); every project page's "Hiring" card (`/resume`, `/contact?topic=hiring`); each venture hero's "Contact" button (`/contact`); FDE hubs' hero buttons (`/resume`, `/contact?topic=hiring`, Thai labels on the Thai hub); résumé hero "Contact" (`/contact?topic=hiring`); Contact page Email card, Elsewhere card (X, LinkedIn, GitHub, Telegram, Farcaster, `lib/content/contact.ts:131-135`) and For recruiters card; 404 recovery links and "Broken link?" email card; footer socials.

### 4.9 CV / résumé download

- File: `public/resume.pdf` (103.7 KB, 2 pages), served with `X-Robots-Tag: noindex` (`public/_headers`), downloaded as `Kunanon-Jarat-Resume.pdf` (`lib/content/availability.ts:39-42`).
- Links: résumé hero "Download PDF" (`components/resume/ResumePage.tsx:96-104`), résumé Share card (`components/resume/ResumeCards.tsx:459-460`), and the recruiter links on Contact and About (`components/landing/RecruiterFacts.tsx:50`, data `lib/content/contact.ts:101-102`).
- Generated by `pnpm pdf` (`scripts/generate-resume-pdf.mjs`) from `/resume` printed through the print stylesheet and `components/resume/ResumePrint.tsx`; refuses more than 2 pages, placeholder hosts, or the degraded stand-in. The printed résumé must stay plain (no opacity, no letter-spacing, system font, AGENTS.md:738).

### 4.10 Analytics

`components/CloudflareAnalytics.tsx`: Cloudflare Web Analytics only, cookieless, off unless `NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN` is set. No GA, GTM or Umami (removed 10-11-26).

---

## 5. Home page composition today (`src/routes/_landing/index.tsx:32-46`)

Visual reference: `tests/e2e/visual.spec.ts-snapshots/home-{light,dark}-{desktop,mobile}-linux.png`.

| # | Section | Component | Content and data |
| --- | --- | --- | --- |
| 0 | First-visit intro overlay | `components/landing/IntroLoader.tsx` | `lib/content/introGreetings.ts` (section 4.6) |
| 1 | Hero `section[aria-labelledby="hero-title"]` | `components/landing/home/HomeHero.tsx` | h1 in 4 block lines: "Hi, I'm [74 px inline portrait] Kunanon Jarat." / "Forward deployed" / "AI engineering" / "from Bangkok." (accent colour), `text-display`; availability pill "Open to roles · Forward Deployed Engineer and AI engineering · Bangkok or remote"; ink "Contact me" (`/contact`) and outlined "Résumé" (`/resume`) 56 px buttons; lead "IT Manager & AI Engineering Lead at The Binary Holdings. Also building GoGoCash and Manut AI." Data: `lib/content/landing.ts:153-163`, `lib/content/availability.ts:10-30`, `lib/content/currentRole.ts`, portrait `/profile-portrait.webp` |
| 2 | Selected work (span 2) | `SelectedWorkCard` (`HomeCards.tsx:123-164`) | 3 featured projects in order TBH Intranet, AI Automation, Node Validator Automation (`FEATURED_PORTFOLIO_SLUGS`, `lib/content/portfolio.ts:906`): number, name link, tagline, first outcome line, category tag; "All work ->" |
| 3 | Experience | `ExperienceCard` (`:27-54`) | first 4 résumé entries via `homeExperience()` (`lib/landing/experience.ts`) on a dotted timeline, current role's dot in accent, fade mask; "Résumé ->" |
| 4 | Ventures (`id="ventures"`) | `VenturesCard` (`:65-116`) | two tilted logos (`/brand/gogocash.svg`, `/brand/manut-144.webp`), name links to `/ventures/gogocash` and `/ventures/manut`, "1,000 registered users · 220+ merchants on GoGoCash", "See both ventures ->" (`/proof`). Data `lib/content/landing.ts:179-203` |
| 5 | How I work (span 2) | `HowIWorkCard` (`:167-203`) | 4 operating principles stepper (`Segmented` 01-04, local state) from `aboutPage.principles` |
| 6 | Based in Bangkok (span 3) | `components/bento/PlaceCard.tsx` + `BangkokScene.tsx` (266 lines, animated SVG temple, boat, clouds, stars) + `BangkokClock.tsx` (client GMT+7 clock) | `lib/content/landing.ts:166-173`; glass "Say hello" button |

Layout: `Bento dense` 3 columns at >= 1024 px (rows: Selected work 2 + Experience 1; Ventures 1 + How I work 2; Bangkok 3), 2 columns at 641 to 1023 px, 1 column below.

---

## 6. Case-study, About, Contact and related pages

### 6.1 Portfolio index (`/portfolio`, `components/landing/portfolio/PortfolioIndexPage.tsx`, 243 lines)

Hero: eyebrow chip "Portfolio", 3-line h1 from `portfolioPage.headline` (muted connector words, accent last line; `lib/content/portfolio.ts:158-176`), lead. Category filter (`?category=`, values from the project categories). Project cards in a bento laid out by `portfolioGrid()` (`portfolioLayout.ts`): visual (cover image if registered, else `PortfolioMockup`), name, tagline, first outcome line, up to 4 tech chips then "+N more", access tag. JSON-LD CollectionPage/ItemList.

### 6.2 Project detail (`/portfolio/[slug]`, `components/landing/portfolio/PortfolioProjectPage.tsx`, 196 lines)

1. `ProjectHero` (`:45-96`): eyebrow "Portfolio · {category}", "All projects" back link, h1 = "{name}." + tagline split into lines (`HeroTitle`, `taglineLines()`), lead = summary, byline "By Kunanon Jarat · {role}" (`rel="author"`), public link button when `access === "public"`, `SharePill`.
2. `MetaStrip` (`:99-132`): Role, Organisation, Period, Access tiles (`dl`).
3. `Bento dense` (`:174-190`): `OutcomeCard` "Outcome" (only with cleared outcomes), `MyPartCard` "My part", `InterfaceCard` "Interface" (cover screenshot or code-drawn mockup, captioned illustrative), `ProblemCard` (first section, optional before/after), `HighlightsCard` "What it does", `FlowCard` (workflow steps), `ArchitectureCard` (layers), `BuiltColumn` (remaining sections + "Tech stack").
4. `HireCard` "Hiring" (`:138-160`): "Want work like this on your team?", availability sentence, Résumé and Contact (hiring) buttons.
5. `ProjectPager` (prev/next in list order, wrapping).

Data model `PortfolioProject` (`lib/content/portfolio.ts:109-156`): `slug`, `name`, `tagline`, `summary`, `category`, `role`, `organization`, `period`, `year`, `access` (internal/public), `url?`, `urlLabel?`, `stack[]`, `highlights[]`, `sections[] {heading, body}`, `beforeAfter?`, `outcomes? {label, value, source}`, `myPart?`, `cover?`/`gallery?` (`PortfolioImage {src, alt, width, height}` under `public/portfolio/<slug>/`, existence tested), `mockup?` (`app-shell`, `email-report`, `form-preview`, `review-queue`; drawn by `PortfolioMockup.tsx`, 590 lines), `workflow?`, `architecture?`. Supporting parts: `ProjectCards.tsx` (519 lines), `PortfolioParts.tsx`, `VisualIcon.tsx`, `portfolioLayout.ts`.

### 6.3 Venture case hubs (`/ventures/[slug]`, `components/landing/discovery/VentureHubPage.tsx` 157 lines + `VentureCards.tsx` 443 lines)

Hero: eyebrow, h1 with the logo and name then the tagline lines (muted then accent), a Live pill with the timeline ("2023 to present" style), the intro as lead, then "Visit {gogocash.co | manut.xyz}" (new tab), "Contact" (`/contact`), `SharePill` and the "Free to start" offer label (`VentureHubPage.tsx:38-95`); metric tiles (`dl > div`, dated "As of October 2026" where set); GoGoCash's 4-stage loop stepper; section cards ("What it is", "Where it stands" / "Why it matters in Thailand & SEA", "My role"); "Related topics" card with map art; "Also building" card. Layout rules for variants in `components/landing/discovery/hubLayout.ts`.

### 6.4 About (`/about`)

- `components/landing/about/AboutHero.tsx`: eyebrow "Fronk · Bangkok, Thailand"; h1 "About Kunanon Jarat: / AI, ERP/CRM and / startups in Bangkok." (muted, accent; restates the page title); role lead; availability pill; "Contact me", "See my work", "Read my story" (`#story`); 480 px portrait panel (`/profile-portrait.webp`, `fetchPriority="high"`) with floating X / LinkedIn / GitHub buttons (`rel="me"`).
- `components/landing/AboutPageContent.tsx` -> `components/landing/about/AboutCards.tsx` (418 lines), dense bento: Story (span 2, 3 paragraphs with links), Selected path (7 chips, "A short arc"), How I work (4 principles), Now, Activity (`ContributionActivity.tsx`, GitHub heatmap from `/api/github/contributions`), Tech stack, Operating model, then a row of FAQ + Next ("Let's talk", "For recruiters" block, buttons).
- Data: `lib/content/aboutPage.ts` (438 lines), `lib/content/faq.ts` (`FAQ_ITEMS`, `:16`), `lib/content/operatingModel.ts`.

### 6.5 Contact (`/contact`) and delivery backend

- Page `components/landing/ContactPage.tsx`: hero (eyebrow, 2-line h1, lead), dense bento: Email card, `ContactForm` (469 lines, form id used by the Bangkok card's CTA), Elsewhere, Who should write (span 2), For recruiters, Bangkok card (span 3).
- Form (`@tanstack/react-form`): name (<= 100), email (<= 254), message (10 to 5,000), topic chips `Hiring`, `GoGoCash`, `Manut AI`, `Partnership`, `Investment`, `AI / ERP advice`, `Speaking or press`, `Something else` (`lib/content/contact.ts:16-25`; `?topic=hiring` preselects Hiring), honeypot `company`, client fill-time `elapsedMs` (bots under 3 s are silently accepted and dropped), optional Turnstile widget (`lib/turnstile/client.ts`).
- Path: `POST /api/contact` (JSON, same-site, <= 20 KB) -> `guardForm` (rate limit 5/min/IP via `FORM_RATE_LIMIT`, Turnstile siteverify when keys are set; `src/server/formGuard.ts`) -> `src/server/api/contact.ts` -> `lib/contact/sendContactMessage.ts`: validates, builds a plain-text email with subject "[kunanonj.com] {topics} from {name}" and `reply_to` = visitor, sends with the **Resend REST API** (`https://api.resend.com/emails`; `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`). 503 when unconfigured (the form then offers a mailto fallback), 502 on delivery failure.

### 6.6 Testimonials

**None exist** in code, content or Sanity (search for testimonial/endorsement/recommendation found nothing; the only `blockquote`s are Portable Text and the Proof page quoting a venture's own description). `lib/content/skills.ts:14` states "no invented install counts, ratings or testimonials", and the portfolio and venture honesty rules forbid invented clients and outcomes. Any testimonial needs real, owner-supplied and owner-cleared text.

### 6.7 Client / company logos

- Self-hosted set `lib/content/companyLogos.ts:12-21` (keyed by résumé `logoDomain`; unknown domains render an initials tile in `components/CompanyLogo.tsx`; no request ever leaves the site, tested in smoke):

| Domain | File | Pixels |
| --- | --- | --- |
| 3bb.co.th | `public/brand/companies/3bb.webp` | 50 x 50 |
| bitkub.com | `public/brand/companies/bitkub.webp` | 128 x 128 |
| coins.co.th | `public/brand/companies/coins.webp` | 32 x 32 |
| ku.ac.th | `public/brand/companies/kasetsart.webp` | 128 x 128 |
| playbux.co | `public/brand/companies/playbux.webp` | 32 x 32 |
| ted.com | `public/brand/companies/ted.webp` | 128 x 128 |
| gogocash.co | `public/brand/gogocash.svg` | 1080 x 1080 vector |
| manut.xyz | `public/brand/manut-144.webp` | 144 x 144 |

- These are **employers, a university and the owner's own ventures, not clients**. No logo file exists for The Binary Holdings, Aiden Labs, KK Venture Global, The Monk Games, CAT Telecom, NECTEC, Protocol Camp, Bangkok Startup Association, Anthropic Academy or Buffalo/Moralis (initials tiles). Logos are favicon-sized and drawn for light backgrounds (tiles stay white in dark mode).
- Also in `public/brand/`: `gogocash.png` (256), `manut.png` (256), `airplusauto.png`/`.svg` (venture dropped by the owner on 09-11-26; unused).

### 6.8 Timeline / journey data

- `lib/content/resumeTimeline.fallback.ts` (372 lines): the résumé as data, what production renders; `RESUME_TIMELINE_FALLBACK` (`:352`) has 7 sections (full list in 7.3) and skill groups (`:304`: AI & Cloud, Transformation & Delivery, Engineering, Tools).
- `lib/landing/experience.ts`: Home's 4-entry compact timeline.
- `lib/content/aboutPage.ts` `path.chips` (7 stops: Kasetsart, Bitkub, KK Venture Global, Coins / Playbux, Aiden Labs, GoGoCash, The Binary Holdings).
- Résumé UI: `components/resume/ResumePage.tsx` (hero with Download PDF, Contact, Share, Detailed/Compact toggle) and `ResumeCards.tsx` (468 lines, one card per section, logos, skills, share).

### 6.9 Tools data

`lib/content/stack.ts` (16 tools in Build / Ship / Operate: TypeScript, Next.js, Expo / React Native, Turborepo, NestJS, MongoDB, Firebase, Google Cloud Run, Cloudflare Workers, Postgres + Prisma, Hono, Solidity, Sanity, Playwright, GitHub, Cursor / Claude Code; evidence links to github.com/KunanonJ and github.com/mygogocash), `lib/content/stackIcons.ts` (22 icon ids), About "Tech stack" card, résumé skill groups, each project's `stack[]`.

### 6.10 Profile photos and other public assets

| File | Size | Used by |
| --- | --- | --- |
| `public/profile.jpg` | 1254 x 1254, 268 KB | Person JSON-LD `image` (`lib/seo/jsonLd.ts:93`) and BlogPosting fallback (`:304`) |
| `public/profile-portrait.webp` | 480 x 480, 12.4 KB | Home hero inline avatar, About portrait panel |
| `public/portfolio/kunanonj-com/cover.webp` | 1440 x 900, 58 KB | the only real project screenshot: **a capture of Home**, alt text describes today's Home (`lib/content/portfolio.ts:780-785`) |
| `public/resume.pdf` | 103.7 KB | CV download |
| `public/skills.md` | 3.7 KB | `/skills.md` agent coding guide |
| `docs/redesign/screens/*.jpeg` | | June 2026 matveyan references (docs only) |

### 6.11 Other page families (for completeness)

- Skills (`components/landing/skills/*`, `SkillsIndexPage` 430 lines, `SkillDetailPage` 542 lines): catalog with pipeline, install tabs, copy buttons, credits.
- Topic hubs (`components/landing/discovery/TopicHubPage.tsx`, 430 lines): hero with language nav, section cards with big numbers, proof card, FAQ, explore links, contact card; FDE hub has the availability pill and hiring buttons.
- Library (`components/landing/library/*`): Learn (450 lines), Examples, Stack, Proof (Delivery outcomes and Venture metrics tiles with quotes), Build (board columns next / in progress / shipped).
- Blog (hidden): `BlogIndexPage` (438), `BlogPostPage` (379), Portable Text renderer `components/PortableText.tsx`.
- Press (hidden): `components/landing/PressPage.tsx`; its 4 items link to the owner's own sites, not real coverage.
- 404/errors: `components/landing/StatusPage.tsx` (pixel-art status card, recovery links, report email).

---

## 7. Content inventory

### 7.1 Portfolio projects (`lib/content/portfolio.ts:179-899`, list order = index and prev/next order)

| Slug | Name | Category | Period | Access | Image | Outcomes (cleared) | My part |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `tbh-intranet` | TBH Intranet | Internal platform | May to Oct 2026 | internal | mockup `app-shell` (no screenshot) | Adoption: 50+ employees; Build cycles: 4 months to 1 week | yes |
| `node-validator-automation` | Node Validator Automation | Ops automation | May to Sep 2026 | internal | mockup `email-report` | none | "Wrote code for it." |
| `email-signature-generator` | Email Signature Generator | Internal tool | Sep 2026 | internal | mockup `form-preview` | none | "Wrote code for it." |
| `ai-automation` | AI Automation | AI agents | Mar to Apr 2026 | internal | mockup `review-queue` | Recurring workflow staffing: 10 people to 1 operator; Turnaround: 30 minutes | yes (team project) |
| `kunanonj-com` | kunanonj.com | Website | 2026 | public (GitHub source link) | **real cover** 1440 x 900 | none by design | none by design |

Each has `workflow` and `architecture` diagrams. Home features `tbh-intranet`, `ai-automation`, `node-validator-automation` (`:906-910`). Organisation: The Binary Holdings for the four internal ones, "Personal project" for kunanonj-com. Backlog: "Portfolio screenshots" owner action (issue #44): only redacted internal screenshots may be added.

### 7.2 Ventures (`lib/content/ventures.ts:91-191`)

| Slug | Name | Tagline | Year | Role | Metrics | Loop | URL | Logo |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `gogocash` | GoGoCash | Shopping-to-earn cashback. | 2023 | Founder | 1,000 registered users; 220+ merchants; 30% max cashback; THB 13 million cumulative GMV (as of October 2026); THB 169,000 cashback paid (as of October 2026) | Browse, Shop, Track cashback, Withdraw | gogocash.co | `/brand/gogocash.svg` |
| `manut` | Manut AI | ERP/CRM workspace with Intelligence AI for automotive SMEs. | 2025 | Founder | none | none | manut.xyz | `/brand/manut-144.webp` |

Both "Free to start" (`offer`), status active, 3 case sections each. The "Founder" role is what recruiter-fit phase 4 plans to change to the CV's "Independent project" framing.

### 7.3 Résumé entries (`lib/content/resumeTimeline.fallback.ts`; period separators are em dashes and tests parse them)

| Section | Entries (title, organisation, period) |
| --- | --- |
| Currently | IT Manager & AI Engineering Lead, The Binary Holdings, Sep 2025 to Present (4 bullets; "Case studies" -> `/portfolio`) |
| Experience | AI Project Manager, Aiden Labs, Jan 2025 to Oct 2025; Advisor, Aiden Labs, Nov 2024 to Dec 2024; Technical Project Manager, The Binary Holdings, Sep 2024 to Dec 2024; Project Manager, Playbux, Nov 2023 to Sep 2024; IT Project Manager, Coins.co.th, Apr 2023 to Oct 2023; Business Development Executive, The Monk Games - Bitkub Metaverse, Feb 2023 to Apr 2023; Business System Analyst, KK Venture Global, Mar 2022 to Feb 2023; Blockchain Developer, KK Venture Global, Feb 2022 to Apr 2022; Smart Contract Intern, Bitkub, Nov 2021 to Jan 2022 |
| Independent projects | GoGoCash, May 2023 to Present ("Case study" -> `/ventures/gogocash`); Manut AI, 2025 to Present (-> `/ventures/manut`); GoSpark, In development |
| University-era | Event Manager, KU Startup, Jul 2020 to Jan 2021; President & Co-Producer, TEDxKasetsartU, Jan 2020 to Dec 2020; Event Manager, TEDxKasetsartU, Mar 2019 to Dec 2019; Telecommunications Engineer (Intern), CAT Telecom, Aug 2020 to Nov 2020; Research Assistant (Contract), NECTEC, Jul 2020 to Oct 2020; Application Developer (Intern), Triple T Broadband, Jun 2020 to Jul 2020 |
| Education | B.Eng. Electrical Engineering, Kasetsart University, Aug 2017 to Apr 2021 |
| Affiliations | Cohort 2025, Protocol Camp, Sep 2025 to Jan 2026; Member, Bangkok Startup Association, Feb 2025 to Present |
| Training | Claude 101; Building with the Claude API; Claude with Google Cloud's Vertex AI; AI Fluency for Small Businesses, Anthropic Academy, May 2026; Smart Contract Development & Security (4-course program), University at Buffalo & Moralis Blockchain Academy, 2021 |

The current role comes from one constant, `lib/content/currentRole.ts` (start "September 2025", short "Sep 2025", Thai "กันยายน 2025"). The owner cleared every figure and partner name in the CV for the site on 10-11-26.

### 7.4 Companies and organisations named on the site

The Binary Holdings, Aiden Labs, Playbux, Coins.co.th, The Monk Games / Bitkub Metaverse, KK Venture Global, Bitkub, KU Startup, TEDxKasetsartU, CAT Telecom, NECTEC, Triple T Broadband (3BB), Kasetsart University, Protocol Camp, Bangkok Startup Association, Anthropic Academy, University at Buffalo & Moralis Blockchain Academy; ventures GoGoCash, Manut AI, GoSpark; GoGoCash merchant names in venture copy (Apple, Samsung, Lazada, Shopee, TikTok Shop, Temu). Customer work is stated only in general terms (FDE positioning decision, 10-11-26).

### 7.5 Topic hubs (`lib/content/topics/pillars.ts`, 534 lines)

`ai-transformation-thailand`, `erp-crm-internal-systems`, `tech-startup-thailand-sea` (published 2026-07-19) and `forward-deployed-ai-engineering` (2026-11-10), each in English and Thai (`TOPIC_SLUGS`, `:488-493`).

### 7.6 Skills (`lib/content/skills.ts` + `skills.generated.json`)

20 MIT-licensed skills from `KunanonJ/superstacks`: code-review, diagnosing-bugs, domain-modeling, gardening, grill-with-docs, grilling, how, intake-triage, interrogate, mistake-to-constraint, pr, sample-review, steer-miner, test-driven-development, ticket-pipeline, verification-before-completion, verify-loop, workflow-profile, writing-for-agents, writing-plans. Refreshed with `pnpm skills:sync`.

### 7.7 Blog (hidden)

Sanity posts (16 slugs in the parity reference, including `hello-world`) plus 15 fallback cards in `lib/content/blog.ts:63-300` (`FALLBACK_BLOG_POSTS`). Hidden since 09-11-26 because the posts are thin (`lib/content/blogVisibility.ts:6-17`).

### 7.8 Press (hidden)

4 items in `lib/content/press.ts`, all linking to the owner's own sites (gogocash.co, manut.xyz, kunanonj.com).

### 7.9 Other content modules

`identity.ts` / `identityMeta.ts` (person summary and meta description), `faq.ts`, `aboutPage.ts`, `operatingModel.ts`, `learn.ts`, `examples.ts`, `proof.ts`, `buildBoard.ts`, `stack.ts`, `contact.ts`, `pageMeta.ts` (titles/descriptions for content pages, kept import-free for the entry-chunk budget), `freshness.ts` (`SITE_UPDATED`), `noteLinks.ts`, `linkify.ts`, `visualIcons.ts`, `writingPage.ts`, `resumeProfile.ts` (Sanity mapping and fallback).

---

## 8. Tests and guardrails

### 8.1 Commands

```bash
pnpm install
pnpm dev                      # http://localhost:3000 (Workers runtime via the Cloudflare plugin)
pnpm typecheck                # tsc from TypeScript 7
pnpm lint                     # eslint --max-warnings=0
pnpm format:check             # prettier --check .
pnpm knip                     # unused files, exports, dependencies
pnpm test                     # vitest run (projects "dom" and "node"); CI sets NEXT_PUBLIC_SANITY_* for it
pnpm build                    # sanity:manifest, vite build (+prerender), sanity:schema:deploy
pnpm perf:budget              # after a build
pnpm start                    # vite preview (workerd) on :3000

# Smoke + axe, as CI runs them
CI=true PLAYWRIGHT_WEB_SERVER="pnpm start" pnpm exec playwright test smoke.spec.ts a11y.spec.ts --project=desktop

# Visual baselines: only inside mcr.microsoft.com/playwright:v1.64.1-noble
pnpm exec playwright test visual.spec.ts --project=mobile --project=desktop
pnpm exec playwright test visual.spec.ts --project=mobile --project=desktop --update-snapshots=all

# Parity, smoke and axe against a fresh build (scripts/start-gates.mjs)
pnpm build && node scripts/start-gates.mjs            # add --parity-only or --visual

# Re-crawl the parity reference after an intended change (README "Parity reference")
pnpm build && pnpm exec vite preview --port 4374 --host 127.0.0.1 &
PARITY_SEEDS=$(node -e "console.log(require('./src/ported-routes.json').filter(r=>r.seed!==false).map(r=>r.path).join(','))") \
  node scripts/parity-crawl.mjs http://127.0.0.1:4374 tests/fixtures/site-parity.json

# Read-only checks of a preview or the live site
PLAYWRIGHT_BASE_URL=<url> pnpm exec playwright test smoke.spec.ts --project=desktop --grep "recruiter path"
BASE=https://kunanonj.com pnpm probe / /about       # LCP, CLS, TBT, sub-12px text, sub-24px targets (scripts/ux-probe.mjs)
pnpm pdf                      # résumé PDF from a running production build
```

### 8.2 Unit and integration tests (Vitest, `vitest.config.mts`)

- 112 test files: 23 `*.test.tsx` and 89 `*.test.ts`. Project `dom` (jsdom, `vitest.setup.ts`: `matchMedia` stub, Testing Library cleanup, `Link` mocked as a plain anchor, `usePathname` mocked) runs `*.test.tsx` plus `lib/hooks/useReducedMotion.test.ts` and `lib/motion/motionRuntime.test.ts` (the listed `lib/hooks/useFinePointer.test.ts` no longer exists). Project `node` runs the rest. Coverage: v8 over `lib/**/*.ts`, `components/**/*.tsx`.
- **Design guards** (`lib/design/`): `globals.test.ts`, `contrast.test.ts`, `rawHex.test.ts`, `typeFloor.test.ts`, `sharedPrimitives.test.ts` (section 3.12).
- **Content-claim audits** (scan every file listed by `tests/siteSources.ts`: `.ts .tsx .json .md .mdx .mjs` under `lib`, `components`, `src`, `public`, `sanity`, minus tests and the skills snapshot):
  - `lib/content/portfolioOutcomes.test.ts`: outcome figures appear only in `portfolio.ts` outcomes, the résumé fallback and the FDE hub lines (`:206-237`); "wrote code" only where the owner said so, "in no other file"; never "solo", "alone", "single-handed"; no figures in `myPart`; no "evals", "guardrails", "observability", "fine-tun" as named practices.
  - `lib/content/ventureCase.test.ts`: the user count is exactly "1,000 registered users" everywhere (no "1,000+", "over 1,000", "thousand users", Thai checked too, `:147-200`); GoGoCash totals always carry "October 2026"; metrics only from published copy.
  - `lib/content/resumeFacts.test.ts`: current role from one constant; CV employers and months; "RAG" only where cleared; three independent projects; About and FAQ chips match employers.
  - `aboutPage.test.ts` (About h1 restates the title), `faq.facts.test.ts`, `pillars.test.ts`, `portfolio.test.ts` (registered images exist), `skills.test.ts`, `introGreetings.test.ts` (intro under the cap), `availability.test.ts`, `blogVisibility.test.ts`, `library.test.ts`, `writingPage.test.ts`.
- **Component tests that assert classes or structure** (count of class/layout assertions): `components/bento/primitives.test.tsx` (29: grid columns 1/2/3, kicker labelling, chips, "primary buttons are ink (--cta), not Signal", segmented `aria-pressed`, footer links), `portfolio.test.tsx` (19), `TopicHubPage.test.tsx` (15), `Button.test.tsx` (10), `SiteHeader.test.tsx` (10: K mark, email, 3 icon buttons, menu focus/Escape/outside click, menu rows with Ventures on `/#ventures` and no blog or press, inline links only at desktop, `lang="en"`, current-section marking), `home.test.tsx` (9: h1 block lines and accent, pill, both buttons, lead order, `#ventures` anchor, featured order, 4 résumé roles, stepper, no hidden blog/press links), `ResumePage.test.tsx` (8), `hubLayout.test.ts` (6), `AboutPageContent.test.tsx` (6), `VentureHubPage.test.tsx`, `blog.test.tsx`, `ContactPage.test.tsx`, `PressPage.test.tsx`, `IntroLoader.test.tsx`, `PlaceCard.test.tsx`, `ThemeToggle.test.tsx`, `StatusPage.test.tsx`, `AboutHero.test.tsx`, `skills.test.tsx`.
- **Platform tests:** `lib/cloudflare/cacheConfig.test.ts` (wrangler configs, `run_worker_first` = portfolio slugs), `src/lib/redirects.test.ts`, `src/server.test.ts`, `src/server/negotiate.test.ts`, `src/server/text/pageMd.test.ts`, `src/server/text/agentDocs.test.ts`, `scripts/prerender-pages.test.ts`, `scripts/sync-skills.test.ts`, `scripts/wrangler-vars.test.ts`, `lib/parity/parity.test.ts`, SEO tests in `lib/seo/*.test.ts`, contact and form-guard tests.

### 8.3 End-to-end suites (`tests/e2e/`, `playwright.config.ts`)

- Projects: `mobile` (Chromium 375 x 812), `tablet` (768 x 1024), `desktop` (1440 x 900), `webkit` and `firefox` (1440 x 900). `toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: "disabled" }` (`:28`). Web server `pnpm dev` locally, `PLAYWRIGHT_WEB_SERVER` in CI.
- `routes.ts`: 26 routes under test (home, about, contact, press, not-found, design, portfolio, portfolio-project `tbh-intranet`, portfolio-diagrams `ai-automation`, portfolio-site `kunanonj-com`, skills, skill-detail `verify-loop`, blog, learn, examples, stack, proof, build, resume, topic-hub, topic-hub-fde, topic-hub-fde-th, topic-hub-th, topic-hub-th-short, venture-hub, venture-hub-manut). `expectsHeadingPattern` is declared but never asserted (backlog).
- `a11y.spec.ts`: axe (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`) on all 26 routes in dark and light, reduced motion forced; serious or critical violations fail.
- `smoke.spec.ts` (1,454 lines). Blocks that pin the current design:
  - every route renders an `h1` without JS errors; reduced-motion home; first Tab focuses the skip link (`href="#main"`).
  - résumé logos self-hosted (`[data-logo="image"] img`); typed filters on résumé, skills, portfolio, stack, build, examples, learn, press, blog.
  - 404: status 404, h1 "Nothing lives here.", `nav "Recovery links"` with 4 links, zero links to `/blog` or `/press`.
  - **recruiter path:** at 1440 x 900 **and** 375 x 812 the hero `section[aria-labelledby="hero-title"]` must show the h1 "Forward deployed AI engineering from Bangkok.", "Open to roles", "Contact me" and "Résumé" fully in the viewport; on every route but `/design`, `nav[aria-label="Primary"]` has a "Résumé" link to `/resume` at 1440 px; on a phone the Primary nav is hidden, "Open menu" opens `nav "Site"` whose "Résumé" row is in view; at 1023 px the Primary nav is hidden and at 1024 px it is visible, on one row (`header[data-site-chrome]` under 60 px tall), placed after the header `mailto:` link and before "Share this page", with no horizontal scroll and `aria-current="page"` "Work" carrying a visible `.bg-mark`; hiring buttons lead to `/contact?topic=hiring` with "Hiring" pressed; About `article "Next"`; Contact `article "Who should write"` and `"For recruiters"` side by side at 1440 and stacked at 800; FDE hub section cards (`article[aria-labelledby^="card-s"]`) with a gap of at most 120 px; Thai hub pill and buttons; project `article "Hiring"`.
  - **case-study evidence:** `article "Outcome"`, `"My part"`, `"Interface"` order and sizes at 1440 (each under 260 px tall, outcomes within 1.5 screens), stacking at 800, 375, 320 without sideways scroll; `article "Selected work"` on Home shows the first outcome; `/proof` `article "Delivery"` before `"Venture metrics"` with 4 tiles; GoGoCash totals dated; long figures fit at 375 and 320.
  - worker cache headers; agent readiness (Markdown negotiation, `Link` headers, robots signals, Agent Skills index).
  - **tap areas** (WCAG 2.2 2.5.8): at 320 and 390 px, on `/`, `/about`, `/skills`, `/portfolio`, `/portfolio/tbh-intranet`, `/contact`, `/resume` and the open `#site-menu`: every target at least 24 px, none overlapping, none covered (each target is scrolled into view with `block: "nearest"` and hit-tested at 5 points).
  - **share pill:** on `/skills` the main "Share" button is exactly 56 x 56 at 390 and 639 px, a wider labelled pill at 640 px.
- `visual.spec.ts`: full-page screenshots of every route except `resume` and `blog` (CMS-driven), both themes, Chromium only; reduced motion, mocked `/api/github/contributions`, clock fixed at 2026-11-09T03:30Z (Bangkok card reads 10:30 AM), `localStorage.theme` set, intro marked as seen, fonts awaited.

### 8.4 Visual regression baselines

- Stored in `tests/e2e/visual.spec.ts-snapshots/` as `{route}-{light|dark}-{mobile|desktop}-linux.png`: **96 files** (24 routes x 2 themes x 2 viewports), 26 MB. Last refreshed in #119 (`563b2a3`), #110, #109.
- Linux-only; rendered in `mcr.microsoft.com/playwright:v1.64.1-noble`. Refresh from a Mac: copy the repo into the container without `node_modules`, `dist`, `.git`; `pnpm install --frozen-lockfile`; `pnpm build`; run with `--update-snapshots=all`; copy back the changed pages; review every image (`visual.spec.ts:4-40`, AGENTS.md:739).
- The 1% tolerance hides drift: 28 of 88 baselines differed from a fresh render on 10-11-26 and still passed; nine mobile baselines are known stale; Press varies between runs (backlog P2 and recruiter-fit P3). `/resume` has no baseline (P2).

### 8.5 Parity gate

- Reference: `tests/fixtures/site-parity.json` (571.8 KB, **137 URLs**). Per URL: `status`, `location`, `contentType`, `robotsHeader`, `csp`, `htmlLang`, `mainLang`, `title`, **`h1`**, `tags` (all normalised `meta`/`link` tags, framework assets dropped), `jsonLd`, and `body` for text endpoints. Comparator `lib/parity/parity.mjs`; crawler `scripts/parity-crawl.mjs`; gate `scripts/start-gates.mjs`.
- Route list: `src/ported-routes.json` (137 entries: `path`, `test` = e2e name, `seed: false` keeps 404/redirect probes out of the crawl seeds, `intended` = fields allowed to differ). Without `PARITY_SEEDS`, eight URLs drop out of a re-crawl and the gate still passes, so count added and removed URLs after every re-crawl (AGENTS.md:743).

### 8.6 First-load JS budgets (`scripts/check-first-load-budget.mjs`, measured from prerendered HTML in `dist/client`)

| Budget | Limit (gzip) | Measured on 10-11-26 | Routes |
| --- | --- | --- | --- |
| Entry chunk | 120 KB (`:40`) | 113.7 KB | every page |
| Default | 165 KB (`:30`) | 155.2 KB (topic hubs) | `/design`, hubs, everything not marketing |
| Marketing | 200 KB (`:35`) | 189.1 KB (skill pages) | `/`, `/about`, `/contact`, `/press`, `/blog`, `/learn`, `/examples`, `/stack`, `/proof`, `/build`, `/portfolio`, `/skills`, `/resume`, and `/blog/*`, `/portfolio/*`, `/skills/*` |

On-request pages (`/resume`, `/learn`, `/blog`) are not measured. A content module imported from a route's `head()` or the root lands in the entry chunk (`lib/content/pageMeta.ts:3-10`).

### 8.7 Other guardrails

- `knip` (`knip.json`: entries `src/routes/**/*.{ts,tsx}!` and `scripts/*.mjs`): replaced components and exports must be deleted or CI fails.
- ESLint `--max-warnings=0` with the jsx-a11y subset (alt text, ARIA props and roles) as warnings, so any a11y lint warning fails.
- `pnpm pdf` refuses a PDF longer than 2 pages; after a print-layout change the PDF text layer must be read back (AGENTS.md:738).

### 8.8 What a full visual redesign will trip

| Guard | Why it fails | Fix path |
| --- | --- | --- |
| 96 visual baselines | every page changes | re-render all in the container, review each image |
| Parity (`parity` job) | any change to an h1, title, meta, canonical, JSON-LD or text endpoint | re-crawl with `PARITY_SEEDS` and review the JSON diff, or mark `intended` |
| Smoke recruiter path and case-study blocks | accessible names (`hero-title`, `Primary`, `Site`, `Open menu`, `#site-menu`, article names), hero above the fold at 375 and 1440, header geometry at 1024, card order and sizes | keep names and geometry, or rewrite those tests with the owner's approval |
| Tap-area test | a fixed or sticky header can cover targets scrolled to the viewport edge; small pills or marquee links under 24 px | scroll-padding, sizes >= 24 px, or test change |
| Share pill test | pill size and label rules | keep or update |
| `sharedPrimitives.test.ts` | exact class strings for card and hero | update with the new primitives |
| `globals.test.ts` | palette hex values, retired-token bans, fonts (Inter banned), Lenis ban, motion contract, `landing-root` + skip link in `LandingLayout`, `defaultTheme="light"` | change deliberately, with the owner's decision recorded |
| `contrast.test.ts` | new token pairs must be added; parser expects `:root {` / `.dark {` blocks | add pairs; keep the block shape or update the parser |
| `rawHex` / `typeFloor` ratchets | raw hex in components or text under 12 px | tokens only, 12 px floor |
| Component unit tests | class and structure assertions in 20+ files | rewrite with each component |
| Content-claim audits | any new figure, user count, "wrote code", or ruled-out practice in new components | reuse the cleared content modules, ask the owner for anything new |
| Perf budgets | a motion or carousel library, or content imported into the entry chunk | CSS-first motion, lazy islands |
| knip | old components left behind | delete them in the same PR |
| `cacheConfig.test.ts` | new Markdown-twin pages not in `run_worker_first` | update both wrangler files |

---

## 9. Constraints and open work

### 9.1 Active plans

| Plan | Status | Overlap with a redesign |
| --- | --- | --- |
| `process/features/recruiter-fit/active/recruiter-fit_UMBRELLA_PLAN_10-11-26.md` and `phase-4_cv-framing_PLAN_11-11-26.md` | Phase 4 **PLANNED**, needs its own "ENTER EXECUTE MODE"; wording to be approved line by line | Replaces "Founder" framing on About hero and story heading, About path chip, venture pages ("My role"), FAQ, Person/Organization JSON-LD, page meta, the About share image, `llms*.txt`, `about.md`; ARIA stack sentence (step 4e); re-crawl parity; baselines for About, ventures, Home |
| `process/features/ux-experience/active/mobile-tap-targets_PLAN_12-11-26.md` | Steps 1 to 5 merged (#117, #119); nothing waiting on the owner; not yet archived | Its tap-area tests and the 56 px share icon are now guards |
| `process/general-plans/active/worker-cache-followup_PLAN_11-11-26.md` | Merged (#112), owner checks open | none for design |

### 9.2 Backlog items that touch design

- `process/general-plans/backlog/backlog.md`: P2 visual baselines go stale under the 1% tolerance (`:85`); P3 portfolio screenshots (owner to supply, `:78`); P3 `components/ui/Button.tsx` used only by tests (`:96`); P3 harness missing (`:70`).
- `process/features/recruiter-fit/backlog/open-items_11-11-26.md`: P2 the résumé has no visual baseline; P3 PDF has no tags/language; P3 structured data (Person JSON-LD types job titles by hand; Thai FDE hub share image is the site card; `/design` canonical is the homepage; share image type missing); P3 accessibility leftovers (footer labels lack `lang` on Thai pages; "→" arrows read in link names; new-tab links unannounced; availability pill middle dots read aloud; contact label shifts after hydration; Contact tab order at 641 to 1023 px); P3 layout and hygiene ("AI engineering" wraps in About's button grid; about 110 px empty above Home "How I work" text at desktop and 170 px on the Thai FDE hub's first card; "Resume" unaccented in the page title, two About labels and the text endpoints); P3 nine mobile baselines stale; P3 `/blog` answers 500 when Sanity is down.
- `process/features/visual-redesign/backlog/open-items_09-11-26.md`: real portfolio screenshots (issue #44); Workers Builds preview checks can sit queued.
- `process/features/ux-experience/backlog/open-items_09-11-26.md`: production email test for contact delivery (owner); blog-dependent items deferred while the blog is hidden.

### 9.3 Owner rules found in AGENTS.md, README and process docs

**Writing and claims**
- Plain, factual copy. The visual-redesign Home copy was written without em-dashes (`process/features/visual-redesign/reports/phase-2_home_REPORT_09-11-26.md:27`), but older copy still has them: `lib/content/topics/pillars.ts` 28, `resumeTimeline.fallback.ts` 23 (period separators, parsed by tests), `blog.ts` 23, `ventures.ts` 16, `aboutPage.ts` 15, `press.ts`, `pageMeta.ts`, `examples.ts` 5 each, `faq.ts` 4.
- Career facts follow the owner's CV; check Thai strings as well as English (AGENTS.md:737). Availability wording is fixed: open to Forward Deployed Engineer and AI engineering roles, Bangkok or remote; relocation and travel are not offered; notice period and work authorisation are not on the site (`lib/content/availability.ts:1-14`, `components/landing/RecruiterFacts.tsx:6-12`).
- Never invent content, numbers, clients, outcomes, install counts, ratings or testimonials (`lib/content/portfolio.ts:6-8`, `ventures.ts:18-22, 31-34`, `skills.ts:14`); a new figure or "wrote code" claim needs the owner's answer first and an entry in the audit lists (AGENTS.md:747). Customer work is stated in general terms.
- Wording rule: no "RAG" (except the knowledge platform as the CV says), "evals", "guardrails", "observability", "fine-tuning" as named practices; never "solo-built" or "alone"; user count exactly "1,000 registered users"; GoGoCash totals with "As of October 2026".
- "Résumé" with accents in visible UI (backlog notes the unaccented leftovers).
- Two ventures only (GoGoCash, Manut AI); Airplusauto dropped 09-11-26. Landing socials omit Telegram. Wordmark "KunanonJ"; Bangkok is the location signal (AGENTS.md:734-735).

**Design preferences** (AGENTS.md:718-722, phase-7 owner decisions)
- Light by default, owner palette as role tokens, Geist + Geist Mono (+ Noto Sans Thai); the owner updates final content themselves.
- Breakpoints 375 / 768 / 1440; mobile as a miniature desktop.
- Minimised animation on the home shell; keep the intro ("Hello" to "Welcome to KunanonJ"), now 5.2 s by the owner's choice.
- Avoid overly complex design systems; readable components; arrays and mapping for repeated data; inline styles acceptable.
- Primary buttons are ink (`--cta`), Signal is for links, accents and markers; Ember only for live or failed states.
- The footer keeps the "For agents" row; the Home Ventures card keeps `id="ventures"`.
- Multi-agent plans need explicit acceptance criteria per work package.

**Accessibility** (enforced): WCAG 2.1 AA (axe serious/critical), contrast pairs, 12 px text floor, tap targets >= 24 px at 320 and 390 px (WCAG 2.2 2.5.8) and the 44 px convention, one visible focus ring, skip link, reduced motion turns off every animation and view transition, LCP h1 never hidden or blurred, named landmarks, `lang` on Thai pages and mixed-language chrome, `aria-current` on navigation.

**Process**
- RIPER-5 with explicit approvals; one PR per sub-phase, merged on green, verified live; every merge to `main` deploys production; check statements about caching, deploys or behaviour against a build or the live site, with the tree's hash (AGENTS.md:749); a hard constraint is the owner's to interpret: ship the stricter reading and ask (AGENTS.md:744).

### 9.4 Routes that must not be removed or redirected

- `process/features/sea-discovery/references/crawl-baseline.md` (updated 10-11-26), "Must NOT redirect": `/ventures/manut`, `/ventures/gogocash`, `/about`, `/contact`, **`/portfolio/*`**, `/skills/*`, `/topics/*`, `/th/topics/*`, and `/blog` and `/press` (hidden, but the URLs stay). "Redirects (keep)": `/ventures` -> `/#ventures`, **`/work` -> `/#ventures`**.
- `process/features/sea-discovery/completed/sea-discovery_UMBRELLA_PLAN_19-07-26.md:14-30`: indexed authority surfaces stay (`/about`, `/blog`, `/blog/[slug]`, `/contact`, `/topics/*`, `/th/topics/*`, `/ventures/[slug]`); `/ventures` index may redirect; `/resume` and `/studio` stay noindex.
- `process/features/landing-cutover/completed/phase-0_landing-foundation_PLAN_19-07-26.md:42`: the paths `/studio` and `/resume` must stay.
- Agent surfaces stay: `/llms.txt`, `/llms-full.txt`, `/agents.md`, `/sitemap.md`, `/skills.md`, `/skills.json`, `/operating-model.md`, Markdown twins, `/feed.xml`, `/.well-known/*`.
- Hidden pages: no links to `/blog` or `/press` from public pages while `BLOG_PUBLIC` is false (tests in `home.test.tsx`, `SiteHeader.test.tsx`, 404 smoke).

### 9.5 Earlier owner decisions the reference format touches

- Phase 7 (09-11-26) **retired "the floating pill nav"** together with SmoothCursor, keyword tooltips and the Home About/Features/Proof strips (`phase-7_bento-redesign_PLAN_09-11-26.md`, "Retired").
- The header's three inline links (Work, Résumé, AI engineering at >= 1024 px) were the owner's choice for recruiters (recruiter-fit decision O8, 10-11-26).
- The Home h1 text ("Hi, I'm Kunanon Jarat. Forward deployed AI engineering from Bangkok.") is the owner's decision O9 and matches the FDE hub h1; the smoke test pins it.
- Home "Selected work" order (TBH Intranet, AI Automation, Node Validator) is an owner default.
- Primary buttons ink, footer agents row, `/#ventures` anchor, intro kept (phase 7 decisions 1 to 4).

### 9.6 Stale documents (do not trust without checking code)

- `README.md`: says the intro is capped at 1.5 s (now 5.2 s); `/contact` "Video + contact form" (no video); route table omits portfolio, skills, topics and library pages; "Landing content ... Sanity for studio/resume" is correct.
- `.github/workflows/ci.yml:81-82` budget comment (200/255 KB) vs the script (165/200/120 KB).
- `docs/redesign/*` (June 2026, pre-migration, matveyan teardown).
- `lib/brand/tokens.ts:4` says it mirrors `app/globals.css` (now `src/styles/globals.css`); `rawHex.test.ts:14-19` allowlists old `app/` paths.
- `vitest.config.mts:11` lists a test file that no longer exists.

---

## 10. Risks for a full visual redesign

| # | Risk | Severity | Where | Notes |
| --- | --- | --- | --- | --- |
| R1 | **`/work/[slug]` vs `/portfolio/[slug]`.** The reference's case-study URL conflicts with today's routes: `/work` is a 308 to `/#ventures` (`src/lib/redirects.ts:7`) that the SEO record says to keep, and `/portfolio/*` must not redirect. Moving case studies touches 184 code lines in about 40 files (routes, Markdown twins, OG routes, sitemap, llms, agents.md, sitemap.md, JSON-LD, negotiation regex, both `run_worker_first` lists, parity, perf classification) and 25 test files | High | section 9.4 | Cheapest safe path: keep `/portfolio/[slug]` as canonical and label it "Work" (the header already does); any URL move needs the owner's explicit decision, 308s, re-crawl and sitemap updates |
| R2 | **All 96 baselines change**, and must be regenerated in the pinned Linux container and reviewed image by image; the 1% tolerance already hides drift | High | `tests/e2e/visual.spec.ts-snapshots/` | Plan one baseline refresh per phase; consider a tighter tolerance after the redesign |
| R3 | **Parity compares h1 text, titles, meta and JSON-LD** on 137 URLs; changing hero copy fails CI until a re-crawl with `PARITY_SEEDS` | High | `tests/fixtures/site-parity.json` | Keep h1/titles stable, or re-crawl deliberately and count URLs |
| R4 | **Smoke tests encode the current layout:** hero h1 + pill + both buttons fully visible at 375 x 812 and 1440 x 900; header on one row at 1024 px with links between the email and Share; `Primary`/`Site` navs; `Open menu`; card `article` names and relative geometry; 56 px share icon | High | `tests/e2e/smoke.spec.ts:465-1100, 1366-1454` | A big reference hero (large type, photo, marquee) must still fit the recruiter check, or the owner approves changing it |
| R5 | **Fixed pill nav vs tap-area test:** targets are scrolled into view with `block: "nearest"` and hit-tested; a fixed header can cover them, failing "covered tap areas". The owner retired a floating pill nav on 09-11-26 | Medium-High | `smoke.spec.ts:1236-1428` | `scroll-padding-top`, transparent hit areas, or test change; record the owner's reversal |
| R6 | **Shared primitives cascade:** `PageMain` (21 files), `BentoCard` (17), `HeroLead` (16), `EyebrowChip` (13), `Kicker` (13), `MONO_LABEL` (12), `CardLink` (12), `CtaLink` (10), `PageTitle` (10), `SharePill` (8), `CARD_SURFACE` (8). Restyling them changes about 20 page families at once | Medium | `components/bento/*` | Good leverage, but a single change re-baselines everything; `sharedPrimitives.test.ts` pins exact strings |
| R7 | **Hard-coded styles:** about 550 arbitrary Tailwind values and many default `text-sm/xs` sizes instead of type tokens; 6 of 12 type tokens unused | Medium | `components/landing/**` | A new type scale needs a sweep, not just token edits |
| R8 | **SEO markup coupled to layout:** JSON-LD scripts live inside page components; the site menu is the crawl path and is always in the HTML; prerender discovers pages by following links (removing links can silently stop a page from being prerendered and drop it out of the perf measurement); `id="ventures"` anchors redirects and breadcrumbs; About h1 must restate the title | Medium | routes, `SiteHeader.tsx:141-147`, `vite.config.mts:101` | Keep a crawlable full menu or footer link list; keep `#ventures` or move every reference |
| R9 | **Content gaps:** no testimonials; logos are small employer favicons, not clients; only one project screenshot (and it is a capture of today's Home, which must be re-shot and re-described after the redesign) | High (content) | sections 6.6, 6.7, 6.10 | Owner must supply and clear testimonials and hi-res logos; new copy passes the claim audits |
| R10 | **Motion constraints:** CSS-only preference, every animation behind `no-preference` (test-enforced), LCP h1 never fades, Lenis banned by test, entry-chunk headroom about 6 KB | Medium | `globals.test.ts:146-211`, budgets | Sticky stacked cards and a marquee are possible in CSS (sticky positioning, CSS keyframes, scroll-driven animations with fallbacks) without a library; JS motion must use `useReducedMotion` |
| R11 | **Font change:** Inter (and the other retired faces) are banned by test; OG images bundle Geist TTFs; Thai pages need Noto Sans Thai | Medium | `globals.test.ts:75-107`, `lib/og/fonts.ts` | A new face needs the test, `fonts.css`, preloads, OG fonts and Thai coverage changed together |
| R12 | **Palette or theme mechanism change** ripples to `lib/brand/tokens.ts` (OG, icons), `lib/seo/rootMetadata.ts` theme-color (tested), the parity reference (theme-color metas), the print palette, Bangkok scene tokens, contrast test pairs and the class-based dark variant | Medium | section 3 | Keep `.dark` class strategy and the role names; change values in one place |
| R13 | **Print/PDF:** the résumé PDF depends on `[data-site-chrome]`, `[data-print-hide]` and the print block in `globals.css`; `ResumePrint` must stay plain; PDF must remain 2 pages | Medium | `globals.css:507-561`, `scripts/generate-resume-pdf.mjs` | Keep the data attributes on the new header/footer |
| R14 | **Sequencing with recruiter-fit phase 4:** both touch About, venture pages, JSON-LD and their baselines | Medium | section 9.1 | Do phase 4 first or fold it in, to avoid two baseline/parity churns |
| R15 | **Prerendered filter pages** render the default filter and apply `?param=` after hydration (`usePrerenderedParam`); new interactive sections must follow the same pattern to avoid hydration mismatches | Low | `src/lib/filterParam.ts` | |
| R16 | **Every merge deploys production**; previews exist per PR | Process | AGENTS.md:740 | Ship phases behind complete PRs; verify on the preview URL with the read-only smoke grep |

---

## 11. Mapping aid: reference sections to today's sources

| Reference element | Closest thing today | Data available | Gap |
| --- | --- | --- | --- |
| Fixed pill nav | `SiteHeader` (in flow), `SiteMenu` dropdown, `headerLinks`, `ThemeToggle`, share button | `lib/content/landing.ts:57-144` | fixed positioning, scroll behaviour, tests (R4, R5), earlier owner decision to retire a floating pill nav |
| Hero | `HomeHero` (+ `IntroLoader`) | `landing.ts` hero, availability, portrait | the recruiter above-the-fold test; h1 is parity-checked |
| Client-logo marquee | none; résumé logo tiles | 8 small employer/venture logos (`companyLogos.ts`) and the organisation list (7.4) | hi-res logo assets, the honest label (employers, not clients), reduced-motion behaviour, 24 px tap rule if logos link |
| Sticky stacked case-study cards | `SelectedWorkCard` (3 featured), portfolio index cards | 5 projects (`portfolio.ts`), 2 ventures (`ventures.ts`), outcomes, mockups, 1 real cover | screenshots for 4 projects; sticky/scroll motion (CSS only) |
| About | About page hero + 8 cards; Home "How I work" | `aboutPage.ts`, `faq.ts`, `operatingModel.ts` | phase 4 wording pending |
| Journey timeline | Home Experience card, résumé sections, About path chips | `resumeTimeline.fallback.ts` (24 entries in 7 sections), `aboutPage.path` | none for data |
| Testimonials | none | none | owner-supplied, owner-cleared quotes; claim audits |
| Big footer | small `SiteFooter` + Bangkok `PlaceCard` closing Home and Contact | socials, agents row, place copy | keep the "For agents" row and crawlable links |
| `/work/[slug]` case pages | `/portfolio/[slug]` (5), `/ventures/[slug]` (2) | full case data model (6.2, 6.3) | URL decision (R1); Markdown twins and OG images exist per project |
| Light and dark themes | already shipped | role tokens in both themes | none |

---

## Appendix A. Component files (non-test, line counts)

- `components/bento/`: `Bento.tsx` 284, `BangkokScene.tsx` 266, `icons.tsx` 232, `SiteHeader.tsx` 150, `SiteMenu.tsx` 127, `ShareRows.tsx` 115, `Chips.tsx` 112, `Buttons.tsx` 85, `ChromeContext.tsx` 76, `PlaceCard.tsx` 71, `Segmented.tsx` 71, `SiteFooter.tsx` 56, `SharePanel.tsx` 53, `PageHero.tsx` 49, `BangkokClock.tsx` 49, `SharePill.tsx` 37, `MonoEyebrow.tsx` 27, `classes.ts` 27.
- `components/landing/`: `home/HomeCards.tsx` 226, `home/HomeHero.tsx` 56; `about/AboutCards.tsx` 418, `about/AboutHero.tsx` 97, `AboutPageContent.tsx` 36; `contact/ContactForm.tsx` 469, `contact/ContactCards.tsx` 195, `ContactPage.tsx` 61, `RecruiterFacts.tsx` 75; `portfolio/PortfolioMockup.tsx` 590, `portfolio/ProjectCards.tsx` 519, `portfolio/PortfolioIndexPage.tsx` 243, `portfolio/PortfolioProjectPage.tsx` 196, `portfolio/PortfolioParts.tsx` 151, `portfolio/portfolioLayout.ts` 98, `portfolio/VisualIcon.tsx` 64; `discovery/VentureCards.tsx` 443, `discovery/TopicHubPage.tsx` 430, `discovery/VentureHubPage.tsx` 157, `discovery/hubLayout.ts` 81, `discovery/LinkRows.tsx` 67; `library/LearnPage.tsx` 450, `library/ProofPage.tsx` 264, `library/StackPage.tsx` 263, `library/BuildPage.tsx` 159, `library/ExamplesPage.tsx` 145, `library/parts.tsx` 144; `skills/SkillDetailPage.tsx` 542, `skills/SkillsIndexPage.tsx` 430, `skills/SkillParts.tsx` 165, `skills/SkillsCatalog.tsx` 131, `skills/InstallTabs.tsx` 109, `skills/CopyButton.tsx` 108, `skills/SkillSourceCard.tsx` 106, `skills/SkillCard.tsx` 67; `blog/BlogIndexPage.tsx` 438, `blog/BlogPostPage.tsx` 379, `blog/BlogParts.tsx` 137, `blog/BlogPostView.tsx` 65; `PressPage.tsx` 207, `StatusPage.tsx` 163, `ContributionActivity.tsx` 123, `IntroBurst.tsx` 117, `IntroLoader.tsx` 109, `LandingLayout.tsx` 39.
- `components/resume/`: `ResumeCards.tsx` 468, `ResumePrint.tsx` 183, `ResumePage.tsx` 144.
- `components/system/`: `DesignSystemPage.tsx` 353, `SystemLayout.tsx` 10. `components/studio/`: `StudioPage.tsx` 47, `StudioLayout.tsx` 24.
- `components/ui/`: `PixelGrid.tsx` 124, `Image.tsx` 77, `Button.tsx` 76 (test-only user), `SocialIcons.tsx` 56, `Script.tsx` 20.
- `components/`: `PortableText.tsx` 167, `navigation/Link.tsx` 97, `ThemeToggle.tsx` 92, `CompanyLogo.tsx` 75, `RouteError.tsx` 47, `NotFound.tsx` 30, `CloudflareAnalytics.tsx` 29.

## Appendix B. Key file index

| Topic | Files |
| --- | --- |
| Tokens and global CSS | `src/styles/globals.css`, `src/styles/fonts.css`, `lib/brand/tokens.ts`, `lib/seo/rootMetadata.ts` |
| Chrome | `components/landing/LandingLayout.tsx`, `components/bento/SiteHeader.tsx`, `SiteMenu.tsx`, `SiteFooter.tsx`, `SharePanel.tsx`, `SharePill.tsx`, `ShareRows.tsx`, `ChromeContext.tsx`, `components/ThemeToggle.tsx`, `components/landing/IntroLoader.tsx` |
| Primitives | `components/bento/Bento.tsx`, `classes.ts`, `Buttons.tsx`, `Chips.tsx`, `PageHero.tsx`, `Segmented.tsx`, `PlaceCard.tsx` |
| Nav and site copy | `lib/content/landing.ts`, `lib/content/availability.ts`, `lib/content/currentRole.ts`, `lib/content/introGreetings.ts`, `lib/content/pageMeta.ts` |
| Case studies | `lib/content/portfolio.ts`, `lib/content/ventures.ts`, `components/landing/portfolio/*`, `components/landing/discovery/*` |
| Routing and Worker | `src/router.tsx`, `src/routes/**`, `src/server.ts`, `src/lib/redirects.ts`, `src/server/negotiate.ts`, `wrangler.jsonc`, `wrangler.start.jsonc`, `vite.config.mts`, `scripts/prerender-pages.mjs` |
| SEO | `lib/seo/*`, `src/lib/head.ts`, `src/lib/og.ts`, `src/server/og/*`, `src/server/text/*` |
| Guards | `lib/design/*.test.ts`, `tests/e2e/*.ts`, `tests/fixtures/site-parity.json`, `src/ported-routes.json`, `scripts/start-gates.mjs`, `scripts/check-first-load-budget.mjs`, `tests/siteSources.ts`, `lib/content/portfolioOutcomes.test.ts`, `lib/content/ventureCase.test.ts`, `lib/content/resumeFacts.test.ts`, `lib/cloudflare/cacheConfig.test.ts` |
| Process | `AGENTS.md:713-750`, `process/features/CURRENT_FEATURES.md`, `process/features/tanstack-migration/references/phase-7_design-spec_09-11-26.md`, `process/features/sea-discovery/references/crawl-baseline.md`, `process/features/recruiter-fit/active/*` |
