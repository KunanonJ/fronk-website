/// <reference types="vite/client" />
import { serializeJsonLd } from "@/lib/seo/serializeJsonLd";
import { lazy, Suspense, type ReactNode } from "react";
import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
  useRouterState,
} from "@tanstack/react-router";
import type { RouterContext } from "../router";
import NotFound from "@/components/NotFound";
import RouteError from "@/components/RouteError";
import appCss from "@/src/styles/globals.css?url";
import { CloudflareAnalytics } from "@/components/CloudflareAnalytics";
import { ThemeProvider } from "next-themes";
import { buildSiteJsonLd } from "@/lib/seo/jsonLd";
import { isNamedMeta, rootHead } from "@/lib/seo/metadataToHead";
import { rootViewport } from "@/lib/seo/rootMetadata";
import { site as landingSite } from "@/lib/content/landing";
import { profileDesign } from "@/lib/design/scope";
import geistLatin from "../fonts/geist-latin.woff2?url";
import geistMonoLatin from "../fonts/geist-mono-latin.woff2?url";
import instrumentSerifLatin from "../fonts/instrument-serif-latin.woff2?url";
import onestLatin from "../fonts/onest-latin.woff2?url";
import fontsCss from "../styles/fonts.css?url";
import profileCss from "../styles/profile.css?url";

const siteJsonLd = serializeJsonLd(buildSiteJsonLd());
const global = rootHead(rootViewport);
// Router head() keeps one meta per name, so the two media-scoped theme
// colours are rendered straight into <head> instead.
const themeColors = global.meta.filter((m) => isNamedMeta(m, "theme-color"));
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
 * load on demand. The profile redesign's pages (design spec 2.13, 3.1) set
 * the hero in Instrument Serif over Onest, so they preload those two instead
 * of Geist, not beside it; the pages Phase 7 restyles keep Geist.
 */
const PROFILE_FONTS = [onestLatin, instrumentSerifLatin].map(preloadFont);
const GEIST_FONTS = [geistLatin, geistMonoLatin].map(preloadFont);

export const Route = createRootRouteWithContext<RouterContext>()({
  head: ({ matches }) => ({
    // The default title; every page's head() replaces it (404 and error pages keep it).
    meta: [...globalMeta, { title: landingSite.title }],
    links: [
      ...(profileDesign(matches) ? PROFILE_FONTS : GEIST_FONTS),
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
  const lang = pathname === "/th" || pathname.startsWith("/th/") ? "th" : "en";
  // Profile redesign: the new tokens apply only inside this scope, taken from
  // the routes on screen so a navigation never restyles the old page.
  const design = useRouterState({
    select: (s) => profileDesign(s.matches),
  });
  return (
    <html
      lang={lang}
      data-design={design}
      className="h-full antialiased"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <HeadContent />
        {themeColors.map((m) => (
          <meta
            key={m.media}
            name="theme-color"
            media={m.media}
            content={m.content}
          />
        ))}
      </head>
      <body className="flex min-h-full flex-col bg-page text-ink">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: siteJsonLd }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
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
