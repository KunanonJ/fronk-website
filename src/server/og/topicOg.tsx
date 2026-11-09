import { getTopicPillar, isTopicSlug } from "@/lib/content/topics/pillars";
import { renderOgCard } from "@/lib/og/render";

type Props = { params: Promise<{ slug: string }> };

export default async function TopicOgImage({ params }: Props) {
  const { slug } = await params;
  const pillar = isTopicSlug(slug) ? getTopicPillar(slug, "en") : null;
  return renderOgCard({
    eyebrow: "Topic",
    title: pillar?.h1 ?? "KunanonJ",
    subtitle: pillar?.description?.slice(0, 120) ?? "From Bangkok",
  });
}
