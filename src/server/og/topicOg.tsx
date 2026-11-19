import { getTopicPillar } from "@/lib/content/topics/pillars";
import { renderSlugCard } from "@/lib/og/render";

/** The English hub's card; the Thai hubs share it. */
export default function TopicOgImage(slug: string): Response {
  const pillar = getTopicPillar(slug, "en");
  return renderSlugCard(
    pillar && {
      eyebrow: "Topic",
      title: pillar.h1,
      subtitle: pillar.description,
    },
  );
}
