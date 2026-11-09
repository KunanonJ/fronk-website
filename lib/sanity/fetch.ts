import { buildClient } from "./client";
import {
  POSTS_QUERY,
  POST_QUERY,
  RESUME_PROFILE_QUERY,
  WRITING_PAGE_QUERY,
} from "./queries";
import type {
  Post,
  PostSummary,
  ResumeProfile,
  WritingPageContent,
} from "./types";

/**
 * Run a GROQ query. Null when Sanity is not configured (builds without it use
 * the bundled fallback content) or nothing matches. A failed request throws:
 * the route then renders its error state with no-store, instead of fallback
 * content the edge would keep for a day.
 */
async function sanityFetch<T>(
  label: string,
  query: string,
  params: Record<string, unknown> = {},
): Promise<T | null> {
  const client = buildClient();
  if (!client) return null;
  try {
    // Caching is the Worker cache's job (Cache-Tag + purge), not the fetch's.
    const result = await client.fetch<T>(query, params);
    return result ?? null;
  } catch (error: unknown) {
    console.error(`[sanity] ${label} failed`, error);
    throw error;
  }
}

export async function fetchAllPosts(): Promise<readonly PostSummary[]> {
  return (await sanityFetch<PostSummary[]>("fetchAllPosts", POSTS_QUERY)) ?? [];
}

export async function fetchPostBySlug(slug: string): Promise<Post | null> {
  return sanityFetch<Post>(`fetchPostBySlug(${slug})`, POST_QUERY, { slug });
}

export async function fetchWritingPage(): Promise<WritingPageContent | null> {
  return sanityFetch<WritingPageContent>(
    "fetchWritingPage",
    WRITING_PAGE_QUERY,
  );
}

export async function fetchResumeProfile(): Promise<ResumeProfile | null> {
  return sanityFetch<ResumeProfile>("fetchResumeProfile", RESUME_PROFILE_QUERY);
}
