/// <reference types="vite/client" />
import type { ReactNode } from "react";
import { HeadContent, Outlet, Scripts, createRootRoute, useRouterState } from "@tanstack/react-router";
import NotFound from "@/app/not-found";
import appCss from "@/app/globals.css?url";
import { Analytics } from "@/components/Analytics";
import { CloudflareAnalytics } from "@/components/CloudflareAnalytics";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { GoogleTagManager } from "@/components/GoogleTagManager";
import RouteFade from "@/components/landing/RouteFade";
import { ThemeProvider } from "@/components/theme-provider";
import { WebVitals } from "@/components/WebVitals";
import { buildSiteJsonLd } from "@/lib/seo/jsonLd";
import { rootHead } from "@/lib/seo/metadataToHead";
import { rootViewport } from "@/lib/seo/rootMetadata";
import geistLatin from "../fonts/geist-latin.woff2?url";
import geistMonoLatin from "../fonts/geist-mono-latin.woff2?url";
import fontsCss from "../styles/fonts.css?url";

const siteJsonLd = JSON.stringify(buildSiteJsonLd());
const global = rootHead(rootViewport);
// Router head() keeps one meta per name, so the two media-scoped theme
// colours are rendered straight into <head> instead.
const themeColors = global.meta.filter((m) => m.name === "theme-color");
const globalMeta = global.meta.filter((m) => m.name !== "theme-color");

export const Route = createRootRoute({
  head: () => ({
    meta: globalMeta as never[],
    links: [
      // Same two Latin faces next/font preloaded; Thai loads on demand.
      { rel: "preload", href: geistLatin, as: "font", type: "font/woff2", crossOrigin: "anonymous" },
      { rel: "preload", href: geistMonoLatin, as: "font", type: "font/woff2", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: fontsCss },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://cdn.sanity.io", crossOrigin: "" },
      { rel: "dns-prefetch", href: "https://cdn.sanity.io" },
      ...global.links,
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFound,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  // Thai pages declare Thai on <html> (Next only set it on <main>).
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const lang = pathname === "/th" || pathname.startsWith("/th/") ? "th" : "en";
  return (
    <html lang={lang} className="h-full antialiased" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <HeadContent />
        {themeColors.map((m) => (
          <meta key={m.media} name="theme-color" media={m.media} content={m.content} />
        ))}
      </head>
      <body className="flex min-h-full flex-col bg-page text-ink">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: siteJsonLd }} />
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <RouteFade />
          {children}
        </ThemeProvider>
        <GoogleTagManager />
        <CloudflareAnalytics />
        <Analytics />
        <GoogleAnalytics />
        <WebVitals />
        <Scripts />
      </body>
    </html>
  );
}
