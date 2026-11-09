import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Noto_Sans_Thai } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from "@/components/Analytics";
import { CloudflareAnalytics } from "@/components/CloudflareAnalytics";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { GoogleTagManager } from "@/components/GoogleTagManager";
import { WebVitals } from "@/components/WebVitals";
import RouteFade from "@/components/landing/RouteFade";
import { siteConfig } from "@/lib/site";
import { BLOG_PUBLIC } from "@/lib/content/blogVisibility";
import { IDENTITY_LINKS } from "@/lib/seo/identity";
import { buildSiteJsonLd } from "@/lib/seo/jsonLd";
import { TITLE_SUFFIX } from "@/lib/seo/pageTitle";
import { resolveGscVerification } from "@/lib/seo/searchConsole";
import { site as landingSite } from "@/lib/content/landing";
import "./globals.css";

const gscVerification = resolveGscVerification(
  process.env.NEXT_PUBLIC_GSC_VERIFICATION,
);

const siteJsonLd: string = JSON.stringify(buildSiteJsonLd());

/*
 * visual-redesign Phase 0: one sans and one mono (both variable fonts), plus
 * Noto Sans Thai for Thai pages. Thai isn't preloaded; its unicode-range means
 * only pages with Thai text download it.
 */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-thai",
  subsets: ["thai"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: landingSite.title,
    template: `%s${TITLE_SUFFIX}`,
  },
  description: landingSite.description,
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  alternates: {
    canonical: "/",
    // RSS only carries blog posts, so it isn't advertised while the blog is hidden.
    ...(BLOG_PUBLIC ? { types: { "application/rss+xml": "/feed.xml" } } : {}),
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: landingSite.title,
    description: landingSite.description,
  },
  twitter: {
    card: "summary_large_image",
    creator: "@fkj98",
    site: "@fkj98",
    title: landingSite.title,
    description: landingSite.description,
  },
  robots: {
    index: true,
    follow: true,
  },
  ...(gscVerification
    ? { verification: { google: gscVerification } }
    : {}),
};

export const viewport: Viewport = {
  // Ink (dark) and the light page colour (globals.css --page).
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0b0d17" },
    { media: "(prefers-color-scheme: light)", color: "#f5f6fa" },
  ],
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${notoSansThai.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col bg-page text-ink">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: siteJsonLd }}
        />
        <link rel="preconnect" href="https://cdn.sanity.io" crossOrigin="" />
        <link rel="dns-prefetch" href="https://cdn.sanity.io" />
        {IDENTITY_LINKS.map((href) => (
          <link key={href} rel="me" href={href} />
        ))}
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <RouteFade />
          {children}
        </ThemeProvider>
        <GoogleTagManager />
        <CloudflareAnalytics />
        <Analytics />
        <GoogleAnalytics />
        <WebVitals />
      </body>
    </html>
  );
}
