/// <reference types="vite/client" />
import { lazy, Suspense, useEffect, useState, type ReactNode } from "react";
import {
  HeadContent,
  Scripts,
  ScriptOnce,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
} from "@tanstack/react-router";
import type { RouterContext } from "../router";
import NotFound from "@/components/NotFound";
import RouteError from "@/components/RouteError";
import { JsonLd } from "@/components/JsonLd";
import appCss from "@/src/styles/globals.css?url";
import { CloudflareAnalytics } from "@/components/CloudflareAnalytics";
import { WebMcpTools } from "@/components/agents/WebMcpTools";
import { ThemeProvider, useTheme } from "next-themes";
import { buildSiteJsonLd } from "@/lib/seo/jsonLd";
import { isNamedMeta, rootHead } from "@/lib/seo/metadataToHead";
import { rootViewport } from "@/lib/seo/rootMetadata";
import {
  THEME_COLOR_SCRIPT,
  THEME_COLORS,
  themeColorFor,
} from "@/lib/seo/themeColor";
import { site as landingSite } from "@/lib/content/landing";
import { ASSET_RETRY_SCRIPT } from "@/src/lib/assetRetry";
import { BUILD_ID } from "@/src/lib/buildId";
import instrumentSerifLatin from "../fonts/instrument-serif-latin.woff2?url";
import onestLatin from "../fonts/onest-latin.woff2?url";
import fontsCss from "../styles/fonts.css?url";
import profileCss from "../styles/profile.css?url";

// The site-wide JSON-LD graph (Person, WebSite, the ventures), built on the
// server only: the browser takes the text the server wrote (ServedJsonLd).
const siteJsonLd = import.meta.env.SSR ? buildSiteJsonLd() : null;
const global = rootHead(rootViewport);
// The theme-color meta is the document's own (RootDocument): its colour
// follows the theme, which a route's head() cannot see.
const globalMeta = global.meta.filter((m) => !isNamedMeta(m, "theme-color"));

// Router + Query devtools in development only; the import is dropped from builds.
const Devtools = import.meta.env.DEV
  ? lazy(() => import("../devtools"))
  : () => null;

const preloadFont = (href: string) => ({
  rel: "preload",
  href,
  as: "font",
  type: "font/woff2",
  crossOrigin: "anonymous" as const,
});

/*
 * The Latin faces a page's first screen sets, preloaded; Thai and the rest
 * load on demand. Every page sets its hero in Instrument Serif over Onest
 * (design spec 3.1), so those two are preloaded.
 */
const PRELOADED_FONTS = [onestLatin, instrumentSerifLatin].map(preloadFont);

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    // The default title; every page's head() replaces it (404 and error pages keep it).
    meta: [...globalMeta, { title: landingSite.title }],
    links: [
      ...PRELOADED_FONTS,
      { rel: "stylesheet", href: fontsCss },
      { rel: "stylesheet", href: appCss },
      // The redesign's chrome and sections (Phases 1 to 6): every public
      // page renders the new nav and footer, so every page links it.
      { rel: "stylesheet", href: profileCss },
      { rel: "preconnect", href: "https://cdn.sanity.io", crossOrigin: "" },
      { rel: "dns-prefetch", href: "https://cdn.sanity.io" },
      ...global.links,
    ],
  }),
  // The document shell wraps the page, the 404 and the error state alike.
  shellComponent: RootDocument,
  notFoundComponent: NotFound,
  errorComponent: RouteError,
});

function RootDocument({ children }: { children: ReactNode }) {
  // Thai pages declare Thai on <html> (Next only set it on <main>).
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  // The router matches paths in any case (/TH/topics/... is the Thai hub).
  const path = pathname.toLowerCase();
  const lang = path === "/th" || path.startsWith("/th/") ? "th" : "en";
  // The browser's toolbar colour (lib/seo/themeColor.ts), from hydration
  // on the colour the page already holds: the server's, or the dark one
  // the head script gave it. React finds a <meta> it hydrates by its
  // content, so starting from any other colour would add a second meta
  // after this one, which the browser would never read. ThemeColor then
  // keeps it on the theme.
  const [themeColor, setThemeColor] = useState(servedThemeColor);
  // A navigation whose chunk a deploy removed loads its page fresh, once
  // (src/lib/staleChunk.ts). Client only, from hydration on, and a chunk of
  // its own rather than part of the entry chunk, which every page loads
  // (the 165 KB default first-load budget binds on the topic hubs).
  const router = useRouter();
  useEffect(() => {
    let stop: (() => void) | undefined;
    let left = false;
    import("@/src/lib/staleChunk").then(
      (chunk) => {
        if (!left) stop = chunk.reloadOnStaleChunkAfterLoad(router);
      },
      // Its own chunk missing means this document's build is gone already:
      // nothing to recover with, and nothing worth an error.
      () => {},
    );
    return () => {
      left = true;
      stop?.();
    };
  }, [router]);
  return (
    <html
      lang={lang}
      className="h-full antialiased"
      data-scroll-behavior="smooth"
      data-build={BUILD_ID}
      suppressHydrationWarning
    >
      <head>
        {/* One reload when the page's own files fail to load
            (src/lib/assetRetry.ts): in <head>, so it listens before the
            module script in <body> runs. The server writes it once; the
            client bundle leaves the string out. */}
        {import.meta.env.SSR ? (
          <ScriptOnce>{ASSET_RETRY_SCRIPT}</ScriptOnce>
        ) : null}
        <HeadContent />
        <meta name="theme-color" content={themeColor} />
        {/* The dark colour before the first paint when the stored theme is
            dark; React writes it after the meta. Server only, as above. */}
        {import.meta.env.SSR ? (
          <ScriptOnce>{THEME_COLOR_SCRIPT}</ScriptOnce>
        ) : null}
      </head>
      <body className="flex min-h-full flex-col bg-page text-ink">
        {siteJsonLd ? <JsonLd data={siteJsonLd} /> : <ServedJsonLd />}
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <ThemeColor onChange={setThemeColor} />
          {children}
          {pathname.startsWith("/studio") ? null : <WebMcpTools />}
        </ThemeProvider>
        <CloudflareAnalytics />
        <Suspense fallback={null}>
          <Devtools />
        </Suspense>
        <Scripts />
      </body>
    </html>
  );
}

/** The toolbar colour the page holds: the server's, or the head script's. */
function servedThemeColor(): string {
  if (import.meta.env.SSR) return THEME_COLORS.light;
  return (
    document.head
      .querySelector('meta[name="theme-color"]')
      ?.getAttribute("content") ?? THEME_COLORS.light
  );
}

/**
 * Keeps the toolbar colour on the theme the page shows, as the reader (or
 * an agent's tool) switches it. It reads `theme`, not `resolvedTheme`: with
 * no system theme, next-themes puts `theme` itself on <html> as its class,
 * while `resolvedTheme` would name the OS's scheme for a stored "system",
 * which paints nothing.
 */
function ThemeColor({ onChange }: { onChange: (color: string) => void }) {
  const { theme } = useTheme();
  useEffect(() => {
    onChange(themeColorFor(theme));
  }, [theme, onChange]);
  return null;
}

/**
 * The site graph in the browser: the text the server wrote into the first
 * JSON-LD script directly in <body> (the one above), read once. Hydration
 * meets the script it would have built, and the entry chunk every page loads
 * carries neither the graph's builder (lib/seo/jsonLd.ts) nor the venture
 * data it reads (lib/content/ventures.ts).
 */
function ServedJsonLd() {
  const [served] = useState(
    () =>
      document.body.querySelector(':scope > script[type="application/ld+json"]')
        ?.textContent ?? "",
  );
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: served }}
    />
  );
}
