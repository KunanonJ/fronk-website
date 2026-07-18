import {
  getAllVentureSlugs,
  getVentureBySlug,
} from "@/lib/content/ventures";
import { OG_SIZE } from "@/lib/og/card";
import { renderOgCard } from "@/lib/og/render";

export const alt = "Venture case study";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return getAllVentureSlugs().map((slug) => ({ slug }));
}

interface ImageProps {
  params: Promise<{ slug: string }>;
}

export default async function VentureCaseOgImage({ params }: ImageProps) {
  const { slug } = await params;
  const venture = getVentureBySlug(slug);
  return renderOgCard({
    eyebrow: "Case study",
    title: venture?.name ?? "Work",
    subtitle: venture?.tagline,
  });
}
