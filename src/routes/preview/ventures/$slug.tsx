import { createFileRoute, notFound } from "@tanstack/react-router";
import CasePage from "@/components/profile/case/CasePage";
import { ventureJsonLd } from "@/components/profile/case/caseJsonLd";
import { ventureCase } from "@/lib/content/caseStudy";
import { getVentureBySlug } from "@/lib/content/ventures";
import { ventureCaseHead } from "@/src/lib/caseHead";

/*
 * /preview/ventures/<slug>: a venture in the case-study template (profile
 * redesign Phase 5), hidden like every preview (noindex, disallowed, never
 * prerendered). Its head is the live page's, only kept out of search. Only a
 * venture with a case study has a page, as on the live route. Phase 6 moves
 * the body to /ventures/<slug> and deletes this route.
 */
export const Route = createFileRoute("/preview/ventures/$slug")({
  loader: ({ params }) => {
    const venture = getVentureBySlug(params.slug);
    if (!venture?.caseStudy) throw notFound();
    return { head: ventureCaseHead(venture, { hidden: true }) };
  },
  head: ({ loaderData }) => loaderData?.head ?? {},
  component: PreviewVentureCase,
});

function PreviewVentureCase() {
  const { slug } = Route.useParams();
  const venture = getVentureBySlug(slug);
  if (!venture?.caseStudy) throw notFound();
  return (
    <>
      {ventureJsonLd(venture).map((json) => (
        <script
          key={json}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: json }}
        />
      ))}
      {/* A key per case: the router keeps this component when only the slug
          changes, and no state may carry over from the last case. */}
      <CasePage key={slug} study={ventureCase(venture)} />
    </>
  );
}
