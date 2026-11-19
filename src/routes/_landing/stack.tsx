import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import { ProfileMain } from "@/components/profile/site/ProfileMain";
import StackPage from "@/components/profile/pages/library/StackPage";
import type { Metadata } from "@/lib/seo/types";
import {
  STACK_SEARCH_DEFAULTS,
  stackSearchSchema,
  type StackFilter,
} from "@/lib/library/search";
import { FILTER_NAVIGATION, usePrerenderedParam } from "@/src/lib/filterParam";
import { pageHead } from "@/src/lib/head";
import { routeShareMeta } from "@/lib/seo/routeMeta";
import { PAGE_META } from "@/lib/content/pageMeta";

const metadata: Metadata = routeShareMeta({
  title: PAGE_META.stack.title,
  description: PAGE_META.stack.description,
  path: "/stack",
});

/**
 * /stack (profile redesign, Phase 7 lane D1). The tool group is the
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
  const group = usePrerenderedParam(
    Route.useSearch().group,
    STACK_SEARCH_DEFAULTS.group,
  );
  const navigate = Route.useNavigate();
  const setGroup = (next: StackFilter) => {
    void navigate({
      search: (prev) => ({ ...prev, group: next }),
      ...FILTER_NAVIGATION,
    });
  };

  return (
    <ProfileMain>
      <StackPage group={group} onGroupChange={setGroup} />
    </ProfileMain>
  );
}
