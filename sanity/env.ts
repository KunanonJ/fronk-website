export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2025-01-01";

export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "";

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";

export const revalidateSecret = process.env.SANITY_REVALIDATE_SECRET;

export const previewSecret = process.env.SANITY_PREVIEW_SECRET;

export const sanityReadToken = process.env.SANITY_API_READ_TOKEN;

export const studioUrl = "/studio";

export function isSanityConfigured(): boolean {
  return Boolean(projectId && dataset);
}
