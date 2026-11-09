import { createFileRoute, notFound } from "@tanstack/react-router";
import { PortfolioProjectRouteView, generateMetadata } from "@/app/(landing)/portfolio/[slug]/page";
import { getPortfolioProjectBySlug } from "@/lib/content/portfolio";
import { pageHead } from "@/src/lib/head";
import { fileOg } from "@/src/lib/og";

export const Route = createFileRoute("/_landing/portfolio/$slug")({
  loader: async ({ params }) => {
    if (!(getPortfolioProjectBySlug(params.slug))) throw notFound();
    return { head: pageHead(await generateMetadata({ params: Promise.resolve(params) }), { fileOgImage: fileOg(`/portfolio/${params.slug}`, "Portfolio project") }) };
  },
  head: ({ loaderData }) => loaderData?.head ?? {},
  component: SlugPage,
});

function SlugPage() {
  const { slug } = Route.useParams();
  return <PortfolioProjectRouteView slug={slug} />;
}
