import { createFileRoute, notFound } from "@tanstack/react-router";
import { serializeJsonLd } from "@/lib/seo/serializeJsonLd";
import VentureHubPage from "@/components/landing/discovery/VentureHubPage";
import type { Metadata } from "@/lib/seo/types";
import {
  buildBreadcrumbJsonLd,
  buildSoftwareApplicationJsonLd,
} from "@/lib/seo/jsonLd";
import {
  VENTURE_RELATED_TOPICS,
  getVentureBySlug,
} from "@/lib/content/ventures";
import { fileOg } from "@/src/lib/og";
import { namedPageTitle } from "@/lib/seo/pageTitle";
import { pageHead } from "@/src/lib/head";
import { routeShareMeta } from "@/lib/seo/routeMeta";
import { withoutHiddenBlogLinks } from "@/lib/content/blogVisibility";

type Props = { params: Promise<{ slug: string }> };

async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const venture = getVentureBySlug(slug);
  if (!venture) return { title: "Venture" };

  return routeShareMeta({
    title: namedPageTitle(venture.name, venture.tagline),
    description: venture.description,
    path: `/ventures/${slug}`,
    hasOwnOgImage: true,
  });
}

/** The page body for one slug; shared with the TanStack Start route. */
function VentureCasePageView({ slug }: { slug: string }) {
  const venture = getVentureBySlug(slug);
  if (!venture?.caseStudy) throw notFound();

  const appLd = serializeJsonLd(
    buildSoftwareApplicationJsonLd({
      name: venture.name,
      description: venture.description,
      url: venture.url,
      pagePath: `/ventures/${slug}`,
      offer: venture.offer,
    }),
  );
  const crumbLd = serializeJsonLd(
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
        relatedTopics={withoutHiddenBlogLinks(
          VENTURE_RELATED_TOPICS[slug] ?? [],
        )}
      />
    </>
  );
}

export const Route = createFileRoute("/_landing/ventures/$slug")({
  loader: async ({ params }) => {
    if (!getVentureBySlug(params.slug)?.caseStudy) throw notFound();
    return {
      head: pageHead(
        await generateMetadata({ params: Promise.resolve(params) }),
        { fileOgImage: fileOg(`/ventures/${params.slug}`, "Venture hub") },
      ),
    };
  },
  head: ({ loaderData }) => loaderData?.head ?? {},
  component: SlugPage,
});

function SlugPage() {
  const { slug } = Route.useParams();
  return <VentureCasePageView slug={slug} />;
}
