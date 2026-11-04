import { getPortfolioProjectBySlug } from "@/lib/content/portfolio";
import { OG_SIZE } from "@/lib/og/card";
import { renderOgCard } from "@/lib/og/render";

export const alt = "Portfolio project";
export const size = OG_SIZE;
export const contentType = "image/png";

type Props = { params: Promise<{ slug: string }> };

export default async function PortfolioOgImage({ params }: Props) {
  const { slug } = await params;
  const project = getPortfolioProjectBySlug(slug);
  return renderOgCard({
    eyebrow: "Portfolio",
    title: project?.name ?? "KunanonJ",
    subtitle: project?.tagline ?? "From Bangkok",
  });
}
