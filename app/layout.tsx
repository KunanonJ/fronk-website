import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Noto_Sans_Thai } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from "@/components/Analytics";
import { CloudflareAnalytics } from "@/components/CloudflareAnalytics";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { GoogleTagManager } from "@/components/GoogleTagManager";
import { WebVitals } from "@/components/WebVitals";
import RouteFade from "@/components/landing/RouteFade";
import { IDENTITY_LINKS } from "@/lib/seo/identity";
import { buildSiteJsonLd } from "@/lib/seo/jsonLd";
import { rootMetadata, rootViewport } from "@/lib/seo/rootMetadata";
import "./globals.css";

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

export const metadata: Metadata = rootMetadata;

export const viewport: Viewport = rootViewport;

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
