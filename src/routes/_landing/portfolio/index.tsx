import { createFileRoute } from "@tanstack/react-router";
import { serializeJsonLd } from "@/lib/seo/serializeJsonLd";
import PortfolioPage from "@/components/landing/PortfolioPage";
import type { Metadata } from "@/lib/seo/types";
import { buildBreadcrumbJsonLd } from "@/lib/seo/jsonLd";
import { pageHead } from "@/src/lib/head";
import { portfolioPage } from "@/lib/content/portfolio";
import { routeShareMeta } from "@/lib/seo/routeMeta";

const metadata: Metadata = routeShareMeta({
  title: "Portfolio",
  description: portfolioPage.description,
  path: "/portfolio",
});

function PortfolioRoute() {
  const crumbLd = serializeJsonLd(
    buildBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Portfolio", path: "/portfolio" },
    ]),
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: crumbLd }}
      />
      <PortfolioPage />
    </>
  );
}

export const Route = createFileRoute("/_landing/portfolio/")({
  head: () => pageHead(metadata),
  component: PortfolioRoute,
});
