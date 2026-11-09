import { isSanityConfigured } from "@/sanity/env";
import { buildClient } from "./client";
import {
  POSTS_QUERY,
  POST_QUERY,
  POST_SLUGS_QUERY,
  PREVIEW_POSTS_QUERY,
  PREVIEW_POST_QUERY,
  PREVIEW_POST_SLUGS_QUERY,
  RESUME_PROFILE_QUERY,
  WRITING_PAGE_QUERY,
} from "./queries";
import {
  REVALIDATE_TAGS,
  SANITY_FETCH_REVALIDATE_SECONDS,
  type RevalidationTag,
} from "./revalidation";
import type {
  Post,
  PostSummary,
  ResumeProfile,
  WritingPageContent,
} from "./types";

interface FetchOptions {
  preview?: boolean;
}

function getClient(options: FetchOptions = {}) {
  if (!isSanityConfigured()) return null;
  return buildClient({ preview: options.preview });
}

function fetchOptions(tags: readonly RevalidationTag[], preview?: boolean) {
  if (preview) {
    return { cache: "no-store" as const };
  }
  // Cacheable (with a revalidate time) so the tags attach to the page entry
  // and revalidateTag() from the webhook and cron can invalidate it.
  return {
    next: { tags: [...tags], revalidate: SANITY_FETCH_REVALIDATE_SECONDS },
  };
}

async function safeFetch<T>(
  label: string,
  query: string,
  params: Record<string, unknown>,
  tags: readonly RevalidationTag[],
  options: FetchOptions = {},
): Promise<T | null> {
  const client = getClient(options);
  if (!client) return null;
  try {
    const result = await client.fetch<T>(
      query,
      params,
      fetchOptions(tags, options.preview),
    );
    return result ?? null;
  } catch (error: unknown) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[sanity] ${label} failed:`, error);
    }
    return null;
  }
}

export async function fetchAllPosts(
  options: FetchOptions = {},
): Promise<readonly PostSummary[]> {
  const result = await safeFetch<PostSummary[]>(
    "fetchAllPosts",
    options.preview ? PREVIEW_POSTS_QUERY : POSTS_QUERY,
    {},
    [REVALIDATE_TAGS.posts],
    options,
  );
  return result ?? [];
}

export async function fetchPostBySlug(
  slug: string,
  options: FetchOptions = {},
): Promise<Post | null> {
  return safeFetch<Post>(
    `fetchPostBySlug(${slug})`,
    options.preview ? PREVIEW_POST_QUERY : POST_QUERY,
    { slug },
    [REVALIDATE_TAGS.posts],
    options,
  );
}

export async function fetchAllPostSlugs(
  options: FetchOptions = {},
): Promise<readonly string[]> {
  const result = await safeFetch<string[]>(
    "fetchAllPostSlugs",
    options.preview ? PREVIEW_POST_SLUGS_QUERY : POST_SLUGS_QUERY,
    {},
    [REVALIDATE_TAGS.posts],
    options,
  );
  return result ?? [];
}

export async function fetchWritingPage(
  options: FetchOptions = {},
): Promise<WritingPageContent | null> {
  return safeFetch<WritingPageContent>(
    "fetchWritingPage",
    WRITING_PAGE_QUERY,
    {},
    [REVALIDATE_TAGS.writing],
    options,
  );
}

export async function fetchResumeProfile(
  options: FetchOptions = {},
): Promise<ResumeProfile | null> {
  return safeFetch<ResumeProfile>(
    "fetchResumeProfile",
    RESUME_PROFILE_QUERY,
    {},
    [REVALIDATE_TAGS.resume],
    options,
  );
}
