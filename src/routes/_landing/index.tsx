import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "../../lib/head";
import HomePage from "@/components/profile/home/HomePage";
import type { Metadata } from "@/lib/seo/types";
import { routeShareMeta } from "@/lib/seo/routeMeta";
import { site } from "@/lib/content/landing";

const metadata: Metadata = {
  ...routeShareMeta({
    title: site.title,
    description: site.description,
    path: "/",
  }),
  title: { absolute: site.title },
};

/**
 * Home (profile redesign, Phase 6 cutover; design spec 8): the hero after the
 * first-visit intro, the stacked work cards, the About bento, the Journey and
 * the notebook. The head is unchanged (umbrella Public Contracts).
 */
export const Route = createFileRoute("/_landing/")({
  head: () => pageHead(metadata),
  component: HomePage,
});
