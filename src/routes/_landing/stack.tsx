import {
  createFileRoute,
  stripSearchParams,
  useHydrated,
} from "@tanstack/react-router";
import { PageMain } from "@/components/bento/Bento";
import StackPage from "@/components/landing/library/StackPage";
import type { Metadata } from "@/lib/seo/types";
import {
  STACK_SEARCH_DEFAULTS,
  stackSearchSchema,
  type StackFilter,
} from "@/lib/library/search";
import { pageHead } from "@/src/lib/head";
import { routeShareMeta } from "@/lib/seo/routeMeta";
import { stackPage } from "@/lib/content/stack";

const metadata: Metadata = routeShareMeta({
  title: "Stack",
  description: stackPage.description,
  path: "/stack",
});

/**
 * /stack (bento redesign, phase 7f; design spec 4.12). The tool group is the
 * typed `?group=build|ship|operate` param (Valibot); the default, all, never
 * shows in the URL and an unknown value falls back to it.
 */
export const Route = createFileRoute("/_landing/stack")({
  validateSearch: stackSearchSchema,
  search: { middlewares: [stripSearchParams(STACK_SEARCH_DEFAULTS)] },
  head: () => pageHead(metadata),
  component: StackRoute,
});

function StackRoute() {
  const { group } = Route.useSearch();
  const navigate = Route.useNavigate();
  // /stack is prerendered, so one static file answers every ?group= and its
  // HTML lists every tool. Hydrate that same markup, then apply the filter;
  // client-side navigations are already hydrated and filter at once.
  const hydrated = useHydrated();
  const setGroup = (next: StackFilter) => {
    void navigate({
      search: (prev) => ({ ...prev, group: next }),
      replace: true,
      resetScroll: false,
      viewTransition: false,
    });
  };

  return (
    <PageMain>
      <StackPage
        group={hydrated ? group : STACK_SEARCH_DEFAULTS.group}
        onGroupChange={setGroup}
      />
    </PageMain>
  );
}
