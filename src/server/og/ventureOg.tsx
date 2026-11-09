import { getVentureBySlug } from "@/lib/content/ventures";
import { renderOgCard } from "@/lib/og/render";

type Props = { params: Promise<{ slug: string }> };

export default async function VentureOgImage({ params }: Props) {
  const { slug } = await params;
  const venture = getVentureBySlug(slug);
  return renderOgCard({
    eyebrow: "Venture",
    title: venture?.name ?? "KunanonJ",
    subtitle: venture?.tagline ?? "From Bangkok",
  });
}
