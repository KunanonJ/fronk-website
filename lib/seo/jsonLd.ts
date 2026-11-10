import { siteConfig } from "@/lib/site";
import {
  PERSON_ALTERNATE_NAMES,
  PERSON_ALUMNI_OF,
  PERSON_KNOWS_ABOUT,
  PERSON_MEMBER_OF,
  PERSON_NAME,
  PERSON_SUMMARY,
} from "@/lib/content/identity";
import { SITE_UPDATED } from "@/lib/content/freshness";
import { getAllVentures } from "@/lib/content/ventures";

const BASE = siteConfig.url.replace(/\/$/, "");

/** Stable @id anchors so nodes cross-reference instead of duplicating. */
export const PERSON_ID = `${BASE}/#person`;
export const WEBSITE_ID = `${BASE}/#website`;

/** Alternate site names for Google's site-name display (WebSite.alternateName). */
export const WEBSITE_ALTERNATE_NAMES = [
  "Kunanon Jarat",
  "KunanonJ",
  "kunanonj.com",
] as const;

/** Identity values live in lib/content/identity.ts; re-exported for existing callers. */
export { PERSON_ALTERNATE_NAMES, PERSON_KNOWS_ABOUT };

function sameAs(): readonly string[] {
  const s = siteConfig.socials;
  // Profile URLs only — product domains belong on Organization.url.
  return [s.x, s.linkedin, s.github, s.telegram, s.farcaster];
}

function orgId(url: string): string {
  return `${url.replace(/\/$/, "")}/#organization`;
}

/** One Organization node per venture the person founded — honest, from real venture data. */
function foundedOrganizations(): Record<string, unknown>[] {
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

/** Employer the person works for but did not found, so no `founder` link. */
export const EMPLOYER_ORGANIZATION = {
  name: "The Binary Holdings",
  url: "https://thebinaryholdings.com",
} as const;

function employerOrganizations(): Record<string, unknown>[] {
  return [
    {
      "@type": "Organization",
      "@id": orgId(EMPLOYER_ORGANIZATION.url),
      name: EMPLOYER_ORGANIZATION.name,
      url: EMPLOYER_ORGANIZATION.url,
    },
  ];
}

function organizations(): Record<string, unknown>[] {
  return [...foundedOrganizations(), ...employerOrganizations()];
}

/**
 * The site-wide schema.org @graph: a Person (the knowledge-panel entity), a
 * WebSite, the founded Organizations and the employer Organization,
 * cross-linked by @id. Person.worksFor references all of them. All values are
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
        name: PERSON_NAME,
        alternateName: [...PERSON_ALTERNATE_NAMES],
        url: BASE,
        email: siteConfig.email,
        image: `${BASE}/profile.jpg`,
        jobTitle: ["AI Engineering Lead", "IT Manager", "Founder"],
        worksFor: orgs.map((o) => ({ "@id": o["@id"] })),
        knowsAbout: [...PERSON_KNOWS_ABOUT],
        alumniOf: {
          "@type": "CollegeOrUniversity",
          name: PERSON_ALUMNI_OF.name,
          url: PERSON_ALUMNI_OF.url,
        },
        memberOf: {
          "@type": "Organization",
          name: PERSON_MEMBER_OF.name,
          url: PERSON_MEMBER_OF.url,
        },
        address: {
          "@type": "PostalAddress",
          addressLocality: "Bangkok",
          addressCountry: "TH",
        },
        sameAs: sameAs(),
        description: PERSON_SUMMARY,
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: BASE,
        name: siteConfig.name,
        // Google's site-name system reads WebSite.name + alternateName.
        alternateName: [...WEBSITE_ALTERNATE_NAMES],
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
    dateModified: SITE_UPDATED,
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
  /** Only a stated offer; never a guessed price. */
  offer?: { label: string; price: string; priceCurrency: string };
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
    // The venture's Organization node in the site graph (foundedOrganizations).
    provider: { "@id": orgId(input.url) },
    ...(input.offer
      ? {
          offers: {
            "@type": "Offer",
            price: input.offer.price,
            priceCurrency: input.offer.priceCurrency,
            description: input.offer.label,
            url: input.url,
          },
        }
      : {}),
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

export type TopicArticleJsonLdInput = {
  /** Site path of the hub, e.g. `/topics/ai-engineering` or `/th/topics/…`. */
  path: string;
  headline: string;
  description: string;
  inLanguage: "en" | "th";
  /** ISO date the hub first shipped. */
  datePublished: string;
  /** Absolute or site-relative image (the hub's OG card). */
  image: string;
};

/**
 * Article for the topic hubs: names the Person as author and publisher and
 * dates the page, so engines can attribute and age it. dateModified is the
 * site's content date, the same value the sitemap gives as `lastmod`.
 */
export function buildTopicArticleJsonLd(
  input: TopicArticleJsonLdInput,
): Record<string, unknown> {
  const url = `${BASE}${input.path.startsWith("/") ? input.path : `/${input.path}`}`;
  const image = input.image.startsWith("http")
    ? input.image
    : `${BASE}${input.image.startsWith("/") ? input.image : `/${input.image}`}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}/#article`,
    headline: input.headline,
    description: input.description,
    inLanguage: input.inLanguage,
    datePublished: input.datePublished,
    dateModified: SITE_UPDATED,
    url,
    mainEntityOfPage: url,
    image: [image],
    isPartOf: { "@id": WEBSITE_ID },
    author: { "@id": PERSON_ID },
    publisher: { "@id": PERSON_ID },
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
