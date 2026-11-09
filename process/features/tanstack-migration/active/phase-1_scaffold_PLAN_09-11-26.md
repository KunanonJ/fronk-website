# Phase 1: Scaffold

**Status:** OUTLINE (finalised at entry from the installed packages' docs and types).
**Created:** 09-11-26
**Umbrella:** `tanstack-migration_UMBRELLA_PLAN_09-11-26.md`

## Objective

Start, Vite and the Cloudflare plugin build and run under workerd next to Next. `/` and `/about` render through Start with head parity against the Phase 0 reference.

## Steps

1. **Dependencies (exact pins):** `@tanstack/react-start`, `@tanstack/react-router`, `@tanstack/react-query`, `@tanstack/router-plugin` (if Start doesn't bundle it), `@cloudflare/vite-plugin`, `vite`, the Fontsource variable fonts (Geist, Geist Mono, Noto Sans Thai), and `@tailwindcss/vite`.
2. **Config:**
   - `vite.config.ts`: plugins in the order `cloudflare({ viteEnvironment: { name: "ssr" } })`, `tanstackStart()`, `react()`, `tailwindcss()`; the `@/` alias; aliases from `next/*` to `src/shims/*`;
   - `wrangler.start.jsonc` (`name: fronk-website-start`, `main: "@tanstack/react-start/server-entry"`, assets);
   - scripts `start:dev`, `start:build`, `start:preview`.
3. **`src/router.tsx`, `src/routes/__root.tsx`:**
   - `head()` carries the root `Metadata` translated by `metadataToHead`, the viewport and theme colours, the `rel=me` links and the preconnect;
   - `HeadContent` and `Scripts`;
   - Fontsource CSS defining the same `--font-geist-sans` / `--font-geist-mono` / `--font-noto-thai` variables that `globals.css` reads;
   - `ThemeProvider` (next-themes, kept if its pre-paint script works under Start SSR);
   - `RouteFade`, the analytics components, and the site JSON-LD.
4. **Shims (`src/shims/`):**
   - `next/link` → Router `Link` (prop mapping, `scroll={false}`);
   - `next/navigation` → `usePathname`, `useRouter`, `notFound`, `redirect`;
   - `next/image` → `<img>`;
   - `next/script` → `<script>` with the strategy mapped.
5. **`lib/seo/metadataToHead.ts`:** Next `Metadata` and the root defaults go into Start `head()`, reproducing Next's rules:
   - the title template and `absolute`;
   - `metadataBase` absolutisation;
   - openGraph/twitter inheritance and field order;
   - alternates/hreflang and robots;
   - verification and icons.

   Unit-tested against the Phase 0 reference.
6. **Routes:** `src/routes/_landing.tsx` (the landing layout: skip link, cursor, footer), `index.tsx` (`/`) and `about.tsx`.
7. **CI:** a `start` job that builds Start and runs the parity diff for the ported routes against the Phase 0 reference.

## Gates

- `pnpm start:build` succeeds; `start:preview` (workerd) serves `/` and `/about`.
- The parity diff for `/` and `/about` is clean (or only listed intended differences).
- Smoke + axe pass on both routes against the Start preview, in both themes.
- Next's build and CI are unchanged and green.
