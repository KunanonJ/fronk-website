import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TopicHubPage from "@/components/landing/discovery/TopicHubPage";
import {
  TOPIC_SLUGS,
  getTopicPillar,
  isTopicSlug,
  topicHreflang,
  type TopicSlug,
} from "@/lib/content/topics/pillars";
import {
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
} from "@/lib/seo/jsonLd";
import { routeShareMeta } from "@/lib/seo/routeMeta";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return TOPIC_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!isTopicSlug(slug)) return { title: "Topic" };
  const pillar = getTopicPillar(slug, "en");
  if (!pillar) return { title: "Topic" };
  return routeShareMeta({
    title: pillar.title,
    description: pillar.description,
    path: `/topics/${slug}`,
    languages: topicHreflang(slug),
  });
}

export default async function TopicPillarPage({ params }: Props) {
  const { slug } = await params;
  if (!isTopicSlug(slug)) notFound();
  const pillar = getTopicPillar(slug, "en");
  if (!pillar) notFound();

  const faqLd = JSON.stringify(buildFaqJsonLd(pillar.faqs));
  const crumbLd = JSON.stringify(
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
