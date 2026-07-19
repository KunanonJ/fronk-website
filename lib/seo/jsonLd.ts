import { siteConfig } from "@/lib/site";
import { getAllVentures } from "@/lib/content/ventures";

const BASE = siteConfig.url.replace(/\/$/, "");

/** Stable @id anchors so nodes cross-reference instead of duplicating. */
export const PERSON_ID = `${BASE}/#person`;
export const WEBSITE_ID = `${BASE}/#website`;

function sameAs(): readonly string[] {
  const s = siteConfig.socials;
  return [s.x, s.linkedin, s.github, s.telegram, s.farcaster, s.website];
}

function orgId(url: string): string {
  return `${url.replace(/\/$/, "")}/#organization`;
}

/** One Organization node per venture the person founded — honest, from real venture data. */
function organizations(): Record<string, unknown>[] {
  return getAllVentures()
    .filter((v) => v.role.toLowerCase() === "founder")
    .map((v) => ({
      "@type": "Organization",
      "@id": orgId(v.url),
      name: v.name,
      url: v.url,
      description: v.description,
      founder: { "@id": PERSON_ID },
    }));
}

/**
 * The site-wide schema.org @graph: a Person (the knowledge-panel entity), a
 * WebSite, and the founded Organizations, cross-linked by @id. All values are
 * developer-controlled constants / real venture data — no XSS surface, no
 * fabricated claims.
 */
export function buildSiteJsonLd(): Record<string, unknown> {
  const orgs = organizations();
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": PERSON_ID,
        name: siteConfig.name,
        alternateName: siteConfig.shortName,
        url: BASE,
        email: siteConfig.email,
        image: `${BASE}/profile.jpg`,
        jobTitle: "Founder",
        worksFor: orgs.map((o) => ({ "@id": o["@id"] })),
        address: {
          "@type": "PostalAddress",
          addressLocality: "Bangkok",
          addressCountry: "TH",
        },
        sameAs: sameAs(),
        description: siteConfig.description,
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: BASE,
        name: siteConfig.name,
        description: siteConfig.description,
        publisher: { "@id": PERSON_ID },
        inLanguage: "en-US",
      },
      ...orgs,
    ],
  };
}

/** ProfilePage for /about, whose mainEntity is the Person in the site graph. */
export function buildProfilePageJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${BASE}/about/#profilepage`,
    url: `${BASE}/about`,
    name: `About — ${siteConfig.name}`,
    mainEntity: { "@id": PERSON_ID },
    isPartOf: { "@id": WEBSITE_ID },
  };
}

export interface FaqItem {
  question: string;
  answer: string;
}

/**
 * FAQPage for answer engines (Google AI Overviews, Perplexity, ChatGPT). Takes
 * the Q&A as input so the visible on-page copy stays the single source of truth
 * — no fabricated content is baked into the builder. Always pair this with a
 * matching visible FAQ so schema and page agree.
 */
export function buildFaqJsonLd(
  items: readonly FaqItem[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export type ArticleJsonLdInput = {
  title: string;
  description?: string;
  slug: string;
  publishedAt: string;
  imageUrl?: string;
  tags?: readonly string[];
};

export type SoftwareAppJsonLdInput = {
  name: string;
  description: string;
  url: string;
  /** Canonical case-page on this site */
  pagePath: string;
  applicationCategory?: string;
  operatingSystem?: string;
};

/** SoftwareApplication for product hubs (/ventures/[slug]). */
export function buildSoftwareApplicationJsonLd(
  input: SoftwareAppJsonLdInput,
): Record<string, unknown> {
  const pageUrl = `${BASE}${input.pagePath.startsWith("/") ? input.pagePath : `/${input.pagePath}`}`;
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${pageUrl}/#software`,
    name: input.name,
    description: input.description,
    url: input.url,
    applicationCategory: input.applicationCategory ?? "BusinessApplication",
    operatingSystem: input.operatingSystem ?? "Web",
    author: { "@id": PERSON_ID },
    provider: { "@id": PERSON_ID },
    isPartOf: { "@id": WEBSITE_ID },
    mainEntityOfPage: pageUrl,
  };
}

export type BreadcrumbItem = { name: string; path: string };

/** BreadcrumbList for topic/venture hubs. */
export function buildBreadcrumbJsonLd(
  items: readonly BreadcrumbItem[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${BASE}${item.path.startsWith("/") ? item.path : `/${item.path}`}`,
    })),
  };
}

/** BlogPosting for /blog/[slug] — pairs with visible post chrome. */
export function buildArticleJsonLd(
  input: ArticleJsonLdInput,
): Record<string, unknown> {
  const url = `${BASE}/blog/${input.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}/#article`,
    headline: input.title,
    description: input.description,
    datePublished: input.publishedAt,
    dateModified: input.publishedAt,
    url,
    mainEntityOfPage: url,
    isPartOf: { "@id": WEBSITE_ID },
    author: { "@id": PERSON_ID },
    publisher: { "@id": PERSON_ID },
    ...(input.imageUrl
      ? { image: [input.imageUrl] }
      : { image: [`${BASE}/profile.jpg`] }),
    ...(input.tags?.length ? { keywords: input.tags.join(", ") } : {}),
    inLanguage: "en-US",
  };
}
