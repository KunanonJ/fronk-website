import { createClient, type SanityClient } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
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
    perspective: preview ? "previewDrafts" : "published",
    token: preview ? sanityReadToken : undefined,
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
