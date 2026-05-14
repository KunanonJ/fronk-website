import { createClient, type SanityClient } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { apiVersion, dataset, isSanityConfigured, projectId } from "@/sanity/env";

function buildClient(): SanityClient | null {
  if (!isSanityConfigured()) return null;
  return createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: process.env.NODE_ENV === "production",
    perspective: "published",
  });
}

export const sanityClient: SanityClient | null = buildClient();

const builder = isSanityConfigured()
  ? imageUrlBuilder({ projectId, dataset })
  : null;

export function urlFor(source: SanityImageSource) {
  if (!builder) {
    throw new Error(
      "Sanity is not configured. Set NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET.",
    );
  }
  return builder.image(source);
}
