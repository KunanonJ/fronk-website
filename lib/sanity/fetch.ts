import { isSanityConfigured } from "@/sanity/env";
import { sanityClient } from "./client";
import {
  POSTS_QUERY,
  POST_QUERY,
  POST_SLUGS_QUERY,
} from "./queries";
import type { Post, PostSummary } from "./types";

const POSTS_TAG = "posts";

export async function fetchAllPosts(): Promise<readonly PostSummary[]> {
  if (!sanityClient || !isSanityConfigured()) return [];
  try {
    const result = await sanityClient.fetch<PostSummary[]>(
      POSTS_QUERY,
      {},
      { next: { tags: [POSTS_TAG] } },
    );
    return result ?? [];
  } catch (error: unknown) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[sanity] fetchAllPosts failed:", error);
    }
    return [];
  }
}

export async function fetchPostBySlug(slug: string): Promise<Post | null> {
  if (!sanityClient || !isSanityConfigured()) return null;
  try {
    const result = await sanityClient.fetch<Post | null>(
      POST_QUERY,
      { slug },
      // Only the `posts` tag is wired into the webhook revalidation. A
      // per-slug tag is dead until per-post invalidation is implemented.
      { next: { tags: [POSTS_TAG] } },
    );
    return result ?? null;
  } catch (error: unknown) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[sanity] fetchPostBySlug(${slug}) failed:`, error);
    }
    return null;
  }
}

export async function fetchAllPostSlugs(): Promise<readonly string[]> {
  if (!sanityClient || !isSanityConfigured()) return [];
  try {
    const result = await sanityClient.fetch<string[]>(
      POST_SLUGS_QUERY,
      {},
      { next: { tags: [POSTS_TAG] } },
    );
    return result ?? [];
  } catch (error: unknown) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[sanity] fetchAllPostSlugs failed:", error);
    }
    return [];
  }
}

export const REVALIDATE_TAGS = {
  posts: POSTS_TAG,
} as const;
