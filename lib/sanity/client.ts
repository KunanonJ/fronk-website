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
  sanityReadToken,
} from "@/sanity/env";

interface BuildClientOptions {
  preview?: boolean;
}

export function buildClient(options: BuildClientOptions = {}): SanityClient | null {
  if (!isSanityConfigured()) return null;
  const preview = options.preview === true;
  if (preview && !sanityReadToken) return null;

  return createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: !preview && process.env.NODE_ENV === "production",
    perspective: preview ? "drafts" : "published",
    token: preview ? sanityReadToken : undefined,
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
