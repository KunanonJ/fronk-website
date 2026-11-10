import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import { serializeJsonLd } from "@/lib/seo/serializeJsonLd";
import { PageMain } from "@/components/bento/Bento";
import PortfolioIndexPage from "@/components/landing/portfolio/PortfolioIndexPage";
import type { Metadata } from "@/lib/seo/types";
import { getAllPortfolioProjects } from "@/lib/content/portfolio";
import { buildBreadcrumbJsonLd } from "@/lib/seo/jsonLd";
import { buildPortfolioCollectionJsonLd } from "@/lib/seo/portfolioJsonLd";
import { FILTER_NAVIGATION, usePrerenderedParam } from "@/src/lib/filterParam";
import { pageHead } from "@/src/lib/head";
import {
  PORTFOLIO_SEARCH_DEFAULTS,
  portfolioSearchSchema,
  type PortfolioFilter,
} from "@/lib/portfolio/search";
import { routeShareMeta } from "@/lib/seo/routeMeta";
import { PAGE_META } from "@/lib/content/pageMeta";

const metadata: Metadata = routeShareMeta({
  title: PAGE_META.portfolio.title,
  description: PAGE_META.portfolio.description,
  path: "/portfolio",
});

/**
 * /portfolio (bento redesign, phase 7e; design spec 4.5). The category
 * filter is the typed `?category=` param (Valibot); the default, all, never
 * shows in the URL and an unknown value falls back to it.
 */
export const Route = createFileRoute("/_landing/portfolio/")({
  validateSearch: portfolioSearchSchema,
  search: { middlewares: [stripSearchParams(PORTFOLIO_SEARCH_DEFAULTS)] },
  head: () => pageHead(metadata),
  component: PortfolioRoute,
});

function PortfolioRoute() {
  const category = usePrerenderedParam(
    Route.useSearch().category,
    PORTFOLIO_SEARCH_DEFAULTS.category,
  );
  const navigate = Route.useNavigate();
  const setCategory = (next: PortfolioFilter) => {
    void navigate({
      search: (prev) => ({ ...prev, category: next }),
      ...FILTER_NAVIGATION,
    });
  };

  const crumbLd = serializeJsonLd(
    buildBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Portfolio", path: "/portfolio" },
    ]),
  );
  const collectionLd = serializeJsonLd(
    buildPortfolioCollectionJsonLd(getAllPortfolioProjects()),
  );

  return (
    <PageMain>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: crumbLd }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: collectionLd }}
      />
      <PortfolioIndexPage category={category} onCategoryChange={setCategory} />
    </PageMain>
  );
}
