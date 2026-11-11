import { QueryClient } from "@tanstack/react-query";

/**
 * The app's QueryClient (src/router.tsx makes one per request, never shared).
 * Every query is Sanity content, which changes only when Sanity publishes,
 * so a visit never refetches a good read. The one exception is a résumé that
 * stands in for a failed read (resumeQuery in src/queries/content.ts). The
 * browser retries once; the server not at all (the Sanity client already
 * retries). The route tests build theirs here too, so they run under the
 * settings the app runs under.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Number.POSITIVE_INFINITY,
        retry: typeof window === "undefined" ? 0 : 1,
      },
    },
  });
}
