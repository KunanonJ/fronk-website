import { createClient, type SanityClient } from "@sanity/client";
import {
  createImageUrlBuilder,
  type SanityImageSource,
} from "@sanity/image-url";
import {
  apiVersion,
  dataset,
  isSanityConfigured,
  projectId,
} from "@/sanity/env";

/**
 * Published content only, from Sanity's live API. No token: the dataset is
 * public. Not the API CDN: it serves a stale answer while it refreshes, and
 * the render that follows a webhook purge must read what was published,
 * because the edge then keeps that render for up to an hour
 * (src/lib/cache.ts). Sanity recommends the live API for code that responds
 * to webhooks; the Worker cache already stands between visitors and Sanity.
 */
export function buildClient(): SanityClient | null {
  if (!isSanityConfigured()) return null;

  return createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    perspective: "published",
    // Fail fast so a slow Sanity cannot hold a page render: 10 s per try, 2 retries.
    timeout: 10_000,
    maxRetries: 2,
  });
}

const builder = isSanityConfigured()
  ? createImageUrlBuilder({ projectId, dataset })
  : null;

export function urlFor(source: SanityImageSource) {
  if (!builder) {
    throw new Error(
      "Sanity is not configured. Set NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET.",
    );
  }
  return builder.image(source);
}
