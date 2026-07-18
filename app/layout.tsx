import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk, Space_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteShell } from "@/components/layout/SiteShell";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Analytics } from "@/components/Analytics";
import { CloudflareAnalytics } from "@/components/CloudflareAnalytics";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { WebVitals } from "@/components/WebVitals";
import { resolveSiteSettings } from "@/lib/content/siteSettings";
import { fetchSiteSettings } from "@/lib/sanity/fetch";
import { siteConfig } from "@/lib/site";
import { buildSiteJsonLd } from "@/lib/seo/jsonLd";
import "./globals.css";

// Site-wide schema.org @graph (Person + WebSite + founded Organizations),
// cross-linked by @id for a knowledge-panel entity. Values are
// developer-controlled constants / real venture data (no XSS surface).
// Stringified once at module load — no runtime cost per render.
const siteJsonLd: string = JSON.stringify(buildSiteJsonLd());

// Identity URLs used for IndieWeb / Mastodon `rel="me"` verification.
const identityLinks: readonly string[] = [
  `mailto:${siteConfig.email}`,
  siteConfig.socials.x,
  siteConfig.socials.linkedin,
  siteConfig.socials.github,
  siteConfig.socials.telegram,
  siteConfig.socials.farcaster,
  siteConfig.socials.website,
];

// Hanken Grotesk — Söhne stand-in until licensed woff2 land in
// public/fonts/soehne/ (then switch to next/font/local). Never ship Dennis Sans.
const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  display: "swap",
});

// Space Mono — transitional mono; HUD chrome removed in WP-03.
const spaceMono = Space_Mono({
  variable: "--font-mono-instrument",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    // Image is auto-discovered from app/opengraph-image.tsx.
  },
  twitter: {
    card: "summary_large_image",
    creator: "@fkj98",
    site: "@fkj98",
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    // Image auto-discovered from app/opengraph-image.tsx as the Twitter fallback.
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  // Public site is dark-only (FogLAMP near-black mood).
  themeColor: "#0a0a0a",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const cmsSettings = await fetchSiteSettings();
  const site = resolveSiteSettings(cmsSettings);

  return (
    <html
      lang="en"
      className={`${hankenGrotesk.variable} ${spaceMono.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col bg-bg text-fg">
        {/* schema.org @graph (Person + WebSite + Organizations) — helps search
            and answer engines build a knowledge-graph card. Fully
            developer-controlled values, so no XSS surface. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: siteJsonLd }}
        />
        {/* Warm up the connections content + favicons come from. */}
        <link rel="preconnect" href="https://cdn.sanity.io" crossOrigin="" />
        <link rel="dns-prefetch" href="https://cdn.sanity.io" />
        <link rel="dns-prefetch" href="https://icons.duckduckgo.com" />
        {/* IndieWeb / Mastodon identity verification links. React 19 hoists
            <link> elements out of <body> into <head> automatically. */}
        {identityLinks.map((href) => (
          <link key={href} rel="me" href={href} />
        ))}
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <SiteShell
            header={<Header site={site} />}
            footer={<Footer site={site} />}
          >
            {children}
          </SiteShell>
        </ThemeProvider>
        <CloudflareAnalytics />
        <Analytics />
        <GoogleAnalytics />
        <WebVitals />
      </body>
    </html>
  );
}
