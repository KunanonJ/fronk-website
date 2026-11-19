import { createFileRoute, notFound } from "@tanstack/react-router";
import { JsonLd } from "@/components/JsonLd";
import CasePage from "@/components/profile/case/CasePage";
import { ventureJsonLd } from "@/components/profile/case/caseJsonLd";
import { ProfileMain } from "@/components/profile/site/ProfileMain";
import { ventureCase } from "@/lib/content/caseStudy";
import { getVentureBySlug } from "@/lib/content/ventures";
import { ventureCaseHead } from "@/src/lib/caseHead";

/**
 * One venture's page (profile redesign, Phase 6 cutover; design spec
 * 9): the case-study template, under the same JSON-LD as before (the
 * application, then the breadcrumb, from the same builders). Only a venture
 * with a case study has a page. Keyed on the slug, as the project pages are:
 * the router keeps this component when only the slug changes.
 */
function VentureCaseRoute() {
  const { slug } = Route.useParams();
  const venture = getVentureBySlug(slug);
  if (!venture?.caseStudy) throw notFound();

  return (
    <ProfileMain>
      {ventureJsonLd(venture).map((data, i) => (
        <JsonLd key={i} data={data} />
      ))}
      <CasePage key={slug} study={ventureCase(venture)} />
    </ProfileMain>
  );
}

export const Route = createFileRoute("/_landing/ventures/$slug")({
  // The head comes from src/lib/caseHead.ts (pinned by caseHead.test.ts);
  // only a venture with a case study has a page.
  loader: ({ params }) => {
    const venture = getVentureBySlug(params.slug);
    if (!venture?.caseStudy) throw notFound();
    return { head: ventureCaseHead(venture) };
  },
  head: ({ loaderData }) => loaderData?.head ?? {},
  component: VentureCaseRoute,
});
