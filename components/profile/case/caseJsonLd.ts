import type { PortfolioProject } from "@/lib/content/portfolio";
import type { Venture } from "@/lib/content/ventures";
import {
  buildBreadcrumbJsonLd,
  buildSoftwareApplicationJsonLd,
} from "@/lib/seo/jsonLd";
import { buildPortfolioProjectJsonLd } from "@/lib/seo/portfolioJsonLd";
import { serializeJsonLd } from "@/lib/seo/serializeJsonLd";

/*
 * The case pages' structured data (profile redesign Phase 5, plan step 5h,
 * design spec 13 item 19): built exactly as the live routes build it, from
 * the same builders with the same input and the live addresses, so Phase 6 can
 * compare the two and swap the page body under an unchanged JSON-LD.
 */

/** A project page's two scripts: the work, then its breadcrumb. */
export function projectJsonLd(project: PortfolioProject): string[] {
  return [
    serializeJsonLd(
      buildBreadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Portfolio", path: "/portfolio" },
        { name: project.name, path: `/portfolio/${project.slug}` },
      ]),
    ),
    serializeJsonLd(buildPortfolioProjectJsonLd(project)),
  ];
}

/** A venture page's two scripts: the application, then its breadcrumb. */
export function ventureJsonLd(venture: Venture): string[] {
  return [
    serializeJsonLd(
      buildSoftwareApplicationJsonLd({
        name: venture.name,
        description: venture.description,
        url: venture.url,
        pagePath: `/ventures/${venture.slug}`,
        offer: venture.offer,
      }),
    ),
    serializeJsonLd(
      buildBreadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Ventures", path: "/#ventures" },
        { name: venture.name, path: `/ventures/${venture.slug}` },
      ]),
    ),
  ];
}
