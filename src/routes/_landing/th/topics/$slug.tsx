import { createFileRoute, notFound } from "@tanstack/react-router";
import { serializeJsonLd } from "@/lib/seo/serializeJsonLd";
import TopicHubPage from "@/components/landing/discovery/TopicHubPage";
import type { Metadata } from "@/lib/seo/types";
import {
  getTopicPillar,
  isTopicSlug,
  TOPIC_PUBLISHED,
  topicHreflang,
  type TopicSlug,
} from "@/lib/content/topics/pillars";
import {
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  buildTopicArticleJsonLd,
} from "@/lib/seo/jsonLd";
import { pageHead } from "@/src/lib/head";
import { routeShareMeta } from "@/lib/seo/routeMeta";

type Props = { params: Promise<{ slug: string }> };

async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!isTopicSlug(slug)) return { title: "หัวข้อ" };
  const pillar = getTopicPillar(slug, "th");
  if (!pillar) return { title: "หัวข้อ" };
  return routeShareMeta({
    title: pillar.title,
    description: pillar.description,
    path: `/th/topics/${slug}`,
    languages: topicHreflang(slug),
    locale: "th_TH",
  });
}

/** The page body for one slug; shared with the TanStack Start route. */
function ThaiTopicPillarPageView({ slug }: { slug: string }) {
  if (!isTopicSlug(slug)) throw notFound();
  const pillar = getTopicPillar(slug, "th");
  if (!pillar) throw notFound();

  const articleLd = serializeJsonLd(
    buildTopicArticleJsonLd({
      path: `/th/topics/${slug}`,
      headline: pillar.h1,
      description: pillar.description,
      inLanguage: "th",
      datePublished: TOPIC_PUBLISHED[slug],
      // The Thai hubs share the English hub's OG card.
      image: `/topics/${slug}/opengraph-image`,
    }),
  );
  const faqLd = serializeJsonLd(buildFaqJsonLd(pillar.faqs));
  const crumbLd = serializeJsonLd(
    buildBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: pillar.h1, path: `/th/topics/${slug as TopicSlug}` },
    ]),
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: articleLd }}
      />
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

export const Route = createFileRoute("/_landing/th/topics/$slug")({
  loader: async ({ params }) => {
    if (!(isTopicSlug(params.slug) && getTopicPillar(params.slug, "th")))
      throw notFound();
    return {
      head: pageHead(
        await generateMetadata({ params: Promise.resolve(params) }),
      ),
    };
  },
  head: ({ loaderData }) => loaderData?.head ?? {},
  component: SlugPage,
});

function SlugPage() {
  const { slug } = Route.useParams();
  return <ThaiTopicPillarPageView slug={slug} />;
}
