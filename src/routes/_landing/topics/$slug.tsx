import { createFileRoute, notFound } from "@tanstack/react-router";
import { serializeJsonLd } from "@/lib/seo/serializeJsonLd";
import TopicHubPage from "@/components/landing/discovery/TopicHubPage";
import type { Metadata } from "@/lib/seo/types";
import {
  getTopicPillar,
  isTopicSlug,
  topicHreflang,
  type TopicSlug,
} from "@/lib/content/topics/pillars";
import { buildBreadcrumbJsonLd, buildFaqJsonLd } from "@/lib/seo/jsonLd";
import { fileOg } from "@/src/lib/og";
import { pageHead } from "@/src/lib/head";
import { routeShareMeta } from "@/lib/seo/routeMeta";

type Props = { params: Promise<{ slug: string }> };

async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!isTopicSlug(slug)) return { title: "Topic" };
  const pillar = getTopicPillar(slug, "en");
  if (!pillar) return { title: "Topic" };
  return routeShareMeta({
    title: pillar.title,
    description: pillar.description,
    path: `/topics/${slug}`,
    languages: topicHreflang(slug),
    hasOwnOgImage: true,
  });
}

/** The page body for one slug; shared with the TanStack Start route. */
function TopicPillarPageView({ slug }: { slug: string }) {
  if (!isTopicSlug(slug)) throw notFound();
  const pillar = getTopicPillar(slug, "en");
  if (!pillar) throw notFound();

  const faqLd = serializeJsonLd(buildFaqJsonLd(pillar.faqs));
  const crumbLd = serializeJsonLd(
    buildBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: pillar.h1, path: `/topics/${slug as TopicSlug}` },
    ]),
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: faqLd }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: crumbLd }}
      />
      <TopicHubPage pillar={pillar} />
    </>
  );
}

export const Route = createFileRoute("/_landing/topics/$slug")({
  loader: async ({ params }) => {
    if (!(isTopicSlug(params.slug) && getTopicPillar(params.slug, "en")))
      throw notFound();
    return {
      head: pageHead(
        await generateMetadata({ params: Promise.resolve(params) }),
        { fileOgImage: fileOg(`/topics/${params.slug}`, "Topic hub") },
      ),
    };
  },
  head: ({ loaderData }) => loaderData?.head ?? {},
  component: SlugPage,
});

function SlugPage() {
  const { slug } = Route.useParams();
  return <TopicPillarPageView slug={slug} />;
}
