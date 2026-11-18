import { createFileRoute, notFound } from "@tanstack/react-router";
import CasePage from "@/components/profile/case/CasePage";
import { ventureJsonLd } from "@/components/profile/case/caseJsonLd";
import { ventureCase } from "@/lib/content/caseStudy";
import { getVentureBySlug } from "@/lib/content/ventures";
import { namedPageTitle } from "@/lib/seo/pageTitle";
import type { Metadata } from "@/lib/seo/types";
import { pageHead } from "@/src/lib/head";

/*
 * /preview/ventures/<slug>: a venture in the case-study template (profile
 * redesign Phase 5), hidden like every preview (noindex, disallowed, never
 * prerendered). Only a venture with a case study has a page, as on the live
 * route. Phase 6 moves the body to /ventures/<slug> and deletes this route.
 */
export const Route = createFileRoute("/preview/ventures/$slug")({
  loader: ({ params }) => {
    const venture = getVentureBySlug(params.slug);
    if (!venture?.caseStudy) throw notFound();
    const metadata: Metadata = {
      title: namedPageTitle(venture.name, venture.tagline),
      description: venture.description,
      robots: { index: false, follow: false },
    };
    return { head: pageHead(metadata) };
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
      <CasePage study={ventureCase(venture)} />
    </>
  );
}
