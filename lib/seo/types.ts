/*
 * Page metadata types: the subset of Next's Metadata / Viewport /
 * MetadataRoute shapes this site uses, owned here since the move off Next
 * (tanstack-migration Phase 6). lib/seo/metadataToHead.ts turns them into
 * TanStack Router head() tags; lib/seo/metadataRoutes.ts serialises the
 * robots, sitemap and manifest shapes.
 */

type Url = string | URL;

export type MetadataTitle =
  string | { absolute: string } | { default: string; template?: string };

export type MetadataImage =
  | Url
  | {
      url: Url;
      width?: number | string;
      height?: number | string;
      alt?: string;
      type?: string;
    };

export type MetadataRobots =
  string | { index?: boolean; follow?: boolean; nocache?: boolean };

export type Metadata = {
  metadataBase?: URL | null;
  title?: MetadataTitle;
  description?: string;
  authors?: { name?: string; url?: Url } | { name?: string; url?: Url }[];
  creator?: string;
  robots?: MetadataRobots;
  verification?: { google?: string | number | (string | number)[] };
  alternates?: {
    canonical?: Url | { url: Url };
    languages?: Record<string, Url | { url: Url }[]>;
    types?: Record<string, Url | { url: Url }[]>;
  };
  openGraph?: {
    type?: string;
    locale?: string;
    url?: Url;
    siteName?: string;
    title?: string;
    description?: string;
    images?: MetadataImage | MetadataImage[];
    publishedTime?: string;
  };
  twitter?: {
    card?: string;
    site?: string;
    creator?: string;
    title?: string;
    description?: string;
    images?: MetadataImage | MetadataImage[];
  };
};

export type Viewport = {
  width?: string;
  initialScale?: number;
  viewportFit?: "auto" | "contain" | "cover";
  interactiveWidget?: "resizes-visual" | "resizes-content" | "overlays-content";
  themeColor?:
    | string
    | { color: string; media?: string }
    | { color: string; media?: string }[];
};

type ChangeFrequency =
  "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";

export type RobotsRule = {
  userAgent?: string | string[];
  /** Content Signals (contentsignals.org), e.g. `search=yes, ai-train=no`. */
  contentSignal?: string;
  allow?: string | string[];
  disallow?: string | string[];
  crawlDelay?: number;
};

export type Robots = {
  /** Comment lines at the top of robots.txt, without the leading `#`. */
  comment?: string | string[];
  rules: RobotsRule | RobotsRule[];
  sitemap?: string | string[];
  host?: string;
};

export type SitemapEntry = {
  url: string;
  lastModified?: string | Date;
  changeFrequency?: ChangeFrequency;
  priority?: number;
};

export type Sitemap = SitemapEntry[];

export type Manifest = {
  name?: string;
  short_name?: string;
  description?: string;
  start_url?: string;
  display?: "fullscreen" | "standalone" | "minimal-ui" | "browser";
  background_color?: string;
  theme_color?: string;
  icons?: { src: string; sizes?: string; type?: string; purpose?: string }[];
};
