import { createFileRoute, notFound } from "@tanstack/react-router";
import { JsonLd } from "@/components/JsonLd";
import CasePage from "@/components/profile/case/CasePage";
import { projectJsonLd } from "@/components/profile/case/caseJsonLd";
import { ProfileMain } from "@/components/profile/site/ProfileMain";
import { projectCase } from "@/lib/content/caseStudy";
import { getPortfolioProjectBySlug } from "@/lib/content/portfolio";
import { projectCaseHead } from "@/src/lib/caseHead";

/**
 * One project's page (profile redesign, Phase 6 cutover; design spec
 * 9): the case-study template, under the same JSON-LD as before (the
 * breadcrumb, then the work, from the same builders). Keyed on the slug: the
 * router keeps this component when only the slug changes, and the template's
 * state (the chapter in view, an open viewer) belongs to one case.
 */
function PortfolioProjectRoute() {
  const { slug } = Route.useParams();
  const project = getPortfolioProjectBySlug(slug);
  if (!project) throw notFound();

  return (
    <ProfileMain reading>
      {projectJsonLd(project).map((data, i) => (
        <JsonLd key={i} data={data} />
      ))}
      <CasePage key={slug} study={projectCase(project)} />
    </ProfileMain>
  );
}

export const Route = createFileRoute("/_landing/portfolio/$slug")({
  // The head (title, description, canonical, Open Graph and Twitter, the
  // Markdown twin and the share image) comes from src/lib/caseHead.ts, which
  // caseHead.test.ts pins. Built in the loader, so the content modules stay
  // in the loader's chunk and out of the entry chunk.
  loader: ({ params }) => {
    const project = getPortfolioProjectBySlug(params.slug);
    if (!project) throw notFound();
    return { head: projectCaseHead(project) };
  },
  head: ({ loaderData }) => loaderData?.head ?? {},
  component: PortfolioProjectRoute,
});
