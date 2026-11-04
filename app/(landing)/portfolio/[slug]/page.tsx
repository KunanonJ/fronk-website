import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PortfolioProjectPage from "@/components/landing/PortfolioProjectPage";
import {
  getAllPortfolioSlugs,
  getPortfolioProjectBySlug,
  portfolioProjectTitle,
} from "@/lib/content/portfolio";
import { buildBreadcrumbJsonLd } from "@/lib/seo/jsonLd";
import { routeShareMeta } from "@/lib/seo/routeMeta";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllPortfolioSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getPortfolioProjectBySlug(slug);
  if (!project) return { title: "Portfolio" };

  return routeShareMeta({
    title: portfolioProjectTitle(project),
    description: project.summary,
    path: `/portfolio/${slug}`,
    hasOwnOgImage: true,
  });
}

export default async function PortfolioProjectRoute({ params }: Props) {
  const { slug } = await params;
  const project = getPortfolioProjectBySlug(slug);
  if (!project) notFound();

  const crumbLd = JSON.stringify(
    buildBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Portfolio", path: "/portfolio" },
      { name: project.name, path: `/portfolio/${slug}` },
    ]),
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: crumbLd }}
      />
      <PortfolioProjectPage project={project} />
    </>
  );
}
