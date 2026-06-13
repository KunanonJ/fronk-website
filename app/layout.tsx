import type { Metadata, Viewport } from "next";
import { Geist, Space_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteShell } from "@/components/layout/SiteShell";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Analytics } from "@/components/Analytics";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
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

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

// Space Mono — the terminal "instrument" face for HUD labels, eyebrows,
// the ticker, and code. Static font: weights 400/700 only.
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f5f0" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
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
      className={`${geistSans.variable} ${spaceMono.variable} h-full antialiased`}
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
          enableSystem
          disableTransitionOnChange
        >
          <SiteShell
            header={<Header site={site} />}
            footer={<Footer site={site} />}
          >
            {children}
          </SiteShell>
        </ThemeProvider>
        <Analytics />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
