import type { Metadata } from "next";
import PortfolioPage from "@/components/landing/PortfolioPage";
import { portfolioPage } from "@/lib/content/portfolio";
import { buildBreadcrumbJsonLd } from "@/lib/seo/jsonLd";
import { routeShareMeta } from "@/lib/seo/routeMeta";

export const metadata: Metadata = routeShareMeta({
  title: "Portfolio",
  description: portfolioPage.description,
  path: "/portfolio",
});

export default function PortfolioRoute() {
  const crumbLd = JSON.stringify(
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
