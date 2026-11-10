import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PageMain } from "@/components/bento/Bento";
import LearnPage from "@/components/landing/library/LearnPage";
import type { Metadata } from "@/lib/seo/types";
import { routeCacheHeaders } from "@/src/lib/cache";
import { learnCardsQuery } from "@/src/queries/content";
import {
  LEARN_SEARCH_DEFAULTS,
  learnSearchSchema,
  type LearnLang,
} from "@/lib/library/search";
import { FILTER_NAVIGATION } from "@/src/lib/filterParam";
import { pageHead } from "@/src/lib/head";
import { routeShareMeta } from "@/lib/seo/routeMeta";
import { PAGE_META } from "@/lib/content/pageMeta";

const metadata: Metadata = routeShareMeta({
  title: PAGE_META.learn.title,
  description: PAGE_META.learn.description,
  path: "/learn",
});

/**
 * /learn (bento redesign, phase 7f; design spec 4.10). The hub language is
 * the typed `?lang=th` param (Valibot); the default, English, never shows in
 * the URL and an unknown value falls back to it. /learn renders on request
 * (Sanity-backed, edge-cached per URL), so the server already renders the
 * requested language and no post-hydration switch is needed.
 */
export const Route = createFileRoute("/_landing/learn")({
  validateSearch: learnSearchSchema,
  search: { middlewares: [stripSearchParams(LEARN_SEARCH_DEFAULTS)] },
  loader: ({ context }) => context.queryClient.ensureQueryData(learnCardsQuery),
  head: () => pageHead(metadata),
  headers: ({ match }) => routeCacheHeaders(match, ["posts"]),
  component: LearnRoute,
});

function LearnRoute() {
  const posts = useSuspenseQuery(learnCardsQuery).data;
  const { lang } = Route.useSearch();
  const navigate = Route.useNavigate();
  const setLang = (next: LearnLang) => {
    void navigate({
      search: (prev) => ({ ...prev, lang: next }),
      ...FILTER_NAVIGATION,
    });
  };

  return (
    <PageMain>
      <LearnPage posts={posts} lang={lang} onLangChange={setLang} />
    </PageMain>
  );
}
