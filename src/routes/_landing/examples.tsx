import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import { ProfileMain } from "@/components/profile/site/ProfileMain";
import ExamplesPage from "@/components/profile/pages/library/ExamplesPage";
import type { Metadata } from "@/lib/seo/types";
import {
  EXAMPLES_SEARCH_DEFAULTS,
  examplesSearchSchema,
  type ExamplePersonaId,
} from "@/lib/library/search";
import { FILTER_NAVIGATION, usePrerenderedParam } from "@/src/lib/filterParam";
import { pageHead } from "@/src/lib/head";
import { routeShareMeta } from "@/lib/seo/routeMeta";
import { PAGE_META } from "@/lib/content/pageMeta";

const metadata: Metadata = routeShareMeta({
  title: PAGE_META.examples.title,
  description: PAGE_META.examples.description,
  path: "/examples",
});

/**
 * /examples (profile redesign, Phase 7 lane D1). The persona is the
 * typed `?persona=operators|founders` param (Valibot); the default, builders,
 * never shows in the URL and an unknown value falls back to it.
 */
export const Route = createFileRoute("/_landing/examples")({
  validateSearch: examplesSearchSchema,
  search: { middlewares: [stripSearchParams(EXAMPLES_SEARCH_DEFAULTS)] },
  head: () => pageHead(metadata),
  component: ExamplesRoute,
});

function ExamplesRoute() {
  const persona = usePrerenderedParam(
    Route.useSearch().persona,
    EXAMPLES_SEARCH_DEFAULTS.persona,
  );
  const navigate = Route.useNavigate();
  const setPersona = (next: ExamplePersonaId) => {
    void navigate({
      search: (prev) => ({ ...prev, persona: next }),
      ...FILTER_NAVIGATION,
    });
  };

  return (
    <ProfileMain>
      <ExamplesPage persona={persona} onPersonaChange={setPersona} />
    </ProfileMain>
  );
}
