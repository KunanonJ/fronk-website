import { createFileRoute, notFound } from "@tanstack/react-router";
import { VentureCasePageView, generateMetadata } from "@/app/(landing)/ventures/[slug]/page";
import { getVentureBySlug } from "@/lib/content/ventures";
import { pageHead } from "@/src/lib/head";
import { fileOg } from "@/src/lib/og";

export const Route = createFileRoute("/_landing/ventures/$slug")({
  loader: async ({ params }) => {
    if (!(getVentureBySlug(params.slug)?.caseStudy)) throw notFound();
    return { head: pageHead(await generateMetadata({ params: Promise.resolve(params) }), { fileOgImage: fileOg(`/ventures/${params.slug}`, "Venture hub") }) };
  },
  head: ({ loaderData }) => loaderData?.head ?? {},
  component: SlugPage,
});

function SlugPage() {
  const { slug } = Route.useParams();
  return <VentureCasePageView slug={slug} />;
}
