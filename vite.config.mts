import path from "node:path";
import { fileURLToPath } from "node:url";
import { cloudflare } from "@cloudflare/vite-plugin";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { EXTRA_PRERENDER_PATHS } from "./scripts/prerender-pages.mjs";
import { readWranglerVars } from "./scripts/wrangler-vars.mjs";

/*
 * TanStack Start build for the Cloudflare Worker. `src/` holds the app (routes,
 * server entry, server code); `components/` and `lib/` are shared through the
 * `@/` alias.
 */
const root = path.dirname(fileURLToPath(import.meta.url));

/**
 * Every NEXT_PUBLIC_* the code reads, inlined at build time (client and server
 * bundles). Unset ones become `undefined`, never a `process` lookup.
 */
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

/**
 * Values a build cannot do without. A missing one would be inlined as
 * `undefined` and the site would ship without Sanity content (as in #79).
 */
const REQUIRED_PUBLIC_ENV = [
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_SANITY_PROJECT_ID",
  "NEXT_PUBLIC_SANITY_DATASET",
];

const wranglerConfig = process.env.START_WRANGLER_CONFIG ?? "wrangler.jsonc";

export default defineConfig(({ command, mode }) => {
  // Precedence: the shell (CI overrides), then local .env files, then the
  // Worker's own `vars`, so Workers Builds needs no build variables.
  const env = {
    ...readWranglerVars(path.join(root, wranglerConfig)),
    ...loadEnv(mode, root, "NEXT_PUBLIC_"),
    ...process.env,
  };
  const missing =
    command === "build" ? REQUIRED_PUBLIC_ENV.filter((key) => !env[key]) : [];
  if (missing.length > 0) {
    throw new Error(
      `Build needs ${missing.join(", ")}: set them in ${wranglerConfig} "vars" or the shell.`,
    );
  }
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
      PUBLIC_ENV.map((key) => [
        `process.env.${key}`,
        env[key] === undefined ? "undefined" : JSON.stringify(env[key]),
      ]),
    ),
    plugins: [
      // Production config by default; `pnpm deploy:staging` builds against the staging Worker.
      cloudflare({
        configPath: wranglerConfig,
        viteEnvironment: { name: "ssr" },
      }),
      tanstackStart({
        // Pages built from lib/content are rendered once per deploy and served
        // as static assets; Sanity-backed pages render on request (Phase 4
        // caches them at the edge).
        prerender: {
          enabled: true,
          crawlLinks: true,
          autoSubfolderIndex: false,
          // Pages only: Sanity-backed routes and text/API endpoints render on
          // request, and /x/ is a 308 to /x (no second copy as x/index.html).
          filter: ({ path }) =>
            !/^\/(resume|learn|blog|api|studio)(\/|$)/.test(path) &&
            !/\.[a-z0-9]+$/i.test(path) &&
            (path === "/" || !path.endsWith("/")),
        },
        pages: EXTRA_PRERENDER_PATHS.map((path) => ({ path })),
      }),
      react(),
    ],
  };
});
