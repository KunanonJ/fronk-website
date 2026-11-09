import { createFileRoute, notFound } from "@tanstack/react-router";
import VentureHubPage from "@/components/landing/discovery/VentureHubPage";
import type { Metadata } from "@/lib/seo/types";
import {
  buildBreadcrumbJsonLd,
  buildSoftwareApplicationJsonLd,
} from "@/lib/seo/jsonLd";
import {
  getVentureBySlug,
} from "@/lib/content/ventures";
import { fileOg } from "@/src/lib/og";
import { namedPageTitle } from "@/lib/seo/pageTitle";
import { pageHead } from "@/src/lib/head";
import { routeShareMeta } from "@/lib/seo/routeMeta";
import { withoutHiddenBlogLinks } from "@/lib/content/blogVisibility";

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

async function generateMetadata({ params }: Props): Promise<Metadata> {
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
    title: namedPageTitle(venture.name, venture.tagline),
    description: venture.description,
    path: `/ventures/${slug}`,
    languages,
    hasOwnOgImage: true,
  });
}

/** The page body for one slug; shared with the TanStack Start route. */
function VentureCasePageView({ slug }: { slug: string }) {
  const venture = getVentureBySlug(slug);
  if (!venture?.caseStudy) throw notFound();

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
        relatedTopics={withoutHiddenBlogLinks(RELATED[slug] ?? [])}
      />
    </>
  );
}

export const Route = createFileRoute("/_landing/ventures/$slug")({
  loader: async ({ params }) => {
    if (!(getVentureBySlug(params.slug)?.caseStudy)) throw notFound();
    return { head: pageHead(await generateMetadata({ params: Promise.resolve(params) }), { fileOgImage: fileOg(`/ventures/${params.slug}`, "Venture hub") }) };
  },
  head: ({ loaderData }) => loaderData?.head ?? {},
  component: SlugPage,
});

function SlugPage() {
  const { slug } = Route.useParams();
  return <VentureCasePageView slug={slug} />;
}
