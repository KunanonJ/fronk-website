import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import { JsonLd } from "@/components/JsonLd";
import WorkIndexPage from "@/components/profile/pages/WorkIndexPage";
import { ProfileMain } from "@/components/profile/site/ProfileMain";
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
 * /portfolio, "All work" (profile redesign, Phase 6 cutover; plan step 6d).
 * The category filter is the typed `?category=` param (Valibot); the
 * default, all, never shows in the URL and an unknown value falls back to
 * it. The breadcrumb and CollectionPage JSON-LD are unchanged.
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

  return (
    <ProfileMain>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Portfolio", path: "/portfolio" },
        ])}
      />
      <JsonLd
        data={buildPortfolioCollectionJsonLd(getAllPortfolioProjects())}
      />
      <WorkIndexPage category={category} onCategoryChange={setCategory} />
    </ProfileMain>
  );
}
