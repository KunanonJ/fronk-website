import { getTopicPillar, isTopicSlug } from "@/lib/content/topics/pillars";
import { OG_SIZE } from "@/lib/og/card";
import { renderOgCard } from "@/lib/og/render";

export const alt = "Topic hub";
export const size = OG_SIZE;
export const contentType = "image/png";

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
