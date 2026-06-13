import type { PageSeo } from "@/lib/sanity/types";

interface PostMetadataSource {
  title: string;
  excerpt: string | null;
  seo?: PageSeo | null;
}

export interface ResolvedPostMetadata {
  title: string;
  description: string | undefined;
}

function pickOptionalString(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function resolvePostMetadata(
  post: PostMetadataSource,
): ResolvedPostMetadata {
  return {
    title: pickOptionalString(post.seo?.title) ?? post.title,
    description:
      pickOptionalString(post.seo?.description) ??
      pickOptionalString(post.excerpt),
  };
}
