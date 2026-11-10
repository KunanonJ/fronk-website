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
import { Analytics } from "@/components/Analytics";
import { CloudflareAnalytics } from "@/components/CloudflareAnalytics";
import { ThemeProvider } from "next-themes";
import { buildSiteJsonLd } from "@/lib/seo/jsonLd";
import { isNamedMeta, rootHead } from "@/lib/seo/metadataToHead";
import { rootViewport } from "@/lib/seo/rootMetadata";
import { site as landingSite } from "@/lib/content/landing";
import geistLatin from "../fonts/geist-latin.woff2?url";
import geistMonoLatin from "../fonts/geist-mono-latin.woff2?url";
import fontsCss from "../styles/fonts.css?url";

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

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    // The default title; every page's head() replaces it (404 and error pages keep it).
    meta: [...globalMeta, { title: landingSite.title }],
    links: [
      // Same two Latin faces next/font preloaded; Thai loads on demand.
      {
        rel: "preload",
        href: geistLatin,
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      {
        rel: "preload",
        href: geistMonoLatin,
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      { rel: "stylesheet", href: fontsCss },
      { rel: "stylesheet", href: appCss },
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
  return (
    <html
      lang={lang}
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
        <Analytics />
        <Suspense fallback={null}>
          <Devtools />
        </Suspense>
        <Scripts />
      </body>
    </html>
  );
}
