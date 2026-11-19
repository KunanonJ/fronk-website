import { getPortfolioProjectBySlug } from "@/lib/content/portfolio";
import { renderSlugCard } from "@/lib/og/render";

export default function PortfolioOgImage(slug: string): Response {
  const project = getPortfolioProjectBySlug(slug);
  return renderSlugCard(
    project && {
      eyebrow: "Portfolio",
      title: project.name,
      subtitle: project.tagline,
    },
  );
}
