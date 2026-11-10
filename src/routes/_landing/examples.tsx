import {
  createFileRoute,
  stripSearchParams,
  useHydrated,
} from "@tanstack/react-router";
import { PageMain } from "@/components/bento/Bento";
import ExamplesPage from "@/components/landing/library/ExamplesPage";
import type { Metadata } from "@/lib/seo/types";
import {
  EXAMPLES_SEARCH_DEFAULTS,
  examplesSearchSchema,
  type ExamplePersonaId,
} from "@/lib/library/search";
import { pageHead } from "@/src/lib/head";
import { routeShareMeta } from "@/lib/seo/routeMeta";
import { PAGE_META } from "@/lib/content/pageMeta";

const metadata: Metadata = routeShareMeta({
  title: PAGE_META.examples.title,
  description: PAGE_META.examples.description,
  path: "/examples",
});

/**
 * /examples (bento redesign, phase 7f; design spec 4.11). The persona is the
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
  const { persona } = Route.useSearch();
  const navigate = Route.useNavigate();
  // /examples is prerendered, so one static file answers every ?persona= and
  // its HTML shows the default. Hydrate that same markup, then apply the
  // param; client-side navigations are already hydrated and apply it at once.
  const hydrated = useHydrated();
  const setPersona = (next: ExamplePersonaId) => {
    void navigate({
      search: (prev) => ({ ...prev, persona: next }),
      replace: true,
      resetScroll: false,
      viewTransition: false,
    });
  };

  return (
    <PageMain>
      <ExamplesPage
        persona={hydrated ? persona : EXAMPLES_SEARCH_DEFAULTS.persona}
        onPersonaChange={setPersona}
      />
    </PageMain>
  );
}
