import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import { ProfileMain } from "@/components/profile/site/ProfileMain";
import BuildPage from "@/components/profile/pages/library/BuildPage";
import type { Metadata } from "@/lib/seo/types";
import {
  BUILD_SEARCH_DEFAULTS,
  buildSearchSchema,
  type BuildFilter,
} from "@/lib/library/search";
import { FILTER_NAVIGATION, usePrerenderedParam } from "@/src/lib/filterParam";
import { pageHead } from "@/src/lib/head";
import { routeShareMeta } from "@/lib/seo/routeMeta";
import { PAGE_META } from "@/lib/content/pageMeta";

const metadata: Metadata = routeShareMeta({
  title: PAGE_META.build.title,
  description: PAGE_META.build.description,
  path: "/build",
});

/**
 * /build (profile redesign, Phase 7 lane D1). The venture is the
 * typed `?venture=site|gogocash|manut` param (Valibot); the default, all,
 * never shows in the URL and an unknown value falls back to it.
 */
export const Route = createFileRoute("/_landing/build")({
  validateSearch: buildSearchSchema,
  search: { middlewares: [stripSearchParams(BUILD_SEARCH_DEFAULTS)] },
  head: () => pageHead(metadata),
  component: BuildRoute,
});

function BuildRoute() {
  const venture = usePrerenderedParam(
    Route.useSearch().venture,
    BUILD_SEARCH_DEFAULTS.venture,
  );
  const navigate = Route.useNavigate();
  const setVenture = (next: BuildFilter) => {
    void navigate({
      search: (prev) => ({ ...prev, venture: next }),
      ...FILTER_NAVIGATION,
    });
  };

  return (
    <ProfileMain>
      <BuildPage venture={venture} onVentureChange={setVenture} />
    </ProfileMain>
  );
}
