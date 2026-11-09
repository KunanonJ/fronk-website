import { createFileRoute, notFound } from "@tanstack/react-router";
import { serializeJsonLd } from "@/lib/seo/serializeJsonLd";
import PortfolioProjectPage from "@/components/landing/PortfolioProjectPage";
import type { Metadata } from "@/lib/seo/types";
import { getPortfolioProjectBySlug } from "@/lib/content/portfolio";
import { buildBreadcrumbJsonLd } from "@/lib/seo/jsonLd";
import { fileOg } from "@/src/lib/og";
import { namedPageTitle } from "@/lib/seo/pageTitle";
import { pageHead } from "@/src/lib/head";
import { routeShareMeta } from "@/lib/seo/routeMeta";

type Props = { params: Promise<{ slug: string }> };

async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getPortfolioProjectBySlug(slug);
  if (!project) return { title: "Portfolio" };

  return routeShareMeta({
    title: namedPageTitle(project.name, project.tagline),
    description: project.summary,
    path: `/portfolio/${slug}`,
    hasOwnOgImage: true,
  });
}

/** The page body for one slug; shared with the TanStack Start route. */
function PortfolioProjectRouteView({ slug }: { slug: string }) {
  const project = getPortfolioProjectBySlug(slug);
  if (!project) throw notFound();

  const crumbLd = serializeJsonLd(
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

export const Route = createFileRoute("/_landing/portfolio/$slug")({
  loader: async ({ params }) => {
    if (!getPortfolioProjectBySlug(params.slug)) throw notFound();
    return {
      head: pageHead(
        await generateMetadata({ params: Promise.resolve(params) }),
        {
          fileOgImage: fileOg(`/portfolio/${params.slug}`, "Portfolio project"),
        },
      ),
    };
  },
  head: ({ loaderData }) => loaderData?.head ?? {},
  component: SlugPage,
});

function SlugPage() {
  const { slug } = Route.useParams();
  return <PortfolioProjectRouteView slug={slug} />;
}
