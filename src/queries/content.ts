import { queryOptions } from "@tanstack/react-query";
import { getBlogIndex, getBlogPost, getLearnCards, getResumeProfile } from "@/src/server/content.functions";

/*
 * Sanity reads as TanStack Query options: loaders call ensureQueryData, so
 * SSR fetches once and hydrates; client navigation reuses fresh data.
 */
export const resumeQuery = queryOptions({ queryKey: ["sanity", "resume"], queryFn: () => getResumeProfile() });

export const learnCardsQuery = queryOptions({ queryKey: ["sanity", "learn-cards"], queryFn: () => getLearnCards() });

export const blogIndexQuery = queryOptions({ queryKey: ["sanity", "blog-index"], queryFn: () => getBlogIndex() });

export const blogPostQuery = (slug: string) =>
  queryOptions({ queryKey: ["sanity", "blog-post", slug], queryFn: () => getBlogPost({ data: slug }) });
