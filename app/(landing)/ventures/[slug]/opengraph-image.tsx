import { getVentureBySlug } from "@/lib/content/ventures";
import { OG_SIZE } from "@/lib/og/card";
import { renderOgCard } from "@/lib/og/render";

export const alt = "Venture hub";
export const size = OG_SIZE;
export const contentType = "image/png";

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
