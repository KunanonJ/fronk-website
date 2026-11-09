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

/** Published content only, from the API CDN in production. No token: the dataset is public. */
export function buildClient(): SanityClient | null {
  if (!isSanityConfigured()) return null;

  return createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: process.env.NODE_ENV === "production",
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
