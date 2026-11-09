import {
  createFileRoute,
  stripSearchParams,
  useHydrated,
} from "@tanstack/react-router";
import { serializeJsonLd } from "@/lib/seo/serializeJsonLd";
import { PageMain } from "@/components/bento/Bento";
import PortfolioIndexPage from "@/components/landing/portfolio/PortfolioIndexPage";
import type { Metadata } from "@/lib/seo/types";
import { buildBreadcrumbJsonLd } from "@/lib/seo/jsonLd";
import { pageHead } from "@/src/lib/head";
import { portfolioPage } from "@/lib/content/portfolio";
import {
  PORTFOLIO_SEARCH_DEFAULTS,
  portfolioSearchSchema,
  type PortfolioFilter,
} from "@/lib/portfolio/search";
import { routeShareMeta } from "@/lib/seo/routeMeta";

const metadata: Metadata = routeShareMeta({
  title: "Portfolio",
  description: portfolioPage.description,
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
  const { category } = Route.useSearch();
  const navigate = Route.useNavigate();
  // /portfolio is prerendered, so one static file answers every ?category=
  // and its HTML lists all projects. Hydrate that same markup, then apply
  // the filter; client-side navigations are already hydrated.
  const hydrated = useHydrated();
  const setCategory = (next: PortfolioFilter) => {
    void navigate({
      search: (prev) => ({ ...prev, category: next }),
      replace: true,
      resetScroll: false,
      viewTransition: false,
    });
  };

  const crumbLd = serializeJsonLd(
    buildBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Portfolio", path: "/portfolio" },
    ]),
  );

  return (
    <PageMain>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: crumbLd }}
      />
      <PortfolioIndexPage
        category={hydrated ? category : PORTFOLIO_SEARCH_DEFAULTS.category}
        onCategoryChange={setCategory}
      />
    </PageMain>
  );
}
