import { createFileRoute, notFound } from "@tanstack/react-router";
import CasePage from "@/components/profile/case/CasePage";
import { projectJsonLd } from "@/components/profile/case/caseJsonLd";
import { projectCase } from "@/lib/content/caseStudy";
import { getPortfolioProjectBySlug } from "@/lib/content/portfolio";
import { namedPageTitle } from "@/lib/seo/pageTitle";
import type { Metadata } from "@/lib/seo/types";
import { pageHead } from "@/src/lib/head";

/*
 * /preview/portfolio/<slug>: a project in the case-study template (profile
 * redesign Phase 5), hidden like every preview (noindex, disallowed, never
 * prerendered). The head is built in the loader, so the content modules stay
 * in the loader's chunk and out of the entry chunk. Phase 6 moves the body to
 * /portfolio/<slug> and deletes this route.
 */
export const Route = createFileRoute("/preview/portfolio/$slug")({
  loader: ({ params }) => {
    const project = getPortfolioProjectBySlug(params.slug);
    if (!project) throw notFound();
    const metadata: Metadata = {
      title: namedPageTitle(project.name, project.tagline),
      description: project.summary,
      robots: { index: false, follow: false },
    };
    return { head: pageHead(metadata) };
  },
  head: ({ loaderData }) => loaderData?.head ?? {},
  component: PreviewProjectCase,
});

function PreviewProjectCase() {
  const { slug } = Route.useParams();
  const project = getPortfolioProjectBySlug(slug);
  if (!project) throw notFound();
  return (
    <>
      {projectJsonLd(project).map((json) => (
        <script
          key={json}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: json }}
        />
      ))}
      <CasePage study={projectCase(project)} />
    </>
  );
}
