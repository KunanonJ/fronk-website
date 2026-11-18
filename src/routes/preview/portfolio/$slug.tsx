import { createFileRoute, notFound } from "@tanstack/react-router";
import CasePage from "@/components/profile/case/CasePage";
import { projectJsonLd } from "@/components/profile/case/caseJsonLd";
import { projectCase } from "@/lib/content/caseStudy";
import { getPortfolioProjectBySlug } from "@/lib/content/portfolio";
import { projectCaseHead } from "@/src/lib/caseHead";

/*
 * /preview/portfolio/<slug>: a project in the case-study template (profile
 * redesign Phase 5), hidden like every preview (noindex, disallowed, never
 * prerendered). Its head is the live page's (canonical, Open Graph, Twitter),
 * only kept out of search, so Share copies the live address. The head is
 * built in the loader, so the content modules stay in the loader's chunk and
 * out of the entry chunk. Phase 6 moves the body to /portfolio/<slug> and
 * deletes this route.
 */
export const Route = createFileRoute("/preview/portfolio/$slug")({
  loader: ({ params }) => {
    const project = getPortfolioProjectBySlug(params.slug);
    if (!project) throw notFound();
    return { head: projectCaseHead(project, { hidden: true }) };
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
      {/* The router keeps this component when only the slug changes (More
          projects): a key per case starts each one afresh, so no chapter,
          reveal or pause state carries over. */}
      <CasePage key={slug} study={projectCase(project)} />
    </>
  );
}
