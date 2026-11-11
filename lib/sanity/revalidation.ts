/**
 * Cache-Tag values on Sanity-backed responses (src/lib/cache.ts). The Sanity
 * webhook purges the tags for the edited document's type. A copy the webhook
 * misses ends with its one-hour edge lifetime.
 */
export const REVALIDATE_TAGS = {
  resume: "resume",
  posts: "posts",
  writing: "writing",
} as const;

export type RevalidationTag =
  (typeof REVALIDATE_TAGS)[keyof typeof REVALIDATE_TAGS];

const ALL_TAGS: readonly RevalidationTag[] = Object.values(REVALIDATE_TAGS);

/**
 * Document types that feed a Sanity-backed response. Every other type (site
 * settings, home, standard pages, ventures) purges everything: no runtime page
 * reads them today, and purging too much is the safe failure.
 */
const TYPE_TAGS: Record<string, readonly RevalidationTag[]> = {
  author: [REVALIDATE_TAGS.posts],
  post: [REVALIDATE_TAGS.posts],
  resumeProfile: [REVALIDATE_TAGS.resume],
  writingPage: [REVALIDATE_TAGS.writing],
};

export function getRevalidationTagsForType(
  type: string | null | undefined,
): readonly RevalidationTag[] {
  if (!type) return ALL_TAGS;
  return TYPE_TAGS[type] ?? ALL_TAGS;
}
