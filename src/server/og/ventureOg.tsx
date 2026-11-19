import { getVentureBySlug } from "@/lib/content/ventures";
import { renderSlugCard } from "@/lib/og/render";

export default function VentureOgImage(slug: string): Response {
  const venture = getVentureBySlug(slug);
  return renderSlugCard(
    venture && {
      eyebrow: "Venture",
      title: venture.name,
      subtitle: venture.tagline,
    },
  );
}
