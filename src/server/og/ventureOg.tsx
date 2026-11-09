import { getVentureBySlug } from "@/lib/content/ventures";
import { renderOgCard } from "@/lib/og/render";

type Props = { params: Promise<{ slug: string }> };

export default async function VentureOgImage({ params }: Props) {
  const { slug } = await params;
  const venture = getVentureBySlug(slug);
  if (!venture) return new Response("Not found", { status: 404 });
  return renderOgCard({
    eyebrow: "Venture",
    title: venture.name,
    subtitle: venture.tagline,
  });
}
