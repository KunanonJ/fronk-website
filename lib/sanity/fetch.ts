import { isSanityConfigured } from "@/sanity/env";
import { buildClient } from "./client";
import {
  FEATURED_VENTURES_QUERY,
  HOME_PAGE_QUERY,
  POSTS_QUERY,
  POST_QUERY,
  POST_SLUGS_QUERY,
  PREVIEW_FEATURED_VENTURES_QUERY,
  PREVIEW_POSTS_QUERY,
  PREVIEW_POST_QUERY,
  PREVIEW_POST_SLUGS_QUERY,
  PREVIEW_STANDARD_PAGE_QUERY,
  PREVIEW_VENTURES_QUERY,
  RESUME_PROFILE_QUERY,
  SITE_SETTINGS_QUERY,
  STANDARD_PAGE_QUERY,
  VENTURES_QUERY,
  WRITING_PAGE_QUERY,
} from "./queries";
import { REVALIDATE_TAGS, type RevalidationTag } from "./revalidation";
import type {
  HomePageContent,
  Post,
  PostSummary,
  ResumeProfile,
  SanityVenture,
  SiteSettings,
  StandardPageContent,
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
  return { next: { tags: [...tags] } };
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

export async function fetchSiteSettings(
  options: FetchOptions = {},
): Promise<SiteSettings | null> {
  return safeFetch<SiteSettings>(
    "fetchSiteSettings",
    SITE_SETTINGS_QUERY,
    {},
    [REVALIDATE_TAGS.site],
    options,
  );
}

export async function fetchHomePage(
  options: FetchOptions = {},
): Promise<HomePageContent | null> {
  return safeFetch<HomePageContent>(
    "fetchHomePage",
    HOME_PAGE_QUERY,
    {},
    [REVALIDATE_TAGS.home],
    options,
  );
}

export async function fetchStandardPage(
  slug: string,
  options: FetchOptions = {},
): Promise<StandardPageContent | null> {
  return safeFetch<StandardPageContent>(
    `fetchStandardPage(${slug})`,
    options.preview ? PREVIEW_STANDARD_PAGE_QUERY : STANDARD_PAGE_QUERY,
    { slug },
    [REVALIDATE_TAGS.pages],
    options,
  );
}

export async function fetchAllVentures(
  options: FetchOptions = {},
): Promise<readonly SanityVenture[]> {
  const result = await safeFetch<SanityVenture[]>(
    "fetchAllVentures",
    options.preview ? PREVIEW_VENTURES_QUERY : VENTURES_QUERY,
    {},
    [REVALIDATE_TAGS.ventures],
    options,
  );
  return result ?? [];
}

export async function fetchFeaturedVentures(
  limit = 3,
  options: FetchOptions = {},
): Promise<readonly SanityVenture[]> {
  const result = await safeFetch<SanityVenture[]>(
    "fetchFeaturedVentures",
    options.preview ? PREVIEW_FEATURED_VENTURES_QUERY : FEATURED_VENTURES_QUERY,
    { limit },
    [REVALIDATE_TAGS.ventures, REVALIDATE_TAGS.home],
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

export async function getAllPosts(): Promise<readonly PostSummary[]> {
  if (!isSanityConfigured()) return [];
  try {
    const result = await fetchAllPosts();
    return result ?? [];
  } catch (error: unknown) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[sanity] getAllPosts failed:", error);
    }
    return [];
  }
}

export { REVALIDATE_TAGS };
