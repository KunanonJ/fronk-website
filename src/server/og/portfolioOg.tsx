import { getPortfolioProjectBySlug } from "@/lib/content/portfolio";
import { renderOgCard } from "@/lib/og/render";

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
