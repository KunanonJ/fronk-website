import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "../../lib/head";
import HomePage from "@/components/profile/home/HomePage";
import type { Metadata } from "@/lib/seo/types";
import { HOME_OG_VIDEO_META } from "@/lib/og/homeVideo";
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
 * the notebook. The head is unchanged (umbrella Public Contracts) but for the
 * og:video tags, Home's alone (lib/og/homeVideo.ts): the share card as a
 * loop for the apps that play one; the rest show og:image, its first frame.
 */
export const Route = createFileRoute("/_landing/")({
  head: () => {
    const head = pageHead(metadata);
    return { ...head, meta: [...head.meta, ...HOME_OG_VIDEO_META] };
  },
  component: HomePage,
});
