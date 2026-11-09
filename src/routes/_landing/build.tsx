import {
  createFileRoute,
  stripSearchParams,
  useHydrated,
} from "@tanstack/react-router";
import { PageMain } from "@/components/bento/Bento";
import BuildPage from "@/components/landing/library/BuildPage";
import type { Metadata } from "@/lib/seo/types";
import { buildPage } from "@/lib/content/buildBoard";
import {
  BUILD_SEARCH_DEFAULTS,
  buildSearchSchema,
  type BuildFilter,
} from "@/lib/library/search";
import { pageHead } from "@/src/lib/head";
import { routeShareMeta } from "@/lib/seo/routeMeta";

const metadata: Metadata = routeShareMeta({
  title: "Build",
  description: buildPage.description,
  path: "/build",
});

/**
 * /build (bento redesign, phase 7f; design spec 4.14). The venture is the
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
  const { venture } = Route.useSearch();
  const navigate = Route.useNavigate();
  // /build is prerendered, so one static file answers every ?venture= and its
  // HTML shows the whole board. Hydrate that same markup, then apply the
  // filter; client-side navigations are already hydrated and filter at once.
  const hydrated = useHydrated();
  const setVenture = (next: BuildFilter) => {
    void navigate({
      search: (prev) => ({ ...prev, venture: next }),
      replace: true,
      resetScroll: false,
      viewTransition: false,
    });
  };

  return (
    <PageMain>
      <BuildPage
        venture={hydrated ? venture : BUILD_SEARCH_DEFAULTS.venture}
        onVentureChange={setVenture}
      />
    </PageMain>
  );
}
