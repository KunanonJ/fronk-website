import type { Metadata } from "next";
import { notFound } from "next/navigation";
import VentureHubPage from "@/components/landing/discovery/VentureHubPage";
import {
  getAllVentureSlugs,
  getVentureBySlug,
} from "@/lib/content/ventures";
import {
  buildBreadcrumbJsonLd,
  buildSoftwareApplicationJsonLd,
} from "@/lib/seo/jsonLd";
import { routeShareMeta } from "@/lib/seo/routeMeta";

type Props = { params: Promise<{ slug: string }> };

const RELATED: Record<string, readonly { label: string; href: string }[]> = {
  manut: [
    { label: "ERP / CRM / internal systems", href: "/topics/erp-crm-internal-systems" },
    { label: "AI transformation Thailand", href: "/topics/ai-transformation-thailand" },
    { label: "Manut automotive case (blog)", href: "/blog/manut-ai-erp-crm-automotive" },
  ],
  gogocash: [
    { label: "Tech startups Bangkok & SEA", href: "/topics/tech-startup-thailand-sea" },
    { label: "Cashback loops (blog)", href: "/blog/cashback-loops" },
  ],
};

export function generateStaticParams() {
  return getAllVentureSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const venture = getVentureBySlug(slug);
  if (!venture) return { title: "Venture" };

  const languages =
    slug === "manut"
      ? {
          en: "/ventures/manut",
          th: "/th/topics/erp-crm-internal-systems",
          "x-default": "/ventures/manut",
        }
      : undefined;

  return routeShareMeta({
    title: `${venture.name} — ${venture.tagline}`,
    description: venture.description,
    path: `/ventures/${slug}`,
    languages,
  });
}

export default async function VentureCasePage({ params }: Props) {
  const { slug } = await params;
  const venture = getVentureBySlug(slug);
  if (!venture?.caseStudy) notFound();

  const appLd = JSON.stringify(
    buildSoftwareApplicationJsonLd({
      name: venture.name,
      description: venture.description,
      url: venture.url,
      pagePath: `/ventures/${slug}`,
    }),
  );
  const crumbLd = JSON.stringify(
    buildBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Ventures", path: "/#ventures" },
      { name: venture.name, path: `/ventures/${slug}` },
    ]),
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: appLd }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: crumbLd }}
      />
      <VentureHubPage
        venture={venture}
        relatedTopics={RELATED[slug] ?? []}
      />
    </>
  );
}
