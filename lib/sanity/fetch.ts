import { isSanityConfigured } from "@/sanity/env";
import { buildClient } from "./client";
import {
  POSTS_QUERY,
  POST_QUERY,
  PREVIEW_POSTS_QUERY,
  PREVIEW_POST_QUERY,
  RESUME_PROFILE_QUERY,
  WRITING_PAGE_QUERY,
} from "./queries";
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


async function safeFetch<T>(
  label: string,
  query: string,
  params: Record<string, unknown>,
  options: FetchOptions = {},
): Promise<T | null> {
  const client = getClient(options);
  if (!client) return null;
  try {
    // Caching is the Worker cache's job (Cache-Tag + purge), not the fetch's.
    const result = await client.fetch<T>(query, params);
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
    options,
  );
}


export async function fetchWritingPage(
  options: FetchOptions = {},
): Promise<WritingPageContent | null> {
  return safeFetch<WritingPageContent>(
    "fetchWritingPage",
    WRITING_PAGE_QUERY,
    {},
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
    options,
  );
}
