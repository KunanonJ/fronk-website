import { createFileRoute } from "@tanstack/react-router";
import PressPage from "@/components/landing/PressPage";
import type { Metadata } from "@/lib/seo/types";
import { pageHead } from "@/src/lib/head";
import { pressPage } from "@/lib/content/press";
import { routeShareMeta } from "@/lib/seo/routeMeta";

/**
 * Hidden 04-11-26 (owner request): not linked from the nav, sitemap.xml,
 * llms.txt or sitemap.md, and noindex. The route still renders for direct
 * links. To bring it back, revert those four places and drop `robots` here.
 */
const metadata: Metadata = {
  ...routeShareMeta({
    title: "Press",
    description: pressPage.description,
    path: "/press",
  }),
  robots: { index: false, follow: true },
};

function PressRoute() {
  return <PressPage />;
}

export const Route = createFileRoute("/_landing/press")({
  head: () => pageHead(metadata),
  component: PressRoute,
});
