import { queryOptions, type QueryClient } from "@tanstack/react-query";
import {
  getBlogIndex,
  getBlogPost,
  getLearnCards,
  getResumeProfile,
} from "@/src/server/content.functions";

/*
 * Sanity reads as TanStack Query options: loaders call ensureQueryData, so
 * SSR fetches once and hydrates; client navigation reuses fresh data.
 */
/**
 * The résumé. A good read never goes stale (the app's default,
 * src/lib/queryClient.ts). A stand-in for a failed Sanity read (`degraded`)
 * is stale from the start: while it is on screen, the page asks again each
 * time the window regains focus or the network comes back, and redraws when
 * a real answer arrives. useSuspenseQuery holds any stale time to at least a
 * second, so a page drawn a moment ago does not ask twice in a row.
 */
export const resumeQuery = queryOptions({
  queryKey: ["sanity", "resume"],
  queryFn: () => getResumeProfile(),
  staleTime: (query) =>
    query.state.data?.degraded ? 0 : Number.POSITIVE_INFINITY,
});

/**
 * /resume's loader. A first visit waits for the server, as every route's
 * loader does. A return to the page with a stand-in in the query cache does
 * not wait: the loader marks the stand-in invalid and returns it at once, so
 * the page is drawn without being held by a server that is slow or
 * unreachable. The page then asks again in the background when it mounts,
 * or straight away if it is already on screen. The mark does not depend on
 * the clocks, unlike the stale time above, which compares the time the
 * stand-in was made with the browser's.
 *
 * Without the two, a stand-in would be reused after Sanity is back for as
 * long as the page stays open and for five minutes after leaving it (when
 * the unused query is dropped).
 */
export function loadResume(queryClient: QueryClient) {
  const cached = queryClient.getQueryData(resumeQuery.queryKey);
  if (!cached?.degraded) return queryClient.ensureQueryData(resumeQuery);
  void queryClient.invalidateQueries({ queryKey: resumeQuery.queryKey });
  return Promise.resolve(cached);
}

export const learnCardsQuery = queryOptions({
  queryKey: ["sanity", "learn-cards"],
  queryFn: () => getLearnCards(),
});

export const blogIndexQuery = queryOptions({
  queryKey: ["sanity", "blog-index"],
  queryFn: () => getBlogIndex(),
});

export const blogPostQuery = (slug: string) =>
  queryOptions({
    queryKey: ["sanity", "blog-post", slug],
    queryFn: () => getBlogPost({ data: slug }),
  });
