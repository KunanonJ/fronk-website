import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk, Instrument_Serif, Space_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from "@/components/Analytics";
import { CloudflareAnalytics } from "@/components/CloudflareAnalytics";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { WebVitals } from "@/components/WebVitals";
import RouteSplash from "@/components/landing/RouteSplash";
import { siteConfig } from "@/lib/site";
import { buildSiteJsonLd } from "@/lib/seo/jsonLd";
import { site as landingSite } from "@/lib/content/landing";
import "./globals.css";

const siteJsonLd: string = JSON.stringify(buildSiteJsonLd());

const identityLinks: readonly string[] = [
  `mailto:${siteConfig.email}`,
  siteConfig.socials.x,
  siteConfig.socials.linkedin,
  siteConfig.socials.github,
  siteConfig.socials.telegram,
  siteConfig.socials.farcaster,
  siteConfig.socials.website,
];

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  display: "swap",
});

const spaceMono = Space_Mono({
  variable: "--font-mono-instrument",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: landingSite.title,
    template: `%s — ${siteConfig.name}`,
  },
  description: landingSite.description,
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
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      className={`${hankenGrotesk.variable} ${spaceMono.variable} ${instrumentSerif.variable} dark h-full antialiased`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col bg-black text-primary">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: siteJsonLd }}
        />
        <link rel="preconnect" href="https://cdn.sanity.io" crossOrigin="" />
        <link rel="dns-prefetch" href="https://cdn.sanity.io" />
        <link rel="dns-prefetch" href="https://icons.duckduckgo.com" />
        <link rel="dns-prefetch" href="https://d8j0ntlcm91z4.cloudfront.net" />
        <link rel="dns-prefetch" href="https://images.higgs.ai" />
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
          <RouteSplash />
          {children}
        </ThemeProvider>
        <CloudflareAnalytics />
        <Analytics />
        <GoogleAnalytics />
        <WebVitals />
      </body>
    </html>
  );
}
