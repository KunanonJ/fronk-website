import {
  createFileRoute,
  stripSearchParams,
  useHydrated,
} from "@tanstack/react-router";
import { PageMain } from "@/components/bento/Bento";
import PressPage from "@/components/landing/PressPage";
import type { Metadata } from "@/lib/seo/types";
import { pageHead } from "@/src/lib/head";
import { routeShareMeta } from "@/lib/seo/routeMeta";
import {
  PRESS_SEARCH_DEFAULTS,
  pressSearchSchema,
  type PressFilter,
} from "@/lib/press/search";
import { PAGE_META } from "@/lib/content/pageMeta";

/**
 * Hidden 04-11-26 (owner request): not linked from the nav, sitemap.xml,
 * llms.txt or sitemap.md, and noindex. The route still renders for direct
 * links. To bring it back, revert those four places and drop `robots` here.
 */
const metadata: Metadata = {
  ...routeShareMeta({
    title: PAGE_META.press.title,
    description: PAGE_META.press.description,
    path: "/press",
  }),
  robots: { index: false, follow: true },
};

/**
 * /press (bento redesign, phase 7g; design spec 4.19). The type filter is
 * the typed `?type=` param (Valibot): feature, product or profile; the
 * default, all, never shows in the URL and an unknown value falls back to it.
 */
function PressRoute() {
  const { type } = Route.useSearch();
  const navigate = Route.useNavigate();
  // /press is prerendered, so one static file answers every ?type= and its
  // HTML lists all coverage. Hydrate that same markup, then apply the
  // filter; client-side navigations are already hydrated and filter at once.
  const hydrated = useHydrated();
  const setType = (next: PressFilter) => {
    void navigate({
      search: (prev) => ({ ...prev, type: next }),
      replace: true,
      resetScroll: false,
      viewTransition: false,
    });
  };
  return (
    <PageMain>
      <PressPage
        type={hydrated ? type : PRESS_SEARCH_DEFAULTS.type}
        onTypeChange={setType}
      />
    </PageMain>
  );
}

export const Route = createFileRoute("/_landing/press")({
  validateSearch: pressSearchSchema,
  search: { middlewares: [stripSearchParams(PRESS_SEARCH_DEFAULTS)] },
  head: () => pageHead(metadata),
  component: PressRoute,
});
