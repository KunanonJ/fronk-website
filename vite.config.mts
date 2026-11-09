import path from "node:path";
import { fileURLToPath } from "node:url";
import { cloudflare } from "@cloudflare/vite-plugin";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

/*
 * TanStack Start build (tanstack-migration). Runs next to Next until the
 * Phase 5 cutover: Next keeps `app/` and next.config.ts; Start reads `src/`
 * and the shared `components/` and `lib/` through the `@/` alias.
 */
const root = path.dirname(fileURLToPath(import.meta.url));

/** Every NEXT_PUBLIC_* the code reads; unset ones become `undefined`, never `process`. */
const PUBLIC_ENV = [
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_GSC_VERIFICATION",
  "NEXT_PUBLIC_GTM_ID",
  "NEXT_PUBLIC_GA_ID",
  "NEXT_PUBLIC_UMAMI_HOST",
  "NEXT_PUBLIC_UMAMI_WEBSITE_ID",
  "NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN",
  "NEXT_PUBLIC_SANITY_PROJECT_ID",
  "NEXT_PUBLIC_SANITY_DATASET",
  "NEXT_PUBLIC_SANITY_API_VERSION",
  "NEXT_PUBLIC_SANITY_STUDIO_URL",
  "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
];

export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, root, "NEXT_PUBLIC_"), ...process.env };
  return {
    server: { port: 3000 },
    // IPv4 explicitly: in the CI container "localhost" binds ::1 while the
    // prerender step fetches 127.0.0.1. The visual suite can also run in the
    // Playwright Docker image against the preview.
    preview: { host: "127.0.0.1", allowedHosts: ["host.docker.internal"] },
    resolve: {
      alias: [{ find: /^@\//, replacement: `${root}/` }],
    },
    define: Object.fromEntries(
      PUBLIC_ENV.map((key) => [`process.env.${key}`, env[key] === undefined ? "undefined" : JSON.stringify(env[key])]),
    ),
    plugins: [
      // Production config by default; `pnpm deploy:staging` builds against the staging Worker.
      cloudflare({ configPath: process.env.START_WRANGLER_CONFIG ?? "wrangler.jsonc", viteEnvironment: { name: "ssr" } }),
      tanstackStart({
        // Pages built from lib/content are rendered once per deploy and served
        // as static assets; Sanity-backed pages render on request (Phase 4
        // caches them at the edge).
        prerender: {
          enabled: true,
          crawlLinks: true,
          autoSubfolderIndex: false,
          // Pages only: Sanity-backed routes and text/API endpoints render on request.
          filter: ({ path }) => !/^\/(resume|learn|blog|api|studio)(\/|$)/.test(path) && !/\.[a-z0-9]+$/i.test(path),
        },
      }),
      react(),
    ],
  };
});
